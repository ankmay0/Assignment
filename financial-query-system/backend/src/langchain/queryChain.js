/**
 * LangChain Query Chain
 * Processes natural language queries using OpenAI and executes MongoDB queries
 * 
 * USER-SPECIFIC: All queries are filtered by the provided user_id
 */

const { ChatOpenAI } = require('@langchain/openai');
const config = require('../config');
const SCHEMA_CONTEXT = require('./schemaContext');
const { getDB } = require('../config/database');

// Initialize OpenAI model
let model = null;

const getModel = () => {
    if (!model) {
        model = new ChatOpenAI({
            openAIApiKey: config.openai.apiKey,
            modelName: config.openai.model,
            temperature: 0
        });
    }
    return model;
};

// Prompt for generating MongoDB queries - USER SPECIFIC
const QUERY_PROMPT = `
${SCHEMA_CONTEXT}

IMPORTANT: You are querying data for a SPECIFIC USER with user_id: "{userId}"
All queries to bank_transactions, mutual_fund_holdings, and equity_holdings MUST filter by this user_id.

Based on the user's question, generate a MongoDB query to retrieve the relevant data.
Return ONLY a valid JSON object with the following structure (no markdown, no explanation):

{
  "collection": "collection_name",
  "operation": "find" | "findOne" | "aggregate",
  "query": { },
  "projection": { },
  "pipeline": [ ]
}

For aggregate operations, use the "pipeline" field with MongoDB aggregation stages.
- ALWAYS include a $match stage with user_id filter as the FIRST stage for user-specific collections
- Example: { "$match": { "user_id": "{userId}" } }

For find operations, use "query" with user_id filter and optionally "projection".
- Example query: { "user_id": "{userId}", "category": "food" }

User Question: {question}

JSON Response:
`;

// Prompt for generating human-readable responses
const RESPONSE_PROMPT = `
You are a helpful financial assistant for {userName}. Based on their question and the data retrieved from the database, provide a clear, concise, and human-readable answer.

Format numbers as currency (₹) where appropriate.
Be specific with amounts and details.
If no data was found, say so politely.
Address the user by name when appropriate.

User: {userName}
Question: {question}

Retrieved Data: {data}

Your Response:
`;

/**
 * Parse JSON from LLM response, handling potential formatting issues
 */
const parseQueryResponse = (response) => {
    let content = response.content || response;

    // Remove markdown code blocks if present
    content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    content = content.trim();

    try {
        return JSON.parse(content);
    } catch (e) {
        console.error('Failed to parse LLM response:', content);
        throw new Error('Failed to parse query from LLM response');
    }
};

/**
 * Inject user_id into query/pipeline if missing
 */
const injectUserId = (queryDef, userId) => {
    const { collection, operation, query, pipeline } = queryDef;

    // Skip users collection - it doesn't have user_id
    if (collection === 'users') {
        return queryDef;
    }

    if (operation === 'aggregate' && pipeline) {
        // Check if first stage is $match with user_id
        const hasUserMatch = pipeline.length > 0 &&
            pipeline[0].$match &&
            pipeline[0].$match.user_id;

        if (!hasUserMatch) {
            // Add user_id match as first stage
            queryDef.pipeline = [{ $match: { user_id: userId } }, ...pipeline];
        }
    } else if (operation === 'find' || operation === 'findOne') {
        // Ensure query has user_id
        if (!query || !query.user_id) {
            queryDef.query = { ...query, user_id: userId };
        }
    }

    return queryDef;
};

/**
 * Execute a MongoDB query safely
 */
const executeQuery = async (queryDef) => {
    const { collection, operation, query, projection, pipeline } = queryDef;

    const allowedCollections = ['users', 'bank_transactions', 'mutual_fund_holdings', 'equity_holdings'];

    if (!allowedCollections.includes(collection)) {
        throw new Error(`Invalid collection: ${collection}`);
    }

    const db = getDB();
    const col = db.collection(collection);

    let result;

    switch (operation) {
        case 'find':
            result = await col.find(query || {}, { projection }).toArray();
            break;
        case 'findOne':
            result = await col.findOne(query || {}, { projection });
            break;
        case 'aggregate':
            result = await col.aggregate(pipeline || []).toArray();
            break;
        default:
            throw new Error(`Unsupported operation: ${operation}`);
    }

    return result;
};

/**
 * Process a natural language query FOR A SPECIFIC USER
 * 
 * @param {string} question - The user's question
 * @param {string} userId - The user's ID
 * @param {string} userName - The user's name
 * @returns {Promise<Object>} Result with answer and metadata
 */
const processNaturalLanguageQuery = async (question, userId, userName) => {
    const llm = getModel();

    console.log(`🤖 Processing query for user: ${userName} (${userId})`);

    // Step 1: Generate MongoDB query with user context
    const queryPrompt = QUERY_PROMPT
        .replace(/{userId}/g, userId)
        .replace('{question}', question);

    const queryResponse = await llm.invoke(queryPrompt);
    let mongoQuery = parseQueryResponse(queryResponse);

    // Safety: Ensure user_id is in the query
    mongoQuery = injectUserId(mongoQuery, userId);

    console.log('📋 Query:', JSON.stringify(mongoQuery, null, 2));

    // Step 2: Execute the query
    console.log('🔍 Executing query...');
    const queryResult = await executeQuery(mongoQuery);

    console.log(`📊 Retrieved ${Array.isArray(queryResult) ? queryResult.length : 1} record(s)`);

    // Step 3: Generate human-readable response with user context
    console.log('💬 Generating response...');
    const responsePrompt = RESPONSE_PROMPT
        .replace(/{userName}/g, userName)
        .replace('{question}', question)
        .replace('{data}', JSON.stringify(queryResult, null, 2));

    const answerResponse = await llm.invoke(responsePrompt);
    const answer = answerResponse.content || answerResponse;

    return {
        question,
        user: { id: userId, name: userName },
        answer,
        queryExecuted: mongoQuery,
        dataRetrieved: queryResult
    };
};

/**
 * Get all users from database
 */
const getUsers = async () => {
    const db = getDB();
    return await db.collection('users').find({}).toArray();
};

module.exports = {
    processNaturalLanguageQuery,
    getUsers
};

/**
 * Query Service
 * Orchestrates query processing with caching and LangChain integration
 * Handles USER-SPECIFIC queries
 */

const cacheService = require('./cacheService');
const { processNaturalLanguageQuery } = require('../langchain/queryChain');

/**
 * Process a natural language query FOR A SPECIFIC USER
 * 1. Check cache for existing response (cache key includes userId)
 * 2. If cache miss, process through LangChain
 * 3. Cache the result
 * 4. Return response
 * 
 * @param {string} question - The natural language question
 * @param {string} userId - The user's ID
 * @param {string} userName - The user's name
 * @returns {Promise<Object>} Query result
 */
const processQuery = async (question, userId, userName) => {
    // Create user-specific cache key
    const cacheKey = `${userId}:${question}`;

    // Check cache first
    const cached = await cacheService.getCachedResponse(cacheKey);
    if (cached) {
        console.log(`📦 Cache hit for user ${userName}: "${question.substring(0, 40)}..."`);
        return {
            ...cached,
            fromCache: true
        };
    }

    console.log(`🔍 Processing query for ${userName}: "${question.substring(0, 40)}..."`);

    // Process query through LangChain with user context
    const result = await processNaturalLanguageQuery(question, userId, userName);

    // Cache the result with user-specific key
    await cacheService.cacheResponse(cacheKey, result);

    return {
        ...result,
        fromCache: false
    };
};

module.exports = {
    processQuery
};

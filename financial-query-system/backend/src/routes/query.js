/**
 * Query API Routes
 * Handles natural language query requests with USER-SPECIFIC data access
 */

const express = require('express');
const router = express.Router();
const queryService = require('../services/queryService');
const { getUsers } = require('../langchain/queryChain');

/**
 * GET /api/users
 * Get all available users for selection
 */
router.get('/users', async (req, res) => {
    try {
        const users = await getUsers();
        res.json({
            users: users.map(u => ({
                id: u._id,
                name: u.name
            }))
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

/**
 * POST /api/query
 * Process a natural language query about financial data FOR A SPECIFIC USER
 * 
 * Request body:
 * {
 *   "question": "How much did I spend on food?",
 *   "userId": "uuid-of-user",
 *   "userName": "Rahul Sharma"
 * }
 * 
 * Response:
 * {
 *   "question": "...",
 *   "user": { "id": "...", "name": "..." },
 *   "answer": "...",
 *   "queryExecuted": {...},
 *   "dataRetrieved": [...],
 *   "fromCache": boolean,
 *   "processingTime": number
 * }
 */
router.post('/query', async (req, res) => {
    const startTime = Date.now();

    try {
        const { question, userId, userName } = req.body;

        // Validate input
        if (!question) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'Question is required'
            });
        }

        if (!userId || !userName) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'userId and userName are required. Please select a user.'
            });
        }

        if (typeof question !== 'string') {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'Question must be a string'
            });
        }

        if (question.trim().length === 0) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'Question cannot be empty'
            });
        }

        if (question.length > 500) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'Question is too long (max 500 characters)'
            });
        }

        // Process the query with user context
        const result = await queryService.processQuery(question.trim(), userId, userName);

        // Add processing time
        const processingTime = Date.now() - startTime;

        res.json({
            ...result,
            processingTime
        });

    } catch (error) {
        console.error('Query processing error:', error);

        const processingTime = Date.now() - startTime;

        res.status(500).json({
            error: 'Query Processing Failed',
            message: error.message || 'An error occurred while processing your query',
            processingTime
        });
    }
});

/**
 * GET /api/query/examples
 * Returns example queries that the system can handle
 */
router.get('/query/examples', (req, res) => {
    res.json({
        examples: [
            {
                category: 'Bank Transactions',
                queries: [
                    'How much did I spend on food?',
                    'What are my travel expenses?',
                    'Show my shopping transactions',
                    'What did I spend at Amazon?',
                    'Total spending in December 2024'
                ]
            },
            {
                category: 'Mutual Fund Holdings',
                queries: [
                    'Show my mutual fund holdings',
                    'What is my total MF investment value?',
                    'Which mutual fund has the highest returns?',
                    'How much profit have I made on mutual funds?'
                ]
            },
            {
                category: 'Equity Holdings',
                queries: [
                    'What stocks do I own?',
                    'Show my equity portfolio',
                    'What is the value of my Reliance shares?',
                    'How many TCS shares do I have?',
                    'What is my total equity value?'
                ]
            },
            {
                category: 'Portfolio Overview',
                queries: [
                    'What is my total portfolio value?',
                    'Give me a financial summary',
                    'Show my complete investment overview'
                ]
            }
        ]
    });
});

module.exports = router;

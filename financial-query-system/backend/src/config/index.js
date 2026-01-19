/**
 * Application Configuration
 * Centralizes all environment variables and settings
 */

const path = require('path');

// Try to load .env from different locations (for local dev and Docker)
require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
require('dotenv').config();

module.exports = {
    // Server configuration
    port: parseInt(process.env.PORT) || 3000,
    nodeEnv: process.env.NODE_ENV || 'development',

    // MongoDB configuration
    mongodb: {
        uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/financial_db'
    },

    // Redis configuration
    redis: {
        url: process.env.REDIS_URL || 'redis://localhost:6379'
    },

    // OpenAI configuration
    openai: {
        apiKey: process.env.OPENAI_API_KEY,
        model: process.env.OPENAI_MODEL || 'gpt-4'
    },

    // Cache configuration
    cache: {
        ttl: parseInt(process.env.CACHE_TTL) || 3600,  // 1 hour default
        enabled: process.env.CACHE_ENABLED !== 'false'
    }
};

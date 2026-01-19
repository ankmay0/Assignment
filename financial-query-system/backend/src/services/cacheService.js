/**
 * Cache Service
 * Handles Redis caching for query responses
 */

const crypto = require('crypto');
const { redisClient, isRedisConnected } = require('../config/redis');
const config = require('../config');

/**
 * Generate a cache key from the question
 * Normalizes the question and creates an MD5 hash
 * 
 * @param {string} question - The original question
 * @returns {string} Cache key
 */
const generateCacheKey = (question) => {
    // Normalize: lowercase, trim, remove extra whitespace
    const normalized = question
        .toLowerCase()
        .trim()
        .replace(/\s+/g, ' ');

    // Create MD5 hash of normalized question
    const hash = crypto.createHash('md5').update(normalized).digest('hex');

    return `query:${hash}`;
};

/**
 * Get cached response for a question
 * 
 * @param {string} question - The question to look up
 * @returns {Promise<Object|null>} Cached response or null
 */
const getCachedResponse = async (question) => {
    // Skip if caching is disabled or Redis not connected
    if (!config.cache.enabled || !isRedisConnected()) {
        return null;
    }

    try {
        const key = generateCacheKey(question);
        const cached = await redisClient.get(key);

        if (cached) {
            return JSON.parse(cached);
        }

        return null;
    } catch (error) {
        console.error('Cache get error:', error.message);
        return null;
    }
};

/**
 * Cache a response for a question
 * 
 * @param {string} question - The original question
 * @param {Object} response - The response to cache
 * @returns {Promise<void>}
 */
const cacheResponse = async (question, response) => {
    // Skip if caching is disabled or Redis not connected
    if (!config.cache.enabled || !isRedisConnected()) {
        return;
    }

    try {
        const key = generateCacheKey(question);

        // Store with TTL
        await redisClient.setEx(
            key,
            config.cache.ttl,
            JSON.stringify(response)
        );

        console.log(`💾 Cached response (TTL: ${config.cache.ttl}s)`);
    } catch (error) {
        console.error('Cache set error:', error.message);
        // Don't throw - caching failure shouldn't break the app
    }
};

/**
 * Invalidate cached entries matching a pattern
 * 
 * @param {string} pattern - Pattern to match (default: all query cache)
 * @returns {Promise<number>} Number of keys deleted
 */
const invalidateCache = async (pattern = 'query:*') => {
    if (!isRedisConnected()) {
        return 0;
    }

    try {
        const keys = await redisClient.keys(pattern);

        if (keys.length > 0) {
            await redisClient.del(keys);
            console.log(`🗑️ Invalidated ${keys.length} cache entries`);
        }

        return keys.length;
    } catch (error) {
        console.error('Cache invalidation error:', error.message);
        return 0;
    }
};

/**
 * Get cache statistics
 * 
 * @returns {Promise<Object>} Cache stats
 */
const getCacheStats = async () => {
    if (!isRedisConnected()) {
        return { connected: false };
    }

    try {
        const keys = await redisClient.keys('query:*');
        const info = await redisClient.info('memory');

        return {
            connected: true,
            cachedQueries: keys.length,
            ttl: config.cache.ttl
        };
    } catch (error) {
        return { connected: true, error: error.message };
    }
};

module.exports = {
    generateCacheKey,
    getCachedResponse,
    cacheResponse,
    invalidateCache,
    getCacheStats
};

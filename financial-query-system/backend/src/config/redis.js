/**
 * Redis Cache Connection
 */

const { createClient } = require('redis');
const config = require('./index');

// Create Redis client
const redisClient = createClient({
    url: config.redis.url,
    socket: {
        reconnectStrategy: (retries) => {
            if (retries > 10) {
                console.error('❌ Redis: Max reconnection attempts reached');
                return new Error('Max reconnection attempts reached');
            }
            // Exponential backoff: wait 2^retries * 100ms
            return Math.min(retries * 100, 3000);
        }
    }
});

// Event handlers
redisClient.on('error', (err) => {
    console.error('❌ Redis error:', err.message);
});

redisClient.on('connect', () => {
    console.log('🔄 Redis connecting...');
});

redisClient.on('ready', () => {
    console.log('✅ Redis connected and ready');
});

redisClient.on('reconnecting', () => {
    console.log('🔄 Redis reconnecting...');
});

redisClient.on('end', () => {
    console.log('🔌 Redis connection closed');
});

/**
 * Connect to Redis
 * @returns {Promise<void>}
 */
const connectRedis = async () => {
    try {
        if (!redisClient.isOpen) {
            await redisClient.connect();
        }
    } catch (error) {
        console.error('❌ Redis connection failed:', error.message);
        // Don't exit - app can work without cache
        console.warn('⚠️ Application will continue without caching');
    }
};

/**
 * Disconnect from Redis
 * @returns {Promise<void>}
 */
const disconnectRedis = async () => {
    try {
        if (redisClient.isOpen) {
            await redisClient.quit();
        }
    } catch (error) {
        console.error('Error disconnecting from Redis:', error.message);
    }
};

/**
 * Check if Redis is connected
 * @returns {boolean}
 */
const isRedisConnected = () => {
    return redisClient.isOpen && redisClient.isReady;
};

module.exports = {
    redisClient,
    connectRedis,
    disconnectRedis,
    isRedisConnected
};

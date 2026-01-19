/**
 * MongoDB Database Connection
 */

const mongoose = require('mongoose');
const config = require('./index');

/**
 * Connect to MongoDB
 * @returns {Promise<void>}
 */
const connectDB = async () => {
    try {
        const options = {
            // Recommended options for MongoDB driver
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 30000, // 30 seconds for Atlas
            socketTimeoutMS: 45000,
            family: 4 // Force IPv4
        };

        console.log('🔄 Connecting to MongoDB...');
        await mongoose.connect(config.mongodb.uri, options);

        console.log('✅ MongoDB connected successfully');
        console.log(`   Database: ${mongoose.connection.name}`);

        // Handle connection events
        mongoose.connection.on('error', (err) => {
            console.error('❌ MongoDB connection error:', err);
        });

        mongoose.connection.on('disconnected', () => {
            console.warn('⚠️ MongoDB disconnected');
        });

        mongoose.connection.on('reconnected', () => {
            console.log('🔄 MongoDB reconnected');
        });

    } catch (error) {
        console.error('❌ MongoDB connection failed:', error.message);
        console.error('   Please check:');
        console.error('   1. Your IP is whitelisted in MongoDB Atlas');
        console.error('   2. The connection string is correct');
        console.error('   3. Network connectivity to MongoDB Atlas');
        throw error; // Let the caller handle it
    }
};

/**
 * Disconnect from MongoDB
 * @returns {Promise<void>}
 */
const disconnectDB = async () => {
    try {
        await mongoose.disconnect();
        console.log('🔌 MongoDB disconnected');
    } catch (error) {
        console.error('Error disconnecting from MongoDB:', error.message);
    }
};

/**
 * Get the native MongoDB database instance
 * @returns {Db}
 */
const getDB = () => {
    return mongoose.connection.db;
};

module.exports = {
    connectDB,
    disconnectDB,
    getDB
};

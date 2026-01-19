/**
 * Express Server Entry Point
 * Financial Data Query System API
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const config = require('./config');
const { connectDB } = require('./config/database');
const { connectRedis } = require('./config/redis');
const queryRoutes = require('./routes/query');

// Initialize Express app
const app = express();

// ===================
// Security Middleware
// ===================

// Helmet for security headers
app.use(helmet());

// CORS configuration
app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per window
    message: {
        error: 'Too many requests',
        message: 'Please try again later'
    },
    standardHeaders: true,
    legacyHeaders: false
});
app.use('/api', limiter);

// ===================
// Body Parsing
// ===================

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// ===================
// Request Logging
// ===================

app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        if (config.nodeEnv === 'development') {
            console.log(`${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`);
        }
    });
    next();
});

// ===================
// API Routes
// ===================

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: config.nodeEnv
    });
});

// API info endpoint
app.get('/api', (req, res) => {
    res.json({
        name: 'Financial Data Query System',
        version: '1.0.0',
        description: 'Natural language query interface for financial data',
        endpoints: {
            health: 'GET /health',
            query: 'POST /api/query'
        }
    });
});

// Query routes
app.use('/api', queryRoutes);

// ===================
// Error Handling
// ===================

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Not Found',
        message: `Cannot ${req.method} ${req.path}`
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('❌ Error:', err.stack);

    res.status(err.status || 500).json({
        error: err.name || 'Internal Server Error',
        message: config.nodeEnv === 'development'
            ? err.message
            : 'An unexpected error occurred'
    });
});

// ===================
// Server Startup
// ===================

const startServer = async () => {
    try {
        console.log('\n🚀 Starting Financial Query System...\n');
        console.log('='.repeat(50));

        // Connect to databases
        await connectDB();
        await connectRedis();

        console.log('='.repeat(50));

        // Start HTTP server
        app.listen(config.port, () => {
            console.log(`\n✅ Server running on port ${config.port}`);
            console.log(`   Environment: ${config.nodeEnv}`);
            console.log(`   Health: http://localhost:${config.port}/health`);
            console.log(`   API: http://localhost:${config.port}/api`);
            console.log(`\n📝 Ready to accept queries!\n`);
        });

    } catch (error) {
        console.error('❌ Failed to start server:', error.message);
        process.exit(1);
    }
};

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err);
    process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('\n🛑 SIGTERM received. Shutting down gracefully...');
    const { disconnectDB } = require('./config/database');
    const { disconnectRedis } = require('./config/redis');
    await disconnectDB();
    await disconnectRedis();
    process.exit(0);
});

// Start the server
startServer();

module.exports = app;

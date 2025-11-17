require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const dbManager = require('./config/db'); // Your path
const logger = require('./utils/logger');

const hospitalRoutes = require('./routes/hospitalRoutes');
const patientRoutes = require('./routes/patientRoutes');
const transferRoutes = require('./routes/transferRoutes');
const queryRoutes = require('./routes/queryRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// ===== MIDDLEWARE =====
// Security
app.use(helmet());

// CORS
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:3000', 'http://localhost:5173'];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api', limiter);

// Request logging
app.use((req, res, next) => {
  logger.logRequest(req);
  next();
});

// ===== ROUTES =====
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to CareBridge API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      hospitals: '/api/hospitals',
      patients: '/api/patients',
      transfers: '/api/transfer',
      queries: '/api/query',
      health: '/api/health',
    },
  });
});

// Health check
app.get('/api/health', async (req, res) => {
  try {
    const dbHealth = await dbManager.healthCheck();
    const allHealthy = Object.values(dbHealth).every(h => h.connected);

    res.status(allHealthy ? 200 : 503).json({
      status: allHealthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: dbHealth,
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error.message,
    });
  }
});

// API routes
app.use('/api/hospitals', hospitalRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/transfer', transferRoutes);
// app.use('/api/query', queryRoutes); // Commented out due to empty queryRoutes.js

// ===== ERROR HANDLING =====
// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl,
  });
});

// Global error handler
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', err);
  
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// ===== SERVER STARTUP =====
async function startServer() {
  try {
    // Initialize database connections
    logger.info('Initializing database connections...');
    await dbManager.initializeConnections();
    
    // Start Express server
    app.listen(PORT, () => {
      logger.info(`🚀 CareBridge API server running on port ${PORT}`);
      logger.info(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`🏥 Connected hospitals: ${dbManager.getAllHospitals().length}`);
      logger.info(`🔗 API Base URL: http://localhost:${PORT}/api`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// ===== GRACEFUL SHUTDOWN =====
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received. Closing server gracefully...');
  await dbManager.closeAllConnections();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received. Closing server gracefully...');
  await dbManager.closeAllConnections();
  process.exit(0);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start the server
startServer();

module.exports = app;
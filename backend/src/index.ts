import express, { Express } from 'express';
import cors from 'cors';
import { config, validateConfig } from './utils/config';
import { logger } from './utils/logger';
import { testConnection, closePool } from './utils/db';
import { connectRedis, disconnectRedis } from './utils/redis';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

// Import routes (will be created)
import authRoutes from './routes/auth';
import moodRoutes from './routes/mood';
import taskRoutes from './routes/tasks';
import scheduleRoutes from './routes/schedule';
import musicRoutes from './routes/music';
import flowBlockRoutes from './routes/flowBlocks';
import analyticsRoutes from './routes/analytics';
import coachRoutes from './routes/coach';

const app: Express = express();

// Middleware
app.use(cors({
  origin: config.frontend.url,
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/mood', moodRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/schedule', scheduleRoutes);
app.use('/api/music', musicRoutes);
app.use('/api/flow-blocks', flowBlockRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/coach', coachRoutes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Startup
async function startServer() {
  try {
    // Validate configuration
    validateConfig();

    // Connect to database
    const dbConnected = await testConnection();
    if (!dbConnected) {
      throw new Error('Failed to connect to database');
    }

    // Connect to Redis
    await connectRedis();

    // Start server
    app.listen(config.port, () => {
      logger.info(`🚀 FlowSync server running on port ${config.port}`);
      logger.info(`📊 Environment: ${config.nodeEnv}`);
      logger.info(`🔗 API: http://localhost:${config.port}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully...');
  await closePool();
  await disconnectRedis();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully...');
  await closePool();
  await disconnectRedis();
  process.exit(0);
});

// Start the server
startServer();

export default app;

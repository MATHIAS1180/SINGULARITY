import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config';
import { logger } from './utils/logger';
import { ApiError } from './utils/errors';
import { IndexerService } from './services/indexer.service';

// Import routes
import { healthRoutes } from './routes/health.routes';
import { gameRoutes } from './routes/game.routes';
import { playerRoutes } from './routes/player.routes';

/**
 * Create and configure Express server
 */
export function createServer(indexer: IndexerService): Express {
  const app = express();

  // ========== Middleware ==========

  // Security headers
  app.use(helmet());

  // CORS
  app.use(cors({
    origin: config.corsOrigin,
    credentials: true,
  }));

  // Body parsing
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Request logging
  app.use((req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();
    
    res.on('finish', () => {
      const duration = Date.now() - start;
      logger.info(`${req.method} ${req.path} ${res.statusCode} - ${duration}ms`);
    });
    
    next();
  });

  // ========== Routes ==========

  // Health check
  app.use('/health', healthRoutes);

  // API routes
  app.use('/api/game', gameRoutes(indexer));
  app.use('/api/players', playerRoutes(indexer));

  // Root endpoint
  app.get('/', (req: Request, res: Response) => {
    res.json({
      name: 'Swarm Arena API',
      version: '1.0.0',
      status: 'running',
      endpoints: {
        health: '/health',
        game: '/api/game',
        players: '/api/players',
      },
    });
  });

  // ========== Error Handling ==========

  // 404 handler
  app.use((req: Request, res: Response) => {
    res.status(404).json({
      error: 'Not Found',
      message: `Route ${req.method} ${req.path} not found`,
      path: req.path,
    });
  });

  // Global error handler
  app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    // Log error
    logger.error('Error:', {
      message: err.message,
      stack: err.stack,
      path: req.path,
      method: req.method,
    });

    // Handle ApiError
    if (err instanceof ApiError) {
      return res.status(err.statusCode).json({
        error: err.name,
        message: err.message,
        ...(config.env === 'development' && { stack: err.stack }),
      });
    }

    // Handle generic errors
    res.status(500).json({
      error: 'Internal Server Error',
      message: config.env === 'development' ? err.message : 'Something went wrong',
      ...(config.env === 'development' && { stack: err.stack }),
    });
  });

  return app;
}
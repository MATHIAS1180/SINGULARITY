import { config } from './config';
import { logger } from './utils/logger';
import { createServer } from './server';
import { IndexerService } from './services/indexer.service';

/**
 * Main entry point for the Swarm Arena backend
 */
async function main() {
  try {
    logger.info('Starting Swarm Arena Backend...');
    logger.info(`Environment: ${config.env}`);
    logger.info(`Port: ${config.port}`);

    // Initialize indexer service
    logger.info('Initializing indexer service...');
    const indexer = new IndexerService();
    await indexer.initialize();
    
    // Start listening to blockchain events
    logger.info('Starting event listener...');
    indexer.startListening();

    // Create and start HTTP server
    logger.info('Starting HTTP server...');
    const server = createServer(indexer);
    
    server.listen(config.port, () => {
      logger.info(`✅ Server running on port ${config.port}`);
      logger.info(`📊 API available at http://localhost:${config.port}`);
      logger.info(`🔍 Indexing Solana program: ${config.programId}`);
    });

    // Graceful shutdown
    const shutdown = async (signal: string) => {
      logger.info(`${signal} received, shutting down gracefully...`);
      
      // Stop indexer
      indexer.stopListening();
      
      // Close server
      server.close(() => {
        logger.info('Server closed');
        process.exit(0);
      });

      // Force exit after 10 seconds
      setTimeout(() => {
        logger.error('Forced shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

  } catch (error) {
    logger.error('Failed to start backend:', error);
    process.exit(1);
  }
}

// Start the application
main();
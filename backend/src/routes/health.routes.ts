import { Router, Request, Response } from 'express';

/**
 * Health check routes
 */
export const healthRoutes = Router();

/**
 * GET /health
 * Simple health check
 */
healthRoutes.get('/', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

/**
 * GET /health/ready
 * Readiness check (for k8s/docker)
 */
healthRoutes.get('/ready', (req: Request, res: Response) => {
  // Check if application is ready to serve traffic
  const isReady = true; // Add actual readiness checks if needed

  if (isReady) {
    res.json({
      status: 'ready',
      timestamp: new Date().toISOString(),
    });
  } else {
    res.status(503).json({
      status: 'not ready',
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * GET /health/live
 * Liveness check (for k8s/docker)
 */
healthRoutes.get('/live', (req: Request, res: Response) => {
  // Simple liveness check - if this responds, the app is alive
  res.json({
    status: 'alive',
    timestamp: new Date().toISOString(),
  });
});
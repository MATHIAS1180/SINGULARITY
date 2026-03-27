import { Router, Request, Response, NextFunction } from 'express';
import { IndexerService } from '../services/indexer.service';
import { ApiError } from '../utils/errors';
import { PublicKey } from '@solana/web3.js';

/**
 * Create game routes
 */
export function gameRoutes(indexer: IndexerService): Router {
  const router = Router();

  /**
   * GET /game/state
   * Get current game state
   */
  router.get('/state', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const gameState = await indexer.getGameState();

      if (!gameState) {
        throw new ApiError('Game state not found', 404);
      }

      res.json({
        success: true,
        data: {
          currentCycle: gameState.currentCycle,
          cycleStartSlot: gameState.cycleStartSlot,
          cycleEndSlot: gameState.cycleEndSlot,
          totalValueLocked: gameState.totalValueLocked,
          totalExposedValue: gameState.totalExposedValue,
          activePlayers: gameState.activePlayers,
          cycleResolved: gameState.cycleResolved,
          lastUpdateSlot: gameState.lastUpdateSlot,
        },
      });
    } catch (error) {
      next(error);
    }
  });

  /**
   * GET /game/cycles
   * Get historical cycles
   * Query params: limit, offset
   */
  router.get('/cycles', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;

      if (limit > 100) {
        throw new ApiError('Limit cannot exceed 100', 400);
      }

      const cycles = await indexer.getCycles(limit, offset);
      const totalCycles = await indexer.getTotalCycles();

      res.json({
        success: true,
        data: {
          cycles,
          pagination: {
            limit,
            offset,
            total: totalCycles,
            hasMore: offset + limit < totalCycles,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  });

  /**
   * GET /game/cycles/:cycleNumber
   * Get specific cycle details
   */
  router.get('/cycles/:cycleNumber', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const cycleNumber = parseInt(req.params.cycleNumber);

      if (isNaN(cycleNumber) || cycleNumber < 1) {
        throw new ApiError('Invalid cycle number', 400);
      }

      const cycle = await indexer.getCycle(cycleNumber);

      if (!cycle) {
        throw new ApiError('Cycle not found', 404);
      }

      res.json({
        success: true,
        data: cycle,
      });
    } catch (error) {
      next(error);
    }
  });

  /**
   * GET /game/leaderboard
   * Get player leaderboard
   * Query params: limit, offset, sortBy
   */
  router.get('/leaderboard', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;
      const sortBy = (req.query.sortBy as string) || 'score'; // score, balance, cycles

      if (limit > 100) {
        throw new ApiError('Limit cannot exceed 100', 400);
      }

      const validSortFields = ['score', 'balance', 'cycles', 'totalRedistributed'];
      if (!validSortFields.includes(sortBy)) {
        throw new ApiError(`Invalid sortBy field. Must be one of: ${validSortFields.join(', ')}`, 400);
      }

      const leaderboard = await indexer.getLeaderboard(limit, offset, sortBy);
      const totalPlayers = await indexer.getTotalPlayers();

      res.json({
        success: true,
        data: {
          leaderboard,
          pagination: {
            limit,
            offset,
            total: totalPlayers,
            hasMore: offset + limit < totalPlayers,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  });

  /**
   * GET /game/activity
   * Get recent activity/events
   * Query params: limit, offset, type
   */
  router.get('/activity', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;
      const type = req.query.type as string | undefined;

      if (limit > 100) {
        throw new ApiError('Limit cannot exceed 100', 400);
      }

      const validTypes = ['deposit', 'withdraw', 'exposure', 'cycle', 'redistribution'];
      if (type && !validTypes.includes(type)) {
        throw new ApiError(`Invalid type. Must be one of: ${validTypes.join(', ')}`, 400);
      }

      const activity = await indexer.getActivity(limit, offset, type);
      const totalActivity = await indexer.getTotalActivity(type);

      res.json({
        success: true,
        data: {
          activity,
          pagination: {
            limit,
            offset,
            total: totalActivity,
            hasMore: offset + limit < totalActivity,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  });

  /**
   * GET /game/player/:wallet
   * Get player state by wallet address
   */
  router.get('/player/:wallet', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const walletAddress = req.params.wallet;

      // Validate wallet address
      let publicKey: PublicKey;
      try {
        publicKey = new PublicKey(walletAddress);
      } catch (error) {
        throw new ApiError('Invalid wallet address', 400);
      }

      const player = await indexer.getPlayer(publicKey.toString());

      if (!player) {
        throw new ApiError('Player not found', 404);
      }

      res.json({
        success: true,
        data: player,
      });
    } catch (error) {
      next(error);
    }
  });

  /**
   * GET /game/stats
   * Get global statistics
   */
  router.get('/stats', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const stats = await indexer.getGlobalStats();

      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  });

  return router;
}
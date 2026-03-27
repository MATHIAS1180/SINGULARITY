import { Connection, PublicKey } from '@solana/web3.js';
import { Program, AnchorProvider, Wallet, BN } from '@coral-xyz/anchor';
import { config } from '../config';
import { logger } from '../utils/logger';

/**
 * Event types from the Swarm Arena program
 */
interface ConfigInitializedEvent {
  authority: PublicKey;
  protocolFeeBps: number;
  minDeposit: BN;
  maxDeposit: BN;
  cycleDuration: BN;
  timestamp: BN;
}

interface PlayerRegisteredEvent {
  player: PublicKey;
  timestamp: BN;
  slot: BN;
}

interface DepositMadeEvent {
  player: PublicKey;
  amount: BN;
  newBalance: BN;
  timestamp: BN;
  slot: BN;
}

interface WithdrawMadeEvent {
  player: PublicKey;
  amount: BN;
  newBalance: BN;
  timestamp: BN;
  slot: BN;
}

interface ExposureUpdatedEvent {
  player: PublicKey;
  oldExposure: number;
  newExposure: number;
  exposedValue: BN;
  timestamp: BN;
  slot: BN;
}

interface CycleResolvedEvent {
  cycleNumber: BN;
  startSlot: BN;
  endSlot: BN;
  totalValueLocked: BN;
  totalExposedValue: BN;
  totalRedistributed: BN;
  feesCollected: BN;
  participants: number;
  winners: number;
  timestamp: BN;
}

interface RewardDistributedEvent {
  player: PublicKey;
  cycleNumber: BN;
  redistributionAmount: BN;
  newBalance: BN;
  newScore: BN;
  timestamp: BN;
}

/**
 * Indexer Service
 * Listens to on-chain events and indexes them into the database
 */
export class IndexerService {
  private connection: Connection;
  private program: Program | null = null;
  private isListening: boolean = false;
  private listenerIds: number[] = [];
  private lastProcessedSlot: number = 0;

  constructor() {
    this.connection = new Connection(config.rpcEndpoint, 'confirmed');
  }

  /**
   * Initialize the indexer service
   */
  async initialize(): Promise<void> {
    try {
      logger.info('Initializing indexer service...');

      // Initialize Anchor program
      // Note: In production, you'd load the IDL from a file or fetch it
      // For now, we'll set up the connection and prepare for event listening
      
      // Get last processed slot from database
      this.lastProcessedSlot = await this.getLastProcessedSlot();
      
      logger.info(`Indexer initialized. Last processed slot: ${this.lastProcessedSlot}`);
    } catch (error) {
      logger.error('Failed to initialize indexer:', error);
      throw error;
    }
  }

  /**
   * Start listening to blockchain events
   */
  startListening(): void {
    if (this.isListening) {
      logger.warn('Indexer is already listening');
      return;
    }

    this.isListening = true;
    logger.info('Starting event listener...');

    // Start polling for new events
    this.pollEvents();
  }

  /**
   * Stop listening to blockchain events
   */
  stopListening(): void {
    if (!this.isListening) {
      return;
    }

    this.isListening = false;
    logger.info('Stopping event listener...');

    // Remove all listeners
    this.listenerIds.forEach(id => {
      this.connection.removeOnLogsListener(id);
    });
    this.listenerIds = [];
  }

  /**
   * Poll for new events
   */
  private async pollEvents(): Promise<void> {
    while (this.isListening) {
      try {
        await this.processNewEvents();
        
        // Wait before next poll
        await this.sleep(config.indexer.pollInterval);
      } catch (error) {
        logger.error('Error polling events:', error);
        
        // Wait before retrying
        await this.sleep(5000);
      }
    }
  }

  /**
   * Process new events since last processed slot
   */
  private async processNewEvents(): Promise<void> {
    try {
      const currentSlot = await this.connection.getSlot();
      
      if (currentSlot <= this.lastProcessedSlot) {
        return;
      }

      logger.debug(`Processing events from slot ${this.lastProcessedSlot} to ${currentSlot}`);

      // Fetch signatures for the program
      const signatures = await this.connection.getSignaturesForAddress(
        config.programPublicKey,
        {
          limit: config.indexer.batchSize,
        }
      );

      // Process each transaction
      for (const sigInfo of signatures) {
        if (sigInfo.slot <= this.lastProcessedSlot) {
          continue;
        }

        await this.processTransaction(sigInfo.signature);
      }

      // Update last processed slot
      this.lastProcessedSlot = currentSlot;
      await this.saveLastProcessedSlot(currentSlot);

    } catch (error) {
      logger.error('Error processing new events:', error);
      throw error;
    }
  }

  /**
   * Process a single transaction
   */
  private async processTransaction(signature: string): Promise<void> {
    try {
      const tx = await this.connection.getTransaction(signature, {
        maxSupportedTransactionVersion: 0,
      });

      if (!tx || !tx.meta) {
        return;
      }

      // Parse logs for events
      const logs = tx.meta.logMessages || [];
      
      for (const log of logs) {
        await this.parseAndStoreEvent(log, tx.slot);
      }

    } catch (error) {
      logger.error(`Error processing transaction ${signature}:`, error);
      // Don't throw - continue processing other transactions
    }
  }

  /**
   * Parse and store an event from logs
   */
  private async parseAndStoreEvent(log: string, slot: number): Promise<void> {
    try {
      // Check for event patterns in logs
      // Anchor events are logged with "Program log: " prefix
      
      if (log.includes('PlayerRegistered')) {
        await this.handlePlayerRegistered(log, slot);
      } else if (log.includes('DepositMade')) {
        await this.handleDepositMade(log, slot);
      } else if (log.includes('WithdrawMade')) {
        await this.handleWithdrawMade(log, slot);
      } else if (log.includes('ExposureUpdated')) {
        await this.handleExposureUpdated(log, slot);
      } else if (log.includes('CycleResolved')) {
        await this.handleCycleResolved(log, slot);
      } else if (log.includes('RewardDistributed')) {
        await this.handleRewardDistributed(log, slot);
      }

    } catch (error) {
      logger.error('Error parsing event:', error);
      // Don't throw - continue processing other events
    }
  }

  /**
   * Event handlers - store events in database
   */
  private async handlePlayerRegistered(log: string, slot: number): Promise<void> {
    logger.debug('PlayerRegistered event detected');
    // TODO: Parse event data and store in database
    // await db.players.create({ ... });
  }

  private async handleDepositMade(log: string, slot: number): Promise<void> {
    logger.debug('DepositMade event detected');
    // TODO: Parse event data and store in database
    // await db.activity.create({ type: 'deposit', ... });
  }

  private async handleWithdrawMade(log: string, slot: number): Promise<void> {
    logger.debug('WithdrawMade event detected');
    // TODO: Parse event data and store in database
    // await db.activity.create({ type: 'withdraw', ... });
  }

  private async handleExposureUpdated(log: string, slot: number): Promise<void> {
    logger.debug('ExposureUpdated event detected');
    // TODO: Parse event data and store in database
    // await db.activity.create({ type: 'exposure', ... });
  }

  private async handleCycleResolved(log: string, slot: number): Promise<void> {
    logger.debug('CycleResolved event detected');
    // TODO: Parse event data and store in database
    // await db.cycles.create({ ... });
  }

  private async handleRewardDistributed(log: string, slot: number): Promise<void> {
    logger.debug('RewardDistributed event detected');
    // TODO: Parse event data and store in database
    // await db.activity.create({ type: 'redistribution', ... });
  }

  /**
   * Database query methods for API routes
   */
  async getGameState(): Promise<any> {
    // TODO: Fetch from database
    return {
      currentCycle: 1,
      cycleStartSlot: 0,
      cycleEndSlot: 100,
      totalValueLocked: '0',
      totalExposedValue: '0',
      activePlayers: 0,
      cycleResolved: false,
      lastUpdateSlot: 0,
    };
  }

  async getCycles(limit: number, offset: number): Promise<any[]> {
    // TODO: Fetch from database
    return [];
  }

  async getCycle(cycleNumber: number): Promise<any | null> {
    // TODO: Fetch from database
    return null;
  }

  async getTotalCycles(): Promise<number> {
    // TODO: Fetch from database
    return 0;
  }

  async getLeaderboard(limit: number, offset: number, sortBy: string): Promise<any[]> {
    // TODO: Fetch from database
    return [];
  }

  async getTotalPlayers(): Promise<number> {
    // TODO: Fetch from database
    return 0;
  }

  async getActivity(limit: number, offset: number, type?: string): Promise<any[]> {
    // TODO: Fetch from database
    return [];
  }

  async getTotalActivity(type?: string): Promise<number> {
    // TODO: Fetch from database
    return 0;
  }

  async getPlayer(wallet: string): Promise<any | null> {
    // TODO: Fetch from database
    return null;
  }

  async getGlobalStats(): Promise<any> {
    // TODO: Fetch from database
    return {
      totalPlayers: 0,
      totalCycles: 0,
      totalValueLocked: '0',
      totalFeesCollected: '0',
      activePlayers: 0,
    };
  }

  /**
   * Persistence methods
   */
  private async getLastProcessedSlot(): Promise<number> {
    // TODO: Fetch from database
    // For now, use config or default to 0
    return config.indexer.startSlot || 0;
  }

  private async saveLastProcessedSlot(slot: number): Promise<void> {
    // TODO: Save to database
    logger.debug(`Saved last processed slot: ${slot}`);
  }

  /**
   * Utility methods
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
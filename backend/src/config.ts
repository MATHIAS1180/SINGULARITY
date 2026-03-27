import { PublicKey } from '@solana/web3.js';

/**
 * Environment type
 */
export type Environment = 'development' | 'production' | 'test';

/**
 * Solana cluster type
 */
export type Cluster = 'devnet' | 'testnet' | 'mainnet-beta' | 'localnet';

/**
 * Application configuration interface
 */
interface Config {
  // Environment
  env: Environment;
  port: number;

  // Solana
  cluster: Cluster;
  rpcEndpoint: string;
  programId: string;
  programPublicKey: PublicKey;

  // Database
  databaseUrl: string;

  // API
  corsOrigin: string | string[];
  rateLimit: {
    windowMs: number;
    max: number;
  };

  // Logging
  logLevel: string;
  logFormat: 'json' | 'pretty';

  // Indexer
  indexer: {
    pollInterval: number; // ms
    batchSize: number;
    startSlot?: number;
  };
}

/**
 * Get environment variable with fallback
 */
function getEnv(key: string, defaultValue?: string): string {
  const value = process.env[key];
  if (value === undefined) {
    if (defaultValue !== undefined) {
      return defaultValue;
    }
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

/**
 * Get optional environment variable
 */
function getOptionalEnv(key: string, defaultValue: string): string {
  return process.env[key] || defaultValue;
}

/**
 * Get numeric environment variable
 */
function getNumericEnv(key: string, defaultValue: number): number {
  const value = process.env[key];
  if (value === undefined) {
    return defaultValue;
  }
  const parsed = parseInt(value, 10);
  if (isNaN(parsed)) {
    throw new Error(`Invalid numeric value for ${key}: ${value}`);
  }
  return parsed;
}

/**
 * Get RPC endpoint based on cluster
 */
function getRpcEndpoint(cluster: Cluster): string {
  // Allow override via env var
  if (process.env.RPC_ENDPOINT) {
    return process.env.RPC_ENDPOINT;
  }

  // Default endpoints
  switch (cluster) {
    case 'devnet':
      return 'https://api.devnet.solana.com';
    case 'testnet':
      return 'https://api.testnet.solana.com';
    case 'mainnet-beta':
      return 'https://api.mainnet-beta.solana.com';
    case 'localnet':
      return 'http://localhost:8899';
    default:
      throw new Error(`Unknown cluster: ${cluster}`);
  }
}

/**
 * Parse CORS origin
 */
function parseCorsOrigin(): string | string[] {
  const origin = getOptionalEnv('CORS_ORIGIN', '*');
  if (origin.includes(',')) {
    return origin.split(',').map(o => o.trim());
  }
  return origin;
}

/**
 * Load and validate configuration
 */
function loadConfig(): Config {
  // Environment
  const env = getOptionalEnv('NODE_ENV', 'development') as Environment;
  const port = getNumericEnv('PORT', 3000);

  // Solana
  const cluster = getOptionalEnv('SOLANA_CLUSTER', 'devnet') as Cluster;
  const rpcEndpoint = getRpcEndpoint(cluster);
  const programId = getEnv(
    'PROGRAM_ID',
    'A9W89qV4i21ZCmFTLYZZE3HgwnqimWEFjGd3rowYcZpr'
  );

  // Validate program ID
  let programPublicKey: PublicKey;
  try {
    programPublicKey = new PublicKey(programId);
  } catch (error) {
    throw new Error(`Invalid PROGRAM_ID: ${programId}`);
  }

  // Database
  const databaseUrl = getEnv(
    'DATABASE_URL',
    'postgresql://postgres:postgres@localhost:5432/swarm_arena'
  );

  // API
  const corsOrigin = parseCorsOrigin();

  // Logging
  const logLevel = getOptionalEnv('LOG_LEVEL', env === 'production' ? 'info' : 'debug');
  const logFormat = getOptionalEnv('LOG_FORMAT', env === 'production' ? 'json' : 'pretty') as 'json' | 'pretty';

  // Indexer
  const pollInterval = getNumericEnv('INDEXER_POLL_INTERVAL', 5000);
  const batchSize = getNumericEnv('INDEXER_BATCH_SIZE', 100);
  const startSlot = process.env.INDEXER_START_SLOT 
    ? parseInt(process.env.INDEXER_START_SLOT, 10) 
    : undefined;

  return {
    env,
    port,
    cluster,
    rpcEndpoint,
    programId,
    programPublicKey,
    databaseUrl,
    corsOrigin,
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
    },
    logLevel,
    logFormat,
    indexer: {
      pollInterval,
      batchSize,
      startSlot,
    },
  };
}

/**
 * Export singleton config instance
 */
export const config = loadConfig();

/**
 * Log configuration (without sensitive data)
 */
export function logConfig(): void {
  console.log('Configuration loaded:');
  console.log(`  Environment: ${config.env}`);
  console.log(`  Port: ${config.port}`);
  console.log(`  Cluster: ${config.cluster}`);
  console.log(`  RPC Endpoint: ${config.rpcEndpoint}`);
  console.log(`  Program ID: ${config.programId}`);
  console.log(`  Database: ${config.databaseUrl.replace(/:[^:@]+@/, ':****@')}`); // Hide password
  console.log(`  CORS Origin: ${config.corsOrigin}`);
  console.log(`  Log Level: ${config.logLevel}`);
  console.log(`  Indexer Poll Interval: ${config.indexer.pollInterval}ms`);
}
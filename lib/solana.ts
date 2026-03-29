import { 
  Connection, 
  PublicKey, 
  Commitment,
  ConnectionConfig,
  clusterApiUrl,
  Cluster
} from '@solana/web3.js';
import { AnchorProvider, Program, Idl } from '@coral-xyz/anchor';
import { AnchorWallet } from '@solana/wallet-adapter-react';

// Program ID from declare_id! in lib.rs
export const PROGRAM_ID = new PublicKey('FbSDMGKyTo1YYGMjtau1JLBUDh18koz1JKN3NL38Zmf3');

// Cluster configuration
export type SolanaCluster = 'devnet' | 'testnet' | 'mainnet-beta' | 'localnet';

export const CLUSTER: SolanaCluster = (process.env.NEXT_PUBLIC_SOLANA_CLUSTER as SolanaCluster) || 'devnet';

// RPC endpoints
export const RPC_ENDPOINTS: Record<SolanaCluster, string> = {
  'mainnet-beta': process.env.NEXT_PUBLIC_SOLANA_RPC_MAINNET || clusterApiUrl('mainnet-beta'),
  'devnet': process.env.NEXT_PUBLIC_SOLANA_RPC_DEVNET || clusterApiUrl('devnet'),
  'testnet': process.env.NEXT_PUBLIC_SOLANA_RPC_TESTNET || clusterApiUrl('testnet'),
  'localnet': process.env.NEXT_PUBLIC_SOLANA_RPC_LOCAL || 'http://localhost:8899',
};

// Connection configuration
export const CONNECTION_CONFIG: ConnectionConfig = {
  commitment: 'confirmed' as Commitment,
  confirmTransactionInitialTimeout: 60000,
};

/**
 * Get RPC endpoint for current cluster
 */
export function getRpcEndpoint(cluster: SolanaCluster = CLUSTER): string {
  return RPC_ENDPOINTS[cluster];
}

/**
 * Create a Solana connection
 */
export function createConnection(
  cluster: SolanaCluster = CLUSTER,
  config: ConnectionConfig = CONNECTION_CONFIG
): Connection {
  const endpoint = getRpcEndpoint(cluster);
  return new Connection(endpoint, config);
}

/**
 * Get default connection (singleton pattern)
 */
let defaultConnection: Connection | null = null;

export function getConnection(): Connection {
  if (!defaultConnection) {
    defaultConnection = createConnection();
  }
  return defaultConnection;
}

/**
 * Create Anchor provider from wallet
 */
export function createProvider(
  wallet: AnchorWallet,
  connection: Connection = getConnection()
): AnchorProvider {
  return new AnchorProvider(connection, wallet, {
    commitment: CONNECTION_CONFIG.commitment,
    preflightCommitment: CONNECTION_CONFIG.commitment,
  });
}

/**
 * Get Anchor program instance
 */
export function getProgram(
  provider: AnchorProvider,
  idl: Idl
): Program {
  return new Program(idl, PROGRAM_ID, provider);
}

/**
 * Derive PDA for global config
 */
export function getGlobalConfigPDA(): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('config')],
    PROGRAM_ID
  );
}

/**
 * Derive PDA for game state
 */
export function getGameStatePDA(): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('game_state')],
    PROGRAM_ID
  );
}

/**
 * Derive PDA for cycle state
 */
export function getCycleStatePDA(cycleNumber: number): [PublicKey, number] {
  const cycleBuffer = Buffer.alloc(8);
  cycleBuffer.writeBigUInt64LE(BigInt(cycleNumber));
  
  return PublicKey.findProgramAddressSync(
    [Buffer.from('cycle'), cycleBuffer],
    PROGRAM_ID
  );
}

/**
 * Derive PDA for player state
 */
export function getPlayerStatePDA(playerPubkey: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('player'), playerPubkey.toBuffer()],
    PROGRAM_ID
  );
}

/**
 * Derive PDA for vault (player funds)
 */
export function getVaultPDA(): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('vault')],
    PROGRAM_ID
  );
}

/**
 * Derive PDA for treasury vault (protocol fees)
 */
export function getTreasuryVaultPDA(): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('treasury')],
    PROGRAM_ID
  );
}

/**
 * Shorten wallet address for display
 */
export function shortenAddress(address: string | PublicKey, chars = 4): string {
  const addressStr = typeof address === 'string' ? address : address.toString();
  return `${addressStr.slice(0, chars)}...${addressStr.slice(-chars)}`;
}

/**
 * Format SOL amount from lamports
 */
export function lamportsToSol(lamports: number | bigint): number {
  return Number(lamports) / 1e9;
}

/**
 * Format lamports from SOL amount
 */
export function solToLamports(sol: number): number {
  return Math.floor(sol * 1e9);
}

/**
 * Check if address is valid
 */
export function isValidAddress(address: string): boolean {
  try {
    new PublicKey(address);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get explorer URL for transaction
 */
export function getExplorerUrl(
  signature: string,
  cluster: SolanaCluster = CLUSTER,
  type: 'tx' | 'address' = 'tx'
): string {
  const baseUrl = 'https://explorer.solana.com';
  const clusterParam = cluster === 'mainnet-beta' ? '' : `?cluster=${cluster}`;
  
  return `${baseUrl}/${type}/${signature}${clusterParam}`;
}

/**
 * Wait for transaction confirmation with timeout
 */
export async function confirmTransaction(
  connection: Connection,
  signature: string,
  commitment: Commitment = 'confirmed',
  timeoutMs: number = 60000
): Promise<boolean> {
  const start = Date.now();
  
  while (Date.now() - start < timeoutMs) {
    const status = await connection.getSignatureStatus(signature);
    
    if (status?.value?.confirmationStatus === commitment || 
        status?.value?.confirmationStatus === 'finalized') {
      return true;
    }
    
    if (status?.value?.err) {
      throw new Error(`Transaction failed: ${JSON.stringify(status.value.err)}`);
    }
    
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  throw new Error('Transaction confirmation timeout');
}

/**
 * Get account balance in SOL
 */
export async function getBalance(
  connection: Connection,
  publicKey: PublicKey
): Promise<number> {
  const lamports = await connection.getBalance(publicKey);
  return lamportsToSol(lamports);
}

/**
 * Airdrop SOL (devnet/testnet only)
 */
export async function airdrop(
  connection: Connection,
  publicKey: PublicKey,
  amount: number = 1
): Promise<string> {
  if (CLUSTER === 'mainnet-beta') {
    throw new Error('Airdrop not available on mainnet');
  }
  
  const lamports = solToLamports(amount);
  const signature = await connection.requestAirdrop(publicKey, lamports);
  await confirmTransaction(connection, signature);
  
  return signature;
}

/**
 * Check if program is deployed
 */
export async function isProgramDeployed(
  connection: Connection,
  programId: PublicKey = PROGRAM_ID
): Promise<boolean> {
  try {
    const accountInfo = await connection.getAccountInfo(programId);
    return accountInfo !== null && accountInfo.executable;
  } catch {
    return false;
  }
}

/**
 * Get cluster from connection endpoint
 */
export function getClusterFromEndpoint(endpoint: string): SolanaCluster {
  if (endpoint.includes('mainnet')) return 'mainnet-beta';
  if (endpoint.includes('testnet')) return 'testnet';
  if (endpoint.includes('devnet')) return 'devnet';
  if (endpoint.includes('localhost') || endpoint.includes('127.0.0.1')) return 'localnet';
  return 'devnet';
}

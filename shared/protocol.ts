/**
 * Swarm Arena Protocol Constants and Types
 * 
 * This file defines the core protocol constants and types shared across:
 * - Smart contract (Rust/Anchor)
 * - Backend (Node.js/TypeScript)
 * - Frontend (Next.js/TypeScript)
 * - Tests (TypeScript)
 * 
 * DO NOT modify these values without updating the smart contract accordingly.
 */

// ============================================================================
// Protocol Version
// ============================================================================

export const PROTOCOL_VERSION = '1.0.0' as const;

export const PROTOCOL_INFO = {
  name: 'Swarm Arena',
  version: PROTOCOL_VERSION,
  programId: 'FbSDMGKyTo1YYGMjtau1JLBUDh18koz1JKN3NL38Zmf3',
} as const;

// ============================================================================
// Fee Configuration
// ============================================================================

/**
 * Protocol fee in basis points (1 bps = 0.01%)
 * 200 bps = 2%
 */
export const PROTOCOL_FEE_BPS = 200 as const;

/**
 * Protocol fee as percentage
 */
export const PROTOCOL_FEE_PERCENT = PROTOCOL_FEE_BPS / 100;

/**
 * Maximum allowed protocol fee (safety limit)
 */
export const MAX_PROTOCOL_FEE_BPS = 1000 as const; // 10%

// ============================================================================
// Deposit Limits
// ============================================================================

/**
 * Minimum deposit amount in lamports
 * 1,000,000 lamports = 0.001 SOL
 */
export const MIN_DEPOSIT_LAMPORTS = 1_000_000 as const;

/**
 * Maximum deposit amount in lamports
 * 1,000,000,000 lamports = 1 SOL
 */
export const MAX_DEPOSIT_LAMPORTS = 1_000_000_000 as const;

/**
 * Minimum deposit in SOL (for display)
 */
export const MIN_DEPOSIT_SOL = MIN_DEPOSIT_LAMPORTS / 1e9;

/**
 * Maximum deposit in SOL (for display)
 */
export const MAX_DEPOSIT_SOL = MAX_DEPOSIT_LAMPORTS / 1e9;

// ============================================================================
// Exposure Configuration
// ============================================================================

/**
 * Minimum exposure percentage
 */
export const MIN_EXPOSURE = 0 as const;

/**
 * Maximum exposure percentage
 */
export const MAX_EXPOSURE = 100 as const;

/**
 * Default exposure for new players
 */
export const DEFAULT_EXPOSURE = 0 as const;

/**
 * Recommended exposure presets
 */
export const EXPOSURE_PRESETS = [0, 25, 50, 75, 100] as const;

// ============================================================================
// Cycle Configuration
// ============================================================================

/**
 * Cycle duration in Solana slots
 * 100 slots ≈ 40 seconds (at ~400ms per slot)
 */
export const CYCLE_DURATION_SLOTS = 100 as const;

/**
 * Exposure change cooldown in Solana slots
 * 10 slots ≈ 4 seconds (at ~400ms per slot)
 */
export const EXPOSURE_COOLDOWN_SLOTS = 10 as const;

/**
 * Approximate slot time in milliseconds
 * Solana targets ~400ms per slot
 */
export const SLOT_TIME_MS = 400 as const;

/**
 * Approximate cycle duration in milliseconds
 */
export const CYCLE_DURATION_MS = CYCLE_DURATION_SLOTS * SLOT_TIME_MS;

/**
 * Approximate exposure cooldown in milliseconds
 */
export const EXPOSURE_COOLDOWN_MS = EXPOSURE_COOLDOWN_SLOTS * SLOT_TIME_MS;

/**
 * Initial cycle number when protocol starts
 */
export const INITIAL_CYCLE_NUMBER = 1 as const;

// ============================================================================
// PDA Seeds
// ============================================================================

/**
 * PDA seeds for program accounts
 */
export const PDA_SEEDS = {
  CONFIG: 'config',
  GAME_STATE: 'game_state',
  CYCLE: 'cycle',
  PLAYER: 'player',
  TREASURY: 'treasury',
  VAULT: 'vault',
} as const;

// ============================================================================
// Account Sizes
// ============================================================================

/**
 * Account sizes in bytes (including 8-byte discriminator)
 */
export const ACCOUNT_SIZES = {
  GLOBAL_CONFIG: 8 + 32 + 2 + 8 + 8 + 1 + 1 + 8 + 8 + 32 + 8 + 8 + 1 + 1, // 127 bytes
  GAME_STATE: 8 + 8 + 8 + 8 + 8 + 8 + 4 + 1 + 8 + 1, // 62 bytes
  CYCLE_STATE: 8 + 8 + 8 + 8 + 8 + 8 + 8 + 8 + 8 + 4 + 4 + 1 + 1, // 82 bytes
  PLAYER_STATE: 8 + 32 + 8 + 8 + 8 + 1 + 8 + 8 + 8 + 8 + 8 + 1 + 8 + 8 + 1, // 123 bytes
  TREASURY_VAULT: 8 + 32 + 8 + 8 + 8 + 8 + 1, // 73 bytes
} as const;

// ============================================================================
// Math Constants
// ============================================================================

/**
 * Basis points denominator (100%)
 */
export const BPS_DENOMINATOR = 10_000 as const;

/**
 * Percentage denominator (100%)
 */
export const PERCENTAGE_DENOMINATOR = 100 as const;

/**
 * Lamports per SOL
 */
export const LAMPORTS_PER_SOL = 1_000_000_000 as const;

/**
 * Precision for fixed-point math
 */
export const PRECISION = 1_000_000 as const;

// ============================================================================
// Anti-Whale & Anti-Sybil Constants
// ============================================================================

/**
 * Anti-whale threshold (percentage of total exposed value)
 * Players above this threshold get diminishing returns
 */
export const ANTI_WHALE_THRESHOLD_PERCENT = 10 as const;

/**
 * Anti-whale penalty factor (applied to excess exposure)
 */
export const ANTI_WHALE_PENALTY_FACTOR = 0.5 as const;

/**
 * Minimum balance for anti-sybil (in lamports)
 * Players below this get reduced score
 */
export const ANTI_SYBIL_MIN_BALANCE = 10_000_000 as const; // 0.01 SOL

// ============================================================================
// Rate Limiting
// ============================================================================

/**
 * Minimum slots between player actions (rate limiting)
 */
export const MIN_ACTION_INTERVAL_SLOTS = 1 as const;

/**
 * Maximum number of cycles a player can claim at once
 */
export const MAX_CLAIM_BATCH_SIZE = 10 as const;

// ============================================================================
// Protocol State
// ============================================================================

/**
 * Protocol pause state
 */
export enum ProtocolState {
  ACTIVE = 'active',
  PAUSED = 'paused',
  EMERGENCY = 'emergency',
}

/**
 * Cycle state
 */
export enum CycleStatus {
  ACTIVE = 'active',
  ENDED = 'ended',
  RESOLVED = 'resolved',
}

/**
 * Player participation state
 */
export enum ParticipationStatus {
  NOT_PARTICIPATING = 'not_participating',
  PARTICIPATING = 'participating',
  PENDING_CLAIM = 'pending_claim',
}

// ============================================================================
// Event Types
// ============================================================================

/**
 * Protocol event types (emitted by smart contract)
 */
export enum EventType {
  CONFIG_INITIALIZED = 'ConfigInitialized',
  PLAYER_REGISTERED = 'PlayerRegistered',
  DEPOSIT = 'Deposit',
  WITHDRAW = 'Withdraw',
  EXPOSURE_CHANGED = 'ExposureChanged',
  CYCLE_RESOLVED = 'CycleResolved',
  REDISTRIBUTION_CLAIMED = 'RedistributionClaimed',
}

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * Protocol configuration
 */
export interface ProtocolConfig {
  authority: string;
  protocolFeeBps: number;
  minDeposit: string;
  maxDeposit: string;
  minExposure: number;
  maxExposure: number;
  cycleDuration: string;
  exposureCooldown: string;
  treasuryVault: string;
  totalFeesCollected: string;
  totalCycles: string;
  paused: boolean;
}

/**
 * Game state
 */
export interface GameState {
  currentCycle: string;
  cycleStartSlot: string;
  cycleEndSlot: string;
  totalValueLocked: string;
  totalExposedValue: string;
  activePlayers: number;
  cycleResolved: boolean;
  lastUpdateSlot: string;
}

/**
 * Cycle state
 */
export interface CycleState {
  cycleNumber: string;
  startSlot: string;
  endSlot: string;
  resolvedSlot: string;
  totalValueLocked: string;
  totalExposedValue: string;
  totalRedistributed: string;
  feesCollected: string;
  participants: number;
  winners: number;
  resolved: boolean;
}

/**
 * Player state
 */
export interface PlayerState {
  player: string;
  totalDeposited: string;
  totalWithdrawn: string;
  balance: string;
  exposure: number;
  exposedValue: string;
  lastExposureChangeSlot: string;
  lastActionSlot: string;
  cyclesParticipated: string;
  totalRedistributed: string;
  participatingInCycle: boolean;
  registeredSlot: string;
  score: string;
}

/**
 * Treasury vault state
 */
export interface TreasuryVault {
  authority: string;
  totalCollected: string;
  totalWithdrawn: string;
  balance: string;
  lastWithdrawalSlot: string;
}

// ============================================================================
// Validation Functions
// ============================================================================

/**
 * Validate deposit amount
 */
export function isValidDepositAmount(lamports: number): boolean {
  return lamports >= MIN_DEPOSIT_LAMPORTS && lamports <= MAX_DEPOSIT_LAMPORTS;
}

/**
 * Validate exposure value
 */
export function isValidExposure(exposure: number): boolean {
  return exposure >= MIN_EXPOSURE && exposure <= MAX_EXPOSURE && Number.isInteger(exposure);
}

/**
 * Validate protocol fee
 */
export function isValidProtocolFee(feeBps: number): boolean {
  return feeBps >= 0 && feeBps <= MAX_PROTOCOL_FEE_BPS && Number.isInteger(feeBps);
}

/**
 * Check if cycle has ended
 */
export function hasCycleEnded(currentSlot: number, cycleEndSlot: number): boolean {
  return currentSlot >= cycleEndSlot;
}

/**
 * Check if exposure cooldown has passed
 */
export function hasCooldownPassed(
  currentSlot: number,
  lastChangeSlot: number,
  cooldownSlots: number = EXPOSURE_COOLDOWN_SLOTS
): boolean {
  return currentSlot >= lastChangeSlot + cooldownSlots;
}

// ============================================================================
// Calculation Functions
// ============================================================================

/**
 * Calculate protocol fee amount
 */
export function calculateProtocolFee(amount: number, feeBps: number = PROTOCOL_FEE_BPS): number {
  return Math.floor((amount * feeBps) / BPS_DENOMINATOR);
}

/**
 * Calculate exposed value
 */
export function calculateExposedValue(balance: number, exposurePercent: number): number {
  return Math.floor((balance * exposurePercent) / PERCENTAGE_DENOMINATOR);
}

/**
 * Calculate cycle progress percentage
 */
export function calculateCycleProgress(
  currentSlot: number,
  startSlot: number,
  endSlot: number
): number {
  if (currentSlot < startSlot) return 0;
  if (currentSlot >= endSlot) return 100;
  
  const elapsed = currentSlot - startSlot;
  const total = endSlot - startSlot;
  return Math.floor((elapsed / total) * 100);
}

/**
 * Calculate remaining slots in cycle
 */
export function calculateRemainingSlots(currentSlot: number, endSlot: number): number {
  return Math.max(0, endSlot - currentSlot);
}

/**
 * Convert lamports to SOL
 */
export function lamportsToSol(lamports: number | string): number {
  const value = typeof lamports === 'string' ? parseFloat(lamports) : lamports;
  return value / LAMPORTS_PER_SOL;
}

/**
 * Convert SOL to lamports
 */
export function solToLamports(sol: number): number {
  return Math.floor(sol * LAMPORTS_PER_SOL);
}

/**
 * Format basis points as percentage
 */
export function bpsToPercent(bps: number): number {
  return bps / 100;
}

/**
 * Convert percentage to basis points
 */
export function percentToBps(percent: number): number {
  return Math.floor(percent * 100);
}

// ============================================================================
// Export All Constants
// ============================================================================

export const PROTOCOL_CONSTANTS = {
  VERSION: PROTOCOL_VERSION,
  PROGRAM_ID: PROTOCOL_INFO.programId,
  
  // Fees
  PROTOCOL_FEE_BPS,
  PROTOCOL_FEE_PERCENT,
  MAX_PROTOCOL_FEE_BPS,
  
  // Deposits
  MIN_DEPOSIT_LAMPORTS,
  MAX_DEPOSIT_LAMPORTS,
  MIN_DEPOSIT_SOL,
  MAX_DEPOSIT_SOL,
  
  // Exposure
  MIN_EXPOSURE,
  MAX_EXPOSURE,
  DEFAULT_EXPOSURE,
  EXPOSURE_PRESETS,
  
  // Cycles
  CYCLE_DURATION_SLOTS,
  EXPOSURE_COOLDOWN_SLOTS,
  SLOT_TIME_MS,
  CYCLE_DURATION_MS,
  EXPOSURE_COOLDOWN_MS,
  INITIAL_CYCLE_NUMBER,
  
  // Math
  BPS_DENOMINATOR,
  PERCENTAGE_DENOMINATOR,
  LAMPORTS_PER_SOL,
  PRECISION,
  
  // Anti-abuse
  ANTI_WHALE_THRESHOLD_PERCENT,
  ANTI_WHALE_PENALTY_FACTOR,
  ANTI_SYBIL_MIN_BALANCE,
  
  // Rate limiting
  MIN_ACTION_INTERVAL_SLOTS,
  MAX_CLAIM_BATCH_SIZE,
  
  // PDAs
  PDA_SEEDS,
  
  // Account sizes
  ACCOUNT_SIZES,
} as const;

export default PROTOCOL_CONSTANTS;

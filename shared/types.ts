/**
 * Swarm Arena Shared Types
 * 
 * This file defines all shared types used across:
 * - Smart contract (Rust/Anchor)
 * - Backend (Node.js/TypeScript)
 * - Frontend (Next.js/TypeScript)
 * - Tests (TypeScript)
 */

// ============================================================================
// Core Protocol Types
// ============================================================================

/**
 * Player state (on-chain account)
 */
export interface Player {
  /** Player wallet address */
  wallet: string;
  /** Total deposited amount (lifetime) in lamports */
  totalDeposited: string;
  /** Total withdrawn amount (lifetime) in lamports */
  totalWithdrawn: string;
  /** Current balance in vault (lamports) */
  balance: string;
  /** Current exposure percentage (0-100) */
  exposure: number;
  /** Exposed value (balance * exposure / 100) in lamports */
  exposedValue: string;
  /** Last exposure change slot */
  lastExposureChangeSlot: string;
  /** Last action slot (for rate limiting) */
  lastActionSlot: string;
  /** Total cycles participated */
  cyclesParticipated: string;
  /** Total redistributed amount received (can be negative) */
  totalRedistributed: string;
  /** Current cycle participation flag */
  participatingInCycle: boolean;
  /** Registration slot */
  registeredSlot: string;
  /** Player rank/score (for leaderboard) */
  score: string;
  /** Registration timestamp (ISO string) */
  registeredAt?: string;
  /** Last action timestamp (ISO string) */
  lastActionAt?: string;
}

/**
 * Game state (on-chain account)
 */
export interface GameState {
  /** Current cycle number */
  currentCycle: string;
  /** Cycle start slot */
  cycleStartSlot: string;
  /** Cycle end slot */
  cycleEndSlot: string;
  /** Total value locked in current cycle (lamports) */
  totalValueLocked: string;
  /** Total exposed value in current cycle (lamports) */
  totalExposedValue: string;
  /** Number of active players */
  activePlayers: number;
  /** Cycle resolved flag */
  cycleResolved: boolean;
  /** Last update slot */
  lastUpdateSlot: string;
}

/**
 * Cycle state (on-chain account)
 */
export interface CycleState {
  /** Cycle number */
  cycleNumber: string;
  /** Start slot */
  startSlot: string;
  /** End slot */
  endSlot: string;
  /** Resolution slot */
  resolvedSlot: string;
  /** Total value locked at resolution (lamports) */
  totalValueLocked: string;
  /** Total exposed value at resolution (lamports) */
  totalExposedValue: string;
  /** Total redistributed amount (lamports) */
  totalRedistributed: string;
  /** Protocol fees collected (lamports) */
  feesCollected: string;
  /** Number of participants */
  participants: number;
  /** Number of winners (players with positive redistribution) */
  winners: number;
  /** Resolved flag */
  resolved: boolean;
  /** Resolution timestamp (ISO string) */
  resolvedAt?: string;
}

/**
 * Global configuration (on-chain account)
 */
export interface GlobalConfig {
  /** Protocol authority (admin) */
  authority: string;
  /** Protocol fee in basis points (200 = 2%) */
  protocolFeeBps: number;
  /** Minimum deposit amount in lamports */
  minDeposit: string;
  /** Maximum deposit amount in lamports */
  maxDeposit: string;
  /** Minimum exposure percentage (0-100) */
  minExposure: number;
  /** Maximum exposure percentage (0-100) */
  maxExposure: number;
  /** Cycle duration in slots */
  cycleDuration: string;
  /** Cooldown period for exposure changes in slots */
  exposureCooldown: string;
  /** Treasury vault for protocol fees */
  treasuryVault: string;
  /** Total fees collected */
  totalFeesCollected: string;
  /** Total cycles resolved */
  totalCycles: string;
  /** Protocol paused flag */
  paused: boolean;
}

/**
 * Treasury vault (on-chain account)
 */
export interface TreasuryVault {
  /** Authority (GlobalConfig) */
  authority: string;
  /** Total fees collected (lamports) */
  totalCollected: string;
  /** Total fees withdrawn (lamports) */
  totalWithdrawn: string;
  /** Current balance (lamports) */
  balance: string;
  /** Last withdrawal slot */
  lastWithdrawalSlot: string;
}

// ============================================================================
// Activity & Event Types
// ============================================================================

/**
 * Activity event types
 */
export type ActivityType = 
  | 'deposit'
  | 'withdraw'
  | 'exposure'
  | 'cycle'
  | 'redistribution'
  | 'register';

/**
 * Activity event
 */
export interface ActivityEvent {
  /** Unique event ID */
  id: string;
  /** Event type */
  type: ActivityType;
  /** Player wallet address (if applicable) */
  wallet?: string;
  /** Amount in lamports (for deposit/withdraw/redistribution) */
  amount?: string;
  /** Exposure percentage (for exposure events) */
  exposure?: number;
  /** Previous exposure (for exposure events) */
  previousExposure?: number;
  /** Cycle number (for cycle/redistribution events) */
  cycleNumber?: number;
  /** Event timestamp (ISO string) */
  timestamp: string;
  /** Transaction signature */
  signature?: string;
  /** Slot number */
  slot?: string;
  /** Additional metadata */
  metadata?: Record<string, any>;
}

/**
 * Deposit event
 */
export interface DepositEvent extends ActivityEvent {
  type: 'deposit';
  wallet: string;
  amount: string;
  /** New balance after deposit */
  newBalance: string;
}

/**
 * Withdraw event
 */
export interface WithdrawEvent extends ActivityEvent {
  type: 'withdraw';
  wallet: string;
  amount: string;
  /** New balance after withdrawal */
  newBalance: string;
}

/**
 * Exposure update event
 */
export interface ExposureUpdateEvent extends ActivityEvent {
  type: 'exposure';
  wallet: string;
  exposure: number;
  previousExposure: number;
  /** New exposed value */
  exposedValue: string;
}

/**
 * Cycle resolved event
 */
export interface CycleResolvedEvent extends ActivityEvent {
  type: 'cycle';
  cycleNumber: number;
  /** Total redistributed in cycle */
  totalRedistributed: string;
  /** Fees collected in cycle */
  feesCollected: string;
  /** Number of participants */
  participants: number;
  /** Number of winners */
  winners: number;
}

/**
 * Redistribution claimed event
 */
export interface RedistributionClaimedEvent extends ActivityEvent {
  type: 'redistribution';
  wallet: string;
  cycleNumber: number;
  amount: string;
  /** Whether amount is positive (win) or negative (loss) */
  isWin: boolean;
}

/**
 * Player registered event
 */
export interface PlayerRegisteredEvent extends ActivityEvent {
  type: 'register';
  wallet: string;
}

// ============================================================================
// Leaderboard Types
// ============================================================================

/**
 * Leaderboard entry
 */
export interface LeaderboardEntry {
  /** Player rank (1-indexed) */
  rank: number;
  /** Player wallet address */
  wallet: string;
  /** Player score */
  score: string;
  /** Player balance (lamports) */
  balance: string;
  /** Total redistributed (can be negative) */
  totalRedistributed: string;
  /** Cycles participated */
  cyclesParticipated: number;
  /** Current exposure percentage */
  exposure: number;
  /** Participating in current cycle */
  participatingInCycle: boolean;
  /** Rank change from previous period */
  rankChange?: number;
}

/**
 * Leaderboard sort options
 */
export type LeaderboardSortBy = 
  | 'score'
  | 'balance'
  | 'cycles'
  | 'totalRedistributed';

/**
 * Leaderboard period filter
 */
export type LeaderboardPeriod = 
  | 'all'
  | '30d'
  | '7d'
  | '24h';

// ============================================================================
// Statistics Types
// ============================================================================

/**
 * Global protocol statistics
 */
export interface GlobalStats {
  /** Total number of registered players */
  totalPlayers: number;
  /** Number of active players (participating in current cycle) */
  activePlayers: number;
  /** Total value locked (lamports) */
  totalValueLocked: string;
  /** Total exposed value (lamports) */
  totalExposedValue: string;
  /** Total cycles resolved */
  totalCycles: number;
  /** Total fees collected (lamports) */
  totalFeesCollected: string;
  /** Total redistributed across all cycles (lamports) */
  totalRedistributed: string;
  /** Average exposure percentage */
  averageExposure?: number;
  /** Current cycle number */
  currentCycle?: number;
}

/**
 * Player statistics
 */
export interface PlayerStats {
  /** Player wallet */
  wallet: string;
  /** Total profit/loss (lamports) */
  totalPnL: string;
  /** Win rate (percentage) */
  winRate: number;
  /** Total cycles won */
  cyclesWon: number;
  /** Total cycles lost */
  cyclesLost: number;
  /** Average exposure */
  averageExposure: number;
  /** Highest single win (lamports) */
  highestWin: string;
  /** Highest single loss (lamports) */
  highestLoss: string;
  /** Total volume (deposits + withdrawals) */
  totalVolume: string;
}

/**
 * Cycle statistics
 */
export interface CycleStats {
  /** Cycle number */
  cycleNumber: number;
  /** Total participants */
  participants: number;
  /** Total winners */
  winners: number;
  /** Total losers */
  losers: number;
  /** Average exposure */
  averageExposure: number;
  /** Total value locked */
  totalValueLocked: string;
  /** Total redistributed */
  totalRedistributed: string;
  /** Fees collected */
  feesCollected: string;
  /** Duration in slots */
  duration: number;
}

// ============================================================================
// API Response Types
// ============================================================================

/**
 * Standard API response wrapper
 */
export interface ApiResponse<T> {
  /** Success flag */
  success: boolean;
  /** Response data */
  data: T;
  /** Error message (if success is false) */
  error?: string;
  /** Error code (if success is false) */
  code?: string;
}

/**
 * Pagination metadata
 */
export interface PaginationMeta {
  /** Items per page */
  limit: number;
  /** Offset from start */
  offset: number;
  /** Total items available */
  total: number;
  /** Whether more items exist */
  hasMore: boolean;
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> {
  /** Array of items */
  data: T[];
  /** Pagination metadata */
  pagination: PaginationMeta;
}

// ============================================================================
// Transaction Types
// ============================================================================

/**
 * Transaction status
 */
export type TransactionStatus = 
  | 'pending'
  | 'confirmed'
  | 'finalized'
  | 'failed';

/**
 * Transaction result
 */
export interface TransactionResult {
  /** Transaction signature */
  signature: string;
  /** Transaction status */
  status: TransactionStatus;
  /** Slot number */
  slot?: number;
  /** Block time (Unix timestamp) */
  blockTime?: number;
  /** Error message (if failed) */
  error?: string;
}

// ============================================================================
// UI State Types
// ============================================================================

/**
 * Loading state
 */
export type LoadingState = 
  | 'idle'
  | 'loading'
  | 'success'
  | 'error';

/**
 * Async data wrapper
 */
export interface AsyncData<T> {
  /** Data value */
  data: T | null;
  /** Loading state */
  state: LoadingState;
  /** Error message */
  error: string | null;
  /** Last updated timestamp */
  lastUpdated: number | null;
}

/**
 * Player UI state
 */
export interface PlayerUIState {
  /** Player data */
  player: Player | null;
  /** Loading state */
  loading: boolean;
  /** Error message */
  error: string | null;
  /** Pending transaction */
  pendingTx: string | null;
}

/**
 * Game UI state
 */
export interface GameUIState {
  /** Game state */
  gameState: GameState | null;
  /** Current cycle */
  currentCycle: CycleState | null;
  /** Loading state */
  loading: boolean;
  /** Error message */
  error: string | null;
}

// ============================================================================
// Filter & Query Types
// ============================================================================

/**
 * Activity filter options
 */
export interface ActivityFilter {
  /** Filter by type */
  type?: ActivityType;
  /** Filter by wallet */
  wallet?: string;
  /** Filter by cycle */
  cycleNumber?: number;
  /** Start date (ISO string) */
  startDate?: string;
  /** End date (ISO string) */
  endDate?: string;
  /** Pagination limit */
  limit?: number;
  /** Pagination offset */
  offset?: number;
}

/**
 * Leaderboard query options
 */
export interface LeaderboardQuery {
  /** Sort field */
  sortBy?: LeaderboardSortBy;
  /** Time period */
  period?: LeaderboardPeriod;
  /** Pagination limit */
  limit?: number;
  /** Pagination offset */
  offset?: number;
}

/**
 * Player query options
 */
export interface PlayerQuery {
  /** Player wallet address */
  wallet: string;
  /** Include activity history */
  includeActivity?: boolean;
  /** Include cycle history */
  includeCycles?: boolean;
}

// ============================================================================
// Validation Types
// ============================================================================

/**
 * Validation result
 */
export interface ValidationResult {
  /** Whether validation passed */
  valid: boolean;
  /** Error message (if invalid) */
  error?: string;
  /** Field name (if applicable) */
  field?: string;
}

/**
 * Deposit validation
 */
export interface DepositValidation extends ValidationResult {
  /** Validated amount in lamports */
  amount?: number;
}

/**
 * Exposure validation
 */
export interface ExposureValidation extends ValidationResult {
  /** Validated exposure percentage */
  exposure?: number;
  /** Whether cooldown has passed */
  cooldownPassed?: boolean;
}

// ============================================================================
// Utility Types
// ============================================================================

/**
 * Make all properties optional recursively
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Make all properties required recursively
 */
export type DeepRequired<T> = {
  [P in keyof T]-?: T[P] extends object ? DeepRequired<T[P]> : T[P];
};

/**
 * Extract keys of type T that have value type V
 */
export type KeysOfType<T, V> = {
  [K in keyof T]: T[K] extends V ? K : never;
}[keyof T];

/**
 * Timestamp (Unix timestamp in seconds or ISO string)
 */
export type Timestamp = number | string;

/**
 * Lamports amount (as string to avoid precision loss)
 */
export type Lamports = string;

/**
 * SOL amount (as number for display)
 */
export type Sol = number;

/**
 * Wallet address (base58 encoded public key)
 */
export type WalletAddress = string;

/**
 * Transaction signature (base58 encoded)
 */
export type TransactionSignature = string;

/**
 * Slot number
 */
export type Slot = number | string;

// ============================================================================
// Type Guards
// ============================================================================

/**
 * Check if value is a valid activity type
 */
export function isActivityType(value: any): value is ActivityType {
  return ['deposit', 'withdraw', 'exposure', 'cycle', 'redistribution', 'register'].includes(value);
}

/**
 * Check if value is a valid leaderboard sort option
 */
export function isLeaderboardSortBy(value: any): value is LeaderboardSortBy {
  return ['score', 'balance', 'cycles', 'totalRedistributed'].includes(value);
}

/**
 * Check if value is a valid transaction status
 */
export function isTransactionStatus(value: any): value is TransactionStatus {
  return ['pending', 'confirmed', 'finalized', 'failed'].includes(value);
}

/**
 * Check if event is a deposit event
 */
export function isDepositEvent(event: ActivityEvent): event is DepositEvent {
  return event.type === 'deposit';
}

/**
 * Check if event is a withdraw event
 */
export function isWithdrawEvent(event: ActivityEvent): event is WithdrawEvent {
  return event.type === 'withdraw';
}

/**
 * Check if event is an exposure update event
 */
export function isExposureUpdateEvent(event: ActivityEvent): event is ExposureUpdateEvent {
  return event.type === 'exposure';
}

/**
 * Check if event is a cycle resolved event
 */
export function isCycleResolvedEvent(event: ActivityEvent): event is CycleResolvedEvent {
  return event.type === 'cycle';
}

/**
 * Check if event is a redistribution claimed event
 */
export function isRedistributionClaimedEvent(event: ActivityEvent): event is RedistributionClaimedEvent {
  return event.type === 'redistribution';
}

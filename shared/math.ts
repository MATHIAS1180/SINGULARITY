/**
 * Swarm Arena Math Module
 * 
 * This module replicates the math functions from the Rust smart contract.
 * All calculations use integer arithmetic with fixed-point scaling to match
 * the on-chain behavior exactly.
 * 
 * CRITICAL: Keep this in sync with programs/swarm-arena/src/math.rs
 */

import {
  BPS_DENOMINATOR,
  PERCENTAGE_DENOMINATOR,
  PROTOCOL_FEE_BPS,
} from './protocol';

// ============================================================================
// Scaling Constants
// ============================================================================

/**
 * Basis points scale (10000 = 100%)
 */
export const BPS_SCALE = 10_000;

/**
 * Exposure scale (100 = 100%)
 */
export const EXPOSURE_SCALE = 100;

/**
 * Weight scale for normalized weights (precision)
 */
export const WEIGHT_SCALE = 1_000_000;

// ============================================================================
// Anti-Whale Constants
// ============================================================================

/**
 * Whale threshold in basis points (2000 = 20% of total pool)
 */
export const WHALE_THRESHOLD_BPS = 2000;

/**
 * Whale penalty in basis points (5000 = 50% penalty on excess)
 */
export const WHALE_PENALTY_BPS = 5000;

// ============================================================================
// Anti-Sybil Constants
// ============================================================================

/**
 * Minimum meaningful balance in lamports (0.001 SOL)
 */
export const MIN_MEANINGFUL_BALANCE = 1_000_000;

// ============================================================================
// Error Handling
// ============================================================================

export class MathError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MathError';
  }
}

/**
 * Safe integer multiplication with overflow check
 */
function safeMul(a: number, b: number): number {
  const result = a * b;
  if (!Number.isSafeInteger(result)) {
    throw new MathError('Arithmetic overflow in multiplication');
  }
  return result;
}

/**
 * Safe integer division with zero check
 */
function safeDiv(a: number, b: number): number {
  if (b === 0) {
    throw new MathError('Division by zero');
  }
  return Math.floor(a / b);
}

/**
 * Safe integer subtraction with underflow check
 */
function safeSub(a: number, b: number): number {
  const result = a - b;
  if (result < 0 && a >= 0 && b >= 0) {
    throw new MathError('Arithmetic underflow in subtraction');
  }
  return result;
}

// ============================================================================
// Fee Calculation
// ============================================================================

/**
 * Calculate protocol fee amount
 * Returns [feeAmount, amountAfterFee]
 * 
 * @param amount - Total amount in lamports
 * @param feeBps - Fee in basis points (200 = 2%)
 * @returns Tuple of [fee, amountAfterFee]
 */
export function calculateFee(
  amount: number,
  feeBps: number = PROTOCOL_FEE_BPS
): [number, number] {
  if (feeBps > BPS_SCALE) {
    throw new MathError('Invalid fee rate');
  }

  const fee = safeDiv(safeMul(amount, feeBps), BPS_SCALE);
  const afterFee = safeSub(amount, fee);

  return [fee, afterFee];
}

// ============================================================================
// Exposure Calculations
// ============================================================================

/**
 * Calculate exposed value from balance and exposure percentage
 * 
 * @param balance - Player balance in lamports
 * @param exposure - Exposure percentage (0-100)
 * @returns Exposed value in lamports
 */
export function calculateExposedValue(balance: number, exposure: number): number {
  if (exposure < 0 || exposure > 100) {
    throw new MathError('Exposure out of range');
  }

  return safeDiv(safeMul(balance, exposure), EXPOSURE_SCALE);
}

/**
 * Calculate exposure score (exposure weighted by balance)
 * Higher exposure = higher risk = higher potential reward
 * Uses quadratic scaling: score = balance * (exposure^2) / 10000
 * 
 * @param balance - Player balance in lamports
 * @param exposure - Exposure percentage (0-100)
 * @returns Exposure score
 */
export function scoreExposure(balance: number, exposure: number): number {
  if (exposure < 0 || exposure > 100) {
    throw new MathError('Exposure out of range');
  }

  const exposureSquared = safeMul(exposure, exposure);
  return safeDiv(safeMul(balance, exposureSquared), EXPOSURE_SCALE * EXPOSURE_SCALE);
}

// ============================================================================
// Weight Calculations
// ============================================================================

/**
 * Normalize balance to weight in the pool
 * Returns weight scaled by WEIGHT_SCALE for precision
 * 
 * @param playerExposed - Player's exposed value
 * @param totalExposed - Total exposed value in pool
 * @returns Normalized weight (scaled by WEIGHT_SCALE)
 */
export function normalizedWeight(playerExposed: number, totalExposed: number): number {
  if (totalExposed <= 0) {
    throw new MathError('Invalid pool value');
  }

  return safeDiv(safeMul(playerExposed, WEIGHT_SCALE), totalExposed);
}

/**
 * Calculate target weight with anti-whale adjustment
 * Penalizes players who control too much of the pool (>20%)
 * 
 * @param playerExposed - Player's exposed value
 * @param totalExposed - Total exposed value in pool
 * @returns Adjusted weight (scaled by WEIGHT_SCALE)
 */
export function targetWeightWithAntiWhale(
  playerExposed: number,
  totalExposed: number
): number {
  const baseWeight = normalizedWeight(playerExposed, totalExposed);

  // Check if player is a whale (>20% of pool)
  const whaleThreshold = safeDiv(safeMul(WEIGHT_SCALE, WHALE_THRESHOLD_BPS), BPS_SCALE);

  if (baseWeight <= whaleThreshold) {
    return baseWeight;
  }

  // Apply penalty to excess weight
  const excess = safeSub(baseWeight, whaleThreshold);
  const penalty = safeDiv(safeMul(excess, WHALE_PENALTY_BPS), BPS_SCALE);
  const adjustedWeight = safeSub(baseWeight, penalty);

  return adjustedWeight;
}

// ============================================================================
// Penalty Calculations
// ============================================================================

/**
 * Calculate penalty factor for a player based on exposure
 * Lower exposure = higher penalty (less reward)
 * Returns penalty in basis points (10000 = 100% penalty, 0 = no penalty)
 * 
 * @param exposure - Exposure percentage (0-100)
 * @returns Penalty in basis points
 */
export function penaltyFactor(exposure: number): number {
  if (exposure < 0 || exposure > 100) {
    throw new MathError('Exposure out of range');
  }

  // Linear penalty: 0% exposure = 100% penalty, 100% exposure = 0% penalty
  // penalty_bps = (100 - exposure) * 100
  return safeMul(safeSub(100, exposure), 100);
}

// ============================================================================
// Redistribution Calculations
// ============================================================================

/**
 * Calculate redistribution share for a player
 * This is the core redistribution logic
 * 
 * @param playerExposed - Player's exposed value
 * @param playerExposure - Player's exposure percentage
 * @param totalExposed - Total exposed value in pool
 * @param totalPoolAfterFee - Total pool after protocol fee
 * @returns Redistribution amount (can be negative for loss, positive for gain)
 */
export function calculateRedistributionShare(
  playerExposed: number,
  playerExposure: number,
  totalExposed: number,
  totalPoolAfterFee: number
): number {
  if (totalExposed <= 0) {
    throw new MathError('Invalid pool value');
  }
  if (playerExposure < 0 || playerExposure > 100) {
    throw new MathError('Exposure out of range');
  }

  // Calculate player's weight with anti-whale adjustment
  const playerWeight = targetWeightWithAntiWhale(playerExposed, totalExposed);

  // Calculate expected share based on weight
  const expectedShare = safeDiv(safeMul(totalPoolAfterFee, playerWeight), WEIGHT_SCALE);

  // Calculate actual contribution (what player put in)
  const contribution = playerExposed;

  // Redistribution = expected_share - contribution
  // Can be negative (player loses) or positive (player wins)
  const redistribution = expectedShare - contribution;

  return redistribution;
}

/**
 * Calculate total redistributable pool after fees
 * 
 * @param totalExposed - Total exposed value
 * @param feeBps - Fee in basis points
 * @returns Tuple of [poolAfterFee, fee]
 */
export function calculateRedistributablePool(
  totalExposed: number,
  feeBps: number = PROTOCOL_FEE_BPS
): [number, number] {
  const [fee, afterFee] = calculateFee(totalExposed, feeBps);
  return [afterFee, fee];
}

// ============================================================================
// Anti-Sybil
// ============================================================================

/**
 * Anti-sybil adjustment: filter out dust accounts
 * Returns true if balance is meaningful enough to participate
 * 
 * @param balance - Player balance in lamports
 * @returns True if balance is meaningful
 */
export function isMeaningfulBalance(balance: number): boolean {
  return balance >= MIN_MEANINGFUL_BALANCE;
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Clamp value between min and max
 * 
 * @param value - Value to clamp
 * @param min - Minimum value
 * @param max - Maximum value
 * @returns Clamped value
 */
export function clampU64(value: number, min: number, max: number): number {
  if (value < min) return min;
  if (value > max) return max;
  return value;
}

/**
 * Clamp exposure between min and max
 * 
 * @param exposure - Exposure to clamp
 * @param min - Minimum exposure
 * @param max - Maximum exposure
 * @returns Clamped exposure
 */
export function clampExposure(exposure: number, min: number, max: number): number {
  if (exposure < min) return min;
  if (exposure > max) return max;
  return Math.floor(exposure);
}

/**
 * Verify redistribution math integrity
 * Sum of all redistributions should equal zero (closed system)
 * 
 * @param redistributions - Array of redistribution amounts
 * @returns True if sum equals zero
 */
export function verifyRedistributionSum(redistributions: number[]): boolean {
  const sum = redistributions.reduce((acc, val) => acc + val, 0);
  return Math.abs(sum) < 1; // Allow for rounding errors
}

// ============================================================================
// Display & Preview Functions
// ============================================================================

/**
 * Calculate expected redistribution for preview (UI helper)
 * Shows what a player might win/lose in current cycle
 * 
 * @param playerBalance - Player's balance
 * @param playerExposure - Player's exposure percentage
 * @param totalExposed - Total exposed in pool
 * @param totalPlayers - Number of active players
 * @returns Estimated redistribution
 */
export function previewRedistribution(
  playerBalance: number,
  playerExposure: number,
  totalExposed: number,
  totalPlayers: number
): number {
  if (playerExposure === 0 || totalExposed === 0) {
    return 0;
  }

  const playerExposed = calculateExposedValue(playerBalance, playerExposure);
  const [poolAfterFee] = calculateRedistributablePool(totalExposed);

  try {
    return calculateRedistributionShare(
      playerExposed,
      playerExposure,
      totalExposed,
      poolAfterFee
    );
  } catch {
    return 0;
  }
}

/**
 * Calculate player's share percentage of the pool
 * 
 * @param playerExposed - Player's exposed value
 * @param totalExposed - Total exposed value
 * @returns Share percentage (0-100)
 */
export function calculateSharePercentage(
  playerExposed: number,
  totalExposed: number
): number {
  if (totalExposed === 0) return 0;

  const weight = normalizedWeight(playerExposed, totalExposed);
  return (weight / WEIGHT_SCALE) * 100;
}

/**
 * Check if player is a whale (>20% of pool)
 * 
 * @param playerExposed - Player's exposed value
 * @param totalExposed - Total exposed value
 * @returns True if player is a whale
 */
export function isWhale(playerExposed: number, totalExposed: number): boolean {
  if (totalExposed === 0) return false;

  const sharePercentage = calculateSharePercentage(playerExposed, totalExposed);
  return sharePercentage > 20;
}

/**
 * Calculate effective exposure after anti-whale penalty
 * 
 * @param playerExposed - Player's exposed value
 * @param totalExposed - Total exposed value
 * @returns Effective exposure percentage
 */
export function effectiveExposureAfterPenalty(
  playerExposed: number,
  totalExposed: number
): number {
  if (totalExposed === 0) return 0;

  const adjustedWeight = targetWeightWithAntiWhale(playerExposed, totalExposed);
  return (adjustedWeight / WEIGHT_SCALE) * 100;
}

/**
 * Calculate risk-adjusted score for leaderboard
 * Combines balance, exposure, and participation
 * 
 * @param balance - Player balance
 * @param exposure - Player exposure
 * @param cyclesParticipated - Number of cycles participated
 * @returns Risk-adjusted score
 */
export function calculateRiskAdjustedScore(
  balance: number,
  exposure: number,
  cyclesParticipated: number
): number {
  const baseScore = scoreExposure(balance, exposure);
  const participationBonus = Math.min(cyclesParticipated * 1000, 100_000);
  return baseScore + participationBonus;
}

/**
 * Format redistribution for display
 * 
 * @param redistribution - Redistribution amount in lamports
 * @returns Formatted string with sign
 */
export function formatRedistribution(redistribution: number): string {
  const sol = redistribution / 1e9;
  const sign = redistribution >= 0 ? '+' : '';
  return `${sign}${sol.toFixed(4)} SOL`;
}

/**
 * Calculate break-even exposure
 * The exposure level where expected value equals contribution
 * 
 * @param playerBalance - Player balance
 * @param totalExposed - Total exposed in pool
 * @param avgExposure - Average exposure of other players
 * @returns Break-even exposure percentage
 */
export function calculateBreakEvenExposure(
  playerBalance: number,
  totalExposed: number,
  avgExposure: number
): number {
  // Simplified calculation for UI preview
  // In reality, this depends on all players' exposures
  if (totalExposed === 0) return 0;

  const playerShare = playerBalance / (totalExposed + playerBalance);
  const breakEven = avgExposure * (1 - playerShare);

  return clampExposure(breakEven, 0, 100);
}

// ============================================================================
// Validation Functions
// ============================================================================

/**
 * Validate all math inputs for a redistribution calculation
 * 
 * @param playerExposed - Player's exposed value
 * @param playerExposure - Player's exposure percentage
 * @param totalExposed - Total exposed value
 * @param totalPoolAfterFee - Total pool after fee
 * @returns True if all inputs are valid
 */
export function validateRedistributionInputs(
  playerExposed: number,
  playerExposure: number,
  totalExposed: number,
  totalPoolAfterFee: number
): boolean {
  try {
    if (playerExposure < 0 || playerExposure > 100) return false;
    if (totalExposed <= 0) return false;
    if (totalPoolAfterFee < 0) return false;
    if (playerExposed < 0) return false;
    if (playerExposed > totalExposed) return false;
    return true;
  } catch {
    return false;
  }
}

// ============================================================================
// Export All
// ============================================================================

export default {
  // Constants
  BPS_SCALE,
  EXPOSURE_SCALE,
  WEIGHT_SCALE,
  WHALE_THRESHOLD_BPS,
  WHALE_PENALTY_BPS,
  MIN_MEANINGFUL_BALANCE,

  // Core functions
  calculateFee,
  calculateExposedValue,
  scoreExposure,
  normalizedWeight,
  targetWeightWithAntiWhale,
  penaltyFactor,
  calculateRedistributionShare,
  calculateRedistributablePool,

  // Utility functions
  isMeaningfulBalance,
  clampU64,
  clampExposure,
  verifyRedistributionSum,

  // Display functions
  previewRedistribution,
  calculateSharePercentage,
  isWhale,
  effectiveExposureAfterPenalty,
  calculateRiskAdjustedScore,
  formatRedistribution,
  calculateBreakEvenExposure,

  // Validation
  validateRedistributionInputs,
};

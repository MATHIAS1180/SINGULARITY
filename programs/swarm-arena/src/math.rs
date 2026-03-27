use anchor_lang::prelude::*;

/// Scaling constants for fixed-point arithmetic
/// Using basis points (10000 = 100%) for precision without floats
pub const BPS_SCALE: u64 = 10_000;
pub const EXPOSURE_SCALE: u64 = 100;
pub const WEIGHT_SCALE: u64 = 1_000_000; // For normalized weights

/// Protocol fee in basis points (200 = 2%)
pub const PROTOCOL_FEE_BPS: u64 = 200;

/// Anti-whale constants
pub const WHALE_THRESHOLD_BPS: u64 = 2000; // 20% of total pool
pub const WHALE_PENALTY_BPS: u64 = 5000; // 50% penalty on excess

/// Anti-sybil constants
pub const MIN_MEANINGFUL_BALANCE: u64 = 1_000_000; // 0.001 SOL in lamports

/// Calculate protocol fee amount
/// Returns (fee_amount, amount_after_fee)
pub fn calculate_fee(amount: u64, fee_bps: u64) -> Result<(u64, u64)> {
    require!(fee_bps <= BPS_SCALE, ErrorCode::InvalidFeeRate);
    
    let fee = amount
        .checked_mul(fee_bps)
        .ok_or(ErrorCode::ArithmeticOverflow)?
        .checked_div(BPS_SCALE)
        .ok_or(ErrorCode::DivisionByZero)?;
    
    let after_fee = amount
        .checked_sub(fee)
        .ok_or(ErrorCode::ArithmeticUnderflow)?;
    
    Ok((fee, after_fee))
}

/// Calculate exposed value from balance and exposure percentage
pub fn calculate_exposed_value(balance: u64, exposure: u8) -> Result<u64> {
    require!(exposure <= 100, ErrorCode::ExposureOutOfRange);
    
    let exposed = balance
        .checked_mul(exposure as u64)
        .ok_or(ErrorCode::ArithmeticOverflow)?
        .checked_div(EXPOSURE_SCALE)
        .ok_or(ErrorCode::DivisionByZero)?;
    
    Ok(exposed)
}

/// Calculate exposure score (exposure weighted by balance)
/// Higher exposure = higher risk = higher potential reward
pub fn score_exposure(balance: u64, exposure: u8) -> Result<u64> {
    require!(exposure <= 100, ErrorCode::ExposureOutOfRange);
    
    // Score = balance * (exposure^2) / 10000
    // Quadratic scaling rewards higher exposure
    let exposure_squared = (exposure as u64)
        .checked_mul(exposure as u64)
        .ok_or(ErrorCode::ArithmeticOverflow)?;
    
    let score = balance
        .checked_mul(exposure_squared)
        .ok_or(ErrorCode::ArithmeticOverflow)?
        .checked_div(EXPOSURE_SCALE * EXPOSURE_SCALE)
        .ok_or(ErrorCode::DivisionByZero)?;
    
    Ok(score)
}

/// Normalize balance to weight in the pool
/// Returns weight scaled by WEIGHT_SCALE for precision
pub fn normalized_weight(
    player_exposed: u64,
    total_exposed: u64,
) -> Result<u64> {
    require!(total_exposed > 0, ErrorCode::InvalidPoolValue);
    
    let weight = player_exposed
        .checked_mul(WEIGHT_SCALE)
        .ok_or(ErrorCode::ArithmeticOverflow)?
        .checked_div(total_exposed)
        .ok_or(ErrorCode::DivisionByZero)?;
    
    Ok(weight)
}

/// Calculate target weight with anti-whale adjustment
/// Penalizes players who control too much of the pool
pub fn target_weight_with_anti_whale(
    player_exposed: u64,
    total_exposed: u64,
) -> Result<u64> {
    let base_weight = normalized_weight(player_exposed, total_exposed)?;
    
    // Check if player is a whale (>20% of pool)
    let whale_threshold = WEIGHT_SCALE
        .checked_mul(WHALE_THRESHOLD_BPS)
        .ok_or(ErrorCode::ArithmeticOverflow)?
        .checked_div(BPS_SCALE)
        .ok_or(ErrorCode::DivisionByZero)?;
    
    if base_weight <= whale_threshold {
        return Ok(base_weight);
    }
    
    // Apply penalty to excess weight
    let excess = base_weight
        .checked_sub(whale_threshold)
        .ok_or(ErrorCode::ArithmeticUnderflow)?;
    
    let penalty = excess
        .checked_mul(WHALE_PENALTY_BPS)
        .ok_or(ErrorCode::ArithmeticOverflow)?
        .checked_div(BPS_SCALE)
        .ok_or(ErrorCode::DivisionByZero)?;
    
    let adjusted_weight = base_weight
        .checked_sub(penalty)
        .ok_or(ErrorCode::ArithmeticUnderflow)?;
    
    Ok(adjusted_weight)
}

/// Calculate penalty factor for a player based on exposure
/// Lower exposure = higher penalty (less reward)
/// Returns penalty in basis points (10000 = no penalty)
pub fn penalty_factor(exposure: u8) -> Result<u64> {
    require!(exposure <= 100, ErrorCode::ExposureOutOfRange);
    
    // Linear penalty: 0% exposure = 100% penalty, 100% exposure = 0% penalty
    // penalty_bps = (100 - exposure) * 100
    let penalty_bps = (100u64)
        .checked_sub(exposure as u64)
        .ok_or(ErrorCode::ArithmeticUnderflow)?
        .checked_mul(100)
        .ok_or(ErrorCode::ArithmeticOverflow)?;
    
    Ok(penalty_bps)
}

/// Calculate redistribution share for a player
/// This is the core redistribution logic
pub fn calculate_redistribution_share(
    player_exposed: u64,
    player_exposure: u8,
    total_exposed: u64,
    total_pool_after_fee: u64,
) -> Result<i64> {
    require!(total_exposed > 0, ErrorCode::InvalidPoolValue);
    require!(player_exposure <= 100, ErrorCode::ExposureOutOfRange);
    
    // Calculate player's weight with anti-whale adjustment
    let player_weight = target_weight_with_anti_whale(player_exposed, total_exposed)?;
    
    // Calculate expected share based on weight
    let expected_share = total_pool_after_fee
        .checked_mul(player_weight)
        .ok_or(ErrorCode::ArithmeticOverflow)?
        .checked_div(WEIGHT_SCALE)
        .ok_or(ErrorCode::DivisionByZero)?;
    
    // Calculate actual contribution (what player put in)
    let contribution = player_exposed;
    
    // Redistribution = expected_share - contribution
    // Can be negative (player loses) or positive (player wins)
    let redistribution = (expected_share as i64)
        .checked_sub(contribution as i64)
        .ok_or(ErrorCode::ArithmeticOverflow)?;
    
    Ok(redistribution)
}

/// Anti-sybil adjustment: filter out dust accounts
/// Returns true if balance is meaningful enough to participate
pub fn is_meaningful_balance(balance: u64) -> bool {
    balance >= MIN_MEANINGFUL_BALANCE
}

/// Clamp value between min and max
pub fn clamp_u64(value: u64, min: u64, max: u64) -> u64 {
    if value < min {
        min
    } else if value > max {
        max
    } else {
        value
    }
}

/// Clamp exposure between min and max
pub fn clamp_exposure(exposure: u8, min: u8, max: u8) -> u8 {
    if exposure < min {
        min
    } else if exposure > max {
        max
    } else {
        exposure
    }
}

/// Calculate total redistributable pool after fees
pub fn calculate_redistributable_pool(total_exposed: u64, fee_bps: u64) -> Result<(u64, u64)> {
    let (fee, after_fee) = calculate_fee(total_exposed, fee_bps)?;
    Ok((after_fee, fee))
}

/// Verify redistribution math integrity
/// Sum of all redistributions should equal zero (closed system)
pub fn verify_redistribution_sum(redistributions: &[i64]) -> bool {
    let sum: i64 = redistributions.iter().sum();
    sum == 0
}

#[error_code]
pub enum ErrorCode {
    #[msg("Arithmetic overflow")]
    ArithmeticOverflow,
    #[msg("Arithmetic underflow")]
    ArithmeticUnderflow,
    #[msg("Division by zero")]
    DivisionByZero,
    #[msg("Invalid fee rate")]
    InvalidFeeRate,
    #[msg("Exposure out of range")]
    ExposureOutOfRange,
    #[msg("Invalid pool value")]
    InvalidPoolValue,
}

#[cfg(test)]
mod tests {
    use super::*;

    // ========== Fee Calculation Tests ==========

    #[test]
    fn test_calculate_fee_2_percent() {
        let (fee, after_fee) = calculate_fee(10_000, 200).unwrap();
        assert_eq!(fee, 200); // 2%
        assert_eq!(after_fee, 9_800);
    }

    #[test]
    fn test_calculate_fee_zero() {
        let (fee, after_fee) = calculate_fee(10_000, 0).unwrap();
        assert_eq!(fee, 0);
        assert_eq!(after_fee, 10_000);
    }

    #[test]
    fn test_calculate_fee_100_percent() {
        let (fee, after_fee) = calculate_fee(10_000, 10_000).unwrap();
        assert_eq!(fee, 10_000);
        assert_eq!(after_fee, 0);
    }

    #[test]
    fn test_calculate_fee_large_amount() {
        let (fee, after_fee) = calculate_fee(1_000_000_000, 200).unwrap();
        assert_eq!(fee, 20_000_000); // 2%
        assert_eq!(after_fee, 980_000_000);
    }

    #[test]
    fn test_calculate_fee_invalid_rate() {
        let result = calculate_fee(10_000, 10_001);
        assert!(result.is_err());
    }

    // ========== Exposed Value Tests ==========

    #[test]
    fn test_calculate_exposed_value_50_percent() {
        let exposed = calculate_exposed_value(1_000_000, 50).unwrap();
        assert_eq!(exposed, 500_000); // 50%
    }

    #[test]
    fn test_calculate_exposed_value_zero() {
        let exposed = calculate_exposed_value(1_000_000, 0).unwrap();
        assert_eq!(exposed, 0);
    }

    #[test]
    fn test_calculate_exposed_value_100_percent() {
        let exposed = calculate_exposed_value(1_000_000, 100).unwrap();
        assert_eq!(exposed, 1_000_000);
    }

    #[test]
    fn test_calculate_exposed_value_invalid_exposure() {
        let result = calculate_exposed_value(1_000_000, 101);
        assert!(result.is_err());
    }

    // ========== Score Exposure Tests ==========

    #[test]
    fn test_score_exposure_50_percent() {
        let score = score_exposure(1_000_000, 50).unwrap();
        assert_eq!(score, 250_000); // 1M * 50^2 / 10000
    }

    #[test]
    fn test_score_exposure_zero() {
        let score = score_exposure(1_000_000, 0).unwrap();
        assert_eq!(score, 0);
    }

    #[test]
    fn test_score_exposure_100_percent() {
        let score = score_exposure(1_000_000, 100).unwrap();
        assert_eq!(score, 1_000_000); // 1M * 100^2 / 10000
    }

    #[test]
    fn test_score_exposure_quadratic_scaling() {
        // Verify quadratic scaling: 2x exposure = 4x score
        let score_25 = score_exposure(1_000_000, 25).unwrap();
        let score_50 = score_exposure(1_000_000, 50).unwrap();
        assert_eq!(score_50, score_25 * 4);
    }

    // ========== Normalized Weight Tests ==========

    #[test]
    fn test_normalized_weight_50_percent() {
        let weight = normalized_weight(500_000, 1_000_000).unwrap();
        assert_eq!(weight, 500_000); // 50% of WEIGHT_SCALE
    }

    #[test]
    fn test_normalized_weight_100_percent() {
        let weight = normalized_weight(1_000_000, 1_000_000).unwrap();
        assert_eq!(weight, WEIGHT_SCALE);
    }

    #[test]
    fn test_normalized_weight_small_share() {
        let weight = normalized_weight(1_000, 1_000_000).unwrap();
        assert_eq!(weight, 1_000); // 0.1% of WEIGHT_SCALE
    }

    #[test]
    fn test_normalized_weight_zero_total() {
        let result = normalized_weight(500_000, 0);
        assert!(result.is_err());
    }

    // ========== Anti-Whale Tests ==========

    #[test]
    fn test_anti_whale_below_threshold() {
        // Player with 10% of pool - no penalty
        let weight = target_weight_with_anti_whale(100_000, 1_000_000).unwrap();
        let expected = normalized_weight(100_000, 1_000_000).unwrap();
        assert_eq!(weight, expected);
    }

    #[test]
    fn test_anti_whale_at_threshold() {
        // Player with exactly 20% of pool - no penalty
        let weight = target_weight_with_anti_whale(200_000, 1_000_000).unwrap();
        let expected = normalized_weight(200_000, 1_000_000).unwrap();
        assert_eq!(weight, expected);
    }

    #[test]
    fn test_anti_whale_above_threshold() {
        // Player with 50% of pool - should have penalty
        let weight = target_weight_with_anti_whale(500_000, 1_000_000).unwrap();
        let base_weight = normalized_weight(500_000, 1_000_000).unwrap();
        assert!(weight < base_weight); // Penalty applied
    }

    #[test]
    fn test_anti_whale_dominant_player() {
        // Player with 90% of pool - heavy penalty
        let weight = target_weight_with_anti_whale(900_000, 1_000_000).unwrap();
        let base_weight = normalized_weight(900_000, 1_000_000).unwrap();
        assert!(weight < base_weight);
        // Penalty should be significant
        assert!(weight < base_weight * 80 / 100);
    }

    // ========== Penalty Factor Tests ==========

    #[test]
    fn test_penalty_factor_zero_exposure() {
        let penalty = penalty_factor(0).unwrap();
        assert_eq!(penalty, 10_000); // 100% penalty
    }

    #[test]
    fn test_penalty_factor_full_exposure() {
        let penalty = penalty_factor(100).unwrap();
        assert_eq!(penalty, 0); // 0% penalty
    }

    #[test]
    fn test_penalty_factor_half_exposure() {
        let penalty = penalty_factor(50).unwrap();
        assert_eq!(penalty, 5_000); // 50% penalty
    }

    // ========== Redistribution Share Tests ==========

    #[test]
    fn test_redistribution_equal_players() {
        // Two players with equal exposure - should break even
        let player1_exposed = 500_000;
        let player2_exposed = 500_000;
        let total_exposed = 1_000_000;
        let pool_after_fee = 980_000; // 2% fee

        let redist1 = calculate_redistribution_share(
            player1_exposed,
            50,
            total_exposed,
            pool_after_fee,
        ).unwrap();

        let redist2 = calculate_redistribution_share(
            player2_exposed,
            50,
            total_exposed,
            pool_after_fee,
        ).unwrap();

        // Both should lose equally (due to 2% fee)
        assert!(redist1 < 0);
        assert!(redist2 < 0);
        assert_eq!(redist1, redist2);
    }

    #[test]
    fn test_redistribution_closed_system() {
        // Verify sum of redistributions equals zero (closed system)
        let total_exposed = 1_000_000;
        let pool_after_fee = 1_000_000; // No fee for this test

        let redist1 = calculate_redistribution_share(300_000, 50, total_exposed, pool_after_fee).unwrap();
        let redist2 = calculate_redistribution_share(400_000, 50, total_exposed, pool_after_fee).unwrap();
        let redist3 = calculate_redistribution_share(300_000, 50, total_exposed, pool_after_fee).unwrap();

        let sum = redist1 + redist2 + redist3;
        assert_eq!(sum, 0); // Closed system
    }

    #[test]
    fn test_redistribution_zero_exposure() {
        let result = calculate_redistribution_share(0, 0, 1_000_000, 980_000);
        assert!(result.is_ok());
    }

    // ========== Clamp Tests ==========

    #[test]
    fn test_clamp_u64_within_range() {
        assert_eq!(clamp_u64(50, 0, 100), 50);
    }

    #[test]
    fn test_clamp_u64_below_min() {
        assert_eq!(clamp_u64(5, 10, 100), 10);
    }

    #[test]
    fn test_clamp_u64_above_max() {
        assert_eq!(clamp_u64(150, 0, 100), 100);
    }

    #[test]
    fn test_clamp_exposure_within_range() {
        assert_eq!(clamp_exposure(50, 0, 100), 50);
    }

    #[test]
    fn test_clamp_exposure_below_min() {
        assert_eq!(clamp_exposure(0, 10, 100), 10);
    }

    #[test]
    fn test_clamp_exposure_above_max() {
        assert_eq!(clamp_exposure(150, 0, 100), 100);
    }

    // ========== Anti-Sybil Tests ==========

    #[test]
    fn test_is_meaningful_balance_above_threshold() {
        assert!(is_meaningful_balance(1_000_000)); // 0.001 SOL
        assert!(is_meaningful_balance(10_000_000)); // 0.01 SOL
    }

    #[test]
    fn test_is_meaningful_balance_at_threshold() {
        assert!(is_meaningful_balance(MIN_MEANINGFUL_BALANCE));
    }

    #[test]
    fn test_is_meaningful_balance_below_threshold() {
        assert!(!is_meaningful_balance(999_999));
        assert!(!is_meaningful_balance(100));
        assert!(!is_meaningful_balance(0));
    }

    // ========== Redistributable Pool Tests ==========

    #[test]
    fn test_calculate_redistributable_pool() {
        let (pool, fee) = calculate_redistributable_pool(1_000_000, 200).unwrap();
        assert_eq!(fee, 20_000); // 2%
        assert_eq!(pool, 980_000);
        assert_eq!(pool + fee, 1_000_000); // Conservation
    }

    #[test]
    fn test_calculate_redistributable_pool_zero_fee() {
        let (pool, fee) = calculate_redistributable_pool(1_000_000, 0).unwrap();
        assert_eq!(fee, 0);
        assert_eq!(pool, 1_000_000);
    }

    // ========== Redistribution Sum Verification Tests ==========

    #[test]
    fn test_verify_redistribution_sum_balanced() {
        let redistributions = vec![100, -50, -50];
        assert!(verify_redistribution_sum(&redistributions));
    }

    #[test]
    fn test_verify_redistribution_sum_unbalanced() {
        let redistributions = vec![100, -50, -40];
        assert!(!verify_redistribution_sum(&redistributions));
    }

    #[test]
    fn test_verify_redistribution_sum_empty() {
        let redistributions: Vec<i64> = vec![];
        assert!(verify_redistribution_sum(&redistributions));
    }

    // ========== Edge Cases and Large Values ==========

    #[test]
    fn test_large_balance_exposure() {
        // Test with 1000 SOL
        let balance = 1_000 * 1_000_000_000;
        let exposed = calculate_exposed_value(balance, 50).unwrap();
        assert_eq!(exposed, balance / 2);
    }

    #[test]
    fn test_zero_values() {
        assert_eq!(calculate_exposed_value(0, 50).unwrap(), 0);
        assert_eq!(score_exposure(0, 50).unwrap(), 0);
    }

    #[test]
    fn test_fee_calculation_precision() {
        // Test that fee calculation doesn't lose precision
        let amount = 999_999;
        let (fee, after_fee) = calculate_fee(amount, 200).unwrap();
        assert_eq!(fee + after_fee, amount);
    }

    // ========== Mathematical Invariants ==========

    #[test]
    fn test_exposure_score_monotonic() {
        // Higher exposure should always give higher score
        let balance = 1_000_000;
        let score_25 = score_exposure(balance, 25).unwrap();
        let score_50 = score_exposure(balance, 50).unwrap();
        let score_75 = score_exposure(balance, 75).unwrap();
        let score_100 = score_exposure(balance, 100).unwrap();

        assert!(score_25 < score_50);
        assert!(score_50 < score_75);
        assert!(score_75 < score_100);
    }

    #[test]
    fn test_weight_sum_equals_scale() {
        // Sum of all normalized weights should equal WEIGHT_SCALE
        let total = 1_000_000;
        let w1 = normalized_weight(300_000, total).unwrap();
        let w2 = normalized_weight(400_000, total).unwrap();
        let w3 = normalized_weight(300_000, total).unwrap();

        assert_eq!(w1 + w2 + w3, WEIGHT_SCALE);
    }
}
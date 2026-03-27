use anchor_lang::prelude::*;

#[error_code]
pub enum SwarmArenaError {
    // Account validation errors
    #[msg("Invalid authority for this operation")]
    InvalidAuthority,
    
    #[msg("Account not initialized")]
    AccountNotInitialized,
    
    #[msg("Invalid account provided")]
    InvalidAccount,
    
    #[msg("Invalid vault account")]
    InvalidVault,
    
    // State consistency errors
    #[msg("State is inconsistent or corrupted")]
    InconsistentState,
    
    #[msg("Player already registered")]
    PlayerAlreadyRegistered,
    
    #[msg("Player not registered")]
    PlayerNotRegistered,
    
    #[msg("Player has insufficient balance")]
    InsufficientBalance,
    
    // Deposit/Withdrawal errors
    #[msg("Deposit amount is invalid or zero")]
    InvalidDepositAmount,
    
    #[msg("Withdrawal amount exceeds available balance")]
    InvalidWithdrawalAmount,
    
    #[msg("Withdrawal not allowed during active exposure")]
    WithdrawalBlockedByExposure,
    
    #[msg("Minimum deposit requirement not met")]
    DepositBelowMinimum,
    
    // Exposure errors
    #[msg("Exposure value is out of allowed range")]
    ExposureOutOfRange,
    
    #[msg("Cannot set exposure with insufficient balance")]
    InsufficientBalanceForExposure,
    
    #[msg("Exposure change too frequent, cooldown not elapsed")]
    ExposureCooldownActive,
    
    // Cycle/Round errors
    #[msg("Cycle has not ended yet")]
    CycleNotEnded,
    
    #[msg("Cycle already resolved")]
    CycleAlreadyResolved,
    
    #[msg("Invalid cycle state")]
    InvalidCycleState,
    
    #[msg("Round duration invalid")]
    InvalidRoundDuration,
    
    // Operation frequency errors
    #[msg("Operation called too frequently")]
    OperationTooFrequent,
    
    #[msg("Cooldown period not elapsed")]
    CooldownNotElapsed,
    
    // Authorization errors
    #[msg("Operation not authorized for this user")]
    Unauthorized,
    
    #[msg("Admin privileges required")]
    AdminOnly,
    
    // Math errors
    #[msg("Arithmetic overflow occurred")]
    ArithmeticOverflow,
    
    #[msg("Arithmetic underflow occurred")]
    ArithmeticUnderflow,
    
    #[msg("Division by zero attempted")]
    DivisionByZero,
    
    // Data validation errors
    #[msg("Malformed or invalid data provided")]
    MalformedData,
    
    #[msg("Invalid configuration parameters")]
    InvalidConfiguration,
    
    #[msg("Timestamp is invalid or in the past")]
    InvalidTimestamp,
    
    // Protocol errors
    #[msg("Protocol fee calculation failed")]
    FeeCalculationFailed,
    
    #[msg("Total pool value is zero or invalid")]
    InvalidPoolValue,
    
    #[msg("No active players in the cycle")]
    NoActivePlayers,
}
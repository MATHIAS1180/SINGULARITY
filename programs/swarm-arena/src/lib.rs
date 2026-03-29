use anchor_lang::prelude::*;
use anchor_lang::system_program::{transfer, Transfer};

// ============================================================================
// PROGRAM ID - Deployed on Devnet via Solpg
// ============================================================================
declare_id!("FbSDMGKyTo1YYGMjtau1JLBUDh18koz1JKN3NL38Zmf3");

// ============================================================================
// PROGRAM MODULE
// ============================================================================
#[program]
pub mod swarm_arena {
    use super::*;

    /// Initialize the protocol configuration
    pub fn initialize_config(
        ctx: Context<InitializeConfig>,
        protocol_fee_bps: u16,
        min_deposit: u64,
        max_deposit: u64,
        min_exposure: u8,
        max_exposure: u8,
        cycle_duration: u64,
        exposure_cooldown: u64,
    ) -> Result<()> {
        init_config_handler(
            ctx,
            protocol_fee_bps,
            min_deposit,
            max_deposit,
            min_exposure,
            max_exposure,
            cycle_duration,
            exposure_cooldown,
        )
    }

    /// Register a new player
    pub fn register_player(ctx: Context<RegisterPlayer>) -> Result<()> {
        register_player_handler(ctx)
    }

    /// Deposit funds into the vault
    pub fn deposit(ctx: Context<Deposit>, amount: u64) -> Result<()> {
        deposit_handler(ctx, amount)
    }

    /// Withdraw funds from the vault
    pub fn withdraw(ctx: Context<Withdraw>, amount: u64) -> Result<()> {
        withdraw_handler(ctx, amount)
    }

    /// Set player exposure level
    pub fn set_exposure(ctx: Context<SetExposure>, new_exposure: u8) -> Result<()> {
        set_exposure_handler(ctx, new_exposure)
    }

    /// Resolve the current cycle
    pub fn resolve_cycle(ctx: Context<ResolveCycle>) -> Result<()> {
        resolve_cycle_handler(ctx)
    }

    /// Claim redistribution for a player after cycle resolution
    pub fn claim_redistribution(
        ctx: Context<ClaimRedistribution>,
        cycle_number: u64,
    ) -> Result<()> {
        claim_redistribution_handler(ctx, cycle_number)
    }
}

// ============================================================================
// STATE STRUCTURES
// ============================================================================

/// Global configuration for the Swarm Arena protocol
/// PDA seed: ["config"]
#[account]
pub struct GlobalConfig {
    pub authority: Pubkey,
    pub protocol_fee_bps: u16,
    pub min_deposit: u64,
    pub max_deposit: u64,
    pub min_exposure: u8,
    pub max_exposure: u8,
    pub cycle_duration: u64,
    pub exposure_cooldown: u64,
    pub treasury_vault: Pubkey,
    pub total_fees_collected: u64,
    pub total_cycles: u64,
    pub paused: bool,
    pub bump: u8,
}

impl GlobalConfig {
    pub const LEN: usize = 8 + 32 + 2 + 8 + 8 + 1 + 1 + 8 + 8 + 32 + 8 + 8 + 1 + 1;
}

/// Current game state and active cycle
/// PDA seed: ["game_state"]
#[account]
pub struct GameState {
    pub current_cycle: u64,
    pub cycle_start_slot: u64,
    pub cycle_end_slot: u64,
    pub total_value_locked: u64,
    pub total_exposed_value: u64,
    pub active_players: u32,
    pub cycle_resolved: bool,
    pub last_update_slot: u64,
    pub bump: u8,
}

impl GameState {
    pub const LEN: usize = 8 + 8 + 8 + 8 + 8 + 8 + 4 + 1 + 8 + 1;
}

/// Historical cycle data for analytics
/// PDA seed: ["cycle", cycle_number.to_le_bytes()]
#[account]
pub struct CycleState {
    pub cycle_number: u64,
    pub start_slot: u64,
    pub end_slot: u64,
    pub resolved_slot: u64,
    pub total_value_locked: u64,
    pub total_exposed_value: u64,
    pub total_redistributed: u64,
    pub fees_collected: u64,
    pub participants: u32,
    pub winners: u32,
    pub resolved: bool,
    pub bump: u8,
}

impl CycleState {
    pub const LEN: usize = 8 + 8 + 8 + 8 + 8 + 8 + 8 + 8 + 8 + 4 + 4 + 1 + 1;
}

/// Player account state
/// PDA seed: ["player", player_pubkey]
#[account]
pub struct PlayerState {
    pub player: Pubkey,
    pub total_deposited: u64,
    pub total_withdrawn: u64,
    pub balance: u64,
    pub exposure: u8,
    pub exposed_value: u64,
    pub last_exposure_change_slot: u64,
    pub last_action_slot: u64,
    pub cycles_participated: u64,
    pub total_redistributed: i64,
    pub participating_in_cycle: bool,
    pub registered_slot: u64,
    pub score: i64,
    pub bump: u8,
}

impl PlayerState {
    pub const LEN: usize = 8 + 32 + 8 + 8 + 8 + 1 + 8 + 8 + 8 + 8 + 8 + 1 + 8 + 8 + 1;
}

/// Treasury vault account for protocol fees
/// PDA seed: ["treasury"]
#[account]
pub struct TreasuryVault {
    pub authority: Pubkey,
    pub total_collected: u64,
    pub total_withdrawn: u64,
    pub balance: u64,
    pub last_withdrawal_slot: u64,
    pub bump: u8,
}

impl TreasuryVault {
    pub const LEN: usize = 8 + 32 + 8 + 8 + 8 + 8 + 1;
}

// ============================================================================
// ERRORS
// ============================================================================

#[error_code]
pub enum SwarmArenaError {
    #[msg("Invalid authority for this operation")]
    InvalidAuthority,
    #[msg("Account not initialized")]
    AccountNotInitialized,
    #[msg("Invalid account provided")]
    InvalidAccount,
    #[msg("Invalid vault account")]
    InvalidVault,
    #[msg("State is inconsistent or corrupted")]
    InconsistentState,
    #[msg("Player already registered")]
    PlayerAlreadyRegistered,
    #[msg("Player not registered")]
    PlayerNotRegistered,
    #[msg("Player has insufficient balance")]
    InsufficientBalance,
    #[msg("Deposit amount is invalid or zero")]
    InvalidDepositAmount,
    #[msg("Withdrawal amount exceeds available balance")]
    InvalidWithdrawalAmount,
    #[msg("Withdrawal not allowed during active exposure")]
    WithdrawalBlockedByExposure,
    #[msg("Minimum deposit requirement not met")]
    DepositBelowMinimum,
    #[msg("Exposure value is out of allowed range")]
    ExposureOutOfRange,
    #[msg("Cannot set exposure with insufficient balance")]
    InsufficientBalanceForExposure,
    #[msg("Exposure change too frequent, cooldown not elapsed")]
    ExposureCooldownActive,
    #[msg("Cycle has not ended yet")]
    CycleNotEnded,
    #[msg("Cycle already resolved")]
    CycleAlreadyResolved,
    #[msg("Invalid cycle state")]
    InvalidCycleState,
    #[msg("Round duration invalid")]
    InvalidRoundDuration,
    #[msg("Operation called too frequently")]
    OperationTooFrequent,
    #[msg("Cooldown period not elapsed")]
    CooldownNotElapsed,
    #[msg("Operation not authorized for this user")]
    Unauthorized,
    #[msg("Admin privileges required")]
    AdminOnly,
    #[msg("Arithmetic overflow occurred")]
    ArithmeticOverflow,
    #[msg("Arithmetic underflow occurred")]
    ArithmeticUnderflow,
    #[msg("Division by zero attempted")]
    DivisionByZero,
    #[msg("Malformed or invalid data provided")]
    MalformedData,
    #[msg("Invalid configuration parameters")]
    InvalidConfiguration,
    #[msg("Timestamp is invalid or in the past")]
    InvalidTimestamp,
    #[msg("Protocol fee calculation failed")]
    FeeCalculationFailed,
    #[msg("Total pool value is zero or invalid")]
    InvalidPoolValue,
    #[msg("No active players in the cycle")]
    NoActivePlayers,
}

// ============================================================================
// EVENTS
// ============================================================================

#[event]
pub struct ConfigInitialized {
    pub authority: Pubkey,
    pub protocol_fee_bps: u16,
    pub min_deposit: u64,
    pub max_deposit: u64,
    pub cycle_duration: u64,
    pub timestamp: i64,
}

#[event]
pub struct PlayerRegistered {
    pub player: Pubkey,
    pub timestamp: i64,
    pub slot: u64,
}

#[event]
pub struct DepositMade {
    pub player: Pubkey,
    pub amount: u64,
    pub new_balance: u64,
    pub timestamp: i64,
    pub slot: u64,
}

#[event]
pub struct WithdrawMade {
    pub player: Pubkey,
    pub amount: u64,
    pub new_balance: u64,
    pub timestamp: i64,
    pub slot: u64,
}

#[event]
pub struct ExposureUpdated {
    pub player: Pubkey,
    pub old_exposure: u8,
    pub new_exposure: u8,
    pub exposed_value: u64,
    pub timestamp: i64,
    pub slot: u64,
}

#[event]
pub struct CycleResolved {
    pub cycle_number: u64,
    pub start_slot: u64,
    pub end_slot: u64,
    pub total_value_locked: u64,
    pub total_exposed_value: u64,
    pub total_redistributed: u64,
    pub fees_collected: u64,
    pub participants: u32,
    pub winners: u32,
    pub timestamp: i64,
}

#[event]
pub struct RewardDistributed {
    pub player: Pubkey,
    pub cycle_number: u64,
    pub redistribution_amount: i64,
    pub new_balance: u64,
    pub new_score: i64,
    pub timestamp: i64,
}

#[event]
pub struct FeeCollected {
    pub cycle_number: u64,
    pub amount: u64,
    pub total_fees: u64,
    pub timestamp: i64,
}

#[event]
pub struct ParticipationChanged {
    pub player: Pubkey,
    pub cycle_number: u64,
    pub participating: bool,
    pub exposed_value: u64,
    pub timestamp: i64,
}

#[event]
pub struct ProtocolStatusChanged {
    pub paused: bool,
    pub authority: Pubkey,
    pub timestamp: i64,
}

// ============================================================================
// MATH MODULE - Fixed-point arithmetic for redistribution logic
// ============================================================================

pub const BPS_SCALE: u64 = 10_000;
pub const EXPOSURE_SCALE: u64 = 100;
pub const WEIGHT_SCALE: u64 = 1_000_000;
pub const PROTOCOL_FEE_BPS: u64 = 200;
pub const WHALE_THRESHOLD_BPS: u64 = 2000;
pub const WHALE_PENALTY_BPS: u64 = 5000;
pub const MIN_MEANINGFUL_BALANCE: u64 = 1_000_000;

pub fn calculate_fee(amount: u64, fee_bps: u64) -> Result<(u64, u64)> {
    require!(fee_bps <= BPS_SCALE, SwarmArenaError::InvalidConfiguration);
    
    let fee = amount
        .checked_mul(fee_bps)
        .ok_or(SwarmArenaError::ArithmeticOverflow)?
        .checked_div(BPS_SCALE)
        .ok_or(SwarmArenaError::DivisionByZero)?;
    
    let after_fee = amount
        .checked_sub(fee)
        .ok_or(SwarmArenaError::ArithmeticUnderflow)?;
    
    Ok((fee, after_fee))
}

pub fn calculate_exposed_value(balance: u64, exposure: u8) -> Result<u64> {
    require!(exposure <= 100, SwarmArenaError::ExposureOutOfRange);
    
    let exposed = balance
        .checked_mul(exposure as u64)
        .ok_or(SwarmArenaError::ArithmeticOverflow)?
        .checked_div(EXPOSURE_SCALE)
        .ok_or(SwarmArenaError::DivisionByZero)?;
    
    Ok(exposed)
}

pub fn score_exposure(balance: u64, exposure: u8) -> Result<u64> {
    require!(exposure <= 100, SwarmArenaError::ExposureOutOfRange);
    
    let exposure_squared = (exposure as u64)
        .checked_mul(exposure as u64)
        .ok_or(SwarmArenaError::ArithmeticOverflow)?;
    
    let score = balance
        .checked_mul(exposure_squared)
        .ok_or(SwarmArenaError::ArithmeticOverflow)?
        .checked_div(EXPOSURE_SCALE * EXPOSURE_SCALE)
        .ok_or(SwarmArenaError::DivisionByZero)?;
    
    Ok(score)
}

pub fn normalized_weight(player_exposed: u64, total_exposed: u64) -> Result<u64> {
    require!(total_exposed > 0, SwarmArenaError::InvalidPoolValue);
    
    let weight = player_exposed
        .checked_mul(WEIGHT_SCALE)
        .ok_or(SwarmArenaError::ArithmeticOverflow)?
        .checked_div(total_exposed)
        .ok_or(SwarmArenaError::DivisionByZero)?;
    
    Ok(weight)
}

pub fn target_weight_with_anti_whale(player_exposed: u64, total_exposed: u64) -> Result<u64> {
    let base_weight = normalized_weight(player_exposed, total_exposed)?;
    
    let whale_threshold = WEIGHT_SCALE
        .checked_mul(WHALE_THRESHOLD_BPS)
        .ok_or(SwarmArenaError::ArithmeticOverflow)?
        .checked_div(BPS_SCALE)
        .ok_or(SwarmArenaError::DivisionByZero)?;
    
    if base_weight <= whale_threshold {
        return Ok(base_weight);
    }
    
    let excess = base_weight
        .checked_sub(whale_threshold)
        .ok_or(SwarmArenaError::ArithmeticUnderflow)?;
    
    let penalty = excess
        .checked_mul(WHALE_PENALTY_BPS)
        .ok_or(SwarmArenaError::ArithmeticOverflow)?
        .checked_div(BPS_SCALE)
        .ok_or(SwarmArenaError::DivisionByZero)?;
    
    let adjusted_weight = base_weight
        .checked_sub(penalty)
        .ok_or(SwarmArenaError::ArithmeticUnderflow)?;
    
    Ok(adjusted_weight)
}

pub fn penalty_factor(exposure: u8) -> Result<u64> {
    require!(exposure <= 100, SwarmArenaError::ExposureOutOfRange);
    
    let penalty_bps = (100u64)
        .checked_sub(exposure as u64)
        .ok_or(SwarmArenaError::ArithmeticUnderflow)?
        .checked_mul(100)
        .ok_or(SwarmArenaError::ArithmeticOverflow)?;
    
    Ok(penalty_bps)
}

pub fn calculate_redistribution_share(
    player_exposed: u64,
    player_exposure: u8,
    total_exposed: u64,
    total_pool_after_fee: u64,
) -> Result<i64> {
    require!(total_exposed > 0, SwarmArenaError::InvalidPoolValue);
    require!(player_exposure <= 100, SwarmArenaError::ExposureOutOfRange);
    
    let player_weight = target_weight_with_anti_whale(player_exposed, total_exposed)?;
    
    let expected_share = total_pool_after_fee
        .checked_mul(player_weight)
        .ok_or(SwarmArenaError::ArithmeticOverflow)?
        .checked_div(WEIGHT_SCALE)
        .ok_or(SwarmArenaError::DivisionByZero)?;
    
    let contribution = player_exposed;
    
    let redistribution = (expected_share as i64)
        .checked_sub(contribution as i64)
        .ok_or(SwarmArenaError::ArithmeticOverflow)?;
    
    Ok(redistribution)
}

pub fn is_meaningful_balance(balance: u64) -> bool {
    balance >= MIN_MEANINGFUL_BALANCE
}

pub fn clamp_u64(value: u64, min: u64, max: u64) -> u64 {
    if value < min {
        min
    } else if value > max {
        max
    } else {
        value
    }
}

pub fn clamp_exposure(exposure: u8, min: u8, max: u8) -> u8 {
    if exposure < min {
        min
    } else if exposure > max {
        max
    } else {
        exposure
    }
}

pub fn calculate_redistributable_pool(total_exposed: u64, fee_bps: u64) -> Result<(u64, u64)> {
    let (fee, after_fee) = calculate_fee(total_exposed, fee_bps)?;
    Ok((after_fee, fee))
}

pub fn verify_redistribution_sum(redistributions: &[i64]) -> bool {
    let sum: i64 = redistributions.iter().sum();
    sum == 0
}

// ============================================================================
// INSTRUCTION CONTEXTS
// ============================================================================

#[derive(Accounts)]
pub struct InitializeConfig<'info> {
    #[account(
        init,
        payer = authority,
        space = GlobalConfig::LEN,
        seeds = [b"config"],
        bump
    )]
    pub config: Account<'info, GlobalConfig>,

    #[account(
        init,
        payer = authority,
        space = GameState::LEN,
        seeds = [b"game_state"],
        bump
    )]
    pub game_state: Account<'info, GameState>,

    #[account(
        init,
        payer = authority,
        space = TreasuryVault::LEN,
        seeds = [b"treasury"],
        bump
    )]
    pub treasury_vault: Account<'info, TreasuryVault>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct RegisterPlayer<'info> {
    #[account(
        seeds = [b"config"],
        bump = config.bump
    )]
    pub config: Account<'info, GlobalConfig>,

    #[account(
        init,
        payer = player,
        space = PlayerState::LEN,
        seeds = [b"player", player.key().as_ref()],
        bump
    )]
    pub player_state: Account<'info, PlayerState>,

    #[account(mut)]
    pub player: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Deposit<'info> {
    #[account(
        seeds = [b"config"],
        bump = config.bump
    )]
    pub config: Account<'info, GlobalConfig>,

    #[account(
        mut,
        seeds = [b"game_state"],
        bump = game_state.bump
    )]
    pub game_state: Account<'info, GameState>,

    #[account(
        mut,
        seeds = [b"player", player.key().as_ref()],
        bump = player_state.bump,
        constraint = player_state.player == player.key() @ SwarmArenaError::InvalidAccount
    )]
    pub player_state: Account<'info, PlayerState>,

    /// CHECK: PDA vault that holds player funds
    #[account(
        mut,
        seeds = [b"vault"],
        bump
    )]
    pub vault: AccountInfo<'info>,

    #[account(mut)]
    pub player: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Withdraw<'info> {
    #[account(
        seeds = [b"config"],
        bump = config.bump
    )]
    pub config: Account<'info, GlobalConfig>,

    #[account(
        mut,
        seeds = [b"game_state"],
        bump = game_state.bump
    )]
    pub game_state: Account<'info, GameState>,

    #[account(
        mut,
        seeds = [b"player", player.key().as_ref()],
        bump = player_state.bump,
        constraint = player_state.player == player.key() @ SwarmArenaError::InvalidAccount
    )]
    pub player_state: Account<'info, PlayerState>,

    /// CHECK: PDA vault that holds player funds
    #[account(
        mut,
        seeds = [b"vault"],
        bump
    )]
    pub vault: AccountInfo<'info>,

    #[account(mut)]
    pub player: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct SetExposure<'info> {
    #[account(
        seeds = [b"config"],
        bump = config.bump
    )]
    pub config: Account<'info, GlobalConfig>,

    #[account(
        mut,
        seeds = [b"game_state"],
        bump = game_state.bump
    )]
    pub game_state: Account<'info, GameState>,

    #[account(
        mut,
        seeds = [b"player", player.key().as_ref()],
        bump = player_state.bump,
        constraint = player_state.player == player.key() @ SwarmArenaError::InvalidAccount
    )]
    pub player_state: Account<'info, PlayerState>,

    #[account(mut)]
    pub player: Signer<'info>,
}

#[derive(Accounts)]
pub struct ResolveCycle<'info> {
    #[account(
        mut,
        seeds = [b"config"],
        bump = config.bump
    )]
    pub config: Account<'info, GlobalConfig>,

    #[account(
        mut,
        seeds = [b"game_state"],
        bump = game_state.bump
    )]
    pub game_state: Account<'info, GameState>,

    #[account(
        init,
        payer = resolver,
        space = CycleState::LEN,
        seeds = [b"cycle", game_state.current_cycle.to_le_bytes().as_ref()],
        bump
    )]
    pub cycle_state: Account<'info, CycleState>,

    #[account(
        mut,
        seeds = [b"treasury"],
        bump = treasury_vault.bump
    )]
    pub treasury_vault: Account<'info, TreasuryVault>,

    /// CHECK: PDA vault that holds player funds
    #[account(
        mut,
        seeds = [b"vault"],
        bump
    )]
    pub vault: AccountInfo<'info>,

    #[account(mut)]
    pub resolver: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(cycle_number: u64)]
pub struct ClaimRedistribution<'info> {
    #[account(
        seeds = [b"config"],
        bump = config.bump
    )]
    pub config: Account<'info, GlobalConfig>,

    #[account(
        mut,
        seeds = [b"game_state"],
        bump = game_state.bump
    )]
    pub game_state: Account<'info, GameState>,

    #[account(
        mut,
        seeds = [b"cycle", cycle_number.to_le_bytes().as_ref()],
        bump = cycle_state.bump,
        constraint = cycle_state.resolved @ SwarmArenaError::InvalidCycleState
    )]
    pub cycle_state: Account<'info, CycleState>,

    #[account(
        mut,
        seeds = [b"player", player.key().as_ref()],
        bump = player_state.bump,
        constraint = player_state.player == player.key() @ SwarmArenaError::InvalidAccount
    )]
    pub player_state: Account<'info, PlayerState>,

    /// CHECK: PDA vault that holds player funds
    #[account(
        mut,
        seeds = [b"vault"],
        bump
    )]
    pub vault: AccountInfo<'info>,

    #[account(mut)]
    pub player: Signer<'info>,

    pub system_program: Program<'info, System>,
}

// ============================================================================
// INSTRUCTION HANDLERS
// ============================================================================

pub fn init_config_handler(
    ctx: Context<InitializeConfig>,
    protocol_fee_bps: u16,
    min_deposit: u64,
    max_deposit: u64,
    min_exposure: u8,
    max_exposure: u8,
    cycle_duration: u64,
    exposure_cooldown: u64,
) -> Result<()> {
    require!(
        protocol_fee_bps <= 10_000,
        SwarmArenaError::InvalidConfiguration
    );
    require!(
        min_deposit > 0 && min_deposit < max_deposit,
        SwarmArenaError::InvalidConfiguration
    );
    require!(
        min_exposure <= max_exposure && max_exposure <= 100,
        SwarmArenaError::InvalidConfiguration
    );
    require!(
        cycle_duration > 0,
        SwarmArenaError::InvalidConfiguration
    );
    require!(
        exposure_cooldown > 0,
        SwarmArenaError::InvalidConfiguration
    );

    let config = &mut ctx.accounts.config;
    let game_state = &mut ctx.accounts.game_state;
    let treasury_vault = &mut ctx.accounts.treasury_vault;
    let clock = Clock::get()?;

    config.authority = ctx.accounts.authority.key();
    config.protocol_fee_bps = protocol_fee_bps;
    config.min_deposit = min_deposit;
    config.max_deposit = max_deposit;
    config.min_exposure = min_exposure;
    config.max_exposure = max_exposure;
    config.cycle_duration = cycle_duration;
    config.exposure_cooldown = exposure_cooldown;
    config.treasury_vault = treasury_vault.key();
    config.total_fees_collected = 0;
    config.total_cycles = 0;
    config.paused = false;
    config.bump = ctx.bumps.config;

    game_state.current_cycle = 1;
    game_state.cycle_start_slot = clock.slot;
    game_state.cycle_end_slot = clock.slot
        .checked_add(cycle_duration)
        .ok_or(SwarmArenaError::ArithmeticOverflow)?;
    game_state.total_value_locked = 0;
    game_state.total_exposed_value = 0;
    game_state.active_players = 0;
    game_state.cycle_resolved = false;
    game_state.last_update_slot = clock.slot;
    game_state.bump = ctx.bumps.game_state;

    treasury_vault.authority = config.key();
    treasury_vault.total_collected = 0;
    treasury_vault.total_withdrawn = 0;
    treasury_vault.balance = 0;
    treasury_vault.last_withdrawal_slot = 0;
    treasury_vault.bump = ctx.bumps.treasury_vault;

    emit!(ConfigInitialized {
        authority: config.authority,
        protocol_fee_bps: config.protocol_fee_bps,
        min_deposit: config.min_deposit,
        max_deposit: config.max_deposit,
        cycle_duration: config.cycle_duration,
        timestamp: clock.unix_timestamp,
    });

    msg!("Protocol initialized successfully");
    msg!("Authority: {}", config.authority);
    msg!("Protocol fee: {}bps", protocol_fee_bps);
    msg!("Cycle duration: {} slots", cycle_duration);

    Ok(())
}

pub fn register_player_handler(ctx: Context<RegisterPlayer>) -> Result<()> {
    let config = &ctx.accounts.config;
    let player_state = &mut ctx.accounts.player_state;
    let clock = Clock::get()?;

    require!(!config.paused, SwarmArenaError::Unauthorized);

    player_state.player = ctx.accounts.player.key();
    player_state.total_deposited = 0;
    player_state.total_withdrawn = 0;
    player_state.balance = 0;
    player_state.exposure = 0;
    player_state.exposed_value = 0;
    player_state.last_exposure_change_slot = 0;
    player_state.last_action_slot = clock.slot;
    player_state.cycles_participated = 0;
    player_state.total_redistributed = 0;
    player_state.participating_in_cycle = false;
    player_state.registered_slot = clock.slot;
    player_state.score = 0;
    player_state.bump = ctx.bumps.player_state;

    emit!(PlayerRegistered {
        player: player_state.player,
        timestamp: clock.unix_timestamp,
        slot: clock.slot,
    });

    msg!("Player registered: {}", player_state.player);

    Ok(())
}

pub fn deposit_handler(ctx: Context<Deposit>, amount: u64) -> Result<()> {
    let config = &ctx.accounts.config;
    let game_state = &mut ctx.accounts.game_state;
    let player_state = &mut ctx.accounts.player_state;
    let clock = Clock::get()?;

    require!(!config.paused, SwarmArenaError::Unauthorized);
    require!(amount > 0, SwarmArenaError::InvalidDepositAmount);
    require!(
        amount >= config.min_deposit,
        SwarmArenaError::DepositBelowMinimum
    );
    require!(
        amount <= config.max_deposit,
        SwarmArenaError::InvalidDepositAmount
    );

    let new_balance = player_state
        .balance
        .checked_add(amount)
        .ok_or(SwarmArenaError::ArithmeticOverflow)?;

    let transfer_ctx = CpiContext::new(
        ctx.accounts.system_program.to_account_info(),
        Transfer {
            from: ctx.accounts.player.to_account_info(),
            to: ctx.accounts.vault.to_account_info(),
        },
    );
    transfer(transfer_ctx, amount)?;

    player_state.balance = new_balance;
    player_state.total_deposited = player_state
        .total_deposited
        .checked_add(amount)
        .ok_or(SwarmArenaError::ArithmeticOverflow)?;
    player_state.last_action_slot = clock.slot;

    if player_state.exposure > 0 {
        player_state.exposed_value = calculate_exposed_value(
            player_state.balance,
            player_state.exposure,
        )?;
    }

    game_state.total_value_locked = game_state
        .total_value_locked
        .checked_add(amount)
        .ok_or(SwarmArenaError::ArithmeticOverflow)?;

    if player_state.participating_in_cycle && player_state.exposure > 0 {
        let old_exposed = player_state.exposed_value
            .checked_sub(amount)
            .unwrap_or(0);
        let exposed_diff = player_state.exposed_value
            .checked_sub(old_exposed)
            .unwrap_or(0);
        
        game_state.total_exposed_value = game_state
            .total_exposed_value
            .checked_add(exposed_diff)
            .ok_or(SwarmArenaError::ArithmeticOverflow)?;
    }

    game_state.last_update_slot = clock.slot;

    emit!(DepositMade {
        player: player_state.player,
        amount,
        new_balance: player_state.balance,
        timestamp: clock.unix_timestamp,
        slot: clock.slot,
    });

    msg!("Deposit: {} lamports", amount);
    msg!("New balance: {} lamports", player_state.balance);

    Ok(())
}

pub fn withdraw_handler(ctx: Context<Withdraw>, amount: u64) -> Result<()> {
    let config = &ctx.accounts.config;
    let game_state = &mut ctx.accounts.game_state;
    let player_state = &mut ctx.accounts.player_state;
    let clock = Clock::get()?;

    require!(!config.paused, SwarmArenaError::Unauthorized);
    require!(amount > 0, SwarmArenaError::InvalidWithdrawalAmount);
    require!(
        amount <= player_state.balance,
        SwarmArenaError::InvalidWithdrawalAmount
    );
    require!(
        !player_state.participating_in_cycle || player_state.exposure == 0,
        SwarmArenaError::WithdrawalBlockedByExposure
    );

    let new_balance = player_state
        .balance
        .checked_sub(amount)
        .ok_or(SwarmArenaError::ArithmeticUnderflow)?;

    let vault_bump = ctx.bumps.vault;
    let vault_seeds = &[b"vault".as_ref(), &[vault_bump]];
    let signer_seeds = &[&vault_seeds[..]];

    let transfer_ctx = CpiContext::new_with_signer(
        ctx.accounts.system_program.to_account_info(),
        Transfer {
            from: ctx.accounts.vault.to_account_info(),
            to: ctx.accounts.player.to_account_info(),
        },
        signer_seeds,
    );
    transfer(transfer_ctx, amount)?;

    player_state.balance = new_balance;
    player_state.total_withdrawn = player_state
        .total_withdrawn
        .checked_add(amount)
        .ok_or(SwarmArenaError::ArithmeticOverflow)?;
    player_state.last_action_slot = clock.slot;

    player_state.exposed_value = calculate_exposed_value(
        player_state.balance,
        player_state.exposure,
    )?;

    game_state.total_value_locked = game_state
        .total_value_locked
        .checked_sub(amount)
        .ok_or(SwarmArenaError::ArithmeticUnderflow)?;

    game_state.last_update_slot = clock.slot;

    emit!(WithdrawMade {
        player: player_state.player,
        amount,
        new_balance: player_state.balance,
        timestamp: clock.unix_timestamp,
        slot: clock.slot,
    });

    msg!("Withdrawal: {} lamports", amount);
    msg!("New balance: {} lamports", player_state.balance);

    Ok(())
}

pub fn set_exposure_handler(ctx: Context<SetExposure>, new_exposure: u8) -> Result<()> {
    let config = &ctx.accounts.config;
    let game_state = &mut ctx.accounts.game_state;
    let player_state = &mut ctx.accounts.player_state;
    let clock = Clock::get()?;

    require!(!config.paused, SwarmArenaError::Unauthorized);
    require!(
        new_exposure >= config.min_exposure && new_exposure <= config.max_exposure,
        SwarmArenaError::ExposureOutOfRange
    );

    if player_state.last_exposure_change_slot > 0 {
        let slots_since_last_change = clock
            .slot
            .checked_sub(player_state.last_exposure_change_slot)
            .ok_or(SwarmArenaError::InvalidTimestamp)?;

        require!(
            slots_since_last_change >= config.exposure_cooldown,
            SwarmArenaError::ExposureCooldownActive
        );
    }

    require!(
        player_state.balance > 0 || new_exposure == 0,
        SwarmArenaError::InsufficientBalanceForExposure
    );

    if new_exposure > 0 {
        require!(
            is_meaningful_balance(player_state.balance),
            SwarmArenaError::InsufficientBalanceForExposure
        );
    }

    let old_exposure = player_state.exposure;
    let old_exposed_value = player_state.exposed_value;

    let new_exposed_value = calculate_exposed_value(
        player_state.balance,
        new_exposure,
    )?;

    player_state.exposure = new_exposure;
    player_state.exposed_value = new_exposed_value;
    player_state.last_exposure_change_slot = clock.slot;
    player_state.last_action_slot = clock.slot;

    let was_participating = player_state.participating_in_cycle;
    let now_participating = new_exposure > 0 && player_state.balance > 0;
    player_state.participating_in_cycle = now_participating;

    if was_participating {
        game_state.total_exposed_value = game_state
            .total_exposed_value
            .checked_sub(old_exposed_value)
            .ok_or(SwarmArenaError::ArithmeticUnderflow)?;
    }

    if now_participating {
        game_state.total_exposed_value = game_state
            .total_exposed_value
            .checked_add(new_exposed_value)
            .ok_or(SwarmArenaError::ArithmeticOverflow)?;
    }

    if !was_participating && now_participating {
        game_state.active_players = game_state
            .active_players
            .checked_add(1)
            .ok_or(SwarmArenaError::ArithmeticOverflow)?;
    } else if was_participating && !now_participating {
        game_state.active_players = game_state
            .active_players
            .checked_sub(1)
            .ok_or(SwarmArenaError::ArithmeticUnderflow)?;
    }

    game_state.last_update_slot = clock.slot;

    emit!(ExposureUpdated {
        player: player_state.player,
        old_exposure,
        new_exposure,
        exposed_value: new_exposed_value,
        timestamp: clock.unix_timestamp,
        slot: clock.slot,
    });

    if was_participating != now_participating {
        emit!(ParticipationChanged {
            player: player_state.player,
            cycle_number: game_state.current_cycle,
            participating: now_participating,
            exposed_value: new_exposed_value,
            timestamp: clock.unix_timestamp,
        });
    }

    msg!("Exposure updated: {}%", new_exposure);
    msg!("Exposed value: {} lamports", new_exposed_value);

    Ok(())
}

pub fn resolve_cycle_handler(ctx: Context<ResolveCycle>) -> Result<()> {
    let config = &mut ctx.accounts.config;
    let game_state = &mut ctx.accounts.game_state;
    let cycle_state = &mut ctx.accounts.cycle_state;
    let treasury_vault = &mut ctx.accounts.treasury_vault;
    let clock = Clock::get()?;

    require!(!config.paused, SwarmArenaError::Unauthorized);
    require!(!game_state.cycle_resolved, SwarmArenaError::CycleAlreadyResolved);
    require!(
        clock.slot >= game_state.cycle_end_slot,
        SwarmArenaError::CycleNotEnded
    );
    require!(
        game_state.total_exposed_value > 0,
        SwarmArenaError::NoActivePlayers
    );

    let (redistributable_pool, protocol_fee) = calculate_redistributable_pool(
        game_state.total_exposed_value,
        config.protocol_fee_bps as u64,
    )?;

    if protocol_fee > 0 {
        let vault_bump = ctx.bumps.vault;
        let vault_seeds = &[b"vault".as_ref(), &[vault_bump]];
        let signer_seeds = &[&vault_seeds[..]];

        let transfer_ctx = CpiContext::new_with_signer(
            ctx.accounts.system_program.to_account_info(),
            Transfer {
                from: ctx.accounts.vault.to_account_info(),
                to: treasury_vault.to_account_info(),
            },
            signer_seeds,
        );
        transfer(transfer_ctx, protocol_fee)?;

        treasury_vault.total_collected = treasury_vault
            .total_collected
            .checked_add(protocol_fee)
            .ok_or(SwarmArenaError::ArithmeticOverflow)?;
        treasury_vault.balance = treasury_vault
            .balance
            .checked_add(protocol_fee)
            .ok_or(SwarmArenaError::ArithmeticOverflow)?;
    }

    cycle_state.cycle_number = game_state.current_cycle;
    cycle_state.start_slot = game_state.cycle_start_slot;
    cycle_state.end_slot = game_state.cycle_end_slot;
    cycle_state.resolved_slot = clock.slot;
    cycle_state.total_value_locked = game_state.total_value_locked;
    cycle_state.total_exposed_value = game_state.total_exposed_value;
    cycle_state.total_redistributed = redistributable_pool;
    cycle_state.fees_collected = protocol_fee;
    cycle_state.participants = game_state.active_players;
    cycle_state.winners = 0;
    cycle_state.resolved = true;
    cycle_state.bump = ctx.bumps.cycle_state;

    config.total_fees_collected = config
        .total_fees_collected
        .checked_add(protocol_fee)
        .ok_or(SwarmArenaError::ArithmeticOverflow)?;
    config.total_cycles = config
        .total_cycles
        .checked_add(1)
        .ok_or(SwarmArenaError::ArithmeticOverflow)?;

    game_state.cycle_resolved = true;
    game_state.last_update_slot = clock.slot;

    let next_cycle_number = game_state
        .current_cycle
        .checked_add(1)
        .ok_or(SwarmArenaError::ArithmeticOverflow)?;
    let next_cycle_start = clock.slot;
    let next_cycle_end = next_cycle_start
        .checked_add(config.cycle_duration)
        .ok_or(SwarmArenaError::ArithmeticOverflow)?;

    game_state.current_cycle = next_cycle_number;
    game_state.cycle_start_slot = next_cycle_start;
    game_state.cycle_end_slot = next_cycle_end;
    game_state.cycle_resolved = false;

    emit!(CycleResolved {
        cycle_number: cycle_state.cycle_number,
        start_slot: cycle_state.start_slot,
        end_slot: cycle_state.end_slot,
        total_value_locked: cycle_state.total_value_locked,
        total_exposed_value: cycle_state.total_exposed_value,
        total_redistributed: redistributable_pool,
        fees_collected: protocol_fee,
        participants: cycle_state.participants,
        winners: 0,
        timestamp: clock.unix_timestamp,
    });

    if protocol_fee > 0 {
        emit!(FeeCollected {
            cycle_number: cycle_state.cycle_number,
            amount: protocol_fee,
            total_fees: config.total_fees_collected,
            timestamp: clock.unix_timestamp,
        });
    }

    msg!("Cycle {} resolved", cycle_state.cycle_number);
    msg!("Fee collected: {} lamports", protocol_fee);
    msg!("Next cycle: {}", next_cycle_number);

    Ok(())
}

pub fn claim_redistribution_handler(
    ctx: Context<ClaimRedistribution>,
    cycle_number: u64,
) -> Result<()> {
    let cycle_state = &mut ctx.accounts.cycle_state;
    let player_state = &mut ctx.accounts.player_state;
    let clock = Clock::get()?;

    require!(
        player_state.participating_in_cycle,
        SwarmArenaError::Unauthorized
    );
    require!(
        player_state.exposed_value > 0,
        SwarmArenaError::InvalidAccount
    );

    let redistribution = calculate_redistribution_share(
        player_state.exposed_value,
        player_state.exposure,
        cycle_state.total_exposed_value,
        cycle_state.total_redistributed,
    )?;

    if redistribution > 0 {
        player_state.balance = player_state
            .balance
            .checked_add(redistribution as u64)
            .ok_or(SwarmArenaError::ArithmeticOverflow)?;
        
        cycle_state.winners = cycle_state
            .winners
            .checked_add(1)
            .ok_or(SwarmArenaError::ArithmeticOverflow)?;
    } else if redistribution < 0 {
        let loss = redistribution.abs() as u64;
        player_state.balance = player_state
            .balance
            .checked_sub(loss)
            .ok_or(SwarmArenaError::ArithmeticUnderflow)?;
    }

    player_state.total_redistributed = player_state
        .total_redistributed
        .checked_add(redistribution)
        .ok_or(SwarmArenaError::ArithmeticOverflow)?;
    player_state.cycles_participated = player_state
        .cycles_participated
        .checked_add(1)
        .ok_or(SwarmArenaError::ArithmeticOverflow)?;
    player_state.score = player_state
        .score
        .checked_add(redistribution)
        .ok_or(SwarmArenaError::ArithmeticOverflow)?;
    player_state.last_action_slot = clock.slot;

    player_state.exposed_value = calculate_exposed_value(
        player_state.balance,
        player_state.exposure,
    )?;

    emit!(RewardDistributed {
        player: player_state.player,
        cycle_number,
        redistribution_amount: redistribution,
        new_balance: player_state.balance,
        new_score: player_state.score,
        timestamp: clock.unix_timestamp,
    });

    msg!("Redistribution: {} lamports", redistribution);
    msg!("New balance: {} lamports", player_state.balance);

    Ok(())
}

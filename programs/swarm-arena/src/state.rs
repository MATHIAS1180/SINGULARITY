use anchor_lang::prelude::*;

/// Global configuration for the Swarm Arena protocol
/// PDA seed: ["config"]
#[account]
pub struct GlobalConfig {
    /// Protocol authority (admin)
    pub authority: Pubkey,
    /// Protocol fee in basis points (200 = 2%)
    pub protocol_fee_bps: u16,
    /// Minimum deposit amount in lamports
    pub min_deposit: u64,
    /// Maximum deposit amount in lamports
    pub max_deposit: u64,
    /// Minimum exposure percentage (0-100)
    pub min_exposure: u8,
    /// Maximum exposure percentage (0-100)
    pub max_exposure: u8,
    /// Cycle duration in slots
    pub cycle_duration: u64,
    /// Cooldown period for exposure changes in slots
    pub exposure_cooldown: u64,
    /// Treasury vault for protocol fees
    pub treasury_vault: Pubkey,
    /// Total fees collected
    pub total_fees_collected: u64,
    /// Total cycles resolved
    pub total_cycles: u64,
    /// Protocol paused flag
    pub paused: bool,
    /// Bump seed for PDA
    pub bump: u8,
}

impl GlobalConfig {
    pub const LEN: usize = 8 + // discriminator
        32 + // authority
        2 + // protocol_fee_bps
        8 + // min_deposit
        8 + // max_deposit
        1 + // min_exposure
        1 + // max_exposure
        8 + // cycle_duration
        8 + // exposure_cooldown
        32 + // treasury_vault
        8 + // total_fees_collected
        8 + // total_cycles
        1 + // paused
        1; // bump
}

/// Current game state and active cycle
/// PDA seed: ["game_state"]
#[account]
pub struct GameState {
    /// Current cycle number
    pub current_cycle: u64,
    /// Cycle start slot
    pub cycle_start_slot: u64,
    /// Cycle end slot
    pub cycle_end_slot: u64,
    /// Total value locked in current cycle
    pub total_value_locked: u64,
    /// Total exposed value in current cycle
    pub total_exposed_value: u64,
    /// Number of active players
    pub active_players: u32,
    /// Cycle resolved flag
    pub cycle_resolved: bool,
    /// Last update slot
    pub last_update_slot: u64,
    /// Bump seed for PDA
    pub bump: u8,
}

impl GameState {
    pub const LEN: usize = 8 + // discriminator
        8 + // current_cycle
        8 + // cycle_start_slot
        8 + // cycle_end_slot
        8 + // total_value_locked
        8 + // total_exposed_value
        4 + // active_players
        1 + // cycle_resolved
        8 + // last_update_slot
        1; // bump
}

/// Historical cycle data for analytics
/// PDA seed: ["cycle", cycle_number.to_le_bytes()]
#[account]
pub struct CycleState {
    /// Cycle number
    pub cycle_number: u64,
    /// Start slot
    pub start_slot: u64,
    /// End slot
    pub end_slot: u64,
    /// Resolution slot
    pub resolved_slot: u64,
    /// Total value locked at resolution
    pub total_value_locked: u64,
    /// Total exposed value at resolution
    pub total_exposed_value: u64,
    /// Total redistributed amount
    pub total_redistributed: u64,
    /// Protocol fees collected
    pub fees_collected: u64,
    /// Number of participants
    pub participants: u32,
    /// Number of winners (players with positive redistribution)
    pub winners: u32,
    /// Resolved flag
    pub resolved: bool,
    /// Bump seed for PDA
    pub bump: u8,
}

impl CycleState {
    pub const LEN: usize = 8 + // discriminator
        8 + // cycle_number
        8 + // start_slot
        8 + // end_slot
        8 + // resolved_slot
        8 + // total_value_locked
        8 + // total_exposed_value
        8 + // total_redistributed
        8 + // fees_collected
        4 + // participants
        4 + // winners
        1 + // resolved
        1; // bump
}

/// Player account state
/// PDA seed: ["player", player_pubkey]
#[account]
pub struct PlayerState {
    /// Player wallet address
    pub player: Pubkey,
    /// Total deposited amount (lifetime)
    pub total_deposited: u64,
    /// Total withdrawn amount (lifetime)
    pub total_withdrawn: u64,
    /// Current balance in vault
    pub balance: u64,
    /// Current exposure percentage (0-100)
    pub exposure: u8,
    /// Exposed value (balance * exposure / 100)
    pub exposed_value: u64,
    /// Last exposure change slot
    pub last_exposure_change_slot: u64,
    /// Last action slot (for rate limiting)
    pub last_action_slot: u64,
    /// Total cycles participated
    pub cycles_participated: u64,
    /// Total redistributed amount received (can be negative as i64)
    pub total_redistributed: i64,
    /// Current cycle participation flag
    pub participating_in_cycle: bool,
    /// Registration slot
    pub registered_slot: u64,
    /// Player rank/score (for leaderboard)
    pub score: i64,
    /// Bump seed for PDA
    pub bump: u8,
}

impl PlayerState {
    pub const LEN: usize = 8 + // discriminator
        32 + // player
        8 + // total_deposited
        8 + // total_withdrawn
        8 + // balance
        1 + // exposure
        8 + // exposed_value
        8 + // last_exposure_change_slot
        8 + // last_action_slot
        8 + // cycles_participated
        8 + // total_redistributed (i64)
        1 + // participating_in_cycle
        8 + // registered_slot
        8 + // score (i64)
        1; // bump
}

/// Treasury vault account for protocol fees
/// PDA seed: ["treasury"]
#[account]
pub struct TreasuryVault {
    /// Authority (GlobalConfig)
    pub authority: Pubkey,
    /// Total fees collected
    pub total_collected: u64,
    /// Total fees withdrawn
    pub total_withdrawn: u64,
    /// Current balance
    pub balance: u64,
    /// Last withdrawal slot
    pub last_withdrawal_slot: u64,
    /// Bump seed for PDA
    pub bump: u8,
}

impl TreasuryVault {
    pub const LEN: usize = 8 + // discriminator
        32 + // authority
        8 + // total_collected
        8 + // total_withdrawn
        8 + // balance
        8 + // last_withdrawal_slot
        1; // bump
}
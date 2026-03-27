use anchor_lang::prelude::*;

/// Emitted when the protocol configuration is initialized
#[event]
pub struct ConfigInitialized {
    pub authority: Pubkey,
    pub protocol_fee_bps: u16,
    pub min_deposit: u64,
    pub max_deposit: u64,
    pub cycle_duration: u64,
    pub timestamp: i64,
}

/// Emitted when a new player registers
#[event]
pub struct PlayerRegistered {
    pub player: Pubkey,
    pub timestamp: i64,
    pub slot: u64,
}

/// Emitted when a player makes a deposit
#[event]
pub struct DepositMade {
    pub player: Pubkey,
    pub amount: u64,
    pub new_balance: u64,
    pub timestamp: i64,
    pub slot: u64,
}

/// Emitted when a player withdraws funds
#[event]
pub struct WithdrawMade {
    pub player: Pubkey,
    pub amount: u64,
    pub new_balance: u64,
    pub timestamp: i64,
    pub slot: u64,
}

/// Emitted when a player updates their exposure
#[event]
pub struct ExposureUpdated {
    pub player: Pubkey,
    pub old_exposure: u8,
    pub new_exposure: u8,
    pub exposed_value: u64,
    pub timestamp: i64,
    pub slot: u64,
}

/// Emitted when a cycle is resolved
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

/// Emitted when rewards are distributed to a player
#[event]
pub struct RewardDistributed {
    pub player: Pubkey,
    pub cycle_number: u64,
    pub redistribution_amount: i64,
    pub new_balance: u64,
    pub new_score: i64,
    pub timestamp: i64,
}

/// Emitted when protocol fees are collected
#[event]
pub struct FeeCollected {
    pub cycle_number: u64,
    pub amount: u64,
    pub total_fees: u64,
    pub timestamp: i64,
}

/// Emitted when a player's participation status changes
#[event]
pub struct ParticipationChanged {
    pub player: Pubkey,
    pub cycle_number: u64,
    pub participating: bool,
    pub exposed_value: u64,
    pub timestamp: i64,
}

/// Emitted when protocol is paused or unpaused
#[event]
pub struct ProtocolStatusChanged {
    pub paused: bool,
    pub authority: Pubkey,
    pub timestamp: i64,
}
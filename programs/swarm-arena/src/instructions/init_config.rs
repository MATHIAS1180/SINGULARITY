use anchor_lang::prelude::*;
use anchor_lang::system_program::{transfer, Transfer};
use crate::state::*;
use crate::events::*;
use crate::errors::SwarmArenaError;

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

    /// CHECK: PDA vault that holds player funds - initialized as system account
    #[account(
        mut,
        seeds = [b"vault"],
        bump
    )]
    pub vault: AccountInfo<'info>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}

pub fn handler(
    ctx: Context<InitializeConfig>,
    protocol_fee_bps: u16,
    min_deposit: u64,
    max_deposit: u64,
    min_exposure: u8,
    max_exposure: u8,
    cycle_duration: u64,
    exposure_cooldown: u64,
) -> Result<()> {
    // Validate parameters
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

    // Initialize GlobalConfig
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

    // Initialize GameState with first cycle
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

    // Initialize TreasuryVault
    treasury_vault.authority = config.key();
    treasury_vault.total_collected = 0;
    treasury_vault.total_withdrawn = 0;
    treasury_vault.balance = 0;
    treasury_vault.last_withdrawal_slot = 0;
    treasury_vault.bump = ctx.bumps.treasury_vault;

    // Initialize Vault PDA (player funds vault)
    // Transfer minimum rent to make it rent-exempt
    let vault_rent = Rent::get()?.minimum_balance(0);
    if vault_rent > 0 {
        let transfer_ctx = CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            Transfer {
                from: ctx.accounts.authority.to_account_info(),
                to: ctx.accounts.vault.to_account_info(),
            },
        );
        transfer(transfer_ctx, vault_rent)?;
    }

    // Emit initialization event
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
    msg!("Protocol fee: {}bps ({}%)", protocol_fee_bps, protocol_fee_bps / 100);
    msg!("Cycle duration: {} slots", cycle_duration);
    msg!("First cycle starts at slot: {}", game_state.cycle_start_slot);

    Ok(())
}
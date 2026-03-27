use anchor_lang::prelude::*;
use crate::state::*;
use crate::events::*;
use crate::errors::SwarmArenaError;

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

pub fn handler(ctx: Context<RegisterPlayer>) -> Result<()> {
    let config = &ctx.accounts.config;
    let player_state = &mut ctx.accounts.player_state;
    let clock = Clock::get()?;

    // Check if protocol is paused
    require!(!config.paused, SwarmArenaError::Unauthorized);

    // Initialize PlayerState
    player_state.player = ctx.accounts.player.key();
    player_state.total_deposited = 0;
    player_state.total_withdrawn = 0;
    player_state.balance = 0;
    player_state.exposure = 0; // Start with 0% exposure
    player_state.exposed_value = 0;
    player_state.last_exposure_change_slot = 0;
    player_state.last_action_slot = clock.slot;
    player_state.cycles_participated = 0;
    player_state.total_redistributed = 0;
    player_state.participating_in_cycle = false;
    player_state.registered_slot = clock.slot;
    player_state.score = 0;
    player_state.bump = ctx.bumps.player_state;

    // Emit registration event
    emit!(PlayerRegistered {
        player: player_state.player,
        timestamp: clock.unix_timestamp,
        slot: clock.slot,
    });

    msg!("Player registered successfully: {}", player_state.player);
    msg!("Registration slot: {}", player_state.registered_slot);

    Ok(())
}
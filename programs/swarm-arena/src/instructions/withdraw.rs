use anchor_lang::prelude::*;
use anchor_lang::system_program::{transfer, Transfer};
use crate::state::*;
use crate::events::*;
use crate::errors::SwarmArenaError;
use crate::math;

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

pub fn handler(ctx: Context<Withdraw>, amount: u64) -> Result<()> {
    let config = &ctx.accounts.config;
    let game_state = &mut ctx.accounts.game_state;
    let player_state = &mut ctx.accounts.player_state;
    let clock = Clock::get()?;

    // Security checks
    require!(!config.paused, SwarmArenaError::Unauthorized);
    require!(amount > 0, SwarmArenaError::InvalidWithdrawalAmount);
    require!(
        amount <= player_state.balance,
        SwarmArenaError::InvalidWithdrawalAmount
    );

    // Prevent withdrawal if player has active exposure
    // This ensures players can't withdraw while at risk in the current cycle
    require!(
        !player_state.participating_in_cycle || player_state.exposure == 0,
        SwarmArenaError::WithdrawalBlockedByExposure
    );

    // Calculate new balance
    let new_balance = player_state
        .balance
        .checked_sub(amount)
        .ok_or(SwarmArenaError::ArithmeticUnderflow)?;

    // Prepare vault seeds for signing
    let vault_bump = ctx.bumps.vault;
    let vault_seeds = &[b"vault".as_ref(), &[vault_bump]];
    let signer_seeds = &[&vault_seeds[..]];

    // Transfer SOL from vault to player using System Program with PDA signer
    let transfer_ctx = CpiContext::new_with_signer(
        ctx.accounts.system_program.to_account_info(),
        Transfer {
            from: ctx.accounts.vault.to_account_info(),
            to: ctx.accounts.player.to_account_info(),
        },
        signer_seeds,
    );
    transfer(transfer_ctx, amount)?;

    // Update player state
    player_state.balance = new_balance;
    player_state.total_withdrawn = player_state
        .total_withdrawn
        .checked_add(amount)
        .ok_or(SwarmArenaError::ArithmeticOverflow)?;
    player_state.last_action_slot = clock.slot;

    // Recalculate exposed value (should be 0 if withdrawal is allowed)
    player_state.exposed_value = math::calculate_exposed_value(
        player_state.balance,
        player_state.exposure,
    )?;

    // Update global TVL
    game_state.total_value_locked = game_state
        .total_value_locked
        .checked_sub(amount)
        .ok_or(SwarmArenaError::ArithmeticUnderflow)?;

    game_state.last_update_slot = clock.slot;

    // Emit withdrawal event
    emit!(WithdrawMade {
        player: player_state.player,
        amount,
        new_balance: player_state.balance,
        timestamp: clock.unix_timestamp,
        slot: clock.slot,
    });

    msg!("Withdrawal successful");
    msg!("Player: {}", player_state.player);
    msg!("Amount: {} lamports", amount);
    msg!("New balance: {} lamports", player_state.balance);

    Ok(())
}
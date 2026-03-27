use anchor_lang::prelude::*;
use anchor_lang::system_program::{transfer, Transfer};
use crate::state::*;
use crate::events::*;
use crate::errors::SwarmArenaError;
use crate::math;

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

pub fn handler(ctx: Context<Deposit>, amount: u64) -> Result<()> {
    let config = &ctx.accounts.config;
    let game_state = &mut ctx.accounts.game_state;
    let player_state = &mut ctx.accounts.player_state;
    let clock = Clock::get()?;

    // Security checks
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

    // Check that new balance won't overflow
    let new_balance = player_state
        .balance
        .checked_add(amount)
        .ok_or(SwarmArenaError::ArithmeticOverflow)?;

    // Transfer SOL from player to vault using System Program
    let transfer_ctx = CpiContext::new(
        ctx.accounts.system_program.to_account_info(),
        Transfer {
            from: ctx.accounts.player.to_account_info(),
            to: ctx.accounts.vault.to_account_info(),
        },
    );
    transfer(transfer_ctx, amount)?;

    // Update player state
    player_state.balance = new_balance;
    player_state.total_deposited = player_state
        .total_deposited
        .checked_add(amount)
        .ok_or(SwarmArenaError::ArithmeticOverflow)?;
    player_state.last_action_slot = clock.slot;

    // Recalculate exposed value if player has exposure set
    if player_state.exposure > 0 {
        player_state.exposed_value = math::calculate_exposed_value(
            player_state.balance,
            player_state.exposure,
        )?;
    }

    // Update global TVL
    game_state.total_value_locked = game_state
        .total_value_locked
        .checked_add(amount)
        .ok_or(SwarmArenaError::ArithmeticOverflow)?;

    // Update global exposed value if player is participating
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

    // Emit deposit event
    emit!(DepositMade {
        player: player_state.player,
        amount,
        new_balance: player_state.balance,
        timestamp: clock.unix_timestamp,
        slot: clock.slot,
    });

    msg!("Deposit successful");
    msg!("Player: {}", player_state.player);
    msg!("Amount: {} lamports", amount);
    msg!("New balance: {} lamports", player_state.balance);

    Ok(())
}
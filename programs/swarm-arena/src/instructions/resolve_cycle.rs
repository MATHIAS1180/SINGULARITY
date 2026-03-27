use anchor_lang::prelude::*;
use anchor_lang::system_program::{transfer, Transfer};
use crate::state::*;
use crate::events::*;
use crate::errors::SwarmArenaError;
use crate::math;

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

pub fn handler(ctx: Context<ResolveCycle>) -> Result<()> {
    let config = &mut ctx.accounts.config;
    let game_state = &mut ctx.accounts.game_state;
    let cycle_state = &mut ctx.accounts.cycle_state;
    let treasury_vault = &mut ctx.accounts.treasury_vault;
    let clock = Clock::get()?;

    // Verify cycle can be resolved
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

    // Calculate protocol fee and redistributable pool
    let (redistributable_pool, protocol_fee) = math::calculate_redistributable_pool(
        game_state.total_exposed_value,
        config.protocol_fee_bps as u64,
    )?;

    // Transfer protocol fee from vault to treasury
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

        // Update treasury vault state
        treasury_vault.total_collected = treasury_vault
            .total_collected
            .checked_add(protocol_fee)
            .ok_or(SwarmArenaError::ArithmeticOverflow)?;
        treasury_vault.balance = treasury_vault
            .balance
            .checked_add(protocol_fee)
            .ok_or(SwarmArenaError::ArithmeticOverflow)?;
    }

    // Initialize cycle state for historical record
    cycle_state.cycle_number = game_state.current_cycle;
    cycle_state.start_slot = game_state.cycle_start_slot;
    cycle_state.end_slot = game_state.cycle_end_slot;
    cycle_state.resolved_slot = clock.slot;
    cycle_state.total_value_locked = game_state.total_value_locked;
    cycle_state.total_exposed_value = game_state.total_exposed_value;
    cycle_state.total_redistributed = redistributable_pool;
    cycle_state.fees_collected = protocol_fee;
    cycle_state.participants = game_state.active_players;
    cycle_state.winners = 0; // Will be updated as players claim
    cycle_state.resolved = true;
    cycle_state.bump = ctx.bumps.cycle_state;

    // Update global config
    config.total_fees_collected = config
        .total_fees_collected
        .checked_add(protocol_fee)
        .ok_or(SwarmArenaError::ArithmeticOverflow)?;
    config.total_cycles = config
        .total_cycles
        .checked_add(1)
        .ok_or(SwarmArenaError::ArithmeticOverflow)?;

    // Mark cycle as resolved
    game_state.cycle_resolved = true;
    game_state.last_update_slot = clock.slot;

    // Prepare next cycle
    let next_cycle_number = game_state
        .current_cycle
        .checked_add(1)
        .ok_or(SwarmArenaError::ArithmeticOverflow)?;
    let next_cycle_start = clock.slot;
    let next_cycle_end = next_cycle_start
        .checked_add(config.cycle_duration)
        .ok_or(SwarmArenaError::ArithmeticOverflow)?;

    // Reset game state for next cycle
    game_state.current_cycle = next_cycle_number;
    game_state.cycle_start_slot = next_cycle_start;
    game_state.cycle_end_slot = next_cycle_end;
    game_state.cycle_resolved = false;
    // Note: TVL and exposed values remain, players keep their exposure settings

    // Emit cycle resolved event
    emit!(CycleResolved {
        cycle_number: cycle_state.cycle_number,
        start_slot: cycle_state.start_slot,
        end_slot: cycle_state.end_slot,
        total_value_locked: cycle_state.total_value_locked,
        total_exposed_value: cycle_state.total_exposed_value,
        total_redistributed: redistributable_pool,
        fees_collected: protocol_fee,
        participants: cycle_state.participants,
        winners: 0, // Updated as players claim
        timestamp: clock.unix_timestamp,
    });

    // Emit fee collected event
    if protocol_fee > 0 {
        emit!(FeeCollected {
            cycle_number: cycle_state.cycle_number,
            amount: protocol_fee,
            total_fees: config.total_fees_collected,
            timestamp: clock.unix_timestamp,
        });
    }

    msg!("Cycle {} resolved successfully", cycle_state.cycle_number);
    msg!("Total exposed value: {} lamports", cycle_state.total_exposed_value);
    msg!("Protocol fee collected: {} lamports", protocol_fee);
    msg!("Redistributable pool: {} lamports", redistributable_pool);
    msg!("Participants: {}", cycle_state.participants);
    msg!("Next cycle {} starts at slot {}", next_cycle_number, next_cycle_start);

    Ok(())
}

/// Instruction to claim redistribution for a specific player after cycle resolution
/// This is called separately for each player to avoid hitting compute limits
#[derive(Accounts)]
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

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct ClaimRedistributionParams {
    pub cycle_number: u64,
}

pub fn claim_redistribution_handler(
    ctx: Context<ClaimRedistribution>,
    cycle_number: u64,
) -> Result<()> {
    let config = &ctx.accounts.config;
    let cycle_state = &mut ctx.accounts.cycle_state;
    let player_state = &mut ctx.accounts.player_state;
    let clock = Clock::get()?;

    // Verify player participated in this cycle
    require!(
        player_state.participating_in_cycle,
        SwarmArenaError::Unauthorized
    );
    require!(
        player_state.exposed_value > 0,
        SwarmArenaError::InvalidAccount
    );

    // Calculate player's redistribution share
    let redistribution = math::calculate_redistribution_share(
        player_state.exposed_value,
        player_state.exposure,
        cycle_state.total_exposed_value,
        cycle_state.total_redistributed,
    )?;

    // Update player balance based on redistribution (can be negative)
    if redistribution > 0 {
        // Player won - add to balance
        player_state.balance = player_state
            .balance
            .checked_add(redistribution as u64)
            .ok_or(SwarmArenaError::ArithmeticOverflow)?;
        
        cycle_state.winners = cycle_state
            .winners
            .checked_add(1)
            .ok_or(SwarmArenaError::ArithmeticOverflow)?;
    } else if redistribution < 0 {
        // Player lost - subtract from balance
        let loss = redistribution.abs() as u64;
        player_state.balance = player_state
            .balance
            .checked_sub(loss)
            .ok_or(SwarmArenaError::ArithmeticUnderflow)?;
    }

    // Update player stats
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

    // Recalculate exposed value for next cycle
    player_state.exposed_value = math::calculate_exposed_value(
        player_state.balance,
        player_state.exposure,
    )?;

    // Emit reward distributed event
    emit!(RewardDistributed {
        player: player_state.player,
        cycle_number,
        redistribution_amount: redistribution,
        new_balance: player_state.balance,
        new_score: player_state.score,
        timestamp: clock.unix_timestamp,
    });

    msg!("Redistribution claimed for player: {}", player_state.player);
    msg!("Redistribution amount: {} lamports", redistribution);
    msg!("New balance: {} lamports", player_state.balance);
    msg!("New score: {}", player_state.score);

    Ok(())
}
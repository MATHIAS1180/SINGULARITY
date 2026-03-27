use anchor_lang::prelude::*;
use crate::state::*;
use crate::events::*;
use crate::errors::SwarmArenaError;
use crate::math;

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

pub fn handler(ctx: Context<SetExposure>, new_exposure: u8) -> Result<()> {
    let config = &ctx.accounts.config;
    let game_state = &mut ctx.accounts.game_state;
    let player_state = &mut ctx.accounts.player_state;
    let clock = Clock::get()?;

    // Security checks
    require!(!config.paused, SwarmArenaError::Unauthorized);

    // Validate exposure range
    require!(
        new_exposure >= config.min_exposure && new_exposure <= config.max_exposure,
        SwarmArenaError::ExposureOutOfRange
    );

    // Check cooldown period to prevent spam
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

    // Check that player has sufficient balance for exposure
    require!(
        player_state.balance > 0 || new_exposure == 0,
        SwarmArenaError::InsufficientBalanceForExposure
    );

    // Anti-sybil: Check meaningful balance if setting non-zero exposure
    if new_exposure > 0 {
        require!(
            math::is_meaningful_balance(player_state.balance),
            SwarmArenaError::InsufficientBalanceForExposure
        );
    }

    // Store old values for event
    let old_exposure = player_state.exposure;
    let old_exposed_value = player_state.exposed_value;

    // Calculate new exposed value
    let new_exposed_value = math::calculate_exposed_value(
        player_state.balance,
        new_exposure,
    )?;

    // Update player state
    player_state.exposure = new_exposure;
    player_state.exposed_value = new_exposed_value;
    player_state.last_exposure_change_slot = clock.slot;
    player_state.last_action_slot = clock.slot;

    // Update participation status
    let was_participating = player_state.participating_in_cycle;
    let now_participating = new_exposure > 0 && player_state.balance > 0;
    player_state.participating_in_cycle = now_participating;

    // Update global exposed value
    if was_participating {
        // Remove old exposed value
        game_state.total_exposed_value = game_state
            .total_exposed_value
            .checked_sub(old_exposed_value)
            .ok_or(SwarmArenaError::ArithmeticUnderflow)?;
    }

    if now_participating {
        // Add new exposed value
        game_state.total_exposed_value = game_state
            .total_exposed_value
            .checked_add(new_exposed_value)
            .ok_or(SwarmArenaError::ArithmeticOverflow)?;
    }

    // Update active players count
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

    // Emit exposure updated event
    emit!(ExposureUpdated {
        player: player_state.player,
        old_exposure,
        new_exposure,
        exposed_value: new_exposed_value,
        timestamp: clock.unix_timestamp,
        slot: clock.slot,
    });

    // Emit participation changed event if status changed
    if was_participating != now_participating {
        emit!(ParticipationChanged {
            player: player_state.player,
            cycle_number: game_state.current_cycle,
            participating: now_participating,
            exposed_value: new_exposed_value,
            timestamp: clock.unix_timestamp,
        });
    }

    msg!("Exposure updated successfully");
    msg!("Player: {}", player_state.player);
    msg!("Old exposure: {}%", old_exposure);
    msg!("New exposure: {}%", new_exposure);
    msg!("Exposed value: {} lamports", new_exposed_value);
    msg!("Participating: {}", now_participating);

    Ok(())
}
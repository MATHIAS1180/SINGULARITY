-- Swarm Arena Database Schema
-- PostgreSQL 14+

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========================================
-- Core Tables
-- ========================================

-- Players table
CREATE TABLE IF NOT EXISTS players (
    id SERIAL PRIMARY KEY,
    wallet VARCHAR(44) NOT NULL UNIQUE,
    balance BIGINT NOT NULL DEFAULT 0,
    exposure SMALLINT NOT NULL DEFAULT 0 CHECK (exposure >= 0 AND exposure <= 100),
    exposed_value BIGINT NOT NULL DEFAULT 0,
    total_deposited BIGINT NOT NULL DEFAULT 0,
    total_withdrawn BIGINT NOT NULL DEFAULT 0,
    total_redistributed BIGINT NOT NULL DEFAULT 0,
    cycles_participated INTEGER NOT NULL DEFAULT 0,
    score BIGINT NOT NULL DEFAULT 0,
    participating_in_cycle BOOLEAN NOT NULL DEFAULT FALSE,
    last_exposure_change_slot BIGINT,
    last_action_slot BIGINT,
    registered_slot BIGINT NOT NULL,
    registered_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    
    CONSTRAINT positive_balance CHECK (balance >= 0),
    CONSTRAINT positive_exposed_value CHECK (exposed_value >= 0)
);

-- Game states table (current state snapshots)
CREATE TABLE IF NOT EXISTS game_states (
    id SERIAL PRIMARY KEY,
    current_cycle BIGINT NOT NULL,
    cycle_start_slot BIGINT NOT NULL,
    cycle_end_slot BIGINT NOT NULL,
    total_value_locked BIGINT NOT NULL DEFAULT 0,
    total_exposed_value BIGINT NOT NULL DEFAULT 0,
    active_players INTEGER NOT NULL DEFAULT 0,
    cycle_resolved BOOLEAN NOT NULL DEFAULT FALSE,
    last_update_slot BIGINT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Cycles table (historical cycle data)
CREATE TABLE IF NOT EXISTS cycles (
    id SERIAL PRIMARY KEY,
    cycle_number BIGINT NOT NULL UNIQUE,
    start_slot BIGINT NOT NULL,
    end_slot BIGINT NOT NULL,
    resolved_slot BIGINT NOT NULL,
    total_value_locked BIGINT NOT NULL,
    total_exposed_value BIGINT NOT NULL,
    total_redistributed BIGINT NOT NULL,
    fees_collected BIGINT NOT NULL,
    participants INTEGER NOT NULL DEFAULT 0,
    winners INTEGER NOT NULL DEFAULT 0,
    losers INTEGER NOT NULL DEFAULT 0,
    resolved BOOLEAN NOT NULL DEFAULT TRUE,
    resolved_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ========================================
-- Transaction Tables
-- ========================================

-- Deposits table
CREATE TABLE IF NOT EXISTS deposits (
    id SERIAL PRIMARY KEY,
    player_wallet VARCHAR(44) NOT NULL,
    amount BIGINT NOT NULL,
    new_balance BIGINT NOT NULL,
    slot BIGINT NOT NULL,
    signature VARCHAR(88) NOT NULL UNIQUE,
    timestamp TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    
    CONSTRAINT positive_deposit_amount CHECK (amount > 0),
    FOREIGN KEY (player_wallet) REFERENCES players(wallet) ON DELETE CASCADE
);

-- Withdrawals table
CREATE TABLE IF NOT EXISTS withdrawals (
    id SERIAL PRIMARY KEY,
    player_wallet VARCHAR(44) NOT NULL,
    amount BIGINT NOT NULL,
    new_balance BIGINT NOT NULL,
    slot BIGINT NOT NULL,
    signature VARCHAR(88) NOT NULL UNIQUE,
    timestamp TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    
    CONSTRAINT positive_withdrawal_amount CHECK (amount > 0),
    FOREIGN KEY (player_wallet) REFERENCES players(wallet) ON DELETE CASCADE
);

-- Exposure updates table
CREATE TABLE IF NOT EXISTS exposure_updates (
    id SERIAL PRIMARY KEY,
    player_wallet VARCHAR(44) NOT NULL,
    old_exposure SMALLINT NOT NULL,
    new_exposure SMALLINT NOT NULL,
    exposed_value BIGINT NOT NULL,
    slot BIGINT NOT NULL,
    signature VARCHAR(88) NOT NULL UNIQUE,
    timestamp TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    
    FOREIGN KEY (player_wallet) REFERENCES players(wallet) ON DELETE CASCADE
);

-- Rewards/Redistributions table
CREATE TABLE IF NOT EXISTS redistributions (
    id SERIAL PRIMARY KEY,
    player_wallet VARCHAR(44) NOT NULL,
    cycle_number BIGINT NOT NULL,
    redistribution_amount BIGINT NOT NULL,
    new_balance BIGINT NOT NULL,
    new_score BIGINT NOT NULL,
    signature VARCHAR(88) NOT NULL UNIQUE,
    timestamp TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    
    FOREIGN KEY (player_wallet) REFERENCES players(wallet) ON DELETE CASCADE,
    FOREIGN KEY (cycle_number) REFERENCES cycles(cycle_number) ON DELETE CASCADE
);

-- Fees table
CREATE TABLE IF NOT EXISTS fees (
    id SERIAL PRIMARY KEY,
    cycle_number BIGINT NOT NULL,
    amount BIGINT NOT NULL,
    total_fees BIGINT NOT NULL,
    signature VARCHAR(88) NOT NULL UNIQUE,
    timestamp TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    
    CONSTRAINT positive_fee_amount CHECK (amount > 0),
    FOREIGN KEY (cycle_number) REFERENCES cycles(cycle_number) ON DELETE CASCADE
);

-- ========================================
-- Activity & Events Tables
-- ========================================

-- Activity events table (unified event log)
CREATE TABLE IF NOT EXISTS activity_events (
    id SERIAL PRIMARY KEY,
    event_type VARCHAR(50) NOT NULL,
    player_wallet VARCHAR(44),
    cycle_number BIGINT,
    amount BIGINT,
    metadata JSONB,
    slot BIGINT NOT NULL,
    signature VARCHAR(88) NOT NULL,
    timestamp TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    
    CONSTRAINT valid_event_type CHECK (event_type IN (
        'player_registered',
        'deposit',
        'withdrawal',
        'exposure_updated',
        'cycle_resolved',
        'reward_distributed',
        'fee_collected'
    ))
);

-- ========================================
-- Analytics Tables
-- ========================================

-- Leaderboard snapshots table
CREATE TABLE IF NOT EXISTS leaderboard_snapshots (
    id SERIAL PRIMARY KEY,
    cycle_number BIGINT NOT NULL,
    player_wallet VARCHAR(44) NOT NULL,
    rank INTEGER NOT NULL,
    score BIGINT NOT NULL,
    balance BIGINT NOT NULL,
    total_redistributed BIGINT NOT NULL,
    cycles_participated INTEGER NOT NULL,
    snapshot_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    
    FOREIGN KEY (player_wallet) REFERENCES players(wallet) ON DELETE CASCADE,
    FOREIGN KEY (cycle_number) REFERENCES cycles(cycle_number) ON DELETE CASCADE,
    UNIQUE (cycle_number, player_wallet)
);

-- Indexer state table (track indexing progress)
CREATE TABLE IF NOT EXISTS indexer_state (
    id SERIAL PRIMARY KEY,
    last_processed_slot BIGINT NOT NULL,
    last_processed_signature VARCHAR(88),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ========================================
-- Indexes
-- ========================================

-- Players indexes
CREATE INDEX IF NOT EXISTS idx_players_wallet ON players(wallet);
CREATE INDEX IF NOT EXISTS idx_players_score ON players(score DESC);
CREATE INDEX IF NOT EXISTS idx_players_balance ON players(balance DESC);
CREATE INDEX IF NOT EXISTS idx_players_participating ON players(participating_in_cycle);
CREATE INDEX IF NOT EXISTS idx_players_registered_at ON players(registered_at);

-- Cycles indexes
CREATE INDEX IF NOT EXISTS idx_cycles_cycle_number ON cycles(cycle_number);
CREATE INDEX IF NOT EXISTS idx_cycles_resolved_at ON cycles(resolved_at DESC);
CREATE INDEX IF NOT EXISTS idx_cycles_tvl ON cycles(total_value_locked DESC);

-- Deposits indexes
CREATE INDEX IF NOT EXISTS idx_deposits_player ON deposits(player_wallet);
CREATE INDEX IF NOT EXISTS idx_deposits_timestamp ON deposits(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_deposits_slot ON deposits(slot);

-- Withdrawals indexes
CREATE INDEX IF NOT EXISTS idx_withdrawals_player ON withdrawals(player_wallet);
CREATE INDEX IF NOT EXISTS idx_withdrawals_timestamp ON withdrawals(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_withdrawals_slot ON withdrawals(slot);

-- Exposure updates indexes
CREATE INDEX IF NOT EXISTS idx_exposure_player ON exposure_updates(player_wallet);
CREATE INDEX IF NOT EXISTS idx_exposure_timestamp ON exposure_updates(timestamp DESC);

-- Redistributions indexes
CREATE INDEX IF NOT EXISTS idx_redistributions_player ON redistributions(player_wallet);
CREATE INDEX IF NOT EXISTS idx_redistributions_cycle ON redistributions(cycle_number);
CREATE INDEX IF NOT EXISTS idx_redistributions_amount ON redistributions(redistribution_amount DESC);
CREATE INDEX IF NOT EXISTS idx_redistributions_timestamp ON redistributions(timestamp DESC);

-- Fees indexes
CREATE INDEX IF NOT EXISTS idx_fees_cycle ON fees(cycle_number);
CREATE INDEX IF NOT EXISTS idx_fees_timestamp ON fees(timestamp DESC);

-- Activity events indexes
CREATE INDEX IF NOT EXISTS idx_activity_type ON activity_events(event_type);
CREATE INDEX IF NOT EXISTS idx_activity_player ON activity_events(player_wallet);
CREATE INDEX IF NOT EXISTS idx_activity_cycle ON activity_events(cycle_number);
CREATE INDEX IF NOT EXISTS idx_activity_timestamp ON activity_events(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_activity_slot ON activity_events(slot);

-- Leaderboard snapshots indexes
CREATE INDEX IF NOT EXISTS idx_leaderboard_cycle ON leaderboard_snapshots(cycle_number);
CREATE INDEX IF NOT EXISTS idx_leaderboard_player ON leaderboard_snapshots(player_wallet);
CREATE INDEX IF NOT EXISTS idx_leaderboard_rank ON leaderboard_snapshots(cycle_number, rank);

-- ========================================
-- Functions & Triggers
-- ========================================

-- Update updated_at timestamp automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for players table
CREATE TRIGGER update_players_updated_at
    BEFORE UPDATE ON players
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger for game_states table
CREATE TRIGGER update_game_states_updated_at
    BEFORE UPDATE ON game_states
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- Initial Data
-- ========================================

-- Insert initial indexer state
INSERT INTO indexer_state (last_processed_slot, last_processed_signature)
VALUES (0, NULL)
ON CONFLICT DO NOTHING;

-- ========================================
-- Views (Optional)
-- ========================================

-- Active players view
CREATE OR REPLACE VIEW active_players_view AS
SELECT 
    wallet,
    balance,
    exposure,
    exposed_value,
    score,
    cycles_participated,
    total_redistributed
FROM players
WHERE participating_in_cycle = TRUE
ORDER BY score DESC;

-- Recent activity view
CREATE OR REPLACE VIEW recent_activity_view AS
SELECT 
    event_type,
    player_wallet,
    cycle_number,
    amount,
    timestamp
FROM activity_events
ORDER BY timestamp DESC
LIMIT 100;

-- Top players view
CREATE OR REPLACE VIEW top_players_view AS
SELECT 
    ROW_NUMBER() OVER (ORDER BY score DESC) as rank,
    wallet,
    score,
    balance,
    total_redistributed,
    cycles_participated
FROM players
ORDER BY score DESC
LIMIT 100;
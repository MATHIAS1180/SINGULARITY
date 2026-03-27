# Swarm Arena - Solpg Deployment Guide

## Overview
This guide walks you through deploying the Swarm Arena smart contract to Solana Devnet using Solpg (Solana Playground).

## Prerequisites
- Solana wallet with Devnet SOL (for deployment fees)
- Access to https://beta.solpg.io

## Step 1: Prepare the Smart Contract

The smart contract has been consolidated into a single file for Solpg compatibility:
- **File**: `programs/swarm-arena/src/lib.rs`
- **Status**: Ready to copy/paste into Solpg
- **Size**: ~600 lines (all modules consolidated)

### What was consolidated:
- All state structures (GlobalConfig, GameState, CycleState, PlayerState, TreasuryVault)
- All errors (SwarmArenaError enum with 30+ error types)
- All events (10 event types for indexing)
- All math functions (fee calculation, exposure scoring, redistribution logic)
- All instruction contexts (6 instruction account structures)
- All instruction handlers (7 instruction implementations)

### Key features preserved:
- 2% protocol fee
- Anti-whale mechanism (20% threshold, 50% penalty)
- Anti-sybil protection (minimum 0.001 SOL balance)
- Exposure cooldown system
- P2P redistribution logic
- Cycle-based game mechanics

## Step 2: Deploy to Solpg

1. Go to https://beta.solpg.io
2. Create a new project or open existing
3. Delete default code in `lib.rs`
4. Copy entire content from `programs/swarm-arena/src/lib.rs`
5. Paste into Solpg editor
6. Click "Build" button (wait for compilation)
7. Click "Deploy" button
8. Confirm transaction in your wallet
9. **IMPORTANT**: Copy the generated Program ID from Solpg

## Step 3: Update Program ID Across Project

After deployment, Solpg will give you a Program ID like:
`7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU`

You MUST update this ID in 4 files:

### File 1: `programs/swarm-arena/src/lib.rs`
```rust
// Replace this line:
declare_id!("SwrmXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX");

// With your actual Program ID:
declare_id!("YOUR_PROGRAM_ID_HERE");
```

### File 2: `lib/solana.ts`
```typescript
// Replace this line:
export const PROGRAM_ID = new PublicKey('SwrmXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX');

// With:
export const PROGRAM_ID = new PublicKey('YOUR_PROGRAM_ID_HERE');
```

### File 3: `shared/protocol.ts`
```typescript
// Replace this line:
export const PROGRAM_ID = 'SwrmXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX';

// With:
export const PROGRAM_ID = 'YOUR_PROGRAM_ID_HERE';
```

### File 4: `backend/src/config.ts`
```typescript
// Replace this line:
PROGRAM_ID: 'SwrmXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',

// With:
PROGRAM_ID: 'YOUR_PROGRAM_ID_HERE',
```

## Step 4: Initialize the Protocol

After deployment, you need to call `initialize_config` once:

```bash
# Using Solpg UI or Anchor CLI
anchor run initialize
```

Parameters:
- `protocol_fee_bps`: 200 (2%)
- `min_deposit`: 1000000 (0.001 SOL)
- `max_deposit`: 1000000000 (1 SOL)
- `min_exposure`: 0 (0%)
- `max_exposure`: 100 (100%)
- `cycle_duration`: 100 (slots)
- `exposure_cooldown`: 10 (slots)

## Step 5: Generate and Update IDL

After successful deployment:

1. Solpg automatically generates the IDL
2. Download the IDL JSON from Solpg
3. Save it as `target/idl/swarm_arena.json`
4. The frontend will use this IDL to interact with the program

## Step 6: Test on Devnet

Test all instructions:
1. Register player
2. Deposit SOL
3. Set exposure
4. Wait for cycle to end
5. Resolve cycle
6. Claim redistribution

## Troubleshooting

### Build fails in Solpg
- Check Anchor version compatibility
- Verify all imports are from `anchor_lang::prelude::*`
- Ensure no external crate dependencies

### Deployment fails
- Ensure wallet has enough Devnet SOL (get from faucet)
- Check Solpg console for specific errors
- Verify program size is under limits

### Program ID not updating
- Make sure to copy the EXACT Program ID from Solpg
- Update all 4 files listed above
- Rebuild frontend after updating

## Next Steps

After successful deployment:
1. Update Program ID in all 4 files
2. Test instructions via Solpg UI
3. Deploy frontend to Vercel (see DEPLOYMENT_AUDIT.md)
4. Configure backend indexer with Program ID
5. Monitor events and transactions on Solana Explorer

## Useful Links

- Solpg: https://beta.solpg.io
- Devnet Faucet: https://faucet.solana.com
- Solana Explorer (Devnet): https://explorer.solana.com/?cluster=devnet
- Anchor Docs: https://www.anchor-lang.com

## Notes

- The consolidated lib.rs is ~600 lines
- All functionality from the modular version is preserved
- No tests included (Solpg doesn't run tests)
- Program uses only standard Anchor features
- Compatible with Anchor 0.28+ and Solana 1.16+

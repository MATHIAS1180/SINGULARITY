# Swarm Arena - Complete Deployment Checklist

## Phase 1: Smart Contract Deployment (Solpg)

### Pre-Deployment
- [x] Smart contract consolidated into single file
- [x] All modules merged into lib.rs
- [x] Tests removed (Solpg doesn't support)
- [x] Module system removed
- [x] File ready for copy/paste

### Solpg Deployment
- [ ] Go to https://beta.solpg.io
- [ ] Connect wallet (ensure Devnet SOL available)
- [ ] Create new project or open existing
- [ ] Copy entire `programs/swarm-arena/src/lib.rs`
- [ ] Paste into Solpg editor
- [ ] Click "Build" button
- [ ] Wait for successful compilation
- [ ] Click "Deploy" button
- [ ] Confirm transaction in wallet
- [ ] **COPY THE PROGRAM ID** (critical!)

### Post-Deployment
- [ ] Save Program ID somewhere safe
- [ ] Verify deployment on Solana Explorer (Devnet)
- [ ] Download IDL JSON from Solpg
- [ ] Save IDL as `target/idl/swarm_arena.json`

## Phase 2: Update Program ID

Update in these 4 files:

### File 1: programs/swarm-arena/src/lib.rs
```rust
// Line 7
declare_id!("YOUR_PROGRAM_ID_HERE");
```

### File 2: lib/solana.ts
```typescript
// Search for: SwrmXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
export const PROGRAM_ID = new PublicKey('YOUR_PROGRAM_ID_HERE');
```

### File 3: shared/protocol.ts
```typescript
// Search for: SwrmXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
export const PROGRAM_ID = 'YOUR_PROGRAM_ID_HERE';
```

### File 4: backend/src/config.ts
```typescript
// Search for: SwrmXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
PROGRAM_ID: 'YOUR_PROGRAM_ID_HERE',
```

## Phase 3: Initialize Protocol

### Via Solpg UI
Call `initialize_config` with these exact parameters:

```
protocol_fee_bps: 200          // 2% fee
min_deposit: 1000000           // 0.001 SOL
max_deposit: 1000000000        // 1 SOL
min_exposure: 0                // 0%
max_exposure: 100              // 100%
cycle_duration: 100            // ~40 seconds
exposure_cooldown: 10          // ~4 seconds
```

### Verify Initialization
- [ ] Transaction confirmed
- [ ] Config account created
- [ ] GameState account created
- [ ] TreasuryVault account created
- [ ] ConfigInitialized event emitted
- [ ] Check on Solana Explorer

## Phase 4: Test Smart Contract

Test each instruction in order:

### 1. Register Player
- [ ] Call `register_player`
- [ ] Verify PlayerState account created
- [ ] Check PlayerRegistered event

### 2. Deposit
- [ ] Call `deposit` with amount: 10000000 (0.01 SOL)
- [ ] Verify balance updated
- [ ] Check DepositMade event
- [ ] Verify vault received SOL

### 3. Set Exposure
- [ ] Call `set_exposure` with new_exposure: 50
- [ ] Verify exposure updated
- [ ] Check ExposureUpdated event
- [ ] Verify participating_in_cycle = true

### 4. Wait for Cycle End
- [ ] Wait ~1 minute (100 slots)
- [ ] Check current slot vs cycle_end_slot

### 5. Resolve Cycle
- [ ] Call `resolve_cycle`
- [ ] Verify CycleState account created
- [ ] Check CycleResolved event
- [ ] Verify fees transferred to treasury
- [ ] Verify next cycle started

### 6. Claim Redistribution
- [ ] Call `claim_redistribution` with cycle_number: 1
- [ ] Verify balance updated
- [ ] Check RewardDistributed event
- [ ] Verify score updated

### 7. Withdraw
- [ ] Set exposure to 0 first
- [ ] Call `withdraw` with amount
- [ ] Verify SOL returned to wallet
- [ ] Check WithdrawMade event

## Phase 5: Frontend Deployment (Vercel)

### Pre-Deployment
- [ ] Program ID updated in all files
- [ ] IDL file saved in project
- [ ] Environment variables configured
- [ ] Build tested locally

### Environment Variables
Create `.env.local`:
```
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_PROGRAM_ID=YOUR_PROGRAM_ID_HERE
NEXT_PUBLIC_RPC_ENDPOINT=https://api.devnet.solana.com
```

### Vercel Deployment
- [ ] Push code to GitHub
- [ ] Connect repo to Vercel
- [ ] Configure environment variables in Vercel
- [ ] Deploy
- [ ] Verify build succeeds
- [ ] Test deployed site

### Post-Deployment Testing
- [ ] Connect wallet on deployed site
- [ ] Test register player
- [ ] Test deposit
- [ ] Test set exposure
- [ ] Test withdraw
- [ ] Verify all UI components work
- [ ] Check responsive design (mobile/desktop)

## Phase 6: Backend Deployment (Optional)

### If deploying backend:
- [ ] Configure PostgreSQL database
- [ ] Update DATABASE_URL in config
- [ ] Update PROGRAM_ID in config
- [ ] Deploy to hosting service
- [ ] Run database migrations
- [ ] Start indexer service
- [ ] Verify event indexing works
- [ ] Test API endpoints

### If skipping backend:
- [ ] Frontend works without backend
- [ ] Uses direct RPC calls only
- [ ] No leaderboard/analytics
- [ ] No activity feed

## Phase 7: Final Verification

### Smart Contract
- [ ] All instructions working
- [ ] Events emitting correctly
- [ ] PDAs deriving properly
- [ ] Math calculations accurate
- [ ] Security features active

### Frontend
- [ ] Wallet connection works
- [ ] All pages load
- [ ] Transactions submit successfully
- [ ] UI updates after transactions
- [ ] Error handling works

### Integration
- [ ] Frontend → Smart Contract communication
- [ ] Program ID matches everywhere
- [ ] RPC endpoint configured correctly
- [ ] Transaction confirmations working

## Troubleshooting

### Build fails in Solpg
- Check Anchor version compatibility
- Verify no syntax errors
- Check program size limits

### Deployment fails
- Ensure wallet has Devnet SOL
- Check transaction logs
- Verify account sizes correct

### Frontend can't connect
- Verify Program ID updated
- Check RPC endpoint
- Verify wallet adapter configured

### Transactions fail
- Check account derivation
- Verify instruction parameters
- Check error messages in logs

## Success Criteria

✅ Smart contract deployed to Devnet
✅ Program ID propagated to all files
✅ Protocol initialized successfully
✅ All 7 instructions tested and working
✅ Frontend deployed to Vercel
✅ End-to-end flow works (register → deposit → expose → cycle → claim → withdraw)

## Resources

- Solpg: https://beta.solpg.io
- Devnet Faucet: https://faucet.solana.com
- Solana Explorer: https://explorer.solana.com/?cluster=devnet
- Vercel: https://vercel.com
- Anchor Docs: https://www.anchor-lang.com

## Estimated Timeline

- Smart contract deployment: 10 minutes
- Program ID updates: 5 minutes
- Protocol initialization: 5 minutes
- Smart contract testing: 15 minutes
- Frontend deployment: 10 minutes
- End-to-end testing: 15 minutes

**Total: ~1 hour**

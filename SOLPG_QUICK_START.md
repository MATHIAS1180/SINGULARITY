# Solpg Quick Start - Swarm Arena

## 🚀 Deploy in 5 Minutes

### 1. Copy Smart Contract
Open `programs/swarm-arena/src/lib.rs` and copy ALL content (~600 lines)

### 2. Paste into Solpg
- Go to https://beta.solpg.io
- Create new project
- Delete default code
- Paste your code
- Click "Build" ✅
- Click "Deploy" 🚀

### 3. Copy Program ID
After deployment, Solpg shows your Program ID:
```
Example: 7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU
```

### 4. Update 4 Files

Replace `SwrmXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX` with your Program ID:

1. `programs/swarm-arena/src/lib.rs` (line 7)
2. `lib/solana.ts` (search for PROGRAM_ID)
3. `shared/protocol.ts` (search for PROGRAM_ID)
4. `backend/src/config.ts` (search for PROGRAM_ID)

### 5. Initialize Protocol

In Solpg, call `initialize_config` with:
```
protocol_fee_bps: 200
min_deposit: 1000000
max_deposit: 1000000000
min_exposure: 0
max_exposure: 100
cycle_duration: 100
exposure_cooldown: 10
```

### 6. Test Instructions

Try in order:
1. `register_player` - Register yourself
2. `deposit` - Deposit 0.01 SOL (10000000 lamports)
3. `set_exposure` - Set exposure to 50%
4. Wait ~1 minute (100 slots)
5. `resolve_cycle` - End the cycle
6. `claim_redistribution` - Claim your share

## ✅ Done!

Your smart contract is live on Devnet. Next:
- Deploy frontend to Vercel
- Update frontend with Program ID
- Test full flow

## 📝 Notes

- File is 100% Solpg compatible (single file, no modules)
- All 7 instructions included
- All math logic preserved
- Anti-whale & anti-sybil protection active
- 2% protocol fee hardcoded

## 🔗 Links

- Solpg: https://beta.solpg.io
- Devnet Faucet: https://faucet.solana.com
- Explorer: https://explorer.solana.com/?cluster=devnet

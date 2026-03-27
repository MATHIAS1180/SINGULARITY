# Swarm Arena

A 100% on-chain P2P competition game built on Solana where players compete through strategic exposure management and risk-taking.

## 🚀 Quick Start - Deploy to Vercel

**The project is production-ready!** Deploy in 2 minutes:

```bash
# Install dependencies
npm install

# Deploy to Vercel
npx vercel --prod
```

Or use the Vercel dashboard: https://vercel.com/new

**See [GUIDE_DEPLOIEMENT_VERCEL.md](./GUIDE_DEPLOIEMENT_VERCEL.md) for detailed instructions.**

---

## Vision

Swarm Arena is a zero-sum game where players deposit SOL, set their exposure level (0-100%), and compete in cycles. At the end of each cycle, funds are redistributed based on exposure and balance, with higher exposure yielding higher potential rewards but also higher risk. The protocol takes a 2% fee, and the rest is redistributed among participants.

**Core Mechanics:**
- Players deposit SOL into the protocol
- Set exposure percentage (0-100%) to participate in cycles
- Higher exposure = higher risk & reward potential
- Cycles resolve automatically, redistributing funds based on weighted exposure
- Anti-whale and anti-sybil mechanisms ensure fair play
- All logic runs on-chain with no trusted intermediaries

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend                             │
│                    (Next.js 14 + React)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  Dashboard   │  │  Leaderboard │  │   Activity   │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└────────────┬────────────────────────────────────────────────┘
             │
             │ RPC + WebSocket
             │
┌────────────▼────────────────────────────────────────────────┐
│                    Solana Blockchain                         │
│  ┌──────────────────────────────────────────────────────┐  │
│  │           Swarm Arena Program (Rust/Anchor)          │  │
│  │  • Player registration & state management            │  │
│  │  • Deposit/withdraw with validation                  │  │
│  │  • Exposure updates with cooldown                    │  │
│  │  • Cycle resolution & redistribution                 │  │
│  │  • Fee collection & treasury management              │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────┬────────────────────────────────────────────────┘
             │
             │ Event Listening
             │
┌────────────▼────────────────────────────────────────────────┐
│                    Backend Indexer                           │
│                  (Node.js + TypeScript)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Indexer    │  │  Leaderboard │  │  Analytics   │     │
│  │   Service    │  │   Service    │  │   Service    │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                           │                                  │
│                    ┌──────▼──────┐                          │
│                    │  PostgreSQL │                          │
│                    └─────────────┘                          │
└─────────────────────────────────────────────────────────────┘
```

## Tech Stack

### Smart Contract
- **Language:** Rust
- **Framework:** Anchor 0.29+
- **Blockchain:** Solana (devnet/mainnet)
- **Math:** Fixed-point integer arithmetic (no floats)

### Backend
- **Runtime:** Node.js 18+
- **Language:** TypeScript
- **Framework:** Express.js
- **Database:** PostgreSQL 14+
- **ORM:** Raw SQL (for performance)

### Frontend
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Wallet:** Solana Wallet Adapter
- **State:** React Query
- **UI:** Custom components with glassmorphism

### Shared
- **Types:** TypeScript (shared across all layers)
- **Math:** Replicated logic between Rust and TS
- **Protocol:** Centralized constants and validation

## Repository Structure

```
swarm-arena/
├── programs/
│   └── swarm-arena/
│       └── src/
│           ├── lib.rs              # Program entry point
│           ├── state.rs            # Account structures
│           ├── math.rs             # Core math logic
│           ├── events.rs           # Event definitions
│           ├── errors.rs           # Error codes
│           └── instructions/       # Instruction handlers
│               ├── init_config.rs
│               ├── register_player.rs
│               ├── deposit.rs
│               ├── withdraw.rs
│               ├── set_exposure.rs
│               └── resolve_cycle.rs
│
├── backend/
│   └── src/
│       ├── index.ts                # Entry point
│       ├── server.ts               # Express server
│       ├── config.ts               # Configuration
│       ├── routes/                 # API routes
│       ├── services/               # Business logic
│       │   ├── indexer.service.ts
│       │   ├── leaderboard.service.ts
│       │   └── analytics.service.ts
│       ├── db/
│       │   └── schema.sql          # Database schema
│       └── utils/                  # Utilities
│
├── app/                            # Next.js pages
│   ├── layout.tsx
│   ├── page.tsx                    # Landing page
│   ├── dashboard/
│   ├── leaderboard/
│   ├── activity/
│   └── profile/
│
├── components/                     # React components
│   ├── game/                       # Game-specific
│   ├── ui/                         # Reusable UI
│   └── wallet/                     # Wallet integration
│
├── lib/                            # Frontend utilities
│   ├── solana.ts                   # Solana helpers
│   ├── anchor.ts                   # Anchor client
│   ├── api.ts                      # Backend API client
│   └── constants.ts                # Frontend constants
│
├── shared/                         # Shared code
│   ├── protocol.ts                 # Protocol constants
│   ├── math.ts                     # Math functions (TS)
│   └── types.ts                    # Shared types
│
├── tests/                          # Integration tests
│   ├── swarm-arena.ts
│   └── helpers.ts
│
├── Anchor.toml                     # Anchor config
├── Cargo.toml                      # Rust workspace
└── package.json                    # Node dependencies
```

## Setup Instructions

### Prerequisites

- **Rust:** 1.70+
- **Solana CLI:** 1.17+
- **Anchor CLI:** 0.29+
- **Node.js:** 18+
- **PostgreSQL:** 14+
- **Yarn or npm**

### 1. Clone Repository

```bash
git clone https://github.com/your-org/swarm-arena.git
cd swarm-arena
```

### 2. Install Dependencies

```bash
# Install Rust dependencies
cargo build

# Install Node dependencies
yarn install
# or
npm install
```

### 3. Configure Solana

```bash
# Set to devnet
solana config set --url devnet

# Create a keypair (if needed)
solana-keygen new

# Airdrop SOL for testing
solana airdrop 2
```

### 4. Build Smart Contract

```bash
# Build the program
anchor build

# Get program ID
anchor keys list

# Update program ID in:
# - Anchor.toml
# - programs/swarm-arena/src/lib.rs (declare_id!)
# - shared/protocol.ts (PROTOCOL_INFO.programId)
```

### 5. Setup Database

```bash
# Create database
createdb swarm_arena

# Run schema
psql swarm_arena < backend/src/db/schema.sql
```

### 6. Configure Environment

Create `.env` file:

```env
# Solana
NEXT_PUBLIC_SOLANA_CLUSTER=devnet
NEXT_PUBLIC_SOLANA_RPC_DEVNET=https://api.devnet.solana.com

# Backend
NEXT_PUBLIC_API_URL=http://localhost:3001
DATABASE_URL=postgresql://user:password@localhost:5432/swarm_arena

# Program
PROGRAM_ID=<your-program-id>
```

## Testing

### Unit Tests (Rust)

```bash
# Test math module
cargo test --package swarm-arena --lib math::tests

# Test all
cargo test
```

### Integration Tests (TypeScript)

```bash
# Deploy to local validator
anchor localnet

# Run tests
anchor test

# Run specific test
anchor test --skip-local-validator
```

### Frontend Tests

```bash
# Run Jest tests (if configured)
yarn test

# Type checking
yarn tsc --noEmit
```

## Deployment

### 1. Deploy Smart Contract

```bash
# Build optimized
anchor build --verifiable

# Deploy to devnet
anchor deploy --provider.cluster devnet

# Deploy to mainnet (use with caution)
anchor deploy --provider.cluster mainnet
```

### 2. Initialize Protocol

```bash
# Run initialization script
ts-node scripts/initialize.ts

# Or manually via Anchor
anchor run initialize
```

### 3. Deploy Backend

```bash
# Build
cd backend
yarn build

# Run migrations
yarn migrate

# Start server
yarn start

# Or with PM2
pm2 start dist/index.js --name swarm-arena-backend
```

### 4. Deploy Frontend

```bash
# Build
yarn build

# Start production server
yarn start

# Or deploy to Vercel
vercel deploy --prod
```

## Smart Contract Explained

### Core Concepts

**Accounts:**
- `GlobalConfig` - Protocol configuration (fee, limits, cycle duration)
- `GameState` - Current cycle state (TVL, active players, cycle timing)
- `CycleState` - Historical cycle data (resolved cycles)
- `PlayerState` - Individual player data (balance, exposure, score)
- `TreasuryVault` - Protocol fee collection

**Instructions:**
1. `initialize_config` - Setup protocol (admin only)
2. `register_player` - Register new player
3. `deposit` - Deposit SOL into vault
4. `withdraw` - Withdraw SOL from vault (requires 0% exposure)
5. `set_exposure` - Set exposure percentage (0-100%)
6. `resolve_cycle` - Resolve cycle and redistribute funds
7. `claim_redistribution` - Claim redistribution after cycle

**Math Logic:**
- **Exposure Score:** `balance * (exposure^2) / 10000` (quadratic scaling)
- **Weight:** Normalized share of total exposed value
- **Anti-Whale:** Penalty for players controlling >20% of pool
- **Redistribution:** `expected_share - contribution` (can be negative)
- **Fee:** 2% of total exposed value per cycle

### Security Features

- **Integer-only arithmetic** - No floating point precision issues
- **Overflow/underflow checks** - All math operations are checked
- **Rate limiting** - Cooldown between exposure changes
- **Anti-whale** - Diminishing returns for large players
- **Anti-sybil** - Minimum balance requirements
- **Withdrawal protection** - Cannot withdraw with active exposure

## Backend Explained

### Indexer Service

Listens to on-chain events and indexes them into PostgreSQL:
- Deposits, withdrawals, exposure changes
- Cycle resolutions and redistributions
- Player registrations

### Leaderboard Service

Calculates rankings based on:
- Score (exposure-weighted performance)
- Balance
- Cycles participated
- Total P&L

### Analytics Service

Provides aggregate statistics:
- Total TVL
- Active players
- Protocol fees collected
- Average exposure

### API Endpoints

```
GET  /health                    # Health check
GET  /game/state                # Current game state
GET  /game/cycles               # Historical cycles
GET  /game/cycles/:number       # Specific cycle
GET  /game/leaderboard          # Player rankings
GET  /game/activity             # Recent activity
GET  /game/player/:wallet       # Player state
GET  /game/stats                # Global statistics
```

## Frontend Explained

### Pages

- **Landing (`/`)** - Product overview and CTA
- **Dashboard (`/dashboard`)** - Main game interface
- **Leaderboard (`/leaderboard`)** - Player rankings
- **Activity (`/activity`)** - Event feed
- **Profile (`/profile`)** - Player stats and history

### Key Components

- **LiveArena** - Real-time cycle visualization
- **PlayerPanel** - Player balance and controls
- **ExposureSlider** - Exposure adjustment UI
- **LeaderboardPreview** - Top players widget
- **CycleTimeline** - Cycle progress and history

### State Management

- **React Query** - Server state caching
- **Wallet Adapter** - Wallet connection
- **Local State** - UI state (modals, forms)

## Security Considerations

### Smart Contract

- ✅ All math uses checked operations
- ✅ No floating point arithmetic
- ✅ Rate limiting on critical operations
- ✅ Withdrawal protection (requires 0% exposure)
- ✅ Admin functions protected by authority check
- ⚠️ Cycle resolution is permissionless (by design)
- ⚠️ No pause mechanism (consider adding for emergencies)

### Backend

- ✅ Input validation on all endpoints
- ✅ SQL injection protection (parameterized queries)
- ✅ Rate limiting on API endpoints
- ⚠️ No authentication (public read-only API)
- ⚠️ Consider adding API keys for write operations

### Frontend

- ✅ Wallet signature verification
- ✅ Transaction simulation before sending
- ✅ Input validation and sanitization
- ⚠️ No XSS protection audit performed
- ⚠️ Consider adding CSP headers

### Operational

- 🔴 **Audit Required** - Smart contract not audited
- 🔴 **Testnet Only** - Do not deploy to mainnet without audit
- ⚠️ Monitor for unusual activity (whale attacks, sybil attacks)
- ⚠️ Set up alerts for large deposits/withdrawals
- ⚠️ Regular database backups

## Roadmap

### Phase 1: MVP (Current)
- [x] Core smart contract
- [x] Basic frontend
- [x] Backend indexer
- [x] Leaderboard
- [ ] Comprehensive testing

### Phase 2: Enhancement
- [ ] Smart contract audit
- [ ] WebSocket real-time updates
- [ ] Advanced analytics dashboard
- [ ] Player achievements/badges
- [ ] Squad/team functionality

### Phase 3: Optimization
- [ ] Gas optimization
- [ ] Caching layer (Redis)
- [ ] CDN for static assets
- [ ] Mobile-responsive improvements

### Phase 4: Expansion
- [ ] Multi-token support
- [ ] Configurable cycle durations
- [ ] Tournament mode
- [ ] Referral system

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style

- **Rust:** Follow `rustfmt` defaults
- **TypeScript:** Follow project ESLint config
- **Commits:** Use conventional commits format

## License

MIT License - see LICENSE file for details

## Support

- **Documentation:** [docs.swarmarena.io](https://docs.swarmarena.io)
- **Discord:** [discord.gg/swarmarena](https://discord.gg/swarmarena)
- **Twitter:** [@swarmarena](https://twitter.com/swarmarena)
- **Issues:** [GitHub Issues](https://github.com/your-org/swarm-arena/issues)

## Acknowledgments

- Built with [Anchor Framework](https://www.anchor-lang.com/)
- Inspired by on-chain game theory experiments
- Thanks to the Solana developer community

---

**⚠️ DISCLAIMER:** This is experimental software. Use at your own risk. Not audited. Not financial advice.

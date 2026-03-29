# AUDIT DE VÉRITÉ FONCTIONNELLE - SWARM ARENA (PARTIE 2)

## 7. BACKEND DÉTAILLÉ

### 7.1 Architecture backend

**Framework**: Express.js  
**Langage**: TypeScript  
**Base de données**: PostgreSQL (NON CONNECTÉE)  
**Indexation**: Event listening Solana (NON IMPLÉMENTÉE)

### 7.2 Fichiers principaux

#### 7.2.1 index.ts

**Rôle**: Point d'entrée du backend

**Fonctions**:
- Initialise IndexerService
- Démarre event listener
- Crée serveur HTTP
- Gère graceful shutdown

**État**: Structure complète, mais IndexerService ne fait rien

**Source**: `backend/src/index.ts`

#### 7.2.2 server.ts

**Rôle**: Configuration Express

**Middleware**:
- helmet (security headers)
- cors
- body parsing (json, urlencoded)
- request logging

**Routes**:
- `/health` - Health check
- `/api/game` - Game routes
- `/api/players` - Player routes

**Error handling**: Global error handler avec ApiError

**Source**: `backend/src/server.ts`

#### 7.2.3 config.ts

**Rôle**: Configuration de l'application

**Variables d'environnement**:
- `NODE_ENV` - Environment (development/production/test)
- `PORT` - Port du serveur (défaut: 3000)
- `SOLANA_CLUSTER` - Cluster Solana (défaut: devnet)
- `RPC_ENDPOINT` - Endpoint RPC (défaut: https://api.devnet.solana.com)
- `PROGRAM_ID` - ID du programme (défaut: FbSDMGKyTo1YYGMjtau1JLBUDh18koz1JKN3NL38Zmf3)
- `DATABASE_URL` - URL PostgreSQL (défaut: postgresql://postgres:postgres@localhost:5432/swarm_arena)
- `CORS_ORIGIN` - Origine CORS (défaut: *)
- `LOG_LEVEL` - Niveau de log (défaut: debug en dev, info en prod)
- `INDEXER_POLL_INTERVAL` - Intervalle de polling (défaut: 5000ms)
- `INDEXER_BATCH_SIZE` - Taille des batches (défaut: 100)
- `INDEXER_START_SLOT` - Slot de départ (optionnel)

**Source**: `backend/src/config.ts`

### 7.3 Routes

#### 7.3.1 Health routes (`routes/health.routes.ts`)

**Endpoints**:
- `GET /health` - Simple health check
- `GET /health/ready` - Readiness check
- `GET /health/live` - Liveness check

**Implémentation**: COMPLÈTE et FONCTIONNELLE

**Source**: `backend/src/routes/health.routes.ts`

#### 7.3.2 Game routes (`routes/game.routes.ts`)

**Endpoints**:
- `GET /api/game/state` - Current game state
- `GET /api/game/cycles` - Historical cycles (pagination)
- `GET /api/game/cycles/:cycleNumber` - Specific cycle
- `GET /api/game/leaderboard` - Player leaderboard (pagination, sortBy)
- `GET /api/game/activity` - Recent activity (pagination, type filter)
- `GET /api/game/player/:wallet` - Player state by wallet
- `GET /api/game/stats` - Global statistics

**Implémentation**: Routes définies, MAIS retournent des MOCKS (données vides)

**Source de données**: IndexerService (qui ne fait rien)

**Source**: `backend/src/routes/game.routes.ts`

#### 7.3.3 Player routes (`routes/player.routes.ts`)

**Contenu**: Fichier vide, juste un commentaire "// Player routes"

**Implémentation**: NON IMPLÉMENTÉE

**Source**: `backend/src/routes/player.routes.ts`

### 7.4 Services

#### 7.4.1 IndexerService (`services/indexer.service.ts`)

**Rôle**: Écouter les events blockchain et indexer dans la DB

**Méthodes**:
- `initialize()` - Initialise le service
- `startListening()` - Démarre l'écoute des events
- `stopListening()` - Arrête l'écoute
- `pollEvents()` - Polling des nouveaux events
- `processNewEvents()` - Traite les events depuis last_processed_slot
- `processTransaction()` - Traite une transaction
- `parseAndStoreEvent()` - Parse et stocke un event
- Event handlers: `handlePlayerRegistered`, `handleDepositMade`, etc.
- Query methods: `getGameState`, `getCycles`, `getLeaderboard`, etc.

**Implémentation**:
- Structure COMPLÈTE
- Logique de polling DÉFINIE
- Event handlers VIDES (juste des logs)
- Query methods RETOURNENT DES MOCKS
- Aucune connexion à la DB
- Aucun parsing réel des events

**État**: PLACEHOLDER, ne fait rien de fonctionnel

**Source**: `backend/src/services/indexer.service.ts`

#### 7.4.2 LeaderboardService (`services/leaderboard.service.ts`)

**Rôle**: Calculs et rankings du leaderboard

**Méthodes**:
- `getTopPlayersByScore()` - Top joueurs par score
- `getTopPlayersByBalance()` - Top joueurs par balance
- `getTopPlayersByCycles()` - Top joueurs par cycles participés
- `getTopPlayersByRedistributed()` - Top joueurs par gains
- `getTopCyclesByTVL()` - Top cycles par TVL
- `getTopCyclesByParticipants()` - Top cycles par participants
- `getTopGainersByCycle()` - Top gainers d'un cycle
- `getTopLosersByCycle()` - Top losers d'un cycle
- `getTopGainersAllTime()` - Top gainers lifetime
- `getTopLosersAllTime()` - Top losers lifetime
- `getLeaderboardSnapshot()` - Snapshot complet
- `getLeaderboardStats()` - Stats agrégées
- `getPlayerRank()` - Rang d'un joueur
- `getPlayersNearRank()` - Joueurs autour d'un rang
- `getPlayerRankChange()` - Changement de rang

**Implémentation**: Méthodes définies, MAIS retournent des MOCKS (tableaux vides)

**État**: PLACEHOLDER, ne fait rien de fonctionnel

**Source**: `backend/src/services/leaderboard.service.ts`

#### 7.4.3 AnalyticsService (`services/analytics.service.ts`)

**Rôle**: Métriques et analytics du protocole

**Méthodes**:
- `getProtocolMetrics()` - Métriques globales
- `getVolumeMetrics()` - Métriques de volume (24h/7d/30d/all)
- `getActivityMetrics()` - Métriques d'activité
- `getCycleMetrics()` - Métriques d'un cycle
- `getRecentCyclesMetrics()` - Métriques des derniers cycles
- `getPlayerGrowthMetrics()` - Métriques de croissance joueurs
- `getFeeMetrics()` - Métriques de fees
- `getTimeSeriesData()` - Données time series pour charts
- `getExposureDistribution()` - Distribution des expositions
- `getBalanceDistribution()` - Distribution des balances
- `getTopMovers()` - Plus gros changements
- `getDashboardAnalytics()` - Analytics dashboard complet

**Implémentation**: Méthodes définies, MAIS retournent des MOCKS (données vides)

**État**: PLACEHOLDER, ne fait rien de fonctionnel

**Source**: `backend/src/services/analytics.service.ts`

### 7.5 Base de données

#### 7.5.1 Schéma SQL (`db/schema.sql`)

**Tables définies** (13 tables):
1. `players` - Joueurs
2. `game_states` - États du jeu
3. `cycles` - Cycles historiques
4. `deposits` - Dépôts
5. `withdrawals` - Retraits
6. `exposure_updates` - Changements d'exposition
7. `redistributions` - Redistributions
8. `fees` - Fees collectées
9. `activity_events` - Events unifiés
10. `leaderboard_snapshots` - Snapshots leaderboard
11. `indexer_state` - État de l'indexer

**Indexes**: 30+ indexes définis

**Triggers**: `update_updated_at_column` pour auto-update timestamps

**Views**: 3 views (active_players, recent_activity, top_players)

**État**: Schéma COMPLET et BIEN CONÇU, mais tables NON CRÉÉES

**Source**: `backend/src/db/schema.sql`

### 7.6 Verdict backend

**Structure**: ✅ Excellente, bien organisée  
**Implémentation**: ❌ Quasi inexistante  
**Fonctionnalité**: ❌ 0% (retourne des mocks)  
**Utilité actuelle**: ❌ Aucune (frontend n'utilise pas le backend)

**Travail restant**:
1. Créer les tables PostgreSQL
2. Implémenter la connexion DB (pg/Prisma/TypeORM)
3. Implémenter le parsing des events Anchor
4. Implémenter l'écriture en DB
5. Implémenter les query methods
6. Tester l'indexation complète

---

## 8. MATRICE DE VÉRITÉ DES DONNÉES

| Donnée | Affichée où | Source réelle | Fichier source | Fiabilité | Notes |
|--------|-------------|---------------|----------------|-----------|-------|
| Player balance | Dashboard, PlayerPanel | On-chain PlayerState | `lib/hooks/usePlayerState.ts` | 100% | Refetch 2s |
| Player exposure | Dashboard, PlayerPanel | On-chain PlayerState | `lib/hooks/usePlayerState.ts` | 100% | Refetch 2s |
| Player exposed_value | PlayerPanel | On-chain PlayerState | `lib/hooks/usePlayerState.ts` | 100% | Refetch 2s |
| Player score | Dashboard, PlayerPanel | On-chain PlayerState | `lib/hooks/usePlayerState.ts` | 100% | Refetch 2s |
| Player total_redistributed | Dashboard, PlayerPanel | On-chain PlayerState | `lib/hooks/usePlayerState.ts` | 100% | Refetch 2s |
| Player rank | Dashboard, PlayerPanel | Calculé frontend | `lib/hooks/usePlayerRank.ts` | 100% | Fetch tous PlayerState, sort by score |
| Current cycle | Dashboard, CycleResolver | On-chain GameState | `lib/hooks/useGameState.ts` | 100% | Refetch 2s |
| Cycle start/end slot | CycleResolver | On-chain GameState | `lib/hooks/useGameState.ts` | 100% | Refetch 2s |
| Total value locked | Dashboard, Landing | On-chain GameState | `lib/hooks/useGameState.ts` | 100% (Dashboard) / 0% (Landing) | Landing hardcodé |
| Total exposed value | - | On-chain GameState | `lib/hooks/useGameState.ts` | 100% | Non affiché |
| Active players | Dashboard, Landing | On-chain GameState | `lib/hooks/useGameState.ts` | 100% (Dashboard) / 0% (Landing) | Landing hardcodé |
| Cycle resolved | Dashboard, ClaimButton | On-chain GameState | `lib/hooks/useGameState.ts` | 100% | Refetch 2s |
| Current slot | CycleResolver | RPC connection.getSlot() | `lib/hooks/useCurrentSlot.ts` | 100% | Refetch 1s |
| Leaderboard | Leaderboard page | Calculé frontend | `lib/hooks/useLeaderboard.ts` | 100% | Fetch tous PlayerState, sort by score |
| Cycle history | ClaimButton | On-chain CycleState PDAs | `lib/hooks/useCycleHistory.ts` | 100% | Fetch CycleState[cycle_number] |
| Activity feed | LiveTicker, Activity page | Event listeners Anchor | `lib/hooks/useActivityFeed.ts` | 100% | Temps réel via addEventListener |
| Protocol config | - | On-chain GlobalConfig | `lib/hooks/useGlobalConfig.ts` | 100% | Refetch 30s |
| Backend API data | - | Backend (mocks) | `backend/src/services/*.ts` | 0% | Non fonctionnel |

**Conclusion**: Toutes les données critiques proviennent de la blockchain (on-chain ou RPC). Le backend n'est pas utilisé.

---


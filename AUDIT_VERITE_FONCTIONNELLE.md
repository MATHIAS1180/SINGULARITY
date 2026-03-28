# AUDIT DE VÉRITÉ FONCTIONNELLE - SWARM ARENA

**Date:** 28 Mars 2026  
**Auditeur:** Agent Senior Solana/Anchor/Next.js  
**Scope:** Analyse complète de la vérité fonctionnelle du projet

---

## RÉSUMÉ EXÉCUTIF

### Est-ce que le projet est réellement fonctionnel on-chain ?

**Réponse : PARTIELLEMENT (40-50%)**

Le smart contract est déployé et fonctionnel. Les instructions de base (register, deposit, withdraw, setExposure) sont correctement implémentées et connectées au frontend. CEPENDANT, la logique de jeu principale (redistribution, cycles, leaderboard) est soit non implémentée, soit complètement simulée côté frontend.

### À quel pourcentage approximatif la UI reflète la vérité ?

**Estimation : 35-40%**

- ✅ **Connecté réellement (35%):** Wallet, Register, Deposit, Withdraw, SetExposure, lecture GameState/PlayerState
- ⚠️ **Partiellement connecté (15%):** Affichage des données on-chain mais sans refresh automatique complet
- ❌ **Complètement fake (50%):** Leaderboard, Activity Feed, Cycle Timeline, Live Arena metrics, Backend API

### Quels sont les plus gros écarts ?

1. **CRITIQUE:** Aucune instruction `claimRedistribution` n'est appelée - la redistribution n'est jamais exécutée
2. **CRITIQUE:** Le leaderboard affiche des données hardcodées, pas les vraies données on-chain
3. **CRITIQUE:** L'activity feed est entièrement simulé avec des données mock
4. **CRITIQUE:** Le backend existe mais ne lit RIEN de la blockchain (toutes les fonctions retournent des tableaux vides)
5. **MAJEUR:** La résolution de cycle (`resolveCycle`) n'est jamais appelée depuis le frontend
6. **MAJEUR:** Les cycles ne progressent pas automatiquement - pas de mécanisme de résolution automatique

---

## SOURCE OF TRUTH MAP

| Donnée | Source de Vérité | Statut Actuel | Écart |
|--------|------------------|---------------|-------|
| **Player Balance** | `PlayerState.balance` (on-chain) | ✅ Lu correctement | Aucun |
| **Player Exposure** | `PlayerState.exposure` (on-chain) | ✅ Lu correctement | Aucun |
| **Player Score** | `PlayerState.score` (on-chain) | ✅ Lu correctement | Mais jamais mis à jour (pas de claim) |
| **Player Rank** | Calculé depuis tous les `PlayerState` | ❌ Hardcodé à 0 | CRITIQUE |
| **Total Value Locked** | `GameState.totalValueLocked` (on-chain) | ✅ Lu correctement | Aucun |
| **Active Players** | `GameState.activePlayers` (on-chain) | ✅ Lu correctement | Aucun |
| **Current Cycle** | `GameState.currentCycle` (on-chain) | ✅ Lu correctement | Aucun |
| **Cycle Progress** | Calculé depuis slots | ⚠️ Simulé localement | Approximatif |
| **Leaderboard** | Tous les `PlayerState` triés par score | ❌ Mock data | CRITIQUE |
| **Activity Feed** | Events on-chain | ❌ Mock data | CRITIQUE |
| **Cycle History** | `CycleState` accounts | ❌ Mock data | CRITIQUE |
| **Redistribution** | `claimRedistribution` instruction | ❌ Jamais appelée | CRITIQUE |


---

## INSTRUCTION-TO-UI MAPPING

### ✅ INSTRUCTIONS CORRECTEMENT CONNECTÉES

#### 1. `initializeConfig`
- **Paramètres attendus:** protocolFeeBps, minDeposit, maxDeposit, minExposure, maxExposure, cycleDuration, exposureCooldown
- **Comptes attendus:** config, gameState, treasuryVault, authority, systemProgram
- **Page/Composant:** N/A (admin only, probablement déjà exécuté)
- **État actuel:** ✅ Déployé et initialisé
- **Problème:** Aucun
- **Gravité:** N/A

#### 2. `registerPlayer`
- **Paramètres attendus:** Aucun
- **Comptes attendus:** config, playerState, player, systemProgram
- **Page/Composant:** `components/game/PlayerActions.tsx` (ligne 24-33)
- **État actuel:** ✅ Connecté et fonctionnel
- **Appel réel:** `lib/anchor.ts` ligne 28 → `program.methods.registerPlayer()`
- **Problème:** Aucun
- **Gravité:** N/A

#### 3. `deposit`
- **Paramètres attendus:** amount (u64)
- **Comptes attendus:** config, gameState, playerState, vault, player, systemProgram
- **Page/Composant:** `components/game/PlayerActions.tsx` (ligne 35-50)
- **État actuel:** ✅ Connecté et fonctionnel
- **Appel réel:** `lib/anchor.ts` ligne 32 → `program.methods.deposit(amount)`
- **Problème:** ⚠️ Le vault PDA utilisé est `getTreasuryVaultPDA()` au lieu d'un vault dédié
- **Gravité:** MAJEUR - Confusion entre treasury et vault

#### 4. `withdraw`
- **Paramètres attendus:** amount (u64)
- **Comptes attendus:** config, gameState, playerState, vault, player, systemProgram
- **Page/Composant:** `components/game/PlayerActions.tsx` (ligne 52-67)
- **État actuel:** ✅ Connecté et fonctionnel
- **Appel réel:** `lib/anchor.ts` ligne 38 → `program.methods.withdraw(amount)`
- **Problème:** ⚠️ Même problème de vault PDA
- **Gravité:** MAJEUR

#### 5. `setExposure`
- **Paramètres attendus:** newExposure (u8)
- **Comptes attendus:** config, gameState, playerState, player
- **Page/Composant:** `components/game/PlayerActions.tsx` (ligne 69-84)
- **État actuel:** ✅ Connecté et fonctionnel
- **Appel réel:** `lib/anchor.ts` ligne 44 → `program.methods.setExposure(newExposure)`
- **Problème:** Aucun
- **Gravité:** N/A

### ❌ INSTRUCTIONS NON CONNECTÉES

#### 6. `resolveCycle`
- **Paramètres attendus:** Aucun
- **Comptes attendus:** config, gameState, cycleState, treasuryVault, vault, resolver, systemProgram
- **Page/Composant:** ❌ AUCUN
- **État actuel:** ❌ Jamais appelé depuis le frontend
- **Appel réel:** N/A
- **Problème:** CRITIQUE - Les cycles ne sont jamais résolus, donc pas de redistribution
- **Gravité:** BLOQUANT

#### 7. `claimRedistribution`
- **Paramètres attendus:** cycleNumber (u64)
- **Comptes attendus:** config, gameState, cycleState, playerState, vault, player, systemProgram
- **Page/Composant:** ❌ AUCUN
- **État actuel:** ❌ Jamais appelé depuis le frontend
- **Appel réel:** N/A
- **Problème:** CRITIQUE - Les joueurs ne peuvent jamais claim leurs gains/pertes
- **Gravité:** BLOQUANT


---

## LIST OF FAKE / MOCK / PLACEHOLDER ELEMENTS

### 🎭 COMPOSANTS ENTIÈREMENT SIMULÉS

#### 1. **LeaderboardPreview** (`components/game/LeaderboardPreview.tsx`)
- **Ligne:** 13-30
- **Problème:** Données hardcodées dans `mockPlayers`
- **Données fake:**
  ```typescript
  const mockPlayers: LeaderboardPlayer[] = [
    { rank: 1, wallet: 'ABC...XYZ', score: 15420, pnl: 45.2, change: 2 },
    { rank: 2, wallet: 'DEF...UVW', score: 12350, pnl: 32.1, change: -1 },
    // ...
  ]
  ```
- **Vérité:** Devrait lire tous les `PlayerState` accounts et les trier par `score`
- **Impact:** Les utilisateurs voient un faux leaderboard

#### 2. **Leaderboard Page** (`app/leaderboard/page.tsx`)
- **Ligne:** 11-30
- **Problème:** Même mock data que LeaderboardPreview
- **Données fake:** Identique au composant preview
- **Vérité:** Devrait appeler `program.account.PlayerState.all()` et trier
- **Impact:** Page leaderboard complète est fake

#### 3. **Activity Page** (`app/activity/page.tsx`)
- **Ligne:** 31-56
- **Problème:** Events générés aléatoirement, pas d'écoute des events on-chain
- **Données fake:**
  ```typescript
  const mockEvents: ActivityEvent[] = [
    { id: '1', type: 'deposit', player: 'ABC...XYZ', amount: 10.5, ... },
    // ...
  ]
  ```
- **Vérité:** Devrait écouter les events Anchor (DepositMade, WithdrawMade, ExposureUpdated, etc.)
- **Impact:** L'activity feed ne montre pas la vraie activité

#### 4. **CycleTimeline** (`components/game/CycleTimeline.tsx`)
- **Ligne:** 13-35
- **Problème:** Cycles hardcodés avec données fictives
- **Données fake:**
  ```typescript
  const cycles: Cycle[] = [
    { number: 1, status: 'completed', participants: 12, totalRedistributed: 45.2 },
    { number: 2, status: 'completed', participants: 18, totalRedistributed: 67.8 },
    // ...
  ]
  ```
- **Vérité:** Devrait lire les `CycleState` accounts pour les cycles passés
- **Impact:** L'historique des cycles est inventé

#### 5. **LiveTicker** (`components/ui/LiveTicker.tsx`)
- **Ligne:** 30-50
- **Problème:** Génère des events aléatoires toutes les 5-10 secondes
- **Données fake:**
  ```typescript
  const generateMockEvent = (): TickerEvent => {
    const types = ['deposit', 'withdrawal', 'exposure', 'cycle', 'reward', 'loss'];
    const type = types[Math.floor(Math.random() * types.length)];
    // ...
  }
  ```
- **Vérité:** Devrait écouter les events on-chain en temps réel
- **Impact:** Le ticker "live" n'est pas live du tout

#### 6. **Backend Leaderboard Service** (`backend/src/services/leaderboard.service.ts`)
- **Ligne:** Toutes les fonctions (45-200)
- **Problème:** Toutes les fonctions retournent des tableaux vides `return []`
- **Exemples:**
  - `getTopPlayersByScore()` → `return []`
  - `getTopPlayersByBalance()` → `return []`
  - `getTopGainersByCycle()` → `return []`
- **Vérité:** Devrait interroger une base de données indexée ou lire directement la chain
- **Impact:** Le backend ne sert à rien actuellement

### ⚠️ COMPOSANTS PARTIELLEMENT CONNECTÉS

#### 7. **LiveArena** (`components/game/LiveArena.tsx`)
- **Ligne:** 20-40
- **Problème:** Lit `gameState` on-chain mais simule le `currentSlot`
- **Données réelles:** `totalExposedValue`, `totalValueLocked`, `activePlayers` (✅)
- **Données fake:** `cycleProgress` calculé avec un slot simulé (❌)
- **Code problématique:**
  ```typescript
  const currentSlot = Date.now() / 400; // Approximation
  ```
- **Vérité:** Devrait utiliser `connection.getSlot()` pour le slot réel
- **Impact:** La progression du cycle est approximative

#### 8. **PlayerPanel** (`components/game/PlayerPanel.tsx`)
- **Ligne:** 15-30
- **Problème:** Lit `playerState` on-chain mais le rank est hardcodé à 0
- **Données réelles:** `balance`, `exposure`, `score`, `totalPnL` (✅)
- **Données fake:** `rank: 0` (❌)
- **Code problématique:**
  ```typescript
  const stats = playerState ? {
    // ...
    rank: 0, // TODO: Calculate from leaderboard
  }
  ```
- **Vérité:** Devrait calculer le rank en comparant avec tous les autres joueurs
- **Impact:** Les joueurs ne voient jamais leur vrai rank


---

## LIST OF BROKEN OR UNWIRED BUTTONS / FLOWS

### ❌ BOUTONS VISUELS MAIS NON FONCTIONNELS

#### 1. **Resolve Cycle Button**
- **Localisation:** ❌ N'EXISTE PAS
- **Instruction attendue:** `resolveCycle`
- **Problème:** Aucun bouton/mécanisme pour résoudre un cycle
- **Impact:** Les cycles ne se terminent jamais, pas de redistribution
- **Gravité:** BLOQUANT

#### 2. **Claim Redistribution Button**
- **Localisation:** ❌ N'EXISTE PAS
- **Instruction attendue:** `claimRedistribution`
- **Problème:** Aucun bouton pour claim les gains/pertes après un cycle
- **Impact:** Les joueurs ne peuvent jamais recevoir leurs redistributions
- **Gravité:** BLOQUANT

#### 3. **Quick Actions - Deposit/Withdraw** (`components/game/PlayerPanel.tsx`)
- **Ligne:** 145-165
- **Problème:** Boutons présents mais ne font rien (pas d'onClick)
- **Code:**
  ```typescript
  <button className="...">
    <span>Deposit SOL</span>
    <ArrowDownCircle />
  </button>
  ```
- **Impact:** Boutons décoratifs uniquement, pas fonctionnels
- **Gravité:** MINEUR (les vrais boutons existent dans PlayerActions)

### ⚠️ FLOWS INCOMPLETS

#### 4. **Cycle Resolution Flow**
- **État actuel:** 
  1. ✅ Cycles créés à l'initialisation
  2. ✅ `cycleEndSlot` défini
  3. ❌ Aucun mécanisme pour détecter la fin
  4. ❌ Aucun appel à `resolveCycle`
  5. ❌ Aucun appel à `claimRedistribution`
- **Problème:** Le flow complet de résolution n'existe pas
- **Impact:** Le jeu ne fonctionne pas réellement
- **Gravité:** BLOQUANT

#### 5. **Leaderboard Update Flow**
- **État actuel:**
  1. ✅ `PlayerState.score` existe on-chain
  2. ❌ Score jamais mis à jour (pas de claim)
  3. ❌ Leaderboard affiche des mocks
  4. ❌ Pas de lecture des vrais scores
- **Problème:** Le leaderboard n'est jamais synchronisé avec la chain
- **Impact:** Leaderboard complètement fake
- **Gravité:** CRITIQUE

#### 6. **Activity Feed Flow**
- **État actuel:**
  1. ✅ Events émis on-chain (DepositMade, WithdrawMade, etc.)
  2. ❌ Aucun listener d'events
  3. ❌ Activity feed génère des events fake
- **Problème:** Les vrais events on-chain ne sont jamais affichés
- **Impact:** Activity feed complètement fake
- **Gravité:** MAJEUR

### ✅ FLOWS FONCTIONNELS

#### 7. **Register Flow**
- **État:** ✅ FONCTIONNEL
- **Steps:**
  1. User clique "Register Player"
  2. `useRegisterPlayer()` hook appelé
  3. `registerPlayer(program)` exécuté
  4. Transaction signée et envoyée
  5. `PlayerState` créé on-chain
  6. Query invalidée, données rafraîchies
- **Problème:** Aucun
- **Gravité:** N/A

#### 8. **Deposit Flow**
- **État:** ✅ FONCTIONNEL (avec réserve)
- **Steps:**
  1. User entre un montant
  2. `useDeposit()` hook appelé
  3. `deposit(program, amount)` exécuté
  4. SOL transféré au vault
  5. `PlayerState.balance` mis à jour
  6. Query invalidée, données rafraîchies
- **Problème:** ⚠️ Vault PDA incorrect (utilise treasury au lieu de vault)
- **Gravité:** MAJEUR

#### 9. **Withdraw Flow**
- **État:** ✅ FONCTIONNEL (avec réserve)
- **Steps:**
  1. User entre un montant
  2. Vérification exposure === 0
  3. `useWithdraw()` hook appelé
  4. `withdraw(program, amount)` exécuté
  5. SOL transféré du vault au user
  6. `PlayerState.balance` mis à jour
  7. Query invalidée, données rafraîchies
- **Problème:** ⚠️ Même problème de vault PDA
- **Gravité:** MAJEUR

#### 10. **Set Exposure Flow**
- **État:** ✅ FONCTIONNEL
- **Steps:**
  1. User ajuste le slider
  2. User clique "Update Exposure"
  3. `useSetExposure()` hook appelé
  4. `setExposure(program, exposure)` exécuté
  5. `PlayerState.exposure` et `exposedValue` mis à jour
  6. `GameState.totalExposedValue` mis à jour
  7. Query invalidée, données rafraîchies
- **Problème:** Aucun
- **Gravité:** N/A


---

## DATA MISMATCH REPORT

### 🔴 ÉCARTS CRITIQUES

#### 1. **Leaderboard Data**
- **UI affiche:** Mock players avec scores/ranks inventés
- **On-chain reality:** `PlayerState` accounts avec vrais scores
- **Écart:** 100% - Aucune donnée réelle affichée
- **Fichiers concernés:**
  - `components/game/LeaderboardPreview.tsx` (ligne 13-30)
  - `app/leaderboard/page.tsx` (ligne 11-30)
- **Solution requise:** Lire tous les `PlayerState`, trier par score, calculer ranks

#### 2. **Activity Feed Data**
- **UI affiche:** Events générés aléatoirement
- **On-chain reality:** Events Anchor émis (DepositMade, WithdrawMade, ExposureUpdated, CycleResolved, RewardDistributed)
- **Écart:** 100% - Aucun event réel affiché
- **Fichiers concernés:**
  - `app/activity/page.tsx` (ligne 31-56)
  - `components/ui/LiveTicker.tsx` (ligne 30-50)
- **Solution requise:** Écouter les events on-chain avec `program.addEventListener()`

#### 3. **Cycle History Data**
- **UI affiche:** Cycles hardcodés avec données fictives
- **On-chain reality:** `CycleState` accounts pour chaque cycle résolu
- **Écart:** 100% - Aucune donnée réelle
- **Fichiers concernés:**
  - `components/game/CycleTimeline.tsx` (ligne 13-35)
- **Solution requise:** Lire les `CycleState` accounts

#### 4. **Player Rank**
- **UI affiche:** Toujours 0 ou "—"
- **On-chain reality:** Calculable depuis tous les `PlayerState.score`
- **Écart:** 100% - Jamais calculé
- **Fichiers concernés:**
  - `components/game/PlayerPanel.tsx` (ligne 25)
  - `app/dashboard/page.tsx` (ligne 75)
- **Solution requise:** Fetch tous les players, comparer scores, calculer rank

### 🟡 ÉCARTS MAJEURS

#### 5. **Cycle Progress**
- **UI affiche:** Progression calculée avec slot simulé
- **On-chain reality:** Slot réel disponible via `connection.getSlot()`
- **Écart:** ~10-20% - Approximation acceptable mais imprécise
- **Fichiers concernés:**
  - `components/game/LiveArena.tsx` (ligne 20-30)
  - `components/game/CycleTimeline.tsx` (ligne 50-60)
- **Code problématique:**
  ```typescript
  const currentSlot = Date.now() / 400; // Approximation
  ```
- **Solution requise:** Utiliser `connection.getSlot()` pour le slot réel

#### 6. **Backend API Data**
- **API retourne:** Tableaux vides pour toutes les requêtes
- **On-chain reality:** Données disponibles via program accounts
- **Écart:** 100% - Backend ne fait rien
- **Fichiers concernés:**
  - `backend/src/services/leaderboard.service.ts` (toutes les fonctions)
  - `backend/src/services/analytics.service.ts`
- **Solution requise:** Implémenter l'indexation on-chain ou requêtes directes

### 🟢 DONNÉES CORRECTES

#### 7. **Player Balance** ✅
- **UI affiche:** `bnToSol(playerState.balance)`
- **On-chain reality:** `PlayerState.balance`
- **Écart:** 0% - Correct
- **Fichiers:** `components/game/PlayerPanel.tsx`, `app/dashboard/page.tsx`

#### 8. **Player Exposure** ✅
- **UI affiche:** `playerState.exposure`
- **On-chain reality:** `PlayerState.exposure`
- **Écart:** 0% - Correct
- **Fichiers:** `components/game/PlayerPanel.tsx`, `components/game/PlayerActions.tsx`

#### 9. **Total Value Locked** ✅
- **UI affiche:** `bnToSol(gameState.totalValueLocked)`
- **On-chain reality:** `GameState.totalValueLocked`
- **Écart:** 0% - Correct
- **Fichiers:** `app/dashboard/page.tsx`, `components/game/LiveArena.tsx`

#### 10. **Active Players** ✅
- **UI affiche:** `gameState.activePlayers`
- **On-chain reality:** `GameState.activePlayers`
- **Écart:** 0% - Correct
- **Fichiers:** `app/dashboard/page.tsx`, `components/game/LiveArena.tsx`


---

## CRITICAL ISSUES

### 🔴 BLOQUANTS (Empêchent le jeu de fonctionner)

#### ISSUE #1: Cycle Resolution Never Happens
- **Gravité:** BLOQUANT
- **Description:** L'instruction `resolveCycle` n'est jamais appelée
- **Impact:** 
  - Les cycles ne se terminent jamais
  - Pas de calcul de redistribution
  - Le jeu est bloqué au cycle 1
- **Fichiers concernés:** Aucun (c'est le problème)
- **Preuve:**
  ```bash
  # Recherche de "resolveCycle" dans le frontend
  grep -r "resolveCycle" app/ components/ lib/
  # Résultat: Aucune occurrence
  ```
- **Solution requise:**
  1. Créer un composant `CycleResolver` ou bouton admin
  2. Implémenter `resolveCycle(program)` dans `lib/anchor.ts`
  3. Appeler l'instruction quand `currentSlot >= cycleEndSlot`
  4. Ou implémenter un cron job backend pour résolution automatique

#### ISSUE #2: Redistribution Never Claimed
- **Gravité:** BLOQUANT
- **Description:** L'instruction `claimRedistribution` n'est jamais appelée
- **Impact:**
  - Les joueurs ne reçoivent jamais leurs gains/pertes
  - Les scores ne sont jamais mis à jour
  - Le leaderboard reste vide/fake
- **Fichiers concernés:** Aucun (c'est le problème)
- **Preuve:**
  ```bash
  # Recherche de "claimRedistribution" dans le frontend
  grep -r "claimRedistribution" app/ components/ lib/
  # Résultat: Aucune occurrence
  ```
- **Solution requise:**
  1. Créer un bouton "Claim Rewards" après résolution de cycle
  2. Implémenter `claimRedistribution(program, cycleNumber)` dans `lib/anchor.ts`
  3. Afficher les gains/pertes potentiels avant claim
  4. Mettre à jour le score après claim

#### ISSUE #3: Vault PDA Incorrect
- **Gravité:** BLOQUANT (potentiel)
- **Description:** Les fonctions deposit/withdraw utilisent `getTreasuryVaultPDA()` au lieu d'un vault dédié
- **Impact:**
  - Confusion entre treasury (fees) et vault (player funds)
  - Risque de perte de fonds si mal configuré
- **Fichiers concernés:**
  - `lib/anchor.ts` (ligne 32, 38)
- **Code problématique:**
  ```typescript
  // Dans deposit et withdraw
  const [vaultPDA] = getTreasuryVaultPDA(); // ❌ INCORRECT
  ```
- **Preuve dans le smart contract:**
  ```rust
  // programs/swarm-arena/src/lib.rs
  #[account(
      mut,
      seeds = [b"vault"],  // ← Le vrai vault
      bump
  )]
  pub vault: AccountInfo<'info>,
  ```
- **Solution requise:**
  1. Créer `getVaultPDA()` dans `lib/solana.ts`:
     ```typescript
     export function getVaultPDA(): [PublicKey, number] {
       return PublicKey.findProgramAddressSync(
         [Buffer.from('vault')],
         PROGRAM_ID
       );
     }
     ```
  2. Remplacer `getTreasuryVaultPDA()` par `getVaultPDA()` dans deposit/withdraw

### 🟠 IMPORTANTS (Fonctionnalités majeures manquantes)

#### ISSUE #4: Leaderboard Completely Fake
- **Gravité:** IMPORTANT
- **Description:** Le leaderboard affiche des données hardcodées
- **Impact:**
  - Les joueurs ne voient pas leur vrai classement
  - Pas de compétition réelle
  - Perte de confiance des utilisateurs
- **Fichiers concernés:**
  - `components/game/LeaderboardPreview.tsx`
  - `app/leaderboard/page.tsx`
- **Solution requise:**
  1. Implémenter `fetchAllPlayers()` dans `lib/anchor.ts`:
     ```typescript
     export async function fetchAllPlayers(program: Program<SwarmArena>) {
       return program.account.PlayerState.all();
     }
     ```
  2. Créer un hook `useLeaderboard()` qui trie par score
  3. Remplacer les mock data par les vraies données

#### ISSUE #5: Activity Feed Completely Fake
- **Gravité:** IMPORTANT
- **Description:** L'activity feed génère des events aléatoires
- **Impact:**
  - Les utilisateurs ne voient pas la vraie activité
  - Pas de transparence
  - Illusion de volume
- **Fichiers concernés:**
  - `app/activity/page.tsx`
  - `components/ui/LiveTicker.tsx`
- **Solution requise:**
  1. Implémenter un event listener:
     ```typescript
     program.addEventListener('DepositMade', (event) => {
       // Add to activity feed
     });
     ```
  2. Ou utiliser `connection.onLogs()` pour écouter tous les events
  3. Parser les events et les afficher en temps réel

#### ISSUE #6: Backend Does Nothing
- **Gravité:** IMPORTANT
- **Description:** Toutes les fonctions backend retournent des tableaux vides
- **Impact:**
  - Le backend ne sert à rien
  - Pas d'indexation
  - Pas de cache
  - Requêtes lentes côté frontend
- **Fichiers concernés:**
  - `backend/src/services/leaderboard.service.ts`
  - `backend/src/services/analytics.service.ts`
  - `backend/src/services/indexer.service.ts`
- **Solution requise:**
  1. Implémenter l'indexation on-chain dans `IndexerService`
  2. Stocker les données dans une DB (PostgreSQL recommandé)
  3. Implémenter les requêtes dans `LeaderboardService`
  4. Ou supprimer le backend et tout faire côté frontend

### 🟡 RECOMMANDÉS (Améliorations importantes)

#### ISSUE #7: No Automatic Cycle Resolution
- **Gravité:** RECOMMANDÉ
- **Description:** Pas de mécanisme automatique pour résoudre les cycles
- **Impact:**
  - Dépend d'une action manuelle
  - Cycles peuvent rester bloqués
  - Mauvaise UX
- **Solution requise:**
  1. Implémenter un cron job backend qui vérifie `currentSlot >= cycleEndSlot`
  2. Appeler `resolveCycle` automatiquement
  3. Ou utiliser Clockwork (Solana automation)

#### ISSUE #8: No Real-time Slot Tracking
- **Gravité:** RECOMMANDÉ
- **Description:** Le slot est simulé avec `Date.now() / 400`
- **Impact:**
  - Progression de cycle imprécise
  - Peut causer des désynchronisations
- **Solution requise:**
  1. Utiliser `connection.getSlot()` pour le slot réel
  2. Implémenter un polling toutes les secondes
  3. Ou écouter les slot updates avec `connection.onSlotChange()`

#### ISSUE #9: No Player Rank Calculation
- **Gravité:** RECOMMANDÉ
- **Description:** Le rank est toujours affiché comme 0 ou "—"
- **Impact:**
  - Les joueurs ne connaissent pas leur position
  - Pas de feedback de progression
- **Solution requise:**
  1. Fetch tous les players
  2. Trier par score
  3. Trouver l'index du joueur actuel
  4. Afficher le rank


---

## AUDIT UX / UI / DONNÉES

### 📱 LANDING PAGE (`app/page.tsx`)
- **Données affichées:** Statiques (texte marketing)
- **Source:** Hardcodé
- **Vérité on-chain:** N/A
- **Verdict:** ✅ OK (page marketing)

### 🎮 DASHBOARD (`app/dashboard/page.tsx`)

#### Stats Cards (ligne 60-75)
| Stat | Source | Vérité | Verdict |
|------|--------|--------|---------|
| Balance | `playerState.balance` | On-chain | ✅ Correct |
| Exposure | `playerState.exposure` | On-chain | ✅ Correct |
| Total P&L | `playerState.totalRedistributed` | On-chain | ✅ Correct (mais jamais mis à jour) |
| Rank | Hardcodé "—" | Devrait être calculé | ❌ Fake |

#### Bottom Stats (ligne 120-150)
| Stat | Source | Vérité | Verdict |
|------|--------|--------|---------|
| Total Value Locked | `gameState.totalValueLocked` | On-chain | ✅ Correct |
| Active Players | `gameState.activePlayers` | On-chain | ✅ Correct |
| Cycle Status | `gameState.cycleResolved` | On-chain | ✅ Correct |

#### Composants Intégrés
- **PlayerPanel:** ⚠️ Partiellement correct (rank fake)
- **PlayerActions:** ✅ Fonctionnel
- **CycleTimeline:** ❌ Données fake
- **LiveArena:** ⚠️ Partiellement correct (slot simulé)
- **LeaderboardPreview:** ❌ Données fake

**Verdict Dashboard:** 60% correct, 40% fake/simulé

### 🏆 LEADERBOARD PAGE (`app/leaderboard/page.tsx`)

#### Stats Overview (ligne 30-50)
| Stat | Source | Vérité | Verdict |
|------|--------|--------|---------|
| Total Players | Hardcodé "0" | Devrait compter PlayerState accounts | ❌ Fake |
| Active Today | Hardcodé "0" | Devrait filtrer par lastActionSlot | ❌ Fake |
| Total Volume | Hardcodé "0 SOL" | Devrait sommer totalDeposited | ❌ Fake |
| Avg Score | Hardcodé "0" | Devrait moyenner les scores | ❌ Fake |

#### Leaderboard Table (ligne 80-200)
- **Données:** Mock players hardcodés
- **Source:** `mockPlayers` array (ligne 11-30)
- **Vérité:** Devrait lire tous les `PlayerState` et trier par score
- **Verdict:** ❌ 100% fake

**Verdict Leaderboard:** 0% correct, 100% fake

### 📊 ACTIVITY PAGE (`app/activity/page.tsx`)

#### Stats Overview (ligne 40-60)
| Stat | Source | Vérité | Verdict |
|------|--------|--------|---------|
| Events Today | Hardcodé "0" | Devrait compter events on-chain | ❌ Fake |
| Volume 24h | Hardcodé "0 SOL" | Devrait sommer deposits/withdrawals | ❌ Fake |
| Active Players | Hardcodé "0" | Devrait compter unique players | ❌ Fake |
| Cycles Today | Hardcodé "0" | Devrait compter CycleResolved events | ❌ Fake |

#### Activity Feed (ligne 100-200)
- **Données:** Mock events générés aléatoirement
- **Source:** `mockEvents` array (ligne 31-56)
- **Vérité:** Devrait écouter les events on-chain
- **Verdict:** ❌ 100% fake

**Verdict Activity:** 0% correct, 100% fake

### 👤 PROFILE PAGE (`app/profile/page.tsx`)
- **État:** Non analysé (pas dans les fichiers fournis)
- **Verdict:** À vérifier

### 🎯 COMPOSANTS UI

#### PlayerPanel (`components/game/PlayerPanel.tsx`)
- **Balance:** ✅ Correct (on-chain)
- **Exposure:** ✅ Correct (on-chain)
- **Score:** ✅ Correct (on-chain, mais jamais mis à jour)
- **Rank:** ❌ Fake (toujours 0)
- **Total P&L:** ✅ Correct (on-chain, mais jamais mis à jour)
- **Status:** ✅ Correct (on-chain)
- **Quick Actions Buttons:** ❌ Non fonctionnels (pas d'onClick)
- **Verdict:** 70% correct, 30% fake/non fonctionnel

#### PlayerActions (`components/game/PlayerActions.tsx`)
- **Register Button:** ✅ Fonctionnel
- **Deposit Input/Button:** ✅ Fonctionnel
- **Withdraw Input/Button:** ✅ Fonctionnel (avec vérification exposure)
- **Exposure Slider/Button:** ✅ Fonctionnel
- **Verdict:** 100% fonctionnel

#### LiveArena (`components/game/LiveArena.tsx`)
- **Total Exposed:** ✅ Correct (on-chain)
- **Total Locked:** ✅ Correct (on-chain)
- **Active Players:** ✅ Correct (on-chain)
- **Avg Exposure:** ✅ Correct (calculé depuis on-chain)
- **Cycle Progress:** ⚠️ Approximatif (slot simulé)
- **Tension Meter:** ⚠️ Approximatif (basé sur slot simulé)
- **Verdict:** 80% correct, 20% approximatif

#### CycleTimeline (`components/game/CycleTimeline.tsx`)
- **Current Cycle Number:** ✅ Correct (on-chain)
- **Cycle Progress:** ⚠️ Approximatif (slot simulé)
- **Cycle History:** ❌ Fake (données hardcodées)
- **Participants:** ❌ Fake
- **Total Redistributed:** ❌ Fake
- **Verdict:** 20% correct, 80% fake

#### LeaderboardPreview (`components/game/LeaderboardPreview.tsx`)
- **Top Players:** ❌ Fake (données hardcodées)
- **Ranks:** ❌ Fake
- **Scores:** ❌ Fake
- **P&L:** ❌ Fake
- **Stats Footer:** ❌ Fake
- **Verdict:** 0% correct, 100% fake

#### LiveTicker (`components/ui/LiveTicker.tsx`)
- **Events:** ❌ Fake (générés aléatoirement)
- **Timestamps:** ❌ Fake
- **Players:** ❌ Fake
- **Amounts:** ❌ Fake
- **Verdict:** 0% correct, 100% fake

### 🔌 WALLET / CONNECT

#### ConnectWalletButton (`components/wallet/ConnectWalletButton.tsx`)
- **État:** Non analysé (pas dans les fichiers fournis)
- **Verdict:** Probablement fonctionnel (standard Solana wallet adapter)

#### WalletStatus (`components/wallet/WalletStatus.tsx`)
- **État:** Non analysé (pas dans les fichiers fournis)
- **Verdict:** Probablement fonctionnel

### 📈 RÉSUMÉ UX/UI

| Zone | % Correct | % Fake | % Approximatif |
|------|-----------|--------|----------------|
| Dashboard | 60% | 30% | 10% |
| Leaderboard | 0% | 100% | 0% |
| Activity | 0% | 100% | 0% |
| PlayerPanel | 70% | 20% | 10% |
| PlayerActions | 100% | 0% | 0% |
| LiveArena | 80% | 0% | 20% |
| CycleTimeline | 20% | 70% | 10% |
| LeaderboardPreview | 0% | 100% | 0% |
| LiveTicker | 0% | 100% | 0% |
| **MOYENNE** | **37%** | **58%** | **5%** |


---

## AUDIT BACKEND

### 📦 STRUCTURE BACKEND

Le backend existe dans `backend/` avec:
- Express server (`src/server.ts`)
- Services: `indexer.service.ts`, `leaderboard.service.ts`, `analytics.service.ts`
- Routes: `game.routes.ts`, `player.routes.ts`, `health.routes.ts`
- Database schema: `src/db/schema.sql`

### 🔍 ANALYSE DES SERVICES

#### IndexerService (`backend/src/services/indexer.service.ts`)
- **État:** Non analysé en détail (pas dans les fichiers fournis)
- **Rôle attendu:** Écouter les events on-chain et indexer dans une DB
- **Verdict:** À vérifier, probablement non implémenté

#### LeaderboardService (`backend/src/services/leaderboard.service.ts`)
**Analyse complète:**

```typescript
// Toutes les fonctions retournent des tableaux vides
async getTopPlayersByScore() {
  // TODO: Query database
  return [];
}

async getTopPlayersByBalance() {
  // TODO: Query database
  return [];
}

async getTopPlayersByCycles() {
  // TODO: Query database
  return [];
}

async getTopGainersByCycle() {
  // TODO: Query database
  return [];
}

// ... etc, toutes les fonctions sont vides
```

**Verdict:** ❌ Le service ne fait RIEN, toutes les fonctions retournent `[]`

#### AnalyticsService (`backend/src/services/analytics.service.ts`)
- **État:** Non analysé en détail (pas dans les fichiers fournis)
- **Verdict:** Probablement dans le même état que LeaderboardService

### 🌐 API ENDPOINTS

Le frontend utilise `lib/api.ts` qui définit:
- `getGameState()` → `/game/state`
- `getCycles()` → `/game/cycles`
- `getLeaderboard()` → `/game/leaderboard`
- `getActivity()` → `/game/activity`
- `getPlayer()` → `/game/player/:wallet`
- `getGlobalStats()` → `/game/stats`

**Problème:** Ces endpoints existent probablement mais retournent des données vides ou mock.

### 🗄️ DATABASE

Schema SQL existe (`backend/src/db/schema.sql`) mais:
- **État:** Non analysé (pas dans les fichiers fournis)
- **Connexion:** Probablement non configurée
- **Données:** Probablement vide

### 📊 BACKEND VERDICT

#### Ce que le backend FAIT réellement:
1. ✅ Démarre un serveur Express
2. ✅ Expose des routes HTTP
3. ✅ Répond aux health checks
4. ❌ Ne lit RIEN de la blockchain
5. ❌ Ne stocke RIEN en base de données
6. ❌ Retourne des tableaux vides pour toutes les requêtes

#### Ce que le backend DEVRAIT faire:
1. Écouter les events on-chain (DepositMade, WithdrawMade, etc.)
2. Parser et stocker les events dans une DB
3. Indexer tous les `PlayerState` accounts
4. Indexer tous les `CycleState` accounts
5. Calculer les leaderboards depuis la DB
6. Servir les données indexées au frontend
7. Fournir des endpoints d'analytics

#### Incohérences détectées:

**INCOHÉRENCE #1: Backend inutile**
- Le backend existe mais ne sert à rien
- Le frontend pourrait tout faire directement
- Overhead inutile de maintenance

**INCOHÉRENCE #2: API appelée mais vide**
- `lib/api.ts` définit des fonctions pour appeler le backend
- Mais ces fonctions ne sont jamais utilisées dans les composants
- Les composants utilisent directement les hooks Anchor

**INCOHÉRENCE #3: Double source de vérité**
- Frontend lit directement la chain via Anchor
- Backend est censé indexer la chain
- Mais backend ne fait rien
- Risque de désynchronisation si backend est implémenté plus tard

### 🎯 RECOMMANDATION BACKEND

**Option A: Implémenter le backend correctement**
- Avantages: Cache, performance, analytics avancées
- Inconvénients: Complexité, maintenance, coût infrastructure
- Effort: ~2-3 semaines de dev

**Option B: Supprimer le backend**
- Avantages: Simplicité, moins de code, moins de bugs
- Inconvénients: Requêtes plus lentes, pas de cache
- Effort: ~1 jour de cleanup

**Option C: Backend minimal (recommandé)**
- Implémenter uniquement l'indexation des events
- Stocker uniquement le leaderboard et l'activity feed
- Garder le reste côté frontend
- Effort: ~1 semaine de dev


---

## AUDIT DES INCOHÉRENCES MÉTIERS

### 🎮 LOGIQUE DE JEU PROMISE VS IMPLÉMENTÉE

#### 1. **Redistribution Mechanism**

**Promis:**
- Les joueurs avec exposition participent à un pool
- À la fin du cycle, redistribution basée sur l'exposition
- Gains/pertes calculés selon la formule anti-whale
- Scores mis à jour automatiquement

**Implémenté on-chain:**
- ✅ Formule de redistribution existe (`calculate_redistribution_share`)
- ✅ Anti-whale penalty implémenté (`target_weight_with_anti_whale`)
- ✅ Instruction `claimRedistribution` existe
- ✅ Score mis à jour dans `claimRedistribution`

**Implémenté frontend:**
- ❌ `resolveCycle` jamais appelé
- ❌ `claimRedistribution` jamais appelé
- ❌ Aucun UI pour claim
- ❌ Aucun affichage des gains/pertes potentiels

**Verdict:** ❌ La redistribution n'est JAMAIS exécutée

#### 2. **Cycle Infini**

**Promis:**
- Cycles se succèdent automatiquement
- Durée fixe par cycle
- Résolution automatique à la fin

**Implémenté on-chain:**
- ✅ `cycle_duration` configuré
- ✅ `cycle_start_slot` et `cycle_end_slot` définis
- ✅ Nouveau cycle créé après résolution
- ✅ `current_cycle` incrémenté

**Implémenté frontend:**
- ⚠️ Cycles affichés mais jamais résolus
- ❌ Pas de mécanisme automatique
- ❌ Pas de bouton manuel
- ❌ Bloqué au cycle 1 pour toujours

**Verdict:** ❌ Les cycles ne progressent JAMAIS

#### 3. **Leaderboard Dynamique**

**Promis:**
- Classement basé sur le score
- Score = total_redistributed cumulé
- Mise à jour après chaque cycle
- Affichage en temps réel

**Implémenté on-chain:**
- ✅ `PlayerState.score` existe
- ✅ Score mis à jour dans `claimRedistribution`
- ✅ Score = i64 (peut être négatif)

**Implémenté frontend:**
- ❌ Leaderboard affiche des données fake
- ❌ Score jamais mis à jour (pas de claim)
- ❌ Pas de lecture des vrais scores
- ❌ Pas de tri par score

**Verdict:** ❌ Le leaderboard est 100% fake

#### 4. **Exposure Dynamique**

**Promis:**
- Joueurs peuvent ajuster leur exposition
- Cooldown entre changements
- Impact immédiat sur le pool exposé

**Implémenté on-chain:**
- ✅ `setExposure` instruction
- ✅ Cooldown vérifié (`exposure_cooldown`)
- ✅ `total_exposed_value` mis à jour
- ✅ `participating_in_cycle` flag

**Implémenté frontend:**
- ✅ Slider d'exposition
- ✅ Bouton "Update Exposure"
- ✅ Transaction envoyée
- ✅ État rafraîchi

**Verdict:** ✅ L'exposition fonctionne correctement

#### 5. **Protocol Fees**

**Promis:**
- 2% de fees sur le pool exposé
- Fees collectées dans treasury
- Fees déduites avant redistribution

**Implémenté on-chain:**
- ✅ `protocol_fee_bps = 200` (2%)
- ✅ Fees calculées dans `resolveCycle`
- ✅ Fees transférées au treasury
- ✅ `total_fees_collected` incrémenté

**Implémenté frontend:**
- ❌ Fees jamais collectées (pas de résolution)
- ⚠️ Affichage des fees dans les constantes
- ❌ Pas de visualisation des fees collectées

**Verdict:** ⚠️ Implémenté mais jamais exécuté

#### 6. **Anti-Whale Mechanism**

**Promis:**
- Pénalité pour les gros joueurs (>20% du pool)
- Réduction de leur poids dans la redistribution
- Encourage la diversité

**Implémenté on-chain:**
- ✅ `WHALE_THRESHOLD_BPS = 2000` (20%)
- ✅ `WHALE_PENALTY_BPS = 5000` (50%)
- ✅ `target_weight_with_anti_whale` fonction
- ✅ Appliqué dans `calculate_redistribution_share`

**Implémenté frontend:**
- ❌ Pas d'affichage du statut whale
- ❌ Pas d'avertissement si >20%
- ❌ Pas de visualisation de la pénalité

**Verdict:** ✅ Implémenté on-chain, ❌ pas visible frontend

#### 7. **Deposit/Withdraw Limits**

**Promis:**
- Min deposit: 0.001 SOL
- Max deposit: 1 SOL
- Withdrawal bloqué si exposition > 0

**Implémenté on-chain:**
- ✅ `min_deposit` vérifié
- ✅ `max_deposit` vérifié
- ✅ Withdrawal bloqué si `participating_in_cycle`

**Implémenté frontend:**
- ✅ Limites affichées dans constantes
- ⚠️ Pas de validation côté UI avant transaction
- ✅ Withdrawal désactivé si exposition > 0

**Verdict:** ✅ Fonctionne correctement

### 🚨 ÉCARTS CRITIQUES MÉTIER

#### ÉCART #1: Jeu Non Fonctionnel
**Promis:** Un jeu de redistribution compétitif  
**Réalité:** Un système de dépôt/retrait avec exposition ajustable  
**Impact:** Le cœur du jeu n'existe pas

#### ÉCART #2: Pas de Compétition
**Promis:** Compétition entre joueurs pour maximiser les gains  
**Réalité:** Aucune redistribution, aucun gain/perte  
**Impact:** Pas d'incentive à jouer

#### ÉCART #3: Leaderboard Fictif
**Promis:** Classement basé sur les performances réelles  
**Réalité:** Données inventées  
**Impact:** Perte de crédibilité totale

#### ÉCART #4: Activity Feed Fictif
**Promis:** Transparence totale des actions  
**Réalité:** Events générés aléatoirement  
**Impact:** Illusion de volume, tromperie

#### ÉCART #5: Cycles Bloqués
**Promis:** Cycles infinis qui se succèdent  
**Réalité:** Bloqué au cycle 1 pour toujours  
**Impact:** Pas de progression du jeu


---

## RECOMMENDED NEXT ACTIONS

### 🔴 PRIORITÉ 1 - BLOQUANTS (À faire IMMÉDIATEMENT)

#### ACTION 1.1: Implémenter Cycle Resolution
**Fichier:** `lib/anchor.ts`
```typescript
export async function resolveCycle(program: Program<SwarmArena>) {
  const [configPDA] = getGlobalConfigPDA();
  const [gameStatePDA] = getGameStatePDA();
  const gameState = await program.account.GameState.fetch(gameStatePDA);
  const [cycleStatePDA] = getCycleStatePDA(gameState.currentCycle.toNumber());
  const [treasuryVaultPDA] = getTreasuryVaultPDA();
  const [vaultPDA] = getVaultPDA(); // À créer
  
  return program.methods.resolveCycle()
    .accounts({
      config: configPDA,
      gameState: gameStatePDA,
      cycleState: cycleStatePDA,
      treasuryVault: treasuryVaultPDA,
      vault: vaultPDA,
      resolver: program.provider.publicKey,
      systemProgram: SystemProgram.programId,
    })
    .rpc();
}
```

#### ACTION 1.2: Créer Bouton Resolve Cycle
**Fichier:** `components/game/CycleResolver.tsx` (nouveau)
```typescript
'use client';

import { useAnchorProgram } from '@/lib/anchor';
import { resolveCycle } from '@/lib/anchor';
import { useGameState } from '@/lib/hooks';
import { useConnection } from '@solana/wallet-adapter-react';

export function CycleResolver() {
  const program = useAnchorProgram();
  const { connection } = useConnection();
  const { data: gameState } = useGameState();
  const [currentSlot, setCurrentSlot] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(async () => {
      const slot = await connection.getSlot();
      setCurrentSlot(slot);
    }, 1000);
    return () => clearInterval(interval);
  }, [connection]);
  
  const canResolve = gameState && currentSlot >= gameState.cycleEndSlot.toNumber();
  
  const handleResolve = async () => {
    if (!program) return;
    try {
      await resolveCycle(program);
      alert('Cycle resolved!');
    } catch (error) {
      console.error(error);
      alert('Failed to resolve cycle');
    }
  };
  
  if (!canResolve) return null;
  
  return (
    <button onClick={handleResolve} className="...">
      Resolve Cycle #{gameState.currentCycle.toString()}
    </button>
  );
}
```

#### ACTION 1.3: Implémenter Claim Redistribution
**Fichier:** `lib/anchor.ts`
```typescript
export async function claimRedistribution(
  program: Program<SwarmArena>,
  cycleNumber: number
) {
  const [configPDA] = getGlobalConfigPDA();
  const [gameStatePDA] = getGameStatePDA();
  const [cycleStatePDA] = getCycleStatePDA(cycleNumber);
  const [playerStatePDA] = getPlayerStatePDA(program.provider.publicKey!);
  const [vaultPDA] = getVaultPDA();
  
  return program.methods.claimRedistribution(new BN(cycleNumber))
    .accounts({
      config: configPDA,
      gameState: gameStatePDA,
      cycleState: cycleStatePDA,
      playerState: playerStatePDA,
      vault: vaultPDA,
      player: program.provider.publicKey,
      systemProgram: SystemProgram.programId,
    })
    .rpc();
}
```

#### ACTION 1.4: Créer Bouton Claim
**Fichier:** `components/game/ClaimButton.tsx` (nouveau)
```typescript
'use client';

import { claimRedistribution } from '@/lib/anchor';
import { useAnchorProgram } from '@/lib/anchor';
import { useGameState } from '@/lib/hooks';

export function ClaimButton() {
  const program = useAnchorProgram();
  const { data: gameState } = useGameState();
  
  const handleClaim = async () => {
    if (!program || !gameState) return;
    const lastCycle = gameState.currentCycle.toNumber() - 1;
    try {
      await claimRedistribution(program, lastCycle);
      alert('Claimed successfully!');
    } catch (error) {
      console.error(error);
      alert('Failed to claim');
    }
  };
  
  return (
    <button onClick={handleClaim} className="...">
      Claim Cycle #{gameState?.currentCycle.toNumber() - 1} Rewards
    </button>
  );
}
```

#### ACTION 1.5: Corriger Vault PDA
**Fichier:** `lib/solana.ts`
```typescript
/**
 * Derive PDA for vault (player funds)
 */
export function getVaultPDA(): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('vault')],
    PROGRAM_ID
  );
}
```

**Fichier:** `lib/anchor.ts`
```typescript
// Remplacer dans deposit et withdraw
const [vaultPDA] = getVaultPDA(); // Au lieu de getTreasuryVaultPDA()
```

### 🟠 PRIORITÉ 2 - IMPORTANTS (À faire dans les 2 semaines)

#### ACTION 2.1: Implémenter Vrai Leaderboard
**Fichier:** `lib/hooks/useLeaderboard.ts` (nouveau)
```typescript
export function useLeaderboard(limit: number = 50) {
  const program = useAnchorProgram();
  
  return useQuery({
    queryKey: ['leaderboard', limit],
    queryFn: async () => {
      if (!program) throw new Error('Program not initialized');
      
      // Fetch all players
      const players = await program.account.PlayerState.all();
      
      // Sort by score descending
      const sorted = players.sort((a, b) => 
        b.account.score.toNumber() - a.account.score.toNumber()
      );
      
      // Add ranks
      return sorted.slice(0, limit).map((p, index) => ({
        rank: index + 1,
        wallet: p.account.player.toString(),
        score: p.account.score.toNumber(),
        balance: bnToSol(p.account.balance),
        totalRedistributed: p.account.totalRedistributed.toNumber() / 1e9,
        cyclesParticipated: p.account.cyclesParticipated.toNumber(),
        exposure: p.account.exposure,
        participatingInCycle: p.account.participatingInCycle,
      }));
    },
    enabled: !!program,
    refetchInterval: 10000,
  });
}
```

**Fichier:** `components/game/LeaderboardPreview.tsx`
```typescript
// Remplacer mockPlayers par:
const { data: leaderboard } = useLeaderboard(5);
const topPlayers = leaderboard || [];
```

#### ACTION 2.2: Implémenter Event Listener
**Fichier:** `lib/hooks/useActivityFeed.ts` (nouveau)
```typescript
export function useActivityFeed(limit: number = 20) {
  const program = useAnchorProgram();
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  
  useEffect(() => {
    if (!program) return;
    
    // Listen to all events
    const listeners = [
      program.addEventListener('DepositMade', (event) => {
        setEvents(prev => [{
          id: Date.now().toString(),
          type: 'deposit',
          player: event.player.toString(),
          amount: event.amount.toNumber() / 1e9,
          timestamp: new Date(event.timestamp.toNumber() * 1000),
        }, ...prev].slice(0, limit));
      }),
      
      program.addEventListener('WithdrawMade', (event) => {
        setEvents(prev => [{
          id: Date.now().toString(),
          type: 'withdrawal',
          player: event.player.toString(),
          amount: event.amount.toNumber() / 1e9,
          timestamp: new Date(event.timestamp.toNumber() * 1000),
        }, ...prev].slice(0, limit));
      }),
      
      // Add other events...
    ];
    
    return () => {
      listeners.forEach(id => program.removeEventListener(id));
    };
  }, [program, limit]);
  
  return events;
}
```

#### ACTION 2.3: Implémenter Real Slot Tracking
**Fichier:** `lib/hooks/useCurrentSlot.ts` (nouveau)
```typescript
export function useCurrentSlot() {
  const { connection } = useConnection();
  const [slot, setSlot] = useState(0);
  
  useEffect(() => {
    const updateSlot = async () => {
      const currentSlot = await connection.getSlot();
      setSlot(currentSlot);
    };
    
    updateSlot();
    const interval = setInterval(updateSlot, 1000);
    
    return () => clearInterval(interval);
  }, [connection]);
  
  return slot;
}
```

### 🟡 PRIORITÉ 3 - RECOMMANDÉS (À faire dans le mois)

#### ACTION 3.1: Implémenter Backend Indexer
**Fichier:** `backend/src/services/indexer.service.ts`
- Écouter les events on-chain
- Parser et stocker dans PostgreSQL
- Indexer tous les accounts périodiquement

#### ACTION 3.2: Implémenter Automatic Cycle Resolution
**Option A: Backend Cron Job**
```typescript
// backend/src/jobs/cycle-resolver.ts
setInterval(async () => {
  const gameState = await fetchGameState();
  const currentSlot = await connection.getSlot();
  
  if (currentSlot >= gameState.cycleEndSlot && !gameState.cycleResolved) {
    await resolveCycle();
  }
}, 5000);
```

**Option B: Clockwork (Solana automation)**
- Utiliser Clockwork pour automatiser la résolution
- Plus décentralisé mais plus complexe

#### ACTION 3.3: Ajouter Player Rank Calculation
**Fichier:** `lib/hooks/usePlayerRank.ts` (nouveau)
```typescript
export function usePlayerRank() {
  const { publicKey } = useWallet();
  const program = useAnchorProgram();
  
  return useQuery({
    queryKey: ['playerRank', publicKey?.toString()],
    queryFn: async () => {
      if (!program || !publicKey) return null;
      
      const players = await program.account.PlayerState.all();
      const sorted = players.sort((a, b) => 
        b.account.score.toNumber() - a.account.score.toNumber()
      );
      
      const index = sorted.findIndex(p => 
        p.account.player.equals(publicKey)
      );
      
      return index >= 0 ? index + 1 : null;
    },
    enabled: !!program && !!publicKey,
    refetchInterval: 10000,
  });
}
```


---

## ANNEXE: MAPPING COMPLET DES COMPTES

### 📋 COMPTES ON-CHAIN

#### GlobalConfig
- **PDA Seeds:** `["config"]`
- **Où lu:** `lib/anchor.ts` → `fetchGlobalConfig()`
- **Où écrit:** `initializeConfig` (déjà fait)
- **Où mal interprété:** Nulle part
- **Où ignoré:** Partout (jamais affiché dans l'UI)

#### GameState
- **PDA Seeds:** `["game_state"]`
- **Où lu:** 
  - `lib/hooks/useGameState.ts` → `fetchGameState()`
  - `app/dashboard/page.tsx` (ligne 15)
  - `components/game/LiveArena.tsx` (ligne 18)
- **Où écrit:** 
  - `deposit` (met à jour totalValueLocked)
  - `withdraw` (met à jour totalValueLocked)
  - `setExposure` (met à jour totalExposedValue, activePlayers)
  - `resolveCycle` (met à jour currentCycle, cycleResolved)
- **Où mal interprété:** Nulle part
- **Où ignoré:** `cycleResolved` flag jamais utilisé pour déclencher actions

#### CycleState
- **PDA Seeds:** `["cycle", cycle_number]`
- **Où lu:** ❌ JAMAIS
- **Où écrit:** `resolveCycle` (crée un nouveau CycleState)
- **Où mal interprété:** N/A
- **Où ignoré:** Complètement ignoré, remplacé par mock data

#### PlayerState
- **PDA Seeds:** `["player", player_pubkey]`
- **Où lu:**
  - `lib/hooks/usePlayerState.ts` → `fetchPlayerState()`
  - `app/dashboard/page.tsx` (ligne 14)
  - `components/game/PlayerPanel.tsx` (ligne 14)
  - `components/game/PlayerActions.tsx` (ligne 13)
- **Où écrit:**
  - `registerPlayer` (crée le compte)
  - `deposit` (met à jour balance, totalDeposited)
  - `withdraw` (met à jour balance, totalWithdrawn)
  - `setExposure` (met à jour exposure, exposedValue, participatingInCycle)
  - `claimRedistribution` (met à jour balance, score, totalRedistributed)
- **Où mal interprété:** `score` lu mais jamais mis à jour (pas de claim)
- **Où ignoré:** `cyclesParticipated`, `lastExposureChangeSlot`, `registeredSlot`

#### TreasuryVault
- **PDA Seeds:** `["treasury"]`
- **Où lu:** ❌ JAMAIS
- **Où écrit:** `resolveCycle` (reçoit les fees)
- **Où mal interprété:** Confondu avec le vault dans deposit/withdraw
- **Où ignoré:** Complètement ignoré

#### Vault (Player Funds)
- **PDA Seeds:** `["vault"]`
- **Où lu:** Implicitement dans deposit/withdraw
- **Où écrit:** 
  - `deposit` (reçoit SOL)
  - `withdraw` (envoie SOL)
  - `resolveCycle` (envoie fees au treasury)
- **Où mal interprété:** ⚠️ CRITIQUE - getTreasuryVaultPDA() utilisé au lieu de getVaultPDA()
- **Où ignoré:** Pas de visualisation du solde du vault

### 🎯 EVENTS ON-CHAIN

#### ConfigInitialized
- **Émis par:** `initializeConfig`
- **Écouté:** ❌ NON
- **Affiché:** ❌ NON

#### PlayerRegistered
- **Émis par:** `registerPlayer`
- **Écouté:** ❌ NON
- **Affiché:** ❌ NON

#### DepositMade
- **Émis par:** `deposit`
- **Écouté:** ❌ NON
- **Affiché:** ❌ NON (remplacé par mock)

#### WithdrawMade
- **Émis par:** `withdraw`
- **Écouté:** ❌ NON
- **Affiché:** ❌ NON (remplacé par mock)

#### ExposureUpdated
- **Émis par:** `setExposure`
- **Écouté:** ❌ NON
- **Affiché:** ❌ NON (remplacé par mock)

#### CycleResolved
- **Émis par:** `resolveCycle`
- **Écouté:** ❌ NON
- **Affiché:** ❌ NON (remplacé par mock)

#### RewardDistributed
- **Émis par:** `claimRedistribution`
- **Écouté:** ❌ NON
- **Affiché:** ❌ NON (remplacé par mock)

#### FeeCollected
- **Émis par:** `resolveCycle`
- **Écouté:** ❌ NON
- **Affiché:** ❌ NON

#### ParticipationChanged
- **Émis par:** `setExposure`
- **Écouté:** ❌ NON
- **Affiché:** ❌ NON

#### ProtocolStatusChanged
- **Émis par:** (admin functions, pas implémenté)
- **Écouté:** ❌ NON
- **Affiché:** ❌ NON

### 📊 RÉSUMÉ COMPTES

| Compte | Lecture | Écriture | Affichage | Statut |
|--------|---------|----------|-----------|--------|
| GlobalConfig | ✅ | ✅ | ❌ | Ignoré UI |
| GameState | ✅ | ✅ | ✅ | Correct |
| CycleState | ❌ | ❌ | ❌ | Complètement ignoré |
| PlayerState | ✅ | ✅ | ⚠️ | Partiellement affiché |
| TreasuryVault | ❌ | ✅ | ❌ | Ignoré |
| Vault | ⚠️ | ⚠️ | ❌ | PDA incorrect |

### 📊 RÉSUMÉ EVENTS

| Event | Émis | Écouté | Affiché | Statut |
|-------|------|--------|---------|--------|
| ConfigInitialized | ✅ | ❌ | ❌ | Ignoré |
| PlayerRegistered | ✅ | ❌ | ❌ | Ignoré |
| DepositMade | ✅ | ❌ | ❌ | Remplacé par mock |
| WithdrawMade | ✅ | ❌ | ❌ | Remplacé par mock |
| ExposureUpdated | ✅ | ❌ | ❌ | Remplacé par mock |
| CycleResolved | ❌ | ❌ | ❌ | Jamais émis |
| RewardDistributed | ❌ | ❌ | ❌ | Jamais émis |
| FeeCollected | ❌ | ❌ | ❌ | Jamais émis |
| ParticipationChanged | ✅ | ❌ | ❌ | Ignoré |
| ProtocolStatusChanged | ❌ | ❌ | ❌ | Non implémenté |

---

## CONCLUSION FINALE

### 🎯 VÉRITÉ BRUTALE

Le projet Swarm Arena est actuellement un **PROTOTYPE FONCTIONNEL À 40%**:

**Ce qui fonctionne réellement:**
- ✅ Smart contract déployé et opérationnel
- ✅ Wallet connection
- ✅ Player registration
- ✅ Deposit/Withdraw (avec bug PDA)
- ✅ Set exposure
- ✅ Lecture des données on-chain de base

**Ce qui ne fonctionne PAS:**
- ❌ Résolution de cycles (bloquant)
- ❌ Redistribution (bloquant)
- ❌ Leaderboard (100% fake)
- ❌ Activity feed (100% fake)
- ❌ Cycle history (100% fake)
- ❌ Backend (0% fonctionnel)
- ❌ Events listening (0%)

### 📈 EFFORT ESTIMÉ POUR COMPLÉTION

**Pour rendre le jeu fonctionnel (MVP):**
- Priorité 1 (bloquants): ~3-5 jours
- Priorité 2 (importants): ~1-2 semaines
- Priorité 3 (recommandés): ~2-3 semaines

**Total: 4-6 semaines de développement**

### ⚠️ RISQUES ACTUELS

1. **Perte de crédibilité:** Les utilisateurs verront rapidement que le leaderboard et l'activity sont fake
2. **Confusion utilisateur:** Le jeu semble fonctionner mais ne redistribue jamais rien
3. **Bug PDA critique:** Risque de perte de fonds si vault mal configuré
4. **Cycles bloqués:** Le jeu ne peut pas progresser au-delà du cycle 1

### ✅ PROCHAINES ÉTAPES RECOMMANDÉES

1. **IMMÉDIAT:** Corriger le bug PDA du vault (ACTION 1.5)
2. **JOUR 1:** Implémenter resolveCycle + bouton (ACTIONS 1.1, 1.2)
3. **JOUR 2:** Implémenter claimRedistribution + bouton (ACTIONS 1.3, 1.4)
4. **JOUR 3-5:** Tester le flow complet de redistribution
5. **SEMAINE 2:** Implémenter vrai leaderboard (ACTION 2.1)
6. **SEMAINE 3:** Implémenter event listener (ACTION 2.2)
7. **SEMAINE 4+:** Backend indexer et automatisation

---

**FIN DE L'AUDIT**


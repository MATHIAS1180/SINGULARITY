# AUDIT TECHNIQUE CIBLÉ - CORRECTIONS FONCTIONNELLES

**Date:** 28 Mars 2026  
**Objectif:** Rendre l'application fidèle à la logique on-chain

---

## CLASSIFICATION DES FICHIERS À MODIFIER

### 🔴 BLOQUANTS (Priorité 1)

#### 1. **lib/anchor.ts** - Ajouter resolveCycle et claimRedistribution
- **Problème:** Les instructions `resolveCycle` et `claimRedistribution` ne sont pas implémentées
- **Pourquoi c'est faux:** Le jeu ne peut pas progresser sans ces fonctions
- **Correction:** Ajouter les deux fonctions avec les bons comptes PDA
- **Impact:** CRITIQUE - Débloque le cœur du jeu

#### 2. **lib/anchor.ts** - Corriger vault PDA dans deposit/withdraw
- **Problème:** Utilise `getTreasuryVaultPDA()` au lieu de `getVaultPDA()`
- **Pourquoi c'est faux:** Confusion entre treasury (fees) et vault (player funds)
- **Correction:** Remplacer par `getVaultPDA()` qui existe déjà dans solana.ts
- **Impact:** CRITIQUE - Risque de perte de fonds

#### 3. **components/game/CycleResolver.tsx** - CRÉER
- **Problème:** N'existe pas
- **Pourquoi c'est faux:** Aucun moyen de résoudre les cycles
- **Correction:** Créer composant avec bouton + logique de détection de fin de cycle
- **Impact:** BLOQUANT - Cycles ne progressent jamais

#### 4. **components/game/ClaimButton.tsx** - CRÉER
- **Problème:** N'existe pas
- **Pourquoi c'est faux:** Aucun moyen de claim les redistributions
- **Correction:** Créer composant avec bouton claim + affichage gains/pertes
- **Impact:** BLOQUANT - Joueurs ne reçoivent jamais leurs gains

#### 5. **lib/hooks/useCurrentSlot.ts** - CRÉER
- **Problème:** N'existe pas, slot simulé avec Date.now() / 400
- **Pourquoi c'est faux:** Progression de cycle imprécise
- **Correction:** Hook qui lit le slot réel via connection.getSlot()
- **Impact:** MAJEUR - Synchronisation cycle incorrecte

### 🟠 IMPORTANTS (Priorité 2)

#### 6. **lib/hooks/useLeaderboard.ts** - CRÉER
- **Problème:** N'existe pas (mais déjà utilisé dans LeaderboardPreview!)
- **Pourquoi c'est faux:** LeaderboardPreview importe un hook qui n'existe pas
- **Correction:** Créer hook qui fetch tous les PlayerState et trie par score
- **Impact:** CRITIQUE - Leaderboard actuellement cassé

#### 7. **lib/hooks/useCycleHistory.ts** - CRÉER
- **Problème:** N'existe pas
- **Pourquoi c'est faux:** Cycles affichés sont hardcodés
- **Correction:** Hook qui fetch les CycleState accounts
- **Impact:** IMPORTANT - Historique fake

#### 8. **lib/hooks/useActivityFeed.ts** - CRÉER
- **Problème:** N'existe pas
- **Pourquoi c'est faux:** Events générés aléatoirement
- **Correction:** Hook qui écoute les events on-chain
- **Impact:** IMPORTANT - Activity feed fake

#### 9. **lib/hooks/usePlayerRank.ts** - CRÉER
- **Problème:** N'existe pas
- **Pourquoi c'est faux:** Rank toujours affiché comme 0
- **Correction:** Hook qui calcule le rank depuis tous les players
- **Impact:** IMPORTANT - Pas de feedback de position

#### 10. **components/game/CycleTimeline.tsx** - CORRIGER
- **Problème:** Cycles hardcodés
- **Pourquoi c'est faux:** Données inventées
- **Correction:** Utiliser useCycleHistory pour afficher vrais cycles
- **Impact:** IMPORTANT - Historique fake

#### 11. **app/leaderboard/page.tsx** - CORRIGER
- **Problème:** Mock data hardcodé
- **Pourquoi c'est faux:** Leaderboard 100% fake
- **Correction:** Utiliser useLeaderboard pour afficher vrais joueurs
- **Impact:** CRITIQUE - Perte de crédibilité

#### 12. **app/activity/page.tsx** - CORRIGER
- **Problème:** Mock events générés aléatoirement
- **Pourquoi c'est faux:** Activity feed 100% fake
- **Correction:** Utiliser useActivityFeed pour afficher vrais events
- **Impact:** IMPORTANT - Transparence fake

#### 13. **components/ui/LiveTicker.tsx** - CORRIGER
- **Problème:** Events générés aléatoirement
- **Pourquoi c'est faux:** Ticker "live" n'est pas live
- **Correction:** Utiliser useActivityFeed pour afficher vrais events
- **Impact:** IMPORTANT - Illusion de volume

### 🟡 RECOMMANDÉS (Priorité 3)

#### 14. **components/game/LiveArena.tsx** - CORRIGER
- **Problème:** Slot simulé avec Date.now() / 400
- **Pourquoi c'est faux:** Progression approximative
- **Correction:** Utiliser useCurrentSlot pour slot réel
- **Impact:** MINEUR - Déjà fonctionnel mais imprécis

#### 15. **components/game/PlayerPanel.tsx** - CORRIGER
- **Problème:** Rank hardcodé à 0
- **Pourquoi c'est faux:** Joueurs ne voient pas leur position
- **Correction:** Utiliser usePlayerRank pour afficher vrai rank
- **Impact:** MINEUR - Amélioration UX

#### 16. **app/dashboard/page.tsx** - CORRIGER
- **Problème:** Rank affiché comme "—"
- **Pourquoi c'est faux:** Pas de feedback de position
- **Correction:** Utiliser usePlayerRank pour afficher vrai rank
- **Impact:** MINEUR - Amélioration UX

#### 17. **backend/** - DÉCISION À PRENDRE
- **Problème:** Backend existe mais ne fait rien
- **Pourquoi c'est faux:** Toutes les fonctions retournent []
- **Correction:** Soit implémenter indexation, soit supprimer
- **Impact:** MINEUR - Frontend peut tout faire

---

## PLAN D'EXÉCUTION

### PHASE 1 - BLOQUANTS (Aujourd'hui)

1. ✅ Corriger vault PDA dans lib/anchor.ts (deposit/withdraw)
2. ✅ Ajouter resolveCycle dans lib/anchor.ts
3. ✅ Ajouter claimRedistribution dans lib/anchor.ts
4. ✅ Créer lib/hooks/useCurrentSlot.ts
5. ✅ Créer components/game/CycleResolver.tsx
6. ✅ Créer components/game/ClaimButton.tsx
7. ✅ Intégrer CycleResolver et ClaimButton dans dashboard

### PHASE 2 - IMPORTANTS (Demain)

8. ✅ Créer lib/hooks/useLeaderboard.ts
9. ✅ Créer lib/hooks/useCycleHistory.ts
10. ✅ Créer lib/hooks/useActivityFeed.ts
11. ✅ Créer lib/hooks/usePlayerRank.ts
12. ✅ Corriger components/game/LeaderboardPreview.tsx
13. ✅ Corriger app/leaderboard/page.tsx
14. ✅ Corriger app/activity/page.tsx
15. ✅ Corriger components/ui/LiveTicker.tsx
16. ✅ Corriger components/game/CycleTimeline.tsx

### PHASE 3 - RECOMMANDÉS (Après-demain)

17. ✅ Corriger components/game/LiveArena.tsx
18. ✅ Corriger components/game/PlayerPanel.tsx
19. ✅ Corriger app/dashboard/page.tsx
20. ⚠️ Décision backend (implémenter ou supprimer)

---

## DÉTAIL DES CORRECTIONS

### CORRECTION 1: Vault PDA dans deposit/withdraw

**Fichier:** `lib/anchor.ts`

**Avant:**
```typescript
const [vaultPDA] = getTreasuryVaultPDA(); // ❌ INCORRECT
```

**Après:**
```typescript
const [vaultPDA] = getVaultPDA(); // ✅ CORRECT
```

**Justification:** Le smart contract attend `vault` (seeds: ["vault"]) pour les fonds joueurs, pas `treasury` (seeds: ["treasury"]) qui est pour les fees.

---

### CORRECTION 2-3: Ajouter resolveCycle et claimRedistribution

**Fichier:** `lib/anchor.ts`

**À ajouter:**
```typescript
export async function resolveCycle(program: Program<SwarmArena>) {
  const [configPDA] = getGlobalConfigPDA();
  const [gameStatePDA] = getGameStatePDA();
  const gameState = await program.account.gameState.fetch(gameStatePDA);
  const [cycleStatePDA] = getCycleStatePDA(gameState.currentCycle.toNumber());
  const [treasuryVaultPDA] = getTreasuryVaultPDA();
  const [vaultPDA] = getVaultPDA();
  
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

**Justification:** Ces instructions existent dans l'IDL mais ne sont jamais appelées. Elles sont essentielles pour le fonctionnement du jeu.

---

## ÉLÉMENTS MOCK/FAKE À SUPPRIMER

### À SUPPRIMER COMPLÈTEMENT

1. ❌ Mock players dans `components/game/LeaderboardPreview.tsx` (ligne 13-30)
2. ❌ Mock players dans `app/leaderboard/page.tsx` (ligne 11-30)
3. ❌ Mock events dans `app/activity/page.tsx` (ligne 31-56)
4. ❌ Mock cycles dans `components/game/CycleTimeline.tsx` (ligne 13-35)
5. ❌ generateMockEvent dans `components/ui/LiveTicker.tsx` (ligne 30-50)
6. ❌ Slot simulé `Date.now() / 400` partout

### À REMPLACER PAR VRAIES DONNÉES

1. ✅ Leaderboard → `useLeaderboard()` hook
2. ✅ Activity feed → `useActivityFeed()` hook
3. ✅ Cycle history → `useCycleHistory()` hook
4. ✅ Player rank → `usePlayerRank()` hook
5. ✅ Current slot → `useCurrentSlot()` hook

---

## POINTS À CONFIRMER MANUELLEMENT

1. ⚠️ Tester resolveCycle sur devnet après implémentation
2. ⚠️ Tester claimRedistribution sur devnet après implémentation
3. ⚠️ Vérifier que le vault PDA est correct (comparer avec smart contract)
4. ⚠️ Vérifier que les events sont bien émis on-chain
5. ⚠️ Vérifier que les CycleState sont créés après résolution
6. ⚠️ Vérifier que les scores sont mis à jour après claim
7. ⚠️ Tester le flow complet: deposit → set exposure → resolve → claim

---

## LIMITES ET HYPOTHÈSES

### Hypothèses

1. Le smart contract est correctement déployé et fonctionnel
2. L'IDL est à jour et correspond au smart contract
3. Le PROGRAM_ID est correct
4. Les PDAs sont dérivées correctement
5. Le wallet connecté a assez de SOL pour les transactions

### Limites

1. Pas d'automatisation de la résolution de cycle (nécessite action manuelle)
2. Pas d'indexation backend (toutes les requêtes directes à la chain)
3. Pas de cache (peut être lent avec beaucoup de joueurs)
4. Pas de pagination du leaderboard (fetch tous les joueurs)
5. Pas de filtrage avancé de l'activity feed

### Améliorations futures

1. Backend indexer pour performance
2. Cron job pour résolution automatique des cycles
3. Pagination et filtres avancés
4. Notifications push pour events importants
5. Analytics et graphiques avancés

---

**FIN DE L'AUDIT TECHNIQUE CIBLÉ**

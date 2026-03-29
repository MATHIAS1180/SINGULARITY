# Instructions pour Redéployer avec Min Deposit 0.01 SOL

## Problème Actuel
Le protocole est initialisé avec:
- Min Deposit: 0.1 SOL (trop élevé)
- Max Deposit: 1000 SOL (trop élevé)
- Cycle Duration: 600 slots (trop long)
- Exposure Cooldown: 60 slots (trop long)

## Objectif
Redéployer avec:
- Min Deposit: 0.01 SOL
- Max Deposit: 1 SOL
- Cycle Duration: 100 slots (~40 secondes)
- Exposure Cooldown: 10 slots (~4 secondes)

## Solution: Redéployer le Programme

### Étape 1: Sur Solana Playground

1. Va sur https://beta.solpg.io
2. Connecte ton wallet Phantom
3. Assure-toi d'avoir au moins 2-3 SOL sur Devnet (pour le déploiement)
4. Copie tout le code du smart contract depuis les fichiers `programs/swarm-arena/src/`

### Étape 2: Build et Deploy

1. Clique sur "Build" (icône marteau)
2. Attends que le build se termine
3. Clique sur "Deploy"
4. Note le NOUVEAU Program ID qui sera généré

### Étape 3: Mettre à Jour le Frontend

1. Ouvre `SINGULARITY/lib/solana.ts`
2. Remplace l'ancien Program ID par le nouveau:
   ```typescript
   export const PROGRAM_ID = new PublicKey('NOUVEAU_PROGRAM_ID_ICI');
   ```

### Étape 4: Initialiser avec les Bons Paramètres

Sur Solana Playground, dans l'onglet "Test":

1. Sélectionne la fonction `initializeConfig`
2. Remplis les paramètres:
   ```
   protocolFeeBps: 200
   minDeposit: 10000000 (0.01 SOL en lamports)
   maxDeposit: 1000000000 (1 SOL en lamports)
   minExposure: 0
   maxExposure: 100
   cycleDuration: 100
   exposureCooldown: 10
   ```

3. Pour les comptes, utilise "From seed":
   - config: seed = "config"
   - gameState: seed = "game_state"
   - treasuryVault: seed = "treasury"
   - vault: seed = "vault"
   - authority: ton wallet (auto)
   - systemProgram: 11111111111111111111111111111111

4. Clique sur "Test" et approuve la transaction dans Phantom

### Étape 5: Vérifier

Retourne sur http://localhost:3000/admin pour vérifier que:
- Min Deposit = 0.01 SOL
- Max Deposit = 1 SOL
- Cycle Duration = 100 slots
- Exposure Cooldown = 10 slots

## Alternative: Utiliser le Frontend pour Initialiser

Si tu préfères, après avoir déployé le nouveau programme:

1. Mets à jour le Program ID dans `lib/solana.ts`
2. Redémarre le serveur: `npm run dev`
3. Va sur http://localhost:3000/admin
4. Le composant InitializeProtocol devrait maintenant fonctionner avec les bons paramètres

## Notes Importantes

- Chaque déploiement crée un NOUVEAU Program ID
- Tu dois mettre à jour ce Program ID dans le frontend
- Les anciens comptes (avec l'ancien Program ID) ne seront plus utilisés
- C'est normal sur Devnet, c'est fait pour tester

## Conversion Lamports ↔ SOL

- 1 SOL = 1,000,000,000 lamports (1e9)
- 0.01 SOL = 10,000,000 lamports
- 0.001 SOL = 1,000,000 lamports
- 0.1 SOL = 100,000,000 lamports

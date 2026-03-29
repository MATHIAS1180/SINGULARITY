# Guide Complet: Redéployer sur Solana Playground

## Étape 1: Préparer Solana Playground

1. Va sur https://beta.solpg.io
2. Connecte ton wallet Phantom (bouton en haut à droite)
3. Assure-toi d'avoir au moins 2-3 SOL sur Devnet
   - Si besoin, utilise le faucet: https://faucet.solana.com

## Étape 2: Créer le Projet

1. Clique sur "Create a new project"
2. Choisis "Anchor" comme template
3. Nomme le projet "swarm-arena"

## Étape 3: Copier le Code

Sur Solana Playground, tu verras un fichier `lib.rs`. 

**IMPORTANT**: Le code complet du smart contract se trouve dans:
`SINGULARITY/programs/swarm-arena/src/lib.rs`

Ouvre ce fichier dans ton éditeur et copie TOUT le contenu (1344 lignes).

Ensuite, colle-le dans le fichier `lib.rs` de Solana Playground.

## Étape 4: Modifier le Program ID

Dans le code que tu viens de coller, trouve la ligne (ligne 9):

```rust
declare_id!("A9W89qV4i21ZCmFTLYZZE3HgwnqimWEFjGd3rowYcZpr");
```

**NE LA MODIFIE PAS ENCORE** - Solana Playground va générer un nouveau Program ID automatiquement.

## Étape 5: Build

1. Clique sur l'icône "Build" (marteau) dans la barre latérale gauche
2. Attends que le build se termine (peut prendre 1-2 minutes)
3. Si tu vois "Build successful", continue
4. Si tu vois des erreurs, copie-les et demande de l'aide

## Étape 6: Deploy

1. Clique sur "Deploy"
2. Approuve la transaction dans Phantom
3. Attends la confirmation
4. **IMPORTANT**: Note le nouveau Program ID qui s'affiche

## Étape 7: Mettre à Jour le Frontend

1. Ouvre `SINGULARITY/lib/solana.ts`
2. Remplace la ligne 11:
   ```typescript
   export const PROGRAM_ID = new PublicKey('HSAT7fSHWMaZS4ek3XSfu4uyWakDq9bKRdaD9SLQayYd');
   ```
   Par:
   ```typescript
   export const PROGRAM_ID = new PublicKey('TON_NOUVEAU_PROGRAM_ID_ICI');
   ```

## Étape 8: Initialiser le Protocole

Sur Solana Playground, va dans l'onglet "Test":

1. Sélectionne la fonction `initializeConfig`
2. Remplis les paramètres:
   ```
   protocolFeeBps: 200
   minDeposit: 10000000
   maxDeposit: 1000000000
   minExposure: 0
   maxExposure: 100
   cycleDuration: 100
   exposureCooldown: 10
   ```

3. Pour les comptes, clique sur "From seed" pour chaque:
   - config: seed = `config`
   - gameState: seed = `game_state`
   - treasuryVault: seed = `treasury`
   - vault: seed = `vault`
   - authority: (ton wallet - auto-rempli)
   - systemProgram: `11111111111111111111111111111111`

4. Clique sur "Test"
5. Approuve la transaction dans Phantom

## Étape 9: Vérifier

1. Redémarre le serveur local: `npm run dev` dans SINGULARITY
2. Va sur http://localhost:3000/admin
3. Tu devrais voir:
   - Min Deposit: 0.01 SOL ✅
   - Max Deposit: 1 SOL ✅
   - Cycle Duration: 100 slots ✅
   - Exposure Cooldown: 10 slots ✅

## Conversion Lamports

Pour référence:
- 0.01 SOL = 10,000,000 lamports
- 0.1 SOL = 100,000,000 lamports
- 1 SOL = 1,000,000,000 lamports

## En Cas de Problème

Si le build échoue, vérifie:
1. Que tu as copié TOUT le code (1344 lignes)
2. Qu'il n'y a pas d'erreurs de copier-coller
3. Que tu es bien sur Devnet

Si le déploiement échoue:
1. Vérifie que tu as assez de SOL
2. Essaie de faire un airdrop: https://faucet.solana.com

Si l'initialisation échoue:
1. Vérifie que les seeds sont corrects
2. Vérifie que les paramètres sont des nombres (pas de guillemets)
3. Vérifie que systemProgram est bien `11111111111111111111111111111111`

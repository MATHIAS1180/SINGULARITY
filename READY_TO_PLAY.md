# ✅ SWARM ARENA - PRÊT À JOUER!

## 🎮 Le jeu est maintenant opérationnel!

Toutes les configurations sont terminées. Le protocole est déployé et initialisé sur Devnet.

## 📋 Configuration Actuelle

### Smart Contract
- **Program ID**: `FbSDMGKyTo1YYGMjtau1JLBUDh18koz1JKN3NL38Zmf3`
- **Réseau**: Devnet
- **Status**: ✅ Initialisé et opérationnel

### Paramètres du Jeu
- **Min Deposit**: 0.01 SOL
- **Max Deposit**: 100 SOL
- **Protocol Fee**: 2%
- **Cycle Duration**: 600 slots (~240 secondes)
- **Exposure Cooldown**: 60 slots (~24 secondes)
- **Exposure Range**: 0% - 100%

## 🚀 Comment Jouer

### 1. Connecte ton Wallet
- Va sur http://localhost:3000/dashboard
- Clique sur "Select Wallet" et connecte Phantom ou Solflare
- Assure-toi d'être sur Devnet

### 2. Enregistre-toi
- Une fois connecté, tu verras un bouton "Register Player"
- Clique dessus et approuve la transaction
- Coût: ~0.002 SOL pour créer ton compte joueur

### 3. Dépose des SOL
- Après l'enregistrement, tu peux déposer des SOL
- Minimum: 0.01 SOL
- Maximum: 100 SOL
- Entre le montant et clique sur "Deposit"

### 4. Définis ton Exposition
- Utilise le slider pour définir ton exposition (0-100%)
- Plus ton exposition est élevée, plus tu risques/gagnes
- Clique sur "Update Exposure" pour confirmer

### 5. Participe aux Cycles
- Chaque cycle dure 600 slots (~4 minutes)
- Si ton exposition > 0%, tu participes automatiquement
- À la fin du cycle, les fonds des perdants sont redistribués aux gagnants

### 6. Claim tes Gains
- Après la résolution d'un cycle, tu peux claim ta redistribution
- Va dans le dashboard et clique sur "Claim Redistribution"

### 7. Retire tes SOL
- Pour retirer, mets d'abord ton exposition à 0%
- Attends la fin du cycle en cours
- Clique sur "Withdraw" et entre le montant

## 📊 Pages Disponibles

- **Dashboard** (`/dashboard`): Joue, dépose, retire, définis ton exposition
- **Leaderboard** (`/leaderboard`): Vois le classement des joueurs
- **Activity** (`/activity`): Historique des transactions
- **Profile** (`/profile`): Tes statistiques personnelles

## 🔧 Commandes Utiles

```bash
# Démarrer le serveur de développement
npm run dev

# Tester le statut du protocole
npx tsx scripts/test-protocol.ts

# Calculer les PDAs
node calculate-pdas.js
```

## 🎯 Mécaniques du Jeu

### Comment Gagner
1. **Exposition Optimale**: Trouve le bon équilibre entre risque et récompense
2. **Timing**: Entre et sors des cycles au bon moment
3. **Gestion du Risque**: Ne mets pas tout ton capital en exposition

### Comment Perdre
1. **Trop d'Exposition**: Si tu perds, tu perds beaucoup
2. **Mauvais Timing**: Entrer juste avant une grosse perte
3. **Pas de Diversification**: Tout miser sur un seul cycle

### Frais
- **Protocol Fee**: 2% sur les redistributions
- **Transaction Fees**: ~0.000005 SOL par transaction Solana

## 🐛 Dépannage

### "Player not registered"
→ Clique sur "Register Player" dans le dashboard

### "Insufficient balance"
→ Dépose plus de SOL (minimum 0.01 SOL)

### "Exposure cooldown active"
→ Attends 60 slots (~24 secondes) entre chaque changement d'exposition

### "Cannot withdraw during active exposure"
→ Mets ton exposition à 0% d'abord

### Wallet non connecté
→ Assure-toi d'être sur Devnet dans les paramètres de ton wallet

## 📱 Obtenir des SOL Devnet

Si tu n'as pas de SOL Devnet:

```bash
# Via CLI
solana airdrop 2 <TON_ADRESSE> --url devnet

# Via Faucet Web
https://faucet.solana.com/
```

## 🎉 C'est Parti!

Le jeu est prêt! Va sur http://localhost:3000/dashboard et commence à jouer!

---

**Bon jeu! 🚀**

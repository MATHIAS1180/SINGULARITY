# 🚀 Guide de Déploiement Vercel - Swarm Arena

## ✅ Prérequis

Votre projet est **prêt à déployer**. Tous les fichiers de configuration sont en place.

---

## 🎯 Méthode Rapide (Recommandée)

### 1. Installer Vercel CLI

```bash
npm install -g vercel
```

### 2. Se connecter

```bash
vercel login
```

### 3. Déployer en preview

```bash
vercel
```

Cette commande va:
- Détecter automatiquement Next.js
- Lire `vercel.json` pour la configuration
- Injecter les variables d'environnement
- Builder et déployer
- Vous donner une URL de preview

### 4. Déployer en production

```bash
vercel --prod
```

---

## 🌐 Méthode Dashboard Vercel

### 1. Aller sur Vercel

https://vercel.com/new

### 2. Importer votre projet

- Connecter votre compte GitHub/GitLab/Bitbucket
- Sélectionner le repo `swarm-arena`
- Vercel détectera automatiquement Next.js

### 3. Configuration (déjà faite)

Vercel lira automatiquement `vercel.json` qui contient:

```json
{
  "env": {
    "NEXT_PUBLIC_SOLANA_NETWORK": "devnet",
    "NEXT_PUBLIC_RPC_URL": "https://api.devnet.solana.com",
    "NEXT_PUBLIC_PROGRAM_ID": "A9W89qV4i21ZCmFTLYZZE3HgwnqimWEFjGd3rowYcZpr"
  }
}
```

### 4. Déployer

Cliquer sur "Deploy" et attendre ~2 minutes.

---

## 🔧 Variables d'Environnement

### Déjà configurées dans vercel.json

✅ `NEXT_PUBLIC_SOLANA_NETWORK=devnet`
✅ `NEXT_PUBLIC_RPC_URL=https://api.devnet.solana.com`
✅ `NEXT_PUBLIC_PROGRAM_ID=A9W89qV4i21ZCmFTLYZZE3HgwnqimWEFjGd3rowYcZpr`

### Optionnelles (à ajouter manuellement si besoin)

Si vous voulez utiliser un RPC provider dédié:

```bash
NEXT_PUBLIC_RPC_URL=https://your-helius-or-quicknode-url.com
```

Si vous déployez le backend séparément:

```bash
NEXT_PUBLIC_API_URL=https://your-backend-url.com
```

---

## ⚡ Déploiement Continu (CI/CD)

### Avec GitHub

1. Push votre code sur GitHub
2. Connecter le repo à Vercel
3. Chaque push sur `main` → déploiement automatique
4. Chaque PR → preview deployment automatique

### Configuration automatique

Vercel créera automatiquement:
- Production: `https://swarm-arena.vercel.app`
- Preview: `https://swarm-arena-git-branch.vercel.app`

---

## 🧪 Tester Avant Production

### 1. Build local

```bash
npm run build
npm run start
```

Ouvrir http://localhost:3000 et tester:
- Connexion wallet
- Navigation entre pages
- Pas d'erreurs console

### 2. Preview deployment

```bash
vercel
```

Tester sur l'URL de preview avant de passer en prod.

---

## 🐛 Troubleshooting

### Build échoue sur Vercel

**Vérifier:**
1. Node version (Vercel utilise Node 18 par défaut)
2. Logs de build dans le dashboard Vercel
3. Variables d'environnement bien définies

**Solution:**
```bash
# Tester le build localement d'abord
npm run build
```

### Wallet ne se connecte pas

**Vérifier:**
1. Network = devnet dans les variables
2. RPC URL accessible
3. Program ID correct
4. Console browser pour erreurs

### Pages 404

**Vérifier:**
1. Toutes les pages sont dans `app/`
2. Pas de typo dans les routes
3. `app/layout.tsx` existe

---

## 📊 Après Déploiement

### 1. Vérifier le déploiement

- ✅ Site accessible
- ✅ Toutes les pages chargent
- ✅ Wallet se connecte
- ✅ Pas d'erreurs console

### 2. Initialiser le smart contract

Si pas encore fait:

```bash
# Utiliser Solana CLI ou Anchor pour initialiser
solana program deploy
anchor idl init
```

### 3. Tester un cycle complet

1. Connecter wallet
2. Register player
3. Deposit SOL
4. Set exposure
5. Attendre fin de cycle
6. Resolve cycle
7. Claim redistribution

---

## 🎯 Checklist Finale

Avant de partager l'URL publiquement:

- [ ] Build Vercel réussi
- [ ] Toutes les pages accessibles
- [ ] Wallet connection fonctionne
- [ ] Smart contract initialisé
- [ ] Au moins 1 cycle testé end-to-end
- [ ] Pas d'erreurs dans console browser
- [ ] Responsive testé (mobile/tablet/desktop)
- [ ] Performance acceptable (< 3s load time)

---

## 🚀 Commande Finale

```bash
vercel --prod
```

**C'est tout!** Votre app sera live en ~2 minutes.

---

*Guide créé le 27 mars 2026*

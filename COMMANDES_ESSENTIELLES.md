# ⚡ Commandes Essentielles - Swarm Arena

## 🚀 Déploiement

```bash
# Déployer sur Vercel (production)
vercel --prod

# Déployer en preview
vercel

# Login Vercel
vercel login
```

---

## 💻 Développement Local

```bash
# Installer les dépendances
npm install

# Lancer le serveur de développement
npm run dev

# Ouvrir http://localhost:3000
```

---

## 🔨 Build & Tests

```bash
# Build production
npm run build

# Démarrer le build production localement
npm run start

# Type checking TypeScript
npm run type-check

# Linting
npm run lint
```

---

## 🔍 Vérifications

```bash
# Vérifier les diagnostics TypeScript
npm run type-check

# Tester le build complet
npm run build

# Vérifier les vulnérabilités
npm audit

# Corriger les vulnérabilités (attention aux breaking changes)
npm audit fix
```

---

## 🌐 Variables d'Environnement

### Créer fichier .env local

```bash
# Copier l'exemple
cp .env.example .env

# Éditer avec vos valeurs
# Les valeurs par défaut fonctionnent pour Devnet
```

### Variables requises

```env
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_RPC_URL=https://api.devnet.solana.com
NEXT_PUBLIC_PROGRAM_ID=A9W89qV4i21ZCmFTLYZZE3HgwnqimWEFjGd3rowYcZpr
```

---

## 🔗 Liens Utiles

### Solana Explorer
```
https://explorer.solana.com/address/A9W89qV4i21ZCmFTLYZZE3HgwnqimWEFjGd3rowYcZpr?cluster=devnet
```

### Vercel Dashboard
```
https://vercel.com/dashboard
```

### Solana Devnet Faucet
```
https://faucet.solana.com/
```

---

## 🐛 Dépannage

### Build échoue

```bash
# Nettoyer et réinstaller
rm -rf node_modules .next
npm install
npm run build
```

### Erreurs TypeScript

```bash
# Vérifier les types
npm run type-check

# Vérifier les diagnostics
# (utiliser l'IDE ou getDiagnostics)
```

### Problèmes de dépendances

```bash
# Réinstaller avec legacy-peer-deps
npm install --legacy-peer-deps

# Ou ignorer les scripts
npm install --ignore-scripts
```

---

## 📦 Structure du Projet

```
swarm-arena/
├── app/                    # Pages Next.js
├── components/             # Composants React
├── lib/                    # Utilitaires frontend
├── shared/                 # Code partagé
├── programs/               # Smart contract Rust
├── backend/                # Backend Node.js (optionnel)
├── target/                 # IDL et types générés
└── tests/                  # Tests
```

---

## 🎯 Workflow Recommandé

### Développement

```bash
# 1. Créer une branche
git checkout -b feature/ma-feature

# 2. Développer
npm run dev

# 3. Vérifier
npm run type-check
npm run build

# 4. Commit
git add .
git commit -m "feat: ma feature"

# 5. Push
git push origin feature/ma-feature
```

### Déploiement

```bash
# 1. Merger dans main
git checkout main
git merge feature/ma-feature

# 2. Déployer
vercel --prod

# 3. Vérifier
# Ouvrir l'URL fournie par Vercel
```

---

## 📊 Commandes de Monitoring

### Après déploiement

```bash
# Voir les logs Vercel
vercel logs

# Voir les déploiements
vercel ls

# Voir les détails d'un déploiement
vercel inspect <deployment-url>
```

---

## 🔐 Sécurité

### Avant Mainnet

```bash
# 1. Audit des vulnérabilités
npm audit

# 2. Upgrade Next.js
npm install next@latest

# 3. Tester
npm run build
npm run start

# 4. Déployer
vercel --prod
```

---

*Référence rapide créée le 27 mars 2026*

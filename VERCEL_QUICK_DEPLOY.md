# Vercel Quick Deployment Guide

## ✅ Pre-Deployment Checklist (COMPLETED)

- ✅ Local build passes: `npm run build` (0 errors)
- ✅ All files committed and pushed to GitHub
- ✅ Node.js engine specified in package.json (>=18.0.0)
- ✅ Production environment variables in .env.production
- ✅ Vercel configuration simplified in vercel.json
- ✅ .npmrc configured for legacy peer deps
- ✅ All required files committed (IDL, types, etc.)

## 🚀 Deploy to Vercel

### Option 1: Automatic Deployment (Recommended)
If you connected your GitHub repo to Vercel, it should auto-deploy on push.

1. Go to https://vercel.com/dashboard
2. Check if deployment started automatically
3. Wait for build to complete
4. If it fails, check build logs for errors

### Option 2: Manual Deployment via Dashboard

1. Go to https://vercel.com/new
2. Import your GitHub repository: `MATHIAS1180/SINGULARITY`
3. Configure project:
   - Framework Preset: **Next.js** (auto-detected)
   - Root Directory: `./` (leave default)
   - Build Command: `npm run build` (auto-detected)
   - Output Directory: `.next` (auto-detected)
   - Install Command: `npm install` (auto-detected)

4. Add Environment Variables (CRITICAL):
   ```
   NEXT_PUBLIC_SOLANA_NETWORK=devnet
   NEXT_PUBLIC_RPC_URL=https://api.devnet.solana.com
   NEXT_PUBLIC_PROGRAM_ID=A9W89qV4i21ZCmFTLYZZE3HgwnqimWEFjGd3rowYcZpr
   ```

5. Click **Deploy**

### Option 3: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

## 🔍 If Deployment Fails

1. **Get the error message:**
   - Go to Vercel Dashboard
   - Click on failed deployment
   - Click "View Build Logs"
   - Find the red error message
   - Copy the full error

2. **Check common issues:**
   - Environment variables not set in Vercel dashboard
   - Node.js version mismatch (should be >=18)
   - Missing dependencies
   - File case sensitivity issues

3. **Read full troubleshooting guide:**
   - See `VERCEL_DEPLOYMENT_TROUBLESHOOTING.md`

## 📋 Environment Variables to Set in Vercel

Go to: Project Settings → Environment Variables

Add these for **Production**, **Preview**, and **Development**:

| Name | Value |
|------|-------|
| `NEXT_PUBLIC_SOLANA_NETWORK` | `devnet` |
| `NEXT_PUBLIC_RPC_URL` | `https://api.devnet.solana.com` |
| `NEXT_PUBLIC_PROGRAM_ID` | `A9W89qV4i21ZCmFTLYZZE3HgwnqimWEFjGd3rowYcZpr` |

## ✨ After Successful Deployment

1. Visit your deployment URL (e.g., `https://singularity-xxx.vercel.app`)
2. Connect your Solana wallet (Phantom, Solflare, etc.)
3. Make sure you're on **Devnet**
4. Register as a player
5. Deposit SOL and start playing!

## 🔗 Important Links

- GitHub Repo: https://github.com/MATHIAS1180/SINGULARITY
- Vercel Dashboard: https://vercel.com/dashboard
- Solana Devnet Explorer: https://explorer.solana.com/?cluster=devnet
- Program ID: `A9W89qV4i21ZCmFTLYZZE3HgwnqimWEFjGd3rowYcZpr`

## 🆘 Need Help?

If deployment still fails after trying these steps:
1. Share the specific error message from Vercel build logs
2. Check `VERCEL_DEPLOYMENT_TROUBLESHOOTING.md` for detailed solutions
3. Verify all environment variables are set correctly in Vercel dashboard

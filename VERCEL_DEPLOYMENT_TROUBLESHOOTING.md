# Vercel Deployment Troubleshooting Guide

## Current Status
- ✅ Local build passes successfully (0 errors)
- ✅ All code committed and pushed to GitHub
- ✅ Repository: https://github.com/MATHIAS1180/SINGULARITY
- ⚠️ Vercel deployment failing (investigating)

## Build Verification
```bash
npm run build
# Result: ✓ Compiled successfully
# Only warning: pino-pretty (optional dependency, non-blocking)
```

## Common Vercel Deployment Issues & Solutions

### 1. Environment Variables Not Set
**Problem**: Vercel doesn't have access to environment variables.

**Solution**: Add these in Vercel Dashboard → Project Settings → Environment Variables:
```
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_RPC_URL=https://api.devnet.solana.com
NEXT_PUBLIC_PROGRAM_ID=A9W89qV4i21ZCmFTLYZZE3HgwnqimWEFjGd3rowYcZpr
```

### 2. Node.js Version Mismatch
**Problem**: Vercel uses different Node version than local.

**Solution**: Add to `package.json`:
```json
"engines": {
  "node": ">=18.0.0"
}
```

### 3. Build Command Issues
**Problem**: Vercel can't find build command.

**Solution**: Verify in Vercel Dashboard → Project Settings → Build & Development Settings:
- Framework Preset: `Next.js`
- Build Command: `npm run build`
- Output Directory: `.next` (default)
- Install Command: `npm install`

### 4. Memory Issues
**Problem**: Build runs out of memory on Vercel.

**Solution**: The dashboard page is 241 kB First Load JS, which is large but acceptable. If memory issues occur, consider:
- Code splitting
- Dynamic imports for heavy components
- Upgrade Vercel plan for more memory

### 5. Missing Dependencies
**Problem**: Some dependencies not installed on Vercel.

**Solution**: All dependencies are in `package.json`. Verify `.npmrc` is committed:
```
legacy-peer-deps=true
```

### 6. Webpack/Polyfill Issues
**Problem**: Browser polyfills not working on Vercel.

**Solution**: Already configured in `next.config.js`:
```javascript
config.resolve.fallback = {
  buffer: require.resolve('buffer/'),
  // ... other polyfills
};
```

### 7. File Case Sensitivity
**Problem**: Windows is case-insensitive, Linux (Vercel) is case-sensitive.

**Solution**: Verify all imports match exact file names:
- ✅ `@/lib/hooks` → `lib/hooks/index.ts`
- ✅ `@/components/ui/GlassPanel` → `components/ui/GlassPanel.tsx`

### 8. Git Ignored Files
**Problem**: Required files are in `.gitignore`.

**Solution**: Verify these are NOT ignored:
- ✅ `target/types/swarm_arena.ts` (committed)
- ✅ `target/idl/swarm_arena.json` (committed)
- ✅ `.npmrc` (committed)
- ✅ `vercel.json` (committed)

## Vercel Configuration Files

### vercel.json
```json
{
  "buildCommand": "npm run build",
  "framework": "nextjs",
  "regions": ["iad1"],
  "env": {
    "NEXT_PUBLIC_SOLANA_NETWORK": "devnet",
    "NEXT_PUBLIC_RPC_URL": "https://api.devnet.solana.com",
    "NEXT_PUBLIC_PROGRAM_ID": "A9W89qV4i21ZCmFTLYZZE3HgwnqimWEFjGd3rowYcZpr"
  }
}
```

### .vercelignore
```
backend/
programs/
tests/
*.md
!README.md
```

## How to Get Specific Error

1. Go to Vercel Dashboard: https://vercel.com/dashboard
2. Select your project
3. Click on the failed deployment
4. Click "View Build Logs"
5. Look for red error messages
6. Copy the full error message

## Next Steps

**Please provide the specific error message from Vercel build logs:**
1. Open Vercel Dashboard
2. Click on the failed deployment
3. Scroll to the error (usually in red)
4. Copy the error message

Common error patterns to look for:
- `Module not found: Can't resolve 'X'` → Missing dependency
- `Type error: Cannot find module 'X'` → TypeScript issue
- `Error: Command "npm run build" exited with 1` → Build failure
- `ENOENT: no such file or directory` → Missing file
- `Out of memory` → Need to optimize bundle size

## Quick Fixes to Try

### Fix 1: Add Node Engine
Add to `package.json`:
```json
"engines": {
  "node": ">=18.0.0",
  "npm": ">=9.0.0"
}
```

### Fix 2: Simplify vercel.json
Remove custom build commands, let Vercel auto-detect:
```json
{
  "framework": "nextjs",
  "regions": ["iad1"]
}
```

### Fix 3: Add .env File
Create `.env.production` in root:
```
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_RPC_URL=https://api.devnet.solana.com
NEXT_PUBLIC_PROGRAM_ID=A9W89qV4i21ZCmFTLYZZE3HgwnqimWEFjGd3rowYcZpr
```

## Contact Support

If none of these work, contact Vercel support with:
- Project name
- Deployment URL
- Error message
- This troubleshooting guide

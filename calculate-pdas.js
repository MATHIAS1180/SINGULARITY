const { PublicKey } = require('@solana/web3.js');

const programId = new PublicKey('FbSDMGKyTo1YYGMjtau1JLBUDh18koz1JKN3NL38Zmf3');

console.log('\n=== ADRESSES PDA POUR INITIALIZE CONFIG ===\n');

const [config] = PublicKey.findProgramAddressSync([Buffer.from('config')], programId);
console.log('config:', config.toBase58());

const [gameState] = PublicKey.findProgramAddressSync([Buffer.from('game_state')], programId);
console.log('gameState:', gameState.toBase58());

const [treasury] = PublicKey.findProgramAddressSync([Buffer.from('treasury')], programId);
console.log('treasuryVault:', treasury.toBase58());

const [vault] = PublicKey.findProgramAddressSync([Buffer.from('vault')], programId);
console.log('vault:', vault.toBase58());

console.log('\n=== COPIE CES ADRESSES DANS SOLANA PLAYGROUND ===\n');

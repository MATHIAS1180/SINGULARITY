import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import { AnchorProvider, Program, BN, Wallet } from '@coral-xyz/anchor';
import IDL from '../target/idl/swarm_arena.json';
import type { SwarmArena } from '../target/types/swarm_arena';

const PROGRAM_ID = new PublicKey('FbSDMGKyTo1YYGMjtau1JLBUDh18koz1JKN3NL38Zmf3');
const RPC_URL = 'https://api.devnet.solana.com';

async function initializeProtocol() {
  console.log('🚀 Initializing Swarm Arena Protocol...\n');

  // Connection
  const connection = new Connection(RPC_URL, 'confirmed');
  
  // Wallet (tu devras fournir ta clé privée ou utiliser Phantom)
  console.log('⚠️  IMPORTANT: Connecte ton wallet Phantom ou fournis une keypair');
  console.log('Pour l\'instant, ce script nécessite une keypair locale\n');
  
  // Si tu as une keypair locale (pour test)
  // const wallet = new Wallet(Keypair.fromSecretKey(new Uint8Array([...])));
  
  // Ou utilise ton wallet Phantom via le frontend
  console.log('💡 Utilise plutôt le frontend avec Phantom wallet connecté');
  console.log('Ou exécute ce script avec ta keypair de test\n');
  
  // Provider
  // const provider = new AnchorProvider(connection, wallet, { commitment: 'confirmed' });
  // const program = new Program(IDL as SwarmArena, PROGRAM_ID, provider);
  
  // Paramètres
  const params = {
    protocolFeeBps: 200,              // 2%
    minDeposit: new BN(1_000_000),    // 0.001 SOL
    maxDeposit: new BN(1_000_000_000), // 1 SOL
    minExposure: 0,                    // 0%
    maxExposure: 100,                  // 100%
    cycleDuration: new BN(100),        // 100 slots (~40 sec)
    exposureCooldown: new BN(10),      // 10 slots (~4 sec)
  };
  
  console.log('📋 Paramètres d\'initialisation:');
  console.log('  - Protocol Fee: 2%');
  console.log('  - Min Deposit: 0.001 SOL');
  console.log('  - Max Deposit: 1 SOL');
  console.log('  - Min Exposure: 0%');
  console.log('  - Max Exposure: 100%');
  console.log('  - Cycle Duration: 100 slots (~40 seconds)');
  console.log('  - Exposure Cooldown: 10 slots (~4 seconds)\n');
  
  console.log('✅ Script prêt. Utilise le frontend pour initialiser avec Phantom.');
}

initializeProtocol().catch(console.error);

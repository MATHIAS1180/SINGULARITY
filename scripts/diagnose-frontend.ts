import { Connection, PublicKey } from '@solana/web3.js';
import { AnchorProvider, Program } from '@coral-xyz/anchor';
import IDL from '../target/idl/swarm_arena.json';
import { PROGRAM_ID, getGlobalConfigPDA } from '../lib/solana';

const RPC_URL = 'https://api.devnet.solana.com';

async function diagnoseFrontend() {
  console.log('🔍 Diagnostic Frontend\n');
  
  const connection = new Connection(RPC_URL, 'confirmed');
  
  console.log('1️⃣ Program ID:', PROGRAM_ID.toString());
  
  const [configPDA, bump] = getGlobalConfigPDA();
  console.log('2️⃣ Config PDA:', configPDA.toString());
  console.log('   Bump:', bump);
  
  // Check if account exists
  const accountInfo = await connection.getAccountInfo(configPDA);
  console.log('\n3️⃣ Account Info:');
  if (accountInfo) {
    console.log('   ✅ Account EXISTS');
    console.log('   Owner:', accountInfo.owner.toString());
    console.log('   Data length:', accountInfo.data.length);
    console.log('   Lamports:', accountInfo.lamports);
  } else {
    console.log('   ❌ Account NOT FOUND');
    return;
  }
  
  // Try to fetch with Anchor
  console.log('\n4️⃣ Trying to fetch with Anchor...');
  try {
    const dummyWallet = {
      publicKey: PublicKey.default,
      signTransaction: async () => { throw new Error('Read-only'); },
      signAllTransactions: async () => { throw new Error('Read-only'); },
    } as any;
    
    const provider = new AnchorProvider(connection, dummyWallet, { commitment: 'confirmed' });
    const program = new Program(IDL as any, PROGRAM_ID, provider);
    
    const config = await program.account.globalConfig.fetch(configPDA);
    console.log('   ✅ Anchor fetch SUCCESS');
    console.log('   Authority:', config.authority.toString());
    console.log('   Protocol Fee:', config.protocolFeeBps, 'bps');
  } catch (error: any) {
    console.log('   ❌ Anchor fetch FAILED');
    console.log('   Error:', error.message);
  }
  
  console.log('\n5️⃣ Conclusion:');
  if (accountInfo && accountInfo.owner.toString() === PROGRAM_ID.toString()) {
    console.log('   ✅ Le protocole est initialisé correctement');
    console.log('   ⚠️  Le problème est dans le frontend (useProtocolInitialized hook)');
  } else if (accountInfo) {
    console.log('   ❌ Le compte existe mais n\'appartient pas au bon programme');
    console.log('   Expected owner:', PROGRAM_ID.toString());
    console.log('   Actual owner:', accountInfo.owner.toString());
  } else {
    console.log('   ❌ Le protocole n\'est PAS initialisé');
  }
}

diagnoseFrontend().catch(console.error);

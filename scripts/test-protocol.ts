import { Connection, PublicKey } from '@solana/web3.js';

const PROGRAM_ID = new PublicKey('FbSDMGKyTo1YYGMjtau1JLBUDh18koz1JKN3NL38Zmf3');
const RPC_URL = 'https://api.devnet.solana.com';

async function testProtocol() {
  console.log('\n🔍 Testing Protocol Initialization...\n');
  console.log('Program ID:', PROGRAM_ID.toString());
  console.log('RPC URL:', RPC_URL);
  console.log('');

  const connection = new Connection(RPC_URL, 'confirmed');

  // Derive Config PDA
  const [configPDA] = PublicKey.findProgramAddressSync(
    [Buffer.from('config')],
    PROGRAM_ID
  );
  console.log('Config PDA:', configPDA.toString());

  // Check if config account exists
  const configAccount = await connection.getAccountInfo(configPDA);
  
  if (!configAccount) {
    console.log('❌ Config account does not exist');
    console.log('   Protocol is NOT initialized');
    return;
  }

  console.log('✅ Config account exists');
  console.log('   Owner:', configAccount.owner.toString());
  console.log('   Data length:', configAccount.data.length, 'bytes');
  console.log('   Lamports:', configAccount.lamports);

  // Derive GameState PDA
  const [gameStatePDA] = PublicKey.findProgramAddressSync(
    [Buffer.from('game_state')],
    PROGRAM_ID
  );
  console.log('\nGameState PDA:', gameStatePDA.toString());

  const gameStateAccount = await connection.getAccountInfo(gameStatePDA);
  
  if (!gameStateAccount) {
    console.log('❌ GameState account does not exist');
    return;
  }

  console.log('✅ GameState account exists');
  console.log('   Owner:', gameStateAccount.owner.toString());
  console.log('   Data length:', gameStateAccount.data.length, 'bytes');

  console.log('\n✅ Protocol is initialized and ready!');
}

testProtocol().catch(console.error);

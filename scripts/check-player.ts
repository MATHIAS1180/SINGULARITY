import { Connection, PublicKey } from '@solana/web3.js';

const PROGRAM_ID = new PublicKey('FbSDMGKyTo1YYGMjtau1JLBUDh18koz1JKN3NL38Zmf3');
const RPC_URL = 'https://api.devnet.solana.com';

// Remplace par ton adresse wallet
const PLAYER_ADDRESS = process.argv[2];

async function checkPlayer() {
  if (!PLAYER_ADDRESS) {
    console.log('Usage: npx tsx scripts/check-player.ts <WALLET_ADDRESS>');
    return;
  }

  console.log('\n🔍 Checking Player Registration...\n');
  console.log('Program ID:', PROGRAM_ID.toString());
  console.log('Player Address:', PLAYER_ADDRESS);
  console.log('');

  const connection = new Connection(RPC_URL, 'confirmed');
  const playerPubkey = new PublicKey(PLAYER_ADDRESS);

  // Derive PlayerState PDA
  const [playerStatePDA] = PublicKey.findProgramAddressSync(
    [Buffer.from('player'), playerPubkey.toBuffer()],
    PROGRAM_ID
  );
  
  console.log('PlayerState PDA:', playerStatePDA.toString());
  console.log('');

  // Check if player account exists
  const playerAccount = await connection.getAccountInfo(playerStatePDA);
  
  if (!playerAccount) {
    console.log('❌ Player NOT registered');
    console.log('   PlayerState account does not exist');
    console.log('');
    console.log('🔗 Check on Explorer:');
    console.log(`   https://explorer.solana.com/address/${playerStatePDA.toString()}?cluster=devnet`);
    return;
  }

  console.log('✅ Player IS registered!');
  console.log('   Owner:', playerAccount.owner.toString());
  console.log('   Data length:', playerAccount.data.length, 'bytes');
  console.log('   Lamports:', playerAccount.lamports);
  console.log('');
  
  // Try to decode the data
  console.log('📊 Account Data (first 100 bytes):');
  console.log('   ', playerAccount.data.slice(0, 100).toString('hex'));
  console.log('');
  
  console.log('🔗 View on Explorer:');
  console.log(`   https://explorer.solana.com/address/${playerStatePDA.toString()}?cluster=devnet`);
}

checkPlayer().catch(console.error);

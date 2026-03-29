import { Connection, PublicKey } from '@solana/web3.js';
import { AnchorProvider, Program } from '@coral-xyz/anchor';
import IDL from '../target/idl/swarm_arena.json';
import { PROGRAM_ID, getGlobalConfigPDA, getGameStatePDA, getVaultPDA, getTreasuryVaultPDA } from '../lib/solana';

const RPC_URL = 'https://api.devnet.solana.com';

async function checkProtocolStatus() {
  const connection = new Connection(RPC_URL, 'confirmed');
  
  console.log('🔍 Checking protocol status...\n');
  console.log('Program ID:', PROGRAM_ID.toString());
  
  const [configPDA] = getGlobalConfigPDA();
  const [gameStatePDA] = getGameStatePDA();
  const [vaultPDA] = getVaultPDA();
  const [treasuryPDA] = getTreasuryVaultPDA();
  
  console.log('\n📍 PDAs:');
  console.log('Config:', configPDA.toString());
  console.log('GameState:', gameStatePDA.toString());
  console.log('Vault:', vaultPDA.toString());
  console.log('Treasury:', treasuryPDA.toString());
  
  console.log('\n📊 Account Status:');
  
  // Check config
  try {
    const configInfo = await connection.getAccountInfo(configPDA);
    if (configInfo) {
      console.log('✅ Config: EXISTS (owner:', configInfo.owner.toString(), ')');
    } else {
      console.log('❌ Config: NOT FOUND');
    }
  } catch (e) {
    console.log('❌ Config: ERROR', e);
  }
  
  // Check gameState
  try {
    const gameStateInfo = await connection.getAccountInfo(gameStatePDA);
    if (gameStateInfo) {
      console.log('✅ GameState: EXISTS (owner:', gameStateInfo.owner.toString(), ')');
    } else {
      console.log('❌ GameState: NOT FOUND');
    }
  } catch (e) {
    console.log('❌ GameState: ERROR', e);
  }
  
  // Check vault
  try {
    const vaultInfo = await connection.getAccountInfo(vaultPDA);
    if (vaultInfo) {
      console.log('✅ Vault: EXISTS (owner:', vaultInfo.owner.toString(), ')');
      console.log('   Balance:', vaultInfo.lamports / 1e9, 'SOL');
    } else {
      console.log('❌ Vault: NOT FOUND');
    }
  } catch (e) {
    console.log('❌ Vault: ERROR', e);
  }
  
  // Check treasury
  try {
    const treasuryInfo = await connection.getAccountInfo(treasuryPDA);
    if (treasuryInfo) {
      console.log('✅ Treasury: EXISTS (owner:', treasuryInfo.owner.toString(), ')');
      console.log('   Balance:', treasuryInfo.lamports / 1e9, 'SOL');
    } else {
      console.log('❌ Treasury: NOT FOUND');
    }
  } catch (e) {
    console.log('❌ Treasury: ERROR', e);
  }
  
  console.log('\n💡 Next steps:');
  console.log('If accounts exist but initialization failed, you may need to:');
  console.log('1. Close the existing accounts (requires authority)');
  console.log('2. Use a different authority/wallet');
  console.log('3. Redeploy the program with a new Program ID');
}

checkProtocolStatus().catch(console.error);

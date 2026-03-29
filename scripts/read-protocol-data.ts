import { Connection, PublicKey } from '@solana/web3.js';
import { AnchorProvider, Program, Wallet } from '@coral-xyz/anchor';
import IDL from '../target/idl/swarm_arena.json';
import { PROGRAM_ID, getGlobalConfigPDA, getGameStatePDA } from '../lib/solana';

const RPC_URL = 'https://api.devnet.solana.com';

async function readProtocolData() {
  const connection = new Connection(RPC_URL, 'confirmed');
  
  // Create a dummy wallet for read-only operations
  const dummyWallet = {
    publicKey: PublicKey.default,
    signTransaction: async () => { throw new Error('Read-only'); },
    signAllTransactions: async () => { throw new Error('Read-only'); },
  } as any;
  
  const provider = new AnchorProvider(connection, dummyWallet, { commitment: 'confirmed' });
  const program = new Program(IDL as any, PROGRAM_ID, provider);
  
  console.log('📖 Reading protocol data...\n');
  
  const [configPDA] = getGlobalConfigPDA();
  const [gameStatePDA] = getGameStatePDA();
  
  try {
    const config = await program.account.globalConfig.fetch(configPDA);
    console.log('✅ GlobalConfig:');
    console.log('   Authority:', config.authority.toString());
    console.log('   Protocol Fee:', config.protocolFeeBps, 'bps (', config.protocolFeeBps / 100, '%)');
    console.log('   Min Deposit:', config.minDeposit.toString(), 'lamports (', config.minDeposit.toNumber() / 1e9, 'SOL)');
    console.log('   Max Deposit:', config.maxDeposit.toString(), 'lamports (', config.maxDeposit.toNumber() / 1e9, 'SOL)');
    console.log('   Min Exposure:', config.minExposure, '%');
    console.log('   Max Exposure:', config.maxExposure, '%');
    console.log('   Cycle Duration:', config.cycleDuration.toString(), 'slots');
    console.log('   Exposure Cooldown:', config.exposureCooldown.toString(), 'slots');
    console.log('   Treasury Vault:', config.treasuryVault.toString());
    console.log('   Total Fees Collected:', config.totalFeesCollected.toString(), 'lamports');
    console.log('   Total Cycles:', config.totalCycles.toString());
    console.log('   Paused:', config.paused);
    console.log('   Bump:', config.bump);
  } catch (e: any) {
    console.log('❌ Failed to read GlobalConfig:', e.message);
  }
  
  console.log('\n');
  
  try {
    const gameState = await program.account.gameState.fetch(gameStatePDA);
    console.log('✅ GameState:');
    console.log('   Current Cycle:', gameState.currentCycle.toString());
    console.log('   Cycle Start Slot:', gameState.cycleStartSlot.toString());
    console.log('   Cycle End Slot:', gameState.cycleEndSlot.toString());
    console.log('   Total Value Locked:', gameState.totalValueLocked.toString(), 'lamports (', gameState.totalValueLocked.toNumber() / 1e9, 'SOL)');
    console.log('   Total Exposed Value:', gameState.totalExposedValue.toString(), 'lamports');
    console.log('   Active Players:', gameState.activePlayers);
    console.log('   Cycle Resolved:', gameState.cycleResolved);
    console.log('   Last Update Slot:', gameState.lastUpdateSlot.toString());
    console.log('   Bump:', gameState.bump);
  } catch (e: any) {
    console.log('❌ Failed to read GameState:', e.message);
  }
  
  console.log('\n✅ Protocol is already initialized and ready to use!');
  console.log('You can now:');
  console.log('1. Register players');
  console.log('2. Make deposits');
  console.log('3. Set exposure');
  console.log('4. Resolve cycles');
}

readProtocolData().catch(console.error);

'use client';
import { AnchorProvider, BN, Program } from '@coral-xyz/anchor';
import { useAnchorWallet, useConnection } from '@solana/wallet-adapter-react';
import { PublicKey, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { useMemo } from 'react';
import IDL from '@/target/idl/swarm_arena.json';
import type { SwarmArena } from '@/target/types/swarm_arena';
import { PROGRAM_ID, getGlobalConfigPDA, getGameStatePDA, getCycleStatePDA, getPlayerStatePDA, getVaultPDA, getTreasuryVaultPDA } from './solana';

export { BN, LAMPORTS_PER_SOL };

export function useAnchorProgram() {
  const { connection } = useConnection();
  const wallet = useAnchorWallet();
  
  const program = useMemo(() => {
    if (!wallet) return null;
    
    try {
      const provider = new AnchorProvider(connection, wallet, { 
        commitment: 'confirmed',
        preflightCommitment: 'confirmed',
      });
      
      // Cast IDL to any to avoid type issues
      const program = new Program(IDL as any, PROGRAM_ID, provider);
      
      console.log('✅ Anchor program initialized:', {
        programId: PROGRAM_ID.toString(),
        hasAccount: !!program.account,
        accountKeys: program.account ? Object.keys(program.account) : [],
        programKeys: Object.keys(program),
        idlAccounts: IDL.accounts ? IDL.accounts.map((a: any) => a.name) : []
      });
      
      return program as Program<SwarmArena>;
    } catch (error) {
      console.error('❌ Failed to initialize Anchor program:', error);
      return null;
    }
  }, [connection, wallet]);
  
  return program;
}

export async function initializeConfig(
  program: Program<SwarmArena>,
  protocolFeeBps: number,
  minDeposit: BN,
  maxDeposit: BN,
  minExposure: number,
  maxExposure: number,
  cycleDuration: BN,
  exposureCooldown: BN
) {
  const [configPDA] = getGlobalConfigPDA();
  const [gameStatePDA] = getGameStatePDA();
  const [treasuryVaultPDA] = getTreasuryVaultPDA();
  
  return program.methods.initializeConfig(
    protocolFeeBps,
    minDeposit,
    maxDeposit,
    minExposure,
    maxExposure,
    cycleDuration,
    exposureCooldown
  ).accounts({
    config: configPDA,
    gameState: gameStatePDA,
    treasuryVault: treasuryVaultPDA,
    authority: program.provider.publicKey,
    systemProgram: SystemProgram.programId,
  }).rpc();
}

export async function registerPlayer(program: Program<SwarmArena>) {
  const [configPDA] = getGlobalConfigPDA();
  const [playerStatePDA] = getPlayerStatePDA(program.provider.publicKey!);
  return program.methods.registerPlayer().accounts({ config: configPDA, playerState: playerStatePDA, player: program.provider.publicKey, systemProgram: SystemProgram.programId }).rpc();
}

export async function deposit(program: Program<SwarmArena>, amount: BN) {
  const [configPDA] = getGlobalConfigPDA();
  const [gameStatePDA] = getGameStatePDA();
  const [playerStatePDA] = getPlayerStatePDA(program.provider.publicKey!);
  const [vaultPDA] = getVaultPDA();
  
  // Fetch config to validate deposit amount
  const config = await fetchGlobalConfig(program);
  if (amount.lt(config.minDeposit)) {
    throw new Error(`Minimum deposit is ${config.minDeposit.toNumber() / 1e9} SOL`);
  }
  if (amount.gt(config.maxDeposit)) {
    throw new Error(`Maximum deposit is ${config.maxDeposit.toNumber() / 1e9} SOL`);
  }
  
  return program.methods.deposit(amount).accounts({ config: configPDA, gameState: gameStatePDA, playerState: playerStatePDA, vault: vaultPDA, player: program.provider.publicKey, systemProgram: SystemProgram.programId }).rpc();
}

export async function withdraw(program: Program<SwarmArena>, amount: BN) {
  const [configPDA] = getGlobalConfigPDA();
  const [gameStatePDA] = getGameStatePDA();
  const [playerStatePDA] = getPlayerStatePDA(program.provider.publicKey!);
  const [vaultPDA] = getVaultPDA();
  return program.methods.withdraw(amount).accounts({ config: configPDA, gameState: gameStatePDA, playerState: playerStatePDA, vault: vaultPDA, player: program.provider.publicKey, systemProgram: SystemProgram.programId }).rpc();
}

export async function setExposure(program: Program<SwarmArena>, newExposure: number) {
  const [configPDA] = getGlobalConfigPDA();
  const [gameStatePDA] = getGameStatePDA();
  const [playerStatePDA] = getPlayerStatePDA(program.provider.publicKey!);
  return program.methods.setExposure(newExposure).accounts({ config: configPDA, gameState: gameStatePDA, playerState: playerStatePDA, player: program.provider.publicKey }).rpc();
}

export async function resolveCycle(program: Program<SwarmArena>) {
  const gameState = await fetchGameState(program);
  const currentCycle = gameState.currentCycle.toNumber();
  const [configPDA] = getGlobalConfigPDA();
  const [gameStatePDA] = getGameStatePDA();
  const [cycleStatePDA] = getCycleStatePDA(currentCycle);
  const [treasuryVaultPDA] = getTreasuryVaultPDA();
  const [vaultPDA] = getVaultPDA();
  return program.methods.resolveCycle().accounts({ 
    config: configPDA, 
    gameState: gameStatePDA, 
    cycleState: cycleStatePDA, 
    treasuryVault: treasuryVaultPDA, 
    vault: vaultPDA, 
    resolver: program.provider.publicKey 
  }).rpc();
}

export async function claimRedistribution(program: Program<SwarmArena>, cycleNumber: number) {
  const [configPDA] = getGlobalConfigPDA();
  const [gameStatePDA] = getGameStatePDA();
  const [cycleStatePDA] = getCycleStatePDA(cycleNumber);
  const [playerStatePDA] = getPlayerStatePDA(program.provider.publicKey!);
  const [vaultPDA] = getVaultPDA();
  return program.methods.claimRedistribution(new BN(cycleNumber)).accounts({ 
    config: configPDA, 
    gameState: gameStatePDA, 
    cycleState: cycleStatePDA, 
    playerState: playerStatePDA, 
    vault: vaultPDA, 
    player: program.provider.publicKey 
  }).rpc();
}

export async function fetchGlobalConfig(program: Program<SwarmArena>) {
  const [configPDA] = getGlobalConfigPDA();
  
  // Use getAccountInfo instead of program.account.fetch
  const accountInfo = await program.provider.connection.getAccountInfo(configPDA);
  
  if (!accountInfo) {
    throw new Error('Config not initialized');
  }
  
  // Manually decode the account data
  // Skip the 8-byte discriminator
  const data = accountInfo.data.slice(8);
  
  // Decode GlobalConfig struct
  let offset = 0;
  
  const authority = new PublicKey(data.slice(offset, offset + 32));
  offset += 32;
  
  const protocolFeeBps = data.readUInt16LE(offset);
  offset += 2;
  
  const minDeposit = new BN(data.slice(offset, offset + 8), 'le');
  offset += 8;
  
  const maxDeposit = new BN(data.slice(offset, offset + 8), 'le');
  offset += 8;
  
  const minExposure = data[offset];
  offset += 1;
  
  const maxExposure = data[offset];
  offset += 1;
  
  const cycleDuration = new BN(data.slice(offset, offset + 8), 'le');
  offset += 8;
  
  const exposureCooldown = new BN(data.slice(offset, offset + 8), 'le');
  offset += 8;
  
  const treasuryVault = new PublicKey(data.slice(offset, offset + 32));
  offset += 32;
  
  const totalFeesCollected = new BN(data.slice(offset, offset + 8), 'le');
  offset += 8;
  
  const totalCycles = new BN(data.slice(offset, offset + 8), 'le');
  offset += 8;
  
  const paused = data[offset] === 1;
  offset += 1;
  
  const bump = data[offset];
  
  return {
    authority,
    protocolFeeBps,
    minDeposit,
    maxDeposit,
    minExposure,
    maxExposure,
    cycleDuration,
    exposureCooldown,
    treasuryVault,
    totalFeesCollected,
    totalCycles,
    paused,
    bump,
  };
}

export async function fetchGameState(program: Program<SwarmArena>) {
  const [gameStatePDA] = getGameStatePDA();
  
  // Use getAccountInfo instead of program.account.fetch
  const accountInfo = await program.provider.connection.getAccountInfo(gameStatePDA);
  
  if (!accountInfo) {
    throw new Error('Game state not initialized');
  }
  
  // Manually decode the account data
  // Skip the 8-byte discriminator
  const data = accountInfo.data.slice(8);
  
  // Decode GameState struct
  let offset = 0;
  
  const currentCycle = new BN(data.slice(offset, offset + 8), 'le');
  offset += 8;
  
  const cycleStartSlot = new BN(data.slice(offset, offset + 8), 'le');
  offset += 8;
  
  const cycleEndSlot = new BN(data.slice(offset, offset + 8), 'le');
  offset += 8;
  
  const totalValueLocked = new BN(data.slice(offset, offset + 8), 'le');
  offset += 8;
  
  const totalExposedValue = new BN(data.slice(offset, offset + 8), 'le');
  offset += 8;
  
  const activePlayers = data.readUInt32LE(offset);
  offset += 4;
  
  const cycleResolved = data[offset] === 1;
  offset += 1;
  
  const lastUpdateSlot = new BN(data.slice(offset, offset + 8), 'le');
  offset += 8;
  
  const bump = data[offset];
  
  return {
    currentCycle,
    cycleStartSlot,
    cycleEndSlot,
    totalValueLocked,
    totalExposedValue,
    activePlayers,
    cycleResolved,
    lastUpdateSlot,
    bump,
  };
}

export async function fetchPlayerState(program: Program<SwarmArena>, playerPubkey: PublicKey) {
  const [playerStatePDA] = getPlayerStatePDA(playerPubkey);
  
  // Use getAccountInfo instead of program.account.fetch
  const accountInfo = await program.provider.connection.getAccountInfo(playerStatePDA);
  
  if (!accountInfo) {
    throw new Error('Player not registered');
  }
  
  // Manually decode the account data
  // Skip the 8-byte discriminator
  const data = accountInfo.data.slice(8);
  
  // Decode PlayerState struct
  // struct PlayerState {
  //   player: Pubkey (32 bytes)
  //   total_deposited: u64 (8 bytes)
  //   total_withdrawn: u64 (8 bytes)
  //   balance: u64 (8 bytes)
  //   exposure: u8 (1 byte)
  //   exposed_value: u64 (8 bytes)
  //   last_exposure_change_slot: u64 (8 bytes)
  //   last_action_slot: u64 (8 bytes)
  //   cycles_participated: u64 (8 bytes)
  //   total_redistributed: i64 (8 bytes)
  //   participating_in_cycle: bool (1 byte)
  //   registered_slot: u64 (8 bytes)
  //   score: i64 (8 bytes)
  //   bump: u8 (1 byte)
  // }
  
  let offset = 0;
  
  const player = new PublicKey(data.slice(offset, offset + 32));
  offset += 32;
  
  const totalDeposited = new BN(data.slice(offset, offset + 8), 'le');
  offset += 8;
  
  const totalWithdrawn = new BN(data.slice(offset, offset + 8), 'le');
  offset += 8;
  
  const balance = new BN(data.slice(offset, offset + 8), 'le');
  offset += 8;
  
  const exposure = data[offset];
  offset += 1;
  
  const exposedValue = new BN(data.slice(offset, offset + 8), 'le');
  offset += 8;
  
  const lastExposureChangeSlot = new BN(data.slice(offset, offset + 8), 'le');
  offset += 8;
  
  const lastActionSlot = new BN(data.slice(offset, offset + 8), 'le');
  offset += 8;
  
  const cyclesParticipated = new BN(data.slice(offset, offset + 8), 'le');
  offset += 8;
  
  const totalRedistributed = new BN(data.slice(offset, offset + 8), 'le');
  offset += 8;
  
  const participatingInCycle = data[offset] === 1;
  offset += 1;
  
  const registeredSlot = new BN(data.slice(offset, offset + 8), 'le');
  offset += 8;
  
  const score = new BN(data.slice(offset, offset + 8), 'le');
  offset += 8;
  
  const bump = data[offset];
  
  return {
    player,
    totalDeposited,
    totalWithdrawn,
    balance,
    exposure,
    exposedValue,
    lastExposureChangeSlot,
    lastActionSlot,
    cyclesParticipated,
    totalRedistributed,
    participatingInCycle,
    registeredSlot,
    score,
    bump,
  };
}

export async function fetchCycleState(program: Program<SwarmArena>, cycleNumber: number) {
  const [cycleStatePDA] = getCycleStatePDA(cycleNumber);
  return program.account.cycleState.fetch(cycleStatePDA);
}

export async function isPlayerRegistered(program: Program<SwarmArena>, playerPubkey: PublicKey): Promise<boolean> {
  try {
    const [playerStatePDA] = getPlayerStatePDA(playerPubkey);
    const accountInfo = await program.provider.connection.getAccountInfo(playerStatePDA);
    return accountInfo !== null && accountInfo.owner.equals(PROGRAM_ID);
  } catch (error) {
    console.error('Error checking player registration:', error);
    return false;
  }
}

export function solToBN(sol: number): BN {
  return new BN(Math.floor(sol * LAMPORTS_PER_SOL));
}

export function bnToSol(lamports: BN): number {
  return lamports.toNumber() / LAMPORTS_PER_SOL;
}
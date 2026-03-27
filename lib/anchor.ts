'use client';
import { AnchorProvider, BN, Program } from '@coral-xyz/anchor';
import { useAnchorWallet, useConnection } from '@solana/wallet-adapter-react';
import { PublicKey, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { useMemo } from 'react';
import IDL from '@/target/idl/swarm_arena.json';
import type { SwarmArena } from '@/target/types/swarm_arena';
import { PROGRAM_ID, getGlobalConfigPDA, getGameStatePDA, getCycleStatePDA, getPlayerStatePDA, getTreasuryVaultPDA } from './solana';

export { BN, LAMPORTS_PER_SOL };

export function useAnchorProgram() {
  const { connection } = useConnection();
  const wallet = useAnchorWallet();
  const program = useMemo(() => {
    if (!wallet) return null;
    const provider = new AnchorProvider(connection, wallet, { commitment: 'confirmed' });
    return new Program(IDL as SwarmArena, PROGRAM_ID, provider);
  }, [connection, wallet]);
  return program;
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
  const [vaultPDA] = getTreasuryVaultPDA();
  return program.methods.deposit(amount).accounts({ config: configPDA, gameState: gameStatePDA, playerState: playerStatePDA, vault: vaultPDA, player: program.provider.publicKey, systemProgram: SystemProgram.programId }).rpc();
}

export async function withdraw(program: Program<SwarmArena>, amount: BN) {
  const [configPDA] = getGlobalConfigPDA();
  const [gameStatePDA] = getGameStatePDA();
  const [playerStatePDA] = getPlayerStatePDA(program.provider.publicKey!);
  const [vaultPDA] = getTreasuryVaultPDA();
  return program.methods.withdraw(amount).accounts({ config: configPDA, gameState: gameStatePDA, playerState: playerStatePDA, vault: vaultPDA, player: program.provider.publicKey, systemProgram: SystemProgram.programId }).rpc();
}

export async function setExposure(program: Program<SwarmArena>, newExposure: number) {
  const [configPDA] = getGlobalConfigPDA();
  const [gameStatePDA] = getGameStatePDA();
  const [playerStatePDA] = getPlayerStatePDA(program.provider.publicKey!);
  return program.methods.setExposure(newExposure).accounts({ config: configPDA, gameState: gameStatePDA, playerState: playerStatePDA, player: program.provider.publicKey }).rpc();
}

export async function fetchGlobalConfig(program: Program<SwarmArena>) {
  const [configPDA] = getGlobalConfigPDA();
  return program.account.GlobalConfig.fetch(configPDA);
}

export async function fetchGameState(program: Program<SwarmArena>) {
  const [gameStatePDA] = getGameStatePDA();
  return program.account.GameState.fetch(gameStatePDA);
}

export async function fetchPlayerState(program: Program<SwarmArena>, playerPubkey: PublicKey) {
  const [playerStatePDA] = getPlayerStatePDA(playerPubkey);
  return program.account.PlayerState.fetch(playerStatePDA);
}

export async function isPlayerRegistered(program: Program<SwarmArena>, playerPubkey: PublicKey): Promise<boolean> {
  try {
    await fetchPlayerState(program, playerPubkey);
    return true;
  } catch {
    return false;
  }
}

export function solToBN(sol: number): BN {
  return new BN(Math.floor(sol * LAMPORTS_PER_SOL));
}

export function bnToSol(lamports: BN): number {
  return lamports.toNumber() / LAMPORTS_PER_SOL;
}

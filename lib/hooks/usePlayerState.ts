'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useWallet } from '@solana/wallet-adapter-react';
import { useAnchorProgram } from '../anchor';
import { 
  fetchPlayerState, 
  isPlayerRegistered,
  registerPlayer,
  deposit,
  withdraw,
  setExposure,
  solToBN,
  bnToSol
} from '../anchor';
import { PublicKey } from '@solana/web3.js';

/**
 * Hook to fetch player state from blockchain
 */
export function usePlayerState() {
  const program = useAnchorProgram();
  const { publicKey } = useWallet();

  return useQuery({
    queryKey: ['playerState', publicKey?.toString()],
    queryFn: async () => {
      if (!program || !publicKey) throw new Error('Wallet not connected');
      
      // Check if player is registered first
      const registered = await isPlayerRegistered(program, publicKey);
      if (!registered) return null;
      
      return fetchPlayerState(program, publicKey);
    },
    enabled: !!program && !!publicKey,
    refetchInterval: 5000, // Refetch every 5 seconds
  });
}

/**
 * Hook to register a new player
 */
export function useRegisterPlayer() {
  const program = useAnchorProgram();
  const queryClient = useQueryClient();
  const { publicKey } = useWallet();

  return useMutation({
    mutationFn: async () => {
      if (!program) throw new Error('Program not initialized');
      return registerPlayer(program);
    },
    onSuccess: () => {
      // Invalidate player state to refetch
      queryClient.invalidateQueries({ queryKey: ['playerState', publicKey?.toString()] });
    },
  });
}

/**
 * Hook to deposit SOL
 */
export function useDeposit() {
  const program = useAnchorProgram();
  const queryClient = useQueryClient();
  const { publicKey } = useWallet();

  return useMutation({
    mutationFn: async (amountSol: number) => {
      if (!program) throw new Error('Program not initialized');
      const amountBN = solToBN(amountSol);
      return deposit(program, amountBN);
    },
    onSuccess: () => {
      // Invalidate queries to refetch
      queryClient.invalidateQueries({ queryKey: ['playerState', publicKey?.toString()] });
      queryClient.invalidateQueries({ queryKey: ['gameState'] });
    },
  });
}

/**
 * Hook to withdraw SOL
 */
export function useWithdraw() {
  const program = useAnchorProgram();
  const queryClient = useQueryClient();
  const { publicKey } = useWallet();

  return useMutation({
    mutationFn: async (amountSol: number) => {
      if (!program) throw new Error('Program not initialized');
      const amountBN = solToBN(amountSol);
      return withdraw(program, amountBN);
    },
    onSuccess: () => {
      // Invalidate queries to refetch
      queryClient.invalidateQueries({ queryKey: ['playerState', publicKey?.toString()] });
      queryClient.invalidateQueries({ queryKey: ['gameState'] });
    },
  });
}

/**
 * Hook to set exposure
 */
export function useSetExposure() {
  const program = useAnchorProgram();
  const queryClient = useQueryClient();
  const { publicKey } = useWallet();

  return useMutation({
    mutationFn: async (newExposure: number) => {
      if (!program) throw new Error('Program not initialized');
      return setExposure(program, newExposure);
    },
    onSuccess: () => {
      // Invalidate queries to refetch
      queryClient.invalidateQueries({ queryKey: ['playerState', publicKey?.toString()] });
      queryClient.invalidateQueries({ queryKey: ['gameState'] });
    },
  });
}

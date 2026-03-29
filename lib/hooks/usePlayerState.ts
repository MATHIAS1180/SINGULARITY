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
    refetchInterval: 2000, // Refetch every 2 seconds
    staleTime: 1000, // Consider data stale after 1 second
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
      
      const signature = await registerPlayer(program);
      
      // Wait for transaction confirmation
      await program.provider.connection.confirmTransaction(signature, 'confirmed');
      
      return signature;
    },
    onSuccess: async () => {
      // Wait a bit for the blockchain to update
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Force refetch player state
      await queryClient.invalidateQueries({ queryKey: ['playerState', publicKey?.toString()] });
      await queryClient.refetchQueries({ queryKey: ['playerState', publicKey?.toString()] });
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
      const signature = await deposit(program, amountBN);
      
      // Wait for transaction confirmation
      await program.provider.connection.confirmTransaction(signature, 'confirmed');
      
      return signature;
    },
    onSuccess: async () => {
      // Wait a bit for the blockchain to update
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Force refetch
      await queryClient.invalidateQueries({ queryKey: ['playerState', publicKey?.toString()] });
      await queryClient.invalidateQueries({ queryKey: ['gameState'] });
      await queryClient.refetchQueries({ queryKey: ['playerState', publicKey?.toString()] });
      await queryClient.refetchQueries({ queryKey: ['gameState'] });
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
      const signature = await withdraw(program, amountBN);
      
      // Wait for transaction confirmation
      await program.provider.connection.confirmTransaction(signature, 'confirmed');
      
      return signature;
    },
    onSuccess: async () => {
      // Wait a bit for the blockchain to update
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Force refetch
      await queryClient.invalidateQueries({ queryKey: ['playerState', publicKey?.toString()] });
      await queryClient.invalidateQueries({ queryKey: ['gameState'] });
      await queryClient.refetchQueries({ queryKey: ['playerState', publicKey?.toString()] });
      await queryClient.refetchQueries({ queryKey: ['gameState'] });
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
      const signature = await setExposure(program, newExposure);
      
      // Wait for transaction confirmation
      await program.provider.connection.confirmTransaction(signature, 'confirmed');
      
      return signature;
    },
    onSuccess: async () => {
      // Wait a bit for the blockchain to update
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Force refetch
      await queryClient.invalidateQueries({ queryKey: ['playerState', publicKey?.toString()] });
      await queryClient.invalidateQueries({ queryKey: ['gameState'] });
      await queryClient.refetchQueries({ queryKey: ['playerState', publicKey?.toString()] });
      await queryClient.refetchQueries({ queryKey: ['gameState'] });
    },
  });
}

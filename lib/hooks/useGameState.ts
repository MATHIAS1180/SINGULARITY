'use client';

import { useQuery } from '@tanstack/react-query';
import { useAnchorProgram } from '../anchor';
import { fetchGameState, fetchGlobalConfig } from '../anchor';

/**
 * Hook to fetch current game state from blockchain
 */
export function useGameState() {
  const program = useAnchorProgram();

  return useQuery({
    queryKey: ['gameState'],
    queryFn: async () => {
      if (!program) throw new Error('Program not initialized');
      return fetchGameState(program);
    },
    enabled: !!program,
    refetchInterval: 5000, // Refetch every 5 seconds
  });
}

/**
 * Hook to fetch global config from blockchain
 */
export function useGlobalConfig() {
  const program = useAnchorProgram();

  return useQuery({
    queryKey: ['globalConfig'],
    queryFn: async () => {
      if (!program) throw new Error('Program not initialized');
      return fetchGlobalConfig(program);
    },
    enabled: !!program,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}

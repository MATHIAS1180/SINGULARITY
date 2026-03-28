'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAnchorProgram, resolveCycle, claimRedistribution } from '../anchor';

/**
 * Hook to resolve the current cycle
 */
export function useResolveCycle() {
  const program = useAnchorProgram();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!program) throw new Error('Program not initialized');
      return resolveCycle(program);
    },
    onSuccess: () => {
      // Invalidate all relevant queries
      queryClient.invalidateQueries({ queryKey: ['gameState'] });
      queryClient.invalidateQueries({ queryKey: ['playerState'] });
      queryClient.invalidateQueries({ queryKey: ['cycleHistory'] });
      queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
    },
  });
}

/**
 * Hook to claim redistribution for a specific cycle
 */
export function useClaimRedistribution() {
  const program = useAnchorProgram();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (cycleNumber: number) => {
      if (!program) throw new Error('Program not initialized');
      return claimRedistribution(program, cycleNumber);
    },
    onSuccess: () => {
      // Invalidate all relevant queries
      queryClient.invalidateQueries({ queryKey: ['playerState'] });
      queryClient.invalidateQueries({ queryKey: ['gameState'] });
      queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
    },
  });
}

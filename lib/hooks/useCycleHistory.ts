'use client';

import { useQuery } from '@tanstack/react-query';
import { useAnchorProgram, bnToSol } from '../anchor';
import { useGameState } from './useGameState';

export interface CycleInfo {
  cycleNumber: number;
  startSlot: number;
  endSlot: number;
  resolvedSlot: number;
  totalValueLocked: number;
  totalExposedValue: number;
  totalRedistributed: number;
  feesCollected: number;
  participants: number;
  winners: number;
  resolved: boolean;
}

/**
 * Hook to fetch cycle history from on-chain CycleState accounts
 */
export function useCycleHistory(limit: number = 10) {
  const program = useAnchorProgram();
  const { data: gameState } = useGameState();

  return useQuery({
    queryKey: ['cycleHistory', limit, gameState?.currentCycle.toNumber()],
    queryFn: async () => {
      if (!program || !gameState) throw new Error('Program or game state not initialized');

      const currentCycle = gameState.currentCycle.toNumber();
      const cycles: CycleInfo[] = [];

      // Fetch last N cycles (starting from current - 1, going backwards)
      for (let i = Math.max(1, currentCycle - limit); i < currentCycle; i++) {
        try {
          const [cycleStatePDA] = await import('../solana').then(m => m.getCycleStatePDA(i));
          const cycleState = await program.account.cycleState.fetch(cycleStatePDA);

          cycles.push({
            cycleNumber: cycleState.cycleNumber.toNumber(),
            startSlot: cycleState.startSlot.toNumber(),
            endSlot: cycleState.endSlot.toNumber(),
            resolvedSlot: cycleState.resolvedSlot.toNumber(),
            totalValueLocked: bnToSol(cycleState.totalValueLocked),
            totalExposedValue: bnToSol(cycleState.totalExposedValue),
            totalRedistributed: bnToSol(cycleState.totalRedistributed),
            feesCollected: bnToSol(cycleState.feesCollected),
            participants: cycleState.participants,
            winners: cycleState.winners,
            resolved: cycleState.resolved,
          });
        } catch (error) {
          // Cycle state might not exist yet
          console.warn(`Cycle ${i} not found:`, error);
        }
      }

      // Sort by cycle number descending (most recent first)
      return cycles.sort((a, b) => b.cycleNumber - a.cycleNumber);
    },
    enabled: !!program && !!gameState,
    refetchInterval: 15000, // Refetch every 15 seconds
  });
}

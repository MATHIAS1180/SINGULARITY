'use client';

import { useQuery } from '@tanstack/react-query';
import { useAnchorProgram, bnToSol } from '../anchor';

export interface LeaderboardPlayer {
  rank: number;
  wallet: string;
  score: number;
  balance: number;
  totalRedistributed: number;
  exposure: number;
  cyclesParticipated: number;
  participatingInCycle: boolean;
}

/**
 * Hook to fetch and sort leaderboard from on-chain PlayerState accounts
 */
export function useLeaderboard(limit: number = 50) {
  const program = useAnchorProgram();

  return useQuery({
    queryKey: ['leaderboard', limit],
    queryFn: async () => {
      if (!program) throw new Error('Program not initialized');

      // Fetch all PlayerState accounts
      const players = await program.account.PlayerState.all();

      // Sort by score descending
      const sorted = players.sort((a, b) => 
        b.account.score.toNumber() - a.account.score.toNumber()
      );

      // Map to leaderboard format with ranks
      const leaderboard: LeaderboardPlayer[] = sorted.slice(0, limit).map((p, index) => ({
        rank: index + 1,
        wallet: p.account.player.toString(),
        score: p.account.score.toNumber(),
        balance: bnToSol(p.account.balance),
        totalRedistributed: p.account.totalRedistributed.toNumber() / 1e9,
        exposure: p.account.exposure,
        cyclesParticipated: p.account.cyclesParticipated.toNumber(),
        participatingInCycle: p.account.participatingInCycle,
      }));

      return leaderboard;
    },
    enabled: !!program,
    refetchInterval: 10000, // Refetch every 10 seconds
  });
}

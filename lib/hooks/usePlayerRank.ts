'use client';

import { useQuery } from '@tanstack/react-query';
import { useWallet } from '@solana/wallet-adapter-react';
import { useAnchorProgram } from '../anchor';

/**
 * Hook to calculate player's rank from all PlayerState accounts
 */
export function usePlayerRank() {
  const { publicKey } = useWallet();
  const program = useAnchorProgram();

  return useQuery({
    queryKey: ['playerRank', publicKey?.toString()],
    queryFn: async () => {
      if (!program || !publicKey) return null;

      // Fetch all players
      const players = await program.account.playerState.all();

      // Sort by score descending
      const sorted = players.sort((a, b) => 
        b.account.score.toNumber() - a.account.score.toNumber()
      );

      // Find current player's index
      const index = sorted.findIndex(p => 
        p.account.player.equals(publicKey)
      );

      // Return rank (1-indexed) or null if not found
      return index >= 0 ? index + 1 : null;
    },
    enabled: !!program && !!publicKey,
    refetchInterval: 10000, // Refetch every 10 seconds
  });
}

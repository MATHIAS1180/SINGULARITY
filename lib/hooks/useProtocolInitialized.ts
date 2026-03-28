'use client';

import { useQuery } from '@tanstack/react-query';
import { useAnchorProgram, fetchGlobalConfig } from '../anchor';

/**
 * Hook to check if protocol is initialized
 */
export function useProtocolInitialized() {
  const program = useAnchorProgram();

  return useQuery({
    queryKey: ['protocolInitialized'],
    queryFn: async () => {
      if (!program) throw new Error('Program not initialized');
      try {
        await fetchGlobalConfig(program);
        return true;
      } catch {
        return false;
      }
    },
    enabled: !!program,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}

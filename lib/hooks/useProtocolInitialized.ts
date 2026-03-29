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
      if (!program) {
        console.log('❌ useProtocolInitialized: No program');
        throw new Error('Program not initialized');
      }
      try {
        const config = await fetchGlobalConfig(program);
        console.log('✅ useProtocolInitialized: Protocol is initialized', config);
        return true;
      } catch (error) {
        console.log('❌ useProtocolInitialized: Failed to fetch config', error);
        return false;
      }
    },
    enabled: !!program,
    refetchInterval: 30000, // Refetch every 30 seconds
    retry: 3,
    retryDelay: 1000,
  });
}

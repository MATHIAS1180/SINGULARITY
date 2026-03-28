'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAnchorProgram, initializeConfig, BN } from '../anchor';

export interface InitializeProtocolParams {
  protocolFeeBps: number;
  minDeposit: number;
  maxDeposit: number;
  minExposure: number;
  maxExposure: number;
  cycleDuration: number;
  exposureCooldown: number;
}

/**
 * Hook to initialize the protocol
 */
export function useInitializeProtocol() {
  const program = useAnchorProgram();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: InitializeProtocolParams) => {
      if (!program) throw new Error('Program not initialized');
      return initializeConfig(
        program,
        params.protocolFeeBps,
        new BN(params.minDeposit),
        new BN(params.maxDeposit),
        params.minExposure,
        params.maxExposure,
        new BN(params.cycleDuration),
        new BN(params.exposureCooldown)
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['protocolInitialized'] });
      queryClient.invalidateQueries({ queryKey: ['globalConfig'] });
      queryClient.invalidateQueries({ queryKey: ['gameState'] });
    },
  });
}

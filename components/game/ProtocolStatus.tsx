'use client';

import { useState } from 'react';
import { AlertTriangle, Loader2, CheckCircle2 } from 'lucide-react';
import { GlassPanel } from '../ui/GlassPanel';
import { useProtocolInitialized, useInitializeProtocol } from '@/lib/hooks';
import { useWallet } from '@solana/wallet-adapter-react';

export function ProtocolStatus() {
  const { connected, publicKey } = useWallet();
  const { data: isInitialized, isLoading } = useProtocolInitialized();
  const initMutation = useInitializeProtocol();
  const [showInitForm, setShowInitForm] = useState(false);

  // Default initialization parameters for Devnet
  const defaultParams = {
    protocolFeeBps: 200, // 2%
    minDeposit: 0.1 * 1e9, // 0.1 SOL in lamports
    maxDeposit: 1000 * 1e9, // 1000 SOL in lamports
    minExposure: 0,
    maxExposure: 100,
    cycleDuration: 600, // ~5 minutes in slots
    exposureCooldown: 60, // ~30 seconds in slots
  };

  const handleInitialize = async () => {
    try {
      await initMutation.mutateAsync(defaultParams);
      setShowInitForm(false);
    } catch (error) {
      console.error('Failed to initialize protocol:', error);
    }
  };

  if (!connected) {
    return null;
  }

  if (isLoading) {
    return (
      <GlassPanel className="p-4 mb-4">
        <div className="flex items-center gap-2 text-gray-400">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm">Checking protocol status...</span>
        </div>
      </GlassPanel>
    );
  }

  if (isInitialized) {
    return (
      <GlassPanel className="p-4 mb-4">
        <div className="flex items-center gap-2 text-green-400">
          <CheckCircle2 className="w-4 h-4" />
          <span className="text-sm font-medium">Protocol initialized</span>
        </div>
      </GlassPanel>
    );
  }

  return (
    <GlassPanel className="p-4 mb-4 border border-yellow-500/50 bg-yellow-500/10">
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-yellow-400">
          <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0" />
          <span className="text-sm font-medium">Protocol not initialized</span>
        </div>
        <p className="text-xs text-gray-400">
          The Swarm Arena protocol configuration must be initialized before users can register. This is typically done once by the protocol administrator.
        </p>
        
        {showInitForm ? (
          <div className="space-y-3 pt-2 border-t border-yellow-500/20">
            <p className="text-xs text-gray-300">
              Initialize with default Devnet parameters?
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleInitialize}
                disabled={initMutation.isPending}
                className="flex-1 px-3 py-2 bg-yellow-600 hover:bg-yellow-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {initMutation.isPending ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Initializing...
                  </>
                ) : (
                  'Initialize Protocol'
                )}
              </button>
              <button
                onClick={() => setShowInitForm(false)}
                disabled={initMutation.isPending}
                className="flex-1 px-3 py-2 bg-gray-600 hover:bg-gray-500 disabled:bg-gray-700 text-white text-xs font-medium rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
            {initMutation.error && (
              <p className="text-xs text-red-400">
                Error: {initMutation.error.message}
              </p>
            )}
          </div>
        ) : (
          <button
            onClick={() => setShowInitForm(true)}
            className="w-full px-3 py-2 bg-yellow-600 hover:bg-yellow-500 text-white text-xs font-medium rounded-lg transition-colors"
          >
            Initialize Protocol
          </button>
        )}
      </div>
    </GlassPanel>
  );
}

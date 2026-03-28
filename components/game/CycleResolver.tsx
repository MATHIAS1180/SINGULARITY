'use client';

import { useState } from 'react';
import { RefreshCw, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { GlassPanel } from '../ui/GlassPanel';
import { useAnchorProgram, resolveCycle } from '@/lib/anchor';
import { useGameState } from '@/lib/hooks/useGameState';
import { useCurrentSlot } from '@/lib/hooks/useCurrentSlot';
import { useQueryClient } from '@tanstack/react-query';

export function CycleResolver() {
  const program = useAnchorProgram();
  const { data: gameState } = useGameState();
  const currentSlot = useCurrentSlot();
  const queryClient = useQueryClient();
  
  const [isResolving, setIsResolving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!gameState || !program) return null;

  const cycleEndSlot = gameState.cycleEndSlot.toNumber();
  const canResolve = currentSlot >= cycleEndSlot && !gameState.cycleResolved;
  const slotsRemaining = Math.max(0, cycleEndSlot - currentSlot);
  const progress = Math.min(100, ((currentSlot - gameState.cycleStartSlot.toNumber()) / (cycleEndSlot - gameState.cycleStartSlot.toNumber())) * 100);

  const handleResolve = async () => {
    if (!program || !canResolve) return;

    setIsResolving(true);
    setError(null);
    setSuccess(false);

    try {
      const signature = await resolveCycle(program);
      console.log('Cycle resolved:', signature);
      
      setSuccess(true);
      
      // Invalidate queries to refetch data
      queryClient.invalidateQueries({ queryKey: ['gameState'] });
      queryClient.invalidateQueries({ queryKey: ['cycleHistory'] });
      queryClient.invalidateQueries({ queryKey: ['playerState'] });
      
      // Reset success message after 5 seconds
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      console.error('Failed to resolve cycle:', err);
      setError(err instanceof Error ? err.message : 'Failed to resolve cycle');
    } finally {
      setIsResolving(false);
    }
  };

  return (
    <GlassPanel className="p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-purple-400" />
            Cycle Resolution
          </h3>
          <p className="text-sm text-gray-400 mt-1">
            Cycle #{gameState.currentCycle.toString()}
          </p>
        </div>
        {gameState.cycleResolved && (
          <div className="flex items-center gap-2 text-green-400 text-sm">
            <CheckCircle2 className="w-4 h-4" />
            Resolved
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Progress</span>
          <span className="text-white font-medium">{progress.toFixed(1)}%</span>
        </div>
        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-500">
          <span>Slot {gameState.cycleStartSlot.toString()}</span>
          <span>{slotsRemaining > 0 ? `${slotsRemaining} slots remaining` : 'Cycle ended'}</span>
          <span>Slot {cycleEndSlot}</span>
        </div>
      </div>

      {/* Resolve Button */}
      {canResolve && (
        <button
          onClick={handleResolve}
          disabled={isResolving}
          className="w-full px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isResolving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Resolving Cycle...
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4" />
              Resolve Cycle #{gameState.currentCycle.toString()}
            </>
          )}
        </button>
      )}

      {/* Status Messages */}
      {success && (
        <div className="p-3 bg-green-500/20 border border-green-500/50 rounded-lg flex items-center gap-2 text-green-400 text-sm">
          <CheckCircle2 className="w-4 h-4" />
          Cycle resolved successfully! You can now claim rewards.
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg flex items-start gap-2 text-red-400 text-sm">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {!canResolve && !gameState.cycleResolved && (
        <div className="p-3 bg-blue-500/20 border border-blue-500/50 rounded-lg text-blue-400 text-sm">
          Cycle will be ready to resolve in {slotsRemaining} slots (~{Math.ceil(slotsRemaining * 0.4)} seconds)
        </div>
      )}
    </GlassPanel>
  );
}

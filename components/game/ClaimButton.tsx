'use client';

import { useState } from 'react';
import { Gift, Loader2, CheckCircle2, AlertCircle, TrendingUp, TrendingDown } from 'lucide-react';
import { GlassPanel } from '../ui/GlassPanel';
import { useClaimRedistribution } from '@/lib/hooks/useCycleActions';
import { useGameState } from '@/lib/hooks/useGameState';
import { usePlayerState } from '@/lib/hooks/usePlayerState';
import { useCycleHistory } from '@/lib/hooks/useCycleHistory';
import { useQueryClient } from '@tanstack/react-query';

export function ClaimButton() {
  const { data: gameState } = useGameState();
  const { data: playerState } = usePlayerState();
  const { data: cycleHistory } = useCycleHistory(1);
  const claimMutation = useClaimRedistribution();
  
  const isClaiming = claimMutation.isPending;
  const error = claimMutation.error?.message || null;
  const success = claimMutation.isSuccess;

  if (!gameState || !playerState) return null;

  // Can only claim if cycle is resolved and there's a previous cycle
  const currentCycle = gameState.currentCycle.toNumber();
  const lastCycle = currentCycle - 1;
  const canClaim = gameState.cycleResolved && lastCycle >= 1;

  // Get last cycle info if available
  const lastCycleInfo = cycleHistory && cycleHistory.length > 0 ? cycleHistory[0] : null;

  const handleClaim = async () => {
    if (!canClaim) return;

    try {
      await claimMutation.mutateAsync(lastCycle);
    } catch (err) {
      // Error handled by hook
    }
  };

  if (!canClaim) return null;

  return (
    <GlassPanel className="p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Gift className="w-5 h-5 text-yellow-400" />
            Claim Rewards
          </h3>
          <p className="text-sm text-gray-400 mt-1">
            Cycle #{lastCycle} redistribution available
          </p>
        </div>
      </div>

      {/* Cycle Info */}
      {lastCycleInfo && (
        <div className="grid grid-cols-2 gap-4 p-4 bg-white/5 rounded-lg">
          <div>
            <p className="text-xs text-gray-400">Total Redistributed</p>
            <p className="text-lg font-semibold text-white mt-1">
              {lastCycleInfo.totalRedistributed.toFixed(4)} SOL
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Participants</p>
            <p className="text-lg font-semibold text-white mt-1">
              {lastCycleInfo.participants}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Winners</p>
            <p className="text-lg font-semibold text-green-400 mt-1">
              {lastCycleInfo.winners}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Fees Collected</p>
            <p className="text-lg font-semibold text-purple-400 mt-1">
              {lastCycleInfo.feesCollected.toFixed(4)} SOL
            </p>
          </div>
        </div>
      )}

      {/* Player Participation Status */}
      {playerState.participatingInCycle ? (
        <div className="p-3 bg-green-500/20 border border-green-500/50 rounded-lg flex items-center gap-2 text-green-400 text-sm">
          <TrendingUp className="w-4 h-4" />
          You participated in this cycle with {playerState.exposure}% exposure
        </div>
      ) : (
        <div className="p-3 bg-gray-500/20 border border-gray-500/50 rounded-lg flex items-center gap-2 text-gray-400 text-sm">
          <TrendingDown className="w-4 h-4" />
          You did not participate in this cycle
        </div>
      )}

      {/* Claim Button */}
      <button
        onClick={handleClaim}
        disabled={isClaiming}
        className="w-full px-4 py-3 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isClaiming ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Claiming...
          </>
        ) : (
          <>
            <Gift className="w-4 h-4" />
            Claim Cycle #{lastCycle} Redistribution
          </>
        )}
      </button>

      {/* Status Messages */}
      {success && (
        <div className="p-3 bg-green-500/20 border border-green-500/50 rounded-lg flex items-center gap-2 text-green-400 text-sm">
          <CheckCircle2 className="w-4 h-4" />
          Redistribution claimed successfully! Your score and balance have been updated.
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg flex items-start gap-2 text-red-400 text-sm">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Info */}
      <p className="text-xs text-gray-500 text-center">
        Claiming will update your balance and score based on your exposure and the cycle outcome
      </p>
    </GlassPanel>
  );
}

'use client';

import { Clock, CheckCircle, Circle, Zap, Users, TrendingUp, Loader2 } from 'lucide-react';
import { useGameState, useCycleHistory, useCurrentSlot } from '@/lib/hooks';

export function CycleTimeline() {
  const { data: gameState } = useGameState();
  const { data: cycleHistory, isLoading } = useCycleHistory(10);
  const currentSlot = useCurrentSlot();

  if (!gameState) return null;

  const currentCycle = gameState.currentCycle.toNumber();
  const cycleStartSlot = gameState.cycleStartSlot.toNumber();
  const cycleEndSlot = gameState.cycleEndSlot.toNumber();
  const progress = ((currentSlot - cycleStartSlot) / (cycleEndSlot - cycleStartSlot)) * 100;
  const slotsRemaining = Math.max(0, cycleEndSlot - currentSlot);

  return (
    <div className="space-y-6">
      {/* Active Cycle Progress */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-blue-400" />
            <span className="text-sm font-medium text-white">
              Cycle #{currentCycle} {gameState.cycleResolved ? '(Resolved)' : 'in Progress'}
            </span>
          </div>
          <span className="text-sm font-bold text-blue-400">
            {Math.min(Math.round(progress), 100)}%
          </span>
        </div>

        {/* Progress Bar */}
        <div className="relative h-3 bg-white/5 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-1000 ${
              gameState.cycleResolved 
                ? 'bg-gradient-to-r from-green-500 to-emerald-500' 
                : 'bg-gradient-to-r from-blue-500 to-purple-500'
            }`}
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>

        {/* Time Info */}
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>Slot {cycleStartSlot}</span>
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>Current: {currentSlot}</span>
          </div>
          <span>Slot {cycleEndSlot}</span>
        </div>

        {/* Active Cycle Stats */}
        <div className="grid grid-cols-3 gap-3 pt-3 border-t border-white/10">
          <div className="text-center">
            <p className="text-xs text-gray-500">Participants</p>
            <p className="text-lg font-bold text-white">{gameState.activePlayers}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500">Remaining</p>
            <p className="text-lg font-bold text-white">
              {slotsRemaining} slots
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500">Status</p>
            <p className={`text-lg font-bold ${gameState.cycleResolved ? 'text-green-400' : 'text-blue-400'}`}>
              {gameState.cycleResolved ? 'Resolved' : 'Active'}
            </p>
          </div>
        </div>
      </div>

      {/* Cycles List */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-400">Recent Cycles</h4>
        
        {isLoading ? (
          <div className="p-8 text-center">
            <Loader2 className="w-8 h-8 text-purple-400 mx-auto animate-spin mb-2" />
            <p className="text-gray-400 text-sm">Loading cycle history...</p>
          </div>
        ) : !cycleHistory || cycleHistory.length === 0 ? (
          <div className="p-8 text-center">
            <Circle className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">No completed cycles yet</p>
            <p className="text-sm text-gray-500 mt-1">
              History will appear after the first cycle is resolved
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {cycleHistory.map((cycle) => (
              <div
                key={cycle.cycleNumber}
                className="p-4 border border-green-500/30 bg-green-500/5 rounded-lg transition-all"
              >
                <div className="flex items-start justify-between">
                  {/* Left - Cycle Info */}
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">
                          Cycle #{cycle.cycleNumber}
                        </span>
                        <span className="px-2 py-0.5 bg-green-500/20 border border-green-500/30 rounded text-xs font-medium text-green-400">
                          Completed
                        </span>
                      </div>
                      <p className="text-xs text-gray-400">
                        Slots {cycle.startSlot} → {cycle.endSlot}
                      </p>
                    </div>
                  </div>

                  {/* Right - Stats */}
                  <div className="text-right space-y-1">
                    <div className="flex items-center gap-1 justify-end">
                      <Users className="w-3 h-3 text-gray-400" />
                      <span className="text-xs text-gray-400">{cycle.participants} players</span>
                    </div>
                    <div className="flex items-center gap-1 justify-end">
                      <TrendingUp className="w-3 h-3 text-green-400" />
                      <span className="text-xs font-medium text-green-400">
                        {cycle.totalRedistributed.toFixed(4)} SOL
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {cycle.winners} winners
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Timeline Visualization */}
      {cycleHistory && cycleHistory.length > 0 && (
        <div className="relative pt-4 border-t border-white/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-400">Timeline</span>
            <span className="text-xs text-gray-500">Last {cycleHistory.length} cycles</span>
          </div>
          
          <div className="flex items-center gap-2">
            {cycleHistory.slice(0, 10).reverse().map((cycle) => (
              <div key={cycle.cycleNumber} className="flex-1">
                <div className="h-2 rounded-full bg-green-500" />
                <p className="text-xs text-gray-500 text-center mt-1">#{cycle.cycleNumber}</p>
              </div>
            ))}
            {/* Current cycle */}
            <div className="flex-1">
              <div className={`h-2 rounded-full ${gameState.cycleResolved ? 'bg-green-500' : 'bg-blue-500 animate-pulse'}`} />
              <p className="text-xs text-gray-500 text-center mt-1">#{currentCycle}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

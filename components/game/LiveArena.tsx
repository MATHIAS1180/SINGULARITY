'use client';

import { 
  Zap, 
  TrendingUp, 
  Users, 
  Target,
  Activity,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { GlassPanel } from '../ui/GlassPanel';
import { useGameState } from '@/lib/hooks';
import { useCurrentSlot } from '@/lib/hooks';
import { bnToSol } from '@/lib/anchor';
import { useEffect, useState } from 'react';

export function LiveArena() {
  const { data: gameState, isLoading } = useGameState();
  const { slot: currentSlot } = useCurrentSlot();
  const [cycleProgress, setCycleProgress] = useState(0);

  // Calculate cycle progress
  useEffect(() => {
    if (!gameState || !currentSlot) return;

    const elapsed = currentSlot - gameState.cycleStartSlot.toNumber();
    const total = gameState.cycleEndSlot.toNumber() - gameState.cycleStartSlot.toNumber();
    const progress = Math.min(Math.max((elapsed / total) * 100, 0), 100);
    
    setCycleProgress(progress);
  }, [gameState, currentSlot]);

  // Calculate metrics from blockchain data
  const metrics = gameState ? {
    totalExposed: bnToSol(gameState.totalExposedValue),
    totalValueLocked: bnToSol(gameState.totalValueLocked),
    activePlayers: gameState.activePlayers,
    averageExposure: gameState.totalValueLocked.toNumber() > 0 
      ? (gameState.totalExposedValue.toNumber() / gameState.totalValueLocked.toNumber()) * 100 
      : 0,
    cycleProgress,
    tension: cycleProgress > 75 ? 'extreme' as const : 
             cycleProgress > 50 ? 'high' as const : 
             cycleProgress > 25 ? 'medium' as const : 
             'low' as const,
  } : {
    totalExposed: 0,
    totalValueLocked: 0,
    activePlayers: 0,
    averageExposure: 0,
    cycleProgress: 0,
    tension: 'low' as const,
  };

  if (isLoading) {
    return (
      <GlassPanel className="p-6 text-center space-y-4">
        <Loader2 className="w-12 h-12 text-purple-400 mx-auto animate-spin" />
        <p className="text-gray-400 text-sm">Loading arena data...</p>
      </GlassPanel>
    );
  }

  const getTensionColor = () => {
    switch (metrics.tension) {
      case 'extreme':
        return 'from-red-500 to-red-600';
      case 'high':
        return 'from-orange-500 to-orange-600';
      case 'medium':
        return 'from-yellow-500 to-yellow-600';
      default:
        return 'from-green-500 to-green-600';
    }
  };

  const getTensionLabel = () => {
    switch (metrics.tension) {
      case 'extreme':
        return 'Extreme Tension';
      case 'high':
        return 'High Tension';
      case 'medium':
        return 'Medium Tension';
      default:
        return 'Low Tension';
    }
  };

  const exposureRatio = metrics.totalValueLocked > 0 
    ? (metrics.totalExposed / metrics.totalValueLocked) * 100 
    : 0;

  return (
    <GlassPanel className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Live Arena</h3>
            <p className="text-sm text-gray-400">Real-time competition state</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/30 rounded-lg">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-sm font-medium text-green-400">Live</span>
        </div>
      </div>

      {/* Tension Meter */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className={`w-5 h-5 ${
              metrics.tension === 'extreme' ? 'text-red-400' :
              metrics.tension === 'high' ? 'text-orange-400' :
              metrics.tension === 'medium' ? 'text-yellow-400' :
              'text-green-400'
            }`} />
            <span className="text-sm font-medium text-gray-400">Arena Tension</span>
          </div>
          <span className={`text-sm font-bold ${
            metrics.tension === 'extreme' ? 'text-red-400' :
            metrics.tension === 'high' ? 'text-orange-400' :
            metrics.tension === 'medium' ? 'text-yellow-400' :
            'text-green-400'
          }`}>
            {getTensionLabel()}
          </span>
        </div>

        {/* Tension Bar */}
        <div className="relative h-4 bg-white/5 rounded-full overflow-hidden">
          <div
            className={`h-full bg-gradient-to-r ${getTensionColor()} transition-all duration-500`}
            style={{ width: `${metrics.cycleProgress}%` }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-bold text-white drop-shadow-lg">
              {metrics.cycleProgress}% Cycle Progress
            </span>
          </div>
        </div>
      </div>

      {/* Risk Zones Visualization */}
      <div className="grid grid-cols-3 gap-3">
        {/* Low Risk Zone */}
        <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full" />
            <span className="text-xs font-medium text-green-400">Low Risk</span>
          </div>
          <p className="text-2xl font-bold text-white">0-25%</p>
          <p className="text-xs text-gray-400">Safe zone</p>
        </div>

        {/* Medium Risk Zone */}
        <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full" />
            <span className="text-xs font-medium text-yellow-400">Medium Risk</span>
          </div>
          <p className="text-2xl font-bold text-white">25-75%</p>
          <p className="text-xs text-gray-400">Balanced</p>
        </div>

        {/* High Risk Zone */}
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full" />
            <span className="text-xs font-medium text-red-400">High Risk</span>
          </div>
          <p className="text-2xl font-bold text-white">75-100%</p>
          <p className="text-xs text-gray-400">Maximum</p>
        </div>
      </div>

      {/* Arena Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-purple-400" />
            <span className="text-xs text-gray-400">Total Exposed</span>
          </div>
          <p className="text-xl font-bold text-white">{metrics.totalExposed.toFixed(2)} SOL</p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-400" />
            <span className="text-xs text-gray-400">Total Locked</span>
          </div>
          <p className="text-xl font-bold text-white">{metrics.totalValueLocked.toFixed(2)} SOL</p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-green-400" />
            <span className="text-xs text-gray-400">Active Players</span>
          </div>
          <p className="text-xl font-bold text-white">{metrics.activePlayers}</p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-yellow-400" />
            <span className="text-xs text-gray-400">Avg Exposure</span>
          </div>
          <p className="text-xl font-bold text-white">{metrics.averageExposure.toFixed(0)}%</p>
        </div>
      </div>

      {/* Exposure Ratio Indicator */}
      <div className="p-4 bg-white/5 rounded-lg space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-400">Exposure Ratio</span>
          <span className="text-sm font-bold text-white">{exposureRatio.toFixed(1)}%</span>
        </div>
        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-500"
            style={{ width: `${Math.min(exposureRatio, 100)}%` }}
          />
        </div>
        <p className="text-xs text-gray-500">
          {exposureRatio < 30 
            ? 'Low competition - more players needed' 
            : exposureRatio < 70 
            ? 'Healthy competition level' 
            : 'High competition - intense redistribution'}
        </p>
      </div>

      {/* Activity Pulse */}
      <div className="flex items-center justify-center gap-2 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
        <Activity className="w-4 h-4 text-blue-400 animate-pulse" />
        <span className="text-sm text-blue-400">
          Arena is active • Next cycle resolution in <span className="font-bold">—</span>
        </span>
      </div>
    </GlassPanel>
  );
}
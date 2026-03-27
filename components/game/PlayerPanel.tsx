'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { 
  Wallet, 
  Target, 
  Trophy, 
  TrendingUp,
  TrendingDown,
  ArrowDownCircle,
  ArrowUpCircle,
  Zap,
  Loader2
} from 'lucide-react';
import { GlassPanel } from '../ui/GlassPanel';
import { RankBadge } from '../ui/RankBadge';
import { usePlayerState } from '@/lib/hooks';
import { bnToSol } from '@/lib/anchor';

export function PlayerPanel() {
  const { connected, publicKey } = useWallet();
  const { data: playerState, isLoading } = usePlayerState();

  // Calculate stats from blockchain data
  const stats = playerState ? {
    balance: bnToSol(playerState.balance),
    exposure: playerState.exposure,
    exposedValue: bnToSol(playerState.exposedValue),
    score: playerState.score.toNumber(),
    rank: 0, // TODO: Calculate from leaderboard
    totalPnL: playerState.totalRedistributed.toNumber() / 1e9,
    participating: playerState.participatingInCycle,
  } : {
    balance: 0,
    exposure: 0,
    exposedValue: 0,
    score: 0,
    rank: 0,
    totalPnL: 0,
    participating: false,
  };

  if (!connected) {
    return (
      <GlassPanel className="p-6 text-center space-y-4">
        <Wallet className="w-12 h-12 text-gray-600 mx-auto" />
        <div>
          <p className="text-gray-400 text-sm">Connect wallet to view</p>
          <p className="text-gray-500 text-xs mt-1">your player stats</p>
        </div>
      </GlassPanel>
    );
  }

  if (isLoading) {
    return (
      <GlassPanel className="p-6 text-center space-y-4">
        <Loader2 className="w-12 h-12 text-purple-400 mx-auto animate-spin" />
        <div>
          <p className="text-gray-400 text-sm">Loading player data...</p>
        </div>
      </GlassPanel>
    );
  }

  if (!playerState) {
    return (
      <GlassPanel className="p-6 text-center space-y-4">
        <Wallet className="w-12 h-12 text-gray-600 mx-auto" />
        <div>
          <p className="text-gray-400 text-sm">Player not registered</p>
          <p className="text-gray-500 text-xs mt-1">Register to start playing</p>
        </div>
      </GlassPanel>
    );
  }

  const shortAddress = publicKey 
    ? `${publicKey.toString().slice(0, 4)}...${publicKey.toString().slice(-4)}`
    : '';

  const isProfitable = stats.totalPnL >= 0;

  return (
    <GlassPanel className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-white">Your Stats</h3>
          <p className="text-sm text-gray-400">{shortAddress}</p>
        </div>
        <RankBadge rank={stats.rank} size="sm" />
      </div>

      {/* Balance */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wallet className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-gray-400">Balance</span>
          </div>
          <span className="text-2xl font-bold text-white">
            {stats.balance.toFixed(2)} SOL
          </span>
        </div>

        {/* Balance Breakdown */}
        {stats.exposure > 0 && (
          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/10">
            <div>
              <p className="text-xs text-gray-500">Exposed</p>
              <p className="text-sm font-semibold text-red-400">
                {stats.exposedValue.toFixed(2)} SOL
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Safe</p>
              <p className="text-sm font-semibold text-green-400">
                {(stats.balance - stats.exposedValue).toFixed(2)} SOL
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Exposure */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-yellow-400" />
            <span className="text-sm text-gray-400">Exposure</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-white">{stats.exposure}%</span>
            {stats.participating && (
              <div className="px-2 py-1 bg-green-500/20 border border-green-500/30 rounded text-xs font-medium text-green-400">
                Active
              </div>
            )}
          </div>
        </div>

        {/* Exposure Bar */}
        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${
              stats.exposure === 0 ? 'bg-gray-500' :
              stats.exposure < 25 ? 'bg-green-500' :
              stats.exposure < 50 ? 'bg-yellow-500' :
              stats.exposure < 75 ? 'bg-orange-500' :
              'bg-red-500'
            }`}
            style={{ width: `${stats.exposure}%` }}
          />
        </div>
      </div>

      {/* Score & P&L */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-yellow-400" />
            <span className="text-xs text-gray-400">Score</span>
          </div>
          <p className="text-xl font-bold text-white">{stats.score.toLocaleString()}</p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            {isProfitable ? (
              <TrendingUp className="w-4 h-4 text-green-400" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-400" />
            )}
            <span className="text-xs text-gray-400">Total P&L</span>
          </div>
          <p className={`text-xl font-bold ${isProfitable ? 'text-green-400' : 'text-red-400'}`}>
            {isProfitable ? '+' : ''}{stats.totalPnL.toFixed(2)} SOL
          </p>
        </div>
      </div>

      {/* Status */}
      <div className="p-3 bg-white/5 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <Zap className="w-4 h-4 text-blue-400" />
          <span className="text-xs font-medium text-gray-400">Status</span>
        </div>
        <p className="text-sm text-white">
          {stats.participating 
            ? `Competing with ${stats.exposure}% exposure` 
            : 'Not participating in current cycle'}
        </p>
      </div>

      {/* Quick Actions */}
      <div className="space-y-2 pt-4 border-t border-white/10">
        <p className="text-xs font-medium text-gray-400 mb-3">Quick Actions</p>
        
        <button className="w-full flex items-center justify-between px-4 py-3 bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 rounded-lg transition-all group">
          <span className="text-sm font-medium text-green-400">Deposit SOL</span>
          <ArrowDownCircle className="w-4 h-4 text-green-400 group-hover:translate-y-0.5 transition-transform" />
        </button>

        <button 
          className="w-full flex items-center justify-between px-4 py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-lg transition-all group"
          disabled={stats.participating}
        >
          <span className="text-sm font-medium text-red-400">Withdraw SOL</span>
          <ArrowUpCircle className="w-4 h-4 text-red-400 group-hover:-translate-y-0.5 transition-transform" />
        </button>

        {stats.participating && (
          <p className="text-xs text-gray-500 text-center mt-2">
            Set exposure to 0% to withdraw
          </p>
        )}
      </div>
    </GlassPanel>
  );
}
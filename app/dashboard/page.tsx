'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Wallet, TrendingUp, Clock, Users, Target, Loader2 } from 'lucide-react';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { StatCard } from '@/components/ui/StatCard';
import { LiveArena } from '@/components/game/LiveArena';
import { PlayerPanel } from '@/components/game/PlayerPanel';
import { PlayerActions } from '@/components/game/PlayerActions';
import { CycleTimeline } from '@/components/game/CycleTimeline';
import { LeaderboardPreview } from '@/components/game/LeaderboardPreview';
import { usePlayerState, useGameState } from '@/lib/hooks';
import { bnToSol } from '@/lib/anchor';

export default function DashboardPage() {
  const { connected, publicKey } = useWallet();
  const { data: playerState, isLoading: playerLoading } = usePlayerState();
  const { data: gameState, isLoading: gameLoading } = useGameState();

  // If wallet not connected, show connect prompt
  if (!connected) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <GlassPanel className="p-12 text-center space-y-6 max-w-md">
          <div className="w-20 h-20 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto">
            <Wallet className="w-10 h-10 text-purple-400" />
          </div>
          <div className="space-y-3">
            <h2 className="text-2xl font-bold text-white">Connect Your Wallet</h2>
            <p className="text-gray-400">
              Connect your Solana wallet to enter the arena and start competing.
            </p>
          </div>
          <WalletMultiButton className="!bg-gradient-to-r !from-purple-600 !to-blue-600 hover:!from-purple-500 hover:!to-blue-500 !rounded-xl !font-semibold !px-8 !py-3" />
        </GlassPanel>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-white">Arena Dashboard</h1>
          <p className="text-gray-400 mt-1">
            {publicKey?.toString().slice(0, 4)}...{publicKey?.toString().slice(-4)}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/30 rounded-lg">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium text-green-400">Live</span>
          </div>
          <WalletMultiButton className="!bg-white/5 hover:!bg-white/10 !border !border-white/10 !rounded-xl" />
        </div>
      </div>

      {/* Loading State */}
      {(playerLoading || gameLoading) && (
        <GlassPanel className="p-6 text-center">
          <Loader2 className="w-8 h-8 text-purple-400 mx-auto animate-spin mb-2" />
          <p className="text-gray-400">Loading blockchain data...</p>
        </GlassPanel>
      )}

      {/* Player Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Balance"
          value={playerState ? `${bnToSol(playerState.balance).toFixed(4)} SOL` : '0 SOL'}
          icon={<Wallet className="w-5 h-5" />}
        />
        <StatCard
          label="Current Exposure"
          value={playerState ? `${playerState.exposure}%` : '0%'}
          icon={<Target className="w-5 h-5" />}
          subtitle={playerState?.participatingInCycle ? 'Participating' : 'Not participating'}
        />
        <StatCard
          label="Total P&L"
          value={playerState ? `${(playerState.totalRedistributed.toNumber() / 1e9).toFixed(4)} SOL` : '0 SOL'}
          icon={<TrendingUp className="w-5 h-5" />}
        />
        <StatCard
          label="Rank"
          value="—"
          icon={<Users className="w-5 h-5" />}
          subtitle="Join to rank"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Player Controls */}
        <div className="lg:col-span-1 space-y-6">
          {/* Player Panel */}
          <PlayerPanel />

          {/* Player Actions */}
          <PlayerActions />
        </div>

        {/* Center Column - Live Arena */}
        <div className="lg:col-span-2 space-y-6">
          {/* Cycle Timeline */}
          <GlassPanel className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Current Cycle</h3>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Clock className="w-4 h-4" />
                <span>Cycle #{gameState?.currentCycle.toString() || '—'}</span>
              </div>
            </div>
            <CycleTimeline />
          </GlassPanel>

          {/* Live Arena */}
          <LiveArena />

          {/* Leaderboard Preview */}
          <LeaderboardPreview />
        </div>
      </div>

      {/* Bottom Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <GlassPanel className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Total Value Locked</p>
              <p className="text-2xl font-bold text-white mt-1">
                {gameState ? `${bnToSol(gameState.totalValueLocked).toFixed(4)} SOL` : '0 SOL'}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-purple-400" />
            </div>
          </div>
        </GlassPanel>

        <GlassPanel className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Active Players</p>
              <p className="text-2xl font-bold text-white mt-1">
                {gameState?.activePlayers || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-400" />
            </div>
          </div>
        </GlassPanel>

        <GlassPanel className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Cycle Status</p>
              <p className="text-2xl font-bold text-white mt-1">
                {gameState?.cycleResolved ? 'Resolved' : 'Active'}
              </p>
            </div>
            <div className="w-12 h-12 bg-pink-500/20 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-pink-400" />
            </div>
          </div>
        </GlassPanel>
      </div>
    </div>
  );
}
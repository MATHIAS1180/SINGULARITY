'use client';

import { useState } from 'react';
import { 
  Trophy, 
  TrendingUp, 
  TrendingDown, 
  Medal,
  Crown,
  ChevronUp,
  ChevronDown,
  Minus,
  Users,
  Target
} from 'lucide-react';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { RankBadge } from '@/components/ui/RankBadge';
import { StatCard } from '@/components/ui/StatCard';

type SortBy = 'score' | 'balance' | 'cycles' | 'pnl';
type Period = 'all' | '30d' | '7d' | '24h';

export default function LeaderboardPage() {
  const [sortBy, setSortBy] = useState<SortBy>('score');
  const [period, setPeriod] = useState<Period>('all');

  // Mock data - replace with real data from API
  const mockPlayers = [
    {
      rank: 1,
      wallet: 'ABC...XYZ',
      score: 15420,
      balance: 125.5,
      cycles: 48,
      pnl: 45.2,
      change: 2,
    },
    {
      rank: 2,
      wallet: 'DEF...UVW',
      score: 12350,
      balance: 98.3,
      cycles: 42,
      pnl: 32.1,
      change: -1,
    },
    {
      rank: 3,
      wallet: 'GHI...RST',
      score: 10890,
      balance: 87.6,
      cycles: 39,
      pnl: 28.4,
      change: 1,
    },
  ];

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-5 h-5 text-yellow-400" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-300" />;
    if (rank === 3) return <Medal className="w-5 h-5 text-amber-600" />;
    return <span className="text-gray-400 font-medium">#{rank}</span>;
  };

  const getRankChangeIcon = (change: number) => {
    if (change > 0) return <ChevronUp className="w-4 h-4 text-green-400" />;
    if (change < 0) return <ChevronDown className="w-4 h-4 text-red-400" />;
    return <Minus className="w-4 h-4 text-gray-500" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
          Leaderboard
        </h1>
        <p className="text-gray-400 text-lg">
          Top competitors in the Swarm Arena
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          label="Total Players"
          value="0"
          icon={<Users className="w-5 h-5" />}
          subtitle="All time"
        />
        <StatCard
          label="Active Today"
          value="0"
          icon={<Target className="w-5 h-5" />}
          subtitle="Last 24h"
        />
        <StatCard
          label="Total Volume"
          value="0 SOL"
          icon={<TrendingUp className="w-5 h-5" />}
          subtitle="All time"
        />
        <StatCard
          label="Avg Score"
          value="0"
          icon={<Trophy className="w-5 h-5" />}
          subtitle="Top 100"
        />
      </div>

      {/* Filters */}
      <GlassPanel className="p-6">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
          {/* Sort By */}
          <div className="space-y-2 w-full md:w-auto">
            <label className="text-sm text-gray-400">Sort By</label>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setSortBy('score')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  sortBy === 'score'
                    ? 'bg-purple-600 text-white'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
              >
                Score
              </button>
              <button
                onClick={() => setSortBy('balance')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  sortBy === 'balance'
                    ? 'bg-purple-600 text-white'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
              >
                Balance
              </button>
              <button
                onClick={() => setSortBy('cycles')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  sortBy === 'cycles'
                    ? 'bg-purple-600 text-white'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
              >
                Cycles
              </button>
              <button
                onClick={() => setSortBy('pnl')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  sortBy === 'pnl'
                    ? 'bg-purple-600 text-white'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
              >
                P&L
              </button>
            </div>
          </div>

          {/* Period */}
          <div className="space-y-2 w-full md:w-auto">
            <label className="text-sm text-gray-400">Period</label>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setPeriod('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  period === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
              >
                All Time
              </button>
              <button
                onClick={() => setPeriod('30d')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  period === '30d'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
              >
                30 Days
              </button>
              <button
                onClick={() => setPeriod('7d')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  period === '7d'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
              >
                7 Days
              </button>
              <button
                onClick={() => setPeriod('24h')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  period === '24h'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
              >
                24 Hours
              </button>
            </div>
          </div>
        </div>
      </GlassPanel>

      {/* Top 3 Podium */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {mockPlayers.slice(0, 3).map((player, index) => (
          <GlassPanel
            key={player.rank}
            className={`p-6 text-center space-y-4 ${
              player.rank === 1
                ? 'border-yellow-500/50 bg-yellow-500/5'
                : player.rank === 2
                ? 'border-gray-300/50 bg-gray-300/5'
                : 'border-amber-600/50 bg-amber-600/5'
            }`}
          >
            <div className="flex justify-center">
              {getRankIcon(player.rank)}
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{player.wallet}</p>
              <p className="text-sm text-gray-400 mt-1">Rank #{player.rank}</p>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
              <div>
                <p className="text-sm text-gray-400">Score</p>
                <p className="text-lg font-bold text-white">{player.score.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">P&L</p>
                <p className="text-lg font-bold text-green-400">+{player.pnl} SOL</p>
              </div>
            </div>
          </GlassPanel>
        ))}
      </div>

      {/* Full Leaderboard Table */}
      <GlassPanel className="overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 p-4 bg-white/5 border-b border-white/10 text-sm font-medium text-gray-400">
          <div className="col-span-1">Rank</div>
          <div className="col-span-1">Change</div>
          <div className="col-span-3">Player</div>
          <div className="col-span-2 text-right">Score</div>
          <div className="col-span-2 text-right">Balance</div>
          <div className="col-span-2 text-right">Cycles</div>
          <div className="col-span-1 text-right">P&L</div>
        </div>

        {/* Table Body */}
        <div className="divide-y divide-white/5">
          {mockPlayers.length === 0 ? (
            <div className="text-center py-12">
              <Trophy className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">No players yet</p>
              <p className="text-sm text-gray-500 mt-1">
                Be the first to compete and claim the top spot
              </p>
            </div>
          ) : (
            mockPlayers.map((player) => (
              <div
                key={player.rank}
                className="grid grid-cols-12 gap-4 p-4 hover:bg-white/5 transition-colors cursor-pointer"
              >
                {/* Rank */}
                <div className="col-span-1 flex items-center">
                  {getRankIcon(player.rank)}
                </div>

                {/* Change */}
                <div className="col-span-1 flex items-center">
                  <div className="flex items-center gap-1">
                    {getRankChangeIcon(player.change)}
                    {player.change !== 0 && (
                      <span className={`text-xs ${player.change > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {Math.abs(player.change)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Player */}
                <div className="col-span-3 flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center text-xs font-bold">
                    {player.wallet.slice(0, 2)}
                  </div>
                  <span className="font-medium text-white">{player.wallet}</span>
                </div>

                {/* Score */}
                <div className="col-span-2 flex items-center justify-end">
                  <span className="font-semibold text-white">{player.score.toLocaleString()}</span>
                </div>

                {/* Balance */}
                <div className="col-span-2 flex items-center justify-end">
                  <span className="text-gray-300">{player.balance.toFixed(2)} SOL</span>
                </div>

                {/* Cycles */}
                <div className="col-span-2 flex items-center justify-end">
                  <span className="text-gray-300">{player.cycles}</span>
                </div>

                {/* P&L */}
                <div className="col-span-1 flex items-center justify-end">
                  <span className={player.pnl >= 0 ? 'text-green-400' : 'text-red-400'}>
                    {player.pnl >= 0 ? '+' : ''}{player.pnl}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {mockPlayers.length > 0 && (
          <div className="p-4 bg-white/5 border-t border-white/10 flex justify-between items-center">
            <p className="text-sm text-gray-400">
              Showing 1-{mockPlayers.length} of {mockPlayers.length}
            </p>
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm transition-all disabled:opacity-50" disabled>
                Previous
              </button>
              <button className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm transition-all disabled:opacity-50" disabled>
                Next
              </button>
            </div>
          </div>
        )}
      </GlassPanel>
    </div>
  );
}
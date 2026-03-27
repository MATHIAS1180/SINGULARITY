'use client';

import { Trophy, TrendingUp, ArrowRight, Crown, Medal } from 'lucide-react';
import Link from 'next/link';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { RankBadge } from '@/components/ui/RankBadge';

interface LeaderboardPlayer {
  rank: number;
  wallet: string;
  score: number;
  pnl: number;
  change: number;
}

interface LeaderboardPreviewProps {
  limit?: number;
  className?: string;
}

export function LeaderboardPreview({ 
  limit = 5,
  className = '' 
}: LeaderboardPreviewProps) {
  // Mock data - replace with real API data
  const mockPlayers: LeaderboardPlayer[] = [
    {
      rank: 1,
      wallet: 'ABC...XYZ',
      score: 15420,
      pnl: 45.2,
      change: 2,
    },
    {
      rank: 2,
      wallet: 'DEF...UVW',
      score: 12350,
      pnl: 32.1,
      change: -1,
    },
    {
      rank: 3,
      wallet: 'GHI...RST',
      score: 10890,
      pnl: 28.4,
      change: 1,
    },
    {
      rank: 4,
      wallet: 'JKL...OPQ',
      score: 9240,
      pnl: 18.7,
      change: 0,
    },
    {
      rank: 5,
      wallet: 'MNO...LMN',
      score: 8150,
      pnl: 15.3,
      change: 3,
    },
  ];

  const topPlayers = mockPlayers.slice(0, limit);

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-4 h-4 text-yellow-400" />;
    if (rank === 2) return <Medal className="w-4 h-4 text-gray-300" />;
    if (rank === 3) return <Medal className="w-4 h-4 text-amber-600" />;
    return null;
  };

  return (
    <GlassPanel className={className}>
      {/* Header */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Top Players</h3>
              <p className="text-sm text-gray-400">Current cycle leaders</p>
            </div>
          </div>
          <Link 
            href="/leaderboard"
            className="flex items-center gap-1 text-sm text-purple-400 hover:text-purple-300 transition-colors"
          >
            View All
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Players List */}
      <div className="divide-y divide-white/5">
        {topPlayers.length === 0 ? (
          <div className="p-8 text-center">
            <Trophy className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">No players yet</p>
            <p className="text-sm text-gray-500 mt-1">
              Be the first to compete
            </p>
          </div>
        ) : (
          topPlayers.map((player) => (
            <div
              key={player.rank}
              className="p-4 hover:bg-white/5 transition-colors cursor-pointer"
            >
              <div className="flex items-center justify-between">
                {/* Left: Rank + Player */}
                <div className="flex items-center gap-3 flex-1">
                  {/* Rank Icon or Badge */}
                  <div className="w-8 flex items-center justify-center">
                    {getRankIcon(player.rank) || (
                      <span className="text-gray-400 font-semibold text-sm">
                        #{player.rank}
                      </span>
                    )}
                  </div>

                  {/* Player Avatar + Wallet */}
                  <div className="flex items-center gap-2 flex-1">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center text-xs font-bold">
                      {player.wallet.slice(0, 2)}
                    </div>
                    <span className="font-medium text-white text-sm">
                      {player.wallet}
                    </span>
                  </div>
                </div>

                {/* Right: Score + P&L */}
                <div className="flex items-center gap-4">
                  {/* Score */}
                  <div className="text-right">
                    <p className="text-xs text-gray-400">Score</p>
                    <p className="text-sm font-semibold text-white">
                      {player.score.toLocaleString()}
                    </p>
                  </div>

                  {/* P&L */}
                  <div className="text-right min-w-[60px]">
                    <p className="text-xs text-gray-400">P&L</p>
                    <p className={`text-sm font-semibold ${
                      player.pnl >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {player.pnl >= 0 ? '+' : ''}{player.pnl.toFixed(1)}
                    </p>
                  </div>

                  {/* Change Indicator */}
                  {player.change !== 0 && (
                    <div className={`flex items-center gap-1 ${
                      player.change > 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      <TrendingUp 
                        className={`w-3 h-3 ${
                          player.change < 0 ? 'rotate-180' : ''
                        }`} 
                      />
                      <span className="text-xs font-medium">
                        {Math.abs(player.change)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer Stats */}
      <div className="p-4 bg-white/5 border-t border-white/10">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-xs text-gray-400">Total Players</p>
            <p className="text-sm font-semibold text-white mt-1">
              {mockPlayers.length}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Avg Score</p>
            <p className="text-sm font-semibold text-white mt-1">
              {Math.round(
                mockPlayers.reduce((sum, p) => sum + p.score, 0) / mockPlayers.length
              ).toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Total P&L</p>
            <p className="text-sm font-semibold text-green-400 mt-1">
              +{mockPlayers.reduce((sum, p) => sum + p.pnl, 0).toFixed(1)}
            </p>
          </div>
        </div>
      </div>
    </GlassPanel>
  );
}

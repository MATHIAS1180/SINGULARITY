'use client';

import { Trophy, TrendingUp, ArrowRight, Crown, Medal, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { useLeaderboard } from '@/lib/hooks';

interface LeaderboardPreviewProps {
  limit?: number;
  className?: string;
}

export function LeaderboardPreview({ 
  limit = 5,
  className = '' 
}: LeaderboardPreviewProps) {
  const { data: leaderboard, isLoading } = useLeaderboard(limit);

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
        {isLoading ? (
          <div className="p-8 text-center">
            <Loader2 className="w-8 h-8 text-purple-400 mx-auto animate-spin mb-2" />
            <p className="text-gray-400 text-sm">Loading leaderboard...</p>
          </div>
        ) : !leaderboard || leaderboard.length === 0 ? (
          <div className="p-8 text-center">
            <Trophy className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">No players yet</p>
            <p className="text-sm text-gray-500 mt-1">
              Be the first to compete
            </p>
          </div>
        ) : (
          leaderboard.map((player) => (
            <div
              key={player.wallet}
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
                      {player.wallet.slice(0, 4)}...{player.wallet.slice(-4)}
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
                      player.totalRedistributed >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {player.totalRedistributed >= 0 ? '+' : ''}{player.totalRedistributed.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer Stats */}
      {leaderboard && leaderboard.length > 0 && (
        <div className="p-4 bg-white/5 border-t border-white/10">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-xs text-gray-400">Total Players</p>
              <p className="text-sm font-semibold text-white mt-1">
                {leaderboard.length}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Avg Score</p>
              <p className="text-sm font-semibold text-white mt-1">
                {Math.round(
                  leaderboard.reduce((sum, p) => sum + p.score, 0) / leaderboard.length
                ).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Total P&L</p>
              <p className={`text-sm font-semibold mt-1 ${
                leaderboard.reduce((sum, p) => sum + p.totalRedistributed, 0) >= 0 
                  ? 'text-green-400' 
                  : 'text-red-400'
              }`}>
                {leaderboard.reduce((sum, p) => sum + p.totalRedistributed, 0) >= 0 ? '+' : ''}
                {leaderboard.reduce((sum, p) => sum + p.totalRedistributed, 0).toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      )}
    </GlassPanel>
  );
}

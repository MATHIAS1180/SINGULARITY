'use client';

import { Trophy, Crown, Medal, Loader2, TrendingUp, Users, DollarSign, Target } from 'lucide-react';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { useLeaderboard } from '@/lib/hooks';

export default function LeaderboardPage() {
  const { data: leaderboard, isLoading } = useLeaderboard(100);

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-5 h-5 text-yellow-400" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-300" />;
    if (rank === 3) return <Medal className="w-5 h-5 text-amber-600" />;
    return null;
  };

  const totalPlayers = leaderboard?.length || 0;
  const activePlayers = leaderboard?.filter(p => p.participatingInCycle).length || 0;
  const totalVolume = leaderboard?.reduce((sum, p) => sum + p.balance, 0) || 0;
  const avgScore = totalPlayers > 0 ? leaderboard!.reduce((sum, p) => sum + p.score, 0) / totalPlayers : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-3">
            <Trophy className="w-8 h-8 text-yellow-400" />
            <h1 className="text-4xl font-bold text-white">Leaderboard</h1>
          </div>
          <p className="text-gray-400">Top players ranked by cumulative score</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <GlassPanel className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Total Players</p>
                <p className="text-xl font-bold text-white">{totalPlayers}</p>
              </div>
            </div>
          </GlassPanel>
          <GlassPanel className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Active Now</p>
                <p className="text-xl font-bold text-white">{activePlayers}</p>
              </div>
            </div>
          </GlassPanel>
          <GlassPanel className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Total Volume</p>
                <p className="text-xl font-bold text-white">{totalVolume.toFixed(2)} SOL</p>
              </div>
            </div>
          </GlassPanel>
          <GlassPanel className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                <Target className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Avg Score</p>
                <p className="text-xl font-bold text-white">{Math.round(avgScore).toLocaleString()}</p>
              </div>
            </div>
          </GlassPanel>
        </div>
        <GlassPanel>
          <div className="p-6 border-b border-white/10">
            <h2 className="text-xl font-semibold text-white">Rankings</h2>
          </div>
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="p-12 text-center">
                <Loader2 className="w-12 h-12 text-purple-400 mx-auto animate-spin mb-4" />
                <p className="text-gray-400">Loading leaderboard...</p>
              </div>
            ) : !leaderboard || leaderboard.length === 0 ? (
              <div className="p-12 text-center">
                <Trophy className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-xl text-gray-400 mb-2">No players yet</p>
                <p className="text-sm text-gray-500">Be the first to register and compete</p>
              </div>
            ) : (
              <div className="p-6">
                <p className="text-white">Leaderboard with {leaderboard.length} players</p>
              </div>
            )}
          </div>
        </GlassPanel>
      </div>
    </div>
  );
}

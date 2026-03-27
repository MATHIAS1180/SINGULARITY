'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  Trophy, 
  Target, 
  Clock, 
  Activity,
  Copy,
  ExternalLink,
  Award
} from 'lucide-react';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { StatCard } from '@/components/ui/StatCard';
import { RankBadge } from '@/components/ui/RankBadge';

export default function ProfilePage() {
  const { connected, publicKey } = useWallet();

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
              Connect your wallet to view your profile and stats.
            </p>
          </div>
          <WalletMultiButton className="!bg-gradient-to-r !from-purple-600 !to-blue-600 hover:!from-purple-500 hover:!to-blue-500 !rounded-xl !font-semibold !px-8 !py-3" />
        </GlassPanel>
      </div>
    );
  }

  const walletAddress = publicKey?.toString() || '';
  const shortAddress = `${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)}`;

  const copyAddress = () => {
    navigator.clipboard.writeText(walletAddress);
  };

  const openExplorer = () => {
    window.open(`https://explorer.solana.com/address/${walletAddress}?cluster=devnet`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-white">Player Profile</h1>
          <p className="text-gray-400 mt-1">Your arena statistics and achievements</p>
        </div>
        <WalletMultiButton className="!bg-white/5 hover:!bg-white/10 !border !border-white/10 !rounded-xl" />
      </div>

      {/* Identity Card */}
      <GlassPanel className="p-8">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          {/* Avatar */}
          <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center flex-shrink-0">
            <Wallet className="w-12 h-12 text-white" />
          </div>

          {/* Info */}
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-white">{shortAddress}</h2>
              <RankBadge rank={0} />
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={copyAddress}
                className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm transition-all"
              >
                <Copy className="w-3.5 h-3.5" />
                Copy Address
              </button>
              <button
                onClick={openExplorer}
                className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm transition-all"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                View on Explorer
              </button>
            </div>

            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-400" />
                <span className="text-gray-400">Joined:</span>
                <span className="text-white font-medium">—</span>
              </div>
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-gray-400" />
                <span className="text-gray-400">Last Active:</span>
                <span className="text-white font-medium">—</span>
              </div>
            </div>
          </div>
        </div>
      </GlassPanel>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Balance"
          value="0 SOL"
          icon={<Wallet className="w-5 h-5" />}
          subtitle="Current holdings"
        />
        <StatCard
          label="Total P&L"
          value="+0 SOL"
          icon={<TrendingUp className="w-5 h-5" />}
          trend="+0%"
          trendUp={true}
        />
        <StatCard
          label="Cycles Played"
          value="0"
          icon={<Target className="w-5 h-5" />}
          subtitle="Total participation"
        />
        <StatCard
          label="Win Rate"
          value="0%"
          icon={<Trophy className="w-5 h-5" />}
          subtitle="Profitable cycles"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Performance */}
        <div className="lg:col-span-2 space-y-6">
          {/* Performance Overview */}
          <GlassPanel className="p-6">
            <h3 className="text-xl font-semibold text-white mb-6">Performance Overview</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <p className="text-sm text-gray-400">Total Deposited</p>
                <p className="text-2xl font-bold text-white">0 SOL</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-400">Total Withdrawn</p>
                <p className="text-2xl font-bold text-white">0 SOL</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-400">Best Cycle</p>
                <p className="text-2xl font-bold text-green-400">+0 SOL</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-400">Worst Cycle</p>
                <p className="text-2xl font-bold text-red-400">-0 SOL</p>
              </div>
            </div>
          </GlassPanel>

          {/* Recent Activity */}
          <GlassPanel className="p-6">
            <h3 className="text-xl font-semibold text-white mb-6">Recent Activity</h3>
            <div className="space-y-3">
              {/* Empty state */}
              <div className="text-center py-12">
                <Activity className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400">No activity yet</p>
                <p className="text-sm text-gray-500 mt-1">
                  Your deposits, withdrawals, and cycle results will appear here
                </p>
              </div>
            </div>
          </GlassPanel>

          {/* Cycle History */}
          <GlassPanel className="p-6">
            <h3 className="text-xl font-semibold text-white mb-6">Cycle History</h3>
            <div className="space-y-3">
              {/* Empty state */}
              <div className="text-center py-12">
                <Target className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400">No cycles played yet</p>
                <p className="text-sm text-gray-500 mt-1">
                  Set your exposure and join a cycle to start competing
                </p>
              </div>
            </div>
          </GlassPanel>
        </div>

        {/* Right Column - Achievements & Rank */}
        <div className="space-y-6">
          {/* Rank Card */}
          <GlassPanel className="p-6">
            <h3 className="text-xl font-semibold text-white mb-6">Arena Rank</h3>
            <div className="text-center space-y-4">
              <div className="w-32 h-32 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto">
                <Trophy className="w-16 h-16 text-white" />
              </div>
              <div>
                <p className="text-4xl font-bold text-white">—</p>
                <p className="text-sm text-gray-400 mt-1">Global Rank</p>
              </div>
              <div className="pt-4 border-t border-white/10">
                <p className="text-sm text-gray-400">Score</p>
                <p className="text-2xl font-bold text-white mt-1">0</p>
              </div>
            </div>
          </GlassPanel>

          {/* Achievements */}
          <GlassPanel className="p-6">
            <h3 className="text-xl font-semibold text-white mb-6">Achievements</h3>
            <div className="space-y-3">
              {/* Achievement badges - locked state */}
              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg opacity-50">
                <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center">
                  <Award className="w-6 h-6 text-gray-500" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-400">First Cycle</p>
                  <p className="text-xs text-gray-500">Complete your first cycle</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg opacity-50">
                <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-gray-500" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-400">First Win</p>
                  <p className="text-xs text-gray-500">Win your first cycle</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg opacity-50">
                <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-gray-500" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-400">Top 10</p>
                  <p className="text-xs text-gray-500">Reach top 10 leaderboard</p>
                </div>
              </div>
            </div>
          </GlassPanel>

          {/* Stats Summary */}
          <GlassPanel className="p-6">
            <h3 className="text-xl font-semibold text-white mb-6">Quick Stats</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Avg Exposure</span>
                <span className="text-sm font-medium text-white">0%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Avg Cycle Gain</span>
                <span className="text-sm font-medium text-green-400">+0 SOL</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Total Fees Paid</span>
                <span className="text-sm font-medium text-white">0 SOL</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Days Active</span>
                <span className="text-sm font-medium text-white">0</span>
              </div>
            </div>
          </GlassPanel>
        </div>
      </div>
    </div>
  );
}
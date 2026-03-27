import Link from 'next/link';
import { ArrowRight, Users, TrendingUp, Shield, Zap } from 'lucide-react';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { StatCard } from '@/components/ui/StatCard';
import { LiveTicker } from '@/components/ui/LiveTicker';

export default function HomePage() {
  return (
    <div className="space-y-16 py-8">
      {/* Hero Section */}
      <section className="text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
            Swarm Arena
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto">
            100% on-chain P2P competition. Set your exposure, compete with the swarm, earn rewards.
          </p>
        </div>

        {/* Live Status */}
        <div className="flex justify-center">
          <GlassPanel className="inline-flex items-center gap-3 px-6 py-3">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium text-gray-200">Live on Solana Devnet</span>
          </GlassPanel>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link href="/dashboard">
            <button className="group px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 rounded-xl font-semibold text-lg transition-all duration-200 flex items-center gap-2 shadow-lg shadow-purple-500/50">
              Enter Arena
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </Link>
          <Link href="/leaderboard">
            <button className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-semibold text-lg transition-all duration-200">
              View Leaderboard
            </button>
          </Link>
        </div>
      </section>

      {/* Live Stats */}
      <section>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard
            label="Total Value Locked"
            value="0 SOL"
            icon={<TrendingUp className="w-5 h-5" />}
            trend="+0%"
          />
          <StatCard
            label="Active Players"
            value="0"
            icon={<Users className="w-5 h-5" />}
          />
          <StatCard
            label="Current Cycle"
            value="#1"
            icon={<Zap className="w-5 h-5" />}
          />
          <StatCard
            label="Protocol Fees"
            value="2%"
            icon={<Shield className="w-5 h-5" />}
          />
        </div>
      </section>

      {/* Live Activity Ticker */}
      <section>
        <LiveTicker />
      </section>

      {/* How It Works */}
      <section className="space-y-8">
        <h2 className="text-4xl font-bold text-center bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
          How It Works
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <GlassPanel className="p-8 space-y-4 hover:border-purple-500/50 transition-colors">
            <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
              <span className="text-2xl font-bold text-purple-400">1</span>
            </div>
            <h3 className="text-xl font-semibold text-white">Deposit & Set Exposure</h3>
            <p className="text-gray-400">
              Deposit SOL and choose your exposure level (0-100%). Higher exposure = higher risk & reward.
            </p>
          </GlassPanel>

          <GlassPanel className="p-8 space-y-4 hover:border-blue-500/50 transition-colors">
            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
              <span className="text-2xl font-bold text-blue-400">2</span>
            </div>
            <h3 className="text-xl font-semibold text-white">Compete in Cycles</h3>
            <p className="text-gray-400">
              Each cycle redistributes value based on exposure and pool dynamics. No house, pure P2P.
            </p>
          </GlassPanel>

          <GlassPanel className="p-8 space-y-4 hover:border-pink-500/50 transition-colors">
            <div className="w-12 h-12 bg-pink-500/20 rounded-xl flex items-center justify-center">
              <span className="text-2xl font-bold text-pink-400">3</span>
            </div>
            <h3 className="text-xl font-semibold text-white">Earn or Learn</h3>
            <p className="text-gray-400">
              Win by strategic exposure management. Withdraw anytime when not exposed. Build your score.
            </p>
          </GlassPanel>
        </div>
      </section>

      {/* Key Features */}
      <section className="space-y-8">
        <h2 className="text-4xl font-bold text-center bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
          Built Different
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <GlassPanel className="p-6 space-y-3">
            <Shield className="w-8 h-8 text-purple-400" />
            <h3 className="text-lg font-semibold text-white">100% On-Chain</h3>
            <p className="text-gray-400 text-sm">
              Every action, every calculation happens on Solana. Fully transparent and verifiable.
            </p>
          </GlassPanel>

          <GlassPanel className="p-6 space-y-3">
            <Users className="w-8 h-8 text-blue-400" />
            <h3 className="text-lg font-semibold text-white">Pure P2P</h3>
            <p className="text-gray-400 text-sm">
              No house edge. Players compete against each other in a closed redistribution system.
            </p>
          </GlassPanel>

          <GlassPanel className="p-6 space-y-3">
            <TrendingUp className="w-8 h-8 text-pink-400" />
            <h3 className="text-lg font-semibold text-white">Strategic Depth</h3>
            <p className="text-gray-400 text-sm">
              Manage exposure, timing, and risk. Anti-whale mechanics ensure fair competition.
            </p>
          </GlassPanel>

          <GlassPanel className="p-6 space-y-3">
            <Zap className="w-8 h-8 text-green-400" />
            <h3 className="text-lg font-semibold text-white">Real-Time Cycles</h3>
            <p className="text-gray-400 text-sm">
              Fast cycles, instant resolution. Watch the arena evolve in real-time.
            </p>
          </GlassPanel>
        </div>
      </section>

      {/* Final CTA */}
      <section className="text-center space-y-6">
        <GlassPanel className="p-12 max-w-3xl mx-auto space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            Ready to compete?
          </h2>
          <p className="text-gray-300 text-lg">
            Connect your wallet and enter the arena. No signup, no KYC, just pure on-chain competition.
          </p>
          <Link href="/dashboard">
            <button className="group px-10 py-5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 rounded-xl font-bold text-xl transition-all duration-200 flex items-center gap-3 mx-auto shadow-2xl shadow-purple-500/50">
              Launch App
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </button>
          </Link>
        </GlassPanel>
      </section>
    </div>
  );
}
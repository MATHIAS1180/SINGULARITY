'use client';

import { useState } from 'react';
import { 
  Activity,
  TrendingUp,
  ArrowDownCircle,
  ArrowUpCircle,
  Target,
  Zap,
  Trophy,
  Clock,
  Filter,
  Loader2,
  DollarSign
} from 'lucide-react';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { StatCard } from '@/components/ui/StatCard';
import { useActivityFeed, ActivityEventType } from '@/lib/hooks/useActivityFeed';
import { useGameState } from '@/lib/hooks';

type FilterType = 'all' | ActivityEventType;

export default function ActivityPage() {
  const [filter, setFilter] = useState<FilterType>('all');
  const events = useActivityFeed(100);
  const { data: gameState } = useGameState();

  const getEventIcon = (type: ActivityEventType) => {
    switch (type) {
      case 'deposit':
        return <ArrowDownCircle className="w-5 h-5 text-green-400" />;
      case 'withdrawal':
        return <ArrowUpCircle className="w-5 h-5 text-red-400" />;
      case 'exposure':
        return <Target className="w-5 h-5 text-purple-400" />;
      case 'cycle':
        return <Zap className="w-5 h-5 text-blue-400" />;
      case 'reward':
        return <Trophy className="w-5 h-5 text-yellow-400" />;
      case 'loss':
        return <TrendingUp className="w-5 h-5 text-red-400 rotate-180" />;
      case 'fee':
        return <DollarSign className="w-5 h-5 text-purple-400" />;
      default:
        return <Activity className="w-5 h-5 text-gray-400" />;
    }
  };

  const getEventColor = (type: ActivityEventType) => {
    switch (type) {
      case 'deposit':
        return 'border-green-500/30 bg-green-500/5';
      case 'withdrawal':
        return 'border-red-500/30 bg-red-500/5';
      case 'exposure':
        return 'border-purple-500/30 bg-purple-500/5';
      case 'cycle':
        return 'border-blue-500/30 bg-blue-500/5';
      case 'reward':
        return 'border-yellow-500/30 bg-yellow-500/5';
      case 'loss':
        return 'border-red-500/30 bg-red-500/5';
      case 'fee':
        return 'border-purple-500/30 bg-purple-500/5';
      default:
        return 'border-white/10';
    }
  };

  const getEventTitle = (event: typeof events[0]) => {
    const shortWallet = event.player === 'System' || event.player === 'Protocol' 
      ? event.player 
      : `${event.player.slice(0, 4)}...${event.player.slice(-4)}`;

    switch (event.type) {
      case 'deposit':
        return `${shortWallet} deposited ${event.amount?.toFixed(4)} SOL`;
      case 'withdrawal':
        return `${shortWallet} withdrew ${event.amount?.toFixed(4)} SOL`;
      case 'exposure':
        return `${shortWallet} set exposure to ${event.exposure}%`;
      case 'cycle':
        return `Cycle #${event.cycleNumber} resolved - ${event.amount?.toFixed(4)} SOL redistributed`;
      case 'reward':
        return `${shortWallet} earned ${event.amount?.toFixed(4)} SOL in cycle #${event.cycleNumber}`;
      case 'loss':
        return `${shortWallet} lost ${event.amount?.toFixed(4)} SOL in cycle #${event.cycleNumber}`;
      case 'fee':
        return `Protocol collected ${event.amount?.toFixed(4)} SOL in fees from cycle #${event.cycleNumber}`;
      default:
        return 'Unknown event';
    }
  };

  const getTimeAgo = (date: Date) => {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  const filteredEvents = filter === 'all' 
    ? events 
    : events.filter(e => e.type === filter);

  // Calculate stats
  const last24h = events.filter(e => Date.now() - e.timestamp.getTime() < 24 * 60 * 60 * 1000);
  const eventsToday = last24h.length;
  const volumeToday = last24h
    .filter(e => e.type === 'deposit' || e.type === 'withdrawal')
    .reduce((sum, e) => sum + (e.amount || 0), 0);
  const uniquePlayers = new Set(last24h.filter(e => e.player !== 'System' && e.player !== 'Protocol').map(e => e.player)).size;
  const cyclesToday = last24h.filter(e => e.type === 'cycle').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
          Live Activity
        </h1>
        <p className="text-gray-400 text-lg">
          Real-time events from the Swarm Arena
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          label="Events Today"
          value={eventsToday.toString()}
          icon={<Activity className="w-5 h-5" />}
        />
        <StatCard
          label="Volume 24h"
          value={`${volumeToday.toFixed(2)} SOL`}
          icon={<TrendingUp className="w-5 h-5" />}
        />
        <StatCard
          label="Active Players"
          value={uniquePlayers.toString()}
          icon={<Target className="w-5 h-5" />}
        />
        <StatCard
          label="Cycles Today"
          value={cyclesToday.toString()}
          icon={<Zap className="w-5 h-5" />}
        />
      </div>

      {/* Filters */}
      <GlassPanel className="p-6">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <span className="text-sm font-medium text-gray-400">Filter by type:</span>
          </div>
          
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filter === 'all'
                  ? 'bg-purple-600 text-white'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('deposit')}
              className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                filter === 'deposit'
                  ? 'bg-green-600 text-white'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              <ArrowDownCircle className="w-4 h-4" />
              Deposits
            </button>
            <button
              onClick={() => setFilter('withdrawal')}
              className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                filter === 'withdrawal'
                  ? 'bg-red-600 text-white'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              <ArrowUpCircle className="w-4 h-4" />
              Withdrawals
            </button>
            <button
              onClick={() => setFilter('exposure')}
              className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                filter === 'exposure'
                  ? 'bg-purple-600 text-white'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              <Target className="w-4 h-4" />
              Exposure
            </button>
            <button
              onClick={() => setFilter('cycle')}
              className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                filter === 'cycle'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              <Zap className="w-4 h-4" />
              Cycles
            </button>
            <button
              onClick={() => setFilter('reward')}
              className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                filter === 'reward'
                  ? 'bg-yellow-600 text-white'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              <Trophy className="w-4 h-4" />
              Rewards
            </button>
          </div>
        </div>
      </GlassPanel>

      {/* Activity Feed */}
      <div className="space-y-3">
        {filteredEvents.length === 0 ? (
          <GlassPanel className="p-12 text-center">
            <Activity className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">No activity yet</p>
            <p className="text-sm text-gray-500 mt-1">
              Events will appear here as they happen on-chain
            </p>
          </GlassPanel>
        ) : (
          filteredEvents.map((event) => (
            <GlassPanel
              key={event.id}
              className={`p-4 hover:border-opacity-100 transition-all cursor-pointer ${getEventColor(event.type)}`}
            >
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center flex-shrink-0">
                  {getEventIcon(event.type)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <p className="text-white font-medium">
                        {getEventTitle(event)}
                      </p>
                      <div className="flex items-center gap-3 mt-2 text-sm text-gray-400">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{getTimeAgo(event.timestamp)}</span>
                        </div>
                        {event.slot && (
                          <span className="text-xs">Slot {event.slot}</span>
                        )}
                      </div>
                    </div>

                    {/* Amount/Value Badge */}
                    {event.amount && (
                      <div className={`px-3 py-1 rounded-lg font-semibold text-sm ${
                        event.type === 'deposit' || event.type === 'reward'
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {event.type === 'deposit' || event.type === 'reward' ? '+' : '-'}
                        {event.amount.toFixed(4)} SOL
                      </div>
                    )}
                    {event.exposure !== undefined && (
                      <div className="px-3 py-1 rounded-lg font-semibold text-sm bg-purple-500/20 text-purple-400">
                        {event.exposure}%
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </GlassPanel>
          ))
        )}
      </div>

      {/* Info */}
      {events.length > 0 && (
        <div className="text-center text-sm text-gray-500">
          Showing {filteredEvents.length} of {events.length} events
        </div>
      )}
    </div>
  );
}

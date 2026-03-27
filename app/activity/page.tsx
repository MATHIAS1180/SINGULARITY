'use client';

import { useState } from 'react';
import { 
  Activity,
  TrendingUp,
  TrendingDown,
  ArrowDownCircle,
  ArrowUpCircle,
  Target,
  Zap,
  Trophy,
  Clock,
  Filter
} from 'lucide-react';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { StatCard } from '@/components/ui/StatCard';

type EventType = 'all' | 'deposit' | 'withdrawal' | 'exposure' | 'cycle' | 'reward';

interface ActivityEvent {
  id: string;
  type: EventType;
  player: string;
  amount?: number;
  exposure?: number;
  cycle?: number;
  timestamp: Date;
  signature: string;
}

export default function ActivityPage() {
  const [filter, setFilter] = useState<EventType>('all');

  // Mock data - replace with real data from API
  const mockEvents: ActivityEvent[] = [
    {
      id: '1',
      type: 'deposit',
      player: 'ABC...XYZ',
      amount: 10.5,
      timestamp: new Date(Date.now() - 2 * 60 * 1000),
      signature: 'sig1...',
    },
    {
      id: '2',
      type: 'exposure',
      player: 'DEF...UVW',
      exposure: 75,
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      signature: 'sig2...',
    },
    {
      id: '3',
      type: 'cycle',
      cycle: 42,
      player: 'System',
      timestamp: new Date(Date.now() - 10 * 60 * 1000),
      signature: 'sig3...',
    },
    {
      id: '4',
      type: 'reward',
      player: 'GHI...RST',
      amount: 5.2,
      cycle: 42,
      timestamp: new Date(Date.now() - 12 * 60 * 1000),
      signature: 'sig4...',
    },
    {
      id: '5',
      type: 'withdrawal',
      player: 'JKL...OPQ',
      amount: 8.3,
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      signature: 'sig5...',
    },
  ];

  const getEventIcon = (type: EventType) => {
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
      default:
        return <Activity className="w-5 h-5 text-gray-400" />;
    }
  };

  const getEventColor = (type: EventType) => {
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
      default:
        return 'border-white/10';
    }
  };

  const getEventTitle = (event: ActivityEvent) => {
    switch (event.type) {
      case 'deposit':
        return `${event.player} deposited ${event.amount} SOL`;
      case 'withdrawal':
        return `${event.player} withdrew ${event.amount} SOL`;
      case 'exposure':
        return `${event.player} set exposure to ${event.exposure}%`;
      case 'cycle':
        return `Cycle #${event.cycle} resolved`;
      case 'reward':
        return `${event.player} earned ${event.amount} SOL in cycle #${event.cycle}`;
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
    ? mockEvents 
    : mockEvents.filter(e => e.type === filter);

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
          value="0"
          icon={<Activity className="w-5 h-5" />}
          trend="+0%"
        />
        <StatCard
          label="Volume 24h"
          value="0 SOL"
          icon={<TrendingUp className="w-5 h-5" />}
          trend="+0%"
        />
        <StatCard
          label="Active Players"
          value="0"
          icon={<Target className="w-5 h-5" />}
        />
        <StatCard
          label="Cycles Today"
          value="0"
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
              Events will appear here as they happen
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
                        <button
                          onClick={() => window.open(`https://explorer.solana.com/tx/${event.signature}?cluster=devnet`, '_blank')}
                          className="hover:text-purple-400 transition-colors flex items-center gap-1"
                        >
                          <span className="truncate max-w-[100px]">{event.signature}</span>
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </button>
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
                        {event.amount} SOL
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

      {/* Load More */}
      {filteredEvents.length > 0 && (
        <div className="text-center">
          <button className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-medium transition-all">
            Load More
          </button>
        </div>
      )}
    </div>
  );
}
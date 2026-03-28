'use client';

import { 
  ArrowDownCircle, 
  ArrowUpCircle, 
  Target, 
  Zap, 
  Trophy,
  TrendingDown,
  DollarSign
} from 'lucide-react';
import { GlassPanel } from './GlassPanel';
import { useActivityFeed, ActivityEvent } from '@/lib/hooks/useActivityFeed';

interface LiveTickerProps {
  maxEvents?: number;
  className?: string;
}

export function LiveTicker({ 
  maxEvents = 10,
  className = '' 
}: LiveTickerProps) {
  const events = useActivityFeed(maxEvents);

  const getEventIcon = (type: ActivityEvent['type']) => {
    switch (type) {
      case 'deposit':
        return <ArrowDownCircle className="w-4 h-4 text-green-400" />;
      case 'withdrawal':
        return <ArrowUpCircle className="w-4 h-4 text-red-400" />;
      case 'exposure':
        return <Target className="w-4 h-4 text-purple-400" />;
      case 'cycle':
        return <Zap className="w-4 h-4 text-blue-400" />;
      case 'reward':
        return <Trophy className="w-4 h-4 text-yellow-400" />;
      case 'loss':
        return <TrendingDown className="w-4 h-4 text-red-400" />;
      case 'fee':
        return <DollarSign className="w-4 h-4 text-purple-400" />;
      default:
        return null;
    }
  };

  const getEventText = (event: ActivityEvent) => {
    const shortWallet = event.player === 'System' || event.player === 'Protocol'
      ? event.player
      : `${event.player.slice(0, 4)}...${event.player.slice(-4)}`;

    switch (event.type) {
      case 'deposit':
        return (
          <>
            <span className="font-medium text-white">{shortWallet}</span>
            <span className="text-gray-400"> deposited </span>
            <span className="font-semibold text-green-400">+{event.amount?.toFixed(2)} SOL</span>
          </>
        );
      case 'withdrawal':
        return (
          <>
            <span className="font-medium text-white">{shortWallet}</span>
            <span className="text-gray-400"> withdrew </span>
            <span className="font-semibold text-red-400">-{event.amount?.toFixed(2)} SOL</span>
          </>
        );
      case 'exposure':
        return (
          <>
            <span className="font-medium text-white">{shortWallet}</span>
            <span className="text-gray-400"> set exposure to </span>
            <span className="font-semibold text-purple-400">{event.exposure}%</span>
          </>
        );
      case 'cycle':
        return (
          <>
            <span className="font-semibold text-blue-400">Cycle #{event.cycleNumber}</span>
            <span className="text-gray-400"> resolved</span>
          </>
        );
      case 'reward':
        return (
          <>
            <span className="font-medium text-white">{shortWallet}</span>
            <span className="text-gray-400"> won </span>
            <span className="font-semibold text-yellow-400">+{event.amount?.toFixed(2)} SOL</span>
          </>
        );
      case 'loss':
        return (
          <>
            <span className="font-medium text-white">{shortWallet}</span>
            <span className="text-gray-400"> lost </span>
            <span className="font-semibold text-red-400">-{event.amount?.toFixed(2)} SOL</span>
          </>
        );
      case 'fee':
        return (
          <>
            <span className="font-semibold text-purple-400">Protocol</span>
            <span className="text-gray-400"> collected </span>
            <span className="font-semibold text-purple-400">{event.amount?.toFixed(2)} SOL</span>
          </>
        );
      default:
        return null;
    }
  };

  const getTimeAgo = (date: Date) => {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    return `${Math.floor(seconds / 3600)}h ago`;
  };

  return (
    <GlassPanel className={`p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          Live Activity
        </h3>
        <span className="text-xs text-gray-500">{events.length} events</span>
      </div>

      <div className="space-y-2 max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        {events.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 text-sm">Waiting for on-chain activity...</p>
          </div>
        ) : (
          events.map((event, index) => (
            <div
              key={event.id}
              className="flex items-start gap-3 p-3 bg-white/5 hover:bg-white/10 rounded-lg transition-all duration-200 animate-fade-in"
              style={{
                animationDelay: `${index * 50}ms`,
              }}
            >
              {/* Icon */}
              <div className="flex-shrink-0 mt-0.5">
                {getEventIcon(event.type)}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="text-sm leading-relaxed">
                  {getEventText(event)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {getTimeAgo(event.timestamp)}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </GlassPanel>
  );
}

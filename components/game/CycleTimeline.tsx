'use client';

import { useState, useEffect } from 'react';
import { Clock, CheckCircle, Circle, Zap, Users, TrendingUp } from 'lucide-react';

interface Cycle {
  number: number;
  status: 'completed' | 'active' | 'upcoming';
  startSlot: number;
  endSlot: number;
  participants?: number;
  totalRedistributed?: number;
  feesCollected?: number;
}

export function CycleTimeline() {
  const [currentSlot, setCurrentSlot] = useState(0);

  // Mock data - replace with real data from API
  const cycles: Cycle[] = [
    {
      number: 1,
      status: 'completed',
      startSlot: 0,
      endSlot: 100,
      participants: 12,
      totalRedistributed: 45.2,
      feesCollected: 0.9,
    },
    {
      number: 2,
      status: 'completed',
      startSlot: 100,
      endSlot: 200,
      participants: 18,
      totalRedistributed: 67.8,
      feesCollected: 1.4,
    },
    {
      number: 3,
      status: 'active',
      startSlot: 200,
      endSlot: 300,
      participants: 24,
    },
    {
      number: 4,
      status: 'upcoming',
      startSlot: 300,
      endSlot: 400,
    },
  ];

  const activeCycle = cycles.find(c => c.status === 'active');
  const progress = activeCycle 
    ? ((currentSlot - activeCycle.startSlot) / (activeCycle.endSlot - activeCycle.startSlot)) * 100
    : 0;

  // Simulate slot progression
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlot(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: Cycle['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'active':
        return <Zap className="w-5 h-5 text-blue-400 animate-pulse" />;
      case 'upcoming':
        return <Circle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: Cycle['status']) => {
    switch (status) {
      case 'completed':
        return 'border-green-500/30 bg-green-500/5';
      case 'active':
        return 'border-blue-500/50 bg-blue-500/10';
      case 'upcoming':
        return 'border-white/10 bg-white/5';
    }
  };

  return (
    <div className="space-y-6">
      {/* Active Cycle Progress */}
      {activeCycle && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-blue-400" />
              <span className="text-sm font-medium text-white">
                Cycle #{activeCycle.number} in Progress
              </span>
            </div>
            <span className="text-sm font-bold text-blue-400">
              {Math.round(progress)}%
            </span>
          </div>

          {/* Progress Bar */}
          <div className="relative h-3 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-1000"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>

          {/* Time Info */}
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>Slot {activeCycle.startSlot}</span>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>Current: {currentSlot}</span>
            </div>
            <span>Slot {activeCycle.endSlot}</span>
          </div>

          {/* Active Cycle Stats */}
          {activeCycle.participants && (
            <div className="grid grid-cols-3 gap-3 pt-3 border-t border-white/10">
              <div className="text-center">
                <p className="text-xs text-gray-500">Participants</p>
                <p className="text-lg font-bold text-white">{activeCycle.participants}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500">Duration</p>
                <p className="text-lg font-bold text-white">
                  {activeCycle.endSlot - activeCycle.startSlot} slots
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500">Status</p>
                <p className="text-lg font-bold text-blue-400">Active</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Cycles List */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-400">Recent Cycles</h4>
        
        <div className="space-y-2">
          {cycles.map((cycle) => (
            <div
              key={cycle.number}
              className={`p-4 border rounded-lg transition-all ${getStatusColor(cycle.status)} ${
                cycle.status === 'active' ? 'ring-2 ring-blue-500/30' : ''
              }`}
            >
              <div className="flex items-start justify-between">
                {/* Left - Cycle Info */}
                <div className="flex items-start gap-3">
                  {getStatusIcon(cycle.status)}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">
                        Cycle #{cycle.number}
                      </span>
                      {cycle.status === 'active' && (
                        <span className="px-2 py-0.5 bg-blue-500/20 border border-blue-500/30 rounded text-xs font-medium text-blue-400">
                          Live
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400">
                      Slots {cycle.startSlot} → {cycle.endSlot}
                    </p>
                  </div>
                </div>

                {/* Right - Stats */}
                {cycle.status === 'completed' && (
                  <div className="text-right space-y-1">
                    <div className="flex items-center gap-1 justify-end">
                      <Users className="w-3 h-3 text-gray-400" />
                      <span className="text-xs text-gray-400">{cycle.participants}</span>
                    </div>
                    <div className="flex items-center gap-1 justify-end">
                      <TrendingUp className="w-3 h-3 text-green-400" />
                      <span className="text-xs font-medium text-green-400">
                        {cycle.totalRedistributed?.toFixed(1)} SOL
                      </span>
                    </div>
                  </div>
                )}

                {cycle.status === 'active' && cycle.participants && (
                  <div className="text-right">
                    <p className="text-xs text-gray-400">Participants</p>
                    <p className="text-lg font-bold text-white">{cycle.participants}</p>
                  </div>
                )}

                {cycle.status === 'upcoming' && (
                  <div className="text-right">
                    <span className="text-xs text-gray-500">Upcoming</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Timeline Visualization */}
      <div className="relative pt-4 border-t border-white/10">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-gray-400">Timeline</span>
          <span className="text-xs text-gray-500">Last 4 cycles</span>
        </div>
        
        <div className="flex items-center gap-2">
          {cycles.map((cycle, index) => (
            <div key={cycle.number} className="flex-1">
              <div
                className={`h-2 rounded-full transition-all ${
                  cycle.status === 'completed'
                    ? 'bg-green-500'
                    : cycle.status === 'active'
                    ? 'bg-blue-500 animate-pulse'
                    : 'bg-gray-700'
                }`}
              />
              <p className="text-xs text-gray-500 text-center mt-1">#{cycle.number}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
'use client';

import { useState, useEffect } from 'react';
import { useAnchorProgram } from '../anchor';

export type ActivityEventType = 'deposit' | 'withdrawal' | 'exposure' | 'cycle' | 'reward' | 'loss' | 'fee';

export interface ActivityEvent {
  id: string;
  type: ActivityEventType;
  player: string;
  amount?: number;
  timestamp: Date;
  cycleNumber?: number;
  exposure?: number;
  slot?: number;
}

/**
 * Hook to listen to on-chain events and build activity feed
 */
export function useActivityFeed(limit: number = 50) {
  const program = useAnchorProgram();
  const [events, setEvents] = useState<ActivityEvent[]>([]);

  useEffect(() => {
    if (!program) return;

    const listeners: number[] = [];

    // Listen to DepositMade events
    const depositListener = program.addEventListener('DepositMade', (event, slot) => {
      setEvents(prev => [{
        id: `deposit-${slot}-${event.player.toString()}`,
        type: 'deposit',
        player: event.player.toString(),
        amount: event.amount.toNumber() / 1e9,
        timestamp: new Date(event.timestamp.toNumber() * 1000),
        slot,
      }, ...prev].slice(0, limit));
    });
    listeners.push(depositListener);

    // Listen to WithdrawMade events
    const withdrawListener = program.addEventListener('WithdrawMade', (event, slot) => {
      setEvents(prev => [{
        id: `withdraw-${slot}-${event.player.toString()}`,
        type: 'withdrawal',
        player: event.player.toString(),
        amount: event.amount.toNumber() / 1e9,
        timestamp: new Date(event.timestamp.toNumber() * 1000),
        slot,
      }, ...prev].slice(0, limit));
    });
    listeners.push(withdrawListener);

    // Listen to ExposureUpdated events
    const exposureListener = program.addEventListener('ExposureUpdated', (event, slot) => {
      setEvents(prev => [{
        id: `exposure-${slot}-${event.player.toString()}`,
        type: 'exposure',
        player: event.player.toString(),
        exposure: event.newExposure,
        amount: event.exposedValue.toNumber() / 1e9,
        timestamp: new Date(event.timestamp.toNumber() * 1000),
        slot,
      }, ...prev].slice(0, limit));
    });
    listeners.push(exposureListener);

    // Listen to CycleResolved events
    const cycleListener = program.addEventListener('CycleResolved', (event, slot) => {
      setEvents(prev => [{
        id: `cycle-${slot}-${event.cycleNumber.toString()}`,
        type: 'cycle',
        player: 'System',
        cycleNumber: event.cycleNumber.toNumber(),
        amount: event.totalRedistributed.toNumber() / 1e9,
        timestamp: new Date(event.timestamp.toNumber() * 1000),
        slot,
      }, ...prev].slice(0, limit));
    });
    listeners.push(cycleListener);

    // Listen to RewardDistributed events
    const rewardListener = program.addEventListener('RewardDistributed', (event, slot) => {
      const amount = event.redistributionAmount.toNumber() / 1e9;
      setEvents(prev => [{
        id: `reward-${slot}-${event.player.toString()}`,
        type: amount >= 0 ? 'reward' : 'loss',
        player: event.player.toString(),
        amount: Math.abs(amount),
        cycleNumber: event.cycleNumber.toNumber(),
        timestamp: new Date(event.timestamp.toNumber() * 1000),
        slot,
      }, ...prev].slice(0, limit));
    });
    listeners.push(rewardListener);

    // Listen to FeeCollected events
    const feeListener = program.addEventListener('FeeCollected', (event, slot) => {
      setEvents(prev => [{
        id: `fee-${slot}-${event.cycleNumber.toString()}`,
        type: 'fee',
        player: 'Protocol',
        amount: event.amount.toNumber() / 1e9,
        cycleNumber: event.cycleNumber.toNumber(),
        timestamp: new Date(event.timestamp.toNumber() * 1000),
        slot,
      }, ...prev].slice(0, limit));
    });
    listeners.push(feeListener);

    // Cleanup listeners on unmount
    return () => {
      listeners.forEach(id => {
        try {
          program.removeEventListener(id);
        } catch (error) {
          console.warn('Failed to remove event listener:', error);
        }
      });
    };
  }, [program, limit]);

  return events;
}

'use client';

import { useState } from 'react';
import { ArrowDownCircle, ArrowUpCircle, Loader2 } from 'lucide-react';
import { GlassPanel } from '../ui/GlassPanel';
import { ExposureSlider } from '../ui/ExposureSlider';
import { useDeposit, useWithdraw, useSetExposure, usePlayerState, useRegisterPlayer } from '@/lib/hooks';
import { useWallet } from '@solana/wallet-adapter-react';

export function PlayerActions() {
  const { connected } = useWallet();
  const { data: playerState } = usePlayerState();
  const registerMutation = useRegisterPlayer();
  const depositMutation = useDeposit();
  const withdrawMutation = useWithdraw();
  const setExposureMutation = useSetExposure();

  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [exposure, setExposure] = useState(playerState?.exposure || 0);

  const handleRegister = async () => {
    try {
      await registerMutation.mutateAsync();
      alert('✅ Player registered! Refreshing data...');
    } catch (error) {
      console.error('Registration failed:', error);
      alert('❌ Registration failed: ' + (error as Error).message);
    }
  };

  const handleDeposit = async () => {
    const amount = parseFloat(depositAmount);
    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    try {
      await depositMutation.mutateAsync(amount);
      setDepositAmount('');
      alert('✅ Deposit successful! Refreshing data...');
    } catch (error) {
      console.error('Deposit failed:', error);
      alert('❌ Deposit failed: ' + (error as Error).message);
    }
  };

  const handleWithdraw = async () => {
    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    try {
      await withdrawMutation.mutateAsync(amount);
      setWithdrawAmount('');
      alert('✅ Withdrawal successful! Refreshing data...');
    } catch (error) {
      console.error('Withdrawal failed:', error);
      alert('❌ Withdrawal failed: ' + (error as Error).message);
    }
  };

  const handleSetExposure = async () => {
    try {
      await setExposureMutation.mutateAsync(exposure);
      alert('✅ Exposure updated! Refreshing data...');
    } catch (error) {
      console.error('Set exposure failed:', error);
      alert('❌ Set exposure failed: ' + (error as Error).message);
    }
  };

  if (!connected) {
    return (
      <GlassPanel className="p-6 text-center">
        <p className="text-gray-400">Connect wallet to interact</p>
      </GlassPanel>
    );
  }

  if (!playerState) {
    return (
      <GlassPanel className="p-6 space-y-4">
        <h3 className="text-lg font-semibold text-white">Register to Play</h3>
        <p className="text-sm text-gray-400">
          You need to register before you can deposit and play.
        </p>
        
        <button
          onClick={handleRegister}
          disabled={registerMutation.isPending}
          className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {registerMutation.isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Registering...
            </>
          ) : (
            'Register Player'
          )}
        </button>
      </GlassPanel>
    );
  }

  const canWithdraw = playerState.exposure === 0;

  return (
    <div className="space-y-6">
      {/* Deposit */}
      <GlassPanel className="p-6 space-y-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <ArrowDownCircle className="w-5 h-5 text-green-400" />
          Deposit SOL
        </h3>
        <input
          type="number"
          value={depositAmount}
          onChange={(e) => setDepositAmount(e.target.value)}
          placeholder="Amount (SOL)"
          step="0.01"
          min="0"
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
        />
        <button
          onClick={handleDeposit}
          disabled={depositMutation.isPending || !depositAmount}
          className="w-full px-4 py-3 bg-green-600 hover:bg-green-500 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {depositMutation.isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Depositing...
            </>
          ) : (
            'Deposit'
          )}
        </button>
      </GlassPanel>

      {/* Withdraw */}
      <GlassPanel className="p-6 space-y-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <ArrowUpCircle className="w-5 h-5 text-red-400" />
          Withdraw SOL
        </h3>
        <input
          type="number"
          value={withdrawAmount}
          onChange={(e) => setWithdrawAmount(e.target.value)}
          placeholder="Amount (SOL)"
          step="0.01"
          min="0"
          disabled={!canWithdraw}
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
        />
        {!canWithdraw && (
          <p className="text-xs text-red-400">
            Set exposure to 0% before withdrawing
          </p>
        )}
        <button
          onClick={handleWithdraw}
          disabled={withdrawMutation.isPending || !withdrawAmount || !canWithdraw}
          className="w-full px-4 py-3 bg-red-600 hover:bg-red-500 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {withdrawMutation.isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Withdrawing...
            </>
          ) : (
            'Withdraw'
          )}
        </button>
      </GlassPanel>

      {/* Set Exposure */}
      <GlassPanel className="p-6 space-y-4">
        <h3 className="text-lg font-semibold text-white">Set Exposure</h3>
        <ExposureSlider
          value={exposure}
          onChange={setExposure}
          pending={setExposureMutation.isPending}
        />
        <button
          onClick={handleSetExposure}
          disabled={setExposureMutation.isPending || exposure === playerState.exposure}
          className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {setExposureMutation.isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Updating...
            </>
          ) : (
            'Update Exposure'
          )}
        </button>
      </GlassPanel>
    </div>
  );
}

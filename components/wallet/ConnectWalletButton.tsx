'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Wallet, LogOut, Copy, Check } from 'lucide-react';
import { useState } from 'react';

interface ConnectWalletButtonProps {
  className?: string;
  variant?: 'default' | 'compact';
}

export function ConnectWalletButton({ 
  className = '',
  variant = 'default' 
}: ConnectWalletButtonProps) {
  const { publicKey, disconnect, connected } = useWallet();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (publicKey) {
      await navigator.clipboard.writeText(publicKey.toString());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDisconnect = () => {
    disconnect();
  };

  const shortAddress = publicKey 
    ? `${publicKey.toString().slice(0, 4)}...${publicKey.toString().slice(-4)}`
    : '';

  // If not connected, show connect button
  if (!connected) {
    return (
      <WalletMultiButton 
        className={`
          !bg-gradient-to-r !from-purple-600 !to-blue-600 
          hover:!from-purple-500 hover:!to-blue-500 
          !rounded-xl !font-semibold !px-6 !py-3
          !transition-all !duration-200
          !shadow-lg !shadow-purple-500/50
          ${className}
        `}
      />
    );
  }

  // Compact variant - just address and disconnect
  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg">
          <span className="text-sm font-medium text-white">{shortAddress}</span>
        </div>
        <button
          onClick={handleDisconnect}
          className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-all"
          title="Disconnect"
        >
          <LogOut className="w-4 h-4 text-gray-400" />
        </button>
      </div>
    );
  }

  // Default variant - full featured
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Address display */}
      <div className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg">
        <Wallet className="w-4 h-4 text-purple-400" />
        <span className="text-sm font-medium text-white">{shortAddress}</span>
        
        {/* Copy button */}
        <button
          onClick={handleCopy}
          className="p-1 hover:bg-white/10 rounded transition-all"
          title="Copy address"
        >
          {copied ? (
            <Check className="w-3.5 h-3.5 text-green-400" />
          ) : (
            <Copy className="w-3.5 h-3.5 text-gray-400 hover:text-white" />
          )}
        </button>
      </div>

      {/* Disconnect button */}
      <button
        onClick={handleDisconnect}
        className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-lg transition-all flex items-center gap-2"
        title="Disconnect wallet"
      >
        <LogOut className="w-4 h-4 text-red-400" />
        <span className="text-sm font-medium text-red-400">Disconnect</span>
      </button>
    </div>
  );
}
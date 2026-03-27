'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { useConnection } from '@solana/wallet-adapter-react';
import { Wallet, Wifi, WifiOff, Loader2 } from 'lucide-react';
import { GlassPanel } from '../ui/GlassPanel';

interface WalletStatusProps {
  showNetwork?: boolean;
  showAddress?: boolean;
  pending?: boolean;
  className?: string;
}

export function WalletStatus({ 
  showNetwork = true,
  showAddress = true,
  pending = false,
  className = '' 
}: WalletStatusProps) {
  const { connected, publicKey, connecting } = useWallet();
  const { connection } = useConnection();

  const shortAddress = publicKey 
    ? `${publicKey.toString().slice(0, 4)}...${publicKey.toString().slice(-4)}`
    : '';

  // Get network name from endpoint
  const getNetworkName = () => {
    const endpoint = connection.rpcEndpoint;
    if (endpoint.includes('devnet')) return 'Devnet';
    if (endpoint.includes('testnet')) return 'Testnet';
    if (endpoint.includes('mainnet')) return 'Mainnet';
    if (endpoint.includes('localhost')) return 'Localnet';
    return 'Unknown';
  };

  const networkName = getNetworkName();

  return (
    <GlassPanel className={`inline-flex items-center gap-3 px-4 py-2 ${className}`}>
      {/* Connection Status */}
      <div className="flex items-center gap-2">
        {connecting || pending ? (
          <>
            <Loader2 className="w-4 h-4 text-yellow-400 animate-spin" />
            <span className="text-sm font-medium text-yellow-400">Connecting...</span>
          </>
        ) : connected ? (
          <>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium text-green-400">Connected</span>
          </>
        ) : (
          <>
            <div className="w-2 h-2 bg-gray-500 rounded-full" />
            <span className="text-sm font-medium text-gray-400">Disconnected</span>
          </>
        )}
      </div>

      {/* Divider */}
      {(showNetwork || showAddress) && (
        <div className="w-px h-4 bg-white/10" />
      )}

      {/* Network */}
      {showNetwork && (
        <div className="flex items-center gap-2">
          {connected ? (
            <Wifi className="w-4 h-4 text-blue-400" />
          ) : (
            <WifiOff className="w-4 h-4 text-gray-500" />
          )}
          <span className="text-sm text-gray-400">{networkName}</span>
        </div>
      )}

      {/* Address */}
      {showAddress && connected && publicKey && (
        <>
          <div className="w-px h-4 bg-white/10" />
          <div className="flex items-center gap-2">
            <Wallet className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-medium text-white">{shortAddress}</span>
          </div>
        </>
      )}
    </GlassPanel>
  );
}
'use client';

import { Crown, Medal, Trophy } from 'lucide-react';

interface RankBadgeProps {
  rank: number;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

export function RankBadge({ 
  rank, 
  size = 'md',
  showIcon = true,
  className = '' 
}: RankBadgeProps) {
  // Get rank tier styling
  const getRankStyle = () => {
    if (rank === 1) {
      return {
        bg: 'bg-gradient-to-r from-yellow-500 to-yellow-600',
        border: 'border-yellow-500/50',
        text: 'text-yellow-900',
        icon: <Crown className={getIconSize()} />,
        label: '1st',
      };
    }
    
    if (rank === 2) {
      return {
        bg: 'bg-gradient-to-r from-gray-300 to-gray-400',
        border: 'border-gray-300/50',
        text: 'text-gray-900',
        icon: <Medal className={getIconSize()} />,
        label: '2nd',
      };
    }
    
    if (rank === 3) {
      return {
        bg: 'bg-gradient-to-r from-amber-600 to-amber-700',
        border: 'border-amber-600/50',
        text: 'text-amber-900',
        icon: <Medal className={getIconSize()} />,
        label: '3rd',
      };
    }
    
    if (rank <= 10) {
      return {
        bg: 'bg-gradient-to-r from-purple-600 to-purple-700',
        border: 'border-purple-500/50',
        text: 'text-white',
        icon: <Trophy className={getIconSize()} />,
        label: `#${rank}`,
      };
    }
    
    if (rank <= 100) {
      return {
        bg: 'bg-gradient-to-r from-blue-600 to-blue-700',
        border: 'border-blue-500/50',
        text: 'text-white',
        icon: null,
        label: `#${rank}`,
      };
    }
    
    // Default for rank > 100
    return {
      bg: 'bg-white/10',
      border: 'border-white/20',
      text: 'text-gray-300',
      icon: null,
      label: rank === 0 ? 'Unranked' : `#${rank}`,
    };
  };

  const getIconSize = () => {
    switch (size) {
      case 'sm':
        return 'w-3 h-3';
      case 'lg':
        return 'w-5 h-5';
      default:
        return 'w-4 h-4';
    }
  };

  const getPadding = () => {
    switch (size) {
      case 'sm':
        return 'px-2 py-1';
      case 'lg':
        return 'px-4 py-2';
      default:
        return 'px-3 py-1.5';
    }
  };

  const getTextSize = () => {
    switch (size) {
      case 'sm':
        return 'text-xs';
      case 'lg':
        return 'text-base';
      default:
        return 'text-sm';
    }
  };

  const style = getRankStyle();

  return (
    <div
      className={`inline-flex items-center gap-1.5 ${getPadding()} ${style.bg} ${style.text} border ${style.border} rounded-lg font-bold ${getTextSize()} shadow-lg ${className}`}
    >
      {showIcon && style.icon}
      <span>{style.label}</span>
    </div>
  );
}
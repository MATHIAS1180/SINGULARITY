'use client';

import { ReactNode } from 'react';

interface GlassPanelProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'subtle' | 'strong';
  hover?: boolean;
}

export function GlassPanel({ 
  children, 
  className = '',
  variant = 'default',
  hover = false,
}: GlassPanelProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'subtle':
        return 'bg-white/5 border-white/5 backdrop-blur-sm';
      case 'strong':
        return 'bg-white/10 border-white/20 backdrop-blur-md';
      default:
        return 'bg-white/5 border-white/10 backdrop-blur-md';
    }
  };

  const hoverStyles = hover 
    ? 'hover:bg-white/10 hover:border-white/20 transition-all duration-200' 
    : '';

  return (
    <div 
      className={`
        ${getVariantStyles()}
        ${hoverStyles}
        border rounded-xl
        ${className}
      `.trim()}
    >
      {children}
    </div>
  );
}
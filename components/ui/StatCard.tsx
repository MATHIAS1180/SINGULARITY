'use client';

import { ReactNode } from 'react';
import { TrendingUp, TrendingDown, Loader2 } from 'lucide-react';
import { GlassPanel } from './GlassPanel';

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: ReactNode;
  trend?: string;
  trendUp?: boolean;
  subtitle?: string;
  loading?: boolean;
  className?: string;
}

export function StatCard({
  label,
  value,
  icon,
  trend,
  trendUp,
  subtitle,
  loading = false,
  className = '',
}: StatCardProps) {
  return (
    <GlassPanel className={`p-6 hover:border-purple-500/30 transition-all ${className}`}>
      <div className="flex items-start justify-between">
        {/* Left side - Label and Value */}
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-400 mb-2">{label}</p>
          
          {loading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="w-5 h-5 text-purple-400 animate-spin" />
              <span className="text-gray-500">Loading...</span>
            </div>
          ) : (
            <>
              <p className="text-2xl md:text-3xl font-bold text-white truncate">
                {value}
              </p>
              
              {/* Trend or Subtitle */}
              {trend && (
                <div className="flex items-center gap-1 mt-2">
                  {trendUp !== undefined && (
                    trendUp ? (
                      <TrendingUp className="w-4 h-4 text-green-400" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-400" />
                    )
                  )}
                  <span className={`text-sm font-medium ${
                    trendUp === undefined 
                      ? 'text-gray-400'
                      : trendUp 
                      ? 'text-green-400' 
                      : 'text-red-400'
                  }`}>
                    {trend}
                  </span>
                </div>
              )}
              
              {subtitle && !trend && (
                <p className="text-sm text-gray-500 mt-2">{subtitle}</p>
              )}
            </>
          )}
        </div>

        {/* Right side - Icon */}
        {icon && (
          <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center flex-shrink-0 ml-4">
            {icon}
          </div>
        )}
      </div>
    </GlassPanel>
  );
}
'use client';

import { useState, useEffect } from 'react';
import { AlertCircle, Loader2, Target } from 'lucide-react';

interface ExposureSliderProps {
  value?: number;
  onChange?: (value: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
  pending?: boolean;
  error?: string;
  className?: string;
}

export function ExposureSlider({
  value: controlledValue,
  onChange,
  min = 0,
  max = 100,
  disabled = false,
  pending = false,
  error,
  className = '',
}: ExposureSliderProps) {
  const [internalValue, setInternalValue] = useState(controlledValue ?? 0);
  const value = controlledValue ?? internalValue;

  useEffect(() => {
    if (controlledValue !== undefined) {
      setInternalValue(controlledValue);
    }
  }, [controlledValue]);

  const handleChange = (newValue: number) => {
    setInternalValue(newValue);
    onChange?.(newValue);
  };

  const getRiskLevel = (exposure: number) => {
    if (exposure === 0) return { label: 'No Risk', color: 'text-gray-400' };
    if (exposure < 25) return { label: 'Low Risk', color: 'text-green-400' };
    if (exposure < 50) return { label: 'Medium Risk', color: 'text-yellow-400' };
    if (exposure < 75) return { label: 'High Risk', color: 'text-orange-400' };
    return { label: 'Maximum Risk', color: 'text-red-400' };
  };

  const getGradientColor = (exposure: number) => {
    if (exposure === 0) return 'from-gray-500 to-gray-600';
    if (exposure < 25) return 'from-green-500 to-green-600';
    if (exposure < 50) return 'from-yellow-500 to-yellow-600';
    if (exposure < 75) return 'from-orange-500 to-orange-600';
    return 'from-red-500 to-red-600';
  };

  const riskLevel = getRiskLevel(value);
  const gradientColor = getGradientColor(value);
  const isDisabled = disabled || pending;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Value Display */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className={`w-5 h-5 ${riskLevel.color}`} />
          <span className="text-sm font-medium text-gray-400">Exposure</span>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-sm font-medium ${riskLevel.color}`}>
            {riskLevel.label}
          </span>
          <div className={`text-3xl font-bold bg-gradient-to-r ${gradientColor} bg-clip-text text-transparent`}>
            {value}%
          </div>
        </div>
      </div>

      {/* Slider */}
      <div className="relative">
        {/* Track */}
        <div className="h-3 bg-white/5 rounded-full overflow-hidden">
          {/* Progress */}
          <div
            className={`h-full bg-gradient-to-r ${gradientColor} transition-all duration-200 ${
              isDisabled ? 'opacity-50' : ''
            }`}
            style={{ width: `${value}%` }}
          />
        </div>

        {/* Input */}
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => handleChange(Number(e.target.value))}
          disabled={isDisabled}
          className="absolute inset-0 w-full h-3 opacity-0 cursor-pointer disabled:cursor-not-allowed"
        />

        {/* Thumb */}
        <div
          className={`absolute top-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-full shadow-lg transition-all duration-200 ${
            isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-grab active:cursor-grabbing hover:scale-110'
          }`}
          style={{ left: `calc(${value}% - 12px)` }}
        >
          {pending && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="w-4 h-4 text-purple-600 animate-spin" />
            </div>
          )}
        </div>
      </div>

      {/* Quick Select Buttons */}
      <div className="grid grid-cols-5 gap-2">
        {[0, 25, 50, 75, 100].map((preset) => (
          <button
            key={preset}
            onClick={() => !isDisabled && handleChange(preset)}
            disabled={isDisabled}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              value === preset
                ? 'bg-purple-600 text-white'
                : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {preset}%
          </button>
        ))}
      </div>

      {/* Info/Error Message */}
      {error ? (
        <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
          <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-400">{error}</p>
        </div>
      ) : (
        <div className="flex items-start gap-2 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <div className="w-4 h-4 flex-shrink-0 mt-0.5">
            <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-sm text-blue-400">
            {value === 0
              ? 'Set exposure above 0% to participate in the next cycle'
              : `You're risking ${value}% of your balance. Higher exposure = higher potential rewards.`}
          </p>
        </div>
      )}

      {/* Exposure Breakdown */}
      {value > 0 && (
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
          <div>
            <p className="text-xs text-gray-500">Exposed Value</p>
            <p className="text-lg font-semibold text-white mt-1">— SOL</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Safe Balance</p>
            <p className="text-lg font-semibold text-white mt-1">— SOL</p>
          </div>
        </div>
      )}
    </div>
  );
}
'use client';

import { useEffect } from 'react';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'loading';
  onClose: () => void;
  duration?: number;
}

export function Toast({ message, type, onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    if (type !== 'loading' && duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [type, duration, onClose]);

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-green-400" />,
    error: <XCircle className="w-5 h-5 text-red-400" />,
    loading: <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />,
  };

  const colors = {
    success: 'bg-green-500/10 border-green-500/50',
    error: 'bg-red-500/10 border-red-500/50',
    loading: 'bg-blue-500/10 border-blue-500/50',
  };

  return (
    <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-lg border backdrop-blur-xl ${colors[type]} animate-in slide-in-from-top-2`}>
      {icons[type]}
      <span className="text-sm font-medium text-white">{message}</span>
    </div>
  );
}

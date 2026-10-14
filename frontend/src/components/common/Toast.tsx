import React, { useEffect } from 'react';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

export interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  onClose: () => void;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  type = 'success',
  onClose,
  duration = 5000,
}) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-md w-auto animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div
        className={`flex items-center gap-3.5 px-5 py-4 rounded-2xl shadow-2xl border backdrop-blur-md transition-all ${
          type === 'success'
            ? 'bg-slate-900/95 border-emerald-500/50 text-white'
            : type === 'error'
            ? 'bg-slate-900/95 border-rose-500/50 text-white'
            : 'bg-slate-900/95 border-blue-500/50 text-white'
        }`}
      >
        <div className="shrink-0">
          {type === 'success' && (
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          )}
          {type === 'error' && (
            <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
          )}
          {type === 'info' && (
            <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
              <Info className="w-5 h-5" />
            </div>
          )}
        </div>

        <div className="flex-1 pr-2">
          <p className="text-xs font-semibold leading-relaxed">{message}</p>
        </div>

        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10 shrink-0"
          aria-label="Închide notificare"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

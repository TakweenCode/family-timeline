import React from 'react';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

interface ToastProps {
  message: string | null;
  type?: 'success' | 'error' | 'info';
}

export const Toast: React.FC<ToastProps> = ({ message, type = 'info' }) => {
  if (!message) return null;

  const icons = {
    success: <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />,
    error: <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />,
    info: <Info className="w-4 h-4 text-teal-400 shrink-0" />,
  };

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-[calc(84px+env(safe-area-inset-bottom,0px))] left-1/2 -translate-x-1/2 z-50 max-w-[90vw] px-4 py-2.5 rounded-2xl bg-stone-900/95 text-white dark:bg-stone-100 dark:text-stone-900 shadow-xl shadow-black/20 flex items-center gap-2 text-sm font-medium animate-in fade-in slide-in-from-bottom-2 duration-200 pointer-events-none border border-stone-800 dark:border-stone-200"
    >
      {icons[type]}
      <span className="truncate">{message}</span>
    </div>
  );
};

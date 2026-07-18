'use client';

import { useEffect } from 'react';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'warning';
  onClose: () => void;
}

export default function CustomToast({ message, type, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColors = {
    success: 'bg-emerald-600 border-emerald-500 text-white',
    error: 'bg-red-600 border-red-500 text-white',
    warning: 'bg-amber-500 border-amber-400 text-white',
  };

  return (
    <div className={`fixed top-4 right-4 z-[9999] flex items-center w-full max-w-sm p-4 rounded-xl border shadow-lg transition-all duration-300 animate-in fade-in slide-in-from-top-5 ${bgColors[type]}`}>
      <div className="flex items-center gap-3 w-full">
        <span className="text-xl">
          {type === 'success' && '✅'}
          {type === 'error' && '❌'}
          {type === 'warning' && '⚠️'}
        </span>
        <div className="text-sm font-medium flex-1">{message}</div>
        <button 
          onClick={onClose} 
          className="ml-auto text-white/80 hover:text-white text-lg font-bold focus:outline-none"
        >
          ×
        </button>
      </div>
    </div>
  );
}
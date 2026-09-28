import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function Toast({ toast, onClose }) {
  if (!toast) return null;

  const isSuccess = toast.type === 'success';
  const isError = toast.type === 'error';

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-md w-full animate-bounce-in shadow-2xl rounded-xl overflow-hidden border border-slate-700/20">
      <div className={`p-4 flex items-start gap-3 backdrop-blur-md text-white ${
        isSuccess ? 'bg-emerald-600' : isError ? 'bg-rose-600' : 'bg-slate-800'
      }`}>
        <div className="mt-0.5 flex-shrink-0">
          {isSuccess && <CheckCircle2 className="w-5 h-5" />}
          {isError && <AlertCircle className="w-5 h-5" />}
          {!isSuccess && !isError && <Info className="w-5 h-5 text-indigo-300" />}
        </div>
        <div className="flex-1 text-sm font-medium">
          {toast.message}
        </div>
        <button 
          onClick={onClose}
          className="text-white/80 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

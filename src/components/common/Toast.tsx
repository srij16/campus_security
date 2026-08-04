import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const Toast: React.FC = () => {
  const { toastMessage, clearToast } = useApp();

  if (!toastMessage) return null;

  const getIcon = () => {
    switch (toastMessage.type) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />;
      default:
        return <Info className="w-5 h-5 text-sky-400 shrink-0" />;
    }
  };

  const getBorder = () => {
    switch (toastMessage.type) {
      case 'success':
        return 'border-emerald-500/40 bg-[#0c181c]/95 shadow-[0_10px_30px_-10px_rgba(16,185,129,0.3)]';
      case 'warning':
        return 'border-amber-500/40 bg-[#1f170b]/95 shadow-[0_10px_30px_-10px_rgba(245,158,11,0.3)]';
      default:
        return 'border-sky-500/40 bg-[#0d1627]/95 shadow-[0_10px_30px_-10px_rgba(56,189,248,0.3)]';
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-md w-full animate-bounce-in">
      <div className={`p-4 rounded-xl border backdrop-blur-xl transition-all duration-300 flex items-start gap-3.5 ${getBorder()}`}>
        {getIcon()}
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-white truncate">{toastMessage.title}</h4>
          <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">{toastMessage.message}</p>
        </div>
        <button 
          onClick={clearToast}
          className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

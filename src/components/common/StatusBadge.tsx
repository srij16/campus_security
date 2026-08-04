import React from 'react';
import { Status } from '../../types';
import { Clock, UserCheck, Wrench, CheckCircle2 } from 'lucide-react';

interface StatusBadgeProps {
  status: Status;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ 
  status, 
  size = 'md',
  showIcon = true 
}) => {
  const getStyle = () => {
    switch (status) {
      case 'Reported':
        return {
          bg: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
          dot: 'bg-sky-400 shadow-[0_0_8px_#38bdf8]',
          icon: Clock
        };
      case 'Assigned':
        return {
          bg: 'bg-purple-500/10 text-purple-300 border-purple-500/30',
          dot: 'bg-purple-400 shadow-[0_0_8px_#a855f7]',
          icon: UserCheck
        };
      case 'In Progress':
        return {
          bg: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
          dot: 'bg-amber-400 animate-pulse shadow-[0_0_8px_#f59e0b]',
          icon: Wrench
        };
      case 'Resolved':
        return {
          bg: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
          dot: 'bg-emerald-400 shadow-[0_0_8px_#10b981]',
          icon: CheckCircle2
        };
      default:
        return {
          bg: 'bg-slate-500/10 text-slate-300 border-slate-500/30',
          dot: 'bg-slate-400',
          icon: Clock
        };
    }
  };

  const { bg, dot, icon: Icon } = getStyle();

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs font-medium gap-1.5',
    md: 'px-2.5 py-1 text-xs font-semibold gap-1.5',
    lg: 'px-3.5 py-1.5 text-sm font-semibold gap-2',
  }[size];

  return (
    <span className={`inline-flex items-center rounded-full border backdrop-blur-md ${bg} ${sizeClasses}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      {showIcon && <Icon className={size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5'} />}
      <span>{status}</span>
    </span>
  );
};

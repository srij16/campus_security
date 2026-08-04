import React from 'react';
import { Priority } from '../../types';
import { AlertOctagon, AlertTriangle, AlertCircle, Info } from 'lucide-react';

interface PriorityBadgeProps {
  priority: Priority;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ 
  priority, 
  size = 'md',
  showIcon = true 
}) => {
  const getStyle = () => {
    switch (priority) {
      case 'Critical':
        return {
          bg: 'bg-rose-500/15 text-rose-300 border-rose-500/40 shadow-[0_0_12px_rgba(244,63,94,0.25)]',
          dot: 'bg-rose-500 animate-ping',
          icon: AlertOctagon
        };
      case 'High':
        return {
          bg: 'bg-orange-500/15 text-orange-300 border-orange-500/40 shadow-[0_0_10px_rgba(249,115,22,0.2)]',
          dot: 'bg-orange-400',
          icon: AlertTriangle
        };
      case 'Medium':
        return {
          bg: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
          dot: 'bg-amber-400',
          icon: AlertCircle
        };
      case 'Low':
        return {
          bg: 'bg-slate-500/15 text-slate-300 border-slate-500/30',
          dot: 'bg-slate-400',
          icon: Info
        };
      default:
        return {
          bg: 'bg-slate-500/15 text-slate-300 border-slate-500/30',
          dot: 'bg-slate-400',
          icon: Info
        };
    }
  };

  const { bg, dot, icon: Icon } = getStyle();

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs font-medium gap-1',
    md: 'px-2.5 py-0.5 text-xs font-semibold gap-1.5',
    lg: 'px-3 py-1 text-sm font-semibold gap-2',
  }[size];

  return (
    <span className={`inline-flex items-center rounded-md border backdrop-blur-sm ${bg} ${sizeClasses}`}>
      {priority === 'Critical' ? (
        <span className="relative flex h-2 w-2">
          <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${dot}`} />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
        </span>
      ) : (
        <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      )}
      {showIcon && <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />}
      <span>{priority}</span>
    </span>
  );
};

import React from 'react';
import { REQUEST_STATUS_LABELS } from '../../const.ts';
import { cn } from '../../lib/utils.ts';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
  const meta = REQUEST_STATUS_LABELS[status] || {
    label: status,
    color: 'text-slate-300',
    bg: 'bg-slate-800 border-slate-700',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border whitespace-nowrap',
        meta.bg,
        meta.color,
        className
      )}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {meta.label}
    </span>
  );
};

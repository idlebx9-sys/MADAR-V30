import React from 'react';
import { LucideIcon, Inbox } from 'lucide-react';
import { Button } from './Button.tsx';

export interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  actionText?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = Inbox,
  title,
  description,
  actionText,
  actionLabel,
  onAction,
  className = '',
}) => {
  const label = actionLabel || actionText;

  return (
    <div
      className={`p-10 rounded-2xl bg-[#11182B]/60 border border-white/5 text-center flex flex-col items-center justify-center space-y-4 ${className}`}
    >
      <div className="w-14 h-14 rounded-2xl bg-[#151C32] border border-white/5 flex items-center justify-center text-[#94A3B8] shadow-inner">
        <Icon className="w-7 h-7 stroke-[1.5]" />
      </div>
      <div className="max-w-md space-y-1.5">
        <h3 className="text-sm font-bold text-[#F8FAFC] font-heading">{title}</h3>
        {description && (
          <p className="text-xs text-[#94A3B8] leading-relaxed max-w-sm mx-auto">{description}</p>
        )}
      </div>
      {label && onAction && (
        <Button variant="primary" size="sm" onClick={onAction} className="mt-2">
          {label}
        </Button>
      )}
    </div>
  );
};

import React from 'react';
import { Card } from '../ui/Card.tsx';
import { cn } from '../../lib/utils.ts';
import { type LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    positive: boolean;
  };
  color?: 'violet' | 'cyan' | 'gold' | 'emerald' | 'rose';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  color = 'violet',
}) => {
  const colorStyles = {
    violet: 'border-[#6C3CE1]/30 text-[#A78BFA] bg-[#6C3CE1]/10',
    cyan: 'border-[#00D4FF]/30 text-[#00D4FF] bg-[#00D4FF]/10',
    gold: 'border-[#FBBF24]/30 text-[#FBBF24] bg-[#FBBF24]/10',
    emerald: 'border-[#22C55E]/30 text-[#22C55E] bg-[#22C55E]/10',
    rose: 'border-[#EF4444]/30 text-[#EF4444] bg-[#EF4444]/10',
  };

  return (
    <Card className="p-5 relative overflow-hidden text-right border-white/5 hover:border-white/15 transition-colors">
      <div className="flex items-start justify-between">
        <div
          className={cn(
            'w-11 h-11 rounded-xl flex items-center justify-center border',
            colorStyles[color]
          )}
        >
          <Icon className="w-5 h-5" />
        </div>

        {trend && (
          <span
            className={cn(
              'text-[11px] font-semibold px-2 py-0.5 rounded-full border',
              trend.positive
                ? 'bg-[#22C55E]/15 text-[#22C55E] border-[#22C55E]/30'
                : 'bg-[#EF4444]/15 text-[#EF4444] border-[#EF4444]/30'
            )}
          >
            {trend.value}
          </span>
        )}
      </div>

      <div className="mt-3.5">
        <span className="text-xs text-[#94A3B8] font-medium block">{title}</span>
        <div className="text-2xl font-bold font-heading text-white mt-1">{value}</div>
        {subtitle && <p className="text-[11px] text-[#64748B] mt-0.5">{subtitle}</p>}
      </div>
    </Card>
  );
};

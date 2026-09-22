import React from 'react';
import { cn } from '../../lib/utils.ts';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  glass?: boolean;
  elevated?: boolean;
}

export const Card: React.FC<CardProps> = ({
  className,
  glass = false,
  elevated = false,
  children,
  ...props
}) => {
  return (
    <div
      className={cn(
        'rounded-2xl border transition-all duration-200 text-[#F8FAFC]',
        glass
          ? 'bg-[#11182B]/80 backdrop-blur-xl border-white/10 shadow-xl'
          : elevated
          ? 'bg-[#18213A] border-white/10 shadow-2xl'
          : 'bg-[#11182B] border-white/5 shadow-lg',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => (
  <div className={cn('flex flex-col space-y-1.5 pb-4 border-b border-white/5', className)} {...props} />
);

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({ className, ...props }) => (
  <h3 className={cn('text-base font-bold text-[#F8FAFC] font-heading', className)} {...props} />
);

export const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({
  className,
  ...props
}) => <p className={cn('text-xs text-[#94A3B8] leading-relaxed', className)} {...props} />;

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => (
  <div className={cn('pt-4', className)} {...props} />
);

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'secondary' | 'violet' | 'gold' | 'emerald' | 'default' | 'outline' | 'danger' | 'info' | 'cyan';
}

export const Badge: React.FC<BadgeProps> = ({ className, variant = 'default', children, ...props }) => {
  const variants = {
    default: 'bg-[#151C32] text-[#94A3B8] border-white/10',
    secondary: 'bg-[#18213A] text-[#CBD5E1] border-white/10',
    primary: 'bg-[#6C3CE1]/15 text-[#A78BFA] border-[#6C3CE1]/30',
    violet: 'bg-[#6C3CE1]/15 text-[#A78BFA] border-[#6C3CE1]/30',
    cyan: 'bg-[#00D4FF]/15 text-[#00D4FF] border-[#00D4FF]/30',
    gold: 'bg-[#FBBF24]/15 text-[#FBBF24] border-[#FBBF24]/30',
    emerald: 'bg-[#22C55E]/15 text-[#22C55E] border-[#22C55E]/30',
    outline: 'border border-white/15 text-[#F8FAFC]',
    danger: 'bg-[#EF4444]/15 text-[#EF4444] border-[#EF4444]/30',
    info: 'bg-[#00D4FF]/15 text-[#00D4FF] border-[#00D4FF]/30',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border whitespace-nowrap',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};

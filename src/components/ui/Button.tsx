import React from 'react';
import { cn } from '../../lib/utils.ts';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'gold' | 'emerald' | 'cyan';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, children, disabled, ...props }, ref) => {
    const base =
      'inline-flex items-center justify-center font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer rounded-xl active:scale-[0.98] select-none';

    const variants = {
      primary:
        'bg-[#E4D2B8] hover:bg-[#F0DFCA] text-[#070F1B] font-bold shadow-md shadow-[#E4D2B8]/20 focus-visible:ring-[#E4D2B8]',
      champagne:
        'bg-[#E4D2B8] hover:bg-[#F0DFCA] text-[#070F1B] font-bold shadow-md shadow-[#E4D2B8]/20 focus-visible:ring-[#E4D2B8]',
      gold: 'bg-gradient-to-r from-[#F0DFCA] to-[#D8C3A5] text-[#070F1B] font-bold shadow-md shadow-[#D8C3A5]/20 hover:brightness-105',
      cyan: 'bg-[#E4D2B8]/20 hover:bg-[#E4D2B8]/30 text-[#E4D2B8] border border-[#E4D2B8]/40 font-semibold',
      emerald:
        'bg-[#22C55E] hover:bg-[#16A34A] text-white font-medium shadow-md shadow-[#22C55E]/20 focus-visible:ring-[#22C55E]',
      secondary:
        'bg-[#0B1422] hover:bg-[#0E1B2E] text-[#F7F3EE] border border-white/10 hover:border-white/20',
      outline:
        'border border-[#E4D2B8]/30 text-[#E4D2B8] hover:bg-[#E4D2B8]/10 hover:border-[#E4D2B8]/50 focus-visible:ring-[#E4D2B8]',
      ghost: 'text-[#9DA7B5] hover:text-[#F7F3EE] hover:bg-white/5',
      danger: 'bg-[#EF4444] hover:bg-[#DC2626] text-white shadow-md shadow-[#EF4444]/20',
    };

    const sizes = {
      sm: 'text-xs px-3.5 py-1.5 gap-1.5 h-8',
      md: 'text-sm px-4 py-2 gap-2 h-10',
      lg: 'text-sm sm:text-base px-6 py-2.5 gap-2.5 h-12',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(base, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading && (
          <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin ml-1" />
        )}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';

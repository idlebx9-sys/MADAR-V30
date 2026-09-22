import React from 'react';
import { cn } from '../../lib/utils.ts';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, id, ...props }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).substring(2, 9)}`;
    return (
      <div className="w-full text-right">
        <input
          id={inputId}
          ref={ref}
          className={cn(
            'flex h-10 w-full rounded-xl bg-[#151C32] border border-white/10 px-3.5 py-2 text-xs sm:text-sm text-[#F8FAFC] placeholder:text-[#64748B] focus:outline-none focus:border-[#6C3CE1] focus:ring-2 focus:ring-[#6C3CE1]/20 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed text-right',
            error && 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20',
            className
          )}
          {...props}
        />
        {error && <p className="mt-1 text-xs text-rose-400">{error}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';

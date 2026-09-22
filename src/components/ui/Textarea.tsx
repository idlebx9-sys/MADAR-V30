import React from 'react';
import { cn } from '../../lib/utils.ts';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, id, ...props }, ref) => {
    const textareaId = id || `textarea-${Math.random().toString(36).substring(2, 9)}`;
    return (
      <div className="w-full text-right">
        <textarea
          id={textareaId}
          ref={ref}
          className={cn(
            'flex min-h-[90px] w-full rounded-xl bg-[#151C32] border border-white/10 px-3.5 py-2.5 text-xs sm:text-sm text-[#F8FAFC] placeholder:text-[#64748B] focus:outline-none focus:border-[#6C3CE1] focus:ring-2 focus:ring-[#6C3CE1]/20 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed text-right leading-relaxed',
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
Textarea.displayName = 'Textarea';

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

export const Label: React.FC<LabelProps> = ({ className, children, required, ...props }) => {
  return (
    <label
      className={cn('block text-xs font-medium text-[#94A3B8] mb-1.5 text-right select-none', className)}
      {...props}
    >
      {children}
      {required && <span className="text-[#FBBF24] mr-1">*</span>}
    </label>
  );
};

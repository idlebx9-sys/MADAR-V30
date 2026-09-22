import React from 'react';
import { cn } from '../../lib/utils.ts';
import { X } from 'lucide-react';

export interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
}

export const Dialog: React.FC<DialogProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = 'lg',
}) => {
  if (!isOpen) return null;

  const widths = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" dir="rtl">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Content */}
      <div
        className={cn(
          'relative w-full rounded-2xl bg-[#11182B] border border-white/10 p-6 shadow-2xl z-10 max-h-[90vh] overflow-y-auto text-right text-[#F8FAFC]',
          widths[maxWidth]
        )}
      >
        <div className="flex items-center justify-between pb-3.5 border-b border-white/5">
          {title ? (
            <h3 className="text-base font-bold text-[#F8FAFC] font-heading">{title}</h3>
          ) : (
            <div />
          )}
          <button
            onClick={onClose}
            className="rounded-xl p-1.5 text-[#94A3B8] hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            aria-label="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {description && <p className="mt-2 text-xs text-[#94A3B8] leading-relaxed">{description}</p>}

        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
};

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: string;
  options: { value: string; label: string }[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, error, options, id, ...props }, ref) => {
    const selectId = id || `select-${Math.random().toString(36).substring(2, 9)}`;
    return (
      <div className="w-full text-right">
        <select
          id={selectId}
          ref={ref}
          className={cn(
            'flex h-10 w-full rounded-xl bg-[#151C32] border border-white/10 px-3.5 py-2 text-xs text-[#F8FAFC] focus:outline-none focus:border-[#6C3CE1] focus:ring-2 focus:ring-[#6C3CE1]/20 transition-all duration-150 disabled:opacity-50 text-right cursor-pointer',
            error && 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20',
            className
          )}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-[#151C32] text-[#F8FAFC] py-2">
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p className="mt-1 text-xs text-rose-400">{error}</p>}
      </div>
    );
  }
);
Select.displayName = 'Select';

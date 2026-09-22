import React from 'react';
import { cn } from '../../lib/utils.ts';

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

export const Label: React.FC<LabelProps> = ({ className, children, required, ...props }) => {
  return (
    <label
      className={cn('block text-sm font-medium text-slate-300 mb-1.5 text-right select-none', className)}
      {...props}
    >
      {children}
      {required && <span className="text-amber-400 mr-1">*</span>}
    </label>
  );
};

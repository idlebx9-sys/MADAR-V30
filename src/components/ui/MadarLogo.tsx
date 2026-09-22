import React from 'react';
import { cn } from '../../lib/utils.ts';

export interface MadarLogoProps {
  variant?: 'full' | 'mark' | 'compact';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  layout?: 'horizontal' | 'stacked';
  className?: string;
  showTagline?: boolean;
  arabicSubtitle?: boolean;
}

export const MadarLogo: React.FC<MadarLogoProps> = ({
  variant = 'full',
  size = 'md',
  layout = 'horizontal',
  className,
  showTagline = true,
  arabicSubtitle = false,
}) => {
  // Dimension scales for mark
  const markDimensions = {
    xs: 'w-6 h-7',
    sm: 'w-8 h-9',
    md: 'w-10 h-11',
    lg: 'w-14 h-16',
    xl: 'w-20 h-24',
    '2xl': 'w-28 h-32',
  };

  const wordmarkSizes = {
    xs: 'text-xs tracking-[0.2em]',
    sm: 'text-sm tracking-[0.25em]',
    md: 'text-base sm:text-lg tracking-[0.28em]',
    lg: 'text-xl sm:text-2xl tracking-[0.32em]',
    xl: 'text-3xl sm:text-4xl tracking-[0.35em]',
    '2xl': 'text-4xl sm:text-5xl tracking-[0.4em]',
  };

  const subtitleSizes = {
    xs: 'text-[7px] tracking-[0.15em]',
    sm: 'text-[8px] tracking-[0.18em]',
    md: 'text-[9px] sm:text-[10px] tracking-[0.22em]',
    lg: 'text-xs tracking-[0.25em]',
    xl: 'text-xs sm:text-sm tracking-[0.28em]',
    '2xl': 'text-sm tracking-[0.3em]',
  };

  const isStacked = layout === 'stacked' || variant === 'full' && (size === 'xl' || size === '2xl');

  // Emblem mark component using the official brand asset
  const renderMark = () => (
    <div
      className={cn(
        'relative flex-shrink-0 flex items-center justify-center transition-transform duration-300',
        markDimensions[size]
      )}
    >
      <img
        src="/brand/madar-mark.png"
        alt="MADAR Official Monogram Emblem"
        className="w-full h-full object-contain filter drop-shadow-[0_2px_8px_rgba(216,195,165,0.25)] select-none pointer-events-none"
        loading="eager"
        decoding="async"
      />
    </div>
  );

  if (variant === 'mark') {
    return (
      <div className={cn('inline-flex items-center justify-center', className)}>
        {renderMark()}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'inline-flex select-none transition-all',
        isStacked
          ? 'flex-col items-center text-center gap-2 sm:gap-3'
          : 'flex-row items-center gap-2.5 sm:gap-3.5',
        className
      )}
    >
      {renderMark()}

      {/* Official Typography Wordmark */}
      <div
        className={cn(
          'flex flex-col',
          isStacked ? 'items-center text-center' : 'items-start text-left'
        )}
      >
        {/* MADAR classical serif wordmark */}
        <span
          className={cn(
            'font-serif-luxury font-medium text-[#F7F3EE] uppercase leading-none select-none drop-shadow-[0_1px_4px_rgba(216,195,165,0.3)]',
            wordmarkSizes[size]
          )}
          style={{ fontFamily: "'Cinzel', 'Cormorant Garamond', serif" }}
        >
          M A D A R
        </span>

        {/* Subtitle */}
        {variant === 'full' && showTagline && (
          <span
            className={cn(
              'font-sans uppercase font-medium text-[#D8C3A5]/90 mt-1 select-none whitespace-nowrap',
              subtitleSizes[size]
            )}
          >
            {arabicSubtitle ? (
              <span className="font-heading tracking-normal normal-case text-[#E4D2B8]">
                حلول رقمية لمكاتب الزواج
              </span>
            ) : (
              'WEBSITE SOLUTIONS FOR MARRIAGE OFFICES'
            )}
          </span>
        )}
      </div>
    </div>
  );
};

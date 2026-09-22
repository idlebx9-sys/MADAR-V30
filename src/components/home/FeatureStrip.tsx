import React from 'react';
import { Layers, Smartphone, Zap, ShieldCheck, Headphones } from 'lucide-react';
import { cn } from '../../lib/utils.ts';

export interface FeatureStripProps {
  className?: string;
}

export const FeatureStrip: React.FC<FeatureStripProps> = ({ className }) => {
  const features = [
    {
      icon: Layers,
      title: 'قوالب جاهزة ومتنوعة',
      subtitle: 'اختر ما يناسبك',
    },
    {
      icon: Smartphone,
      title: 'تصميم عصري',
      subtitle: 'يعمل على جميع الأجهزة',
    },
    {
      icon: Zap,
      title: 'إعداد سريع',
      subtitle: 'موقعك خلال دقائق',
    },
    {
      icon: ShieldCheck,
      title: 'أمان وموثوقية',
      subtitle: 'بياناتك في أمان تام',
    },
    {
      icon: Headphones,
      title: 'دعم فني مستمر',
      subtitle: 'نحن معك دائماً',
    },
  ];

  return (
    <section
      id="features"
      className={cn(
        'relative w-full border-b border-white/[0.08] bg-[#0A1220]/70 py-6 sm:py-8 backdrop-blur-sm',
        className
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 lg:gap-0 lg:divide-x lg:divide-x-reverse lg:divide-white/[0.08]">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div
                key={idx}
                className="flex items-center gap-3.5 px-2 lg:px-6 text-right justify-start group"
              >
                {/* Champagne Gold delicate outline icon */}
                <div className="w-10 h-10 rounded-xl bg-[#E4D2B8]/[0.08] border border-[#E4D2B8]/20 flex items-center justify-center flex-shrink-0 text-[#E4D2B8] transition-transform duration-300 group-hover:scale-110 shadow-[0_2px_10px_rgba(228,210,184,0.05)]">
                  <Icon className="w-5 h-5 stroke-[1.5]" />
                </div>

                {/* Text */}
                <div className="flex flex-col">
                  <h4 className="text-xs sm:text-sm font-bold text-[#F7F3EE] tracking-tight group-hover:text-[#E4D2B8] transition-colors">
                    {feature.title}
                  </h4>
                  <p className="text-[11px] sm:text-xs text-[#9DA7B5] font-normal leading-snug mt-0.5">
                    {feature.subtitle}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

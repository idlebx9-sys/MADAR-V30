import React from 'react';
import { Link } from 'wouter';
import { ArrowLeft } from 'lucide-react';
import { HeroWebsitePreview } from './HeroWebsitePreview.tsx';
import { useAuth } from '../../hooks/useAuth.ts';

export interface HeroSectionProps {
  className?: string;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ className }) => {
  const { isAuthenticated } = useAuth();

  return (
    <section className="relative overflow-hidden pt-8 pb-16 lg:pt-16 lg:pb-24 border-b border-white/[0.08]">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#E4D2B8]/[0.03] rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 left-0 w-96 h-96 bg-[#0E1B2E]/60 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Right Column in RTL: Text, Eyebrow, Heading, Paragraph, CTA */}
          <div className="lg:col-span-6 space-y-6 lg:space-y-8 text-right order-1">
            {/* Eyebrow matching Image 1: — منصة إنشاء مواقع جاهزة — */}
            <div className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-[#D8C3A5] tracking-wide">
              <span className="text-[#D8C3A5]/60">—</span>
              <span>منصة إنشاء مواقع جاهزة</span>
              <span className="text-[#D8C3A5]/60">—</span>
            </div>

            {/* Main Headline matching Image 1:
                مواقع احترافية
                لمكاتب الزواج */}
            <div className="space-y-1 sm:space-y-2">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#F7F3EE] tracking-tight leading-[1.15]">
                مواقع احترافية
                <br />
                <span className="champagne-gradient font-black">
                  لمكاتب الزواج
                </span>
              </h1>
            </div>

            {/* Paragraph matching Image 1:
                "نقدم لك حلولاً رقمية متكاملة لإنشاء موقعك الخاص باحترافية وسهولة، لتصل إلى المزيد من العملاء وتبني ثقة أكبر." */}
            <p className="text-sm sm:text-base lg:text-lg text-[#CBD5E1] leading-relaxed max-w-xl font-normal opacity-95">
              نقدم لك حلولاً رقمية متكاملة لإنشاء موقعك الخاص باحترافية وسهولة، لتصل إلى المزيد من العملاء وتبني ثقة أكبر.
            </p>

            {/* CTA Button matching Image 1:
                Pill button: "ابدأ الآن ←" in Champagne Gold */}
            <div className="pt-2 flex items-center gap-4">
              <Link
                href={isAuthenticated ? '/dashboard' : '/builder'}
                className="inline-flex items-center justify-center gap-3 px-8 sm:px-10 py-3.5 sm:py-4 rounded-full bg-[#E4D2B8] text-[#070F1B] hover:bg-[#F0DFCA] active:scale-[0.98] font-bold text-sm sm:text-base transition-all duration-200 shadow-[0_10px_30px_rgba(228,210,184,0.25)] group"
              >
                <span>ابدأ الآن</span>
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover:-translate-x-1.5" />
              </Link>
            </div>
          </div>

          {/* Left Column in RTL: Laptop + Phone Visual Mockup */}
          <div className="lg:col-span-6 order-2">
            <HeroWebsitePreview />
          </div>
        </div>
      </div>
    </section>
  );
};

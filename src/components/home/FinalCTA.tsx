import React from 'react';
import { Link } from 'wouter';
import { ArrowLeft, CheckCircle2, Shield } from 'lucide-react';
import { MadarLogo } from '../ui/MadarLogo.tsx';
import { cn } from '../../lib/utils.ts';
import { useAuth } from '../../hooks/useAuth.ts';

export interface FinalCTAProps {
  className?: string;
}

export const FinalCTA: React.FC<FinalCTAProps> = ({ className }) => {
  const { isAuthenticated } = useAuth();

  return (
    <section className={cn('relative py-20 lg:py-28 overflow-hidden border-b border-white/[0.08]', className)}>
      {/* Cinematic luxury architectural backdrop */}
      <div className="absolute inset-0 z-0">
        <img
          src="/src/assets/images/madar_hero_venue_1790038777806.jpg"
          alt="Luxury Architecture Backdrop"
          className="w-full h-full object-cover object-center filter brightness-[0.25] contrast-[1.1] scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#070F1B] via-[#070F1B]/85 to-[#070F1B]/95" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#070F1B] via-transparent to-[#070F1B]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="rounded-3xl p-8 sm:p-12 lg:p-16 bg-[#0B1422]/75 backdrop-blur-md border border-[#E4D2B8]/20 shadow-[0_25px_60px_rgba(0,0,0,0.8)]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Side 1 (Text & CTA in RTL) */}
            <div className="lg:col-span-7 space-y-6 text-right order-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E4D2B8]/10 border border-[#E4D2B8]/25 text-xs text-[#E4D2B8] font-medium">
                <Shield className="w-3.5 h-3.5" />
                <span>المنصة الرائدة في العالم العربي</span>
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#F7F3EE] tracking-tight font-heading leading-tight">
                مستقبلك الرقمي
                <br />
                <span className="champagne-gradient font-black">
                  يبدأ من هنا
                </span>
              </h2>

              <p className="text-sm sm:text-base text-[#CBD5E1] leading-relaxed max-w-xl font-normal">
                انضم إلى مئات مكاتب الزواج التي اختارت مدار لبناء حضورها الرقمي باحترافية وسهولة، مع حفظ كامل للخصوصية وتوثيق شرعي معتمد.
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-4">
                <Link
                  href={isAuthenticated ? '/dashboard' : '/builder'}
                  className="inline-flex items-center justify-center gap-3 px-8 sm:px-10 py-3.5 sm:py-4 rounded-full bg-[#E4D2B8] text-[#070F1B] hover:bg-[#F0DFCA] font-bold text-sm sm:text-base transition-all duration-200 shadow-[0_10px_30px_rgba(228,210,184,0.25)] group"
                >
                  <span>ابدأ الآن</span>
                  <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover:-translate-x-1.5" />
                </Link>

                <div className="flex items-center gap-2 text-xs text-[#9DA7B5]">
                  <CheckCircle2 className="w-4 h-4 text-[#22C55E]" />
                  <span>بدون بطاقة ائتمانية للبدء</span>
                </div>
              </div>
            </div>

            {/* Side 2 (Official MADAR Logo & Real Stats) */}
            <div className="lg:col-span-5 flex flex-col items-center text-center p-6 sm:p-8 rounded-2xl bg-[#070F1B]/80 border border-white/10 order-2">
              {/* Official Logo */}
              <MadarLogo
                variant="full"
                size="lg"
                layout="stacked"
                showTagline={true}
                arabicSubtitle={true}
                className="mb-8"
              />

              {/* Real Stats Row matching Image 1 */}
              <div className="grid grid-cols-3 gap-4 w-full pt-6 border-t border-white/[0.08]">
                <div className="space-y-1">
                  <div className="text-xl sm:text-2xl font-black text-[#E4D2B8] font-serif-luxury">
                    +500
                  </div>
                  <div className="text-[10px] sm:text-xs text-[#9DA7B5]">
                    موقع منشأ
                  </div>
                </div>

                <div className="space-y-1 border-x border-white/[0.08]">
                  <div className="text-xl sm:text-2xl font-black text-[#E4D2B8] font-serif-luxury">
                    +300
                  </div>
                  <div className="text-[10px] sm:text-xs text-[#9DA7B5]">
                    مكتب زواج
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-xl sm:text-2xl font-black text-[#E4D2B8] font-serif-luxury">
                    99%
                  </div>
                  <div className="text-[10px] sm:text-xs text-[#9DA7B5]">
                    رضا العملاء
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Sparkles, Shield, Heart } from 'lucide-react';
import { cn } from '../../lib/utils.ts';

export interface HeroWebsitePreviewProps {
  siteName?: string;
  className?: string;
}

export const HeroWebsitePreview: React.FC<HeroWebsitePreviewProps> = ({
  siteName = 'مكتب التوفيق للزواج الشرعي',
  className,
}) => {
  const [activeView, setActiveView] = useState<'both' | 'desktop' | 'mobile'>('both');

  return (
    <div className={cn('relative w-full flex items-center justify-center select-none', className)}>
      {/* Ambient warm lamp glow behind the mockups matching Image 1 */}
      <div className="absolute -top-12 -left-12 w-72 h-72 rounded-full bg-[#E4D2B8]/10 blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 right-0 w-80 h-80 rounded-full bg-[#0E1B2E]/80 blur-2xl pointer-events-none" />

      {/* Main Composition Wrapper */}
      <div className="relative w-full max-w-2xl mx-auto flex items-end justify-center pt-4 pb-6">
        {/* ========================================================
            1. LAPTOP MOCKUP (DESKTOP PREVIEW)
            ======================================================== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className={cn(
            'relative w-[92%] sm:w-[86%] transition-all duration-500',
            activeView === 'mobile' ? 'opacity-40 scale-95 blur-[1px]' : 'opacity-100'
          )}
        >
          {/* Laptop Screen Display Lid */}
          <div className="relative rounded-t-2xl p-2 sm:p-2.5 bg-gradient-to-b from-[#2A3548] to-[#121A28] border border-white/10 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)]">
            {/* Screen Bezel */}
            <div className="relative rounded-xl overflow-hidden bg-[#070F1B] border border-black/40 aspect-[16/10]">
              {/* Web Browser Frame / Top Bar */}
              <div className="h-6 bg-[#0B1422] px-3 flex items-center justify-between border-b border-white/[0.06]">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#EF4444]/70" />
                  <span className="w-2 h-2 rounded-full bg-[#F59E0B]/70" />
                  <span className="w-2 h-2 rounded-full bg-[#22C55E]/70" />
                </div>
                {/* Micro URL bar */}
                <div className="px-3 py-0.5 rounded-md bg-[#070F1B] border border-white/[0.05] text-[9px] text-[#9DA7B5] font-mono tracking-tight flex items-center gap-1">
                  <span className="text-[#22C55E] text-[8px]">🔒</span>
                  <span>altawfeeq.madar.sa</span>
                </div>
                <div className="w-8" />
              </div>

              {/* Website Content Inside Laptop */}
              <div className="relative w-full h-[calc(100%-1.5rem)] overflow-hidden text-right">
                {/* Luxury palace hero image background */}
                <img
                  src="/src/assets/images/madar_hero_venue_1790038777806.jpg"
                  alt="Website Preview Hero"
                  className="absolute inset-0 w-full h-full object-cover object-center filter brightness-[0.78] contrast-[1.05]"
                  loading="eager"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#070F1B] via-[#070F1B]/40 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#070F1B]/80 via-transparent to-[#070F1B]/30" />

                {/* Simulated Mini Navbar */}
                <div className="relative z-10 px-4 py-2.5 flex items-center justify-between border-b border-white/10 bg-black/20 backdrop-blur-[2px]">
                  <div className="flex items-center gap-2">
                    <img
                      src="/brand/madar-mark.png"
                      alt="Mark"
                      className="w-4 h-5 object-contain"
                    />
                    <span className="text-[11px] font-bold text-white tracking-wide">
                      {siteName}
                    </span>
                  </div>
                  <div className="hidden sm:flex items-center gap-3 text-[9px] text-white/80">
                    <span className="text-[#E4D2B8] font-semibold">الرئيسية</span>
                    <span>استمارة الزواج</span>
                    <span>عن المكتب</span>
                    <span>الضوابط الشرعية</span>
                  </div>
                  <button className="px-2.5 py-0.5 rounded-full bg-[#E4D2B8] text-[#070F1B] text-[9px] font-semibold">
                    تقديم استمارة
                  </button>
                </div>

                {/* Hero Content inside Laptop */}
                <div className="relative z-10 p-5 sm:p-7 max-w-[65%] flex flex-col justify-center h-[calc(100%-2.5rem)] space-y-2">
                  <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-black/40 border border-[#E4D2B8]/30 text-[9px] text-[#E4D2B8] w-fit">
                    <Sparkles className="w-2.5 h-2.5" />
                    <span>منصة زواج شرعي معتمدة وموثوقة</span>
                  </div>
                  <h3 className="text-sm sm:text-lg lg:text-xl font-black text-white leading-snug drop-shadow-md">
                    بداية أجمل لقصص حقيقية
                  </h3>
                  <p className="text-[9px] sm:text-[10px] text-[#E2E8F0] line-clamp-2 leading-relaxed opacity-90 max-w-sm">
                    وساطة أسرية ملتزمة بالضوابط الشرعية التامة لسرية المعلومات وجدية التوفيق والوفاق.
                  </p>
                  <div className="pt-1 flex items-center gap-2">
                    <div className="px-3 py-1 rounded-full bg-[#E4D2B8] text-[#070F1B] text-[9px] sm:text-[10px] font-bold inline-flex items-center gap-1 shadow-sm">
                      <span>تصفح الفئات</span>
                      <ArrowLeft className="w-2.5 h-2.5" />
                    </div>
                    <div className="px-2.5 py-1 rounded-full bg-black/50 border border-white/20 text-white text-[9px] sm:text-[10px] font-medium">
                      استمارة جديدة
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Laptop Bottom Base / Keyboard Chassis */}
          <div className="relative h-3 sm:h-3.5 bg-gradient-to-b from-[#334155] to-[#1E293B] rounded-b-xl border-x border-b border-white/10 shadow-[0_15px_30px_rgba(0,0,0,0.8)] flex justify-center">
            {/* Display notch */}
            <div className="w-16 h-1 bg-[#0F172A] rounded-b-md" />
          </div>

          {/* Subtle reflection below laptop matching Image 1 */}
          <div className="w-[95%] mx-auto h-4 bg-gradient-to-b from-[#E4D2B8]/10 to-transparent blur-sm rounded-full" />
        </motion.div>

        {/* ========================================================
            2. SMARTPHONE MOCKUP (MOBILE PREVIEW)
            ======================================================== */}
        <motion.div
          initial={{ opacity: 0, x: 20, y: 30 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className={cn(
            'absolute -bottom-2 -left-2 sm:bottom-0 sm:left-4 w-[34%] sm:w-[28%] max-w-[170px] z-20 transition-all duration-500',
            activeView === 'desktop' ? 'opacity-40 scale-95 blur-[1px]' : 'opacity-100'
          )}
        >
          {/* Phone Shell with metallic border */}
          <div className="relative rounded-[2rem] p-1.5 sm:p-2 bg-gradient-to-b from-[#475569] via-[#1E293B] to-[#0F172A] border border-[#E4D2B8]/30 shadow-[0_25px_50px_-10px_rgba(0,0,0,0.95)]">
            {/* Phone Screen */}
            <div className="relative rounded-[1.6rem] overflow-hidden bg-[#070F1B] border border-black/80 aspect-[9/18.5] text-right">
              {/* Speaker notch / Dynamic island */}
              <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-12 h-3 bg-black rounded-full z-30 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-[#1E293B] mr-2" />
                <div className="w-1.5 h-1.5 rounded-full bg-[#0F172A]" />
              </div>

              {/* Mobile Screen Content */}
              <div className="relative w-full h-full overflow-hidden flex flex-col">
                <img
                  src="/src/assets/images/madar_hero_venue_1790038777806.jpg"
                  alt="Mobile Preview"
                  className="absolute inset-0 w-full h-full object-cover object-center filter brightness-[0.75]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#070F1B] via-[#070F1B]/60 to-[#070F1B]/30" />

                {/* Mobile Mini Header */}
                <div className="relative z-10 pt-5 px-3 pb-2 flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <img src="/brand/madar-mark.png" alt="Mark" className="w-3.5 h-4 object-contain" />
                    <span className="text-[9px] font-bold text-white font-serif-luxury">MADAR</span>
                  </div>
                  <span className="text-white/80 text-xs">≡</span>
                </div>

                {/* Mobile Hero Content */}
                <div className="relative z-10 mt-auto p-3 text-center space-y-1.5 pb-4">
                  <div className="inline-block px-1.5 py-0.5 rounded-full bg-black/40 border border-[#E4D2B8]/40 text-[7px] text-[#E4D2B8]">
                    مكتب زواج معتمد
                  </div>
                  <h4 className="text-[11px] font-extrabold text-white leading-tight">
                    بداية أجمل لقصص حقيقية
                  </h4>
                  <p className="text-[7.5px] text-[#CBD5E1] line-clamp-2 leading-relaxed">
                    منصة خاصة تجمع بين رقي التوفيق وضمان الخصوصية.
                  </p>
                  <button className="w-full py-1 rounded-full bg-[#E4D2B8] text-[#070F1B] text-[8px] font-bold mt-1 shadow">
                    تصفح الفئات ←
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

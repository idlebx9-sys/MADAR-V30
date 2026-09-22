import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Layers, Palette, Rocket, Check, ArrowLeft } from 'lucide-react';
import { Link } from 'wouter';
import { cn } from '../../lib/utils.ts';

export interface HowItWorksProps {
  className?: string;
}

export const HowItWorks: React.FC<HowItWorksProps> = ({ className }) => {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      num: '1',
      title: 'اختر القالب المناسب لمكتبك',
      desc: 'تصفح مجموعة من القوالب الحصرية المصممة خصيصاً لمكاتب ووسطاء الزواج الشرعي بأعلى معايير الرصانة.',
      icon: Layers,
    },
    {
      num: '2',
      title: 'خصص محتوى وهويّة موقعك',
      desc: 'أضف بيانات مكتبك، شروطك الشرعية، طرق التواصل، ونماذج الاستمارات بدقائق دون الحاجة لأي خبرة برمجية.',
      icon: Palette,
    },
    {
      num: '3',
      title: 'انشر موقعك وابدأ باستقبال الخاطبين',
      desc: 'احصل على رابطك المباشر مع استضافة سحابية فورية وتشفير كامل للبيانات وابدأ العمل باحترافية وثقة.',
      icon: Rocket,
    },
  ];

  return (
    <section
      id="how-it-works"
      className={cn('relative py-20 lg:py-28 border-b border-white/[0.08] overflow-hidden', className)}
    >
      {/* Background soft ambient glow */}
      <div className="absolute top-1/2 right-10 w-80 h-80 bg-[#E4D2B8]/[0.025] rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-[#D8C3A5]">
            <span className="text-[#D8C3A5]/50">—</span>
            <span>كيف يعمل؟</span>
            <span className="text-[#D8C3A5]/50">—</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#F7F3EE] tracking-tight font-heading">
            ثلاث خطوات بسيطة
          </h2>

          <p className="text-sm sm:text-base text-[#9DA7B5] leading-relaxed">
            من الفكرة إلى الموقع، كل ما تحتاجه في خطوات سهلة وسريعة تبني حضورك الرقمي.
          </p>
        </div>

        {/* 2-Column Grid matching Image 1: Side 1 (Mockup) + Side 2 (3 Steps) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Side 1 (Visual Browser Mockup with Templates) */}
          <div className="lg:col-span-6 order-2 lg:order-1">
            <div className="relative rounded-2xl p-1 bg-gradient-to-b from-[#2A3548] to-[#141E2E] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
              {/* Browser Window Header */}
              <div className="bg-[#0B1422] rounded-t-xl px-4 py-3 border-b border-white/[0.06] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]/60" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]/60" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#22C55E]/60" />
                </div>
                <div className="px-3 py-1 rounded-md bg-[#070F1B] border border-white/[0.06] text-[10px] text-[#D8C3A5] font-mono flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
                  <span>madar.sa/builder</span>
                </div>
                <div className="w-10" />
              </div>

              {/* Browser Interior Body */}
              <div className="p-5 sm:p-7 bg-[#070F1B] rounded-b-xl space-y-5 text-right">
                <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-full bg-[#E4D2B8]/10 text-[#E4D2B8] border border-[#E4D2B8]/20 text-xs font-semibold">
                      قوالب جاهزة ومتنوعة
                    </span>
                  </div>
                  <span className="text-xs text-[#9DA7B5]">اختر التصميم المناسب</span>
                </div>

                {/* Templates Mini Grid */}
                <div className="grid grid-cols-2 gap-3.5">
                  {/* Template Card 1 */}
                  <div
                    onClick={() => setActiveStep(0)}
                    className={cn(
                      'cursor-pointer rounded-xl p-3 border transition-all duration-200 text-right',
                      activeStep === 0
                        ? 'bg-[#0E1B2E] border-[#E4D2B8] shadow-[0_0_20px_rgba(228,210,184,0.15)]'
                        : 'bg-[#0B1422] border-white/[0.08] hover:border-white/20'
                    )}
                  >
                    <div className="h-20 rounded-lg bg-gradient-to-tr from-[#1E293B] to-[#0F172A] relative overflow-hidden mb-2 border border-white/5">
                      <img
                        src="/src/assets/images/madar_hero_venue_1790038777806.jpg"
                        alt="Royal Template"
                        className="w-full h-full object-cover opacity-60"
                      />
                      <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded text-[8px] bg-black/60 text-[#E4D2B8] border border-[#E4D2B8]/30 font-bold">
                        الملكي (Royal)
                      </div>
                    </div>
                    <div className="text-xs font-bold text-white">طراز النخبة الملكي</div>
                    <div className="text-[10px] text-[#9DA7B5] mt-0.5">كحلي مخملي فاخر</div>
                  </div>

                  {/* Template Card 2 */}
                  <div
                    onClick={() => setActiveStep(1)}
                    className={cn(
                      'cursor-pointer rounded-xl p-3 border transition-all duration-200 text-right',
                      activeStep === 1
                        ? 'bg-[#0E1B2E] border-[#E4D2B8] shadow-[0_0_20px_rgba(228,210,184,0.15)]'
                        : 'bg-[#0B1422] border-white/[0.08] hover:border-white/20'
                    )}
                  >
                    <div className="h-20 rounded-lg bg-gradient-to-tr from-[#0F172A] to-[#1E293B] relative overflow-hidden mb-2 border border-white/5">
                      <div className="w-full h-full bg-[#070F1B] p-2 flex flex-col justify-center items-center text-center">
                        <div className="w-8 h-8 rounded-full border border-[#E4D2B8]/40 flex items-center justify-center text-[#E4D2B8] text-[10px]">
                          M
                        </div>
                        <div className="text-[9px] text-white/90 mt-1 font-bold">التبسيطي (Minimal)</div>
                      </div>
                      <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded text-[8px] bg-black/60 text-white/90 border border-white/20 font-bold">
                        الأنيق
                      </div>
                    </div>
                    <div className="text-xs font-bold text-white">طراز الوقار والصفاء</div>
                    <div className="text-[10px] text-[#9DA7B5] mt-0.5">هادئ وعصري</div>
                  </div>
                </div>

                {/* Instant Launch Action Row */}
                <div className="p-3 rounded-xl bg-gradient-to-r from-[#0E1B2E] to-[#0A1220] border border-white/[0.06] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-[#22C55E]/20 flex items-center justify-center text-[#22C55E]">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs text-[#CBD5E1]">النشر فوري وتلقائي</span>
                  </div>
                  <Link
                    href="/builder"
                    className="px-3.5 py-1.5 rounded-full bg-[#E4D2B8] text-[#070F1B] text-xs font-bold hover:bg-[#F0DFCA] transition-colors inline-flex items-center gap-1.5"
                  >
                    <span>تجربة القوالب</span>
                    <ArrowLeft className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Side 2 (3 Sequential Steps with Number Badges) */}
          <div className="lg:col-span-6 space-y-6 sm:space-y-8 order-1 lg:order-2 text-right">
            {steps.map((step, idx) => {
              const isActive = activeStep === idx;
              return (
                <div
                  key={idx}
                  onClick={() => setActiveStep(idx)}
                  className={cn(
                    'cursor-pointer rounded-2xl p-5 sm:p-6 border transition-all duration-300 flex items-start gap-5',
                    isActive
                      ? 'bg-[#0B1422]/90 border-[#E4D2B8]/40 shadow-[0_10px_30px_rgba(0,0,0,0.5)] scale-[1.02]'
                      : 'bg-transparent border-white/[0.06] hover:border-white/15 hover:bg-white/[0.02]'
                  )}
                >
                  {/* Step Number Circle */}
                  <div
                    className={cn(
                      'w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg flex-shrink-0 transition-all duration-300 font-serif-luxury',
                      isActive
                        ? 'bg-[#E4D2B8] text-[#070F1B] shadow-[0_0_15px_rgba(228,210,184,0.4)]'
                        : 'bg-white/[0.05] border border-white/10 text-[#9DA7B5]'
                    )}
                  >
                    {step.num}
                  </div>

                  {/* Step Body */}
                  <div className="flex-1 space-y-1.5">
                    <h3
                      className={cn(
                        'text-base sm:text-lg font-bold transition-colors',
                        isActive ? 'text-[#F7F3EE]' : 'text-[#CBD5E1]'
                      )}
                    >
                      {step.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#9DA7B5] leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

import React, { useState } from 'react';
import { WebsitePreviewCard, TemplateData } from './WebsitePreviewCard.tsx';
import { Dialog } from '../ui/Dialog.tsx';
import { ExternalLink, Sparkles, Monitor, Smartphone, X } from 'lucide-react';
import { Link } from 'wouter';
import { cn } from '../../lib/utils.ts';

export interface TemplateShowcaseProps {
  className?: string;
}

export const TemplateShowcase: React.FC<TemplateShowcaseProps> = ({ className }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [previewTemplate, setPreviewTemplate] = useState<TemplateData | null>(null);
  const [modalDevice, setModalDevice] = useState<'desktop' | 'mobile'>('desktop');

  const templates: TemplateData[] = [
    {
      id: 'luxury',
      name: 'مكتب التوفيق للزواج الشرعي',
      category: 'luxury',
      badge: 'طراز النخبة الفاخر',
      description: 'تصميم ملكي فاخر باللون الكحلي والذهب الفاتح، مهيأ للمكاتب المعتمدة ذات التقدير الرفيع.',
      subdomain: 'altawfeeq',
      color: '#E4D2B8',
      previewImage: '/src/assets/images/madar_hero_venue_1790038777806.jpg',
      features: ['استمارة توفيق مفصلة', 'قسم الضوابط الشرعية', 'شهادة الاعتماد الرسمي'],
    },
    {
      id: 'modern',
      name: 'مكتب المودة للاستشارات والوساطة',
      category: 'modern',
      badge: 'طراز الصفاء العصري',
      description: 'واجهة نقية ومساحات مدروسة تركز على الانسيابية والسهولة والهدوء البصري.',
      subdomain: 'mawaddah',
      color: '#A78BFA',
      previewImage: '/src/assets/images/madar_hero_venue_1790038777806.jpg',
      features: ['تنسيق ناعم ومريح', 'خطوط عربية أصيلة', 'إرسال سريع عبر واتساب'],
    },
    {
      id: 'family',
      name: 'مكتب الوفاق للزواج الشرعي',
      category: 'family',
      badge: 'طراز الرصانة والألفة',
      description: 'مظهر متزن يجمع الوقار الشرعي مع سهولة التصفح لجميع الفئات الأسرية.',
      subdomain: 'alwefaq',
      color: '#38BDF8',
      previewImage: '/src/assets/images/madar_hero_venue_1790038777806.jpg',
      features: ['معايير كفاءة الخاطبين', 'تحقق فوري من الشروط', 'سرية مشفرة'],
    },
    {
      id: 'professional',
      name: 'مكتب الرؤية المعتمد للزواج',
      category: 'professional',
      badge: 'طراز الاعتماد المؤسسي',
      description: 'مظهر مهني تقني متقدم يبرز رخص وزارة العدل والسجلات الرسمية للمكتب.',
      subdomain: 'alroya',
      color: '#34D399',
      previewImage: '/src/assets/images/madar_hero_venue_1790038777806.jpg',
      features: ['توثيق السجل والترخيص', 'إحصائيات الإنجاز السنوية', 'نظام إدارة المواعيد'],
    },
    {
      id: 'traditional',
      name: 'مكتب الأصالة للتوفيق والوساطة',
      category: 'traditional',
      badge: 'طراز العراقة التراثية',
      description: 'تأصيل تراثي بالزخارف الهندسية الدقيقة والخطوط الكوفية والمحافظة الأصيلة.',
      subdomain: 'alasalah',
      color: '#FBBF24',
      previewImage: '/src/assets/images/madar_hero_venue_1790038777806.jpg',
      features: ['زخارف عربية كلاسيكية', 'بيانات توفيق شرعية', 'ضمان الخصوصية التامة'],
    },
    {
      id: 'islamic',
      name: 'مكتب السكينة الشرعي للزواج',
      category: 'islamic',
      badge: 'طراز الوقار الشرعي',
      description: 'طابع إسلامي رصين ومحافظ بألوان الزمرد الهادئ والآيات والأحاديث النبوية البارزة.',
      subdomain: 'alsakeenah',
      color: '#10B981',
      previewImage: '/src/assets/images/madar_hero_venue_1790038777806.jpg',
      features: ['آيات السكينة والمودة', 'فتاوى وضوابط الخطبة', 'ميثاق الأمانة والسرية'],
    },
  ];

  const filteredTemplates =
    selectedCategory === 'all'
      ? templates
      : templates.filter((t) => t.category === selectedCategory);

  return (
    <section
      id="showcase"
      className={cn('relative py-20 lg:py-28 border-b border-white/[0.08]', className)}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14 text-right">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-[#D8C3A5]">
              <span className="text-[#D8C3A5]/50">—</span>
              <span>نماذج مواقع مصممة باحتراف</span>
              <span className="text-[#D8C3A5]/50">—</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#F7F3EE] tracking-tight font-heading">
              اختر مظهر موقعك الرقمي
            </h2>

            <p className="text-sm sm:text-base text-[#9DA7B5] leading-relaxed">
              نماذج حقيقية لمواقع تم إنشاؤها عبر منصة مدار، جاهزة للنشر والتخصيص فورًا لمكتبك.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'all', label: 'جميع النماذج' },
              { id: 'luxury', label: 'الفاخر' },
              { id: 'modern', label: 'العصري' },
              { id: 'family', label: 'الأسري' },
              { id: 'professional', label: 'المهني' },
              { id: 'traditional', label: 'التقليدي' },
              { id: 'islamic', label: 'الشرعي' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedCategory(tab.id)}
                className={cn(
                  'px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 border',
                  selectedCategory === tab.id
                    ? 'bg-[#E4D2B8] text-[#070F1B] border-[#E4D2B8] shadow-sm'
                    : 'bg-white/[0.03] text-[#CBD5E1] border-white/[0.08] hover:border-white/20'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Templates Showcase Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredTemplates.map((template) => (
            <WebsitePreviewCard
              key={template.id}
              template={template}
              onPreviewModal={(tpl) => setPreviewTemplate(tpl)}
            />
          ))}
        </div>

        {/* Bottom Quick Callout */}
        <div className="mt-14 p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-[#0B1422] via-[#0E1B2E] to-[#0B1422] border border-[#E4D2B8]/20 flex flex-col sm:flex-row items-center justify-between gap-6 text-right">
          <div className="space-y-1">
            <h4 className="text-base sm:text-lg font-bold text-[#F7F3EE]">
              هل تحتاج قالباً خاصاً بهوية مكتبك؟
            </h4>
            <p className="text-xs sm:text-sm text-[#9DA7B5]">
              يمكنك تخصيص الألوان، الشعارات، والنصوص بالكامل من لوحة التحكم في ثوانٍ.
            </p>
          </div>

          <Link
            href="/builder"
            className="flex-shrink-0 px-6 py-2.5 rounded-full bg-[#E4D2B8] text-[#070F1B] font-bold text-xs hover:bg-[#F0DFCA] transition-colors shadow"
          >
            أنشئ موقعك الآن
          </Link>
        </div>
      </div>

      {/* Live Preview Modal */}
      {previewTemplate && (
        <Dialog
          isOpen={Boolean(previewTemplate)}
          onClose={() => setPreviewTemplate(null)}
          title={`معاينة: ${previewTemplate.name}`}
          maxWidth="3xl"
        >
          {/* Modal Toolbar */}
          <div className="px-5 py-3.5 bg-[#0B1422] border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="font-bold text-sm text-white">{previewTemplate.name}</span>
              <span className="text-xs text-[#9DA7B5] font-mono">
                {previewTemplate.subdomain}.madar.sa
              </span>
            </div>

            {/* Device Switcher */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 p-0.5 rounded-lg bg-[#070F1B] border border-white/10">
                <button
                  type="button"
                  onClick={() => setModalDevice('desktop')}
                  className={cn(
                    'p-1.5 rounded text-xs flex items-center gap-1',
                    modalDevice === 'desktop'
                      ? 'bg-[#E4D2B8] text-[#070F1B]'
                      : 'text-[#9DA7B5] hover:text-white'
                  )}
                >
                  <Monitor className="w-3.5 h-3.5" />
                  <span className="text-[10px]">حاسوب</span>
                </button>
                <button
                  type="button"
                  onClick={() => setModalDevice('mobile')}
                  className={cn(
                    'p-1.5 rounded text-xs flex items-center gap-1',
                    modalDevice === 'mobile'
                      ? 'bg-[#E4D2B8] text-[#070F1B]'
                      : 'text-[#9DA7B5] hover:text-white'
                  )}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span className="text-[10px]">هاتف</span>
                </button>
              </div>

              <Link
                href={`/site/${previewTemplate.subdomain}`}
                target="_blank"
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs inline-flex items-center gap-1"
                title="فتح في نافذة مستقلة"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* IFrame / Live Site Render */}
          <div className="p-4 sm:p-6 bg-[#040810] flex justify-center items-center min-h-[500px] max-h-[75vh] overflow-auto">
            <div
              className={cn(
                'transition-all duration-300 rounded-xl overflow-hidden shadow-2xl border border-white/10 bg-[#070F1B]',
                modalDevice === 'desktop' ? 'w-full h-[600px]' : 'w-[375px] h-[650px]'
              )}
            >
              <iframe
                src={`/site/${previewTemplate.subdomain}`}
                title={previewTemplate.name}
                className="w-full h-full border-0"
              />
            </div>
          </div>

          {/* Modal Footer Action */}
          <div className="px-6 py-4 bg-[#0B1422] border-t border-white/10 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setPreviewTemplate(null)}
              className="text-xs text-[#9DA7B5] hover:text-white"
            >
              إغلاق
            </button>
            <Link
              href={`/builder?template=${previewTemplate.id}`}
              className="px-6 py-2 rounded-full bg-[#E4D2B8] text-[#070F1B] text-xs font-bold hover:bg-[#F0DFCA]"
            >
              استخدم هذا القالب الآن
            </Link>
          </div>
        </Dialog>
      )}
    </section>
  );
};

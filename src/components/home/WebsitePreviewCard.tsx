import React, { useState } from 'react';
import { Link } from 'wouter';
import { Eye, ExternalLink, ArrowLeft, Smartphone, Monitor } from 'lucide-react';
import { cn } from '../../lib/utils.ts';

export interface TemplateData {
  id: string;
  name: string;
  category: string;
  description: string;
  subdomain: string;
  badge: string;
  color: string;
  previewImage?: string;
  features: string[];
}

export interface WebsitePreviewCardProps {
  template: TemplateData;
  onPreviewModal?: (template: TemplateData) => void;
  className?: string;
}

export const WebsitePreviewCard: React.FC<WebsitePreviewCardProps> = ({
  template,
  onPreviewModal,
  className,
}) => {
  const [viewDevice, setViewDevice] = useState<'desktop' | 'mobile'>('desktop');

  return (
    <div
      className={cn(
        'group rounded-2xl bg-[#0B1422] border border-white/[0.08] hover:border-[#E4D2B8]/40 transition-all duration-300 overflow-hidden flex flex-col shadow-[0_10px_30px_rgba(0,0,0,0.4)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.7)]',
        className
      )}
    >
      {/* Visual Preview Container */}
      <div className="relative aspect-[16/10] bg-[#070F1B] overflow-hidden border-b border-white/[0.06]">
        {/* Real site preview graphic */}
        <div className="w-full h-full relative transition-transform duration-500 group-hover:scale-[1.03]">
          <img
            src={template.previewImage || '/src/assets/images/madar_hero_venue_1790038777806.jpg'}
            alt={template.name}
            className="w-full h-full object-cover object-center filter brightness-[0.85]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B1422] via-transparent to-transparent opacity-80" />
        </div>

        {/* Floating Category Badge */}
        <div className="absolute top-3 right-3 z-10">
          <span className="px-2.5 py-1 rounded-full bg-[#070F1B]/90 backdrop-blur-md border border-[#E4D2B8]/30 text-[#E4D2B8] text-[10px] font-bold tracking-wide shadow-md">
            {template.badge}
          </span>
        </div>

        {/* Device Switcher overlay */}
        <div className="absolute top-3 left-3 z-10 flex items-center gap-1 p-0.5 rounded-lg bg-[#070F1B]/80 backdrop-blur-md border border-white/10">
          <button
            type="button"
            onClick={() => setViewDevice('desktop')}
            className={cn(
              'p-1.5 rounded-md text-[10px] transition-colors',
              viewDevice === 'desktop'
                ? 'bg-[#E4D2B8] text-[#070F1B]'
                : 'text-[#9DA7B5] hover:text-white'
            )}
            title="معاينة سطح المكتب"
          >
            <Monitor className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setViewDevice('mobile')}
            className={cn(
              'p-1.5 rounded-md text-[10px] transition-colors',
              viewDevice === 'mobile'
                ? 'bg-[#E4D2B8] text-[#070F1B]'
                : 'text-[#9DA7B5] hover:text-white'
            )}
            title="معاينة الهاتف"
          >
            <Smartphone className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Hover Quick Action */}
        <div className="absolute inset-0 bg-[#070F1B]/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3 backdrop-blur-[2px]">
          <button
            type="button"
            onClick={() => onPreviewModal && onPreviewModal(template)}
            className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-md border border-white/20 transition-all flex items-center gap-1.5"
          >
            <Eye className="w-3.5 h-3.5 text-[#E4D2B8]" />
            <span>معاينة سريعة</span>
          </button>

          <Link
            href={`/site/${template.subdomain}`}
            target="_blank"
            className="px-4 py-2 rounded-full bg-[#E4D2B8] hover:bg-[#F0DFCA] text-[#070F1B] text-xs font-bold transition-all flex items-center gap-1.5 shadow"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>فتح الموقع الحي</span>
          </Link>
        </div>
      </div>

      {/* Card Information Body */}
      <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between text-right space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-base sm:text-lg font-bold text-[#F7F3EE] group-hover:text-[#E4D2B8] transition-colors">
              {template.name}
            </h3>
            <span className="text-[11px] font-mono text-[#9DA7B5]">
              .{template.subdomain}
            </span>
          </div>

          <p className="text-xs text-[#9DA7B5] leading-relaxed line-clamp-2">
            {template.description}
          </p>

          {/* Feature tags */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {template.features.slice(0, 3).map((feat, i) => (
              <span
                key={i}
                className="px-2 py-0.5 rounded-md bg-white/[0.04] text-[10px] text-[#CBD5E1] border border-white/[0.05]"
              >
                {feat}
              </span>
            ))}
          </div>
        </div>

        {/* Card Action Buttons */}
        <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => onPreviewModal && onPreviewModal(template)}
            className="text-xs text-[#CBD5E1] hover:text-[#E4D2B8] flex items-center gap-1 transition-colors font-medium"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>معاينة</span>
          </button>

          <Link
            href={`/builder?template=${template.id}`}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#E4D2B8]/15 hover:bg-[#E4D2B8] text-[#E4D2B8] hover:text-[#070F1B] border border-[#E4D2B8]/30 hover:border-transparent text-xs font-bold transition-all duration-200"
          >
            <span>استخدم هذا القالب</span>
            <ArrowLeft className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
};

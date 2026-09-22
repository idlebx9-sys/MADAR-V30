import React from 'react';
import { Link } from 'wouter';
import { MadarLogo } from '../ui/MadarLogo.tsx';
import { cn } from '../../lib/utils.ts';

export interface MadarFooterProps {
  className?: string;
}

export const MadarFooter: React.FC<MadarFooterProps> = ({ className }) => {
  return (
    <footer className={cn('relative bg-[#050A14] text-[#CBD5E1] pt-16 pb-12 border-t border-white/[0.08]', className)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 pb-12 border-b border-white/[0.08] text-center md:text-right">
          {/* Logo & Subtitle */}
          <div className="flex flex-col items-center md:items-start space-y-2">
            <Link href="/" className="inline-block">
              <MadarLogo variant="full" size="md" showTagline={true} arabicSubtitle={true} />
            </Link>
            <p className="text-xs text-[#9DA7B5] max-w-sm">
              المنظومة السحابية المعتمدة لبناء وإدارة مواقع مكاتب ووسطاء الزواج الشرعي في العالم العربي.
            </p>
          </div>

          {/* Navigation Links matching Image 1 */}
          <nav className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 text-xs font-medium">
            <a href="/" className="text-[#CBD5E1] hover:text-[#E4D2B8] transition-colors">
              الرئيسية
            </a>
            <a href="#features" className="text-[#CBD5E1] hover:text-[#E4D2B8] transition-colors">
              المميزات
            </a>
            <a href="#showcase" className="text-[#CBD5E1] hover:text-[#E4D2B8] transition-colors">
              نماذج المواقع
            </a>
            <a href="#how-it-works" className="text-[#CBD5E1] hover:text-[#E4D2B8] transition-colors">
              كيف يعمل
            </a>
            <Link href="/builder" className="text-[#CBD5E1] hover:text-[#E4D2B8] transition-colors">
              منشئ المواقع
            </Link>
            <a href="#contact" className="text-[#CBD5E1] hover:text-[#E4D2B8] transition-colors">
              تواصل معنا
            </a>
          </nav>
        </div>

        {/* Bottom copyright line */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#64748B]">
          <p>© {new Date().getFullYear()} MADAR (مدار) — جميع الحقوق محفوظة.</p>
          <div className="flex items-center gap-6 text-[11px]">
            <span>الضوابط الشرعية والخصوصية</span>
            <span>الشروط والأحكام</span>
            <span>شهادة الأمان المشفرة</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

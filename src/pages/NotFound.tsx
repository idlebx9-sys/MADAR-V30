import React from 'react';
import { Link } from 'wouter';
import { Button } from '../components/ui/Button.tsx';
import { MadarLogo } from '../components/ui/MadarLogo.tsx';

export const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#0B1124] text-[#F8FAFC] flex flex-col items-center justify-center p-6 text-center">
      <div className="mb-6">
        <MadarLogo size="lg" />
      </div>
      <h1 className="text-5xl font-black font-heading text-transparent bg-clip-text bg-gradient-to-r from-[#6C3CE1] to-[#00D4FF] mb-3">
        404
      </h1>
      <h2 className="text-xl font-bold text-white mb-2 font-heading">الصفحة غير موجودة</h2>
      <p className="text-xs text-[#94A3B8] max-w-sm mb-6 leading-relaxed">
        عفواً، الصفحة التي تبحث عنها غير متوفرة أو تم نقلها. يرجى التأكد من الرابط أو العودة للرئيسية.
      </p>
      <Link href="/">
        <Button variant="primary">العودة إلى الصفحة الرئيسية</Button>
      </Link>
    </div>
  );
};

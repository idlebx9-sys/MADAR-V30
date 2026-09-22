import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { MadarLogo } from '../ui/MadarLogo.tsx';
import { ArrowLeft, Menu, X } from 'lucide-react';
import { cn } from '../../lib/utils.ts';
import { useAuth } from '../../hooks/useAuth.ts';

export interface MadarNavbarProps {
  className?: string;
}

export const MadarNavbar: React.FC<MadarNavbarProps> = ({ className }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [location] = useLocation();
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: '/', label: 'الرئيسية' },
    { href: '#features', label: 'المميزات' },
    { href: '#showcase', label: 'نماذج المواقع' },
    { href: '#how-it-works', label: 'كيف يعمل' },
    { href: '#contact', label: 'تواصل معنا' },
  ];

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full transition-all duration-300 border-b border-white/[0.08]',
        scrolled
          ? 'bg-[#070F1B]/95 backdrop-blur-md shadow-[0_4px_30px_rgba(0,0,0,0.5)] py-2.5'
          : 'bg-[#070F1B]/80 backdrop-blur-sm py-3.5',
        className
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Right side in RTL: Official MADAR Logo */}
        <div className="flex items-center gap-6">
          <Link href="/" className="group flex items-center transition-opacity hover:opacity-95">
            <MadarLogo variant="compact" size="sm" />
          </Link>
        </div>

        {/* Center: Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-7 lg:gap-9 text-xs font-medium">
          {navLinks.map((link) => {
            const isActive = location === link.href || (link.href === '/' && location === '/');
            return (
              <a
                key={link.label}
                href={link.href}
                className={cn(
                  'relative py-1.5 transition-colors duration-200 text-[#CBD5E1] hover:text-[#E4D2B8]',
                  isActive && 'text-[#F7F3EE]'
                )}
              >
                <span>{link.label}</span>
                {isActive && (
                  <span className="absolute bottom-0 right-0 left-0 h-[1.5px] bg-[#E4D2B8] rounded-full shadow-[0_0_8px_rgba(228,210,184,0.6)]" />
                )}
              </a>
            );
          })}
        </nav>

        {/* Left side in RTL: Primary Action & Mobile Toggle */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <Link
              href={user?.role === 'admin' ? '/admin' : '/dashboard'}
              className="hidden sm:inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#E4D2B8]/40 text-[#E4D2B8] hover:bg-[#E4D2B8]/10 text-xs font-medium transition-all"
            >
              <span>لوحة التحكم</span>
              <ArrowLeft className="w-3.5 h-3.5" />
            </Link>
          ) : (
            <div className="flex items-center gap-2.5">
              <Link
                href="/login"
                className="hidden sm:inline-block text-xs font-medium text-[#CBD5E1] hover:text-[#E4D2B8] px-2.5 py-1.5 transition-colors"
              >
                تسجيل الدخول
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center gap-2 px-4 sm:px-5 py-1.5 sm:py-2 rounded-full border border-[#E4D2B8]/80 text-[#E4D2B8] hover:bg-[#E4D2B8] hover:text-[#070F1B] text-xs font-semibold transition-all duration-200 shadow-[0_2px_12px_rgba(228,210,184,0.15)] group"
              >
                <span>ابدأ الآن</span>
                <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
              </Link>
            </div>
          )}

          {/* Mobile hamburger button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-[#CBD5E1] hover:text-[#E4D2B8] hover:bg-white/5 transition-colors"
            aria-label="القائمة"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-white/[0.08] bg-[#070F1B]/98 px-5 py-4 space-y-3 animate-in fade-in slide-in-from-top-2">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm text-[#CBD5E1] hover:text-[#E4D2B8] border-b border-white/[0.04]"
            >
              {link.label}
            </a>
          ))}
          <div className="pt-2 flex flex-col gap-2">
            {!isAuthenticated && (
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2 text-xs font-medium text-[#CBD5E1] hover:text-[#E4D2B8] rounded-xl bg-white/[0.03] border border-white/[0.08]"
              >
                تسجيل الدخول
              </Link>
            )}
            <Link
              href={isAuthenticated ? (user?.role === 'admin' ? '/admin' : '/dashboard') : '/register'}
              onClick={() => setMobileMenuOpen(false)}
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 text-xs font-semibold rounded-full bg-[#E4D2B8] text-[#070F1B] hover:bg-[#F0DFCA] transition-colors"
            >
              <span>{isAuthenticated ? 'دخول لوحة التحكم' : 'ابدأ الآن مجاناً'}</span>
              <ArrowLeft className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '../../hooks/useAuth.ts';
import { useTheme } from '../../contexts/ThemeContext.tsx';
import { Button } from '../ui/Button.tsx';
import { Dialog } from '../ui/Dialog.tsx';
import { Input } from '../ui/Input.tsx';
import { Label } from '../ui/Label.tsx';
import { MadarLogo } from '../ui/MadarLogo.tsx';
import {
  Sparkles,
  Building2,
  ShieldCheck,
  User,
  LogOut,
  Wallet,
  Menu,
  X,
  Heart,
  Sun,
  Moon,
  ChevronDown,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, isAdmin, login, register, logout, isLoggingIn, isRegistering } =
    useAuth();
  const { theme, toggleTheme } = useTheme();
  const [location, navigate] = useLocation();

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [registerRole, setRegisterRole] = useState<'owner' | 'user'>('owner');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [authError, setAuthError] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    try {
      if (authMode === 'login') {
        const loggedUser = await login({ email, password });
        if (loggedUser?.role === 'user') {
          navigate('/portal');
        } else if (loggedUser?.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
      } else {
        const newUser = await register({
          name,
          email,
          password,
          role: registerRole,
        });
        if (newUser?.role === 'user') {
          navigate('/portal');
        } else {
          navigate('/builder');
        }
      }
      setAuthModalOpen(false);
      setEmail('');
      setPassword('');
      setName('');
    } catch (err: any) {
      setAuthError(err.message || 'فشلت عملية المصادقة، يرجى التحقق من البيانات');
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-white/[0.08] bg-[#070F1B]/95 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="cursor-pointer group flex items-center">
            <MadarLogo variant="compact" size="sm" />
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-1.5 text-xs font-medium">
            <Link
              href="/"
              className={`px-3.5 py-2 rounded-xl transition-colors ${
                location === '/'
                  ? 'text-[#F7F3EE] bg-[#E4D2B8]/15 font-semibold text-[#E4D2B8]'
                  : 'text-[#9DA7B5] hover:text-[#F7F3EE] hover:bg-white/5'
              }`}
            >
              الرئيسية
            </Link>
            <Link
              href="/site/altawfeeq"
              className={`px-3.5 py-2 rounded-xl transition-colors flex items-center gap-1.5 ${
                location.startsWith('/site')
                  ? 'text-[#F7F3EE] bg-[#E4D2B8]/15 font-semibold text-[#E4D2B8]'
                  : 'text-[#9DA7B5] hover:text-[#F7F3EE] hover:bg-white/5'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-[#E4D2B8]" />
              معاينة موقع معتمد
            </Link>
            <Link
              href="/builder"
              className={`px-3.5 py-2 rounded-xl transition-colors flex items-center gap-1.5 ${
                location === '/builder'
                  ? 'text-[#F7F3EE] bg-[#E4D2B8]/15 font-semibold text-[#E4D2B8]'
                  : 'text-[#9DA7B5] hover:text-[#F7F3EE] hover:bg-white/5'
              }`}
            >
              <Building2 className="w-3.5 h-3.5 text-[#E4D2B8]" />
              بناء موقع مكتب
            </Link>

            {/* Client Portal Link */}
            {(!isAuthenticated || user?.role === 'user') && (
              <Link
                href="/portal"
                className={`px-3.5 py-2 rounded-xl transition-colors flex items-center gap-1.5 ${
                  location.startsWith('/portal') || location.startsWith('/my-requests')
                    ? 'text-[#F7F3EE] bg-[#E4D2B8]/15 font-semibold text-[#E4D2B8]'
                    : 'text-[#9DA7B5] hover:text-[#F7F3EE] hover:bg-white/5'
                }`}
              >
                <Heart className="w-3.5 h-3.5 text-[#E4D2B8]" />
                <span>{isAuthenticated ? 'طلباتي' : 'متابعة طلب زواج'}</span>
              </Link>
            )}

            {isAuthenticated && user?.role !== 'user' && (
              <Link
                href="/dashboard"
                className={`px-3.5 py-2 rounded-xl transition-colors flex items-center gap-1.5 ${
                  location.startsWith('/dashboard')
                    ? 'text-[#F7F3EE] bg-[#E4D2B8]/15 font-semibold text-[#E4D2B8]'
                    : 'text-[#9DA7B5] hover:text-[#F7F3EE] hover:bg-white/5'
                }`}
              >
                لوحة تحكم المكتب
              </Link>
            )}

            {isAdmin && (
              <Link
                href="/admin"
                className={`px-3.5 py-2 rounded-xl transition-colors flex items-center gap-1.5 ${
                  location === '/admin'
                    ? 'text-[#22C55E] bg-[#22C55E]/15 font-semibold'
                    : 'text-[#9DA7B5] hover:text-[#22C55E] hover:bg-white/5'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[#22C55E]" />
                إدارة المنصة
              </Link>
            )}
          </nav>

          {/* User & Theme Actions */}
          <div className="hidden sm:flex items-center gap-2.5">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="w-9 h-9 rounded-xl bg-[#0B1422] border border-white/10 text-[#9DA7B5] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              title={theme === 'dark' ? 'تفعيل الوضع الفاتح' : 'تفعيل الوضع الداكن'}
              aria-label="تغيير المظهر"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 bg-[#0B1422] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-[#F8FAFC] hover:border-[#E4D2B8]/40 transition-colors cursor-pointer"
                >
                  <div className="w-6 h-6 rounded-lg bg-[#E4D2B8]/15 text-[#E4D2B8] flex items-center justify-center">
                    <User className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-medium truncate max-w-[120px]">{user?.name}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-[#9DA7B5]" />
                </button>

                {userDropdownOpen && (
                  <div
                    className="absolute left-0 mt-2 w-48 rounded-2xl bg-[#0B1422] border border-white/10 shadow-2xl py-2 z-50 text-right"
                    onClick={() => setUserDropdownOpen(false)}
                  >
                    <div className="px-4 py-2 border-b border-white/5">
                      <div className="text-xs font-bold text-white truncate">{user?.name}</div>
                      <div className="text-[10px] text-[#9DA7B5] truncate">{user?.email}</div>
                    </div>

                    {user?.role !== 'user' && (
                      <Link
                        href="/dashboard?tab=wallet"
                        className="flex items-center gap-2 px-4 py-2 text-xs text-[#94A3B8] hover:text-white hover:bg-white/5"
                      >
                        <Wallet className="w-3.5 h-3.5 text-[#FBBF24]" />
                        <span>المحفظة والسيولة</span>
                      </Link>
                    )}

                    <Link
                      href={user?.role === 'user' ? '/portal' : '/dashboard'}
                      className="flex items-center gap-2 px-4 py-2 text-xs text-[#94A3B8] hover:text-white hover:bg-white/5"
                    >
                      <User className="w-3.5 h-3.5 text-[#00D4FF]" />
                      <span>{user?.role === 'user' ? 'بوابة المستفيد' : 'لوحة التحكم'}</span>
                    </Link>

                    {isAdmin && (
                      <Link
                        href="/admin"
                        className="flex items-center gap-2 px-4 py-2 text-xs text-[#22C55E] hover:bg-white/5"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>الإدارة العليا</span>
                      </Link>
                    )}

                    <button
                      onClick={() => logout()}
                      className="w-full flex items-center gap-2 px-4 py-2 text-xs text-[#EF4444] hover:bg-[#EF4444]/10 transition-colors text-right cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>تسجيل الخروج</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setAuthMode('login');
                    setAuthModalOpen(true);
                  }}
                  className="text-xs text-[#94A3B8] hover:text-white"
                >
                  تسجيل الدخول
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    setAuthMode('register');
                    setAuthModalOpen(true);
                  }}
                  className="text-xs"
                >
                  ابدأ الآن
                </Button>
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={toggleTheme}
              className="w-8 h-8 rounded-xl bg-[#151C32] border border-white/10 text-[#94A3B8] hover:text-white flex items-center justify-center cursor-pointer"
              aria-label="تغيير المظهر"
            >
              {theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            </button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-white/10 bg-[#0B1124] px-4 pt-3 pb-5 space-y-2">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl text-xs text-[#94A3B8] hover:text-white hover:bg-white/5"
            >
              الرئيسية
            </Link>
            <Link
              href="/site/altawfeeq"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl text-xs text-[#94A3B8] hover:text-white hover:bg-white/5"
            >
              معاينة موقع معتمد
            </Link>
            <Link
              href="/builder"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl text-xs text-[#94A3B8] hover:text-white hover:bg-white/5"
            >
              بناء موقع مكتب
            </Link>
            {(!isAuthenticated || user?.role === 'user') && (
              <Link
                href="/portal"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-xs text-[#FBBF24] hover:bg-white/5 font-semibold"
              >
                {isAuthenticated ? 'بوابة المستفيد (طلباتي)' : 'متابعة طلب الزواج'}
              </Link>
            )}
            {isAuthenticated && user?.role !== 'user' && (
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-xs text-[#6C3CE1] hover:bg-white/5 font-bold"
              >
                لوحة تحكم المكتب
              </Link>
            )}
            {isAdmin && (
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-xs text-[#22C55E] hover:bg-white/5"
              >
                إدارة المنصة
              </Link>
            )}
            <div className="pt-3 border-t border-white/10 flex flex-col gap-2">
              {isAuthenticated ? (
                <Button variant="danger" size="sm" onClick={() => logout()}>
                  تسجيل الخروج
                </Button>
              ) : (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setAuthMode('login');
                      setAuthModalOpen(true);
                    }}
                  >
                    تسجيل الدخول
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setAuthMode('register');
                      setAuthModalOpen(true);
                    }}
                  >
                    إنشاء حساب جديد
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Auth Modal */}
      <Dialog
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        title={authMode === 'login' ? 'تسجيل الدخول إلى مدار' : 'إنشاء حساب جديد في مدار'}
        description={
          authMode === 'login'
            ? 'أدخل بيانات حسابك لإدارة موقع مكتبك أو متابعة استمارة الزواج'
            : 'اختر نوع الحساب للانضمام إلى منظومة مكاتب الزواج المعتمدة'
        }
      >
        <form onSubmit={handleAuthSubmit} className="space-y-4 pt-2">
          {authError && (
            <div className="p-3 rounded-xl bg-[#EF4444]/15 border border-[#EF4444]/30 text-[#EF4444] text-xs">
              {authError}
            </div>
          )}

          {authMode === 'register' && (
            <div className="space-y-3">
              <div>
                <Label className="mb-1.5 block">نوع الحساب:</Label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRegisterRole('owner')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      registerRole === 'owner'
                        ? 'bg-[#6C3CE1]/20 border-[#6C3CE1] text-white'
                        : 'bg-[#151C32] border-white/10 text-[#94A3B8]'
                    }`}
                  >
                    صاحب مكتب زواج
                  </button>
                  <button
                    type="button"
                    onClick={() => setRegisterRole('user')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      registerRole === 'user'
                        ? 'bg-[#22C55E]/20 border-[#22C55E] text-[#22C55E]'
                        : 'bg-[#151C32] border-white/10 text-[#94A3B8]'
                    }`}
                  >
                    طالب زواج (مستفيد)
                  </button>
                </div>
              </div>

              <div>
                <Label required>
                  {registerRole === 'owner' ? 'اسم صاحب المكتب أو المأذون' : 'الاسم الكامل'}
                </Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={registerRole === 'owner' ? 'الشيخ عبدالرحمن التميمي' : 'محمد بن سعد'}
                  required
                />
              </div>
            </div>
          )}

          <div>
            <Label required>البريد الإلكتروني</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              required
            />
          </div>

          <div>
            <Label required>كلمة المرور</Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full mt-2"
            isLoading={isLoggingIn || isRegistering}
          >
            {authMode === 'login'
              ? 'دخول إلى الحساب'
              : registerRole === 'owner'
              ? 'إنشاء حساب مكتب والبدء'
              : 'إنشاء حساب مستفيد'}
          </Button>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => {
                setAuthMode(authMode === 'login' ? 'register' : 'login');
                setAuthError('');
              }}
              className="text-xs text-[#00D4FF] hover:underline cursor-pointer"
            >
              {authMode === 'login' ? 'ليس لديك حساب؟ أنشئ حساباً جديداً' : 'لديك حساب بالفعل؟ سجّل دخولك'}
            </button>
          </div>
        </form>
      </Dialog>
    </>
  );
};

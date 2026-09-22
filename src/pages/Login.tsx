import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '../hooks/useAuth.ts';
import { Navbar } from '../components/layout/Navbar.tsx';
import { Footer } from '../components/layout/Footer.tsx';
import { Button } from '../components/ui/Button.tsx';
import { Card } from '../components/ui/Card.tsx';
import { Input } from '../components/ui/Input.tsx';
import { Label } from '../components/ui/Label.tsx';
import {
  ShieldCheck,
  Lock,
  Mail,
  Eye,
  EyeOff,
  Sparkles,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

export const Login: React.FC = () => {
  const { login, isLoggingIn, user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // If already authenticated, redirect based on user role
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'admin') {
        setLocation('/admin');
      } else if (user.role === 'user') {
        setLocation('/portal');
      } else {
        setLocation('/dashboard');
      }
    }
  }, [isAuthenticated, user, setLocation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!email || !password) {
      setErrorMsg('يرجى ملء كافة الحقول المطلوبة');
      return;
    }

    try {
      const loggedUser = await login({
        email: email.trim(),
        password,
      });

      setSuccessMsg(`أهلاً بك مجدداً يا ${loggedUser?.name || 'مستخدمنا الكريم'}! جاري التحويل...`);

      setTimeout(() => {
        if (loggedUser?.role === 'admin') {
          setLocation('/admin');
        } else if (loggedUser?.role === 'user') {
          setLocation('/portal');
        } else {
          setLocation('/dashboard');
        }
      }, 700);
    } catch (err: any) {
      setErrorMsg(err.message || 'فشل تسجيل الدخول. تحقق من البريد الإلكتروني وكلمة المرور.');
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1124] text-[#F8FAFC] flex flex-col justify-between antialiased selection:bg-[#6C3CE1]/30 selection:text-white text-right">
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-16 relative overflow-hidden">
        <div className="max-w-md w-full relative z-10">
          <Card className="p-8 border-white/5 shadow-2xl space-y-6">
            {/* Header / Logo */}
            <div className="text-center space-y-2">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-[#6C3CE1]/15 border border-[#6C3CE1]/30 flex items-center justify-center text-[#A78BFA]">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-black font-heading text-white">
                تسجيل الدخول إلى مَـدَار
              </h1>
              <p className="text-xs text-[#94A3B8] max-w-sm mx-auto leading-relaxed">
                بوابة الدخول الرسمية لأصحاب مكاتب الزواج الشرعية والمستفيدين
              </p>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-[#EF4444]/15 border border-[#EF4444]/30 text-[#FCA5A5] text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Success Message */}
            {successMsg && (
              <div className="p-3.5 rounded-xl bg-[#22C55E]/15 border border-[#22C55E]/30 text-[#86EFAC] text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <Label required>البريد الإلكتروني المسجل</Label>
                <div className="relative mt-1">
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="pr-10 bg-[#0B1124] border-white/10"
                    required
                    dir="ltr"
                  />
                  <Mail className="w-4 h-4 text-[#94A3B8] absolute right-3.5 top-3.5 pointer-events-none" />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <Label required>كلمة المرور</Label>
                  <span className="text-[11px] text-[#64748B]">مشفرة بأمان</span>
                </div>
                <div className="relative mt-1">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pr-10 pl-10 bg-[#0B1124] border-white/10"
                    required
                    dir="ltr"
                  />
                  <Lock className="w-4 h-4 text-[#94A3B8] absolute right-3.5 top-3.5 pointer-events-none" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3.5 top-3.5 text-[#94A3B8] hover:text-white cursor-pointer"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-[#94A3B8] pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-white/20 bg-[#0B1124] text-[#6C3CE1] focus:ring-[#6C3CE1]/30"
                  />
                  <span>تذكر تسجيل دخولي</span>
                </label>
                <span className="text-[#64748B]">حفظ الجلسة الآمنة</span>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="md"
                className="w-full mt-2 font-bold"
                disabled={isLoggingIn}
              >
                {isLoggingIn ? 'جاري التحقق وتسجيل الدخول...' : 'تسجيل الدخول'}
              </Button>
            </form>

            {/* Link to Register */}
            <div className="pt-4 text-center text-xs text-[#94A3B8] border-t border-white/5">
              ليس لديك حساب في مدار بعد؟{' '}
              <Link href="/register" className="text-[#6C3CE1] hover:text-[#A78BFA] font-bold hover:underline">
                إنشاء حساب حقيقي جديد
              </Link>
            </div>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

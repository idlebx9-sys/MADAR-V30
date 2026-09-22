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
  User,
  Phone,
  MapPin,
  Eye,
  EyeOff,
  Building2,
  Heart,
  CheckCircle2,
  AlertCircle,
  Check,
} from 'lucide-react';

export const Register: React.FC = () => {
  const { register, isRegistering, user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  // Role selector: owner or client
  const [role, setRole] = useState<'owner' | 'user'>('owner');

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('الرياض');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(true);

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Redirect if already authenticated
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

    if (!name.trim()) {
      setErrorMsg('يرجى إدخال الاسم الكامل');
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('يرجى إدخال بريد إلكتروني صحيح');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('كلمة المرور يجب أن لا تقل عن 6 خانات لضمان أمان حسابك');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('كلمتا المرور غير متطابقتين');
      return;
    }

    if (!termsAccepted) {
      setErrorMsg('يجب الموافقة على ميثاق الأمانة والسرية والضوابط الشرعية للمنصة');
      return;
    }

    try {
      await register({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        role,
        phone: phone.trim(),
        city: city.trim(),
      });

      setSuccessMsg(
        `مبارك! تم إنشاء حسابك بنجاح كـ (${
          role === 'owner' ? 'صاحب مكتب زواج' : 'مستفيد'
        }). جاري نقلك إلى مساحتك الخاصة...`
      );

      setTimeout(() => {
        if (role === 'owner') {
          setLocation('/builder');
        } else {
          setLocation('/portal');
        }
      }, 900);
    } catch (err: any) {
      setErrorMsg(err.message || 'فشل إنشاء الحساب. قد يكون البريد الإلكتروني مسجلاً مسبقاً.');
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1124] text-[#F8FAFC] flex flex-col justify-between antialiased selection:bg-[#6C3CE1]/30 selection:text-white text-right">
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-16 relative overflow-hidden">
        <div className="max-w-xl w-full relative z-10">
          <Card className="p-8 border-white/5 shadow-2xl space-y-6">
            {/* Header */}
            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#6C3CE1]/15 border border-[#6C3CE1]/30 text-xs font-semibold text-[#A78BFA] mb-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>تسجيل حساب موثوق ومحمي في مَـدَار</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black font-heading text-white">
                إنشاء حساب جديد
              </h1>
              <p className="text-xs text-[#94A3B8] max-w-md mx-auto leading-relaxed">
                انضم لمنصة مدار لتأسيس موقعك الرسمي للوساطة الشرعية أو لمتابعة استمارات الزواج بأمان تام
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

            {/* Account Type Selection Cards */}
            <div>
              <Label className="mb-2 block">اختر نوع الحساب:</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('owner')}
                  className={`p-4 rounded-2xl border text-right transition-all cursor-pointer flex flex-col justify-between ${
                    role === 'owner'
                      ? 'bg-[#6C3CE1]/20 border-[#6C3CE1] shadow-lg shadow-[#6C3CE1]/20'
                      : 'bg-[#0B1124] border-white/5 hover:border-white/15'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-9 h-9 rounded-xl bg-[#6C3CE1]/20 flex items-center justify-center text-[#A78BFA]">
                      <Building2 className="w-5 h-5" />
                    </div>
                    {role === 'owner' && <Check className="w-4 h-4 text-[#A78BFA]" />}
                  </div>
                  <span className="font-bold text-white text-xs sm:text-sm block">صاحب مكتب زواج / وسيط</span>
                  <span className="text-[11px] text-[#94A3B8] mt-1 leading-snug">
                    إطلاق موقع احترافي، إدارة الطلبات والمطابقة الشرعية
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('user')}
                  className={`p-4 rounded-2xl border text-right transition-all cursor-pointer flex flex-col justify-between ${
                    role === 'user'
                      ? 'bg-[#22C55E]/20 border-[#22C55E] shadow-lg shadow-[#22C55E]/20'
                      : 'bg-[#0B1124] border-white/5 hover:border-white/15'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-9 h-9 rounded-xl bg-[#22C55E]/20 flex items-center justify-center text-[#22C55E]">
                      <Heart className="w-5 h-5" />
                    </div>
                    {role === 'user' && <Check className="w-4 h-4 text-[#22C55E]" />}
                  </div>
                  <span className="font-bold text-white text-xs sm:text-sm block">مستفيد / باحث عن الزواج</span>
                  <span className="text-[11px] text-[#94A3B8] mt-1 leading-snug">
                    تقديم استمارات الزواج ومتابعة مسار المطابقة والتواصل
                  </span>
                </button>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <Label required>
                  {role === 'owner' ? 'اسم صاحب المكتب أو المأذون الشرعي' : 'الاسم الكامل أو الثلاثي'}
                </Label>
                <div className="relative mt-1">
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={role === 'owner' ? 'الشيخ عبدالمحسن السبيعي' : 'محمد بن سعد التميمي'}
                    className="pr-10 bg-[#0B1124] border-white/10"
                    required
                  />
                  <User className="w-4 h-4 text-[#94A3B8] absolute right-3.5 top-3.5 pointer-events-none" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label required>البريد الإلكتروني الحقيقي</Label>
                  <div className="relative mt-1">
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@domain.com"
                      className="pr-10 bg-[#0B1124] border-white/10"
                      required
                      dir="ltr"
                    />
                    <Mail className="w-4 h-4 text-[#94A3B8] absolute right-3.5 top-3.5 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <Label>رقم الجوال (واتساب)</Label>
                  <div className="relative mt-1">
                    <Input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+9665xxxxxxxx"
                      className="pr-10 bg-[#0B1124] border-white/10"
                      dir="ltr"
                    />
                    <Phone className="w-4 h-4 text-[#94A3B8] absolute right-3.5 top-3.5 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div>
                <Label>المدينة أو المنطقة</Label>
                <div className="relative mt-1">
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full h-10 rounded-xl bg-[#0B1124] border border-white/10 px-4 pr-10 text-xs text-white focus:outline-none focus:border-[#6C3CE1]"
                  >
                    <option value="الرياض">الرياض</option>
                    <option value="مكة المكرمة">مكة المكرمة</option>
                    <option value="المدينة المنورة">المدينة المنورة</option>
                    <option value="جدة">جدة</option>
                    <option value="الدمام">الدمام والمنطقة الشرقية</option>
                    <option value="القصيم">القصيم / بريدة</option>
                    <option value="عسير">عسير / أبها</option>
                    <option value="حائل">حائل</option>
                    <option value="تبوك">تبوك</option>
                    <option value="مدينة أخرى">مدينة أخرى / خارج المملكة</option>
                  </select>
                  <MapPin className="w-4 h-4 text-[#94A3B8] absolute right-3.5 top-3.5 pointer-events-none" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label required>كلمة المرور (6 خانات فأكثر)</Label>
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

                <div>
                  <Label required>تأكيد كلمة المرور</Label>
                  <div className="relative mt-1">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="pr-10 bg-[#0B1124] border-white/10"
                      required
                      dir="ltr"
                    />
                    <Lock className="w-4 h-4 text-[#94A3B8] absolute right-3.5 top-3.5 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Password Match Helper */}
              {password && confirmPassword && (
                <div className="text-[11px]">
                  {password === confirmPassword ? (
                    <span className="text-[#22C55E] flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      كلمتا المرور متطابقتان تماماً
                    </span>
                  ) : (
                    <span className="text-[#EF4444] flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      كلمتا المرور غير متطابقتين
                    </span>
                  )}
                </div>
              )}

              {/* Terms & Confidentiality Charter */}
              <div className="p-3.5 rounded-xl bg-[#0B1124] border border-white/5 space-y-2">
                <label className="flex items-start gap-2.5 cursor-pointer text-[11px] text-[#94A3B8]">
                  <input
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="mt-0.5 rounded border-white/20 bg-[#0B1124] text-[#6C3CE1] focus:ring-[#6C3CE1]/30"
                    required
                  />
                  <span>
                    أوافق على{' '}
                    <strong className="text-white">ميثاق الأمانة والسرية والضوابط الشرعية</strong> المعمول بها في
                    منصة مدار، وأتعهد بصحة البيانات المدخلة وعدم استخدام الحساب إلا في المقاصد المشروعة.
                  </span>
                </label>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="md"
                className="w-full mt-2 font-bold"
                disabled={isRegistering}
              >
                {isRegistering
                  ? 'جاري حفظ الحساب في قاعدة البيانات...'
                  : role === 'owner'
                  ? 'تسجيل حساب صاحب مكتب وبدء الإطلاق'
                  : 'تسجيل حساب مستفيد ومتابعة الطلبات'}
              </Button>
            </form>

            {/* Link to Login */}
            <div className="pt-3 text-center text-xs text-[#94A3B8] border-t border-white/5">
              لديك حساب بالفعل في مدار؟{' '}
              <Link href="/login" className="text-[#6C3CE1] hover:text-[#A78BFA] font-bold hover:underline">
                تسجيل الدخول
              </Link>
            </div>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

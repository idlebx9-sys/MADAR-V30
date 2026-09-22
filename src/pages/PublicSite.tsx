import React, { useState, useEffect } from 'react';
import { useRoute, Link } from 'wouter';
import { trpc } from '../lib/trpc.ts';
import { useAuth } from '../hooks/useAuth.ts';
import { useToast } from '../contexts/ToastContext.tsx';
import { MarriageRequestForm } from '../components/marriage/MarriageRequestForm.tsx';
import { SuccessStoryCard } from '../components/marriage/SuccessStoryCard.tsx';
import { Button } from '../components/ui/Button.tsx';
import { Card } from '../components/ui/Card.tsx';
import { Badge } from '../components/ui/Card.tsx';
import { EmptyState } from '../components/ui/EmptyState.tsx';
import {
  Heart,
  ShieldCheck,
  Clock,
  Phone,
  MessageCircle,
  Mail,
  MapPin,
  ChevronDown,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Send,
  Building2,
  Calendar,
} from 'lucide-react';
import { formatCurrency } from '../lib/utils.ts';

type DesignSystem =
  | 'luxury'
  | 'modern'
  | 'family'
  | 'professional'
  | 'traditional'
  | 'islamic'
  | 'royal'
  | 'minimal'
  | 'elegant'
  | 'modern-arabic'
  | 'classic';

export const PublicSite: React.FC = () => {
  const [, params] = useRoute('/site/:subdomain');
  const subdomain =
    params && typeof params === 'object' && 'subdomain' in params
      ? (params as any).subdomain
      : 'altawfeeq';
  const { isAdmin } = useAuth();
  const { addToast } = useToast();

  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [inquiryName, setInquiryName] = useState('');
  const [inquiryPhone, setInquiryPhone] = useState('');
  const [inquiryMessage, setInquiryMessage] = useState('');
  const [inquirySending, setInquirySending] = useState(false);

  const sendMessageMutation = trpc.messages.send.useMutation();
  const recordVisitMutation = trpc.publicSite.recordVisit.useMutation();

  const { data, isLoading, error } = trpc.publicSite.getData.useQuery(
    { subdomain },
    { retry: false }
  );

  useEffect(() => {
    if (data?.site?.id) {
      recordVisitMutation.mutate({
        siteId: data.site.id,
        path: window.location.pathname,
        referrer: document.referrer || '',
      });
    }
  }, [data?.site?.id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0B1124] text-[#F8FAFC] flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#6C3CE1]/20 border border-[#6C3CE1] flex items-center justify-center animate-pulse">
            <Building2 className="w-7 h-7 text-[#A78BFA]" />
          </div>
          <p className="text-[#94A3B8] font-heading text-sm font-medium">
            جاري تحميل موقع المكتب المعتمد...
          </p>
        </div>
      </div>
    );
  }

  if (error || !data || !data.site) {
    return (
      <div className="min-h-screen bg-[#0B1124] text-[#F8FAFC] flex flex-col items-center justify-center p-6 text-center">
        <EmptyState
          icon={Building2}
          title="المكتب غير موجود"
          description={`لم نتمكن من العثور على موقع مكتب الزواج برابط (${subdomain}). قد يكون الرابط غير صحيح أو قيد الإعداد.`}
          actionLabel="العودة لمنصة مدار"
          onAction={() => window.location.assign('/')}
        />
      </div>
    );
  }

  const { site, packages, faqs, successStories, articles } = data;

  // Gatekeeper: It is impossible for anyone to view unapproved sites
  if (site.status !== 'active') {
    return (
      <div className="min-h-screen bg-[#0B1124] text-[#F8FAFC] flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md w-full p-6 sm:p-8 rounded-2xl bg-[#11182B] border border-white/10 shadow-2xl space-y-6">
          {site.status === 'pending' ? (
            <>
              <div className="w-14 h-14 rounded-2xl bg-[#FBBF24]/15 border border-[#FBBF24]/30 flex items-center justify-center mx-auto text-[#FBBF24]">
                <Clock className="w-7 h-7 animate-pulse" />
              </div>
              <div>
                <span className="px-3 py-1 rounded-full bg-[#FBBF24]/15 border border-[#FBBF24]/30 text-[#FBBF24] text-xs font-bold inline-block mb-3">
                  طلب تدشين بانتظار الاعتماد الإداري
                </span>
                <h2 className="text-xl font-bold font-heading text-white mb-1">{site.name}</h2>
                <p className="text-xs text-[#00D4FF] font-mono" dir="ltr">
                  https://{site.subdomain}.madar.sa
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#151C32] border border-white/5 text-right space-y-2 text-xs">
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-[#94A3B8]">صاحب المكتب:</span>
                  <span className="font-bold text-white">{site.ownerName || '—'}</span>
                </div>
                {site.officeLicenseNumber && (
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-[#94A3B8]">رقم الترخيص:</span>
                    <span className="font-bold text-white">{site.officeLicenseNumber}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-[#94A3B8]">حالة الموقع:</span>
                  <span className="font-bold text-[#FBBF24]">قيد التدقيق من قبل إدارة مدار</span>
                </div>
              </div>

              <p className="text-xs text-[#94A3B8] leading-relaxed">
                يُشترط استيفاء الاعتماد الرسمي لضمان أمان وخصوصية استمارات المتقدمين.
              </p>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                {isAdmin ? (
                  <Link href="/admin">
                    <Button variant="primary" className="w-full sm:w-auto">
                      <ShieldCheck className="w-4 h-4 ml-1.5" />
                      لوحة الإدارة للاعتماد
                    </Button>
                  </Link>
                ) : (
                  <Link href="/">
                    <Button variant="secondary" className="w-full sm:w-auto">
                      العودة للمنصة الرئيسية
                    </Button>
                  </Link>
                )}
              </div>
            </>
          ) : site.status === 'suspended' ? (
            <>
              <div className="w-14 h-14 rounded-2xl bg-[#EF4444]/15 border border-[#EF4444]/30 flex items-center justify-center mx-auto text-[#EF4444]">
                <AlertTriangle className="w-7 h-7" />
              </div>
              <h2 className="text-xl font-bold font-heading text-[#EF4444]">
                موقع هذا المكتب معلق مؤقتاً
              </h2>
              <p className="text-xs text-[#94A3B8]">
                تم تعليق موقع المكتب بقرار إداري احترازي من إدارة المنصة.
              </p>
              {site.adminReviewNotes && (
                <div className="p-3 bg-[#EF4444]/10 border border-[#EF4444]/20 text-[#EF4444] text-xs rounded-xl">
                  الملاحظة الإدارية: {site.adminReviewNotes}
                </div>
              )}
              <Link href="/">
                <Button variant="secondary">العودة للرئيسية</Button>
              </Link>
            </>
          ) : (
            <>
              <div className="w-14 h-14 rounded-2xl bg-[#EF4444]/15 border border-[#EF4444]/30 flex items-center justify-center mx-auto text-[#EF4444]">
                <XCircle className="w-7 h-7" />
              </div>
              <h2 className="text-xl font-bold font-heading text-white">
                تعذر اعتماد موقع هذا المكتب
              </h2>
              <p className="text-xs text-[#94A3B8]">
                تم رفض طلب الاعتماد لعدم استيفاء الاشتراطات الرسمية للمنظومة.
              </p>
              <Link href="/">
                <Button variant="secondary">العودة للرئيسية</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    );
  }

  // Resolve 6 distinct canonical design systems
  const rawTemplate = (site.template || 'luxury').toLowerCase().trim();
  let designSystem: DesignSystem = 'luxury';
  if (rawTemplate === 'modern' || rawTemplate.includes('minimal')) {
    designSystem = 'modern';
  } else if (rawTemplate === 'family' || rawTemplate.includes('elegant')) {
    designSystem = 'family';
  } else if (rawTemplate === 'professional' || rawTemplate.includes('modern-arabic')) {
    designSystem = 'professional';
  } else if (rawTemplate === 'traditional' || rawTemplate.includes('classic')) {
    designSystem = 'traditional';
  } else if (rawTemplate === 'islamic') {
    designSystem = 'islamic';
  } else {
    designSystem = 'luxury';
  }

  // Visual Tokens mapped by Design System
  const systemStyles: Record<
    DesignSystem,
    {
      pageBg: string;
      heroBg: string;
      accentColor: string;
      accentBorder: string;
      accentBadgeBg: string;
      cardBg: string;
      primaryButtonVariant: 'primary' | 'gold' | 'emerald' | 'secondary';
      label: string;
      fontClass: string;
    }
  > = {
    luxury: {
      pageBg: 'bg-[#0B1124]',
      heroBg: 'bg-gradient-to-b from-[#11182B] via-[#0B1124] to-[#0B1124]',
      accentColor: '#FBBF24',
      accentBorder: 'border-[#FBBF24]/30',
      accentBadgeBg: 'bg-[#FBBF24]/10 text-[#FBBF24] border-[#FBBF24]/30',
      cardBg: 'bg-[#11182B]',
      primaryButtonVariant: 'gold',
      label: 'الفاخر النخبوي',
      fontClass: 'font-heading tracking-normal',
    },
    royal: {
      pageBg: 'bg-[#0B1124]',
      heroBg: 'bg-gradient-to-b from-[#11182B] via-[#0B1124] to-[#0B1124]',
      accentColor: '#FBBF24',
      accentBorder: 'border-[#FBBF24]/30',
      accentBadgeBg: 'bg-[#FBBF24]/10 text-[#FBBF24] border-[#FBBF24]/30',
      cardBg: 'bg-[#11182B]',
      primaryButtonVariant: 'gold',
      label: 'الفاخر النخبوي',
      fontClass: 'font-heading tracking-normal',
    },
    modern: {
      pageBg: 'bg-[#0B1124]',
      heroBg: 'bg-gradient-to-b from-[#151C32]/60 to-[#0B1124]',
      accentColor: '#6C3CE1',
      accentBorder: 'border-[#6C3CE1]/30',
      accentBadgeBg: 'bg-[#6C3CE1]/15 text-[#A78BFA] border-[#6C3CE1]/30',
      cardBg: 'bg-[#11182B]',
      primaryButtonVariant: 'primary',
      label: 'العصري الحديث',
      fontClass: 'font-sans tracking-wide',
    },
    minimal: {
      pageBg: 'bg-[#0B1124]',
      heroBg: 'bg-gradient-to-b from-[#151C32]/60 to-[#0B1124]',
      accentColor: '#6C3CE1',
      accentBorder: 'border-[#6C3CE1]/30',
      accentBadgeBg: 'bg-[#6C3CE1]/15 text-[#A78BFA] border-[#6C3CE1]/30',
      cardBg: 'bg-[#11182B]',
      primaryButtonVariant: 'primary',
      label: 'العصري الحديث',
      fontClass: 'font-sans tracking-wide',
    },
    family: {
      pageBg: 'bg-[#0B1124]',
      heroBg: 'bg-gradient-to-b from-[#0e172e] via-[#0B1124] to-[#0B1124]',
      accentColor: '#00D4FF',
      accentBorder: 'border-[#00D4FF]/30',
      accentBadgeBg: 'bg-[#00D4FF]/10 text-[#00D4FF] border-[#00D4FF]/30',
      cardBg: 'bg-[#11182B]',
      primaryButtonVariant: 'primary',
      label: 'الأسري الدافئ',
      fontClass: 'font-heading',
    },
    elegant: {
      pageBg: 'bg-[#0B1124]',
      heroBg: 'bg-gradient-to-b from-[#0e172e] via-[#0B1124] to-[#0B1124]',
      accentColor: '#00D4FF',
      accentBorder: 'border-[#00D4FF]/30',
      accentBadgeBg: 'bg-[#00D4FF]/10 text-[#00D4FF] border-[#00D4FF]/30',
      cardBg: 'bg-[#11182B]',
      primaryButtonVariant: 'primary',
      label: 'الأسري الدافئ',
      fontClass: 'font-heading',
    },
    professional: {
      pageBg: 'bg-[#0B1124]',
      heroBg: 'bg-gradient-to-b from-[#101b33] via-[#0B1124] to-[#0B1124]',
      accentColor: '#22C55E',
      accentBorder: 'border-[#22C55E]/30',
      accentBadgeBg: 'bg-[#22C55E]/15 text-[#22C55E] border-[#22C55E]/30',
      cardBg: 'bg-[#11182B]',
      primaryButtonVariant: 'emerald',
      label: 'المهني المعتمد',
      fontClass: 'font-sans font-medium',
    },
    'modern-arabic': {
      pageBg: 'bg-[#0B1124]',
      heroBg: 'bg-gradient-to-b from-[#101b33] via-[#0B1124] to-[#0B1124]',
      accentColor: '#22C55E',
      accentBorder: 'border-[#22C55E]/30',
      accentBadgeBg: 'bg-[#22C55E]/15 text-[#22C55E] border-[#22C55E]/30',
      cardBg: 'bg-[#11182B]',
      primaryButtonVariant: 'emerald',
      label: 'المهني المعتمد',
      fontClass: 'font-sans font-medium',
    },
    traditional: {
      pageBg: 'bg-[#0B1124]',
      heroBg: 'bg-gradient-to-b from-[#1a140a] via-[#0B1124] to-[#0B1124]',
      accentColor: '#EAB308',
      accentBorder: 'border-[#EAB308]/30',
      accentBadgeBg: 'bg-[#EAB308]/15 text-[#EAB308] border-[#EAB308]/30',
      cardBg: 'bg-[#11182B]',
      primaryButtonVariant: 'gold',
      label: 'التقليدي الأصيل',
      fontClass: 'font-heading',
    },
    classic: {
      pageBg: 'bg-[#0B1124]',
      heroBg: 'bg-gradient-to-b from-[#1a140a] via-[#0B1124] to-[#0B1124]',
      accentColor: '#EAB308',
      accentBorder: 'border-[#EAB308]/30',
      accentBadgeBg: 'bg-[#EAB308]/15 text-[#EAB308] border-[#EAB308]/30',
      cardBg: 'bg-[#11182B]',
      primaryButtonVariant: 'gold',
      label: 'التقليدي الأصيل',
      fontClass: 'font-heading',
    },
    islamic: {
      pageBg: 'bg-[#0B1124]',
      heroBg: 'bg-gradient-to-b from-[#0a1c14] via-[#0B1124] to-[#0B1124]',
      accentColor: '#10B981',
      accentBorder: 'border-[#10B981]/30',
      accentBadgeBg: 'bg-[#10B981]/15 text-[#10B981] border-[#10B981]/30',
      cardBg: 'bg-[#11182B]',
      primaryButtonVariant: 'emerald',
      label: 'الشرعي الوقور',
      fontClass: 'font-heading',
    },
  };

  const currentTheme = systemStyles[designSystem];

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!site?.id) return;
    if (!inquiryName.trim() || !inquiryPhone.trim() || !inquiryMessage.trim()) {
      addToast({
        title: 'بيانات ناقصة',
        description: 'يرجى إدخال الاسم، رقم الجوال، وتفاصيل الاستفسار.',
        type: 'error',
      });
      return;
    }

    setInquirySending(true);
    try {
      await sendMessageMutation.mutateAsync({
        siteId: site.id,
        name: inquiryName.trim(),
        phone: inquiryPhone.trim(),
        content: inquiryMessage.trim(),
      });
      setInquiryName('');
      setInquiryPhone('');
      setInquiryMessage('');
      addToast({
        title: 'تم إرسال استفسارك بنجاح',
        description: 'تم توجيه رسالتك إلى مستشار المكتب وسيتم التواصل معك.',
        type: 'success',
      });
    } catch (err: any) {
      addToast({
        title: 'تعذر إرسال الاستفسار',
        description: err.message || 'يرجى التأكد من صحة البيانات والمحاولة مجدداً.',
        type: 'error',
      });
    } finally {
      setInquirySending(false);
    }
  };

  const scrollToForm = () => {
    const el = document.getElementById('marriage-request-form-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  // Check if real stats exist (no fake fallback numbers!)
  const hasRealStats =
    site.successRate != null || site.totalMarriages != null || site.officeYearsOfExperience != null;

  return (
    <div
      className={`min-h-screen ${currentTheme.pageBg} text-[#F8FAFC] text-right antialiased overflow-x-hidden`}
    >
      {/* Top Banner Notice */}
      <div className="bg-[#11182B] border-b border-white/5 py-2 px-4 text-xs text-[#94A3B8]">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse" />
            <span>
              مكتب معتمد رسميًا
              {site.officeLicenseNumber && ` — ترخيص: ${site.officeLicenseNumber}`}
            </span>
          </div>
          <Link href="/dashboard" className="text-xs text-[#A78BFA] hover:underline hidden sm:inline">
            هل أنت صاحب هذا المكتب؟ الدخول للإدارة
          </Link>
        </div>
      </div>

      {/* Office Header Navbar */}
      <header className="sticky top-0 z-30 bg-[#0B1124]/90 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#151C32] border border-white/10 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-[#A78BFA]" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold font-heading text-white">{site.name}</h1>
              {site.tagline && (
                <p className="text-[11px] text-[#94A3B8] truncate max-w-xs">{site.tagline}</p>
              )}
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-5 text-xs text-[#94A3B8]">
            <a href="#about" className="hover:text-white transition-colors">
              عن المكتب
            </a>
            <a href="#how-we-work" className="hover:text-white transition-colors">
              آلية العمل
            </a>
            {packages.length > 0 && (
              <a href="#packages" className="hover:text-white transition-colors">
                الباقات
              </a>
            )}
            {successStories.length > 0 && (
              <a href="#stories" className="hover:text-white transition-colors">
                قصص التوفيق
              </a>
            )}
            {faqs.length > 0 && (
              <a href="#faqs" className="hover:text-white transition-colors">
                الأسئلة الشائعة
              </a>
            )}
            <a href="#contact" className="hover:text-white transition-colors">
              اتصل بنا
            </a>
          </nav>

          <Button
            variant={currentTheme.primaryButtonVariant}
            size="sm"
            onClick={scrollToForm}
            className="text-xs"
          >
            قدّم طلب زواج
          </Button>
        </div>
      </header>

      {/* SECTION 1: HERO */}
      <section
        className={`relative overflow-hidden py-14 lg:py-20 ${currentTheme.heroBg} border-b border-white/5`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7 space-y-5">
              <div
                className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-semibold ${currentTheme.accentBadgeBg}`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{currentTheme.label} • خصوصية تامة وضوابط شرعية</span>
              </div>

              <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black font-heading text-white leading-tight">
                {site.tagline || 'نسعى للتوفيق والمودة على سنة الله ورسوله بأعلى درجات الأمانة'}
              </h2>

              {site.officeAbout && (
                <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed max-w-xl">
                  {site.officeAbout}
                </p>
              )}

              {/* Real stats only - NEVER invented fallbacks! */}
              {hasRealStats && (
                <div className="grid grid-cols-3 gap-3 pt-2">
                  {site.successRate != null && (
                    <div className="p-3 rounded-xl bg-[#151C32] border border-white/5 text-center">
                      <div className="text-lg sm:text-xl font-bold font-heading text-[#FBBF24]">
                        %{site.successRate}
                      </div>
                      <div className="text-[10px] sm:text-[11px] text-[#94A3B8]">نسبة التوافق</div>
                    </div>
                  )}
                  {site.totalMarriages != null && (
                    <div className="p-3 rounded-xl bg-[#151C32] border border-white/5 text-center">
                      <div className="text-lg sm:text-xl font-bold font-heading text-[#22C55E]">
                        +{site.totalMarriages}
                      </div>
                      <div className="text-[10px] sm:text-[11px] text-[#94A3B8]">حالة موفقة</div>
                    </div>
                  )}
                  {site.officeYearsOfExperience != null && (
                    <div className="p-3 rounded-xl bg-[#151C32] border border-white/5 text-center">
                      <div className="text-lg sm:text-xl font-bold font-heading text-[#00D4FF]">
                        {site.officeYearsOfExperience} سنوات
                      </div>
                      <div className="text-[10px] sm:text-[11px] text-[#94A3B8]">خبرة المستشارين</div>
                    </div>
                  )}
                </div>
              )}

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Button
                  variant={currentTheme.primaryButtonVariant}
                  size="md"
                  onClick={scrollToForm}
                  className="shadow-xl"
                >
                  <Heart className="w-4 h-4 ml-1.5 fill-current" />
                  قدّم طلبك الآن بكل سرية
                </Button>

                {site.whatsappNumber && (
                  <a
                    href={`https://wa.me/${site.whatsappNumber.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#22C55E]/15 hover:bg-[#22C55E]/25 border border-[#22C55E]/30 text-[#22C55E] font-medium text-xs transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                    استشارة عبر الواتساب
                  </a>
                )}
              </div>
            </div>

            {/* Cover / Visual */}
            <div className="lg:col-span-5 relative">
              <div className="rounded-2xl overflow-hidden border border-white/10 bg-[#151C32] shadow-2xl">
                {site.coverUrl ? (
                  <img
                    src={site.coverUrl}
                    alt={site.name}
                    className="w-full h-64 sm:h-80 object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="h-64 sm:h-80 w-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-[#151C32] to-[#0B1124]">
                    <Building2 className="w-12 h-12 text-[#A78BFA] mb-3" />
                    <h3 className="text-base font-bold text-white mb-1">{site.name}</h3>
                    <p className="text-xs text-[#94A3B8]">بوابة التوفيق والوساطة الزواجية الرسمية</p>
                  </div>
                )}
                <div className="p-4 bg-[#11182B] border-t border-white/5 text-xs text-[#94A3B8] flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-white">
                    <ShieldCheck className="w-4 h-4 text-[#22C55E]" />
                    ميثاق الأمانة والسرية
                  </span>
                  <span className="text-[11px] text-[#64748B]">تشفير كامل للبيانات</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: QURANIC VERSE / HADITH (Only rendered if exists) */}
      {(site.quranVerse || site.hadithText) && (
        <section className="py-8 bg-[#11182B] border-b border-white/5">
          <div className="max-w-3xl mx-auto px-4 text-center space-y-2">
            {site.quranVerse && (
              <p className="text-base sm:text-lg font-heading text-[#FBBF24] leading-relaxed font-semibold">
                {site.quranVerse}
              </p>
            )}
            {site.hadithText && (
              <p className="text-xs text-[#94A3B8] italic">{site.hadithText}</p>
            )}
          </div>
        </section>
      )}

      {/* SECTION 3: ABOUT OFFICE */}
      <section id="about" className="py-14 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <span className="text-xs font-bold text-[#A78BFA] uppercase tracking-wider">
                من نحن
              </span>
              <h3 className="text-xl sm:text-2xl font-bold font-heading text-white">
                {site.name}
              </h3>
              <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed">
                {site.officeAbout ||
                  'منظومة وساطة واستشارات زواج شرعية معتمدة، نتحرى التوافق القيمي والاجتماعي والنفسي بين الراغبين في الزواج بحفظ كامل للسرية والكرامة.'}
              </p>

              <div className="space-y-2.5 pt-2 text-xs text-[#94A3B8]">
                {site.officeLicenseNumber && (
                  <div className="flex items-center gap-2 text-white">
                    <CheckCircle2 className="w-4 h-4 text-[#22C55E] flex-shrink-0" />
                    <span>اعتماد رسمي مسجل برقم ({site.officeLicenseNumber})</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-white">
                  <CheckCircle2 className="w-4 h-4 text-[#22C55E] flex-shrink-0" />
                  <span>متابعة دقيقة لجلسات الرؤية الشرعية بالتنسيق مع ولي الأمر</span>
                </div>
                <div className="flex items-center gap-2 text-white">
                  <CheckCircle2 className="w-4 h-4 text-[#22C55E] flex-shrink-0" />
                  <span>سرية مشفرة لبيانات المتقدمين والمتقدمات</span>
                </div>
              </div>
            </div>

            <Card className="p-6 border-white/5 space-y-3">
              <h4 className="font-bold text-white text-sm font-heading">بيانات المكتب والاعتماد</h4>
              <div className="space-y-2.5 text-xs text-[#94A3B8]">
                {site.officeLicenseNumber && (
                  <div className="flex items-center justify-between pb-2 border-b border-white/5">
                    <span>رقم الترخيص:</span>
                    <span className="font-semibold text-white">{site.officeLicenseNumber}</span>
                  </div>
                )}
                {site.officeAddress && (
                  <div className="flex items-center justify-between pb-2 border-b border-white/5">
                    <span>مقر المكتب:</span>
                    <span className="font-semibold text-white">{site.officeAddress}</span>
                  </div>
                )}
                {site.officeWorkingHours && (
                  <div className="flex items-center justify-between pb-2 border-b border-white/5">
                    <span>أوقات العمل:</span>
                    <span className="font-semibold text-white">{site.officeWorkingHours}</span>
                  </div>
                )}
                {site.officePhone && (
                  <div className="flex items-center justify-between pb-2 border-b border-white/5">
                    <span>هاتف التواصل:</span>
                    <span className="font-semibold text-white font-mono" dir="ltr">
                      {site.officePhone}
                    </span>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* SECTION 4: SERVICES & PACKAGES (Only if packages exist) */}
      {packages.length > 0 && (
        <section id="packages" className="py-14 bg-[#11182B]/60 border-b border-white/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
              <span className="text-xs font-bold text-[#A78BFA] uppercase tracking-wider">
                باقات التوفيق
              </span>
              <h3 className="text-xl sm:text-2xl font-bold font-heading text-white">
                باقات مصممة لتناسب مختلف التطلعات
              </h3>
              <p className="text-xs text-[#94A3B8]">
                جميع الباقات تخضع لبروتوكول السرية والضوابط الشرعية المعتمدة
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {packages.map((pkg) => (
                <Card
                  key={pkg.id}
                  className={`flex flex-col justify-between p-6 relative ${
                    pkg.isPopular
                      ? 'border-[#6C3CE1] ring-1 ring-[#6C3CE1]/50'
                      : 'border-white/5'
                  }`}
                >
                  {pkg.isPopular && (
                    <div className="absolute -top-3 right-6 px-3 py-0.5 rounded-full bg-[#6C3CE1] text-white text-[10px] font-bold shadow-md">
                      الأكثر طلباً
                    </div>
                  )}

                  <div>
                    <h4 className="text-base font-bold font-heading text-white mb-1.5">
                      {pkg.name}
                    </h4>
                    {pkg.description && (
                      <p className="text-xs text-[#94A3B8] mb-3">{pkg.description}</p>
                    )}
                    <div className="text-xl sm:text-2xl font-black font-heading text-[#FBBF24] mb-5">
                      {formatCurrency(pkg.price, pkg.currency)}
                    </div>

                    {Array.isArray(pkg.features) && pkg.features.length > 0 && (
                      <ul className="space-y-2 text-xs text-[#94A3B8] mb-6">
                        {(pkg.features as string[]).map((feat, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#22C55E] flex-shrink-0 mt-0.5" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <Button
                    variant={pkg.isPopular ? currentTheme.primaryButtonVariant : 'secondary'}
                    className="w-full text-xs"
                    size="sm"
                    onClick={scrollToForm}
                  >
                    اختيار والتقديم
                  </Button>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* SECTION 5: HOW WE WORK (4 STEPS) */}
      <section id="how-we-work" className="py-14 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
            <span className="text-xs font-bold text-[#A78BFA] uppercase tracking-wider">
              آلية العمل
            </span>
            <h3 className="text-xl sm:text-2xl font-bold font-heading text-white">
              ٤ خطوات ميسرة نحو التوفيق المبارك
            </h3>
            <p className="text-xs text-[#94A3B8]">
              خطوات واضحة تبدأ من تقديم الرغبة وحتى مباركة عقد القران
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                step: '01',
                title: 'تسجيل الاستمارة',
                desc: 'تعبئة استمارة الزواج بمواصفاتك ومواصفات الشريك المطلوبة بسرية تامة.',
              },
              {
                step: '02',
                title: 'التدقيق والتواصل',
                desc: 'مراجعة الطلب والتأكد من استيفاء المعايير الأسرية والشرعية.',
              },
              {
                step: '03',
                title: 'اقتراح التوافق',
                desc: 'عرض الخيارات المطابقة وتنسيق جلسة الرؤية الشرعية مع ولي الأمر.',
              },
              {
                step: '04',
                title: 'التوفيق والتوثيق',
                desc: 'إتمام الاتفاق وتقديم الاستشارة والمباركة لبداية بيت سعيد.',
              },
            ].map((st) => (
              <Card key={st.step} className="p-5 text-right border-white/5">
                <span className="text-2xl font-black font-heading text-[#6C3CE1] block mb-1">
                  {st.step}
                </span>
                <h4 className="text-sm font-bold font-heading text-white mb-1.5">{st.title}</h4>
                <p className="text-xs text-[#94A3B8] leading-relaxed">{st.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 6: SUCCESS STORIES (Only if real stories exist) */}
      {successStories.length > 0 && (
        <section id="stories" className="py-14 bg-[#11182B]/60 border-b border-white/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
              <span className="text-xs font-bold text-[#A78BFA] uppercase tracking-wider">
                قصص التوفيق
              </span>
              <h3 className="text-xl sm:text-2xl font-bold font-heading text-white">
                توفيق الله ومباركات العائلات
              </h3>
              <p className="text-xs text-[#94A3B8]">
                مقتطفات من مباركات الزواج التي تمت عبر المكتب مع صيانة الخصوصية
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {successStories.map((story) => (
                <SuccessStoryCard key={story.id} story={story} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* SECTION 7: ARTICLES & TIPS (Only if real articles exist) */}
      {articles.length > 0 && (
        <section id="articles" className="py-14 border-b border-white/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
              <span className="text-xs font-bold text-[#A78BFA] uppercase tracking-wider">
                إرشادات ومقالات
              </span>
              <h3 className="text-xl sm:text-2xl font-bold font-heading text-white">
                توجيهات للمقبلين على الزواج
              </h3>
              <p className="text-xs text-[#94A3B8]">
                مقالات استشارية تساعد على حسن الاختيار وبناء عش الزوجية
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {articles.map((art) => (
                <Card key={art.id} className="p-5 flex flex-col justify-between border-white/5">
                  <div>
                    {art.imageUrl && (
                      <div className="h-40 w-full rounded-xl overflow-hidden bg-[#151C32] mb-3">
                        <img
                          src={art.imageUrl}
                          alt={art.title}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    )}
                    {art.category && (
                      <span className="text-[10px] font-semibold text-[#A78BFA] px-2 py-0.5 rounded-full bg-[#6C3CE1]/15 border border-[#6C3CE1]/30">
                        {art.category}
                      </span>
                    )}
                    <h4 className="text-sm font-bold font-heading text-white mt-2 mb-2">
                      {art.title}
                    </h4>
                    <p className="text-xs text-[#94A3B8] line-clamp-3 leading-relaxed">
                      {art.content}
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* SECTION 8: FAQ (Only if real faqs exist) */}
      {faqs.length > 0 && (
        <section id="faqs" className="py-14 bg-[#11182B]/60 border-b border-white/5">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10 space-y-2">
              <span className="text-xs font-bold text-[#A78BFA] uppercase tracking-wider">
                الأسئلة الشائعة
              </span>
              <h3 className="text-xl sm:text-2xl font-bold font-heading text-white">
                إجابات حول الخدمة والخصوصية
              </h3>
              <p className="text-xs text-[#94A3B8]">
                إيضاحات حول آلية التدقيق والسرية المعتمدة في المكتب
              </p>
            </div>

            <div className="space-y-3">
              {faqs.map((faq, idx) => (
                <div
                  key={faq.id}
                  className="rounded-xl bg-[#11182B] border border-white/5 overflow-hidden transition-all"
                >
                  <button
                    onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                    className="w-full p-4 flex items-center justify-between text-right text-xs sm:text-sm font-bold text-white hover:text-[#A78BFA] transition-colors cursor-pointer"
                  >
                    <span>{faq.question}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-[#94A3B8] transition-transform duration-200 ${
                        openFaqIndex === idx ? 'rotate-180 text-[#A78BFA]' : ''
                      }`}
                    />
                  </button>
                  {openFaqIndex === idx && (
                    <div className="p-4 pt-0 text-xs text-[#94A3B8] leading-relaxed border-t border-white/5">
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* SECTION 9: MARRIAGE REQUEST FORM */}
      <section id="marriage-request-form-section" className="py-14 lg:py-20 border-b border-white/5">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#6C3CE1]/15 text-[#A78BFA] border border-[#6C3CE1]/30 text-xs font-semibold">
              <Heart className="w-3.5 h-3.5 fill-current" />
              <span>تسجيل رغبة الزواج الشرعي</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black font-heading text-white">
              استمارة التقديم والطلب
            </h3>
            <p className="text-xs text-[#94A3B8]">
              طلبك محمي ومشفر بالكامل ولا يطّلع عليه إلا مستشار المكتب المعتمد بعد مراجعة الأهلية.
            </p>
          </div>

          <MarriageRequestForm siteId={site.id} siteName={site.name} />
        </div>
      </section>

      {/* SECTION 10: CONTACT & LOCATION */}
      <section id="contact" className="py-14 bg-[#11182B]/60 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            <div className="space-y-5">
              <div>
                <span className="text-xs font-bold text-[#A78BFA] uppercase tracking-wider">
                  التواصل المباشر
                </span>
                <h3 className="text-xl sm:text-2xl font-bold font-heading text-white mt-1">
                  يسعدنا استقبال استفساراتكم
                </h3>
                <p className="text-xs text-[#94A3B8] mt-1.5 leading-relaxed">
                  فريق المستشارين متاح للإجابة على تساؤلاتكم ومتابعة الإجراءات.
                </p>
              </div>

              <div className="space-y-3.5 text-xs text-[#94A3B8]">
                {site.officePhone && (
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#151C32] border border-white/10 flex items-center justify-center text-[#00D4FF]">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] text-[#64748B] block">الهاتف المعتمد:</span>
                      <span className="font-semibold text-white font-mono" dir="ltr">
                        {site.officePhone}
                      </span>
                    </div>
                  </div>
                )}

                {site.whatsappNumber && (
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#22C55E]/15 border border-[#22C55E]/30 flex items-center justify-center text-[#22C55E]">
                      <MessageCircle className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] text-[#64748B] block">واتساب الاستشارات:</span>
                      <span className="font-semibold text-white font-mono" dir="ltr">
                        {site.whatsappNumber}
                      </span>
                    </div>
                  </div>
                )}

                {site.officeAddress && (
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#151C32] border border-white/10 flex items-center justify-center text-[#A78BFA]">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] text-[#64748B] block">مقر المكتب:</span>
                      <span className="font-semibold text-white">{site.officeAddress}</span>
                    </div>
                  </div>
                )}

                {site.officeWorkingHours && (
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#151C32] border border-white/10 flex items-center justify-center text-[#FBBF24]">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] text-[#64748B] block">ساعات العمل الرسمية:</span>
                      <span className="font-semibold text-white">{site.officeWorkingHours}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Inquiry Form - using Toast, NO alert() */}
            <Card className="p-6 border-white/5">
              <h4 className="font-bold font-heading text-white text-sm mb-3">
                إرسال استفسار مباشر إلى المكتب
              </h4>
              <form onSubmit={handleInquirySubmit} className="space-y-3 text-xs">
                <div>
                  <label className="block text-[#94A3B8] mb-1">الاسم الكريم</label>
                  <input
                    required
                    value={inquiryName}
                    onChange={(e) => setInquiryName(e.target.value)}
                    className="w-full h-9 rounded-xl bg-[#151C32] border border-white/10 px-3 text-white focus:outline-none focus:border-[#6C3CE1]"
                    placeholder="الاسم"
                  />
                </div>
                <div>
                  <label className="block text-[#94A3B8] mb-1">رقم الجوال أو الواتساب</label>
                  <input
                    required
                    dir="ltr"
                    value={inquiryPhone}
                    onChange={(e) => setInquiryPhone(e.target.value)}
                    className="w-full h-9 rounded-xl bg-[#151C32] border border-white/10 px-3 text-white focus:outline-none focus:border-[#6C3CE1]"
                    placeholder="+966500000000"
                  />
                </div>
                <div>
                  <label className="block text-[#94A3B8] mb-1">نص الاستفسار</label>
                  <textarea
                    rows={3}
                    required
                    value={inquiryMessage}
                    onChange={(e) => setInquiryMessage(e.target.value)}
                    className="w-full rounded-xl bg-[#151C32] border border-white/10 p-3 text-white focus:outline-none focus:border-[#6C3CE1]"
                    placeholder="اكتب استفسارك هنا..."
                  />
                </div>
                <Button
                  type="submit"
                  variant={currentTheme.primaryButtonVariant}
                  size="sm"
                  className="w-full"
                  isLoading={inquirySending}
                >
                  <Send className="w-3.5 h-3.5 ml-1.5" />
                  إرسال الاستفسار
                </Button>
              </form>
            </Card>
          </div>
        </div>
      </section>

      {/* SECTION 11: FOOTER */}
      <footer className="bg-[#0B1124] border-t border-white/5 py-8 text-xs text-[#64748B] text-center">
        <div className="max-w-7xl mx-auto px-4 space-y-3">
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
            <span className="text-white font-bold font-heading">{site.name}</span>
            {site.officeLicenseNumber && (
              <>
                <span>•</span>
                <span>ترخيص رسمي #{site.officeLicenseNumber}</span>
              </>
            )}
          </div>
          <p className="text-[11px] text-[#64748B]">
            جميع الحقوق محفوظة © {new Date().getFullYear()} • مدعوم عبر{' '}
            <Link href="/" className="text-[#A78BFA] hover:underline font-semibold">
              منظومة مدار (MADAR)
            </Link>{' '}
            لمكاتب الزواج الشرعي
          </p>
        </div>
      </footer>
    </div>
  );
};

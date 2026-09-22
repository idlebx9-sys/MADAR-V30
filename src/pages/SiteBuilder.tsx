import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { trpc } from '../lib/trpc.ts';
import { useAuth } from '../hooks/useAuth.ts';
import { useToast } from '../contexts/ToastContext.tsx';
import { Navbar } from '../components/layout/Navbar.tsx';
import { Footer } from '../components/layout/Footer.tsx';
import { Button } from '../components/ui/Button.tsx';
import { Card } from '../components/ui/Card.tsx';
import { Input } from '../components/ui/Input.tsx';
import { Label } from '../components/ui/Label.tsx';
import { Textarea } from '../components/ui/Textarea.tsx';
import { Badge } from '../components/ui/Card.tsx';
import {
  Sparkles,
  Building2,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Eye,
  Smartphone,
  Monitor,
  Palette,
  FileText,
  Lock,
  Layers,
} from 'lucide-react';
import { TEMPLATES, normalizeTemplateId, TemplateId } from '../const.ts';
import confetti from 'canvas-confetti';

export const SiteBuilder: React.FC = () => {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated, register } = useAuth();
  const { addToast } = useToast();

  const searchParams = new URLSearchParams(window.location.search);
  const initialTmpl = normalizeTemplateId(searchParams.get('template'));

  // Builder steps
  type BuilderTab = 'office' | 'template' | 'identity' | 'legal' | 'content';
  const [activeTab, setActiveTab] = useState<BuilderTab>('office');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [mobileViewMode, setMobileViewMode] = useState<'editor' | 'preview'>('editor');
  const [submittedSite, setSubmittedSite] = useState<any | null>(null);

  const [selectedTemplate, setSelectedTemplate] = useState<TemplateId>(initialTmpl);
  const [bureauForm, setBureauForm] = useState({
    ownerName: user?.name || 'الشيخ عبدالمحسن السبيعي',
    ownerEmail: user?.email || 'owner@example.sa',
    ownerPhone: '+966 55 987 6543',
    name: 'مكتب الوفاق للزواج الشرعي',
    subdomain: 'alwefaq',
    tagline: 'توفيق مبارك وخصوصية تامة وفق كتاب الله وسنة رسوله',
    officeAbout:
      'مكتب وساطة زواج معتمد يضم نخبة من المستشارين الاجتماعيين والشرعيين لمساعدة الراغبين والراغبات في إيجاد الشريك المناسب بأعلى معايير الأمانة والسرية.',
    officePhone: '+966 55 987 6543',
    whatsappNumber: '+966 55 987 6543',
    officeLicenseNumber: '445210/ز',
    officeAddress: 'الرياض — طريق الملك فهد',
    officeYearsOfExperience: 8,
    quranVerse: '«وَمِنْ آيَاتِهِ أَنْ خَلَقَ لَكُم مِّنْ أَنفُسِكُمْ أَزْوَاجًا لِّتَسْكُنُوا إِلَيْهَا»',
    hadithText: 'قال رسول الله ﷺ: «إذا جاءكم من ترضون دينه وخلقه فزوجوه»',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPassword, setGuestPassword] = useState('');
  const [guestName, setGuestName] = useState('');

  const utils = trpc.useUtils();
  const createSiteMutation = trpc.sites.create.useMutation({
    onSuccess: (newSite) => {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#6C3CE1', '#00D4FF', '#22C55E'],
      });
      utils.sites.listMine.invalidate();
      setSubmittedSite(newSite);
      addToast({
        title: 'تم إنشاء الموقع بنجاح',
        description: 'تم إرسال طلب اعتماد الموقع إلى إدارة المنصة.',
        type: 'success',
      });
    },
    onError: (err) => {
      const msg = err.message || 'حدث خطأ أثناء إرسال طلب تدشين الموقع';
      setErrors({ form: msg });
      addToast({
        title: 'خطأ في التدشين',
        description: msg,
        type: 'error',
      });
    },
  });

  const validateCurrentTab = (): boolean => {
    const errs: Record<string, string> = {};
    if (activeTab === 'office') {
      if (!bureauForm.name.trim()) errs.name = 'اسم المكتب الرسمي مطلوب';
      if (!bureauForm.subdomain.trim()) errs.subdomain = 'الدومين الفرعي مطلوب';
      if (!/^[a-z0-9-]+$/.test(bureauForm.subdomain)) {
        errs.subdomain = 'الدومين الفرعي يجب أن يحتوي على حروف إنجليزية صغيرة وأرقام فقط';
      }
      if (!bureauForm.ownerName.trim()) errs.ownerName = 'اسم صاحب المكتب مطلوب';
      if (!bureauForm.ownerEmail.trim()) errs.ownerEmail = 'البريد الإلكتروني مطلوب';
      if (!bureauForm.ownerPhone.trim()) errs.ownerPhone = 'رقم الهاتف مطلوب';
    } else if (activeTab === 'legal') {
      if (!bureauForm.officeLicenseNumber.trim()) {
        errs.officeLicenseNumber = 'رقم الترخيص أو السجل الرسمي مطلوب للتدقيق';
      }
      if (!bureauForm.officeAddress.trim()) {
        errs.officeAddress = 'مقر المكتب والمدينة مطلوب';
      }
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const tabsList: { id: BuilderTab; label: string; icon: any }[] = [
    { id: 'office', label: 'معلومات المكتب', icon: Building2 },
    { id: 'template', label: 'اختيار القالب', icon: Layers },
    { id: 'identity', label: 'الهوية والشعار', icon: Palette },
    { id: 'legal', label: 'البيانات الشرعية', icon: ShieldCheck },
    { id: 'content', label: 'نصوص الموقع', icon: FileText },
  ];

  const handleTabChange = (nextTab: BuilderTab) => {
    if (validateCurrentTab()) {
      setActiveTab(nextTab);
    }
  };

  const handleLaunch = async () => {
    if (!validateCurrentTab()) return;

    try {
      if (!isAuthenticated) {
        if (!guestEmail || !guestPassword) {
          setErrors({
            auth: 'يرجى إدخال البريد الإلكتروني وكلمة المرور لإنشاء حساب صاحب المكتب في مدار',
          });
          addToast({
            title: 'مطلوب حساب للمكتب',
            description: 'يرجى تسجيل بيانات الدخول لربط الموقع بحسابك.',
            type: 'warning',
          });
          return;
        }
        await register({
          email: guestEmail,
          password: guestPassword,
          name: guestName || bureauForm.ownerName || bureauForm.name,
          role: 'owner',
        });
      }

      createSiteMutation.mutate({
        name: bureauForm.name,
        subdomain: bureauForm.subdomain.toLowerCase(),
        template: normalizeTemplateId(selectedTemplate),
        ownerName: bureauForm.ownerName,
        ownerEmail: bureauForm.ownerEmail,
        ownerPhone: bureauForm.ownerPhone,
        tagline: bureauForm.tagline,
        officeAbout: bureauForm.officeAbout,
        officePhone: bureauForm.officePhone || bureauForm.ownerPhone,
        whatsappNumber: bureauForm.whatsappNumber || bureauForm.ownerPhone,
        officeLicenseNumber: bureauForm.officeLicenseNumber,
        officeAddress: bureauForm.officeAddress,
        officeYearsOfExperience: Number(bureauForm.officeYearsOfExperience),
      });
    } catch (err: any) {
      setErrors({ form: err.message || 'فشل إرسال طلب اعتماد الموقع' });
      addToast({
        title: 'تعذر الحفظ',
        description: err.message || 'حدث خطأ أثناء محاولة تسجيل المكتب',
        type: 'error',
      });
    }
  };

  const currentTmplObj = TEMPLATES.find((t) => t.id === selectedTemplate) || TEMPLATES[0];

  return (
    <div className="min-h-screen bg-[#0B1124] text-[#F8FAFC] text-right flex flex-col antialiased">
      <Navbar />

      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex flex-col">
        {/* Header bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/5 mb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#6C3CE1]/15 text-[#A78BFA] text-xs font-semibold mb-2">
              <Building2 className="w-3.5 h-3.5" />
              <span>أداة بناء موقع المكتب المعتمد</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black font-heading text-white">
              بناء وتخصيص بوابة المكتب الرسمية
            </h1>
          </div>

          {/* Mobile switcher button */}
          <div className="flex items-center gap-2 lg:hidden">
            <Button
              variant={mobileViewMode === 'editor' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setMobileViewMode('editor')}
              className="text-xs"
            >
              التحكم والبيانات
            </Button>
            <Button
              variant={mobileViewMode === 'preview' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setMobileViewMode('preview')}
              className="text-xs"
            >
              <Eye className="w-3.5 h-3.5 ml-1" />
              المعاينة المباشرة
            </Button>
          </div>
        </div>

        {/* SUBMITTED SUCCESS SCREEN */}
        {submittedSite ? (
          <div className="max-w-2xl mx-auto space-y-6 my-auto py-12">
            <Card className="p-8 border-[#22C55E]/40 shadow-2xl text-center space-y-6">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-[#22C55E]/15 border border-[#22C55E]/30 flex items-center justify-center text-[#22C55E]">
                <CheckCircle2 className="w-7 h-7" />
              </div>

              <div>
                <span className="px-3 py-1 rounded-full bg-[#FBBF24]/15 border border-[#FBBF24]/30 text-[#FBBF24] text-xs font-bold inline-block mb-3">
                  الحالة: بانتظار موافقة مدير المنصة (Pending Approval)
                </span>
                <h2 className="text-2xl font-bold font-heading text-white">
                  تم إرسال طلب تدشين موقع مكتبك بنجاح!
                </h2>
                <p className="text-xs text-[#94A3B8] mt-2 leading-relaxed max-w-lg mx-auto">
                  بموجب سياسة منصة <strong>مَـدَار</strong>، يُشترط الحصول على اعتماد وموافقة مدير المنصة قبل تفعيل أي موقع أو استقبال طلبات الزواج حفاظاً على الخصوصية والترخيص الشرعي.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#151C32] border border-white/5 text-right space-y-2.5 text-xs">
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-[#94A3B8]">اسم صاحب المكتب:</span>
                  <span className="font-bold text-white">
                    {submittedSite.ownerName || bureauForm.ownerName}
                  </span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-[#94A3B8]">اسم المكتب الرسمي:</span>
                  <span className="font-bold text-white">{submittedSite.name}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-[#94A3B8]">رابط الموقع المطلوب:</span>
                  <span className="font-bold text-[#00D4FF] font-mono" dir="ltr">
                    https://{submittedSite.subdomain}.madar.sa
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#94A3B8]">حالة التدقيق:</span>
                  <span className="text-[#FBBF24] font-bold">قيد المراجعة الإدارية</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => window.open(`/site/${submittedSite.subdomain}`, '_blank')}
                  className="w-full sm:w-auto"
                >
                  معاينة صفحة الموقع العامة
                </Button>
                <Button
                  variant="primary"
                  onClick={() => setLocation('/dashboard')}
                  className="w-full sm:w-auto"
                >
                  الانتقال للوحة تحكم المكتب
                </Button>
              </div>
            </Card>
          </div>
        ) : (
          /* SPLIT PANE BUILDER */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 items-start">
            {/* RIGHT PANE: CONTROLS & FORMS (7 Cols on desktop) */}
            <div
              className={`lg:col-span-6 xl:col-span-5 space-y-4 ${
                mobileViewMode === 'preview' ? 'hidden lg:block' : 'block'
              }`}
            >
              {/* Step Tabs Navigation */}
              <div className="flex items-center gap-1 overflow-x-auto pb-1 border-b border-white/5">
                {tabsList.map((t) => {
                  const Icon = t.icon;
                  const active = activeTab === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => handleTabChange(t.id)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                        active
                          ? 'bg-[#6C3CE1] text-white'
                          : 'text-[#94A3B8] hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{t.label}</span>
                    </button>
                  );
                })}
              </div>

              {errors.form && (
                <div className="p-3 rounded-xl bg-[#EF4444]/15 border border-[#EF4444]/30 text-[#EF4444] text-xs">
                  {errors.form}
                </div>
              )}

              {/* Tab 1: Office Info */}
              {activeTab === 'office' && (
                <Card className="p-5 space-y-4 border-white/5">
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold font-heading text-white">بيانات المكتب الأساسية</h3>
                    <p className="text-xs text-[#94A3B8]">
                      الاسم الذي سيظهر للمستفيدين والرابط المعتمد
                    </p>
                  </div>

                  <div>
                    <Label required>اسم المكتب الرسمي</Label>
                    <Input
                      value={bureauForm.name}
                      onChange={(e) => setBureauForm({ ...bureauForm, name: e.target.value })}
                      placeholder="مكتب الوفاق للزواج الشرعي"
                      error={errors.name}
                    />
                  </div>

                  <div>
                    <Label required>رابط الموقع الفرعي (Subdomain)</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        value={bureauForm.subdomain}
                        onChange={(e) =>
                          setBureauForm({
                            ...bureauForm,
                            subdomain: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''),
                          })
                        }
                        placeholder="alwefaq"
                        dir="ltr"
                        error={errors.subdomain}
                      />
                      <span className="text-xs text-[#64748B] font-mono whitespace-nowrap">
                        .madar.sa
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div>
                      <Label required>اسم صاحب المكتب / المأذون</Label>
                      <Input
                        value={bureauForm.ownerName}
                        onChange={(e) =>
                          setBureauForm({ ...bureauForm, ownerName: e.target.value })
                        }
                        placeholder="الشيخ فلان بن فلان"
                        error={errors.ownerName}
                      />
                    </div>
                    <div>
                      <Label required>البريد الإلكتروني الرسمي</Label>
                      <Input
                        type="email"
                        value={bureauForm.ownerEmail}
                        onChange={(e) =>
                          setBureauForm({ ...bureauForm, ownerEmail: e.target.value })
                        }
                        placeholder="owner@office.sa"
                        error={errors.ownerEmail}
                      />
                    </div>
                  </div>

                  <div>
                    <Label required>رقم هاتف التواصل والواتساب</Label>
                    <Input
                      dir="ltr"
                      value={bureauForm.ownerPhone}
                      onChange={(e) =>
                        setBureauForm({ ...bureauForm, ownerPhone: e.target.value })
                      }
                      placeholder="+966 55 000 0000"
                      error={errors.ownerPhone}
                    />
                  </div>

                  <div className="flex justify-end pt-3">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleTabChange('template')}
                    >
                      التالي: اختيار القالب
                      <ChevronLeft className="w-4 h-4 mr-1" />
                    </Button>
                  </div>
                </Card>
              )}

              {/* Tab 2: Template Selection */}
              {activeTab === 'template' && (
                <Card className="p-5 space-y-4 border-white/5">
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold font-heading text-white">نظم التصميم الستة المعتمدة</h3>
                    <p className="text-xs text-[#94A3B8]">
                      اختر النمط المناسب؛ تتغير المعاينة المباشرة على اليسار فوراً
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-2.5">
                    {TEMPLATES.map((tmpl) => {
                      const selected = selectedTemplate === tmpl.id;
                      return (
                        <div
                          key={tmpl.id}
                          onClick={() => setSelectedTemplate(tmpl.id)}
                          className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                            selected
                              ? 'bg-[#6C3CE1]/15 border-[#6C3CE1] shadow-lg'
                              : 'bg-[#151C32] border-white/5 hover:border-white/20'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span
                              className="w-3.5 h-3.5 rounded-full"
                              style={{ backgroundColor: tmpl.accent }}
                            />
                            <div>
                              <div className="text-xs font-bold text-white">{tmpl.name}</div>
                              <div className="text-[11px] text-[#94A3B8]">{tmpl.description}</div>
                            </div>
                          </div>
                          <Badge variant={selected ? 'default' : 'secondary'} className="text-[10px]">
                            {tmpl.badge}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex justify-between pt-3">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setActiveTab('office')}
                    >
                      <ChevronRight className="w-4 h-4 ml-1" />
                      السابق
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleTabChange('identity')}
                    >
                      التالي: الهوية
                      <ChevronLeft className="w-4 h-4 mr-1" />
                    </Button>
                  </div>
                </Card>
              )}

              {/* Tab 3: Identity & Tagline */}
              {activeTab === 'identity' && (
                <Card className="p-5 space-y-4 border-white/5">
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold font-heading text-white">الهوية والعبارات الترحيبية</h3>
                    <p className="text-xs text-[#94A3B8]">
                      صياغة الشعار والنبذة التعريفية للمكتب
                    </p>
                  </div>

                  <div>
                    <Label>الشعار اللفظي (Tagline)</Label>
                    <Input
                      value={bureauForm.tagline}
                      onChange={(e) => setBureauForm({ ...bureauForm, tagline: e.target.value })}
                      placeholder="توفيق مبارك وخصوصية تامة وفق كتاب الله وسنة رسوله"
                    />
                  </div>

                  <div>
                    <Label>نبذة عن المكتب ورسالته</Label>
                    <Textarea
                      rows={3}
                      value={bureauForm.officeAbout}
                      onChange={(e) =>
                        setBureauForm({ ...bureauForm, officeAbout: e.target.value })
                      }
                      placeholder="اكتب نبذة عن تاريخ المكتب وخبرات المستشارين..."
                    />
                  </div>

                  <div className="flex justify-between pt-3">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setActiveTab('template')}
                    >
                      <ChevronRight className="w-4 h-4 ml-1" />
                      السابق
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleTabChange('legal')}
                    >
                      التالي: البيانات الشرعية
                      <ChevronLeft className="w-4 h-4 mr-1" />
                    </Button>
                  </div>
                </Card>
              )}

              {/* Tab 4: Legal & Licensing */}
              {activeTab === 'legal' && (
                <Card className="p-5 space-y-4 border-white/5">
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold font-heading text-white">بيانات الترخيص والاعتماد</h3>
                    <p className="text-xs text-[#94A3B8]">
                      إلزامية للتأكد من نظامية المكتب قبل الموافقة
                    </p>
                  </div>

                  <div>
                    <Label required>رقم ترخيص وزارة العدل أو السجل التجاري</Label>
                    <Input
                      value={bureauForm.officeLicenseNumber}
                      onChange={(e) =>
                        setBureauForm({ ...bureauForm, officeLicenseNumber: e.target.value })
                      }
                      placeholder="مثال: 445210/ز"
                      error={errors.officeLicenseNumber}
                    />
                  </div>

                  <div>
                    <Label required>مقر المكتب والمدينة</Label>
                    <Input
                      value={bureauForm.officeAddress}
                      onChange={(e) =>
                        setBureauForm({ ...bureauForm, officeAddress: e.target.value })
                      }
                      placeholder="الرياض — حي الصحافة — طريق الملك فهد"
                      error={errors.officeAddress}
                    />
                  </div>

                  <div>
                    <Label>سنوات خبرة المكتب في التوفيق الأسري</Label>
                    <Input
                      type="number"
                      value={bureauForm.officeYearsOfExperience}
                      onChange={(e) =>
                        setBureauForm({
                          ...bureauForm,
                          officeYearsOfExperience: Number(e.target.value),
                        })
                      }
                      min={1}
                      max={60}
                    />
                  </div>

                  <div className="flex justify-between pt-3">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setActiveTab('identity')}
                    >
                      <ChevronRight className="w-4 h-4 ml-1" />
                      السابق
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleTabChange('content')}
                    >
                      التالي: نصوص الموقع
                      <ChevronLeft className="w-4 h-4 mr-1" />
                    </Button>
                  </div>
                </Card>
              )}

              {/* Tab 5: Content & Launch */}
              {activeTab === 'content' && (
                <Card className="p-5 space-y-4 border-white/5">
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold font-heading text-white">الآيات والنصوص المباركة</h3>
                    <p className="text-xs text-[#94A3B8]">
                      تظهر في مقدمة البوابة لتأكيد الطابع الشرعي
                    </p>
                  </div>

                  <div>
                    <Label>الآية القرآنية الكريمة</Label>
                    <Input
                      value={bureauForm.quranVerse}
                      onChange={(e) =>
                        setBureauForm({ ...bureauForm, quranVerse: e.target.value })
                      }
                      placeholder="«وَمِنْ آيَاتِهِ أَنْ خَلَقَ لَكُم مِّنْ أَنفُسِكُمْ أَزْوَاجًا»"
                    />
                  </div>

                  <div>
                    <Label>الحديث الشريف أو الحكمة</Label>
                    <Input
                      value={bureauForm.hadithText}
                      onChange={(e) =>
                        setBureauForm({ ...bureauForm, hadithText: e.target.value })
                      }
                      placeholder="قال رسول الله ﷺ: «إذا جاءكم من ترضون دينه وخلقه فزوجوه»"
                    />
                  </div>

                  {!isAuthenticated && (
                    <div className="p-4 rounded-xl bg-[#151C32] border border-[#6C3CE1]/30 space-y-3">
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-[#6C3CE1]" />
                        <span>إنشاء حساب صاحب المكتب (لإدارة الموقع لاحقاً)</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <Input
                          type="email"
                          placeholder="البريد الإلكتروني"
                          value={guestEmail}
                          onChange={(e) => setGuestEmail(e.target.value)}
                        />
                        <Input
                          type="password"
                          placeholder="كلمة المرور"
                          value={guestPassword}
                          onChange={(e) => setGuestPassword(e.target.value)}
                        />
                      </div>
                      {errors.auth && (
                        <p className="text-[11px] text-[#EF4444]">{errors.auth}</p>
                      )}
                    </div>
                  )}

                  <div className="pt-3 border-t border-white/5 space-y-3">
                    <Button
                      variant="primary"
                      size="lg"
                      className="w-full shadow-xl"
                      onClick={handleLaunch}
                      isLoading={createSiteMutation.isPending}
                    >
                      <ShieldCheck className="w-4 h-4 ml-2" />
                      إرسال طلب تدشين واعتماد الموقع
                    </Button>
                    <p className="text-[11px] text-[#64748B] text-center">
                      يخضع الطلب للتدقيق الإداري الفوري للتثبت من التراخيص قبل تفعيل الرابط العام.
                    </p>
                  </div>
                </Card>
              )}
            </div>

            {/* LEFT PANE: LIVE INTERACTIVE PREVIEW (7 Cols on desktop) */}
            <div
              className={`lg:col-span-6 xl:col-span-7 sticky top-24 ${
                mobileViewMode === 'editor' ? 'hidden lg:block' : 'block'
              }`}
            >
              <div className="rounded-2xl bg-[#11182B] border border-white/10 shadow-2xl overflow-hidden">
                {/* Mockup Toolbar */}
                <div className="bg-[#151C32] px-4 py-3 border-b border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#EF4444]/60" />
                    <div className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]/60" />
                    <div className="w-2.5 h-2.5 rounded-full bg-[#22C55E]/60" />
                  </div>

                  <div className="flex items-center gap-2 bg-[#0B1124] px-3 py-1 rounded-lg border border-white/5 text-[11px] font-mono text-[#94A3B8]">
                    <span className="text-[#00D4FF]">https://</span>
                    <span>{bureauForm.subdomain || 'mysite'}.madar.sa</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setPreviewDevice('desktop')}
                      className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                        previewDevice === 'desktop'
                          ? 'bg-[#6C3CE1] text-white'
                          : 'text-[#94A3B8] hover:text-white'
                      }`}
                      title="عرض شاشة حاسوب"
                    >
                      <Monitor className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setPreviewDevice('mobile')}
                      className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                        previewDevice === 'mobile'
                          ? 'bg-[#6C3CE1] text-white'
                          : 'text-[#94A3B8] hover:text-white'
                      }`}
                      title="عرض هاتف جوال"
                    >
                      <Smartphone className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Interactive Simulated Preview Frame */}
                <div
                  className={`bg-[#0B1124] p-4 transition-all duration-300 mx-auto overflow-y-auto max-h-[600px] ${
                    previewDevice === 'mobile' ? 'max-w-[340px] border-x border-white/10' : 'w-full'
                  }`}
                >
                  {/* Top Bar inside preview */}
                  <div className="flex items-center justify-between pb-3 border-b border-white/5 text-[10px] text-[#94A3B8]">
                    <span className="text-[#22C55E] flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      مرخص برقم {bureauForm.officeLicenseNumber || '—'}
                    </span>
                    <span>معاينة حية</span>
                  </div>

                  {/* Header inside preview */}
                  <div className="py-3 flex items-center justify-between border-b border-white/5">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs"
                        style={{ backgroundColor: `${currentTmplObj.accent}25`, color: currentTmplObj.accent }}
                      >
                        م
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">{bureauForm.name || 'اسم المكتب'}</div>
                        <div className="text-[9px] text-[#64748B]">{bureauForm.officeAddress}</div>
                      </div>
                    </div>
                    <span
                      className="text-[10px] px-2 py-0.5 rounded-lg text-white font-medium"
                      style={{ backgroundColor: currentTmplObj.accent }}
                    >
                      طلب زواج
                    </span>
                  </div>

                  {/* Hero inside preview */}
                  <div className="py-6 text-center space-y-3">
                    <span
                      className="text-[10px] px-2.5 py-0.5 rounded-full border inline-block"
                      style={{
                        borderColor: `${currentTmplObj.accent}40`,
                        color: currentTmplObj.accent,
                        backgroundColor: `${currentTmplObj.accent}15`,
                      }}
                    >
                      قالب {currentTmplObj.name}
                    </span>

                    <h3 className="text-sm sm:text-base font-black font-heading text-white leading-snug">
                      {bureauForm.tagline || 'توفيق مبارك وخصوصية تامة'}
                    </h3>

                    <p className="text-[11px] text-[#94A3B8] leading-relaxed max-w-sm mx-auto line-clamp-2">
                      {bureauForm.officeAbout}
                    </p>

                    {bureauForm.quranVerse && (
                      <div className="p-2.5 rounded-xl bg-[#151C32] border border-white/5 text-[10px] text-[#FBBF24] italic">
                        {bureauForm.quranVerse}
                      </div>
                    )}

                    <div className="pt-2 flex justify-center gap-2">
                      <span
                        className="text-[10px] px-3 py-1.5 rounded-lg text-white font-bold"
                        style={{ backgroundColor: currentTmplObj.accent }}
                      >
                        قدّم طلبك الآن
                      </span>
                      <span className="text-[10px] px-3 py-1.5 rounded-lg bg-[#151C32] text-[#94A3B8] border border-white/5">
                        استعراض الباقات
                      </span>
                    </div>
                  </div>

                  {/* Mini Form Preview */}
                  <div className="p-3.5 rounded-xl bg-[#11182B] border border-white/5 space-y-2 mt-4 text-[11px]">
                    <div className="font-bold text-white flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5 text-[#00D4FF]" />
                      <span>استمارة طلب الزواج المعتمدة (٤ خطوات)</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[10px] text-[#94A3B8]">
                      <div className="p-1.5 rounded bg-[#151C32]">البيانات الشخصية</div>
                      <div className="p-1.5 rounded bg-[#151C32]">مواصفات الشريك</div>
                      <div className="p-1.5 rounded bg-[#151C32]">وسيلة التواصل</div>
                      <div className="p-1.5 rounded bg-[#151C32]">ميثاق الأمانة</div>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-[#151C32] border-t border-white/5 flex items-center justify-between text-[11px] text-[#64748B]">
                  <span>القالب المختار: {currentTmplObj.name}</span>
                  <span className="text-[#22C55E]">المعاينة متزامنة تلقائياً</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

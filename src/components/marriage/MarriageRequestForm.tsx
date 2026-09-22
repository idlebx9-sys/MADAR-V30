import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { trpc } from '../../lib/trpc.ts';
import { Button } from '../ui/Button.tsx';
import { Input } from '../ui/Input.tsx';
import { Label } from '../ui/Label.tsx';
import { Textarea } from '../ui/Textarea.tsx';
import { Select } from '../ui/Dialog.tsx';
import { Card } from '../ui/Card.tsx';
import {
  Heart,
  CheckCircle2,
  User,
  Sparkles,
  PhoneCall,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Send,
  AlertCircle,
} from 'lucide-react';
import { MARITAL_STATUS_LABELS, PREFERRED_CONTACT_LABELS } from '../../const.ts';

interface MarriageRequestFormProps {
  siteId: number;
  siteName: string;
  onSuccess?: () => void;
}

export const MarriageRequestForm: React.FC<MarriageRequestFormProps> = ({
  siteId,
  siteName,
  onSuccess,
}) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [formData, setFormData] = useState({
    siteId,
    fullName: '',
    gender: 'male' as 'male' | 'female',
    age: 28,
    maritalStatus: 'single' as 'single' | 'divorced' | 'widowed',
    city: 'الرياض',
    nationality: 'سعودي',
    education: 'جامعي',
    job: '',
    height: 175,
    weight: 70,
    religiousCommitment: 'محافظ على الصلوات في المسجد',
    financialStatus: 'ميسور ولله الحمد',
    partnerRequirements: '',
    phone: '',
    email: '',
    preferredContact: 'whatsapp' as 'whatsapp' | 'call' | 'email',
    guardianPhone: '',
    notes: '',
    photoUrl: '',
    termsAccepted: false,
    honeypot: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const createRequest = trpc.marriageRequests.create.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      // Trigger festive marriage celebration confetti!
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#D4AF37', '#0F5132', '#F8BBD0', '#ffffff'],
      });
      if (onSuccess) onSuccess();
    },
    onError: (err) => {
      setErrors({ form: err.message || 'حدث خطأ أثناء إرسال الطلب، يرجى المحاولة لاحقاً' });
    },
  });

  const validateStep = (currentStep: number): boolean => {
    const errs: Record<string, string> = {};

    if (currentStep === 1) {
      if (!formData.fullName.trim() || formData.fullName.trim().length < 3) {
        errs.fullName = 'يرجى كتابة الاسم الثلاثي كاملاً';
      }
      if (!formData.age || formData.age < 18 || formData.age > 80) {
        errs.age = 'العمر يجب أن يكون بين 18 و 80 سنة';
      }
      if (!formData.city.trim()) {
        errs.city = 'يرجى تحديد المدينة';
      }
      if (!formData.nationality.trim()) {
        errs.nationality = 'يرجى تحديد الجنسية';
      }
    } else if (currentStep === 2) {
      if (!formData.partnerRequirements.trim() || formData.partnerRequirements.trim().length < 40) {
        errs.partnerRequirements = 'يرجى كتابة مواصفات الشريك المطلوبة باستفاضة (40 حرفاً على الأقل للجدية)';
      }
    } else if (currentStep === 3) {
      if (!formData.phone.trim() || formData.phone.trim().length < 8) {
        errs.phone = 'يرجى كتابة رقم هاتف صحيح للتواصل';
      }
      if (!formData.termsAccepted) {
        errs.termsAccepted = 'يجب الموافقة على الشروط والأحكام وميثاق السرية';
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep((prev) => (prev < 4 ? ((prev + 1) as any) : prev));
    }
  };

  const handlePrev = () => {
    setStep((prev) => (prev > 1 ? ((prev - 1) as any) : prev));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(3)) {
      setStep(3);
      return;
    }
    createRequest.mutate({
      ...formData,
      siteId,
      age: Number(formData.age),
      height: formData.height ? Number(formData.height) : undefined,
      weight: formData.weight ? Number(formData.weight) : undefined,
    });
  };

  if (submitted) {
    return (
      <Card glass className="max-w-2xl mx-auto text-center py-12 px-6 border-[#D4AF37]/50">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center animate-bounce">
          <Heart className="w-10 h-10 text-[#D4AF37] fill-[#D4AF37]" />
        </div>
        <h3 className="text-2xl font-bold font-heading gold-gradient-text mb-3">
          تم استقبال طلبك بسرية وأمان تام
        </h3>
        <p className="text-slate-300 text-sm max-w-md mx-auto leading-relaxed mb-6">
          جزاك الله خيراً، قام فريق الاستشارات والتوفيق في{' '}
          <span className="text-[#D4AF37] font-semibold">{siteName}</span> باستلام طلبك وسيتم مراجعته
          والتواصل معك بكل سرية وفق الضوابط الشرعية.
        </p>
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-400 max-w-sm mx-auto mb-6">
          <p className="flex items-center justify-center gap-2 text-emerald-400 font-semibold mb-1">
            <CheckCircle2 className="w-4 h-4" />
            حالة الطلب: مسجل وجارِ الفحص المبدئي
          </p>
          <p>رقم التواصل المعتمد للرد: {formData.phone}</p>
        </div>
        <Button
          variant="gold"
          onClick={() => {
            setSubmitted(false);
            setStep(1);
            setFormData((prev) => ({ ...prev, partnerRequirements: '', fullName: '', phone: '' }));
          }}
        >
          تقديم طلب جديد آخر
        </Button>
      </Card>
    );
  }

  return (
    <Card glass className="max-w-3xl mx-auto shadow-2xl border-[#D4AF37]/30 text-right">
      {/* Progress Bar Header */}
      <div className="border-b border-slate-800 pb-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30">
            استمارة طلب الزواج الشرعي
          </span>
          <span className="text-xs text-slate-400">الخطوة {step} من 4</span>
        </div>

        {/* 4 Step indicators */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { s: 1, title: 'بياناتي', icon: User },
            { s: 2, title: 'مواصفات الشريك', icon: Sparkles },
            { s: 3, title: 'التواصل والسرية', icon: PhoneCall },
            { s: 4, title: 'مراجعة وتأكيد', icon: ShieldCheck },
          ].map((item) => {
            const Icon = item.icon;
            const active = step >= item.s;
            const current = step === item.s;
            return (
              <div
                key={item.s}
                className={`flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all ${
                  current
                    ? 'bg-[#6C3CE1]/15 border border-[#6C3CE1]/40 text-[#A78BFA]'
                    : active
                    ? 'text-[#22C55E]'
                    : 'text-[#64748B]'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                    current
                      ? 'bg-[#6C3CE1] text-white'
                      : active
                      ? 'bg-[#22C55E]/20 text-[#22C55E] border border-[#22C55E]/30'
                      : 'bg-[#151C32] text-[#64748B]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-medium hidden sm:inline">{item.title}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Hidden honeypot for bot protection */}
      <input
        type="text"
        name="madar_hp_check"
        value={formData.honeypot}
        onChange={(e) => setFormData({ ...formData, honeypot: e.target.value })}
        className="hidden"
        tabIndex={-1}
        autoComplete="off"
      />

      {errors.form && (
        <div className="mb-4 p-3 rounded-xl bg-[#EF4444]/15 border border-[#EF4444]/30 text-[#EF4444] text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errors.form}</span>
        </div>
      )}

      {/* Step 1: Personal info */}
      {step === 1 && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label required>الاسم الثلاثي أو المستعار للجدية</Label>
              <Input
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="مثال: صالح بن سعد المطيري"
                error={errors.fullName}
              />
            </div>
            <div>
              <Label required>أنا (الجنس)</Label>
              <Select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                options={[
                  { value: 'male', label: 'خاطب (رجل)' },
                  { value: 'female', label: 'مخطوبة (امرأة / ولي أمر)' },
                ]}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Label required>العمر (سنة)</Label>
              <Input
                type="number"
                min={18}
                max={80}
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) || 18 })}
                error={errors.age}
              />
            </div>
            <div>
              <Label required>الحالة الاجتماعية</Label>
              <Select
                value={formData.maritalStatus}
                onChange={(e) => setFormData({ ...formData, maritalStatus: e.target.value as any })}
                options={[
                  { value: 'single', label: 'أعزب / عزباء' },
                  { value: 'divorced', label: 'مطلق / مطلقة' },
                  { value: 'widowed', label: 'أرمل / أرملة' },
                ]}
              />
            </div>
            <div>
              <Label required>المدينة الحالية</Label>
              <Input
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="مثال: الرياض / جدة"
                error={errors.city}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label required>الجنسية</Label>
              <Input
                value={formData.nationality}
                onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                placeholder="مثال: سعودي / كويتي / إماراتي"
                error={errors.nationality}
              />
            </div>
            <div>
              <Label>الوظيفة / جهة العمل</Label>
              <Input
                value={formData.job}
                onChange={(e) => setFormData({ ...formData, job: e.target.value })}
                placeholder="مثال: مهندس حاسب في جهة حكومية"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>المؤهل التعليمي</Label>
              <Input
                value={formData.education}
                onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                placeholder="بكالوريوس / ماجستير / ثانوي"
              />
            </div>
            <div>
              <Label>الالتزام الديني</Label>
              <Input
                value={formData.religiousCommitment}
                onChange={(e) => setFormData({ ...formData, religiousCommitment: e.target.value })}
                placeholder="مثال: محافظ على الصلوات، معتدل"
              />
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Partner Requirements */}
      {step === 2 && (
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <Label required>مواصفات الشريك المطلوب بدقة واستفاضة</Label>
              <span className="text-xs text-slate-400">
                {formData.partnerRequirements.length} / 40 حرفاً على الأقل
              </span>
            </div>
            <Textarea
              rows={5}
              value={formData.partnerRequirements}
              onChange={(e) => setFormData({ ...formData, partnerRequirements: e.target.value })}
              placeholder="اكتب بالتفصيل: العمر المفضل، المؤهل، الأخلاق، الحالة الاجتماعية المفضلة للشريك، السكن، وأي شروط خاصة ترغب في توفرها..."
              error={errors.partnerRequirements}
            />
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              * الدقة في ذكر المتطلبات تساعد مستشاري المكتب على إيجاد أفضل مطابقة متوافقة مع رغبتك.
            </p>
          </div>

          <div>
            <Label>ملاحظات إضافية أو ظروف خاصة (اختياري)</Label>
            <Textarea
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="أي استفسار أو ظروف عائلية أو وقت مفضل للزواج..."
            />
          </div>
        </div>
      )}

      {/* Step 3: Contact & Verification */}
      {step === 3 && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label required>رقم الهاتف للتواصل (مع المفتاح الدولي)</Label>
              <Input
                dir="ltr"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+966501234567"
                error={errors.phone}
              />
            </div>
            <div>
              <Label required>وسيلة التواصل المفضلة للمكتب</Label>
              <Select
                value={formData.preferredContact}
                onChange={(e) => setFormData({ ...formData, preferredContact: e.target.value as any })}
                options={[
                  { value: 'whatsapp', label: 'عبر الواتساب فقط' },
                  { value: 'call', label: 'اتصال هاتفي مباشر' },
                  { value: 'email', label: 'البريد الإلكتروني' },
                ]}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>رقم ولي الأمر (موصى به للأخوات)</Label>
              <Input
                dir="ltr"
                value={formData.guardianPhone}
                onChange={(e) => setFormData({ ...formData, guardianPhone: e.target.value })}
                placeholder="+966509998877"
              />
            </div>
            <div>
              <Label>البريد الإلكتروني (اختياري)</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="name@example.com"
              />
            </div>
          </div>

          {/* Privacy & Terms Agreement */}
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
            <label className="flex items-start gap-3 cursor-pointer text-xs text-slate-300 leading-relaxed">
              <input
                type="checkbox"
                checked={formData.termsAccepted}
                onChange={(e) => setFormData({ ...formData, termsAccepted: e.target.checked })}
                className="mt-1 w-4 h-4 rounded border-slate-700 text-[#D4AF37] focus:ring-[#D4AF37]"
              />
              <span>
                أقر بصحة وجدية جميع البيانات المذكورة أعلاه، وأوافق على سياسة السرية والضوابط الشرعية
                الخاصة بـ <strong className="text-[#D4AF37]">{siteName}</strong> للتوفيق في الزواج.
              </span>
            </label>
            {errors.termsAccepted && (
              <p className="text-xs text-rose-400 pr-7">{errors.termsAccepted}</p>
            )}
          </div>
        </div>
      )}

      {/* Step 4: Final Confirmation */}
      {step === 4 && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-[#D4AF37]/30 space-y-3">
            <h4 className="font-bold text-[#D4AF37] text-sm flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              مراجعة بيانات الطلب قبل الإرسال النهائي
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs text-slate-300 pt-2 border-t border-slate-800">
              <div>
                <span className="text-slate-500 block">الاسم:</span>
                <span className="font-semibold text-slate-100">{formData.fullName}</span>
              </div>
              <div>
                <span className="text-slate-500 block">الجنس:</span>
                <span className="font-semibold text-slate-100">
                  {formData.gender === 'male' ? 'خاطب' : 'مخطوبة'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">العمر والحالة:</span>
                <span className="font-semibold text-slate-100">
                  {formData.age} سنة ({MARITAL_STATUS_LABELS[formData.maritalStatus]})
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">المدينة والجنسية:</span>
                <span className="font-semibold text-slate-100">
                  {formData.city} - {formData.nationality}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">الهاتف:</span>
                <span className="font-semibold text-slate-100" dir="ltr">
                  {formData.phone}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">التواصل المفضل:</span>
                <span className="font-semibold text-slate-100">
                  {PREFERRED_CONTACT_LABELS[formData.preferredContact]}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 text-xs">
              <span className="text-slate-500 block mb-1">مواصفات الشريك المطلوبة:</span>
              <p className="bg-slate-950 p-2.5 rounded-lg text-slate-300 leading-relaxed max-h-24 overflow-y-auto">
                {formData.partnerRequirements}
              </p>
            </div>
          </div>

          <div className="text-xs text-[#94A3B8] flex items-center gap-2 bg-[#22C55E]/10 border border-[#22C55E]/20 p-3 rounded-xl">
            <ShieldCheck className="w-4 h-4 text-[#22C55E] flex-shrink-0" />
            <span>
              نظام التشفير نشط: لن يتم نشر بياناتك أو مشاركتها إلا مع المستشار المعتمد للمكتب بعد فحص الأهلية.
            </span>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-6 border-t border-white/5 mt-6">
        {step > 1 ? (
          <Button type="button" variant="secondary" size="sm" onClick={handlePrev}>
            <ChevronRight className="w-4 h-4 ml-1" />
            السابق
          </Button>
        ) : (
          <div />
        )}

        {step < 4 ? (
          <Button type="button" variant="primary" size="sm" onClick={handleNext}>
            التالي
            <ChevronLeft className="w-4 h-4 mr-1" />
          </Button>
        ) : (
          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={handleSubmit}
            isLoading={createRequest.isPending}
            className="px-6 shadow-lg shadow-[#6C3CE1]/30"
          >
            <Send className="w-4 h-4 ml-2" />
            تأكيد وإرسال الطلب الآن
          </Button>
        )}
      </div>
    </Card>
  );
};

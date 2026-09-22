import React, { useState } from 'react';
import { Link } from 'wouter';
import { useAuth } from '../hooks/useAuth.ts';
import { useToast } from '../contexts/ToastContext.tsx';
import { trpc } from '../lib/trpc.ts';
import { Navbar } from '../components/layout/Navbar.tsx';
import { Footer } from '../components/layout/Footer.tsx';
import { Button } from '../components/ui/Button.tsx';
import { Card } from '../components/ui/Card.tsx';
import { Input } from '../components/ui/Input.tsx';
import { Label } from '../components/ui/Label.tsx';
import { Dialog } from '../components/ui/Dialog.tsx';
import { EmptyState } from '../components/ui/EmptyState.tsx';
import {
  Heart,
  Sparkles,
  CheckCircle2,
  Clock,
  AlertCircle,
  Phone,
  ShieldCheck,
  User,
  Lock,
  Edit3,
  XCircle,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Building2,
  Calendar,
  Search,
  Filter,
  Check,
  Info,
} from 'lucide-react';

export const ClientDashboard: React.FC = () => {
  const { user, isAuthenticated, isLoggingIn, login } = useAuth();
  const utils = trpc.useUtils();
  const { addToast } = useToast();

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<'requests' | 'profile' | 'security' | 'bureaus'>('requests');

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Expanded cards
  const [expandedRequestId, setExpandedRequestId] = useState<number | null>(null);

  // Edit Requirements Modal State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingRequest, setEditingRequest] = useState<any>(null);
  const [editPartnerReq, setEditPartnerReq] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editContactPref, setEditContactPref] = useState<'whatsapp' | 'call' | 'email'>('whatsapp');

  // Withdraw Modal State
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [withdrawingRequest, setWithdrawingRequest] = useState<any>(null);
  const [withdrawReason, setWithdrawReason] = useState('تم الزواج بفضل الله وتوفيقه');

  // Profile Form State
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profileEmail, setProfileEmail] = useState(user?.email || '');
  const [profilePhone, setProfilePhone] = useState('');
  const [profileCity, setProfileCity] = useState('الرياض');

  // Security Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Queries
  const { data: requests = [], isLoading: requestsLoading } = trpc.marriageRequests.clientRequests.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  const { data: allBureaus = [] } = trpc.sites.listAll.useQuery();

  // Mutations
  const updateReqMutation = trpc.marriageRequests.clientUpdateRequirements.useMutation({
    onSuccess: () => {
      utils.marriageRequests.clientRequests.invalidate();
      setEditModalOpen(false);
      setEditingRequest(null);
      addToast({
        title: 'تم تحديث الشروط',
        description: 'تم حفظ مواصفات الشريك المحدثة بنجاح لدى المستشار.',
        type: 'success',
      });
    },
    onError: (err) => {
      addToast({
        title: 'تعذر التحديث',
        description: err.message || 'حدث خطأ أثناء تعديل البيانات',
        type: 'error',
      });
    },
  });

  const withdrawMutation = trpc.marriageRequests.clientWithdraw.useMutation({
    onSuccess: () => {
      utils.marriageRequests.clientRequests.invalidate();
      setWithdrawModalOpen(false);
      setWithdrawingRequest(null);
      addToast({
        title: 'تم إغلاق الطلب',
        description: 'تم إيقاف البحث وإغلاق الطلب بنجاح.',
        type: 'info',
      });
    },
  });

  const updateProfileMutation = trpc.auth.updateProfile.useMutation({
    onSuccess: () => {
      utils.auth.me.invalidate();
      addToast({
        title: 'تم حفظ الملف الشخصي',
        description: 'تم تحديث بياناتك الشخصية بنجاح.',
        type: 'success',
      });
    },
  });

  const changePasswordMutation = trpc.auth.changePassword.useMutation({
    onSuccess: () => {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      addToast({
        title: 'تم تغيير كلمة المرور',
        description: 'تم تحديث كلمة المرور لحسابك بأمان.',
        type: 'success',
      });
    },
    onError: (err) => {
      addToast({
        title: 'خطأ في تغيير كلمة المرور',
        description: err.message || 'تأكد من صحة كلمة المرور الحالية',
        type: 'error',
      });
    },
  });

  // Handle Edit Click
  const handleOpenEdit = (req: any) => {
    setEditingRequest(req);
    setEditPartnerReq(req.partnerRequirements || '');
    setEditPhone(req.phone || '');
    setEditContactPref(req.preferredContact || 'whatsapp');
    setEditModalOpen(true);
  };

  // Handle Withdraw Click
  const handleOpenWithdraw = (req: any) => {
    setWithdrawingRequest(req);
    setWithdrawModalOpen(true);
  };

  // Handle Password Submit
  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      addToast({
        title: 'عدم تطابق',
        description: 'كلمتا المرور غير متطابقتين.',
        type: 'warning',
      });
      return;
    }
    if (newPassword.length < 6) {
      addToast({
        title: 'كلمة مرور ضعيفة',
        description: 'يجب أن لا تقل كلمة المرور عن 6 خانات.',
        type: 'warning',
      });
      return;
    }
    changePasswordMutation.mutate({ currentPassword, newPassword });
  };

  // Filter Requests
  const filteredRequests = requests.filter((r: any) => {
    const matchesStatus = statusFilter === 'all' ? true : r.status === statusFilter;
    const matchesSearch = searchQuery
      ? (r.site?.name && r.site.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (r.partnerRequirements && r.partnerRequirements.toLowerCase().includes(searchQuery.toLowerCase()))
      : true;
    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new':
        return {
          label: 'جديد - بانتظار الفحص',
          className: 'bg-[#FBBF24]/15 text-[#FBBF24] border border-[#FBBF24]/30',
          icon: Clock,
        };
      case 'reviewed':
        return {
          label: 'قيد التدقيق والمراجعة الشرعية',
          className: 'bg-[#00D4FF]/15 text-[#00D4FF] border border-[#00D4FF]/30',
          icon: CheckCircle2,
        };
      case 'contacted':
        return {
          label: 'جاري التواصل مع المستشار',
          className: 'bg-[#6C3CE1]/20 text-[#A78BFA] border border-[#6C3CE1]/30',
          icon: Phone,
        };
      case 'matched':
        return {
          label: 'تم التوفيق ومطابقة الشريك!',
          className: 'bg-[#22C55E]/20 text-[#22C55E] border border-[#22C55E]/40 shadow-sm shadow-[#22C55E]/20',
          icon: Heart,
        };
      case 'closed':
        return {
          label: 'الطلب مكتمل / مغلق',
          className: 'bg-white/10 text-[#94A3B8] border border-white/10',
          icon: Check,
        };
      default:
        return {
          label: 'قيد المتابعة',
          className: 'bg-[#151C32] text-[#CBD5E1]',
          icon: Info,
        };
    }
  };

  // If not authenticated, show friendly login view
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0B1124] text-[#F8FAFC] flex flex-col justify-between antialiased">
        <Navbar />
        <main className="max-w-xl mx-auto px-4 py-20 w-full">
          <Card className="p-8 border-white/5 text-center space-y-6">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-[#6C3CE1]/20 border border-[#6C3CE1]/40 flex items-center justify-center text-[#A78BFA]">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-bold font-heading text-white mb-2">
                بوابة متابعة طلبات الزواج
              </h2>
              <p className="text-xs text-[#94A3B8] leading-relaxed">
                سجّل دخولك لمتابعة استماراتك وطلبات الزواج المقدمة لمكاتب الوساطة الشرعية، ومعرفة حالة الفحص والمطابقة
                والتواصل مع المستشار الأسري بكل خصوصية.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-4">
              <Link href="/login" className="flex-1">
                <Button variant="primary" size="md" className="w-full font-bold">
                  تسجيل الدخول
                </Button>
              </Link>
              <Link href="/register" className="flex-1">
                <Button variant="outline" size="md" className="w-full">
                  إنشاء حساب جديد
                </Button>
              </Link>
            </div>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B1124] text-[#F8FAFC] flex flex-col justify-between antialiased text-right">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-grow">
        {/* Top Header Card */}
        <div className="mb-8 p-6 sm:p-8 rounded-3xl bg-[#151C32] border border-white/5 shadow-xl relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#6C3CE1]/15 border border-[#6C3CE1]/30 text-xs font-semibold text-[#A78BFA] mb-3">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>بوابة المستفيد الآمنة لمتابعة التوفيق الشرعي</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black font-heading text-white mb-2">
                أهلاً بك، {user?.name || 'طالب الزواج الكريم'}
              </h1>
              <p className="text-xs sm:text-sm text-[#94A3B8] max-w-2xl leading-relaxed">
                نسأل الله لك التوفيق وحسن الاختيار وبناء بيت عامر بالمودة والسكينة. يمكنك هنا متابعة مسار طلباتك مع مكاتب
                الزواج والاطلاع على تحديثات المستشارين بكل سرية وأمان.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                variant="primary"
                size="sm"
                className="gap-2"
                onClick={() => setActiveTab('bureaus')}
              >
                <Heart className="w-4 h-4 fill-white" />
                تقديم طلب زواج جديد
              </Button>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-white/5">
            <div className="bg-[#0B1124] p-4 rounded-2xl border border-white/5">
              <span className="text-xs text-[#94A3B8] block mb-1">إجمالي طلباتك</span>
              <span className="text-2xl font-black text-white font-heading">{requests.length}</span>
            </div>
            <div className="bg-[#0B1124] p-4 rounded-2xl border border-white/5">
              <span className="text-xs text-[#94A3B8] block mb-1">قيد الفحص والمراجعة</span>
              <span className="text-2xl font-black text-[#00D4FF] font-heading">
                {requests.filter((r: any) => r.status === 'new' || r.status === 'reviewed').length}
              </span>
            </div>
            <div className="bg-[#0B1124] p-4 rounded-2xl border border-white/5">
              <span className="text-xs text-[#94A3B8] block mb-1">تمت المطابقة والترشيح</span>
              <span className="text-2xl font-black text-[#22C55E] font-heading">
                {requests.filter((r: any) => r.status === 'matched').length}
              </span>
            </div>
            <div className="bg-[#0B1124] p-4 rounded-2xl border border-white/5">
              <span className="text-xs text-[#94A3B8] block mb-1">السرية والأمان</span>
              <span className="text-xs font-semibold text-[#22C55E] flex items-center gap-1 mt-2">
                <ShieldCheck className="w-4 h-4" />
                مشفر ومحمي شرعياً
              </span>
            </div>
          </div>
        </div>

        {/* Main Tab Navigation */}
        <div className="flex items-center gap-1.5 border-b border-white/5 mb-8 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setActiveTab('requests')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'requests'
                ? 'bg-[#6C3CE1] text-white font-bold shadow-md shadow-[#6C3CE1]/20'
                : 'text-[#94A3B8] hover:text-white hover:bg-white/5'
            }`}
          >
            <Heart className="w-4 h-4" />
            <span>طلبات الزواج ومتابعة المطابقة ({requests.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'profile'
                ? 'bg-[#6C3CE1] text-white font-bold shadow-md shadow-[#6C3CE1]/20'
                : 'text-[#94A3B8] hover:text-white hover:bg-white/5'
            }`}
          >
            <User className="w-4 h-4" />
            <span>بيانات الملف الشخصي</span>
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'security'
                ? 'bg-[#6C3CE1] text-white font-bold shadow-md shadow-[#6C3CE1]/20'
                : 'text-[#94A3B8] hover:text-white hover:bg-white/5'
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>الأمان وكلمة المرور</span>
          </button>

          <button
            onClick={() => setActiveTab('bureaus')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'bureaus'
                ? 'bg-[#6C3CE1] text-white font-bold shadow-md shadow-[#6C3CE1]/20'
                : 'text-[#94A3B8] hover:text-white hover:bg-white/5'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>المكاتب المعتمدة</span>
          </button>
        </div>

        {/* TAB 1: REQUESTS TRACKER */}
        {activeTab === 'requests' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-[#151C32] border border-white/5">
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 absolute right-3 top-3 text-[#94A3B8]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="بحث في الطلبات أو اسم المكتب..."
                  className="w-full bg-[#0B1124] border border-white/10 rounded-xl pr-9 pl-3 py-2 text-xs text-white focus:outline-none focus:border-[#6C3CE1]"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
                <span className="text-xs text-[#94A3B8] flex items-center gap-1 whitespace-nowrap">
                  <Filter className="w-3.5 h-3.5" />
                  الحالة:
                </span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-[#0B1124] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#6C3CE1]"
                >
                  <option value="all">جميع الحالات</option>
                  <option value="new">جديد - بانتظار الفحص</option>
                  <option value="reviewed">قيد التدقيق</option>
                  <option value="contacted">تم التواصل مع المستشار</option>
                  <option value="matched">تم التوفيق والمطابقة</option>
                  <option value="closed">مغلق / مكتمل</option>
                </select>
              </div>
            </div>

            {requestsLoading ? (
              <div className="p-12 text-center text-[#94A3B8] text-sm">
                <div className="w-8 h-8 mx-auto mb-3 border-2 border-[#6C3CE1] border-t-transparent rounded-full animate-spin" />
                جاري استرجاع طلبات الزواج وتحديثات المطابقة...
              </div>
            ) : filteredRequests.length === 0 ? (
              <EmptyState
                icon={Heart}
                title="لا توجد طلبات زواج مطابقة"
                description="لم تقدم أي طلب بعد، أو لا توجد نتائج مطابقة لخيارات الفلترة الحالية. يمكنك تصفح مكاتب الزواج المعتمدة وتقديم طلبك بكل سرية."
                actionLabel="تصفح مكاتب الزواج المعتمدة"
                onAction={() => setActiveTab('bureaus')}
              />
            ) : (
              <div className="space-y-4">
                {filteredRequests.map((req: any) => {
                  const badge = getStatusBadge(req.status);
                  const BadgeIcon = badge.icon;
                  const isExpanded = expandedRequestId === req.id;

                  return (
                    <Card
                      key={req.id}
                      className="p-6 border-white/5 hover:border-white/15 transition-all space-y-4"
                    >
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-2xl bg-[#6C3CE1]/20 border border-[#6C3CE1]/30 flex items-center justify-center text-[#A78BFA] flex-shrink-0">
                            <Building2 className="w-6 h-6" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-base font-bold text-white font-heading">
                                {req.site?.name || 'مكتب وساطة زواج معتمد'}
                              </h3>
                              {req.site?.officeLicenseNumber && (
                                <span className="text-[10px] px-2 py-0.5 rounded bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/30 font-semibold">
                                  {req.site.officeLicenseNumber}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-3 text-xs text-[#94A3B8] mt-1">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5" />
                                تاريخ التقديم: {new Date(req.createdAt).toLocaleDateString('ar-SA')}
                              </span>
                              <span>•</span>
                              <span>رقم الطلب: #REQ-{req.id}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-auto">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold ${badge.className}`}
                          >
                            <BadgeIcon className="w-3.5 h-3.5" />
                            {badge.label}
                          </span>
                        </div>
                      </div>

                      {/* Partner Requirements Summary */}
                      <div className="p-3.5 rounded-xl bg-[#0B1124] border border-white/5 text-xs text-[#CBD5E1]">
                        <span className="text-[#A78BFA] font-bold block mb-1">
                          المواصفات المطلوبة لشريك الحياة:
                        </span>
                        <p className="line-clamp-2 leading-relaxed">
                          {req.partnerRequirements || '—'}
                        </p>
                      </div>

                      {/* Card Action Footer */}
                      <div className="flex items-center justify-between pt-2 border-t border-white/5">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleOpenEdit(req)}
                            className="text-xs h-7"
                          >
                            <Edit3 className="w-3 h-3 ml-1" />
                            تعديل الشروط
                          </Button>
                          {req.status !== 'closed' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenWithdraw(req)}
                              className="text-xs h-7 text-[#EF4444] hover:bg-[#EF4444]/10"
                            >
                              <XCircle className="w-3 h-3 ml-1" />
                              إغلاق / سحب الطلب
                            </Button>
                          )}
                        </div>

                        <button
                          onClick={() => setExpandedRequestId(isExpanded ? null : req.id)}
                          className="flex items-center gap-1 text-xs text-[#94A3B8] hover:text-white transition-colors cursor-pointer"
                        >
                          <span>{isExpanded ? 'طي التفاصيل' : 'تفاصيل كاملة'}</span>
                          {isExpanded ? (
                            <ChevronUp className="w-3.5 h-3.5" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>

                      {/* Expanded View */}
                      {isExpanded && (
                        <div className="pt-4 border-t border-white/5 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-[#0B1124] p-4 rounded-xl">
                          <div>
                            <span className="text-[#64748B] block">العمر والحالة:</span>
                            <span className="font-semibold text-white">
                              {req.age} سنة ({req.maritalStatus})
                            </span>
                          </div>
                          <div>
                            <span className="text-[#64748B] block">المدينة والجنسية:</span>
                            <span className="font-semibold text-white">
                              {req.city} - {req.nationality}
                            </span>
                          </div>
                          <div>
                            <span className="text-[#64748B] block">رقم الهاتف:</span>
                            <span className="font-semibold text-[#00D4FF] font-mono" dir="ltr">
                              {req.phone}
                            </span>
                          </div>
                          <div>
                            <span className="text-[#64748B] block">التواصل المفضل:</span>
                            <span className="font-semibold text-white">
                              {req.preferredContact === 'whatsapp'
                                ? 'واتساب'
                                : req.preferredContact === 'call'
                                ? 'اتصال'
                                : 'بريد إلكتروني'}
                            </span>
                          </div>
                        </div>
                      )}
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: PROFILE */}
        {activeTab === 'profile' && (
          <div className="max-w-2xl mx-auto space-y-6">
            <Card className="p-6 sm:p-8 border-white/5 space-y-4">
              <h3 className="text-lg font-bold font-heading text-white">
                تعديل بيانات الملف الشخصي
              </h3>
              <div className="space-y-3 text-xs">
                <div>
                  <Label>الاسم الكامل</Label>
                  <Input
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                  />
                </div>
                <div>
                  <Label>البريد الإلكتروني</Label>
                  <Input
                    value={profileEmail}
                    onChange={(e) => setProfileEmail(e.target.value)}
                    dir="ltr"
                  />
                </div>
                <div className="pt-2 flex justify-end">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() =>
                      updateProfileMutation.mutate({
                        name: profileName,
                        email: profileEmail,
                      })
                    }
                    isLoading={updateProfileMutation.isPending}
                  >
                    حفظ التعديلات
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* TAB 3: SECURITY & PASSWORD */}
        {activeTab === 'security' && (
          <div className="max-w-2xl mx-auto space-y-6">
            <Card className="p-6 sm:p-8 border-white/5 space-y-4">
              <h3 className="text-lg font-bold font-heading text-white">
                الأمان وتغيير كلمة المرور
              </h3>
              <form onSubmit={handlePasswordSubmit} className="space-y-4 text-xs">
                <div>
                  <Label required>كلمة المرور الحالية</Label>
                  <Input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label required>كلمة المرور الجديدة</Label>
                    <Input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="لا تقل عن 6 خانات"
                      required
                    />
                  </div>
                  <div>
                    <Label required>تأكيد كلمة المرور الجديدة</Label>
                    <Input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="تأكيد الكلمة"
                      required
                    />
                  </div>
                </div>
                <div className="pt-2 flex justify-end">
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    isLoading={changePasswordMutation.isPending}
                  >
                    تحديث كلمة المرور
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        )}

        {/* TAB 4: BUREAUS */}
        {activeTab === 'bureaus' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {allBureaus.map((site: any) => (
                <Card
                  key={site.id}
                  className="p-6 border-white/5 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/30">
                        {site.officeLicenseNumber || 'مكتب معتمد'}
                      </span>
                      <span className="text-xs text-[#94A3B8]">الرياض</span>
                    </div>
                    <h4 className="font-bold text-white text-base mb-2 font-heading">
                      {site.name}
                    </h4>
                    <p className="text-xs text-[#94A3B8] line-clamp-3 mb-4 leading-relaxed">
                      {site.tagline || site.officeAbout}
                    </p>
                  </div>
                  <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                    <span className="text-xs text-[#00D4FF] font-semibold">
                      {site.successRate != null ? `نسبة التوفيق: ${site.successRate}%` : 'مكتب معتمد ومرخص'}
                    </span>
                    <Link href={`/site/${site.subdomain}`}>
                      <Button variant="outline" size="sm" className="gap-1 text-xs">
                        <span>زيارة المكتب</span>
                        <ExternalLink className="w-3 h-3" />
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* EDIT REQUIREMENTS MODAL */}
      <Dialog
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="تعديل شروط الشريك ووسيلة الاتصال"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!editingRequest) return;
            updateReqMutation.mutate({
              id: editingRequest.id,
              partnerRequirements: editPartnerReq,
              phone: editPhone,
              preferredContact: editContactPref,
            });
          }}
          className="space-y-4 pt-2 text-xs"
        >
          <div>
            <Label required>مواصفات وشروط شريك الحياة المطلوب</Label>
            <textarea
              rows={4}
              value={editPartnerReq}
              onChange={(e) => setEditPartnerReq(e.target.value)}
              className="w-full rounded-xl bg-[#0B1124] border border-white/10 p-3 text-xs text-white focus:outline-none focus:border-[#6C3CE1]"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label required>رقم هاتف التواصل المحدث</Label>
              <Input
                type="tel"
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
                required
                dir="ltr"
              />
            </div>
            <div>
              <Label required>وسيلة التواصل المفضلة</Label>
              <select
                value={editContactPref}
                onChange={(e) => setEditContactPref(e.target.value as any)}
                className="w-full h-10 rounded-xl bg-[#0B1124] border border-white/10 px-3 text-xs text-white"
              >
                <option value="whatsapp">واتساب مباشر</option>
                <option value="call">اتصال هاتفي</option>
                <option value="email">بريد إلكتروني</option>
              </select>
            </div>
          </div>

          <div className="pt-3 flex justify-end gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={() => setEditModalOpen(false)}>
              إلغاء
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={updateReqMutation.isPending}
            >
              حفظ التعديلات
            </Button>
          </div>
        </form>
      </Dialog>

      {/* WITHDRAW REQUEST MODAL */}
      <Dialog
        isOpen={withdrawModalOpen}
        onClose={() => setWithdrawModalOpen(false)}
        title="تأكيد سحب / إغلاق طلب الزواج"
      >
        <div className="space-y-4 pt-2 text-xs">
          <div className="p-3 rounded-xl bg-[#FBBF24]/10 border border-[#FBBF24]/20 text-[#FBBF24]">
            عند إغلاق الطلب، سيتوقف مستشارو المكتب عن عرض أي مرشحين جدد لك.
          </div>

          <div>
            <Label required>سبب إغلاق أو سحب الطلب</Label>
            <select
              value={withdrawReason}
              onChange={(e) => setWithdrawReason(e.target.value)}
              className="w-full h-10 rounded-xl bg-[#0B1124] border border-white/10 px-3 text-xs text-white"
            >
              <option value="تم الزواج بفضل الله وتوفيقه">تم الزواج بفضل الله وتوفيقه</option>
              <option value="الرغبة في تأجيل موضوع الزواج حالياً">الرغبة في تأجيل موضوع الزواج حالياً</option>
              <option value="الرغبة في تغيير شروط التقديم من جديد">الرغبة في تغيير شروط التقديم من جديد</option>
              <option value="أسباب وظروف خاصة">أسباب وظروف خاصة</option>
            </select>
          </div>

          <div className="pt-3 flex justify-end gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={() => setWithdrawModalOpen(false)}>
              تراجع
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => {
                if (!withdrawingRequest) return;
                withdrawMutation.mutate({
                  id: withdrawingRequest.id,
                  reason: withdrawReason,
                });
              }}
              isLoading={withdrawMutation.isPending}
            >
              تأكيد إغلاق الطلب
            </Button>
          </div>
        </div>
      </Dialog>

      <Footer />
    </div>
  );
};

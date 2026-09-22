import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { trpc } from '../lib/trpc.ts';
import { useAuth } from '../hooks/useAuth.ts';
import { useToast } from '../contexts/ToastContext.tsx';
import { Navbar } from '../components/layout/Navbar.tsx';
import { Footer } from '../components/layout/Footer.tsx';
import { ClientDashboard } from './ClientDashboard.tsx';
import { Button } from '../components/ui/Button.tsx';
import { Card, CardHeader, CardTitle } from '../components/ui/Card.tsx';
import { Input } from '../components/ui/Input.tsx';
import { Label } from '../components/ui/Label.tsx';
import { Textarea } from '../components/ui/Textarea.tsx';
import { Select, Dialog } from '../components/ui/Dialog.tsx';
import { StatCard } from '../components/dashboard/StatCard.tsx';
import { StatusBadge } from '../components/dashboard/StatusBadge.tsx';
import { DashboardCharts } from '../components/dashboard/DashboardCharts.tsx';
import { EmptyState } from '../components/ui/EmptyState.tsx';
import {
  Heart,
  LayoutDashboard,
  Users,
  Sparkles,
  BookOpen,
  PackageCheck,
  HelpCircle,
  Globe,
  Wallet,
  Settings,
  Plus,
  Search,
  Eye,
  Trash2,
  CheckCircle2,
  Clock,
  Phone,
  MessageCircle,
  Mail,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  AlertCircle,
  Building2,
} from 'lucide-react';
import {
  MARITAL_STATUS_LABELS,
  PREFERRED_CONTACT_LABELS,
  TEMPLATES,
} from '../const.ts';
import { formatDate, formatCurrency } from '../lib/utils.ts';

export const Dashboard: React.FC = () => {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [location] = useLocation();
  const { addToast } = useToast();

  // Tab state
  const searchParams = new URLSearchParams(window.location.search);
  const initialTab = searchParams.get('tab') || 'overview';
  const [activeTab, setActiveTab] = useState<string>(initialTab);

  // Queries
  const utils = trpc.useUtils();
  const { data: mySites = [], isLoading: sitesLoading } = trpc.sites.listMySites.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  const activeSite = mySites[0];
  const siteId = activeSite?.id;

  const { data: stats } = trpc.marriageRequests.getStats.useQuery(
    { siteId: siteId! },
    { enabled: !!siteId }
  );

  const { data: walletData } = trpc.commerce.getWallet.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  // Requests Table Filters & Search
  const [requestSearch, setRequestSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [genderFilter, setGenderFilter] = useState('');

  const { data: requests = [], isLoading: requestsLoading } = trpc.marriageRequests.list.useQuery(
    {
      siteId: siteId!,
      search: requestSearch || undefined,
      status: statusFilter || undefined,
      gender: genderFilter || undefined,
    },
    { enabled: !!siteId }
  );

  // Success stories, articles, packages, FAQs
  const { data: successStories = [] } = trpc.successStories.list.useQuery(
    { siteId: siteId! },
    { enabled: !!siteId }
  );

  const { data: articles = [] } = trpc.articles.list.useQuery(
    { siteId: siteId! },
    { enabled: !!siteId }
  );

  const { data: packages = [] } = trpc.packages.list.useQuery(
    { siteId: siteId! },
    { enabled: !!siteId }
  );

  const { data: faqs = [] } = trpc.faqs.list.useQuery(
    { siteId: siteId! },
    { enabled: !!siteId }
  );

  // Request detail modal
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [newNote, setNewNote] = useState('');

  // Status mutation
  const updateStatusMutation = trpc.marriageRequests.updateStatus.useMutation({
    onSuccess: () => {
      utils.marriageRequests.list.invalidate();
      utils.marriageRequests.getStats.invalidate();
      if (selectedRequest) {
        setSelectedRequest((prev: any) => ({ ...prev, status: selectedRequest.status }));
      }
      addToast({
        title: 'تم تحديث حالة الطلب',
        description: 'تم حفظ الحالة الجديدة في قاعدة البيانات بنجاح.',
        type: 'success',
      });
    },
    onError: (err) => {
      addToast({
        title: 'خطأ في التحديث',
        description: err.message || 'فشل تحديث حالة الطلب',
        type: 'error',
      });
    },
  });

  // Note mutation
  const addNoteMutation = trpc.marriageRequests.addNote.useMutation({
    onSuccess: (updatedReq: any) => {
      utils.marriageRequests.list.invalidate();
      setSelectedRequest(updatedReq);
      setNewNote('');
      addToast({
        title: 'تم حفظ الملاحظة',
        description: 'تمت إضافة الملاحظة السرية إلى سجل الطلب.',
        type: 'success',
      });
    },
    onError: (err) => {
      addToast({
        title: 'خطأ',
        description: err.message || 'فشل حفظ الملاحظة',
        type: 'error',
      });
    },
  });

  // Site update mutation
  const updateSiteMutation = trpc.sites.update.useMutation({
    onSuccess: () => {
      utils.sites.listMine.invalidate();
      addToast({
        title: 'تم حفظ التعديلات',
        description: 'تم تحديث بيانات ومظهر موقع المكتب بنجاح.',
        type: 'success',
      });
    },
    onError: (err) => {
      addToast({
        title: 'تعذر الحفظ',
        description: err.message || 'فشل تحديث بيانات الموقع',
        type: 'error',
      });
    },
  });

  // Wallet deposit
  const [depositAmount, setDepositAmount] = useState('100');
  const depositMutation = trpc.commerce.deposit.useMutation({
    onSuccess: (data) => {
      utils.commerce.getWallet.invalidate();
      if (data && data.status === 'pending') {
        addToast({
          title: 'تم رفع طلب الإيداع بنجاح',
          description: 'طلب الإيداع قيد المراجعة والاعتماد من قبل إدارة المنصة.',
          type: 'info',
        });
      } else {
        addToast({
          title: 'تم إيداع الرصيد',
          description: 'تمت معالجة الرصيد وإضافته بنجاح.',
          type: 'success',
        });
      }
    },
    onError: (err) => {
      addToast({
        title: 'فشلت العملية',
        description: err.message || 'تعذر استكمال عملية الإيداع',
        type: 'error',
      });
    },
  });

  const cancelDepositMutation = trpc.wallet.cancelDeposit.useMutation({
    onSuccess: () => {
      utils.commerce.getWallet.invalidate();
      addToast({
        title: 'تم إلغاء الطلب',
        description: 'تم إلغاء طلب الإيداع المعلق بنجاح',
        type: 'info',
      });
    },
    onError: (err) => {
      addToast({
        title: 'تعذر الإلغاء',
        description: err.message || 'فشل إلغاء الطلب',
        type: 'error',
      });
    },
  });

  // Item Modals
  const [storyModalOpen, setStoryModalOpen] = useState(false);
  const [storyForm, setStoryForm] = useState({
    title: '',
    story: '',
    brideName: '',
    groomName: '',
    marriageDate: '',
    imageUrl: '',
  });

  const createStoryMutation = trpc.successStories.create.useMutation({
    onSuccess: () => {
      utils.successStories.list.invalidate();
      setStoryModalOpen(false);
      setStoryForm({
        title: '',
        story: '',
        brideName: '',
        groomName: '',
        marriageDate: '',
        imageUrl: '',
      });
      addToast({
        title: 'تم نشر قصة النجاح',
        description: 'تمت إضافة المباركة إلى موقع المكتب بنجاح.',
        type: 'success',
      });
    },
  });

  const [articleModalOpen, setArticleModalOpen] = useState(false);
  const [articleForm, setArticleForm] = useState({
    title: '',
    content: '',
    category: 'نصائح للمقبلين على الزواج',
    imageUrl: '',
  });

  const createArticleMutation = trpc.articles.create.useMutation({
    onSuccess: () => {
      utils.articles.list.invalidate();
      setArticleModalOpen(false);
      setArticleForm({
        title: '',
        content: '',
        category: 'نصائح للمقبلين على الزواج',
        imageUrl: '',
      });
      addToast({
        title: 'تم نشر المقال',
        description: 'المقال متاح الآن في قسم التوعية الأسرية بالموقع.',
        type: 'success',
      });
    },
  });

  const [faqModalOpen, setFaqModalOpen] = useState(false);
  const [faqForm, setFaqForm] = useState({
    question: '',
    answer: '',
    orderNum: 1,
  });

  const createFaqMutation = trpc.faqs.create.useMutation({
    onSuccess: () => {
      utils.faqs.list.invalidate();
      setFaqModalOpen(false);
      setFaqForm({ question: '', answer: '', orderNum: 1 });
      addToast({
        title: 'تم حفظ السؤال الشائع',
        description: 'تمت إضافة السؤال إلى قسم الأسئلة الشائعة بنجاح.',
        type: 'success',
      });
    },
  });

  const [packageModalOpen, setPackageModalOpen] = useState(false);
  const [packageForm, setPackageForm] = useState({
    name: '',
    description: '',
    price: 300,
    features: 'استقبال وفحص الطلب\nجلسة مطابقة مع المستشار\nمتابعة أولياء الأمور',
  });

  const createPackageMutation = trpc.packages.create.useMutation({
    onSuccess: () => {
      utils.packages.list.invalidate();
      setPackageModalOpen(false);
      setPackageForm({ name: '', description: '', price: 300, features: '' });
      addToast({
        title: 'تمت إضافة الباقة',
        description: 'أصبحت الباقة متاحة للمتقدمين على موقع المكتب.',
        type: 'success',
      });
    },
  });

  // If client/applicant
  if (user?.role === 'user') {
    return <ClientDashboard />;
  }

  // If not logged in
  if (!authLoading && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0B1124] text-[#F8FAFC] flex flex-col antialiased">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-6 text-center">
          <Card className="max-w-md p-8 border-white/5 space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-[#6C3CE1]/20 border border-[#6C3CE1]/40 flex items-center justify-center mx-auto text-[#A78BFA]">
              <Building2 className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-bold font-heading text-white">
              لوحة تحكم صاحب مكتب الزواج
            </h2>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              يرجى تسجيل الدخول أو إطلاق موقع مكتبك للوصول إلى طلبات الزواج وسجلات المتقدمين.
            </p>
            <div className="flex flex-col gap-2.5 pt-2">
              <Link href="/">
                <Button variant="primary" className="w-full">
                  تسجيل الدخول من الصفحة الرئيسية
                </Button>
              </Link>
              <Link href="/builder">
                <Button variant="secondary" className="w-full">
                  إنشاء وتدشين مكتب زواج جديد
                </Button>
              </Link>
            </div>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  const navTabs = [
    { id: 'overview', label: 'نظرة عامة', icon: LayoutDashboard },
    {
      id: 'requests',
      label: 'طلبات الزواج',
      icon: Users,
      badge: stats?.pending ? `${stats.pending} جديد` : undefined,
    },
    { id: 'stories', label: 'قصص التوفيق', icon: Sparkles },
    { id: 'articles', label: 'المقالات والتوعية', icon: BookOpen },
    { id: 'packages', label: 'باقات الخدمات', icon: PackageCheck },
    { id: 'faqs', label: 'الأسئلة الشائعة', icon: HelpCircle },
    { id: 'site_settings', label: 'إدارة وتخصيص الموقع', icon: Globe },
    { id: 'wallet', label: 'المحفظة والمالية', icon: Wallet },
    { id: 'settings', label: 'إعدادات الحساب', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#0B1124] text-[#F8FAFC] text-right flex flex-col antialiased">
      <Navbar />

      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Top Header Bar */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between pb-6 border-b border-white/5 gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black font-heading text-white">مركز تحكم المكتب</h1>
              {activeSite && (
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#6C3CE1]/15 text-[#A78BFA] border border-[#6C3CE1]/30 font-semibold">
                  {activeSite.name}
                </span>
              )}
            </div>
            <p className="text-xs text-[#94A3B8] mt-1">
              مرحباً بك {user?.name || 'صاحب المكتب'} — إدارة استمارات الزواج الشرعي والموقع المعتمد
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {activeSite && (
              <Link href={`/site/${activeSite.subdomain}`}>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-[#22C55E]/30 text-[#22C55E] hover:bg-[#22C55E]/10"
                >
                  <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
                  زيارة موقع المكتب الحي
                </Button>
              </Link>
            )}
            <Link href="/builder">
              <Button variant="primary" size="sm">
                <Plus className="w-3.5 h-3.5 ml-1.5" />
                تدشين موقع جديد
              </Button>
            </Link>
          </div>
        </div>

        {/* Tab Navigation Menu */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-4 border-b border-white/5 scrollbar-none">
          {navTabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                  active
                    ? 'bg-[#6C3CE1] text-white font-bold shadow-md shadow-[#6C3CE1]/20'
                    : 'text-[#94A3B8] hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                      active
                        ? 'bg-black/30 text-white'
                        : 'bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/40'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6 pt-6">
            {/* Real KPI Cards - Calculated strictly from DB queries */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="إجمالي طلبات الزواج"
                value={stats?.total || 0}
                subtitle="كافة الطلبات المسجلة"
                icon={Users}
                color="violet"
              />
              <StatCard
                title="طلبات جديدة بانتظار الفحص"
                value={stats?.pending || 0}
                subtitle="تحتاج مراجعة المستشار"
                icon={Clock}
                color="rose"
              />
              <StatCard
                title="حالات تم التوفيق فيها"
                value={stats?.matched || 0}
                subtitle="زيجات مباركة تمت"
                icon={Heart}
                color="emerald"
              />
              <StatCard
                title="قصص نجاح منشورة"
                value={successStories.length}
                subtitle="مباركات زواج موثقة"
                icon={Sparkles}
                color="cyan"
              />
            </div>

            {/* Recharts Traffic & Requests Visualization */}
            <DashboardCharts />

            {/* Quick Recent Requests Preview */}
            <Card className="p-5 border-white/5">
              <div className="flex items-center justify-between pb-4 border-b border-white/5">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setActiveTab('requests')}
                  className="text-xs text-[#A78BFA]"
                >
                  عرض جميع الطلبات ({requests.length})
                  <ChevronRight className="w-3.5 h-3.5 mr-1" />
                </Button>
                <CardTitle className="text-sm font-bold text-white">
                  أحدث طلبات الزواج الواردة
                </CardTitle>
              </div>

              {requests.length === 0 ? (
                <EmptyState
                  icon={Users}
                  title="لا توجد طلبات واردة بعد"
                  description="عندما يقوم الزوار بتعبئة استمارة الزواج على موقع مكتبك، ستظهر جميع الطلبات والبيانات السرية هنا مباشرة."
                />
              ) : (
                <div className="overflow-x-auto pt-3">
                  <table className="w-full text-right text-xs">
                    <thead>
                      <tr className="text-[#94A3B8] border-b border-white/5">
                        <th className="pb-3 pr-2">المتقدم</th>
                        <th className="pb-3">الجنس</th>
                        <th className="pb-3">العمر والحالة</th>
                        <th className="pb-3">المدينة والجنسية</th>
                        <th className="pb-3">الحالة</th>
                        <th className="pb-3">تاريخ التقديم</th>
                        <th className="pb-3 pl-2 text-left">إجراء</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {requests.slice(0, 5).map((req) => (
                        <tr key={req.id} className="hover:bg-white/5 transition-colors">
                          <td className="py-3 pr-2 font-semibold text-white">{req.fullName}</td>
                          <td className="py-3 text-[#94A3B8]">
                            {req.gender === 'male' ? 'خاطب' : 'مخطوبة'}
                          </td>
                          <td className="py-3 text-[#94A3B8]">
                            {req.age} سنة ({MARITAL_STATUS_LABELS[req.maritalStatus]})
                          </td>
                          <td className="py-3 text-[#94A3B8]">
                            {req.city} - {req.nationality}
                          </td>
                          <td className="py-3">
                            <StatusBadge status={req.status} />
                          </td>
                          <td className="py-3 text-[#64748B]">{formatDate(req.createdAt)}</td>
                          <td className="py-3 pl-2 text-left">
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => setSelectedRequest(req)}
                              className="text-xs h-7"
                            >
                              <Eye className="w-3.5 h-3.5 ml-1" />
                              تفاصيل
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </div>
        )}

        {/* TAB 2: MARRIAGE REQUESTS (FULL TABLE & FILTER) */}
        {activeTab === 'requests' && (
          <div className="space-y-6 pt-6">
            <Card className="p-5 border-white/5">
              {/* Filter controls */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pb-6 border-b border-white/5">
                <div className="sm:col-span-6 relative">
                  <Search className="w-4 h-4 text-[#94A3B8] absolute right-3.5 top-3" />
                  <Input
                    value={requestSearch}
                    onChange={(e) => setRequestSearch(e.target.value)}
                    placeholder="بحث بالاسم، المدينة، الجنسية، أو رقم الجوال..."
                    className="pr-10 text-xs"
                  />
                </div>
                <div className="sm:col-span-3">
                  <Select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    options={[
                      { value: '', label: 'جميع الحالات' },
                      { value: 'new', label: 'جديد' },
                      { value: 'reviewed', label: 'تمت المراجعة' },
                      { value: 'contacted', label: 'تم التواصل' },
                      { value: 'matched', label: 'تم التوفيق والخطبة' },
                      { value: 'closed', label: 'مغلق' },
                    ]}
                  />
                </div>
                <div className="sm:col-span-3">
                  <Select
                    value={genderFilter}
                    onChange={(e) => setGenderFilter(e.target.value)}
                    options={[
                      { value: '', label: 'كلا الجنسين' },
                      { value: 'male', label: 'الخاطبون (رجال)' },
                      { value: 'female', label: 'المخطوبات (نساء)' },
                    ]}
                  />
                </div>
              </div>

              {/* Table */}
              {requests.length === 0 ? (
                <EmptyState
                  icon={Users}
                  title="لا توجد طلبات مطابقة"
                  description="لم نتمكن من العثور على طلبات بالمعايير المختارة أو لا توجد استمارات مسجلة حالياً."
                />
              ) : (
                <div className="overflow-x-auto pt-3">
                  <table className="w-full text-right text-xs">
                    <thead>
                      <tr className="text-[#94A3B8] border-b border-white/5">
                        <th className="pb-3 pr-2">رقم الطلب</th>
                        <th className="pb-3">المتقدم</th>
                        <th className="pb-3">الجنس</th>
                        <th className="pb-3">العمر والحالة</th>
                        <th className="pb-3">المدينة والجنسية</th>
                        <th className="pb-3">التواصل</th>
                        <th className="pb-3">الحالة</th>
                        <th className="pb-3">التاريخ</th>
                        <th className="pb-3 pl-2 text-left">إجراء</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {requests.map((req) => (
                        <tr key={req.id} className="hover:bg-white/5 transition-colors">
                          <td className="py-3 pr-2 font-mono text-[#A78BFA]">#{req.id}</td>
                          <td className="py-3 font-semibold text-white">{req.fullName}</td>
                          <td className="py-3 text-[#94A3B8]">
                            {req.gender === 'male' ? 'خاطب' : 'مخطوبة'}
                          </td>
                          <td className="py-3 text-[#94A3B8]">
                            {req.age} سنة ({MARITAL_STATUS_LABELS[req.maritalStatus]})
                          </td>
                          <td className="py-3 text-[#94A3B8]">
                            {req.city} - {req.nationality}
                          </td>
                          <td className="py-3 font-mono text-[#94A3B8]" dir="ltr">
                            {req.phone}
                          </td>
                          <td className="py-3">
                            <StatusBadge status={req.status} />
                          </td>
                          <td className="py-3 text-[#64748B]">{formatDate(req.createdAt)}</td>
                          <td className="py-3 pl-2 text-left">
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => setSelectedRequest(req)}
                              className="text-xs h-7"
                            >
                              <Eye className="w-3.5 h-3.5 ml-1" />
                              فحص الطلب
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </div>
        )}

        {/* TAB 3: SUCCESS STORIES */}
        {activeTab === 'stories' && (
          <div className="space-y-6 pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold font-heading text-white">قصص التوفيق والمباركات</h3>
                <p className="text-xs text-[#94A3B8]">
                  اعرض قصص نجاح زواج مباركة تم تيسيرها عبر مكتبكم لبث الطمأنينة
                </p>
              </div>
              <Button variant="primary" size="sm" onClick={() => setStoryModalOpen(true)}>
                <Plus className="w-3.5 h-3.5 ml-1" />
                إضافة قصة نجاح
              </Button>
            </div>

            {successStories.length === 0 ? (
              <EmptyState
                icon={Sparkles}
                title="لا توجد قصص نجاح منشورة بعد"
                description="أضف مباركات وقصص توفيق أسرية شاركها العرسان لنشر الأمل مع صيانة الخصوصية."
                actionLabel="إضافة أول قصة نجاح"
                onAction={() => setStoryModalOpen(true)}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {successStories.map((story) => (
                  <Card key={story.id} className="p-4 flex flex-col justify-between border-white/5">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#22C55E]/15 text-[#22C55E]">
                          مباركة معتمدة
                        </span>
                        <span className="text-[10px] text-[#64748B]">
                          {formatDate(story.createdAt)}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold font-heading text-white mb-1">
                        {story.title}
                      </h4>
                      <p className="text-xs text-[#94A3B8] line-clamp-3 leading-relaxed">
                        {story.story}
                      </p>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: ARTICLES */}
        {activeTab === 'articles' && (
          <div className="space-y-6 pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold font-heading text-white">المقالات والتوعية الأسرية</h3>
                <p className="text-xs text-[#94A3B8]">
                  مقالات واستشارات للمقبلين على الزواج تظهر في موقع المكتب
                </p>
              </div>
              <Button variant="primary" size="sm" onClick={() => setArticleModalOpen(true)}>
                <Plus className="w-3.5 h-3.5 ml-1" />
                نشر مقال جديد
              </Button>
            </div>

            {articles.length === 0 ? (
              <EmptyState
                icon={BookOpen}
                title="لا توجد مقالات منشورة"
                description="انشر مقالات إرشادية حول أسس الاختيار الصحيح والحياة الأسرية المستقرة."
                actionLabel="نشر أول مقال"
                onAction={() => setArticleModalOpen(true)}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {articles.map((art) => (
                  <Card key={art.id} className="p-4 border-white/5 space-y-2">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#6C3CE1]/15 text-[#A78BFA]">
                      {art.category}
                    </span>
                    <h4 className="text-sm font-bold font-heading text-white">{art.title}</h4>
                    <p className="text-xs text-[#94A3B8] line-clamp-3 leading-relaxed">
                      {art.content}
                    </p>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 5: PACKAGES */}
        {activeTab === 'packages' && (
          <div className="space-y-6 pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold font-heading text-white">باقات وخدمات المكتب</h3>
                <p className="text-xs text-[#94A3B8]">
                  حدد باقات وساطة الزواج ورسومها المعروضة للمتقدمين
                </p>
              </div>
              <Button variant="primary" size="sm" onClick={() => setPackageModalOpen(true)}>
                <Plus className="w-3.5 h-3.5 ml-1" />
                إضافة باقة جديدة
              </Button>
            </div>

            {packages.length === 0 ? (
              <EmptyState
                icon={PackageCheck}
                title="لا توجد باقات محددة بعد"
                description="أضف باقات الخدمات مثل الباقة الفضية أو الذهبية أو VIP مع توضيح رسوم كل باقة."
                actionLabel="إضافة باقة الآن"
                onAction={() => setPackageModalOpen(true)}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {packages.map((pkg) => (
                  <Card key={pkg.id} className="p-5 border-white/5 space-y-3">
                    <h4 className="text-base font-bold font-heading text-white">{pkg.name}</h4>
                    <div className="text-xl font-black font-heading text-[#FBBF24]">
                      {formatCurrency(pkg.price, pkg.currency)}
                    </div>
                    {pkg.description && (
                      <p className="text-xs text-[#94A3B8]">{pkg.description}</p>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 6: FAQS */}
        {activeTab === 'faqs' && (
          <div className="space-y-6 pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold font-heading text-white">الأسئلة الشائعة</h3>
                <p className="text-xs text-[#94A3B8]">
                  إجابات سريعة تظهر على موقع المكتب للإجابة على استفسارات المتقدمين
                </p>
              </div>
              <Button variant="primary" size="sm" onClick={() => setFaqModalOpen(true)}>
                <Plus className="w-3.5 h-3.5 ml-1" />
                إضافة سؤال شائع
              </Button>
            </div>

            {faqs.length === 0 ? (
              <EmptyState
                icon={HelpCircle}
                title="لا توجد أسئلة شائعة"
                description="أضف الأسئلة الأكثر تكراراً حول سرية الاستمارة وإجراءات المطابقة الشرعية."
                actionLabel="إضافة سؤال"
                onAction={() => setFaqModalOpen(true)}
              />
            ) : (
              <div className="space-y-3">
                {faqs.map((f) => (
                  <Card key={f.id} className="p-4 border-white/5 space-y-1.5">
                    <h4 className="text-xs font-bold text-white">{f.question}</h4>
                    <p className="text-xs text-[#94A3B8] leading-relaxed">{f.answer}</p>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 7: SITE SETTINGS */}
        {activeTab === 'site_settings' && activeSite && (
          <div className="space-y-6 pt-6 max-w-3xl">
            <Card className="p-6 border-white/5 space-y-4">
              <h3 className="text-base font-bold font-heading text-white">تعديل بيانات وهوية الموقع</h3>

              <div>
                <Label>اسم المكتب الرسمي</Label>
                <Input id="site-name-input" defaultValue={activeSite.name} />
              </div>

              <div>
                <Label>الشعار اللفظي (Tagline)</Label>
                <Input id="site-tagline-input" defaultValue={activeSite.tagline || ''} />
              </div>

              <div>
                <Label>نبذة عن المكتب ورسالته</Label>
                <Textarea
                  id="site-about-input"
                  rows={4}
                  defaultValue={activeSite.officeAbout || ''}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label>رقم ترخيص وزارة العدل</Label>
                  <Input
                    id="site-license-input"
                    defaultValue={activeSite.officeLicenseNumber || ''}
                  />
                </div>
                <div>
                  <Label>سنوات خبرة المكتب</Label>
                  <Input
                    id="site-experience-input"
                    type="number"
                    defaultValue={activeSite.officeYearsOfExperience ?? 1}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label>هاتف المكتب المعتمد</Label>
                  <Input
                    id="site-phone-input"
                    defaultValue={activeSite.officePhone || ''}
                    dir="ltr"
                  />
                </div>
                <div>
                  <Label>رقم الواتساب</Label>
                  <Input
                    id="site-wa-input"
                    defaultValue={activeSite.whatsappNumber || ''}
                    dir="ltr"
                  />
                </div>
              </div>

              <div>
                <Label>نظام التصميم (القالب)</Label>
                <select
                  id="site-template-select"
                  defaultValue={activeSite.template || 'royal'}
                  className="w-full h-10 rounded-xl bg-[#151C32] border border-white/10 px-3 text-xs text-white"
                >
                  <option value="royal">الملكي النخبوي (Royal Gold)</option>
                  <option value="minimal">التبسيطي العصري (Modern Minimal)</option>
                  <option value="elegant">الأنيق المريح (Family Elegant)</option>
                  <option value="modern-arabic">المعاصر المؤسسي (Professional Arab)</option>
                  <option value="classic">الكلاسيكي الأصيل (Heritage Classic)</option>
                </select>
              </div>

              <div className="pt-2">
                <Button
                  variant="primary"
                  onClick={() => {
                    const name = (document.getElementById('site-name-input') as HTMLInputElement)
                      ?.value;
                    const tagline = (
                      document.getElementById('site-tagline-input') as HTMLInputElement
                    )?.value;
                    const officeAbout = (
                      document.getElementById('site-about-input') as HTMLTextAreaElement
                    )?.value;
                    const officeLicenseNumber = (
                      document.getElementById('site-license-input') as HTMLInputElement
                    )?.value;
                    const officeYearsOfExperience =
                      parseInt(
                        (document.getElementById('site-experience-input') as HTMLInputElement)
                          ?.value
                      ) || 0;
                    const officePhone = (
                      document.getElementById('site-phone-input') as HTMLInputElement
                    )?.value;
                    const whatsappNumber = (
                      document.getElementById('site-wa-input') as HTMLInputElement
                    )?.value;
                    const template = (
                      document.getElementById('site-template-select') as HTMLSelectElement
                    )?.value as any;

                    updateSiteMutation.mutate({
                      id: activeSite.id,
                      name,
                      tagline,
                      officeAbout,
                      officeLicenseNumber,
                      officeYearsOfExperience,
                      officePhone,
                      whatsappNumber,
                      template,
                    });
                  }}
                  isLoading={updateSiteMutation.isPending}
                >
                  حفظ التعديلات على الموقع
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* TAB 8: WALLET */}
        {activeTab === 'wallet' && (
          <div className="space-y-6 pt-6 max-w-4xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Card className="p-6 border-white/5">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-[#6C3CE1]/15 text-[#A78BFA] flex items-center justify-center">
                    <Wallet className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] text-[#22C55E] font-semibold bg-[#22C55E]/10 px-2 py-0.5 rounded-full border border-[#22C55E]/20">
                    نشط ومتاح
                  </span>
                </div>
                <span className="text-xs text-[#94A3B8]">الرصيد المتاح الفعلي في المحفظة</span>
                <div className="text-3xl font-black font-heading text-white mt-1">
                  {formatCurrency(
                    walletData?.wallet?.balance || 0,
                    walletData?.wallet?.currency || 'USD'
                  )}
                </div>
              </Card>

              <Card className="p-6 border-white/5">
                <h4 className="font-bold text-white text-sm mb-2">تقديم طلب شحن رصيد</h4>
                <p className="text-[11px] text-[#94A3B8] mb-3">
                  يتم تقديم طلب الشحن إلى الإدارة المالية ليخضع للمراجعة والاعتماد المالي الرسمي.
                </p>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    placeholder="المبلغ ($)"
                    dir="ltr"
                    className="text-xs"
                  />
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      const amt = parseFloat(depositAmount);
                      if (isNaN(amt) || amt <= 0) {
                        addToast({
                          title: 'مبلغ غير صالح',
                          description: 'يرجى إدخال مبلغ صحيح أكبر من صفر',
                          type: 'error',
                        });
                        return;
                      }
                      depositMutation.mutate({ amount: amt });
                    }}
                    isLoading={depositMutation.isPending}
                  >
                    تقديم الطلب
                  </Button>
                </div>
              </Card>
            </div>

            {/* Deposit Requests Section */}
            {walletData?.depositRequests && walletData.depositRequests.length > 0 && (
              <Card className="p-5 border-white/5">
                <h4 className="font-bold text-white text-sm mb-3">طلبات الشحن وحالتها المالية</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-right text-xs">
                    <thead>
                      <tr className="text-[#94A3B8] border-b border-white/5">
                        <th className="pb-3">رقم الطلب</th>
                        <th className="pb-3">المبلغ</th>
                        <th className="pb-3">وسيلة الدفع</th>
                        <th className="pb-3">الحالة</th>
                        <th className="pb-3">التاريخ</th>
                        <th className="pb-3 pl-3 text-left">إجراء</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {walletData.depositRequests.map((req: any) => (
                        <tr key={req.id} className="hover:bg-white/5">
                          <td className="py-2.5 text-[#CBD5E1] font-mono">#{req.id}</td>
                          <td className="py-2.5 font-bold text-white" dir="ltr">
                            {formatCurrency(req.amount, req.currency || 'USD')}
                          </td>
                          <td className="py-2.5 text-[#94A3B8]">
                            {req.paymentMethod === 'bank_transfer' ? 'تحويل بنكي' : req.paymentMethod}
                          </td>
                          <td className="py-2.5">
                            {req.status === 'pending' && (
                              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-[#F59E0B]/15 text-[#F59E0B] border border-[#F59E0B]/20">
                                قيد المراجعة
                              </span>
                            )}
                            {req.status === 'approved' && (
                              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/20">
                                معتمد ومودع
                              </span>
                            )}
                            {req.status === 'rejected' && (
                              <span
                                className="px-2 py-0.5 rounded text-[11px] font-semibold bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/20"
                                title={req.rejectReason || 'تم الرفض'}
                              >
                                مرفوض: {req.rejectReason || 'بيانات غير مطابقة'}
                              </span>
                            )}
                            {req.status === 'cancelled' && (
                              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-[#64748B]/15 text-[#94A3B8] border border-white/10">
                                ملغى من قبلك
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 text-[#64748B]">{formatDate(req.createdAt)}</td>
                          <td className="py-2.5 pl-3 text-left">
                            {req.status === 'pending' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => cancelDepositMutation.mutate({ id: req.id })}
                                isLoading={cancelDepositMutation.isPending}
                                className="text-[10px] h-6 px-2 text-[#EF4444] border-[#EF4444]/30 hover:bg-[#EF4444]/10"
                              >
                                إلغاء
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}

            {/* Transactions History */}
            <Card className="p-5 border-white/5">
              <h4 className="font-bold text-white text-sm mb-4">سجل العمليات المالية الفعلية (Ledger)</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead>
                    <tr className="text-[#94A3B8] border-b border-white/5">
                      <th className="pb-3">النوع</th>
                      <th className="pb-3">المبلغ</th>
                      <th className="pb-3">البيان</th>
                      <th className="pb-3">التاريخ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {walletData?.transactions && walletData.transactions.length > 0 ? (
                      walletData.transactions.map((tx: any) => (
                        <tr key={tx.id} className="hover:bg-white/5">
                          <td className="py-3">
                            <span
                              className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                                tx.type === 'deposit'
                                  ? 'bg-[#22C55E]/15 text-[#22C55E]'
                                  : tx.type === 'admin_credit'
                                  ? 'bg-[#3B82F6]/15 text-[#3B82F6]'
                                  : tx.type === 'admin_debit'
                                  ? 'bg-[#F59E0B]/15 text-[#F59E0B]'
                                  : tx.type === 'refund'
                                  ? 'bg-[#A855F7]/15 text-[#A855F7]'
                                  : 'bg-[#EF4444]/15 text-[#EF4444]'
                              }`}
                            >
                              {tx.type === 'deposit'
                                ? 'إيداع معتمد'
                                : tx.type === 'admin_credit'
                                ? 'إضافة إدارية'
                                : tx.type === 'admin_debit'
                                ? 'خصم إداري'
                                : tx.type === 'refund'
                                ? 'استرداد مالي'
                                : 'شراء ترخيص'}
                            </span>
                          </td>
                          <td className="py-3 font-semibold text-white" dir="ltr">
                            {formatCurrency(tx.amount, tx.currency)}
                          </td>
                          <td className="py-3 text-[#94A3B8]">{tx.description}</td>
                          <td className="py-3 text-[#64748B]">{formatDate(tx.createdAt)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-[#64748B]">
                          لا توجد حركات مالية مسجلة بعد
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* TAB 9: SETTINGS */}
        {activeTab === 'settings' && (
          <div className="space-y-6 pt-6 max-w-xl">
            <Card className="p-6 border-white/5 space-y-4">
              <h3 className="text-base font-bold font-heading text-white">بيانات الحساب الشخصي</h3>
              <div>
                <Label>اسم صاحب المكتب</Label>
                <Input defaultValue={user?.name || ''} readOnly className="opacity-80" />
              </div>
              <div>
                <Label>البريد الإلكتروني</Label>
                <Input defaultValue={user?.email || ''} readOnly className="opacity-80" dir="ltr" />
              </div>
              <div>
                <Label>دور الحساب في المنظومة</Label>
                <Input
                  defaultValue={user?.role === 'admin' ? 'مدير المنصة' : 'صاحب مكتب زواج معتمد'}
                  readOnly
                  className="opacity-80"
                />
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* MODAL: Request Details & Action */}
      {selectedRequest && (
        <Dialog
          isOpen={!!selectedRequest}
          onClose={() => setSelectedRequest(null)}
          title={`تفاصيل طلب الزواج #${selectedRequest.id} — ${selectedRequest.fullName}`}
          maxWidth="2xl"
        >
          <div className="space-y-4 pt-2 text-xs">
            {/* Status change bar */}
            <div className="p-3 rounded-xl bg-[#151C32] border border-white/5 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-[#94A3B8]">الحالة الحالية:</span>
                <StatusBadge status={selectedRequest.status} />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[#94A3B8]">تحديث الحالة:</span>
                <select
                  value={selectedRequest.status}
                  onChange={(e) => {
                    const nextStatus = e.target.value as any;
                    setSelectedRequest({ ...selectedRequest, status: nextStatus });
                    updateStatusMutation.mutate({
                      id: selectedRequest.id,
                      status: nextStatus,
                    });
                  }}
                  className="h-8 rounded-lg bg-[#0B1124] border border-white/10 text-xs px-2 text-white"
                >
                  <option value="new">جديد</option>
                  <option value="reviewed">تمت المراجعة</option>
                  <option value="contacted">تم التواصل</option>
                  <option value="matched">تم التوفيق والخطبة</option>
                  <option value="closed">مغلق</option>
                </select>
              </div>
            </div>

            {/* Personal Details */}
            <div className="p-4 rounded-xl bg-[#151C32] border border-white/5 grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div>
                <span className="text-[#64748B] block">الجنس:</span>
                <span className="font-semibold text-white">
                  {selectedRequest.gender === 'male' ? 'خاطب (رجل)' : 'مخطوبة (امرأة)'}
                </span>
              </div>
              <div>
                <span className="text-[#64748B] block">العمر والحالة:</span>
                <span className="font-semibold text-white">
                  {selectedRequest.age} سنة ({MARITAL_STATUS_LABELS[selectedRequest.maritalStatus]})
                </span>
              </div>
              <div>
                <span className="text-[#64748B] block">المدينة والجنسية:</span>
                <span className="font-semibold text-white">
                  {selectedRequest.city} - {selectedRequest.nationality}
                </span>
              </div>
              <div>
                <span className="text-[#64748B] block">الوظيفة والتعليم:</span>
                <span className="font-semibold text-white">
                  {selectedRequest.job || '—'} ({selectedRequest.education || '—'})
                </span>
              </div>
              <div>
                <span className="text-[#64748B] block">رقم الهاتف:</span>
                <a
                  href={`tel:${selectedRequest.phone}`}
                  className="font-semibold text-[#00D4FF] hover:underline"
                  dir="ltr"
                >
                  {selectedRequest.phone}
                </a>
              </div>
              <div>
                <span className="text-[#64748B] block">التواصل المفضل:</span>
                <span className="font-semibold text-white">
                  {PREFERRED_CONTACT_LABELS[selectedRequest.preferredContact]}
                </span>
              </div>
              {selectedRequest.guardianPhone && (
                <div>
                  <span className="text-[#64748B] block">هاتف ولي الأمر:</span>
                  <span className="font-semibold text-white font-mono" dir="ltr">
                    {selectedRequest.guardianPhone}
                  </span>
                </div>
              )}
            </div>

            {/* Requirements */}
            <div className="p-4 rounded-xl bg-[#151C32] border border-white/5">
              <span className="text-[#A78BFA] font-bold block mb-1">
                مواصفات الشريك المطلوبة من قِبل المتقدم:
              </span>
              <p className="text-[#CBD5E1] leading-relaxed bg-[#0B1124] p-3 rounded-lg max-h-32 overflow-y-auto">
                {selectedRequest.partnerRequirements}
              </p>
            </div>

            {/* WhatsApp Direct Action */}
            <div className="flex gap-2">
              <a
                href={`https://wa.me/${selectedRequest.phone.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#22C55E]/15 hover:bg-[#22C55E]/25 border border-[#22C55E]/30 text-[#22C55E] font-medium text-xs shadow-md transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                مراسلة المتقدم عبر الواتساب مباشرة
              </a>
            </div>

            {/* Internal Notes */}
            <div className="pt-2 border-t border-white/5">
              <span className="text-[#94A3B8] font-semibold block mb-2">
                ملاحظات سرية داخلية للمكتب (خاصة بالمستشار):
              </span>
              {selectedRequest.notes && (
                <p className="bg-[#0B1124] p-3 rounded-lg text-[#FBBF24] mb-3 leading-relaxed">
                  {selectedRequest.notes}
                </p>
              )}
              <div className="flex gap-2">
                <Input
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="أضف ملاحظة جديدة حول المقابلة، التوافق، أو شروط إضافية..."
                />
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    if (!newNote.trim()) return;
                    addNoteMutation.mutate({
                      id: selectedRequest.id,
                      notes: newNote,
                    });
                  }}
                  isLoading={addNoteMutation.isPending}
                >
                  حفظ الملاحظة
                </Button>
              </div>
            </div>
          </div>
        </Dialog>
      )}

      {/* MODAL: New Success Story */}
      <Dialog
        isOpen={storyModalOpen}
        onClose={() => setStoryModalOpen(false)}
        title="إضافة قصة نجاح مباركة"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!siteId) return;
            createStoryMutation.mutate({
              ...storyForm,
              siteId,
            });
          }}
          className="space-y-3 pt-2 text-xs"
        >
          <div>
            <Label required>عنوان القصة</Label>
            <Input
              value={storyForm.title}
              onChange={(e) => setStoryForm({ ...storyForm, title: e.target.value })}
              placeholder="مثال: توفيق وزواج مبارك في الرياض"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label>اسم الخاطب (أو الرمز)</Label>
              <Input
                value={storyForm.groomName}
                onChange={(e) => setStoryForm({ ...storyForm, groomName: e.target.value })}
                placeholder="أبو أحمد"
              />
            </div>
            <div>
              <Label>اسم المخطوبة (أو الرمز)</Label>
              <Input
                value={storyForm.brideName}
                onChange={(e) => setStoryForm({ ...storyForm, brideName: e.target.value })}
                placeholder="أم أحمد"
              />
            </div>
          </div>
          <div>
            <Label required>تفاصيل القصة والمباركة</Label>
            <Textarea
              rows={4}
              value={storyForm.story}
              onChange={(e) => setStoryForm({ ...storyForm, story: e.target.value })}
              placeholder="اكتب كيف تم التوافق وتيسير الله للأمر..."
              required
            />
          </div>
          <Button
            type="submit"
            variant="primary"
            className="w-full"
            isLoading={createStoryMutation.isPending}
          >
            نشر قصة النجاح
          </Button>
        </form>
      </Dialog>

      {/* MODAL: New Article */}
      <Dialog
        isOpen={articleModalOpen}
        onClose={() => setArticleModalOpen(false)}
        title="نشر مقال استشاري جديد"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!siteId) return;
            createArticleMutation.mutate({
              ...articleForm,
              siteId,
            });
          }}
          className="space-y-3 pt-2 text-xs"
        >
          <div>
            <Label required>عنوان المقال</Label>
            <Input
              value={articleForm.title}
              onChange={(e) => setArticleForm({ ...articleForm, title: e.target.value })}
              placeholder="مثال: معايير اختيار الشريك المناسب في عصرنا"
              required
            />
          </div>
          <div>
            <Label required>التصنيف</Label>
            <Input
              value={articleForm.category}
              onChange={(e) => setArticleForm({ ...articleForm, category: e.target.value })}
            />
          </div>
          <div>
            <Label required>نص المقال</Label>
            <Textarea
              rows={5}
              value={articleForm.content}
              onChange={(e) => setArticleForm({ ...articleForm, content: e.target.value })}
              placeholder="محتوى المقال..."
              required
            />
          </div>
          <Button
            type="submit"
            variant="primary"
            className="w-full"
            isLoading={createArticleMutation.isPending}
          >
            نشر المقال
          </Button>
        </form>
      </Dialog>

      {/* MODAL: New FAQ */}
      <Dialog
        isOpen={faqModalOpen}
        onClose={() => setFaqModalOpen(false)}
        title="إضافة سؤال شائع"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!siteId) return;
            createFaqMutation.mutate({
              ...faqForm,
              siteId,
            });
          }}
          className="space-y-3 pt-2 text-xs"
        >
          <div>
            <Label required>السؤال</Label>
            <Input
              value={faqForm.question}
              onChange={(e) => setFaqForm({ ...faqForm, question: e.target.value })}
              placeholder="مثال: كيف تضمنون سرية بيانات المتقدمين؟"
              required
            />
          </div>
          <div>
            <Label required>الإجابة الوافية</Label>
            <Textarea
              rows={4}
              value={faqForm.answer}
              onChange={(e) => setFaqForm({ ...faqForm, answer: e.target.value })}
              placeholder="الإجابة..."
              required
            />
          </div>
          <Button
            type="submit"
            variant="primary"
            className="w-full"
            isLoading={createFaqMutation.isPending}
          >
            حفظ السؤال
          </Button>
        </form>
      </Dialog>

      {/* MODAL: New Package */}
      <Dialog
        isOpen={packageModalOpen}
        onClose={() => setPackageModalOpen(false)}
        title="إضافة باقة خدمات جديدة"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!siteId) return;
            createPackageMutation.mutate({
              siteId,
              name: packageForm.name,
              description: packageForm.description,
              price: String(packageForm.price),
              features: packageForm.features.split('\n').filter(Boolean),
            });
          }}
          className="space-y-3 pt-2 text-xs"
        >
          <div>
            <Label required>اسم الباقة</Label>
            <Input
              value={packageForm.name}
              onChange={(e) => setPackageForm({ ...packageForm, name: e.target.value })}
              placeholder="مثال: الباقة الملكية VIP"
              required
            />
          </div>
          <div>
            <Label>الوصف المختصر</Label>
            <Input
              value={packageForm.description}
              onChange={(e) => setPackageForm({ ...packageForm, description: e.target.value })}
              placeholder="وصف الباقة"
            />
          </div>
          <div>
            <Label required>السعر (بالدولار الأمريكي أو ما يعادله)</Label>
            <Input
              type="number"
              value={packageForm.price}
              onChange={(e) =>
                setPackageForm({ ...packageForm, price: parseFloat(e.target.value) || 0 })
              }
              required
            />
          </div>
          <div>
            <Label required>المميزات (اكتب كل ميزة في سطر منفصل)</Label>
            <Textarea
              rows={4}
              value={packageForm.features}
              onChange={(e) => setPackageForm({ ...packageForm, features: e.target.value })}
              required
            />
          </div>
          <Button
            type="submit"
            variant="primary"
            className="w-full"
            isLoading={createPackageMutation.isPending}
          >
            إضافة الباقة
          </Button>
        </form>
      </Dialog>

      <Footer />
    </div>
  );
};

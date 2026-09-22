import React, { useState } from 'react';
import { trpc } from '../lib/trpc.ts';
import { useAuth } from '../hooks/useAuth.ts';
import { useToast } from '../contexts/ToastContext.tsx';
import { Navbar } from '../components/layout/Navbar.tsx';
import { Footer } from '../components/layout/Footer.tsx';
import { Button } from '../components/ui/Button.tsx';
import { Input } from '../components/ui/Input.tsx';
import { Label } from '../components/ui/Label.tsx';
import { Textarea } from '../components/ui/Textarea.tsx';
import { Card, Badge } from '../components/ui/Card.tsx';
import { Dialog } from '../components/ui/Dialog.tsx';
import { StatCard } from '../components/dashboard/StatCard.tsx';
import { EmptyState } from '../components/ui/EmptyState.tsx';
import {
  ShieldCheck,
  Building2,
  Users,
  CheckCircle2,
  XCircle,
  FileText,
  Lock,
  Database,
  Server,
  HardDrive,
  RefreshCw,
  Clock,
  Search,
  Wallet,
  ExternalLink,
  History,
  Award,
  MapPin,
  Ban,
  Check,
} from 'lucide-react';
import { formatDate, formatCurrency } from '../lib/utils.ts';

export const AdminPanel: React.FC = () => {
  const { user, isAdmin, isLoading } = useAuth();
  const utils = trpc.useUtils();
  const { addToast } = useToast();

  type TabType =
    | 'approvals'
    | 'sites'
    | 'portfolios'
    | 'requests'
    | 'users'
    | 'audit'
    | 'database';

  const [activeTab, setActiveTab] = useState<TabType>('approvals');

  // Search and filters
  const [siteSearch, setSiteSearch] = useState('');
  const [siteStatusFilter, setSiteStatusFilter] = useState('all');
  const [userSearch, setUserSearch] = useState('');
  const [requestFilter, setRequestFilter] = useState('all');

  // Modals state
  const [approvalModalSite, setApprovalModalSite] = useState<any | null>(null);
  const [approvalNotes, setApprovalNotes] = useState('');

  const [rejectionModalSite, setRejectionModalSite] = useState<any | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const [suspendModalSite, setSuspendModalSite] = useState<any | null>(null);
  const [suspendReason, setSuspendReason] = useState('');

  const [walletModalData, setWalletModalData] = useState<{
    userId: number;
    userName: string;
    bureauName: string;
    currentBalance: number;
  } | null>(null);
  const [walletAdjustType, setWalletAdjustType] = useState<'credit' | 'debit'>('credit');
  const [walletAdjustAmount, setWalletAdjustAmount] = useState('500');
  const [walletAdjustDesc, setWalletAdjustDesc] = useState('');

  // Queries
  const { data: stats } = trpc.admin.getPlatformStats.useQuery(undefined, {
    enabled: isAdmin,
  });

  const { data: pendingApprovals = [], refetch: refetchApprovals } =
    trpc.admin.listPendingApprovals.useQuery(undefined, {
      enabled: isAdmin,
    });

  const { data: allSites = [], refetch: refetchSites } =
    trpc.admin.listAllSites.useQuery(undefined, {
      enabled: isAdmin,
    });

  const { data: allUsers = [], refetch: refetchUsers } =
    trpc.admin.listAllUsers.useQuery(undefined, {
      enabled: isAdmin,
    });

  const { data: portfoliosData, refetch: refetchPortfolios } =
    trpc.admin.listPortfoliosAndWallets.useQuery(undefined, {
      enabled: isAdmin,
    });

  const { data: allRequests = [], refetch: refetchRequests } =
    trpc.admin.listAllRequests.useQuery(undefined, {
      enabled: isAdmin,
    });

  const { data: auditLogs = [], refetch: refetchAudit } =
    trpc.admin.listAuditLogs.useQuery(undefined, {
      enabled: isAdmin,
    });

  const { data: depositRequests = [], refetch: refetchDeposits } =
    trpc.admin.listDepositRequests.useQuery(undefined, {
      enabled: isAdmin,
    });

  const { data: dbOverview, refetch: refetchDB, isFetching: isFetchingDB } =
    trpc.system.databaseOverview.useQuery();

  const approveDepositMutation = trpc.admin.approveDeposit.useMutation({
    onSuccess: () => {
      refetchDeposits();
      refetchPortfolios();
      utils.admin.getPlatformStats.invalidate();
      addToast({
        title: 'تم اعتماد الإيداع بنجاح',
        description: 'تمت إضافة المبلغ إلى محفظة صاحب المكتب بنجاح.',
        type: 'success',
      });
    },
    onError: (err) => {
      addToast({
        title: 'فشل الاعتماد',
        description: err.message,
        type: 'error',
      });
    },
  });

  const rejectDepositMutation = trpc.admin.rejectDeposit.useMutation({
    onSuccess: () => {
      refetchDeposits();
      addToast({
        title: 'تم رفض طلب الإيداع',
        description: 'تم إلغاء عملية الإيداع.',
        type: 'info',
      });
    },
    onError: (err) => {
      addToast({
        title: 'فشل الرفض',
        description: err.message,
        type: 'error',
      });
    },
  });

  // Mutations
  const approveBureauMutation = trpc.admin.approveBureau.useMutation({
    onSuccess: () => {
      setApprovalModalSite(null);
      setApprovalNotes('');
      utils.admin.listPendingApprovals.invalidate();
      utils.admin.listAllSites.invalidate();
      utils.admin.getPlatformStats.invalidate();
      utils.admin.listAuditLogs.invalidate();
      addToast({
        title: 'تم اعتماد وترخيص المكتب',
        description: 'أصبح موقع المكتب نشطاً ومتاحاً للجمهور الآن.',
        type: 'success',
      });
    },
    onError: (err) => {
      addToast({
        title: 'تعذر الاعتماد',
        description: err.message || 'حدث خطأ أثناء اعتماد المكتب',
        type: 'error',
      });
    },
  });

  const rejectBureauMutation = trpc.admin.rejectBureau.useMutation({
    onSuccess: () => {
      setRejectionModalSite(null);
      setRejectionReason('');
      utils.admin.listPendingApprovals.invalidate();
      utils.admin.listAllSites.invalidate();
      utils.admin.listAuditLogs.invalidate();
      addToast({
        title: 'تم رفض طلب التدشين',
        description: 'تم تسجيل سبب الرفض وإشعار صاحب المكتب.',
        type: 'info',
      });
    },
  });

  const suspendBureauMutation = trpc.admin.suspendBureau.useMutation({
    onSuccess: () => {
      setSuspendModalSite(null);
      setSuspendReason('');
      utils.admin.listAllSites.invalidate();
      utils.admin.listAuditLogs.invalidate();
      addToast({
        title: 'تم تعليق موقع المكتب',
        description: 'تم إيقاف ظهور الموقع احترازياً للمراجعة.',
        type: 'warning',
      });
    },
  });

  const reactivateBureauMutation = trpc.admin.reactivateBureau.useMutation({
    onSuccess: () => {
      utils.admin.listAllSites.invalidate();
      utils.admin.listAuditLogs.invalidate();
      addToast({
        title: 'تمت إعادة تفعيل المكتب',
        description: 'الموقع عاد للعمل واستقبال الطلبات.',
        type: 'success',
      });
    },
  });

  const adjustWalletMutation = trpc.admin.adjustWalletBalance.useMutation({
    onSuccess: () => {
      setWalletModalData(null);
      setWalletAdjustAmount('500');
      setWalletAdjustDesc('');
      utils.admin.listPortfoliosAndWallets.invalidate();
      utils.admin.listAuditLogs.invalidate();
      addToast({
        title: 'تمت التسوية المالية',
        description: 'تم قيد الحركة المالية في محفظة المكتب بنجاح.',
        type: 'success',
      });
    },
    onError: (err) => {
      addToast({
        title: 'فشلت التسوية',
        description: err.message || 'تعذر تعديل الرصيد',
        type: 'error',
      });
    },
  });

  const updateUserRoleMutation = trpc.admin.updateUserRole.useMutation({
    onSuccess: () => {
      utils.admin.listAllUsers.invalidate();
      utils.admin.listAuditLogs.invalidate();
      addToast({
        title: 'تم تحديث الصلاحية',
        description: 'تم تعديل دور المستخدم في المنصة بنجاح.',
        type: 'success',
      });
    },
  });

  const updateRequestStatusMutation = trpc.admin.updateRequestStatus.useMutation({
    onSuccess: () => {
      utils.admin.listAllRequests.invalidate();
      utils.admin.listAuditLogs.invalidate();
      addToast({
        title: 'تم تحديث حالة الطلب',
        description: 'تم حفظ الحالة الإدارية للطلب.',
        type: 'success',
      });
    },
  });

  if (!isLoading && !isAdmin) {
    return (
      <div className="min-h-screen bg-[#0B1124] text-[#F8FAFC] flex flex-col antialiased">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-6 text-center">
          <Card className="max-w-md p-8 border-[#EF4444]/30 space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-[#EF4444]/15 border border-[#EF4444]/30 flex items-center justify-center mx-auto text-[#EF4444]">
              <Lock className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-bold font-heading text-white">
              صلاحية مدير المنصة مطلوبة
            </h2>
            <p className="text-xs text-[#94A3B8]">
              هذه الصفحة مخصصة لمدير منصة مدار للتحقق من التراخيص وتدقيق طلبات إنشاء المكاتب.
            </p>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  // Filtered Sites
  const filteredSites = allSites.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(siteSearch.toLowerCase()) ||
      s.subdomain.toLowerCase().includes(siteSearch.toLowerCase()) ||
      (s.ownerName && s.ownerName.toLowerCase().includes(siteSearch.toLowerCase())) ||
      (s.officeLicenseNumber && s.officeLicenseNumber.toLowerCase().includes(siteSearch.toLowerCase()));

    const matchesStatus =
      siteStatusFilter === 'all' ? true : s.status === siteStatusFilter;

    return matchesSearch && matchesStatus;
  });

  // Filtered Users
  const filteredUsers = allUsers.filter((u) => {
    return (
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
      (u.phone && u.phone.includes(userSearch))
    );
  });

  // Filtered Requests
  const filteredRequests = allRequests.filter((r) => {
    if (requestFilter === 'all') return true;
    return r.status === requestFilter;
  });

  return (
    <div className="min-h-screen bg-[#0B1124] text-[#F8FAFC] text-right flex flex-col antialiased">
      <Navbar />

      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#6C3CE1]/20 border border-[#6C3CE1]/40 flex items-center justify-center text-[#A78BFA] shadow-lg">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black font-heading text-white">
                  لوحة الإدارة العليا لمنصة مَـدَار
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-[#6C3CE1]/20 text-[#A78BFA] border border-[#6C3CE1]/30 text-xs font-semibold">
                  Super Admin Console
                </span>
              </div>
              <p className="text-xs text-[#94A3B8] mt-0.5">
                الرقابة الشاملة على اعتماد المكاتب، التراخيص الشرعية، وقواعد المحافظ المركزية
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                refetchApprovals();
                refetchSites();
                refetchPortfolios();
                refetchRequests();
                refetchUsers();
                refetchAudit();
                addToast({
                  title: 'تم تحديث البيانات',
                  description: 'تم جلب أحدث السجلات والطلبات من قاعدة البيانات.',
                  type: 'info',
                });
              }}
              className="text-xs"
            >
              <RefreshCw className="w-3.5 h-3.5 ml-1.5" />
              تحديث البيانات
            </Button>
          </div>
        </div>

        {/* Real Platform Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 py-6">
          <StatCard
            title="طلبات الاعتماد المعلقة"
            value={pendingApprovals.length}
            subtitle="مكاتب بانتظار موافقتك"
            icon={Clock}
            color={pendingApprovals.length > 0 ? 'rose' : 'emerald'}
          />
          <StatCard
            title="إجمالي مكاتب الزواج"
            value={stats?.totalSites || allSites.length}
            subtitle={`${allSites.filter((s) => s.status === 'active').length} مكتب مرخص ونشط`}
            icon={Building2}
            color="violet"
          />
          <StatCard
            title="قاعدة المستخدمين"
            value={stats?.totalUsers || allUsers.length}
            subtitle="حسابات حقيقية موثقة"
            icon={Users}
            color="cyan"
          />
          <StatCard
            title="رصيد المحافظ والسيولة"
            value={formatCurrency(portfoliosData?.metrics?.totalWalletBalances || 0, 'SAR')}
            subtitle={`إجمالي الحركات: ${portfoliosData?.recentTransactions?.length || 0}`}
            icon={Wallet}
            color="gold"
          />
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1.5 overflow-x-auto border-b border-white/5 pb-3 text-xs scrollbar-none">
          <button
            onClick={() => setActiveTab('approvals')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'approvals'
                ? 'bg-[#6C3CE1] text-white font-bold shadow-md shadow-[#6C3CE1]/20'
                : 'text-[#94A3B8] hover:text-white hover:bg-white/5'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>طلبات التدشين والاعتماد</span>
            {pendingApprovals.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-[#EF4444] text-white font-bold text-[10px] mr-1">
                {pendingApprovals.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('sites')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'sites'
                ? 'bg-[#6C3CE1] text-white font-bold shadow-md shadow-[#6C3CE1]/20'
                : 'text-[#94A3B8] hover:text-white hover:bg-white/5'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>إدارة كافة المكاتب ({allSites.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('portfolios')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'portfolios'
                ? 'bg-[#6C3CE1] text-white font-bold shadow-md shadow-[#6C3CE1]/20'
                : 'text-[#94A3B8] hover:text-white hover:bg-white/5'
            }`}
          >
            <Wallet className="w-3.5 h-3.5" />
            <span>محافظ المكاتب والمالية</span>
          </button>

          <button
            onClick={() => setActiveTab('requests')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'requests'
                ? 'bg-[#6C3CE1] text-white font-bold shadow-md shadow-[#6C3CE1]/20'
                : 'text-[#94A3B8] hover:text-white hover:bg-white/5'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>الرقابة على طلبات الزواج ({allRequests.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'users'
                ? 'bg-[#6C3CE1] text-white font-bold shadow-md shadow-[#6C3CE1]/20'
                : 'text-[#94A3B8] hover:text-white hover:bg-white/5'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>المستخدمين والصلاحيات ({allUsers.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'audit'
                ? 'bg-[#6C3CE1] text-white font-bold shadow-md shadow-[#6C3CE1]/20'
                : 'text-[#94A3B8] hover:text-white hover:bg-white/5'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>سجل الرقابة الإدارية ({auditLogs.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('database')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'database'
                ? 'bg-[#6C3CE1] text-white font-bold shadow-md shadow-[#6C3CE1]/20'
                : 'text-[#94A3B8] hover:text-white hover:bg-white/5'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>محرك قواعد البيانات</span>
          </button>
        </div>

        {/* TAB 1: PENDING APPROVALS GATEKEEPER */}
        {activeTab === 'approvals' && (
          <div className="space-y-6 mt-6">
            <div className="p-4 rounded-2xl bg-[#FBBF24]/10 border border-[#FBBF24]/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#FBBF24]/20 text-[#FBBF24] flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-[#FBBF24] text-sm font-heading">
                    نظام اشتراط الاعتماد الإداري لتدشين المواقع (Gatekeeper)
                  </h3>
                  <p className="text-xs text-[#94A3B8]">
                    لا يمكن لأي صاحب مكتب إطلاق موقعه للجمهور دون موافقتك الصريحة والتحقق من ترخيص وزارة العدل والسجل المعتمد.
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#FBBF24]/20 text-[#FBBF24] border border-[#FBBF24]/40">
                {pendingApprovals.length} طلبات قيد التدقيق
              </span>
            </div>

            {pendingApprovals.length === 0 ? (
              <EmptyState
                icon={CheckCircle2}
                title="لا توجد طلبات تدشين معلقة حالياً"
                description="تمت مراجعة واتخاذ القرار في جميع طلبات إنشاء مواقع مكاتب الزواج المقدمة. ستظهر هنا الطلبات الجديدة فور تدشينها."
              />
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {pendingApprovals.map((site) => (
                  <Card
                    key={site.id}
                    className="p-6 border-[#FBBF24]/40 relative overflow-hidden"
                  >
                    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                      <div className="space-y-4 flex-1">
                        <div className="flex flex-wrap items-center gap-2.5">
                          <span className="px-2.5 py-1 rounded-lg bg-[#FBBF24]/20 text-[#FBBF24] border border-[#FBBF24]/30 text-xs font-bold flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" />
                            طلب بانتظار الاعتماد
                          </span>
                          <h3 className="text-lg font-bold text-white font-heading">
                            {site.name}
                          </h3>
                          <span
                            className="text-xs text-[#00D4FF] font-mono bg-[#0B1124] px-2.5 py-0.5 rounded border border-white/10"
                            dir="ltr"
                          >
                            https://{site.subdomain}.madar.sa
                          </span>
                        </div>

                        {/* Owner Details */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-[#0B1124] border border-white/5 text-xs">
                          <div>
                            <span className="text-[#64748B] block text-[11px] mb-0.5">
                              صاحب المكتب:
                            </span>
                            <span className="font-bold text-white">
                              {site.ownerName || 'غير مدون'}
                            </span>
                          </div>
                          <div>
                            <span className="text-[#64748B] block text-[11px] mb-0.5">
                              البريد الإلكتروني:
                            </span>
                            <span className="text-white font-mono" dir="ltr">
                              {site.ownerEmail || '—'}
                            </span>
                          </div>
                          <div>
                            <span className="text-[#64748B] block text-[11px] mb-0.5">
                              الهاتف والواتساب:
                            </span>
                            <span className="text-white font-mono" dir="ltr">
                              {site.ownerPhone || site.officePhone || '—'}
                            </span>
                          </div>
                        </div>

                        {/* Licensing Details */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                          <div className="flex items-center gap-2 text-[#CBD5E1]">
                            <Award className="w-4 h-4 text-[#FBBF24]" />
                            <span>رقم الترخيص:</span>
                            <span className="font-bold text-[#22C55E] font-mono">
                              {site.officeLicenseNumber || 'قيد المراجعة'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-[#CBD5E1]">
                            <MapPin className="w-4 h-4 text-[#64748B]" />
                            <span>المقر:</span>
                            <span>{site.officeAddress || 'الرياض'}</span>
                          </div>
                          <div className="flex items-center gap-2 text-[#CBD5E1]">
                            <Clock className="w-4 h-4 text-[#64748B]" />
                            <span>تاريخ التقديم:</span>
                            <span>{formatDate(site.createdAt)}</span>
                          </div>
                        </div>

                        {site.officeAbout && (
                          <p className="text-xs text-[#94A3B8] line-clamp-2 leading-relaxed bg-[#0B1124] p-2.5 rounded-lg border border-white/5">
                            <strong className="text-white">نبذة المكتب: </strong>
                            {site.officeAbout}
                          </p>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 w-full lg:w-48 flex-shrink-0">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => {
                            setApprovalModalSite(site);
                            setApprovalNotes(
                              `تم التحقق والمطابقة النظامية وترخيص المكتب رسمياً برقم إداري #${site.id}`
                            );
                          }}
                          className="w-full justify-center text-xs font-bold py-2.5 bg-[#22C55E] hover:bg-[#16a34a] text-white"
                        >
                          <CheckCircle2 className="w-4 h-4 ml-1.5" />
                          اعتماد وترخيص الموقع
                        </Button>

                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => {
                            setRejectionModalSite(site);
                            setRejectionReason('عدم استيفاء بيانات الترخيص الرسمي أو اشتراطات المنصة');
                          }}
                          className="w-full justify-center text-xs py-2"
                        >
                          <XCircle className="w-4 h-4 ml-1.5" />
                          رفض الطلب
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(`/site/${site.subdomain}`, '_blank')}
                          className="w-full justify-center text-xs"
                        >
                          <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
                          معاينة الموقع
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: ALL BUREAUS MANAGEMENT */}
        {activeTab === 'sites' && (
          <Card className="p-6 mt-6 space-y-6 border-white/5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
              <div>
                <h3 className="font-bold text-white text-base font-heading">
                  إدارة كافة مكاتب الزواج والوساطة
                </h3>
                <p className="text-xs text-[#94A3B8]">
                  عرض وتعديل حالات مكاتب الزواج المرخصة، المعلقة، أو قيد المراجعة
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-64">
                  <Search className="w-4 h-4 text-[#94A3B8] absolute right-3 top-2.5" />
                  <Input
                    value={siteSearch}
                    onChange={(e) => setSiteSearch(e.target.value)}
                    placeholder="بحث بالاسم أو الرابط أو المالك..."
                    className="pr-9 text-xs h-9"
                  />
                </div>

                <select
                  value={siteStatusFilter}
                  onChange={(e) => setSiteStatusFilter(e.target.value)}
                  className="bg-[#151C32] border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                >
                  <option value="all">كافة الحالات</option>
                  <option value="active">معتمد ونشط (Active)</option>
                  <option value="pending">قيد التدقيق (Pending)</option>
                  <option value="suspended">معلق إدارياً (Suspended)</option>
                  <option value="rejected">مرفوض (Rejected)</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="text-[#94A3B8] border-b border-white/5">
                    <th className="py-3 pr-3">اسم المكتب</th>
                    <th className="py-3">الرابط الفرعي</th>
                    <th className="py-3">صاحب المكتب</th>
                    <th className="py-3">رقم الترخيص</th>
                    <th className="py-3">الحالة</th>
                    <th className="py-3">تاريخ الإنشاء</th>
                    <th className="py-3 pl-3 text-left">إجراءات الإدارة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredSites.map((site) => (
                    <tr key={site.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-3 pr-3 font-semibold text-white">{site.name}</td>
                      <td className="py-3 font-mono text-[#00D4FF]" dir="ltr">
                        {site.subdomain}.madar.sa
                      </td>
                      <td className="py-3 text-[#CBD5E1]">{site.ownerName || '—'}</td>
                      <td className="py-3 font-mono text-[#FBBF24]">
                        {site.officeLicenseNumber || '—'}
                      </td>
                      <td className="py-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            site.status === 'active'
                              ? 'bg-[#22C55E]/15 text-[#22C55E]'
                              : site.status === 'pending'
                              ? 'bg-[#FBBF24]/15 text-[#FBBF24]'
                              : 'bg-[#EF4444]/15 text-[#EF4444]'
                          }`}
                        >
                          {site.status === 'active'
                            ? 'نشط ومعتمد'
                            : site.status === 'pending'
                            ? 'قيد التدقيق'
                            : 'معلق أو مرفوض'}
                        </span>
                      </td>
                      <td className="py-3 text-[#64748B]">{formatDate(site.createdAt)}</td>
                      <td className="py-3 pl-3 text-left">
                        <div className="flex items-center justify-end gap-1.5">
                          {site.status === 'suspended' ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => reactivateBureauMutation.mutate({ id: site.id })}
                              className="text-xs h-7 text-[#22C55E] border-[#22C55E]/30"
                            >
                              <Check className="w-3 h-3 ml-1" />
                              إعادة التفعيل
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSuspendModalSite(site)}
                              className="text-xs h-7 text-[#EF4444] border-[#EF4444]/30"
                            >
                              <Ban className="w-3 h-3 ml-1" />
                              تعليق الموقع
                            </Button>
                          )}
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => window.open(`/site/${site.subdomain}`, '_blank')}
                            className="text-xs h-7"
                          >
                            <ExternalLink className="w-3 h-3 ml-1" />
                            زيارة
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* TAB 3: PORTFOLIOS & WALLETS */}
        {activeTab === 'portfolios' && (
          <div className="space-y-6 mt-6">
            {/* Pending Deposit Approvals */}
            {depositRequests.length > 0 && (
              <Card className="p-6 border-[#FBBF24]/30 bg-[#FBBF24]/5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-[#FBBF24]" />
                    <h3 className="font-bold text-white text-base font-heading">
                      طلبات إيداع الرصيد المعلقة ({depositRequests.length})
                    </h3>
                  </div>
                  <span className="text-xs text-[#FBBF24]">تتطلب تدقيق ومطابقة الحوالة البنكية</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-right text-xs">
                    <thead>
                      <tr className="text-[#94A3B8] border-b border-white/5">
                        <th className="py-2.5 pr-3">المكتب والمالك</th>
                        <th className="py-2.5">المبلغ المطلوب</th>
                        <th className="py-2.5">وسيلة الدفع</th>
                        <th className="py-2.5">التاريخ</th>
                        <th className="py-2.5 pl-3 text-left">الإجراء</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {depositRequests.map((req: any) => (
                        <tr key={req.id} className="hover:bg-white/5">
                          <td className="py-2.5 pr-3">
                            <span className="font-bold text-white block">{req.bureauName}</span>
                            <span className="text-[10px] text-[#94A3B8]">{req.userName}</span>
                          </td>
                          <td className="py-2.5 font-bold text-[#22C55E] font-mono text-sm">
                            {formatCurrency(req.amount, req.currency || 'USD')}
                          </td>
                          <td className="py-2.5 text-[#CBD5E1]">
                            {req.method === 'bank_transfer' ? 'تحويل بنكي' : req.method}
                          </td>
                          <td className="py-2.5 text-[#64748B]">{formatDate(req.createdAt)}</td>
                          <td className="py-2.5 pl-3 text-left">
                            {req.status === 'pending' ? (
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  variant="primary"
                                  size="sm"
                                  onClick={() => approveDepositMutation.mutate({ id: req.id })}
                                  isLoading={approveDepositMutation.isPending}
                                  className="text-xs h-7 px-2.5 bg-[#22C55E] hover:bg-[#16A34A]"
                                >
                                  اعتماد الإيداع
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    const reason = prompt('سبب رفض طلب الإيداع:');
                                    if (reason && reason.trim().length > 0) {
                                      rejectDepositMutation.mutate({ id: req.id, reason: reason.trim() });
                                    }
                                  }}
                                  isLoading={rejectDepositMutation.isPending}
                                  className="text-xs h-7 px-2.5 text-[#EF4444] border-[#EF4444]/30 hover:bg-[#EF4444]/10"
                                >
                                  رفض
                                </Button>
                              </div>
                            ) : req.status === 'approved' ? (
                              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/20">
                                معتمد ومودع
                              </span>
                            ) : req.status === 'rejected' ? (
                              <span
                                className="px-2 py-0.5 rounded text-[11px] font-semibold bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/20"
                                title={req.rejectReason || 'مرفوض'}
                              >
                                مرفوض: {req.rejectReason || 'غير مطابق'}
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-[#64748B]/15 text-[#94A3B8] border border-white/10">
                                ملغى من العميل
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}

            <Card className="p-6 border-white/5 space-y-4">
              <h3 className="font-bold text-white text-base font-heading">
                قواعد محافظ المكاتب والسيولة المالية
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead>
                    <tr className="text-[#94A3B8] border-b border-white/5">
                      <th className="py-3 pr-3">المكتب والمالك</th>
                      <th className="py-3">الرصيد الفعلي</th>
                      <th className="py-3">إجمالي الطلبات</th>
                      <th className="py-3">الزيجات المنجزة</th>
                      <th className="py-3">الحالة</th>
                      <th className="py-3 pl-3 text-left">تسوية الرصيد</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {portfoliosData?.bureauPortfolios?.map((p: any) => (
                      <tr key={p.siteId} className="hover:bg-white/5">
                        <td className="py-3 pr-3">
                          <span className="font-bold text-white block">{p.siteName}</span>
                          <span className="text-[10px] text-[#94A3B8]">
                            صاحب المكتب: {p.ownerName}
                          </span>
                        </td>
                        <td className="py-3 font-bold text-[#22C55E] font-mono text-sm">
                          {formatCurrency(p.walletBalance || 0, 'SAR')}
                        </td>
                        <td className="py-3 font-semibold text-[#CBD5E1]">
                          {p.totalMarriageRequests} طلب
                        </td>
                        <td className="py-3 text-[#22C55E] font-semibold">
                          {p.completedMarriages} زيجة
                        </td>
                        <td className="py-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              p.status === 'active'
                                ? 'bg-[#22C55E]/15 text-[#22C55E]'
                                : 'bg-[#FBBF24]/15 text-[#FBBF24]'
                            }`}
                          >
                            {p.status === 'active' ? 'نشط' : 'معلق'}
                          </span>
                        </td>
                        <td className="py-3 pl-3 text-left">
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => {
                              setWalletModalData({
                                userId: p.ownerUserId,
                                userName: p.ownerName,
                                bureauName: p.siteName,
                                currentBalance: p.walletBalance,
                              });
                            }}
                            className="text-xs h-7 px-3"
                          >
                            <Wallet className="w-3 h-3 ml-1" />
                            تعديل الرصيد
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* TAB 4: MARRIAGE REQUESTS REGISTRY */}
        {activeTab === 'requests' && (
          <Card className="p-6 mt-6 space-y-4 border-white/5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
              <div>
                <h3 className="font-bold text-white text-base font-heading">
                  الرقابة المركزية على كافة طلبات الزواج
                </h3>
                <p className="text-xs text-[#94A3B8]">
                  استعراض جميع الطلبات الواردة لجميع مكاتب المنصة مع تدقيق حالاتها وسريتها
                </p>
              </div>

              <select
                value={requestFilter}
                onChange={(e) => setRequestFilter(e.target.value)}
                className="bg-[#151C32] border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
              >
                <option value="all">كافة الطلبات ({allRequests.length})</option>
                <option value="new">طلبات جديدة</option>
                <option value="reviewed">تمت المراجعة</option>
                <option value="contacted">تم التواصل</option>
                <option value="matched">تم التوفيق والزواج</option>
                <option value="rejected">ملغي أو مرفوض</option>
              </select>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="text-[#94A3B8] border-b border-white/5">
                    <th className="py-3 pr-3">صاحب الطلب</th>
                    <th className="py-3">المكتب التابع له</th>
                    <th className="py-3">النوع / العمر</th>
                    <th className="py-3">المدينة والجنسية</th>
                    <th className="py-3">رقم الهاتف</th>
                    <th className="py-3">الحالة</th>
                    <th className="py-3">التاريخ</th>
                    <th className="py-3 pl-3 text-left">تعديل الحالة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredRequests.map((r: any) => (
                    <tr key={r.id} className="hover:bg-white/5">
                      <td className="py-3 pr-3 font-semibold text-white">{r.fullName}</td>
                      <td className="py-3 text-[#A78BFA] font-medium">{r.siteName || `مكتب #${r.siteId}`}</td>
                      <td className="py-3 text-[#94A3B8]">
                        {r.gender === 'male' ? 'خاطب' : 'مخطوبة'} ({r.age} سنة)
                      </td>
                      <td className="py-3 text-[#94A3B8]">
                        {r.city} - {r.nationality}
                      </td>
                      <td className="py-3 font-mono text-[#00D4FF]" dir="ltr">
                        {r.phone}
                      </td>
                      <td className="py-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#6C3CE1]/15 text-[#A78BFA]">
                          {r.status}
                        </span>
                      </td>
                      <td className="py-3 text-[#64748B]">{formatDate(r.createdAt)}</td>
                      <td className="py-3 pl-3 text-left">
                        <select
                          value={r.status}
                          onChange={(e) =>
                            updateRequestStatusMutation.mutate({
                              id: r.id,
                              status: e.target.value,
                            })
                          }
                          className="bg-[#151C32] border border-white/10 rounded-lg px-2 py-1 text-[11px] text-white"
                        >
                          <option value="new">جديد</option>
                          <option value="reviewed">تمت المراجعة</option>
                          <option value="contacted">تم التواصل</option>
                          <option value="matched">تم التوفيق</option>
                          <option value="rejected">ملغي</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* TAB 5: USERS & ROLES */}
        {activeTab === 'users' && (
          <Card className="p-6 mt-6 space-y-4 border-white/5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
              <div>
                <h3 className="font-bold text-white text-base font-heading">
                  قاعدة بيانات المستخدمين وإدارة الصلاحيات
                </h3>
                <p className="text-xs text-[#94A3B8]">
                  الحسابات الحقيقية المسجلة وتحديد أدوار المشرفين وأصحاب المكاتب
                </p>
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-[#94A3B8] absolute right-3 top-2.5" />
                <Input
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="بحث بالاسم أو البريد..."
                  className="pr-9 text-xs h-9"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="text-[#94A3B8] border-b border-white/5">
                    <th className="py-3 pr-3">المعرف والاسم</th>
                    <th className="py-3">البريد الإلكتروني</th>
                    <th className="py-3">رقم الهاتف</th>
                    <th className="py-3">الدور والصلاحية</th>
                    <th className="py-3">تاريخ التسجيل</th>
                    <th className="py-3 pl-3 text-left">تعديل الدور</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-white/5">
                      <td className="py-3 pr-3">
                        <span className="font-bold text-white block">{u.name}</span>
                        <span className="text-[10px] text-[#64748B] font-mono">#{u.id}</span>
                      </td>
                      <td className="py-3 text-[#CBD5E1] font-mono" dir="ltr">
                        {u.email}
                      </td>
                      <td className="py-3 text-[#CBD5E1] font-mono" dir="ltr">
                        {u.phone || '—'}
                      </td>
                      <td className="py-3">
                        <span
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold inline-flex items-center gap-1 ${
                            u.role === 'admin'
                              ? 'bg-[#6C3CE1]/20 text-[#A78BFA] border border-[#6C3CE1]/40'
                              : u.role === 'owner'
                              ? 'bg-[#FBBF24]/15 text-[#FBBF24] border border-[#FBBF24]/30'
                              : 'bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/30'
                          }`}
                        >
                          {u.role === 'admin'
                            ? 'مدير المنصة'
                            : u.role === 'owner'
                            ? 'صاحب مكتب زواج'
                            : 'طالب زواج'}
                        </span>
                      </td>
                      <td className="py-3 text-[#64748B]">{formatDate(u.createdAt)}</td>
                      <td className="py-3 pl-3 text-left">
                        <select
                          value={u.role}
                          onChange={(e) =>
                            updateUserRoleMutation.mutate({
                              userId: u.id,
                              role: e.target.value as any,
                            })
                          }
                          className="bg-[#151C32] border border-white/10 rounded-lg px-2 py-1 text-[11px] text-white"
                        >
                          <option value="owner">صاحب مكتب (Owner)</option>
                          <option value="user">مستفيد (User)</option>
                          <option value="admin">مدير منصة (Admin)</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* TAB 6: AUDIT TRAIL LOGS */}
        {activeTab === 'audit' && (
          <Card className="p-6 mt-6 space-y-4 border-white/5">
            <div className="flex items-center justify-between pb-4 border-b border-white/5">
              <div>
                <h3 className="font-bold text-white text-base font-heading flex items-center gap-2">
                  <History className="w-4 h-4 text-[#A78BFA]" />
                  سجل التدقيق والرقابة الإدارية الموثق (Audit Trail)
                </h3>
                <p className="text-xs text-[#94A3B8]">
                  سجل زمني غير قابل للتعديل يوثق قرارات الاعتماد، الرفض، التعليق، وتعديل الأرصدة
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="text-[#94A3B8] border-b border-white/5">
                    <th className="py-3 pr-3">المعرف</th>
                    <th className="py-3">النوع / الحدث</th>
                    <th className="py-3">تفاصيل الإجراء</th>
                    <th className="py-3">المنفذ</th>
                    <th className="py-3 pl-3 text-left">التاريخ والوقت</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {auditLogs.map((log: any) => (
                    <tr key={log.id} className="hover:bg-white/5">
                      <td className="py-3 pr-3 font-mono text-[11px] text-[#64748B]">
                        #{log.id}
                      </td>
                      <td className="py-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                            log.action.includes('approve')
                              ? 'bg-[#22C55E]/20 text-[#22C55E]'
                              : log.action.includes('reject') || log.action.includes('suspend')
                              ? 'bg-[#EF4444]/20 text-[#EF4444]'
                              : 'bg-[#6C3CE1]/20 text-[#A78BFA]'
                          }`}
                        >
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3 text-[#CBD5E1]">
                        {log.details ? (
                          <pre className="text-[11px] font-mono text-[#CBD5E1] whitespace-pre-wrap">
                            {typeof log.details === 'string'
                              ? log.details
                              : JSON.stringify(log.details, null, 2)}
                          </pre>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="py-3 text-[#94A3B8] font-mono text-[11px]">
                        مستخدم #{log.userId || 'نظام'}
                      </td>
                      <td className="py-3 pl-3 text-left text-[#64748B] font-mono text-[11px]">
                        {formatDate(log.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* TAB 7: DATABASE ENGINE OVERVIEW */}
        {activeTab === 'database' && (
          <div className="space-y-6 mt-6">
            <Card className="p-6 border-white/5 space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#6C3CE1]/20 border border-[#6C3CE1]/40 flex items-center justify-center text-[#A78BFA]">
                    <Database className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base font-heading">
                      حالة محرك قاعدة البيانات (Database Architecture & Engine)
                    </h3>
                    <p className="text-xs text-[#94A3B8]">
                      محرك التخزين الفعلي الموثوق مع الحفظ الآلي المستمر
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => refetchDB()}
                  disabled={isFetchingDB}
                  className="text-xs flex items-center gap-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isFetchingDB ? 'animate-spin' : ''}`} />
                  <span>تحديث حالة التخزين</span>
                </Button>
              </div>

              {/* Engine Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
                <div className="p-4 rounded-xl bg-[#0B1124] border border-white/5 space-y-1">
                  <span className="text-[11px] text-[#94A3B8] flex items-center gap-1.5">
                    <Server className="w-3.5 h-3.5 text-[#22C55E]" />
                    نوع المحرك (Engine)
                  </span>
                  <div className="font-bold text-xs text-white font-mono">
                    {dbOverview?.engine || 'MADAR Persistent Storage Engine'}
                  </div>
                  <div className="text-[10px] text-[#22C55E] font-semibold">
                    متصل ونشط (State: Active)
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#0B1124] border border-white/5 space-y-1">
                  <span className="text-[11px] text-[#94A3B8] flex items-center gap-1.5">
                    <HardDrive className="w-3.5 h-3.5 text-[#00D4FF]" />
                    ملف الحفظ الفعلي الدائم (Persistent Storage)
                  </span>
                  <div className="font-bold text-xs text-[#00D4FF] font-mono" dir="ltr">
                    {dbOverview?.persistedFile || 'data/madar-db.json'}
                  </div>
                  <div className="text-[10px] text-[#64748B]">
                    حفظ متزامن عند كل كتابة (Synchronous Flush)
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#0B1124] border border-white/5 space-y-1">
                  <span className="text-[11px] text-[#94A3B8] flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#A78BFA]" />
                    آخر توقيت فحص
                  </span>
                  <div className="font-bold text-xs text-white font-mono" dir="ltr">
                    {dbOverview?.timestamp ? formatDate(dbOverview.timestamp) : 'الآن'}
                  </div>
                  <div className="text-[10px] text-[#64748B]">
                    حماية البيانات متوافقة مع معايير الأمان
                  </div>
                </div>
              </div>

              {/* Table Records Count */}
              <div className="pt-6">
                <h4 className="font-bold text-xs text-white mb-3 flex items-center gap-1.5 font-heading">
                  <span className="w-2 h-2 rounded-full bg-[#22C55E]" />
                  عدد السجلات المخزنة في جداول قاعدة البيانات:
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  {dbOverview?.tables &&
                    Object.entries(dbOverview.tables).map(([tbl, cnt]: any) => (
                      <div
                        key={tbl}
                        className="p-3 rounded-xl bg-[#0B1124] border border-white/5 flex items-center justify-between"
                      >
                        <span className="text-[#94A3B8] font-mono text-[11px]">{tbl}</span>
                        <span className="font-bold text-[#FBBF24] font-mono text-sm">{cnt}</span>
                      </div>
                    ))}
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* MODAL: APPROVE BUREAU */}
        {approvalModalSite && (
          <Dialog
            isOpen={!!approvalModalSite}
            onClose={() => setApprovalModalSite(null)}
            title="اعتماد وترخيص موقع مكتب الزواج رسمياً"
            maxWidth="md"
          >
            <div className="space-y-4 text-xs">
              <div className="p-3.5 rounded-xl bg-[#22C55E]/10 border border-[#22C55E]/30 text-[#22C55E]">
                أنت على وشك إصدار قرار الاعتماد الرسمي وتفعيل موقع:
                <strong className="block text-white text-sm mt-1 font-heading">
                  {approvalModalSite.name} ({approvalModalSite.subdomain}.madar.sa)
                </strong>
                صاحب المكتب: {approvalModalSite.ownerName} ({approvalModalSite.ownerEmail})
              </div>

              <div>
                <Label>ملاحظات الاعتماد والقرار الإداري (اختياري)</Label>
                <Textarea
                  rows={3}
                  value={approvalNotes}
                  onChange={(e) => setApprovalNotes(e.target.value)}
                  placeholder="تمت المراجعة والتأكد من سريان الترخيص والاعتماد..."
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/5">
                <Button variant="secondary" onClick={() => setApprovalModalSite(null)}>
                  إلغاء
                </Button>
                <Button
                  variant="primary"
                  onClick={() =>
                    approveBureauMutation.mutate({
                      id: approvalModalSite.id,
                      notes: approvalNotes,
                    })
                  }
                  isLoading={approveBureauMutation.isPending}
                  className="bg-[#22C55E] hover:bg-[#16a34a] text-white"
                >
                  <CheckCircle2 className="w-4 h-4 ml-1.5" />
                  تأكيد الاعتماد ونشر الموقع
                </Button>
              </div>
            </div>
          </Dialog>
        )}

        {/* MODAL: REJECT BUREAU */}
        {rejectionModalSite && (
          <Dialog
            isOpen={!!rejectionModalSite}
            onClose={() => setRejectionModalSite(null)}
            title="رفض طلب تدشين موقع المكتب"
            maxWidth="md"
          >
            <div className="space-y-4 text-xs">
              <div className="p-3.5 rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/30 text-[#EF4444]">
                سيتم رفض طلب تدشين:
                <strong className="block text-white text-sm mt-1">
                  {rejectionModalSite.name} ({rejectionModalSite.subdomain}.madar.sa)
                </strong>
              </div>

              <div>
                <Label required>سبب الرفض الموجه لصاحب المكتب</Label>
                <Textarea
                  rows={3}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="سبب الرفض النظامي..."
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/5">
                <Button variant="secondary" onClick={() => setRejectionModalSite(null)}>
                  إلغاء
                </Button>
                <Button
                  variant="danger"
                  onClick={() =>
                    rejectBureauMutation.mutate({
                      id: rejectionModalSite.id,
                      reason: rejectionReason,
                    })
                  }
                  isLoading={rejectBureauMutation.isPending}
                >
                  <XCircle className="w-4 h-4 ml-1.5" />
                  تأكيد رفض الطلب
                </Button>
              </div>
            </div>
          </Dialog>
        )}

        {/* MODAL: SUSPEND BUREAU */}
        {suspendModalSite && (
          <Dialog
            isOpen={!!suspendModalSite}
            onClose={() => setSuspendModalSite(null)}
            title="تعليق موقع مكتب الزواج مؤقتاً"
            maxWidth="md"
          >
            <div className="space-y-4 text-xs">
              <p className="text-[#CBD5E1]">
                سيتم إيقاف ظهور موقع <strong>{suspendModalSite.name}</strong> فوراً وتحويل الزوار لرسالة التوقيف الاحترازي.
              </p>

              <div>
                <Label>سبب التعليق الإداري</Label>
                <Input
                  value={suspendReason}
                  onChange={(e) => setSuspendReason(e.target.value)}
                  placeholder="مثال: مراجعة ترخيص سنوي..."
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/5">
                <Button variant="secondary" onClick={() => setSuspendModalSite(null)}>
                  إلغاء
                </Button>
                <Button
                  variant="danger"
                  onClick={() =>
                    suspendBureauMutation.mutate({
                      id: suspendModalSite.id,
                      reason: suspendReason,
                    })
                  }
                  isLoading={suspendBureauMutation.isPending}
                >
                  تأكيد التعليق
                </Button>
              </div>
            </div>
          </Dialog>
        )}

        {/* MODAL: ADJUST WALLET BALANCE */}
        {walletModalData && (
          <Dialog
            isOpen={!!walletModalData}
            onClose={() => setWalletModalData(null)}
            title={`تعديل وتسوية رصيد محفظة: ${walletModalData.bureauName}`}
            maxWidth="md"
          >
            <div className="space-y-4 text-xs">
              <div className="p-3 rounded-xl bg-[#0B1124] border border-white/5 flex justify-between items-center">
                <span className="text-[#94A3B8]">الرصيد الحالي:</span>
                <span className="font-bold text-[#22C55E] font-mono text-sm">
                  {formatCurrency(walletModalData.currentBalance, 'SAR')}
                </span>
              </div>

              <div>
                <Label>نوع الحركة المالية</Label>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setWalletAdjustType('credit')}
                    className={`py-2 px-3 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                      walletAdjustType === 'credit'
                        ? 'bg-[#22C55E]/20 border-[#22C55E] text-[#22C55E]'
                        : 'bg-[#151C32] border-white/5 text-[#94A3B8]'
                    }`}
                  >
                    إيداع رصيد (+)
                  </button>
                  <button
                    type="button"
                    onClick={() => setWalletAdjustType('debit')}
                    className={`py-2 px-3 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                      walletAdjustType === 'debit'
                        ? 'bg-[#EF4444]/20 border-[#EF4444] text-[#EF4444]'
                        : 'bg-[#151C32] border-white/5 text-[#94A3B8]'
                    }`}
                  >
                    خصم رصيد (-)
                  </button>
                </div>
              </div>

              <div>
                <Label required>المبلغ بالريال السعودي (SAR)</Label>
                <Input
                  type="number"
                  value={walletAdjustAmount}
                  onChange={(e) => setWalletAdjustAmount(e.target.value)}
                  placeholder="500"
                />
              </div>

              <div>
                <Label required>سبب التعديل والبيان الإداري</Label>
                <Input
                  value={walletAdjustDesc}
                  onChange={(e) => setWalletAdjustDesc(e.target.value)}
                  placeholder="مثال: تسوية عمولة زواج مبارك / رسوم تشغيلية..."
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/5">
                <Button variant="secondary" onClick={() => setWalletModalData(null)}>
                  إلغاء
                </Button>
                <Button
                  variant="primary"
                  onClick={() =>
                    adjustWalletMutation.mutate({
                      userId: walletModalData.userId,
                      amount: Number(walletAdjustAmount),
                      type: walletAdjustType,
                      description: walletAdjustDesc || 'تسوية إدارية من لوحة المنصة',
                    })
                  }
                  isLoading={adjustWalletMutation.isPending}
                >
                  تنفيذ قيد التسوية
                </Button>
              </div>
            </div>
          </Dialog>
        )}
      </div>

      <Footer />
    </div>
  );
};

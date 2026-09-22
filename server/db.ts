import fs from 'fs';
import path from 'path';

// File-backed persistent database store for seamless execution in containers
const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'madar-db.json');

export interface DBState {
  users: any[];
  sites: any[];
  siteVersions: any[];
  siteVisits: any[];
  analyticsDaily: any[];
  messages: any[];
  domains: any[];
  mediaAssets: any[];
  wallets: any[];
  walletTransactions: any[];
  walletDepositRequests: any[];
  currencyRates: any[];
  currencyExchangeTransactions: any[];
  purchaseRequests: any[];
  sitePurchases: any[];
  paymentMethods: any[];
  platformSettings: any[];
  platformRevenue: any[];
  notifications: any[];
  auditLogs: any[];
  marriageRequests: any[];
  successStories: any[];
  articles: any[];
  packages: any[];
  faqs: any[];
}

let dbState: DBState | null = null;

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

/**
 * Creates a clean, empty production database state with zero dummy/demo data.
 * Contains only system standard configuration (official currency exchange rates & platform settings).
 */
export function createEmptyProductionDB(): DBState {
  return {
    users: [],
    sites: [],
    siteVersions: [],
    siteVisits: [],
    analyticsDaily: [],
    messages: [],
    domains: [],
    mediaAssets: [],
    wallets: [],
    walletTransactions: [],
    walletDepositRequests: [],
    currencyRates: [
      { id: 1, code: 'SAR', nameAr: 'ريال سعودي', rateToUSD: '3.75', symbol: 'ر.س', updatedAt: new Date().toISOString() },
      { id: 2, code: 'AED', nameAr: 'درهم إماراتي', rateToUSD: '3.67', symbol: 'د.إ', updatedAt: new Date().toISOString() },
      { id: 3, code: 'KWD', nameAr: 'دينار كويتي', rateToUSD: '0.31', symbol: 'د.ك', updatedAt: new Date().toISOString() },
      { id: 4, code: 'EGP', nameAr: 'جنيه مصري', rateToUSD: '48.50', symbol: 'ج.م', updatedAt: new Date().toISOString() },
      { id: 5, code: 'USD', nameAr: 'دولار أمريكي', rateToUSD: '1.00', symbol: '$', updatedAt: new Date().toISOString() },
    ],
    currencyExchangeTransactions: [],
    purchaseRequests: [],
    sitePurchases: [],
    paymentMethods: [
      {
        id: 1,
        code: 'bank_transfer',
        titleAr: 'تحويل بنكي رسمي',
        detailsAr: 'الحساب البنكي الرسمي المعتمد للمنصة',
        isActive: true,
        instructions: 'يرجى تحويل المبلغ بدقة وإرفاق رقم الحوالة البنكية، ويتم التحقق والاعتماد المالي من الإدارة.',
      },
      {
        id: 2,
        code: 'electronic_payment',
        titleAr: 'الدفع الإلكتروني (مدى / فيزا)',
        detailsAr: 'بوابة الدفع الإلكتروني المباشر',
        isActive: true,
        instructions: 'سداد فوري ومباشر لترخيص المكتب عبر البطاقات البنكية المعتمدة.',
      },
    ],
    platformSettings: [
      { id: 1, keyName: 'lifetime_site_price', keyValue: '299.00', description: 'سعر شراء موقع المكتب مدى الحياة' },
      { id: 2, keyName: 'monthly_maintenance_fee', keyValue: '0.00', description: 'رسوم الصيانة الشهرية' },
      { id: 3, keyName: 'support_whatsapp', keyValue: '', description: 'واتساب الدعم الفني للمنصة' },
      { id: 4, keyName: 'platform_name', keyValue: 'منصة مدار لمكاتب الزواج الشرعي', description: 'اسم المنصة الرسمي' },
    ],
    platformRevenue: [],
    notifications: [],
    auditLogs: [],
    marriageRequests: [],
    successStories: [],
    articles: [],
    packages: [],
    faqs: [],
  };
}

export async function getDB(): Promise<DBState> {
  if (dbState) return dbState;

  ensureDataDir();
  if (fs.existsSync(DB_FILE)) {
    try {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      dbState = JSON.parse(data);
      return dbState!;
    } catch (e) {
      console.warn('Failed reading existing DB file:', e);
    }
  }

  // If no DB file exists:
  const isProd = process.env.NODE_ENV === 'production' || process.env.MADAR_ENV === 'production';
  if (isProd) {
    console.log('[MADAR] Initializing Clean Production Database (Zero Demo Data)...');
    dbState = createEmptyProductionDB();
  } else if (process.env.ENABLE_DEV_SEED === 'true') {
    console.log('[MADAR] Development mode: Loading development seed...');
    const { getDevelopmentSeed } = await import('./dev-seed.ts');
    dbState = await getDevelopmentSeed();
  } else {
    console.log('[MADAR] Initializing Clean Database...');
    dbState = createEmptyProductionDB();
  }

  saveDB();
  return dbState!;
}

export function saveDB() {
  if (!dbState) return;
  try {
    ensureDataDir();
    fs.writeFileSync(DB_FILE, JSON.stringify(dbState, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed saving DB state:', err);
  }
}

// Database helper queries and operations
export const db = {
  // Users
  users: {
    async findByEmail(email: string) {
      const s = await getDB();
      return s.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    },
    async findById(id: number) {
      const s = await getDB();
      return s.users.find((u) => u.id === id);
    },
    async create(data: any) {
      const s = await getDB();
      const id = (s.users.reduce((max, u) => Math.max(max, u.id), 0) || 0) + 1;
      const now = new Date().toISOString();
      // If this is the very first registered user in a fresh production database, grant admin privileges
      const role = s.users.length === 0 ? 'admin' : data.role || 'owner';
      const newUser = { id, ...data, role, createdAt: now, updatedAt: now };
      s.users.push(newUser);

      // Auto-create wallet for user
      const walletId = (s.wallets.reduce((max, w) => Math.max(max, w.id), 0) || 0) + 1;
      s.wallets.push({
        id: walletId,
        userId: id,
        balance: '0.00',
        currency: 'USD',
        updatedAt: now,
      });

      saveDB();
      return newUser;
    },
    async listAll() {
      const s = await getDB();
      return s.users.map(({ passwordHash, ...safe }) => safe);
    },
    async update(id: number, data: any) {
      const s = await getDB();
      const idx = s.users.findIndex((u) => u.id === id);
      if (idx === -1) return null;
      s.users[idx] = {
        ...s.users[idx],
        ...data,
        updatedAt: new Date().toISOString(),
      };
      saveDB();
      return s.users[idx];
    },
  },

  // Sites
  sites: {
    async findById(id: number) {
      const s = await getDB();
      return s.sites.find((site) => site.id === id);
    },
    async findBySubdomain(subdomain: string) {
      const s = await getDB();
      return s.sites.find((site) => site.subdomain.toLowerCase() === subdomain.toLowerCase());
    },
    async listByUserId(userId: number) {
      const s = await getDB();
      return s.sites.filter((site) => site.userId === userId);
    },
    async listAll() {
      const s = await getDB();
      return s.sites;
    },
    async create(data: any) {
      const s = await getDB();
      const id = (s.sites.reduce((max, site) => Math.max(max, site.id), 0) || 0) + 1;
      const now = new Date().toISOString();
      const newSite = {
        id,
        status: data.status || 'pending', // Strictly pending admin review and approval
        adminReviewNotes: null,
        reviewedAt: null,
        reviewedBy: null,
        ownerName: data.ownerName || '',
        ownerEmail: data.ownerEmail || '',
        ownerPhone: data.ownerPhone || data.officePhone || '',
        successRate: null, // Computed dynamically from real matched requests
        totalMarriages: 0, // Real count derived from actual requests
        officeYearsOfExperience: data.officeYearsOfExperience ?? 0,
        ...data,
        createdAt: now,
        updatedAt: now,
      };
      s.sites.push(newSite);

      // Create initial site version
      s.siteVersions.push({
        id: (s.siteVersions.reduce((max, v) => Math.max(max, v.id), 0) || 0) + 1,
        siteId: id,
        versionNumber: 1,
        configData: { template: data.template || 'traditional' },
        publishedAt: now,
      });

      // Add default packages for this new office
      const pkgs = [
        { name: 'الباقة الأساسية', price: '450.00', features: ['تسجيل وتدقيق الطلب', '3 ترشيحات متوافقة', 'تنسيق أولي مع الولي'] },
        { name: 'الباقة الذهبية VIP', price: '950.00', features: ['ترشيحات غير محدودة', 'أولوية ومتابعة مستمرة', 'استشارة أسرية معتمدة'], isPopular: true },
        { name: 'الباقة الشاملة', price: '2000.00', features: ['مستشار مخصص 24/7', 'تنسيق عقد القران والمأذون', 'عناية خاصة بالنخب'] },
      ];
      pkgs.forEach((p, idx) => {
        const pkgId = (s.packages.reduce((max, item) => Math.max(max, item.id), 0) || 0) + 1;
        s.packages.push({
          id: pkgId,
          siteId: id,
          name: p.name,
          description: 'خدمة وساطة زواج شرعي موثوقة',
          price: p.price,
          currency: 'SAR',
          features: p.features,
          isPopular: !!p.isPopular,
          sortOrder: idx + 1,
          createdAt: now,
        });
      });

      // Add default FAQ template
      const faqsList = [
        { q: 'كيف تضمنون سرية بيانات المتقدمين والمتقدمات؟', a: 'بياناتكم أمانة شرعية ونظامية، لا تظهر أرقام التواصل ولا الهويات إلا بعد موافقة الطرفين والتنسيق المباشر مع ولي الأمر.' },
        { q: 'هل المكتب مرخص ومعتمد من الجهات الرسمية؟', a: 'نعم، نعمل وفق التراخيص والأنظمة المعتمدة لتقديم خدمات التوفيق والوساطة الأسرية والزواج الشرعي.' },
      ];
      faqsList.forEach((f, idx) => {
        const fId = (s.faqs.reduce((max, item) => Math.max(max, item.id), 0) || 0) + 1;
        s.faqs.push({
          id: fId,
          siteId: id,
          question: f.q,
          answer: f.a,
          sortOrder: idx + 1,
          createdAt: now,
        });
      });

      // Audit log for submitted bureau request
      const logId = (s.auditLogs.reduce((max, l) => Math.max(max, l.id), 0) || 0) + 1;
      s.auditLogs.push({
        id: logId,
        userId: data.userId || null,
        action: 'SUBMIT_BUREAU_APPLICATION',
        details: `تقديم طلب اعتماد موقع مكتب زواج: ${newSite.name} (${newSite.subdomain}.madar.sa) - بانتظار موافقة الإدارة`,
        ipAddress: '127.0.0.1',
        createdAt: now,
      });

      // Notify platform admins
      const admins = s.users.filter((u) => u.role === 'admin');
      for (const adm of admins) {
        const notifId = (s.notifications.reduce((max, n) => Math.max(max, n.id), 0) || 0) + 1;
        s.notifications.unshift({
          id: notifId,
          userId: adm.id,
          title: 'طلب ترخيص مكتب زواج جديد بانتظار الاعتماد',
          message: `تم رفع طلب إطلاق موقع لمكتب "${newSite.name}" (${newSite.subdomain}.madar.sa) من قِبل ${newSite.ownerName || 'صاحب المكتب'}.`,
          type: 'bureau_pending',
          isRead: false,
          link: '/admin?tab=approvals',
          createdAt: now,
        });
      }

      saveDB();
      return newSite;
    },
    async update(id: number, data: any) {
      const s = await getDB();
      const idx = s.sites.findIndex((site) => site.id === id);
      if (idx === -1) return null;
      s.sites[idx] = {
        ...s.sites[idx],
        ...data,
        updatedAt: new Date().toISOString(),
      };
      saveDB();
      return s.sites[idx];
    },
    async delete(id: number) {
      const s = await getDB();
      s.sites = s.sites.filter((site) => site.id !== id);
      saveDB();
      return true;
    },
    async recordVisit(siteId: number, ipHash: string, path = '/', referrer = '', userAgent = '') {
      const s = await getDB();
      const now = new Date().toISOString();
      const today = now.slice(0, 10);

      // Record visit log
      const visitId = (s.siteVisits.reduce((max, v) => Math.max(max, v.id), 0) || 0) + 1;
      s.siteVisits.push({
        id: visitId,
        siteId,
        ipHash,
        path,
        referrer,
        userAgent,
        country: 'SA',
        visitedAt: now,
      });

      // Check if this IP is unique for today
      const isUniqueToday = !s.siteVisits.some(
        (v) => v.siteId === siteId && v.visitedAt.slice(0, 10) === today && v.ipHash === ipHash && v.id !== visitId
      );

      let daily = s.analyticsDaily.find((a) => a.siteId === siteId && a.date === today);
      if (daily) {
        daily.views += 1;
        if (isUniqueToday) daily.uniqueVisitors += 1;
      } else {
        const aId = (s.analyticsDaily.reduce((max, a) => Math.max(max, a.id), 0) || 0) + 1;
        s.analyticsDaily.push({
          id: aId,
          siteId,
          date: today,
          views: 1,
          uniqueVisitors: 1,
          requestsCount: 0,
        });
      }

      saveDB();
      return { success: true };
    },
  },

  // Marriage Requests
  marriageRequests: {
    async create(data: any) {
      const s = await getDB();
      const id = (s.marriageRequests.reduce((max, r) => Math.max(max, r.id), 0) || 0) + 1;
      const now = new Date().toISOString();
      const newReq = {
        id,
        status: 'new',
        internalNotes: '',
        matchedWithRequestId: null,
        ...data,
        createdAt: now,
        updatedAt: now,
      };
      s.marriageRequests.unshift(newReq);

      // Notify site owner
      const site = s.sites.find((st) => st.id === data.siteId);
      if (site) {
        const notifId = (s.notifications.reduce((max, n) => Math.max(max, n.id), 0) || 0) + 1;
        s.notifications.unshift({
          id: notifId,
          userId: site.userId,
          title: `طلب زواج جديد (${data.gender === 'male' ? 'خاطب' : 'مخطوبة'})`,
          message: `ورد طلب زواج جديد من: ${data.fullName} - ${data.city} (${data.nationality})`,
          type: 'marriage_request',
          isRead: false,
          link: '/dashboard?tab=requests',
          createdAt: now,
        });
      }

      // Record daily analytics count
      const today = now.slice(0, 10);
      const analytic = s.analyticsDaily.find((a) => a.siteId === data.siteId && a.date === today);
      if (analytic) {
        analytic.requestsCount += 1;
      } else {
        s.analyticsDaily.push({
          id: (s.analyticsDaily.reduce((max, a) => Math.max(max, a.id), 0) || 0) + 1,
          siteId: data.siteId,
          date: today,
          views: 1,
          uniqueVisitors: 1,
          requestsCount: 1,
        });
      }

      saveDB();
      return newReq;
    },
    async listBySiteId(siteId: number, filters?: { status?: string; gender?: string; city?: string; search?: string }) {
      const s = await getDB();
      let list = s.marriageRequests.filter((r) => r.siteId === siteId);

      if (filters?.status && filters.status !== 'all') {
        list = list.filter((r) => r.status === filters.status);
      }
      if (filters?.gender && filters.gender !== 'all') {
        list = list.filter((r) => r.gender === filters.gender);
      }
      if (filters?.city && filters.city !== 'all') {
        list = list.filter((r) => r.city.includes(filters.city!));
      }
      if (filters?.search) {
        const q = filters.search.toLowerCase();
        list = list.filter(
          (r) =>
            r.fullName.toLowerCase().includes(q) ||
            r.phone.includes(q) ||
            r.job?.toLowerCase().includes(q) ||
            r.education?.toLowerCase().includes(q)
        );
      }
      return list;
    },
    async findById(id: number) {
      const s = await getDB();
      return s.marriageRequests.find((r) => r.id === id);
    },
    async listForClient(userId: number, email?: string) {
      const s = await getDB();
      return s.marriageRequests
        .filter((r) => r.userId === userId || (email && r.email?.toLowerCase() === email.toLowerCase()))
        .reverse();
    },
    async update(id: number, data: any) {
      const s = await getDB();
      const idx = s.marriageRequests.findIndex((r) => r.id === id);
      if (idx === -1) return null;
      s.marriageRequests[idx] = {
        ...s.marriageRequests[idx],
        ...data,
        updatedAt: new Date().toISOString(),
      };
      saveDB();
      return s.marriageRequests[idx];
    },
    async updateNotes(id: number, internalNotes: string) {
      const s = await getDB();
      const req = s.marriageRequests.find((r) => r.id === id);
      if (!req) throw new Error('طلب الزواج غير موجود');
      req.internalNotes = internalNotes;
      req.updatedAt = new Date().toISOString();
      saveDB();
      return req;
    },
    async updateStatus(id: number, status: string, internalNotes?: string, matchedWithRequestId?: number) {
      const s = await getDB();
      const req = s.marriageRequests.find((r) => r.id === id);
      if (!req) throw new Error('طلب الزواج غير موجود');
      req.status = status;
      if (internalNotes !== undefined) req.internalNotes = internalNotes;
      if (matchedWithRequestId !== undefined) req.matchedWithRequestId = matchedWithRequestId;
      req.updatedAt = new Date().toISOString();

      // If matched, also update the matched partner's request if set
      if (status === 'matched' && matchedWithRequestId) {
        const partner = s.marriageRequests.find((r) => r.id === matchedWithRequestId);
        if (partner) {
          partner.status = 'matched';
          partner.matchedWithRequestId = id;
          partner.updatedAt = new Date().toISOString();
        }
      }

      // Notify the applicant if they have a userId registered
      if (req.userId) {
        const notifId = (s.notifications.reduce((max, n) => Math.max(max, n.id), 0) || 0) + 1;
        const statusArabic: Record<string, string> = {
          reviewed: 'تمت مراجعة وتدقيق طلبك',
          contacted: 'تم التواصل مع ولي الأمر أو المتقدم',
          matched: 'تم التوفيق والترشيح بنجاح مبارك',
          closed: 'تم إغلاق ملف الطلب',
        };
        s.notifications.unshift({
          id: notifId,
          userId: req.userId,
          title: 'تحديث على مسار طلب الزواج',
          message: statusArabic[status] || `تم تحديث حالة طلبك إلى: ${status}`,
          type: 'request_status',
          isRead: false,
          link: '/client',
          createdAt: new Date().toISOString(),
        });
      }

      saveDB();
      return req;
    },
    async delete(id: number) {
      const s = await getDB();
      s.marriageRequests = s.marriageRequests.filter((r) => r.id !== id);
      saveDB();
      return true;
    },
  },

  // Success Stories
  successStories: {
    async listPublic(siteId: number) {
      const s = await getDB();
      return s.successStories.filter((st) => st.siteId === siteId && st.isPublic).reverse();
    },
    async listAll(siteId: number) {
      const s = await getDB();
      return s.successStories.filter((st) => st.siteId === siteId).reverse();
    },
    async listMine(siteId: number) {
      return this.listAll(siteId);
    },
    async create(data: any) {
      const s = await getDB();
      const id = (s.successStories.reduce((max, item) => Math.max(max, item.id), 0) || 0) + 1;
      const newStory = {
        id,
        isPublic: true,
        ...data,
        createdAt: new Date().toISOString(),
      };
      s.successStories.push(newStory);
      saveDB();
      return newStory;
    },
    async update(id: number, data: any) {
      const s = await getDB();
      const idx = s.successStories.findIndex((item) => item.id === id);
      if (idx === -1) return null;
      s.successStories[idx] = { ...s.successStories[idx], ...data };
      saveDB();
      return s.successStories[idx];
    },
    async delete(id: number) {
      const s = await getDB();
      s.successStories = s.successStories.filter((item) => item.id !== id);
      saveDB();
      return true;
    },
  },

  // Articles & Advice
  articles: {
    async listPublic(siteId: number) {
      const s = await getDB();
      return s.articles.filter((item) => item.siteId === siteId && item.published).reverse();
    },
    async listAll(siteId: number) {
      const s = await getDB();
      return s.articles.filter((item) => item.siteId === siteId).reverse();
    },
    async listMine(siteId: number) {
      return this.listAll(siteId);
    },
    async create(data: any) {
      const s = await getDB();
      const id = (s.articles.reduce((max, item) => Math.max(max, item.id), 0) || 0) + 1;
      const newArticle = {
        id,
        views: 0,
        published: true,
        ...data,
        createdAt: new Date().toISOString(),
      };
      s.articles.push(newArticle);
      saveDB();
      return newArticle;
    },
    async update(id: number, data: any) {
      const s = await getDB();
      const idx = s.articles.findIndex((item) => item.id === id);
      if (idx === -1) return null;
      s.articles[idx] = { ...s.articles[idx], ...data };
      saveDB();
      return s.articles[idx];
    },
    async delete(id: number) {
      const s = await getDB();
      s.articles = s.articles.filter((item) => item.id !== id);
      saveDB();
      return true;
    },
  },

  // Packages
  packages: {
    async listPublic(siteId: number) {
      const s = await getDB();
      return s.packages.filter((p) => p.siteId === siteId).sort((a, b) => a.sortOrder - b.sortOrder);
    },
    async listAll(siteId: number) {
      const s = await getDB();
      return s.packages.filter((p) => p.siteId === siteId).sort((a, b) => a.sortOrder - b.sortOrder);
    },
    async listMine(siteId: number) {
      const s = await getDB();
      return s.packages.filter((p) => p.siteId === siteId).sort((a, b) => a.sortOrder - b.sortOrder);
    },
    async create(data: any) {
      const s = await getDB();
      const id = (s.packages.reduce((max, item) => Math.max(max, item.id), 0) || 0) + 1;
      const newPkg = {
        id,
        sortOrder: s.packages.filter((p) => p.siteId === data.siteId).length + 1,
        ...data,
        createdAt: new Date().toISOString(),
      };
      s.packages.push(newPkg);
      saveDB();
      return newPkg;
    },
    async update(id: number, data: any) {
      const s = await getDB();
      const idx = s.packages.findIndex((p) => p.id === id);
      if (idx === -1) return null;
      s.packages[idx] = { ...s.packages[idx], ...data };
      saveDB();
      return s.packages[idx];
    },
    async delete(id: number) {
      const s = await getDB();
      s.packages = s.packages.filter((p) => p.id !== id);
      saveDB();
      return true;
    },
  },

  // FAQs
  faqs: {
    async listPublic(siteId: number) {
      const s = await getDB();
      return s.faqs.filter((f) => f.siteId === siteId).sort((a, b) => a.sortOrder - b.sortOrder);
    },
    async listAll(siteId: number) {
      const s = await getDB();
      return s.faqs.filter((f) => f.siteId === siteId).sort((a, b) => a.sortOrder - b.sortOrder);
    },
    async listMine(siteId: number) {
      const s = await getDB();
      return s.faqs.filter((f) => f.siteId === siteId).sort((a, b) => a.sortOrder - b.sortOrder);
    },
    async create(data: any) {
      const s = await getDB();
      const id = (s.faqs.reduce((max, item) => Math.max(max, item.id), 0) || 0) + 1;
      const newFaq = {
        id,
        sortOrder: s.faqs.filter((f) => f.siteId === data.siteId).length + 1,
        ...data,
        createdAt: new Date().toISOString(),
      };
      s.faqs.push(newFaq);
      saveDB();
      return newFaq;
    },
    async update(id: number, data: any) {
      const s = await getDB();
      const idx = s.faqs.findIndex((f) => f.id === id);
      if (idx === -1) return null;
      s.faqs[idx] = { ...s.faqs[idx], ...data };
      saveDB();
      return s.faqs[idx];
    },
    async delete(id: number) {
      const s = await getDB();
      s.faqs = s.faqs.filter((f) => f.id !== id);
      saveDB();
      return true;
    },
  },

  // Wallets & Commerce
  wallets: {
    async findByUserId(userId: number) {
      const s = await getDB();
      return s.wallets.find((w) => w.userId === userId);
    },
    async getTransactions(walletId: number) {
      const s = await getDB();
      return s.walletTransactions.filter((t) => t.walletId === walletId).reverse();
    },
    async getDepositRequestsForUser(userId: number) {
      const s = await getDB();
      return (s.walletDepositRequests || []).filter((r) => r.userId === userId).reverse();
    },
    async addTransaction(walletId: number, amount: number | string, type: string, description: string, refId?: string) {
      const { Money } = await import('./ledger/money.ts');
      const { AsyncMutex } = await import('./ledger/mutex.ts');
      return await AsyncMutex.withLock(`wallet:${walletId}`, async () => {
        const s = await getDB();
        const wallet = s.wallets.find((w) => w.id === walletId);
        if (!wallet) throw new Error('المحفظة غير موجودة');

        const delta = Money.from(amount);
        const currentBal = Money.from(wallet.balance);
        const newBal = currentBal.add(delta);
        if (newBal.isNegative()) throw new Error('رصيد المحفظة غير كافٍ');

        wallet.balance = newBal.toString();
        wallet.updatedAt = new Date().toISOString();

        const txId = (s.walletTransactions.reduce((max, t) => Math.max(max, t.id), 0) || 0) + 1;
        const tx = {
          id: txId,
          walletId,
          amount: delta.toString(),
          type,
          description,
          referenceId: refId || `TX-${Date.now().toString().slice(-6)}`,
          createdAt: new Date().toISOString(),
        };
        s.walletTransactions.push(tx);
        saveDB();
        return tx;
      });
    },
  },

  // Platform admin
  admin: {
    async getPlatformStats() {
      const s = await getDB();
      const totalUsers = s.users.length;
      const totalSites = s.sites.length;
      const totalRequests = s.marriageRequests.length;
      // Real completed marriages strictly from matched marriage requests
      const totalMarriages = s.marriageRequests.filter((r) => r.status === 'matched').length;
      // Real revenue from recorded purchases
      const totalRevenue = s.platformRevenue.reduce((sum, r) => sum + (parseFloat(r.amount) || 0), 0);

      return {
        totalUsers,
        totalSites,
        totalRequests,
        totalMarriages,
        totalRevenue,
        recentBureaus: s.sites.slice(-5).reverse(),
        recentUsers: s.users.slice(-5).reverse().map(({ passwordHash, ...u }) => u),
      };
    },
    async listPaymentMethods() {
      const s = await getDB();
      return s.paymentMethods || [];
    },
    async listActivePaymentMethods() {
      const s = await getDB();
      return (s.paymentMethods || []).filter((p) => p.isActive !== false);
    },
    async createPaymentMethod(data: any, adminUserId?: number) {
      const s = await getDB();
      if (!s.paymentMethods) s.paymentMethods = [];
      const id = (s.paymentMethods.reduce((max, p) => Math.max(max, p.id), 0) || 0) + 1;
      const now = new Date().toISOString();
      const newMethod = {
        id,
        code: data.code || `method_${id}`,
        titleAr: data.titleAr || 'طريقة دفع جديدة',
        accountName: data.accountName || '',
        accountNumber: data.accountNumber || '',
        iban: data.iban || '',
        detailsAr: data.detailsAr || '',
        instructions: data.instructions || '',
        qrCodeUrl: data.qrCodeUrl || '',
        isActive: data.isActive !== false,
        createdAt: now,
        updatedAt: now,
      };
      s.paymentMethods.push(newMethod);
      if (adminUserId) {
        await db.admin.logAudit(adminUserId, 'CREATE_PAYMENT_METHOD', `إضافة طريقة دفع: ${newMethod.titleAr}`);
      }
      saveDB();
      return newMethod;
    },
    async updatePaymentMethod(id: number, data: any, adminUserId?: number) {
      const s = await getDB();
      const idx = s.paymentMethods.findIndex((p) => p.id === id);
      if (idx !== -1) {
        s.paymentMethods[idx] = {
          ...s.paymentMethods[idx],
          ...data,
          updatedAt: new Date().toISOString(),
        };
        if (adminUserId) {
          await db.admin.logAudit(adminUserId, 'UPDATE_PAYMENT_METHOD', `تحديث طريقة دفع #${id}: ${s.paymentMethods[idx].titleAr}`);
        }
        saveDB();
        return s.paymentMethods[idx];
      }
      return null;
    },
    async togglePaymentMethod(id: number, adminUserId?: number) {
      const s = await getDB();
      const item = s.paymentMethods.find((p) => p.id === id);
      if (!item) throw new Error('طريقة الدفع غير موجودة');
      item.isActive = !item.isActive;
      item.updatedAt = new Date().toISOString();
      if (adminUserId) {
        await db.admin.logAudit(adminUserId, 'TOGGLE_PAYMENT_METHOD', `تغيير حالة طريقة دفع #${id} إلى: ${item.isActive ? 'مفعل' : 'معطل'}`);
      }
      saveDB();
      return item;
    },
    async deletePaymentMethod(id: number, adminUserId?: number) {
      const s = await getDB();
      const item = s.paymentMethods.find((p) => p.id === id);
      s.paymentMethods = s.paymentMethods.filter((p) => p.id !== id);
      if (adminUserId && item) {
        await db.admin.logAudit(adminUserId, 'DELETE_PAYMENT_METHOD', `حذف طريقة دفع: ${item.titleAr}`);
      }
      saveDB();
      return true;
    },
    async listAuditLogs() {
      const s = await getDB();
      return s.auditLogs.slice(-100).reverse();
    },
    async logAudit(userId: number, action: string, details?: string, ipAddress?: string) {
      const s = await getDB();
      const id = (s.auditLogs.reduce((max, l) => Math.max(max, l.id), 0) || 0) + 1;
      s.auditLogs.push({
        id,
        userId,
        action,
        details: details || '',
        ipAddress: ipAddress || '127.0.0.1',
        createdAt: new Date().toISOString(),
      });
      saveDB();
    },
    async listPendingApprovals() {
      const s = await getDB();
      return s.sites
        .filter((site) => site.status === 'pending')
        .map((site) => {
          const owner = s.users.find((u) => u.id === site.userId);
          return {
            ...site,
            ownerName: site.ownerName || owner?.name || 'صاحب مكتب زواج',
            ownerEmail: site.ownerEmail || owner?.email || '',
            ownerPhone: site.ownerPhone || site.officePhone || owner?.phone || '',
          };
        })
        .reverse();
    },
    async approveBureau(id: number, adminUserId: number, notes?: string, activateImmediately: boolean = false) {
      const s = await getDB();
      const site = s.sites.find((item) => item.id === id);
      if (!site) throw new Error('مكتب الزواج غير موجود');
      const now = new Date().toISOString();
      
      const newStatus = activateImmediately ? 'active' : 'approved_awaiting_payment';
      site.status = newStatus;
      site.reviewedAt = now;
      site.reviewedBy = adminUserId;
      site.adminReviewNotes = notes || 'تم التحقق من رخصة وزارة العدل واستيفاء متطلبات منصة مدار وتم الاعتماد بنجاح';
      site.updatedAt = now;

      // Dynamic price from platform settings
      const priceSetting = s.platformSettings?.find((st: any) => st.keyName === 'lifetime_site_price');
      const price = priceSetting?.keyValue ? String(priceSetting.keyValue) : '299.00';

      // Notification to owner
      const notifId = (s.notifications.reduce((max, n) => Math.max(max, n.id), 0) || 0) + 1;
      s.notifications.unshift({
        id: notifId,
        userId: site.userId,
        title: activateImmediately ? 'تهانينا! تم تفعيل موقع مكتبك رسمياً' : 'تم اعتماد موقع مكتبك — بانتظار سداد رسوم الترخيص',
        message: activateImmediately
          ? `تم ترخيص موقع مكتبكم "${site.name}" بنجاح وأصبح متاحاً للجمهور على الرابط: ${site.subdomain}.madar.sa`
          : `تهانينا! تمت مراجعة واعتماد طلب موقع مكتبكم "${site.name}". لإطلاق الموقع رسمياً، يرجى سداد رسوم الترخيص ($${price}) من لوحة التحكم.`,
        type: 'site_approved',
        isRead: false,
        link: '/dashboard',
        createdAt: now,
      });

      // Audit log
      const logId = (s.auditLogs.reduce((max, l) => Math.max(max, l.id), 0) || 0) + 1;
      s.auditLogs.push({
        id: logId,
        userId: adminUserId,
        action: 'APPROVE_BUREAU',
        details: `اعتماد طلب موقع المكتب: ${site.name} (${site.subdomain}.madar.sa) - الحالة: ${newStatus}`,
        ipAddress: '127.0.0.1',
        createdAt: now,
      });

      saveDB();
      return site;
    },
    async rejectBureau(id: number, adminUserId: number, reason: string) {
      const s = await getDB();
      const site = s.sites.find((item) => item.id === id);
      if (!site) throw new Error('مكتب الزواج غير موجود');
      const now = new Date().toISOString();
      site.status = 'rejected';
      site.reviewedAt = now;
      site.reviewedBy = adminUserId;
      site.adminReviewNotes = reason || 'لم يتم استيفاء مسوغات الترخيص والاشتراطات';
      site.updatedAt = now;

      // Notification to owner
      const notifId = (s.notifications.reduce((max, n) => Math.max(max, n.id), 0) || 0) + 1;
      s.notifications.unshift({
        id: notifId,
        userId: site.userId,
        title: 'تنبيه: تعذر اعتماد موقع المكتب',
        message: `نحيطكم علماً بأنه تم رفض طلب إطلاق موقع المكتب "${site.name}". السبب: ${site.adminReviewNotes}. بإمكانكم تعديل البيانات والتواصل مع الإدارة.`,
        type: 'site_rejected',
        isRead: false,
        createdAt: now,
      });

      // Audit log
      const logId = (s.auditLogs.reduce((max, l) => Math.max(max, l.id), 0) || 0) + 1;
      s.auditLogs.push({
        id: logId,
        userId: adminUserId,
        action: 'REJECT_BUREAU',
        details: `رفض طلب موقع المكتب: ${site.name} (${site.subdomain}) - السبب: ${site.adminReviewNotes}`,
        ipAddress: '127.0.0.1',
        createdAt: now,
      });

      saveDB();
      return site;
    },
    async suspendBureau(id: number, adminUserId: number, reason: string) {
      const s = await getDB();
      const site = s.sites.find((item) => item.id === id);
      if (!site) throw new Error('المكتب غير موجود');
      const now = new Date().toISOString();
      site.status = 'suspended';
      site.adminReviewNotes = reason || 'تعليق إداري احترازي';
      site.updatedAt = now;

      const logId = (s.auditLogs.reduce((max, l) => Math.max(max, l.id), 0) || 0) + 1;
      s.auditLogs.push({
        id: logId,
        userId: adminUserId,
        action: 'SUSPEND_BUREAU',
        details: `تعليق موقع المكتب: ${site.name} (${site.subdomain}) - السبب: ${site.adminReviewNotes}`,
        ipAddress: '127.0.0.1',
        createdAt: now,
      });

      saveDB();
      return site;
    },
    async reactivateBureau(id: number, adminUserId: number) {
      const s = await getDB();
      const site = s.sites.find((item) => item.id === id);
      if (!site) throw new Error('المكتب غير موجود');
      const now = new Date().toISOString();
      site.status = 'active';
      site.adminReviewNotes = 'تمت إعادة التفعيل والترخيص من إدارة المنصة';
      site.updatedAt = now;

      const logId = (s.auditLogs.reduce((max, l) => Math.max(max, l.id), 0) || 0) + 1;
      s.auditLogs.push({
        id: logId,
        userId: adminUserId,
        action: 'REACTIVATE_BUREAU',
        details: `إعادة تفعيل موقع المكتب: ${site.name} (${site.subdomain})`,
        ipAddress: '127.0.0.1',
        createdAt: now,
      });

      saveDB();
      return site;
    },
    async listAllRequests() {
      const s = await getDB();
      return s.marriageRequests.map((r) => {
        const site = s.sites.find((st) => st.id === r.siteId);
        return {
          ...r,
          siteName: site?.name || 'مكتب غير معروف',
          siteSubdomain: site?.subdomain || '',
        };
      });
    },
    async updateRequestStatus(id: number, status: string, internalNotes?: string, adminUserId?: number) {
      const s = await getDB();
      const updated = await db.marriageRequests.updateStatus(id, status, internalNotes);
      if (adminUserId) {
        const logId = (s.auditLogs.reduce((max, l) => Math.max(max, l.id), 0) || 0) + 1;
        s.auditLogs.push({
          id: logId,
          userId: adminUserId,
          action: 'UPDATE_REQUEST_STATUS',
          details: `تعديل حالة طلب الزواج #${id} إلى: ${status}`,
          ipAddress: '127.0.0.1',
          createdAt: new Date().toISOString(),
        });
        saveDB();
      }
      return updated;
    },
    async listPortfoliosAndWallets() {
      return await db.admin.getFinancialMetrics();
    },
    async getFinancialMetrics() {
      const s = await getDB();
      const totalWalletBalances = s.wallets.reduce((sum, w) => sum + (parseFloat(w.balance) || 0), 0);
      const totalRevenue = s.platformRevenue.reduce((sum, r) => sum + (parseFloat(r.amount) || 0), 0);
      const totalTransactionsVolume = s.walletTransactions.reduce(
        (sum, t) => sum + Math.abs(parseFloat(t.amount) || 0),
        0
      );

      const bureauPortfolios = s.sites.map((site) => {
        const owner = s.users.find((u) => u.id === site.userId);
        const wallet = s.wallets.find((w) => w.userId === site.userId);
        const reqs = s.marriageRequests.filter((r) => r.siteId === site.id);
        const completedCount = reqs.filter((r) => r.status === 'matched').length;

        return {
          siteId: site.id,
          siteName: site.name,
          subdomain: site.subdomain,
          ownerName: site.ownerName || owner?.name || 'غير محدد',
          walletBalance: wallet ? parseFloat(wallet.balance) : 0,
          totalMarriageRequests: reqs.length,
          completedMarriages: completedCount,
          siteStatus: site.status,
        };
      });

      const userWallets = s.wallets.map((w) => {
        const u = s.users.find((user) => user.id === w.userId);
        return {
          ...w,
          userName: u?.name || `مستخدم #${w.userId}`,
          userEmail: u?.email || '',
          userRole: u?.role || 'user',
        };
      });

      return {
        metrics: {
          totalWalletBalances,
          totalRevenue,
          totalTransactionsVolume,
          walletsCount: s.wallets.length,
          transactionsCount: s.walletTransactions.length,
        },
        bureauPortfolios,
        userWallets,
        recentTransactions: s.walletTransactions.slice(-50).reverse(),
      };
    },
    async listDepositRequests() {
      const s = await getDB();
      return (s.walletDepositRequests || []).map((req) => {
        const user = s.users.find((u) => u.id === req.userId);
        const site = s.sites.find((st) => st.userId === req.userId);
        return {
          ...req,
          userName: user?.name || `مستخدم #${req.userId}`,
          userEmail: user?.email || '',
          bureauName: site?.name || user?.name || `مكتب #${req.userId}`,
          method: req.paymentMethod,
        };
      });
    },
    async approveDepositRequest(id: number, adminUserId: number) {
      const { WalletService } = await import('./ledger/wallet-service.ts');
      const result = await WalletService.approveDepositRequest(id, adminUserId);
      return result.request;
    },
    async rejectDepositRequest(id: number, adminUserId: number, reason: string) {
      const { WalletService } = await import('./ledger/wallet-service.ts');
      return await WalletService.rejectDepositRequest(id, adminUserId, reason);
    },
    async adminCredit(walletId: number, amount: number | string, currency: string, reason: string, adminUserId: number) {
      const { WalletService } = await import('./ledger/wallet-service.ts');
      return await WalletService.adminCredit({ walletId, amount, currency, reason, adminUserId });
    },
    async adminDebit(walletId: number, amount: number | string, currency: string, reason: string, adminUserId: number) {
      const { WalletService } = await import('./ledger/wallet-service.ts');
      return await WalletService.adminDebit({ walletId, amount, currency, reason, adminUserId });
    },
    async refundTransaction(originalTransactionId: number, reason: string, adminUserId: number) {
      const { WalletService } = await import('./ledger/wallet-service.ts');
      return await WalletService.refundTransaction({ originalTransactionId, reason, adminUserId });
    },
    async adjustWalletBalance(
      userId: number,
      amount: number,
      description: string,
      type: 'credit' | 'debit',
      adminUserId: number
    ) {
      const { WalletService } = await import('./ledger/wallet-service.ts');
      const wallet = await WalletService.getOrCreateWallet(userId);
      if (type === 'credit') {
        const res = await WalletService.adminCredit({
          walletId: wallet.id,
          amount,
          currency: wallet.currency || 'USD',
          reason: description,
          adminUserId,
        });
        return { wallet, tx: res.transaction };
      } else {
        const res = await WalletService.adminDebit({
          walletId: wallet.id,
          amount,
          currency: wallet.currency || 'USD',
          reason: description,
          adminUserId,
        });
        return { wallet, tx: res.transaction };
      }
    },
    async updateUserRole(userId: number, role: string, adminUserId: number) {
      const s = await getDB();
      const user = s.users.find((u) => u.id === userId);
      if (!user) throw new Error('المستخدم غير موجود');
      user.role = role;
      user.updatedAt = new Date().toISOString();

      const logId = (s.auditLogs.reduce((max, l) => Math.max(max, l.id), 0) || 0) + 1;
      s.auditLogs.push({
        id: logId,
        userId: adminUserId,
        action: 'UPDATE_USER_ROLE',
        details: `تعديل دور المستخدم #${userId} (${user.name}) إلى: ${role}`,
        ipAddress: '127.0.0.1',
        createdAt: new Date().toISOString(),
      });

      saveDB();
      return user;
    },
  },

  // Notifications
  notifications: {
    async create(userId: number, title: string, message: string, type = 'info', link?: string) {
      const s = await getDB();
      const notifId = (s.notifications.reduce((max, n) => Math.max(max, n.id), 0) || 0) + 1;
      const notif = {
        id: notifId,
        userId,
        title,
        message,
        type,
        isRead: false,
        link: link || null,
        createdAt: new Date().toISOString(),
      };
      s.notifications.unshift(notif);
      saveDB();
      return notif;
    },
    async listForUser(userId: number) {
      const s = await getDB();
      return s.notifications.filter((n) => n.userId === userId);
    },
    async markAsRead(id: number, userId: number) {
      const s = await getDB();
      const notif = s.notifications.find((n) => n.id === id && n.userId === userId);
      if (notif) {
        notif.isRead = true;
        saveDB();
      }
      return true;
    },
  },
};

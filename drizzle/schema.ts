import {
  mysqlTable,
  int,
  varchar,
  text,
  timestamp,
  boolean,
  decimal,
  json,
  mysqlEnum,
  index,
} from 'drizzle-orm/mysql-core';

// 1. Users
export const users = mysqlTable('users', {
  id: int('id').autoincrement().primaryKey(),
  openId: varchar('open_id', { length: 255 }),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 320 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }),
  role: mysqlEnum('role', ['admin', 'owner', 'user']).default('owner').notNull(),
  emailVerifiedAt: timestamp('email_verified_at'),
  deletedAt: timestamp('deleted_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
});

// 2. Sites (Marriage Bureau Websites)
export const sites = mysqlTable('sites', {
  id: int('id').autoincrement().primaryKey(),
  userId: int('user_id').notNull(),
  subdomain: varchar('subdomain', { length: 100 }).notNull().unique(),
  customDomain: varchar('custom_domain', { length: 255 }),
  name: varchar('name', { length: 255 }).notNull(),
  tagline: varchar('tagline', { length: 500 }),
  template: mysqlEnum('template', [
    'traditional',
    'modern',
    'luxury',
    'family',
    'professional',
    'islamic',
  ]).default('traditional').notNull(),
  status: mysqlEnum('status', ['draft', 'active', 'suspended', 'expired']).default('active').notNull(),
  // Bureau Office details
  officePhone: varchar('office_phone', { length: 30 }),
  officeAddress: text('office_address'),
  officeWorkingHours: varchar('office_working_hours', { length: 255 }),
  officeLicenseNumber: varchar('office_license_number', { length: 100 }),
  officeYearsOfExperience: int('office_years_of_experience').default(5),
  officeAbout: text('office_about'),
  quranVerse: text('quran_verse'),
  hadithText: text('hadith_text'),
  successRate: int('success_rate').default(92), // percentage
  totalMarriages: int('total_marriages').default(140),
  primaryColor: varchar('primary_color', { length: 20 }).default('#D4AF37'),
  logoUrl: text('logo_url'),
  coverUrl: text('cover_url'),
  whatsappNumber: varchar('whatsapp_number', { length: 30 }),
  emailContact: varchar('email_contact', { length: 320 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
});

// 3. Site Versions
export const siteVersions = mysqlTable('site_versions', {
  id: int('id').autoincrement().primaryKey(),
  siteId: int('site_id').notNull(),
  versionNumber: int('version_number').notNull(),
  configData: json('config_data').notNull(),
  publishedAt: timestamp('published_at').defaultNow().notNull(),
});

// 4. Site Visits
export const siteVisits = mysqlTable('site_visits', {
  id: int('id').autoincrement().primaryKey(),
  siteId: int('site_id').notNull(),
  ipHash: varchar('ip_hash', { length: 64 }).notNull(),
  path: varchar('path', { length: 255 }).default('/'),
  referrer: varchar('referrer', { length: 500 }),
  userAgent: text('user_agent'),
  country: varchar('country', { length: 50 }).default('SA'),
  visitedAt: timestamp('visited_at').defaultNow().notNull(),
});

// 5. Analytics Daily
export const analyticsDaily = mysqlTable('analytics_daily', {
  id: int('id').autoincrement().primaryKey(),
  siteId: int('site_id').notNull(),
  date: varchar('date', { length: 10 }).notNull(), // YYYY-MM-DD
  views: int('views').default(0).notNull(),
  uniqueVisitors: int('unique_visitors').default(0).notNull(),
  requestsCount: int('requests_count').default(0).notNull(),
});

// 6. Messages (General contact messages)
export const messages = mysqlTable('messages', {
  id: int('id').autoincrement().primaryKey(),
  siteId: int('site_id').notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 320 }),
  phone: varchar('phone', { length: 30 }).notNull(),
  subject: varchar('subject', { length: 255 }),
  content: text('content').notNull(),
  isRead: boolean('is_read').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 7. Domains
export const domains = mysqlTable('domains', {
  id: int('id').autoincrement().primaryKey(),
  siteId: int('site_id').notNull(),
  domainName: varchar('domain_name', { length: 255 }).notNull().unique(),
  status: mysqlEnum('status', ['pending', 'verified', 'failed']).default('pending').notNull(),
  verifiedAt: timestamp('verified_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 8. Media Assets
export const mediaAssets = mysqlTable('media_assets', {
  id: int('id').autoincrement().primaryKey(),
  userId: int('user_id').notNull(),
  siteId: int('site_id'),
  fileName: varchar('file_name', { length: 255 }).notNull(),
  fileType: varchar('file_type', { length: 100 }).notNull(),
  fileSize: int('file_size').notNull(),
  url: text('url').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 9. Wallets
export const wallets = mysqlTable('wallets', {
  id: int('id').autoincrement().primaryKey(),
  userId: int('user_id').notNull().unique(),
  balance: decimal('balance', { precision: 12, scale: 2 }).default('0.00').notNull(),
  currency: varchar('currency', { length: 3 }).default('USD').notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
});

// 10. Wallet Transactions (Financial Ledger)
export const walletTransactions = mysqlTable(
  'wallet_transactions',
  {
    id: int('id').autoincrement().primaryKey(),
    walletId: int('wallet_id').notNull(),
    amount: decimal('amount', { precision: 12, scale: 2 }).notNull(),
    type: mysqlEnum('type', [
      'deposit',
      'purchase',
      'refund',
      'withdrawal',
      'admin_credit',
      'admin_debit',
    ]).notNull(),
    description: text('description').notNull(),
    referenceId: varchar('reference_id', { length: 100 }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    index('idx_wt_wallet_id').on(table.walletId),
    index('idx_wt_type').on(table.type),
    index('idx_wt_created_at').on(table.createdAt),
    index('idx_wt_reference_id').on(table.referenceId),
  ]
);

// 11. Wallet Deposit Requests
export const walletDepositRequests = mysqlTable(
  'wallet_deposit_requests',
  {
    id: int('id').autoincrement().primaryKey(),
    userId: int('user_id').notNull(),
    amount: decimal('amount', { precision: 12, scale: 2 }).notNull(),
    currency: varchar('currency', { length: 3 }).default('USD').notNull(),
    paymentMethod: varchar('payment_method', { length: 50 }).notNull(),
    proofImage: text('proof_image'),
    txHash: varchar('tx_hash', { length: 255 }),
    status: mysqlEnum('status', ['pending', 'approved', 'rejected', 'cancelled']).default('pending').notNull(),
    notes: text('notes'),
    rejectReason: text('reject_reason'),
    approvedAt: timestamp('approved_at'),
    approvedBy: int('approved_by'),
    rejectedAt: timestamp('rejected_at'),
    rejectedBy: int('rejected_by'),
    cancelledAt: timestamp('cancelled_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    index('idx_wdr_user_id').on(table.userId),
    index('idx_wdr_status').on(table.status),
    index('idx_wdr_created_at').on(table.createdAt),
  ]
);

// 12. Currency Rates
export const currencyRates = mysqlTable('currency_rates', {
  id: int('id').autoincrement().primaryKey(),
  code: varchar('code', { length: 3 }).notNull().unique(), // e.g. SAR, AED, USD, EGP
  nameAr: varchar('name_ar', { length: 50 }).notNull(),
  rateToUSD: decimal('rate_to_usd', { precision: 10, scale: 4 }).notNull(),
  symbol: varchar('symbol', { length: 10 }).notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
});

// 13. Currency Exchange Transactions
export const currencyExchangeTransactions = mysqlTable('currency_exchange_transactions', {
  id: int('id').autoincrement().primaryKey(),
  userId: int('user_id').notNull(),
  fromCurrency: varchar('from_currency', { length: 3 }).notNull(),
  toCurrency: varchar('to_currency', { length: 3 }).notNull(),
  amountFrom: decimal('amount_from', { precision: 12, scale: 2 }).notNull(),
  amountTo: decimal('amount_to', { precision: 12, scale: 2 }).notNull(),
  rate: decimal('rate', { precision: 10, scale: 4 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 14. Purchase Requests (for custom office sites / setups)
export const purchaseRequests = mysqlTable('purchase_requests', {
  id: int('id').autoincrement().primaryKey(),
  userId: int('user_id').notNull(),
  planName: varchar('plan_name', { length: 100 }).notNull(),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  currency: varchar('currency', { length: 3 }).default('USD').notNull(),
  status: mysqlEnum('status', ['pending', 'completed', 'cancelled']).default('pending').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 15. Site Purchases (active one-time purchase / subscription)
export const sitePurchases = mysqlTable('site_purchases', {
  id: int('id').autoincrement().primaryKey(),
  siteId: int('site_id').notNull(),
  userId: int('user_id').notNull(),
  amountPaid: decimal('amount_paid', { precision: 10, scale: 2 }).notNull(),
  currency: varchar('currency', { length: 3 }).default('USD').notNull(),
  purchasedAt: timestamp('purchased_at').defaultNow().notNull(),
  expiresAt: timestamp('expires_at'),
  tier: varchar('tier', { length: 50 }).default('lifetime').notNull(),
});

// 16. Payment Methods
export const paymentMethods = mysqlTable('payment_methods', {
  id: int('id').autoincrement().primaryKey(),
  code: varchar('code', { length: 50 }).notNull().unique(), // e.g. usdt_trc20, binance_pay, bank_transfer, stc_pay
  titleAr: varchar('title_ar', { length: 100 }).notNull(),
  detailsAr: text('details_ar').notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  instructions: text('instructions'),
});

// 17. Platform Settings
export const platformSettings = mysqlTable('platform_settings', {
  id: int('id').autoincrement().primaryKey(),
  keyName: varchar('key_name', { length: 100 }).notNull().unique(),
  keyValue: text('key_value').notNull(),
  description: text('description'),
});

// 18. Platform Revenue
export const platformRevenue = mysqlTable('platform_revenue', {
  id: int('id').autoincrement().primaryKey(),
  source: varchar('source', { length: 100 }).notNull(),
  amount: decimal('amount', { precision: 12, scale: 2 }).notNull(),
  currency: varchar('currency', { length: 3 }).default('USD').notNull(),
  siteId: int('site_id'),
  userId: int('user_id'),
  recordedAt: timestamp('recorded_at').defaultNow().notNull(),
});

// 19. Notifications
export const notifications = mysqlTable('notifications', {
  id: int('id').autoincrement().primaryKey(),
  userId: int('user_id').notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  message: text('message').notNull(),
  type: varchar('type', { length: 50 }).default('info').notNull(), // info, success, warning, marriage_request
  isRead: boolean('is_read').default(false).notNull(),
  link: text('link'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 20. Audit Logs
export const auditLogs = mysqlTable('audit_logs', {
  id: int('id').autoincrement().primaryKey(),
  userId: int('user_id'),
  action: varchar('action', { length: 100 }).notNull(),
  details: text('details'),
  ipAddress: varchar('ip_address', { length: 45 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 21. Auth Tokens
export const authTokens = mysqlTable('auth_tokens', {
  id: int('id').autoincrement().primaryKey(),
  userId: int('user_id').notNull(),
  token: varchar('token', { length: 500 }).notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 22. Refresh Tokens
export const refreshTokens = mysqlTable('refresh_tokens', {
  id: int('id').autoincrement().primaryKey(),
  userId: int('user_id').notNull(),
  token: varchar('token', { length: 500 }).notNull(),
  isRevoked: boolean('is_revoked').default(false).notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 23. AI Usage
export const aiUsage = mysqlTable('ai_usage', {
  id: int('id').autoincrement().primaryKey(),
  userId: int('user_id').notNull(),
  tokensUsed: int('tokens_used').default(0).notNull(),
  promptType: varchar('prompt_type', { length: 50 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ==========================================
// 5 NEW MARRIAGE BUREAU SPECIALIZED TABLES
// ==========================================

// 24. Marriage Requests (طلبات الزواج)
export const marriageRequests = mysqlTable(
  'marriage_requests',
  {
    id: int('id').autoincrement().primaryKey(),
    siteId: int('site_id').notNull(),
    // Applicant info (بيانات مقدم الطلب)
    fullName: varchar('full_name', { length: 255 }).notNull(),
    gender: mysqlEnum('gender', ['male', 'female']).notNull(),
    age: int('age').notNull(),
    maritalStatus: mysqlEnum('marital_status', ['single', 'divorced', 'widowed']).notNull(),
    city: varchar('city', { length: 100 }).notNull(),
    nationality: varchar('nationality', { length: 100 }).notNull(),
    education: varchar('education', { length: 100 }),
    job: varchar('job', { length: 255 }),
    height: int('height'), // cm
    weight: int('weight'), // kg
    religiousCommitment: varchar('religious_commitment', { length: 100 }),
    financialStatus: varchar('financial_status', { length: 100 }),
    // Partner requirements (مواصفات الشريك المطلوبة)
    partnerRequirements: text('partner_requirements').notNull(),
    // Contact (بيانات التواصل)
    phone: varchar('phone', { length: 30 }).notNull(),
    email: varchar('email', { length: 320 }),
    preferredContact: mysqlEnum('preferred_contact', ['whatsapp', 'call', 'email']).notNull(),
    guardianPhone: varchar('guardian_phone', { length: 30 }),
    // Extra
    notes: text('notes'),
    photoUrl: text('photo_url'),
    termsAccepted: boolean('terms_accepted').default(false).notNull(),
    // Management (owner only)
    status: mysqlEnum('status', ['new', 'reviewed', 'contacted', 'matched', 'closed'])
      .default('new')
      .notNull(),
    internalNotes: text('internal_notes'),
    matchedWithRequestId: int('matched_with_request_id'),
    // Timestamps
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
  },
  (table) => [
    index('idx_mr_site_id').on(table.siteId),
    index('idx_mr_status').on(table.status),
    index('idx_mr_gender').on(table.gender),
    index('idx_mr_created_at').on(table.createdAt),
  ]
);

// 25. Success Stories (قصص النجاح والمباركات)
export const successStories = mysqlTable('success_stories', {
  id: int('id').autoincrement().primaryKey(),
  siteId: int('site_id').notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  story: text('story').notNull(),
  brideName: varchar('bride_name', { length: 100 }),
  groomName: varchar('groom_name', { length: 100 }),
  marriageDate: varchar('marriage_date', { length: 20 }),
  imageUrl: text('image_url'),
  isPublic: boolean('is_public').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 26. Articles (مقالات ونصائح الزواج والمقبلين)
export const articles = mysqlTable('articles', {
  id: int('id').autoincrement().primaryKey(),
  siteId: int('site_id').notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  content: text('content').notNull(),
  category: varchar('category', { length: 100 }).default('نصائح أسرية'),
  imageUrl: text('image_url'),
  published: boolean('published').default(false).notNull(),
  views: int('views').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 27. Packages (باقات الوساطة والخدمة)
export const packages = mysqlTable('packages', {
  id: int('id').autoincrement().primaryKey(),
  siteId: int('site_id').notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  currency: varchar('currency', { length: 3 }).default('SAR').notNull(),
  features: json('features').notNull(), // Array of feature strings
  isPopular: boolean('is_popular').default(false).notNull(),
  sortOrder: int('sort_order').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 28. FAQs (الأسئلة الشائعة)
export const faqs = mysqlTable('faqs', {
  id: int('id').autoincrement().primaryKey(),
  siteId: int('site_id').notNull(),
  question: varchar('question', { length: 500 }).notNull(),
  answer: text('answer').notNull(),
  sortOrder: int('sort_order').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type Site = typeof sites.$inferSelect;
export type MarriageRequest = typeof marriageRequests.$inferSelect;
export type SuccessStory = typeof successStories.$inferSelect;
export type Article = typeof articles.$inferSelect;
export type Package = typeof packages.$inferSelect;
export type Faq = typeof faqs.$inferSelect;
export type Wallet = typeof wallets.$inferSelect;
export type Notification = typeof notifications.$inferSelect;

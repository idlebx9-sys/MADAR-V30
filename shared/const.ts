export const APP_NAME = 'MADAR (مدار)';
export const APP_DESCRIPTION = 'المنظومة السحابية المعتمدة لبناء وإدارة مواقع مكاتب ووسطاء الزواج الشرعي';

export const CANONICAL_TEMPLATE_IDS = [
  'traditional',
  'modern',
  'luxury',
  'family',
  'professional',
  'islamic',
] as const;

export type TemplateId = (typeof CANONICAL_TEMPLATE_IDS)[number];
export type TemplateType = TemplateId;
export const TEMPLATE_TYPES = CANONICAL_TEMPLATE_IDS;

export interface TemplateDefinition {
  id: TemplateId;
  value: TemplateId;
  label: string;
  name: string;
  description: string;
  accent: string;
  badge: string;
  category: TemplateId;
  preview: string;
  thumbnail: string;
}

export const TEMPLATES: TemplateDefinition[] = [
  {
    id: 'luxury',
    value: 'luxury',
    label: 'فاخر',
    name: 'الفاخر النخبوي (Luxury)',
    description: 'طابع كحلي مخملي فاخر بلمسات الذهب الفاتح والخطوط الأصيلة المتقنة والوقار النخبوي للمكاتب الرفيعة',
    accent: '#FBBF24',
    badge: 'VIP نخبوي',
    category: 'luxury',
    preview: '/src/assets/images/madar_hero_venue_1790038777806.jpg',
    thumbnail: '/src/assets/images/madar_hero_venue_1790038777806.jpg',
  },
  {
    id: 'modern',
    value: 'modern',
    label: 'عصري',
    name: 'العصري الحديث (Modern)',
    description: 'تصميم فائق النقاء والانسيابية، مساحات واسعة وترتيب هندسي هادئ ومريح للمستخدم والجيل الجديد',
    accent: '#6C3CE1',
    badge: 'عصري ناعم',
    category: 'modern',
    preview: '/src/assets/images/madar_hero_venue_1790038777806.jpg',
    thumbnail: '/src/assets/images/madar_hero_venue_1790038777806.jpg',
  },
  {
    id: 'family',
    value: 'family',
    label: 'أسري',
    name: 'الأسري الدافئ (Family)',
    description: 'أجواء متوازنة تبعث على الطمأنينة والألفة وتجمع الرصانة والموثوقية الأسرية العالية بين الأسر',
    accent: '#00D4FF',
    badge: 'ألفة وأمان',
    category: 'family',
    preview: '/src/assets/images/madar_hero_venue_1790038777806.jpg',
    thumbnail: '/src/assets/images/madar_hero_venue_1790038777806.jpg',
  },
  {
    id: 'professional',
    value: 'professional',
    label: 'مهني',
    name: 'المهني المعتمد (Professional)',
    description: 'مظهر تقني مؤسسي راقٍ بأسلوب المنصات السحابية الحديثة مع إبراز التراخيص الرسمية والاعتماد',
    accent: '#22C55E',
    badge: 'مهني معتمد',
    category: 'professional',
    preview: '/src/assets/images/madar_hero_venue_1790038777806.jpg',
    thumbnail: '/src/assets/images/madar_hero_venue_1790038777806.jpg',
  },
  {
    id: 'traditional',
    value: 'traditional',
    label: 'تقليدي',
    name: 'التقليدي الأصيل (Traditional)',
    description: 'تأصيل تراثي بالزخرفة الهندسية الدقيقة والعراقة التليدة والتصاميم العربية المحافظة المتوارثة',
    accent: '#EAB308',
    badge: 'تراث أصيل',
    category: 'traditional',
    preview: '/src/assets/images/madar_hero_venue_1790038777806.jpg',
    thumbnail: '/src/assets/images/madar_hero_venue_1790038777806.jpg',
  },
  {
    id: 'islamic',
    value: 'islamic',
    label: 'إسلامي',
    name: 'الشرعي الوقور (Islamic)',
    description: 'طابع إسلامي رصين ومحافظ بألوان الزمرد الهادئ والآيات والضوابط الشرعية الصريحة والخصوصية التامة',
    accent: '#10B981',
    badge: 'شرعي وقور',
    category: 'islamic',
    preview: '/src/assets/images/madar_hero_venue_1790038777806.jpg',
    thumbnail: '/src/assets/images/madar_hero_venue_1790038777806.jpg',
  },
];

export function isValidTemplateId(input: unknown): input is TemplateId {
  return typeof input === 'string' && (CANONICAL_TEMPLATE_IDS as readonly string[]).includes(input);
}

export function normalizeTemplateId(input?: string | null): TemplateId {
  if (!input) return 'luxury';
  const clean = input.toLowerCase().trim();
  if (clean === 'traditional' || clean === 'classic') return 'traditional';
  if (clean === 'modern' || clean === 'minimal') return 'modern';
  if (clean === 'luxury' || clean === 'royal') return 'luxury';
  if (clean === 'family' || clean === 'elegant') return 'family';
  if (clean === 'professional' || clean === 'modern-arabic') return 'professional';
  if (clean === 'islamic') return 'islamic';
  return 'luxury';
}

export const MARITAL_STATUS_LABELS: Record<string, string> = {
  single: 'أعزب / عزباء',
  divorced: 'مطلق / مطلقة',
  widowed: 'أرمل / أرملة',
};

export const GENDER_LABELS: Record<string, string> = {
  male: 'خاطب (رجل)',
  female: 'مخطوبة (امرأة)',
};

export const REQUEST_STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  new: { label: 'طلب جديد', color: 'text-[#FBBF24]', bg: 'bg-[#FBBF24]/15 border-[#FBBF24]/30' },
  reviewed: { label: 'تمت المراجعة', color: 'text-[#00D4FF]', bg: 'bg-[#00D4FF]/15 border-[#00D4FF]/30' },
  contacted: { label: 'تم التواصل', color: 'text-[#A78BFA]', bg: 'bg-[#6C3CE1]/15 border-[#6C3CE1]/30' },
  matched: { label: 'تم التوفيق والخطبة', color: 'text-[#22C55E]', bg: 'bg-[#22C55E]/15 border-[#22C55E]/30' },
  closed: { label: 'مغلق / مؤجل', color: 'text-[#64748B]', bg: 'bg-white/5 border-white/10' },
};

export const PREFERRED_CONTACT_LABELS: Record<string, string> = {
  whatsapp: 'واتساب فقط',
  call: 'اتصال هاتفي',
  email: 'بريد إلكتروني',
};

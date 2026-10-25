import { SocialPlatformId } from './social-platforms';

export type BannerPosition = 'top_bar' | 'hero_showcase';
export type BannerThemeStyle =
  | 'royal_gold'
  | 'emerald_whatsapp'
  | 'cyber_purple'
  | 'crimson_vip'
  | 'ocean_cyan';

export interface SiteBannerItem {
  id: string;
  titleAr: string;
  titleEn: string;
  subtitleAr: string;
  subtitleEn: string;
  badgeAr: string;
  badgeEn: string;
  buttonTextAr: string;
  buttonTextEn: string;
  buttonUrl: string;
  imageUrl?: string;
  position: BannerPosition;
  themeStyle: BannerThemeStyle;
  isActive: boolean;
}

export interface SiteOfficialSocialItem {
  id: string;
  platform: SocialPlatformId;
  labelAr: string;
  labelEn: string;
  handleOrBadge: string;
  url: string;
  isActive: boolean;
  isChannel?: boolean;
}

export interface SiteFaqItem {
  id: string;
  questionAr: string;
  questionEn: string;
  answerAr: string;
  answerEn: string;
}

export interface HeroPhoneDemoConfig {
  username: string;
  displayName: string;
  bio: string;
  avatarUrl: string;
  coverUrl: string;
}

export interface ExtendedSiteConfig {
  // Core Brand & Header
  siteName: string;
  logoUrl: string;
  logoText: string;
  logoBadge: string;
  logoSubtext: string;
  siteTaglineAr: string;
  siteTaglineEn: string;
  defaultThemeId: string;
  allowRegistrations: boolean;
  maintenanceMode: boolean;

  // Main Hero Content
  heroBadgeAr: string;
  heroBadgeEn: string;
  heroTitle1Ar: string;
  heroTitle1En: string;
  heroTitle2Ar: string;
  heroTitle2En: string;
  heroSubtitleAr: string;
  heroSubtitleEn: string;
  ctaPrimaryAr: string;
  ctaPrimaryEn: string;
  claimDomainPrefix: string;

  // Contact & Footer
  contactEmail: string;
  contactPhone: string;
  whatsappSupportUrl: string;
  copyrightAr: string;
  copyrightEn: string;

  // Global SEO
  globalSeoTitle: string;
  globalSeoDescription: string;

  // Promotional Banners & Announcements
  banners: SiteBannerItem[];

  // Official Main Website Social Media & Channels
  officialSocials: SiteOfficialSocialItem[];

  // Interactive Hero Phone Profile
  heroPhone: HeroPhoneDemoConfig;

  // Custom FAQs on Main Website
  faqs: SiteFaqItem[];

  // Disabled Theme IDs
  disabledThemes: string[];
}

export const BANNER_THEME_STYLES: Record<
  BannerThemeStyle,
  {
    nameAr: string;
    nameEn: string;
    gradient: string;
    border: string;
    badgeBg: string;
    accentColor: string;
  }
> = {
  royal_gold: {
    nameAr: 'ذهبي ملكي (Royal Gold)',
    nameEn: 'Royal Gold',
    gradient: 'linear-gradient(135deg, rgba(20,16,8,0.95) 0%, rgba(48,35,12,0.92) 50%, rgba(18,14,8,0.96) 100%)',
    border: 'rgba(212, 175, 55, 0.45)',
    badgeBg: 'linear-gradient(135deg, #FDE08D 0%, #D4AF37 55%, #AA771C 100%)',
    accentColor: '#F3E5AB',
  },
  emerald_whatsapp: {
    nameAr: 'زمردي رسمي (Emerald Channel)',
    nameEn: 'Emerald Channel',
    gradient: 'linear-gradient(135deg, rgba(6,24,16,0.95) 0%, rgba(12,52,33,0.92) 50%, rgba(6,20,14,0.96) 100%)',
    border: 'rgba(37, 211, 102, 0.45)',
    badgeBg: 'linear-gradient(135deg, #5BF696 0%, #25D366 55%, #128C7E 100%)',
    accentColor: '#6EE7B7',
  },
  cyber_purple: {
    nameAr: 'بنفسجي مستقبلي (Cyber Violet)',
    nameEn: 'Cyber Violet',
    gradient: 'linear-gradient(135deg, rgba(15,8,28,0.95) 0%, rgba(42,16,75,0.92) 50%, rgba(14,8,24,0.96) 100%)',
    border: 'rgba(168, 85, 247, 0.45)',
    badgeBg: 'linear-gradient(135deg, #C084FC 0%, #9333EA 55%, #6B21A8 100%)',
    accentColor: '#D8B4FE',
  },
  crimson_vip: {
    nameAr: 'ياقوتي فاخر (Crimson VIP)',
    nameEn: 'Crimson VIP',
    gradient: 'linear-gradient(135deg, rgba(28,8,14,0.95) 0%, rgba(68,14,28,0.92) 50%, rgba(24,6,12,0.96) 100%)',
    border: 'rgba(244, 63, 94, 0.45)',
    badgeBg: 'linear-gradient(135deg, #FDA4AF 0%, #E11D48 55%, #9F1239 100%)',
    accentColor: '#FECDD3',
  },
  ocean_cyan: {
    nameAr: 'لازوردي مضيء (Ocean Cyan)',
    nameEn: 'Ocean Cyan',
    gradient: 'linear-gradient(135deg, rgba(6,18,28,0.95) 0%, rgba(10,45,68,0.92) 50%, rgba(6,16,24,0.96) 100%)',
    border: 'rgba(34, 211, 238, 0.45)',
    badgeBg: 'linear-gradient(135deg, #67E8F9 0%, #06B6D4 55%, #0E7490 100%)',
    accentColor: '#A5F3FC',
  },
};

export const DEFAULT_SITE_CONFIG: ExtendedSiteConfig = {
  siteName: 'VoltiX',
  logoUrl: '/voltix-logo.png',
  logoText: 'VoltiX',
  logoBadge: 'PRO 2.5',
  logoSubtext: 'SPATIAL IDENTITY OS',
  siteTaglineAr: 'هويتك الرقمية الفاخرة في رابط واحد',
  siteTaglineEn: 'Your Ultra-Luxury Digital Identity in One Link',
  defaultThemeId: 'obsidian-luxury',
  allowRegistrations: true,
  maintenanceMode: false,

  heroBadgeAr: 'الجيل الجديد من الهويات الرقمية الفاخرة • VoltiX 2.5',
  heroBadgeEn: 'Next-Gen Spatial Digital Identity OS • VoltiX 2.5',
  heroTitle1Ar: 'صمّم حضورك الرقمي',
  heroTitle1En: 'Architect Your Digital',
  heroTitle2Ar: 'بفخامة تفوق التوقعات',
  heroTitle2En: 'Presence Beyond Ordinary',
  heroSubtitleAr:
    'منصة VoltiX تجمع جميع حساباتك، قنواتك الرسمية (واتساب، تيليغرام، ديسكورد، فيسبوك)، وأعمالك في تحفة بصرية تفاعلية مع 20 ثيمًا سينمائيًا وتقنيات الزجاج السائل.',
  heroSubtitleEn:
    'VoltiX unites all your social profiles, official channels (WhatsApp, Telegram, Discord, Facebook), and portfolio into an interactive spatial masterpiece with 20 cinematic themes.',
  ctaPrimaryAr: 'احجز هويتك مجانًا',
  ctaPrimaryEn: 'Claim Your Hub Free',
  claimDomainPrefix: 'voltix.io/@',

  contactEmail: 'vip@voltix.io',
  contactPhone: '+966 50 000 0000',
  whatsappSupportUrl: 'https://whatsapp.com/channel/voltix',
  copyrightAr: 'جميع الحقوق محفوظة لمنصة VoltiX للهويات الرقمية الفاخرة.',
  copyrightEn: 'All rights reserved to VoltiX Spatial Identity Platform.',

  globalSeoTitle: 'VoltiX — Ultra-Luxury Spatial Link-in-Bio & Digital Identity OS',
  globalSeoDescription:
    'Create an unforgettable luxury link-in-bio page with 20+ cinematic themes, official social & channel integrations, liquid glass UI, and real-time analytics.',

  banners: [
    {
      id: 'banner-top-1',
      titleAr: 'انضم الآن إلى قناتنا الرسمية على واتساب وتيليغرام للحصول على ثيمات VIP الحصرية!',
      titleEn: 'Join our official WhatsApp & Telegram channels for exclusive VIP themes & updates!',
      subtitleAr: 'تحديثات فورية • قوالب ملكية مجانية للمشتركين الأوائل',
      subtitleEn: 'Instant updates • Free royal templates for early members',
      badgeAr: 'جديد وحصري',
      badgeEn: 'NEW & EXCLUSIVE',
      buttonTextAr: 'انضم للقناة الرسمية',
      buttonTextEn: 'Join Official Channel',
      buttonUrl: 'https://whatsapp.com/channel/voltix',
      position: 'top_bar',
      themeStyle: 'royal_gold',
      isActive: true,
    },
    {
      id: 'banner-hero-2',
      titleAr: 'إصدار VoltiX Royal Crest 2.5 — دعم كامل لقنوات واتساب وديسكورد وتيليغرام وفيسبوك',
      titleEn: 'VoltiX Royal Crest 2.5 — Full Official Support for WhatsApp, Discord, Telegram & Facebook Channels',
      subtitleAr:
        'اربط قنواتك ومجتمعاتك الرسمية بأيقوناتها الأصلية وتدرجاتها اللونية المعتمدة مع بطاقات هولوجرامية ثلاثية الأبعاد قابلة للتخصيص بالكامل.',
      subtitleEn:
        'Connect your official channels and communities with authentic vector emblems, brand gradients, and customizable 3D holographic cards.',
      badgeAr: 'تحديث المنصة الرئيسي',
      badgeEn: 'MAJOR PLATFORM RELEASE',
      buttonTextAr: 'ابدأ تصميم صفحتك الآن',
      buttonTextEn: 'Create Your Page Now',
      buttonUrl: '/register',
      imageUrl: '/voltix-logo.png',
      position: 'hero_showcase',
      themeStyle: 'royal_gold',
      isActive: true,
    },
  ],

  officialSocials: [
    {
      id: 'soc-whatsapp',
      platform: 'whatsapp',
      labelAr: 'قناة واتساب الرسمية',
      labelEn: 'Official WhatsApp Channel',
      handleOrBadge: 'WA CHANNEL',
      url: 'https://whatsapp.com/channel/voltix',
      isActive: true,
      isChannel: true,
    },
    {
      id: 'soc-telegram',
      platform: 'telegram',
      labelAr: 'قناة تيليغرام الرسمية',
      labelEn: 'Official Telegram Channel',
      handleOrBadge: '@voltix_official',
      url: 'https://t.me/voltix',
      isActive: true,
      isChannel: true,
    },
    {
      id: 'soc-discord',
      platform: 'discord',
      labelAr: 'سيرفر ومجتمع ديسكورد',
      labelEn: 'Official Discord Community',
      handleOrBadge: 'discord.gg/voltix',
      url: 'https://discord.gg/voltix',
      isActive: true,
      isChannel: true,
    },
    {
      id: 'soc-facebook',
      platform: 'facebook',
      labelAr: 'صفحة ومجتمع فيسبوك الرسمي',
      labelEn: 'Official Facebook Community',
      handleOrBadge: 'fb.com/voltix',
      url: 'https://facebook.com/groups/voltix',
      isActive: true,
      isChannel: true,
    },
    {
      id: 'soc-instagram',
      platform: 'instagram',
      labelAr: 'إنستغرام الرسمي',
      labelEn: 'Official Instagram',
      handleOrBadge: '@voltix.io',
      url: 'https://instagram.com/voltix',
      isActive: true,
    },
    {
      id: 'soc-tiktok',
      platform: 'tiktok',
      labelAr: 'تيك توك الرسمي',
      labelEn: 'Official TikTok',
      handleOrBadge: '@voltix',
      url: 'https://tiktok.com/@voltix',
      isActive: true,
    },
    {
      id: 'soc-youtube',
      platform: 'youtube',
      labelAr: 'قناة يوتيوب الرسمية',
      labelEn: 'Official YouTube Channel',
      handleOrBadge: 'youtube.com/@voltix',
      url: 'https://youtube.com/@voltix',
      isActive: true,
      isChannel: true,
    },
    {
      id: 'soc-x',
      platform: 'x',
      labelAr: 'حساب X (تويتر) الرسمي',
      labelEn: 'Official X (Twitter)',
      handleOrBadge: '@voltix_io',
      url: 'https://x.com/voltix',
      isActive: true,
    },
    {
      id: 'soc-snapchat',
      platform: 'snapchat',
      labelAr: 'سناب شات الرسمي',
      labelEn: 'Official Snapchat',
      handleOrBadge: '@voltix',
      url: 'https://snapchat.com/add/voltix',
      isActive: true,
    },
    {
      id: 'soc-linkedin',
      platform: 'linkedin',
      labelAr: 'لينكدإن الرسمي',
      labelEn: 'Official LinkedIn',
      handleOrBadge: 'VoltiX HQ',
      url: 'https://linkedin.com/company/voltix',
      isActive: true,
    },
    {
      id: 'soc-spotify',
      platform: 'spotify',
      labelAr: 'سبوتيفاي الرسمي',
      labelEn: 'Official Spotify',
      handleOrBadge: 'VoltiX Sound Lab',
      url: 'https://open.spotify.com',
      isActive: true,
    },
    {
      id: 'soc-github',
      platform: 'github',
      labelAr: 'جيت هب الرسمي',
      labelEn: 'Official GitHub',
      handleOrBadge: 'github.com/voltix',
      url: 'https://github.com/voltix',
      isActive: true,
    },
    {
      id: 'soc-twitch',
      platform: 'twitch',
      labelAr: 'قناة تويتش الرسمية',
      labelEn: 'Official Twitch',
      handleOrBadge: 'twitch.tv/voltix',
      url: 'https://twitch.tv/voltix',
      isActive: true,
    },
    {
      id: 'soc-kick',
      platform: 'kick',
      labelAr: 'قناة Kick الرسمية',
      labelEn: 'Official Kick',
      handleOrBadge: 'kick.com/voltix',
      url: 'https://kick.com/voltix',
      isActive: true,
    },
  ],

  heroPhone: {
    username: 'sultan',
    displayName: 'سلطان العتيبي | VoltiX Director',
    bio: 'مصمم تجارب رقمية ثلاثية الأبعاد ومؤسس استوديو الفخامة البصرية ✨',
    avatarUrl: '',
    coverUrl: '',
  },

  faqs: [
    {
      id: 'faq-1',
      questionAr: 'بماذا تختلف منصة VoltiX عن منصات الروابط التقليدية؟',
      questionEn: 'How is VoltiX different from traditional link-in-bio tools?',
      answerAr:
        'تم تصميم VoltiX من الصفر كنظام هوية رقمية مكانية (Spatial Luxury Identity OS) وليس مجرد قائمة أزرار. توفر المنصة 20 ثيمًا سينمائيًا، تقنيات الزجاج السائل (Liquid Glass UI)، شريط أيقونات تواصل رسمي بألوان العلامات التجارية الأصلية، استوديو تأثيرات متكامل (Effects Studio)، ومولد Theme DNA الذكي.',
      answerEn:
        'VoltiX is engineered as a Spatial Luxury Digital Identity OS rather than a plain list of buttons. It features 20 distinct cinematic themes, Liquid Glass UI, an official 14-platform Social Dock, Theme DNA synthesis, and 12 architectural card styles.',
    },
    {
      id: 'faq-2',
      questionAr: 'هل تتعرف المنصة تلقائيًا على أيقونات وقنوات مواقع التواصل الاجتماعي؟',
      questionEn: 'Does VoltiX include official social media icons & channel badges?',
      answerAr:
        'نعم! تدعم VoltiX 14 منصة رسمية (واتساب، تيليغرام، ديسكورد، فيسبوك، إنستغرام، تيك توك، يوتيوب، X، سناب شات، وغيرها) بأيقوناتها وتدرجاتها اللونية الرسمية، مع قوالب جاهزة لإضافة القنوات والمجتمعات الرسمية بنقرة واحدة.',
      answerEn:
        'Yes! All 14 major platforms feature authentic vector emblems and brand gradients, plus 1-click official channel presets for WhatsApp, Telegram, Discord, Facebook, and YouTube.',
    },
    {
      id: 'faq-3',
      questionAr: 'هل تؤثر التأثيرات البصرية ثلاثية الأبعاد على سرعة الصفحة على الهواتف؟',
      questionEn: 'Are animations smooth on mobile devices?',
      answerAr:
        'لا، لأن المنصة مزودة بنظام Adaptive Effects الذي يضبط كثافة الجسيمات والظلال تلقائيًا حسب قدرة الجهاز ويحترم إعدادات تقليل الحركة في النظام.',
      answerEn:
        'Yes! Our Adaptive Effects engine automatically scales particle density and GPU layers on mobile devices and natively respects prefers-reduced-motion.',
    },
    {
      id: 'faq-4',
      questionAr: 'هل يمكنني إصدار بطاقة VoltiX Black Pass برمز QR مخصص بشعار الموقع؟',
      questionEn: 'Can I generate a custom VoltiX Black Pass & QR code?',
      answerAr:
        'نعم، تتضمن كل صفحة بطاقة VIP رقمية فاخرة ومولد QR Code احترافي يحمل شعار VoltiX الملكي ويسمح بالتحميل الفوري بصيغتي PNG و SVG.',
      answerEn:
        'Absolutely. Every profile includes an interactive VIP Black Pass modal with the royal VoltiX crest and high-error-correction PNG & SVG QR exports.',
    },
  ],

  disabledThemes: [],
};

/**
 * Parses a Prisma `SiteSettings` row into a complete `ExtendedSiteConfig` object.
 * Supports both legacy array `disabledThemesJson` ("[]") and full JSON payload.
 */
export function parseExtendedSiteConfig(row?: {
  siteName?: string | null;
  siteTaglineAr?: string | null;
  siteTaglineEn?: string | null;
  logoText?: string | null;
  defaultThemeId?: string | null;
  allowRegistrations?: boolean | null;
  maintenanceMode?: boolean | null;
  globalSeoTitle?: string | null;
  globalSeoDescription?: string | null;
  disabledThemesJson?: string | null;
} | null): ExtendedSiteConfig {
  if (!row) {
    return { ...DEFAULT_SITE_CONFIG };
  }

  let parsedExtra: Partial<ExtendedSiteConfig> = {};
  let disabledThemes: string[] = [];

  if (row.disabledThemesJson) {
    try {
      const raw = JSON.parse(row.disabledThemesJson);
      if (Array.isArray(raw)) {
        disabledThemes = raw.filter((x) => typeof x === 'string');
      } else if (raw && typeof raw === 'object') {
        parsedExtra = raw;
        if (Array.isArray(raw.disabledThemes)) {
          disabledThemes = raw.disabledThemes.filter((x: unknown) => typeof x === 'string');
        }
      }
    } catch {
      disabledThemes = [];
    }
  }

  const normalizedSiteName =
    row.siteName && row.siteName !== 'AURA LINKS'
      ? row.siteName
      : parsedExtra.siteName || DEFAULT_SITE_CONFIG.siteName;

  const normalizedLogoText =
    row.logoText && row.logoText !== 'AURA'
      ? row.logoText
      : parsedExtra.logoText || DEFAULT_SITE_CONFIG.logoText;

  return {
    ...DEFAULT_SITE_CONFIG,
    ...parsedExtra,
    siteName: normalizedSiteName,
    logoText: normalizedLogoText,
    siteTaglineAr: row.siteTaglineAr || parsedExtra.siteTaglineAr || DEFAULT_SITE_CONFIG.siteTaglineAr,
    siteTaglineEn: row.siteTaglineEn || parsedExtra.siteTaglineEn || DEFAULT_SITE_CONFIG.siteTaglineEn,
    defaultThemeId: row.defaultThemeId || parsedExtra.defaultThemeId || DEFAULT_SITE_CONFIG.defaultThemeId,
    allowRegistrations:
      typeof row.allowRegistrations === 'boolean'
        ? row.allowRegistrations
        : parsedExtra.allowRegistrations ?? DEFAULT_SITE_CONFIG.allowRegistrations,
    maintenanceMode:
      typeof row.maintenanceMode === 'boolean'
        ? row.maintenanceMode
        : parsedExtra.maintenanceMode ?? DEFAULT_SITE_CONFIG.maintenanceMode,
    globalSeoTitle:
      row.globalSeoTitle && !row.globalSeoTitle.startsWith('AURA LINKS')
        ? row.globalSeoTitle
        : parsedExtra.globalSeoTitle || DEFAULT_SITE_CONFIG.globalSeoTitle,
    globalSeoDescription:
      row.globalSeoDescription || parsedExtra.globalSeoDescription || DEFAULT_SITE_CONFIG.globalSeoDescription,
    banners: Array.isArray(parsedExtra.banners)
      ? parsedExtra.banners
      : DEFAULT_SITE_CONFIG.banners,
    officialSocials: Array.isArray(parsedExtra.officialSocials)
      ? parsedExtra.officialSocials
      : DEFAULT_SITE_CONFIG.officialSocials,
    heroPhone: {
      ...DEFAULT_SITE_CONFIG.heroPhone,
      ...(parsedExtra.heroPhone || {}),
    },
    faqs: Array.isArray(parsedExtra.faqs)
      ? parsedExtra.faqs
      : DEFAULT_SITE_CONFIG.faqs,
    disabledThemes,
  };
}

/**
 * Serializes the extended CMS config into `disabledThemesJson` while keeping top-level columns synced.
 */
export function serializeExtendedSiteConfig(config: Partial<ExtendedSiteConfig>): {
  siteName: string;
  siteTaglineAr: string;
  siteTaglineEn: string;
  logoText: string;
  defaultThemeId: string;
  allowRegistrations: boolean;
  maintenanceMode: boolean;
  globalSeoTitle: string;
  globalSeoDescription: string;
  disabledThemesJson: string;
} {
  const merged: ExtendedSiteConfig = {
    ...DEFAULT_SITE_CONFIG,
    ...config,
    heroPhone: {
      ...DEFAULT_SITE_CONFIG.heroPhone,
      ...(config.heroPhone || {}),
    },
    banners: Array.isArray(config.banners) ? config.banners : DEFAULT_SITE_CONFIG.banners,
    officialSocials: Array.isArray(config.officialSocials)
      ? config.officialSocials
      : DEFAULT_SITE_CONFIG.officialSocials,
    faqs: Array.isArray(config.faqs) ? config.faqs : DEFAULT_SITE_CONFIG.faqs,
    disabledThemes: Array.isArray(config.disabledThemes)
      ? config.disabledThemes
      : DEFAULT_SITE_CONFIG.disabledThemes,
  };

  return {
    siteName: (merged.siteName || 'VoltiX').slice(0, 80),
    siteTaglineAr: (merged.siteTaglineAr || '').slice(0, 200),
    siteTaglineEn: (merged.siteTaglineEn || '').slice(0, 200),
    logoText: (merged.logoText || 'VoltiX').slice(0, 40),
    defaultThemeId: (merged.defaultThemeId || 'obsidian-luxury').slice(0, 60),
    allowRegistrations: merged.allowRegistrations !== false,
    maintenanceMode: Boolean(merged.maintenanceMode),
    globalSeoTitle: (merged.globalSeoTitle || '').slice(0, 200),
    globalSeoDescription: (merged.globalSeoDescription || '').slice(0, 400),
    disabledThemesJson: JSON.stringify(merged),
  };
}

// In-Memory Fast Cache for Site Configuration (Zero database latency for public visitors)
let cachedSiteConfig: { data: ExtendedSiteConfig; expiresAt: number } | null = null;

export function getCachedSiteConfig(): ExtendedSiteConfig | null {
  if (cachedSiteConfig && Date.now() < cachedSiteConfig.expiresAt) {
    return cachedSiteConfig.data;
  }
  return null;
}

export function setCachedSiteConfig(config: ExtendedSiteConfig, ttlMs = 60_000) {
  cachedSiteConfig = {
    data: config,
    expiresAt: Date.now() + ttlMs,
  };
}

export function invalidateSiteConfigCache() {
  cachedSiteConfig = null;
}


'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Users,
  Eye,
  MousePointerClick,
  Layers,
  CheckCircle2,
  Ban,
  Trash2,
  Settings,
  Palette,
  Flag,
  ArrowLeft,
  Sparkles,
  ExternalLink,
  Search,
  Crown,
  Megaphone,
  Share2,
  Plus,
  Save,
  RotateCcw,
  Globe,
  Smartphone,
  HelpCircle,
  Check,
  Edit3,
  Power,
  Mail,
  Phone,
  ChevronRight,
  ChevronLeft,
  ShieldCheck,
  Activity,
  Zap,
  Compass,
  Lock,
  Unlock,
  LayoutGrid,
  Monitor,
  Bell,
  Copy,
  Menu,
  X,
  Command,
  Terminal,
  Radio,
} from 'lucide-react';
import { useLanguage } from '@/lib/i18n';
import {
  AURA_THEMES,
  ThemeConfig,
  DEFAULT_EFFECTS_CONFIG,
  PROFILE_LAYOUTS,
  ProfileLayoutType,
} from '@/lib/themes';
import {
  SOCIAL_PLATFORMS,
  OFFICIAL_CHANNEL_PRESETS,
  OfficialSocialBadge,
  SocialPlatformId,
} from '@/lib/social-platforms';
import {
  DEFAULT_SITE_CONFIG,
  ExtendedSiteConfig,
  SiteBannerItem,
  SiteOfficialSocialItem,
  SiteFaqItem,
  BANNER_THEME_STYLES,
  BannerThemeStyle,
  BannerPosition,
} from '@/lib/site-config';
import { UniversalImageUploader } from '@/components/dashboard/ImageCropUploader';
import { HorizontalThemeShowroomCarousel } from '@/components/profile/LuxuryThemeShowroomCard';
import { ProfileRenderer, ProfileData } from '@/components/profile/ProfileRenderer';

interface AdminUserRow {
  id: string;
  email: string;
  username: string;
  displayName: string;
  role: string;
  isVerified: boolean;
  isSuspended: boolean;
  createdAt: string;
  _count: {
    links: number;
    pageViews: number;
    linkClicks: number;
  };
}

interface AdminReportRow {
  id: string;
  reason: string;
  reporterNote: string;
  targetUrl: string;
  status: string;
  resolvedBy: string;
  createdAt: string;
  reportedUser: {
    id: string;
    username: string;
    email: string;
    displayName: string;
  };
}

interface AuditLogRow {
  id: string;
  adminEmail: string;
  action: string;
  targetType: string;
  targetId: string;
  details: string;
  createdAt: string;
}

type ControlTabId =
  | 'hero_brand'
  | 'banners'
  | 'socials'
  | 'phone_faq'
  | 'themes'
  | 'users'
  | 'reports';

export default function AdminSiteControlCenterPage() {
  const router = useRouter();
  const { locale, toggleLocale } = useLanguage();
  const isRtl = locale === 'ar';

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<ControlTabId>('hero_brand');
  const [toast, setToast] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [hasAdminRole, setHasAdminRole] = useState(false);
  const [isUnauthorized, setIsUnauthorized] = useState(false);
  const [brandPreviewMode, setBrandPreviewMode] = useState<'website' | 'phone' | 'seo'>('website');
  const [bannerFilter, setBannerFilter] = useState<'all' | 'top_bar' | 'hero_showcase' | 'active'>('all');

  // Next-Gen Spatial Cockpit State
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [commandQuery, setCommandQuery] = useState('');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // Main Website Extended Configuration State
  const [siteConfig, setSiteConfig] = useState<ExtendedSiteConfig>(DEFAULT_SITE_CONFIG);

  // Banner Form Modal / Inline Editor State
  const [editingBannerId, setEditingBannerId] = useState<string | null>(null);
  const [bannerDraft, setBannerDraft] = useState<SiteBannerItem>({
    id: '',
    titleAr: '',
    titleEn: '',
    subtitleAr: '',
    subtitleEn: '',
    badgeAr: 'جديد وحصري',
    badgeEn: 'EXCLUSIVE',
    buttonTextAr: 'اكتشف الآن',
    buttonTextEn: 'Explore Now',
    buttonUrl: '/register',
    imageUrl: '',
    position: 'top_bar',
    themeStyle: 'royal_gold',
    isActive: true,
  });
  const [showBannerForm, setShowBannerForm] = useState(false);

  // New Social Channel Quick Add State
  const [newSocialPlatform, setNewSocialPlatform] = useState<SocialPlatformId>('whatsapp');
  const [newSocialLabelAr, setNewSocialLabelAr] = useState('');
  const [newSocialLabelEn, setNewSocialLabelEn] = useState('');
  const [newSocialBadge, setNewSocialBadge] = useState('');
  const [newSocialUrl, setNewSocialUrl] = useState('');

  // New FAQ Quick Add State
  const [newFaqQAr, setNewFaqQAr] = useState('');
  const [newFaqQEn, setNewFaqQEn] = useState('');
  const [newFaqAAr, setNewFaqAAr] = useState('');
  const [newFaqAEn, setNewFaqAEn] = useState('');

  // Live Interactive Theme Preview State inside Admin Themes Vault
  const [adminPreviewThemeId, setAdminPreviewThemeId] = useState<string>('obsidian-luxury');
  const [adminPreviewLayout, setAdminPreviewLayout] =
    useState<ProfileLayoutType>('centered');
  const [adminInspectedThemeModal, setAdminInspectedThemeModal] =
    useState<ThemeConfig | null>(null);

  // Horizontal Navigation Tabs Scroll Ref & Helpers
  const navTabsScrollRef = useRef<HTMLDivElement | null>(null);
  const navTabButtonRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const scrollNavTabs = (direction: 'right' | 'left') => {
    const el = navTabsScrollRef.current;
    if (!el) return;
    const step = Math.max(260, Math.round(el.clientWidth * 0.55));
    const delta = direction === 'right' ? step : -step;
    el.scrollBy({ left: delta, behavior: 'smooth' });
  };

  // Admin Users / Metrics State
  const [metrics, setMetrics] = useState({
    totalUsers: 3,
    activeUsers: 3,
    totalProfiles: 3,
    totalViews: 1480,
    totalClicks: 620,
  });
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [reports, setReports] = useState<AdminReportRow[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogRow[]>([]);

  const notify = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  const fetchAllControlData = async () => {
    try {
      // 1. Strict Sovereign Security Guard: Check user session and admin role
      const authRes = await fetch('/api/auth/me', { cache: 'no-store' }).catch(() => null);
      if (!authRes || !authRes.ok) {
        setIsUnauthorized(true);
        router.replace('/login');
        return;
      }

      const authData = await authRes.json();
      if (!authData?.user || authData.user.role !== 'ADMIN') {
        setIsUnauthorized(true);
        router.replace('/dashboard');
        return;
      }

      // Validated platform owner: Unlock Sovereign Admin OS
      setHasAdminRole(true);

      const [configRes, adminRes] = await Promise.all([
        fetch('/api/site-config', { cache: 'no-store' }),
        fetch('/api/admin', { cache: 'no-store' }).catch(() => null),
      ]);

      if (configRes && configRes.ok) {
        const configData = await configRes.json();
        if (configData.siteConfig) {
          setSiteConfig(configData.siteConfig);
        }
      }

      if (adminRes && adminRes.ok) {
        const adminData = await adminRes.json();
        if (adminData.metrics) setMetrics(adminData.metrics);
        if (adminData.users) setUsers(adminData.users);
        if (adminData.reports) setReports(adminData.reports);
        if (adminData.auditLogs) setAuditLogs(adminData.auditLogs);
      }
    } catch (err) {
      console.error('Error loading site control center:', err);
      setIsUnauthorized(true);
      router.replace('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllControlData();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setIsCommandPaletteOpen(false);
        setMobileNavOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const saveMainSiteConfig = async (customConfig?: ExtendedSiteConfig, customMsg?: string) => {
    const targetConfig = customConfig || siteConfig;
    setSaving(true);
    try {
      const res = await fetch('/api/site-config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ siteConfig: targetConfig }),
      });
      const data = await res.json();
      if (res.ok && data.siteConfig) {
        setSiteConfig(data.siteConfig);
        notify(
          customMsg ||
            (isRtl
              ? '✨ تم حفظ ونشر إعدادات وبيانات الموقع الرئيسي بنجاح!'
              : '✨ Main website settings & data saved and published!')
        );
      } else {
        notify(`⚠️ ${data.error || 'Failed to save settings'}`);
      }
    } catch {
      notify(isRtl ? '⚠️ حدث خطأ أثناء حفظ الإعدادات' : '⚠️ Error saving configuration');
    } finally {
      setSaving(false);
    }
  };

  const resetSiteConfigToDefaults = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/site-config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset_defaults' }),
      });
      const data = await res.json();
      if (res.ok && data.siteConfig) {
        setSiteConfig(data.siteConfig);
        notify(
          isRtl
            ? '🔄 تمت استعادة الإعدادات الافتراضية الملكية للموقع الرئيسي'
            : '🔄 Restored default VoltiX main website settings'
        );
      }
    } finally {
      setSaving(false);
    }
  };

  const runAdminAction = async (payload: Record<string, unknown>, successMsg: string) => {
    const res = await fetch('/api/admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (res.ok) {
      notify(successMsg);
      fetchAllControlData();
    } else {
      notify(`⚠️ ${data.error || 'Action failed'}`);
    }
  };

  // Banner Helpers
  const openAddBanner = () => {
    setEditingBannerId(null);
    setBannerDraft({
      id: `banner-${Date.now()}`,
      titleAr: '',
      titleEn: '',
      subtitleAr: '',
      subtitleEn: '',
      badgeAr: 'إعلان هام',
      badgeEn: 'ANNOUNCEMENT',
      buttonTextAr: 'انضم الآن',
      buttonTextEn: 'Join Now',
      buttonUrl: 'https://whatsapp.com/channel/voltix',
      imageUrl: '/voltix-logo.png',
      position: 'hero_showcase',
      themeStyle: 'royal_gold',
      isActive: true,
    });
    setShowBannerForm(true);
  };

  const openEditBanner = (banner: SiteBannerItem) => {
    setEditingBannerId(banner.id);
    setBannerDraft({ ...banner });
    setShowBannerForm(true);
  };

  const handleSaveBannerDraft = async () => {
    if (!bannerDraft.titleAr.trim() && !bannerDraft.titleEn.trim()) {
      notify(isRtl ? '⚠️ يرجى كتابة عنوان البنر أولاً' : '⚠️ Please enter a banner title');
      return;
    }
    const normalized: SiteBannerItem = {
      ...bannerDraft,
      id: editingBannerId || `banner-${Date.now()}`,
      titleAr: bannerDraft.titleAr || bannerDraft.titleEn,
      titleEn: bannerDraft.titleEn || bannerDraft.titleAr,
      subtitleAr: bannerDraft.subtitleAr || bannerDraft.subtitleEn,
      subtitleEn: bannerDraft.subtitleEn || bannerDraft.subtitleAr,
      badgeAr: bannerDraft.badgeAr || 'جديد',
      badgeEn: bannerDraft.badgeEn || 'NEW',
      buttonTextAr: bannerDraft.buttonTextAr || 'عرض المزيد',
      buttonTextEn: bannerDraft.buttonTextEn || 'Learn More',
    };

    const nextBanners = editingBannerId
      ? siteConfig.banners.map((b) => (b.id === editingBannerId ? normalized : b))
      : [normalized, ...siteConfig.banners];

    const updatedConfig = { ...siteConfig, banners: nextBanners };
    setSiteConfig(updatedConfig);
    setShowBannerForm(false);
    setEditingBannerId(null);
    await saveMainSiteConfig(
      updatedConfig,
      isRtl ? '✨ تم حفظ البنر ونشره في الموقع الرئيسي!' : '✨ Banner saved and published!'
    );
  };

  const toggleBannerActive = async (bannerId: string) => {
    const nextBanners = siteConfig.banners.map((b) =>
      b.id === bannerId ? { ...b, isActive: !b.isActive } : b
    );
    const updatedConfig = { ...siteConfig, banners: nextBanners };
    setSiteConfig(updatedConfig);
    await saveMainSiteConfig(
      updatedConfig,
      isRtl ? 'تم تحديث حالة ظهور البنر في الموقع الرئيسي' : 'Banner visibility updated'
    );
  };

  const deleteBanner = async (bannerId: string) => {
    const nextBanners = siteConfig.banners.filter((b) => b.id !== bannerId);
    const updatedConfig = { ...siteConfig, banners: nextBanners };
    setSiteConfig(updatedConfig);
    await saveMainSiteConfig(
      updatedConfig,
      isRtl ? '🗑️ تم حذف البنر من الموقع الرئيسي' : '🗑️ Banner deleted'
    );
  };

  // Official Socials Helpers
  const updateSocialItem = (
    id: string,
    patch: Partial<SiteOfficialSocialItem>
  ) => {
    setSiteConfig((prev) => ({
      ...prev,
      officialSocials: prev.officialSocials.map((item) =>
        item.id === id ? { ...item, ...patch } : item
      ),
    }));
  };

  const addNewOfficialSocial = async () => {
    if (!newSocialUrl.trim()) {
      notify(isRtl ? '⚠️ يرجى إدخال رابط الحساب أو القناة الرسمية' : '⚠️ Please enter the channel URL');
      return;
    }
    const platInfo =
      SOCIAL_PLATFORMS.find((p) => p.id === newSocialPlatform) || SOCIAL_PLATFORMS[0];
    const newItem: SiteOfficialSocialItem = {
      id: `soc-${Date.now()}`,
      platform: newSocialPlatform,
      labelAr: newSocialLabelAr.trim() || `قناتنا الرسمية على ${platInfo.nameAr}`,
      labelEn: newSocialLabelEn.trim() || `Official ${platInfo.name}`,
      handleOrBadge: newSocialBadge.trim() || 'OFFICIAL',
      url: newSocialUrl.trim(),
      isActive: true,
      isChannel: true,
    };
    const updatedConfig = {
      ...siteConfig,
      officialSocials: [newItem, ...siteConfig.officialSocials],
    };
    setSiteConfig(updatedConfig);
    setNewSocialLabelAr('');
    setNewSocialLabelEn('');
    setNewSocialBadge('');
    setNewSocialUrl('');
    await saveMainSiteConfig(
      updatedConfig,
      isRtl
        ? '✨ تمت إضافة وسيلة التواصل / القناة الرسمية للموقع الرئيسي!'
        : '✨ Official social channel added to main website!'
    );
  };

  const deleteOfficialSocial = async (id: string) => {
    const updatedConfig = {
      ...siteConfig,
      officialSocials: siteConfig.officialSocials.filter((s) => s.id !== id),
    };
    setSiteConfig(updatedConfig);
    await saveMainSiteConfig(
      updatedConfig,
      isRtl ? '🗑️ تم حذف وسيلة التواصل من الموقع الرئيسي' : '🗑️ Social link removed'
    );
  };

  // FAQ Helpers
  const addFaqItem = async () => {
    if (!newFaqQAr.trim() && !newFaqQEn.trim()) {
      notify(isRtl ? '⚠️ يرجى كتابة السؤال أولاً' : '⚠️ Please enter a question');
      return;
    }
    const item: SiteFaqItem = {
      id: `faq-${Date.now()}`,
      questionAr: newFaqQAr || newFaqQEn,
      questionEn: newFaqQEn || newFaqQAr,
      answerAr: newFaqAAr || newFaqAEn,
      answerEn: newFaqAEn || newFaqAAr,
    };
    const updatedConfig = {
      ...siteConfig,
      faqs: [...siteConfig.faqs, item],
    };
    setSiteConfig(updatedConfig);
    setNewFaqQAr('');
    setNewFaqQEn('');
    setNewFaqAAr('');
    setNewFaqAEn('');
    await saveMainSiteConfig(updatedConfig);
  };

  const deleteFaqItem = async (id: string) => {
    const updatedConfig = {
      ...siteConfig,
      faqs: siteConfig.faqs.filter((f) => f.id !== id),
    };
    setSiteConfig(updatedConfig);
    await saveMainSiteConfig(updatedConfig);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#040407] text-white flex flex-col items-center justify-center gap-5 relative overflow-hidden">
        <div className="absolute inset-0 cyber-grid-floor opacity-30" />
        <div className="w-24 h-24 rounded-[28px] bg-gradient-to-br from-[#14141D] via-[#07070C] to-black border-2 border-amber-400/60 p-3.5 flex items-center justify-center shadow-[0_0_70px_rgba(212,175,55,0.45)] animate-pulse relative z-10">
          <img src="/voltix-logo.png" alt="VoltiX" className="w-full h-full object-contain" />
        </div>
        <div className="text-center space-y-1.5 relative z-10">
          <div className="text-sm font-black uppercase tracking-[0.28em] gold-gradient-text">
            VOLTIX SOVEREIGN COMMAND OS
          </div>
          <div className="text-xs font-bold text-zinc-400">
            {isRtl
              ? 'جاري تحميل مركز القيادة الملكي وإعدادات المنصة...'
              : 'Initializing Executive Control Center & Live Telemetry...'}
          </div>
        </div>
      </div>
    );
  }

  const filteredUsers = users.filter(
    (u) =>
      u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.displayName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeBannersCount = siteConfig.banners.filter((b) => b.isActive).length;
  const activeSocialsCount = siteConfig.officialSocials.filter((s) => s.isActive).length;
  const activeThemesCount = AURA_THEMES.length - siteConfig.disabledThemes.length;
  const openReportsCount = reports.filter((r) => r.status === 'OPEN').length;
  const currentDefaultThemeObj =
    AURA_THEMES.find((t) => t.id === siteConfig.defaultThemeId) || AURA_THEMES[0];

  // Shared Demo Profile for Hero 3D Phone Previews inside Admin
  const sharedHeroPhoneProfile: ProfileData = {
    username: siteConfig.heroPhone.username || 'voltix',
    displayName: siteConfig.heroPhone.displayName || 'VoltiX | المنصة الرسمية',
    bio:
      siteConfig.heroPhone.bio ||
      'منصة الهوية الرقمية الفاخرة • استكشف 30 عالمًا بصريًا بمعاينة حية فورية ✨',
    avatarUrl: siteConfig.heroPhone.avatarUrl || siteConfig.logoUrl || '/voltix-logo.png',
    coverUrl: siteConfig.heroPhone.coverUrl || '',
    isVerified: true,
    links: [
      {
        id: 'adm-hero-1',
        title: isRtl ? 'انضم إلى قناة واتساب الرسمية' : 'Join Official WhatsApp Channel',
        url: 'https://whatsapp.com/channel/voltix',
        description: isRtl
          ? 'أحدث التحديثات والقوالب الملكية الحصرية'
          : 'Latest royal updates & exclusive templates',
        icon: 'whatsapp',
        cardType: currentDefaultThemeObj.defaultCardType,
        isFeatured: true,
        badgeText: 'OFFICIAL CHANNEL',
      },
      {
        id: 'adm-hero-2',
        title: isRtl ? 'مجتمع ديسكورد وتيليجرام' : 'Discord & Telegram Hub',
        url: 'https://discord.gg/voltix',
        description: isRtl
          ? 'تواصل مباشر مع نخبة صناع المحتوى والمصممين'
          : 'Connect with elite creators & designers',
        icon: 'discord',
        cardType: 'glass',
        badgeText: 'VIP COMMUNITY',
      },
      {
        id: 'adm-hero-3',
        title: isRtl ? 'استوديو الهوية البصرية 2.5' : 'Spatial Identity Studio 2.5',
        url: '/dashboard',
        description: isRtl
          ? '30 ثيمًا ملكيًا • 12 بطاقة تفاعلية • 24 خطًا احترافيًا'
          : '30 Signature Themes • 12 Card Styles • 24 Fonts',
        icon: 'crown',
        cardType: currentDefaultThemeObj.defaultCardType,
        badgeText: 'PRO 2.5',
      },
    ],
    socialLinks: siteConfig.officialSocials
      .filter((s) => s.isActive)
      .slice(0, 6)
      .map((s) => ({
        id: s.id,
        platform: s.platform,
        url: s.url,
      })),
  };

  const navTabs: {
    id: ControlTabId;
    labelAr: string;
    labelEn: string;
    subtitleAr: string;
    subtitleEn: string;
    icon: React.ElementType;
    badge?: string | number;
  }[] = [
    {
      id: 'hero_brand',
      labelAr: 'بيانات وهوية الموقع الرئيسي',
      labelEn: 'Main Brand & Hero Data',
      subtitleAr: 'الشعار، النصوص، الفوتر، وSEO',
      subtitleEn: 'Logo, Hero Copy, Footer & SEO',
      icon: Crown,
    },
    {
      id: 'banners',
      labelAr: 'البنرات والإعلانات الترويجية',
      labelEn: 'Promotional Banners',
      subtitleAr: 'الأشرطة العلوية وبنرات الواجهة',
      subtitleEn: 'Top Bars & Hero Showcases',
      icon: Megaphone,
      badge: activeBannersCount,
    },
    {
      id: 'socials',
      labelAr: 'وسائل التواصل والقنوات الرسمية',
      labelEn: 'Official Socials & Channels',
      subtitleAr: '14 منصة رسمية وقوالب فورية',
      subtitleEn: '14 Official Platforms & Presets',
      icon: Share2,
      badge: activeSocialsCount,
    },
    {
      id: 'phone_faq',
      labelAr: 'الهاتف التفاعلي والأسئلة الشائعة',
      labelEn: 'Hero 3D Phone & FAQs',
      subtitleAr: 'معاينة الهاتف الحي وقاعدة المعرفة',
      subtitleEn: 'Live 3D Phone & FAQ Studio',
      icon: Smartphone,
      badge: siteConfig.faqs.length,
    },
    {
      id: 'themes',
      labelAr: `إدارة ومعاينة الثيمات (${AURA_THEMES.length})`,
      labelEn: `${AURA_THEMES.length} Themes Live Vault`,
      subtitleAr: 'معرض الثيمات الحي والثيم الافتراضي',
      subtitleEn: 'Live Theme Showroom & Default',
      icon: Palette,
      badge: activeThemesCount,
    },
    {
      id: 'users',
      labelAr: 'الأعضاء والإحصائيات',
      labelEn: 'Users & Telemetry',
      subtitleAr: 'إدارة المبدعين والتوثيق الملكي',
      subtitleEn: 'Creators Directory & Analytics',
      icon: Users,
      badge: metrics.totalUsers,
    },
    {
      id: 'reports',
      labelAr: 'البلاغات والأمان',
      labelEn: 'Security & Audit Trail',
      subtitleAr: 'مراجعة البلاغات وسجل العمليات',
      subtitleEn: 'Moderation & System Logs',
      icon: ShieldCheck,
      badge: openReportsCount,
    },
  ];

  // Strict Sovereign Access Guard: Never render Admin OS if unauthorized or still validating
  if (loading || !hasAdminRole) {
    return (
      <div className="h-screen w-screen bg-[#030307] text-white flex items-center justify-center relative overflow-hidden select-none">
        {/* Sovereign Ambient Space */}
        <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
          <div className="absolute inset-0 cyber-grid-floor opacity-30" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-amber-500/10 blur-[160px]" />
        </div>

        <div className="relative z-10 flex flex-col items-center gap-5 text-center px-6 max-w-md">
          <div className="relative">
            <div className="w-20 h-20 rounded-3xl bg-black/80 border border-amber-400/40 p-2 flex items-center justify-center shadow-[0_0_50px_rgba(212,175,55,0.25)]">
              <Crown className="w-10 h-10 text-amber-300 animate-pulse" />
            </div>
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-amber-400 border-2 border-black animate-ping" />
          </div>

          <div className="space-y-1.5">
            <h2 className="text-sm sm:text-base font-black text-amber-300 tracking-wider">
              {isRtl ? 'بوابة القيادة السيادية • VoltiX Admin OS' : 'VoltiX Sovereign Command OS'}
            </h2>
            <p className="text-xs text-zinc-400 font-medium">
              {isRtl
                ? 'جارٍ التحقق من صلاحيات مالك المنصة وفصل قنوات التحكم...'
                : 'Verifying Platform Owner credentials & isolating control channels...'}
            </p>
          </div>

          {isUnauthorized && (
            <div className="text-xs text-rose-300 bg-rose-500/10 border border-rose-500/30 px-4 py-2.5 rounded-2xl animate-pulse">
              {isRtl
                ? '⛔ غير مصرح بدخول لوحة الإدارة — جاري تحويلك إلى لوحة المستخدم...'
                : '⛔ Unauthorized access — Redirecting to Dashboard...'}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#030307] text-white relative flex flex-col xl:flex-row">
      {/* ====================================================================
          SOVEREIGN ARCHITECTURAL AMBIENT STAGE & GOLD / AURORA NEBULA
      ==================================================================== */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 cyber-grid-floor opacity-35" />
        <div className="absolute -top-56 left-1/4 w-[750px] h-[750px] rounded-full bg-amber-500/10 blur-[170px]" />
        <div className="absolute top-1/3 -right-48 w-[600px] h-[600px] rounded-full bg-purple-600/10 blur-[170px]" />
        <div className="absolute -bottom-48 left-1/3 w-[650px] h-[650px] rounded-full bg-emerald-500/8 blur-[170px]" />
      </div>

      {/* Floating Royal Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#FDE08D] via-[#D4AF37] to-[#AA771C] text-black font-black text-xs sm:text-sm shadow-[0_25px_60px_rgba(212,175,55,0.55)] border border-white/50 flex items-center gap-2.5 animate-bounce">
          <Sparkles className="w-4 h-4 shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      {/* ====================================================================
          INTERACTIVE COMMAND SPOTLIGHT MODAL (⌘K / Ctrl+K)
      ==================================================================== */}
      {isCommandPaletteOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
            onClick={() => setIsCommandPaletteOpen(false)}
          />
          <div className="relative z-10 w-full max-w-2xl rounded-3xl bg-[#080811] border border-amber-400/45 shadow-[0_30px_90px_rgba(0,0,0,0.95)] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Specular Hairline */}
            <span className="pointer-events-none absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-amber-300 to-transparent" />

            {/* Search Input Bar */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-white/10 bg-white/[0.02]">
              <Search className="w-5 h-5 text-amber-400 shrink-0" />
              <input
                type="text"
                value={commandQuery}
                onChange={(e) => setCommandQuery(e.target.value)}
                autoFocus
                placeholder={
                  isRtl
                    ? 'ابحث عن محطة تحكم، إعداد، أو أمر تنفيذي سريع... (ESC للإغلاق)'
                    : 'Search control station, setting, or quick command... (ESC to close)'
                }
                className="w-full bg-transparent text-sm text-white placeholder-zinc-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setIsCommandPaletteOpen(false)}
                className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Suggestions & Stations */}
            <div className="max-h-96 overflow-y-auto no-scrollbar p-3 space-y-1">
              <div className="text-[10px] font-black uppercase tracking-wider text-amber-400/80 px-2.5 py-1">
                {isRtl ? 'محطات التحكم التنفيذية' : 'Executive Control Stations'}
              </div>
              {navTabs
                .filter(
                  (tab) =>
                    !commandQuery ||
                    (isRtl ? tab.labelAr : tab.labelEn)
                      .toLowerCase()
                      .includes(commandQuery.toLowerCase()) ||
                    (isRtl ? tab.subtitleAr : tab.subtitleEn)
                      .toLowerCase()
                      .includes(commandQuery.toLowerCase())
                )
                .map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => {
                        setActiveTab(tab.id);
                        setIsCommandPaletteOpen(false);
                      }}
                      className="w-full flex items-center justify-between p-2.5 rounded-2xl hover:bg-amber-500/10 hover:border-amber-400/35 border border-transparent text-start transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-amber-400 group-hover:scale-105 group-hover:bg-amber-400/20 transition-all">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-black text-white group-hover:text-amber-300">
                            {isRtl ? tab.labelAr : tab.labelEn}
                          </div>
                          <div className="text-[10px] text-zinc-400">
                            {isRtl ? tab.subtitleAr : tab.subtitleEn}
                          </div>
                        </div>
                      </div>
                      <ChevronLeft className="w-4 h-4 text-zinc-500 rtl:rotate-0 rotate-180 group-hover:text-amber-400" />
                    </button>
                  );
                })}

              <div className="text-[10px] font-black uppercase tracking-wider text-amber-400/80 px-2.5 pt-3 pb-1">
                {isRtl ? 'إجراءات وأوامر فورية' : 'Quick Actions & Commands'}
              </div>

              {/* Maintenance Toggle */}
              <button
                type="button"
                onClick={() => {
                  const nextState = !siteConfig.maintenanceMode;
                  const updated = { ...siteConfig, maintenanceMode: nextState };
                  setSiteConfig(updated);
                  saveMainSiteConfig(
                    updated,
                    isRtl
                      ? nextState
                        ? '⚠️ تم تفعيل وضع الصيانة للموقع الرئيسي'
                        : '✅ تم إلغاء وضع الصيانة وإتاحة الموقع للعامة'
                      : nextState
                      ? '⚠️ Maintenance mode activated'
                      : '✅ Maintenance mode deactivated'
                  );
                  setIsCommandPaletteOpen(false);
                }}
                className="w-full flex items-center justify-between p-2.5 rounded-2xl hover:bg-white/5 text-start text-xs font-bold transition-all"
              >
                <div className="flex items-center gap-3">
                  <Power className="w-4 h-4 text-amber-400" />
                  <span>
                    {isRtl
                      ? siteConfig.maintenanceMode
                        ? 'إلغاء وضع الصيانة للموقع'
                        : 'تفعيل وضع الصيانة فوراً'
                      : siteConfig.maintenanceMode
                      ? 'Deactivate Maintenance Mode'
                      : 'Activate Maintenance Mode'}
                  </span>
                </div>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded font-black ${
                    siteConfig.maintenanceMode
                      ? 'bg-rose-500/20 text-rose-300'
                      : 'bg-emerald-500/20 text-emerald-300'
                  }`}
                >
                  {siteConfig.maintenanceMode ? 'ACTIVE' : 'OFF'}
                </span>
              </button>

              {/* Save & Publish */}
              <button
                type="button"
                onClick={() => {
                  saveMainSiteConfig();
                  setIsCommandPaletteOpen(false);
                }}
                className="w-full flex items-center justify-between p-2.5 rounded-2xl hover:bg-white/5 text-start text-xs font-bold transition-all"
              >
                <div className="flex items-center gap-3">
                  <Save className="w-4 h-4 text-emerald-400" />
                  <span>{isRtl ? 'حفظ ونشر التعديلات الآن' : 'Save & Publish All Changes'}</span>
                </div>
                <span className="text-[10px] font-mono text-zinc-500">⌘S / Ctrl+S</span>
              </button>

              {/* Live Preview */}
              <Link
                href="/"
                target="_blank"
                onClick={() => setIsCommandPaletteOpen(false)}
                className="w-full flex items-center justify-between p-2.5 rounded-2xl hover:bg-white/5 text-start text-xs font-bold transition-all"
              >
                <div className="flex items-center gap-3">
                  <ExternalLink className="w-4 h-4 text-cyan-400" />
                  <span>
                    {isRtl
                      ? 'معاينة الموقع الحي في نافذة جديدة'
                      : 'Preview Live Website in New Tab'}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-zinc-500">/</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          SOVEREIGN EXECUTIVE SIDEBAR RAIL (Desktop Fixed Rail / Mobile Slide-Over)
      ==================================================================== */}
      {/* Mobile Backdrop */}
      {mobileNavOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm xl:hidden"
          onClick={() => setMobileNavOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 z-40 w-72 2xl:w-80 bg-[#06060C]/95 backdrop-blur-2xl border-r border-amber-400/20 rtl:border-r-0 rtl:border-l flex flex-col transition-transform duration-300 xl:translate-x-0 ${
          isRtl
            ? mobileNavOpen
              ? 'translate-x-0 right-0'
              : 'translate-x-full right-0'
            : mobileNavOpen
            ? 'translate-x-0 left-0'
            : '-translate-x-full left-0'
        } xl:static xl:h-full xl:shrink-0`}
      >
        {/* Top Specular Hairline */}
        <span className="pointer-events-none absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-amber-300/80 to-transparent" />

        {/* Sidebar Header: Brand Crest & Core Pulse */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-400/25 via-black to-black border border-amber-400/50 p-1 flex items-center justify-center shrink-0 shadow-[0_0_24px_rgba(212,175,55,0.35)] group-hover:scale-105 transition-transform">
              <span className="pointer-events-none absolute inset-0 rounded-2xl bg-amber-400/20 blur-sm opacity-60 group-hover:opacity-100 transition-opacity" />
              <img
                src={siteConfig.logoUrl || '/voltix-logo.png'}
                alt="VoltiX Crest"
                className="relative z-10 w-full h-full object-contain"
              />
            </div>

            <div dir="ltr" className="text-left">
              <div className="flex items-center gap-1.5 leading-none">
                <span className="font-black text-lg gold-gradient-text tracking-tight">VoltiX</span>
                <span className="text-[9px] font-black uppercase tracking-widest text-amber-300 bg-amber-500/15 border border-amber-400/35 px-1.5 py-0.5 rounded">
                  OS 2.5
                </span>
              </div>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] text-zinc-400 font-semibold leading-none">
                  Sovereign Cockpit
                </span>
              </div>
            </div>
          </Link>

          {/* Close mobile nav button */}
          <button
            type="button"
            onClick={() => setMobileNavOpen(false)}
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white xl:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Spotlight Trigger Pill */}
        <div className="px-4 pt-3.5 pb-2">
          <button
            type="button"
            onClick={() => setIsCommandPaletteOpen(true)}
            className="w-full h-10 px-3.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 hover:border-amber-400/40 text-xs font-semibold text-zinc-400 hover:text-white flex items-center justify-between transition-all group shadow-inner"
          >
            <div className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
              <span>{isRtl ? 'أوامر النظام السريعة...' : 'Command Spotlight...'}</span>
            </div>
            <kbd className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-black/60 border border-white/15 text-amber-300/80">
              Ctrl+K
            </kbd>
          </button>
        </div>

        {/* Navigation Stations Hub */}
        <div className="flex-1 overflow-y-auto no-scrollbar px-3 py-2 space-y-1">
          <div className="px-2 py-1 text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500">
            {isRtl ? 'محطات التحكم التنفيذية' : 'Command Stations'}
          </div>

          {navTabs.map((tab, idx) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveTab(tab.id);
                  setMobileNavOpen(false);
                }}
                className={`w-full group relative text-start p-2.5 rounded-2xl flex items-center justify-between transition-all duration-200 border ${
                  active
                    ? 'bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-transparent border-amber-400/60 shadow-[0_4px_20px_rgba(212,175,55,0.2)]'
                    : 'bg-transparent hover:bg-white/[0.04] border-transparent hover:border-white/10'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
                      active
                        ? 'bg-gradient-to-br from-[#FDE08D] to-[#AA771C] text-black border-amber-300 shadow-[0_0_15px_rgba(212,175,55,0.4)]'
                        : 'bg-white/[0.04] text-zinc-400 border-white/10 group-hover:text-amber-300 group-hover:border-amber-400/35'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-mono text-amber-400/70 font-black">
                        0{idx + 1}
                      </span>
                      <span
                        className={`text-xs font-black truncate ${
                          active ? 'text-amber-200' : 'text-zinc-200 group-hover:text-white'
                        }`}
                      >
                        {isRtl ? tab.labelAr : tab.labelEn}
                      </span>
                    </div>
                    <p className="text-[10px] text-zinc-500 truncate mt-0.5">
                      {isRtl ? tab.subtitleAr : tab.subtitleEn}
                    </p>
                  </div>
                </div>

                {tab.badge !== undefined && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-black shrink-0 ${
                      active
                        ? 'bg-amber-400 text-black'
                        : 'bg-white/5 text-zinc-400 border border-white/10 group-hover:border-amber-400/30'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Sidebar Bottom Telemetry Gauge & Quick Actions */}
        <div className="p-3 border-t border-white/10 space-y-2 bg-[#040408]/80">
          {/* Quick Maintenance Toggle Card */}
          <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-between">
            <div className="min-w-0">
              <div className="text-[10px] font-black text-zinc-400 flex items-center gap-1.5">
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    siteConfig.maintenanceMode ? 'bg-rose-400 animate-pulse' : 'bg-emerald-400'
                  }`}
                />
                <span>{isRtl ? 'وضع الصيانة' : 'Maintenance'}</span>
              </div>
              <div className="text-[9px] text-zinc-500 truncate mt-0.5">
                {siteConfig.maintenanceMode
                  ? isRtl
                    ? '⚠️ الموقع مقفل للعامة'
                    : 'Public Access Locked'
                  : isRtl
                  ? '🟢 الموقع نشط 100%'
                  : 'Live & Operational'}
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                const nextState = !siteConfig.maintenanceMode;
                const updated = { ...siteConfig, maintenanceMode: nextState };
                setSiteConfig(updated);
                saveMainSiteConfig(
                  updated,
                  isRtl
                    ? nextState
                      ? '⚠️ تم تفعيل وضع الصيانة للموقع الرئيسي'
                      : '✅ تم إلغاء وضع الصيانة وإتاحة الموقع للعامة'
                    : nextState
                    ? '⚠️ Maintenance mode activated'
                    : '✅ Maintenance mode deactivated'
                );
              }}
              className={`h-7 px-2.5 rounded-lg text-[10px] font-black border transition-all ${
                siteConfig.maintenanceMode
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 hover:bg-rose-500/30'
                  : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20'
              }`}
            >
              {siteConfig.maintenanceMode ? (isRtl ? 'مفعّل' : 'Active') : (isRtl ? 'معطّل' : 'Off')}
            </button>
          </div>

          {/* Quick Bridge & Utilities Row */}
          <div className="flex items-center gap-1.5">
            <Link
              href="/dashboard"
              className="flex-1 h-9 px-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.09] border border-white/10 text-[11px] font-bold text-zinc-300 hover:text-white flex items-center justify-center gap-1.5 transition-all"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-amber-300 shrink-0 rtl:rotate-180" />
              <span>{isRtl ? 'استوديو صفحتي' : 'My Studio'}</span>
            </Link>

            <button
              type="button"
              onClick={toggleLocale}
              className="h-9 px-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.09] border border-white/10 text-xs font-black text-amber-300 hover:text-amber-200 transition-all shrink-0"
              title="Toggle Language"
            >
              {isRtl ? 'EN' : 'العربية'}
            </button>
          </div>
        </div>
      </aside>

      {/* ====================================================================
          SOVEREIGN EXECUTIVE CENTER STAGE (Main Viewport)
      ==================================================================== */}
      <div className="flex-1 min-w-0 flex flex-col h-full overflow-hidden relative z-10">
        {/* TOP FLIGHT HUD BAR - 100% PINNED & FIXED */}
        <header className="shrink-0 sticky top-0 z-30 border-b border-amber-400/20 bg-[#06060C]/90 backdrop-blur-2xl px-4 sm:px-8 h-16 sm:h-20 flex items-center justify-between gap-4 shadow-[0_12px_40px_rgba(0,0,0,0.85)]">
          {/* Top Specular Hairline */}
          <span className="pointer-events-none absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-amber-300/80 to-transparent" />

          {/* Left: Mobile Nav Toggle + Active Station Breadcrumbs */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileNavOpen(true)}
              className="p-2 rounded-xl bg-white/5 border border-white/10 text-zinc-300 hover:text-white xl:hidden shrink-0"
              aria-label="Open Navigation"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 truncate">
              <span className="text-[10px] font-mono font-black uppercase text-amber-400 bg-amber-500/10 border border-amber-400/30 px-2 py-0.5 rounded-full hidden sm:inline-flex items-center gap-1">
                <Radio className="w-3 h-3 animate-pulse text-amber-400" />
                <span>COMMAND DECK</span>
              </span>
              <span className="text-zinc-600 hidden sm:inline">/</span>
              <h1 className="text-sm sm:text-base font-black text-white truncate flex items-center gap-2">
                <span className="gold-gradient-text">
                  {isRtl
                    ? navTabs.find((t) => t.id === activeTab)?.labelAr
                    : navTabs.find((t) => t.id === activeTab)?.labelEn}
                </span>
              </h1>
            </div>
          </div>

          {/* Right: Telemetry Pulse + Action Cluster */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Live Sync Status Pill */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-xs font-extrabold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>{isRtl ? 'متصل مباشر' : 'Live Synced'}</span>
            </div>

            {/* Reset Defaults */}
            <button
              type="button"
              onClick={resetSiteConfigToDefaults}
              title={isRtl ? 'استعادة الإعدادات الافتراضية' : 'Reset Defaults'}
              className="h-10 w-10 rounded-xl bg-white/[0.04] hover:bg-white/[0.09] border border-white/10 hover:border-amber-400/40 text-zinc-400 hover:text-amber-300 flex items-center justify-center shrink-0 transition-all"
            >
              <RotateCcw className="w-4 h-4 shrink-0" />
            </button>

            {/* Live Website Preview */}
            <Link
              href="/"
              target="_blank"
              className="h-10 px-3.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-400/35 text-amber-300 text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap shadow-inner"
            >
              <ExternalLink className="w-4 h-4 shrink-0" />
              <span className="hidden md:inline">{isRtl ? 'معاينة الموقع' : 'Live Site'}</span>
            </Link>

            {/* Primary Save Button */}
            <button
              type="button"
              disabled={saving}
              onClick={() => saveMainSiteConfig()}
              className="h-10 px-5 rounded-xl bg-gradient-to-r from-[#FDE08D] via-[#D4AF37] to-[#AA771C] text-black font-black text-xs sm:text-sm flex items-center gap-2 shadow-[0_6px_25px_rgba(212,175,55,0.45)] hover:brightness-110 active:scale-[0.99] transition-all whitespace-nowrap disabled:opacity-50"
            >
              <Save className="w-4 h-4 shrink-0" />
              <span>
                {saving
                  ? isRtl
                    ? 'جاري النشر...'
                    : 'Publishing...'
                  : isRtl
                  ? 'حفظ ونشر التعديلات'
                  : 'Save & Publish'}
              </span>
            </button>
          </div>
        </header>

        {/* ====================================================================
            MAIN WORKSPACE WORKSTATION - SCROLLABLE STAGE WITH PINNED PREVIEWS
        ==================================================================== */}
        <main className="flex-1 overflow-y-auto no-scrollbar w-full px-4 sm:px-8 py-6 space-y-6">
          {/* ====================================================================
              EXECUTIVE TELEMETRY & QUICK-JUMP BENTO RIBBON (6 ROYAL CARDS)
          ==================================================================== */}
          <section className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3.5">
          {[
            {
              tabId: 'hero_brand' as ControlTabId,
              titleAr: 'هوية المنصة والحالة',
              titleEn: 'Brand & System Pulse',
              value: siteConfig.siteName || 'VoltiX',
              subAr: siteConfig.maintenanceMode ? 'وضع الصيانة مفعّل' : 'متصل ويعمل بكفاءة 100%',
              subEn: siteConfig.maintenanceMode ? 'Maintenance Mode' : '100% Operational',
              icon: Crown,
              accent: 'from-amber-400/25 via-amber-500/10 to-transparent',
              iconColor: 'text-amber-300 border-amber-400/40 bg-amber-500/15',
            },
            {
              tabId: 'banners' as ControlTabId,
              titleAr: 'الحملات والبنرات النشطة',
              titleEn: 'Active Site Banners',
              value: `${activeBannersCount} / ${siteConfig.banners.length}`,
              subAr: 'شريط علوي وبنرات واجهة',
              subEn: 'Top Bars & Hero Banners',
              icon: Megaphone,
              accent: 'from-amber-500/20 via-orange-500/10 to-transparent',
              iconColor: 'text-amber-300 border-amber-400/40 bg-amber-500/15',
            },
            {
              tabId: 'socials' as ControlTabId,
              titleAr: 'القنوات والمنصات الرسمية',
              titleEn: 'Official Social Channels',
              value: `${activeSocialsCount} ${isRtl ? 'منصة' : 'Active'}`,
              subAr: 'أيقونات رسمية ثلاثية الأبعاد',
              subEn: 'Official 3D Brand Badges',
              icon: Share2,
              accent: 'from-emerald-500/20 via-teal-500/10 to-transparent',
              iconColor: 'text-emerald-300 border-emerald-400/40 bg-emerald-500/15',
            },
            {
              tabId: 'themes' as ControlTabId,
              titleAr: 'خزينة الثيمات الملكية',
              titleEn: 'Signature Themes Vault',
              value: `${activeThemesCount} / ${AURA_THEMES.length}`,
              subAr: `${isRtl ? 'الافتراضي:' : 'Default:'} ${
                isRtl ? currentDefaultThemeObj.nameAr : currentDefaultThemeObj.nameEn
              }`,
              subEn: `Default: ${currentDefaultThemeObj.nameEn}`,
              icon: Palette,
              accent: 'from-purple-500/20 via-fuchsia-500/10 to-transparent',
              iconColor: 'text-purple-300 border-purple-400/40 bg-purple-500/15',
            },
            {
              tabId: 'users' as ControlTabId,
              titleAr: 'إجمالي الزيارات والنقرات',
              titleEn: 'Traffic & Engagement',
              value: metrics.totalViews.toLocaleString(),
              subAr: `${metrics.totalClicks.toLocaleString()} نقرة • ${metrics.totalUsers} عضو`,
              subEn: `${metrics.totalClicks.toLocaleString()} clicks • ${metrics.totalUsers} users`,
              icon: Activity,
              accent: 'from-cyan-500/20 via-blue-500/10 to-transparent',
              iconColor: 'text-cyan-300 border-cyan-400/40 bg-cyan-500/15',
            },
            {
              tabId: 'reports' as ControlTabId,
              titleAr: 'درع الأمان والبلاغات',
              titleEn: 'Security & Reports',
              value: openReportsCount === 0 ? (isRtl ? 'آمن 100%' : '100% Secure') : `${openReportsCount}`,
              subAr:
                openReportsCount === 0
                  ? 'لا توجد بلاغات معلقة'
                  : `${openReportsCount} بلاغ بانتظار المراجعة`,
              subEn: openReportsCount === 0 ? 'Zero open reports' : `${openReportsCount} open reports`,
              icon: ShieldCheck,
              accent: 'from-emerald-500/20 via-amber-500/10 to-transparent',
              iconColor: 'text-emerald-300 border-emerald-400/40 bg-emerald-500/15',
            },
          ].map((card) => {
            const Icon = card.icon;
            const isCurrent = activeTab === card.tabId;
            return (
              <button
                key={card.tabId}
                type="button"
                onClick={() => setActiveTab(card.tabId)}
                className={`group relative text-start rounded-[24px] p-4 transition-all duration-300 overflow-hidden border ${
                  isCurrent
                    ? 'bg-gradient-to-br from-[#151520] via-[#0B0B12] to-[#06060A] border-amber-400/65 shadow-[0_15px_40px_-10px_rgba(212,175,55,0.35)] scale-[1.01]'
                    : 'bg-[#09090F]/90 hover:bg-[#0E0E17] border-white/10 hover:border-amber-400/35'
                }`}
              >
                <div
                  className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${card.accent} opacity-50 group-hover:opacity-90 transition-opacity`}
                />
                <div className="relative z-10 flex items-center justify-between gap-2 mb-2.5">
                  <span className="text-[11px] font-extrabold text-zinc-300 truncate">
                    {isRtl ? card.titleAr : card.titleEn}
                  </span>
                  <span
                    className={`w-8 h-8 rounded-xl border flex items-center justify-center shrink-0 ${card.iconColor}`}
                  >
                    <Icon className="w-4 h-4" />
                  </span>
                </div>
                <div className="relative z-10 text-lg sm:text-xl font-black text-white truncate">
                  {card.value}
                </div>
                <div className="relative z-10 text-[10px] font-bold text-zinc-400 truncate mt-0.5">
                  {isRtl ? card.subAr : card.subEn}
                </div>
              </button>
            );
          })}
        </section>

        {/* ====================================================================
            TAB 1: MAIN BRAND IDENTITY, HERO CONTENT, CONTACT & SEO
        ==================================================================== */}
        {activeTab === 'hero_brand' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left/Main 7 Cols: Architectural Brand & Hero Configuration Cards */}
            <div className="lg:col-span-7 min-w-0 space-y-6">
              {/* Card 01: Brand Identity & Logo Studio */}
              <div className="relative rounded-[30px] vip-black-card border border-amber-400/30 p-6 sm:p-7 space-y-5 overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.65)]">
                <span className="pointer-events-none absolute inset-x-12 top-0 h-[1px] bg-gradient-to-r from-transparent via-amber-400/60 to-transparent" />

                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400/25 to-amber-600/10 border border-amber-400/45 flex items-center justify-center text-amber-300 font-black text-xs shadow-inner">
                      01
                    </div>
                    <div>
                      <h2 className="text-base sm:text-lg font-black text-white">
                        {isRtl
                          ? 'هوية الموقع الرئيسي والشعار الرسمي (Brand & Logo Studio)'
                          : 'Main Website Brand Identity & Official Logo'}
                      </h2>
                      <p className="text-xs text-zinc-400">
                        {isRtl
                          ? 'الاسم، الشعار الرسمي بجميع الصيغ، وشارات الإصدار في الشريط العلوي والفوتر'
                          : 'Site name, universal logo image upload, and version badges'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-extrabold text-amber-300 mb-2">
                      {isRtl ? 'اسم الموقع الرئيسي (Site Name)' : 'Main Site Name'}
                    </label>
                    <input
                      type="text"
                      value={siteConfig.siteName}
                      onChange={(e) =>
                        setSiteConfig({
                          ...siteConfig,
                          siteName: e.target.value,
                          logoText: e.target.value,
                        })
                      }
                      placeholder="VoltiX"
                      className="w-full px-4 py-3 rounded-2xl bg-black/70 border border-white/15 focus:border-amber-400 text-sm font-black text-white focus:outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-zinc-300 mb-2">
                      {isRtl ? 'شارة الإصدار (Header Badge)' : 'Header Version Badge'}
                    </label>
                    <input
                      type="text"
                      dir="ltr"
                      value={siteConfig.logoBadge}
                      onChange={(e) => setSiteConfig({ ...siteConfig, logoBadge: e.target.value })}
                      placeholder="PRO 2.5"
                      className="w-full px-4 py-3 rounded-2xl bg-black/70 border border-white/15 focus:border-amber-400 text-sm font-bold text-amber-300 focus:outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-zinc-300 mb-2">
                      {isRtl ? 'النص الفرعي أسفل الشعار (Subtext)' : 'Logo Subtext'}
                    </label>
                    <input
                      type="text"
                      dir="ltr"
                      value={siteConfig.logoSubtext}
                      onChange={(e) =>
                        setSiteConfig({ ...siteConfig, logoSubtext: e.target.value })
                      }
                      placeholder="SPATIAL IDENTITY OS"
                      className="w-full px-4 py-3 rounded-2xl bg-black/70 border border-white/15 focus:border-amber-400 text-sm font-bold text-zinc-200 focus:outline-none transition-colors"
                    />
                  </div>

                  <div className="sm:col-span-3 pt-1">
                    <UniversalImageUploader
                      label={
                        isRtl
                          ? 'شعار الموقع الرسمي (رفع صورة مباشرة بجميع الصيغ أو رابط URL)'
                          : 'Official Website Logo (Upload Any Image Format or URL)'
                      }
                      value={siteConfig.logoUrl}
                      onChange={(newLogoUrl) =>
                        setSiteConfig({ ...siteConfig, logoUrl: newLogoUrl })
                      }
                      defaultUrl="/voltix-logo.png"
                      placeholder="/voltix-logo.png"
                      isRtl={isRtl}
                      helperText={
                        isRtl
                          ? 'يقبل جميع صيغ الصور (PNG الشفافة، SVG، WebP، GIF المتحركة، JPG، ICO، AVIF، BMP) مع معاينة حية فورية'
                          : 'Accepts all image formats (Transparent PNG, SVG, WebP, Animated GIF, JPG, ICO, AVIF, BMP) with instant live preview'
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Card 02: Hero Section Headlines & Call-to-Action */}
              <div className="relative rounded-[30px] vip-black-card border border-white/15 hover:border-amber-400/30 p-6 sm:p-7 space-y-5 transition-colors shadow-[0_20px_60px_rgba(0,0,0,0.65)]">
                <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400/25 to-amber-600/10 border border-amber-400/45 flex items-center justify-center text-amber-300 font-black text-xs">
                    02
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-black text-white">
                      {isRtl
                        ? 'نصوص وعناوين الواجهة الرئيسية (Hero Section Architecture)'
                        : 'Main Hero Section Headlines & Call-to-Action'}
                    </h2>
                    <p className="text-xs text-zinc-400">
                      {isRtl
                        ? 'تحكم في العناوين الترحيبية باللغتين العربية والإنجليزية ونطاق حجز الرابط المميز'
                        : 'Configure bilingual Arabic & English hero headlines, descriptions, and handle claim prefix'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-extrabold text-amber-300 mb-2">
                      {isRtl ? 'شارة الترحيب العلوية (عربي)' : 'Hero Top Badge (Arabic)'}
                    </label>
                    <input
                      type="text"
                      value={siteConfig.heroBadgeAr}
                      onChange={(e) =>
                        setSiteConfig({ ...siteConfig, heroBadgeAr: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-2xl bg-black/70 border border-white/15 focus:border-amber-400 text-sm focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-zinc-300 mb-2">
                      {isRtl ? 'شارة الترحيب العلوية (إنجليزي)' : 'Hero Top Badge (English)'}
                    </label>
                    <input
                      type="text"
                      dir="ltr"
                      value={siteConfig.heroBadgeEn}
                      onChange={(e) =>
                        setSiteConfig({ ...siteConfig, heroBadgeEn: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-2xl bg-black/70 border border-white/15 focus:border-amber-400 text-sm focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-amber-300 mb-2">
                      {isRtl ? 'العنوان الرئيسي — السطر الأول (عربي)' : 'Hero Title Line 1 (Ar)'}
                    </label>
                    <input
                      type="text"
                      value={siteConfig.heroTitle1Ar}
                      onChange={(e) =>
                        setSiteConfig({ ...siteConfig, heroTitle1Ar: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-2xl bg-black/70 border border-white/15 focus:border-amber-400 text-sm font-bold focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-zinc-300 mb-2">
                      {isRtl ? 'العنوان الرئيسي — السطر الأول (إنجليزي)' : 'Hero Title Line 1 (En)'}
                    </label>
                    <input
                      type="text"
                      dir="ltr"
                      value={siteConfig.heroTitle1En}
                      onChange={(e) =>
                        setSiteConfig({ ...siteConfig, heroTitle1En: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-2xl bg-black/70 border border-white/15 focus:border-amber-400 text-sm font-bold focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-amber-300 mb-2">
                      {isRtl
                        ? 'العنوان المتدرج — السطر الثاني (عربي)'
                        : 'Hero Gradient Title Line 2 (Ar)'}
                    </label>
                    <input
                      type="text"
                      value={siteConfig.heroTitle2Ar}
                      onChange={(e) =>
                        setSiteConfig({ ...siteConfig, heroTitle2Ar: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-2xl bg-black/70 border border-white/15 focus:border-amber-400 text-sm font-bold focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-zinc-300 mb-2">
                      {isRtl
                        ? 'العنوان المتدرج — السطر الثاني (إنجليزي)'
                        : 'Hero Gradient Title Line 2 (En)'}
                    </label>
                    <input
                      type="text"
                      dir="ltr"
                      value={siteConfig.heroTitle2En}
                      onChange={(e) =>
                        setSiteConfig({ ...siteConfig, heroTitle2En: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-2xl bg-black/70 border border-white/15 focus:border-amber-400 text-sm font-bold focus:outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-extrabold text-amber-300 mb-2">
                      {isRtl
                        ? 'الوصف التفصيلي تحت العنوان الرئيسي (عربي)'
                        : 'Hero Subtitle Description (Arabic)'}
                    </label>
                    <textarea
                      rows={3}
                      value={siteConfig.heroSubtitleAr}
                      onChange={(e) =>
                        setSiteConfig({ ...siteConfig, heroSubtitleAr: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-2xl bg-black/70 border border-white/15 focus:border-amber-400 text-sm leading-relaxed focus:outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-extrabold text-zinc-300 mb-2">
                      {isRtl
                        ? 'الوصف التفصيلي تحت العنوان الرئيسي (إنجليزي)'
                        : 'Hero Subtitle Description (English)'}
                    </label>
                    <textarea
                      rows={2}
                      dir="ltr"
                      value={siteConfig.heroSubtitleEn}
                      onChange={(e) =>
                        setSiteConfig({ ...siteConfig, heroSubtitleEn: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-2xl bg-black/70 border border-white/15 focus:border-amber-400 text-sm leading-relaxed focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-zinc-300 mb-2">
                      {isRtl ? 'نص زر التسجيل الرئيسي (عربي)' : 'Primary CTA Button (Ar)'}
                    </label>
                    <input
                      type="text"
                      value={siteConfig.ctaPrimaryAr}
                      onChange={(e) =>
                        setSiteConfig({ ...siteConfig, ctaPrimaryAr: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-2xl bg-black/70 border border-white/15 focus:border-amber-400 text-sm font-bold focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-zinc-300 mb-2">
                      {isRtl ? 'نطاق حجز الرابط (Domain Prefix)' : 'Claim Handle Domain Prefix'}
                    </label>
                    <input
                      type="text"
                      dir="ltr"
                      value={siteConfig.claimDomainPrefix}
                      onChange={(e) =>
                        setSiteConfig({ ...siteConfig, claimDomainPrefix: e.target.value })
                      }
                      placeholder="voltix.io/@"
                      className="w-full px-4 py-3 rounded-2xl bg-black/70 border border-white/15 focus:border-amber-400 text-sm font-mono text-amber-300 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Card 03: Contact Info, Footer, SEO & Sovereign System Switches */}
              <div className="relative rounded-[30px] vip-black-card border border-white/15 hover:border-amber-400/30 p-6 sm:p-7 space-y-5 transition-colors shadow-[0_20px_60px_rgba(0,0,0,0.65)]">
                <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400/25 to-amber-600/10 border border-amber-400/45 flex items-center justify-center text-amber-300 font-black text-xs">
                    03
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-black text-white">
                      {isRtl
                        ? 'بيانات التواصل، الفوتر، محركات البحث، وأقفال النظام (SEO & System Locks)'
                        : 'Contact Details, Footer, Global SEO & System Controls'}
                    </h2>
                    <p className="text-xs text-zinc-400">
                      {isRtl
                        ? 'إعدادات الظهور في Google، قنوات الدعم المباشر، والتحكم في فتح التسجيل أو الصيانة'
                        : 'Google search snippet metadata, official support channels, and registration locks'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-extrabold text-zinc-300 mb-2">
                      {isRtl ? 'البريد الرسمي للموقع' : 'Official Contact Email'}
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-amber-400 absolute top-3.5 left-3.5 pointer-events-none" />
                      <input
                        type="email"
                        dir="ltr"
                        value={siteConfig.contactEmail}
                        onChange={(e) =>
                          setSiteConfig({ ...siteConfig, contactEmail: e.target.value })
                        }
                        className="w-full pl-10 pr-4 py-3 rounded-2xl bg-black/70 border border-white/15 focus:border-amber-400 text-xs font-mono focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-zinc-300 mb-2">
                      {isRtl ? 'رقم الهاتف / واتساب الرسمي' : 'Contact Phone / WhatsApp'}
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-emerald-400 absolute top-3.5 left-3.5 pointer-events-none" />
                      <input
                        type="text"
                        dir="ltr"
                        value={siteConfig.contactPhone}
                        onChange={(e) =>
                          setSiteConfig({ ...siteConfig, contactPhone: e.target.value })
                        }
                        className="w-full pl-10 pr-4 py-3 rounded-2xl bg-black/70 border border-white/15 focus:border-amber-400 text-xs font-mono focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-zinc-300 mb-2">
                      {isRtl ? 'رابط الدعم المباشر (واتساب/قناة)' : 'Direct Support URL'}
                    </label>
                    <input
                      type="text"
                      dir="ltr"
                      value={siteConfig.whatsappSupportUrl}
                      onChange={(e) =>
                        setSiteConfig({ ...siteConfig, whatsappSupportUrl: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-2xl bg-black/70 border border-white/15 focus:border-amber-400 text-xs font-mono focus:outline-none"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block text-xs font-extrabold text-zinc-300 mb-2">
                      {isRtl ? 'نص حقوق الملكية في الفوتر (عربي)' : 'Footer Copyright Text (Ar)'}
                    </label>
                    <input
                      type="text"
                      value={siteConfig.copyrightAr}
                      onChange={(e) =>
                        setSiteConfig({ ...siteConfig, copyrightAr: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-2xl bg-black/70 border border-white/15 focus:border-amber-400 text-sm focus:outline-none"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block text-xs font-extrabold text-amber-300 mb-2">
                      {isRtl ? 'عنوان الموقع في محركات البحث (SEO Title)' : 'Global SEO Title'}
                    </label>
                    <input
                      type="text"
                      value={siteConfig.globalSeoTitle}
                      onChange={(e) =>
                        setSiteConfig({ ...siteConfig, globalSeoTitle: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-2xl bg-black/70 border border-white/15 focus:border-amber-400 text-sm font-bold focus:outline-none"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block text-xs font-extrabold text-zinc-300 mb-2">
                      {isRtl ? 'وصف الموقع في محركات البحث (SEO Description)' : 'Global SEO Description'}
                    </label>
                    <textarea
                      rows={2}
                      value={siteConfig.globalSeoDescription}
                      onChange={(e) =>
                        setSiteConfig({ ...siteConfig, globalSeoDescription: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-2xl bg-black/70 border border-white/15 focus:border-amber-400 text-sm focus:outline-none"
                    />
                  </div>
                </div>

                {/* Luxury Tactile System Switches */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <button
                    type="button"
                    onClick={() =>
                      setSiteConfig({
                        ...siteConfig,
                        allowRegistrations: !siteConfig.allowRegistrations,
                      })
                    }
                    className={`p-4 rounded-2xl border text-start flex items-center justify-between gap-3 transition-all ${
                      siteConfig.allowRegistrations
                        ? 'bg-emerald-500/10 border-emerald-500/35'
                        : 'bg-black/60 border-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          siteConfig.allowRegistrations
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'bg-zinc-800 text-zinc-400'
                        }`}
                      >
                        {siteConfig.allowRegistrations ? (
                          <Unlock className="w-5 h-5" />
                        ) : (
                          <Lock className="w-5 h-5" />
                        )}
                      </span>
                      <div>
                        <div className="text-xs font-black text-white">
                          {isRtl ? 'السماح بتسجيل حسابات جديدة' : 'Allow New Registrations'}
                        </div>
                        <div className="text-[11px] text-zinc-400">
                          {siteConfig.allowRegistrations
                            ? isRtl
                              ? 'مفتوح للزوار في صفحة /register'
                              : 'Open on /register'
                            : isRtl
                            ? 'مغلق حاليًا أمام الزوار'
                            : 'Closed to new users'}
                        </div>
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-black ${
                        siteConfig.allowRegistrations
                          ? 'bg-emerald-400 text-black'
                          : 'bg-zinc-800 text-zinc-400'
                      }`}
                    >
                      {siteConfig.allowRegistrations
                        ? isRtl
                          ? 'مفعّل'
                          : 'ON'
                        : isRtl
                        ? 'متوقف'
                        : 'OFF'}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setSiteConfig({
                        ...siteConfig,
                        maintenanceMode: !siteConfig.maintenanceMode,
                      })
                    }
                    className={`p-4 rounded-2xl border text-start flex items-center justify-between gap-3 transition-all ${
                      siteConfig.maintenanceMode
                        ? 'bg-rose-500/15 border-rose-500/40'
                        : 'bg-black/60 border-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          siteConfig.maintenanceMode
                            ? 'bg-rose-500/25 text-rose-300'
                            : 'bg-zinc-800 text-zinc-400'
                        }`}
                      >
                        <Power className="w-5 h-5" />
                      </span>
                      <div>
                        <div className="text-xs font-black text-white">
                          {isRtl ? 'وضع الصيانة العام (Maintenance)' : 'Maintenance Mode'}
                        </div>
                        <div className="text-[11px] text-zinc-400">
                          {siteConfig.maintenanceMode
                            ? isRtl
                              ? 'يظهر تنبيه صيانة لزوار المنصة'
                              : 'Showing maintenance banner'
                            : isRtl
                            ? 'الموقع متاح للجميع بشكل طبيعي'
                            : 'Normal public operation'}
                        </div>
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-black ${
                        siteConfig.maintenanceMode
                          ? 'bg-rose-500 text-white'
                          : 'bg-zinc-800 text-zinc-400'
                      }`}
                    >
                      {siteConfig.maintenanceMode
                        ? isRtl
                          ? 'نشط'
                          : 'ACTIVE'
                        : isRtl
                        ? 'مغلق'
                        : 'OFF'}
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right 5 Cols: 100% PINNED & FIXED MULTI-MODE LIVE INSPECTOR (WEBSITE / 3D PHONE / GOOGLE SEO) */}
            <div className="lg:col-span-5 lg:sticky lg:top-2 self-start h-fit space-y-4">
              <div className="rounded-[32px] vip-black-card border border-amber-400/45 p-5 sm:p-6 space-y-4 shadow-[0_30px_90px_rgba(0,0,0,0.9)]">
                {/* Inspector Header + Mode Switcher */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs font-black text-amber-300">
                      {isRtl ? 'المعاينة الحية الفورية للموقع' : 'Live Instant Site Inspector'}
                    </span>
                  </div>

                  {/* 3-Mode Switcher: Website Hero / 3D Phone / Google SEO */}
                  <div className="flex items-center gap-1 bg-black/70 p-1 rounded-xl border border-white/10">
                    {[
                      {
                        id: 'website' as const,
                        labelAr: 'واجهة الموقع',
                        labelEn: 'Hero UI',
                        icon: Monitor,
                      },
                      {
                        id: 'phone' as const,
                        labelAr: 'الهاتف الحي',
                        labelEn: '3D Phone',
                        icon: Smartphone,
                      },
                      {
                        id: 'seo' as const,
                        labelAr: 'محرك Google',
                        labelEn: 'SEO Card',
                        icon: Globe,
                      },
                    ].map((m) => {
                      const MIcon = m.icon;
                      const active = brandPreviewMode === m.id;
                      return (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => setBrandPreviewMode(m.id)}
                          className={`px-2.5 py-1.5 rounded-lg text-[11px] font-extrabold flex items-center gap-1.5 transition-all ${
                            active
                              ? 'bg-gradient-to-r from-[#FDE08D] via-[#D4AF37] to-[#AA771C] text-black shadow-md'
                              : 'text-zinc-400 hover:text-white'
                          }`}
                        >
                          <MIcon className="w-3.5 h-3.5" />
                          <span>{isRtl ? m.labelAr : m.labelEn}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* MODE 1: LIVE MAIN WEBSITE HERO & NAVBAR PREVIEW */}
                {brandPreviewMode === 'website' && (
                  <div className="space-y-4">
                    {/* Browser Chrome Bar */}
                    <div className="rounded-2xl bg-[#07070C] border border-white/15 overflow-hidden">
                      <div className="px-3.5 py-2 bg-black/80 border-b border-white/10 flex items-center justify-between" dir="ltr">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                          <span className="w-2.5 h-2.5 rounded-full bg-amber-400/80" />
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/80" />
                        </div>
                        <div className="px-3 py-0.5 rounded-full bg-white/[0.05] border border-white/10 text-[10px] font-mono text-amber-300 flex items-center gap-1.5">
                          <Lock className="w-2.5 h-2.5 text-emerald-400" />
                          <span>https://voltix.io</span>
                        </div>
                        <span className="text-[9px] font-mono text-zinc-500">LIVE</span>
                      </div>

                      <div className="p-4 space-y-4 bg-gradient-to-b from-[#06060B] via-[#090912] to-[#050508]">
                        {/* Mini Top Command Dock Preview */}
                        <div className="p-3 rounded-2xl bg-black/85 border border-amber-400/35 flex items-center justify-between gap-2 shadow-lg">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-9 h-9 rounded-xl bg-black border border-amber-400/50 p-1 flex items-center justify-center overflow-hidden shrink-0">
                              <img
                                src={siteConfig.logoUrl || '/voltix-logo.png'}
                                alt="Logo"
                                className="w-full h-full object-contain"
                              />
                            </div>
                            <div dir="ltr" className="text-left min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-black gold-gradient-text truncate">
                                  {siteConfig.siteName || 'VoltiX'}
                                </span>
                                <span className="px-1.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/40 text-[8px] font-black text-amber-300">
                                  {siteConfig.logoBadge}
                                </span>
                              </div>
                              <span className="text-[7px] text-zinc-400 tracking-widest block truncate">
                                {siteConfig.logoSubtext}
                              </span>
                            </div>
                          </div>

                          <span className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#FDE08D] via-[#D4AF37] to-[#AA771C] text-black font-black text-[10px] shrink-0">
                            {isRtl ? 'إنشاء حساب' : 'Sign Up'}
                          </span>
                        </div>

                        {/* Mini Hero Stage Preview */}
                        <div className="p-5 rounded-2xl bg-gradient-to-br from-black via-zinc-950 to-amber-950/20 border border-amber-500/25 space-y-3.5 text-center sm:text-start">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/35 text-[10px] font-extrabold text-amber-300">
                            <Crown className="w-3 h-3" />
                            {isRtl ? siteConfig.heroBadgeAr : siteConfig.heroBadgeEn}
                          </span>

                          <div className="space-y-1">
                            <div className="text-lg sm:text-xl font-black text-white leading-snug">
                              {isRtl ? siteConfig.heroTitle1Ar : siteConfig.heroTitle1En}
                            </div>
                            <div className="text-lg sm:text-xl font-black aurora-gradient-text leading-snug">
                              {isRtl ? siteConfig.heroTitle2Ar : siteConfig.heroTitle2En}
                            </div>
                          </div>

                          <p className="text-xs text-zinc-300/90 leading-relaxed">
                            {isRtl ? siteConfig.heroSubtitleAr : siteConfig.heroSubtitleEn}
                          </p>

                          <div className="pt-1 flex flex-wrap items-center gap-2">
                            <span
                              dir="ltr"
                              className="px-3 py-2 rounded-xl bg-black/80 border border-white/15 text-[11px] font-mono text-amber-200"
                            >
                              {siteConfig.claimDomainPrefix}yourname
                            </span>
                            <span className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#FDE08D] via-[#D4AF37] to-[#AA771C] text-black font-black text-xs shadow-md">
                              {isRtl ? siteConfig.ctaPrimaryAr : siteConfig.ctaPrimaryEn}
                            </span>
                          </div>

                          {/* Mini Active Official Social Badges Row */}
                          <div className="pt-2 border-t border-white/10 flex items-center gap-2 overflow-x-auto no-scrollbar">
                            {siteConfig.officialSocials
                              .filter((s) => s.isActive)
                              .slice(0, 7)
                              .map((soc) => (
                                <OfficialSocialBadge
                                  key={soc.id}
                                  platformId={soc.platform}
                                  size="sm"
                                  variant="gradient"
                                />
                              ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* MODE 2: LIVE 3D HERO PHONE INSPECTOR */}
                {brandPreviewMode === 'phone' && (
                  <div className="py-1">
                    <div className="relative mx-auto w-full max-w-[330px] h-[510px] rounded-[44px] p-2.5 bg-gradient-to-b from-zinc-600 via-zinc-900 to-black border-2 border-amber-400/45 shadow-[0_20px_70px_-10px_rgba(212,175,55,0.35)]">
                      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 w-24 h-5 bg-black rounded-full border border-white/15 flex items-center justify-between px-2.5">
                        <span className="text-[7px] font-black tracking-widest text-amber-400">
                          VOLTIX
                        </span>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      </div>
                      <div className="w-full h-full rounded-[34px] overflow-y-auto overflow-x-hidden no-scrollbar bg-[#040407]">
                        <ProfileRenderer
                          profile={sharedHeroPhoneProfile}
                          theme={currentDefaultThemeObj}
                          effects={DEFAULT_EFFECTS_CONFIG}
                          isPreview={true}
                          compactPhone={true}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* MODE 3: LIVE GOOGLE SEARCH & SOCIAL SHARE CARD PREVIEW */}
                {brandPreviewMode === 'seo' && (
                  <div className="space-y-4">
                    {/* Google Search Snippet Card */}
                    <div className="p-4 rounded-2xl bg-[#101218] border border-white/15 space-y-2">
                      <div className="text-[10px] font-black uppercase tracking-widest text-amber-300">
                        {isRtl ? 'معاينة نتيجة البحث في Google' : 'Google Search Snippet Preview'}
                      </div>
                      <div className="flex items-center gap-2" dir="ltr">
                        <div className="w-6 h-6 rounded-full bg-black border border-white/20 p-1 flex items-center justify-center">
                          <img
                            src={siteConfig.logoUrl || '/voltix-logo.png'}
                            alt="Icon"
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div className="text-[11px] text-zinc-300 font-mono">
                          https://voltix.io
                        </div>
                      </div>
                      <div className="text-sm font-bold text-[#8AB4F8] hover:underline cursor-pointer">
                        {siteConfig.globalSeoTitle || siteConfig.siteName}
                      </div>
                      <p className="text-xs text-zinc-400 leading-relaxed line-clamp-3">
                        {siteConfig.globalSeoDescription}
                      </p>
                    </div>

                    {/* Contact & Footer Preview */}
                    <div className="p-4 rounded-2xl bg-black/60 border border-white/10 space-y-2 text-xs">
                      <div className="flex items-center justify-between text-zinc-400">
                        <span>{isRtl ? 'البريد الرسمي:' : 'Email:'}</span>
                        <span className="font-mono text-amber-300">{siteConfig.contactEmail}</span>
                      </div>
                      <div className="flex items-center justify-between text-zinc-400">
                        <span>{isRtl ? 'الهاتف / واتساب:' : 'Phone:'}</span>
                        <span className="font-mono text-emerald-300" dir="ltr">
                          {siteConfig.contactPhone}
                        </span>
                      </div>
                      <div className="pt-2 border-t border-white/10 text-[11px] text-zinc-400">
                        {siteConfig.copyrightAr}
                      </div>
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  disabled={saving}
                  onClick={() => saveMainSiteConfig()}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#FDE08D] via-[#D4AF37] to-[#AA771C] text-black font-black text-xs sm:text-sm shadow-[0_15px_35px_-5px_rgba(212,175,55,0.45)] hover:brightness-110 transition-all flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>
                    {isRtl
                      ? 'حفظ وتطبيق الهوية على الموقع الرئيسي'
                      : 'Save & Apply Identity to Main Website'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ====================================================================
            TAB 2: PROMOTIONAL BANNERS & ANNOUNCEMENTS STUDIO
        ==================================================================== */}
        {activeTab === 'banners' && (
          <div className="space-y-6">
            {/* Banners Command Bar + Filter Pills + Quick Templates */}
            <div className="rounded-[30px] vip-black-card border border-amber-500/35 p-6 sm:p-7 space-y-5 shadow-[0_20px_60px_rgba(0,0,0,0.7)]">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400/25 to-amber-600/10 border border-amber-400/50 flex items-center justify-center text-amber-300 shrink-0 shadow-[0_0_25px_rgba(212,175,55,0.25)]">
                    <Megaphone className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-black text-white">
                      {isRtl
                        ? 'استوديو البنرات الإعلانية والحملات الترويجية للموقع الرئيسي'
                        : 'Main Website Promotional Banners & Campaigns Studio'}
                    </h2>
                    <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
                      {isRtl
                        ? 'تحكم في الأشرطة الإعلانية العلوية (Top Bar) وبنرات الواجهة العريضة (Hero Showcase) مع معاينة حية فورية'
                        : 'Manage top announcement bars and wide hero showcase banners with instant live preview'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={openAddBanner}
                  className="px-5 py-3 rounded-2xl bg-gradient-to-r from-[#FDE08D] via-[#D4AF37] to-[#AA771C] text-black font-black text-xs sm:text-sm flex items-center gap-2 shadow-[0_12px_30px_-5px_rgba(212,175,55,0.5)] hover:scale-[1.02] transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>{isRtl ? 'إضافة بنر ترويجي جديد' : 'Create New Banner'}</span>
                </button>
              </div>

              {/* Filter Pills + 1-Click Campaign Presets */}
              <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  {[
                    {
                      id: 'all' as const,
                      labelAr: `الكل (${siteConfig.banners.length})`,
                      labelEn: `All (${siteConfig.banners.length})`,
                    },
                    {
                      id: 'active' as const,
                      labelAr: `النشطة فقط (${activeBannersCount})`,
                      labelEn: `Active (${activeBannersCount})`,
                    },
                    {
                      id: 'top_bar' as const,
                      labelAr: 'أشرطة علوية (Top Bar)',
                      labelEn: 'Top Bars',
                    },
                    {
                      id: 'hero_showcase' as const,
                      labelAr: 'بنرات الواجهة (Hero Showcase)',
                      labelEn: 'Hero Showcases',
                    },
                  ].map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setBannerFilter(f.id)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold border transition-all ${
                        bannerFilter === f.id
                          ? 'bg-amber-400 text-black border-amber-300 shadow-md'
                          : 'bg-white/[0.04] text-zinc-300 border-white/10 hover:border-amber-400/35'
                      }`}
                    >
                      {isRtl ? f.labelAr : f.labelEn}
                    </button>
                  ))}
                </div>

                {/* Quick 1-Click Campaign Templates */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-extrabold text-amber-300">
                    {isRtl ? '⚡ قوالب حملات جاهزة:' : '⚡ Quick Campaigns:'}
                  </span>
                  {[
                    {
                      badgeAr: 'جديد وحصري',
                      titleAr: 'إطلاق 30 ثيمًا ملكيًا بمعاينة حية فورية في VoltiX 2.5!',
                      subAr: 'صمّم هويتك الرقمية بالذهب الملكي والزجاج السائل مجانًا',
                      btnAr: 'جرّب الثيمات الآن',
                      url: '/register',
                      pos: 'top_bar' as BannerPosition,
                      style: 'royal_gold' as BannerThemeStyle,
                    },
                    {
                      badgeAr: 'مجتمعنا الرسمي',
                      titleAr: 'انضم إلى قنواتنا الرسمية على واتساب وتيليجرام وسناب شات',
                      subAr: 'احصل على قوالب VIP حصرية وتحديثات يومية لصناع المحتوى',
                      btnAr: 'انضم للقناة الرسمية',
                      url: 'https://whatsapp.com/channel/voltix',
                      pos: 'hero_showcase' as BannerPosition,
                      style: 'emerald_vip' as BannerThemeStyle,
                    },
                  ].map((tpl, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setEditingBannerId(null);
                        setBannerDraft({
                          id: `banner-${Date.now()}`,
                          titleAr: tpl.titleAr,
                          titleEn: tpl.titleAr,
                          subtitleAr: tpl.subAr,
                          subtitleEn: tpl.subAr,
                          badgeAr: tpl.badgeAr,
                          badgeEn: 'EXCLUSIVE',
                          buttonTextAr: tpl.btnAr,
                          buttonTextEn: 'Explore Now',
                          buttonUrl: tpl.url,
                          imageUrl: '/voltix-logo.png',
                          position: tpl.pos,
                          themeStyle: tpl.style,
                          isActive: true,
                        });
                        setShowBannerForm(true);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-400/35 text-[11px] font-extrabold text-amber-200 transition-all"
                    >
                      + {tpl.badgeAr}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Banner Add / Edit Form Drawer */}
            {showBannerForm && (
              <div className="rounded-[32px] vip-black-card border-2 border-amber-400/60 p-6 sm:p-8 space-y-6 shadow-[0_25px_80px_rgba(212,175,55,0.28)]">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <h3 className="text-lg font-black text-amber-300 flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    <span>
                      {editingBannerId
                        ? isRtl
                          ? 'تعديل بيانات البنر الترويجي'
                          : 'Edit Promotional Banner'
                        : isRtl
                        ? 'تصميم وإضافة بنر جديد للموقع الرئيسي'
                        : 'Create New Promotional Banner'}
                    </span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowBannerForm(false)}
                    className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold"
                  >
                    {isRtl ? 'إغلاق ✕' : 'Close ✕'}
                  </button>
                </div>

                {/* Live Preview inside Banner Editor */}
                <div className="space-y-2">
                  <div className="text-xs font-extrabold text-amber-300">
                    {isRtl ? 'معاينة حية فورية لتصميم البنر:' : 'Live Banner Preview:'}
                  </div>
                  <div
                    className="rounded-3xl p-5 sm:p-6 border relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xl"
                    style={{
                      background: BANNER_THEME_STYLES[bannerDraft.themeStyle].gradient,
                      borderColor: BANNER_THEME_STYLES[bannerDraft.themeStyle].border,
                    }}
                  >
                    <div className="flex items-center gap-4">
                      {bannerDraft.imageUrl && (
                        <div className="w-14 h-14 rounded-2xl bg-black/65 border border-white/20 p-1.5 shrink-0 flex items-center justify-center overflow-hidden">
                          <img
                            src={bannerDraft.imageUrl}
                            alt="Banner preview"
                            className="w-full h-full object-contain"
                          />
                        </div>
                      )}
                      <div className="space-y-1">
                        <span
                          className="inline-block px-3 py-0.5 rounded-full text-[10px] font-black text-black"
                          style={{
                            background: BANNER_THEME_STYLES[bannerDraft.themeStyle].badgeBg,
                          }}
                        >
                          {isRtl ? bannerDraft.badgeAr || 'جديد' : bannerDraft.badgeEn || 'NEW'}
                        </span>
                        <div className="text-base sm:text-lg font-black text-white">
                          {isRtl
                            ? bannerDraft.titleAr || 'عنوان البنر الترويجي يظهر هنا...'
                            : bannerDraft.titleEn || 'Promotional Banner Title...'}
                        </div>
                        <div className="text-xs text-zinc-200">
                          {isRtl
                            ? bannerDraft.subtitleAr || 'الوصف الإضافي للبنر الترويجي...'
                            : bannerDraft.subtitleEn || 'Banner subtitle description...'}
                        </div>
                      </div>
                    </div>

                    <span
                      className="px-5 py-2.5 rounded-2xl text-black font-black text-xs shrink-0 shadow-lg"
                      style={{
                        background: BANNER_THEME_STYLES[bannerDraft.themeStyle].badgeBg,
                      }}
                    >
                      {isRtl
                        ? bannerDraft.buttonTextAr || 'اكتشف الآن'
                        : bannerDraft.buttonTextEn || 'Explore Now'}
                    </span>
                  </div>
                </div>

                {/* Banner Position & Theme Selector */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-extrabold text-zinc-300 mb-2">
                      {isRtl ? 'موضع ظهور البنر في الموقع الرئيسي' : 'Banner Placement'}
                    </label>
                    <div className="grid grid-cols-2 gap-2.5">
                      {[
                        {
                          id: 'top_bar' as BannerPosition,
                          nameAr: 'شريط إعلاني أعلى الموقع (Top Bar)',
                          nameEn: 'Top Announcement Bar',
                        },
                        {
                          id: 'hero_showcase' as BannerPosition,
                          nameAr: 'بنر عريض فاخر في الواجهة (Hero Showcase)',
                          nameEn: 'Wide Hero Showcase Banner',
                        },
                      ].map((pos) => (
                        <button
                          key={pos.id}
                          type="button"
                          onClick={() => setBannerDraft({ ...bannerDraft, position: pos.id })}
                          className={`p-3 rounded-2xl border text-xs font-extrabold text-start transition-all ${
                            bannerDraft.position === pos.id
                              ? 'bg-amber-500/20 border-amber-400 text-amber-200'
                              : 'bg-black/60 border-white/10 text-zinc-400 hover:text-white'
                          }`}
                        >
                          {isRtl ? pos.nameAr : pos.nameEn}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-zinc-300 mb-2">
                      {isRtl ? 'التصميم اللوني الملكي للبنر' : 'Banner Luxury Color Style'}
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {(Object.keys(BANNER_THEME_STYLES) as BannerThemeStyle[]).map((styleKey) => {
                        const st = BANNER_THEME_STYLES[styleKey];
                        return (
                          <button
                            key={styleKey}
                            type="button"
                            onClick={() =>
                              setBannerDraft({ ...bannerDraft, themeStyle: styleKey })
                            }
                            className={`px-3 py-2 rounded-xl border text-[11px] font-extrabold transition-all ${
                              bannerDraft.themeStyle === styleKey
                                ? 'border-amber-400 ring-2 ring-amber-400/30 text-white'
                                : 'border-white/10 text-zinc-300 opacity-80 hover:opacity-100'
                            }`}
                            style={{ background: st.gradient }}
                          >
                            {isRtl ? st.nameAr : st.nameEn}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Banner Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-extrabold text-amber-300 mb-1.5">
                      {isRtl ? 'عنوان البنر (عربي) *' : 'Banner Title (Arabic) *'}
                    </label>
                    <input
                      type="text"
                      value={bannerDraft.titleAr}
                      onChange={(e) =>
                        setBannerDraft({ ...bannerDraft, titleAr: e.target.value })
                      }
                      placeholder="مثال: انضم إلى قناتنا الرسمية على واتساب الآن!"
                      className="w-full px-4 py-3 rounded-2xl bg-black/70 border border-white/15 focus:border-amber-400 text-sm font-bold focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-zinc-300 mb-1.5">
                      {isRtl ? 'عنوان البنر (إنجليزي)' : 'Banner Title (English)'}
                    </label>
                    <input
                      type="text"
                      dir="ltr"
                      value={bannerDraft.titleEn}
                      onChange={(e) =>
                        setBannerDraft({ ...bannerDraft, titleEn: e.target.value })
                      }
                      placeholder="Join our official WhatsApp channel now!"
                      className="w-full px-4 py-3 rounded-2xl bg-black/70 border border-white/15 focus:border-amber-400 text-sm font-bold focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-amber-300 mb-1.5">
                      {isRtl ? 'الوصف الفرعي للبنر (عربي)' : 'Banner Subtitle (Arabic)'}
                    </label>
                    <input
                      type="text"
                      value={bannerDraft.subtitleAr}
                      onChange={(e) =>
                        setBannerDraft({ ...bannerDraft, subtitleAr: e.target.value })
                      }
                      placeholder="تحديثات حصرية وقوالب ملكية مجانية..."
                      className="w-full px-4 py-3 rounded-2xl bg-black/70 border border-white/15 focus:border-amber-400 text-sm focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-zinc-300 mb-1.5">
                      {isRtl ? 'الوصف الفرعي للبنر (إنجليزي)' : 'Banner Subtitle (English)'}
                    </label>
                    <input
                      type="text"
                      dir="ltr"
                      value={bannerDraft.subtitleEn}
                      onChange={(e) =>
                        setBannerDraft({ ...bannerDraft, subtitleEn: e.target.value })
                      }
                      placeholder="Exclusive updates & royal templates..."
                      className="w-full px-4 py-3 rounded-2xl bg-black/70 border border-white/15 focus:border-amber-400 text-sm focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-zinc-300 mb-1.5">
                      {isRtl ? 'نص الشارة العلوية (Badge عربي)' : 'Badge Text (Ar)'}
                    </label>
                    <input
                      type="text"
                      value={bannerDraft.badgeAr}
                      onChange={(e) =>
                        setBannerDraft({ ...bannerDraft, badgeAr: e.target.value })
                      }
                      placeholder="عرض حصري / جديد"
                      className="w-full px-4 py-3 rounded-2xl bg-black/70 border border-white/15 focus:border-amber-400 text-sm focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-zinc-300 mb-1.5">
                      {isRtl ? 'نص زر البنر (Button Text عربي)' : 'Button Text (Ar)'}
                    </label>
                    <input
                      type="text"
                      value={bannerDraft.buttonTextAr}
                      onChange={(e) =>
                        setBannerDraft({ ...bannerDraft, buttonTextAr: e.target.value })
                      }
                      placeholder="انضم للقناة الرسمية"
                      className="w-full px-4 py-3 rounded-2xl bg-black/70 border border-white/15 focus:border-amber-400 text-sm font-bold focus:outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-extrabold text-amber-300 mb-1.5">
                      {isRtl ? 'رابط التوجيه عند النقر على زر البنر (URL)' : 'Button Target URL'}
                    </label>
                    <input
                      type="text"
                      dir="ltr"
                      value={bannerDraft.buttonUrl}
                      onChange={(e) =>
                        setBannerDraft({ ...bannerDraft, buttonUrl: e.target.value })
                      }
                      placeholder="https://whatsapp.com/channel/... or /register"
                      className="w-full px-4 py-3 rounded-2xl bg-black/70 border border-white/15 focus:border-amber-400 text-sm font-mono focus:outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <UniversalImageUploader
                      label={
                        isRtl
                          ? 'صورة أو أيقونة البنر الترويجي (رفع جميع الصيغ أو رابط)'
                          : 'Banner Image / Icon (Upload Any Image Format or URL)'
                      }
                      value={bannerDraft.imageUrl || ''}
                      onChange={(newImg) =>
                        setBannerDraft({ ...bannerDraft, imageUrl: newImg })
                      }
                      defaultUrl="/voltix-logo.png"
                      placeholder="/voltix-logo.png"
                      isRtl={isRtl}
                      compact={true}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowBannerForm(false)}
                    className="px-5 py-2.5 rounded-xl bg-white/10 text-xs font-bold"
                  >
                    {isRtl ? 'إلغاء' : 'Cancel'}
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveBannerDraft}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#FDE08D] via-[#D4AF37] to-[#AA771C] text-black font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-amber-500/30"
                  >
                    <Check className="w-4 h-4" />
                    <span>
                      {editingBannerId
                        ? isRtl
                          ? 'حفظ تعديلات البنر'
                          : 'Save Banner Updates'
                        : isRtl
                        ? 'إضافة البنر ونشره الآن'
                        : 'Add & Publish Banner'}
                    </span>
                  </button>
                </div>
              </div>
            )}

            {/* Existing Filtered Banners List */}
            <div className="space-y-4">
              {siteConfig.banners
                .filter((b) => {
                  if (bannerFilter === 'active') return b.isActive;
                  if (bannerFilter === 'top_bar') return b.position === 'top_bar';
                  if (bannerFilter === 'hero_showcase') return b.position === 'hero_showcase';
                  return true;
                })
                .map((banner) => {
                  const st =
                    BANNER_THEME_STYLES[banner.themeStyle] || BANNER_THEME_STYLES.royal_gold;
                  return (
                    <div
                      key={banner.id}
                      className={`rounded-[28px] p-6 border transition-all relative overflow-hidden shadow-[0_18px_50px_rgba(0,0,0,0.6)] ${
                        banner.isActive ? 'opacity-100' : 'opacity-55'
                      }`}
                      style={{
                        background: st.gradient,
                        borderColor: st.border,
                      }}
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                        <div className="flex items-start sm:items-center gap-4">
                          {banner.imageUrl ? (
                            <div className="w-16 h-16 rounded-2xl bg-black/65 border border-white/20 p-2 shrink-0 flex items-center justify-center overflow-hidden">
                              <img
                                src={banner.imageUrl}
                                alt={banner.titleAr}
                                className="w-full h-full object-contain"
                              />
                            </div>
                          ) : (
                            <div className="w-14 h-14 rounded-2xl bg-black/50 border border-white/15 flex items-center justify-center shrink-0">
                              <Megaphone className="w-6 h-6 text-amber-300" />
                            </div>
                          )}

                          <div className="space-y-1.5">
                            <div className="flex flex-wrap items-center gap-2">
                              <span
                                className="px-3 py-0.5 rounded-full text-[10px] font-black text-black"
                                style={{ background: st.badgeBg }}
                              >
                                {isRtl ? banner.badgeAr : banner.badgeEn}
                              </span>
                              <span className="px-2.5 py-0.5 rounded-full bg-black/60 border border-white/15 text-[10px] font-extrabold text-zinc-200">
                                {banner.position === 'top_bar'
                                  ? isRtl
                                    ? '📍 شريط علوي أعلى الموقع'
                                    : '📍 Top Bar'
                                  : isRtl
                                  ? '📍 بنر عريض في الواجهة الرئيسية'
                                  : '📍 Hero Showcase Banner'}
                              </span>
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                                  banner.isActive
                                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                    : 'bg-zinc-800 text-zinc-400'
                                }`}
                              >
                                {banner.isActive
                                  ? isRtl
                                    ? '● نشط ويظهر في الموقع'
                                    : '● Active on Site'
                                  : isRtl
                                  ? '○ مخفي مؤقتًا'
                                  : '○ Hidden'}
                              </span>
                            </div>

                            <h3 className="text-base sm:text-lg font-black text-white leading-snug">
                              {isRtl ? banner.titleAr : banner.titleEn}
                            </h3>
                            <p className="text-xs sm:text-sm text-zinc-200/85">
                              {isRtl ? banner.subtitleAr : banner.subtitleEn}
                            </p>
                            <div className="text-[11px] font-mono text-amber-200/90 pt-0.5" dir="ltr">
                              CTA: [{isRtl ? banner.buttonTextAr : banner.buttonTextEn}] →{' '}
                              {banner.buttonUrl}
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => toggleBannerActive(banner.id)}
                            className={`px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 border transition-all ${
                              banner.isActive
                                ? 'bg-black/50 border-white/20 text-zinc-200 hover:bg-black/80'
                                : 'bg-emerald-500 text-black border-emerald-400'
                            }`}
                          >
                            <Power className="w-3.5 h-3.5" />
                            <span>
                              {banner.isActive
                                ? isRtl
                                  ? 'إخفاء مؤقت'
                                  : 'Hide'
                                : isRtl
                                ? 'تفعيل الظهور'
                                : 'Activate'}
                            </span>
                          </button>

                          <button
                            type="button"
                            onClick={() => openEditBanner(banner)}
                            className="px-3.5 py-2 rounded-xl bg-black/60 hover:bg-black/80 border border-white/20 text-xs font-extrabold text-amber-300 flex items-center gap-1.5"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>{isRtl ? 'تعديل' : 'Edit'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => deleteBanner(banner.id)}
                            className="px-3.5 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/35 border border-rose-500/40 text-xs font-extrabold text-rose-200 flex items-center gap-1.5"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>{isRtl ? 'حذف' : 'Delete'}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* ====================================================================
            TAB 3: OFFICIAL WEBSITE SOCIAL MEDIA & CHANNELS MANAGER
        ==================================================================== */}
        {activeTab === 'socials' && (
          <div className="space-y-6">
            {/* Live Preview Bar of Active Social Ecosystem + Quick Add Studio */}
            <div className="rounded-[30px] vip-black-card border border-amber-500/35 p-6 sm:p-7 space-y-6 shadow-[0_20px_60px_rgba(0,0,0,0.75)]">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400/25 to-amber-500/15 border border-amber-400/50 flex items-center justify-center text-amber-300 shrink-0">
                    <Share2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-black text-white">
                      {isRtl
                        ? 'منظومة القنوات ووسائل التواصل الرسمية للموقع الرئيسي (14 منصة)'
                        : 'Main Website Official Social Media & Community Channels (14 Platforms)'}
                    </h2>
                    <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
                      {isRtl
                        ? 'جميع القنوات المفعّلة تظهر بأيقوناتها الرسمية ثلاثية الأبعاد (شاملة شعار سناب شات الرسمي 100%) في الواجهة والفوتر'
                        : 'Active channels render with authentic 3D brand icons (including 100% official Snapchat Ghost) in the Hero & Footer'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={saving}
                  onClick={() => saveMainSiteConfig()}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#FDE08D] via-[#D4AF37] to-[#AA771C] text-black font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-amber-500/25"
                >
                  <Save className="w-4 h-4" />
                  <span>
                    {isRtl ? 'حفظ ونشر روابط التواصل' : 'Save & Publish Social Links'}
                  </span>
                </button>
              </div>

              {/* Live Dock Preview of Active Official Social Icons */}
              <div className="p-4 rounded-2xl bg-black/65 border border-white/10 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-extrabold text-zinc-300">
                    {isRtl
                      ? 'المعاينة الحية لشريط المنصات الرسمية في الموقع:'
                      : 'Live Main Site Social Bar Preview:'}
                  </span>
                </div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  {siteConfig.officialSocials
                    .filter((s) => s.isActive)
                    .map((soc) => (
                      <a
                        key={soc.id}
                        href={soc.url}
                        target="_blank"
                        rel="noreferrer"
                        title={isRtl ? soc.labelAr : soc.labelEn}
                        className="hover:scale-110 transition-transform"
                      >
                        <OfficialSocialBadge
                          platformId={soc.platform}
                          size="sm"
                          variant="gradient"
                        />
                      </a>
                    ))}
                </div>
              </div>

              {/* 1-Click Official Channel Presets */}
              <div className="space-y-2.5">
                <div className="text-xs font-extrabold text-amber-300">
                  {isRtl
                    ? '⚡ قوالب سريعة لإضافة قناة أو مجتمع رسمي للموقع الرئيسي بنقرة واحدة:'
                    : '⚡ 1-Click Official Channel Presets for Main Website:'}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
                  {OFFICIAL_CHANNEL_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => {
                        setNewSocialPlatform(preset.platformId);
                        setNewSocialLabelAr(preset.labelAr);
                        setNewSocialLabelEn(preset.labelEn);
                        setNewSocialBadge(isRtl ? preset.badgeAr : preset.badgeEn);
                        setNewSocialUrl(preset.placeholder || preset.urlPrefix);
                      }}
                      className="p-3 rounded-2xl bg-black/65 hover:bg-white/[0.07] border border-white/10 hover:border-amber-400/50 flex items-center gap-2.5 text-start transition-all group"
                    >
                      <OfficialSocialBadge
                        platformId={preset.platformId}
                        size="sm"
                        variant="gradient"
                      />
                      <div className="min-w-0">
                        <div className="text-xs font-extrabold text-white truncate group-hover:text-amber-300">
                          {isRtl ? preset.labelAr : preset.labelEn}
                        </div>
                        <div className="text-[10px] text-zinc-400 font-mono truncate">
                          {isRtl ? preset.badgeAr : preset.badgeEn}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Add New Official Channel Form */}
              <div className="p-5 rounded-2xl bg-black/60 border border-amber-400/25 grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                <div className="sm:col-span-3">
                  <label className="block text-[11px] font-extrabold text-zinc-300 mb-1.5">
                    {isRtl ? 'اختر المنصة الرسمية (14 منصة)' : 'Select Platform'}
                  </label>
                  <select
                    value={newSocialPlatform}
                    onChange={(e) => setNewSocialPlatform(e.target.value as SocialPlatformId)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/15 text-xs font-extrabold text-white focus:border-amber-400 focus:outline-none"
                  >
                    {SOCIAL_PLATFORMS.map((p) => (
                      <option key={p.id} value={p.id}>
                        {isRtl ? `${p.nameAr} (${p.name})` : p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-[11px] font-extrabold text-zinc-300 mb-1.5">
                    {isRtl ? 'اسم القناة / الحساب (عربي)' : 'Channel Label (Ar)'}
                  </label>
                  <input
                    type="text"
                    value={newSocialLabelAr}
                    onChange={(e) => setNewSocialLabelAr(e.target.value)}
                    placeholder="مثال: حساب سناب شات الرسمي"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/15 text-xs font-bold focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-4">
                  <label className="block text-[11px] font-extrabold text-amber-300 mb-1.5">
                    {isRtl ? 'الرابط الرسمي المباشر (URL)' : 'Official URL'}
                  </label>
                  <input
                    type="text"
                    dir="ltr"
                    value={newSocialUrl}
                    onChange={(e) => setNewSocialUrl(e.target.value)}
                    placeholder="https://snapchat.com/add/..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/15 text-xs font-mono focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <button
                    type="button"
                    onClick={addNewOfficialSocial}
                    className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#FDE08D] via-[#D4AF37] to-[#AA771C] text-black font-black text-xs flex items-center justify-center gap-1.5 shadow-md hover:brightness-110 transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{isRtl ? 'إضافة للموقع' : 'Add Link'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Grid of All Configured Official Socials */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {siteConfig.officialSocials.map((soc) => {
                const plat =
                  SOCIAL_PLATFORMS.find((p) => p.id === soc.platform) || SOCIAL_PLATFORMS[0];
                return (
                  <div
                    key={soc.id}
                    className={`rounded-[28px] vip-black-card p-5 border transition-all flex flex-col gap-4 ${
                      soc.isActive
                        ? 'border-white/15 hover:border-amber-400/45 shadow-[0_15px_45px_rgba(0,0,0,0.65)]'
                        : 'border-white/5 opacity-55'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3.5">
                        <OfficialSocialBadge
                          platformId={soc.platform}
                          size="md"
                          variant="gradient"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-black text-white">
                              {isRtl ? plat.nameAr : plat.name}
                            </span>
                            <span
                              className="px-2 py-0.5 rounded-full text-[9px] font-mono font-extrabold border"
                              style={{
                                color: plat.color,
                                borderColor: `${plat.color}40`,
                                backgroundColor: `${plat.color}15`,
                              }}
                            >
                              {soc.handleOrBadge || plat.domains[0]}
                            </span>
                          </div>
                          <div className="text-xs text-zinc-400 mt-0.5">
                            {isRtl ? soc.labelAr : soc.labelEn}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <a
                          href={soc.url}
                          target="_blank"
                          rel="noreferrer"
                          title={isRtl ? 'فتح الرابط' : 'Open URL'}
                          className="p-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.12] border border-white/10 text-zinc-300"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>

                        <button
                          type="button"
                          onClick={() =>
                            updateSocialItem(soc.id, { isActive: !soc.isActive })
                          }
                          className={`px-3 py-1.5 rounded-xl text-[11px] font-extrabold border transition-all ${
                            soc.isActive
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                              : 'bg-zinc-800 text-zinc-400 border-white/10'
                          }`}
                        >
                          {soc.isActive
                            ? isRtl
                              ? 'مفعّل'
                              : 'Active'
                            : isRtl
                            ? 'مخفي'
                            : 'Hidden'}
                        </button>

                        <button
                          type="button"
                          onClick={() => deleteOfficialSocial(soc.id)}
                          className="p-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30"
                          title={isRtl ? 'حذف' : 'Delete'}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-[10px] font-bold text-zinc-400 mb-1">
                          {isRtl ? 'عنوان العرض (عربي)' : 'Display Label (Ar)'}
                        </label>
                        <input
                          type="text"
                          value={soc.labelAr}
                          onChange={(e) =>
                            updateSocialItem(soc.id, { labelAr: e.target.value })
                          }
                          className="w-full px-3 py-2 rounded-xl bg-black/70 border border-white/10 focus:border-amber-400 text-xs font-bold focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-zinc-400 mb-1">
                          {isRtl ? 'الشارة / المعرّف (Badge)' : 'Handle / Badge'}
                        </label>
                        <input
                          type="text"
                          dir="ltr"
                          value={soc.handleOrBadge}
                          onChange={(e) =>
                            updateSocialItem(soc.id, { handleOrBadge: e.target.value })
                          }
                          className="w-full px-3 py-2 rounded-xl bg-black/70 border border-white/10 focus:border-amber-400 text-xs font-mono focus:outline-none"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-[10px] font-bold text-amber-300/90 mb-1">
                          {isRtl ? 'الرابط الرسمي المباشر (URL)' : 'Official Target URL'}
                        </label>
                        <input
                          type="text"
                          dir="ltr"
                          value={soc.url}
                          onChange={(e) =>
                            updateSocialItem(soc.id, { url: e.target.value })
                          }
                          className="w-full px-3 py-2 rounded-xl bg-black/70 border border-white/10 focus:border-amber-400 text-xs font-mono text-amber-200 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ====================================================================
            TAB 4: INTERACTIVE HERO PHONE DEMO & FAQ MANAGER (WITH LIVE 3D PHONE)
        ==================================================================== */}
        {activeTab === 'phone_faq' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left/Main 7 Cols: Hero Phone Data Form + FAQ Studio */}
            <div className="lg:col-span-7 min-w-0 space-y-6">
              {/* Hero 3D Phone Profile Config */}
              <div className="rounded-[30px] vip-black-card border border-amber-500/35 p-6 sm:p-7 space-y-5 shadow-[0_20px_60px_rgba(0,0,0,0.7)]">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-amber-500/15 border border-amber-400/45 flex items-center justify-center text-amber-300">
                      <Smartphone className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-lg font-black text-white">
                        {isRtl
                          ? 'بيانات الهاتف التفاعلي في الواجهة الرئيسية (Hero 3D Phone)'
                          : 'Interactive Hero 3D Phone Profile Configuration'}
                      </h2>
                      <p className="text-xs text-zinc-400">
                        {isRtl
                          ? 'أي تعديل هنا يظهر فورًا في المعاينة الحية للهاتف بجانبك وفي الصفحة الرئيسية'
                          : 'Changes update the live 3D phone beside you and on the main landing page'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-extrabold text-amber-300 mb-1.5">
                      {isRtl
                        ? 'الاسم المعروض داخل هاتف الصفحة الرئيسية'
                        : 'Demo Phone Display Name'}
                    </label>
                    <input
                      type="text"
                      value={siteConfig.heroPhone.displayName}
                      onChange={(e) =>
                        setSiteConfig({
                          ...siteConfig,
                          heroPhone: { ...siteConfig.heroPhone, displayName: e.target.value },
                        })
                      }
                      className="w-full px-4 py-3 rounded-2xl bg-black/70 border border-white/15 focus:border-amber-400 text-sm font-bold focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-zinc-300 mb-1.5">
                      {isRtl ? 'اسم المستخدم (@username)' : 'Demo Phone @username'}
                    </label>
                    <input
                      type="text"
                      dir="ltr"
                      value={siteConfig.heroPhone.username}
                      onChange={(e) =>
                        setSiteConfig({
                          ...siteConfig,
                          heroPhone: { ...siteConfig.heroPhone, username: e.target.value },
                        })
                      }
                      className="w-full px-4 py-3 rounded-2xl bg-black/70 border border-white/15 focus:border-amber-400 text-sm font-mono text-amber-300 focus:outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-extrabold text-zinc-300 mb-1.5">
                      {isRtl ? 'النبذة التعريفية في الهاتف (Bio)' : 'Demo Phone Bio'}
                    </label>
                    <textarea
                      rows={3}
                      value={siteConfig.heroPhone.bio}
                      onChange={(e) =>
                        setSiteConfig({
                          ...siteConfig,
                          heroPhone: { ...siteConfig.heroPhone, bio: e.target.value },
                        })
                      }
                      className="w-full px-4 py-3 rounded-2xl bg-black/70 border border-white/15 focus:border-amber-400 text-sm focus:outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <UniversalImageUploader
                      label={
                        isRtl
                          ? 'صورة الحساب في الهاتف التفاعلي (رفع صورة بجميع الصيغ أو رابط)'
                          : 'Demo Phone Avatar (Upload Any Image Format or URL)'
                      }
                      value={siteConfig.heroPhone.avatarUrl}
                      onChange={(newAvatar) =>
                        setSiteConfig({
                          ...siteConfig,
                          heroPhone: { ...siteConfig.heroPhone, avatarUrl: newAvatar },
                        })
                      }
                      defaultUrl="/voltix-logo.png"
                      placeholder="/voltix-logo.png"
                      isRtl={isRtl}
                      compact={true}
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <UniversalImageUploader
                      label={
                        isRtl
                          ? 'صورة الغلاف والخلفية في الهاتف التفاعلي (رفع صورة بجميع الصيغ أو رابط)'
                          : 'Demo Phone Cover / Background (Upload Any Format or URL)'
                      }
                      value={siteConfig.heroPhone.coverUrl || ''}
                      onChange={(newCover) =>
                        setSiteConfig({
                          ...siteConfig,
                          heroPhone: { ...siteConfig.heroPhone, coverUrl: newCover },
                        })
                      }
                      defaultUrl=""
                      placeholder={
                        isRtl
                          ? 'رابط صورة الغلاف أو ارفع ملفًا من جهازك (PNG, JPG, WebP, GIF...)'
                          : 'Cover image URL or upload from device'
                      }
                      isRtl={isRtl}
                      compact={true}
                      helperText={
                        isRtl
                          ? 'تظهر كخلفية بانورامية ملكية في أعلى بطاقة الهاتف التفاعلي في المعاينة الفورية والصفحة الرئيسية'
                          : 'Appears as the luxury panoramic cover banner in the interactive hero phone'
                      }
                    />
                  </div>
                </div>
              </div>

              {/* FAQs Manager */}
              <div className="rounded-[30px] vip-black-card border border-white/15 p-6 sm:p-7 space-y-5 shadow-[0_20px_60px_rgba(0,0,0,0.7)]">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-amber-500/15 border border-amber-400/45 flex items-center justify-center text-amber-300">
                      <HelpCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-lg font-black text-white">
                        {isRtl
                          ? `إدارة الأسئلة الشائعة في الصفحة الرئيسية (${siteConfig.faqs.length})`
                          : `Main Website FAQ Knowledge Base (${siteConfig.faqs.length})`}
                      </h2>
                      <p className="text-xs text-zinc-400">
                        {isRtl
                          ? 'أضف أو عدّل الأسئلة والإجابات باللغتين العربية والإنجليزية'
                          : 'Add or manage bilingual Arabic & English FAQs'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Add New FAQ */}
                <div className="p-4 rounded-2xl bg-black/60 border border-amber-400/25 space-y-3">
                  <div className="text-xs font-extrabold text-amber-300">
                    {isRtl ? '+ إضافة سؤال شائع جديد:' : '+ Add New FAQ Item:'}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={newFaqQAr}
                      onChange={(e) => setNewFaqQAr(e.target.value)}
                      placeholder={isRtl ? 'السؤال بالعربية...' : 'Question in Arabic...'}
                      className="px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/15 text-xs font-bold focus:border-amber-400 focus:outline-none"
                    />
                    <input
                      type="text"
                      dir="ltr"
                      value={newFaqQEn}
                      onChange={(e) => setNewFaqQEn(e.target.value)}
                      placeholder="Question in English..."
                      className="px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/15 text-xs font-bold focus:border-amber-400 focus:outline-none"
                    />
                    <textarea
                      rows={2}
                      value={newFaqAAr}
                      onChange={(e) => setNewFaqAAr(e.target.value)}
                      placeholder={isRtl ? 'الإجابة بالعربية...' : 'Answer in Arabic...'}
                      className="px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/15 text-xs focus:border-amber-400 focus:outline-none"
                    />
                    <textarea
                      rows={2}
                      dir="ltr"
                      value={newFaqAEn}
                      onChange={(e) => setNewFaqAEn(e.target.value)}
                      placeholder="Answer in English..."
                      className="px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/15 text-xs focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={addFaqItem}
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#FDE08D] via-[#D4AF37] to-[#AA771C] text-black font-black text-xs flex items-center gap-1.5 shadow-md"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{isRtl ? 'إضافة السؤال وحفظه' : 'Add FAQ Item'}</span>
                  </button>
                </div>

                {/* Existing FAQs */}
                <div className="space-y-3">
                  {siteConfig.faqs.map((f, idx) => (
                    <div
                      key={f.id || idx}
                      className="p-4 rounded-2xl bg-black/50 border border-white/10 hover:border-amber-400/35 space-y-2 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="text-sm font-black text-amber-200">
                          {idx + 1}. {isRtl ? f.questionAr : f.questionEn}
                        </div>
                        <button
                          type="button"
                          onClick={() => deleteFaqItem(f.id)}
                          className="p-1.5 rounded-lg bg-rose-500/20 text-rose-300 hover:bg-rose-500/35 shrink-0"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-xs text-zinc-300 leading-relaxed">
                        {isRtl ? f.answerAr : f.answerEn}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right 5 Cols: 100% PINNED & FIXED LIVE 3D HERO PHONE INSPECTOR */}
            <div className="lg:col-span-5 lg:sticky lg:top-2 self-start h-fit space-y-4">
              <div className="rounded-[32px] vip-black-card border border-amber-400/45 p-5 sm:p-6 space-y-4 shadow-[0_30px_90px_rgba(0,0,0,0.9)]">
                <div className="flex items-center justify-between border-b border-white/10 pb-3.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs font-black text-amber-300">
                      {isRtl
                        ? 'المعاينة الحية للهاتف التفاعلي (3D Hero Phone)'
                        : 'Live 3D Hero Phone Preview'}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-400">
                    @{siteConfig.heroPhone.username || 'voltix'}
                  </span>
                </div>

                <div className="relative mx-auto w-full max-w-[340px] h-[540px] rounded-[46px] p-2.5 bg-gradient-to-b from-zinc-600 via-zinc-900 to-black border-2 border-amber-400/45 shadow-[0_25px_75px_-10px_rgba(212,175,55,0.35)]">
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 w-24 h-5 bg-black rounded-full border border-white/15 flex items-center justify-between px-2.5">
                    <span className="text-[7px] font-black tracking-widest text-amber-400">
                      VOLTIX
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  </div>
                  <div className="w-full h-full rounded-[36px] overflow-y-auto overflow-x-hidden no-scrollbar bg-[#040407]">
                    <ProfileRenderer
                      profile={sharedHeroPhoneProfile}
                      theme={currentDefaultThemeObj}
                      effects={DEFAULT_EFFECTS_CONFIG}
                      isPreview={true}
                      compactPhone={true}
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => saveMainSiteConfig()}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#FDE08D] via-[#D4AF37] to-[#AA771C] text-black font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/30"
                >
                  <Save className="w-4 h-4" />
                  <span>
                    {isRtl
                      ? 'حفظ بيانات الهاتف والأسئلة الشائعة'
                      : 'Save Hero Phone & FAQs'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ====================================================================
            TAB 5: 30 SIGNATURE THEMES LIVE INTERACTIVE SHOWROOM & VAULT CONTROL
        ==================================================================== */}
        {activeTab === 'themes' && (() => {
          const activeAdminThemeBase =
            AURA_THEMES.find((th) => th.id === adminPreviewThemeId) ||
            AURA_THEMES.find((th) => th.id === siteConfig.defaultThemeId) ||
            AURA_THEMES[0];

          const activeAdminTheme: ThemeConfig = {
            ...activeAdminThemeBase,
            profileLayout: adminPreviewLayout || activeAdminThemeBase.profileLayout,
          };

          const isPreviewDisabled = siteConfig.disabledThemes.includes(activeAdminTheme.id);
          const isPreviewDefault = siteConfig.defaultThemeId === activeAdminTheme.id;

          const adminDemoProfile: ProfileData = {
            username: siteConfig.heroPhone.username || 'voltix',
            displayName:
              siteConfig.heroPhone.displayName || 'VoltiX | المنصة الرسمية',
            bio:
              siteConfig.heroPhone.bio ||
              'منصة الهوية الرقمية الفاخرة • استكشف 30 عالمًا بصريًا بمعاينة حية فورية ✨',
            avatarUrl: siteConfig.heroPhone.avatarUrl || siteConfig.logoUrl || '/voltix-logo.png',
            coverUrl: siteConfig.heroPhone.coverUrl || '',
            isVerified: true,
            links: [
              {
                id: 'adm-1',
                title: isRtl
                  ? 'انضم إلى قناة واتساب الرسمية'
                  : 'Join Official WhatsApp Channel',
                url: 'https://whatsapp.com/channel/voltix',
                description: isRtl
                  ? 'أحدث التحديثات والقوالب الملكية الحصرية'
                  : 'Latest royal updates & exclusive templates',
                icon: 'whatsapp',
                cardType: activeAdminTheme.defaultCardType,
                isFeatured: true,
                badgeText: 'OFFICIAL CHANNEL',
              },
              {
                id: 'adm-2',
                title: isRtl ? 'مجتمع ديسكورد وتيليجرام' : 'Discord & Telegram Hub',
                url: 'https://discord.gg/voltix',
                description: isRtl
                  ? 'تواصل مباشر مع نخبة صناع المحتوى والمصممين'
                  : 'Connect with elite creators & designers',
                icon: 'discord',
                cardType: 'glass',
                badgeText: 'VIP COMMUNITY',
              },
              {
                id: 'adm-3',
                title: isRtl ? 'استوديو الهوية البصرية 2.5' : 'Spatial Identity Studio 2.5',
                url: '/dashboard',
                description: isRtl
                  ? '30 ثيمًا ملكيًا • 12 بطاقة تفاعلية • 24 خطًا احترافيًا'
                  : '30 Signature Themes • 12 Card Styles • 24 Fonts',
                icon: 'crown',
                cardType: activeAdminTheme.defaultCardType,
                badgeText: 'PRO 2.5',
              },
            ],
            socialLinks: siteConfig.officialSocials
              .filter((s) => s.isActive)
              .slice(0, 6)
              .map((s) => ({
                id: s.id,
                platform: s.platform,
                url: s.url,
              })),
          };

          const handleToggleThemeDisable = (targetId: string) => {
            const currentlyDisabled = siteConfig.disabledThemes.includes(targetId);
            const nextDisabled = currentlyDisabled
              ? siteConfig.disabledThemes.filter((id) => id !== targetId)
              : [...siteConfig.disabledThemes, targetId];
            const updated = { ...siteConfig, disabledThemes: nextDisabled };
            setSiteConfig(updated);
            saveMainSiteConfig(
              updated,
              currentlyDisabled
                ? isRtl
                  ? '✅ تم تفعيل الثيم في الموقع الرئيسي والاستوديو'
                  : '✅ Theme enabled on main site & studio'
                : isRtl
                ? '⏸️ تم تعطيل الثيم مؤقتًا'
                : '⏸️ Theme temporarily disabled'
            );
          };

          const handleSetDefaultTheme = (targetId: string) => {
            const nextDisabled = siteConfig.disabledThemes.filter((id) => id !== targetId);
            const updated = {
              ...siteConfig,
              defaultThemeId: targetId,
              disabledThemes: nextDisabled,
            };
            setSiteConfig(updated);
            setAdminPreviewThemeId(targetId);
            saveMainSiteConfig(
              updated,
              isRtl
                ? '👑 تم تعيين الثيم الافتراضي الرسمي للمنصة بنجاح!'
                : '👑 Default platform theme updated!'
            );
          };

          return (
            <div className="space-y-6">
              {/* Top Summary Header Card */}
              <div className="rounded-3xl vip-black-card border border-amber-500/35 p-6 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2.5">
                    <Palette className="w-5 h-5 text-amber-400" />
                    <h2 className="text-lg sm:text-xl font-black">
                      {isRtl
                        ? `إدارة ومعاينة مكتبة الثيمات الملكية الحية (${AURA_THEMES.length} ثيمًا احترافيًا)`
                        : `Manage & Live Preview ${AURA_THEMES.length} Signature Architectural Themes`}
                    </h2>
                  </div>
                  <p className="text-xs sm:text-sm text-zinc-400 mt-1">
                    {isRtl
                      ? 'عاين أي ثيم مباشرة عبر البطاقات التفاعلية والهاتف الحي بجانبك، وقم بتعيين الثيم الافتراضي للموقع أو تفعيل/تعطيل أي ثيم بنقرة واحدة'
                      : 'Preview any theme live on the interactive cards and 3D phone beside you, set the platform default, or enable/disable themes in 1 click'}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="px-3.5 py-2 rounded-xl bg-emerald-500/15 border border-emerald-500/35 text-xs font-extrabold text-emerald-300">
                    {isRtl
                      ? `مفعّل حاليًا: ${AURA_THEMES.length - siteConfig.disabledThemes.length} من ${AURA_THEMES.length}`
                      : `Active: ${AURA_THEMES.length - siteConfig.disabledThemes.length} / ${AURA_THEMES.length}`}
                  </span>
                  {siteConfig.disabledThemes.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        const updated = { ...siteConfig, disabledThemes: [] };
                        setSiteConfig(updated);
                        saveMainSiteConfig(
                          updated,
                          isRtl
                            ? '✨ تم تفعيل جميع الـ 30 ثيمًا في المنصة!'
                            : '✨ All 30 themes enabled!'
                        );
                      }}
                      className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-extrabold text-amber-200"
                    >
                      {isRtl ? 'تفعيل جميع الثيمات' : 'Enable All Themes'}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => saveMainSiteConfig()}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#FDE08D] via-[#D4AF37] to-[#AA771C] text-black font-black text-xs shadow-lg shadow-amber-500/25 flex items-center gap-1.5"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{isRtl ? 'حفظ إعدادات الثيمات' : 'Save Theme Settings'}</span>
                  </button>
                </div>
              </div>

              {/* Split-Screen Live Showroom + Sticky 3D Phone Preview */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
                {/* Right/Main 8 Cols: Horizontal Left/Right Scroll Showroom & Full Grid Toggle */}
                <div className="lg:col-span-8 min-w-0">
                  <HorizontalThemeShowroomCarousel
                    themes={AURA_THEMES}
                    allThemesForIndex={AURA_THEMES}
                    selectedThemeId={activeAdminTheme.id}
                    isRtl={isRtl}
                    defaultRows={2}
                    defaultThemeId={siteConfig.defaultThemeId}
                    disabledThemeIds={siteConfig.disabledThemes}
                    onSelect={(id, th) => {
                      setAdminPreviewThemeId(id);
                      setAdminPreviewLayout(th.profileLayout);
                    }}
                    onQuickInspect={(themeObj) => {
                      setAdminPreviewThemeId(themeObj.id);
                      setAdminPreviewLayout(themeObj.profileLayout);
                      setAdminInspectedThemeModal(themeObj);
                    }}
                    onToggleDisable={handleToggleThemeDisable}
                    onSetDefault={handleSetDefaultTheme}
                  />
                </div>

                {/* Left 4 Cols: 100% PINNED & FIXED Live 3D Showroom Phone & Direct Admin Actions */}
                <div className="lg:col-span-4 lg:sticky lg:top-2 self-start h-fit space-y-4">
                  <div className="rounded-[34px] vip-black-card border border-amber-400/45 p-5 sm:p-6 shadow-[0_30px_90px_rgba(0,0,0,0.9)] space-y-4">
                    {/* Active Theme Header */}
                    <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-3.5">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-amber-300">
                            {isRtl ? 'المعاينة الحية الفورية للثيم' : 'LIVE THEME INSPECTOR'}
                          </span>
                        </div>
                        <h3 className="text-base sm:text-lg font-black text-white truncate mt-0.5">
                          {isRtl ? activeAdminTheme.nameAr : activeAdminTheme.nameEn}
                        </h3>
                      </div>

                      <button
                        type="button"
                        onClick={() => setAdminInspectedThemeModal(activeAdminTheme)}
                        className="px-3 py-1.5 rounded-xl bg-amber-400/20 hover:bg-amber-400 hover:text-black border border-amber-400/50 text-amber-300 text-xs font-extrabold flex items-center gap-1.5 transition-all shrink-0"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>{isRtl ? 'تكبير' : 'Expand'}</span>
                      </button>
                    </div>

                    {/* Theme DNA Specs Pills */}
                    <div className="grid grid-cols-3 gap-2 text-center" dir="ltr">
                      <div className="p-2 rounded-xl bg-black/60 border border-white/10">
                        <div className="text-[9px] text-zinc-400 uppercase">CARD STYLE</div>
                        <div className="text-[11px] font-black text-amber-300 uppercase truncate">
                          {activeAdminTheme.defaultCardType}
                        </div>
                      </div>
                      <div className="p-2 rounded-xl bg-black/60 border border-white/10">
                        <div className="text-[9px] text-zinc-400 uppercase">FONT</div>
                        <div className="text-[11px] font-black text-white truncate">
                          {activeAdminTheme.fontFamilyAr}
                        </div>
                      </div>
                      <div className="p-2 rounded-xl bg-black/60 border border-white/10">
                        <div className="text-[9px] text-zinc-400 uppercase">SHADER</div>
                        <div className="text-[11px] font-black text-cyan-300 uppercase truncate">
                          {activeAdminTheme.animatedBgType}
                        </div>
                      </div>
                    </div>

                    {/* Interactive Showroom Titanium Phone Viewport */}
                    <div className="relative mx-auto w-full max-w-[330px] h-[520px] rounded-[44px] p-2.5 bg-gradient-to-b from-zinc-600 via-zinc-900 to-black border-2 border-amber-400/40 shadow-[0_20px_70px_-10px_rgba(212,175,55,0.35)]">
                      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 w-24 h-5 bg-black rounded-full border border-white/15 flex items-center justify-between px-2.5">
                        <span className="text-[7px] font-black tracking-widest text-amber-400">
                          VOLTIX
                        </span>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      </div>

                      <div className="w-full h-full rounded-[34px] overflow-y-auto overflow-x-hidden no-scrollbar bg-[#040407]">
                        <ProfileRenderer
                          profile={adminDemoProfile}
                          theme={activeAdminTheme}
                          effects={DEFAULT_EFFECTS_CONFIG}
                          isPreview={true}
                          compactPhone={true}
                        />
                      </div>
                    </div>

                    {/* Quick Layout Switcher inside Admin Showroom */}
                    <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1">
                      {PROFILE_LAYOUTS.slice(0, 5).map((ly) => (
                        <button
                          key={ly.id}
                          type="button"
                          onClick={() => setAdminPreviewLayout(ly.id)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold border transition-all ${
                            adminPreviewLayout === ly.id
                              ? 'bg-amber-400 text-black border-amber-300'
                              : 'bg-black/50 text-zinc-400 border-white/10 hover:text-white'
                          }`}
                        >
                          {isRtl ? ly.nameAr : ly.nameEn}
                        </button>
                      ))}
                    </div>

                    {/* Direct Admin Actions on Active Previewed Theme */}
                    <div className="grid grid-cols-2 gap-2.5 pt-1">
                      <button
                        type="button"
                        onClick={() => handleToggleThemeDisable(activeAdminTheme.id)}
                        className={`py-2.5 px-3 rounded-2xl text-xs font-extrabold border flex items-center justify-center gap-1.5 transition-all ${
                          isPreviewDisabled
                            ? 'bg-emerald-500 text-black border-emerald-400'
                            : 'bg-rose-500/20 text-rose-200 border-rose-500/40 hover:bg-rose-500/30'
                        }`}
                      >
                        <Power className="w-3.5 h-3.5" />
                        <span>
                          {isPreviewDisabled
                            ? isRtl
                              ? 'تفعيل الثيم الآن'
                              : 'Enable Theme'
                            : isRtl
                            ? 'تعطيل الثيم مؤقتًا'
                            : 'Disable Theme'}
                        </span>
                      </button>

                      <button
                        type="button"
                        disabled={isPreviewDefault}
                        onClick={() => handleSetDefaultTheme(activeAdminTheme.id)}
                        className={`py-2.5 px-3 rounded-2xl text-xs font-black border flex items-center justify-center gap-1.5 transition-all ${
                          isPreviewDefault
                            ? 'bg-emerald-400/25 text-emerald-200 border-emerald-400/50 cursor-default'
                            : 'bg-gradient-to-r from-[#FDE08D] via-[#D4AF37] to-[#AA771C] text-black border-amber-300 hover:brightness-110'
                        }`}
                      >
                        <Crown className="w-3.5 h-3.5" />
                        <span>
                          {isPreviewDefault
                            ? isRtl
                              ? 'الثيم الافتراضي الحالي'
                              : 'Current Default'
                            : isRtl
                            ? 'تعيين كافتراضي للموقع'
                            : 'Set Site Default'}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Fullscreen Theme Inspector Modal inside Admin */}
              {adminInspectedThemeModal && (
                <div
                  className="fixed inset-0 z-50 bg-black/85 backdrop-blur-2xl flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
                  onClick={() => setAdminInspectedThemeModal(null)}
                >
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="w-[96vw] max-w-[1000px] rounded-[36px] vip-black-card border border-amber-400/50 p-5 sm:p-7 text-white shadow-[0_35px_100px_rgba(0,0,0,0.95)] space-y-5 max-h-[92vh] flex flex-col"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-amber-300">
                          {isRtl ? adminInspectedThemeModal.categoryAr : adminInspectedThemeModal.categoryEn}
                        </span>
                        <h3 className="text-xl font-black">
                          {isRtl ? adminInspectedThemeModal.nameAr : adminInspectedThemeModal.nameEn}
                        </h3>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            handleSetDefaultTheme(adminInspectedThemeModal.id);
                            setAdminInspectedThemeModal(null);
                          }}
                          className="px-4 py-2 rounded-xl bg-amber-400 text-black font-black text-xs"
                        >
                          {isRtl ? 'تعيين كثيم افتراضي للمنصة' : 'Set as Default Theme'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setAdminInspectedThemeModal(null)}
                          className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold"
                        >
                          {isRtl ? 'إغلاق ✕' : 'Close ✕'}
                        </button>
                      </div>
                    </div>

                    <div className="flex-1 overflow-y-auto rounded-[28px] border border-white/15 bg-[#040407] max-h-[68vh]">
                      <ProfileRenderer
                        profile={adminDemoProfile}
                        theme={adminInspectedThemeModal}
                        effects={DEFAULT_EFFECTS_CONFIG}
                        isPreview={true}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })()}

        {/* ====================================================================
            TAB 6: USERS & TELEMETRY (EXECUTIVE CREATORS DIRECTORY)
        ==================================================================== */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            {/* Luxury 5-Card Telemetry Bento Grid */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[
                {
                  label: isRtl ? 'إجمالي المبدعين' : 'Total Creators',
                  value: metrics.totalUsers.toLocaleString(),
                  sub: isRtl ? 'حسابات مسجلة بالمنصة' : 'Registered accounts',
                  icon: Users,
                  color: 'text-amber-300 bg-amber-500/15 border-amber-400/40',
                },
                {
                  label: isRtl ? 'الحسابات النشطة' : 'Active Accounts',
                  value: metrics.activeUsers.toLocaleString(),
                  sub: isRtl ? 'تعمل بكفاءة 100%' : '100% Active status',
                  icon: CheckCircle2,
                  color: 'text-emerald-300 bg-emerald-500/15 border-emerald-400/40',
                },
                {
                  label: isRtl ? 'الهويات المنشورة' : 'Published Hubs',
                  value: metrics.totalProfiles.toLocaleString(),
                  sub: isRtl ? 'صفحات نشطة حيًا' : 'Live public pages',
                  icon: Layers,
                  color: 'text-purple-300 bg-purple-500/15 border-purple-400/40',
                },
                {
                  label: isRtl ? 'إجمالي الزيارات' : 'Total Page Views',
                  value: metrics.totalViews.toLocaleString(),
                  sub: isRtl ? 'مشاهدات الهويات الرقمية' : 'Cumulative impressions',
                  icon: Eye,
                  color: 'text-cyan-300 bg-cyan-500/15 border-cyan-400/40',
                },
                {
                  label: isRtl ? 'إجمالي النقرات (CTR)' : 'Total Link Clicks',
                  value: metrics.totalClicks.toLocaleString(),
                  sub: `${
                    metrics.totalViews > 0
                      ? ((metrics.totalClicks / metrics.totalViews) * 100).toFixed(1)
                      : '0.0'
                  }% ${isRtl ? 'معدل التفاعل' : 'Conversion Rate'}`,
                  icon: MousePointerClick,
                  color: 'text-amber-300 bg-amber-500/15 border-amber-400/40',
                },
              ].map((m, idx) => {
                const Icon = m.icon;
                return (
                  <div
                    key={idx}
                    className="rounded-[26px] vip-black-card border border-white/15 hover:border-amber-400/35 p-5 space-y-2.5 transition-all shadow-[0_15px_45px_rgba(0,0,0,0.65)]"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-extrabold text-zinc-300">{m.label}</span>
                      <span className={`w-9 h-9 rounded-xl border flex items-center justify-center ${m.color}`}>
                        <Icon className="w-4 h-4" />
                      </span>
                    </div>
                    <div className="text-2xl sm:text-3xl font-black text-white">{m.value}</div>
                    <div className="text-[11px] font-bold text-zinc-400">{m.sub}</div>
                  </div>
                );
              })}
            </div>

            <div className="rounded-[30px] vip-black-card border border-white/15 p-6 sm:p-7 space-y-5 shadow-[0_20px_60px_rgba(0,0,0,0.75)]">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-amber-500/15 border border-amber-400/45 flex items-center justify-center text-amber-300">
                      <Users className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-lg font-black text-white">
                        {isRtl
                          ? `دليل حسابات المبدعين والأعضاء (${filteredUsers.length})`
                          : `Platform Creator Accounts (${filteredUsers.length})`}
                      </h2>
                      <p className="text-xs text-zinc-400">
                        {isRtl
                          ? 'تحكم في التوثيق بالشارة الذهبية أو إيقاف/تفعيل الحسابات'
                          : 'Manage gold verification badges and account status'}
                      </p>
                    </div>
                  </div>

                  <div className="relative w-full sm:w-80">
                    <Search className="w-4 h-4 text-amber-400 absolute top-3.5 left-3.5" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={
                        isRtl ? 'بحث بالاسم، المعرف، أو البريد...' : 'Search username or email...'
                      }
                      className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-black/70 border border-white/15 focus:border-amber-400 text-xs font-bold focus:outline-none"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-start text-xs">
                    <thead>
                      <tr className="border-b border-white/10 text-zinc-400 uppercase tracking-wider text-[11px]">
                        <th className="py-3.5 px-3 text-start">{isRtl ? 'المبدع / العضو' : 'Creator'}</th>
                        <th className="py-3.5 px-3 text-start">{isRtl ? 'الحالة والرتبة' : 'Status & Role'}</th>
                        <th className="py-3.5 px-3 text-start">{isRtl ? 'الروابط' : 'Links'}</th>
                        <th className="py-3.5 px-3 text-start">{isRtl ? 'الزيارات / النقرات' : 'Views / Clicks'}</th>
                        <th className="py-3.5 px-3 text-end">{isRtl ? 'إجراءات الإدارة' : 'Actions'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                      {filteredUsers.map((u) => (
                        <tr key={u.id} className="hover:bg-white/[0.03] transition-colors">
                          <td className="py-4 px-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/25 to-black border border-amber-400/40 flex items-center justify-center font-black text-amber-300 text-sm shrink-0">
                                {(u.displayName || u.username || 'V')[0].toUpperCase()}
                              </div>
                              <div>
                                <div className="font-black text-white flex items-center gap-1.5 text-sm">
                                  <span>{u.displayName || u.username}</span>
                                  {u.isVerified && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/40 text-[9px] font-black text-amber-300">
                                      <Sparkles className="w-2.5 h-2.5" />
                                      VIP
                                    </span>
                                  )}
                                </div>
                                <div className="text-zinc-400 font-mono text-[11px]">
                                  @{u.username} • {u.email}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-3">
                            <div className="flex flex-wrap items-center gap-1.5">
                              {u.isSuspended ? (
                                <span className="px-2.5 py-1 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 font-extrabold">
                                  {isRtl ? 'موقوف' : 'Suspended'}
                                </span>
                              ) : (
                                <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-extrabold">
                                  {isRtl ? 'نشط' : 'Active'}
                                </span>
                              )}
                              {u.role === 'ADMIN' && (
                                <span className="px-2.5 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 font-black">
                                  ADMIN
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-3 font-black text-sm">{u._count.links}</td>
                          <td className="py-4 px-3">
                            <span className="font-black text-sm text-white">
                              {u._count.pageViews.toLocaleString()}
                            </span>
                            <span className="text-zinc-500 mx-1">/</span>
                            <span className="font-bold text-amber-300">
                              {u._count.linkClicks.toLocaleString()}
                            </span>
                          </td>
                          <td className="py-4 px-3 text-end">
                            <div className="flex items-center justify-end gap-1.5">
                              <Link
                                href={`/@${u.username}`}
                                target="_blank"
                                className="p-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.15] border border-white/10"
                                title={isRtl ? 'معاينة الصفحة' : 'View Profile'}
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </Link>
                              <button
                                type="button"
                                onClick={() =>
                                  runAdminAction(
                                    { action: 'toggle_verify_user', userId: u.id },
                                    isRtl ? 'تم تحديث حالة التوثيق الملكي' : 'Verification updated'
                                  )
                                }
                                className="px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-400/35 text-amber-300 font-extrabold"
                              >
                                {u.isVerified
                                  ? isRtl
                                    ? 'إلغاء التوثيق'
                                    : 'Unverify'
                                  : isRtl
                                  ? 'توثيق ملكي'
                                  : 'Verify VIP'}
                              </button>
                              {u.role !== 'ADMIN' && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      runAdminAction(
                                        { action: 'toggle_suspend_user', userId: u.id },
                                        isRtl ? 'تم تحديث حالة الحساب' : 'Account status updated'
                                      )
                                    }
                                    className="p-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-white/10 text-zinc-200"
                                    title={isRtl ? 'إيقاف / تفعيل' : 'Suspend / Unsuspend'}
                                  >
                                    <Ban className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      runAdminAction(
                                        { action: 'delete_user', userId: u.id },
                                        isRtl ? 'تم حذف الحساب' : 'User deleted'
                                      )
                                    }
                                    className="p-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/30 border border-rose-500/30 text-rose-300"
                                    title={isRtl ? 'حذف' : 'Delete'}
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
          </div>
        )}

        {/* ====================================================================
            TAB 7: SECURITY SHIELD, REPORTS & ADMINISTRATOR AUDIT TRAIL
        ==================================================================== */}
        {activeTab === 'reports' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Abuse & Content Reports */}
            <div className="lg:col-span-6 rounded-[30px] vip-black-card border border-white/15 p-6 sm:p-7 space-y-5 shadow-[0_20px_60px_rgba(0,0,0,0.75)]">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-emerald-500/15 border border-emerald-400/45 flex items-center justify-center text-emerald-300">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-white">
                      {isRtl ? 'مركز الأمان ومراجعة البلاغات' : 'Security Shield & Content Reports'}
                    </h2>
                    <p className="text-xs text-zinc-400">
                      {isRtl
                        ? 'مراقبة المحتوى وحماية الهويات الرقمية على مدار الساعة'
                        : '24/7 content moderation & platform safety'}
                    </p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/35 text-[11px] font-black text-emerald-300">
                  {openReportsCount === 0
                    ? isRtl
                      ? 'آمن 100%'
                      : '100% Clean'
                    : `${openReportsCount} ${isRtl ? 'مفتوح' : 'Open'}`}
                </span>
              </div>

              {reports.length === 0 ? (
                <div className="rounded-2xl bg-black/50 border border-white/10 py-12 px-6 text-center space-y-2">
                  <ShieldCheck className="w-10 h-10 text-emerald-400 mx-auto" />
                  <div className="text-sm font-black text-white">
                    {isRtl
                      ? 'لا توجد أي بلاغات مفتوحة — المنصة آمنة بالكامل'
                      : 'Zero active reports — Platform is 100% secure'}
                  </div>
                  <p className="text-xs text-zinc-400">
                    {isRtl
                      ? 'سيظهر هنا أي بلاغ يتم إرساله من الزوار لمراجعته فورًا.'
                      : 'Any visitor abuse reports will appear here for immediate review.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {reports.map((rep) => (
                    <div
                      key={rep.id}
                      className="p-4 rounded-2xl bg-black/60 border border-white/10 flex flex-wrap items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="text-xs font-extrabold text-rose-300">
                          {rep.reason} • @{rep.reportedUser?.username}
                        </div>
                        <p className="text-xs text-zinc-300">{rep.reporterNote}</p>
                      </div>
                      {rep.status === 'OPEN' && (
                        <button
                          type="button"
                          onClick={() =>
                            runAdminAction(
                              {
                                action: 'resolve_report',
                                reportId: rep.id,
                                status: 'RESOLVED',
                              },
                              isRtl ? 'تم إغلاق البلاغ بنجاح' : 'Report resolved'
                            )
                          }
                          className="px-3.5 py-2 rounded-xl bg-emerald-500 text-black font-black text-xs"
                        >
                          {isRtl ? 'اعتماد الحل' : 'Resolve'}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Administrator Audit Trail */}
            <div className="lg:col-span-6 rounded-[30px] vip-black-card border border-white/15 p-6 sm:p-7 space-y-5 shadow-[0_20px_60px_rgba(0,0,0,0.75)]">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-amber-500/15 border border-amber-400/45 flex items-center justify-center text-amber-300">
                    <Activity className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-white">
                      {isRtl
                        ? 'سجل عمليات النظام (Executive Audit Trail)'
                        : 'Administrator Audit Trail'}
                    </h2>
                    <p className="text-xs text-zinc-400">
                      {isRtl
                        ? 'توثيق زمني لجميع الإجراءات الإدارية والتحديثات الأمنية'
                        : 'Chronological record of administrative actions'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
                {auditLogs.length === 0 ? (
                  <div className="rounded-2xl bg-black/50 border border-white/10 py-10 text-center text-xs text-zinc-400">
                    {isRtl ? 'لا توجد عمليات مسجلة بعد.' : 'No audit logs recorded yet.'}
                  </div>
                ) : (
                  auditLogs.map((log) => (
                    <div
                      key={log.id}
                      className="p-3.5 rounded-2xl bg-black/60 border border-white/10 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="space-y-0.5">
                        <span className="font-black text-amber-300">{log.action}</span>
                        <p className="text-zinc-300">{log.details}</p>
                      </div>
                      <div className="text-[11px] font-mono text-zinc-500 shrink-0">
                        {new Date(log.createdAt).toLocaleString()}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ====================================================================
          SOVEREIGN EXECUTIVE 100% PINNED & FIXED COMMAND FOOTER BAR
      ==================================================================== */}
      <footer className="shrink-0 z-30 px-4 sm:px-8 pb-3.5 pt-1.5 bg-gradient-to-t from-[#030307] via-[#030307]/90 to-transparent">
        <div className="max-w-[1650px] mx-auto rounded-[24px] bg-[#07070D]/95 border border-amber-400/25 px-6 py-3.5 flex flex-wrap items-center justify-between gap-4 text-xs text-zinc-400 backdrop-blur-2xl shadow-[0_10px_35px_rgba(0,0,0,0.85)]">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-bold text-zinc-200">
              {isRtl
                ? 'نظام القيادة الملكي VoltiX Sovereign Admin OS • متصل بقاعدة البيانات الحية'
                : 'VoltiX Sovereign Admin OS • Connected to Live Configuration Store'}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/" target="_blank" className="text-amber-300 hover:underline font-bold">
              {isRtl ? 'الصفحة الرئيسية' : 'Main Website'}
            </Link>
            <span className="text-zinc-600">•</span>
            <Link href="/dashboard" className="text-zinc-300 hover:text-white font-bold">
              {isRtl ? 'استوديو الهوية (/dashboard)' : 'Creator Studio (/dashboard)'}
            </Link>
          </div>
        </div>
      </footer>
    </div>
  </div>
  );
}

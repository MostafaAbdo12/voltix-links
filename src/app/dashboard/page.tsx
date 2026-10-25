'use client';

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  LayoutDashboard,
  Link2,
  Palette,
  Wand2,
  BarChart3,
  QrCode,
  Settings,
  ShieldAlert,
  LogOut,
  Undo2,
  Redo2,
  RotateCcw,
  Save,
  ExternalLink,
  Plus,
  Trash2,
  Edit3,
  ArrowUp,
  ArrowDown,
  Smartphone,
  Tablet,
  Monitor,
  Check,
  Copy,
  Globe,
  Eye,
  EyeOff,
  X,
  Calendar,
  Music,
  ListMusic,
  Crown,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Type,
  Menu,
  Search,
  Command,
  Radio,
  Terminal,
  Activity,
} from 'lucide-react';
import { useLanguage } from '@/lib/i18n';
import {
  AURA_THEMES,
  ThemeConfig,
  EffectsConfig,
  DEFAULT_EFFECTS_CONFIG,
  mergeThemeWithCustom,
  mergeEffectsConfig,
  ARABIC_FONTS,
  ENGLISH_FONTS,
  ArabicFontFamily,
  EnglishFontFamily,
  LINK_CARD_TYPES,
  PROFILE_LAYOUTS,
  MOOD_PRESETS,
  generateThemeDNA,
  ProfileLayoutType,
  LinkCardType,
  AnimatedBgType,
  ButtonAnimationType,
  MoodPresetType,
} from '@/lib/themes';
import {
  SOCIAL_PLATFORMS,
  OFFICIAL_CHANNEL_PRESETS,
  ChannelQuickPreset,
  OfficialSocialBadge,
  detectSocialPlatformFromUrl,
  detectChannelBadgeLabel,
  formatSocialInputToUrl,
  SocialPlatformId,
  getSocialPlatformDomainPrefix,
  extractUsernameFromSocialUrl,
  getSocialUsernamePlaceholder,
} from '@/lib/social-platforms';
import { AVAILABLE_LINK_ICONS, DynamicIcon } from '@/components/ui/DynamicIcon';
import {
  ProfileRenderer,
  ProfileLinkItem,
  ProfileSocialItem,
  MediaEmbedConfig,
  MediaEmbedTrack,
  detectPlatformFromMediaUrl,
} from '@/components/profile/ProfileRenderer';
import { QrCodeView } from '@/components/profile/QrCodeStudio';
import {
  MiniCardArchitectureVisual,
} from '@/components/profile/LuxuryCardPreview';
import {
  LuxuryThemeShowroomCard,
  HorizontalThemeShowroomCarousel,
} from '@/components/profile/LuxuryThemeShowroomCard';
import {
  BilingualTypographyStudio,
  StickyFontPreviewInspector,
} from '@/components/dashboard/BilingualTypographyStudio';
import {
  ImageCropUploader,
  UniversalImageUploader,
} from '@/components/dashboard/ImageCropUploader';
import { AnalyticsPanel } from '@/components/dashboard/AnalyticsPanel';

type DashboardTab =
  | 'overview'
  | 'links'
  | 'themes'
  | 'typography'
  | 'effects'
  | 'analytics'
  | 'qr-seo'
  | 'settings';

interface CustomThemeRecord {
  id: string;
  name: string;
  baseThemeId: string;
  configJson: string;
}

interface SnapshotState {
  themeId: string;
  layout: ProfileLayoutType;
  customTheme: Partial<ThemeConfig>;
  effects: EffectsConfig;
  displayName: string;
  bio: string;
  sectionsOrder: string[];
}

export default function DashboardPage() {
  const router = useRouter();
  const { locale, toggleLocale, t } = useLanguage();
  const isRtl = locale === 'ar';

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string>('');
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');
  const [previewDevice, setPreviewDevice] = useState<'mobile' | 'tablet' | 'desktop'>('mobile');
  const [mobilePreviewOpen, setMobilePreviewOpen] = useState(false);

  // Scroll-synced Sticky Font Preview vs Theme Preview state
  const typographySectionRef = useRef<HTMLDivElement | null>(null);
  const [isInTypographyZone, setIsInTypographyZone] = useState(false);
  const [customFontPreviewAr, setCustomFontPreviewAr] = useState('');
  const [customFontPreviewEn, setCustomFontPreviewEn] = useState('');

  useEffect(() => {
    if (activeTab !== 'themes') {
      setIsInTypographyZone(false);
      return;
    }

    const checkScrollZone = () => {
      const el = typographySectionRef.current;
      if (!el) {
        setIsInTypographyZone(false);
        return;
      }
      const rect = el.getBoundingClientRect();
      // Activate Sticky Font Preview as soon as the Fonts section reaches the middle/upper viewport
      // and hide it immediately when scrolling back up to the Themes section
      const inFontZone = rect.top <= window.innerHeight * 0.52 && rect.bottom >= 220;
      setIsInTypographyZone(inFontZone);
    };

    checkScrollZone();
    window.addEventListener('scroll', checkScrollZone, { passive: true });
    window.addEventListener('resize', checkScrollZone);
    return () => {
      window.removeEventListener('scroll', checkScrollZone);
      window.removeEventListener('resize', checkScrollZone);
    };
  }, [activeTab]);

  // User & Profile State
  const [userId, setUserId] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [role, setRole] = useState<'USER' | 'ADMIN'>('USER');
  const [isVerified, setIsVerified] = useState(false);
  const [emailVerified, setEmailVerified] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [avatarPos, setAvatarPos] = useState({ zoom: 1, x: 0, y: 0 });
  const [coverUrl, setCoverUrl] = useState('');
  const [coverPos, setCoverPos] = useState({ zoom: 1, x: 0, y: 0 });
  const [profileLocale, setProfileLocale] = useState<'ar' | 'en'>('ar');

  // Performance Optimization: Track initial media to prevent re-uploading megabytes on every save
  const initialAvatarRef = useRef('');
  const initialCoverRef = useRef('');
  const initialAvatarPosRef = useRef({ zoom: 1, x: 0, y: 0 });
  const initialCoverPosRef = useRef({ zoom: 1, x: 0, y: 0 });

  // Theme & Effects State
  const [themeId, setThemeId] = useState('obsidian-luxury');
  const [layout, setLayout] = useState<ProfileLayoutType>('centered');
  const [entranceAnimation, setEntranceAnimation] = useState('cinematic-fade');
  const [moodPreset, setMoodPreset] = useState<MoodPresetType>('luxury');
  const [customTheme, setCustomTheme] = useState<Partial<ThemeConfig>>({});
  const [effects, setEffects] = useState<EffectsConfig>(DEFAULT_EFFECTS_CONFIG);
  const [sectionsOrder, setSectionsOrder] = useState<string[]>([
    'header',
    'social',
    'featured',
    'media',
    'links',
  ]);
  const [mediaEmbed, setMediaEmbed] = useState<MediaEmbedConfig>({
    enabled: false,
    type: 'spotify',
    title: '',
    artist: '',
    url: '',
  });
  const [qrConfig, setQrConfig] = useState({
    fgColor: '#D4AF37',
    bgColor: '#050508',
    includeLogo: true,
  });

  // SEO State
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [ogImageUrl, setOgImageUrl] = useState('');
  const [canonicalUrl, setCanonicalUrl] = useState('');
  const [robotsIndex, setRobotsIndex] = useState(true);

  // Links, Socials, Custom Themes
  const [links, setLinks] = useState<ProfileLinkItem[]>([]);
  const [socialLinks, setSocialLinks] = useState<ProfileSocialItem[]>([]);
  const [savedCustomThemes, setSavedCustomThemes] = useState<CustomThemeRecord[]>([]);
  const [customThemeName, setCustomThemeName] = useState('');
  const studioTabsScrollRef = useRef<HTMLDivElement | null>(null);
  const studioTabBtnRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const scrollStudioTabs = (direction: 'right' | 'left') => {
    const el = studioTabsScrollRef.current;
    if (!el) return;
    const step = Math.max(240, Math.round(el.clientWidth * 0.55));
    const delta = direction === 'right' ? step : -step;
    el.scrollBy({ left: delta, behavior: 'smooth' });
  };

  // Theme DNA Seed Colors
  const [dnaPrimary, setDnaPrimary] = useState('#D4AF37');
  const [dnaSecondary, setDnaSecondary] = useState('#7928CA');
  const [dnaSurface, setDnaSurface] = useState('#050508');

  // Link Editor Modal / Form State
  const [editingLink, setEditingLink] = useState<ProfileLinkItem | null>(null);
  const [linkFormOpen, setLinkFormOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [draggedLinkIndex, setDraggedLinkIndex] = useState<number | null>(null);

  const [formTitle, setFormTitle] = useState('');
  const [formUrl, setFormUrl] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formIcon, setFormIcon] = useState('Globe');
  const [formThumb, setFormThumb] = useState('');
  const [formGroup, setFormGroup] = useState('');
  const [globalCardType, setGlobalCardType] = useState<LinkCardType>('glass');
  const [formCardType, setFormCardType] = useState<LinkCardType>('glass');
  const [formFeatured, setFormFeatured] = useState(false);
  const [formBadge, setFormBadge] = useState('');
  const [formStart, setFormStart] = useState('');
  const [formEnd, setFormEnd] = useState('');
  const [formCustomBg, setFormCustomBg] = useState('');
  const [formCustomGlow, setFormCustomGlow] = useState('');

  // Password Change & Verification State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [verifyPreviewLink, setVerifyPreviewLink] = useState('');
  const [copiedUrl, setCopiedUrl] = useState(false);

  // Next-Gen Spatial Studio State
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [commandQuery, setCommandQuery] = useState('');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // Undo / Redo History Stack
  const [history, setHistory] = useState<SnapshotState[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const showNotification = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3200);
  };

  const pushSnapshot = useCallback(
    (nextSnap: SnapshotState) => {
      setHistory((prev) => {
        const sliced = prev.slice(0, historyIndex + 1);
        return [...sliced.slice(-19), nextSnap];
      });
      setHistoryIndex((idx) => Math.min(idx + 1, 19));
    },
    [historyIndex]
  );

  const handleUndo = () => {
    if (historyIndex <= 0) return;
    const prevSnap = history[historyIndex - 1];
    if (!prevSnap) return;
    setThemeId(prevSnap.themeId);
    setLayout(prevSnap.layout);
    setCustomTheme(prevSnap.customTheme);
    setEffects(prevSnap.effects);
    setDisplayName(prevSnap.displayName);
    setBio(prevSnap.bio);
    setSectionsOrder(prevSnap.sectionsOrder);
    setHistoryIndex(historyIndex - 1);
  };

  const handleRedo = () => {
    if (historyIndex >= history.length - 1) return;
    const nextSnap = history[historyIndex + 1];
    if (!nextSnap) return;
    setThemeId(nextSnap.themeId);
    setLayout(nextSnap.layout);
    setCustomTheme(nextSnap.customTheme);
    setEffects(nextSnap.effects);
    setDisplayName(nextSnap.displayName);
    setBio(nextSnap.bio);
    setSectionsOrder(nextSnap.sectionsOrder);
    setHistoryIndex(historyIndex + 1);
  };

  // Load Initial User Data
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

  useEffect(() => {
    let mounted = true;
    fetch('/api/auth/me')
      .then((res) => {
        if (res.status === 401) {
          router.push('/login');
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (!mounted || !data?.user) return;
        const u = data.user;
        setUserId(u.id);
        setEmail(u.email);
        setUsername(u.username);
        setRole(u.role === 'ADMIN' ? 'ADMIN' : 'USER');
        setIsVerified(Boolean(u.isVerified));
        setEmailVerified(u.emailVerified || null);
        setDisplayName(u.displayName || '');
        setBio(u.bio || '');
        setAvatarUrl(u.avatarUrl || '');
        setCoverUrl(u.coverUrl || '');
        initialAvatarRef.current = u.avatarUrl || '';
        initialCoverRef.current = u.coverUrl || '';
        setProfileLocale(u.locale === 'en' ? 'en' : 'ar');
        try {
          if (u.avatarPosition) {
            const parsed = JSON.parse(u.avatarPosition);
            setAvatarPos(parsed);
            initialAvatarPosRef.current = parsed;
          }
        } catch {}
        try {
          if (u.coverPosition) {
            const parsed = JSON.parse(u.coverPosition);
            setCoverPos(parsed);
            initialCoverPosRef.current = parsed;
          }
        } catch {}

        const pc = u.profileConfig;
        let initialCustomTheme: Partial<ThemeConfig> = {};
        let initialEffects: EffectsConfig = DEFAULT_EFFECTS_CONFIG;
        let initialSections = ['header', 'social', 'featured', 'media', 'links'];

        if (pc) {
          setThemeId(pc.themeId || 'obsidian-luxury');
          setLayout((pc.layout as ProfileLayoutType) || 'centered');
          setEntranceAnimation(pc.entranceAnimation || 'cinematic-fade');
          setMoodPreset((pc.moodPreset as MoodPresetType) || 'luxury');
          setSeoTitle(pc.seoTitle || '');
          setSeoDescription(pc.seoDescription || '');
          setOgImageUrl(pc.ogImageUrl || '');
          setCanonicalUrl(pc.canonicalUrl || '');
          setRobotsIndex(pc.robotsIndex !== false);

          try {
            if (pc.customThemeJson) initialCustomTheme = JSON.parse(pc.customThemeJson);
          } catch {}
          try {
            if (pc.effectsConfigJson) initialEffects = mergeEffectsConfig(pc.effectsConfigJson);
          } catch {}
          try {
            if (pc.sectionsOrderJson) initialSections = JSON.parse(pc.sectionsOrderJson);
          } catch {}
          try {
            if (pc.mediaEmbedJson) {
              const parsed = JSON.parse(pc.mediaEmbedJson);
              if (parsed && typeof parsed === 'object') {
                if (!Array.isArray(parsed.tracks) && (parsed.title || parsed.url)) {
                  parsed.tracks = [
                    {
                      id: 'track-1',
                      title: parsed.title || '',
                      artist: parsed.artist || '',
                      url: parsed.url || '',
                      type: parsed.type || 'youtube',
                    },
                  ];
                }
                setMediaEmbed(parsed);
              }
            }
          } catch {}
          try {
            if (pc.qrConfigJson) setQrConfig(JSON.parse(pc.qrConfigJson));
          } catch {}
        }

        setCustomTheme(initialCustomTheme);
        setEffects(initialEffects);
        setSectionsOrder(initialSections);
        setLinks(u.links || []);
        setSocialLinks(u.socialLinks || []);
        setSavedCustomThemes(u.customThemes || []);

        const resolvedCardType: LinkCardType =
          (initialCustomTheme.defaultCardType as LinkCardType) ||
          (u.links?.[0]?.cardType as LinkCardType) ||
          'glass';
        setGlobalCardType(resolvedCardType);
        setFormCardType(resolvedCardType);

        const snap: SnapshotState = {
          themeId: pc?.themeId || 'obsidian-luxury',
          layout: (pc?.layout as ProfileLayoutType) || 'centered',
          customTheme: initialCustomTheme,
          effects: initialEffects,
          displayName: u.displayName || '',
          bio: u.bio || '',
          sectionsOrder: initialSections,
        };
        setHistory([snap]);
        setHistoryIndex(0);
        setLoading(false);
      })
      .catch(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [router]);

  // Compute Effective Theme for Live Preview
  const effectiveTheme: ThemeConfig = {
    ...mergeThemeWithCustom(themeId, customTheme),
    profileLayout: layout,
  };

  // Save All Profile, Theme, Effects, SEO & Social Changes to Database (Optimized zero-latency save)
  const handleSaveAll = async () => {
    setSaving(true);
    try {
      const sanitizedSocialLinks = socialLinks.map((item) => ({
        ...item,
        url: formatSocialInputToUrl(item.platform as SocialPlatformId, item.url),
      }));
      setSocialLinks(sanitizedSocialLinks);

      const payload: Record<string, unknown> = {
        username,
        displayName,
        bio,
        locale: profileLocale,
        socialLinks: sanitizedSocialLinks,
        profileConfig: {
          themeId,
          layout,
          entranceAnimation,
          moodPreset,
          customThemeJson: customTheme,
          effectsConfigJson: effects,
          sectionsOrderJson: sectionsOrder,
          mediaEmbedJson: mediaEmbed,
          qrConfigJson: qrConfig,
          seoTitle,
          seoDescription,
          ogImageUrl,
          canonicalUrl,
          robotsIndex,
        },
      };

      // Only send heavy media strings across the wire if they were actually modified
      if (avatarUrl !== initialAvatarRef.current) {
        payload.avatarUrl = avatarUrl;
      }
      if (coverUrl !== initialCoverRef.current) {
        payload.coverUrl = coverUrl;
      }
      if (JSON.stringify(avatarPos) !== JSON.stringify(initialAvatarPosRef.current)) {
        payload.avatarPosition = avatarPos;
      }
      if (JSON.stringify(coverPos) !== JSON.stringify(initialCoverPosRef.current)) {
        payload.coverPosition = coverPos;
      }

      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        showNotification(`⚠️ ${data.error || 'Failed to save'}`);
      } else {
        // Sync local reference markers so subsequent saves remain instant
        initialAvatarRef.current = avatarUrl;
        initialCoverRef.current = coverUrl;
        initialAvatarPosRef.current = avatarPos;
        initialCoverPosRef.current = coverPos;
        showNotification(t.savedSuccess);
      }
    } catch {
      showNotification('⚠️ Network error while saving');
    } finally {
      setSaving(false);
    }
  };

  const handleResetDefaults = () => {
    const nextCustom = {};
    const nextEffects = DEFAULT_EFFECTS_CONFIG;
    setCustomTheme(nextCustom);
    setEffects(nextEffects);
    pushSnapshot({
      themeId,
      layout,
      customTheme: nextCustom,
      effects: nextEffects,
      displayName,
      bio,
      sectionsOrder,
    });
    showNotification(isRtl ? 'تمت استعادة الإعدادات الافتراضية للثيم' : 'Theme defaults restored');
  };

  const updateCustomThemeField = <K extends keyof ThemeConfig>(key: K, value: ThemeConfig[K]) => {
    const next = { ...customTheme, [key]: value };
    setCustomTheme(next);
    pushSnapshot({
      themeId,
      layout,
      customTheme: next,
      effects,
      displayName,
      bio,
      sectionsOrder,
    });
  };

  const updateEffectField = <K extends keyof EffectsConfig>(key: K, value: EffectsConfig[K]) => {
    const next = { ...effects, [key]: value };
    setEffects(next);
    pushSnapshot({
      themeId,
      layout,
      customTheme,
      effects: next,
      displayName,
      bio,
      sectionsOrder,
    });
  };

  // ==========================================================================
  // EMBEDDED MEDIA PLAYLIST OPERATIONS
  // ==========================================================================
  const playlistTracks: MediaEmbedTrack[] = useMemo(() => {
    if (Array.isArray(mediaEmbed.tracks) && mediaEmbed.tracks.length > 0) {
      return mediaEmbed.tracks;
    }
    if (mediaEmbed.title || mediaEmbed.url) {
      return [
        {
          id: 'track-default-1',
          title: mediaEmbed.title || '',
          artist: mediaEmbed.artist || '',
          url: mediaEmbed.url || '',
          type: mediaEmbed.type || 'youtube',
        },
      ];
    }
    return [
      {
        id: 'track-default-1',
        title: '',
        artist: '',
        url: '',
        type: 'youtube',
      },
    ];
  }, [mediaEmbed.tracks, mediaEmbed.title, mediaEmbed.artist, mediaEmbed.url, mediaEmbed.type]);

  const handleAddPlaylistTrack = () => {
    const newTrack: MediaEmbedTrack = {
      id: `track-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title: isRtl ? `مقطع جديد #${playlistTracks.length + 1}` : `New Track #${playlistTracks.length + 1}`,
      artist: '',
      url: '',
      type: 'youtube',
    };
    const nextTracks = [...playlistTracks, newTrack];
    setMediaEmbed((prev) => ({
      ...prev,
      tracks: nextTracks,
      title: nextTracks[0]?.title || prev.title,
      artist: nextTracks[0]?.artist || prev.artist,
      url: nextTracks[0]?.url || prev.url,
      type: nextTracks[0]?.type || prev.type,
    }));
  };

  const handleUpdatePlaylistTrack = (index: number, updates: Partial<MediaEmbedTrack>) => {
    const nextTracks = [...playlistTracks];
    if (updates.url && !updates.type) {
      updates.type = detectPlatformFromMediaUrl(updates.url);
    }
    nextTracks[index] = { ...nextTracks[index], ...updates };
    setMediaEmbed((prev) => ({
      ...prev,
      tracks: nextTracks,
      title: nextTracks[0]?.title || '',
      artist: nextTracks[0]?.artist || '',
      url: nextTracks[0]?.url || '',
      type: nextTracks[0]?.type || 'youtube',
    }));
  };

  const handleDeletePlaylistTrack = (index: number) => {
    if (playlistTracks.length <= 1) {
      const clearedTracks: MediaEmbedTrack[] = [
        {
          id: playlistTracks[0]?.id || 'track-1',
          title: '',
          artist: '',
          url: '',
          type: 'youtube',
        },
      ];
      setMediaEmbed((prev) => ({
        ...prev,
        tracks: clearedTracks,
        title: '',
        artist: '',
        url: '',
        type: 'youtube',
      }));
      return;
    }
    const nextTracks = playlistTracks.filter((_, i) => i !== index);
    setMediaEmbed((prev) => ({
      ...prev,
      tracks: nextTracks,
      title: nextTracks[0]?.title || '',
      artist: nextTracks[0]?.artist || '',
      url: nextTracks[0]?.url || '',
      type: nextTracks[0]?.type || 'youtube',
    }));
  };

  const handleMovePlaylistTrack = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= playlistTracks.length) return;
    const nextTracks = [...playlistTracks];
    const temp = nextTracks[index];
    nextTracks[index] = nextTracks[targetIndex];
    nextTracks[targetIndex] = temp;
    setMediaEmbed((prev) => ({
      ...prev,
      tracks: nextTracks,
      title: nextTracks[0]?.title || '',
      artist: nextTracks[0]?.artist || '',
      url: nextTracks[0]?.url || '',
      type: nextTracks[0]?.type || 'youtube',
    }));
  };
  const openAddLinkModal = () => {
    setEditingLink(null);
    setFormTitle('');
    setFormUrl('https://');
    setFormDesc('');
    setFormIcon('Sparkles');
    setFormThumb('');
    setFormGroup('');
    setFormCardType(globalCardType || effectiveTheme.defaultCardType || 'glass');
    setFormFeatured(false);
    setFormBadge('');
    setFormStart('');
    setFormEnd('');
    setFormCustomBg('');
    setFormCustomGlow('');
    setLinkFormOpen(true);
  };

  const openAddChannelPresetModal = (preset: ChannelQuickPreset) => {
    setEditingLink(null);
    setFormTitle(isRtl ? preset.defaultTitleAr : preset.defaultTitleEn);
    setFormUrl(preset.urlPrefix);
    setFormDesc(isRtl ? preset.defaultDescAr : preset.defaultDescEn);
    setFormIcon(preset.platformId);
    setFormThumb('');
    setFormGroup(isRtl ? 'القنوات والمجتمعات الرسمية' : 'Official Channels');
    setFormCardType(globalCardType || effectiveTheme.defaultCardType || 'glass');
    setFormFeatured(false);
    setFormBadge(isRtl ? preset.badgeAr : preset.badgeEn);
    setFormStart('');
    setFormEnd('');
    setFormCustomBg('');
    setFormCustomGlow('');
    setLinkFormOpen(true);
  };

  const openEditLinkModal = (link: ProfileLinkItem) => {
    setEditingLink(link);
    setFormTitle(link.title);
    setFormUrl(link.url);
    setFormDesc(link.description || '');
    setFormIcon(link.icon || 'Globe');
    setFormThumb(link.thumbnailUrl || '');
    setFormGroup(link.groupName || '');
    setFormCardType((link.cardType as LinkCardType) || 'glass');
    setFormFeatured(Boolean(link.isFeatured));
    setFormBadge(link.badgeText || '');
    setFormStart(link.scheduledStart ? String(link.scheduledStart).slice(0, 16) : '');
    setFormEnd(link.scheduledEnd ? String(link.scheduledEnd).slice(0, 16) : '');
    let cBg = '';
    let cGlow = '';
    if (link.customStyleJson) {
      try {
        const parsed = JSON.parse(link.customStyleJson);
        cBg = parsed.bg || '';
        cGlow = parsed.glow || '';
      } catch {}
    }
    setFormCustomBg(cBg);
    setFormCustomGlow(cGlow);
    setLinkFormOpen(true);
  };

  const handleSaveLinkForm = async (e: React.FormEvent) => {
    e.preventDefault();
    const customStyleObj: Record<string, string> = {};
    if (formCustomBg) customStyleObj.bg = formCustomBg;
    if (formCustomGlow) customStyleObj.glow = formCustomGlow;

    const payload = {
      title: formTitle,
      url: formUrl,
      description: formDesc,
      icon: formIcon,
      thumbnailUrl: formThumb,
      groupName: formGroup,
      cardType: formCardType,
      isFeatured: formFeatured,
      badgeText: formBadge,
      scheduledStart: formStart ? new Date(formStart).toISOString() : null,
      scheduledEnd: formEnd ? new Date(formEnd).toISOString() : null,
      customStyleJson: JSON.stringify(customStyleObj),
    };

    if (editingLink) {
      const res = await fetch(`/api/links/${editingLink.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok && data.link) {
        setLinks((prev) => prev.map((l) => (l.id === editingLink.id ? data.link : l)));
        setLinkFormOpen(false);
        showNotification(isRtl ? 'تم تحديث الرابط بنجاح ✨' : 'Link updated ✨');
      } else {
        showNotification(`⚠️ ${data.error || 'Error'}`);
      }
    } else {
      const res = await fetch('/api/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok && data.link) {
        setLinks((prev) => [...prev, data.link]);
        setLinkFormOpen(false);
        showNotification(isRtl ? 'تمت إضافة الرابط بنجاح ✨' : 'Link created ✨');
      } else {
        showNotification(`⚠️ ${data.error || 'Error'}`);
      }
    }
  };

  const handleToggleLinkActive = async (link: ProfileLinkItem) => {
    // 1. Optimistic instant UI update (zero perceptible latency)
    const nextState = !link.isActive;
    setLinks((prev) => prev.map((l) => (l.id === link.id ? { ...l, isActive: nextState } : l)));

    // 2. Background sync
    try {
      const res = await fetch(`/api/links/${link.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: nextState }),
      });
      const data = await res.json();
      if (res.ok && data.link) {
        setLinks((prev) => prev.map((l) => (l.id === link.id ? data.link : l)));
      } else {
        // Rollback on failure
        setLinks((prev) => prev.map((l) => (l.id === link.id ? { ...l, isActive: !nextState } : l)));
      }
    } catch {
      setLinks((prev) => prev.map((l) => (l.id === link.id ? { ...l, isActive: !nextState } : l)));
    }
  };

  const handleDeleteLinkConfirmed = async (id: string) => {
    const res = await fetch(`/api/links/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setLinks((prev) => prev.filter((l) => l.id !== id));
      setDeleteConfirmId(null);
      showNotification(isRtl ? 'تم حذف الرابط' : 'Link deleted');
    }
  };

  const persistLinkOrder = async (newLinks: ProfileLinkItem[]) => {
    setLinks(newLinks);
    await fetch('/api/links', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderedIds: newLinks.map((l) => l.id) }),
    });
  };

  const moveLinkByOffset = (index: number, offset: -1 | 1) => {
    const target = index + offset;
    if (target < 0 || target >= links.length) return;
    const copy = [...links];
    const [moved] = copy.splice(index, 1);
    copy.splice(target, 0, moved);
    persistLinkOrder(copy);
  };

  const handleApplyCardTypeToAll = async (cardType: LinkCardType) => {
    // 1. Immediately update UI state so preview updates without any latency
    setGlobalCardType(cardType);
    setFormCardType(cardType);
    setLinks((prev) => prev.map((l) => ({ ...l, cardType })));
    const nextCustomTheme = { ...customTheme, defaultCardType: cardType };
    setCustomTheme(nextCustomTheme);
    pushSnapshot({
      themeId,
      layout,
      customTheme: nextCustomTheme,
      effects,
      displayName,
      bio,
      sectionsOrder,
    });

    try {
      // 2. Persist to /api/links (all user links in database)
      const res = await fetch('/api/links', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applyCardTypeToAll: true, cardType }),
      });
      const data = await res.json();
      if (res.ok && data.links) {
        setLinks(data.links);
      }

      // 3. Persist defaultCardType to profileConfig so it survives page reloads & new links
      await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profileConfig: {
            themeId,
            customThemeJson: JSON.stringify(nextCustomTheme),
          },
        }),
      });

      showNotification(
        isRtl
          ? 'تم تعميم وتطبيق نمط البطاقة على جميع الروابط الحالية والجديدة بنجاح ✨'
          : 'Applied & saved card style to all current and future links ✨'
      );
    } catch (err) {
      console.error('Error applying card type to all:', err);
    }
  };

  // ==========================================================================
  // CUSTOM THEME SAVE & THEME DNA
  // ==========================================================================
  const handleSaveCustomThemePreset = async () => {
    if (!customThemeName.trim()) return;
    const res = await fetch('/api/themes/custom', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: customThemeName,
        baseThemeId: themeId,
        configJson: customTheme,
      }),
    });
    const data = await res.json();
    if (res.ok && data.customTheme) {
      setSavedCustomThemes((prev) => [data.customTheme, ...prev]);
      setCustomThemeName('');
      showNotification(isRtl ? 'تم حفظ الثيم المخصص باسمك ✨' : 'Custom theme saved ✨');
    }
  };

  const handleDeleteCustomThemePreset = async (id: string) => {
    const res = await fetch(`/api/themes/custom?id=${id}`, { method: 'DELETE' });
    if (res.ok) {
      setSavedCustomThemes((prev) => prev.filter((c) => c.id !== id));
    }
  };

  const handleGenerateDNA = () => {
    const generated = generateThemeDNA(dnaPrimary, dnaSecondary, dnaSurface, moodPreset);
    const merged = { ...customTheme, ...generated };
    setCustomTheme(merged);
    pushSnapshot({
      themeId,
      layout,
      customTheme: merged,
      effects,
      displayName,
      bio,
      sectionsOrder,
    });
    showNotification(
      isRtl ? 'تم توليد Theme DNA وتطبيقه على المعاينة المباشرة ✨' : 'Theme DNA generated ✨'
    );
  };

  const handleApplyMoodPreset = (moodId: MoodPresetType) => {
    const found = MOOD_PRESETS.find((m) => m.id === moodId);
    if (!found) return;
    setMoodPreset(moodId);
    const nextTheme = { ...customTheme, ...found.themeOverrides };
    const nextEffects = { ...effects, ...found.effectsOverrides };
    setCustomTheme(nextTheme);
    setEffects(nextEffects);
    pushSnapshot({
      themeId,
      layout,
      customTheme: nextTheme,
      effects: nextEffects,
      displayName,
      bio,
      sectionsOrder,
    });
    showNotification(
      isRtl ? `تم تطبيق المزاج البصري: ${found.nameAr}` : `Applied ${found.nameEn} mood`
    );
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  const [mountedHost, setMountedHost] = useState('');
  const [mountedOrigin, setMountedOrigin] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setMountedHost(window.location.host);
      setMountedOrigin(window.location.origin);
    }
  }, []);

  const publicUrl =
    mountedOrigin
      ? `${mountedOrigin}/@${username}`
      : typeof window !== 'undefined'
      ? `${window.location.origin}/@${username}`
      : `/@${username}`;

  const displayUrl =
    mountedHost
      ? `${mountedHost}/@${username}`
      : typeof window !== 'undefined'
      ? `${window.location.host}/@${username}`
      : `/@${username}`;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050508] text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-16 h-16 rounded-2xl bg-black/70 border border-amber-400/40 p-1.5 flex items-center justify-center animate-pulse shadow-2xl">
            <img
              src="/voltix-logo.png"
              alt="VoltiX Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <span
            dir="ltr"
            className="text-xs font-bold tracking-widest uppercase text-amber-300"
          >
            LOADING VOLTIX STUDIO...
          </span>
        </div>
      </div>
    );
  }

  const previewProfileData = {
    id: userId,
    username,
    displayName,
    bio,
    avatarUrl,
    avatarPosition: avatarPos,
    coverUrl,
    coverPosition: coverPos,
    isVerified,
    locale: profileLocale,
    links,
    socialLinks,
    sectionsOrder,
    mediaEmbed,
    qrConfig,
  };

  const studioStations: {
    id: DashboardTab;
    labelAr: string;
    labelEn: string;
    subAr: string;
    subEn: string;
    icon: React.ElementType;
    badge?: string | number;
  }[] = [
    {
      id: 'overview',
      labelAr: t.overview,
      labelEn: 'Overview & Mission',
      subAr: 'النبض الحي ومقاييس الحساب',
      subEn: 'Live Pulse & Telemetry',
      icon: LayoutDashboard,
    },
    {
      id: 'links',
      labelAr: t.linksManager,
      labelEn: 'Links & Social Channels',
      subAr: 'بطاقات المحتوى والتواصل',
      subEn: 'Content Cards & Socials',
      icon: Link2,
      badge: links.length,
    },
    {
      id: 'themes',
      labelAr: isRtl ? 'محرك الثيمات والتخطيطات' : 'Themes & Layouts',
      labelEn: 'Themes & Layouts Engine',
      subAr: '30 ثيمًا فخمًا و7 تخطيطات',
      subEn: '30 Signature Themes',
      icon: Palette,
      badge: AURA_THEMES.length,
    },
    {
      id: 'typography',
      labelAr: isRtl ? 'استوديو الخطوط الفاخرة' : 'Typography Studio',
      labelEn: 'Bilingual Typography',
      subAr: '24 خطاً عربياً وإنجليزياً متناسقاً',
      subEn: '24 Precision Typefaces',
      icon: Type,
      badge: ARABIC_FONTS.length,
    },
    {
      id: 'effects',
      labelAr: t.effectsStudio,
      labelEn: 'Visual FX & Motion Studio',
      subAr: 'خلفيات حية وفيزياء حركية',
      subEn: 'Living Canvas & Dynamic FX',
      icon: Wand2,
    },
    {
      id: 'analytics',
      labelAr: t.analytics,
      labelEn: 'Neural Analytics & CTR',
      subAr: 'حجم الزيارات ومعدلات التفاعل',
      subEn: 'Audience Traffic & CTR',
      icon: BarChart3,
    },
    {
      id: 'qr-seo',
      labelAr: t.qrAndSeo,
      labelEn: '4K QR Studio & SEO Meta',
      subAr: 'باركود مخصص وبيانات المشاركة',
      subEn: 'Custom Barcode & Social Meta',
      icon: QrCode,
    },
    {
      id: 'settings',
      labelAr: t.accountSettings,
      labelEn: 'Account & Identity Studio',
      subAr: 'البروفايل، الأمان، وكلمة المرور',
      subEn: 'Profile, Security & Password',
      icon: Settings,
    },
  ];

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
            {/* Top Specular Gold Hairline */}
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
                    ? 'ابحث في استوديو الهوية، أو اضغط على أمر سريع... (ESC للإغلاق)'
                    : 'Search studio stations, features, or quick commands... (ESC to close)'
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
                {isRtl ? 'محطات الاستوديو الإبداعي' : 'Creative Studio Stations'}
              </div>
              {studioStations
                .filter(
                  (tab) =>
                    !commandQuery ||
                    (isRtl ? tab.labelAr : tab.labelEn)
                      .toLowerCase()
                      .includes(commandQuery.toLowerCase()) ||
                    (isRtl ? tab.subAr : tab.subEn)
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
                            {isRtl ? tab.subAr : tab.subEn}
                          </div>
                        </div>
                      </div>
                      <ChevronLeft className="w-4 h-4 text-zinc-500 rtl:rotate-0 rotate-180 group-hover:text-amber-400" />
                    </button>
                  );
                })}

              <div className="text-[10px] font-black uppercase tracking-wider text-amber-400/80 px-2.5 pt-3 pb-1">
                {isRtl ? 'إجراءات إبداعية فورية' : 'Quick Actions & Studio Tools'}
              </div>

              {/* Add New Link */}
              <button
                type="button"
                onClick={() => {
                  setEditingLink(null);
                  setFormTitle('');
                  setFormUrl('');
                  setFormDesc('');
                  setFormIcon('Globe');
                  setFormThumb('');
                  setFormGroup('');
                  setFormCardType('glass');
                  setFormFeatured(false);
                  setFormBadge('');
                  setFormStart('');
                  setFormEnd('');
                  setFormCustomBg('');
                  setFormCustomGlow('');
                  setLinkFormOpen(true);
                  setIsCommandPaletteOpen(false);
                }}
                className="w-full flex items-center justify-between p-2.5 rounded-2xl hover:bg-white/5 text-start text-xs font-bold transition-all"
              >
                <div className="flex items-center gap-3">
                  <Plus className="w-4 h-4 text-amber-400" />
                  <span>{isRtl ? 'إضافة رابط أو بطاقة جديدة الآن' : 'Add New Link Card'}</span>
                </div>
                <span className="text-[10px] font-mono text-amber-300/80">+ Add</span>
              </button>

              {/* Copy Profile Link */}
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(publicUrl);
                  setCopiedUrl(true);
                  setTimeout(() => setCopiedUrl(false), 2000);
                  showNotification(isRtl ? '📋 تم نسخ رابط صفحتك العامة' : '📋 Profile URL copied');
                  setIsCommandPaletteOpen(false);
                }}
                className="w-full flex items-center justify-between p-2.5 rounded-2xl hover:bg-white/5 text-start text-xs font-bold transition-all"
              >
                <div className="flex items-center gap-3">
                  <Copy className="w-4 h-4 text-emerald-400" />
                  <span>{isRtl ? 'نسخ رابط صفحتي العامة' : 'Copy Public Profile URL'}</span>
                </div>
                <span className="text-[10px] font-mono text-zinc-500">Ctrl+C</span>
              </button>

              {/* Save All Changes */}
              <button
                type="button"
                onClick={() => {
                  handleSaveAll();
                  setIsCommandPaletteOpen(false);
                }}
                className="w-full flex items-center justify-between p-2.5 rounded-2xl hover:bg-white/5 text-start text-xs font-bold transition-all"
              >
                <div className="flex items-center gap-3">
                  <Save className="w-4 h-4 text-amber-300" />
                  <span>{isRtl ? 'حفظ كافة التغييرات ونشرها' : 'Save & Publish All Changes'}</span>
                </div>
                <span className="text-[10px] font-mono text-zinc-500">Ctrl+S</span>
              </button>

              {/* Live Preview */}
              <Link
                href={`/@${username}`}
                target="_blank"
                onClick={() => setIsCommandPaletteOpen(false)}
                className="w-full flex items-center justify-between p-2.5 rounded-2xl hover:bg-white/5 text-start text-xs font-bold transition-all"
              >
                <div className="flex items-center gap-3">
                  <ExternalLink className="w-4 h-4 text-cyan-400" />
                  <span>{isRtl ? 'فتح الصفحة الحية في نافذة جديدة' : 'Open Live Profile in New Tab'}</span>
                </div>
                <span className="text-[10px] font-mono text-zinc-500">/@{username}</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          SOVEREIGN EXECUTIVE STUDIO RAIL (Desktop Fixed Rail / Mobile Slide-Over)
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

        {/* Creator Identity Pod */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between">
          <Link href={`/@${username}`} target="_blank" className="flex items-center gap-3 min-w-0 group">
            <div className="relative w-11 h-11 rounded-2xl ring-2 ring-amber-400/60 ring-offset-2 ring-offset-black bg-gradient-to-br from-amber-400/20 via-zinc-900 to-black p-0.5 flex items-center justify-center shrink-0 overflow-hidden shadow-[0_0_20px_rgba(212,175,55,0.3)] group-hover:scale-105 transition-transform">
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatarUrl}
                  alt={displayName}
                  className="w-full h-full object-cover rounded-xl"
                  style={{ objectPosition: `${avatarPos.x}% ${avatarPos.y}%` }}
                />
              ) : (
                <span className="text-base font-black gold-gradient-text uppercase">
                  {username ? username.charAt(0) : 'V'}
                </span>
              )}
              <span
                className="absolute -bottom-1 -right-1 w-4.5 h-4.5 rounded-full flex items-center justify-center text-black z-10 shadow-lg"
                style={{
                  background: 'linear-gradient(135deg, #FFF7C2, #F59E0B)',
                  border: '1.5px solid #000',
                  boxShadow: '0 0 10px rgba(251, 191, 36, 0.95)',
                }}
              >
                <Crown className="w-2.5 h-2.5 fill-black stroke-black" />
              </span>
            </div>

            <div dir="ltr" className="text-left min-w-0">
              <div className="flex items-center gap-1.5 leading-none">
                <span className="font-black text-sm text-white truncate group-hover:text-amber-300 transition-colors">
                  {displayName || username || 'Creator'}
                </span>
              </div>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] text-zinc-400 font-mono leading-none truncate">
                  /@{username}
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
              <span>{isRtl ? 'أوامر الاستوديو...' : 'Studio Spotlight...'}</span>
            </div>
            <kbd className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-black/60 border border-white/15 text-amber-300/80">
              Ctrl+K
            </kbd>
          </button>
        </div>

        {/* Navigation Stations Hub (8 Stations) */}
        <div className="flex-1 overflow-y-auto no-scrollbar px-3 py-2 space-y-1">
          <div className="px-2 py-1 text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500">
            {isRtl ? 'محطات الاستوديو الإبداعي' : 'Studio Stations'}
          </div>

          {studioStations.map((tab, idx) => {
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
                      {isRtl ? tab.subAr : tab.subEn}
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
          {/* Public Profile Copy URL Pill */}
          <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-between gap-2">
            <a
              href={publicUrl}
              target="_blank"
              rel="noopener noreferrer"
              dir="ltr"
              className="min-w-0 flex items-center gap-1.5 text-zinc-300 hover:text-amber-300 text-xs font-mono truncate transition-colors group"
              title={isRtl ? 'فتح الرابط في نافذة جديدة' : 'Open in new tab'}
            >
              <Globe className="w-3.5 h-3.5 text-amber-400 shrink-0 group-hover:scale-110 transition-transform" />
              <span className="truncate">{displayUrl}</span>
              <ExternalLink className="w-3 h-3 opacity-50 group-hover:opacity-100 shrink-0" />
            </a>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(publicUrl);
                setCopiedUrl(true);
                setTimeout(() => setCopiedUrl(false), 2000);
              }}
              className="h-7 px-2.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-400/35 text-[10px] font-black text-amber-300 transition-all shrink-0 flex items-center gap-1"
            >
              {copiedUrl ? (
                <>
                  <Check className="w-3 h-3 text-emerald-400" />
                  <span className="text-emerald-300">{isRtl ? 'تم' : 'Done'}</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3 text-amber-300" />
                  <span>{isRtl ? 'نسخ' : 'Copy'}</span>
                </>
              )}
            </button>
          </div>

          {/* Quick Bridge & Utilities Row */}
          <div className="flex items-center gap-1.5">
            {role === 'ADMIN' && (
              <Link
                href="/admin"
                className="flex-1 h-9 px-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-400/30 text-[11px] font-black text-amber-300 flex items-center justify-center gap-1.5 transition-all"
                title={isRtl ? 'لوحة القيادة الإدارية للمنصة' : 'Platform Sovereign Admin OS'}
              >
                <Crown className="w-3.5 h-3.5 shrink-0" />
                <span>{isRtl ? 'لوحة الإدارة' : 'Admin OS'}</span>
              </Link>
            )}

            <button
              type="button"
              onClick={toggleLocale}
              className={`h-9 ${
                role === 'ADMIN' ? 'px-3 shrink-0' : 'flex-1 px-4'
              } rounded-xl bg-white/[0.04] hover:bg-white/[0.09] border border-white/10 text-xs font-black text-zinc-200 transition-all flex items-center justify-center gap-1.5`}
              title="Toggle Language"
            >
              <span>{isRtl ? 'EN' : 'العربية'}</span>
            </button>

            <button
              type="button"
              onClick={handleLogout}
              title={t.logout}
              className="h-9 w-9 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/25 text-rose-300 flex items-center justify-center transition-all shrink-0"
            >
              <LogOut className="w-3.5 h-3.5" />
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
                <span>SPATIAL STUDIO</span>
              </span>
              <span className="text-zinc-600 hidden sm:inline">/</span>
              <h1 className="text-sm sm:text-base font-black text-white truncate flex items-center gap-2">
                <span className="gold-gradient-text">
                  {isRtl
                    ? studioStations.find((t) => t.id === activeTab)?.labelAr
                    : studioStations.find((t) => t.id === activeTab)?.labelEn}
                </span>
              </h1>
            </div>
          </div>

          {/* Right: History + Live Preview Link + Primary Save Button */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Undo / Redo */}
            <div className="hidden sm:flex items-center p-1 rounded-xl bg-black/60 border border-white/10 gap-0.5">
              <button
                type="button"
                onClick={handleUndo}
                disabled={historyIndex <= 0}
                title={t.undo}
                className="p-1.5 rounded-lg hover:bg-white/10 disabled:opacity-30 text-zinc-400 hover:text-white transition-all"
              >
                <Undo2 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleRedo}
                disabled={historyIndex >= history.length - 1}
                title={t.redo}
                className="p-1.5 rounded-lg hover:bg-white/10 disabled:opacity-30 text-zinc-400 hover:text-white transition-all"
              >
                <Redo2 className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* View Live Public Profile */}
            <Link
              href={`/@${username}`}
              target="_blank"
              className="h-10 px-3.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.09] border border-white/15 text-xs font-bold text-zinc-200 hover:text-white flex items-center gap-1.5 transition-all whitespace-nowrap shadow-inner"
            >
              <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden md:inline">{t.viewProfile}</span>
            </Link>

            {/* Primary Save Button */}
            <button
              type="button"
              onClick={handleSaveAll}
              disabled={saving}
              className="h-10 px-5 rounded-xl bg-gradient-to-r from-[#FDE08D] via-[#D4AF37] to-[#AA771C] text-black font-black text-xs sm:text-sm flex items-center gap-2 shadow-[0_6px_25px_rgba(212,175,55,0.45)] hover:brightness-110 active:scale-[0.99] transition-all whitespace-nowrap disabled:opacity-50"
            >
              <Save className="w-4 h-4 shrink-0" />
              <span>{saving ? t.saving : t.saveChanges}</span>
            </button>
          </div>
        </header>

        {/* ====================================================================
            MAIN WORKSPACE WORKSTATION - SCROLLABLE STAGE WITH PINNED PREVIEW
        ==================================================================== */}
        <main className="flex-1 overflow-y-auto no-scrollbar w-full p-4 sm:p-8">
          <div className="max-w-[1650px] w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* MAIN CUSTOMIZATION & MANAGEMENT PANELS (7 COLS IN THEMES & TYPOGRAPHY, CENTERED 12 COLS IN OTHER TABS) */}
            <div
              className={`min-w-0 space-y-6 pb-24 transition-all duration-300 ${
                activeTab === 'themes' || activeTab === 'typography'
                  ? 'lg:col-span-7'
                  : 'lg:col-span-12 max-w-[1120px] w-full mx-auto'
              }`}
            >
          {/* ================================================================
              TAB 1: OVERVIEW (EXECUTIVE VIP SOVEREIGN COMMAND HUB)
          ================================================================ */}
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* Executive VIP Hero Banner */}
              <div className="relative overflow-hidden p-6 sm:p-8 rounded-3xl vip-black-card border border-amber-400/35 shadow-[0_16px_40px_rgba(0,0,0,0.65)]">
                {/* Background Specular Ambient Glow */}
                <div className="pointer-events-none absolute -top-24 -right-24 w-80 h-80 rounded-full bg-gradient-to-br from-amber-400/15 via-amber-600/5 to-transparent blur-3xl" />
                <div className="pointer-events-none absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-gradient-to-tr from-yellow-500/10 via-amber-500/5 to-transparent blur-3xl" />

                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  {/* Left: User Identity & Sovereign Live Status */}
                  <div className="flex items-start sm:items-center gap-4 min-w-0">
                    <div className="relative shrink-0">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden ring-2 ring-amber-400/60 ring-offset-2 ring-offset-black bg-gradient-to-br from-amber-500/20 via-zinc-900 to-black flex items-center justify-center shadow-xl">
                        {avatarUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={avatarUrl}
                            alt={displayName}
                            className="w-full h-full object-cover"
                            style={{
                              objectPosition: `${avatarPos.x}% ${avatarPos.y}%`,
                            }}
                          />
                        ) : (
                          <span className="text-2xl sm:text-3xl font-black gold-gradient-text uppercase">
                            {username.charAt(0)}
                          </span>
                        )}
                      </div>
                      {/* Luminous Royal Verification Badge (Positioned Proudly Outside the Frame) */}
                      <span
                        className="absolute -bottom-2 -right-2 sm:-bottom-2.5 sm:-right-2.5 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center z-20 transition-transform group-hover:scale-110 shadow-2xl"
                        style={{
                          background: 'linear-gradient(135deg, #FFF9D2 0%, #F59E0B 45%, #D97706 80%, #78350F 100%)',
                          border: '2.5px solid #040407',
                          boxShadow: '0 0 16px rgba(251, 191, 36, 1), 0 0 32px rgba(217, 119, 6, 0.75), inset 0 1.5px 2px rgba(255, 255, 255, 0.85)',
                        }}
                        title={isRtl ? 'هوية ملكية موثقة رسميًا' : 'Royal Verified Identity'}
                      >
                        {/* Ambient Pulsing Glow Halo */}
                        <span className="absolute -inset-1 rounded-full bg-amber-400/80 blur-sm animate-pulse pointer-events-none" />
                        <Crown className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-black fill-black relative z-10 drop-shadow-[0_1px_1px_rgba(255,255,255,0.4)]" />
                      </span>
                    </div>

                    <div className="space-y-1.5 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-amber-300 bg-amber-500/15 border border-amber-400/35 px-2.5 py-0.5 rounded-full">
                          <Sparkles className="w-3 h-3 text-amber-300" />
                          <span>SOVEREIGN COMMAND OS</span>
                        </span>
                        <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-300 bg-emerald-500/12 border border-emerald-500/35 px-2.5 py-0.5 rounded-full">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          {isRtl ? 'الصفحة نشطة ومزامنة لحظية' : 'Profile Live & Synced'}
                        </span>
                      </div>

                      <h1 className="text-xl sm:text-2xl lg:text-3xl font-black gold-gradient-text truncate leading-tight">
                        {isRtl ? `أهلاً بك، ${displayName}` : `Welcome back, ${displayName}`}
                      </h1>

                      {/* Public URL Pill with 1-Click Copy & Visit */}
                      <div className="flex items-center gap-2 flex-wrap pt-0.5">
                        <a
                          href={publicUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          dir="ltr"
                          className="h-8 px-3 rounded-lg bg-black/60 hover:bg-black/90 border border-white/10 hover:border-amber-400/50 text-xs font-mono text-zinc-300 hover:text-amber-300 flex items-center gap-1.5 transition-all group"
                          title={isRtl ? 'زيارة الرابط في نافذة جديدة' : 'Open in new tab'}
                        >
                          <Globe className="w-3.5 h-3.5 text-amber-400 shrink-0 group-hover:scale-110 transition-transform" />
                          <span className="truncate max-w-[200px] sm:max-w-none">
                            {displayUrl}
                          </span>
                          <ExternalLink className="w-3 h-3 opacity-40 group-hover:opacity-100 shrink-0" />
                        </a>

                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(publicUrl);
                            setCopiedUrl(true);
                            setTimeout(() => setCopiedUrl(false), 2000);
                          }}
                          className="h-8 px-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/15 hover:border-amber-400/40 text-xs font-bold text-zinc-200 hover:text-amber-300 flex items-center gap-1.5 transition-all"
                        >
                          {copiedUrl ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span className="text-emerald-300 font-extrabold">
                                {isRtl ? 'تم النسخ!' : 'Copied!'}
                              </span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5 text-amber-400" />
                              <span>{isRtl ? 'نسخ الرابط' : 'Copy URL'}</span>
                            </>
                          )}
                        </button>

                        <Link
                          href={`/@${username}`}
                          target="_blank"
                          className="h-8 px-3 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-400/40 text-amber-200 text-xs font-extrabold flex items-center gap-1.5 transition-all"
                        >
                          <ExternalLink className="w-3.5 h-3.5 text-amber-300" />
                          <span>{isRtl ? 'معاينة عامة' : 'View Live'}</span>
                        </Link>
                      </div>
                    </div>
                  </div>

                  {/* Right: Quick Launch Primary Actions */}
                  <div className="flex items-center gap-2.5 shrink-0 flex-wrap lg:flex-nowrap">
                    <button
                      type="button"
                      onClick={openAddLinkModal}
                      className="px-5 py-3 rounded-2xl bg-gradient-to-r from-[#FDE08D] via-[#D4AF37] to-[#AA771C] text-black font-black text-xs sm:text-sm flex items-center gap-2 shadow-[0_8px_24px_-4px_rgba(212,175,55,0.6)] hover:brightness-110 hover:scale-[1.02] transition-all"
                    >
                      <Plus className="w-4 h-4 stroke-[3]" />
                      <span>{t.addLink}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('themes')}
                      className="px-4 py-3 rounded-2xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/15 hover:border-amber-400/40 text-xs font-extrabold text-zinc-200 flex items-center gap-2 transition-all"
                    >
                      <Palette className="w-4 h-4 text-amber-400" />
                      <span>{t.themeEngine}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Executive 4-Card Bento Telemetry Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* BENTO 1: Active Theme */}
                <div
                  onClick={() => setActiveTab('themes')}
                  className="group cursor-pointer p-5 rounded-3xl bg-black/60 hover:bg-white/[0.05] border border-white/10 hover:border-amber-400/50 transition-all shadow-lg flex flex-col justify-between gap-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-400/30 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                      <Palette className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-400/30">
                      {isRtl ? '40 ثيمًا متاحًا' : '40 Available'}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <div className="text-[11px] font-extrabold text-zinc-400 uppercase tracking-wider">
                      {isRtl ? 'الثيم المعماري النشط' : 'Active Spatial Theme'}
                    </div>
                    <div className="text-base font-black text-white truncate group-hover:text-amber-300 transition-colors">
                      {isRtl ? effectiveTheme.nameAr : effectiveTheme.nameEn}
                    </div>
                    <div className="flex items-center gap-1.5 pt-1">
                      <span
                        className="w-3 h-3 rounded-full border border-white/30"
                        style={{ backgroundColor: effectiveTheme.accentColor }}
                      />
                      <span
                        className="w-3 h-3 rounded-full border border-white/30"
                        style={{ backgroundColor: effectiveTheme.glowColor }}
                      />
                      <span className="text-[10px] text-zinc-400 font-mono">
                        {isRtl ? effectiveTheme.categoryAr : effectiveTheme.categoryEn}
                      </span>
                    </div>
                  </div>
                  <div className="text-[11px] font-bold text-amber-400/80 group-hover:text-amber-300 flex items-center gap-1 transition-colors">
                    <span>{isRtl ? 'استعراض واختيار ثيم' : 'Explore Themes'}</span>
                    <span className="transition-transform group-hover:translate-x-1">→</span>
                  </div>
                </div>

                {/* BENTO 2: Total Links & Channels */}
                <div
                  onClick={() => setActiveTab('links')}
                  className="group cursor-pointer p-5 rounded-3xl bg-black/60 hover:bg-white/[0.05] border border-white/10 hover:border-emerald-400/50 transition-all shadow-lg flex flex-col justify-between gap-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-400/30 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                      <Link2 className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-400/30">
                      {links.filter((l) => l.isActive !== false).length} {isRtl ? 'نشط' : 'Active'}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <div className="text-[11px] font-extrabold text-zinc-400 uppercase tracking-wider">
                      {isRtl ? 'الروابط والقنوات الرسمية' : 'Links & Official Channels'}
                    </div>
                    <div className="text-base font-black text-white truncate group-hover:text-emerald-300 transition-colors">
                      {links.length} {isRtl ? 'رابط' : 'Links'} • {socialLinks.length}{' '}
                      {isRtl ? 'قناة' : 'Channels'}
                    </div>
                    <div className="text-[10px] text-zinc-400 leading-none pt-1">
                      {isRtl ? 'سحب وإفلات، بطاقات 3D، وتثبيت' : 'Drag-and-drop & 3D cards'}
                    </div>
                  </div>
                  <div className="text-[11px] font-bold text-emerald-400/80 group-hover:text-emerald-300 flex items-center gap-1 transition-colors">
                    <span>{isRtl ? 'إدارة وتنسيق الروابط' : 'Manage Links'}</span>
                    <span className="transition-transform group-hover:translate-x-1">→</span>
                  </div>
                </div>

                {/* BENTO 3: Typography & Fonts */}
                <div
                  onClick={() => setActiveTab('typography')}
                  className="group cursor-pointer p-5 rounded-3xl bg-black/60 hover:bg-white/[0.05] border border-white/10 hover:border-purple-400/50 transition-all shadow-lg flex flex-col justify-between gap-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-2xl bg-purple-500/15 border border-purple-400/30 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                      <Type className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-300 border border-purple-400/30">
                      {isRtl ? '24 خطًا ملكيًا' : '24 Fonts'}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <div className="text-[11px] font-extrabold text-zinc-400 uppercase tracking-wider">
                      {isRtl ? 'الهندسة الطباعية المعتمدة' : 'Bilingual Typography'}
                    </div>
                    <div className="text-base font-black text-white truncate group-hover:text-purple-300 transition-colors">
                      {effectiveTheme.fontFamilyAr || 'Cairo'} • {effectiveTheme.fontFamilyEn || 'Cinzel'}
                    </div>
                    <div className="text-[10px] text-zinc-400 leading-none pt-1">
                      {isRtl ? '12 خطًا عربيًا + 12 إنجليزيًا بمعاينة حية' : 'Live dual font studio'}
                    </div>
                  </div>
                  <div className="text-[11px] font-bold text-purple-400/80 group-hover:text-purple-300 flex items-center gap-1 transition-colors">
                    <span>{isRtl ? 'استوديو الخطوط والتخصيص' : 'Typography Studio'}</span>
                    <span className="transition-transform group-hover:translate-x-1">→</span>
                  </div>
                </div>

                {/* BENTO 4: QR Pass & SEO */}
                <div
                  onClick={() => setActiveTab('qr-seo')}
                  className="group cursor-pointer p-5 rounded-3xl bg-black/60 hover:bg-white/[0.05] border border-white/10 hover:border-cyan-400/50 transition-all shadow-lg flex flex-col justify-between gap-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-2xl bg-cyan-500/15 border border-cyan-400/30 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
                      <QrCode className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-400/30">
                      {isRtl ? 'تصدير 4K' : '4K Ready'}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <div className="text-[11px] font-extrabold text-zinc-400 uppercase tracking-wider">
                      {isRtl ? 'كود QR وبطاقة المشاركة' : 'QR Pass & SEO'}
                    </div>
                    <div className="text-base font-black text-white truncate group-hover:text-cyan-300 transition-colors font-mono">
                      /@{username}
                    </div>
                    <div className="text-[10px] text-zinc-400 leading-none pt-1">
                      {isRtl ? 'مخصص بشعارك وخلفيات زجاجية' : 'Custom watermark & vectors'}
                    </div>
                  </div>
                  <div className="text-[11px] font-bold text-cyan-400/80 group-hover:text-cyan-300 flex items-center gap-1 transition-colors">
                    <span>{isRtl ? 'فتح استوديو الكود و SEO' : 'Open QR Studio'}</span>
                    <span className="transition-transform group-hover:translate-x-1">→</span>
                  </div>
                </div>
              </div>

              {/* Fast Tactical Command Launchers Dock */}
              <div className="p-5 rounded-3xl bg-white/[0.02] border border-white/10 space-y-3">
                <div className="text-xs font-black text-amber-300 uppercase tracking-wider">
                  {isRtl ? '⚡ محطة الإجراءات السريعة الفورية' : '⚡ Tactical Command Launchers'}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <button
                    type="button"
                    onClick={openAddLinkModal}
                    className="p-3.5 rounded-2xl bg-black/60 hover:bg-white/[0.08] border border-white/10 hover:border-amber-400/40 text-start flex items-center gap-3 transition-all group"
                  >
                    <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                      <Plus className="w-4 h-4 stroke-[3]" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-extrabold text-white truncate group-hover:text-amber-300">
                        {isRtl ? 'إضافة رابط' : 'Add Link'}
                      </div>
                      <div className="text-[10px] text-zinc-400 truncate">
                        {isRtl ? 'محتوى أو قناة' : 'New link item'}
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('themes')}
                    className="p-3.5 rounded-2xl bg-black/60 hover:bg-white/[0.08] border border-white/10 hover:border-amber-400/40 text-start flex items-center gap-3 transition-all group"
                  >
                    <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-extrabold text-white truncate group-hover:text-amber-300">
                        {isRtl ? 'الثيمات الملكية' : '40 Themes'}
                      </div>
                      <div className="text-[10px] text-zinc-400 truncate">
                        {isRtl ? 'معمارية وبصريات' : 'Sovereign styles'}
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('effects')}
                    className="p-3.5 rounded-2xl bg-black/60 hover:bg-white/[0.08] border border-white/10 hover:border-purple-400/40 text-start flex items-center gap-3 transition-all group"
                  >
                    <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                      <Wand2 className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-extrabold text-white truncate group-hover:text-purple-300">
                        {isRtl ? 'استوديو التأثيرات' : 'Effects Studio'}
                      </div>
                      <div className="text-[10px] text-zinc-400 truncate">
                        {isRtl ? 'جزيئات وزجاج' : 'Particles & glass'}
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('settings')}
                    className="p-3.5 rounded-2xl bg-black/60 hover:bg-white/[0.08] border border-white/10 hover:border-cyan-400/40 text-start flex items-center gap-3 transition-all group"
                  >
                    <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                      <Settings className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-extrabold text-white truncate group-hover:text-cyan-300">
                        {isRtl ? 'إعدادات الحساب' : 'Account Settings'}
                      </div>
                      <div className="text-[10px] text-zinc-400 truncate">
                        {isRtl ? 'الهوية والصورة' : 'Bio & Avatar'}
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Analytics & Real-Time Performance Section */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-amber-400" />
                    <h2 className="text-sm font-black text-white">
                      {isRtl
                        ? 'تحليلات الأداء والتفاعل اللحظي (Telemetry & Insights)'
                        : 'Real-Time Telemetry & Visitor Insights'}
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('analytics')}
                    className="text-xs font-extrabold text-amber-400 hover:text-amber-300 flex items-center gap-1 transition-colors"
                  >
                    <span>{isRtl ? 'عرض التقرير الكامل' : 'View Full Report'}</span>
                    <span>→</span>
                  </button>
                </div>

                <AnalyticsPanel isRtl={isRtl} />
              </div>
            </div>
          )}

          {/* ================================================================
              TAB 2: LINKS, SOCIALS, MEDIA & SECTIONS MANAGER
          ================================================================ */}
          {activeTab === 'links' && (
            <div className="space-y-6">
              {/* Top Action Bar */}
              <div className="p-6 rounded-3xl bg-white/[0.03] border border-white/10 flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-1">
                  <h2 className="text-lg font-black leading-[1.4]">{t.linksManager}</h2>
                  <p className="text-xs text-zinc-400 leading-[1.7]">
                    {isRtl
                      ? 'أضف روابطك وقنواتك الرسمية (واتساب، تيليغرام، ديسكورد، فيسبوك)، ورتبها بالسحب والإفلات'
                      : 'Add links & official channels (WhatsApp, Telegram, Discord, Facebook) and reorder with drag-and-drop'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={openAddLinkModal}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20"
                >
                  <Plus className="w-4 h-4" />
                  <span>{t.addLink}</span>
                </button>
              </div>

              {/* OFFICIAL CHANNELS & COMMUNITIES QUICK-LAUNCHER (WHATSAPP, TELEGRAM, DISCORD, FACEBOOK) */}
              <div className="p-5 sm:p-6 rounded-3xl vip-black-card border border-amber-400/30 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="space-y-1">
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold text-amber-300">
                      <Crown className="w-3.5 h-3.5" />
                      <span>
                        {isRtl
                          ? 'إضافة سريعة لروابط القنوات والمجتمعات الرسمية'
                          : 'Quick-Add Official Channel & Community Links'}
                      </span>
                    </span>
                    <p className="text-xs text-zinc-300 leading-[1.7]">
                      {isRtl
                        ? 'اضغط على أي قناة لإضافتها فورًا إلى صفحتك بأيقونتها الرسمية وتوهجها الأصلي (واتساب، تيليغرام، ديسكورد، فيسبوك، يوتيوب):'
                        : 'Click any official channel preset to add it with authentic 3D brand icons & glow:'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                  {OFFICIAL_CHANNEL_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => openAddChannelPresetModal(preset)}
                      className="p-3 rounded-2xl bg-black/50 hover:bg-white/[0.08] border border-white/15 hover:border-amber-400/50 flex items-center gap-3 text-start transition-all group"
                    >
                      <div className="transition-transform group-hover:scale-110">
                        <OfficialSocialBadge
                          platformId={preset.platformId}
                          size="sm"
                          variant="gradient"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-extrabold text-white truncate leading-snug">
                          {isRtl ? preset.labelAr : preset.labelEn}
                        </div>
                        <div
                          className="text-[10px] text-zinc-400 font-mono truncate mt-0.5 leading-none"
                          dir="ltr"
                        >
                          {preset.urlPrefix}...
                        </div>
                      </div>
                      <Plus className="w-4 h-4 text-amber-400 shrink-0 opacity-75 group-hover:opacity-100" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Global Card Type Quick Applier with Live Visual Previews */}
              <div className="p-5 sm:p-6 rounded-3xl bg-white/[0.03] border border-white/10 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs sm:text-sm font-black text-amber-300">
                    {isRtl
                      ? 'تعميم التصميم الهندسي للبطاقة على جميع الروابط بمعاينة حية (12 نمطًا):'
                      : 'Apply Architectural Card Style to All Links (12 Live Styles):'}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {LINK_CARD_TYPES.map((ct) => {
                    const active =
                      globalCardType === ct.id ||
                      (effectiveTheme.defaultCardType === ct.id && !globalCardType) ||
                      (links.length > 0 && links.every((l) => l.cardType === ct.id));
                    return (
                      <button
                        key={ct.id}
                        type="button"
                        onClick={() => handleApplyCardTypeToAll(ct.id)}
                        className={`p-3 rounded-2xl border text-start transition-all flex flex-col justify-between gap-2.5 ${
                          active
                            ? 'bg-gradient-to-b from-amber-500/20 to-black border-amber-400 ring-2 ring-amber-400/35 shadow-lg'
                            : 'bg-black/50 border-white/10 text-zinc-300 hover:border-amber-400/40'
                        }`}
                      >
                        <MiniCardArchitectureVisual
                          cardType={ct.id}
                          accentColor={effectiveTheme.accentColor}
                          glowColor={effectiveTheme.glowColor}
                          isSelected={active}
                          titleText={isRtl ? ct.nameAr : ct.nameEn}
                          subtitleText={isRtl ? ct.descAr : ct.descEn}
                        />
                        <div className="flex items-center justify-between px-1">
                          <span className="text-xs font-extrabold text-white">
                            {isRtl ? ct.nameAr : ct.nameEn}
                          </span>
                          {active && (
                            <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Links List (with Drag & Drop + Up/Down + Edit + Delete Confirmation) */}
              <div className="space-y-3">
                {links.length === 0 ? (
                  <div className="p-10 rounded-3xl bg-white/[0.02] border border-dashed border-white/15 text-center space-y-3">
                    <p className="text-sm text-zinc-400">
                      {isRtl ? 'لا توجد روابط بعد. أضف رابطك الأول الآن!' : 'No links yet. Add your first link!'}
                    </p>
                    <button
                      type="button"
                      onClick={openAddLinkModal}
                      className="px-4 py-2 rounded-xl bg-amber-500 text-black font-bold text-xs"
                    >
                      {t.addLink}
                    </button>
                  </div>
                ) : (
                  links.map((link, idx) => (
                    <div
                      key={link.id}
                      draggable
                      onDragStart={() => setDraggedLinkIndex(idx)}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={() => {
                        if (draggedLinkIndex === null || draggedLinkIndex === idx) return;
                        const copy = [...links];
                        const [dragged] = copy.splice(draggedLinkIndex, 1);
                        copy.splice(idx, 0, dragged);
                        setDraggedLinkIndex(null);
                        persistLinkOrder(copy);
                      }}
                      className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                        link.isActive === false
                          ? 'bg-black/30 border-white/5 opacity-55'
                          : 'bg-white/[0.04] border-white/10 hover:border-amber-500/40'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        {/* Reorder Arrows */}
                        <div className="flex flex-col gap-1">
                          <button
                            type="button"
                            onClick={() => moveLinkByOffset(idx, -1)}
                            disabled={idx === 0}
                            className="p-1 rounded bg-white/5 hover:bg-white/15 disabled:opacity-20"
                            title="Move Up"
                          >
                            <ArrowUp className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveLinkByOffset(idx, 1)}
                            disabled={idx === links.length - 1}
                            className="p-1 rounded bg-white/5 hover:bg-white/15 disabled:opacity-20"
                            title="Move Down"
                          >
                            <ArrowDown className="w-3 h-3" />
                          </button>
                        </div>

                        {(() => {
                          const detectedSocial =
                            SOCIAL_PLATFORMS.find((p) => p.id === link.icon?.toLowerCase()) ||
                            detectSocialPlatformFromUrl(link.url);
                          if (detectedSocial) {
                            return (
                              <OfficialSocialBadge
                                platformId={detectedSocial.id}
                                size="sm"
                                variant="gradient"
                              />
                            );
                          }
                          return (
                            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 flex items-center justify-center shrink-0">
                              <DynamicIcon name={link.icon} className="w-5 h-5" />
                            </div>
                          );
                        })()}

                        <div className="min-w-0 flex-1 space-y-1">
                          <div className="flex items-center gap-2 flex-wrap leading-snug">
                            <span className="font-bold text-sm leading-[1.45] truncate">
                              {link.title}
                            </span>
                            {link.isFeatured && (
                              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold leading-none">
                                {link.badgeText || (isRtl ? 'مميز' : 'Featured')}
                              </span>
                            )}
                            <span
                              dir="ltr"
                              className="px-2 py-0.5 rounded-full bg-white/10 text-zinc-300 text-[10px] leading-none"
                            >
                              {link.cardType}
                            </span>
                            {link.groupName && (
                              <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] leading-none">
                                {link.groupName}
                              </span>
                            )}
                          </div>
                          <div
                            className="text-xs text-zinc-400 font-mono truncate leading-normal"
                            dir="ltr"
                          >
                            {link.url}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[11px] text-zinc-400 px-2 py-1 rounded-lg bg-black/40">
                          {link.clicksCount || 0} {isRtl ? 'نقرة' : 'clicks'}
                        </span>

                        {/* Active Toggle */}
                        <button
                          type="button"
                          onClick={() => handleToggleLinkActive(link)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border ${
                            link.isActive !== false
                              ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                              : 'bg-zinc-800 border-zinc-700 text-zinc-400'
                          }`}
                        >
                          {link.isActive !== false
                            ? isRtl
                              ? 'مفعل'
                              : 'Active'
                            : isRtl
                            ? 'متوقف'
                            : 'Hidden'}
                        </button>

                        <button
                          type="button"
                          onClick={() => openEditLinkModal(link)}
                          className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-zinc-200"
                          title="Edit"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        {deleteConfirmId === link.id ? (
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleDeleteLinkConfirmed(link.id)}
                              className="px-2.5 py-1 rounded-lg bg-rose-600 text-white text-[11px] font-bold"
                            >
                              {isRtl ? 'تأكيد الحذف' : 'Confirm'}
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteConfirmId(null)}
                              className="p-1 rounded-lg bg-white/10 text-xs"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmId(link.id)}
                            className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/25 text-rose-400"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Social Media Channels Integration (14 Platforms) */}
              <div className="p-6 rounded-3xl bg-white/[0.03] border border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold">
                      {isRtl
                        ? 'روابط منصات التواصل الاجتماعي (14 منصة رسمية)'
                        : 'Social Media Integration (14 Platforms)'}
                    </h3>
                    <p className="text-xs text-zinc-400">
                      {isRtl
                        ? 'أدخل رابط حسابك في أي منصة ليظهر بأيقونته الرسمية في صفحتك'
                        : 'Add URLs for any social channel to display official interactive icons'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleSaveAll}
                    className="px-4 py-2 rounded-xl bg-amber-500 text-black font-bold text-xs"
                  >
                    {t.saveChanges}
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {SOCIAL_PLATFORMS.map((plat) => {
                    const existing = socialLinks.find((s) => s.platform === plat.id);
                    const rawVal = existing?.url || '';
                    const hasValue = Boolean(rawVal.trim());
                    // Clean display handle for user
                    const displayHandle = extractUsernameFromSocialUrl(plat.id, rawVal);
                    const generatedUrl = formatSocialInputToUrl(plat.id, rawVal);
                    const prefix = getSocialPlatformDomainPrefix(plat.id);
                    const placeholder = getSocialUsernamePlaceholder(plat.id, isRtl);

                    return (
                      <div
                        key={plat.id}
                        className={`p-3.5 rounded-2xl border transition-all ${
                          hasValue
                            ? 'vip-black-card border-amber-400/40 shadow-[0_6px_24px_rgba(212,175,55,0.08)]'
                            : 'bg-black/40 border-white/10 hover:border-white/20'
                        }`}
                      >
                        {/* Header: Platform Badge + Title + Active Status Pill */}
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2.5">
                            <OfficialSocialBadge
                              platformId={plat.id}
                              size="sm"
                              variant="gradient"
                            />
                            <div>
                              <span className="text-xs font-black text-white">
                                {isRtl ? plat.nameAr : plat.name}
                              </span>
                            </div>
                          </div>
                          {hasValue && (
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[10px] font-bold text-emerald-400">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                              <span>{isRtl ? 'مُفعّل' : 'Active'}</span>
                            </span>
                          )}
                        </div>

                        {/* Input Field with Fixed Visual Prefix */}
                        <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-black/70 border border-white/15 focus-within:border-amber-400 focus-within:ring-1 focus-within:ring-amber-400/30 transition-all">
                          <span
                            className="text-xs font-mono font-bold text-amber-400/90 select-none shrink-0"
                            dir="ltr"
                          >
                            {prefix}
                          </span>
                          <input
                            type="text"
                            value={displayHandle}
                            onChange={(e) => {
                              const val = e.target.value.trim();
                              // Extract clean username even if user pasted full URL
                              const cleanHandle = extractUsernameFromSocialUrl(plat.id, val);
                              const fullUrl = cleanHandle
                                ? formatSocialInputToUrl(plat.id, cleanHandle)
                                : '';

                              setSocialLinks((prev) => {
                                const filtered = prev.filter((item) => item.platform !== plat.id);
                                if (!cleanHandle) return filtered;
                                return [
                                  ...filtered,
                                  {
                                    id: existing?.id || `temp_${plat.id}`,
                                    platform: plat.id,
                                    url: fullUrl,
                                    isActive: true,
                                  },
                                ];
                              });
                            }}
                            placeholder={placeholder}
                            className="w-full bg-transparent text-sm text-white font-medium focus:outline-none placeholder:text-zinc-500"
                            dir="ltr"
                          />
                          {hasValue && (
                            <button
                              type="button"
                              onClick={() => {
                                setSocialLinks((prev) =>
                                  prev.filter((item) => item.platform !== plat.id)
                                );
                              }}
                              className="text-zinc-500 hover:text-rose-400 p-1 text-xs shrink-0 transition-colors"
                              title={isRtl ? 'حذف الرابط' : 'Clear'}
                            >
                              ✕
                            </button>
                          )}
                        </div>

                        {/* Live Auto-Generated Full URL Preview Badge */}
                        {hasValue && (
                          <div
                            className="mt-2 px-2.5 py-1 rounded-lg bg-amber-400/10 border border-amber-400/20 text-[11px] text-amber-300 font-mono flex items-center justify-between gap-1 overflow-hidden"
                            dir="ltr"
                          >
                            <span className="truncate flex items-center gap-1">
                              <span className="text-amber-400">🔗</span>
                              <span className="truncate">{generatedUrl}</span>
                            </span>
                            <span className="text-[10px] text-emerald-400 font-sans font-bold shrink-0">
                              ✓ {isRtl ? 'تم التوليد تلقائيًا' : 'Auto-generated'}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Embedded Music & Media Widget (Interactive Playlist Studio) */}
              <div className="p-6 rounded-3xl bg-white/[0.03] border border-white/10 space-y-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-amber-400/10 border border-amber-400/25 flex items-center justify-center text-amber-400 shadow-md">
                      <Music className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-white">
                          {isRtl ? 'مشغل الموسيقى وقائمة التشغيل المدمجة' : 'Embedded Music & Playlist Studio'}
                        </h3>
                        {mediaEmbed.enabled && playlistTracks.length > 0 && (
                          <span className="px-2 py-0.5 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-300 text-[10px] font-mono font-bold">
                            {playlistTracks.length} {isRtl ? (playlistTracks.length === 1 ? 'مقطع' : 'مقاطع') : (playlistTracks.length === 1 ? 'track' : 'tracks')}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-zinc-400">
                        {isRtl
                          ? 'أضف مقطعاً واحداً أو قائمة تشغيل متتالية تعمل عند تفاعل الزائر'
                          : 'Showcase a single track or an interactive multi-track playlist queue'}
                      </p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={mediaEmbed.enabled}
                      onChange={(e) =>
                        setMediaEmbed((prev) => ({ ...prev, enabled: e.target.checked }))
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-amber-400 peer-checked:to-amber-500"></div>
                  </label>
                </div>

                {mediaEmbed.enabled && (
                  <div className="space-y-4 pt-1">
                    {/* Header Controls & Add Button */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-white/10">
                      <div className="flex items-center gap-2 text-xs text-zinc-400">
                        <ListMusic className="w-4 h-4 text-amber-400 shrink-0" />
                        <span>
                          {isRtl
                            ? 'قائمة مقاطع الصوت (يدعم YouTube, Spotify, SoundCloud, MP3):'
                            : 'Playlist Tracks (Supports YouTube, Spotify, SoundCloud, MP3):'}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={handleAddPlaylistTrack}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-95 transition-all self-start sm:self-auto cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5 stroke-[3]" />
                        <span>{isRtl ? 'إضافة مقطع جديد للقائمة' : 'Add New Track'}</span>
                      </button>
                    </div>

                    {/* Track Cards List */}
                    <div className="space-y-3.5">
                      {playlistTracks.map((tr, idx) => {
                        const trType = tr.type || (tr.url ? detectPlatformFromMediaUrl(tr.url) : 'youtube');
                        const trColor =
                          trType === 'youtube'
                            ? '#EF4444'
                            : trType === 'youtube-music'
                            ? '#FF0000'
                            : trType === 'spotify'
                            ? '#1DB954'
                            : trType === 'soundcloud'
                            ? '#FF5500'
                            : trType === 'anghami'
                            ? '#A855F7'
                            : '#D4AF37';

                        return (
                          <div
                            key={tr.id || `track-box-${idx}`}
                            className="p-4 rounded-2xl bg-black/60 border border-white/10 hover:border-white/20 transition-all space-y-3 shadow-md"
                          >
                            {/* Track Header with Badge and Order Actions */}
                            <div className="flex items-center justify-between gap-2 pb-2 border-b border-white/5">
                              <div className="flex items-center gap-2">
                                <span
                                  className="w-6 h-6 rounded-lg text-black text-[11px] font-mono font-black flex items-center justify-center shadow-sm"
                                  style={{ backgroundColor: trColor }}
                                >
                                  {idx + 1}
                                </span>
                                <span className="text-xs font-bold text-white">
                                  {idx === 0
                                    ? (isRtl ? 'المقطع الأساسي (الافتراضي)' : 'Primary Track (Default)')
                                    : (isRtl ? `المقطع #${idx + 1}` : `Track #${idx + 1}`)}
                                </span>
                                <span
                                  className="text-[9.5px] uppercase font-mono font-black px-2 py-0.5 rounded-full border"
                                  style={{
                                    color: trColor,
                                    borderColor: `${trColor}40`,
                                    backgroundColor: `${trColor}15`,
                                  }}
                                >
                                  {trType}
                                </span>
                              </div>

                              <div className="flex items-center gap-1">
                                {/* Move Up */}
                                <button
                                  type="button"
                                  disabled={idx === 0}
                                  onClick={() => handleMovePlaylistTrack(idx, 'up')}
                                  className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/15 disabled:opacity-30 disabled:hover:bg-white/5 text-zinc-300 hover:text-white flex items-center justify-center transition-all cursor-pointer"
                                  title={isRtl ? 'تحريك للأعلى' : 'Move Up'}
                                >
                                  <ArrowUp className="w-3.5 h-3.5" />
                                </button>
                                {/* Move Down */}
                                <button
                                  type="button"
                                  disabled={idx === playlistTracks.length - 1}
                                  onClick={() => handleMovePlaylistTrack(idx, 'down')}
                                  className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/15 disabled:opacity-30 disabled:hover:bg-white/5 text-zinc-300 hover:text-white flex items-center justify-center transition-all cursor-pointer"
                                  title={isRtl ? 'تحريك للأسفل' : 'Move Down'}
                                >
                                  <ArrowDown className="w-3.5 h-3.5" />
                                </button>
                                {/* Delete Track */}
                                <button
                                  type="button"
                                  onClick={() => handleDeletePlaylistTrack(idx)}
                                  className="w-7 h-7 rounded-lg bg-rose-500/10 hover:bg-rose-500/25 text-rose-400 hover:text-rose-300 flex items-center justify-center transition-all ml-1 cursor-pointer"
                                  title={playlistTracks.length > 1 ? (isRtl ? 'حذف هذا المقطع' : 'Delete Track') : (isRtl ? 'مسح البيانات' : 'Clear Fields')}
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            {/* Track Inputs Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                              {/* Stream URL with Instant Platform Detection */}
                              <div className="sm:col-span-2">
                                <label className="block text-[11px] text-zinc-400 mb-1">
                                  {isRtl ? 'رابط المقطع / الاستماع (YouTube, Spotify, SoundCloud, MP3)' : 'Stream URL (YouTube, Spotify, SoundCloud, MP3)'}
                                </label>
                                <input
                                  type="text"
                                  value={tr.url || ''}
                                  onChange={(e) => {
                                    const newUrl = e.target.value;
                                    const detected = detectPlatformFromMediaUrl(newUrl);
                                    handleUpdatePlaylistTrack(idx, { url: newUrl, type: detected });
                                  }}
                                  placeholder="https://music.youtube.com/watch?v=... أو https://open.spotify.com/..."
                                  className="w-full rounded-xl bg-black/60 border border-white/15 focus:border-amber-400/60 px-3 py-2 text-xs text-white placeholder-zinc-600 transition-colors"
                                  dir="ltr"
                                />
                              </div>

                              {/* Platform Selector */}
                              <div>
                                <label className="block text-[11px] text-zinc-400 mb-1">
                                  {isRtl ? 'المنصة' : 'Platform'}
                                </label>
                                <select
                                  value={trType}
                                  onChange={(e) =>
                                    handleUpdatePlaylistTrack(idx, {
                                      type: e.target.value as MediaEmbedConfig['type'],
                                    })
                                  }
                                  className="w-full rounded-xl bg-black/60 border border-white/15 px-3 py-2 text-xs text-white"
                                >
                                  <option value="youtube">YouTube (فيديو / كليب)</option>
                                  <option value="youtube-music">YouTube Music (يوتيوب ميوزيك)</option>
                                  <option value="spotify">Spotify (سبوتيفاي)</option>
                                  <option value="soundcloud">SoundCloud (ساوند كلاود)</option>
                                  <option value="anghami">Anghami (أنغامي)</option>
                                  <option value="custom">Direct MP3 / Lossless (ملف صوتي)</option>
                                </select>
                              </div>

                              {/* Track Title */}
                              <div>
                                <label className="block text-[11px] text-zinc-400 mb-1">
                                  {isRtl ? 'عنوان المقطع / البودكاست' : 'Track / Episode Title'}
                                </label>
                                <input
                                  type="text"
                                  value={tr.title || ''}
                                  onChange={(e) =>
                                    handleUpdatePlaylistTrack(idx, { title: e.target.value })
                                  }
                                  placeholder={isRtl ? 'مثال: Yahh' : 'e.g. Midnight Symphony'}
                                  className="w-full rounded-xl bg-black/60 border border-white/15 focus:border-amber-400/60 px-3 py-2 text-xs text-white placeholder-zinc-600 transition-colors"
                                />
                              </div>

                              {/* Artist / Channel Name */}
                              <div className="sm:col-span-2">
                                <label className="block text-[11px] text-zinc-400 mb-1">
                                  {isRtl ? 'اسم الفنان / القناة / صانع المحتوى' : 'Artist / Creator / Channel'}
                                </label>
                                <input
                                  type="text"
                                  value={tr.artist || ''}
                                  onChange={(e) =>
                                    handleUpdatePlaylistTrack(idx, { artist: e.target.value })
                                  }
                                  placeholder={isRtl ? 'مثال: تامر عاشور | Tamer Ashour' : 'e.g. AURA Sound Lab'}
                                  className="w-full rounded-xl bg-black/60 border border-white/15 focus:border-amber-400/60 px-3 py-2 text-xs text-white placeholder-zinc-600 transition-colors"
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Bottom Add Track Button for Convenience */}
                    {playlistTracks.length > 1 && (
                      <button
                        type="button"
                        onClick={handleAddPlaylistTrack}
                        className="w-full py-2.5 rounded-xl border border-dashed border-white/20 hover:border-amber-400/50 bg-white/[0.02] hover:bg-amber-400/5 text-zinc-300 hover:text-amber-300 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>{isRtl ? 'إضافة مقطع صوتي آخر إلى القائمة +' : 'Add Another Track to Playlist +'}</span>
                      </button>
                    )}

                    {/* Pro Tip Box */}
                    <div className="p-3.5 rounded-2xl bg-amber-400/5 border border-amber-400/20 text-xs text-amber-200/90 space-y-1">
                      <div className="font-bold flex items-center gap-1.5 text-amber-300">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        <span>{isRtl ? 'ميزة التشغيل التلقائي المتتالي (Continuous Queue)' : 'Continuous Playlist Queue Feature'}</span>
                      </div>
                      <p className="text-[11px] leading-relaxed text-zinc-300">
                        {isRtl
                          ? 'عند إضافة أكثر من مقطع، ستتحول بطاقة الصوت في صفحتك تلقائياً إلى قائمة تشغيل متكاملة تتيح للزوار التنقل بين المقاطع أو الاستماع إليها بشكل متتالٍ.'
                          : 'When multiple tracks are added, the media card automatically transforms into a full playlist queue allowing visitors to switch or listen continuously.'}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Reorderable Profile Sections */}
              <div className="p-6 rounded-3xl bg-white/[0.03] border border-white/10 space-y-3">
                <h3 className="text-sm font-bold">
                  {isRtl ? 'ترتيب أقسام الصفحة الشخصية' : 'Reorder Profile Sections'}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {sectionsOrder.map((sec, idx) => (
                    <div
                      key={sec}
                      className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-black/50 border border-white/15 text-xs font-bold"
                    >
                      <span className="uppercase">{sec}</span>
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => {
                          const copy = [...sectionsOrder];
                          const [m] = copy.splice(idx, 1);
                          copy.splice(idx - 1, 0, m);
                          setSectionsOrder(copy);
                        }}
                        className="p-1 rounded bg-white/5 hover:bg-white/15 disabled:opacity-20"
                      >
                        ←
                      </button>
                      <button
                        type="button"
                        disabled={idx === sectionsOrder.length - 1}
                        onClick={() => {
                          const copy = [...sectionsOrder];
                          const [m] = copy.splice(idx, 1);
                          copy.splice(idx + 1, 0, m);
                          setSectionsOrder(copy);
                        }}
                        className="p-1 rounded bg-white/5 hover:bg-white/15 disabled:opacity-20"
                      >
                        →
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ================================================================
              TAB 3: THEME ENGINE, THEME DNA & TYPOGRAPHY SYSTEM
          ================================================================ */}
          {activeTab === 'themes' && (
            <div className="space-y-6">
              {/* 7 Profile Layouts */}
              <div className="p-6 rounded-3xl bg-white/[0.03] border border-white/10 space-y-4">
                <h2 className="text-base font-black">
                  {isRtl ? 'تخطيط الصفحة الشخصية (7 تخطيطات احترافية)' : 'Profile Architecture Layout (7 Layouts)'}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {PROFILE_LAYOUTS.map((ly) => (
                    <button
                      key={ly.id}
                      type="button"
                      onClick={() => {
                        setLayout(ly.id);
                        pushSnapshot({
                          themeId,
                          layout: ly.id,
                          customTheme,
                          effects,
                          displayName,
                          bio,
                          sectionsOrder,
                        });
                      }}
                      className={`p-3.5 rounded-2xl border text-start transition-all ${
                        layout === ly.id
                          ? 'bg-amber-500/20 border-amber-400 text-white'
                          : 'bg-black/40 border-white/10 text-zinc-300 hover:border-white/30'
                      }`}
                    >
                      <div className="text-xs font-bold">{isRtl ? ly.nameAr : ly.nameEn}</div>
                      <div className="text-[11px] text-zinc-400 mt-1">
                        {isRtl ? ly.descAr : ly.descEn}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 20 Signature Themes Library with Horizontal Left/Right Scroll Showroom Deck */}
              <HorizontalThemeShowroomCarousel
                themes={AURA_THEMES}
                allThemesForIndex={AURA_THEMES}
                selectedThemeId={themeId}
                isRtl={isRtl}
                defaultRows={2}
                onSelect={(selectedId, target) => {
                  setThemeId(target.id);
                  setLayout(target.profileLayout);
                  // Preserve user's globalCardType so switching themes keeps the chosen card style!
                  const preservedCardType = globalCardType || customTheme.defaultCardType || target.defaultCardType;
                  const nextCustom = { defaultCardType: preservedCardType };
                  setCustomTheme(nextCustom);
                  pushSnapshot({
                    themeId: target.id,
                    layout: target.profileLayout,
                    customTheme: nextCustom,
                    effects,
                    displayName,
                    bio,
                    sectionsOrder,
                  });
                }}
              />

              {/* Out-of-the-box Innovation: Mood Presets & Theme DNA Generator */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Mood Presets */}
                <div className="p-6 rounded-3xl bg-white/[0.03] border border-white/10 space-y-3">
                  <h3 className="text-sm font-black flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>{isRtl ? 'المزاج البصري (Mood Presets)' : 'Visual Mood Presets'}</span>
                  </h3>
                  <div className="grid grid-cols-2 gap-2.5">
                    {MOOD_PRESETS.map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => handleApplyMoodPreset(m.id)}
                        className={`p-3 rounded-2xl border text-start transition-all ${
                          moodPreset === m.id
                            ? 'bg-amber-500/20 border-amber-400 text-amber-200'
                            : 'bg-black/40 border-white/10 text-zinc-300 hover:border-white/25'
                        }`}
                      >
                        <div className="text-xs font-bold">{isRtl ? m.nameAr : m.nameEn}</div>
                        <div className="text-[10px] text-zinc-400 line-clamp-1 mt-0.5">
                          {isRtl ? m.descAr : m.descEn}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Theme DNA Generator */}
                <div className="p-6 rounded-3xl bg-white/[0.03] border border-white/10 space-y-4">
                  <h3 className="text-sm font-black flex items-center gap-2">
                    <Wand2 className="w-4 h-4 text-cyan-400" />
                    <span>{isRtl ? 'مولد Theme DNA الذكي' : 'Theme DNA Generator'}</span>
                  </h3>
                  <p className="text-xs text-zinc-400">
                    {isRtl
                      ? 'اختر 3 ألوان أساسية ليقوم المحرك ببناء ثيم متكامل متناغم تلقائيًا'
                      : 'Select 3 seed colors to synthesize a harmonious custom luxury theme'}
                  </p>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[10px] text-zinc-400 mb-1">
                        {isRtl ? 'اللون المميز' : 'Primary Accent'}
                      </label>
                      <input
                        type="color"
                        value={dnaPrimary}
                        onChange={(e) => setDnaPrimary(e.target.value)}
                        className="w-full h-10 rounded-xl cursor-pointer bg-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-zinc-400 mb-1">
                        {isRtl ? 'التوهج الثانوي' : 'Secondary Glow'}
                      </label>
                      <input
                        type="color"
                        value={dnaSecondary}
                        onChange={(e) => setDnaSecondary(e.target.value)}
                        className="w-full h-10 rounded-xl cursor-pointer bg-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-zinc-400 mb-1">
                        {isRtl ? 'عمق الخلفية' : 'Base Surface'}
                      </label>
                      <input
                        type="color"
                        value={dnaSurface}
                        onChange={(e) => setDnaSurface(e.target.value)}
                        className="w-full h-10 rounded-xl cursor-pointer bg-transparent"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleGenerateDNA}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-purple-500 to-cyan-400 text-black font-extrabold text-xs"
                  >
                    {isRtl ? 'توليد وتطبيق Theme DNA الآن ✦' : 'Synthesize Theme DNA ✦'}
                  </button>
                </div>
              </div>

              {/* Full Theme Customizer Controls */}
              <div className="p-6 rounded-3xl bg-white/[0.03] border border-white/10 space-y-5">
                <h3 className="text-base font-black">
                  {isRtl ? 'تخصيص تفاصيل الثيم والألوان والزجاج' : 'Advanced Theme Customizer'}
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs text-zinc-400 mb-1">Background</label>
                    <input
                      type="color"
                      value={effectiveTheme.bgColor}
                      onChange={(e) => updateCustomThemeField('bgColor', e.target.value)}
                      className="w-full h-10 rounded-xl bg-transparent cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-400 mb-1">Accent Color</label>
                    <input
                      type="color"
                      value={effectiveTheme.accentColor}
                      onChange={(e) => updateCustomThemeField('accentColor', e.target.value)}
                      className="w-full h-10 rounded-xl bg-transparent cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-400 mb-1">Glow Color</label>
                    <input
                      type="color"
                      value={effectiveTheme.glowColor}
                      onChange={(e) => updateCustomThemeField('glowColor', e.target.value)}
                      className="w-full h-10 rounded-xl bg-transparent cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-400 mb-1">Text Color</label>
                    <input
                      type="color"
                      value={effectiveTheme.textColor}
                      onChange={(e) => updateCustomThemeField('textColor', e.target.value)}
                      className="w-full h-10 rounded-xl bg-transparent cursor-pointer"
                    />
                  </div>
                </div>

                {/* Sliders for Border Radius, Glass Blur, Glow Intensity, Gradient Speed */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-zinc-300">
                        {isRtl ? 'استدارة الحواف (Border Radius)' : 'Border Radius'}
                      </span>
                      <span className="text-amber-400 font-bold">{effectiveTheme.borderRadius}px</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="36"
                      value={effectiveTheme.borderRadius}
                      onChange={(e) =>
                        updateCustomThemeField('borderRadius', Number(e.target.value))
                      }
                      className="w-full accent-amber-400"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-zinc-300">
                        {isRtl ? 'ضبابية الزجاج (Glass Blur)' : 'Glass Blur'}
                      </span>
                      <span className="text-amber-400 font-bold">{effectiveTheme.glassBlur}px</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="32"
                      value={effectiveTheme.glassBlur}
                      onChange={(e) => updateCustomThemeField('glassBlur', Number(e.target.value))}
                      className="w-full accent-amber-400"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-zinc-300">
                        {isRtl ? 'قوة التوهج (Glow Intensity)' : 'Glow Intensity'}
                      </span>
                      <span className="text-amber-400 font-bold">{effectiveTheme.glowIntensity}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={effectiveTheme.glowIntensity}
                      onChange={(e) =>
                        updateCustomThemeField('glowIntensity', Number(e.target.value))
                      }
                      className="w-full accent-amber-400"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-zinc-300">
                        {isRtl ? 'سرعة تدرج الخلفية (Gradient Speed)' : 'Gradient Animation Speed'}
                      </span>
                      <span className="text-amber-400 font-bold">{effectiveTheme.gradientSpeed}x</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="20"
                      value={effectiveTheme.gradientSpeed}
                      onChange={(e) =>
                        updateCustomThemeField('gradientSpeed', Number(e.target.value))
                      }
                      className="w-full accent-amber-400"
                    />
                  </div>
                </div>

                {/* Background Image & Social Icons Style */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-zinc-400 mb-1">
                      {isRtl ? 'رابط صورة خلفية مخصصة (اختياري)' : 'Custom Background Image URL'}
                    </label>
                    <input
                      type="text"
                      value={effectiveTheme.bgImage}
                      onChange={(e) => updateCustomThemeField('bgImage', e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full rounded-xl bg-black/50 border border-white/15 px-3 py-2 text-xs text-white"
                      dir="ltr"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-zinc-400 mb-1">
                      {isRtl ? 'نمط أيقونات التواصل' : 'Social Icons Style'}
                    </label>
                    <select
                      value={effectiveTheme.socialIconsStyle}
                      onChange={(e) =>
                        updateCustomThemeField(
                          'socialIconsStyle',
                          e.target.value as ThemeConfig['socialIconsStyle']
                        )
                      }
                      className="w-full rounded-xl bg-black/50 border border-white/15 px-3 py-2 text-xs text-white"
                    >
                      <option value="glass">Liquid Glass</option>
                      <option value="neon">Neon Glow</option>
                      <option value="floating">Floating 3D</option>
                      <option value="solid">Solid Accent</option>
                      <option value="outline">Minimal Outline</option>
                      <option value="minimal">Clean Minimal</option>
                    </select>
                  </div>

                  {/* Arabic Font Selector */}
                  <div>
                    <label className="block text-xs font-bold text-amber-300 mb-1">
                      {isRtl ? 'الخط العربي المعتمد' : 'Arabic Font Family'}
                    </label>
                    <select
                      value={effectiveTheme.fontFamilyAr}
                      onChange={(e) =>
                        updateCustomThemeField(
                          'fontFamilyAr',
                          e.target.value as ArabicFontFamily
                        )
                      }
                      className="w-full rounded-xl bg-black/70 border border-white/20 px-3 py-2 text-xs font-bold text-white focus:border-amber-400 focus:outline-none"
                    >
                      {ARABIC_FONTS.map((font) => (
                        <option key={font.id} value={font.id} className="bg-zinc-900 text-white">
                          {font.label} ({font.styleTagAr})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* English Font Selector */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-cyan-300">
                        {isRtl ? 'الخط الإنجليزي الفاخر (English Font)' : 'English Font Family'}
                      </label>
                      <span className="text-[10px] text-cyan-400 font-mono font-bold">
                        {effectiveTheme.fontFamilyEn}
                      </span>
                    </div>
                    <select
                      value={effectiveTheme.fontFamilyEn}
                      onChange={(e) =>
                        updateCustomThemeField(
                          'fontFamilyEn',
                          e.target.value as EnglishFontFamily
                        )
                      }
                      className="w-full rounded-xl bg-black/70 border border-cyan-400/40 px-3 py-2 text-xs font-bold text-cyan-200 focus:border-cyan-300 focus:outline-none"
                      dir="ltr"
                    >
                      {ENGLISH_FONTS.map((font) => (
                        <option key={font.id} value={font.id} className="bg-zinc-900 text-white">
                          {font.label} — {font.styleTagEn}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Quick Navigation Banner to Typography & Custom Presets */}
              <div className="p-4 sm:p-5 rounded-3xl vip-black-card border border-amber-400/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-400/15 border border-amber-400/35 flex items-center justify-center text-amber-300 shrink-0">
                    <Type className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm font-black text-white">
                      {isRtl ? 'استوديو الخطوط الملكي وحفظ الثيمات المخصصة' : 'Typography Studio & Custom Presets'}
                    </div>
                    <div className="text-[11px] text-zinc-300 mt-0.5">
                      {isRtl
                        ? '24 خطاً ثنائياً (12 عربي + 12 إنجليزي)، وأزواج مطبعية، وأحجام بصرية، وحفظ الثيم الخاص بك'
                        : '24 bilingual fonts, curated pairings, optical scales & custom preset builder'}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('typography')}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#FDE08D] via-[#D4AF37] to-[#AA771C] text-black font-black text-xs hover:brightness-110 transition-all flex items-center gap-1.5 shrink-0 shadow-md shadow-amber-500/20"
                >
                  <span>{isRtl ? 'فتح استوديو الخطوط والثيم' : 'Open Typography & Presets'}</span>
                  <span>{isRtl ? '←' : '→'}</span>
                </button>
              </div>

              {/* Quick English Typography Fast Switcher */}
              <div className="p-5 rounded-3xl vip-black-card border border-cyan-400/30 space-y-3 shadow-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Type className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs font-black text-white">
                      {isRtl ? 'التبديل السريع للخطوط الإنجليزية الفاخرة (English Luxury Fonts)' : 'Quick English Typography Switcher'}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono font-bold text-cyan-300">
                    Active: {effectiveTheme.fontFamilyEn}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2" dir="ltr">
                  {ENGLISH_FONTS.map((font) => {
                    const isSelected = effectiveTheme.fontFamilyEn === font.id;
                    return (
                      <button
                        key={font.id}
                        type="button"
                        onClick={() => updateCustomThemeField('fontFamilyEn', font.id)}
                        className={`px-3 py-2 rounded-xl border text-center transition-all ${
                          isSelected
                            ? 'bg-cyan-500/25 border-cyan-400 text-cyan-200 ring-1 ring-cyan-400/40 shadow-md font-black scale-[1.02]'
                            : 'bg-black/50 border-white/10 text-zinc-300 hover:border-white/30 hover:text-white font-medium'
                        }`}
                        style={{ fontFamily: `"${font.id}", sans-serif` }}
                      >
                        <div className="text-xs truncate">{font.label}</div>
                        <div className="text-[9px] opacity-75 truncate">{font.styleTagEn}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ================================================================
              TAB: BILINGUAL TYPOGRAPHY STUDIO & CUSTOM THEME PRESETS
          ================================================================ */}
          {activeTab === 'typography' && (
            <div className="space-y-6">
              {/* Top Navigation Banner to return to Themes */}
              <div className="p-4 sm:p-5 rounded-3xl vip-black-card border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-400/35 flex items-center justify-center text-amber-300 shrink-0">
                    <Palette className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm font-black text-white">
                      {isRtl
                        ? 'استوديو الخطوط الاحترافي والمعاينة الحية (12 خطًا عربيًا + 12 خطًا إنجليزيًا)'
                        : 'Bilingual Typography Studio & Specimen Studio'}
                    </div>
                    <div className="text-[11px] text-zinc-400 mt-0.5">
                      {isRtl
                        ? 'اختر الخط العربي والخط الإنجليزي الرديف، وحدد الأحجام والسماكات، واحفظ تصميمك كثيم خاص بك'
                        : 'Curate Arabic & English font pairings, optical weights & save your signature custom theme'}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('themes')}
                  className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-xs font-bold text-zinc-200 transition-all flex items-center gap-1.5 shrink-0"
                >
                  <span>{isRtl ? '← العودة لمحرك الثيمات والتخطيطات' : '← Back to Themes & Layouts'}</span>
                </button>
              </div>

              {/* Bilingual Typography & Live Font Specimen Studio (24 Fonts) */}
              <div ref={typographySectionRef} id="typography-studio-section" className="scroll-mt-32">
                <BilingualTypographyStudio
                  effectiveTheme={effectiveTheme}
                  isRtl={isRtl}
                  displayName={displayName}
                  customPreviewTextAr={customFontPreviewAr}
                  setCustomPreviewTextAr={setCustomFontPreviewAr}
                  customPreviewTextEn={customFontPreviewEn}
                  setCustomPreviewTextEn={setCustomFontPreviewEn}
                  onUpdateField={updateCustomThemeField}
                />
              </div>

              {/* Save Named Custom Theme */}
              <div className="p-6 rounded-3xl bg-white/[0.03] border border-white/10 space-y-4">
                <h3 className="text-sm font-bold">
                  {isRtl ? 'حفظ هذا التصميم كثيم خاص بك (Custom Theme)' : 'Save as Custom Theme Preset'}
                </h3>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customThemeName}
                    onChange={(e) => setCustomThemeName(e.target.value)}
                    placeholder={isRtl ? 'اسم الثيم الخاص بك...' : 'My Signature Gold Theme...'}
                    className="flex-1 rounded-xl bg-black/50 border border-white/15 px-4 py-2.5 text-xs text-white"
                  />
                  <button
                    type="button"
                    onClick={handleSaveCustomThemePreset}
                    className="px-5 py-2.5 rounded-xl bg-amber-500 text-black font-extrabold text-xs"
                  >
                    {isRtl ? 'حفظ الثيم' : 'Save Preset'}
                  </button>
                </div>

                {savedCustomThemes.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                    {savedCustomThemes.map((ct) => (
                      <div
                        key={ct.id}
                        className="p-3 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-between"
                      >
                        <button
                          type="button"
                          onClick={() => {
                            setThemeId(ct.baseThemeId);
                            try {
                              setCustomTheme(JSON.parse(ct.configJson));
                            } catch {}
                            showNotification(isRtl ? `تم تحميل ${ct.name}` : `Loaded ${ct.name}`);
                          }}
                          className="text-xs font-bold text-amber-300 hover:underline text-start"
                        >
                          ✦ {ct.name}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteCustomThemePreset(ct.id)}
                          className="text-rose-400 hover:text-rose-300 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ================================================================
              TAB 4: EFFECTS STUDIO
          ================================================================ */}
          {activeTab === 'effects' && (
            <div className="space-y-6">
              <div className="p-6 rounded-3xl bg-white/[0.03] border border-white/10 space-y-4">
                <div>
                  <h2 className="text-lg font-black flex items-center gap-2">
                    <Wand2 className="w-5 h-5 text-amber-400" />
                    <span>Effects Studio — {isRtl ? 'استوديو المؤثرات الحركية' : 'Motion & Shader Control'}</span>
                  </h2>
                  <p className="text-xs text-zinc-400">
                    {isRtl
                      ? 'فعّل أو عطّل أي تأثير بشكل مستقل وتحكم في السرعة والعمق البصري'
                      : 'Toggle individual 3D & lighting shaders and fine-tune speed and depth'}
                  </p>
                </div>

                {/* 17 Individual Effect Switches */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(
                    [
                      { key: 'meshGradient', labelAr: 'تدرج شبكي متحرك (Mesh Gradient)', labelEn: 'Animated Mesh Gradient' },
                      { key: 'auroraBorealis', labelAr: 'أضواء الشفق القطبي (Aurora Borealis)', labelEn: 'Aurora Borealis Shader' },
                      { key: 'floatingParticles', labelAr: 'جسيمات مضيئة عائمة (Floating Particles)', labelEn: 'Floating Particles' },
                      { key: 'cursorGlow', labelAr: 'إضاءة تتبع المؤشر (Interactive Cursor Glow)', labelEn: 'Interactive Cursor Glow' },
                      { key: 'cardTilt3d', labelAr: 'إمالة البطاقات ثلاثية الأبعاد (3D Card Tilt)', labelEn: '3D Card Perspective Tilt' },
                      { key: 'magneticHover', labelAr: 'تأثير الجذب المغناطيسي (Magnetic Hover)', labelEn: 'Magnetic Button Hover' },
                      { key: 'interactiveSpotlight', labelAr: 'إضاءة البطاقات التفاعلية (Spotlight Links)', labelEn: 'Interactive Card Spotlight' },
                      { key: 'gradientBorder', labelAr: 'حدود مضيئة متحركة (Gradient Border Beam)', labelEn: 'Animated Border Beam' },
                      { key: 'profileRing', labelAr: 'حلقة الصورة الشخصية المضيئة (Profile Ring)', labelEn: 'Animated Profile Ring' },
                      { key: 'softShimmer', labelAr: 'انعكاس ضوئي ناعم (Soft Shimmer)', labelEn: 'Soft Specular Shimmer' },
                      { key: 'floatingSocials', labelAr: 'أيقونات تواصل عائمة (Floating Social Icons)', labelEn: 'Floating Social Icons' },
                      { key: 'staggeredEntry', labelAr: 'ظهور متتابع سينمائي (Staggered Entry)', labelEn: 'Staggered Reveal Entry' },
                      { key: 'neonPulse', labelAr: 'نبض النيون (Neon Pulse)', labelEn: 'Neon Aura Pulse' },
                      { key: 'adaptiveMode', labelAr: 'الوضع المتكيف للأجهزة (Adaptive Mobile Mode)', labelEn: 'Adaptive Device Optimization' },
                      { key: 'reduceMotion', labelAr: 'تقليل الحركة لراحة العين (Reduce Motion)', labelEn: 'Reduce Motion Mode' },
                    ] as const
                  ).map((item) => (
                    <label
                      key={item.key}
                      className="flex items-center justify-between p-3.5 rounded-2xl bg-black/40 border border-white/10 cursor-pointer hover:border-white/25"
                    >
                      <span className="text-xs font-semibold text-zinc-200">
                        {isRtl ? item.labelAr : item.labelEn}
                      </span>
                      <input
                        type="checkbox"
                        checked={Boolean(effects[item.key])}
                        onChange={(e) => updateEffectField(item.key, e.target.checked)}
                        className="w-4 h-4 accent-amber-400"
                      />
                    </label>
                  ))}
                </div>

                {/* 6 Precision Sliders */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-white/10">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span>{isRtl ? 'سرعة الحركة (Animation Speed)' : 'Animation Speed'}</span>
                      <span className="text-amber-400 font-bold">{effects.animationSpeed}x</span>
                    </div>
                    <input
                      type="range"
                      min="0.25"
                      max="2.5"
                      step="0.25"
                      value={effects.animationSpeed}
                      onChange={(e) => updateEffectField('animationSpeed', Number(e.target.value))}
                      className="w-full accent-amber-400"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span>{isRtl ? 'كثافة الجسيمات (Particle Density)' : 'Particle Density'}</span>
                      <span className="text-amber-400 font-bold">{effects.particleDensity}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={effects.particleDensity}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        updateEffectField('particleDensity', val);
                        updateCustomThemeField('particleDensity', val);
                      }}
                      className="w-full accent-amber-400"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span>{isRtl ? 'مستوى العمق الثلاثي (3D Depth)' : '3D Visual Depth'}</span>
                      <span className="text-amber-400 font-bold">{effects.visualDepth}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={effects.visualDepth}
                      onChange={(e) => updateEffectField('visualDepth', Number(e.target.value))}
                      className="w-full accent-amber-400"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span>{isRtl ? 'اتجاه حركة الإضاءة (Direction)' : 'Gradient Direction'}</span>
                      <span className="text-amber-400 font-bold">{effects.bgDirection}°</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="360"
                      value={effects.bgDirection}
                      onChange={(e) => updateEffectField('bgDirection', Number(e.target.value))}
                      className="w-full accent-amber-400"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================================================================
              TAB 5: REAL-TIME ANALYTICS
          ================================================================ */}
          {activeTab === 'analytics' && <AnalyticsPanel isRtl={isRtl} />}

          {/* ================================================================
              TAB 6: QR CODE STUDIO & SEO MANAGER
          ================================================================ */}
          {activeTab === 'qr-seo' && (
            <div className="space-y-6">
              {/* QR Code Customizer */}
              <div className="p-6 rounded-3xl bg-white/[0.03] border border-white/10 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                <div className="md:col-span-7 space-y-4">
                  <h2 className="text-lg font-black flex items-center gap-2">
                    <QrCode className="w-5 h-5 text-amber-400" />
                    <span>{isRtl ? 'استوديو رمز QR Code المخصص' : 'Custom QR Code Generator'}</span>
                  </h2>
                  <p className="text-xs text-zinc-400">
                    {isRtl
                      ? 'صمّم رمز الاستجابة السريعة لصفحتك الشخصية وحمّله بجودة عالية بصيغتي PNG و SVG'
                      : 'Customize your profile QR code colors & center emblem and download in PNG or SVG'}
                  </p>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-zinc-400 mb-1">
                        {isRtl ? 'لون الرمز (Foreground)' : 'QR Foreground Color'}
                      </label>
                      <input
                        type="color"
                        value={qrConfig.fgColor}
                        onChange={(e) =>
                          setQrConfig((prev) => ({ ...prev, fgColor: e.target.value }))
                        }
                        className="w-full h-10 rounded-xl bg-transparent cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-zinc-400 mb-1">
                        {isRtl ? 'لون الخلفية (Background)' : 'QR Background Color'}
                      </label>
                      <input
                        type="color"
                        value={qrConfig.bgColor}
                        onChange={(e) =>
                          setQrConfig((prev) => ({ ...prev, bgColor: e.target.value }))
                        }
                        className="w-full h-10 rounded-xl bg-transparent cursor-pointer"
                      />
                    </div>
                  </div>

                  <label className="flex items-center gap-2.5 text-xs font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={qrConfig.includeLogo}
                      onChange={(e) =>
                        setQrConfig((prev) => ({ ...prev, includeLogo: e.target.checked }))
                      }
                      className="w-4 h-4 accent-amber-400"
                    />
                    <span>
                      {isRtl
                        ? 'إضافة شعار AURA في منتصف الرمز (مع تصحيح خطأ عالي المستوى H)'
                        : 'Embed center emblem (High error-correction level H)'}
                    </span>
                  </label>
                </div>

                <div className="md:col-span-5 flex justify-center">
                  <QrCodeView
                    url={publicUrl}
                    fgColor={qrConfig.fgColor}
                    bgColor={qrConfig.bgColor}
                    includeLogo={qrConfig.includeLogo}
                    username={username}
                    size={200}
                  />
                </div>
              </div>

              {/* SEO & Open Graph Manager */}
              <div className="p-6 rounded-3xl bg-white/[0.03] border border-white/10 space-y-4">
                <h2 className="text-lg font-black">
                  {isRtl ? 'مدير محركات البحث والمشاركة (SEO & Open Graph)' : 'SEO & Open Graph Manager'}
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-zinc-200 mb-1">
                      {isRtl ? 'عنوان الصفحة في المتصفح ومحركات البحث (Page Title)' : 'Page Title in Browser & SEO'}
                    </label>
                    <p className="text-xs text-zinc-400 mb-2">
                      {isRtl
                        ? 'اتركه فارغاً للتوليد التلقائي الفاخر: الاسم المعروض (@اسم_المستخدم) | VoltiX'
                        : 'Leave empty for automatic luxury format: Display Name (@username) | VoltiX'}
                    </p>
                    <input
                      type="text"
                      value={seoTitle}
                      onChange={(e) => setSeoTitle(e.target.value)}
                      placeholder={`${displayName || username} (@${username}) | VoltiX`}
                      className="w-full rounded-2xl bg-black/60 border border-white/20 px-4 py-3 text-base text-white font-medium focus:border-amber-400 focus:outline-none transition-all placeholder:text-zinc-500 shadow-inner"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-zinc-200 mb-2">
                      {isRtl ? 'وصف الصفحة (Meta Description)' : 'SEO Meta Description'}
                    </label>
                    <textarea
                      rows={3}
                      value={seoDescription}
                      onChange={(e) => setSeoDescription(e.target.value)}
                      placeholder={bio}
                      className="w-full rounded-2xl bg-black/60 border border-white/20 px-4 py-3 text-base text-white font-medium focus:border-amber-400 focus:outline-none transition-all placeholder:text-zinc-500 leading-relaxed shadow-inner"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-zinc-200 mb-2">
                        {isRtl ? 'رابط صورة المشاركة (Open Graph Image)' : 'Open Graph Image URL'}
                      </label>
                      <input
                        type="text"
                        value={ogImageUrl}
                        onChange={(e) => setOgImageUrl(e.target.value)}
                        placeholder="https://..."
                        className="w-full rounded-2xl bg-black/60 border border-white/20 px-4 py-3 text-base text-white font-medium focus:border-amber-400 focus:outline-none transition-all placeholder:text-zinc-500 shadow-inner"
                        dir="ltr"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-zinc-200 mb-2">
                        {isRtl ? 'الرابط الأساسي (Canonical URL)' : 'Canonical URL'}
                      </label>
                      <input
                        type="text"
                        value={canonicalUrl}
                        onChange={(e) => setCanonicalUrl(e.target.value)}
                        placeholder={publicUrl}
                        className="w-full rounded-2xl bg-black/60 border border-white/20 px-4 py-3 text-base text-white font-medium focus:border-amber-400 focus:outline-none transition-all placeholder:text-zinc-500 shadow-inner"
                        dir="ltr"
                      />
                    </div>
                  </div>

                  <label className="flex items-center gap-3 text-sm font-semibold text-zinc-200 cursor-pointer pt-2">
                    <input
                      type="checkbox"
                      checked={robotsIndex}
                      onChange={(e) => setRobotsIndex(e.target.checked)}
                      className="w-5 h-5 rounded-lg accent-amber-400"
                    />
                    <span>
                      {isRtl
                        ? 'السماح لمحركات البحث (Google) بأرشفة صفحتي الشخصية'
                        : 'Allow search engines to index my public profile'}
                    </span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* ================================================================
              TAB 7: ACCOUNT & IDENTITY SETTINGS
          ================================================================ */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              {/* Avatar & Cover Crop Uploaders with Smart Accent Color Extractor */}
              <div className="p-6 rounded-3xl bg-white/[0.03] border border-white/10 space-y-4">
                <h2 className="text-lg font-black">
                  {isRtl ? 'الصورة الشخصية، الغلاف، والهوية' : 'Identity, Avatar & Cover'}
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <ImageCropUploader
                    label={isRtl ? 'الصورة الشخصية (Avatar)' : 'Profile Avatar'}
                    value={avatarUrl}
                    position={avatarPos}
                    aspect="circle"
                    isRtl={isRtl}
                    onChange={(url, pos) => {
                      setAvatarUrl(url);
                      setAvatarPos(pos);
                    }}
                    onExtractColors={(palette) => {
                      setDnaPrimary(palette.primaryAccent);
                      setDnaSecondary(palette.secondaryAccent);
                      setDnaSurface(palette.surfaceBase);
                      const dna = generateThemeDNA(
                        palette.primaryAccent,
                        palette.secondaryAccent,
                        palette.surfaceBase,
                        moodPreset
                      );
                      setCustomTheme((prev) => ({ ...prev, ...dna }));
                      showNotification(
                        isRtl
                          ? 'تم استخراج الألوان الذكية من صورتك وتطبيقها على الثيم ✨'
                          : 'Smart Accent Colors extracted & applied ✨'
                      );
                    }}
                  />

                  <ImageCropUploader
                    label={isRtl ? 'صورة الغلاف (Cover Image)' : 'Profile Cover Banner'}
                    value={coverUrl}
                    position={coverPos}
                    aspect="cover"
                    isRtl={isRtl}
                    onChange={(url, pos) => {
                      setCoverUrl(url);
                      setCoverPos(pos);
                    }}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-sm font-bold text-zinc-200 mb-2">
                      {isRtl ? 'اسم المستخدم الفريد (@username)' : 'Username (@handle)'}
                    </label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) =>
                        setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_.-]/g, ''))
                      }
                      className="w-full rounded-2xl bg-black/60 border border-white/20 px-4 py-3 text-base text-white font-bold focus:border-amber-400 focus:outline-none transition-all placeholder:text-zinc-500 shadow-inner"
                      dir="ltr"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-zinc-200 mb-2">
                      {isRtl ? 'الاسم المعروض' : 'Display Name'}
                    </label>
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full rounded-2xl bg-black/60 border border-white/20 px-4 py-3 text-base text-white font-medium focus:border-amber-400 focus:outline-none transition-all placeholder:text-zinc-500 shadow-inner"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-zinc-200 mb-2">
                    {isRtl ? 'النبذة التعريفية (Bio)' : 'Bio'}
                  </label>
                  <textarea
                    rows={3}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full rounded-2xl bg-black/60 border border-white/20 px-4 py-3 text-base text-white font-medium focus:border-amber-400 focus:outline-none transition-all placeholder:text-zinc-500 leading-relaxed shadow-inner"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs text-zinc-300">
                    {isRtl ? 'اتجاه ولغة الصفحة العامة للمستخدم:' : 'Public Profile Direction & Language:'}
                  </span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setProfileLocale('ar')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border ${
                        profileLocale === 'ar'
                          ? 'bg-amber-500 text-black border-amber-400'
                          : 'bg-white/5 border-white/10 text-zinc-400'
                      }`}
                    >
                      العربية (RTL)
                    </button>
                    <button
                      type="button"
                      onClick={() => setProfileLocale('en')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border ${
                        profileLocale === 'en'
                          ? 'bg-amber-500 text-black border-amber-400'
                          : 'bg-white/5 border-white/10 text-zinc-400'
                      }`}
                    >
                      English (LTR)
                    </button>
                  </div>
                </div>
              </div>

              {/* Email Verification Status */}
              <div className="p-6 rounded-3xl bg-white/[0.03] border border-white/10 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold">{email}</h3>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    {emailVerified
                      ? isRtl
                        ? '✔ البريد الإلكتروني مؤكد وموثق'
                        : '✔ Email address is verified'
                      : isRtl
                      ? 'البريد الإلكتروني غير مؤكد بعد'
                      : 'Email not verified yet'}
                  </p>
                  {verifyPreviewLink && (
                    <Link
                      href={verifyPreviewLink}
                      className="inline-block mt-2 text-xs text-amber-400 font-bold underline"
                    >
                      {isRtl ? 'اضغط هنا لإتمام تأكيد البريد فورًا' : 'Click here to complete verification'}
                    </Link>
                  )}
                </div>
                {!emailVerified && (
                  <button
                    type="button"
                    onClick={async () => {
                      const res = await fetch('/api/auth/verify-email', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ action: 'request' }),
                      });
                      const data = await res.json();
                      if (data.verifyUrl) setVerifyPreviewLink(data.verifyUrl);
                      showNotification(
                        isRtl ? 'تم إنشاء رابط تأكيد البريد الإلكتروني' : 'Verification link generated'
                      );
                    }}
                    className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-xs font-bold"
                  >
                    {isRtl ? 'تأكيد البريد الإلكتروني' : 'Verify Email'}
                  </button>
                )}
              </div>

              {/* Change Password */}
              <div className="p-6 rounded-3xl bg-white/[0.03] border border-white/10 space-y-4">
                <h3 className="text-sm font-bold">
                  {isRtl ? 'تغيير كلمة المرور' : 'Update Password'}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder={isRtl ? 'كلمة المرور الحالية' : 'Current Password'}
                      className="w-full rounded-xl bg-black/50 border border-white/15 px-3 py-2.5 pr-9 text-xs text-white focus:border-amber-400 focus:outline-none"
                      dir="ltr"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute top-1/2 -translate-y-1/2 right-2.5 p-1 text-zinc-400 hover:text-amber-300 transition-colors"
                      title={showCurrentPassword ? (isRtl ? 'إخفاء' : 'Hide') : (isRtl ? 'إظهار' : 'Show')}
                    >
                      {showCurrentPassword ? <EyeOff className="w-3.5 h-3.5 text-amber-300" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder={isRtl ? 'كلمة المرور الجديدة (8+ أحرف)' : 'New Password (8+ chars)'}
                      className="w-full rounded-xl bg-black/50 border border-white/15 px-3 py-2.5 pr-9 text-xs text-white focus:border-amber-400 focus:outline-none"
                      dir="ltr"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute top-1/2 -translate-y-1/2 right-2.5 p-1 text-zinc-400 hover:text-amber-300 transition-colors"
                      title={showNewPassword ? (isRtl ? 'إخفاء' : 'Hide') : (isRtl ? 'إظهار' : 'Show')}
                    >
                      {showNewPassword ? <EyeOff className="w-3.5 h-3.5 text-amber-300" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    const res = await fetch('/api/profile', {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ currentPassword, newPassword }),
                    });
                    const data = await res.json();
                    if (res.ok) {
                      setCurrentPassword('');
                      setNewPassword('');
                      showNotification(
                        isRtl ? 'تم تحديث كلمة المرور بنجاح ✨' : 'Password updated ✨'
                      );
                    } else {
                      showNotification(`⚠️ ${data.error || 'Error'}`);
                    }
                  }}
                  className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-bold"
                >
                  {isRtl ? 'تحديث كلمة المرور' : 'Change Password'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ==================================================================
            RIGHT SIDE: 100% PINNED & FIXED INTERACTIVE LIVE PREVIEW STUDIO (5 COLS)
            Visible ONLY inside Theme Engine (`themes`) & Typography (`typography`).
            - In `themes`: Renders Live Multi-Device 3D Phone Preview Studio.
            - In `typography`: Renders Sticky Live Font Preview Inspector.
        ================================================================== */}
        {(activeTab === 'themes' || activeTab === 'typography') && (
          <div className="hidden lg:flex lg:col-span-5 lg:sticky lg:top-2 self-start h-fit flex-col items-center z-20">
            {activeTab === 'typography' ? (
              <StickyFontPreviewInspector
                effectiveTheme={effectiveTheme}
                isRtl={isRtl}
                displayName={displayName}
                customPreviewTextAr={customFontPreviewAr}
                setCustomPreviewTextAr={setCustomFontPreviewAr}
                customPreviewTextEn={customFontPreviewEn}
                setCustomPreviewTextEn={setCustomFontPreviewEn}
                onUpdateField={updateCustomThemeField}
                onScrollToThemes={() => setActiveTab('themes')}
              />
            ) : (
              <div className="w-full flex flex-col items-center animate-in fade-in zoom-in-95 duration-300">
                {/* Preview Controls Bar */}
                <div className="w-full mb-3 p-2.5 rounded-2xl bg-gradient-to-r from-[#0B0B11]/95 via-[#07070C]/95 to-[#0B0B11]/95 backdrop-blur-xl border border-amber-500/25 shadow-[0_12px_35px_rgba(0,0,0,0.65)] flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                    <span className="text-xs font-extrabold text-zinc-200 truncate">
                      {isRtl ? 'المعاينة المباشرة للثيمات' : 'Live Theme Preview'}
                    </span>
                    <span className="hidden xl:inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black bg-amber-500/15 text-amber-300 border border-amber-400/35 shrink-0">
                      {isRtl ? 'ثابت تلقائياً' : 'PINNED'}
                    </span>
                  </div>

                  {/* Viewport Switcher: Mobile / Tablet / Desktop */}
                  <div className="flex items-center gap-1 bg-black/60 p-1 rounded-xl border border-white/10 shrink-0">
                    <button
                      type="button"
                      onClick={() => setPreviewDevice('mobile')}
                      className={`p-1.5 rounded-lg transition-all ${
                        previewDevice === 'mobile' ? 'bg-amber-500 text-black shadow-md' : 'text-zinc-400 hover:text-white'
                      }`}
                      title="Mobile"
                    >
                      <Smartphone className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewDevice('tablet')}
                      className={`p-1.5 rounded-lg transition-all ${
                        previewDevice === 'tablet' ? 'bg-amber-500 text-black shadow-md' : 'text-zinc-400 hover:text-white'
                      }`}
                      title="Tablet"
                    >
                      <Tablet className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewDevice('desktop')}
                      className={`p-1.5 rounded-lg transition-all ${
                        previewDevice === 'desktop' ? 'bg-amber-500 text-black shadow-md' : 'text-zinc-400 hover:text-white'
                      }`}
                      title="Desktop"
                    >
                      <Monitor className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Quick Theme Switcher Dropdown */}
                  <select
                    value={themeId}
                    onChange={(e) => {
                      setThemeId(e.target.value);
                      setCustomTheme({});
                    }}
                    className="rounded-xl bg-black/75 border border-amber-400/35 px-2.5 py-1.5 text-[11px] font-bold text-amber-300 max-w-[160px] truncate focus:outline-none focus:border-amber-400"
                  >
                    {AURA_THEMES.map((th) => (
                      <option key={th.id} value={th.id} className="bg-zinc-900 text-white">
                        {isRtl ? th.nameAr : th.nameEn}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Device Frame — Dynamically fits viewport height while staying 100% sticky on scroll */}
                <div
                  className={`relative transition-all duration-300 rounded-[48px] p-3 bg-gradient-to-b from-zinc-600 via-zinc-900 to-black border-2 border-amber-500/40 shadow-[0_30px_90px_-15px_rgba(212,175,55,0.32)] ${
                    previewDevice === 'mobile'
                      ? 'w-[360px] h-[min(660px,calc(100vh-196px))] min-h-[500px]'
                      : previewDevice === 'tablet'
                      ? 'w-[480px] h-[min(660px,calc(100vh-196px))] min-h-[500px]'
                      : 'w-full h-[min(660px,calc(100vh-196px))] min-h-[500px]'
                  }`}
                >
                  {previewDevice === 'mobile' && (
                    <div className="absolute top-5 left-1/2 -translate-x-1/2 z-30 w-28 h-6 bg-black rounded-full border border-white/15 flex items-center justify-between px-3 shadow-lg">
                      <span className="text-[8px] font-black tracking-widest text-amber-400">VOLTIX</span>
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    </div>
                  )}
                  <div className="w-full h-full rounded-[38px] overflow-y-auto overflow-x-hidden no-scrollbar bg-[#040407]">
                    <ProfileRenderer
                      profile={previewProfileData}
                      theme={effectiveTheme}
                      effects={effects}
                      isPreview={true}
                      compactPhone={previewDevice === 'mobile'}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </main>

      {/* ====================================================================
          SOVEREIGN EXECUTIVE 100% PINNED & FIXED STUDIO FOOTER BAR
      ==================================================================== */}
      <footer className="shrink-0 z-30 px-4 sm:px-8 pb-3.5 pt-1.5 bg-gradient-to-t from-[#030307] via-[#030307]/90 to-transparent">
        <div className="max-w-[1650px] mx-auto rounded-[24px] bg-[#07070D]/95 border border-amber-400/25 px-6 py-3.5 flex flex-wrap items-center justify-between gap-4 text-xs text-zinc-400 backdrop-blur-2xl shadow-[0_10px_35px_rgba(0,0,0,0.85)]">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-bold text-zinc-200">
              {isRtl
                ? 'استوديو الهوية الرقمية VoltiX Spatial Studio OS • متصل ومحدث مباشرة'
                : 'VoltiX Spatial Studio OS • Connected & Live Synced'}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link href={`/@${username}`} target="_blank" className="text-amber-300 hover:underline font-bold">
              {isRtl ? 'معاينة صفحتي الحية' : 'Live Profile'}
            </Link>
            {role === 'ADMIN' && (
              <>
                <span className="text-zinc-600">•</span>
                <Link href="/admin" className="text-zinc-300 hover:text-white font-bold">
                  {isRtl ? 'لوحة الإدارة (/admin)' : 'Admin OS (/admin)'}
                </Link>
              </>
            )}
          </div>
        </div>
      </footer>

      {/* ====================================================================
          MOBILE FLOATING LIVE PREVIEW BUTTON & DRAWER
      ==================================================================== */}
      {(activeTab === 'themes' || activeTab === 'typography') && (
        <div className="lg:hidden fixed bottom-5 right-5 z-40">
          <button
            type="button"
            onClick={() => setMobilePreviewOpen(true)}
            className="px-5 py-3 rounded-full bg-gradient-to-r from-amber-300 to-amber-500 text-black font-extrabold text-xs shadow-2xl flex items-center gap-2"
          >
            <Eye className="w-4 h-4" />
            <span>{isRtl ? 'معاينة الصفحة' : 'Live Preview'}</span>
          </button>
        </div>
      )}

      {mobilePreviewOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex flex-col p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-bold text-amber-300">
              {isRtl ? 'المعاينة الحية للصفحة' : 'Live Preview'}
            </span>
            <button
              type="button"
              onClick={() => setMobilePreviewOpen(false)}
              className="p-2 rounded-full bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 rounded-3xl overflow-y-auto no-scrollbar border border-white/15">
            <ProfileRenderer
              profile={previewProfileData}
              theme={effectiveTheme}
              effects={effects}
              isPreview={true}
              compactPhone={true}
            />
          </div>
        </div>
      )}

      {/* ====================================================================
          ULTRA-LUXURY VIP LINK & CHANNEL ARCHITECT STUDIO MODAL (WIDE 1160PX)
      ==================================================================== */}
      {linkFormOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-2xl flex items-center justify-center p-2 sm:p-5 overflow-y-auto"
          onClick={() => setLinkFormOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-[96vw] max-w-[1160px] rounded-[34px] vip-black-card border border-amber-400/40 p-6 sm:p-9 text-white shadow-[0_35px_100px_-15px_rgba(0,0,0,0.95)] max-h-[93vh] overflow-y-auto no-scrollbar relative"
          >
            {/* Top Ambient Gold Shimmer Line */}
            <span className="pointer-events-none absolute inset-x-10 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-amber-400/80 to-transparent" />

            {/* Modal Luxury Header */}
            <div className="flex items-center justify-between gap-4 pb-5 mb-6 border-b border-white/10">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-black/80 border border-amber-400/45 p-1.5 flex items-center justify-center shadow-lg shadow-amber-500/20 shrink-0">
                  <img
                    src="/voltix-logo.png"
                    alt="VoltiX Studio"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <span
                    dir="ltr"
                    className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-300 block"
                  >
                    VOLTIX LINK &amp; CHANNEL ARCHITECT
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black leading-[1.35]">
                    {editingLink
                      ? isRtl
                        ? 'تعديل الرابط وتخصيص البطاقة التفاعلية'
                        : 'Edit Link & Customize Interactive Card'
                      : isRtl
                      ? 'إضافة رابط أو قناة رسمية جديدة'
                      : 'Create New Link or Official Channel'}
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setLinkFormOpen(false)}
                className="w-10 h-10 rounded-2xl bg-white/5 hover:bg-rose-500/20 border border-white/15 hover:border-rose-500/40 flex items-center justify-center text-zinc-300 hover:text-rose-300 transition-all shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveLinkForm} className="space-y-6">
              {/* STEP 1: QUICK OFFICIAL CHANNEL TEMPLATES */}
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
                <div className="text-xs font-extrabold text-amber-300 flex items-center gap-2">
                  <Crown className="w-4 h-4" />
                  <span>
                    {isRtl
                      ? '1. قوالب القنوات والمجتمعات الرسمية الجاهزة (تعبئة بنقرة واحدة):'
                      : '1. Instant Official Channel & Community Presets:'}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {OFFICIAL_CHANNEL_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => {
                        setFormTitle(isRtl ? preset.defaultTitleAr : preset.defaultTitleEn);
                        setFormUrl(preset.urlPrefix);
                        setFormDesc(isRtl ? preset.defaultDescAr : preset.defaultDescEn);
                        setFormIcon(preset.platformId);
                        setFormBadge(isRtl ? preset.badgeAr : preset.badgeEn);
                        setFormGroup(isRtl ? 'القنوات والمجتمعات الرسمية' : 'Official Channels');
                        setFormCardType(globalCardType || effectiveTheme.defaultCardType || 'glass');
                      }}
                      className="p-3.5 rounded-2xl bg-black/60 hover:bg-white/[0.08] border border-white/15 hover:border-amber-400/60 text-xs sm:text-sm font-extrabold flex items-center gap-3 text-start transition-all group"
                    >
                      <OfficialSocialBadge
                        platformId={preset.platformId}
                        size="sm"
                        variant="gradient"
                      />
                      <span className="leading-snug">
                        {isRtl ? preset.labelAr : preset.labelEn}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* STEP 2: TITLE, URL, DESCRIPTION & GROUP */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-zinc-200 mb-2">
                    {isRtl ? 'عنوان الرابط أو القناة *' : 'Link / Channel Title *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder={
                      isRtl ? 'مثال: قناة واتساب الرسمية / يوتيوب' : 'e.g. Official WhatsApp Channel / YouTube'
                    }
                    className="w-full rounded-2xl bg-black/65 border border-white/15 focus:border-amber-400 px-4 py-3 text-base text-white focus:outline-none transition-colors"
                  />
                  {/* Quick Channel Name Auto-fill Chips */}
                  <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                    <span className="text-[11px] font-semibold text-zinc-400">
                      {isRtl ? 'تسمية فورية للقناة:' : 'Quick Channel Names:'}
                    </span>
                    {SOCIAL_PLATFORMS.slice(0, 8).map((plat) => (
                      <button
                        key={plat.id}
                        type="button"
                        onClick={() => {
                          setFormTitle(isRtl ? plat.nameAr : plat.name);
                          setFormIcon(plat.id);
                          if (!formUrl || formUrl === 'https://') {
                            const preset = OFFICIAL_CHANNEL_PRESETS.find((p) => p.platformId === plat.id);
                            if (preset) {
                              setFormUrl(preset.urlPrefix);
                              if (!formBadge) setFormBadge(isRtl ? preset.badgeAr : preset.badgeEn);
                            } else {
                              setFormUrl(plat.handlePrefix ? `https://${plat.domains[0]}/` : 'https://');
                            }
                          }
                        }}
                        className={`px-2.5 py-1 rounded-xl text-xs font-bold border transition-all hover:scale-105 ${
                          formIcon === plat.id
                            ? 'bg-amber-500/25 border-amber-400 text-amber-300'
                            : 'bg-white/5 hover:bg-white/15 border-white/10 text-zinc-300'
                        }`}
                      >
                        {isRtl ? plat.nameAr.split(' ')[0] : plat.name}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-zinc-200 mb-2">
                    {isRtl
                      ? 'رابط القناة أو الموقع (URL) *'
                      : 'Channel / Destination URL *'}
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      required
                      value={formUrl}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormUrl(val);
                        const detected = detectSocialPlatformFromUrl(val);
                        if (detected) {
                          setFormIcon(detected.id);
                          // Auto-fill channel title if empty or matches any platform name
                          const isGenericTitle =
                            !formTitle.trim() ||
                            SOCIAL_PLATFORMS.some(
                              (p) =>
                                p.nameAr === formTitle ||
                                p.name === formTitle ||
                                formTitle.includes(p.nameAr.split(' ')[0])
                            );
                          if (isGenericTitle) {
                            setFormTitle(isRtl ? detected.nameAr : detected.name);
                          }
                          const badge = detectChannelBadgeLabel(val, isRtl);
                          if (badge && !formBadge) {
                            setFormBadge(badge);
                          }
                        }
                      }}
                      placeholder="https://whatsapp.com/channel/... | https://t.me/... | https://youtube.com/..."
                      className="w-full rounded-2xl bg-black/65 border border-white/15 focus:border-amber-400 px-4 py-3 text-base text-amber-200 font-mono flex-1 focus:outline-none transition-colors"
                      dir="ltr"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-200 mb-2">
                    {isRtl ? 'وصف مختصر يظهر أسفل العنوان' : 'Subtitle / Description'}
                  </label>
                  <input
                    type="text"
                    value={formDesc}
                    onChange={(e) => setFormDesc(e.target.value)}
                    placeholder={
                      isRtl
                        ? 'مثال: تابع أحدث الإعلانات والتحديثات الحصرية...'
                        : 'Short engaging subtitle...'
                    }
                    className="w-full rounded-2xl bg-black/65 border border-white/15 focus:border-amber-400 px-4 py-3 text-xs sm:text-sm text-white focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-200 mb-2">
                    {isRtl ? 'المجموعة / التصنيف (Group)' : 'Group / Category'}
                  </label>
                  <input
                    type="text"
                    value={formGroup}
                    onChange={(e) => setFormGroup(e.target.value)}
                    placeholder={
                      isRtl
                        ? 'مثال: القنوات الرسمية، المشاريع، المتجر...'
                        : 'e.g. Official Channels, Projects...'
                    }
                    className="w-full rounded-2xl bg-black/65 border border-white/15 focus:border-amber-400 px-4 py-3 text-xs sm:text-sm text-white focus:outline-none transition-colors"
                  />
                </div>
              </div>

              {/* STEP 3: LUXURY CARD TYPE SELECTOR WITH LIVE MINIATURE ARCHITECTURAL PREVIEWS */}
              <div className="p-4 sm:p-5 rounded-3xl bg-white/[0.02] border border-amber-400/25 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label className="block text-xs sm:text-sm font-extrabold text-amber-300">
                    {isRtl
                      ? '2. اختر التصميم الهندسي للبطاقة (12 نمطًا فاخرًا بمعاينة حية):'
                      : '2. Select Architectural Card Style (12 Luxury Styles with Live Visuals):'}
                  </label>
                  <span className="text-[11px] text-amber-200/80 font-bold">
                    {isRtl
                      ? 'كل خيار يعرض شكل البطاقة الفعلي مباشرةً'
                      : 'Every tile renders a live miniature card'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                  {LINK_CARD_TYPES.map((ct) => {
                    const active = formCardType === ct.id;
                    const activeSocialId =
                      SOCIAL_PLATFORMS.find((p) => p.id === formIcon?.toLowerCase())?.id ||
                      detectSocialPlatformFromUrl(formUrl)?.id;
                    return (
                      <button
                        key={ct.id}
                        type="button"
                        onClick={() => setFormCardType(ct.id)}
                        className={`group p-3.5 rounded-3xl border text-start transition-all relative overflow-hidden flex flex-col justify-between gap-3 ${
                          active
                            ? 'bg-gradient-to-b from-amber-500/25 via-amber-500/10 to-black border-amber-400 ring-2 ring-amber-400/50 shadow-[0_18px_45px_-10px_rgba(212,175,55,0.5)] scale-[1.01]'
                            : 'bg-black/65 border-white/15 text-zinc-200 hover:border-amber-400/55 hover:bg-white/[0.04]'
                        }`}
                      >
                        {/* Live Miniature Card Rendered in This Exact Architecture */}
                        <MiniCardArchitectureVisual
                          cardType={ct.id}
                          accentColor={effectiveTheme.accentColor}
                          glowColor={effectiveTheme.glowColor}
                          isSelected={active}
                          titleText={formTitle || (isRtl ? ct.nameAr : ct.nameEn)}
                          subtitleText={formDesc || (isRtl ? ct.descAr : ct.descEn)}
                          platformId={activeSocialId}
                        />

                        <div>
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span
                              className={`text-xs sm:text-[13px] font-black leading-snug ${
                                active ? 'text-amber-300' : 'text-white group-hover:text-amber-200'
                              }`}
                            >
                              {isRtl ? ct.nameAr : ct.nameEn}
                            </span>
                            {active ? (
                              <span className="px-2 py-0.5 rounded-full bg-amber-400 text-black text-[9px] font-black uppercase flex items-center gap-1 shrink-0">
                                <CheckCircle2 className="w-2.5 h-2.5" />
                                <span>{isRtl ? 'مختار' : 'ACTIVE'}</span>
                              </span>
                            ) : (
                              <span
                                dir="ltr"
                                className="text-[9px] font-mono text-zinc-500 uppercase"
                              >
                                {ct.id}
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] leading-relaxed text-zinc-400">
                            {isRtl ? ct.descAr : ct.descEn}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* STEP 4: DUAL ICON STUDIO (14 OFFICIAL SOCIAL BRAND ICONS + VECTOR ICONS) */}
              <div className="p-4 rounded-3xl bg-black/50 border border-white/10 space-y-4">
                <div className="space-y-2">
                  <label className="block text-xs font-extrabold text-amber-300">
                    {isRtl
                      ? '3. الأيقونات الرسمية لمنصات وقنوات التواصل الاجتماعي (14 منصة رسمية):'
                      : '3. Official Social Media & Channel Emblems (14 Platforms):'}
                  </label>
                  <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                    {SOCIAL_PLATFORMS.map((plat) => {
                      const isSelected = formIcon.toLowerCase() === plat.id;
                      return (
                        <button
                          key={plat.id}
                          type="button"
                          onClick={() => {
                            setFormIcon(plat.id);
                            // Auto-set the title to the official channel / platform name
                            setFormTitle(isRtl ? plat.nameAr : plat.name);
                            const preset = OFFICIAL_CHANNEL_PRESETS.find((p) => p.platformId === plat.id);
                            if (preset) {
                              if (!formUrl || formUrl === 'https://') setFormUrl(preset.urlPrefix);
                              if (!formBadge) setFormBadge(isRtl ? preset.badgeAr : preset.badgeEn);
                              if (!formDesc) setFormDesc(isRtl ? preset.defaultDescAr : preset.defaultDescEn);
                            } else if (!formUrl || formUrl === 'https://') {
                              setFormUrl(plat.handlePrefix ? `https://${plat.domains[0]}/` : 'https://');
                            }
                          }}
                          className={`p-2 rounded-2xl border flex flex-col items-center gap-1.5 transition-all ${
                            isSelected
                              ? 'bg-amber-500/20 border-amber-400 ring-2 ring-amber-400/40 scale-105'
                              : 'bg-white/[0.03] border-white/10 hover:border-white/30'
                          }`}
                        >
                          <OfficialSocialBadge
                            platformId={plat.id}
                            size="sm"
                            variant="gradient"
                          />
                          <span className="text-[10px] font-bold text-zinc-200 truncate w-full text-center">
                            {isRtl ? plat.nameAr.split(' ')[0] : plat.name}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-3 border-t border-white/10 space-y-2">
                  <label className="block text-[11px] font-bold text-zinc-400">
                    {isRtl
                      ? 'أو اختر من الأيقونات الرمزية العامة للمواقع والمتاجر والملفات:'
                      : 'Or choose a general luxury vector icon:'}
                  </label>
                  <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto no-scrollbar p-2 rounded-2xl bg-black/60 border border-white/10">
                    {AVAILABLE_LINK_ICONS.map((iconName) => (
                      <button
                        key={iconName}
                        type="button"
                        onClick={() => setFormIcon(iconName)}
                        className={`p-2.5 rounded-xl border transition-all ${
                          formIcon === iconName
                            ? 'bg-amber-500 text-black border-amber-300 shadow-md shadow-amber-500/30 scale-105'
                            : 'bg-white/5 border-white/10 text-zinc-300 hover:bg-white/15 hover:border-white/25'
                        }`}
                        title={iconName}
                      >
                        <DynamicIcon name={iconName} className="w-4 h-4" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* STEP 5: THUMBNAIL, BADGE & VIP FEATURED SWITCH */}
              <div className="grid grid-cols-1 gap-4">
                <UniversalImageUploader
                  label={
                    isRtl
                      ? 'صورة مصغرة للرابط أو البطاقة المصورة (رفع جميع صيغ الصور أو رابط)'
                      : 'Link Thumbnail / Photo Card Image (Upload Any Image Format or URL)'
                  }
                  value={formThumb}
                  onChange={(newThumb) => setFormThumb(newThumb)}
                  defaultUrl=""
                  placeholder="https://..."
                  isRtl={isRtl}
                  compact={true}
                />
                <div>
                  <label className="block text-xs font-bold text-zinc-200 mb-2">
                    {isRtl ? 'نص الشارة الذهبية (VIP Badge Text)' : 'Highlight Badge Text'}
                  </label>
                  <input
                    type="text"
                    value={formBadge}
                    onChange={(e) => setFormBadge(e.target.value)}
                    placeholder={
                      isRtl ? 'مثال: قناة رسمية / VIP PASS / حصري' : 'NEW / VIP PASS / OFFICIAL'
                    }
                    className="w-full rounded-2xl bg-black/65 border border-white/15 focus:border-amber-400 px-4 py-3 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Luxury VIP Featured Toggle Card */}
              <button
                type="button"
                onClick={() => setFormFeatured((prev) => !prev)}
                className={`w-full p-4 rounded-2xl border flex items-center justify-between gap-4 transition-all text-start ${
                  formFeatured
                    ? 'bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-purple-500/20 border-amber-400 shadow-lg shadow-amber-500/15'
                    : 'bg-black/50 border-white/15 hover:border-white/30'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      formFeatured
                        ? 'bg-amber-400 text-black'
                        : 'bg-white/10 text-zinc-400'
                    }`}
                  >
                    <Crown className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm font-black text-white">
                      {isRtl
                        ? 'تمييز هذا الرابط في أعلى الصفحة (Featured VIP Spotlight)'
                        : 'Feature this link at the top of your page (VIP Spotlight)'}
                    </div>
                    <div className="text-[11px] text-zinc-400">
                      {isRtl
                        ? 'يظهر بإطار متوهج وشارة ملكية في القسم المميز أعلى صفحتك'
                        : 'Displays prominently in your Featured section with animated shimmer'}
                    </div>
                  </div>
                </div>
                <div
                  className={`w-12 h-7 rounded-full p-1 transition-colors shrink-0 flex items-center ${
                    formFeatured ? 'bg-amber-400 justify-end' : 'bg-zinc-700 justify-start'
                  }`}
                >
                  <span className="w-5 h-5 rounded-full bg-black shadow-md block" />
                </div>
              </button>

              {/* Scheduling Start & End */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-white/10">
                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-2 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-amber-400" />
                    <span>{isRtl ? 'جدولة بداية الظهور (اختياري)' : 'Schedule Start (Optional)'}</span>
                  </label>
                  <input
                    type="datetime-local"
                    value={formStart}
                    onChange={(e) => setFormStart(e.target.value)}
                    className="w-full rounded-2xl bg-black/65 border border-white/15 px-4 py-2.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-2 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-amber-400" />
                    <span>{isRtl ? 'جدولة انتهاء الظهور (اختياري)' : 'Schedule End (Optional)'}</span>
                  </label>
                  <input
                    type="datetime-local"
                    value={formEnd}
                    onChange={(e) => setFormEnd(e.target.value)}
                    className="w-full rounded-2xl bg-black/65 border border-white/15 px-4 py-2.5 text-xs text-white"
                  />
                </div>
              </div>

              {/* Modal Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setLinkFormOpen(false)}
                  className="px-5 py-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/15 text-xs font-bold text-zinc-300 transition-all"
                >
                  {isRtl ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-7 py-3 rounded-2xl bg-gradient-to-r from-amber-200 via-amber-400 to-amber-500 text-black font-black text-xs sm:text-sm shadow-xl shadow-amber-500/25 hover:brightness-110 transition-all flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>
                    {editingLink
                      ? isRtl
                        ? 'حفظ تعديلات البطاقة'
                        : 'Save Card Changes'
                      : isRtl
                      ? 'إضافة الرابط إلى صفحتي الآن'
                      : 'Add Link to My Page'}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  </div>
  );
}


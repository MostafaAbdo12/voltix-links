'use client';

import React, { useState, useRef, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Share2,
  QrCode,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  Copy,
  Check,
  X,
  Music,
  Play,
  Pause,
  Flag,
  Crown,
  ArrowUpRight,
  Fingerprint,
  ShieldCheck,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Disc,
  RotateCw,
  Layers,
  Zap,
  Image as ImageIcon,
  Tv,
  Film,
  ListMusic,
  ChevronDown,
  ChevronUp,
  Heart,
} from 'lucide-react';

function extractYouTubeId(url?: string): string | null {
  if (!url) return null;
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|music\.youtube\.com\/watch\?v=))([\w-]{11})/i);
  return match ? match[1] : null;
}

function extractSpotifyTrackId(url?: string): string | null {
  if (!url) return null;
  const match = url.match(/track[\/:]([a-zA-Z0-9]+)/i);
  return match ? match[1] : null;
}

export function detectPlatformFromMediaUrl(url: string): 'spotify' | 'youtube' | 'soundcloud' | 'custom' {
  if (!url) return 'youtube';
  const clean = url.trim().toLowerCase();
  if (/youtube\.com|youtu\.be/i.test(clean)) return 'youtube';
  if (/spotify\.com/i.test(clean)) return 'spotify';
  if (/soundcloud\.com/i.test(clean)) return 'soundcloud';
  if (/\.(mp3|wav|ogg|m4a|aac)(\?.*)?$/i.test(clean) || clean.startsWith('blob:') || clean.startsWith('data:audio')) return 'custom';
  return 'youtube';
}

function isCoverVideo(url?: string | null): boolean {
  if (!url) return false;
  const clean = url.trim().toLowerCase();
  if (clean.startsWith('data:video/')) return true;
  if (/\.(mp4|webm|mov|mkv|ogg|m4v|avi)(\?.*)?$/i.test(clean)) return true;
  if (/youtube\.com\/watch|youtu\.be\/|youtube\.com\/embed/i.test(clean)) return true;
  if (/vimeo\.com/i.test(clean)) return true;
  return false;
}

function isYouTubeCover(url?: string | null): boolean {
  if (!url) return false;
  return /youtube\.com|youtu\.be/i.test(url);
}

function isDirectAudioFile(url?: string): boolean {
  if (!url) return false;
  return /\.(mp3|wav|ogg|m4a|aac)(\?.*)?$/i.test(url) || url.startsWith('blob:') || url.startsWith('data:audio');
}
import {
  ThemeConfig,
  EffectsConfig,
  DEFAULT_EFFECTS_CONFIG,
  LinkCardType,
} from '@/lib/themes';
import {
  SocialPlatformId,
  SOCIAL_PLATFORMS,
  getSocialPlatform,
  detectSocialPlatformFromUrl,
  detectChannelBadgeLabel,
  OfficialSocialBadge,
} from '@/lib/social-platforms';
import { DynamicIcon } from '@/components/ui/DynamicIcon';
import { QrCodeView } from './QrCodeStudio';

export interface ProfileLinkItem {
  id: string;
  title: string;
  url: string;
  description?: string;
  icon?: string;
  thumbnailUrl?: string;
  groupName?: string;
  cardType?: string;
  isFeatured?: boolean;
  isActive?: boolean;
  order?: number;
  badgeText?: string;
  customStyleJson?: string;
  scheduledStart?: string | Date | null;
  scheduledEnd?: string | Date | null;
  clicksCount?: number;
}

export interface ProfileSocialItem {
  id: string;
  platform: string;
  url: string;
  isActive?: boolean;
  order?: number;
}

export interface MediaEmbedTrack {
  id: string;
  title: string;
  artist?: string;
  url: string;
  type?: 'spotify' | 'youtube' | 'soundcloud' | 'custom';
  coverUrl?: string;
}

export interface MediaEmbedConfig {
  enabled: boolean;
  type: 'spotify' | 'youtube' | 'soundcloud' | 'custom';
  title: string;
  artist?: string;
  url?: string;
  embedUrl?: string;
  coverUrl?: string;
  tracks?: MediaEmbedTrack[];
}

export interface ProfileData {
  id?: string;
  username: string;
  displayName: string;
  bio: string;
  avatarUrl?: string;
  avatarPosition?: { zoom: number; x: number; y: number };
  coverUrl?: string;
  coverPosition?: { zoom: number; x: number; y: number };
  isVerified?: boolean;
  locale?: 'ar' | 'en';
  links: ProfileLinkItem[];
  socialLinks: ProfileSocialItem[];
  sectionsOrder?: string[];
  mediaEmbed?: MediaEmbedConfig;
  qrConfig?: {
    fgColor: string;
    bgColor: string;
    includeLogo: boolean;
  };
}

interface ProfileRendererProps {
  profile: ProfileData;
  theme: ThemeConfig;
  effects?: EffectsConfig;
  isPreview?: boolean;
  compactPhone?: boolean;
  onLinkClick?: (link: ProfileLinkItem) => void;
}

export function RoyalVerifiedEmblem({
  size = 'md',
  isRtl = true,
}: {
  size?: 'sm' | 'md' | 'lg';
  isRtl?: boolean;
}) {
  const dimClass =
    size === 'lg'
      ? 'w-10 h-10'
      : size === 'sm'
      ? 'w-7 h-7'
      : 'w-8 h-8 sm:w-9 sm:h-9';

  return (
    <div
      title={isRtl ? 'هوية ملكية معتمدة وموثقة رسميًا' : 'Official Royal Verified Identity'}
      className={`relative ${dimClass} shrink-0 select-none group/badge transition-transform duration-300 hover:scale-110 cursor-pointer`}
    >
      {/* 1. Multi-Layer Golden Radiance Halo Glow */}
      <span
        className="absolute -inset-1 rounded-full blur-md opacity-90 animate-royal-glow pointer-events-none"
        style={{
          background:
            'radial-gradient(circle, rgba(250,204,21,0.95) 0%, rgba(212,175,55,0.7) 45%, rgba(212,175,55,0.15) 75%, transparent 100%)',
        }}
      />

      {/* 2. Precision Royal Minted Medallion with Crisp Obsidian Boundary */}
      <div className="relative w-full h-full rounded-full flex items-center justify-center drop-shadow-[0_4px_12px_rgba(0,0,0,0.85)]">
        <svg
          viewBox="0 0 32 32"
          className="w-full h-full drop-shadow-[0_2px_6px_rgba(212,175,55,0.65)]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* 3D Liquid Gold Metallic Gradient */}
            <linearGradient id="royalCoinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFEE8" />
              <stop offset="25%" stopColor="#FDE047" />
              <stop offset="55%" stopColor="#D4AF37" />
              <stop offset="85%" stopColor="#A16207" />
              <stop offset="100%" stopColor="#713F12" />
            </linearGradient>

            {/* Inner Recessed Bevel Gradient */}
            <radialGradient id="royalCoreGrad" cx="35%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#FFF9D2" />
              <stop offset="35%" stopColor="#FACC15" />
              <stop offset="70%" stopColor="#CA8A04" />
              <stop offset="100%" stopColor="#854D0E" />
            </radialGradient>
          </defs>

          {/* Outer Protective Obsidian Ring (Separates sharply from avatar background) */}
          <circle cx="16" cy="16" r="15" fill="url(#royalCoinGrad)" stroke="#06070B" strokeWidth="2" />

          {/* Inner Minted Bevel Ring */}
          <circle cx="16" cy="16" r="12" stroke="rgba(255,255,255,0.45)" strokeWidth="0.8" />
          <circle cx="16" cy="16" r="11" fill="url(#royalCoreGrad)" />

          {/* Bold Imperial Crown in Obsidian & Pure Gold Highlight */}
          <path
            d="M9.5 20L8 12.5L12.5 15L16 9.5L19.5 15L24 12.5L22.5 20H9.5Z"
            fill="#06070B"
            stroke="#FFFEE8"
            strokeWidth="0.5"
            strokeLinejoin="round"
          />
          {/* Crown Base Band with micro-gems */}
          <rect x="9.5" y="20.3" width="13" height="1.6" rx="0.5" fill="#06070B" />
          <circle cx="11.5" cy="21.1" r="0.45" fill="#FDE047" />
          <circle cx="16" cy="21.1" r="0.55" fill="#38BDF8" />
          <circle cx="20.5" cy="21.1" r="0.45" fill="#FDE047" />

          {/* 3 Pinnacle Jewels */}
          <circle cx="8" cy="12.5" r="0.9" fill="#FFFEE8" stroke="#06070B" strokeWidth="0.4" />
          <circle cx="16" cy="9.5" r="1.1" fill="#FFFEE8" stroke="#06070B" strokeWidth="0.4" />
          <circle cx="24" cy="12.5" r="0.9" fill="#FFFEE8" stroke="#06070B" strokeWidth="0.4" />
        </svg>

        {/* 3. Active Continuous Diagonal Light Shimmer Sweep */}
        <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none">
          <div className="w-[45%] h-full bg-gradient-to-r from-transparent via-white/80 to-transparent animate-badge-shimmer" />
        </div>
      </div>
    </div>
  );
}

export function ProfileRenderer({
  profile,
  theme,
  effects = DEFAULT_EFFECTS_CONFIG,
  isPreview = false,
  compactPhone = false,
  onLinkClick,
}: ProfileRendererProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [cursorPos, setCursorPos] = useState({ x: 50, y: 20 });
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportNote, setReportNote] = useState('');
  const [reportSent, setReportSent] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedHandle, setCopiedHandle] = useState(false);
  const [mediaPlaying, setMediaPlaying] = useState(false);
  const [mediaFlipped, setMediaFlipped] = useState(false);
  const [mediaHovered, setMediaHovered] = useState(false);
  const [mediaFavorite, setMediaFavorite] = useState(false);
  const [mediaProgress, setMediaProgress] = useState(0);
  const [mediaCurrentTime, setMediaCurrentTime] = useState(0);
  const [mediaDuration, setMediaDuration] = useState(225); // 3:45 default
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [playlistDrawerOpen, setPlaylistDrawerOpen] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Normalized playlist tracks (with seamless backward compatibility)
  const playlistTracks: MediaEmbedTrack[] = useMemo(() => {
    const media = profile.mediaEmbed;
    if (!media || !media.enabled) return [];
    if (Array.isArray(media.tracks) && media.tracks.length > 0) {
      const filtered = media.tracks.filter(
        (t) => (t.title && t.title.trim()) || (t.url && t.url.trim())
      );
      if (filtered.length > 0) return filtered;
    }
    if (media.title || media.url) {
      return [
        {
          id: 'legacy-default',
          title: media.title,
          artist: media.artist || '',
          url: media.url || '',
          type: media.type || 'youtube',
        },
      ];
    }
    return [];
  }, [profile.mediaEmbed]);

  const safeTrackIndex =
    currentTrackIndex < playlistTracks.length ? currentTrackIndex : 0;
  const activeTrack = playlistTracks[safeTrackIndex] || null;
  const rootYtVideoId = activeTrack?.url ? extractYouTubeId(activeTrack.url) : null;

  const handleSelectTrack = (idx: number) => {
    if (idx === safeTrackIndex) {
      setMediaPlaying((p) => !p);
    } else {
      setCurrentTrackIndex(idx);
      setMediaCurrentTime(0);
      setMediaProgress(0);
      setMediaPlaying(true);
    }
  };

  const handleNextTrack = () => {
    if (playlistTracks.length <= 1) {
      const newT = Math.min(mediaDuration, mediaCurrentTime + 10);
      setMediaCurrentTime(newT);
      if (audioRef.current) audioRef.current.currentTime = newT;
      return;
    }
    setCurrentTrackIndex((prev) => (prev + 1) % playlistTracks.length);
    setMediaCurrentTime(0);
    setMediaProgress(0);
    setMediaPlaying(true);
  };

  const handlePrevTrack = () => {
    if (playlistTracks.length <= 1) {
      const newT = Math.max(0, mediaCurrentTime - 10);
      setMediaCurrentTime(newT);
      if (audioRef.current) audioRef.current.currentTime = newT;
      return;
    }
    if (mediaCurrentTime > 3) {
      setMediaCurrentTime(0);
      setMediaProgress(0);
      if (audioRef.current) audioRef.current.currentTime = 0;
    } else {
      setCurrentTrackIndex((prev) => (prev - 1 + playlistTracks.length) % playlistTracks.length);
      setMediaCurrentTime(0);
      setMediaProgress(0);
      setMediaPlaying(true);
    }
  };

  // Active audio progress timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (mediaPlaying) {
      interval = setInterval(() => {
        setMediaCurrentTime((prev) => {
          if (prev >= mediaDuration) {
            setMediaPlaying(false);
            return 0;
          }
          const next = prev + 1;
          setMediaProgress(Math.round((next / mediaDuration) * 100));
          return next;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [mediaPlaying, mediaDuration]);

  // Sync direct HTML5 audio play/pause
  useEffect(() => {
    if (!audioRef.current) return;
    if (mediaPlaying) {
      audioRef.current.play().catch(() => {});
    } else {
      audioRef.current.pause();
    }
  }, [mediaPlaying]);

  const formatAudioTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const [mediaMuted, setMediaMuted] = useState(false);
  const [hoveredLinkId, setHoveredLinkId] = useState<string | null>(null);
  const [hoveredSocialId, setHoveredSocialId] = useState<string | null>(null);
  const [cardCoords, setCardCoords] = useState<
    Record<string, { x: number; y: number; rx: number; ry: number }>
  >({});

  const isRtl = (profile.locale || 'ar') === 'ar';
  const reduceMotion = effects.reduceMotion;

  const activeFont = isRtl ? theme.fontFamilyAr : theme.fontFamilyEn;
  const fontSizeClass =
    theme.fontSize === 'sm'
      ? 'text-sm'
      : theme.fontSize === 'lg'
      ? 'text-lg'
      : theme.fontSize === 'xl'
      ? 'text-xl'
      : 'text-base';

  const now = useMemo(() => new Date(), []);

  const visibleLinks = useMemo(() => {
    return (profile.links || []).filter((l) => {
      if (l.isActive === false) return false;
      if (l.scheduledStart) {
        const start = new Date(l.scheduledStart);
        if (!isNaN(start.getTime()) && now < start) return false;
      }
      if (l.scheduledEnd) {
        const end = new Date(l.scheduledEnd);
        if (!isNaN(end.getTime()) && now > end) return false;
      }
      return true;
    });
  }, [profile.links, now]);

  const featuredLinks = useMemo(() => visibleLinks.filter((l) => l.isFeatured), [visibleLinks]);
  const regularLinks = useMemo(() => visibleLinks.filter((l) => !l.isFeatured), [visibleLinks]);

  const groupedLinks = useMemo(() => {
    const groups: Record<string, ProfileLinkItem[]> = {};
    regularLinks.forEach((link) => {
      const g = link.groupName?.trim() || '__default__';
      if (!groups[g]) groups[g] = [];
      groups[g].push(link);
    });
    return groups;
  }, [regularLinks]);

  const visibleSocials = useMemo(
    () => (profile.socialLinks || []).filter((s) => s.isActive !== false && s.url),
    [profile.socialLinks]
  );

  const particles = useMemo(() => {
    if (!effects.floatingParticles || reduceMotion) return [];
    const density = Math.min(
      40,
      Math.floor(((theme.particleDensity ?? effects.particleDensity) / 100) * 32)
    );
    return Array.from({ length: density }).map((_, idx) => ({
      id: idx,
      left: `${(idx * 37) % 96}%`,
      top: `${(idx * 53) % 94}%`,
      size: (idx % 4) + 2,
      duration: 6 + (idx % 8),
      delay: (idx % 5) * 0.6,
    }));
  }, [effects.floatingParticles, effects.particleDensity, theme.particleDensity, reduceMotion]);

  const handleContainerMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (reduceMotion || (!effects.cursorGlow && !effects.mouseFollow)) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setCursorPos({ x, y });
  };

  const handleCardMouseMove = (id: string, e: React.MouseEvent<HTMLAnchorElement>) => {
    if (reduceMotion) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const relX = e.clientX - rect.left;
    const relY = e.clientY - rect.top;
    const pctX = (relX / rect.width - 0.5) * 2;
    const pctY = (relY / rect.height - 0.5) * 2;
    const tiltFactor = effects.cardTilt3d ? (effects.visualDepth / 100) * 8 : 0;

    setCardCoords((prev) => ({
      ...prev,
      [id]: {
        x: relX,
        y: relY,
        rx: -pctY * tiltFactor,
        ry: pctX * tiltFactor,
      },
    }));
  };

  const handleCardMouseLeave = (id: string) => {
    setHoveredLinkId(null);
    setCardCoords((prev) => ({
      ...prev,
      [id]: { x: 0, y: 0, rx: 0, ry: 0 },
    }));
  };

  const profileShareUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/@${profile.username}`
      : `/@${profile.username}`;

  const handleCopyUrl = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(profileShareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCopyHandle = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(profileShareUrl);
      setCopiedHandle(true);
      setTimeout(() => setCopiedHandle(false), 1800);
    }
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: `${profile.displayName} (@${profile.username}) — VoltiX`,
          text: profile.bio,
          url: profileShareUrl,
        });
        return;
      } catch {
        // Fallback to modal
      }
    }
    setShareModalOpen(true);
  };

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportReason) return;
    try {
      await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: profile.username,
          reason: reportReason,
          reporterNote: reportNote,
          targetUrl: profileShareUrl,
        }),
      });
      setReportSent(true);
      setTimeout(() => {
        setReportModalOpen(false);
        setReportSent(false);
        setReportReason('');
        setReportNote('');
      }, 1600);
    } catch {
      setReportSent(true);
    }
  };

  const getRadiusStyle = () => {
    if (theme.buttonStyle === 'pill' || theme.buttonStyle === 'glass-capsule') {
      return `${Math.max(theme.borderRadius, 24)}px`;
    }
    if (theme.buttonStyle === 'sharp') return '6px';
    if (theme.buttonStyle === 'chamfer') return '12px';
    return `${theme.borderRadius}px`;
  };

  // ==========================================================================
  // LUXURY LINK CARD RENDERER (SUPPORTS AUTO-DETECTED OFFICIAL SOCIAL ICONS)
  // ==========================================================================
  const renderSingleLinkCard = (link: ProfileLinkItem, idx: number, isBentoLayout = false) => {
    const effectiveCardType: LinkCardType =
      (theme.defaultCardType as LinkCardType) || (link.cardType as LinkCardType) || 'glass';
    const coords = cardCoords[link.id] || { x: 160, y: 35, rx: 0, ry: 0 };
    const isHovered = hoveredLinkId === link.id;
    const radius = getRadiusStyle();

    // Auto-detect if this link points to or uses one of the 14 official social networks!
    const detectedSocial =
      SOCIAL_PLATFORMS.find((p) => p.id === link.icon?.toLowerCase()) ||
      detectSocialPlatformFromUrl(link.url);

    let customStyle: { bg?: string; border?: string; text?: string; glow?: string } = {};
    if (link.customStyleJson) {
      try {
        customStyle = JSON.parse(link.customStyleJson);
      } catch {
        customStyle = {};
      }
    }

    const baseBg = customStyle.bg || theme.cardBg;
    const baseBorder = customStyle.border || theme.cardBorder;
    const baseGlow = customStyle.glow || detectedSocial?.glowColor || theme.glowColor;
    const baseText = customStyle.text || theme.textColor;

    const getCardSurfaceStyle = (): React.CSSProperties => {
      const common: React.CSSProperties = {
        borderRadius: radius,
        color: baseText,
        backdropFilter: `blur(${theme.glassBlur}px) saturate(180%)`,
        WebkitBackdropFilter: `blur(${theme.glassBlur}px) saturate(180%)`,
        transform:
          !reduceMotion && (effects.cardTilt3d || effects.magneticHover) && isHovered
            ? `perspective(1000px) rotateX(${coords.rx}deg) rotateY(${coords.ry}deg) translateY(-4px) scale(1.014)`
            : 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px) scale(1)',
        transition:
          'transform 0.24s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.32s ease, border-color 0.32s ease',
      };

      switch (effectiveCardType) {
        case 'neon':
          return {
            ...common,
            background: 'rgba(5, 6, 13, 0.94)',
            border: '2px solid #00F5D4',
            color: '#E0FFFA',
            boxShadow: isHovered
              ? '0 0 36px rgba(0,245,212,0.7), inset 0 0 16px rgba(0,245,212,0.3)'
              : '0 0 18px rgba(0,245,212,0.4), inset 0 0 10px rgba(0,245,212,0.15)',
          };
        case 'gradient':
          return {
            ...common,
            background: 'linear-gradient(135deg, #D4AF37 0%, #9333EA 50%, #F43F5E 100%)',
            border: '1px solid rgba(255,255,255,0.35)',
            color: '#FFFFFF',
            boxShadow: isHovered
              ? '0 22px 45px rgba(244,63,94,0.45)'
              : '0 12px 28px rgba(0,0,0,0.6)',
          };
        case '3d':
          return {
            ...common,
            background: 'linear-gradient(180deg, #27272A 0%, #18181B 55%, #09090B 100%)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderBottom: `6px solid ${detectedSocial?.color || theme.accentColor || '#D4AF37'}`,
            boxShadow: isHovered
              ? '0 22px 42px rgba(0,0,0,0.9), 0 0 24px rgba(212,175,55,0.35)'
              : '0 12px 22px rgba(0,0,0,0.85)',
          };
        case 'minimal':
          return {
            ...common,
            background: 'rgba(0,0,0,0.35)',
            borderRadius: '12px 12px 0 0',
            borderBottom: `2.5px solid ${isHovered ? theme.accentColor : 'rgba(212,175,55,0.6)'}`,
            backdropFilter: 'none',
          };
        case 'classic':
          return {
            ...common,
            borderRadius: '9999px',
            background: 'linear-gradient(90deg, #F3E5AB 0%, #D4AF37 50%, #AA771C 100%)',
            color: '#050508',
            border: '1.5px solid rgba(255,255,255,0.45)',
            boxShadow: isHovered ? '0 16px 36px rgba(212,175,55,0.6)' : '0 8px 24px rgba(212,175,55,0.3)',
          };
        case 'bento':
          return {
            ...common,
            background: 'linear-gradient(135deg, #121220 0%, #080810 100%)',
            border: `1px solid ${isHovered ? theme.accentColor : 'rgba(212,175,55,0.4)'}`,
            boxShadow: isHovered ? '0 16px 36px rgba(212,175,55,0.35)' : '0 10px 24px rgba(0,0,0,0.75)',
          };
        case 'icon':
          return {
            ...common,
            background: 'rgba(11, 11, 20, 0.88)',
            border: `1px solid ${isHovered ? theme.accentColor : 'rgba(212,175,55,0.45)'}`,
            boxShadow: isHovered ? '0 16px 36px rgba(212,175,55,0.35)' : '0 10px 24px rgba(0,0,0,0.75)',
          };
        case 'social_grid':
          return {
            ...common,
            background: 'linear-gradient(135deg, #071912 0%, #081018 100%)',
            border: '1px solid rgba(52,211,153,0.5)',
            boxShadow: isHovered ? '0 14px 30px rgba(16,185,129,0.35)' : '0 8px 20px rgba(0,0,0,0.6)',
          };
        case 'spotlight':
          return {
            ...common,
            background: isHovered
              ? `radial-gradient(420px circle at ${coords.x}px ${coords.y}px, ${baseGlow}48, ${baseBg} 75%)`
              : baseBg,
            border: `1px solid ${isHovered ? baseGlow : baseBorder}`,
            boxShadow: isHovered
              ? `0 20px 48px -10px ${baseGlow}48, inset 0 1px 1.5px rgba(255,255,255,0.32)`
              : `0 12px 30px -10px rgba(0,0,0,0.55), inset 0 1px 1px rgba(255,255,255,0.16)`,
          };
        case 'animated_border':
          return {
            ...common,
            background: 'rgba(9, 9, 18, 0.92)',
            border: `1.5px solid ${isHovered ? theme.accentColor : baseBorder}`,
            boxShadow: `0 14px 36px -10px ${baseGlow}50, inset 0 1px 1px rgba(255,255,255,0.22)`,
          };
        case 'image':
          return {
            ...common,
            background: link.thumbnailUrl
              ? `linear-gradient(to top, rgba(4,4,8,0.96) 20%, rgba(4,4,8,0.3) 100%), url(${link.thumbnailUrl}) center/cover no-repeat`
              : `linear-gradient(to top, rgba(4,4,8,0.96) 15%, rgba(212,175,55,0.3) 100%)`,
            border: `1px solid ${isHovered ? theme.accentColor : 'rgba(212,175,55,0.45)'}`,
            minHeight: compactPhone ? '104px' : '132px',
          };
        case 'glass':
        default:
          return {
            ...common,
            background: 'rgba(255, 255, 255, 0.08)',
            border: `1px solid ${isHovered ? theme.accentColor : 'rgba(255,255,255,0.25)'}`,
            boxShadow: isHovered
              ? `0 20px 44px -10px ${baseGlow}45, inset 0 1px 1.5px rgba(255,255,255,0.35)`
              : `0 10px 28px -8px rgba(0,0,0,0.5), inset 0 1px 1px rgba(255,255,255,0.18)`,
          };
      }
    };

    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
      if (isPreview) {
        e.preventDefault();
      }
      if (onLinkClick) {
        onLinkClick(link);
      } else if (!isPreview && link.id) {
        fetch('/api/analytics/click', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ linkId: link.id, userId: profile.id }),
          keepalive: true,
        }).catch(() => {});
      }
    };

    const spanTwoCols =
      isBentoLayout && (link.isFeatured || effectiveCardType === 'bento' || idx === 0);

    return (
      <motion.a
        key={link.id}
        href={link.url}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleClick}
        onMouseEnter={() => setHoveredLinkId(link.id)}
        onMouseMove={(e) => handleCardMouseMove(link.id, e)}
        onMouseLeave={() => handleCardMouseLeave(link.id)}
        initial={effects.staggeredEntry && !reduceMotion ? { opacity: 0, y: 20 } : false}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.42 / (effects.animationSpeed || 1), delay: idx * 0.06 }}
        style={getCardSurfaceStyle()}
        className={`group relative flex items-center justify-between gap-4 overflow-hidden ${
          compactPhone ? 'p-3.5' : 'p-4 sm:p-5'
        } ${spanTwoCols ? 'sm:col-span-2' : ''} ${
          effectiveCardType === 'image' ? 'items-end' : ''
        }`}
      >
        {/* Top Specular Glass Edge Highlight */}
        <span className="pointer-events-none absolute inset-x-4 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/35 to-transparent opacity-80" />

        {/* Moving Light Beam around Link Card */}
        {!reduceMotion && (effectiveCardType === 'animated_border' || link.isFeatured) && (
          <>
            <span
              className="voltix-card-beam"
              style={{
                '--beam-c1': baseGlow || theme.accentColor,
                '--beam-c2': theme.accentColor,
                '--beam-speed': '4s',
              } as React.CSSProperties}
            />
            <span
              className="voltix-card-beam-glow"
              style={{
                '--beam-c1': baseGlow || theme.accentColor,
                '--beam-c2': theme.accentColor,
                '--beam-speed': '4s',
              } as React.CSSProperties}
            />
          </>
        )}

        {/* Animated Holographic Shimmer Border for Featured / Animated Border cards */}
        {(effectiveCardType === 'animated_border' || link.isFeatured) &&
          effects.gradientBorder &&
          !reduceMotion && (
            <span
              className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-65 group-hover:opacity-100 transition-opacity"
              style={{
                background: `linear-gradient(90deg, transparent, ${theme.accentColor}44, ${baseGlow}44, transparent)`,
                backgroundSize: '200% 100%',
                animation: 'shimmer 3.2s linear infinite',
              }}
            />
          )}

        {/* Specular Light Sweep on Hover */}
        {effects.softShimmer && !reduceMotion && (
          <span className="pointer-events-none absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/15 to-transparent" />
        )}

        <div className="relative z-10 flex items-center gap-3.5 min-w-0 flex-1">
          {/* Thumbnail, Official Social Brand Emblem, or Luxury Icon */}
          {link.thumbnailUrl && effectiveCardType !== 'image' ? (
            <img
              src={link.thumbnailUrl}
              alt={link.title}
              className="w-12 h-12 rounded-2xl object-cover border border-white/20 shrink-0 shadow-lg"
            />
          ) : detectedSocial ? (
            <div className="transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 shrink-0">
              <OfficialSocialBadge
                platformId={detectedSocial.id}
                size={compactPhone ? 'md' : 'md'}
                variant="gradient"
              />
            </div>
          ) : (
            <div
              className={`relative shrink-0 flex items-center justify-center ${
                effectiveCardType === 'classic' ? 'rounded-full' : 'rounded-2xl'
              } overflow-hidden transition-all duration-300 group-hover:scale-110 ${
                effectiveCardType === 'icon'
                  ? 'w-14 h-14'
                  : compactPhone
                  ? 'w-11 h-11'
                  : 'w-12 h-12'
              }`}
              style={{
                background:
                  effectiveCardType === 'classic'
                    ? 'rgba(0,0,0,0.22)'
                    : effectiveCardType === 'neon'
                    ? 'rgba(0, 245, 212, 0.2)'
                    : effectiveCardType === 'icon'
                    ? 'linear-gradient(135deg, #FDE68A, #D4AF37, #B45309)'
                    : `linear-gradient(135deg, ${theme.accentColor}35, ${theme.glowColor}20)`,
                color:
                  effectiveCardType === 'classic'
                    ? '#050508'
                    : effectiveCardType === 'neon'
                    ? '#00F5D4'
                    : effectiveCardType === 'icon'
                    ? '#050508'
                    : theme.accentColor,
                border:
                  effectiveCardType === 'neon'
                    ? '1.5px solid #00F5D4'
                    : `1px solid ${theme.accentColor}55`,
                boxShadow:
                  effectiveCardType === 'neon'
                    ? '0 0 14px rgba(0, 245, 212, 0.5)'
                    : effectiveCardType === 'icon'
                    ? '0 8px 24px rgba(212, 175, 55, 0.45)'
                    : `0 8px 20px -4px ${theme.accentColor}40, inset 0 1px 1px rgba(255,255,255,0.32)`,
              }}
            >
              <span className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/25 to-transparent" />
              {effectiveCardType === 'neon' ? (
                <Zap className="w-5 h-5 relative z-10" />
              ) : effectiveCardType === 'bento' ? (
                <Layers className="w-5 h-5 relative z-10" />
              ) : (
                <DynamicIcon name={link.icon} className="w-5 h-5 relative z-10" />
              )}
            </div>
          )}

          <div className="min-w-0 flex-1 text-start space-y-1">
            {/* Eyebrow Badges Row */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {effectiveCardType === 'image' && (
                <span className="px-2 py-0.5 rounded-full bg-amber-400 text-black text-[8px] font-black uppercase tracking-wider shadow-sm">
                  HD COVER BANNER
                </span>
              )}

              {effectiveCardType === 'bento' && (
                <>
                  <span className="text-[8px] font-black uppercase tracking-wider text-amber-300 flex items-center gap-1">
                    <Layers className="w-2.5 h-2.5" /> BENTO
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/40 text-[7px] font-black text-emerald-300">
                    LIVE
                  </span>
                </>
              )}

              {effectiveCardType === 'neon' && (
                <span className="px-2 py-0.5 rounded-full bg-cyan-400/20 border border-cyan-400/50 text-cyan-300 text-[8px] font-mono font-bold uppercase tracking-wider">
                  NEON PULSE
                </span>
              )}

              {effectiveCardType === 'spotlight' && (
                <span className="px-1.5 py-0.5 rounded-full bg-amber-400/25 border border-amber-400/60 text-[8px] font-black text-amber-200 uppercase">
                  SPOTLIGHT
                </span>
              )}

              {effectiveCardType === 'minimal' && (
                <span className="px-1.5 py-0.5 rounded bg-amber-400/15 border border-amber-400/40 text-amber-300 font-mono font-black text-[9px]">
                  {String(idx + 1).padStart(2, '0')} //
                </span>
              )}

              {effectiveCardType === '3d' && (
                <span className="px-1.5 py-0.5 rounded bg-amber-400 text-black text-[8px] font-black">
                  3D
                </span>
              )}

              {(link.badgeText || link.isFeatured) && (
                <span
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider leading-none shadow-sm"
                  style={{
                    background:
                      effectiveCardType === 'classic'
                        ? 'rgba(0,0,0,0.22)'
                        : `linear-gradient(135deg, ${theme.accentColor}40, ${theme.glowColor}25)`,
                    color: effectiveCardType === 'classic' ? 'inherit' : theme.accentColor,
                    border: `1px solid ${theme.accentColor}70`,
                  }}
                >
                  <Crown className="w-2.5 h-2.5 shrink-0" />
                  <span>{link.badgeText || (isRtl ? 'مميز' : 'VIP')}</span>
                </span>
              )}

              {detectedSocial && (
                <span
                  className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider leading-none border"
                  style={{
                    backgroundColor: `${detectedSocial.color}20`,
                    borderColor: `${detectedSocial.color}60`,
                    color: detectedSocial.color,
                  }}
                >
                  {detectChannelBadgeLabel(link.url, isRtl) ||
                    (isRtl ? detectedSocial.nameAr.split(' ')[0] : detectedSocial.name)}
                </span>
              )}
            </div>

            {/* Full Readable Title */}
            <div
              className={`font-extrabold line-clamp-2 ${
                compactPhone
                  ? 'text-[13px] leading-[1.42]'
                  : `${fontSizeClass} leading-[1.45]`
              }`}
              style={{
                fontWeight: theme.fontWeight,
                letterSpacing: isRtl ? '0em' : `${theme.letterSpacing}em`,
              }}
            >
              {link.title}
            </div>

            {link.description && (
              <p
                dir="auto"
                className={`line-clamp-2 opacity-85 ${
                  compactPhone
                    ? 'text-[11px] leading-[1.55]'
                    : 'text-xs sm:text-[13px] leading-[1.65]'
                }`}
                style={{
                  color:
                    effectiveCardType === 'classic'
                      ? 'inherit'
                      : theme.secondaryTextColor,
                }}
              >
                {link.description}
              </p>
            )}
          </div>
        </div>

        {/* Magnetic Action Ring */}
        <div
          className="relative z-10 shrink-0 w-9 h-9 rounded-full flex items-center justify-center border transition-all duration-300 group-hover:scale-110 group-hover:rotate-45"
          style={{
            backgroundColor:
              effectiveCardType === 'classic'
                ? '#050508'
                : effectiveCardType === 'neon'
                ? '#00F5D4'
                : isHovered
                ? theme.accentColor
                : 'rgba(255,255,255,0.06)',
            borderColor:
              effectiveCardType === 'classic'
                ? 'transparent'
                : effectiveCardType === 'neon'
                ? '#00F5D4'
                : isHovered
                ? theme.accentColor
                : 'rgba(255,255,255,0.14)',
            color:
              effectiveCardType === 'classic'
                ? '#D4AF37'
                : effectiveCardType === 'neon'
                ? '#050508'
                : isHovered
                ? theme.isLight
                  ? '#FFFFFF'
                  : '#050508'
                : theme.textColor,
            boxShadow:
              effectiveCardType === 'neon'
                ? '0 0 14px #00F5D4'
                : isHovered
                ? `0 0 18px ${theme.accentColor}66`
                : 'none',
          }}
        >
          <ArrowUpRight className="w-4 h-4" />
        </div>
      </motion.a>
    );
  };

  const sectionsOrder =
    profile.sectionsOrder && profile.sectionsOrder.length > 0
      ? profile.sectionsOrder
      : ['header', 'social', 'featured', 'media', 'links'];

  // ==========================================================================
  // MONUMENTAL ROYAL SPATIAL IDENTITY HEADER CARD
  // ==========================================================================
  const renderHeaderSection = () => {
    const isGaming = theme.profileLayout === 'gaming';
    const isMinimal = theme.profileLayout === 'minimal-portfolio';
    const isBusiness = theme.profileLayout === 'business';

    return (
      <div
        key="section-header"
        className="relative mb-6 rounded-[32px] p-[2px] transition-all group/header-card"
        style={{
          boxShadow: `0 26px 70px -15px rgba(0,0,0,0.92), 0 0 45px ${theme.glowColor}25`,
        }}
      >
        {/* Animated Moving Light Beam Sweeping Around Card Perimeter */}
        <div className="absolute inset-0 rounded-[32px] overflow-hidden pointer-events-none">
          {/* Moving Conic Light Beam */}
          <div
            className="absolute -inset-[150%] animate-card-beam"
            style={{
              background: `conic-gradient(from 0deg at 50% 50%, transparent 0deg, transparent 65deg, ${theme.accentColor} 80deg, #FFFFFF 90deg, ${theme.glowColor} 100deg, transparent 115deg, transparent 245deg, ${theme.accentColor} 260deg, #FFFFFF 270deg, ${theme.glowColor} 280deg, transparent 295deg, transparent 360deg)`,
            }}
          />
          {/* Luminous Ambient Bloom Halo around corners */}
          <div
            className="absolute -inset-[150%] animate-card-beam opacity-80 blur-md"
            style={{
              background: `conic-gradient(from 0deg at 50% 50%, transparent 0deg, transparent 60deg, ${theme.accentColor} 82deg, #FFF9D2 90deg, ${theme.glowColor} 98deg, transparent 120deg, transparent 240deg, ${theme.accentColor} 262deg, #FFF9D2 270deg, ${theme.glowColor} 278deg, transparent 300deg, transparent 360deg)`,
            }}
          />
        </div>

        {/* Inner Card Container: 100% Opaque Obsidian Luxury Backplate to completely block the rotating border beam from showing through inside */}
        <div
          className="relative rounded-[30px] overflow-hidden transition-all z-10"
          style={{
            backgroundColor: '#07080E',
            backgroundImage: `
              radial-gradient(circle at 50% 0%, ${theme.accentColor}18 0%, transparent 60%),
              radial-gradient(circle at 10% 100%, ${theme.glowColor}10 0%, transparent 50%),
              linear-gradient(180deg, #0D0E17 0%, #06070B 100%)
            `,
            boxShadow: `inset 0 1px 1.5px rgba(255,255,255,0.18), inset 0 0 40px rgba(0,0,0,0.9)`,
          }}
        >
          {/* Top Panoramic Royal Crown Banner (Supports Images & Looping Cinematic Videos in all formats!) */}
        <div
          className={`relative w-full overflow-hidden ${
            compactPhone ? 'h-28' : 'h-36 sm:h-44'
          }`}
        >
          {profile.coverUrl ? (
            isCoverVideo(profile.coverUrl) ? (
              isYouTubeCover(profile.coverUrl) ? (
                <iframe
                  src={`https://www.youtube.com/embed/${extractYouTubeId(profile.coverUrl)}?autoplay=1&mute=1&loop=1&playlist=${extractYouTubeId(profile.coverUrl)}&controls=0&showinfo=0&rel=0&iv_load_policy=3&modestbranding=1`}
                  className="w-full h-full object-cover pointer-events-none scale-125"
                  allow="autoplay; encrypted-media"
                  title="Cover Video"
                />
              ) : (
                <video
                  src={profile.coverUrl}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                  style={{
                    transform: profile.coverPosition
                      ? `scale(${profile.coverPosition.zoom || 1}) translate(${profile.coverPosition.x || 0}px, ${profile.coverPosition.y || 0}px)`
                      : undefined,
                  }}
                />
              )
            ) : (
              <img
                src={profile.coverUrl}
                alt={profile.displayName}
                className="w-full h-full object-cover"
                style={{
                  transform: profile.coverPosition
                    ? `scale(${profile.coverPosition.zoom || 1}) translate(${profile.coverPosition.x || 0}px, ${profile.coverPosition.y || 0}px)`
                    : undefined,
                }}
              />
            )
          ) : (
            <div
              className="w-full h-full"
              style={{
                background: `radial-gradient(circle at 80% 20%, ${theme.accentColor}55 0%, transparent 55%),
                   radial-gradient(circle at 20% 80%, ${theme.glowColor}45 0%, transparent 60%),
                   linear-gradient(135deg, ${theme.gradientColors[0]} 0%, ${theme.gradientColors[1]} 50%, ${theme.gradientColors[2]} 100%)`,
              }}
            />
          )}

          <div className="absolute inset-0 cyber-grid-floor opacity-35 pointer-events-none" />
          
          {/* Soft vignette along bottom edge of banner meeting the 50% avatar equator */}
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#07080E]/90 to-transparent pointer-events-none" />
          {/* Precision Equator Hairline */}
          <div className="absolute inset-x-0 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-amber-400/35 to-transparent pointer-events-none" />

          {/* Top Corner Royal Edition Badge */}
          <div
            dir="ltr"
            className="absolute top-3.5 right-3.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-amber-400/40 text-[9px] font-black tracking-[0.18em] uppercase text-amber-200 flex items-center gap-1.5 shadow-xl z-10"
          >
            <Crown className="w-3 h-3 text-amber-400" />
            <span style={{ fontFamily: `"${theme.fontFamilyEn || 'Cinzel'}", sans-serif` }}>VOLTIX VIP</span>
          </div>
        </div>

        {/* Profile Identity Content: Avatar seated 50/50 exactly over the equator */}
        <div
          className={`relative z-10 px-4 pb-6 ${
            compactPhone ? '-mt-10' : '-mt-12 sm:-mt-14'
          } flex flex-col ${
            isMinimal || isBusiness ? 'items-start text-start' : 'items-center text-center'
          }`}
        >
          {/* Subtle Ambient Radial Glow centered behind the Avatar */}
          <div
            className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-80 h-32 rounded-full blur-3xl opacity-25"
            style={{
              background: `radial-gradient(circle, ${theme.accentColor} 0%, ${theme.glowColor} 50%, transparent 80%)`,
            }}
          />

          {/* 3D Orbital Royal Medallion Avatar */}
          <div className="relative group mb-3.5">
            {effects.profileRing && !reduceMotion && (
              <>
                <div
                  className="absolute -inset-2 rounded-full blur-md opacity-80 animate-pulse"
                  style={{
                    background: `conic-gradient(from 0deg, ${theme.accentColor}, ${theme.glowColor}, ${theme.gradientColors[1]}, ${theme.accentColor})`,
                  }}
                />
                <div
                  className="absolute -inset-1 rounded-full animate-spin-slow opacity-95"
                  style={{
                    background: `conic-gradient(from 90deg, ${theme.accentColor}, transparent 35%, ${theme.glowColor}, transparent 80%, ${theme.accentColor})`,
                  }}
                />
              </>
            )}

            <div
              className={`relative overflow-hidden flex items-center justify-center border-2 shadow-2xl ${
                isGaming ? 'rounded-3xl' : 'rounded-full'
              } ${compactPhone ? 'w-20 h-20' : 'w-24 h-24 sm:w-28 sm:h-28'}`}
              style={{
                borderColor: theme.accentColor,
                backgroundColor: '#07070C',
                boxShadow: `0 15px 35px -6px ${theme.glowColor}65, inset 0 1px 2px rgba(255,255,255,0.35)`,
              }}
            >
              {profile.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt={profile.displayName}
                  className="w-full h-full object-cover"
                  style={{
                    transform: profile.avatarPosition
                      ? `scale(${profile.avatarPosition.zoom || 1}) translate(${profile.avatarPosition.x || 0}px, ${profile.avatarPosition.y || 0}px)`
                      : undefined,
                  }}
                />
              ) : (
                <div
                  className="w-full h-full p-2.5 flex items-center justify-center relative"
                  style={{
                    background: `radial-gradient(circle at 50% 35%, ${theme.accentColor}38, #050508 80%)`,
                  }}
                >
                  <img
                    src="/voltix-logo.png"
                    alt={profile.displayName}
                    className="w-full h-full object-contain drop-shadow-[0_4px_12px_rgba(212,175,55,0.65)]"
                  />
                </div>
              )}
            </div>

            {/* Ultra-Luxury Sovereign Royal Verified Emblem (Crisp, Perfectly Positioned on Medallion Edge) */}
            {profile.isVerified && (
              <div className="absolute -bottom-1 -right-1 sm:-bottom-1.5 sm:-right-1.5 z-20">
                <RoyalVerifiedEmblem size={compactPhone ? 'sm' : 'md'} isRtl={isRtl} />
              </div>
            )}
          </div>

          {/* Display Name */}
          <h1
            dir="auto"
            className={`${
              compactPhone ? 'text-base sm:text-lg' : 'text-xl sm:text-3xl'
            } font-black ${
              isRtl ? 'leading-[1.42]' : 'leading-[1.22] tracking-tight'
            } px-2`}
            style={{
              color: theme.textColor,
              fontWeight: theme.fontWeight,
              letterSpacing: isRtl ? '0em' : `${theme.letterSpacing}em`,
            }}
          >
            {profile.displayName || `@${profile.username}`}
          </h1>

          {/* Unified VIP Identity Capsule (@username + Verified Crown) */}
          <div className="mt-2.5 flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              onClick={handleCopyHandle}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold leading-none border transition-all hover:scale-105 bg-black/45"
              style={{
                borderColor: `${theme.accentColor}45`,
                color: theme.textColor,
              }}
              dir="ltr"
            >
              <span
                className="w-2 h-2 rounded-full animate-pulse"
                style={{ backgroundColor: '#10B981' }}
              />
              <span
                className="font-bold tracking-tight"
                style={{ fontFamily: `"${theme.fontFamilyEn || 'Sora'}", sans-serif` }}
              >
                @{profile.username}
              </span>
              {copiedHandle ? (
                <Check className="w-3 h-3 text-emerald-400" />
              ) : (
                <Copy className="w-3 h-3 opacity-65" />
              )}
            </button>

            {profile.isVerified && (
              <span
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider leading-none border relative overflow-hidden group/pill"
                style={{
                  background: `linear-gradient(135deg, ${theme.accentColor}28, ${theme.glowColor}18)`,
                  borderColor: `${theme.accentColor}75`,
                  color: '#FFFDF0',
                  boxShadow: `0 0 16px ${theme.accentColor}35`,
                }}
              >
                {/* Micro shimmer line inside pill */}
                <span className="w-3 h-full absolute inset-0 bg-white/40 animate-badge-shimmer pointer-events-none" />
                <Crown className="w-3.5 h-3.5 text-amber-300 drop-shadow-[0_0_6px_rgba(255,215,0,0.8)] relative z-10" />
                <span className="relative z-10 text-amber-200">{isRtl ? 'عضوية ملكية موثقة' : 'ROYAL VERIFIED'}</span>
              </span>
            )}
          </div>

          {/* Bio */}
          {profile.bio && (
            <p
              dir="auto"
              className={`mt-3 max-w-md font-normal ${
                compactPhone
                  ? 'text-[11.5px] leading-[1.72] px-1'
                  : 'text-sm sm:text-[15px] leading-[1.82] px-3'
              }`}
              style={{ color: theme.secondaryTextColor }}
            >
              {profile.bio}
            </p>
          )}
        </div>
      </div>
    </div>
  );
  };

  // ==========================================================================
  // APPLE VISIONOS SPATIAL SOCIAL MEDIA DOCK (14 OFFICIAL PLATFORMS)
  // ==========================================================================
  const renderSocialSection = () => {
    if (visibleSocials.length === 0) return null;
    const isStartAligned =
      theme.profileLayout === 'minimal-portfolio' || theme.profileLayout === 'business';

    return (
      <div
        key="section-social"
        className={`mb-7 flex ${isStartAligned ? 'justify-start' : 'justify-center'}`}
      >
        <div
          className={`spatial-dock relative inline-flex flex-wrap items-center justify-center gap-2.5 rounded-3xl ${
            compactPhone ? 'px-3 py-2.5' : 'px-4 py-3'
          }`}
          style={{
            borderColor: theme.cardBorder,
          }}
        >
          {/* Moving Light Beam around Social Dock (Isolated in its own clipped layer so icons can float outside without being cut off) */}
          {!reduceMotion && (
            <div className="pointer-events-none absolute inset-0 rounded-[inherit] overflow-hidden z-0">
              <span
                className="voltix-card-beam"
                style={{
                  '--beam-c1': theme.accentColor,
                  '--beam-c2': theme.glowColor,
                  '--beam-speed': '4.5s',
                } as React.CSSProperties}
              />
              <span
                className="voltix-card-beam-glow"
                style={{
                  '--beam-c1': theme.accentColor,
                  '--beam-c2': theme.glowColor,
                  '--beam-speed': '4.5s',
                } as React.CSSProperties}
              />
            </div>
          )}
          {visibleSocials.map((s, idx) => {
            const meta = getSocialPlatform(s.platform);
            const socialKey = s.id || `${s.platform}-${idx}`;
            const isHovered = hoveredSocialId === socialKey;

            return (
              <motion.a
                key={socialKey}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => isPreview && e.preventDefault()}
                onMouseEnter={() => setHoveredSocialId(socialKey)}
                onMouseLeave={() => setHoveredSocialId(null)}
                whileHover={!reduceMotion ? { y: -10, scale: 1.25 } : undefined}
                whileTap={!reduceMotion ? { scale: 0.94 } : undefined}
                transition={{ type: 'spring', stiffness: 450, damping: 25 }}
                className="relative group z-10 hover:z-50"
              >
                <OfficialSocialBadge
                  platformId={s.platform}
                  size={compactPhone ? 'sm' : 'md'}
                  interactive={false}
                  variant={
                    theme.socialIconsStyle === 'neon'
                      ? 'neon'
                      : theme.socialIconsStyle === 'outline' ||
                        theme.socialIconsStyle === 'minimal'
                      ? 'outline'
                      : 'gradient'
                  }
                  className="shadow-lg group-hover:shadow-[0_12px_24px_-4px_rgba(0,0,0,0.8)]"
                />

                {/* Floating Spatial Tooltip Pill */}
                <AnimatePresence>
                  {isHovered && !compactPhone && (
                    <motion.div
                      initial={{ opacity: 0, y: 6, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 4, scale: 0.9 }}
                      className="pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 z-50 px-2.5 py-1 rounded-lg bg-black/90 border border-white/20 text-[10px] font-extrabold text-white whitespace-nowrap shadow-xl"
                    >
                      {isRtl ? meta.nameAr : meta.name}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.a>
            );
          })}
        </div>
      </div>
    );
  };

  const renderFeaturedSection = () => {
    if (featuredLinks.length === 0) return null;
    return (
      <div key="section-featured" className="space-y-4 mb-6">
        {featuredLinks.map((link, idx) => renderSingleLinkCard(link, idx, false))}
      </div>
    );
  };

  const SYMMETRICAL_WAVE_BARS = useMemo(
    () => [
      20, 24, 30, 42, 58, 75, 92, 100, 95, 82, 65, 48, 36, 30, 36, 50,
      70, 88, 100, 94, 82, 65, 50, 40, 46, 62, 80, 92, 82, 68, 52, 38,
      28, 22, 18, 14,
    ],
    []
  );

  const renderMediaSection = () => {
    if (playlistTracks.length === 0 || !activeTrack) return null;

    const trackType =
      activeTrack.type ||
      (activeTrack.url ? detectPlatformFromMediaUrl(activeTrack.url) : 'youtube');
    const isYouTube =
      trackType === 'youtube' || /youtube\.com|youtu\.be/i.test(activeTrack.url || '');
    const isSpotify =
      trackType === 'spotify' || /spotify\.com/i.test(activeTrack.url || '');
    const isSoundcloud =
      trackType === 'soundcloud' || /soundcloud\.com/i.test(activeTrack.url || '');
    const isDirectAudio = isDirectAudioFile(activeTrack.url);

    const ytVideoId = isYouTube ? extractYouTubeId(activeTrack.url) : null;
    const spotifyTrackId = isSpotify ? extractSpotifyTrackId(activeTrack.url) : null;

    const platformColor = isYouTube
      ? '#EF4444'
      : isSpotify
      ? '#10B981'
      : isSoundcloud
      ? '#F97316'
      : theme.accentColor;

    const platformLabel = isYouTube
      ? 'YOUTUBE MUSIC'
      : isSpotify
      ? 'SPOTIFY STUDIO'
      : isSoundcloud
      ? 'SOUNDCLOUD'
      : 'AUDIO STREAM';

    const isMasterpieceVisible = mediaFlipped || mediaHovered || mediaPlaying;

    return (
      <div key="section-media" className="mb-6 w-full">
        {/* Real HTML5 Direct Audio Engine */}
        {isDirectAudio && (
          <audio
            key={`audio-engine-${activeTrack.id || activeTrack.url}`}
            ref={audioRef}
            src={activeTrack.url}
            preload="metadata"
            onLoadedMetadata={(e) => {
              const dur = Math.round(e.currentTarget.duration);
              if (dur && !isNaN(dur)) setMediaDuration(dur);
            }}
            onTimeUpdate={(e) => {
              const cur = Math.round(e.currentTarget.currentTime);
              setMediaCurrentTime(cur);
              if (mediaDuration > 0) {
                setMediaProgress(Math.round((cur / mediaDuration) * 100));
              }
            }}
            onEnded={() => {
              if (playlistTracks.length > 1) {
                handleNextTrack();
              } else {
                setMediaPlaying(false);
                setMediaCurrentTime(0);
                setMediaProgress(0);
              }
            }}
          />
        )}

        {/* Real YouTube Audio Engine */}
        {isYouTube && ytVideoId && mediaPlaying && (
          <iframe
            key={`yt-audio-${ytVideoId}`}
            src={`https://www.youtube-nocookie.com/embed/${ytVideoId}?autoplay=1&playsinline=1&controls=0&modestbranding=1&rel=0`}
            title={activeTrack.title}
            allow="autoplay; encrypted-media"
            className="w-1 h-1 opacity-0 fixed -bottom-10 -left-10 pointer-events-none"
            tabIndex={-1}
          />
        )}

        {/* 3D Interactive Morph / Flip Transition Container */}
        <div
          className="relative w-full perspective-1200 cursor-pointer select-none min-h-[106px] sm:min-h-[114px]"
          onMouseEnter={() => setMediaHovered(true)}
          onMouseLeave={() => setMediaHovered(false)}
        >
          <div
            className={`relative w-full h-full min-h-[106px] sm:min-h-[114px] preserve-3d transition-transform duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
              isMasterpieceVisible
                ? '[transform:rotateY(180deg)]'
                : '[transform:rotateY(0deg)]'
            }`}
          >
            {/* ====================================================================
                FRONT FACE: SLEEK VOLTIX AUDIO IDENTITY CARD (DEFAULT STATE)
                ==================================================================== */}
            <div
              className="w-full h-full min-h-[106px] sm:min-h-[114px] backface-hidden rounded-[26px] p-[2px] relative overflow-hidden shadow-2xl transition-all group/front-card"
              style={{
                boxShadow: `0 20px 50px -10px rgba(0,0,0,0.85), 0 0 32px ${platformColor}25`,
              }}
              onClick={() => setMediaFlipped(true)}
              title={isRtl ? 'انقر أو مرر لعرض المشغل الملكي' : 'Click or hover for Royal Player'}
            >
              {/* Dynamic Laser Border Beam */}
              {!reduceMotion && (
                <div
                  className="absolute -inset-[150%] animate-border-beam opacity-85 pointer-events-none"
                  style={{
                    background: `conic-gradient(from 0deg, transparent 0deg, ${platformColor} 65deg, #FFFFFF 80deg, ${platformColor} 95deg, transparent 135deg, transparent 360deg)`,
                  }}
                />
              )}

              {/* Spatial Glass Face */}
              <div className="relative h-full min-h-[102px] sm:min-h-[110px] rounded-[24px] bg-[#07080E]/95 backdrop-blur-2xl p-3 sm:p-4 flex items-center justify-between border border-white/10 z-10 gap-3">
                {/* Turntable Core + Track Metadata */}
                <div className="flex items-center gap-3.5 min-w-0">
                  <div
                    className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center shrink-0 cursor-pointer shadow-xl group/vinyl"
                    onClick={(e) => {
                      e.stopPropagation();
                      setMediaPlaying((p) => !p);
                    }}
                    title={
                      mediaPlaying
                        ? isRtl
                          ? 'إيقاف مؤقت'
                          : 'Pause'
                        : isRtl
                        ? 'تشغيل'
                        : 'Play'
                    }
                  >
                    <div
                      className={`absolute inset-0 rounded-full border border-white/20 shadow-2xl flex items-center justify-center animate-spin-reel ${
                        mediaPlaying ? '' : 'paused'
                      }`}
                      style={{
                        background:
                          'radial-gradient(circle at center, #252525 15%, #050508 45%, #161616 70%, #000 100%)',
                      }}
                    >
                      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-white/10 flex items-center justify-center overflow-hidden">
                        {activeTrack.coverUrl ? (
                          <img
                            src={activeTrack.coverUrl}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div
                            className="w-4 h-4 rounded-full shadow-md"
                            style={{ backgroundColor: platformColor }}
                          />
                        )}
                      </div>
                    </div>

                    <div className="relative z-10 w-6 h-6 rounded-full bg-black/80 backdrop-blur-sm flex items-center justify-center text-white border border-white/25 group-hover/vinyl:scale-110 transition-transform">
                      {mediaPlaying ? (
                        <Pause className="w-3 h-3 fill-current" />
                      ) : (
                        <Play className="w-3 h-3 fill-current ml-0.5" />
                      )}
                    </div>
                  </div>

                  <div className="min-w-0 text-start space-y-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span
                        className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border shadow-sm"
                        style={{
                          backgroundColor: `${platformColor}18`,
                          color: platformColor,
                          borderColor: `${platformColor}40`,
                        }}
                      >
                        {platformLabel}
                      </span>
                      <span className="text-[10px] font-mono text-zinc-400 font-bold">
                        LOSSLESS MASTER
                      </span>
                      {playlistTracks.length > 1 && (
                        <span className="text-[10px] font-mono text-amber-300 font-bold px-1.5 py-0.2 bg-amber-400/10 rounded-full border border-amber-400/25">
                          {safeTrackIndex + 1}/{playlistTracks.length}
                        </span>
                      )}
                    </div>
                    <h3 className="text-sm sm:text-base font-black text-white truncate leading-snug">
                      {activeTrack.title}
                    </h3>
                    <p className="text-xs text-zinc-400 truncate">
                      {activeTrack.artist ||
                        (isRtl ? 'فنان رسمي' : 'Official Creator')}
                    </p>
                  </div>
                </div>

                {/* Right / End: Visualizer Hint & Master Actions */}
                <div className="flex items-center gap-2.5 shrink-0">
                  {/* Interactive Flip Invitation Pill */}
                  <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500/10 via-amber-400/20 to-amber-500/10 border border-amber-400/35 text-[11px] font-bold text-amber-300 shadow-sm animate-pulse">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>
                      {isRtl
                        ? 'مرر الماوس للمشغل الملكي'
                        : 'Hover for Royal Player'}
                    </span>
                  </div>

                  {/* Direct Play/Pause Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setMediaPlaying((p) => !p);
                    }}
                    className="w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center text-white shadow-xl hover:scale-105 active:scale-95 transition-all"
                    style={{
                      background: `linear-gradient(135deg, ${platformColor}, #7F1D1D)`,
                      boxShadow: `0 0 20px ${platformColor}70`,
                    }}
                    aria-label={mediaPlaying ? 'Pause' : 'Play'}
                  >
                    {mediaPlaying ? (
                      <Pause className="w-4 h-4 fill-current" />
                    ) : (
                      <Play className="w-4 h-4 fill-current ml-0.5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* ====================================================================
                BACK FACE: VOLTIX ROYAL GOLD MASTERPIECE CAPSULE (HOVER/ACTIVE)
                Inspired pixel-by-pixel by the uploaded image design
                ==================================================================== */}
            <div
              className="w-full h-full min-h-[106px] sm:min-h-[114px] absolute inset-0 backface-hidden [transform:rotateY(180deg)] rounded-[32px] sm:rounded-full p-[2.5px] shadow-2xl transition-all"
              style={{
                background:
                  'linear-gradient(135deg, #FFF0B3 0%, #D4AF37 20%, #7A5711 45%, #FFDF73 72%, #A88121 100%)',
                boxShadow:
                  '0 25px 65px -12px rgba(0,0,0,0.98), 0 0 35px rgba(212, 175, 55, 0.4), inset 0 1px 2px rgba(255,255,255,0.75)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Specular Highlight Glints (Top & Bottom Center Flares) */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-36 sm:w-44 h-[2px] bg-gradient-to-r from-transparent via-white to-transparent opacity-95 shadow-[0_0_10px_#FFFFFF] pointer-events-none z-30" />
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-28 sm:w-36 h-[2px] bg-gradient-to-r from-transparent via-amber-300 to-transparent opacity-85 shadow-[0_0_8px_rgba(251,191,36,0.8)] pointer-events-none z-30" />

              {/* Obsidian & Crimson Silk Luxury Chamber */}
              <div
                className="relative w-full h-full min-h-[101px] sm:min-h-[109px] rounded-[30px] sm:rounded-full bg-[#060406] px-3.5 sm:px-5 py-2.5 sm:py-3 flex items-center justify-between gap-3 sm:gap-4.5 border border-amber-400/25 overflow-hidden z-20"
                style={{
                  backgroundImage:
                    'radial-gradient(ellipse at 75% 35%, rgba(185, 28, 28, 0.28) 0%, transparent 60%), radial-gradient(ellipse at 25% 65%, rgba(212, 175, 55, 0.16) 0%, transparent 55%), radial-gradient(ellipse at 50% 50%, rgba(12, 8, 12, 0.95) 0%, #060406 100%)',
                }}
                dir="ltr"
              >
                {/* 1. LEFT: 3D Turntable Vinyl Disc (Concentric Grooves + Album Art) */}
                <div
                  className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center shrink-0 cursor-pointer shadow-2xl group/vinyl"
                  onClick={() => setMediaPlaying((p) => !p)}
                  style={{
                    boxShadow:
                      '0 0 0 1.5px rgba(212, 175, 55, 0.85), 0 4px 18px rgba(0,0,0,0.95)',
                  }}
                  title={
                    mediaPlaying
                      ? isRtl
                        ? 'إيقاف مؤقت'
                        : 'Pause'
                      : isRtl
                      ? 'تشغيل'
                      : 'Play'
                  }
                >
                  {/* Concentric Circular Vinyl Grooves */}
                  <div
                    className={`absolute inset-0 rounded-full flex items-center justify-center animate-spin-reel ${
                      mediaPlaying ? '' : 'paused'
                    }`}
                    style={{
                      background:
                        'repeating-radial-gradient(circle, #242424 0px, #242424 1px, #0e0e0e 1.5px, #0e0e0e 3px)',
                    }}
                  >
                    {/* Center Circular Label Artwork */}
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-amber-300/80 overflow-hidden shadow-inner relative flex items-center justify-center bg-black">
                      <img
                        src={
                          activeTrack.coverUrl ||
                          'https://images.unsplash.com/photo-1532767153582-b1a0e5145009?w=300&auto=format&fit=crop&q=80'
                        }
                        alt=""
                        className="w-full h-full object-cover"
                      />
                      {/* Spindle Pin Point */}
                      <div className="absolute w-2 h-2 rounded-full bg-amber-400 border border-white/60 shadow-md" />
                    </div>
                  </div>
                </div>

                {/* 2. CENTER-LEFT: Track Metadata & Lossless Badge */}
                <div className="min-w-0 max-w-[130px] sm:max-w-[170px] text-left shrink-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-[8.5px] sm:text-[9px] font-bold tracking-[0.2em] uppercase text-zinc-400">
                      NOW PLAYING
                    </span>
                    <span className="h-[1px] w-5 sm:w-7 bg-gradient-to-r from-amber-400/70 to-transparent inline-block" />
                  </div>
                  <h3
                    className="text-sm sm:text-base font-black text-white leading-tight truncate"
                    dir={isRtl ? 'rtl' : 'ltr'}
                  >
                    {activeTrack.title}
                  </h3>
                  <p
                    className="text-xs text-amber-200/80 truncate leading-snug"
                    dir={isRtl ? 'rtl' : 'ltr'}
                  >
                    {activeTrack.artist || (isRtl ? 'سليم' : 'Official Artist')}
                  </p>
                  <div className="flex items-center gap-1.5 text-[8.5px] sm:text-[9px] font-mono tracking-wider text-amber-400/90 pt-0.5">
                    <span>LOSSLESS</span>
                    <span className="w-1 h-1 rounded-full bg-amber-400/70" />
                    <span>48 kHz</span>
                  </div>
                </div>

                {/* 3. CENTER: Symmetrical Mirrored Waveform + Ruby Jewel Timeline Scrubber */}
                <div className="flex-1 min-w-0 flex flex-col justify-center px-1 sm:px-2 gap-1.5">
                  {/* Symmetrical Mirrored Acoustic Waveform */}
                  <div className="flex items-center justify-center gap-[2px] sm:gap-[2.5px] h-6 sm:h-7 overflow-hidden">
                    {SYMMETRICAL_WAVE_BARS.map((h, idx) => {
                      const isRubyCrimson = idx >= 13 && idx <= 22;
                      const isLeftChampagne = idx < 13;

                      const barBg = isRubyCrimson
                        ? 'linear-gradient(180deg, #FCA5A5 0%, #EF4444 35%, #DC2626 70%, #991B1B 100%)'
                        : isLeftChampagne
                        ? 'linear-gradient(180deg, #FEF08A 0%, #D4AF37 40%, #B45309 85%, #78350F 100%)'
                        : 'linear-gradient(180deg, #FDE68A 0%, #EAB308 40%, #D97706 85%, #92400E 100%)';

                      const barShadow = isRubyCrimson
                        ? '0 0 6px rgba(239,68,68,0.85)'
                        : '0 0 4px rgba(212,175,55,0.6)';

                      return (
                        <div
                          key={`sym-bar-${idx}`}
                          className={`w-[2px] sm:w-[2.5px] rounded-full animate-symmetrical-wave ${
                            mediaPlaying ? '' : 'paused'
                          }`}
                          style={{
                            height: `${h}%`,
                            background: barBg,
                            boxShadow: barShadow,
                            animationDelay: `${idx * 0.038}s`,
                          }}
                        />
                      );
                    })}
                  </div>

                  {/* Timeline Scrubber with 3D Spherical Ruby-Red Jewel Knob */}
                  <div className="flex items-center gap-2">
                    <span className="text-[9.5px] sm:text-[10px] font-mono font-bold text-amber-200/90 shrink-0">
                      {formatAudioTime(mediaCurrentTime)}
                    </span>

                    <div
                      className="relative flex-1 h-3 flex items-center cursor-pointer group/scrub"
                      onClick={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const pct = Math.max(
                          0,
                          Math.min(1, (e.clientX - rect.left) / rect.width)
                        );
                        const newTime = Math.round(pct * mediaDuration);
                        setMediaCurrentTime(newTime);
                        setMediaProgress(Math.round(pct * 100));
                        if (audioRef.current)
                          audioRef.current.currentTime = newTime;
                      }}
                      title={isRtl ? 'تقديم / تأخير المقطع' : 'Seek Timeline'}
                    >
                      {/* Background Groove */}
                      <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                        {/* Active Filled Track */}
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-amber-400 via-red-500 to-red-600 shadow-[0_0_8px_rgba(239,68,68,0.7)]"
                          style={{ width: `${mediaProgress}%` }}
                        />
                      </div>

                      {/* 3D Spherical Ruby-Red Jewel Knob */}
                      <div
                        className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full border border-amber-300/90 shadow-[0_0_12px_rgba(239,68,68,0.95)] animate-jewel-glow transition-all duration-75 pointer-events-none"
                        style={{
                          left: `${mediaProgress}%`,
                          background:
                            'radial-gradient(circle at 35% 30%, #FFA8A8 0%, #EF4444 40%, #7F1D1D 80%, #2A0404 100%)',
                          boxShadow:
                            '0 0 10px rgba(239, 68, 68, 0.95), 0 0 20px rgba(212, 175, 55, 0.5), inset 0 1px 1.5px rgba(255,255,255,0.7)',
                        }}
                      />
                    </div>

                    <span className="text-[9.5px] sm:text-[10px] font-mono font-bold text-zinc-400 shrink-0">
                      {formatAudioTime(mediaDuration)}
                    </span>
                  </div>
                </div>

                {/* 4. RIGHT: Master Brushed Gold Controls Suite */}
                <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                  {/* Skip Previous |< */}
                  <button
                    type="button"
                    onClick={handlePrevTrack}
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-amber-300 hover:text-white hover:bg-white/10 transition-all active:scale-90"
                    title={
                      playlistTracks.length > 1
                        ? isRtl
                          ? 'المقطع السابق'
                          : 'Previous Track'
                        : 'Skip -10s'
                    }
                  >
                    <SkipBack className="w-3.5 h-3.5 fill-current" />
                  </button>

                  {/* MASTER BRUSHED GOLD CIRCULAR PLAY/PAUSE BUTTON */}
                  <button
                    type="button"
                    onClick={() => setMediaPlaying((p) => !p)}
                    className="w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center shadow-2xl hover:scale-105 active:scale-95 transition-all cursor-pointer relative group/play shrink-0"
                    style={{
                      background:
                        'radial-gradient(circle at 35% 35%, #FFF8D6 0%, #E6C265 35%, #B88A28 70%, #6E4F10 100%)',
                      boxShadow:
                        '0 4px 18px rgba(0,0,0,0.9), 0 0 22px rgba(212, 175, 55, 0.5), inset 0 1px 2px rgba(255,255,255,0.85)',
                    }}
                    aria-label={mediaPlaying ? 'Pause' : 'Play'}
                  >
                    <div className="absolute inset-[3px] rounded-full border border-amber-200/50 pointer-events-none" />
                    {mediaPlaying ? (
                      <Pause className="w-4 h-4 sm:w-5 sm:h-5 fill-black text-black" />
                    ) : (
                      <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-black text-black ml-0.5" />
                    )}
                  </button>

                  {/* Skip Next >| */}
                  <button
                    type="button"
                    onClick={handleNextTrack}
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-amber-300 hover:text-white hover:bg-white/10 transition-all active:scale-90"
                    title={
                      playlistTracks.length > 1
                        ? isRtl
                          ? 'المقطع التالي'
                          : 'Next Track'
                        : 'Skip +10s'
                    }
                  >
                    <SkipForward className="w-3.5 h-3.5 fill-current" />
                  </button>

                  {/* YouTube Video Clip Lacquer Button (Top-Right Action) */}
                  {isYouTube && ytVideoId && (
                    <button
                      type="button"
                      onClick={() => setShowVideoModal(true)}
                      className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-white transition-all hover:scale-110 active:scale-90 shadow-lg relative group/clip cursor-pointer shrink-0"
                      style={{
                        background:
                          'radial-gradient(circle at 35% 30%, #FF6B6B 0%, #DC2626 50%, #7F1D1D 90%, #350505 100%)',
                        boxShadow:
                          '0 0 12px rgba(239, 68, 68, 0.75), inset 0 1px 1px rgba(255,255,255,0.6)',
                        border: '1px solid rgba(254, 202, 202, 0.4)',
                      }}
                      title={
                        isRtl
                          ? 'مشاهدة الفيديو كليب بدقة عالية'
                          : 'Watch HD Video Clip'
                      }
                    >
                      <Film className="w-3.5 h-3.5 text-white" />
                    </button>
                  )}

                  {/* Favorite / Heart Button */}
                  <button
                    type="button"
                    onClick={() => setMediaFavorite((f) => !f)}
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-90 shadow-md shrink-0 ${
                      mediaFavorite
                        ? 'text-red-400 bg-red-500/20 border border-red-500/50 shadow-[0_0_10px_rgba(239,68,68,0.5)]'
                        : 'text-amber-200/70 hover:text-amber-200 bg-white/5 hover:bg-white/10 border border-white/10'
                    }`}
                    title={isRtl ? 'إضافة للمفضلة' : 'Favorite Track'}
                  >
                    <Heart
                      className={`w-3.5 h-3.5 ${
                        mediaFavorite ? 'fill-current' : ''
                      }`}
                    />
                  </button>

                  {/* Continuous Playlist Drawer Toggle */}
                  {playlistTracks.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setPlaylistDrawerOpen((o) => !o)}
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-90 shadow-md shrink-0 ${
                        playlistDrawerOpen
                          ? 'text-amber-300 bg-amber-400/20 border border-amber-400/60 shadow-[0_0_10px_rgba(212,175,55,0.4)]'
                          : 'text-amber-200/70 hover:text-amber-200 bg-white/5 hover:bg-white/10 border border-white/10'
                      }`}
                      title={
                        isRtl ? 'قائمة التشغيل المتتالية' : 'Playlist Queue'
                      }
                    >
                      <ListMusic className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {/* Manual Flip-Back Button */}
                  <button
                    type="button"
                    onClick={() => {
                      setMediaFlipped(false);
                      setMediaHovered(false);
                    }}
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-amber-300/80 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all hover:scale-110 active:scale-90 shadow-md shrink-0"
                    title={isRtl ? 'العودة للبطاقة الأصلية' : 'Flip to Card'}
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ====================================================================
            EXPANDABLE LUXURY PLAYLIST QUEUE DRAWER
            ==================================================================== */}
        {playlistTracks.length > 1 && (
          <AnimatePresence>
            {playlistDrawerOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.28, ease: 'easeOut' }}
                className="mt-3 p-3.5 rounded-[24px] bg-[#07080E]/95 backdrop-blur-2xl border border-white/10 shadow-2xl overflow-hidden"
              >
                <div className="flex items-center justify-between px-1 pb-2 text-[11px] font-bold text-zinc-400">
                  <span className="flex items-center gap-1.5 text-amber-300">
                    <ListMusic className="w-3.5 h-3.5" />
                    <span>
                      {isRtl
                        ? 'قائمة التشغيل المتتالية'
                        : 'Continuous Playlist Queue'}
                    </span>
                  </span>
                  <span className="text-[10px] text-zinc-500 font-mono">
                    {isRtl
                      ? 'انقر على أي مقطع للانتقال الفوري'
                      : 'Tap any track to play'}
                  </span>
                </div>

                <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                  {playlistTracks.map((tr, idx) => {
                    const isCurrent = idx === safeTrackIndex;
                    const trType =
                      tr.type ||
                      (tr.url ? detectPlatformFromMediaUrl(tr.url) : 'youtube');
                    const trColor =
                      trType === 'youtube'
                        ? '#EF4444'
                        : trType === 'spotify'
                        ? '#10B981'
                        : trType === 'soundcloud'
                        ? '#F97316'
                        : theme.accentColor;

                    return (
                      <div
                        key={tr.id || `track-row-${idx}`}
                        onClick={() => handleSelectTrack(idx)}
                        className={`w-full p-2.5 rounded-2xl flex items-center justify-between gap-3 transition-all cursor-pointer select-none ${
                          isCurrent
                            ? 'bg-white/15 border border-white/25 shadow-lg'
                            : 'bg-white/[0.03] hover:bg-white/[0.08] border border-white/5'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 text-xs font-mono font-black shadow-sm ${
                              isCurrent
                                ? 'text-black'
                                : 'text-zinc-400 bg-white/5 border border-white/10'
                            }`}
                            style={isCurrent ? { backgroundColor: trColor } : {}}
                          >
                            {isCurrent && mediaPlaying ? (
                              <div className="flex items-end gap-0.5 h-3">
                                <div className="w-0.5 h-full bg-black rounded-full eq-1" />
                                <div className="w-0.5 h-full bg-black rounded-full eq-2" />
                                <div className="w-0.5 h-full bg-black rounded-full eq-3" />
                              </div>
                            ) : (
                              `#${idx + 1}`
                            )}
                          </div>

                          <div className="min-w-0 text-start">
                            <div
                              className={`text-xs font-bold truncate ${
                                isCurrent
                                  ? 'text-white font-black'
                                  : 'text-zinc-300'
                              }`}
                            >
                              {tr.title}
                            </div>
                            <div className="text-[10px] text-zinc-500 truncate">
                              {tr.artist ||
                                (isRtl ? 'فنان رسمي' : 'Official Artist')}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span
                            className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full border shadow-sm"
                            style={{
                              color: trColor,
                              borderColor: `${trColor}40`,
                              backgroundColor: `${trColor}15`,
                            }}
                          >
                            {trType}
                          </span>
                          {isCurrent && (
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    );
  };

  const renderLinksSection = () => {
    const isBento = theme.profileLayout === 'bento';
    return (
      <div key="section-links" className="space-y-6">
        {Object.entries(groupedLinks).map(([groupName, groupItems]) => (
          <div key={groupName} className="space-y-3.5">
            {groupName !== '__default__' && (
              <div className="flex items-center gap-2.5 px-1">
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: theme.accentColor }}
                />
                <h3
                  className="text-xs font-extrabold uppercase tracking-widest opacity-85 text-start"
                  style={{ color: theme.secondaryTextColor }}
                >
                  {groupName}
                </h3>
                <div className="h-px flex-1 bg-white/10" />
              </div>
            )}
            <div
              className={
                isBento && !compactPhone
                  ? 'grid grid-cols-1 sm:grid-cols-2 gap-3.5'
                  : 'space-y-3.5'
              }
            >
              {groupItems.map((link, idx) =>
                renderSingleLinkCard(link, idx, isBento && !compactPhone)
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const sectionRenderers: Record<string, () => React.ReactNode> = {
    header: renderHeaderSection,
    social: renderSocialSection,
    featured: renderFeaturedSection,
    media: renderMediaSection,
    links: renderLinksSection,
  };

  const isSplitLayout = theme.profileLayout === 'split' && !compactPhone;

  return (
    <div
      ref={containerRef}
      onMouseMove={handleContainerMouseMove}
      dir={isRtl ? 'rtl' : 'ltr'}
      style={{
        backgroundColor: theme.bgColor,
        color: theme.textColor,
        fontFamily: `"${theme.fontFamilyEn || 'Sora'}", "${theme.fontFamilyAr || 'Alexandria'}", sans-serif`,
      }}
      className={`relative w-full overflow-hidden select-none transition-colors duration-500 ${
        compactPhone ? 'min-h-full pt-10 pb-6 px-3.5' : 'min-h-screen py-10 px-4 sm:px-6'
      }`}
    >
      {/* ====================================================================
          MULTI-LAYER ANIMATED BACKGROUND SHADERS & PARTICLES
      ==================================================================== */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden z-0">
        {(effects.meshGradient || effects.auroraBorealis) && (
          <div
            className={`absolute -inset-[25%] opacity-75 ${
              !reduceMotion ? 'animate-aurora-flow' : ''
            }`}
            style={{
              background: `radial-gradient(circle at 20% 20%, ${theme.gradientColors[1]}99 0%, transparent 45%),
                           radial-gradient(circle at 80% 30%, ${theme.gradientColors[2]}99 0%, transparent 50%),
                           radial-gradient(circle at 50% 80%, ${theme.glowColor}66 0%, transparent 55%)`,
              filter: 'blur(60px)',
              animationDuration: `${Math.max(4, 22 - theme.gradientSpeed)}s`,
            }}
          />
        )}

        {theme.bgImage && (
          <div
            className="absolute inset-0 bg-cover bg-center opacity-35"
            style={{ backgroundImage: `url(${theme.bgImage})` }}
          />
        )}

        {(theme.animatedBgType === 'grid' || theme.animatedBgType === 'cyber') && (
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `linear-gradient(to right, ${theme.accentColor}33 1px, transparent 1px),
                                linear-gradient(to bottom, ${theme.accentColor}33 1px, transparent 1px)`,
              backgroundSize: '40px 40px',
            }}
          />
        )}

        {effects.cursorGlow && !reduceMotion && (
          <div
            className="absolute inset-0 transition-opacity duration-300"
            style={{
              background: `radial-gradient(500px circle at ${cursorPos.x}% ${cursorPos.y}%, ${theme.glowColor}30, transparent 70%)`,
            }}
          />
        )}

        {particles.map((p) => (
          <span
            key={p.id}
            className="absolute rounded-full animate-float-slow"
            style={{
              left: p.left,
              top: p.top,
              width: `${p.size}px`,
              height: `${p.size}px`,
              backgroundColor: theme.glowColor,
              boxShadow: `0 0 12px ${theme.glowColor}`,
              opacity: 0.5,
              animationDuration: `${p.duration}s`,
              animationDelay: `${p.delay}s`,
            }}
          />
        ))}
      </div>

      {/* ====================================================================
          TOP SPATIAL FLOATING GLASS COMMAND BAR (VIP PASS + SHARE)
      ==================================================================== */}
      <div className="relative z-20 max-w-4xl mx-auto flex items-center justify-between mb-6">
        <button
          type="button"
          onClick={() => setQrModalOpen(true)}
          className="flex items-center gap-2 px-3.5 py-2 rounded-full border text-xs font-extrabold transition-all hover:scale-105 shadow-lg"
          style={{
            backgroundColor: theme.cardBg,
            borderColor: theme.cardBorder,
            color: theme.textColor,
            backdropFilter: `blur(${theme.glassBlur}px)`,
          }}
          title="VIP Digital Pass & QR"
        >
          <QrCode className="w-3.5 h-3.5" style={{ color: theme.accentColor }} />
          <span>{isRtl ? 'بطاقة الهوية QR' : 'VIP Pass'}</span>
        </button>

        <button
          type="button"
          onClick={handleNativeShare}
          className="flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-extrabold transition-all hover:scale-105 shadow-lg"
          style={{
            backgroundColor: theme.cardBg,
            borderColor: theme.cardBorder,
            color: theme.textColor,
            backdropFilter: `blur(${theme.glassBlur}px)`,
          }}
        >
          <Share2 className="w-3.5 h-3.5" style={{ color: theme.accentColor }} />
          <span>{isRtl ? 'مشاركة' : 'Share'}</span>
        </button>
      </div>

      {/* ====================================================================
          MAIN PROFILE CONTENT CONTAINER (SUPPORTS ALL 7 LAYOUTS)
      ==================================================================== */}
      <motion.div
        initial={!reduceMotion ? { opacity: 0, scale: 0.98, y: 12 } : false}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={`relative z-10 mx-auto ${
          isSplitLayout
            ? 'max-w-5xl grid grid-cols-1 md:grid-cols-12 gap-8 items-start'
            : 'max-w-2xl'
        }`}
      >
        {isSplitLayout ? (
          <>
            <div
              className="md:col-span-5 md:sticky md:top-8 p-6 rounded-3xl border shadow-2xl"
              style={{
                backgroundColor: theme.cardBg,
                borderColor: theme.cardBorder,
                backdropFilter: `blur(${theme.glassBlur}px)`,
              }}
            >
              {renderHeaderSection()}
              {renderSocialSection()}
            </div>
            <div className="md:col-span-7 space-y-6">
              {renderFeaturedSection()}
              {renderMediaSection()}
              {renderLinksSection()}
            </div>
          </>
        ) : (
          <div>
            {sectionsOrder.map((secKey) =>
              sectionRenderers[secKey] ? sectionRenderers[secKey]() : null
            )}
          </div>
        )}

        {/* VoltiX Luxury Brand Badge & Report Trigger */}
        <div className="mt-14 pt-6 flex flex-col items-center justify-center gap-2.5 text-center col-span-full">
          <a
            href="/"
            className="group inline-flex items-center gap-2.5 px-5 py-2 rounded-full text-xs font-extrabold border transition-all hover:scale-105 shadow-xl"
            style={{
              backgroundColor: theme.cardBg,
              borderColor: theme.cardBorder,
              color: theme.textColor,
              backdropFilter: `blur(${theme.glassBlur}px)`,
            }}
          >
            <img
              src="/voltix-logo.png"
              alt="VoltiX"
              className="w-6 h-6 object-contain drop-shadow-[0_0_6px_rgba(212,175,55,0.65)]"
            />
            <span dir="ltr" className="tracking-wider">
              Powered by VoltiX
            </span>
          </a>

          {!isPreview && (
            <button
              type="button"
              onClick={() => setReportModalOpen(true)}
              className="text-[11px] flex items-center gap-1 opacity-55 hover:opacity-100 transition-opacity mt-1"
              style={{ color: theme.secondaryTextColor }}
            >
              <Flag className="w-3 h-3" />
              <span>{isRtl ? 'الإبلاغ عن محتوى مخالف' : 'Report Profile'}</span>
            </button>
          )}
        </div>
      </motion.div>

      {/* ====================================================================
          SMART SHARE MODAL WITH OFFICIAL SOCIAL SHARE BADGES
      ==================================================================== */}
      <AnimatePresence>
        {shareModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xl p-4"
            onClick={() => setShareModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.92, y: 16 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.92, y: 16 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-3xl vip-black-card p-6 sm:p-7 text-white shadow-2xl"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-black flex items-center gap-2">
                  <Share2 className="w-5 h-5 text-amber-400" />
                  <span>{isRtl ? 'مشاركة الهوية الرقمية' : 'Share Digital Identity'}</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setShareModalOpen(false)}
                  className="p-1.5 rounded-full bg-white/10 hover:bg-white/20"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-3.5 rounded-2xl bg-black/50 border border-white/15 flex items-center justify-between gap-2 mb-5">
                <span className="text-xs text-zinc-200 font-mono truncate" dir="ltr">
                  {profileShareUrl}
                </span>
                <button
                  type="button"
                  onClick={handleCopyUrl}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 text-black font-extrabold text-xs shrink-0 hover:bg-amber-400 transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? (isRtl ? 'تم النسخ' : 'Copied') : isRtl ? 'نسخ' : 'Copy'}</span>
                </button>
              </div>

              <div className="grid grid-cols-4 gap-3 mb-5">
                {[
                  {
                    id: 'whatsapp',
                    label: 'WhatsApp',
                    href: `https://wa.me/?text=${encodeURIComponent(profileShareUrl)}`,
                  },
                  {
                    id: 'x',
                    label: 'X',
                    href: `https://x.com/intent/tweet?url=${encodeURIComponent(profileShareUrl)}`,
                  },
                  {
                    id: 'telegram',
                    label: 'Telegram',
                    href: `https://t.me/share/url?url=${encodeURIComponent(profileShareUrl)}`,
                  },
                  {
                    id: 'linkedin',
                    label: 'LinkedIn',
                    href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(profileShareUrl)}`,
                  },
                ].map((item) => (
                  <a
                    key={item.id}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 flex flex-col items-center gap-2 transition-transform hover:-translate-y-1"
                  >
                    <OfficialSocialBadge platformId={item.id} size="sm" variant="gradient" />
                    <span className="text-[11px] font-bold text-zinc-200">{item.label}</span>
                  </a>
                ))}
              </div>

              <button
                type="button"
                onClick={() => {
                  setShareModalOpen(false);
                  setQrModalOpen(true);
                }}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-300 via-amber-500 to-amber-600 text-black text-xs font-extrabold flex items-center justify-center gap-2 shadow-lg"
              >
                <QrCode className="w-4 h-4" />
                <span>{isRtl ? 'فتح بطاقة الهوية الملكية (VIP QR Card)' : 'Open VIP QR Identity Card'}</span>
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ====================================================================
          VOLTIX VIP BLACK CARD & QR PASS MODAL (OUT-OF-THE-BOX INNOVATION)
      ==================================================================== */}
      <AnimatePresence>
        {qrModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xl p-4"
            onClick={() => setQrModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, rotateX: 12, y: 20 }}
              animate={{ scale: 1, rotateX: 0, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm rounded-[32px] vip-black-card p-6 sm:p-7 text-white relative overflow-hidden"
            >
              {/* Card Header: VoltiX Emblem + Metallic Chip */}
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-black/70 border border-amber-400/40 p-1 flex items-center justify-center overflow-hidden">
                    <img
                      src="/voltix-logo.png"
                      alt="VoltiX Logo"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="text-start">
                    <span className="text-sm font-black gold-gradient-text block leading-none">
                      VoltiX BLACK PASS
                    </span>
                    <span className="text-[9px] text-zinc-400 tracking-widest uppercase">
                      VERIFIED DIGITAL IDENTITY
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setQrModalOpen(false)}
                  className="p-1.5 rounded-full bg-white/10 hover:bg-white/20"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* QR Studio View */}
              <QrCodeView
                url={profileShareUrl}
                fgColor={profile.qrConfig?.fgColor || theme.accentColor}
                bgColor={profile.qrConfig?.bgColor || theme.bgColor}
                includeLogo={profile.qrConfig?.includeLogo ?? true}
                username={profile.username}
                size={210}
              />

              {/* VIP Cardholder Footer */}
              <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between text-start">
                <div>
                  <div className="text-[9px] uppercase tracking-widest text-zinc-500">
                    IDENTITY HOLDER
                  </div>
                  <div className="text-xs font-extrabold text-amber-200 truncate">
                    {profile.displayName}
                  </div>
                </div>
                <div className="text-end" dir="ltr">
                  <div className="text-[9px] uppercase tracking-widest text-zinc-500">HANDLE</div>
                  <div className="text-xs font-mono font-bold text-white">
                    @{profile.username}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ====================================================================
          REPORT CONTENT MODAL
      ==================================================================== */}
      <AnimatePresence>
        {reportModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4"
            onClick={() => setReportModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.92, y: 16 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.92, y: 16 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-3xl bg-[#0D0D14] border border-white/15 p-6 text-white shadow-2xl"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold flex items-center gap-2">
                  <Flag className="w-4 h-4 text-rose-400" />
                  <span>{isRtl ? 'الإبلاغ عن محتوى مخالف' : 'Report Profile Violation'}</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setReportModalOpen(false)}
                  className="p-1.5 rounded-full bg-white/10 hover:bg-white/20"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {reportSent ? (
                <div className="py-8 text-center text-emerald-400 font-semibold">
                  {isRtl
                    ? 'تم إرسال البلاغ إلى إدارة المنصة للمراجعة. شكرًا لك.'
                    : 'Report submitted to platform moderators. Thank you.'}
                </div>
              ) : (
                <form onSubmit={handleSubmitReport} className="space-y-4">
                  <div>
                    <label className="block text-xs text-zinc-400 mb-1.5">
                      {isRtl ? 'سبب البلاغ' : 'Reason'}
                    </label>
                    <select
                      required
                      value={reportReason}
                      onChange={(e) => setReportReason(e.target.value)}
                      className="w-full rounded-xl bg-white/5 border border-white/15 px-3 py-2.5 text-sm text-white"
                    >
                      <option value="" className="bg-zinc-900">
                        {isRtl ? 'اختر السبب...' : 'Select reason...'}
                      </option>
                      <option value="SPAM_OR_SCAM" className="bg-zinc-900">
                        {isRtl ? 'احتيال أو روابط مضللة' : 'Spam, Phishing or Scam'}
                      </option>
                      <option value="IMPERSONATION" className="bg-zinc-900">
                        {isRtl ? 'انتحال شخصية' : 'Impersonation'}
                      </option>
                      <option value="INAPPROPRIATE" className="bg-zinc-900">
                        {isRtl ? 'محتوى غير لائق' : 'Inappropriate Content'}
                      </option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-400 mb-1.5">
                      {isRtl ? 'تفاصيل إضافية (اختياري)' : 'Additional notes (optional)'}
                    </label>
                    <textarea
                      rows={3}
                      value={reportNote}
                      onChange={(e) => setReportNote(e.target.value)}
                      className="w-full rounded-xl bg-white/5 border border-white/15 px-3 py-2 text-sm text-white"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-colors"
                  >
                    {isRtl ? 'إرسال البلاغ' : 'Submit Report'}
                  </button>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}

        {/* Fullscreen Cinema-Grade Video Clip Theatre Modal */}
        {showVideoModal && rootYtVideoId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-6 md:p-10 bg-black/92 backdrop-blur-2xl"
            onClick={() => setShowVideoModal(false)}
          >
            <motion.div
              initial={{ scale: 0.94, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.94, opacity: 0, y: 15 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-full max-w-4xl aspect-video rounded-3xl sm:rounded-[32px] overflow-hidden border-2 border-white/20 shadow-[0_25px_100px_rgba(0,0,0,0.98),0_0_50px_rgba(239,68,68,0.35)] bg-black flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Top Bar with Title, Playlist Navigation, and Close Button */}
              <div className="absolute top-0 inset-x-0 z-20 px-4 sm:px-6 py-3.5 bg-gradient-to-b from-black/95 via-black/75 to-transparent flex items-center justify-between pointer-events-auto">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping shrink-0" />
                  <span className="text-xs sm:text-sm font-black text-white truncate max-w-[200px] sm:max-w-md">
                    {activeTrack?.title || 'YouTube HD Video'} {activeTrack?.artist ? `— ${activeTrack.artist}` : ''}
                  </span>
                  {playlistTracks.length > 1 && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-zinc-300 shrink-0">
                      {safeTrackIndex + 1}/{playlistTracks.length}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {playlistTracks.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={handlePrevTrack}
                        className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center border border-white/20 transition-all active:scale-90"
                        title={isRtl ? 'الفيديو السابق' : 'Previous Video'}
                      >
                        <SkipBack className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={handleNextTrack}
                        className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center border border-white/20 transition-all active:scale-90"
                        title={isRtl ? 'الفيديو التالي' : 'Next Video'}
                      >
                        <SkipForward className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowVideoModal(false)}
                    className="w-9 h-9 rounded-full bg-white/10 hover:bg-rose-600 text-white flex items-center justify-center border border-white/20 hover:border-rose-500 transition-all shadow-xl active:scale-90 shrink-0"
                    title={isRtl ? 'إغلاق الفيديو' : 'Close Video'}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${rootYtVideoId}?autoplay=1&playsinline=1&rel=0`}
                title={activeTrack?.title || 'Video Clip'}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full pt-10 sm:pt-12"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

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

export interface MediaEmbedConfig {
  enabled: boolean;
  type: 'spotify' | 'youtube' | 'soundcloud' | 'custom';
  title: string;
  artist?: string;
  url?: string;
  embedUrl?: string;
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
  const [mediaProgress, setMediaProgress] = useState(0);
  const [mediaCurrentTime, setMediaCurrentTime] = useState(0);
  const [mediaDuration, setMediaDuration] = useState(225); // 3:45 default
  const [showVideoModal, setShowVideoModal] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

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
      : `https://voltix.io/@${profile.username}`;

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
      (link.cardType as LinkCardType) || theme.defaultCardType || 'glass';
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
        className="relative mb-6 rounded-[30px] overflow-hidden border shadow-2xl transition-all"
        style={{
          backgroundColor: theme.cardBg,
          borderColor: `${theme.accentColor}40`,
          backdropFilter: `blur(${theme.glassBlur}px) saturate(180%)`,
          WebkitBackdropFilter: `blur(${theme.glassBlur}px) saturate(180%)`,
          boxShadow: `0 24px 60px -15px rgba(0,0,0,0.85), 0 0 35px ${theme.glowColor}22, inset 0 1px 1.5px rgba(255,255,255,0.28)`,
        }}
      >
        {/* Top Panoramic Royal Crown Banner (Always rendered for maximum luxury!) */}
        <div
          className={`relative w-full overflow-hidden border-b border-white/10 ${
            compactPhone ? 'h-24' : 'h-32 sm:h-40'
          }`}
          style={{
            background: profile.coverUrl
              ? `url(${profile.coverUrl}) center/cover no-repeat`
              : `radial-gradient(circle at 80% 20%, ${theme.accentColor}55 0%, transparent 55%),
                 radial-gradient(circle at 20% 80%, ${theme.glowColor}45 0%, transparent 60%),
                 linear-gradient(135deg, ${theme.gradientColors[0]} 0%, ${theme.gradientColors[1]} 50%, ${theme.gradientColors[2]} 100%)`,
          }}
        >
          <div className="absolute inset-0 cyber-grid-floor opacity-40" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          {/* Top Corner Royal Edition Badge */}
          <div
            dir="ltr"
            className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-black/55 backdrop-blur-md border border-amber-400/35 text-[9px] font-black tracking-[0.18em] uppercase text-amber-200 flex items-center gap-1.5 shadow-lg"
          >
            <Crown className="w-3 h-3 text-amber-400" />
            <span>VOLTIX VIP</span>
          </div>
        </div>

        {/* Profile Identity Content */}
        <div
          className={`relative z-10 px-4 pb-5 ${
            compactPhone ? '-mt-11' : '-mt-14 sm:-mt-16'
          } flex flex-col ${
            isMinimal || isBusiness ? 'items-start text-start' : 'items-center text-center'
          }`}
        >
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

            {/* Verified Royal Crown / Status Emblem */}
            {profile.isVerified && (
              <div
                title={isRtl ? 'هوية موثقة رسميًا' : 'Verified Official Identity'}
                className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center border-2 border-black shadow-lg"
                style={{
                  background: `linear-gradient(135deg, ${theme.accentColor}, ${theme.glowColor})`,
                  color: theme.isLight ? '#FFFFFF' : '#050508',
                }}
              >
                <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
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
              <span className="font-mono">@{profile.username}</span>
              {copiedHandle ? (
                <Check className="w-3 h-3 text-emerald-400" />
              ) : (
                <Copy className="w-3 h-3 opacity-65" />
              )}
            </button>

            {profile.isVerified && (
              <span
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider leading-none border"
                style={{
                  background: `linear-gradient(135deg, ${theme.accentColor}25, ${theme.glowColor}15)`,
                  borderColor: `${theme.accentColor}55`,
                  color: theme.accentColor,
                }}
              >
                <Crown className="w-3 h-3" />
                <span>{isRtl ? 'عضوية ملكية موثقة' : 'ROYAL VERIFIED'}</span>
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

  const renderMediaSection = () => {
    const media = profile.mediaEmbed;
    if (!media || !media.enabled || !media.title) return null;

    const isYouTube = media.type === 'youtube' || /youtube\.com|youtu\.be/i.test(media.url || '');
    const isSpotify = media.type === 'spotify' || /spotify\.com/i.test(media.url || '');
    const isSoundcloud = media.type === 'soundcloud' || /soundcloud\.com/i.test(media.url || '');
    const isDirectAudio = isDirectAudioFile(media.url);

    const ytVideoId = isYouTube ? extractYouTubeId(media.url) : null;
    const spotifyTrackId = isSpotify ? extractSpotifyTrackId(media.url) : null;

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

    const platformBadgeId: SocialPlatformId = isYouTube ? 'youtube' : isSpotify ? 'spotify' : 'youtube';

    return (
      <div
        key="section-media"
        onMouseEnter={() => setMediaFlipped(true)}
        onMouseLeave={() => setMediaFlipped(false)}
        onClick={() => setMediaFlipped((f) => !f)}
        className="mb-6 perspective-1200 cursor-pointer select-none group/media-flip relative w-full h-[96px] sm:h-[102px]"
      >
        {/* Real Audio Engine */}
        {isDirectAudio && (
          <audio
            ref={audioRef}
            src={media.url}
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
              setMediaPlaying(false);
              setMediaCurrentTime(0);
              setMediaProgress(0);
            }}
          />
        )}

        {/* Real YouTube Audio Engine */}
        {isYouTube && ytVideoId && mediaPlaying && (
          <iframe
            key={`yt-audio-${ytVideoId}`}
            src={`https://www.youtube-nocookie.com/embed/${ytVideoId}?autoplay=1&playsinline=1&controls=0&modestbranding=1&rel=0`}
            title={media.title}
            allow="autoplay; encrypted-media"
            className="w-1 h-1 opacity-0 fixed -bottom-10 -left-10 pointer-events-none"
            tabIndex={-1}
          />
        )}

        {/* YouTube HD Video Clip Pop-up Modal */}
        {showVideoModal && ytVideoId && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-fade-in"
            onClick={(e) => {
              e.stopPropagation();
              setShowVideoModal(false);
            }}
          >
            <div
              className="relative w-full max-w-2xl aspect-video rounded-3xl overflow-hidden border border-white/20 shadow-2xl bg-black"
              onClick={(e) => e.stopPropagation()}
            >
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${ytVideoId}?autoplay=1&playsinline=1`}
                title={media.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
              <button
                type="button"
                onClick={() => setShowVideoModal(false)}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/80 text-white flex items-center justify-center border border-white/20 hover:scale-110 transition-transform"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        <div
          className={`relative w-full h-full preserve-3d transition-transform duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
            mediaFlipped ? '[transform:rotateY(180deg)]' : '[transform:rotateY(0deg)]'
          }`}
        >
          {/* ==========================================================
              FRONT FACE: ORIGINAL SLEEK COMPACT MUSIC CARD (STATIONARY)
          ========================================================== */}
          <div
            className="absolute inset-0 w-full h-full p-3.5 sm:p-4 rounded-3xl border overflow-hidden backface-hidden shadow-2xl flex items-center justify-between gap-3.5"
            style={{
              background: theme.cardBg,
              borderColor: theme.cardBorder,
              backdropFilter: `blur(${theme.glassBlur}px)`,
              boxShadow: `0 16px 40px -12px rgba(0,0,0,0.6), inset 0 1px 1px rgba(255,255,255,0.2)`,
            }}
          >
            {/* Moving Light Beam around Front Media Card */}
            {!reduceMotion && (
              <>
                <span
                  className="voltix-card-beam"
                  style={{
                    '--beam-c1': platformColor,
                    '--beam-c2': theme.glowColor,
                    '--beam-speed': '4.2s',
                  } as React.CSSProperties}
                />
                <span
                  className="voltix-card-beam-glow"
                  style={{
                    '--beam-c1': platformColor,
                    '--beam-c2': theme.glowColor,
                    '--beam-speed': '4.2s',
                  } as React.CSSProperties}
                />
              </>
            )}

            <div className="flex items-center gap-3.5 min-w-0 flex-1">
              <OfficialSocialBadge
                platformId={platformBadgeId}
                size="md"
                variant="gradient"
              />
              <div className="min-w-0 text-start">
                <div className="flex items-center gap-2">
                  <span
                    className="text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full"
                    style={{
                      backgroundColor: `${platformColor}22`,
                      color: platformColor,
                    }}
                  >
                    {platformLabel}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] text-zinc-400 font-bold opacity-75 group-hover/media-flip:opacity-100 transition-opacity">
                    <RotateCw className="w-2.5 h-2.5" />
                    <span>{isRtl ? 'المس للقلب' : 'Hover to Flip'}</span>
                  </span>
                </div>
                <h4 className="font-bold text-sm truncate mt-1" style={{ color: theme.textColor }}>
                  {media.title}
                </h4>
                <p className="text-xs truncate" style={{ color: theme.secondaryTextColor }}>
                  {media.artist || (isRtl ? 'فنان رسمي' : 'Official Artist')}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setMediaPlaying((p) => !p);
              }}
              className="w-11 h-11 rounded-full flex items-center justify-center transition-transform hover:scale-110 shrink-0 shadow-lg text-white"
              style={{
                backgroundColor: platformColor,
              }}
              aria-label={mediaPlaying ? 'Pause media preview' : 'Play media preview'}
            >
              {mediaPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
            </button>
          </div>

          {/* ==========================================================
              BACK FACE: CLEAN LUXURY STUDIO PLAYER (PRO AUDIOPHILE)
          ========================================================== */}
          <div
            className="absolute inset-0 w-full h-full p-3 sm:p-3.5 rounded-3xl border overflow-hidden backface-hidden [transform:rotateY(180deg)] shadow-2xl flex flex-col justify-between"
            style={{
              background: `radial-gradient(ellipse at 80% 20%, ${platformColor}26 0%, transparent 60%),
                           linear-gradient(135deg, #090A10 0%, #06070B 60%, #0F121C 100%)`,
              borderColor: `${platformColor}55`,
              backdropFilter: `blur(${theme.glassBlur + 8}px)`,
              boxShadow: `0 20px 50px -10px rgba(0,0,0,0.85), inset 0 1px 1.5px rgba(255,255,255,0.22)`,
            }}
          >
            {/* Moving Light Beam around Pro Studio Card */}
            {!reduceMotion && (
              <>
                <span
                  className="voltix-card-beam"
                  style={{
                    '--beam-c1': platformColor,
                    '--beam-c2': '#FFFFFF',
                    '--beam-speed': '3.5s',
                  } as React.CSSProperties}
                />
                <span
                  className="voltix-card-beam-glow"
                  style={{
                    '--beam-c1': platformColor,
                    '--beam-c2': '#FFFFFF',
                    '--beam-speed': '3.5s',
                  } as React.CSSProperties}
                />
              </>
            )}

            {/* TOP ROW: Album Cover + Title + Transport Controls */}
            <div className="flex items-center justify-between gap-3">
              {/* Left: Platform Emblem & Track Title */}
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <div
                  className="relative w-10 h-10 rounded-2xl bg-gradient-to-tr from-black via-zinc-900 to-black border flex items-center justify-center shrink-0 shadow-lg"
                  style={{ borderColor: `${platformColor}40` }}
                >
                  <OfficialSocialBadge platformId={platformBadgeId} size="sm" variant="gradient" interactive={false} />
                  {mediaPlaying && (
                    <span
                      className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full animate-ping"
                      style={{ backgroundColor: platformColor }}
                    />
                  )}
                </div>

                <div className="min-w-0 text-start">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="w-1.5 h-1.5 rounded-full animate-pulse"
                      style={{ backgroundColor: platformColor }}
                    />
                    <span
                      className="text-[9.5px] font-black uppercase tracking-wider"
                      style={{ color: platformColor }}
                    >
                      {platformLabel}
                    </span>
                  </div>
                  <h4 className="font-extrabold text-xs sm:text-sm truncate text-white leading-snug mt-0.5">
                    {media.title}
                  </h4>
                  <p className="text-[11px] text-zinc-400 truncate">
                    {media.artist || (isRtl ? 'فنان رسمي' : 'Official Artist')}
                  </p>
                </div>
              </div>

              {/* Right: Master Playback Transport Deck */}
              <div dir="ltr" className="flex items-center gap-1.5 shrink-0">
                {isYouTube && ytVideoId && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowVideoModal(true);
                    }}
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/5 hover:bg-red-500/20 text-zinc-300 hover:text-red-400 border border-white/10 flex items-center justify-center transition-all active:scale-90"
                    title={isRtl ? 'مشاهدة فيديو كليب' : 'Watch Video Clip'}
                  >
                    <Tv className="w-3.5 h-3.5" />
                  </button>
                )}

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setMediaCurrentTime((p) => Math.max(0, p - 10));
                  }}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/5 hover:bg-white/15 text-zinc-300 hover:text-white flex items-center justify-center transition-all active:scale-90"
                  title="Skip -10s"
                >
                  <SkipBack className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setMediaPlaying((p) => !p);
                  }}
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-full text-white flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all"
                  style={{
                    backgroundColor: platformColor,
                    boxShadow: `0 8px 24px -4px ${platformColor}66`,
                  }}
                  aria-label={mediaPlaying ? 'Pause' : 'Play'}
                >
                  {mediaPlaying ? (
                    <Pause className="w-4 h-4 fill-current" />
                  ) : (
                    <Play className="w-4 h-4 fill-current translate-x-0.5" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setMediaCurrentTime((p) => Math.min(mediaDuration, p + 10));
                  }}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/5 hover:bg-white/15 text-zinc-300 hover:text-white flex items-center justify-center transition-all active:scale-90"
                  title="Skip +10s"
                >
                  <SkipForward className="w-3.5 h-3.5" />
                </button>

                {media.url && (
                  <a
                    href={media.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/5 hover:bg-white/20 text-white border border-white/15 flex items-center justify-center transition-all active:scale-90 ml-0.5"
                    title={`Open on ${platformLabel}`}
                  >
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>

            {/* BOTTOM ROW: Interactive Timeline Scrubber & Live Equalizer */}
            <div dir="ltr" className="flex items-center gap-2 pt-1 border-t border-white/5">
              <span className="shrink-0 text-[10px] font-mono font-bold" style={{ color: platformColor }}>
                {formatAudioTime(mediaCurrentTime)}
              </span>

              <div
                className="relative flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden cursor-pointer group/scrub"
                onClick={(e) => {
                  e.stopPropagation();
                  const rect = e.currentTarget.getBoundingClientRect();
                  const pct = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
                  setMediaProgress(Math.round(pct));
                  setMediaCurrentTime(Math.round((pct / 100) * mediaDuration));
                  if (audioRef.current) {
                    audioRef.current.currentTime = (pct / 100) * mediaDuration;
                  }
                }}
              >
                <div
                  className="h-full rounded-full transition-all duration-150 relative"
                  style={{
                    width: `${mediaProgress}%`,
                    background: `linear-gradient(90deg, ${platformColor} 0%, #FFFFFF 100%)`,
                    boxShadow: `0 0 10px ${platformColor}cc`,
                  }}
                />
              </div>

              <span className="shrink-0 text-[10px] font-mono text-zinc-400">
                {formatAudioTime(mediaDuration)}
              </span>

              {/* Dynamic 5-Bar Audio Equalizer */}
              <div className="flex items-end gap-0.5 h-3.5 shrink-0 ml-1">
                {[40, 85, 55, 100, 65].map((h, i) => (
                  <span
                    key={i}
                    className="w-0.5 rounded-full"
                    style={{
                      backgroundColor: platformColor,
                      height: mediaPlaying ? `${h}%` : '25%',
                      animation: mediaPlaying ? `eqBarWave 0.6s ease-in-out infinite alternate ${i * 0.12}s` : 'none',
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
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
        fontFamily: `"${activeFont}", sans-serif`,
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
      </AnimatePresence>
    </div>
  );
}

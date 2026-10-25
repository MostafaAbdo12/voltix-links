import React from 'react';

export type SocialPlatformId =
  | 'tiktok'
  | 'instagram'
  | 'youtube'
  | 'snapchat'
  | 'facebook'
  | 'x'
  | 'discord'
  | 'twitch'
  | 'kick'
  | 'telegram'
  | 'whatsapp'
  | 'spotify'
  | 'github'
  | 'linkedin';

export interface SocialPlatformMeta {
  id: SocialPlatformId;
  name: string;
  nameAr: string;
  handlePrefix: string;
  color: string;
  gradient: string;
  glowColor: string;
  textColor?: string;
  placeholder: string;
  domains: string[];
  renderIcon: (className?: string) => React.ReactNode;
}

export interface ChannelQuickPreset {
  id: string;
  platformId: SocialPlatformId;
  labelAr: string;
  labelEn: string;
  defaultTitleAr: string;
  defaultTitleEn: string;
  defaultDescAr: string;
  defaultDescEn: string;
  badgeAr: string;
  badgeEn: string;
  urlPrefix: string;
  placeholder: string;
}

export const OFFICIAL_CHANNEL_PRESETS: ChannelQuickPreset[] = [
  {
    id: 'whatsapp-channel',
    platformId: 'whatsapp',
    labelAr: 'قناة واتساب رسمية',
    labelEn: 'WhatsApp Channel',
    defaultTitleAr: 'انضم إلى قناتنا الرسمية على واتساب',
    defaultTitleEn: 'Join Our Official WhatsApp Channel',
    defaultDescAr: 'تابع أحدث الإعلانات والتحديثات الحصرية فور صدورها عبر واتساب',
    defaultDescEn: 'Get instant official updates & exclusive broadcasts on WhatsApp',
    badgeAr: 'قناة واتساب',
    badgeEn: 'WA CHANNEL',
    urlPrefix: 'https://whatsapp.com/channel/',
    placeholder: 'https://whatsapp.com/channel/0029Va...',
  },
  {
    id: 'whatsapp-group',
    platformId: 'whatsapp',
    labelAr: 'مجتمع / مجموعة واتساب',
    labelEn: 'WhatsApp Community',
    defaultTitleAr: 'مجتمع النخبة التفاعلي على واتساب',
    defaultTitleEn: 'Join Our WhatsApp Community Group',
    defaultDescAr: 'تواصل مباشرة مع الأعضاء وشارك في النقاشات اليومية',
    defaultDescEn: 'Connect directly with members in our official WhatsApp group',
    badgeAr: 'مجتمع واتساب',
    badgeEn: 'WA COMMUNITY',
    urlPrefix: 'https://chat.whatsapp.com/',
    placeholder: 'https://chat.whatsapp.com/InviteCode...',
  },
  {
    id: 'telegram-channel',
    platformId: 'telegram',
    labelAr: 'قناة / مجموعة تيليغرام',
    labelEn: 'Telegram Channel',
    defaultTitleAr: 'القناة الرسمية على تيليغرام (Telegram)',
    defaultTitleEn: 'Official Telegram Broadcast Channel',
    defaultDescAr: 'ملفات حصرية، تنبيهات فورية، ومحتوى يومي مخصص للمشتركين',
    defaultDescEn: 'Exclusive resources, instant alerts & daily community drops',
    badgeAr: 'قناة تيليغرام',
    badgeEn: 'TG CHANNEL',
    urlPrefix: 'https://t.me/',
    placeholder: 'https://t.me/channel_name',
  },
  {
    id: 'discord-server',
    platformId: 'discord',
    labelAr: 'سيرفر / قناة ديسكورد',
    labelEn: 'Discord Server',
    defaultTitleAr: 'انضم إلى سيرفر ومجتمع ديسكورد الرسمي',
    defaultTitleEn: 'Join Our Official Discord Server & Channels',
    defaultDescAr: 'غرف صوتية مباشرة، قنوات نقاش مخصصة، وفعاليات أسبوعية للأعضاء',
    defaultDescEn: 'Live voice lounges, dedicated channels & VIP community events',
    badgeAr: 'سيرفر ديسكورد',
    badgeEn: 'DISCORD SERVER',
    urlPrefix: 'https://discord.gg/',
    placeholder: 'https://discord.gg/invite_code',
  },
  {
    id: 'facebook-channel',
    platformId: 'facebook',
    labelAr: 'قناة / مجموعة فيسبوك',
    labelEn: 'Facebook Channel / Group',
    defaultTitleAr: 'مجتمع وقناة فيسبوك الرسمية (Facebook)',
    defaultTitleEn: 'Official Facebook Group & Broadcast Channel',
    defaultDescAr: 'انضم إلى مجتمعنا الرسمي على فيسبوك وتابع البث المباشر والمنشورات',
    defaultDescEn: 'Join our official Facebook community group & broadcast channel',
    badgeAr: 'مجتمع فيسبوك',
    badgeEn: 'FB COMMUNITY',
    urlPrefix: 'https://facebook.com/groups/',
    placeholder: 'https://facebook.com/groups/yourgroup',
  },
  {
    id: 'youtube-channel',
    platformId: 'youtube',
    labelAr: 'قناة يوتيوب رسمية',
    labelEn: 'YouTube Channel',
    defaultTitleAr: 'اشترك في القناة الرسمية على يوتيوب',
    defaultTitleEn: 'Subscribe to Our Official YouTube Channel',
    defaultDescAr: 'شاهد أحدث الفيديوهات والبثوث المباشرة بجودة 4K',
    defaultDescEn: 'Watch our latest 4K videos, premieres & live streams',
    badgeAr: 'قناة يوتيوب',
    badgeEn: 'YT CHANNEL',
    urlPrefix: 'https://youtube.com/@',
    placeholder: 'https://youtube.com/@channel',
  },
  {
    id: 'snapchat-official',
    platformId: 'snapchat',
    labelAr: 'حساب / منصة سناب شات',
    labelEn: 'Official Snapchat',
    defaultTitleAr: 'تابع يومياتنا وقصصنا الحصرية على سناب شات',
    defaultTitleEn: 'Follow Our Official Stories & Spotlight on Snapchat',
    defaultDescAr: 'كواليس يومية، عدسات حصرية، وتغطيات مباشرة عبر سناب شات الرسمي',
    defaultDescEn: 'Daily behind-the-scenes, exclusive stories & Spotlight drops on Snapchat',
    badgeAr: 'سناب شات رسمي',
    badgeEn: 'OFFICIAL SNAP',
    urlPrefix: 'https://www.snapchat.com/add/',
    placeholder: 'https://www.snapchat.com/add/username',
  },
];

export const SOCIAL_PLATFORMS: SocialPlatformMeta[] = [
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    nameAr: 'واتساب (حساب / قناة)',
    handlePrefix: '+',
    color: '#25D366',
    gradient: 'linear-gradient(135deg, #25D366 0%, #1EBE5D 48%, #128C7E 100%)',
    glowColor: '#25D366',
    placeholder: 'https://whatsapp.com/channel/... أو https://wa.me/...',
    domains: ['wa.me', 'whatsapp.com', 'chat.whatsapp.com', 'api.whatsapp.com'],
    renderIcon: (className = 'w-5 h-5') => (
      <svg
        className={className}
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-label="WhatsApp Official Icon"
      >
        {/* Official Authentic WhatsApp Brand Vector (Crisp Speech Bubble Ring + Inner Receiver) */}
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
      </svg>
    ),
  },
  {
    id: 'telegram',
    name: 'Telegram',
    nameAr: 'تيليغرام (قناة / حساب)',
    handlePrefix: 't.me/',
    color: '#2AABEE',
    gradient: 'linear-gradient(135deg, #37AEE2 0%, #1E96C8 100%)',
    glowColor: '#2AABEE',
    placeholder: 'https://t.me/channel_or_username',
    domains: ['t.me', 'telegram.me', 'telegram.org', 'telegram.dog'],
    renderIcon: (className = 'w-5 h-5') => (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
      </svg>
    ),
  },
  {
    id: 'discord',
    name: 'Discord',
    nameAr: 'ديسكورد (سيرفر / قناة)',
    handlePrefix: 'gg/',
    color: '#5865F2',
    gradient: 'linear-gradient(135deg, #5865F2 0%, #404EED 100%)',
    glowColor: '#5865F2',
    placeholder: 'https://discord.gg/invite',
    domains: ['discord.gg', 'discord.com', 'discordapp.com'],
    renderIcon: (className = 'w-5 h-5') => (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
      </svg>
    ),
  },
  {
    id: 'facebook',
    name: 'Facebook',
    nameAr: 'فيسبوك (صفحة / قناة / مجموعة)',
    handlePrefix: 'fb/',
    color: '#1877F2',
    gradient: 'linear-gradient(135deg, #1877F2 0%, #0C5DC7 100%)',
    glowColor: '#1877F2',
    placeholder: 'https://facebook.com/groups/... أو https://facebook.com/...',
    domains: ['facebook.com', 'fb.com', 'fb.watch', 'fb.me', 'm.me'],
    renderIcon: (className = 'w-5 h-5') => (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  },
  {
    id: 'instagram',
    name: 'Instagram',
    nameAr: 'إنستغرام',
    handlePrefix: '@',
    color: '#E1306C',
    gradient:
      'radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285AEB 90%)',
    glowColor: '#E1306C',
    placeholder: 'https://instagram.com/username',
    domains: ['instagram.com', 'instagr.am', 'ig.me'],
    renderIcon: (className = 'w-5 h-5') => (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
      </svg>
    ),
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    nameAr: 'تيك توك',
    handlePrefix: '@',
    color: '#00F2FE',
    gradient: 'linear-gradient(135deg, #00F2FE 0%, #050508 50%, #FE2C55 100%)',
    glowColor: '#FE2C55',
    placeholder: 'https://tiktok.com/@username',
    domains: ['tiktok.com', 'vm.tiktok.com'],
    renderIcon: (className = 'w-5 h-5') => (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
      </svg>
    ),
  },
  {
    id: 'x',
    name: 'X (Twitter)',
    nameAr: 'إكس (تويتر)',
    handlePrefix: '@',
    color: '#FFFFFF',
    gradient: 'linear-gradient(135deg, #27272A 0%, #09090B 100%)',
    glowColor: '#A1A1AA',
    placeholder: 'https://x.com/username',
    domains: ['x.com', 'twitter.com', 't.co'],
    renderIcon: (className = 'w-5 h-5') => (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    id: 'youtube',
    name: 'YouTube',
    nameAr: 'يوتيوب',
    handlePrefix: '@',
    color: '#FF0033',
    gradient: 'linear-gradient(135deg, #FF0033 0%, #B3001B 100%)',
    glowColor: '#FF0033',
    placeholder: 'https://youtube.com/@channel',
    domains: ['youtube.com', 'youtu.be'],
    renderIcon: (className = 'w-5 h-5') => (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
  },
  {
    id: 'snapchat',
    name: 'Snapchat',
    nameAr: 'سناب شات (حساب / منصة)',
    handlePrefix: '@',
    color: '#FFFC00',
    gradient: 'linear-gradient(145deg, #FFFC00 0%, #FFF200 100%)',
    glowColor: '#FFFC00',
    textColor: '#FFFFFF',
    placeholder: 'https://www.snapchat.com/add/username',
    domains: ['snapchat.com', 't.snapchat.com', 'story.snapchat.com'],
    renderIcon: (className = 'w-5 h-5') => (
      <svg
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        aria-label="Snapchat Official Logo"
      >
        {/* 100% Official Snap Inc. Ghost Emblem: Pure White Ghost (#FFFFFF) + Crisp Bold Black Outline (#000000) */}
        <path
          d="M12 2.25c2.92 0 5.14 1.88 5.46 4.94.09.84-.04 1.98-.14 2.75-.03.24.11.45.34.53.47.16 1.15.39 1.54.72.41.35.51.79.36 1.19-.14.38-.58.65-1.31.88-.47.15-.98.3-1.11.67-.13.38.08.82.31 1.21.91 1.54 2.22 2.61 3.86 3.17.32.11.49.41.41.73-.1.39-.67.74-1.69.93-.76.14-1.2.52-1.42.92-.22.41-.41.73-.97.73-.34 0-.72-.1-1.17-.21a5.4 5.4 0 0 0-1.42-.19c-.78 0-1.51.28-2.29.67-.79.39-1.61.8-2.76.8-1.15 0-1.97-.41-2.76-.8-.78-.39-1.51-.67-2.29-.67-.49 0-.96.08-1.42.19-.45.11-.83.21-1.17.21-.56 0-.75-.32-.97-.73-.22-.4-.66-.78-1.42-.92-1.02-.19-1.59-.54-1.69-.93-.08-.32.09-.62.41-.73 1.64-.56 2.95-1.63 3.86-3.17.23-.39.44-.83.31-1.21-.13-.37-.64-.52-1.11-.67-.73-.23-1.17-.5-1.31-.88-.15-.4-.05-.84.36-1.19.39-.33 1.07-.56 1.54-.72.23-.08.37-.29.34-.53-.1-.77-.23-1.91-.14-2.75C6.86 4.13 9.08 2.25 12 2.25Z"
          fill="#FFFFFF"
          stroke="#050508"
          strokeWidth="1.65"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    id: 'twitch',
    name: 'Twitch',
    nameAr: 'تويتش',
    handlePrefix: 'tv/',
    color: '#9146FF',
    gradient: 'linear-gradient(135deg, #9146FF 0%, #6441A5 100%)',
    glowColor: '#9146FF',
    placeholder: 'https://twitch.tv/username',
    domains: ['twitch.tv'],
    renderIcon: (className = 'w-5 h-5') => (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z" />
      </svg>
    ),
  },
  {
    id: 'kick',
    name: 'Kick',
    nameAr: 'كيك',
    handlePrefix: 'kick/',
    color: '#53FC18',
    gradient: 'linear-gradient(135deg, #53FC18 0%, #16A34A 100%)',
    glowColor: '#53FC18',
    textColor: '#050508',
    placeholder: 'https://kick.com/username',
    domains: ['kick.com'],
    renderIcon: (className = 'w-5 h-5') => (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M3 3h5.4v6h2.7V6h2.7V3H21v6h-2.7v3H21v9h-7.2v-3h-2.7v-3H8.4v6H3V3z" />
      </svg>
    ),
  },
  {
    id: 'spotify',
    name: 'Spotify',
    nameAr: 'سبوتيفاي',
    handlePrefix: '♫',
    color: '#1DB954',
    gradient: 'linear-gradient(135deg, #1DB954 0%, #117A37 100%)',
    glowColor: '#1DB954',
    placeholder: 'https://open.spotify.com/artist/...',
    domains: ['spotify.com', 'open.spotify.com'],
    renderIcon: (className = 'w-5 h-5') => (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
      </svg>
    ),
  },
  {
    id: 'github',
    name: 'GitHub',
    nameAr: 'غيت هاب',
    handlePrefix: 'git/',
    color: '#F8FAFC',
    gradient: 'linear-gradient(135deg, #334155 0%, #0F172A 100%)',
    glowColor: '#94A3B8',
    placeholder: 'https://github.com/username',
    domains: ['github.com', 'gist.github.com'],
    renderIcon: (className = 'w-5 h-5') => (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
      </svg>
    ),
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    nameAr: 'لينكدإن',
    handlePrefix: 'in/',
    color: '#0A66C2',
    gradient: 'linear-gradient(135deg, #0A66C2 0%, #004182 100%)',
    glowColor: '#0A66C2',
    placeholder: 'https://linkedin.com/in/username',
    domains: ['linkedin.com'],
    renderIcon: (className = 'w-5 h-5') => (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
];

export function getSocialPlatform(id: string): SocialPlatformMeta {
  return (
    SOCIAL_PLATFORMS.find((p) => p.id === id?.toLowerCase()) ||
    SOCIAL_PLATFORMS[0]
  );
}

/**
 * Automatically detects if a URL belongs to one of the 14 official social platforms!
 */
export function detectSocialPlatformFromUrl(url?: string): SocialPlatformMeta | null {
  if (!url) return null;
  const lower = url.toLowerCase();
  for (const plat of SOCIAL_PLATFORMS) {
    if (plat.domains.some((d) => lower.includes(d))) {
      return plat;
    }
  }
  return null;
}

/**
 * Automatically generates a full, valid destination URL from a simple username, handle or phone number
 */
export function formatSocialInputToUrl(platformId: SocialPlatformId, rawInput: string): string {
  const trimmed = (rawInput || '').trim();
  if (!trimmed) return '';

  // If already a complete URL, preserve it
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  // Strip leading '@' symbols
  const clean = trimmed.replace(/^@+/, '');

  switch (platformId) {
    case 'instagram':
      return `https://instagram.com/${clean}`;
    case 'tiktok':
      return `https://tiktok.com/@${clean}`;
    case 'x':
      return `https://x.com/${clean}`;
    case 'youtube':
      if (clean.startsWith('channel/') || clean.startsWith('c/')) {
        return `https://youtube.com/${clean}`;
      }
      return `https://youtube.com/@${clean}`;
    case 'telegram':
      return `https://t.me/${clean}`;
    case 'snapchat':
      return `https://www.snapchat.com/add/${clean}`;
    case 'facebook':
      if (clean.startsWith('groups/')) {
        return `https://facebook.com/${clean}`;
      }
      return `https://facebook.com/${clean}`;
    case 'whatsapp': {
      const digitsOnly = clean.replace(/[^0-9]/g, '');
      if (digitsOnly.length >= 8) {
        return `https://wa.me/${digitsOnly}`;
      }
      if (clean.startsWith('channel/')) {
        return `https://whatsapp.com/${clean}`;
      }
      return `https://whatsapp.com/channel/${clean}`;
    }
    case 'discord':
      if (clean.startsWith('invite/')) {
        return `https://discord.gg/${clean.replace('invite/', '')}`;
      }
      return `https://discord.gg/${clean}`;
    case 'twitch':
      return `https://twitch.tv/${clean}`;
    case 'kick':
      return `https://kick.com/${clean}`;
    case 'github':
      return `https://github.com/${clean}`;
    case 'linkedin':
      if (clean.startsWith('in/') || clean.startsWith('company/')) {
        return `https://linkedin.com/${clean}`;
      }
      return `https://linkedin.com/in/${clean}`;
    case 'spotify':
      if (clean.startsWith('artist/') || clean.startsWith('user/') || clean.startsWith('playlist/')) {
        return `https://open.spotify.com/${clean}`;
      }
      return `https://open.spotify.com/artist/${clean}`;
    default:
      return `https://${clean}`;
  }
}

/**
 * Detects whether a URL points to a specific Official Channel, Group, Community, or Server
 * (e.g., WhatsApp Channel, Telegram Channel, Discord Server, Facebook Group/Channel)
 */
export function detectChannelBadgeLabel(url?: string, isRtl = true): string | null {
  if (!url) return null;
  const lower = url.toLowerCase();

  if (lower.includes('whatsapp.com/channel')) {
    return isRtl ? 'قناة واتساب رسمية' : 'WhatsApp Channel';
  }
  if (lower.includes('chat.whatsapp.com')) {
    return isRtl ? 'مجتمع واتساب' : 'WhatsApp Community';
  }
  if (lower.includes('wa.me') || lower.includes('api.whatsapp.com')) {
    return isRtl ? 'واتساب مباشر' : 'WhatsApp Direct';
  }
  if (lower.includes('t.me/') || lower.includes('telegram.me/') || lower.includes('telegram.dog/')) {
    return isRtl ? 'قناة / مجتمع تيليغرام' : 'Telegram Channel';
  }
  if (
    lower.includes('discord.gg/') ||
    lower.includes('discord.com/invite') ||
    lower.includes('discord.com/channels')
  ) {
    return isRtl ? 'سيرفر / قناة ديسكورد' : 'Discord Server';
  }
  if (
    lower.includes('facebook.com/groups') ||
    lower.includes('fb.com/groups') ||
    lower.includes('m.me/j/') ||
    lower.includes('facebook.com/channels')
  ) {
    return isRtl ? 'قناة / مجموعة فيسبوك' : 'Facebook Channel';
  }
  if (lower.includes('facebook.com/') || lower.includes('fb.com/') || lower.includes('fb.watch')) {
    return isRtl ? 'صفحة / قناة فيسبوك' : 'Facebook Page';
  }
  if (lower.includes('youtube.com/') || lower.includes('youtu.be/')) {
    return isRtl ? 'قناة يوتيوب' : 'YouTube Channel';
  }

  const detected = detectSocialPlatformFromUrl(url);
  if (detected) {
    return isRtl ? detected.nameAr.split(' ')[0] : detected.name;
  }
  return null;
}

/**
 * Renders an official 3D Brand Emblem Badge with authentic gradient, specular glass top edge, and glow.
 */
export function OfficialSocialBadge({
  platformId,
  size = 'md',
  variant = 'gradient',
  interactive = true,
  className = '',
}: {
  platformId: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'gradient' | 'glass' | 'neon' | 'solid' | 'outline' | 'minimal' | 'floating';
  interactive?: boolean;
  className?: string;
}) {
  const meta = getSocialPlatform(platformId);
  const isSnapchat = meta.id === 'snapchat';
  const dim =
    size === 'sm'
      ? 'w-9 h-9 rounded-xl'
      : size === 'lg'
      ? 'w-14 h-14 rounded-2xl'
      : 'w-11 h-11 rounded-2xl';
  const iconDim =
    size === 'sm'
      ? isSnapchat
        ? 'w-5 h-5'
        : 'w-4 h-4'
      : size === 'lg'
      ? isSnapchat
        ? 'w-8 h-8'
        : 'w-6 h-6'
      : isSnapchat
      ? 'w-6 h-6'
      : 'w-5 h-5';

  const isOutline = variant === 'outline' || variant === 'minimal';
  const isNeon = variant === 'neon';

  return (
    <div
      className={`group relative flex items-center justify-center shrink-0 overflow-hidden transition-all duration-300 ease-out select-none ${dim} ${
        interactive
          ? 'cursor-pointer hover:scale-125 hover:-translate-y-2 hover:rotate-1 hover:z-20 active:scale-95'
          : ''
      } ${className}`}
      style={{
        background: isOutline
          ? 'rgba(255,255,255,0.04)'
          : isNeon
          ? 'rgba(8,8,14,0.88)'
          : meta.gradient,
        color: isOutline || isNeon ? meta.color : meta.textColor || '#FFFFFF',
        border: isNeon
          ? `1.5px solid ${meta.color}`
          : isOutline
          ? `1px solid ${meta.color}66`
          : isSnapchat
          ? '1.5px solid rgba(5,5,8,0.18)'
          : '1px solid rgba(255,255,255,0.26)',
        boxShadow: isNeon
          ? `0 0 22px ${meta.glowColor}80, inset 0 0 12px ${meta.glowColor}40`
          : `0 10px 26px -5px ${meta.glowColor}70, inset 0 1.5px 1px rgba(255,255,255,0.48)`,
      }}
    >
      {/* Dynamic Hover Glow Bloom */}
      {interactive && (
        <span
          className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-[inherit]"
          style={{
            boxShadow: `0 0 24px 3px ${meta.glowColor}, inset 0 0 12px ${meta.glowColor}80`,
          }}
        />
      )}

      {/* Top Specular Glass Reflection */}
      {!isSnapchat && (
        <span className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/35 to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />
      )}

      {/* Diagonal Shine Sweep Beam on Hover */}
      {interactive && (
        <span className="pointer-events-none absolute -inset-full bg-gradient-to-r from-transparent via-white/45 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />
      )}

      {/* Inner Icon with Interactive Micro-Physics */}
      <div
        className={`relative z-10 flex items-center justify-center transition-transform duration-300 ${
          interactive ? 'group-hover:scale-110 group-hover:-rotate-3' : ''
        }`}
      >
        {meta.renderIcon(iconDim)}
      </div>
    </div>
  );
}

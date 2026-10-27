'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type Locale = 'ar' | 'en';

export const translations = {
  ar: {
    brand: 'VoltiX',
    tagline: 'هويتك الرقمية الفاخرة في رابط واحد',
    heroBadge: 'الجيل الجديد من منصات الهوية الرقمية الفاخرة — VoltiX',
    heroTitle1: 'ليس مجرد موقع روابط...',
    heroTitle2: 'هذه هويتك الرقمية المتكاملة',
    heroSubtitle:
      'صمّم صفحتك الشخصية عبر VoltiX بتقنيات الزجاج السائل، إضاءة الشفق القطبي المتحركة، أكثر من 25 ثيمًا سينمائيًا، وتفاعلات ثلاثية الأبعاد تخطف الأنظار من اللحظة الأولى.',
    startFree: 'ابدأ مجانًا الآن',
    exploreThemes: 'استكشف الثيمات الحية',
    login: 'تسجيل الدخول',
    signup: 'إنشاء حساب',
    dashboard: 'لوحة التحكم',
    adminPanel: 'لوحة الإدارة',
    logout: 'تسجيل الخروج',
    livePhoneTitle: 'جرب تغيير الثيم مباشرة على الهاتف التفاعلي',
    featuresTitle: 'هندسة بصرية وتقنية بلا حدود',
    featuresSubtitle: 'كل تفصيل صُمم ليمنح علامتك الشخصية حضورًا ملكيًا يليق بمحتواك',
    themesShowcaseTitle: 'مكتبة الثيمات السينمائية',
    themesShowcaseSub: 'اختر من بين أكثر من 25 عالمًا بصريًا متكاملًا أو ابتكر ثيمك الخاص عبر محرك Theme DNA',
    howItWorksTitle: 'ثلاث خطوات نحو حضور رقمي استثنائي',
    showcaseUsersTitle: 'مبدعون اختاروا VoltiX',
    faqTitle: 'الأسئلة الشائعة',
    footerRights: 'جميع الحقوق محفوظة لمنصة VoltiX الفاخرة',
    viewProfile: 'عرض الصفحة العامة',
    saveChanges: 'حفظ التغييرات',
    saving: 'جاري الحفظ...',
    savedSuccess: 'تم حفظ التغييرات بنجاح ✨',
    resetDefaults: 'استعادة الافتراضي',
    undo: 'تراجع',
    redo: 'إعادة',
    overview: 'نظرة عامة',
    linksManager: 'إدارة الروابط',
    themeEngine: 'محرك الثيمات',
    effectsStudio: 'استوديو التأثيرات',
    analytics: 'التحليلات الذكية',
    qrAndSeo: 'QR Code & SEO',
    accountSettings: 'إعدادات الحساب',
    totalViews: 'إجمالي الزيارات',
    totalClicks: 'إجمالي النقرات',
    uniqueVisitors: 'الزوار الفريدون',
    ctrRate: 'معدل النقر CTR',
    addLink: 'إضافة رابط جديد',
    featuredLink: 'رابط مميز',
    scheduleLink: 'جدولة الظهور',
    shareProfile: 'مشاركة الصفحة',
    copyLink: 'نسخ الرابط',
    copied: 'تم النسخ!',
    reportPage: 'الإبلاغ عن محتوى',
  },
  en: {
    brand: 'VoltiX',
    tagline: 'Your Ultra-Luxury Digital Identity in One Link',
    heroBadge: 'VOLTIX — NEXT-GEN LUXURY DIGITAL IDENTITY PLATFORM',
    heroTitle1: 'Not Just a Link Page...',
    heroTitle2: 'A Complete Digital Identity',
    heroSubtitle:
      'Craft an unforgettable personal hub on VoltiX powered by Liquid Glass UI, animated Aurora shaders, 25+ cinematic themes, and 3D micro-interactions that captivate from the first second.',
    startFree: 'Create Your VoltiX Free',
    exploreThemes: 'Explore Live Themes',
    login: 'Sign In',
    signup: 'Get Started',
    dashboard: 'Dashboard',
    adminPanel: 'Admin Panel',
    logout: 'Sign Out',
    livePhoneTitle: 'Switch themes live on the interactive 3D phone',
    featuresTitle: 'Unrivaled Visual & Technical Engineering',
    featuresSubtitle: 'Every pixel and motion curve is crafted to elevate your personal brand',
    themesShowcaseTitle: '20 Signature Cinematic Themes',
    themesShowcaseSub: 'Switch between 20 distinct architectural worlds or generate your own with Theme DNA',
    howItWorksTitle: 'Three Steps to an Iconic Presence',
    showcaseUsersTitle: 'Creators Powered by VoltiX',
    faqTitle: 'Frequently Asked Questions',
    footerRights: 'All rights reserved to VoltiX Luxury Platform',
    viewProfile: 'View Public Page',
    saveChanges: 'Save Changes',
    saving: 'Saving...',
    savedSuccess: 'Changes saved successfully ✨',
    resetDefaults: 'Reset Defaults',
    undo: 'Undo',
    redo: 'Redo',
    overview: 'Overview',
    linksManager: 'Links & Media',
    themeEngine: 'Theme Engine',
    effectsStudio: 'Effects Studio',
    analytics: 'Analytics',
    qrAndSeo: 'QR Code & SEO',
    accountSettings: 'Account Settings',
    totalViews: 'Total Page Views',
    totalClicks: 'Total Link Clicks',
    uniqueVisitors: 'Unique Visitors',
    ctrRate: 'Click-Through Rate',
    addLink: 'Add New Link',
    featuredLink: 'Featured Link',
    scheduleLink: 'Schedule Visibility',
    shareProfile: 'Share Profile',
    copyLink: 'Copy Link',
    copied: 'Copied!',
    reportPage: 'Report Profile',
  },
};

interface LanguageContextType {
  locale: Locale;
  dir: 'rtl' | 'ltr';
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
  t: (typeof translations)['ar'];
}

const LanguageContext = createContext<LanguageContextType>({
  locale: 'ar',
  dir: 'rtl',
  setLocale: () => {},
  toggleLocale: () => {},
  t: translations.ar,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('ar');

  useEffect(() => {
    const saved = (typeof window !== 'undefined' && localStorage.getItem('aura_locale')) as Locale | null;
    if (saved === 'ar' || saved === 'en') {
      setLocaleState(saved);
      document.documentElement.lang = saved;
      document.documentElement.dir = saved === 'ar' ? 'rtl' : 'ltr';
    } else {
      document.documentElement.lang = 'ar';
      document.documentElement.dir = 'rtl';
    }
  }, []);

  const setLocale = (next: Locale) => {
    setLocaleState(next);
    if (typeof window !== 'undefined') {
      localStorage.setItem('aura_locale', next);
      document.documentElement.lang = next;
      document.documentElement.dir = next === 'ar' ? 'rtl' : 'ltr';
    }
  };

  const toggleLocale = () => {
    setLocale(locale === 'ar' ? 'en' : 'ar');
  };

  return (
    <LanguageContext.Provider
      value={{
        locale,
        dir: locale === 'ar' ? 'rtl' : 'ltr',
        setLocale,
        toggleLocale,
        t: translations[locale],
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}

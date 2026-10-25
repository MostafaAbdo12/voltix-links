import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('✦ Seeding AURA LINKS database...');

  // 1. SiteSettings
  await prisma.siteSettings.upsert({
    where: { id: 'default' },
    create: {
      id: 'default',
      siteName: 'VoltiX',
      siteTaglineAr: 'هويتك الرقمية الفاخرة في رابط واحد',
      siteTaglineEn: 'Your Ultra-Luxury Digital Identity in One Link',
      logoText: 'VoltiX',
      defaultThemeId: 'obsidian-luxury',
      allowRegistrations: true,
      maintenanceMode: false,
    },
    update: {
      siteName: 'VoltiX',
      logoText: 'VoltiX',
      globalSeoTitle: 'VoltiX — Ultra-Premium Animated Link-in-Bio Platform',
    },
  });

  const adminHash = await bcrypt.hash('Am2710165@', 12);

  // 2. Platform Owner / Sovereign Admin User (@voltix)
  const admin = await prisma.user.upsert({
    where: { email: 'aboaysel2710@gmail.com' },
    create: {
      email: 'aboaysel2710@gmail.com',
      username: 'voltix',
      passwordHash: adminHash,
      displayName: 'سلطان العتيبي | VoltiX Founder',
      bio: 'مؤسس منصة VoltiX LINKS • مهندس تجارب رقمية فاخرة ومصمم واجهات تفاعلية ثلاثية الأبعاد ✨',
      role: 'ADMIN',
      isVerified: true,
      emailVerified: new Date(),
      locale: 'ar',
      profileConfig: {
        create: {
          themeId: 'obsidian-luxury',
          layout: 'centered',
          entranceAnimation: 'cinematic-fade',
          moodPreset: 'luxury',
          mediaEmbedJson: JSON.stringify({
            enabled: true,
            type: 'spotify',
            title: 'Midnight Obsidian Symphony',
            artist: 'AURA Sound Lab',
            url: 'https://open.spotify.com',
          }),
          seoTitle: 'سلطان العتيبي (@voltix) | VoltiX Official',
          seoDescription: 'الصفحة الرسمية لمؤسس منصة VoltiX للهويات الرقمية الفاخرة.',
        },
      },
      socialLinks: {
        create: [
          { platform: 'x', url: 'https://x.com/auralinks', order: 0 },
          { platform: 'instagram', url: 'https://instagram.com/auralinks', order: 1 },
          { platform: 'github', url: 'https://github.com/auralinks', order: 2 },
          { platform: 'linkedin', url: 'https://linkedin.com/in/auralinks', order: 3 },
          { platform: 'youtube', url: 'https://youtube.com/@auralinks', order: 4 },
        ],
      },
      links: {
        create: [
          {
            title: 'إطلاق النسخة الملكية من AURA LINKS 2.0',
            url: 'https://auralinks.io/launch',
            description: 'اكتشف محرك الثيمات المطور واستوديو التأثيرات ثلاثية الأبعاد',
            icon: 'Crown',
            cardType: 'spotlight',
            isFeatured: true,
            badgeText: 'إصدار حصري',
            order: 0,
            clicksCount: 142,
          },
          {
            title: 'معرض الهويات الرقمية (Design System)',
            url: 'https://auralinks.io/design-system',
            description: 'نظرة معمقة على تقنيات الزجاج السائل Liquid Glass UI',
            icon: 'Palette',
            cardType: 'animated_border',
            isFeatured: false,
            groupName: 'المشاريع والإصدارات',
            order: 1,
            clicksCount: 98,
          },
          {
            title: 'احجز جلسة استشارية لتصميم هويتك',
            url: 'https://auralinks.io/consultation',
            description: 'جلسات خاصة لرواد الأعمال وصناع المحتوى والشركات',
            icon: 'Calendar',
            cardType: '3d',
            isFeatured: false,
            groupName: 'التعاون والأعمال',
            order: 2,
            clicksCount: 74,
          },
          {
            title: 'المجتمع الخاص بالمبدعين على ديسكورد',
            url: 'https://discord.gg/auralinks',
            description: 'انضم إلى أكثر من 15,000 مصمم ومطور وصانع محتوى',
            icon: 'Sparkles',
            cardType: 'glass',
            isFeatured: false,
            groupName: 'التعاون والأعمال',
            order: 3,
            clicksCount: 63,
          },
        ],
      },
    },
    update: {},
  });

  // 3. Seed real analytics history for @admin if empty
  const existingViews = await prisma.pageView.count({ where: { userId: admin.id } });
  if (existingViews === 0) {
    const adminLinks = await prisma.link.findMany({ where: { userId: admin.id } });
    const countries = ['SA', 'AE', 'KW', 'QA', 'US', 'GB', 'EG'];
    const devices = ['mobile', 'mobile', 'desktop', 'tablet'];
    const sources = ['Instagram', 'X', 'Direct', 'TikTok', 'Google', 'LinkedIn'];

    const viewRows = [];
    for (let i = 0; i < 45; i++) {
      const daysAgo = i % 14;
      const createdAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
      viewRows.push({
        userId: admin.id,
        visitorHash: `seed_visitor_${i % 28}`,
        country: countries[i % countries.length],
        deviceType: devices[i % devices.length],
        referrer: 'https://x.com',
        source: sources[i % sources.length],
        createdAt,
      });
    }
    await prisma.pageView.createMany({ data: viewRows });

    if (adminLinks.length > 0) {
      const clickRows = [];
      for (let i = 0; i < 24; i++) {
        const daysAgo = i % 14;
        const createdAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
        const link = adminLinks[i % adminLinks.length];
        clickRows.push({
          linkId: link.id,
          userId: admin.id,
          visitorHash: `seed_visitor_${i % 18}`,
          country: countries[i % countries.length],
          deviceType: devices[i % devices.length],
          referrer: 'https://instagram.com',
          source: sources[i % sources.length],
          createdAt,
        });
      }
      await prisma.linkClick.createMany({ data: clickRows });
    }
  }

  console.log('✔ AURA LINKS seed completed successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


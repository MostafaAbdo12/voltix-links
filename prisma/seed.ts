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
  await prisma.user.upsert({
    where: { email: 'aboaysel2710@gmail.com' },
    create: {
      email: 'aboaysel2710@gmail.com',
      username: 'voltix',
      passwordHash: adminHash,
      displayName: 'مصطفى عبده | VoltiX Founder',
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
          seoTitle: 'مصطفى عبده (@voltix) | VoltiX Official',
          seoDescription: 'الصفحة الرسمية لمؤسس منصة VoltiX للهويات الرقمية الفاخرة.',
        },
      },
    },
    update: {
      displayName: 'مصطفى عبده | VoltiX Founder',
      role: 'ADMIN',
      isVerified: true,
    },
  });

  console.log('✔ VoltiX clean production database initialized with sovereign owner account.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


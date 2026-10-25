import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('✦ Seeding VoltiX database...');

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

  // 2. Sovereign Admin User (Strictly Loaded via Environment Variables)
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  const adminUsername = process.env.ADMIN_USERNAME || 'voltix';

  if (adminEmail && adminPassword) {
    const adminHash = await bcrypt.hash(adminPassword, 12);
    await prisma.user.upsert({
      where: { email: adminEmail.toLowerCase().trim() },
      create: {
        email: adminEmail.toLowerCase().trim(),
        username: adminUsername.toLowerCase().trim(),
        passwordHash: adminHash,
        displayName: 'VoltiX Founder',
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
            seoTitle: 'VoltiX Official',
            seoDescription: 'الصفحة الرسمية لمؤسس منصة VoltiX للهويات الرقمية الفاخرة.',
          },
        },
      },
      update: {
        role: 'ADMIN',
        isVerified: true,
      },
    });
  }

  console.log('✔ VoltiX clean production database initialized securely.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

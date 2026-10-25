const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const args = process.argv.slice(2);
  const email = args[0];
  const username = args[1];
  const password = args[2];
  const displayName = args[3] || 'مالك المنصة | Platform Owner';

  if (!email || !username || !password) {
    console.error('Usage: node scripts/set-admin.js <email> <username> <password> [displayName]');
    process.exit(1);
  }

  const cleanEmail = email.toLowerCase().trim();
  const cleanUsername = username.toLowerCase().trim();
  const passwordHash = await bcrypt.hash(password, 12);

  // Check if an admin exists
  const existingAdmin = await prisma.user.findFirst({
    where: { role: 'ADMIN' },
  });

  if (existingAdmin) {
    const updated = await prisma.user.update({
      where: { id: existingAdmin.id },
      data: {
        email: cleanEmail,
        username: cleanUsername,
        passwordHash,
        displayName,
        role: 'ADMIN',
        isVerified: true,
      },
    });
    console.log(`✅ تم تحديث بيانات المالك بنجاح:`);
    console.log(`- البريد: ${updated.email}`);
    console.log(`- اسم المستخدم: @${updated.username}`);
    console.log(`- الاسم المعروض: ${updated.displayName}`);
    console.log(`- الرتبة: ${updated.role}`);
  } else {
    const created = await prisma.user.create({
      data: {
        email: cleanEmail,
        username: cleanUsername,
        passwordHash,
        displayName,
        role: 'ADMIN',
        isVerified: true,
        profileConfig: {
          create: {
            themeId: 'obsidian-luxury',
            layout: 'centered',
          },
        },
      },
    });
    console.log(`✅ تم إنشاء حساب المالك بنجاح:`);
    console.log(`- البريد: ${created.email}`);
    console.log(`- اسم المستخدم: @${created.username}`);
  }
}

main()
  .catch((e) => {
    console.error('❌ خطأ أثناء تعيين بيانات المالك:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


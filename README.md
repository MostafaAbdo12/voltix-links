# ✦ AURA LINKS — Ultra-Premium Animated Link-in-Bio Platform

> **"هذا ليس مجرد موقع روابط... هذه هوية رقمية متكاملة."**
> **"Not Just a Link Page... A Complete Digital Identity."**

**AURA LINKS** is a full-stack, commercial-grade digital identity and Link-in-Bio SaaS platform engineered with **Liquid Glass UI**, **Animated Aurora Shaders**, **20 Signature Luxury Themes**, **Theme DNA Synthesis**, an **Interactive Effects Studio**, **Real-time Privacy-First Analytics**, **Custom QR Code & SEO Studios**, **Bilingual Arabic (RTL) / English (LTR) Typography**, and a **Platform Admin Command Center**.

---

## 1. البنية التقنية والاختيارات الهندسية (Tech Stack & Architecture)

| الطبقة (Layer) | التقنية (Technology) | سبب الاختيار (Architectural Rationale) |
|---|---|---|
| **Framework** | Next.js 14.2 (App Router) + React 18 + TypeScript | استقرار كامل، أداء عالي، دعم Server-Side Metadata (`generateMetadata`)، وواجهات API آمنة. |
| **Styling & Design System** | Tailwind CSS + Custom CSS Shaders | تنفيذ نظام Liquid Glass UI، تدرجات الشفق القطبي المتحركة، والظلال السينمائية بأعلى سرعة. |
| **Animation Engine** | Framer Motion + GPU CSS Keyframes | انتقالات سلسة 60fps، إمالة ثلاثية الأبعاد (3D Card Tilt)، أزرار مغناطيسية، ودعم كامل لـ `prefers-reduced-motion`. |
| **Database & ORM** | Prisma ORM + SQLite (Local) / PostgreSQL (Prod) | يعمل المشروع فورًا دون الحاجة لإعداد خادم خارجي عبر `prisma/schema.prisma` (SQLite)، مع توفير `prisma/schema.postgres.prisma` الجاهز للربط المباشر بقاعدة بيانات PostgreSQL في بيئة الإنتاج. |
| **Authentication & Security** | `jose` (Signed HTTP-Only JWT) + `bcryptjs` + `zod` | تشفير كلمات المرور بـ 12 جولة (bcrypt)، جلسات محمية، التحقق من المدخلات والروابط، عزل صلاحيات المستخدمين، وحماية Rate Limiting و XSS. |
| **QR & Utilities** | `qrcode` (Canvas PNG + Vector SVG) + Lucide Icons | توليد فعلي لرموز QR قابلة للتخصيص والتحميل بصيغتي PNG و SVG مع شعار مركزي بمستوى تصحيح خطأ عالٍ (`H`). |
| **Testing** | Vitest Integration & Security Test Suite | اختبارات آلية شاملة تتحقق من 18 سيناريو فعلي على قاعدة البيانات وواجهات الـ API. |

---

## 2. دليل التثبيت والتشغيل السريع (Quick Installation & Setup)

### المتطلبات الأساسية
- **Node.js** `v18.18+` أو `v20+` أو `v24+`

### خطوات التشغيل المحلي (Local Development)

```bash
# 1. تثبيت الحزم البرمجية
npm install

# 2. مزامنة قاعدة البيانات وتوليد Prisma Client
npx prisma db push

# 3. زراعة البيانات الأولية (حساب المدير + حسابات المبدعين + إحصائيات حقيقية)
npm run db:seed

# 4. تشغيل خادم التطوير
npm run dev
```

افتح المتصفح على: `http://localhost:3000`

### حسابات جاهزة للتجربة الفورية (Pre-Seeded Accounts)

| الدور (Role) | البريد الإلكتروني / اسم المستخدم | كلمة المرور | رابط الصفحة العامة |
|---|---|---|---|
| **Administrator (مدير المنصة)** | `admin@auralinks.io` أو `admin` | `Admin@123456` | `/@admin` |
| **Creator (ليلى المنصور)** | `layla@auralinks.io` أو `layla` | `Creator@123456` | `/@layla` |
| **Pro Streamer (TARIQX)** | `tariq@auralinks.io` أو `tariq` | `Creator@123456` | `/@tariq` |

---

## 3. دليل إعداد الخدمات الخارجية (External Services Configuration)

جميع الوظائف الأساسية تعمل بالكامل محليًا دون مفاتيح خارجية. لتفعيل التكاملات السحابية الاختيارية في بيئة الإنتاج، قم بتحديث ملف `.env` (انظر `.env.example`):

### أ. تفعيل تسجيل الدخول عبر Google OAuth
1. انتقل إلى [Google Cloud Console](https://console.cloud.google.com/apis/credentials).
2. أنشئ `OAuth 2.0 Client ID` وأضف رابط إعادة التوجيه:
   `http://localhost:3000/api/auth/google/callback` (أو نطاق موقعك في الإنتاج).
3. أضف القيم في `.env`:
   ```env
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"
   GOOGLE_REDIRECT_URI="https://yourdomain.com/api/auth/google/callback"
   ```

### ب. تفعيل إرسال رسائل البريد الفعلي (SMTP)
- في الوضع المحلي (بدون SMTP)، يعرض النظام رابط استعادة كلمة المرور ورابط تأكيد البريد مباشرة داخل الواجهة لسهولة الاختبار الفوري.
- للإرسال الفعلي عبر البريد الإلكتروني، أضف بيانات SMTP في `.env`:
  ```env
  SMTP_HOST="smtp.resend.com"
  SMTP_PORT="587"
  SMTP_USER="resend"
  SMTP_PASS="re_xxxxxxxxxxxx"
  SMTP_FROM="Aura Links <no-reply@yourdomain.com>"
  ```

### ج. الترقية إلى قاعدة بيانات PostgreSQL في الإنتاج
1. ضع رابط اتصال PostgreSQL في `.env`:
   ```env
   DATABASE_URL="postgresql://user:password@host:5432/auralinks?schema=public"
   ```
2. نفّذ الأمر:
   ```bash
   npx prisma db push --schema=prisma/schema.postgres.prisma
   ```

---

## 4. تعليمات النشر للإنتاج (Production Deployment)

```bash
# بناء نسخة الإنتاج المحسنة
npm run build

# تشغيل خادم الإنتاج
npm run start
```

يمكن نشر المشروع مباشرة على **Vercel** أو **Railway** أو **Render** أو عبر **Docker** مع ضبط متغيرات البيئة `DATABASE_URL` و `JWT_SECRET` و `NEXT_PUBLIC_APP_URL`.

---

## 5. تشغيل الاختبارات الآلية (Running Automated Tests)

```bash
npm test
```

تتحقق حزمة الاختبارات (`tests/aura-links.test.ts`) عمليًا من السيناريوهات الـ 18 المطلوبة (إنشاء الحساب، تفرد اسم المستخدم، تسجيل الدخول، استعادة كلمة المرور، إدارة الروابط وترتيبها، محرك الـ 20 ثيمًا، حفظ الإعدادات، التحليلات ونقرات الروابط، منع تعديل بيانات مستخدم آخر `403`، وحماية لوحة المدير `403`).


import type { Metadata } from 'next';
import './globals.css';
import { LanguageProvider } from '@/lib/i18n';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://voltix.vercel.app'),
  title: 'VoltiX — Ultra-Premium Animated Link-in-Bio Platform',
  description:
    'منصة VoltiX للهويات الرقمية الفاخرة في رابط واحد. صمّم صفحتك الشخصية بـ 20 ثيمًا سينمائيًا، تقنيات الزجاج السائل Liquid Glass UI، وتأثيرات ثلاثية الأبعاد.',
  keywords: [
    'VoltiX',
    'Link in Bio',
    'Luxury Portfolio',
    'Digital Identity',
    'Liquid Glass UI',
    'روابطي',
    'صفحة روابط',
  ],
  icons: {
    icon: '/voltix-logo.png',
    shortcut: '/voltix-logo.png',
    apple: '/voltix-logo.png',
  },
  openGraph: {
    title: 'VoltiX — Ultra-Premium Animated Link-in-Bio Platform',
    description:
      'Your Complete Luxury Digital Identity in One Link. 20+ Cinematic Themes, Liquid Glass UI, Effects Studio & Real-time Analytics.',
    type: 'website',
    images: ['/voltix-logo.png'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" className="dark">
      <body className="min-h-screen bg-[#050508] text-slate-50 antialiased selection:bg-amber-500/30 selection:text-amber-200">
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}


import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { LanguageProvider } from '@/components/LanguageContext';
import { SocialProof } from '@/components/SocialProof';

export const metadata: Metadata = {
  title: 'Easy Tax Refund | 간편한 외국인 세금 환급',
  description: '대한민국에 있는 외국인들이 정당한 권리를 찾을 수 있도록 돕는 AI 기반 세금 환급 서비스입니다.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased selection:bg-primary/30 selection:text-primary-foreground" suppressHydrationWarning>
        <LanguageProvider>
          {children}
          <Toaster />
          <SocialProof />
        </LanguageProvider>
      </body>
    </html>
  );
}

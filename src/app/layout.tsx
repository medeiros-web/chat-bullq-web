import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';
import { RegisterSW } from '@/components/pwa/register-sw';

const inter = Inter({ subsets: ['latin'] });

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#1e3a8a' },
    { media: '(prefers-color-scheme: dark)', color: '#1e3a8a' },
  ],
};

export const metadata: Metadata = {
  title: 'Chat BullQ',
  description: 'Plataforma de atendimento omnichannel',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'BullQ',
  },
  formatDetection: {
    telephone: false,
  },
  other: {
    'mobile-web-app-capable': 'yes',
    'msapplication-TileColor': '#1e3a8a',
    'msapplication-tap-highlight': 'no',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="pt-BR"
      suppressHydrationWarning
      className="bg-white lg:bg-zinc-100 dark:bg-zinc-900 dark:lg:bg-zinc-950"
    >
      <head>
        <link rel="mask-icon" href="/icon" color="#1e3a8a" />
      </head>
      <body className={inter.className}>
        <Providers>{children}</Providers>
        <RegisterSW />
      </body>
    </html>
  );
}

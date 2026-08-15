import './globals.css';
import type { Metadata } from 'next';
import DownloadAppBanner from '@/components/DownloadAppBanner';

export const metadata: Metadata = {
  title: 'Ecolife - Organic Farm Store',
  description: 'Farm fresh honey, milk, olive oil, and eggs.',
  icons: {
    icon: '/favicon.ico',
    apple: '/icon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased bg-slate-50 text-slate-900">
        <DownloadAppBanner />
        {children}
      </body>
    </html>
  );
}

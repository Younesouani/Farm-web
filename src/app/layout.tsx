import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Ecolife - Organic Farm Store',
  description: 'Farm fresh honey, milk, olive oil, and eggs.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased bg-slate-50 text-slate-900">{children}</body>
    </html>
  );
}

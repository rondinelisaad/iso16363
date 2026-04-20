import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from '../components/providers';
import './globals.css';

const geist = Inter({ subsets: ['latin'], variable: '--font-geist' });
// Geist Mono not available in this Next.js version — using monospace system font via CSS
const geistMono = Inter({ subsets: ['latin'], variable: '--font-geist-mono', display: 'swap' });

export const metadata: Metadata = {
  title: 'ISO 16363 Compliance Platform',
  description:
    'Multi-tenant SaaS for compliance management and external auditing against the ISO 16363 standard (CCSDS 652.0-M-2).',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geist.variable} ${geistMono.variable} font-sans`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

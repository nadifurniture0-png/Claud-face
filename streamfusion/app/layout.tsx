import type { Metadata, Viewport } from 'next';
import { DM_Sans } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/components/auth/AuthProvider';

const dmSans = DM_Sans({ subsets: ['latin'], variable: '--font-dm-sans' });

export const metadata: Metadata = {
  title:       'StreamFusion — Live Streaming with AI Filters',
  description: 'Go live with real-time AI face filters. Watch streams. Chat live.',
  manifest:    '/manifest.json',
};

export const viewport: Viewport = {
  themeColor:        '#000000',
  width:             'device-width',
  initialScale:      1,
  viewportFit:       'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${dmSans.variable} font-sans bg-black text-white antialiased`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}

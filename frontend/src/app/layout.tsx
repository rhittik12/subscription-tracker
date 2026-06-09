import type { Metadata } from 'next';
import { Inter, Manrope } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import BrutalistClientWrapper from './BrutalistClientWrapper';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const manrope = Manrope({ subsets: ['latin'], variable: '--font-manrope' });

export const metadata: Metadata = {
  title: 'Subscription Tracker',
  description: 'Track all your subscriptions in one place',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=JetBrains+Mono:wght@300;400;600;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined" rel="stylesheet" />
      </head>
      <body className={`${inter.variable} ${manrope.variable}`}>
        {/* Ambient background glows */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-white/[0.07] blur-[120px]" />
          <div className="absolute top-1/4 -right-40 w-[500px] h-[500px] rounded-full bg-violet-600/[0.06] blur-[120px]" />
          <div className="absolute -bottom-40 left-1/3 w-[500px] h-[500px] rounded-full bg-white/[0.05] blur-[120px]" />
        </div>

        <div className="relative z-10 min-h-screen">
          <Sidebar />
          <main className="min-h-screen" style={{ marginLeft: 280 }}>
            <BrutalistClientWrapper>
              <Navbar />
              <div className="pt-6 lg:pt-8 px-gutter">{children}</div>
            </BrutalistClientWrapper>
          </main>
        </div>
      </body>
    </html>
  );
}

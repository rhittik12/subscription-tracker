import type { Metadata } from 'next';
import { Inter, Manrope } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';

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
      <body className={`${inter.variable} ${manrope.variable}`}>
        {/* Ambient background glows */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-white/[0.07] blur-[120px]" />
          <div className="absolute top-1/4 -right-40 w-[500px] h-[500px] rounded-full bg-violet-600/[0.06] blur-[120px]" />
          <div className="absolute -bottom-40 left-1/3 w-[500px] h-[500px] rounded-full bg-white/[0.05] blur-[120px]" />
        </div>

        <div className="relative z-10 min-h-screen">
          <Sidebar />
          <main className="min-h-screen lg:ml-64 px-4 pb-10 pt-4 lg:px-10 lg:pt-6">
            <Navbar />
            <div className="pt-6 lg:pt-8">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}

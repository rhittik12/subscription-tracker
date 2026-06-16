import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import BrutalistClientWrapper from '../BrutalistClientWrapper';
import { Suspense } from 'react';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-shell relative z-10 min-h-screen">
      <Sidebar />
      <main className="min-h-screen lg:ml-[280px]">
        <BrutalistClientWrapper>
          <Suspense fallback={<div className="h-[77px] border-b-2 border-black bg-white" />}>
            <Navbar />
          </Suspense>
          <div className="px-gutter pb-10 pt-6 lg:pt-8">{children}</div>
        </BrutalistClientWrapper>
      </main>
    </div>
  );
}

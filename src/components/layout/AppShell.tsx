'use client';

import Sidebar from './Sidebar';

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 lg:ml-[240px] min-h-screen">
        <div className="max-w-[1200px] mx-auto px-5 sm:px-8 py-8 lg:py-10 page-enter">
          {children}
        </div>
      </main>
    </div>
  );
}

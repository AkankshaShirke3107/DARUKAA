'use client';

import AppShell from '@/components/layout/AppShell';
import { AssessmentProvider } from '@/context/AssessmentContext';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AssessmentProvider>
      <AppShell>{children}</AppShell>
    </AssessmentProvider>
  );
}

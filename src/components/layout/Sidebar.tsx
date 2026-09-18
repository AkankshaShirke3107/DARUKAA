'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Layers,
  BarChart3,
  GitBranch,
  BookOpen,
  BrainCircuit,
  Leaf,
  FlaskConical,
  Clock,
  Settings,
  X,
  Menu,
} from 'lucide-react';
import { useState, useEffect } from 'react';

const navSections = [
  {
    label: 'OVERVIEW',
    items: [
      { href: '/assessment', label: 'Assessment', icon: Layers },
      { href: '/state', label: 'Environmental State', icon: BarChart3 },
      { href: '/relationships', label: 'Relationships', icon: GitBranch },
    ],
  },
  {
    label: 'INTELLIGENCE',
    items: [
      { href: '/knowledge', label: 'Knowledge', icon: BookOpen },
      { href: '/analysis', label: 'Analysis', icon: BrainCircuit },
      { href: '/interventions', label: 'Interventions', icon: Leaf },
      { href: '/scenarios', label: 'Scenario Lab', icon: FlaskConical },
    ],
  },
];

const bottomItems = [
  { href: '/history', label: 'Assessments', icon: Clock },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const sidebarContent = (
    <>
      {/* Brand */}
      <div className="px-5 pt-6 pb-5">
        <Link href="/" className="block" aria-label="Darukaa Biosphere Home">
          <div className="text-[11px] font-semibold tracking-[0.12em] text-text-secondary">
            DARUKAA
          </div>
          <div className="text-[13px] font-medium tracking-[0.04em] text-text-primary mt-0.5">
            BIOSPHERE
          </div>
        </Link>
      </div>

      <div className="h-px bg-border mx-5 mb-3" />

      {/* Nav Sections */}
      <nav className="flex-1 px-3 overflow-y-auto" aria-label="Main navigation">
        {navSections.map((section) => (
          <div key={section.label} className="mb-5">
            <div className="label-xs px-2 mb-2">{section.label}</div>
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`flex items-center gap-2.5 px-2 py-[7px] rounded-[var(--radius-sm)] text-[13px] transition-default ${
                        isActive
                          ? 'bg-accent-subtle text-accent-hover font-medium'
                          : 'text-text-secondary hover:text-text-primary hover:bg-bg-hover'
                      }`}
                    >
                      <Icon
                        size={15}
                        strokeWidth={isActive ? 2 : 1.5}
                        className="shrink-0"
                      />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Bottom section */}
      <div className="mt-auto">
        <div className="h-px bg-border mx-5 mb-2" />
        <div className="px-3 pb-4">
          <ul className="space-y-0.5">
            {bottomItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-2.5 px-2 py-[7px] rounded-[var(--radius-sm)] text-[13px] transition-default ${
                      isActive
                        ? 'bg-accent-subtle text-accent-hover font-medium'
                        : 'text-text-secondary hover:text-text-primary hover:bg-bg-hover'
                    }`}
                  >
                    <Icon size={15} strokeWidth={isActive ? 2 : 1.5} className="shrink-0" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="h-px bg-border mx-5 mb-3" />
        <div className="px-5 pb-5">
          <div className="text-[11px] text-text-muted">
            Demo workspace
          </div>
          <div className="text-[12px] text-text-tertiary mt-1">
            v0.1.0
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-3 left-3 z-50 p-2 rounded-[var(--radius-sm)] bg-bg-secondary border border-border lg:hidden"
        aria-label="Open navigation"
      >
        <Menu size={18} className="text-text-secondary" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-[240px] bg-bg-secondary border-r border-border flex flex-col transition-transform duration-200 lg:hidden ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <button
          onClick={() => setMobileOpen(false)}
          className="absolute top-4 right-4 p-1 text-text-tertiary hover:text-text-primary"
          aria-label="Close navigation"
        >
          <X size={16} />
        </button>
        {sidebarContent}
      </aside>

      {/* Desktop sidebar */}
      <aside
        className="hidden lg:flex flex-col w-[240px] min-w-[240px] h-screen bg-bg-secondary border-r border-border fixed top-0 left-0 z-30"
        aria-label="Sidebar"
      >
        {sidebarContent}
      </aside>
    </>
  );
}

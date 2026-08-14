'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X, LogIn, User as UserIcon } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import { PortalSidebar } from './portal-sidebar';
import { useAuthStore } from '@/store/auth.store';

interface PortalLayoutProps {
  children: React.ReactNode;
}

export function PortalLayout({ children }: PortalLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);

  return (
    <div className="flex h-screen overflow-hidden bg-white dark:bg-zinc-950 font-sans text-zinc-900 dark:text-zinc-100">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:shrink-0">
        <PortalSidebar />
      </div>

      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-zinc-900/60 backdrop-blur-xs md:hidden transition-opacity"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile Drawer */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-white dark:bg-zinc-950 transition-transform duration-300 ease-in-out md:hidden ${
          mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        <div className="absolute top-3.5 right-3.5 z-10 md:hidden">
          <button
            onClick={() => setMobileOpen(false)}
            className="flex h-8 w-8 items-center justify-center rounded-md border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400"
            aria-label="Close menu"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <PortalSidebar onCloseMobile={() => setMobileOpen(false)} />
      </div>

      {/* Main Content Area */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Topbar */}
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-zinc-200/90 bg-white/80 px-4 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/80 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-100 md:hidden"
              aria-label="Open sidebar menu"
            >
              <Menu className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                Software Engineering Standards
              </span>
            </div>
          </div>

          {/* Right Topbar Actions */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <ThemeToggle />

            {token && user ? (
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-xs font-semibold text-zinc-800 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800 transition-colors"
              >
                <UserIcon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{user.name || user.username}</span>
                <span className="sm:hidden">Dashboard</span>
              </Link>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 transition-colors shadow-xs"
              >
                <LogIn className="h-3.5 w-3.5" />
                <span>Login</span>
              </Link>
            )}
          </div>
        </header>

        {/* Scrollable Page Body */}
        <main className="flex-1 overflow-y-auto">
          {children}

          {/* Footer */}
          <footer className="border-t border-zinc-200 bg-white/50 px-4 py-6 text-center text-xs text-zinc-500 dark:border-zinc-800/80 dark:bg-zinc-950/50 dark:text-zinc-400">
            <p>
              &copy; {new Date().getFullYear()} Software Engineering Standardization &bull; PT. Toho
              Technology Indonesia
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
}

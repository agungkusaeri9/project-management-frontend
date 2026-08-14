'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  BookOpen,
  Briefcase,
  LogIn,
  Layers,
  Network,
  Server,
  FileText,
  ShieldCheck,
  Code2,
  ChevronDown,
  ChevronRight,
  Terminal,
  User as UserIcon,
  LayoutDashboard,
  LogOut,
  TrendingUp,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { useLogout } from '@/features/auth/hooks/use-logout';

interface NavChild {
  name: string;
  href: string;
  icon: React.ElementType;
}

interface PortalSidebarProps {
  onCloseMobile?: () => void;
}

export function PortalSidebar({ onCloseMobile }: PortalSidebarProps) {
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const logout = useLogout();

  const isStandardsActive =
    pathname.startsWith('/technology') ||
    pathname.startsWith('/architecture') ||
    pathname.startsWith('/deployment') ||
    pathname.startsWith('/logging') ||
    pathname.startsWith('/security');

  const isHomeActive = pathname === '/' || pathname.startsWith('/progress');
  const [homeOpen, setHomeOpen] = useState<boolean>(true);

  const homeChildren: NavChild[] = [
    { name: 'Engineering Overview', href: '/', icon: Home },
    { name: 'Sprint & Task Progress', href: '/progress', icon: TrendingUp },
  ];

  const [standardsOpen, setStandardsOpen] = useState<boolean>(false);

  const standardsChildren: NavChild[] = [
    { name: 'Technology Stack', href: '/technology', icon: Layers },
    { name: '.NET Relationship', href: '/technology/dotnet', icon: Code2 },
    { name: 'Architecture Patterns', href: '/architecture', icon: Network },
    { name: 'Deployment & Infra', href: '/deployment', icon: Server },
    { name: 'Logging Standard', href: '/logging', icon: FileText },
    { name: 'Security Standard', href: '/security', icon: ShieldCheck },
  ];

  return (
    <aside className="flex h-full w-64 flex-col border-r border-zinc-200 bg-zinc-50/80 dark:border-zinc-800 dark:bg-zinc-950 font-sans">
      {/* Brand Header */}
      <div className="flex h-14 items-center justify-between border-b border-zinc-200 px-4 dark:border-zinc-800">
        <Link
          href="/"
          onClick={onCloseMobile}
          className="flex items-center gap-2.5 font-bold tracking-tight text-zinc-900 dark:text-zinc-50 focus:outline-none"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 text-zinc-50 dark:bg-zinc-100 dark:text-zinc-950 shadow-xs">
            <Terminal className="h-4 w-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-extrabold uppercase tracking-wider text-zinc-900 dark:text-zinc-100 leading-tight">
              TOHO Portal
            </span>
            <span className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400">
              Engineering &amp; Projects
            </span>
          </div>
        </Link>

        <span className="rounded bg-zinc-200/80 px-1.5 py-0.5 text-[10px] font-mono font-semibold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
          v1.0
        </span>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5">
        {/* Section Label */}
        <div className="px-2 pb-1 text-[11px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
          Platform Menu
        </div>

        {/* 1. Home Overview Dropdown */}
        <div>
          <button
            onClick={() => setHomeOpen((prev) => !prev)}
            className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-xs font-semibold transition-colors ${
              isHomeActive
                ? 'bg-zinc-200/70 text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100'
                : 'text-zinc-700 hover:bg-zinc-200/50 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-900/60 dark:hover:text-zinc-100'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Home className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
              <span>Home Overview</span>
            </div>
            {homeOpen ? (
              <ChevronDown className="h-3.5 w-3.5 opacity-60" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5 opacity-60" />
            )}
          </button>

          {homeOpen && (
            <div className="mt-1 ml-3.5 space-y-0.5 border-l border-zinc-200 pl-2.5 dark:border-zinc-800">
              {homeChildren.map((child) => {
                const isActive = pathname === child.href;
                const ChildIcon = child.icon;

                return (
                  <Link
                    key={child.href}
                    href={child.href}
                    onClick={onCloseMobile}
                    className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-xs transition-colors ${
                      isActive
                        ? 'bg-zinc-900 font-semibold text-white dark:bg-zinc-100 dark:text-zinc-900'
                        : 'text-zinc-600 hover:bg-zinc-200/50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900/50 dark:hover:text-zinc-200'
                    }`}
                  >
                    <ChildIcon className={`h-3.5 w-3.5 ${isActive ? 'text-inherit' : 'opacity-70'}`} />
                    <span className="truncate">{child.name}</span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* 2. Standards Group with Subitems */}
        <div>
          <button
            onClick={() => setStandardsOpen((prev) => !prev)}
            className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-xs font-semibold transition-colors ${
              isStandardsActive
                ? 'bg-zinc-200/70 text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100'
                : 'text-zinc-700 hover:bg-zinc-200/50 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-900/60 dark:hover:text-zinc-100'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <BookOpen className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
              <span>Standards</span>
            </div>
            {standardsOpen ? (
              <ChevronDown className="h-3.5 w-3.5 opacity-60" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5 opacity-60" />
            )}
          </button>

          {standardsOpen && (
            <div className="mt-1 ml-3.5 space-y-0.5 border-l border-zinc-200 pl-2.5 dark:border-zinc-800">
              {standardsChildren.map((child) => {
                const isActive = pathname === child.href || pathname.startsWith(child.href + '/');
                const ChildIcon = child.icon;

                return (
                  <Link
                    key={child.href}
                    href={child.href}
                    onClick={onCloseMobile}
                    className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-xs transition-colors ${
                      isActive
                        ? 'bg-zinc-900 font-semibold text-white dark:bg-zinc-100 dark:text-zinc-900'
                        : 'text-zinc-600 hover:bg-zinc-200/50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900/50 dark:hover:text-zinc-200'
                    }`}
                  >
                    <ChildIcon className={`h-3.5 w-3.5 ${isActive ? 'text-inherit' : 'opacity-70'}`} />
                    <span className="truncate">{child.name}</span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* 3. Projects Menu */}
        <Link
          href="/projects"
          onClick={onCloseMobile}
          className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-semibold transition-colors ${pathname.startsWith('/projects')
            ? 'bg-zinc-900 font-semibold text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-2xs'
            : 'text-zinc-700 hover:bg-zinc-200/50 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-900/60 dark:hover:text-zinc-100'
            }`}
        >
          <Briefcase className="h-4 w-4" />
          <span>Projects</span>
        </Link>

        {/* 4. Auth / Account Links */}
        <div className="pt-3">
          <div className="px-2 pb-1 text-[11px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
            Account & Workspace
          </div>

          {token && user ? (
            <div className="space-y-1">
              <Link
                href="/dashboard"
                onClick={onCloseMobile}
                className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-200/50 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-900/60 dark:hover:text-zinc-100 transition-colors"
              >
                <LayoutDashboard className="h-4 w-4" />
                <span>Dashboard Workspace</span>
              </Link>
              <button
                onClick={() => {
                  logout();
                  if (onCloseMobile) onCloseMobile();
                }}
                className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              onClick={onCloseMobile}
              className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-semibold transition-colors ${pathname.startsWith('/login')
                ? 'bg-zinc-900 font-semibold text-white dark:bg-zinc-100 dark:text-zinc-900'
                : 'text-zinc-700 hover:bg-zinc-200/50 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-900/60 dark:hover:text-zinc-100'
                }`}
            >
              <LogIn className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span>Login</span>
            </Link>
          )}
        </div>
      </nav>

      {/* Sidebar Footer User / Guest Card */}
      <div className="border-t border-zinc-200 p-3 dark:border-zinc-800">
        {token && user ? (
          <div className="flex items-center gap-2.5 rounded-lg border border-zinc-200 bg-white p-2.5 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 font-bold text-xs">
              <UserIcon className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-xs font-bold text-zinc-900 dark:text-zinc-100">
                {user.name || user.username}
              </div>
              <div className="truncate text-[10px] text-zinc-500 dark:text-zinc-400">
                Authenticated
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-zinc-200/80 bg-white/80 p-3 dark:border-zinc-800 dark:bg-zinc-900/40">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-semibold text-zinc-700 dark:text-zinc-300">
                Guest Mode
              </span>
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <p className="text-[10px] text-zinc-500 dark:text-zinc-400 leading-normal mb-2.5">
              Browsing public Software Engineering standards.
            </p>
            <Link
              href="/login"
              onClick={onCloseMobile}
              className="flex w-full items-center justify-center gap-1.5 rounded-md bg-zinc-900 px-2.5 py-1.5 text-xs font-medium text-white shadow-xs hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 transition-colors"
            >
              <LogIn className="h-3.5 w-3.5" />
              <span>Login</span>
            </Link>
          </div>
        )}
      </div>
    </aside>
  );
}

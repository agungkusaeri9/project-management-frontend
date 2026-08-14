'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Terminal,
  Home,
  TrendingUp,
  BookOpen,
  Layers,
  Code2,
  Network,
  Server,
  FileText,
  ShieldCheck,
  LayoutDashboard,
  LogIn,
  LogOut,
  User as UserIcon,
  ChevronDown,
  Menu,
  X,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Shield
} from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import { useAuthStore } from '@/store/auth.store';
import { useLogout } from '@/features/auth/hooks/use-logout';

interface PortalLayoutProps {
  children: React.ReactNode;
}

export function PortalLayout({ children }: PortalLayoutProps) {
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const logout = useLogout();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<'home' | 'standards' | 'user' | null>(null);

  // Close dropdown on click outside
  const navRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Close dropdown and mobile menu on pathname change
  useEffect(() => {
    setOpenDropdown(null);
    setMobileMenuOpen(false);
  }, [pathname]);

  const isHomeActive = pathname === '/' || pathname.startsWith('/progress');
  const isStandardsActive =
    pathname.startsWith('/technology') ||
    pathname.startsWith('/architecture') ||
    pathname.startsWith('/deployment') ||
    pathname.startsWith('/logging') ||
    pathname.startsWith('/security');

  const homeItems = [
    {
      name: 'Engineering Overview',
      href: '/',
      description: 'Standardization overview, project timelines & guidelines',
      icon: Home,
    },
    {
      name: 'Sprint & Task Progress',
      href: '/progress',
      description: 'Real-time Jira sprint status, backlog & KPI cards',
      icon: TrendingUp,
      badge: 'Live',
    },
  ];

  const standardItems = [
    {
      name: 'Technology Stack',
      href: '/technology',
      description: 'Standard approved tech for Backend, Frontend, Mobile & DB',
      icon: Layers,
    },
    {
      name: '.NET Relationship & Matrix',
      href: '/technology/dotnet',
      description: '.NET Core, Framework compatibility & guidelines',
      icon: Code2,
    },
    {
      name: 'Architecture Patterns',
      href: '/architecture',
      description: 'Clean Architecture, DDD, CQRS & API principles',
      icon: Network,
    },
    {
      name: 'Deployment & Infra',
      href: '/deployment',
      description: 'CI/CD pipeline, Docker, Kubernetes & environments',
      icon: Server,
    },
    {
      name: 'Logging Standards',
      href: '/logging',
      description: 'Serilog structured logging, format & log levels',
      icon: FileText,
    },
    {
      name: 'Security Standards',
      href: '/security',
      description: 'JWT authentication, OWASP rules & data protection',
      icon: ShieldCheck,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-zinc-950 font-sans text-zinc-900 dark:text-zinc-100 antialiased selection:bg-indigo-500 selection:text-white">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-zinc-200/80 bg-white/90 backdrop-blur-md dark:border-zinc-800/80 dark:bg-zinc-950/90 transition-colors">
        <div ref={navRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="group flex items-center gap-3 focus:outline-none"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 shadow-sm transition-transform group-hover:scale-105">
                <Terminal className="h-4.5 w-4.5" />
              </div>
              <div className="flex flex-col text-left leading-tight">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-extrabold uppercase tracking-wider text-zinc-900 dark:text-zinc-50">
                    TOHO Portal
                  </span>
                  <span className="rounded bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200/60 dark:border-indigo-800/50 px-1.5 py-0.2 text-[9px] font-mono font-bold text-indigo-600 dark:text-indigo-400">
                    v1.0
                  </span>
                </div>
                <span className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400">
                  Engineering Standards &amp; Projects
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Menus */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            
            {/* 1. Home Overview Dropdown */}
            <div className="relative">
              <button
                onClick={() => setOpenDropdown(openDropdown === 'home' ? null : 'home')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  isHomeActive
                    ? 'bg-zinc-100 dark:bg-zinc-800/80 text-zinc-900 dark:text-zinc-100 shadow-2xs'
                    : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100/70 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-900'
                }`}
              >
                <Home className="h-3.5 w-3.5 text-zinc-500 dark:text-zinc-400" />
                <span>Home Overview</span>
                <ChevronDown className={`h-3.5 w-3.5 text-zinc-400 transition-transform duration-200 ${openDropdown === 'home' ? 'rotate-180' : ''}`} />
              </button>

              {openDropdown === 'home' && (
                <div className="absolute left-0 mt-2 w-72 rounded-2xl border border-zinc-200/90 bg-white/95 dark:border-zinc-800 dark:bg-zinc-900/95 backdrop-blur-xl p-2 shadow-xl ring-1 ring-black/5 animate-in fade-in zoom-in-95 duration-150 z-50">
                  <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                    Overview Navigation
                  </div>
                  {homeItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setOpenDropdown(null)}
                        className={`flex items-start gap-3 rounded-xl p-2.5 transition-colors ${
                          isActive
                            ? 'bg-indigo-50 text-indigo-900 dark:bg-indigo-950/60 dark:text-indigo-200'
                            : 'hover:bg-zinc-100 dark:hover:bg-zinc-800/60 text-zinc-700 dark:text-zinc-300'
                        }`}
                      >
                        <div className={`mt-0.5 p-1.5 rounded-lg ${
                          isActive
                            ? 'bg-indigo-600 text-white dark:bg-indigo-500'
                            : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                        }`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold">{item.name}</span>
                            {item.badge && (
                              <span className="rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300 px-1.5 py-0.2 text-[9px] font-bold">
                                {item.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-1 mt-0.5">
                            {item.description}
                          </p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 2. Engineering Standards Dropdown */}
            <div className="relative">
              <button
                onClick={() => setOpenDropdown(openDropdown === 'standards' ? null : 'standards')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  isStandardsActive
                    ? 'bg-zinc-100 dark:bg-zinc-800/80 text-zinc-900 dark:text-zinc-100 shadow-2xs'
                    : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100/70 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-900'
                }`}
              >
                <BookOpen className="h-3.5 w-3.5 text-zinc-500 dark:text-zinc-400" />
                <span>Engineering Standards</span>
                <ChevronDown className={`h-3.5 w-3.5 text-zinc-400 transition-transform duration-200 ${openDropdown === 'standards' ? 'rotate-180' : ''}`} />
              </button>

              {openDropdown === 'standards' && (
                <div className="absolute left-0 mt-2 w-96 rounded-2xl border border-zinc-200/90 bg-white/95 dark:border-zinc-800 dark:bg-zinc-900/95 backdrop-blur-xl p-2.5 shadow-xl ring-1 ring-black/5 animate-in fade-in zoom-in-95 duration-150 z-50">
                  <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 flex items-center justify-between">
                    <span>Engineering Handbooks</span>
                    <span className="text-[10px] font-normal text-zinc-400">6 Modules</span>
                  </div>
                  <div className="grid grid-cols-1 gap-1 mt-1">
                    {standardItems.map((item) => {
                      const Icon = item.icon;
                      const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setOpenDropdown(null)}
                          className={`flex items-start gap-3 rounded-xl p-2 transition-colors ${
                            isActive
                              ? 'bg-indigo-50 text-indigo-900 dark:bg-indigo-950/60 dark:text-indigo-200'
                              : 'hover:bg-zinc-100 dark:hover:bg-zinc-800/60 text-zinc-700 dark:text-zinc-300'
                          }`}
                        >
                          <div className={`mt-0.5 p-1.5 rounded-lg ${
                            isActive
                              ? 'bg-indigo-600 text-white dark:bg-indigo-500'
                              : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                          }`}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="text-xs font-bold block">{item.name}</span>
                            <p className="text-[10px] text-zinc-500 dark:text-zinc-400 line-clamp-1 mt-0.5">
                              {item.description}
                            </p>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

          </nav>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <ThemeToggle />

            {token && user ? (
              <div className="relative">
                <button
                  onClick={() => setOpenDropdown(openDropdown === 'user' ? null : 'user')}
                  className="flex items-center gap-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-900/80 px-2.5 py-1.5 text-xs font-semibold text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors shadow-2xs"
                >
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300 font-bold text-[10px]">
                    <UserIcon className="h-3.5 w-3.5" />
                  </div>
                  <span className="max-w-[120px] truncate hidden sm:inline">{user.name || user.username}</span>
                  <ChevronDown className="h-3 w-3 text-zinc-400" />
                </button>

                {openDropdown === 'user' && (
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-zinc-200/90 bg-white/95 dark:border-zinc-800 dark:bg-zinc-900/95 backdrop-blur-xl p-1.5 shadow-xl ring-1 ring-black/5 animate-in fade-in zoom-in-95 duration-150 z-50">
                    <div className="px-3 py-2 border-b border-zinc-100 dark:border-zinc-800">
                      <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">{user.name || user.username}</p>
                      <p className="text-[10px] text-zinc-500 dark:text-zinc-400">Authenticated</p>
                    </div>
                    <div className="p-1 space-y-0.5">
                      <Link
                        href="/dashboard"
                        onClick={() => setOpenDropdown(null)}
                        className="flex items-center gap-2 rounded-xl px-2.5 py-2 text-xs font-semibold text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-950/50 transition-colors"
                      >
                        <LayoutDashboard className="h-3.5 w-3.5" />
                        <span>Dashboard Workspace</span>
                      </Link>
                      <button
                        onClick={() => {
                          setOpenDropdown(null);
                          logout();
                        }}
                        className="flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40 transition-colors"
                      >
                        <LogOut className="h-3.5 w-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 rounded-xl bg-zinc-900 px-3.5 py-2 text-xs font-semibold text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 transition-colors shadow-2xs"
              >
                <LogIn className="h-3.5 w-3.5" />
                <span>Login</span>
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-200 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-100 md:hidden transition-colors"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>

          </div>

        </div>

        {/* Mobile Navigation Drawer / Popdown */}
        {mobileMenuOpen && (
          <div className="border-t border-zinc-200/80 dark:border-zinc-800 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl md:hidden px-4 py-5 space-y-5 animate-in slide-in-from-top-2 duration-200">
            
            {/* Section: Overview */}
            <div className="space-y-1.5">
              <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 px-1">
                Overview & Progress
              </div>
              <div className="grid grid-cols-1 gap-1">
                {homeItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 rounded-xl p-2.5 text-xs font-semibold transition-colors ${
                        isActive
                          ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                          : 'text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="flex-1">{item.name}</span>
                      {item.badge && (
                        <span className="rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300 px-1.5 py-0.2 text-[9px] font-bold">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Section: Standards */}
            <div className="space-y-1.5">
              <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 px-1">
                Engineering Standards
              </div>
              <div className="grid grid-cols-1 gap-1">
                {standardItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 rounded-xl p-2.5 text-xs font-semibold transition-colors ${
                        isActive
                          ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                          : 'text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Section: Auth */}
            <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 space-y-2">
              {token && user ? (
                <>
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2 w-full rounded-xl bg-indigo-600 p-2.5 text-xs font-semibold text-white hover:bg-indigo-700 transition-colors shadow-2xs"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    <span>Go to Dashboard Workspace</span>
                  </Link>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      logout();
                    }}
                    className="flex items-center justify-center gap-2 w-full rounded-xl border border-red-200 dark:border-red-900/40 p-2 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sign Out</span>
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 w-full rounded-xl bg-zinc-900 p-2.5 text-xs font-semibold text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 transition-colors shadow-2xs"
                >
                  <LogIn className="h-4 w-4" />
                  <span>Login to Workspace</span>
                </Link>
              )}
            </div>

          </div>
        )}
      </header>

      {/* Main Centered Content Container */}
      <main className="flex-1 w-full max-w-7xl mx-auto">
        {children}
      </main>

      {/* Full-Width Footer */}
      <footer className="border-t border-zinc-200/80 bg-zinc-50/50 dark:border-zinc-800/80 dark:bg-zinc-950/50 py-8 px-4 sm:px-6 lg:px-8 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500 dark:text-zinc-400">
          <div className="flex items-center gap-2">
            <Terminal className="h-4 w-4 text-zinc-400" />
            <span className="font-semibold text-zinc-700 dark:text-zinc-300">PT. TOHO TECHNOLOGY INDONESIA</span>
            <span>&bull;</span>
            <span>Software Engineering Standards &copy; {new Date().getFullYear()}</span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <Link href="/" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
              Overview
            </Link>
            <Link href="/progress" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
              Sprint Progress
            </Link>
            <Link href="/technology" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
              Tech Stack
            </Link>
            <Link href="/architecture" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
              Architecture
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

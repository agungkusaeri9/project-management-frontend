'use client';

import { useState } from 'react';
import { useAuthStore } from '../../store/auth.store';
import { useLogout } from '../../features/auth/hooks/use-logout';
import { ThemeToggle } from '../theme-toggle';
import {
  LogOut, User as UserIcon, LayoutDashboard, Users, Briefcase,
  Database, ChevronDown, ChevronRight, AlertCircle, FileText, Zap, FileSpreadsheet
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

// ── Types ─────────────────────────────────────────────────────────
interface NavItem {
  name: string;
  href?: string;
  icon: React.ElementType;
  children?: { name: string; href: string }[];
}

// ── Sidebar nav item with optional dropdown ───────────────────────
function SidebarItem({ item, pathname }: { item: NavItem; pathname: string }) {
  const hasChildren = !!item.children?.length;
  const isChildActive = item.children?.some((c) => pathname.startsWith(c.href));
  const [open, setOpen] = useState(isChildActive ?? false);

  if (!hasChildren) {
    const isActive = item.href ? pathname.startsWith(item.href) : false;
    return (
      <Link
        href={item.href!}
        className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive
          ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-100'
          }`}
      >
        <item.icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`} />
        {item.name}
      </Link>
    );
  }

  // Dropdown group
  return (
    <div>
      <button
        onClick={() => setOpen((o) => !o)}
        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isChildActive
          ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-100'
          }`}
      >
        <item.icon className={`w-4 h-4 flex-shrink-0 ${isChildActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`} />
        <span className="flex-1 text-left">{item.name}</span>
        {open
          ? <ChevronDown className="w-3.5 h-3.5 flex-shrink-0 opacity-60" />
          : <ChevronRight className="w-3.5 h-3.5 flex-shrink-0 opacity-60" />}
      </button>

      {open && (
        <div className="mt-0.5 ml-6 pl-3 border-l border-slate-200 dark:border-slate-700 space-y-0.5">
          {item.children!.map((child) => {
            const isActive = pathname.startsWith(child.href);
            return (
              <Link
                key={child.href}
                href={child.href}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${isActive
                  ? 'text-indigo-600 dark:text-indigo-400 font-medium bg-indigo-50/50 dark:bg-indigo-500/10'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/50'
                  }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${isActive ? 'bg-indigo-500' : 'bg-slate-300 dark:bg-slate-600'}`} />
                {child.name}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Layout ────────────────────────────────────────────────────────
export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((state) => state.user);
  const logout = useLogout();
  const pathname = usePathname();

  const navigation: NavItem[] = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Projects', href: '/projects', icon: Briefcase },
    { name: 'Issues', href: '/issues', icon: AlertCircle },
    { name: 'Additional Features', href: '/additional-features', icon: Zap },
    { name: 'Minutes of Meeting', href: '/moms', icon: FileText },
    { name: 'Templates', href: '/templates', icon: FileSpreadsheet },
    {
      name: 'Master Data',
      icon: Database,
      children: [
        { name: 'Customers', href: '/customers' },
        { name: 'Users', href: '/users' },
      ],
    },
  ];

  // Determine current page title
  const currentTitle = (() => {
    for (const item of navigation) {
      if (item.href && pathname.startsWith(item.href)) return item.name;
      if (item.children) {
        const child = item.children.find((c) => pathname.startsWith(c.href));
        if (child) return child.name;
      }
    }
    return 'Overview';
  })();

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-all">
        <div className="h-16 flex items-center px-6 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
            <LayoutDashboard className="w-6 h-6" />
            <span className="font-bold text-base tracking-tight">Project Management</span>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navigation.map((item) => (
            <SidebarItem key={item.name} item={item} pathname={pathname} />
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 z-10">
          <h2 className="font-semibold text-slate-800 dark:text-slate-200">{currentTitle}</h2>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <div className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
              <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <UserIcon className="w-4 h-4" />
              </div>
              {user?.name || 'Admin User'}
            </div>
            <button
              onClick={logout}
              className="p-2 text-slate-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10 dark:hover:text-red-400 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>

        {/* Footer */}
        <footer className="py-4 px-6 border-t border-slate-200 dark:border-slate-800 text-sm text-center text-slate-500 dark:text-slate-400 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
          &copy; {new Date().getFullYear()} Project Management by Toho. All rights reserved.
        </footer>
      </div>
    </div>
  );
}

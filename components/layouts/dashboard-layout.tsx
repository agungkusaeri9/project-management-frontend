'use client';

import { useState } from 'react';
import { useAuthStore } from '../../store/auth.store';
import { useLogout } from '../../features/auth/hooks/use-logout';
import { ThemeToggle } from '../theme-toggle';
import {
  LogOut, User as UserIcon, LayoutDashboard, Users, Briefcase,
  Database, ChevronDown, ChevronRight, AlertCircle, FileText, Zap, Settings, Kanban, TrendingUp, GitBranch, FolderArchive, Container
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

interface NavSection {
  title?: string;
  items: NavItem[];
}

// ── Sidebar nav item with optional dropdown ───────────────────────
function SidebarItem({ item, pathname }: { item: NavItem; pathname: string }) {
  const hasChildren = !!item.children?.length;
  const isChildActive = item.children?.some((c) => pathname.startsWith(c.href));
  const [open, setOpen] = useState(isChildActive ?? false);

  if (!hasChildren) {
    const isActive = item.href === '/dashboard' ? pathname === '/dashboard' : (item.href ? pathname.startsWith(item.href) : false);
    return (
      <Link
        href={item.href!}
        className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${isActive
          ? 'bg-indigo-50 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 shadow-2xs'
          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-100'
          }`}
      >
        <item.icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`} />
        <span>{item.name}</span>
      </Link>
    );
  }

  // Dropdown group
  return (
    <div>
      <button
        onClick={() => setOpen((o) => !o)}
        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${isChildActive
          ? 'bg-indigo-50/70 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400'
          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-100'
          }`}
      >
        <item.icon className={`w-4 h-4 flex-shrink-0 ${isChildActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`} />
        <span className="flex-1 text-left">{item.name}</span>
        {open
          ? <ChevronDown className="w-3.5 h-3.5 flex-shrink-0 opacity-60 transition-transform" />
          : <ChevronRight className="w-3.5 h-3.5 flex-shrink-0 opacity-60 transition-transform" />}
      </button>

      {open && (
        <div className="mt-1 ml-5 pl-2.5 border-l-2 border-indigo-100 dark:border-indigo-950 space-y-1">
          {item.children!.map((child) => {
            const isActive = pathname.startsWith(child.href);
            return (
              <Link
                key={child.href}
                href={child.href}
                className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs transition-colors ${isActive
                  ? 'text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-50/70 dark:bg-indigo-500/10'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/40'
                  }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${isActive ? 'bg-indigo-500 ring-2 ring-indigo-200 dark:ring-indigo-900' : 'bg-slate-300 dark:bg-slate-600'}`} />
                <span>{child.name}</span>
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

  const navSections: NavSection[] = [
    {
      title: 'Overview',
      items: [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Progress Overview', href: '/dashboard/progress', icon: TrendingUp },
      ],
    },
    {
      title: 'Project Management',
      items: [
        { name: 'Projects', href: '/dashboard/projects', icon: Briefcase },
        { name: 'Issues', href: '/dashboard/issues', icon: AlertCircle },
        { name: 'Additional Features', href: '/dashboard/additional-features', icon: Zap },
        { name: 'Minutes of Meeting', href: '/dashboard/moms', icon: FileText },
        { name: 'File Management', href: '/dashboard/files', icon: FolderArchive },
      ],
    },
    {
      title: 'Integration',
      items: [
        {
          name: 'Jira',
          icon: Kanban,
          children: [
            { name: 'Jira Projects', href: '/dashboard/jira/projects' },
            { name: 'Konfigurasi Jira', href: '/dashboard/settings/jira' },
          ],
        },
        {
          name: 'GitHub',
          icon: GitBranch,
          children: [
            { name: 'Repositories', href: '/dashboard/github/repositories' },
            { name: 'Konfigurasi GitHub', href: '/dashboard/settings/github' },
          ],
        },
        {
          name: 'Docker',
          icon: Container,
          children: [
            { name: 'Containers', href: '/dashboard/docker/containers' },
            { name: 'Konfigurasi Docker', href: '/dashboard/settings/docker' },
          ],
        },
      ],
    },
    {
      title: 'Master Data',
      items: [
        {
          name: 'Master Data',
          icon: Database,
          children: [
            { name: 'Customers', href: '/dashboard/customers' },
            { name: 'Users', href: '/dashboard/users' },
          ],
        },
      ],
    },
    {
      title: 'Pengaturan',
      items: [
        { name: 'System Configs', href: '/dashboard/settings/configs', icon: Settings },
      ],
    },
  ];

  // Determine current page title
  const currentTitle = (() => {
    for (const section of navSections) {
      for (const item of section.items) {
        if (item.href && pathname.startsWith(item.href)) {
          if (item.href === '/dashboard' && pathname !== '/dashboard') continue;
          return item.name;
        }
        if (item.children) {
          const child = item.children.find((c) => pathname.startsWith(c.href));
          if (child) return child.name;
        }
      }
    }
    return 'Overview';
  })();

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-all">
        <div className="h-16 flex items-center px-5 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5 text-indigo-600 dark:text-indigo-400">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-xs">
              <LayoutDashboard className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-sm tracking-tight text-slate-900 dark:text-white block leading-tight">Project Management</span>
              <span className="text-[10px] text-slate-400 font-medium">Toho Workspace</span>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-4">
          {navSections.map((section, sIdx) => (
            <div key={sIdx} className="space-y-1">
              {section.title && (
                <div className="px-3 pt-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  {section.title}
                </div>
              )}
              <div className="space-y-0.5">
                {section.items.map((item) => (
                  <SidebarItem key={item.name} item={item} pathname={pathname} />
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Public Portal Switcher */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30">
          <Link
            href="/"
            className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-indigo-400 border border-slate-200/80 dark:border-slate-800 shadow-2xs transition-all"
          >
            <span>Portal Standar Engineering</span>
            <ChevronRight className="w-3.5 h-3.5 opacity-60" />
          </Link>
        </div>
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

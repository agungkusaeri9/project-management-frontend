'use client';

import Link from 'next/link';
import { Terminal, FolderKanban, BookOpen } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-200/80 bg-white/80 backdrop-blur-md dark:border-zinc-800/80 dark:bg-zinc-950/80">
      <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4 sm:px-6">
        {/* Left Side: Brand */}
        <Link
          href="/"
          className="group flex items-center gap-2.5 transition-opacity hover:opacity-90"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 shadow-xs">
            <Terminal className="h-4 w-4" />
          </div>
          <div className="flex flex-col text-left leading-tight">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Software Engineering
            </span>
            <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              Standardization
            </span>
          </div>
        </Link>

        {/* Right Side: Navigation & Theme Toggle */}
        <div className="flex items-center gap-1 sm:gap-3">
          <nav className="flex items-center gap-1 sm:gap-2">
            <Link
              href="/progress"
              className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-100 transition-colors"
            >
              <span>Progress</span>
            </Link>
            <Link
              href="/projects"
              className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-100 transition-colors"
            >
              <FolderKanban className="h-3.5 w-3.5" />
              <span>Projects</span>
            </Link>
            <Link
              href="/technology"
              className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-100 transition-colors"
            >
              <BookOpen className="h-3.5 w-3.5" />
              <span>Documentation</span>
            </Link>
          </nav>
          <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-800" />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}

'use client';

import Link from 'next/link';
import { ArrowRight, FileDown } from 'lucide-react';
import { type StandardCategory, iconMap } from '@/data/standards';
import { standardService } from '@/features/standard';

interface StandardCardProps {
  category: StandardCategory;
}

export function StandardCard({ category }: StandardCardProps) {
  const Icon = iconMap[category.iconKey];

  const pdfUrl =
    category.id === 'technology'
      ? standardService.getTechnologyPdfUrl()
      : category.id === 'architecture'
      ? standardService.getArchitecturePdfUrl()
      : null;

  return (
    <div className="group relative block w-full rounded-xl border border-zinc-200 bg-white p-5 sm:p-6 transition-all duration-200 hover:border-zinc-400 hover:bg-zinc-50/80 hover:shadow-xs dark:border-zinc-800 dark:bg-zinc-900/40 dark:hover:border-zinc-600 dark:hover:bg-zinc-900/80 focus-within:ring-2 focus-within:ring-zinc-950 dark:focus-within:ring-zinc-200">
      <div className="flex items-start gap-4">
        {/* Category Icon */}
        <Link
          href={category.href}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-zinc-200 bg-zinc-50 text-zinc-700 transition-colors group-hover:border-zinc-300 group-hover:bg-zinc-100 group-hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-800/70 dark:text-zinc-300 dark:group-hover:border-zinc-700 dark:group-hover:bg-zinc-800 dark:group-hover:text-zinc-100"
          tabIndex={-1}
        >
          {Icon ? <Icon className="h-5 w-5" /> : null}
        </Link>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <Link
              href={category.href}
              className="text-base font-semibold text-zinc-900 hover:underline sm:text-lg dark:text-zinc-100 focus:outline-none"
            >
              {category.title}
            </Link>

            <div className="flex items-center gap-2">
              {pdfUrl && (
                <a
                  href={pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 rounded-md border border-zinc-200 bg-zinc-50 px-2 py-1 text-[11px] font-medium text-zinc-700 hover:border-zinc-300 hover:bg-zinc-100 hover:text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700 dark:hover:text-white transition-colors"
                  title={`Export ${category.title} as PDF`}
                >
                  <FileDown className="h-3.5 w-3.5 text-zinc-500 dark:text-zinc-400" />
                  <span className="hidden sm:inline">Export PDF</span>
                </a>
              )}

              <Link
                href={category.href}
                className="text-zinc-400 group-hover:translate-x-1 group-hover:text-zinc-900 dark:text-zinc-500 dark:group-hover:text-zinc-100 transition-all duration-200 p-1"
                aria-label={`Go to ${category.title}`}
              >
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <Link href={category.href} className="block mt-1">
            <p className="text-xs sm:text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              {category.description}
            </p>
          </Link>

          {/* Tags / Metadata */}
          {category.tags && category.tags.length > 0 && (
            <div className="mt-3.5 flex flex-wrap items-center gap-1.5 sm:gap-2">
              {category.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center rounded-md border border-zinc-200/90 bg-zinc-50 px-2 py-0.5 text-[11px] font-medium text-zinc-600 transition-colors group-hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-800/50 dark:text-zinc-400 dark:group-hover:border-zinc-700"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

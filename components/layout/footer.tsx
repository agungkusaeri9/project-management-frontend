export function Footer() {
  return (
    <footer className="w-full border-t border-zinc-200/80 py-8 dark:border-zinc-800/80 mt-auto">
      <div className="mx-auto max-w-4xl px-4 text-center text-xs text-zinc-500 dark:text-zinc-400">
        <p className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
          <span className="font-medium text-zinc-700 dark:text-zinc-300">
            Software Engineering Technology Standardization Portal
          </span>
          <span className="text-zinc-300 dark:text-zinc-700 hidden sm:inline">•</span>
          <span>Internal Developer Platform</span>
        </p>
      </div>
    </footer>
  );
}

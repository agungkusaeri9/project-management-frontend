'use client';

import { useState, useEffect } from 'react';
import { Clock, Calendar } from 'lucide-react';

export function LiveClock() {
  const [time, setTime] = useState<string>('');
  const [date, setDate] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        })
      );
      setDate(
        now.toLocaleDateString('id-ID', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-zinc-200 bg-white/90 px-4 py-2.5 shadow-2xs dark:border-zinc-800 dark:bg-zinc-900/70">
      <div className="flex items-center gap-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
        <Calendar className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />
        <span>{date || 'Memuat tanggal...'}</span>
      </div>
      <div className="hidden sm:block h-3.5 w-px bg-zinc-200 dark:bg-zinc-800" />
      <div className="flex items-center gap-2 font-mono text-xs font-bold text-zinc-900 dark:text-zinc-100">
        <Clock className="h-4 w-4 text-emerald-600 dark:text-emerald-400 animate-pulse" />
        <span>{time || '--:--:--'} WIB</span>
      </div>
    </div>
  );
}

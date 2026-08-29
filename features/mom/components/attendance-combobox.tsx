'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import {
  Users,
  Building,
  User,
  Plus,
  X,
  Check,
  Search,
  ChevronDown,
  Briefcase
} from 'lucide-react';

export interface AttendanceSuggestion {
  id?: string;
  name: string;
  subtitle?: string;
  badge?: string;
}

interface AttendanceComboboxProps {
  label: string;
  badgeLabel?: string;
  description?: string;
  placeholder?: string;
  selectedNames: string[];
  onAdd: (name: string) => void;
  onRemove: (name: string) => void;
  suggestions: AttendanceSuggestion[];
  variant?: 'internal' | 'external';
  disabled?: boolean;
}

export function AttendanceCombobox({
  label,
  badgeLabel,
  description,
  placeholder = 'Ketik nama dan tekan Enter...',
  selectedNames,
  onAdd,
  onRemove,
  suggestions,
  variant = 'internal',
  disabled = false,
}: AttendanceComboboxProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredSuggestions = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) {
      // Show first 10 suggestions not yet selected
      return suggestions.filter((s) => !selectedNames.includes(s.name)).slice(0, 10);
    }
    return suggestions
      .filter((s) => {
        const matchName = s.name.toLowerCase().includes(q);
        const matchSub = s.subtitle?.toLowerCase().includes(q);
        const matchBadge = s.badge?.toLowerCase().includes(q);
        return (matchName || matchSub || matchBadge) && !selectedNames.includes(s.name);
      })
      .slice(0, 10);
  }, [query, suggestions, selectedNames]);

  const exactMatch = useMemo(() => {
    const q = query.toLowerCase().trim();
    return suggestions.find((s) => s.name.toLowerCase() === q);
  }, [query, suggestions]);

  const handleAdd = (nameToAdd: string) => {
    const clean = nameToAdd.trim();
    if (!clean) return;
    if (!selectedNames.includes(clean)) {
      onAdd(clean);
    }
    setQuery('');
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (query.trim()) {
        handleAdd(query.trim());
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const isInternal = variant === 'internal';

  return (
    <div className="space-y-2.5" ref={containerRef}>
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-bold ${
              isInternal
                ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
            }`}
          >
            {isInternal ? <Users className="w-3.5 h-3.5" /> : <Building className="w-3.5 h-3.5" />}
            {badgeLabel || (isInternal ? 'Internal Team' : 'External (Customer / Client)')}
          </span>
          <label className="text-xs font-semibold text-slate-800 dark:text-slate-200">
            {label}
          </label>
        </div>
        <span className="text-[11px] text-slate-400">
          {selectedNames.length} peserta terpilih
        </span>
      </div>

      {description && (
        <p className="text-[11px] text-slate-500 dark:text-slate-400">
          {description}
        </p>
      )}

      {/* Selected Tags / Chips */}
      {selectedNames.length > 0 && (
        <div className="flex flex-wrap gap-1.5 p-2 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
          {selectedNames.map((name) => {
            const suggestion = suggestions.find((s) => s.name === name);
            return (
              <span
                key={name}
                className={`inline-flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 rounded-lg text-xs font-medium border shadow-2xs transition-all animate-in fade-in zoom-in-95 ${
                  isInternal
                    ? 'bg-white dark:bg-slate-800 text-blue-950 dark:text-blue-200 border-blue-200/80 dark:border-blue-900/60'
                    : 'bg-white dark:bg-slate-800 text-emerald-950 dark:text-emerald-200 border-emerald-200/80 dark:border-emerald-900/60'
                }`}
              >
                {isInternal ? (
                  <User className="w-3 h-3 text-blue-600 dark:text-blue-400 shrink-0" />
                ) : (
                  <Briefcase className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                )}
                <span className="font-semibold">{name}</span>
                {suggestion?.badge && (
                  <span
                    className={`px-1.5 py-0.2 text-[9px] font-bold rounded ${
                      isInternal
                        ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300'
                        : 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300'
                    }`}
                  >
                    {suggestion.badge}
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => onRemove(name)}
                  className="p-0.5 rounded hover:bg-slate-200/60 dark:hover:bg-slate-700 text-slate-400 hover:text-red-500 transition-colors ml-0.5"
                  title="Hapus peserta"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            );
          })}
        </div>
      )}

      {/* Input & Dropdown */}
      <div className="relative">
        <div className="relative flex items-center">
          <Search className="absolute left-3 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            ref={inputRef}
            type="text"
            disabled={disabled}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              if (!isOpen) setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className={`w-full pl-9 pr-8 py-2.5 rounded-xl text-xs border bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all shadow-2xs ${
              isInternal
                ? 'border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-blue-500/20'
                : 'border-slate-200 dark:border-slate-700 focus:border-emerald-500 focus:ring-emerald-500/20'
            }`}
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="absolute right-2.5 p-1 text-slate-400 hover:text-slate-600 rounded"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : (
            <ChevronDown className="absolute right-3 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          )}
        </div>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute z-50 left-0 right-0 mt-1.5 max-h-60 overflow-y-auto rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg dark:border-slate-700 dark:bg-slate-900 animate-in fade-in slide-in-from-top-2">
            {/* Direct Create Option if query typed */}
            {query.trim() && !exactMatch && (
              <button
                type="button"
                onClick={() => handleAdd(query.trim())}
                className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-colors mb-1 ${
                  isInternal
                    ? 'bg-blue-50/80 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50'
                    : 'bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Plus className="w-3.5 h-3.5 shrink-0" />
                  <span>
                    Tambah baru: <span className="font-bold underline">"{query.trim()}"</span>
                  </span>
                </div>
                <span className="text-[10px] opacity-75 font-mono">Tekan Enter ↵</span>
              </button>
            )}

            {/* List of Suggestions */}
            {filteredSuggestions.length > 0 ? (
              <div className="space-y-0.5">
                <div className="px-2.5 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Pilihan Tersedia
                </div>
                {filteredSuggestions.map((item) => (
                  <button
                    key={item.id || item.name}
                    type="button"
                    onClick={() => handleAdd(item.name)}
                    className="w-full flex items-center justify-between gap-2 px-2.5 py-2 rounded-lg text-xs text-left hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                          isInternal
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300'
                            : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300'
                        }`}
                      >
                        {item.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="truncate">
                        <div className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                          {item.name}
                        </div>
                        {item.subtitle && (
                          <div className="text-[10px] text-slate-400 truncate">
                            {item.subtitle}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {item.badge && (
                        <span
                          className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                            isInternal
                              ? 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                              : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                      <Plus className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200" />
                    </div>
                  </button>
                ))}
              </div>
            ) : !query.trim() ? (
              <div className="px-3 py-3 text-center text-xs text-slate-400">
                Belum ada data peserta tersimpan. Ketik nama lalu tekan Enter untuk membuat baru.
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}

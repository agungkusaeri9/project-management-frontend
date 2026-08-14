'use client';

import { useState, useEffect } from 'react';
import {
  Sliders,
  Plus,
  Save,
  RefreshCw,
  Clock,
  Key,
} from 'lucide-react';
import { configService, SystemConfig } from '@/features/config/services/config.service';

export default function SystemConfigsPage() {
  const [configs, setConfigs] = useState<SystemConfig[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  // New config form
  const [newKey, setNewKey] = useState<string>('');
  const [newValue, setNewValue] = useState<string>('');
  const [newDesc, setNewDesc] = useState<string>('');

  const loadConfigs = async () => {
    try {
      setIsLoading(true);
      const data = await configService.getAll();
      setConfigs(data);
    } catch (err: unknown) {
      console.error('Failed to load system configs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;
    async function fetchData() {
      try {
        const data = await configService.getAll();
        if (!ignore) {
          setConfigs(data);
          setIsLoading(false);
        }
      } catch (err: unknown) {
        console.error('Failed to load system configs:', err);
        if (!ignore) setIsLoading(false);
      }
    }
    fetchData();
    return () => {
      ignore = true;
    };
  }, []);

  const handleAddConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKey.trim()) return;

    try {
      setIsSaving(true);
      await configService.set(newKey.trim(), newValue.trim(), newDesc.trim());
      setNewKey('');
      setNewValue('');
      setNewDesc('');
      await loadConfigs();
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err: unknown) {
      console.error('Failed to save config:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateValue = async (key: string, value: string, desc?: string) => {
    try {
      await configService.set(key, value, desc);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (err: unknown) {
      console.error('Failed to update config:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <RefreshCw className="h-4 w-4 animate-spin text-indigo-600" />
          <span>Memuat konfigurasi sistem dari database...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5 dark:border-slate-800">
        <div className="flex items-center gap-3.5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-xs">
            <Sliders className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Konfigurasi Sistem (Database Configs)
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Pengaturan parameter global berbasis Key & Value yang tersimpan di PostgreSQL table <code>system_configs</code>
            </p>
          </div>
        </div>

        <button
          onClick={loadConfigs}
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 transition-colors"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Add Config Form */}
      <form
        onSubmit={handleAddConfig}
        className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-2xs space-y-3"
      >
        <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
          <Plus className="h-4 w-4 text-indigo-600" />
          <span>Tambah Key Config Baru</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-4">
            <label className="block text-[11px] font-bold text-slate-500 mb-1">
              Config Key *
            </label>
            <input
              type="text"
              required
              value={newKey}
              onChange={(e) => setNewKey(e.target.value)}
              placeholder="cth: jira_host / app_title"
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-mono text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            />
          </div>

          <div className="sm:col-span-5">
            <label className="block text-[11px] font-bold text-slate-500 mb-1">
              Config Value *
            </label>
            <input
              type="text"
              required
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              placeholder="Nilai konfigurasi..."
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            />
          </div>

          <div className="sm:col-span-3">
            <label className="block text-[11px] font-bold text-slate-500 mb-1">
              Deskripsi
            </label>
            <input
              type="text"
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              placeholder="Deskripsi singkat..."
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            />
          </div>
        </div>

        <div className="flex justify-end pt-1">
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-1.5 text-xs font-bold text-white shadow-2xs hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            <Save className="h-3.5 w-3.5" />
            <span>{isSaving ? 'Menyimpan...' : 'Simpan Key'}</span>
          </button>
        </div>
      </form>

      {/* Configs Table */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
          <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            Daftar Key & Value di Database ({configs.length})
          </h2>
          {saveSuccess && (
            <span className="text-xs font-bold text-emerald-600">
              Perubahan tersimpan!
            </span>
          )}
        </div>

        {configs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase text-[10px]">
                  <th className="pb-2.5">Key</th>
                  <th className="pb-2.5">Value</th>
                  <th className="pb-2.5">Deskripsi</th>
                  <th className="pb-2.5">Terakhir Update</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {configs.map((cfg) => {
                  const isSecret = cfg.key.toLowerCase().includes('token') || cfg.key.toLowerCase().includes('secret') || cfg.key.toLowerCase().includes('password');

                  return (
                    <tr key={cfg.key} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30">
                      <td className="py-3 font-mono font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                        <Key className="h-3.5 w-3.5 text-slate-400" />
                        <span>{cfg.key}</span>
                      </td>
                      <td className="py-3 max-w-sm">
                        <input
                          type={isSecret ? 'password' : 'text'}
                          defaultValue={cfg.value}
                          onBlur={(e) => {
                            if (e.target.value !== cfg.value) {
                              handleUpdateValue(cfg.key, e.target.value, cfg.description);
                            }
                          }}
                          className="w-full rounded-lg border border-transparent hover:border-slate-300 focus:border-indigo-500 bg-transparent px-2 py-1 text-xs text-slate-900 focus:outline-none dark:hover:border-slate-700 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-950 font-mono"
                        />
                      </td>
                      <td className="py-3 text-slate-500">{cfg.description || '-'}</td>
                      <td className="py-3 text-slate-400 font-mono text-[11px]">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>
                            {cfg.updated_at ? new Date(cfg.updated_at).toLocaleString('id-ID') : '-'}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-10 text-center text-xs text-slate-400">
            Belum ada konfigurasi sistem di database.
          </div>
        )}
      </div>
    </div>
  );
}

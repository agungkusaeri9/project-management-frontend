'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Container,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Save,
  Server,
  ArrowRight,
  Info,
  ShieldCheck,
  Zap,
  Terminal,
  Activity,
  Check,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';
import { dockerService, DockerConfigData, DockerTestConnectionResponse } from '@/features/docker/services/docker.service';

export default function DockerSettingsPage() {
  const [host, setHost] = useState<string>('');
  const [isEnabled, setIsEnabled] = useState<boolean>(true);
  
  // Loading & Test states
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<DockerTestConnectionResponse | null>(null);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    setIsLoading(true);
    try {
      const data = await dockerService.getConfig();
      setHost(data.host || '');
      setIsEnabled(data.is_enabled);
    } catch (err: any) {
      console.error('Failed to load Docker config:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await dockerService.testConnection({ host: host.trim() });
      setTestResult(res);
      if (res.success) {
        toast.success(res.message || 'Berhasil terhubung ke Docker Engine!');
      } else {
        toast.error(res.message || 'Gagal terhubung ke Docker Engine');
      }
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message || 'Gagal melakukan tes koneksi';
      setTestResult({
        success: false,
        message: msg,
      });
      toast.error(msg);
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!host.trim()) {
      toast.error('Docker Host / Socket wajib diisi');
      return;
    }

    setIsSaving(true);
    try {
      await dockerService.saveConfig({
        host: host.trim(),
        api_version: 'v1.43',
        is_enabled: isEnabled,
      });
      toast.success('Konfigurasi Docker berhasil disimpan!');
    } catch (err: any) {
      toast.error(err.response?.data?.error || err.message || 'Gagal menyimpan konfigurasi');
    } finally {
      setIsSaving(false);
    }
  };

  const setPresetHost = (preset: string) => {
    setHost(preset);
    toast.info(`Preset diterapkan: ${preset}`);
  };

  return (
    <div className="space-y-8 font-sans max-w-5xl">
      
      {/* Header */}
      <div className="border-b border-slate-200 pb-5 dark:border-slate-800">
        <div className="flex items-center gap-2 mb-1">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-2.5 py-0.5 text-xs font-bold text-white dark:bg-slate-100 dark:text-slate-900">
            <Container className="h-3.5 w-3.5 text-sky-400" />
            <span>DevOps Integration</span>
          </span>
          <span className="rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-bold text-sky-800 dark:bg-sky-950/60 dark:text-sky-300">
            Docker Engine
          </span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Konfigurasi Docker Engine & Container Monitor
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Hubungkan aplikasi ke Docker Daemon lokal atau remote server untuk memantau status container, CPU/RAM, dan live logs.
        </p>
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSave} className="space-y-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-2xs dark:border-slate-800 dark:bg-slate-900 space-y-6">
          
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Koneksi Docker Daemon
              </h3>
              <p className="text-xs text-slate-500">
                Tentukan endpoint socket atau TCP port Docker Engine.
              </p>
            </div>

            <Link
              href="/dashboard/docker/containers"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/60 border border-sky-200/80 dark:border-sky-900/60 hover:bg-sky-100 transition-colors shadow-2xs"
            >
              <span>Buka Live Container Monitor</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Docker Host Input */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Docker Host / Socket Path <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={host}
              onChange={(e) => setHost(e.target.value)}
              placeholder="Contoh: npipe:////./pipe/docker_engine atau tcp://localhost:2375"
              required
              className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 px-4 py-3 text-xs font-mono text-slate-900 focus:border-sky-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
            />
            
            {/* Quick Preset Buttons */}
            <div className="flex items-center gap-2 pt-1 flex-wrap text-xs">
              <button
                type="button"
                onClick={() => setPresetHost('wsl:///var/run/docker.sock')}
                className="px-2.5 py-1 rounded-lg border border-sky-300 dark:border-sky-800 bg-sky-50 dark:bg-sky-950/60 text-[11px] font-mono text-sky-700 dark:text-sky-300 hover:border-sky-400 transition-colors font-bold"
              >
                WSL Linux Socket (wsl://)
              </button>
              <button
                type="button"
                onClick={() => setPresetHost('npipe:////./pipe/docker_engine')}
                className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-[11px] font-mono text-slate-700 dark:text-slate-300 hover:border-sky-400 transition-colors"
              >
                Windows Named Pipe
              </button>
              <button
                type="button"
                onClick={() => setPresetHost('unix:///var/run/docker.sock')}
                className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-[11px] font-mono text-slate-700 dark:text-slate-300 hover:border-sky-400 transition-colors"
              >
                Linux Native Socket
              </button>
              <button
                type="button"
                onClick={() => setPresetHost('tcp://localhost:2375')}
                className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-[11px] font-mono text-slate-700 dark:text-slate-300 hover:border-sky-400 transition-colors"
              >
                TCP Localhost (2375)
              </button>
            </div>
          </div>

          {/* Enable Toggle */}
          <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/40">
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                Aktifkan Container Monitoring
              </h4>
              <p className="text-[11px] text-slate-500">
                Izinkan sistem membaca status container dan metrik real-time.
              </p>
            </div>
            <input
              type="checkbox"
              checked={isEnabled}
              onChange={(e) => setIsEnabled(e.target.checked)}
              className="h-4 w-4 rounded text-sky-600 focus:ring-sky-500 cursor-pointer"
            />
          </div>

          {/* Test Connection Result Box */}
          {testResult && (
            <div
              className={`p-4 rounded-2xl border text-xs space-y-2 animate-in fade-in duration-200 ${
                testResult.success
                  ? 'border-emerald-200 bg-emerald-50/70 text-emerald-900 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-200'
                  : 'border-amber-200 bg-amber-50/70 text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-200'
              }`}
            >
              <div className="flex items-start gap-2.5">
                {testResult.success ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                )}
                <div className="space-y-1 flex-1">
                  <span className="font-bold block">{testResult.message}</span>
                  {testResult.error && (
                    <p className="font-mono text-[11px] opacity-80">{testResult.error}</p>
                  )}

                  {testResult.data?.version_info && (
                    <div className="mt-2 pt-2 border-t border-emerald-200/80 dark:border-emerald-900/60 grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-[11px]">
                      <div>
                        <span className="text-[10px] text-slate-500 block">Version:</span>
                        <span className="font-bold">{testResult.data.version_info.Version || '-'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">API Version:</span>
                        <span className="font-bold">{testResult.data.version_info.ApiVersion || '-'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">OS / Arch:</span>
                        <span className="font-bold">{testResult.data.version_info.Os}/{testResult.data.version_info.Arch}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">Go Version:</span>
                        <span className="font-bold">{testResult.data.version_info.GoVersion || '-'}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-between flex-wrap gap-3">
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={isTesting || !host.trim()}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-2xs disabled:opacity-50"
            >
              <Activity className={`h-3.5 w-3.5 ${isTesting ? 'animate-spin text-sky-600' : 'text-sky-500'}`} />
              <span>{isTesting ? 'Menguji Koneksi...' : 'Uji Koneksi (Test Ping)'}</span>
            </button>

            <button
              type="submit"
              disabled={isSaving || !host.trim()}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-sky-600 hover:bg-sky-700 text-xs font-bold text-white shadow-2xs transition-colors disabled:opacity-50"
            >
              {isSaving ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
              <span>{isSaving ? 'Menyimpan...' : 'Simpan Konfigurasi'}</span>
            </button>
          </div>

        </div>
      </form>

      {/* Guide Card */}
      <div className="rounded-3xl border border-slate-200 bg-slate-50/60 p-6 dark:border-slate-800 dark:bg-slate-900/40 space-y-4">
        <div className="flex items-center gap-2.5">
          <Info className="h-4 w-4 text-sky-500" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            Panduan Menghubungkan ke Docker Engine
          </h3>
        </div>

        <div className="space-y-3 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          <p>
            1. <strong>Windows (Docker Desktop)</strong>: Secara bawaan sistem menggunakan named pipe <code className="bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded font-mono text-slate-800 dark:text-slate-200">npipe:////./pipe/docker_engine</code>. Jika ingin menggunakan TCP, buka Docker Desktop &rarr; <em>Settings &rarr; General</em> &rarr; centang <em>&quot;Expose daemon on tcp://localhost:2375 without TLS&quot;</em>.
          </p>
          <p>
            2. <strong>Linux / VPS Server</strong>: Gunakan path socket default <code className="bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded font-mono text-slate-800 dark:text-slate-200">unix:///var/run/docker.sock</code>.
          </p>
          <p>
            3. <strong>Remote Server</strong>: Masukkan IP dan port Docker Host Anda, contoh <code className="bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded font-mono text-slate-800 dark:text-slate-200">http://192.168.1.100:2375</code>.
          </p>
        </div>
      </div>

    </div>
  );
}

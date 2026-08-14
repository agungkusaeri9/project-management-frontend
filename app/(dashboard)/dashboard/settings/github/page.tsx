'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Globe,
  Lock,
  User,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Save,
  Eye,
  EyeOff,
  GitBranch,
  ShieldAlert,
  Sparkles,
  Layers,
  ArrowRight
} from 'lucide-react';
import { toast } from 'sonner';
import { githubService, GithubUser } from '@/features/github/services/github.service';

export default function GithubSettingsPage() {
  const [token, setToken] = useState<string>('');
  const [showToken, setShowToken] = useState<boolean>(false);
  const [owner, setOwner] = useState<string>('');
  const [apiURL, setApiURL] = useState<string>('https://api.github.com');
  const [hasToken, setHasToken] = useState<boolean>(false);
  const [maskedToken, setMaskedToken] = useState<string>('');

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    user?: GithubUser;
    target_owner?: Record<string, any>;
  } | null>(null);

  // Load config on mount
  useEffect(() => {
    let ignore = false;
    async function loadConfig() {
      try {
        const data = await githubService.getConfig();
        if (!ignore && data) {
          setOwner(data.owner || '');
          setApiURL(data.api_url || 'https://api.github.com');
          setHasToken(data.has_token);
          setMaskedToken(data.token || '');
        }
      } catch (err: unknown) {
        console.error('Failed to load GitHub config:', err);
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }

    loadConfig();
    return () => {
      ignore = true;
    };
  }, []);

  const handleSaveConfig = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      await githubService.saveConfig({
        token: token.trim() || undefined,
        owner: owner.trim(),
        api_url: apiURL.trim() || 'https://api.github.com',
      });

      setSaveSuccess(true);
      if (token.trim()) {
        setHasToken(true);
        setMaskedToken(token.slice(0, 4) + '••••••••' + token.slice(-4));
        setToken('');
      }
      toast.success('Konfigurasi GitHub berhasil disimpan ke database!');
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal menyimpan konfigurasi GitHub';
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);

    try {
      const res = await githubService.testConnection({
        token: token.trim() || undefined,
        owner: owner.trim() || undefined,
        api_url: apiURL.trim() || 'https://api.github.com',
      });

      if (res.success) {
        setTestResult({
          success: true,
          message: res.message || 'Koneksi ke GitHub API berhasil!',
          user: res.data?.authenticated_user,
          target_owner: res.data?.target_owner,
          oauth_scopes: res.data?.oauth_scopes,
          has_repo_scope: res.data?.has_repo_scope,
        } as any);
        toast.success('Koneksi ke GitHub API berhasil!');
      } else {
        setTestResult({
          success: false,
          message: res.error || 'Koneksi gagal. Periksa token Anda.',
        });
        toast.error(res.error || 'Koneksi gagal');
      }
    } catch (err: any) {
      const errMsg = err.response?.data?.error || err.message || 'Gagal menguji koneksi ke GitHub';
      setTestResult({
        success: false,
        message: errMsg,
      });
      toast.error(errMsg);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="space-y-8 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-2.5 py-0.5 text-xs font-bold text-white dark:bg-slate-100 dark:text-slate-900">
              <GitBranch className="h-3.5 w-3.5" />
              <span>GitHub Integration</span>
            </span>
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
              Live Direct API
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Konfigurasi Integrasi GitHub
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Kelola kredensial Personal Access Token (PAT) GitHub untuk mengambil repository, branch, dan commit secara real-time.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/github/repositories"
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-2xs hover:bg-indigo-700 transition-colors"
          >
            <Layers className="h-4 w-4" />
            <span>Lihat Repositories</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-24">
          <div className="flex flex-col items-center gap-3 text-slate-400">
            <RefreshCw className="h-8 w-8 animate-spin text-indigo-600" />
            <span className="text-sm font-medium">Memuat konfigurasi GitHub...</span>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form (2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            <form onSubmit={handleSaveConfig} className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-6">
              
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Lock className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  Kredensial Autentikasi GitHub
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Gunakan Personal Access Token (PAT) GitHub untuk mengautentikasi request ke GitHub API.
                </p>
              </div>

              {/* Personal Access Token Field */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                    GitHub Personal Access Token (PAT) <span className="text-red-500">*</span>
                  </label>
                  {hasToken && (
                    <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Token Tersimpan ({maskedToken})
                    </span>
                  )}
                </div>

                <div className="relative">
                  <input
                    type={showToken ? 'text' : 'password'}
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    placeholder={hasToken ? 'Ketik token baru jika ingin mengganti...' : 'ghp_xxxxxxxxxxxxxxxxxxxx atau github_pat_xxxx'}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-2.5 pr-10 text-xs text-slate-900 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-100 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowToken(!showToken)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-slate-400">
                  Dibutuhkan izin scope: <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded font-mono text-[10px]">repo</code> (Full control of private repositories) dan <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded font-mono text-[10px]">read:org</code>.
                </p>
              </div>

              {/* Owner / Org Field */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Target Organization atau Username
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={owner}
                    onChange={(e) => setOwner(e.target.value)}
                    placeholder="Contoh: agungkusaeri9 atau nama organisasi GitHub"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/60 pl-10 pr-3.5 py-2.5 text-xs text-slate-900 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-100"
                  />
                </div>
                <p className="text-[11px] text-slate-400">
                  Kosongkan jika ingin mengambil seluruh repository milik akun yang terautentikasi secara otomatis.
                </p>
              </div>

              {/* API Base URL Field */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  GitHub API Base URL
                </label>
                <div className="relative">
                  <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={apiURL}
                    onChange={(e) => setApiURL(e.target.value)}
                    placeholder="https://api.github.com"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/60 pl-10 pr-3.5 py-2.5 text-xs text-slate-900 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-100 font-mono"
                  />
                </div>
                <p className="text-[11px] text-slate-400">
                  Gunakan <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded font-mono text-[10px]">https://api.github.com</code> untuk GitHub publik atau URL GitHub Enterprise Server Anda.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={isTesting || (!token && !hasToken)}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-colors disabled:opacity-50 shadow-2xs"
                >
                  {isTesting ? <RefreshCw className="h-4 w-4 animate-spin text-indigo-600" /> : <Sparkles className="h-4 w-4 text-amber-500" />}
                  <span>{isTesting ? 'Menguji Koneksi...' : 'Tes Koneksi GitHub'}</span>
                </button>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 px-5 py-2.5 text-xs font-bold text-white shadow-2xs transition-colors disabled:opacity-50"
                >
                  {isSaving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  <span>{isSaving ? 'Menyimpan...' : 'Simpan Konfigurasi'}</span>
                </button>
              </div>

            </form>

            {/* Test Result Live Banner */}
            {testResult && (
              <div className={`rounded-2xl border p-5 transition-all ${
                testResult.success
                  ? 'border-emerald-200 bg-emerald-50/70 text-emerald-950 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-200'
                  : 'border-red-200 bg-red-50/70 text-red-950 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-200'
              }`}>
                <div className="flex items-start gap-3.5">
                  {testResult.success ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xs font-bold uppercase tracking-wider">
                      {testResult.success ? 'Koneksi GitHub Terverifikasi' : 'Koneksi Gagal'}
                    </h3>
                    <p className="text-xs mt-1 leading-relaxed">
                      {testResult.message}
                    </p>

                    {testResult.user && (
                      <div className="mt-3.5 p-3 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-emerald-200/60 dark:border-emerald-900/40 flex items-center justify-between flex-wrap gap-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={testResult.user.avatar_url}
                            alt={testResult.user.login}
                            className="h-9 w-9 rounded-full ring-2 ring-emerald-500/30"
                          />
                          <div>
                            <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                              <span>{testResult.user.name || testResult.user.login}</span>
                              <span className="text-[10px] font-mono text-slate-500">(@{testResult.user.login})</span>
                            </div>
                            <div className="text-[10px] text-slate-500 dark:text-slate-400">
                              Public Repos: {testResult.user.public_repos} &bull; Private Repos: {testResult.user.total_private_repos ?? '-'}
                            </div>
                          </div>
                        </div>

                        <a
                          href={testResult.user.html_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                        >
                          <span>Buka Profil</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    )}

                    {/* Scopes Information */}
                    {(testResult as any).oauth_scopes !== undefined && (
                      <div className="mt-3 p-3 rounded-xl bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 text-[11px] space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-slate-700 dark:text-slate-300">Izin Token (Scopes):</span>
                          <span className="font-mono text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-[10px]">
                            {(testResult as any).oauth_scopes || '(Tidak ada scope khusus / read-only public)'}
                          </span>
                        </div>
                        {!(testResult as any).has_repo_scope && (
                          <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 text-amber-900 dark:text-amber-200 flex items-start gap-2">
                            <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                            <span>
                              <strong>Perhatian:</strong> Token Anda belum memiliki izin <code>repo</code>. Repositori <strong>Private</strong> tidak akan muncul sebelum Anda mencentang izin <code>repo</code> pada Personal Access Token di GitHub.
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar Guide (1 col) */}
          <div className="space-y-6">
            
            {/* Guide Card */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50/50 p-6 dark:border-slate-800 dark:bg-slate-900/50 space-y-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                  <GitBranch className="h-4 w-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Panduan Token GitHub
                </h3>
              </div>

              <div className="space-y-3 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                <p>
                  1. Masuk ke akun GitHub Anda, lalu buka menu <strong>Settings &rarr; Developer Settings</strong>.
                </p>
                <p>
                  2. Pilih <strong>Personal Access Tokens &rarr; Tokens (classic)</strong> dan klik <em>Generate new token (classic)</em>.
                </p>
                <p>
                  3. Berikan centang pada izin scope berikut:
                </p>
                <ul className="list-disc list-inside space-y-1 text-slate-700 dark:text-slate-300 font-medium pl-1">
                  <li><code className="bg-white dark:bg-slate-800 px-1 py-0.5 rounded font-mono text-[11px]">repo</code> (Wajib untuk repo private)</li>
                  <li><code className="bg-white dark:bg-slate-800 px-1 py-0.5 rounded font-mono text-[11px]">read:org</code> (Untuk membaca repositori organisasi)</li>
                  <li><code className="bg-white dark:bg-slate-800 px-1 py-0.5 rounded font-mono text-[11px]">user:email</code> (Opsional)</li>
                </ul>
                <p>
                  4. Salin token yang dihasilkan dan tempelkan ke kolom form di sebelah kiri.
                </p>
              </div>

              <a
                href="https://github.com/settings/tokens/new"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-1.5 w-full rounded-xl bg-slate-900 dark:bg-slate-100 px-4 py-2.5 text-xs font-bold text-white dark:text-slate-900 hover:opacity-90 transition-opacity shadow-2xs"
              >
                <span>Buat Token di GitHub</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>

            {/* Quick Access Card */}
            <div className="rounded-3xl border border-indigo-100 bg-indigo-50/40 p-6 dark:border-indigo-950/60 dark:bg-indigo-950/20 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-900 dark:text-indigo-300">
                Fitur Live Repositories
              </h4>
              <p className="text-xs text-indigo-950/70 dark:text-indigo-300/70 leading-relaxed">
                Setelah token tersimpan, Anda dapat langsung melihat daftar seluruh repository, filter berdasarkan bahasa/visibilitas, dan melihat statistik stars serta forks secara real-time.
              </p>
              <Link
                href="/dashboard/github/repositories"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-700 dark:text-indigo-400 hover:underline pt-1"
              >
                <span>Buka Daftar Repositories &rarr;</span>
              </Link>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

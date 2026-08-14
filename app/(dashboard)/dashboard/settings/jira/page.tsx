'use client';

import { useState, useEffect } from 'react';
import {
  Globe,
  Mail,
  Lock,
  Tag,
  Radio,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Copy,
  Check,
  Clock,
  Sparkles,
  Save,
} from 'lucide-react';
import { jiraService } from '@/features/jira/services/jira.service';

export default function JiraSettingsPage() {
  const [host, setHost] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [apiToken, setApiToken] = useState<string>('');
  const [projectKey, setProjectKey] = useState<string>('');
  const [jql, setJql] = useState<string>('');
  const [autoSync, setAutoSync] = useState<boolean>(false);
  const [syncIntervalMinutes, setSyncIntervalMinutes] = useState<number>(60);
  const [hasToken, setHasToken] = useState<boolean>(false);
  const [maskedToken, setMaskedToken] = useState<string>('');

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [copiedWebhook, setCopiedWebhook] = useState<boolean>(false);

  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    user?: string;
  } | null>(null);

  // Load config from backend DB on mount
  useEffect(() => {
    let ignore = false;
    async function loadConfig() {
      try {
        const data = await jiraService.getConfig();
        if (!ignore && data) {
          setHost(data.host || '');
          setEmail(data.email || '');
          setProjectKey(data.project_key || '');
          setJql(data.jql || '');
          setAutoSync(data.auto_sync === 'true');
          if (data.sync_interval_minutes) {
            const parsed = parseInt(data.sync_interval_minutes, 10);
            setSyncIntervalMinutes(isNaN(parsed) || parsed <= 0 ? 60 : parsed);
          }
          setHasToken(data.has_token);
          setMaskedToken(data.masked_api_token || '');
        }
      } catch (err: unknown) {
        console.error('Failed to load Jira config from database:', err);
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
      await jiraService.saveConfig({
        host: host.trim(),
        email: email.trim(),
        api_token: apiToken.trim() || undefined,
        project_key: projectKey.trim(),
        jql: jql.trim(),
        auto_sync: autoSync ? 'true' : 'false',
        sync_interval_minutes: String(syncIntervalMinutes),
      });

      setSaveSuccess(true);
      if (apiToken.trim()) {
        setHasToken(true);
        setMaskedToken(apiToken.slice(0, 3) + '••••••••' + apiToken.slice(-3));
        setApiToken('');
      }
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal menyimpan konfigurasi ke database';
      setTestResult({ success: false, message: msg });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSyncIssues = async () => {
    setIsSyncing(true);

    try {
      const res = await jiraService.syncIssues({
        host: host.trim() || undefined,
        email: email.trim() || undefined,
        api_token: apiToken.trim() || undefined,
        project_key: projectKey.trim() || undefined,
        jql: jql.trim() || undefined,
        auto_save: true,
      });

      const list = res.data.issues || [];

      setTestResult({
        success: true,
        message: `Berhasil menarik ${list.length} tiket dari Jira ke sistem!`,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal sinkronisasi tiket dari Jira';
      setTestResult({ success: false, message: msg });
    } finally {
      setIsSyncing(false);
    }
  };

  const webhookUrl = 'http://localhost:8081/jira/webhook';

  const copyWebhook = () => {
    navigator.clipboard.writeText(webhookUrl);
    setCopiedWebhook(true);
    setTimeout(() => setCopiedWebhook(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <RefreshCw className="h-4 w-4 animate-spin text-indigo-600" />
          <span>Memuat konfigurasi Jira dari database...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5 dark:border-slate-800">
        <div className="flex items-center gap-3.5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-xs">
            <svg className="h-7 w-7" viewBox="0 0 24 24" fill="currentColor">
              <path
                d="M11.53 2c0 2.4-1.97 4.35-4.4 4.35H2.8a.8.8 0 0 0-.8.8v4.33c0 2.4 1.97 4.35 4.4 4.35h4.33a.8.8 0 0 0 .8-.8V2z"
                opacity="0.6"
              />
              <path
                d="M11.53 10.68c0 2.4-1.97 4.35-4.4 4.35H2.8a.8.8 0 0 0-.8.8V20.2c0 2.4 1.97 4.35 4.4 4.35h4.33a.8.8 0 0 0 .8-.8V10.68z"
                opacity="0.8"
              />
              <path d="M21.2 2c-2.4 0-4.35 1.95-4.35 4.35v4.33c0 .44.36.8.8.8h4.33c2.4 0 4.35-1.95 4.35-4.35V2h-5.13z" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                Konfigurasi Atlassian Jira
              </h1>
              <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-bold text-blue-800 dark:bg-blue-950/60 dark:text-blue-300">
                Database Stored
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Pengaturan kredensial koneksi Jira yang tersimpan aman di database backend PostgreSQL
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSyncIssues}
            disabled={isSyncing}
            className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-2xs hover:bg-blue-700 transition-colors"
          >
            <Sparkles className={`h-3.5 w-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Menyinkronkan...' : 'Sinkronkan Tiket Sekarang'}</span>
          </button>
        </div>
      </div>

      {/* Status Banner */}
      {testResult && (
        <div
          className={`flex items-start gap-2.5 rounded-2xl border p-4 text-xs ${testResult.success
              ? 'border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-950/60 dark:bg-emerald-950/30 dark:text-emerald-300'
              : 'border-red-200 bg-red-50 text-red-900 dark:border-red-950/60 dark:bg-red-950/30 dark:text-red-300'
            }`}
        >
          {testResult.success ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
          )}
          <div className="leading-relaxed font-medium">{testResult.message}</div>
        </div>
      )}

      {/* Main Grid: Form & Webhook */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form Konfigurasi Database (7 cols) */}
        <div className="lg:col-span-7">
          <form
            onSubmit={handleSaveConfig}
            className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-2xs space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Lock className="h-4 w-4 text-blue-600" />
                <span>Kredensial & Filter Jira (Tersimpan di DB)</span>
              </h2>
              {saveSuccess && (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  <Check className="h-3.5 w-3.5" />
                  <span>Tersimpan ke Database!</span>
                </span>
              )}
            </div>

            {/* Jira Host URL */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                <Globe className="h-3.5 w-3.5 text-blue-600" />
                <span>Jira Host / Domain URL *</span>
              </label>
              <input
                type="text"
                required
                value={host}
                onChange={(e) => setHost(e.target.value)}
                placeholder="https://perusahaan-anda.atlassian.net"
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-mono text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                URL workspace Jira Atlassian perusahaan Anda
              </span>
            </div>

            {/* User Email */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-blue-600" />
                <span>Email Akun Atlassian *</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="engineer@tohotec-id.com"
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              />
            </div>

            {/* API Token */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Lock className="h-3.5 w-3.5 text-blue-600" />
                  <span>Jira API Token {hasToken ? '(Sudah Tersimpan di DB)' : '*'}</span>
                </label>
                <a
                  href="https://id.atlassian.com/manage-profile/security/api-tokens"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] font-bold text-blue-600 hover:underline flex items-center gap-0.5"
                >
                  <span>Buat Token Baru</span>
                  <ExternalLink className="h-2.5 w-2.5" />
                </a>
              </div>
              <input
                type="password"
                value={apiToken}
                onChange={(e) => setApiToken(e.target.value)}
                placeholder={hasToken ? `Tersimpan: ${maskedToken} (Kosongkan jika tidak diubah)` : 'Paste API Token Jira di sini...'}
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-mono text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              />
            </div>

            {/* Project Key & JQL */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                  <Tag className="h-3.5 w-3.5 text-slate-500" />
                  <span>Default Project Key</span>
                </label>
                <input
                  type="text"
                  value={projectKey}
                  onChange={(e) => setProjectKey(e.target.value)}
                  placeholder="cth: TOHO"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-mono text-slate-900 uppercase placeholder:text-slate-400 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                  <Radio className="h-3.5 w-3.5 text-slate-500" />
                  <span>Custom JQL Query</span>
                </label>
                <input
                  type="text"
                  value={jql}
                  onChange={(e) => setJql(e.target.value)}
                  placeholder="ORDER BY created DESC"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-mono text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                />
              </div>
            </div>

            {/* Auto Sync Toggle & Dynamic Interval */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                    <span>Sinkronisasi Otomatis Berkala (Background Service)</span>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Menjalankan background worker untuk sinkronisasi Jira ke PostgreSQL
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={autoSync}
                  onChange={(e) => setAutoSync(e.target.checked)}
                  className="h-4 w-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
              </div>

              {autoSync && (
                <div className="rounded-2xl border border-indigo-100 bg-indigo-50/50 dark:border-indigo-950/80 dark:bg-indigo-950/20 p-4 space-y-3 animate-in fade-in slide-in-from-top-1">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                      <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                        Interval Sinkronisasi Background (Menit):
                      </label>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        Durasi jeda antar sinkronisasi otomatis
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={1}
                        max={1440}
                        value={syncIntervalMinutes}
                        onChange={(e) => setSyncIntervalMinutes(Math.max(1, parseInt(e.target.value, 10) || 1))}
                        className="w-24 rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-mono font-bold text-slate-900 text-center focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 shadow-2xs"
                      />
                      <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Menit</span>
                    </div>
                  </div>

                  {/* Quick Presets */}
                  <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                    <span className="text-[10px] text-slate-400 font-bold mr-1">Preset:</span>
                    {[
                      { label: '15 Menit', val: 15 },
                      { label: '30 Menit', val: 30 },
                      { label: '1 Jam (60 mnt)', val: 60 },
                      { label: '2 Jam (120 mnt)', val: 120 },
                      { label: '6 Jam (360 mnt)', val: 360 },
                    ].map((preset) => (
                      <button
                        key={preset.val}
                        type="button"
                        onClick={() => setSyncIntervalMinutes(preset.val)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                          syncIntervalMinutes === preset.val
                            ? 'bg-indigo-600 text-white shadow-xs'
                            : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>

                  <div className="text-[11px] text-indigo-900/80 dark:text-indigo-300/80 leading-relaxed pt-1 border-t border-indigo-100/60 dark:border-indigo-900/40">
                    💡 Background service akan otomatis menyinkronkan seluruh project, sprint, issue, dan backlog Jira ke PostgreSQL setiap <strong>{syncIntervalMinutes} menit</strong> tanpa membebani browser atau request user.
                  </div>
                </div>
              )}
            </div>

            {/* Save Button */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white shadow-2xs hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200 transition-colors"
              >
                <Save className="h-4 w-4" />
                <span>{isSaving ? 'Menyimpan ke Database...' : 'Simpan Konfigurasi ke Database'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Webhook Setup & Information (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-2xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-blue-600" />
              <span>Real-Time Webhook Listener</span>
            </h3>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Jira akan mengirimkan payload ke endpoint backend setiap ada perubahan status issue oleh developer:
            </p>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">
                URL Webhook Backend (POST):
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={webhookUrl}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-mono text-slate-800 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
                />
                <button
                  type="button"
                  onClick={copyWebhook}
                  className="inline-flex items-center gap-1 rounded-xl bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 shrink-0 shadow-2xs transition-colors"
                >
                  {copiedWebhook ? (
                    <>
                      <Check className="h-3 w-3 text-emerald-400" />
                      <span>Salin</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3.5 text-[11px] text-slate-600 dark:border-slate-800 dark:bg-slate-950/50 dark:text-slate-400 space-y-1">
              <div className="font-bold text-slate-800 dark:text-slate-200">
                Cara Registrasi di Jira:
              </div>
              <div>1. Buka <strong>Jira Settings ⚙️ &rarr; System &rarr; Webhooks</strong>.</div>
              <div>2. Klik <strong>Create a Webhook</strong>, isi URL di atas.</div>
              <div>3. Centang event <code>Issue: created, updated, deleted</code>.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

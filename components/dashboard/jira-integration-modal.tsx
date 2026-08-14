'use client';

import { useState } from 'react';
import {
  X,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  Lock,
  Mail,
  Globe,
  Radio,
  Copy,
  Check,
  Tag,
  Clock,
  Sparkles,
} from 'lucide-react';
import { jiraService, JiraCredentials, SyncedJiraIssue } from '@/features/jira/services/jira.service';

interface JiraIntegrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSyncComplete?: (issues: SyncedJiraIssue[]) => void;
}

export function JiraIntegrationModal({
  isOpen,
  onClose,
  onSyncComplete,
}: JiraIntegrationModalProps) {
  const [activeTab, setActiveTab] = useState<'connect' | 'issues' | 'webhook'>('connect');

  // Load initial credentials helper
  const getSavedCreds = () => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('toho_jira_creds');
        if (saved) return JSON.parse(saved);
      } catch {
        // ignore
      }
    }
    return null;
  };

  // Credentials State (Initialized from localStorage)
  const [host, setHost] = useState<string>(() => getSavedCreds()?.host || '');
  const [email, setEmail] = useState<string>(() => getSavedCreds()?.email || '');
  const [apiToken, setApiToken] = useState<string>(() => getSavedCreds()?.api_token || getSavedCreds()?.apiToken || '');
  const [projectKey, setProjectKey] = useState<string>(() => getSavedCreds()?.projectKey || '');
  const [jql, setJql] = useState<string>(() => getSavedCreds()?.jql || '');
  const [showToken, setShowToken] = useState<boolean>(false);

  // Status & Loading states
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; user?: string } | null>(null);
  const [syncedIssues, setSyncedIssues] = useState<SyncedJiraIssue[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('toho_jira_synced_issues');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) return parsed;
        } catch {
          // ignore
        }
      }
    }
    return [];
  });
  const [copiedWebhook, setCopiedWebhook] = useState<boolean>(false);

  if (!isOpen) return null;

  const saveCredsToLocal = (creds: JiraCredentials & { projectKey?: string; jql?: string }) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('toho_jira_creds', JSON.stringify(creds));
    }
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);

    try {
      const res = await jiraService.testConnection({
        host: host.trim() || undefined,
        email: email.trim() || undefined,
        api_token: apiToken.trim() || undefined,
      });

      // Save to DB if fields are filled
      if (host.trim() && email.trim()) {
        await jiraService.saveConfig({
          host: host.trim(),
          email: email.trim(),
          api_token: apiToken.trim() || undefined,
          project_key: projectKey.trim(),
          jql: jql.trim(),
        });
      }

      saveCredsToLocal({ host, email, api_token: apiToken, projectKey, jql });

      setTestResult({
        success: true,
        message: `Terhubung sebagai: ${res.data.displayName} (${res.data.emailAddress || email})`,
        user: res.data.displayName,
      });
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Gagal terhubung ke server Jira. Periksa Host, Email, dan API Token Anda.';
      setTestResult({
        success: false,
        message: errorMessage,
      });
    } finally {
      setIsTesting(false);
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

      const issuesList = res.data.issues || [];
      setSyncedIssues(issuesList);

      if (typeof window !== 'undefined') {
        localStorage.setItem('toho_jira_synced_issues', JSON.stringify(issuesList));
      }

      saveCredsToLocal({ host, email, api_token: apiToken, projectKey, jql });

      if (onSyncComplete) {
        onSyncComplete(issuesList);
      }

      setActiveTab('issues');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Gagal sinkronisasi dengan Jira';
      setTestResult({
        success: false,
        message: errorMessage,
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const webhookUrl = 'http://localhost:8081/jira/webhook';

  const copyWebhookUrl = () => {
    navigator.clipboard.writeText(webhookUrl);
    setCopiedWebhook(true);
    setTimeout(() => setCopiedWebhook(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/70 backdrop-blur-xs">
      <div className="flex flex-col w-full max-w-3xl max-h-[90vh] rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Topbar */}
        <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-950/40">
          <div className="flex items-center gap-3">
            {/* Jira SVG Logo */}
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs">
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M11.53 2c0 2.4-1.97 4.35-4.4 4.35H2.8a.8.8 0 0 0-.8.8v4.33c0 2.4 1.97 4.35 4.4 4.35h4.33a.8.8 0 0 0 .8-.8V2z" opacity="0.6"/>
                <path d="M11.53 10.68c0 2.4-1.97 4.35-4.4 4.35H2.8a.8.8 0 0 0-.8.8V20.2c0 2.4 1.97 4.35 4.4 4.35h4.33a.8.8 0 0 0 .8-.8V10.68z" opacity="0.8"/>
                <path d="M21.2 2c-2.4 0-4.35 1.95-4.35 4.35v4.33c0 .44.36.8.8.8h4.33c2.4 0 4.35-1.95 4.35-4.35V2h-5.13z"/>
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-zinc-900 dark:text-zinc-100">
                  Atlassian Jira Integration
                </h3>
                {testResult?.success ? (
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    Connected
                  </span>
                ) : (
                  <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                    REST API v3 / v2
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Sinkronisasi tiket issue, bug, sprint deadline, dan status pengerjaan tim
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 border-b border-zinc-200 px-6 pt-2 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <button
            onClick={() => setActiveTab('connect')}
            className={`border-b-2 px-4 py-2.5 text-xs font-bold transition-colors ${
              activeTab === 'connect'
                ? 'border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-400'
                : 'border-transparent text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200'
            }`}
          >
            🔌 Koneksi & Kredensial
          </button>

          <button
            onClick={() => setActiveTab('issues')}
            className={`border-b-2 px-4 py-2.5 text-xs font-bold transition-colors flex items-center gap-1.5 ${
              activeTab === 'issues'
                ? 'border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-400'
                : 'border-transparent text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200'
            }`}
          >
            <span>📋 Tiket Tersinkron</span>
            {syncedIssues.length > 0 && (
              <span className="rounded-full bg-blue-100 px-1.5 py-0.2 text-[10px] font-extrabold text-blue-800 dark:bg-blue-950/60 dark:text-blue-300">
                {syncedIssues.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('webhook')}
            className={`border-b-2 px-4 py-2.5 text-xs font-bold transition-colors ${
              activeTab === 'webhook'
                ? 'border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-400'
                : 'border-transparent text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200'
            }`}
          >
            ⚡ Webhook Setup
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* TAB 1: KONEKSI & KREDENSIAL */}
          {activeTab === 'connect' && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Jira Host URL */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-zinc-800 dark:text-zinc-200 mb-1 flex items-center gap-1.5">
                    <Globe className="h-3.5 w-3.5 text-blue-600" />
                    <span>Jira Domain / Host URL *</span>
                  </label>
                  <input
                    type="text"
                    value={host}
                    onChange={(e) => setHost(e.target.value)}
                    placeholder="https://perusahaan-anda.atlassian.net"
                    className="w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2 text-xs font-mono text-zinc-900 placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                  />
                  <span className="text-[10px] text-zinc-500 mt-1 block">
                    URL workspace Jira Atlassian organisasi Anda
                  </span>
                </div>

                {/* User Email */}
                <div>
                  <label className="block text-xs font-bold text-zinc-800 dark:text-zinc-200 mb-1 flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-blue-600" />
                    <span>Email Akun Atlassian *</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="engineer@tohotec-id.com"
                    className="w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2 text-xs text-zinc-900 placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                  />
                </div>

                {/* API Token */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                      <Lock className="h-3.5 w-3.5 text-blue-600" />
                      <span>Jira API Token *</span>
                    </label>
                    <a
                      href="https://id.atlassian.com/manage-profile/security/api-tokens"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5"
                    >
                      <span>Buat Token Baru</span>
                      <ExternalLink className="h-2.5 w-2.5" />
                    </a>
                  </div>
                  <div className="relative">
                    <input
                      type={showToken ? 'text' : 'password'}
                      value={apiToken}
                      onChange={(e) => setApiToken(e.target.value)}
                      placeholder="Paste token di sini..."
                      className="w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2 text-xs font-mono text-zinc-900 placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 pr-16"
                    />
                    <button
                      type="button"
                      onClick={() => setShowToken(!showToken)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                    >
                      {showToken ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </div>

                {/* Project Key (Optional) */}
                <div>
                  <label className="block text-xs font-bold text-zinc-800 dark:text-zinc-200 mb-1 flex items-center gap-1.5">
                    <Tag className="h-3.5 w-3.5 text-zinc-500" />
                    <span>Project Key (Opsional)</span>
                  </label>
                  <input
                    type="text"
                    value={projectKey}
                    onChange={(e) => setProjectKey(e.target.value)}
                    placeholder="cth: TOHO / PRJ / HRIS"
                    className="w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2 text-xs font-mono text-zinc-900 placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 uppercase"
                  />
                </div>

                {/* Custom JQL Query */}
                <div>
                  <label className="block text-xs font-bold text-zinc-800 dark:text-zinc-200 mb-1 flex items-center gap-1.5">
                    <Radio className="h-3.5 w-3.5 text-zinc-500" />
                    <span>Filter JQL Query (Opsional)</span>
                  </label>
                  <input
                    type="text"
                    value={jql}
                    onChange={(e) => setJql(e.target.value)}
                    placeholder="ORDER BY created DESC"
                    className="w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2 text-xs font-mono text-zinc-900 placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                  />
                </div>
              </div>

              {/* Status Alert Banner */}
              {testResult && (
                <div
                  className={`rounded-xl p-3.5 text-xs flex items-start gap-2.5 border ${
                    testResult.success
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-950 dark:bg-emerald-950/30 dark:text-emerald-300'
                      : 'border-red-200 bg-red-50 text-red-900 dark:border-red-950 dark:bg-red-950/30 dark:text-red-300'
                  }`}
                >
                  {testResult.success ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
                  )}
                  <div className="leading-relaxed">{testResult.message}</div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={isTesting}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-xs font-bold text-zinc-800 shadow-2xs hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800 disabled:opacity-50 transition-colors"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                  <span>{isTesting ? 'Menguji Koneksi...' : 'Tes Koneksi Jira'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleSyncIssues}
                  disabled={isSyncing}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-2xs hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  <Sparkles className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>{isSyncing ? 'Menarik Tiket dari Jira...' : 'Tarik & Sinkronkan Tiket Jira'}</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: DAFTAR TIKET JIRA TERSINKRON */}
          {activeTab === 'issues' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                    Tiket Jira Terkini ({syncedIssues.length})
                  </h4>
                  <p className="text-xs text-zinc-500">
                    Tiket otomatis dipetakan ke kalender proyek dan daftar issue sistem
                  </p>
                </div>

                <button
                  onClick={handleSyncIssues}
                  disabled={isSyncing}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-bold text-zinc-800 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 transition-colors shadow-2xs"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>Refresh Sync</span>
                </button>
              </div>

              {syncedIssues.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[460px] overflow-y-auto pr-1">
                  {syncedIssues.map((item) => {
                    const statusColor =
                      item.status === 'closed'
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300'
                        : item.status === 'in_progress'
                        ? 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300'
                        : 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300';

                    const emojiStatus =
                      item.status === 'closed' ? '🟢' : item.status === 'in_progress' ? '🟡' : '🔴';

                    return (
                      <div
                        key={item.key}
                        className="flex flex-col justify-between rounded-xl border border-zinc-200 bg-white p-3.5 shadow-2xs dark:border-zinc-800 dark:bg-zinc-900/70"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <a
                              href={item.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-mono text-xs font-bold text-blue-600 hover:underline flex items-center gap-1 dark:text-blue-400"
                            >
                              <span>{item.key}</span>
                              <ExternalLink className="h-3 w-3" />
                            </a>

                            <div className="flex items-center gap-1.5">
                              <span className="rounded bg-zinc-100 px-1.5 py-0.5 text-[10px] font-semibold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                                {item.issue_type}
                              </span>
                              <span
                                className={`rounded border px-2 py-0.5 text-[10px] font-bold ${statusColor}`}
                              >
                                {emojiStatus} {item.raw_status}
                              </span>
                            </div>
                          </div>

                          <h5 className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 line-clamp-2">
                            {item.summary}
                          </h5>
                        </div>

                        <div className="mt-3 pt-2.5 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-[11px] text-zinc-500">
                          <span>Assignee: <strong>{item.assignee}</strong></span>
                          <span className="flex items-center gap-1 font-mono">
                            <Clock className="h-3 w-3" />
                            <span>{new Date(item.created_at).toLocaleDateString('id-ID')}</span>
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-zinc-200 p-12 text-center text-xs text-zinc-400 dark:border-zinc-800">
                  <div className="flex justify-center mb-2">
                    <Radio className="h-8 w-8 text-zinc-400" />
                  </div>
                  <p className="font-semibold text-zinc-700 dark:text-zinc-300">
                    Belum ada tiket Jira yang ditarik.
                  </p>
                  <p className="mt-1">
                    Buka tab <strong>Koneksi & Kredensial</strong> lalu klik tombol <em>Tarik & Sinkronkan Tiket Jira</em>.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: WEBHOOK SETUP GUIDE */}
          {activeTab === 'webhook' && (
            <div className="space-y-4">
              <div className="rounded-xl border border-blue-200/80 bg-blue-50/50 p-4 dark:border-blue-950/60 dark:bg-blue-950/20 text-xs space-y-2">
                <div className="font-bold text-blue-900 dark:text-blue-300 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-blue-600" />
                  <span>Real-Time Webhook dari Jira ke TOHO Platform</span>
                </div>
                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Dengan mengonfigurasi Webhook di Jira, setiap ada tiket baru atau perubahan status oleh developer di Jira, sistem ini akan langsung terupdate otomatis secara real-time.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-800 dark:text-zinc-200 mb-1">
                  URL Webhook Listener Backend:
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={webhookUrl}
                    className="w-full rounded-xl border border-zinc-300 bg-zinc-50 px-3.5 py-2 text-xs font-mono text-zinc-800 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-200"
                  />
                  <button
                    onClick={copyWebhookUrl}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-zinc-900 px-4 py-2 text-xs font-bold text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 shrink-0 shadow-2xs transition-colors"
                  >
                    {copiedWebhook ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                        <span>Tersalin!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        <span>Salin URL</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-950/40 text-xs space-y-2">
                <h5 className="font-bold text-zinc-900 dark:text-zinc-100">
                  Langkah Setup di Jira Settings:
                </h5>
                <ol className="list-decimal list-inside space-y-1 text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  <li>Buka Jira &rarr; Klik ikon <strong>Settings ⚙️ (Pengaturan)</strong> di kanan atas.</li>
                  <li>Pilih <strong>System &rarr; Webhooks</strong> (pada menu Advanced).</li>
                  <li>Klik tombol <strong>Create a Webhook</strong>.</li>
                  <li>Beri nama (cth: <code>TOHO Project Management</code>) dan paste URL Webhook di atas.</li>
                  <li>Pada bagian <strong>Events</strong>, centang <code>Issue: created, updated, deleted</code>.</li>
                  <li>Klik <strong>Save</strong>. Selesai! Webhook siap menerima event secara langsung.</li>
                </ol>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

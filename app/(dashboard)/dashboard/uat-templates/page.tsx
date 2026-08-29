'use client';

import { useState } from 'react';
import {
  FileCode2, Plus, Edit2, Trash2, Search, CheckCircle2,
  HelpCircle, Eye, Tag, Sparkles, Filter, AlertCircle, Loader2
} from 'lucide-react';
import {
  useUATTemplates,
  useCreateUATTemplate,
  useUpdateUATTemplate,
  useDeleteUATTemplate,
} from '@/features/uat/hooks/use-uat-templates';
import { MasterUATTemplate } from '@/features/uat/services/uat.service';

const CATEGORIES = [
  { id: 'all', label: 'Semua Kategori' },
  { id: 'list', label: 'Tampilan List / View' },
  { id: 'search_filter', label: 'Pencarian & Filter' },
  { id: 'create', label: 'Tambah Data (Create)' },
  { id: 'update', label: 'Ubah Data (Update)' },
  { id: 'delete', label: 'Hapus Data (Delete)' },
  { id: 'validation', label: 'Validasi Form / Negatif' },
  { id: 'export', label: 'Export Dokumen' },
  { id: 'import', label: 'Import Dokumen' },
  { id: 'security', label: 'Hak Akses & Security' },
];

const categoryBadgeColor = (cat: string) => {
  switch (cat) {
    case 'list': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400';
    case 'search_filter': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400';
    case 'create': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400';
    case 'update': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400';
    case 'delete': return 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400';
    case 'validation': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400';
    case 'export': return 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-400';
    default: return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
  }
};

export default function MasterUATTemplatesPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<MasterUATTemplate | null>(null);
  const [previewModal, setPreviewModal] = useState<MasterUATTemplate | null>(null);
  const [previewSampleName, setPreviewSampleName] = useState('PPL List');

  const { data: templates = [], isLoading } = useUATTemplates(selectedCategory);
  const { mutate: createTemplate, isPending: isCreating } = useCreateUATTemplate();
  const { mutate: updateTemplate, isPending: isUpdating } = useUpdateUATTemplate();
  const { mutate: deleteTemplate, isPending: isDeleting } = useDeleteUATTemplate();

  // Form State
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    category: 'list',
    action_type: 'view',
    title_pattern: 'Memastikan {entity} dapat menampilkan data dengan benar',
    pre_condition_pattern: 'User telah login ke sistem dan memiliki hak akses ke menu {entity}',
    test_steps_pattern: '1. Buka menu {entity}\n2. Perhatikan tabel list data\n3. Periksa kesesuaian kolom dan pagination',
    expected_result_pattern: 'Daftar data {entity} tampil lengkap sesuai database dan pagination normal',
    sort_order: 1,
    is_active: true,
  });

  const handleOpenCreate = () => {
    setEditingTemplate(null);
    setFormData({
      code: '',
      name: '',
      category: 'list',
      action_type: 'view',
      title_pattern: 'Memastikan {entity} dapat menampilkan data dengan benar',
      pre_condition_pattern: 'User telah login ke sistem dan memiliki hak akses ke menu {entity}',
      test_steps_pattern: '1. Buka menu {entity}\n2. Perhatikan tabel list data\n3. Periksa kesesuaian kolom dan pagination',
      expected_result_pattern: 'Daftar data {entity} tampil lengkap sesuai database dan pagination normal',
      sort_order: (templates.length || 0) + 1,
      is_active: true,
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (tmpl: MasterUATTemplate) => {
    setEditingTemplate(tmpl);
    setFormData({
      code: tmpl.code,
      name: tmpl.name,
      category: tmpl.category,
      action_type: tmpl.action_type,
      title_pattern: tmpl.title_pattern,
      pre_condition_pattern: tmpl.pre_condition_pattern || '',
      test_steps_pattern: tmpl.test_steps_pattern,
      expected_result_pattern: tmpl.expected_result_pattern,
      sort_order: tmpl.sort_order,
      is_active: tmpl.is_active,
    });
    setModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTemplate) {
      updateTemplate(
        { id: editingTemplate.id, data: formData },
        { onSuccess: () => setModalOpen(false) }
      );
    } else {
      createTemplate(formData, { onSuccess: () => setModalOpen(false) });
    }
  };

  const filteredTemplates = templates.filter((t) => {
    const s = search.toLowerCase();
    return (
      t.name.toLowerCase().includes(s) ||
      t.code.toLowerCase().includes(s) ||
      t.title_pattern.toLowerCase().includes(s)
    );
  });

  // Helper preview text replacement
  const renderPreview = (text: string, sample: string) => {
    if (!text) return '';
    return text
      .replace(/{entity}/g, sample)
      .replace(/{feature}/g, sample)
      .replace(/{feature_name}/g, sample)
      .replace(/{module}/g, 'Modul Utama')
      .replace(/{project}/g, 'Project ERP');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/60 rounded-xl text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50 shadow-2xs">
              <FileCode2 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Master Template UAT</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Pustaka template skenario pengujian standar dengan variabel dinamis <code className="px-1 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 text-xs">{`{entity}`}</code>
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-md shadow-indigo-500/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Template Baru</span>
        </button>
      </div>

      {/* Info Card Banner */}
      <div className="p-4 bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200/60 dark:border-indigo-900/50 rounded-2xl flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-0.5" />
        <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
          <p className="font-medium text-slate-900 dark:text-white">Cara Kerja Dynamic Placeholder:</p>
          Gunakan variabel <code className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-indigo-600 font-mono font-bold">{`{entity}`}</code> pada Judul, Langkah, dan Ekspektasi. Saat digenerate pada modul/fitur, variabel tersebut otomatis digantikan dengan nama fitur/sub-fitur terkait (misal: <em>&quot;PPL List&quot;</em> atau <em>&quot;Data Karyawan&quot;</em>).
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-center gap-4 justify-between">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari kode, nama, atau judul pattern..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          />
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
          <Filter className="w-4 h-4 text-slate-400 mr-1 flex-shrink-0" />
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Template Grid / List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        </div>
      ) : filteredTemplates.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center text-slate-500">
          <FileCode2 className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <p className="font-semibold text-slate-700 dark:text-slate-300">Tidak ada template UAT ditemukan</p>
          <p className="text-xs mt-1 text-slate-400">Silakan buat template baru atau pilih kategori filter lain</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTemplates.map((tmpl) => (
            <div
              key={tmpl.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between group"
            >
              <div>
                {/* Card Top */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${categoryBadgeColor(tmpl.category)}`}>
                    {tmpl.category.toUpperCase()}
                  </span>
                  <span className="font-mono text-xs font-bold text-slate-400 dark:text-slate-500">
                    {tmpl.code}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-white line-clamp-1 mb-2">
                  {tmpl.name}
                </h3>

                {/* Pattern Box */}
                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800/80 mb-3 space-y-2">
                  <div>
                    <div className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">Judul Skenario:</div>
                    <div className="text-xs font-medium text-indigo-600 dark:text-indigo-400 line-clamp-2 mt-0.5">
                      {tmpl.title_pattern}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">Ekspektasi:</div>
                    <div className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 mt-0.5">
                      {tmpl.expected_result_pattern}
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setPreviewModal(tmpl)}
                  className="inline-flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Preview Variabel</span>
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(tmpl)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors"
                    title="Edit Template"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Hapus template ${tmpl.name}?`)) {
                        deleteTemplate(tmpl.id);
                      }
                    }}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors"
                    title="Hapus Template"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Add / Edit Template */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl p-6 shadow-xl my-8">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
              {editingTemplate ? 'Edit Master Template UAT' : 'Tambah Master Template UAT Baru'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
              Konfigurasi template skenario pengujian standar dengan placeholder <code className="text-indigo-600 font-mono">{`{entity}`}</code>
            </p>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Kode Template (Opsional / Auto)
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: TMPL-LIST"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Kategori Pengujian *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  >
                    <option value="list">Tampilan List / View</option>
                    <option value="search_filter">Pencarian & Filter</option>
                    <option value="create">Tambah Data (Create)</option>
                    <option value="update">Ubah Data (Update)</option>
                    <option value="delete">Hapus Data (Delete)</option>
                    <option value="validation">Validasi Form / Negatif</option>
                    <option value="export">Export Dokumen</option>
                    <option value="import">Import Dokumen</option>
                    <option value="security">Security & Hak Akses</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nama Template *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Pengujian Tampilan Daftar Data (List View)"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Judul Skenario Pattern (Gunakan {`{entity}`}) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Memastikan {entity} dapat menampilkan data dengan benar"
                  value={formData.title_pattern}
                  onChange={(e) => setFormData({ ...formData, title_pattern: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Prasyarat (Pre-Condition Pattern)
                </label>
                <input
                  type="text"
                  placeholder="Contoh: User telah login dan memiliki hak akses ke menu {entity}"
                  value={formData.pre_condition_pattern}
                  onChange={(e) => setFormData({ ...formData, pre_condition_pattern: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Langkah-Langkah Pengujian (Test Steps Pattern) *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="1. Buka menu {entity}&#10;2. Perhatikan daftar tabel data&#10;3. Cek pagination dan total record"
                  value={formData.test_steps_pattern}
                  onChange={(e) => setFormData({ ...formData, test_steps_pattern: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Hasil yang Diharapkan (Expected Result Pattern) *
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Daftar data {entity} tampil lengkap sesuai database dan pagination normal"
                  value={formData.expected_result_pattern}
                  onChange={(e) => setFormData({ ...formData, expected_result_pattern: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isCreating || isUpdating}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-md shadow-indigo-500/20 disabled:opacity-50 inline-flex items-center gap-2"
                >
                  {(isCreating || isUpdating) && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{editingTemplate ? 'Simpan Perubahan' : 'Buat Template'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Live Preview Modal */}
      {previewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-500" />
                <span>Simulasi Variabel: {previewModal.name}</span>
              </h3>
              <button
                onClick={() => setPreviewModal(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Uji Coba Ganti Variabel {`{entity}`} dengan Nama Fitur:
              </label>
              <input
                type="text"
                value={previewSampleName}
                onChange={(e) => setPreviewSampleName(e.target.value)}
                placeholder="Contoh: PPL List, Master User, dll"
                className="w-full px-3.5 py-2 text-sm bg-indigo-50/50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold text-indigo-700 dark:text-indigo-300"
              />
            </div>

            <div className="space-y-3 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
              <div>
                <span className="font-bold text-slate-400 uppercase text-[10px]">Hasil Judul Skenario:</span>
                <p className="text-sm font-semibold text-slate-900 dark:text-white mt-0.5">
                  {renderPreview(previewModal.title_pattern, previewSampleName)}
                </p>
              </div>

              {previewModal.pre_condition_pattern && (
                <div>
                  <span className="font-bold text-slate-400 uppercase text-[10px]">Hasil Prasyarat:</span>
                  <p className="text-slate-700 dark:text-slate-300 mt-0.5">
                    {renderPreview(previewModal.pre_condition_pattern, previewSampleName)}
                  </p>
                </div>
              )}

              <div>
                <span className="font-bold text-slate-400 uppercase text-[10px]">Hasil Langkah Pengujian:</span>
                <pre className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap font-sans mt-0.5">
                  {renderPreview(previewModal.test_steps_pattern, previewSampleName)}
                </pre>
              </div>

              <div>
                <span className="font-bold text-slate-400 uppercase text-[10px]">Hasil Ekspektasi:</span>
                <p className="text-slate-700 dark:text-slate-300 mt-0.5">
                  {renderPreview(previewModal.expected_result_pattern, previewSampleName)}
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setPreviewModal(null)}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold"
              >
                Tutup Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

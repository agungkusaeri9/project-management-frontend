'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, Save, Loader2, Briefcase, Plus, Trash2, Users, Star, Code2, Zap
} from 'lucide-react';
import { useProject, useUpdateProject } from '../../../../../features/project/hooks/use-projects';
import { useProjectMembers, useSyncProjectMembers } from '../../../../../features/project/hooks/use-project-members';
import { useCustomers } from '../../../../../features/customer/hooks/use-customers';
import { useUsers } from '../../../../../features/user/hooks/use-users';
import { toast } from 'sonner';

const PROGRAMMER_SUB_ROLES = [
  { value: 'frontend', label: 'Frontend' },
  { value: 'backend', label: 'Backend' },
  { value: 'fullstack', label: 'Fullstack' },
  { value: 'mobile', label: 'Mobile' },
  { value: 'devops', label: 'DevOps' },
];

const ELECTRICAL_SUB_ROLES = [
  { value: 'panel', label: 'Panel Wiring' },
  { value: 'plc', label: 'PLC Programming' },
  { value: 'hmi', label: 'HMI Design' },
  { value: 'commissioning', label: 'Commissioning' },
  { value: 'field', label: 'Field Installation' },
];

interface MemberRow { user_id: string; sub_role: string; is_pic: boolean; }
interface SalesRow { user_id: string; is_pic: boolean; }

export default function EditProjectPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('new');
  const [customerId, setCustomerId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [programmers, setProgrammers] = useState<MemberRow[]>([]);
  const [electricals, setElectricals] = useState<MemberRow[]>([]);
  const [salesTeam, setSalesTeam] = useState<SalesRow[]>([]);
  const [initialized, setInitialized] = useState(false);

  const { data: project, isLoading: isLoadingProject } = useProject(projectId);
  const { data: members = [], isLoading: isLoadingMembers } = useProjectMembers(projectId);
  const { mutate: updateProject, isPending: isUpdating } = useUpdateProject();
  const { mutate: syncMembers, isPending: isSyncing } = useSyncProjectMembers(projectId);
  const { data: customersData } = useCustomers({ page: 1, limit: 10000, search: '' });
  const customers = customersData?.data ?? [];
  const { data: allUsers = [] } = useUsers();

  const programmerUsers = allUsers.filter((u) => u.role === 'programmer');
  const electricalUsers = allUsers.filter((u) => u.role === 'electrical_engineer');
  const salesUsers = allUsers.filter((u) => u.role === 'sales');
  const isPending = isUpdating || isSyncing;

  useEffect(() => {
    if (project && !initialized) {
      setCode(project.code);
      setName(project.name);
      setDescription(project.description ?? '');
      setStatus(project.status);
      setCustomerId(project.customer_id ?? '');
      setStartDate(project.start_date ? project.start_date.split('T')[0] : '');
      setEndDate(project.end_date ? project.end_date.split('T')[0] : '');
    }
  }, [project, initialized]);

  useEffect(() => {
    if (!isLoadingMembers && members && !initialized) {
      setProgrammers(members.filter((m) => m.role === 'programmer').map((m) => ({ user_id: m.user_id, sub_role: m.sub_role ?? 'fullstack', is_pic: m.is_pic })));
      setElectricals(members.filter((m) => m.role === 'electrical_engineer').map((m) => ({ user_id: m.user_id, sub_role: m.sub_role ?? 'panel', is_pic: m.is_pic })));
      setSalesTeam(members.filter((m) => m.role === 'sales').map((m) => ({ user_id: m.user_id, is_pic: m.is_pic })));
      setInitialized(true);
    }
  }, [members, isLoadingMembers, initialized]);

  const toISODate = (val: string) => (val ? `${val}T00:00:00Z` : null);

  // Global PIC enforcement across all sections
  const setPIC = (section: 'programmer' | 'electrical' | 'sales', idx: number, checked: boolean) => {
    const clear = (rows: any[]) => rows.map((r) => ({ ...r, is_pic: false }));
    if (!checked) {
      if (section === 'programmer') setProgrammers((p) => p.map((r, i) => i === idx ? { ...r, is_pic: false } : r));
      if (section === 'electrical') setElectricals((e) => e.map((r, i) => i === idx ? { ...r, is_pic: false } : r));
      if (section === 'sales') setSalesTeam((s) => s.map((r, i) => i === idx ? { ...r, is_pic: false } : r));
      return;
    }
    setProgrammers((p) => clear(p));
    setElectricals((e) => clear(e));
    setSalesTeam((s) => clear(s));
    if (section === 'programmer') setProgrammers((p) => p.map((r, i) => i === idx ? { ...r, is_pic: true } : r));
    if (section === 'electrical') setElectricals((e) => e.map((r, i) => i === idx ? { ...r, is_pic: true } : r));
    if (section === 'sales') setSalesTeam((s) => s.map((r, i) => i === idx ? { ...r, is_pic: true } : r));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !name.trim()) { toast.error('Code and Name are required'); return; }

    updateProject({ id: projectId, data: { code: code.trim(), name: name.trim(), description: description.trim() || null, status, customer_id: customerId || null, start_date: toISODate(startDate), end_date: toISODate(endDate) } as any }, {
      onSuccess: () => {
        const memberPayload: any[] = [];
        for (const p of programmers) if (p.user_id) memberPayload.push({ user_id: p.user_id, role: 'programmer', sub_role: p.sub_role || null, is_pic: p.is_pic });
        for (const e of electricals) if (e.user_id) memberPayload.push({ user_id: e.user_id, role: 'electrical_engineer', sub_role: e.sub_role || null, is_pic: e.is_pic });
        for (const s of salesTeam) if (s.user_id) memberPayload.push({ user_id: s.user_id, role: 'sales', sub_role: null, is_pic: s.is_pic });
        syncMembers(memberPayload, {
          onSuccess: () => { toast.success('Project updated successfully!'); router.push('/projects'); },
          onError: () => toast.error('Project saved but failed to sync team members'),
        });
      },
      onError: () => toast.error('Failed to update project'),
    });
  };

  const inputClass = 'w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50';
  const selectClass = 'flex-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50';
  const subSelectClass = 'w-36 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50';

  const PICToggle = ({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) => (
    <label className="flex items-center gap-1.5 cursor-pointer text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap select-none hover:text-amber-500 transition-colors">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="w-3.5 h-3.5 rounded accent-amber-500" />
      <Star className={`w-3.5 h-3.5 ${checked ? 'text-amber-500' : 'text-slate-300'}`} />
      PIC
    </label>
  );

  const MemberSection = ({ title, icon, iconColor, addLabel, rows, subRoles, onAdd, onRemove, onUserChange, onSubRoleChange, onPICChange, userOptions, emptyLabel }: any) => (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
        <h2 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
          {icon} {title} <span className="text-xs font-normal text-slate-400">(Optional)</span>
        </h2>
        <button type="button" onClick={onAdd} className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold ${iconColor} rounded-xl transition-colors`}>
          <Plus className="w-3.5 h-3.5" /> {addLabel}
        </button>
      </div>
      {rows.length === 0 ? (
        <p className="text-xs text-slate-400 text-center py-3">{emptyLabel}</p>
      ) : (
        <div className="space-y-2">
          {rows.map((row: any, i: number) => (
            <div key={i} className="flex items-center gap-2">
              <select value={row.user_id} onChange={(e) => onUserChange(i, e.target.value)} className={selectClass}>
                <option value="">-- Select --</option>
                {userOptions.map((u: any) => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
              {subRoles && (
                <select value={row.sub_role} onChange={(e) => onSubRoleChange(i, e.target.value)} className={subSelectClass}>
                  {subRoles.map((sr: any) => <option key={sr.value} value={sr.value}>{sr.label}</option>)}
                </select>
              )}
              <PICToggle checked={row.is_pic} onChange={(v: boolean) => onPICChange(i, v)} />
              <button type="button" onClick={() => onRemove(i)} className="p-1.5 text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors flex-shrink-0">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  if (isLoadingProject) return (
    <div className="flex items-center justify-center min-h-64">
      <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
    </div>
  );

  if (!project) return <div className="text-center py-20 text-slate-500">Project not found.</div>;

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center gap-4">
        <Link href="/projects" className="p-2 -ml-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-indigo-600 dark:text-indigo-400" /> Edit Project
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-0.5 text-sm">Update project info and team members.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left */}
          <div className="md:col-span-1 space-y-5">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
              <h2 className="font-bold text-base text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-3">Project Info</h2>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Code <span className="text-red-500">*</span></label>
                <input type="text" value={code} onChange={(e) => setCode(e.target.value)} className={inputClass} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Project Name <span className="text-red-500">*</span></label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Status</label>
                <select value={status} onChange={(e) => setStatus(e.target.value)} className={inputClass}>
                  <option value="new">New</option>
                  <option value="ongoing">Ongoing</option>
                  <option value="on-hold">On Hold</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Customer</label>
                <select value={customerId} onChange={(e) => setCustomerId(e.target.value)} className={inputClass}>
                  <option value="">-- No Customer --</option>
                  {customers.map((c) => <option key={c.id} value={c.id}>{c.name} ({c.code})</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Start Date</label>
                  <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">End Date</label>
                  <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className={inputClass} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Description</label>
                <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} className={`${inputClass} resize-none`} />
              </div>
            </div>
            <p className="text-xs text-slate-400 px-1">
              <Star className="w-3 h-3 inline text-amber-500 mr-1" />PIC (Person in Charge) can only be assigned to <strong>one member</strong> across all sections.
            </p>
          </div>

          {/* Right */}
          <div className="md:col-span-2 space-y-4">
            <MemberSection
              title="Programmers" icon={<Code2 className="w-4 h-4 text-blue-500" />}
              iconColor="bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-100"
              addLabel="Add Programmer" rows={programmers} subRoles={PROGRAMMER_SUB_ROLES}
              userOptions={programmerUsers} emptyLabel="No programmers assigned."
              onAdd={() => setProgrammers((p) => [...p, { user_id: '', sub_role: 'fullstack', is_pic: false }])}
              onRemove={(i: number) => setProgrammers((p) => p.filter((_, idx) => idx !== i))}
              onUserChange={(i: number, v: string) => setProgrammers((p) => p.map((r, idx) => idx === i ? { ...r, user_id: v } : r))}
              onSubRoleChange={(i: number, v: string) => setProgrammers((p) => p.map((r, idx) => idx === i ? { ...r, sub_role: v } : r))}
              onPICChange={(i: number, v: boolean) => setPIC('programmer', i, v)}
            />

            <MemberSection
              title="Electrical Engineers" icon={<Zap className="w-4 h-4 text-amber-500" />}
              iconColor="bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-100"
              addLabel="Add Electrical" rows={electricals} subRoles={ELECTRICAL_SUB_ROLES}
              userOptions={electricalUsers} emptyLabel="No electrical engineers assigned."
              onAdd={() => setElectricals((e) => [...e, { user_id: '', sub_role: 'panel', is_pic: false }])}
              onRemove={(i: number) => setElectricals((e) => e.filter((_, idx) => idx !== i))}
              onUserChange={(i: number, v: string) => setElectricals((e) => e.map((r, idx) => idx === i ? { ...r, user_id: v } : r))}
              onSubRoleChange={(i: number, v: string) => setElectricals((e) => e.map((r, idx) => idx === i ? { ...r, sub_role: v } : r))}
              onPICChange={(i: number, v: boolean) => setPIC('electrical', i, v)}
            />

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h2 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Users className="w-4 h-4 text-emerald-500" /> Sales Team
                </h2>
                <button type="button" onClick={() => setSalesTeam((s) => [...s, { user_id: '', is_pic: false }])}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 rounded-xl transition-colors">
                  <Plus className="w-3.5 h-3.5" /> Add Sales
                </button>
              </div>
              {salesTeam.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-3">No sales assigned.</p>
              ) : (
                <div className="space-y-2">
                  {salesTeam.map((row, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <select value={row.user_id} onChange={(e) => setSalesTeam((s) => s.map((r, idx) => idx === i ? { ...r, user_id: e.target.value } : r))} className={selectClass}>
                        <option value="">-- Select Sales --</option>
                        {salesUsers.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
                      </select>
                      <label className="flex items-center gap-1.5 cursor-pointer text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap select-none hover:text-amber-500 transition-colors">
                        <input type="checkbox" checked={row.is_pic} onChange={(e) => setPIC('sales', i, e.target.checked)} className="w-3.5 h-3.5 rounded accent-amber-500" />
                        <Star className={`w-3.5 h-3.5 ${row.is_pic ? 'text-amber-500' : 'text-slate-300'}`} />
                        PIC
                      </label>
                      <button type="button" onClick={() => setSalesTeam((s) => s.filter((_, idx) => idx !== i))}
                        className="p-1.5 text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors flex-shrink-0">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Link href="/projects" className="px-5 py-2.5 rounded-xl font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-sm">Cancel</Link>
              <button type="submit" disabled={isPending}
                className="px-6 py-2.5 rounded-xl font-medium text-white bg-indigo-600 hover:bg-indigo-500 flex items-center gap-2 disabled:opacity-70 shadow-sm shadow-indigo-500/20 transition-all text-sm">
                {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

'use client';

import { useDashboardSummary, UserProjectProgress, ProjectFeatureProgress } from '@/features/dashboard/hooks/use-dashboard';
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Loader2,
  Users,
  BarChart3,
  UserCheck,
  ChevronRight,
  Code2,
  Zap,
  Briefcase,
  Layers,
  XCircle,
  PlayCircle,
  CheckCircle,
  HelpCircle,
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { data: summary, isLoading, isError } = useDashboardSummary();

  const userProgress = (summary?.user_progress ?? [])
    .filter((u) => u.role.toLowerCase() !== 'admin' && u.role.toLowerCase() !== 'administrator')
    .sort((a, b) => b.uncompleted_projects - a.uncompleted_projects);

  const programmerUsers = userProgress.filter((u) => u.role.toLowerCase() === 'programmer');
  const electricalUsers = userProgress.filter(
    (u) => u.role.toLowerCase() === 'electrical' || u.role.toLowerCase() === 'electrical_engineer'
  );

  const ongoingProjects = summary?.ongoing_projects ?? [];
  const monthlyStats = summary?.monthly_stats ?? [];

  // Find max single bar count for vertical Y-axis scale
  const maxBarValue = Math.max(
    ...monthlyStats.map((m) => Math.max(m.ongoing, m.completed)),
    5
  );

  const totalOngoingAllMonths = monthlyStats.reduce((acc, m) => acc + m.ongoing, 0);
  const totalCompletedAllMonths = monthlyStats.reduce((acc, m) => acc + m.completed, 0);

  const renderUserTable = (users: UserProjectProgress[], roleTitle: string, Icon: any, badgeColor: string) => (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4 flex flex-col justify-between">
      <div className="space-y-3">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl ${badgeColor}`}>
              <Icon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100">{roleTitle}</h3>
              <p className="text-[11px] text-slate-400">{users.length} Team Members</p>
            </div>
          </div>
        </div>

        {users.length === 0 ? (
          <div className="text-center py-10 text-slate-400 text-xs italic">
            No {roleTitle.toLowerCase()} team members found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider font-semibold">
                  <th className="py-2.5 px-2">User</th>
                  <th className="py-2.5 px-2 text-center">Uncompleted</th>
                  <th className="py-2.5 px-2 text-center">Completed</th>
                  <th className="py-2.5 px-2 text-right">Progress</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {users.map((u) => {
                  const totalAssigned = u.completed_projects + u.uncompleted_projects;
                  const percentage =
                    totalAssigned > 0 ? Math.round((u.completed_projects / totalAssigned) * 100) : 0;

                  return (
                    <tr key={u.user_id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-2">
                        <div className="font-semibold text-slate-900 dark:text-slate-100">
                          {u.user_name}
                        </div>
                        <div className="text-[10px] text-slate-400">@{u.username}</div>
                      </td>
                      <td className="py-3 px-2 text-center">
                        <span className="inline-flex items-center gap-1 font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-md text-[11px]">
                          <Clock className="w-3 h-3" />
                          {u.uncompleted_projects}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-center">
                        <span className="inline-flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md text-[11px]">
                          <CheckCircle2 className="w-3 h-3" />
                          {u.completed_projects}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-right">
                        <div className="w-24 ml-auto">
                          <div className="flex items-center justify-between text-[11px] font-semibold mb-1 text-slate-700 dark:text-slate-300">
                            <span>{percentage}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Open Issues */}
        <Link
          href="/dashboard/issues"
          className="group bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Open Issues
            </span>
            <div className="p-3 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-xl group-hover:scale-110 transition-transform">
              <AlertCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            {isLoading ? (
              <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
            ) : (
              <span className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">
                {summary?.open_issues_count ?? 0}
              </span>
            )}
            <span className="text-xs font-medium text-red-500 bg-red-50 dark:bg-red-950/40 px-2 py-0.5 rounded-md flex items-center gap-1">
              Active <ChevronRight className="w-3 h-3" />
            </span>
          </div>
        </Link>

        {/* Card 2: Ongoing Projects */}
        <Link
          href="/dashboard/projects"
          className="group bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Ongoing Projects
            </span>
            <div className="p-3 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-xl group-hover:scale-110 transition-transform">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            {isLoading ? (
              <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
            ) : (
              <span className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">
                {summary?.ongoing_projects_count ?? 0}
              </span>
            )}
            <span className="text-xs font-medium text-amber-600 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-md flex items-center gap-1">
              In Progress <ChevronRight className="w-3 h-3" />
            </span>
          </div>
        </Link>

        {/* Card 3: Completed Projects */}
        <Link
          href="/dashboard/projects"
          className="group bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Completed Projects
            </span>
            <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl group-hover:scale-110 transition-transform">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            {isLoading ? (
              <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
            ) : (
              <span className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">
                {summary?.completed_projects_count ?? 0}
              </span>
            )}
            <span className="text-xs font-medium text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md flex items-center gap-1">
              Finished <ChevronRight className="w-3 h-3" />
            </span>
          </div>
        </Link>

        {/* Card 4: Total Team Members */}
        <Link
          href="/dashboard/users"
          className="group bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Total Team Members
            </span>
            <div className="p-3 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl group-hover:scale-110 transition-transform">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            {isLoading ? (
              <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
            ) : (
              <span className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">
                {userProgress.length}
              </span>
            )}
            <span className="text-xs font-medium text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded-md flex items-center gap-1">
              Registered <ChevronRight className="w-3 h-3" />
            </span>
          </div>
        </Link>
      </div>

      {/* Monthly Project Statistics (Dual Grouped Bar Chart Graphic - April to March) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2.5">
              <BarChart3 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Monthly Project Statistics
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Comparison of Ongoing vs. Completed projects per month (April &ndash; March)
            </p>
          </div>

          <div className="flex items-center gap-5 text-xs font-semibold">
            <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-950/30 px-3 py-1.5 rounded-xl border border-amber-200 dark:border-amber-800/40">
              <span className="w-3 h-3 rounded-md bg-amber-500" />
              <span className="text-amber-800 dark:text-amber-300">
                Ongoing ({totalOngoingAllMonths})
              </span>
            </div>
            <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/30 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800/40">
              <span className="w-3 h-3 rounded-md bg-emerald-500" />
              <span className="text-emerald-800 dark:text-emerald-300">
                Completed ({totalCompletedAllMonths})
              </span>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-24">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
          </div>
        ) : (
          <div className="space-y-3">
            {/* Chart Area with Grid Lines */}
            <div className="relative h-72 pt-8 pb-3 px-3 flex items-end justify-between gap-2 border-b border-slate-200 dark:border-slate-700">
              {/* Horizontal Background Grid Lines */}
              <div className="absolute inset-x-0 top-0 bottom-8 flex flex-col justify-between pointer-events-none opacity-30 dark:opacity-20">
                <div className="border-b border-dashed border-slate-300 dark:border-slate-600 w-full" />
                <div className="border-b border-dashed border-slate-300 dark:border-slate-600 w-full" />
                <div className="border-b border-dashed border-slate-300 dark:border-slate-600 w-full" />
                <div className="border-b border-dashed border-slate-300 dark:border-slate-600 w-full" />
              </div>

              {/* 12 Month Groups */}
              {monthlyStats.map((stat, idx) => {
                const ongoingH = (stat.ongoing / maxBarValue) * 100;
                const completedH = (stat.completed / maxBarValue) * 100;

                return (
                  <div
                    key={idx}
                    className="flex-1 flex flex-col items-center h-full justify-end group z-10"
                  >
                    {/* Dual Vertical Bars Container */}
                    <div className="w-full flex items-end justify-center gap-1 h-full relative">
                      {/* Bar 1: Ongoing (Amber) */}
                      <div className="flex-1 max-w-[18px] flex flex-col items-center justify-end h-full group/bar">
                        <span
                          className={`text-[10px] font-bold mb-1 transition-all ${
                            stat.ongoing > 0
                              ? 'text-amber-700 dark:text-amber-400 opacity-100'
                              : 'text-slate-300 dark:text-slate-700 opacity-60'
                          }`}
                        >
                          {stat.ongoing}
                        </span>
                        <div className="w-full bg-slate-100 dark:bg-slate-800/80 rounded-t-md overflow-hidden flex flex-col justify-end h-full relative">
                          {stat.ongoing > 0 ? (
                            <div
                              className="w-full bg-gradient-to-t from-amber-500 to-amber-400 rounded-t-md transition-all duration-500 shadow-sm"
                              style={{ height: `${Math.max(ongoingH, 10)}%` }}
                              title={`${stat.month}: ${stat.ongoing} Ongoing`}
                            />
                          ) : (
                            <div className="w-full h-1 bg-slate-200 dark:bg-slate-700/60" />
                          )}
                        </div>
                      </div>

                      {/* Bar 2: Completed (Emerald) */}
                      <div className="flex-1 max-w-[18px] flex flex-col items-center justify-end h-full group/bar">
                        <span
                          className={`text-[10px] font-bold mb-1 transition-all ${
                            stat.completed > 0
                              ? 'text-emerald-700 dark:text-emerald-400 opacity-100'
                              : 'text-slate-300 dark:text-slate-700 opacity-60'
                          }`}
                        >
                          {stat.completed}
                        </span>
                        <div className="w-full bg-slate-100 dark:bg-slate-800/80 rounded-t-md overflow-hidden flex flex-col justify-end h-full relative">
                          {stat.completed > 0 ? (
                            <div
                              className="w-full bg-gradient-to-t from-emerald-500 to-emerald-400 rounded-t-md transition-all duration-500 shadow-sm"
                              style={{ height: `${Math.max(completedH, 10)}%` }}
                              title={`${stat.month}: ${stat.completed} Completed`}
                            />
                          ) : (
                            <div className="w-full h-1 bg-slate-200 dark:bg-slate-700/60" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* X-Axis Month Labels */}
            <div className="flex justify-between gap-2 px-3 pt-1">
              {monthlyStats.map((stat, idx) => (
                <div key={idx} className="flex-1 text-center">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {stat.month}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Ongoing Projects Progress (Feature Status Breakdown) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2.5">
              <Briefcase className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Non-Completed Projects Progress
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Progress calculated from feature status breakdown (Done: 100%, In Progress: 50%, New: 0%, Cancelled: 0%)
            </p>
          </div>

          <Link
            href="/dashboard/projects"
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
          >
            All Projects <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
          </div>
        ) : isError || ongoingProjects.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-sm">
            No active non-completed projects found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase text-[11px] tracking-wider font-semibold">
                  <th className="py-3 px-3">Project</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-center">Feature Breakdown (Done / In Progress / New / Cancelled)</th>
                  <th className="py-3 px-3 text-right">Feature Progress</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {ongoingProjects.map((p) => (
                  <tr key={p.project_id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                          {p.project_code}
                        </span>
                        <Link
                          href={`/projects`}
                          className="font-semibold text-slate-900 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                        >
                          {p.project_name}
                        </Link>
                      </div>
                      {p.customer_name && (
                        <div className="text-xs text-slate-400 mt-0.5">
                          Customer: {p.customer_name}
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-3">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                        {p.status.replace('_', ' ')}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 text-center">
                      <div className="flex items-center justify-center gap-2 flex-wrap text-xs">
                        {/* Done */}
                        <span
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 font-semibold"
                          title="Done Features"
                        >
                          <CheckCircle className="w-3 h-3 text-emerald-500" />
                          {p.done_features} Done
                        </span>

                        {/* In Progress */}
                        <span
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 font-semibold"
                          title="In Progress Features"
                        >
                          <PlayCircle className="w-3 h-3 text-amber-500" />
                          {p.in_progress_features} In Progress
                        </span>

                        {/* New */}
                        <span
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 font-semibold"
                          title="New Features"
                        >
                          <HelpCircle className="w-3 h-3 text-blue-500" />
                          {p.new_features} New
                        </span>

                        {/* Cancelled */}
                        <span
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 font-semibold"
                          title="Cancelled Features"
                        >
                          <XCircle className="w-3 h-3 text-slate-400" />
                          {p.cancelled_features} Cancelled
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-3 text-right">
                      <div className="w-36 ml-auto">
                        <div className="flex items-center justify-between text-xs font-bold mb-1 text-slate-800 dark:text-slate-200">
                          <span>{p.progress_percentage}%</span>
                          <span className="text-[10px] text-slate-400 font-normal">
                            ({p.total_features} features)
                          </span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              p.progress_percentage >= 80
                                ? 'bg-emerald-500'
                                : p.progress_percentage >= 40
                                ? 'bg-amber-500'
                                : 'bg-indigo-500'
                            }`}
                            style={{ width: `${p.progress_percentage}%` }}
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* User Project Progress (Divided into 2 Columns: Programmer & Electrical) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <UserCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                User Project Progress
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Project progress broken down by Programmer and Electrical Engineer teams
              </p>
            </div>
          </div>
          <Link
            href="/dashboard/users"
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
          >
            Manage Users <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
          </div>
        ) : isError || userProgress.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-sm bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
            No user progress data available.
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Column 1: Programmer */}
            {renderUserTable(
              programmerUsers,
              'Programmer Team',
              Code2,
              'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
            )}

            {/* Column 2: Electrical */}
            {renderUserTable(
              electricalUsers,
              'Electrical Team',
              Zap,
              'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
            )}
          </div>
        )}
      </div>
    </div>
  );
}

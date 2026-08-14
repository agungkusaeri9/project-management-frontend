import Link from 'next/link';
import {
  Sparkles,
  Briefcase,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Calendar as CalendarIcon,
} from 'lucide-react';
import { PortalLayout } from '@/components/layout';
import { LiveClock } from '@/components/dashboard/live-clock';
import { GoogleCalendar } from '@/components/dashboard/google-calendar';
import { dashboardService, DashboardSummary } from '@/features/dashboard/services/dashboard.service';
import { projectService, Project } from '@/features/project/services/project.service';
import { issueService, Issue } from '@/features/issue/services/issue.service';

export const metadata = {
  title: 'Home Overview — TOHO Project Management & Schedule',
  description:
    'Platform overview with Google Calendar integration, ongoing project milestones, real-time clock, and KPI metrics.',
};

export default async function HomePage() {
  const [dashboardSummary, projects, issues] = await Promise.all([
    dashboardService.getSummary().catch(
      (): DashboardSummary => ({
        open_issues_count: 0,
        ongoing_projects_count: 0,
        completed_projects_count: 0,
        user_progress: [],
        monthly_stats: [],
        ongoing_projects: [],
      })
    ),
    projectService.getAll().catch((): Project[] => []),
    issueService.getAll().catch((): Issue[] => []),
  ]);

  const ongoingProjects = dashboardSummary.ongoing_projects || [];
  const totalMilestonesCount =
    projects.filter((p) => p.start_date || p.end_date).length * 2 + issues.length;

  return (
    <PortalLayout>
      <div className="w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
        {/* Top Header & Live Time Bar */}
        <section className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-zinc-200 pb-6 dark:border-zinc-800">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="inline-flex items-center gap-1 rounded-full bg-zinc-100 dark:bg-zinc-800/80 px-2.5 py-0.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                <Sparkles className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                <span>PT. TOHO TECHNOLOGY INDONESIA</span>
              </span>
              <span className="text-xs text-zinc-400 font-mono">v1.0</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
              Project Management & Schedule
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
              Executive overview, Google Calendar schedule, ongoing project tracking, and timeline.
            </p>
          </div>

          <div className="flex items-center">
            <LiveClock />
          </div>
        </section>

        {/* 4 Executive KPI Summary Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Ongoing Projects */}
          <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-2xs dark:border-zinc-800 dark:bg-zinc-900/40">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                Ongoing Projects
              </span>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
                <Briefcase className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
                {dashboardSummary.ongoing_projects_count}
              </span>
              <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                Active in development
              </span>
            </div>
          </div>

          {/* Card 2: Completed Projects */}
          <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-2xs dark:border-zinc-800 dark:bg-zinc-900/40">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                Completed Projects
              </span>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
                <CheckCircle2 className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
                {dashboardSummary.completed_projects_count}
              </span>
              <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                Delivered & verified
              </span>
            </div>
          </div>

          {/* Card 3: Scheduled Milestones */}
          <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-2xs dark:border-zinc-800 dark:bg-zinc-900/40">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                Calendar Milestones
              </span>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-50 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400">
                <CalendarIcon className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
                {totalMilestonesCount}
              </span>
              <span className="text-xs font-medium text-purple-600 dark:text-purple-400">
                Active timeline events
              </span>
            </div>
          </div>

          {/* Card 4: Open Issues */}
          <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-2xs dark:border-zinc-800 dark:bg-zinc-900/40">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                Tracked Issues
              </span>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400">
                <AlertCircle className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
                {dashboardSummary.open_issues_count}
              </span>
              <span className="text-xs font-medium text-amber-600 dark:text-amber-400">
                Open items / QA
              </span>
            </div>
          </div>
        </section>

        {/* Google Calendar Section with Dynamic Project Milestones & Issues */}
        <section>
          <GoogleCalendar projects={projects} issues={issues} />
        </section>

        {/* Ongoing Projects Detailed Progress */}
        <section className="rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6 dark:border-zinc-800 dark:bg-zinc-900/40 shadow-2xs">
          <div className="flex items-center justify-between mb-4 border-b border-zinc-100 pb-3 dark:border-zinc-800/80">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                Active Ongoing Projects Status
              </h2>
            </div>
            <Link
              href="/projects"
              className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              <span>View All Projects</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {ongoingProjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {ongoingProjects.map((project) => (
                <div
                  key={project.project_id}
                  className="flex flex-col justify-between rounded-xl border border-zinc-100 bg-zinc-50/70 p-4 dark:border-zinc-800/80 dark:bg-zinc-950/40 transition-colors hover:border-zinc-300 dark:hover:border-zinc-700 shadow-2xs"
                >
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-1.5">
                      <span className="font-mono text-[11px] font-bold text-zinc-500 dark:text-zinc-400">
                        {project.project_code}
                      </span>
                      {project.customer_name && (
                        <span className="rounded bg-zinc-200/80 px-2 py-0.5 text-[10px] font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 truncate max-w-[140px]">
                          {project.customer_name}
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-xs sm:text-sm line-clamp-2">
                      {project.project_name}
                    </h3>
                  </div>

                  {/* Progress Bar & Stats */}
                  <div className="mt-4 pt-3 border-t border-zinc-200/60 dark:border-zinc-800/60">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-zinc-500 dark:text-zinc-400 text-[11px]">
                        {project.done_features} done &bull; {project.in_progress_features} in
                        progress
                      </span>
                      <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                        {project.progress_percentage}%
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
                      <div
                        className="h-full rounded-full bg-blue-600 dark:bg-blue-500 transition-all duration-500"
                        style={{ width: `${project.progress_percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-zinc-500">
              Belum ada proyek on-going yang tercatat.
            </div>
          )}
        </section>
      </div>
    </PortalLayout>
  );
}

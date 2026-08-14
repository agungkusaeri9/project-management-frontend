'use client';

import { SprintProgressDashboard } from '@/features/jira/components/sprint-progress-dashboard';
import { PortalLayout } from '@/components/layout/portal-layout';

export default function PublicProgressPage() {
  return (
    <PortalLayout>
      <div className="w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <SprintProgressDashboard isDashboard={false} />
      </div>
    </PortalLayout>
  );
}

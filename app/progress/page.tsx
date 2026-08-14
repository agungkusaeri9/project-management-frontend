'use client';

import { SprintProgressDashboard } from '@/features/jira/components/sprint-progress-dashboard';
import { PortalLayout } from '@/components/layout/portal-layout';

export default function PublicProgressPage() {
  return (
    <PortalLayout>
      <SprintProgressDashboard isDashboard={false} />
    </PortalLayout>
  );
}

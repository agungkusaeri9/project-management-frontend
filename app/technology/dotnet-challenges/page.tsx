import { PortalLayout } from '@/components/layout';
import { DotnetChallengesView } from '@/components/dotnet-challenges/dotnet-challenges-view';
import { getDotnetChallengesData } from '@/data/dotnet-challenges';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: '.NET Architecture & Engineering Challenges — Software Engineering Standardization',
  description:
    'Comprehensive catalog of enterprise .NET engineering challenges, performance pitfalls, and production best-practice mitigations.',
};

export default function DotnetChallengesPage() {
  const challengesData = getDotnetChallengesData();

  return (
    <PortalLayout>
      <DotnetChallengesView data={challengesData} />
    </PortalLayout>
  );
}

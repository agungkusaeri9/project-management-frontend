import { PortalLayout } from '@/components/layout';
import { NestChallengesView } from '@/components/nestjs-challenges/nestjs-challenges-view';
import { getNestChallengesData } from '@/data/nest-challenges';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'NestJS Architecture & Engineering Challenges — Software Engineering Standardization',
  description:
    'Comprehensive catalog of enterprise NestJS engineering challenges, performance pitfalls, and production best-practice mitigations.',
};

export default function NestjsChallengesPage() {
  const challengesData = getNestChallengesData();

  return (
    <PortalLayout>
      <NestChallengesView data={challengesData} />
    </PortalLayout>
  );
}

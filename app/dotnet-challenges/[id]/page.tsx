import { notFound } from 'next/navigation';
import { PortalLayout } from '@/components/layout';
import { DotnetChallengeDetailView } from '@/components/dotnet-challenges/dotnet-challenge-detail-view';
import {
  getDotnetChallengeById,
  getAllDotnetChallenges,
} from '@/data/dotnet-challenges';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  const allChallenges = getAllDotnetChallenges();
  return allChallenges.map((c) => ({
    id: c.id,
  }));
}

export async function generateMetadata({ params }: PageProps) {
  const resolvedParams = await params;
  const challenge = getDotnetChallengeById(resolvedParams.id);
  if (!challenge) {
    return {
      title: 'Tantangan Tidak Ditemukan — .NET Engineering Challenges',
    };
  }
  return {
    title: `${challenge.title} — .NET Engineering Challenges`,
    description: challenge.impact,
  };
}

export default async function DirectDotnetChallengeDetailPage({
  params,
}: PageProps) {
  const resolvedParams = await params;
  const challenge = getDotnetChallengeById(resolvedParams.id);

  if (!challenge) {
    notFound();
  }

  const allChallenges = getAllDotnetChallenges();

  return (
    <PortalLayout>
      <DotnetChallengeDetailView
        challenge={challenge}
        allChallenges={allChallenges}
      />
    </PortalLayout>
  );
}

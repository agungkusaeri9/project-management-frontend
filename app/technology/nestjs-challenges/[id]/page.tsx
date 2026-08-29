import { notFound } from 'next/navigation';
import { PortalLayout } from '@/components/layout';
import { NestChallengeDetailView } from '@/components/nestjs-challenges/nestjs-challenge-detail-view';
import {
  getNestChallengeById,
  getAllNestChallenges,
} from '@/data/nest-challenges';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  const allChallenges = getAllNestChallenges();
  return allChallenges.map((c) => ({
    id: c.id,
  }));
}

export async function generateMetadata({ params }: PageProps) {
  const resolvedParams = await params;
  const challenge = getNestChallengeById(resolvedParams.id);
  if (!challenge) {
    return {
      title: 'Tantangan Tidak Ditemukan — NestJS Engineering Challenges',
    };
  }
  return {
    title: `${challenge.title} — NestJS Engineering Challenges`,
    description: challenge.description || challenge.impact,
  };
}

export default async function NestChallengeDetailPage({ params }: PageProps) {
  const resolvedParams = await params;
  const challenge = getNestChallengeById(resolvedParams.id);

  if (!challenge) {
    notFound();
  }

  const allChallenges = getAllNestChallenges();

  return (
    <PortalLayout>
      <NestChallengeDetailView
        challenge={challenge}
        allChallenges={allChallenges}
      />
    </PortalLayout>
  );
}

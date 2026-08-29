import dotnetChallengesJson from './dotnet-challenges.json';

export type ChallengeSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM';
export type ChallengeDifficulty = 'EASY' | 'MEDIUM' | 'HARD';

export interface ChallengeCategoryItem {
  id: string;
  label: string;
  count: number;
}

export interface DotnetChallenge {
  id: string;
  title: string;
  category: string;
  categoryLabel?: string;
  difficulty?: ChallengeDifficulty | string;
  severity?: ChallengeSeverity | string;
  description?: string;
  scenario?: string;
  flow?: string;
  requirements?: string[];
  technologies?: string[];
  concepts?: string[];
  successCriteria?: string[];
  impact?: string;
  symptoms?: string[];
  rootCause?: string;
  badCode?: string;
  goodCode?: string;
  explanation?: string;
  solutionSteps?: string[];
  architectureFlow?: string;
  tags?: string[];
  keyTakeaway?: string;
}

export interface DotnetChallengesData {
  id: string;
  title: string;
  subtitle: string;
  version: string;
  categories: ChallengeCategoryItem[];
  challenges: DotnetChallenge[];
}

export const dotnetChallengesData: DotnetChallengesData =
  dotnetChallengesJson as unknown as DotnetChallengesData;

export function getDotnetChallengesData(): DotnetChallengesData {
  return dotnetChallengesData;
}

export function getAllDotnetChallenges(): DotnetChallenge[] {
  return dotnetChallengesData.challenges || [];
}

export function getDotnetChallengeById(id: string): DotnetChallenge | undefined {
  return (dotnetChallengesData.challenges || []).find(
    (c) => c.id.toLowerCase() === id.toLowerCase()
  );
}

export interface StackChallengeItem {
  id: string;
  number: string;
  title: string;
  href: string;
  severity: ChallengeSeverity;
  category: string;
  isAvailable: boolean;
}

export interface TechStackGroup {
  id: 'dotnet' | 'nestjs' | 'react';
  name: string;
  fullName: string;
  badge: string;
  iconName: 'Code2' | 'Server' | 'Layers';
  description: string;
  viewAllHref?: string;
  challenges: StackChallengeItem[];
}

import { nestChallengesData } from './nest-challenges';

export const ALL_TECH_STACK_CHALLENGES: TechStackGroup[] = [
  {
    id: 'dotnet',
    name: '.NET',
    fullName: '.NET Core / C# Ecosystem',
    badge: `${(dotnetChallengesData.challenges || []).length} Topics`,
    iconName: 'Code2',
    description: 'Enterprise backend, high-concurrency, EF Core & memory tuning',
    viewAllHref: '/technology/dotnet-challenges',
    challenges: (dotnetChallengesData.challenges || []).map((c, idx) => ({
      id: c.id,
      number: String(idx + 1).padStart(2, '0'),
      title: c.title,
      href: `/technology/dotnet-challenges/${c.id}`,
      severity: (c.severity as ChallengeSeverity) || (c.difficulty === 'HARD' ? 'HIGH' : 'MEDIUM'),
      category: c.categoryLabel || c.category,
      isAvailable: true,
    })),
  },
  {
    id: 'nestjs',
    name: 'NestJS',
    fullName: 'NestJS / TypeScript Backend',
    badge: `${(nestChallengesData.challenges || []).length} Topics`,
    iconName: 'Server',
    description: 'Modular architecture, microservices, interceptors & TypeORM',
    viewAllHref: '/technology/nestjs-challenges',
    challenges: (nestChallengesData.challenges || []).map((c, idx) => ({
      id: c.id,
      number: String(idx + 1).padStart(2, '0'),
      title: c.title,
      href: `/technology/nestjs-challenges/${c.id}`,
      severity: (c.severity as ChallengeSeverity) || (c.difficulty === 'HARD' ? 'HIGH' : 'MEDIUM'),
      category: c.categoryLabel || c.category,
      isAvailable: true,
    })),
  },
  {
    id: 'react',
    name: 'React.js',
    fullName: 'React.js / Next.js Frontend',
    badge: '4 Topics (Preview)',
    iconName: 'Layers',
    description: 'SSR hydration, RSC boundary, state closures & rendering',
    viewAllHref: '/technology/dotnet-challenges',
    challenges: [
      {
        id: 'react-hydration-mismatch',
        number: '01',
        title: 'SSR Hydration Mismatch on LocalStorage & Date',
        href: '/technology/dotnet-challenges',
        severity: 'CRITICAL',
        category: 'SSR & Hydration',
        isAvailable: false,
      },
      {
        id: 'react-useeffect-closure',
        number: '02',
        title: 'useEffect Infinite Loops & Stale Closures',
        href: '/technology/dotnet-challenges',
        severity: 'HIGH',
        category: 'State & Hooks',
        isAvailable: false,
      },
      {
        id: 'react-rsc-client-leak',
        number: '03',
        title: 'React Server Components vs Client Boundary Leaks',
        href: '/technology/dotnet-challenges',
        severity: 'HIGH',
        category: 'Architecture',
        isAvailable: false,
      },
      {
        id: 'react-large-list-virtualization',
        number: '04',
        title: 'Large Table Virtualization & Layout Shift',
        href: '/technology/dotnet-challenges',
        severity: 'MEDIUM',
        category: 'Performance',
        isAvailable: false,
      },
    ],
  },
];

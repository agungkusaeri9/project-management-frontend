import nestChallengesJson from './nest-challenges.json';

export type ChallengeSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM';
export type ChallengeDifficulty = 'EASY' | 'MEDIUM' | 'HARD' | 'EXPERT';

export interface ChallengeCategoryItem {
  id: string;
  label: string;
  count: number;
}

export interface NestChallenge {
  id: string;
  title: string;
  category: string;
  categoryLabel?: string;
  difficulty?: ChallengeDifficulty | string;
  severity?: ChallengeSeverity | string;
  description?: string;
  scenario?: string;
  flow?: string;
  architecture?: string;
  targetArchitecture?: string;
  exampleModules?: string[];
  exampleServices?: string[];
  examplePermissions?: string[];
  requirements?: string[];
  technologies?: string[];
  concepts?: string[];
  successCriteria?: string[];
  symptoms?: string[];
  impact?: string;
  rootCause?: string;
  badCode?: string;
  goodCode?: string;
  explanation?: string;
  solutionSteps?: string[];
  architectureFlow?: string;
  tags?: string[];
  keyTakeaway?: string;
}

export interface NestChallengesData {
  id: string;
  title: string;
  subtitle: string;
  version: string;
  categories: ChallengeCategoryItem[];
  challenges: NestChallenge[];
}

export const nestChallengesData: NestChallengesData =
  nestChallengesJson as unknown as NestChallengesData;

export function getNestChallengesData(): NestChallengesData {
  return nestChallengesData;
}

export function getAllNestChallenges(): NestChallenge[] {
  return nestChallengesData.challenges || [];
}

export function getNestChallengeById(id: string): NestChallenge | undefined {
  return (nestChallengesData.challenges || []).find(
    (c) => c.id.toLowerCase() === id.toLowerCase()
  );
}

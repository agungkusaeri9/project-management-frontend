import k6ChallengesJson from './k6-challenges.json';

export type ChallengeSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM';
export type ChallengeDifficulty = 'EASY' | 'MEDIUM' | 'HARD' | 'EXPERT';

export interface ChallengeCategoryItem {
  id: string;
  label: string;
  count: number;
}

export interface PerformanceMetricItem {
  metric: string;
  description: string;
}

export interface TrafficDistributionItem {
  endpoint: string;
  weight: string;
  type: string;
}

export interface BenchmarkData {
  metrics: string[];
  before: string[];
  after: string[];
}

export interface K6Challenge {
  id: string;
  number: string;
  level: string;
  levelNumber: number;
  title: string;
  category: string;
  categoryLabel?: string;
  difficulty?: ChallengeDifficulty | string;
  severity?: ChallengeSeverity | string;
  targetEndpoint?: string;
  targetMethod?: string;
  targetVus?: number;
  duration?: string;
  objective: string;
  scenario: string;
  loadProfile?: string;
  focus?: string;
  mustHave?: string;
  expectedResult?: string;
  experiment?: string;
  architecture?: string;
  trafficDistribution?: TrafficDistributionItem[];
  requirements?: string[];
  successCriteria?: string[];
  metricsToMeasure?: string[];
  questions?: string[];
  answersOrHints?: string[];
  benchmarkData?: BenchmarkData;
  k6Script?: string;
  bottleneck?: string;
  rootCause?: string;
  solution?: string;
  tradeOffs?: string;
  tags?: string[];
}

export interface ImportantConceptItem {
  concept: string;
  summary: string;
  detail: string;
}

export interface K6ChallengesData {
  id: string;
  title: string;
  subtitle: string;
  version: string;
  overview: {
    description: string;
    coreQuestions: string[];
    finalGoal: string;
  };
  learningGoals: string[];
  techStack: {
    recommended: string[];
    optional: string[];
    note?: string;
  };
  performanceMetrics: PerformanceMetricItem[];
  categories: ChallengeCategoryItem[];
  challenges: K6Challenge[];
  reportTemplate?: {
    title: string;
    sections: {
      name: string;
      content?: string;
      fields?: string[];
      columns?: string[];
      rows?: string[];
    }[];
  };
  importantConcepts?: ImportantConceptItem[];
}

export const k6ChallengesData: K6ChallengesData =
  k6ChallengesJson as unknown as K6ChallengesData;

export function getK6ChallengesData(): K6ChallengesData {
  return k6ChallengesData;
}

export function getAllK6Challenges(): K6Challenge[] {
  return k6ChallengesData.challenges || [];
}

export function getK6ChallengeById(id: string): K6Challenge | undefined {
  return (k6ChallengesData.challenges || []).find(
    (c) =>
      c.id.toLowerCase() === id.toLowerCase() ||
      c.number === id ||
      c.id.endsWith(id.toLowerCase())
  );
}

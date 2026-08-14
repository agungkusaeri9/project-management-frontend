export type IconKey = 'layers' | 'network' | 'server' | 'file-text' | 'shield';

export interface StandardCategory {
  id: string;
  title: string;
  description: string;
  href: string;
  iconKey: IconKey;
  tags: string[];
}

export interface TechnologyItem {
  name: string;
  type: string;
  description: string;
  href?: string;
}

export interface TechnologyCatalog {
  frontend: TechnologyItem[];
  backend: TechnologyItem[];
  mobile: TechnologyItem[];
  database: TechnologyItem[];
  supporting: TechnologyItem[];
}

export interface ArchitectureItem {
  name: string;
  description: string;
  useCase: string;
  projectStructure: string;
  dependencyRules: string;
  recommendedTech?: string[];
}

export interface DeploymentItem {
  name: string;
  description: string;
  useCase: string;
  requirements: string[];
  deploymentFlow: string;
  advantages: string[];
  disadvantages: string[];
}

export interface LogLevelItem {
  level: string;
  description: string;
}

export interface LogFieldItem {
  field: string;
  type: string;
  example: string;
}

export interface LoggingStandard {
  format: string;
  levels: LogLevelItem[];
  categories: string[];
  standardFields: LogFieldItem[];
}

export interface SecurityStandard {
  authentication: { name: string; description: string }[];
  authorization: { name: string; description: string }[];
  applicationSecurity: { name: string; description: string }[];
  secretManagement: {
    rules: string[];
    prohibitedInSource: string[];
  };
}

export interface PortalConfig {
  title: string;
  subtitle: string;
  version: string;
  organization: string;
}

export interface StandardsData {
  portal: PortalConfig;
  categories: StandardCategory[];
  technologyCatalog: TechnologyCatalog;
  architectureCatalog: ArchitectureItem[];
  deploymentCatalog: DeploymentItem[];
  loggingStandard: LoggingStandard;
  securityStandard: SecurityStandard;
}

export interface DotnetTechnologyRelationship {
  id: string;
  title: string;
  subtitle: string;
  coreTechnology: { category: string; technology: string; usage: string }[];
  architectures: {
    name: string;
    flow: string;
    description: string;
    suitability: string;
    components?: { name: string; role: string }[];
    layers?: { layer: string; content: string }[];
  }[];
  dataAccess: {
    efCore: { title: string; whenToUse: string[]; relationship: string };
    dapper: { title: string; whenToUse: string[]; relationship: string };
    hybrid: { title: string; guideline: string };
  };
  validation: {
    primaryTool: string;
    alternatives: string[];
    flow: string;
    guidelines: string[];
  };
  logging: {
    framework: string;
    sinks: string[];
    flow: string;
    minimalScopes: string[];
    sanitizationRules: string[];
  };
  auth: {
    technologies: { name: string; type: string; desc: string }[];
    authorizationTypes: string[];
    flow: string;
  };
  backgroundJobs: {
    simple: { technologies: string[]; useCase: string };
    advanced: { technologies: string[]; useCase: string };
    flow: string;
  };
  messaging: {
    technologies: { name: string; fit: string }[];
    flow: string;
  };
  caching: {
    inMemory: { name: string; useCase: string };
    distributed: { name: string; useCase: string };
    flow: string;
  };
  testing: { type: string; technology: string; scope: string }[];
  containerization: {
    tools: string[];
    flow: string;
    typicalStack: string[];
  };
  deployment: {
    method: string;
    flow: string;
    tools: string[];
  }[];
  configuration: {
    sources: string[];
    rule: string;
  };
  apiDocumentation: {
    tool: string;
    capabilities: string[];
  };
  observability: {
    pillars: string[];
    monitoredItems: string[];
  };
  recommendedStack: {
    language: string;
    framework: string;
    architecture: string;
    orm: string[];
    validation: string;
    logging: string;
    auth: string;
    backgroundJobs: string[];
    messaging: string[];
    caching: string;
    testing: string[];
    apiDoc: string;
    container: string;
    deployment: string[];
    ciCd: string[];
    observability: string[];
  };
  matrix: { area: string; default: string; alternative: string }[];
}

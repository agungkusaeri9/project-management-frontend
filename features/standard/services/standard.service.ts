import api from '@/lib/axios';
import standardsDataJson from '@/data/standards.json';
import {
  StandardsData,
  StandardCategory,
  TechnologyCatalog,
  ArchitectureItem,
  DeploymentItem,
  LoggingStandard,
  SecurityStandard,
  VersioningStandard,
  ErrorHandlingStandard,
  TestingStandard,
  MonitoringStandard,
  DotnetTechnologyRelationship,
} from '../types/standard.types';

interface ApiResponse<T> {
  status: boolean;
  message: string;
  data: T;
}

export const standardService = {
  getAll: async (): Promise<StandardsData> => {
    try {
      const response = await api.get<ApiResponse<StandardsData>>('/standards');
      return response.data.data;
    } catch {
      return standardsDataJson as unknown as StandardsData;
    }
  },

  getCategories: async (): Promise<StandardCategory[]> => {
    try {
      const response = await api.get<ApiResponse<StandardCategory[]>>('/standards/categories');
      return response.data.data;
    } catch {
      return [];
    }
  },

  getTechnologyCatalog: async (): Promise<TechnologyCatalog> => {
    try {
      const response = await api.get<ApiResponse<TechnologyCatalog>>('/standards/technology');
      return response.data.data;
    } catch {
      return { frontend: [], backend: [], mobile: [], database: [], supporting: [] };
    }
  },

  getArchitectureCatalog: async (): Promise<ArchitectureItem[]> => {
    try {
      const response = await api.get<ApiResponse<ArchitectureItem[]>>('/standards/architecture');
      return response.data.data;
    } catch {
      return [];
    }
  },

  getDeploymentCatalog: async (): Promise<DeploymentItem[]> => {
    try {
      const response = await api.get<ApiResponse<DeploymentItem[]>>('/standards/deployment');
      return response.data.data;
    } catch {
      return [];
    }
  },

  getLoggingStandard: async (): Promise<LoggingStandard> => {
    try {
      const response = await api.get<ApiResponse<LoggingStandard>>('/standards/logging');
      return response.data.data;
    } catch {
      return { format: '', levels: [], categories: [], standardFields: [] };
    }
  },

  getSecurityStandard: async (): Promise<SecurityStandard> => {
    try {
      const response = await api.get<ApiResponse<SecurityStandard>>('/standards/security');
      return response.data.data;
    } catch {
      return { authentication: [], authorization: [], applicationSecurity: [], secretManagement: { rules: [], prohibitedInSource: [] } };
    }
  },

  getVersioningStandard: async (): Promise<VersioningStandard> => {
    try {
      const response = await api.get<ApiResponse<VersioningStandard>>('/standards/versioning');
      return response.data.data;
    } catch {
      return (standardsDataJson as unknown as StandardsData).versioningStandard;
    }
  },

  getErrorHandlingStandard: async (): Promise<ErrorHandlingStandard> => {
    try {
      const response = await api.get<ApiResponse<ErrorHandlingStandard>>('/standards/error-handling');
      return response.data.data;
    } catch {
      return (standardsDataJson as unknown as StandardsData).errorHandlingStandard;
    }
  },

  getTestingStandard: async (): Promise<TestingStandard> => {
    try {
      const response = await api.get<ApiResponse<TestingStandard>>('/standards/testing');
      return response.data.data;
    } catch {
      return (standardsDataJson as unknown as StandardsData).testingStandard;
    }
  },

  getMonitoringStandard: async (): Promise<MonitoringStandard> => {
    try {
      const response = await api.get<ApiResponse<MonitoringStandard>>('/standards/monitoring');
      return response.data.data;
    } catch {
      return (standardsDataJson as unknown as StandardsData).monitoringStandard;
    }
  },

  getTechnologyRelationship: async (slug: string): Promise<DotnetTechnologyRelationship> => {
    try {
      const response = await api.get<ApiResponse<DotnetTechnologyRelationship>>(`/standards/technology/${slug}`);
      return response.data.data;
    } catch {
      return {} as DotnetTechnologyRelationship;
    }
  },

  getTechnologyPdfUrl: (): string => {
    const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081';
    return `${baseURL}/standards/technology/export-pdf`;
  },

  getArchitecturePdfUrl: (): string => {
    const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081';
    return `${baseURL}/standards/architecture/export-pdf`;
  },

  getDotnetPdfUrl: (): string => {
    const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081';
    return `${baseURL}/standards/technology/dotnet/export-pdf`;
  },
};

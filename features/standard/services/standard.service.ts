import api from '@/lib/axios';
import {
  StandardsData,
  StandardCategory,
  TechnologyCatalog,
  ArchitectureItem,
  DeploymentItem,
  LoggingStandard,
  SecurityStandard,
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
      return {
        categories: [],
        technology: { frontend: [], backend: [], mobile: [], database: [], supporting: [] },
        architecture: [],
        deployment: [],
        logging: { principles: [], levels: [], standard_fields: [], guidelines: [] },
        security: { principles: [], practices: [], sensitive_data: [] },
      };
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
      return { principles: [], levels: [], standard_fields: [], guidelines: [] };
    }
  },

  getSecurityStandard: async (): Promise<SecurityStandard> => {
    try {
      const response = await api.get<ApiResponse<SecurityStandard>>('/standards/security');
      return response.data.data;
    } catch {
      return { principles: [], practices: [], sensitive_data: [] };
    }
  },

  getTechnologyRelationship: async (slug: string): Promise<DotnetTechnologyRelationship> => {
    try {
      const response = await api.get<ApiResponse<DotnetTechnologyRelationship>>(`/standards/technology/${slug}`);
      return response.data.data;
    } catch {
      return {
        title: '',
        subtitle: '',
        stack: [],
        architecture: [],
        key_capabilities: [],
        testing: [],
        database: [],
        telemetry: [],
        security: [],
        best_practices: [],
        summary: [],
      };
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

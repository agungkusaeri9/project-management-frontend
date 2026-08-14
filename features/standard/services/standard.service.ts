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
    const response = await api.get<ApiResponse<StandardsData>>('/standards');
    return response.data.data;
  },

  getCategories: async (): Promise<StandardCategory[]> => {
    const response = await api.get<ApiResponse<StandardCategory[]>>('/standards/categories');
    return response.data.data;
  },

  getTechnologyCatalog: async (): Promise<TechnologyCatalog> => {
    const response = await api.get<ApiResponse<TechnologyCatalog>>('/standards/technology');
    return response.data.data;
  },

  getArchitectureCatalog: async (): Promise<ArchitectureItem[]> => {
    const response = await api.get<ApiResponse<ArchitectureItem[]>>('/standards/architecture');
    return response.data.data;
  },

  getDeploymentCatalog: async (): Promise<DeploymentItem[]> => {
    const response = await api.get<ApiResponse<DeploymentItem[]>>('/standards/deployment');
    return response.data.data;
  },

  getLoggingStandard: async (): Promise<LoggingStandard> => {
    const response = await api.get<ApiResponse<LoggingStandard>>('/standards/logging');
    return response.data.data;
  },

  getSecurityStandard: async (): Promise<SecurityStandard> => {
    const response = await api.get<ApiResponse<SecurityStandard>>('/standards/security');
    return response.data.data;
  },

  getTechnologyRelationship: async (slug: string): Promise<DotnetTechnologyRelationship> => {
    const response = await api.get<ApiResponse<DotnetTechnologyRelationship>>(`/standards/technology/${slug}`);
    return response.data.data;
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

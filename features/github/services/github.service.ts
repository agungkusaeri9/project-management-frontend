import api from '@/lib/axios';

export interface GithubConfigData {
  token: string;
  has_token: boolean;
  owner: string;
  api_url: string;
  auto_sync?: string;
  sync_interval_minutes?: string;
}

export interface GithubRepoOwner {
  id: number;
  login: string;
  avatar_url: string;
  html_url: string;
  type: string;
}

export interface GithubRepository {
  id: number;
  node_id?: string;
  name: string;
  full_name: string;
  private: boolean;
  owner: GithubRepoOwner;
  html_url: string;
  description: string | null;
  fork: boolean;
  archived: boolean;
  default_branch: string;
  language: string | null;
  stargazers_count: number;
  watchers_count: number;
  forks_count: number;
  open_issues_count: number;
  size: number;
  created_at: string;
  updated_at: string;
  pushed_at: string | null;
  visibility?: string;
  topics?: string[];
  tags?: string[];
  latest_tag?: string;
  project_id?: string | null;
  internal_project_name?: string | null;
  internal_project_code?: string | null;
  internal_customer_name?: string | null;
  last_synced_at?: string | null;
}

export interface GithubUser {
  id: number;
  login: string;
  name: string;
  avatar_url: string;
  html_url: string;
  type: string;
  email?: string;
  bio?: string;
  public_repos?: number;
  total_private_repos?: number;
  followers?: number;
  following?: number;
}

export interface GithubRepositoriesResponse {
  data: GithubRepository[];
  total: number;
  owner: string;
  source_type?: string;
  token_scopes?: string;
  has_repo_scope?: boolean;
  authenticated_user?: string;
}

export interface GithubTestConnectionResponse {
  success: boolean;
  message: string;
  data?: {
    authenticated_user?: GithubUser;
    target_owner?: Record<string, any>;
    oauth_scopes?: string;
    has_repo_scope?: boolean;
  };
  error?: string;
}

export interface GithubBranch {
  name: string;
  protected: boolean;
  sha?: string;
  commit_message?: string;
  author_name?: string;
  author_avatar?: string;
  commit_date?: string;
}

export interface GithubTag {
  name: string;
  sha?: string;
  zipball_url?: string;
  tarball_url?: string;
  commit_message?: string;
  author_name?: string;
  commit_date?: string;
}

export interface GithubCommit {
  sha: string;
  node_id?: string;
  commit: {
    message: string;
    author: {
      name: string;
      email: string;
      date: string;
    };
    committer?: {
      name: string;
      email: string;
      date: string;
    };
  };
  author?: {
    login: string;
    avatar_url: string;
    html_url: string;
  } | null;
  html_url: string;
}

export interface GithubPullRequest {
  id: number;
  number: number;
  title: string;
  state: string;
  user: {
    login: string;
    avatar_url: string;
    html_url?: string;
  };
  html_url: string;
  created_at: string;
  updated_at: string;
  draft?: boolean;
  head?: { ref: string; label: string };
  base?: { ref: string; label: string };
  body?: string;
}

export const githubService = {
  async getConfig(): Promise<GithubConfigData> {
    const res = await api.get<GithubConfigData>('/github/config');
    return res.data;
  },

  async saveConfig(data: {
    token?: string;
    owner: string;
    api_url: string;
    auto_sync?: string;
    sync_interval_minutes?: string;
  }): Promise<{ message: string }> {
    const res = await api.post<{ message: string }>('/github/config', data);
    return res.data;
  },

  async testConnection(data?: { token?: string; owner?: string; api_url?: string }): Promise<GithubTestConnectionResponse> {
    const res = await api.post<GithubTestConnectionResponse>('/github/test-connection', data || {});
    return res.data;
  },

  async getAuthenticatedUser(): Promise<GithubUser> {
    const res = await api.get<{ data: GithubUser }>('/github/user');
    return res.data.data;
  },

  async getRepositories(params?: {
    q?: string;
    visibility?: string;
    sort?: string;
    direction?: string;
    per_page?: number;
    page?: number;
  }): Promise<GithubRepositoriesResponse> {
    const res = await api.get<GithubRepositoriesResponse>('/github/repositories', { params });
    return res.data;
  },

  async getRepositoryDetail(owner: string, repo: string): Promise<GithubRepository> {
    const res = await api.get<{ data: GithubRepository }>(`/github/repositories/${owner}/${repo}`);
    return res.data.data;
  },

  async getBranches(owner: string, repo: string): Promise<GithubBranch[]> {
    const res = await api.get<{ data?: GithubBranch[] } | GithubBranch[]>(`/github/repositories/${owner}/${repo}/branches`);
    const data = (res.data as any)?.data || res.data;
    return Array.isArray(data) ? data : [];
  },

  async getCommits(owner: string, repo: string, sha?: string): Promise<GithubCommit[]> {
    const res = await api.get<GithubCommit[]>(`/github/repositories/${owner}/${repo}/commits`, { params: { sha } });
    return Array.isArray(res.data) ? res.data : [];
  },

  async getTags(owner: string, repo: string): Promise<GithubTag[]> {
    const res = await api.get<{ data?: GithubTag[] } | GithubTag[]>(`/github/repositories/${owner}/${repo}/tags`);
    const data = (res.data as any)?.data || res.data;
    return Array.isArray(data) ? data : [];
  },

  async sync(): Promise<{ status: boolean; message: string; data?: any }> {
    const res = await api.post<{ status: boolean; message: string; data?: any }>('/github/sync');
    return res.data;
  },

  async getSummary(): Promise<{ status: boolean; data: any }> {
    const res = await api.get<{ status: boolean; data: any }>('/github/summary');
    return res.data;
  },

  async linkProject(repoId: number, projectId: string | null): Promise<{ status: boolean; message: string }> {
    const res = await api.put<{ status: boolean; message: string }>(`/github/repositories/${repoId}/link`, {
      project_id: projectId,
    });
    return res.data;
  },

  async getProjectRepositories(projectId: string): Promise<GithubRepository[]> {
    const res = await api.get<{ status: boolean; data: GithubRepository[]; total: number }>(`/github/projects/${projectId}/repositories`);
    return res.data.data || [];
  },

  async linkProjectRepositories(projectId: string, repositoryIds: number[]): Promise<{ status: boolean; message: string }> {
    const res = await api.put<{ status: boolean; message: string }>(`/github/projects/${projectId}/repositories`, {
      repository_ids: repositoryIds,
    });
    return res.data;
  },

  async getPullRequests(owner: string, repo: string, state: string = 'all'): Promise<GithubPullRequest[]> {
    const res = await api.get<GithubPullRequest[]>(`/github/repositories/${owner}/${repo}/pulls`, { params: { state } });
    return Array.isArray(res.data) ? res.data : [];
  },
};

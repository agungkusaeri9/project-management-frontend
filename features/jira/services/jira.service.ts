import api from '@/lib/axios';

export interface JiraCredentials {
  host?: string;
  email?: string;
  api_token?: string;
}

export interface JiraSyncParams extends JiraCredentials {
  project_key?: string;
  jql?: string;
  auto_save?: boolean;
}

export interface JiraUser {
  accountId: string;
  emailAddress: string;
  displayName: string;
  active: boolean;
}

export interface SyncedJiraIssue {
  key: string;
  summary: string;
  issue_type: string;
  status: 'open' | 'in_progress' | 'closed';
  raw_status: string;
  priority: 'high' | 'medium' | 'low';
  raw_priority: string;
  assignee: string;
  created_at: string;
  due_date?: string | null;
  url: string;
}

export interface JiraSyncResult {
  total: number;
  synced: number;
  issues: SyncedJiraIssue[];
}

export interface JiraConfigData {
  host: string;
  email: string;
  project_key: string;
  jql: string;
  auto_sync: string;
  sync_interval_minutes?: string;
  has_token: boolean;
  masked_api_token: string;
}

export interface JiraBoardLocation {
  projectId: number;
  displayName: string;
  projectName: string;
  projectKey: string;
  projectTypeKey: string;
  avatarURI?: string;
  name: string;
}

export interface JiraBoard {
  id: number;
  self: string;
  name: string;
  type: string;
  location?: JiraBoardLocation;
  isPrivate?: boolean;
}

export interface JiraBoardIssueItem {
  id: string;
  key: string;
  self?: string;
  fields: {
    summary: string;
    status?: {
      name: string;
      statusCategory?: { key: string; name: string };
    };
    priority?: { name: string };
    issuetype?: { name: string; iconUrl?: string };
    assignee?: { displayName?: string; emailAddress?: string };
    created?: string;
    duedate?: string | null;
  };
}

export interface JiraSprintItem {
  id: number;
  name: string;
  state: 'active' | 'future' | 'closed';
  startDate?: string;
  endDate?: string;
  goal?: string;
}

export interface JiraBoardCompleteData {
  board?: JiraBoard;
  issues?: {
    total?: number;
    issues?: JiraBoardIssueItem[];
  };
  backlog?: {
    total?: number;
    issues?: JiraBoardIssueItem[];
  };
  sprints?: {
    values?: JiraSprintItem[];
  };
}

export interface JiraProjectRecord {
  id: number;
  jira_board_id: number;
  jira_project_id: number;
  project_key: string;
  project_name: string;
  display_name: string;
  board_name: string;
  board_type: string;
  project_type_key: string;
  avatar_uri?: string;
  self_url?: string;
  is_private?: boolean;
  project_id?: string | null;
  internal_project_name?: string | null;
  internal_project_code?: string | null;
  internal_customer_name?: string | null;
  last_synced_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface JiraProgressStats {
  total_issues: number;
  total_unresolved: number;
  total_completed: number;
  total_in_progress: number;
  total_open: number;
  total_active_sprint_unresolved: number;
  total_backlog_unresolved: number;
  total_overdue: number;
  total_due_soon: number;
}

export interface JiraProgressIssueItem {
  id: number;
  jira_issue_id: string;
  issue_key: string;
  project_key: string;
  jira_board_id?: number | null;
  jira_sprint_id?: number | null;
  summary: string;
  description?: string;
  issue_type: string;
  status: 'open' | 'in_progress' | 'closed';
  raw_status: string;
  priority: string;
  assignee: string;
  assignee_email?: string;
  assignee_avatar?: string;
  due_date?: string | null;
  jira_created_at?: string | null;
  jira_updated_at?: string | null;
  is_backlog: boolean;
  url?: string;
}

export interface JiraProgressSummaryResponse {
  stats: JiraProgressStats;
  issues: JiraProgressIssueItem[];
  projects: JiraProjectRecord[];
  sprints: JiraSprintItem[];
}

export const jiraService = {
  getConfig: async (): Promise<JiraConfigData> => {
    const response = await api.get('/jira/config');
    return response.data.data;
  },

  saveConfig: async (payload: {
    host: string;
    email: string;
    api_token?: string;
    project_key?: string;
    jql?: string;
    auto_sync?: string;
    sync_interval_minutes?: string;
  }): Promise<void> => {
    await api.post('/jira/config', payload);
  },

  testConnection: async (creds?: JiraCredentials): Promise<{ status: boolean; message: string; data: JiraUser }> => {
    const response = await api.post('/jira/test-connection', creds || {});
    return response.data;
  },

  syncIssues: async (params?: JiraSyncParams): Promise<{ status: boolean; message: string; data: JiraSyncResult }> => {
    const response = await api.post('/jira/sync', params || {});
    return response.data;
  },

  getIssue: async (issueIdOrKey: string): Promise<Record<string, unknown>> => {
    const response = await api.get(`/jira/issue/${encodeURIComponent(issueIdOrKey)}`);
    return response.data.data;
  },

  getBoards: async (): Promise<{ values: JiraBoard[]; total?: number }> => {
    const response = await api.get('/jira/agile/boards');
    return response.data.data;
  },

  getProjects: async (): Promise<{ values: JiraProjectRecord[]; total?: number }> => {
    const response = await api.get('/jira/projects');
    return response.data.data;
  },

  syncProjects: async (): Promise<{ values: JiraProjectRecord[]; total?: number }> => {
    const response = await api.post('/jira/projects/sync');
    return response.data.data;
  },

  linkProject: async (id: number, projectId: string | null): Promise<void> => {
    await api.put(`/jira/projects/${id}/link`, { project_id: projectId });
  },

  getBoardIssues: async (boardId: number | string, jql?: string): Promise<{ issues: JiraBoardIssueItem[]; total?: number }> => {
    const query = jql ? `?jql=${encodeURIComponent(jql)}` : '';
    const response = await api.get(`/jira/agile/boards/${boardId}/issues${query}`);
    return response.data.data;
  },

  getBoardBacklog: async (boardId: number | string): Promise<{ issues: JiraBoardIssueItem[]; total?: number }> => {
    const response = await api.get(`/jira/agile/boards/${boardId}/backlog`);
    return response.data.data;
  },

  getBoardComplete: async (boardId: number | string, sync?: boolean): Promise<JiraBoardCompleteData> => {
    const query = sync ? '?sync=true' : '';
    const response = await api.get(`/jira/agile/boards/${boardId}/all${query}`);
    return response.data.data;
  },

  getProgressSummary: async (): Promise<JiraProgressSummaryResponse> => {
    const response = await api.get('/jira/progress-summary');
    return response.data.data;
  },
};

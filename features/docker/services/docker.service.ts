import api from '@/lib/axios';

export interface DockerPortItem {
  ip?: string;
  private_port: number;
  public_port?: number;
  type: string;
}

export interface DockerContainerItem {
  id: string;
  names: string[];
  name: string;
  image: string;
  image_id: string;
  command: string;
  created: number;
  state: 'running' | 'exited' | 'paused' | 'restarting' | 'dead' | 'created' | string;
  status: string;
  ports: DockerPortItem[];
  labels: Record<string, string>;
  size_rw?: number;
  size_root_fs?: number;
  cpu_percent: number;
  memory_usage: number;
  memory_limit: number;
  memory_percent: number;
}

export interface DockerStatsResponse {
  cpu_percent: number;
  memory_usage: number;
  memory_limit: number;
  memory_percent: number;
  network_rx_bytes: number;
  network_tx_bytes: number;
  block_read_bytes: number;
  block_write_bytes: number;
  pids: number;
}

export interface DockerConfigData {
  host: string;
  api_version: string;
  is_enabled: boolean;
}

export interface DockerTestConnectionResponse {
  success: boolean;
  message: string;
  data?: {
    host?: string;
    version_info?: Record<string, any>;
  };
  error?: string;
}

export const dockerService = {
  async getConfig(): Promise<DockerConfigData> {
    const res = await api.get<{ data: DockerConfigData }>('/docker/config');
    return res.data.data;
  },

  async saveConfig(data: DockerConfigData): Promise<{ message: string }> {
    const res = await api.post<{ message: string }>('/docker/config', data);
    return res.data;
  },

  async testConnection(data?: { host?: string }): Promise<DockerTestConnectionResponse> {
    const res = await api.post<DockerTestConnectionResponse>('/docker/test-connection', data || {});
    return res.data;
  },

  async getSystemInfo(): Promise<Record<string, any>> {
    const res = await api.get<{ data: Record<string, any> }>('/docker/system/info');
    return res.data.data;
  },

  async getContainers(all: boolean = true): Promise<{ data: DockerContainerItem[]; total: number; host: string }> {
    const res = await api.get<{ data: DockerContainerItem[]; total: number; host: string }>('/docker/containers', {
      params: { all: all ? '1' : '0' },
    });
    return res.data;
  },

  async getContainerDetail(id: string): Promise<Record<string, any>> {
    const res = await api.get<{ data: Record<string, any> }>(`/docker/containers/${id}`);
    return res.data.data;
  },

  async getContainerStats(id: string): Promise<DockerStatsResponse> {
    const res = await api.get<{ data: DockerStatsResponse }>(`/docker/containers/${id}/stats`);
    return res.data.data;
  },

  async getContainerLogs(id: string, tail: number = 150): Promise<{ data: string; container_id: string }> {
    const res = await api.get<{ data: string; container_id: string }>(`/docker/containers/${id}/logs`, {
      params: { tail },
    });
    return res.data;
  },

  async startContainer(id: string): Promise<{ message: string }> {
    const res = await api.post<{ message: string }>(`/docker/containers/${id}/start`);
    return res.data;
  },

  async stopContainer(id: string): Promise<{ message: string }> {
    const res = await api.post<{ message: string }>(`/docker/containers/${id}/stop`);
    return res.data;
  },

  async restartContainer(id: string): Promise<{ message: string }> {
    const res = await api.post<{ message: string }>(`/docker/containers/${id}/restart`);
    return res.data;
  },
};

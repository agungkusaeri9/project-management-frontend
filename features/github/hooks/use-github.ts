'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { githubService, GithubRepository } from '../services/github.service';
import { toast } from 'sonner';

export function useProjectGithubRepositories(projectId?: string) {
  return useQuery({
    queryKey: ['github-repositories', 'project', projectId],
    queryFn: () => (projectId ? githubService.getProjectRepositories(projectId) : Promise.resolve([])),
    enabled: !!projectId,
  });
}

export function useAllGithubRepositories() {
  return useQuery({
    queryKey: ['github-repositories', 'all'],
    queryFn: () =>
      githubService.getRepositories({
        visibility: 'all',
        per_page: 100,
        sort: 'updated',
        direction: 'desc',
      }),
  });
}

export function useLinkProjectRepositories() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, repositoryIds }: { projectId: string; repositoryIds: number[] }) =>
      githubService.linkProjectRepositories(projectId, repositoryIds),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['github-repositories'] });
      queryClient.invalidateQueries({ queryKey: ['github-repositories', 'project', variables.projectId] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['project', variables.projectId] });
      toast.success('Repository GitHub berhasil diperbarui untuk project ini!');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.error || err?.message || 'Gagal menyimpan repository GitHub');
    },
  });
}

export function useLinkSingleGithubRepository() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ repoId, projectId }: { repoId: number; projectId: string | null }) =>
      githubService.linkProject(repoId, projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['github-repositories'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Assignment project pada repository berhasil disimpan!');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.error || err?.message || 'Gagal menghubungkan repository ke project');
    },
  });
}

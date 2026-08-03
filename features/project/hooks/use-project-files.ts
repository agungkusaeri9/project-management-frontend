import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectFileService } from '../services/project-file.service';

export const useProjectFiles = (projectId: string) => {
  return useQuery({
    queryKey: ['project-files', projectId],
    queryFn: () => projectFileService.getByProjectId(projectId),
    enabled: !!projectId,
  });
};

export const useUploadProjectFiles = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, title, files }: { projectId: string; title: string; files: File[] }) =>
      projectFileService.upload(projectId, title, files),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['project-files', variables.projectId] });
    },
  });
};

export const useDeleteProjectFile = (projectId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => projectFileService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-files', projectId] });
    },
  });
};

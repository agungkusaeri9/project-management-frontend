import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectMemberService, ProjectMember } from '../services/project-member.service';

export const useProjectMembers = (projectId: string) => {
  return useQuery({
    queryKey: ['project-members', projectId],
    queryFn: () => projectMemberService.getByProjectId(projectId),
    enabled: !!projectId,
  });
};

export const useSyncProjectMembers = (projectId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (members: Omit<ProjectMember, 'id' | 'project_id' | 'user_name' | 'username' | 'created_at' | 'updated_at'>[]) =>
      projectMemberService.sync(projectId, members),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-members', projectId] });
    },
  });
};

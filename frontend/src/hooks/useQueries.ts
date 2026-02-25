import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { type Task, type Priority, type Status } from '../backend';

// Query keys
export const QUERY_KEYS = {
  allTasks: ['tasks', 'all'],
  teamMembers: ['teamMembers'],
  tasksByAssignee: (assignee: string) => ['tasks', 'assignee', assignee],
};

// ─── Queries ────────────────────────────────────────────────────────────────

export function useGetAllTasks() {
  const { actor, isFetching } = useActor();

  return useQuery<Task[]>({
    queryKey: QUERY_KEYS.allTasks,
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllTasks();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 5 * 60 * 1000, // 5 minutes for reminder checks
  });
}

export function useGetTeamMembers() {
  const { actor, isFetching } = useActor();

  return useQuery<string[]>({
    queryKey: QUERY_KEYS.teamMembers,
    queryFn: async () => {
      if (!actor) return [];
      return actor.getTeamMembers();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetTasksByAssignee(assignee: string) {
  const { actor, isFetching } = useActor();

  return useQuery<Task[]>({
    queryKey: QUERY_KEYS.tasksByAssignee(assignee),
    queryFn: async () => {
      if (!actor || !assignee) return [];
      return actor.getTasksByAssignee(assignee);
    },
    enabled: !!actor && !isFetching && !!assignee,
    refetchInterval: 5 * 60 * 1000,
  });
}

// ─── Mutations ───────────────────────────────────────────────────────────────

export function useCreateTask() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      title: string;
      conferenceName: string | null;
      description: string | null;
      assignedTo: string;
      deadline: bigint;
      priority: Priority;
    }) => {
      if (!actor) throw new Error('Actor not initialized');
      const id = BigInt(Date.now());
      await actor.createTask(
        id,
        params.title,
        params.conferenceName,
        params.description,
        params.assignedTo,
        params.deadline,
        params.priority,
      );
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.allTasks });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.teamMembers });
    },
  });
}

export function useUpdateTaskStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { taskId: bigint; newStatus: Status }) => {
      if (!actor) throw new Error('Actor not initialized');
      await actor.updateTaskStatus(params.taskId, params.newStatus);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.allTasks });
      // Also invalidate assignee-specific queries
      queryClient.invalidateQueries({ queryKey: ['tasks', 'assignee'] });
    },
  });
}

export function useDeleteTask() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (taskId: bigint) => {
      if (!actor) throw new Error('Actor not initialized');
      await actor.deleteTask(taskId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.allTasks });
      queryClient.invalidateQueries({ queryKey: ['tasks', 'assignee'] });
    },
  });
}

export function useAddTeamMember() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (name: string) => {
      if (!actor) throw new Error('Actor not initialized');
      await actor.addTeamMember(name);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.teamMembers });
    },
  });
}

export function useRemoveTeamMember() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (name: string) => {
      if (!actor) throw new Error('Actor not initialized');
      await actor.removeTeamMember(name);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.teamMembers });
    },
  });
}

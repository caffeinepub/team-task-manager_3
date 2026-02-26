import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { Task, Priority, Status, Role, User, ActivityEntry } from '../backend';

export function useGetAllTasks() {
  const { actor, isFetching } = useActor();
  return useQuery<Task[]>({
    queryKey: ['tasks'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllTasks();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetTasksByAssignee(assignee: string) {
  const { actor, isFetching } = useActor();
  return useQuery<Task[]>({
    queryKey: ['tasks', 'assignee', assignee],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getTasksByAssignee(assignee);
    },
    enabled: !!actor && !isFetching && !!assignee,
  });
}

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
      if (!actor) throw new Error('Actor not available');
      return actor.createTask(
        params.title,
        params.conferenceName,
        params.description,
        params.assignedTo,
        params.deadline,
        params.priority,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['activityLog'] });
    },
  });
}

export function useUpdateTaskStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: { taskId: bigint; newStatus: Status }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateTaskStatus(params.taskId, params.newStatus);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['activityLog'] });
    },
  });
}

export function useDeleteTask() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (taskId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteTask(taskId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['activityLog'] });
    },
  });
}

export function useEditTask() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      taskId: bigint;
      title: string;
      description: string | null;
      assignedTo: string;
      deadline: bigint;
      priority: Priority;
      conferenceName: string | null;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.editTask(
        params.taskId,
        params.title,
        params.description,
        params.assignedTo,
        params.deadline,
        params.priority,
        params.conferenceName,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['activityLog'] });
    },
  });
}

export function useGetTeamMembers() {
  const { actor, isFetching } = useActor();
  return useQuery<string[]>({
    queryKey: ['teamMembers'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getTeamMembers();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddTeamMember() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addTeamMember(name);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teamMembers'] });
    },
  });
}

export function useRemoveTeamMember() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.removeTeamMember(name);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teamMembers'] });
    },
  });
}

export function useLoginUser() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (params: { email: string; password: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.loginUser(params.email, params.password);
    },
  });
}

export function useRegisterUser() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (params: { name: string; email: string; password: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.registerUser(params.name, params.email, params.password);
    },
  });
}

export function useAddUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: { name: string; email: string; password: string; role: Role }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addUser(params.name, params.email, params.password, params.role);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

export function useDeleteUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (email: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteUser(email);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

export function useGetAllActivityLogs() {
  const { actor, isFetching } = useActor();
  return useQuery<ActivityEntry[]>({
    queryKey: ['activityLog'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllActivityLogs();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetActivityLogsByUser(email: string) {
  const { actor, isFetching } = useActor();
  return useQuery<ActivityEntry[]>({
    queryKey: ['activityLog', 'user', email],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getActivityLogsByUser(email);
    },
    enabled: !!actor && !isFetching && !!email,
  });
}

export function useGetAllUsers(isAdmin?: boolean) {
  const { actor, isFetching } = useActor();
  return useQuery<User[]>({
    queryKey: ['users'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllUsers();
    },
    // Only run this query for admin users to avoid unauthorized errors
    enabled: !!actor && !isFetching && isAdmin === true,
  });
}

export function useGetRecentLoginEvents(isAdmin?: boolean) {
  const { actor, isFetching } = useActor();
  const now = BigInt(Date.now()) * BigInt(1_000_000);
  const sevenDaysAgo = now - BigInt(7 * 24 * 60 * 60) * BigInt(1_000_000_000);

  return useQuery<ActivityEntry[]>({
    queryKey: ['loginEvents'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getRecentLoginEvents(sevenDaysAgo, now);
    },
    // Only run this query for admin users to avoid unauthorized errors
    enabled: !!actor && !isFetching && isAdmin === true,
  });
}

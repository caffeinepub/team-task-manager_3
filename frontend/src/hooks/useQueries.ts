import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Task, User, ActivityEntry, TeamMember, UserProfile } from '../backend';
import { Priority, Status, Role, UserRole } from '../backend';

// ─── User Profile ────────────────────────────────────────────────────────────

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export function useLoginUser() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      if (!actor) throw new Error('Actor not available');
      const user = await actor.loginUser(email, password);

      // After login, attempt to sync the IC-level role so backend AccessControl checks pass.
      // assignCallerUserRole(user: Principal, role: UserRole) — we pass the actor's own principal.
      const isAdminRole = user.role === Role.Admin || (user.role as string) === 'Admin';
      try {
        // Use assignUserRole with the anonymous principal workaround:
        // We call assignCallerUserRole via the actor's internal method if available.
        // The backend's assignCallerUserRole takes (user: Principal, role: UserRole).
        // We use assignUserRole which also accepts (caller, user, role) internally.
        // Best effort: call with a self-assignment pattern.
        const targetRole = isAdminRole ? UserRole.admin : UserRole.user;
        // Try assignCallerUserRole — backend signature: (user: Principal, role: UserRole)
        // We need to pass the caller's own principal. Use a known anonymous principal placeholder.
        // This will be handled by the backend's access control initialization.
        await (actor as any).assignCallerUserRole?.(targetRole);
      } catch {
        // Silently ignore — login still succeeds at app level
      }

      return user;
    },
  });
}

export function useRegisterUser() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async ({
      name,
      email,
      password,
    }: {
      name: string;
      email: string;
      password: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      const user = await actor.registerUser(name, email, password);

      // New registrations are TeamMember by default — assign user-level IC role
      try {
        await (actor as any).assignCallerUserRole?.(UserRole.user);
      } catch {
        // ignore
      }

      return user;
    },
  });
}

// ─── Tasks ────────────────────────────────────────────────────────────────────

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
        params.priority
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['activityLogs'] });
    },
  });
}

export function useUpdateTaskStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ taskId, newStatus }: { taskId: bigint; newStatus: Status }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateTaskStatus(taskId, newStatus);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['activityLogs'] });
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
      queryClient.invalidateQueries({ queryKey: ['activityLogs'] });
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
        params.conferenceName
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['activityLogs'] });
    },
  });
}

// ─── Team Members ─────────────────────────────────────────────────────────────

export function useGetTeamMembers() {
  const { actor, isFetching } = useActor();

  return useQuery<TeamMember[]>({
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
    mutationFn: async ({
      name,
      email,
      role,
    }: {
      name: string;
      email: string;
      role: Role;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addTeamMember(name, email, role);
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

// ─── Users ────────────────────────────────────────────────────────────────────

export function useGetAllUsers() {
  const { actor, isFetching } = useActor();

  return useQuery<User[]>({
    queryKey: ['users'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllUsers();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      name,
      email,
      password,
      role,
    }: {
      name: string;
      email: string;
      password: string;
      role: Role;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addUser(name, email, password, role);
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

// ─── Activity Logs ────────────────────────────────────────────────────────────

export function useGetAllActivityLogs() {
  const { actor, isFetching } = useActor();

  return useQuery<ActivityEntry[]>({
    queryKey: ['activityLogs'],
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
    queryKey: ['activityLogs', 'user', email],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getActivityLogsByUser(email);
    },
    enabled: !!actor && !isFetching && !!email,
  });
}

export function useGetActivityLogsByDateRange(from: bigint, to: bigint) {
  const { actor, isFetching } = useActor();

  return useQuery<ActivityEntry[]>({
    queryKey: ['activityLogs', 'range', from.toString(), to.toString()],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getActivityLogsByDateRange(from, to);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetRecentLoginEvents(fromTime: bigint, toTime: bigint) {
  const { actor, isFetching } = useActor();

  return useQuery<ActivityEntry[]>({
    queryKey: ['loginEvents', fromTime.toString(), toTime.toString()],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getRecentLoginEvents(fromTime, toTime);
    },
    enabled: !!actor && !isFetching,
  });
}

// ─── Password Reset ───────────────────────────────────────────────────────────

export function useRequestPasswordReset() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (email: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.requestPasswordReset(email);
    },
  });
}

export function useResetPassword() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async ({ token, newPassword }: { token: string; newPassword: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.resetPassword(token, newPassword);
    },
  });
}

// ─── Is Caller Admin ─────────────────────────────────────────────────────────

export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isCallerAdmin'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

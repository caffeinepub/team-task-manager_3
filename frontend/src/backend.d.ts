import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface TeamMember {
    id: bigint;
    name: string;
    claimedBy?: Principal;
}
export interface Task {
    id: bigint;
    startTime?: bigint;
    status: TaskStatus;
    title: string;
    endTime?: bigint;
    conference: string;
    createdAt: bigint;
    createdBy: Principal;
    description?: string;
    deadline?: bigint;
    priority: Priority;
    assignees: Array<string>;
}
export interface UserProfile {
    name: string;
}
export enum Priority {
    Low = "Low",
    High = "High",
    Medium = "Medium"
}
export enum TaskStatus {
    Done = "Done",
    ToDo = "ToDo",
    InProgress = "InProgress"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addTeamMember(name: string): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    claimTeamMember(memberId: bigint): Promise<void>;
    createTask(title: string, description: string | null, assignees: Array<string>, deadline: bigint | null, startTime: bigint | null, endTime: bigint | null, priority: Priority, conference: string): Promise<Task>;
    deleteTask(taskId: bigint): Promise<void>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getTasks(): Promise<Array<Task>>;
    getTasksByAssignee(assignee: string): Promise<Array<Task>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    listTeamMembers(): Promise<Array<TeamMember>>;
    removeTeamMember(memberId: bigint): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateTask(taskId: bigint, title: string, description: string | null, assignees: Array<string>, deadline: bigint | null, startTime: bigint | null, endTime: bigint | null, priority: Priority, conference: string): Promise<void>;
    updateTaskStatus(taskId: bigint, newStatus: TaskStatus): Promise<void>;
}

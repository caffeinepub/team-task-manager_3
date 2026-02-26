import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface User {
    id: bigint;
    name: string;
    createdAt: bigint;
    role: Role;
    email: string;
    passwordHash: string;
}
export interface Task {
    id: bigint;
    status: Status;
    title: string;
    assignedTo: string;
    createdAt: bigint;
    conferenceName?: string;
    description?: string;
    deadline: bigint;
    priority: Priority;
}
export interface ActivityEntry {
    id: bigint;
    actorName: string;
    actionType: Variant_Login_StatusChanged_TaskEdited_TaskCreated_TaskDeleted;
    taskTitle: string;
    description: string;
    taskId: bigint;
    timestamp: bigint;
    actorEmail: string;
}
export interface UserProfile {
    name: string;
    role: Role;
    email: string;
}
export enum Priority {
    Low = "Low",
    High = "High",
    Medium = "Medium"
}
export enum Role {
    Admin = "Admin",
    TeamMember = "TeamMember"
}
export enum Status {
    CarryForward = "CarryForward",
    InProgress = "InProgress",
    Completed = "Completed",
    Pending = "Pending"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export enum Variant_Login_StatusChanged_TaskEdited_TaskCreated_TaskDeleted {
    Login = "Login",
    StatusChanged = "StatusChanged",
    TaskEdited = "TaskEdited",
    TaskCreated = "TaskCreated",
    TaskDeleted = "TaskDeleted"
}
export interface backendInterface {
    addTeamMember(name: string): Promise<void>;
    addUser(name: string, email: string, password: string, role: Role): Promise<User>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    assignUserRole(user: Principal, role: UserRole): Promise<void>;
    createTask(title: string, conferenceName: string | null, description: string | null, assignedTo: string, deadline: bigint, priority: Priority): Promise<Task>;
    deleteTask(taskId: bigint): Promise<void>;
    deleteUser(userEmail: string): Promise<void>;
    editTask(taskId: bigint, title: string, description: string | null, assignedTo: string, deadline: bigint, priority: Priority, conferenceName: string | null): Promise<Task>;
    getActivityLogsByDateRange(from: bigint, to: bigint): Promise<Array<ActivityEntry>>;
    getActivityLogsByTask(taskId: bigint): Promise<Array<ActivityEntry>>;
    getActivityLogsByUser(email: string): Promise<Array<ActivityEntry>>;
    getAllActivityLogs(): Promise<Array<ActivityEntry>>;
    getAllTasks(): Promise<Array<Task>>;
    getAllUsers(): Promise<Array<User>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getRecentLoginEvents(fromTime: bigint, toTime: bigint): Promise<Array<ActivityEntry>>;
    getTasksByAssignee(assignee: string): Promise<Array<Task>>;
    getTeamMembers(): Promise<Array<string>>;
    getUserByEmail(email: string): Promise<User | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    loginUser(email: string, password: string): Promise<User>;
    registerUser(name: string, email: string, password: string): Promise<User>;
    removeTeamMember(name: string): Promise<void>;
    requestPasswordReset(email: string): Promise<string>;
    resetPassword(token: string, newPassword: string): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateTaskStatus(taskId: bigint, newStatus: Status): Promise<void>;
}

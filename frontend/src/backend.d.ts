import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
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
export enum Priority {
    Low = "Low",
    High = "High",
    Medium = "Medium"
}
export enum Status {
    CarryForward = "CarryForward",
    InProgress = "InProgress",
    Completed = "Completed",
    Pending = "Pending"
}
export interface backendInterface {
    addTeamMember(name: string): Promise<void>;
    createTask(id: bigint, title: string, conferenceName: string | null, description: string | null, assignedTo: string, deadline: bigint, priority: Priority): Promise<void>;
    deleteTask(taskId: bigint): Promise<void>;
    getAllTasks(): Promise<Array<Task>>;
    getTasksByAssignee(assignee: string): Promise<Array<Task>>;
    getTeamMembers(): Promise<Array<string>>;
    removeTeamMember(name: string): Promise<void>;
    updateTaskStatus(taskId: bigint, newStatus: Status): Promise<void>;
}

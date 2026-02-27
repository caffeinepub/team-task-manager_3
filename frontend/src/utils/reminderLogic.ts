import { Task, TaskStatus } from '../backend';

export function isTaskOverdue(task: Task): boolean {
  if (task.status === TaskStatus.Done) return false;
  if (!task.deadline) return false;
  const deadlineMs = Number(task.deadline) / 1_000_000;
  return deadlineMs < Date.now();
}

export function isTaskDueSoon(task: Task, withinMs: number): boolean {
  if (task.status === TaskStatus.Done) return false;
  if (!task.deadline) return false;
  const deadlineMs = Number(task.deadline) / 1_000_000;
  const now = Date.now();
  return deadlineMs > now && deadlineMs - now <= withinMs;
}

export function isTaskDueWithin24Hours(task: Task): boolean {
  if (task.status === TaskStatus.Done) return false;
  if (!task.deadline) return false;
  const deadlineMs = Number(task.deadline) / 1_000_000;
  const now = Date.now();
  return deadlineMs > now && deadlineMs - now <= 24 * 60 * 60 * 1000;
}

export function getTaskReminderMessage(task: Task): string | null {
  if (!task.deadline) return null;
  if (isTaskOverdue(task)) {
    const overdueDays = Math.floor((Date.now() - Number(task.deadline) / 1_000_000) / (1000 * 60 * 60 * 24));
    return `"${task.title}" is ${overdueDays > 0 ? `${overdueDays}d ` : ''}overdue`;
  }
  if (isTaskDueSoon(task, 60 * 60 * 1000)) {
    return `"${task.title}" is due within 1 hour`;
  }
  if (isTaskDueWithin24Hours(task)) {
    return `"${task.title}" is due within 24 hours`;
  }
  return null;
}

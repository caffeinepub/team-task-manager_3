import { type Task, Status } from '../backend';

const ONE_HOUR_MS = 60 * 60 * 1000;
const ONE_DAY_MS = 24 * ONE_HOUR_MS;

export function isTaskOverdue(task: Task): boolean {
  if (task.status === Status.Completed) return false;
  const deadlineMs = Number(task.deadline) / 1_000_000;
  return deadlineMs < Date.now();
}

export function isTaskDueWithinOneHour(task: Task): boolean {
  if (task.status === Status.Completed) return false;
  const now = Date.now();
  const deadlineMs = Number(task.deadline) / 1_000_000;
  const diff = deadlineMs - now;
  return diff > 0 && diff <= ONE_HOUR_MS;
}

export function isTaskDueWithinTwentyFourHours(task: Task): boolean {
  if (task.status === Status.Completed) return false;
  const now = Date.now();
  const deadlineMs = Number(task.deadline) / 1_000_000;
  const diff = deadlineMs - now;
  return diff > ONE_HOUR_MS && diff <= ONE_DAY_MS;
}

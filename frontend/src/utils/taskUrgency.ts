import { type Task, Status } from '../backend';

export type UrgencyLevel = 'overdue' | 'critical' | 'warning' | 'normal' | 'completed';

const ONE_HOUR_MS = 60 * 60 * 1000;
const ONE_DAY_MS = 24 * ONE_HOUR_MS;
const THREE_DAYS_MS = 3 * ONE_DAY_MS;

export function getUrgencyLevel(task: Task): UrgencyLevel {
  if (task.status === Status.Completed) return 'completed';

  const now = Date.now();
  // Backend stores nanoseconds (ICP Time.now() returns nanoseconds)
  const deadlineMs = Number(task.deadline) / 1_000_000;
  const diff = deadlineMs - now;

  if (diff < 0) return 'overdue';
  if (diff <= ONE_HOUR_MS) return 'critical';
  if (diff <= ONE_DAY_MS) return 'warning';
  return 'normal';
}

export function getCardClasses(urgency: UrgencyLevel): string {
  switch (urgency) {
    case 'overdue':
      return 'border-red-500/60 bg-red-500/5';
    case 'critical':
      return 'border-orange-500/60 bg-orange-500/5';
    case 'warning':
      return 'border-yellow-500/50 bg-yellow-500/5';
    case 'completed':
      return 'border-border/40 bg-muted/20 opacity-70';
    default:
      return 'border-border/60 bg-card';
  }
}

export function getUrgencyBadgeClasses(urgency: UrgencyLevel): string {
  switch (urgency) {
    case 'overdue':
      return 'bg-red-500/20 text-red-400 border-red-500/30';
    case 'critical':
      return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
    case 'warning':
      return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    case 'completed':
      return 'bg-muted/40 text-muted-foreground border-border/30';
    default:
      return 'bg-primary/10 text-primary border-primary/20';
  }
}

export function getUrgencyLabel(urgency: UrgencyLevel): string {
  switch (urgency) {
    case 'overdue': return 'Overdue';
    case 'critical': return 'Due < 1hr';
    case 'warning': return 'Due < 24hr';
    case 'completed': return 'Done';
    default: return 'On Track';
  }
}

export function isOverdue(task: Task): boolean {
  if (task.status === Status.Completed) return false;
  const deadlineMs = Number(task.deadline) / 1_000_000;
  return deadlineMs < Date.now();
}

export function isDueWithinOneHour(task: Task): boolean {
  if (task.status === Status.Completed) return false;
  const now = Date.now();
  const deadlineMs = Number(task.deadline) / 1_000_000;
  const diff = deadlineMs - now;
  return diff > 0 && diff <= ONE_HOUR_MS;
}

export function isDueWithinTwentyFourHours(task: Task): boolean {
  if (task.status === Status.Completed) return false;
  const now = Date.now();
  const deadlineMs = Number(task.deadline) / 1_000_000;
  const diff = deadlineMs - now;
  return diff > ONE_HOUR_MS && diff <= ONE_DAY_MS;
}

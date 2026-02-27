import { Task, TaskStatus } from '../backend';

export type UrgencyLevel = 'overdue' | 'urgent' | 'soon' | 'normal' | 'completed';

export function getUrgencyLevel(task: Task): UrgencyLevel {
  if (task.status === TaskStatus.Done) return 'completed';
  if (!task.deadline) return 'normal';

  const deadlineMs = Number(task.deadline) / 1_000_000;
  const now = Date.now();
  const diff = deadlineMs - now;

  if (diff < 0) return 'overdue';
  if (diff < 60 * 60 * 1000) return 'urgent';       // within 1 hour
  if (diff < 24 * 60 * 60 * 1000) return 'soon';    // within 24 hours
  return 'normal';
}

export function getUrgencyColor(level: UrgencyLevel): string {
  switch (level) {
    case 'overdue': return 'text-red-400';
    case 'urgent': return 'text-orange-400';
    case 'soon': return 'text-yellow-400';
    case 'normal': return 'text-muted-foreground';
    case 'completed': return 'text-green-400';
  }
}

export function getUrgencyBg(level: UrgencyLevel): string {
  switch (level) {
    case 'overdue': return 'bg-red-500/10 border-red-500/20';
    case 'urgent': return 'bg-orange-500/10 border-orange-500/20';
    case 'soon': return 'bg-yellow-500/10 border-yellow-500/20';
    case 'normal': return 'bg-muted border-border';
    case 'completed': return 'bg-green-500/10 border-green-500/20';
  }
}

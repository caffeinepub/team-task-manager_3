import { type Task, Priority } from '../backend';

const PRIORITY_ORDER: Record<string, number> = {
  [Priority.High]: 0,
  [Priority.Medium]: 1,
  [Priority.Low]: 2,
};

export function sortTasksByDeadlineAndPriority(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    const deadlineDiff = Number(a.deadline) - Number(b.deadline);
    if (deadlineDiff !== 0) return deadlineDiff;
    return (PRIORITY_ORDER[a.priority] ?? 1) - (PRIORITY_ORDER[b.priority] ?? 1);
  });
}

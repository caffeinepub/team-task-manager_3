import { type Task, Priority } from '../backend';

function priorityOrder(p: Priority): number {
  switch (p) {
    case Priority.High: return 0;
    case Priority.Medium: return 1;
    case Priority.Low: return 2;
  }
}

export function sortTasks(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    // Tasks without deadlines go to the end
    if (!a.deadline && !b.deadline) return priorityOrder(a.priority) - priorityOrder(b.priority);
    if (!a.deadline) return 1;
    if (!b.deadline) return -1;
    const deadlineDiff = Number(a.deadline - b.deadline);
    if (deadlineDiff !== 0) return deadlineDiff;
    return priorityOrder(a.priority) - priorityOrder(b.priority);
  });
}

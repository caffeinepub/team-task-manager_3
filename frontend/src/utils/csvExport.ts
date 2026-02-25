import { type Task, Priority, Status } from '../backend';

function formatDeadline(deadline: bigint): string {
  const ms = Number(deadline) / 1_000_000;
  return new Date(ms).toLocaleString();
}

function formatCreatedAt(createdAt: bigint): string {
  const ms = Number(createdAt) / 1_000_000;
  return new Date(ms).toLocaleString();
}

function priorityLabel(p: Priority): string {
  switch (p) {
    case Priority.High: return 'High';
    case Priority.Medium: return 'Medium';
    case Priority.Low: return 'Low';
    default: return String(p);
  }
}

function statusLabel(s: Status): string {
  switch (s) {
    case Status.Pending: return 'Pending';
    case Status.InProgress: return 'In Progress';
    case Status.Completed: return 'Completed';
    case Status.CarryForward: return 'Carry Forward';
    default: return String(s);
  }
}

function escapeCsv(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function generateCsv(tasks: Task[]): string {
  const headers = ['Task Title', 'Conference Name', 'Description', 'Assignee', 'Deadline', 'Priority', 'Status', 'Created At'];
  const rows = tasks.map(task => [
    escapeCsv(task.title),
    escapeCsv(task.conferenceName ?? ''),
    escapeCsv(task.description ?? ''),
    escapeCsv(task.assignedTo),
    escapeCsv(formatDeadline(task.deadline)),
    escapeCsv(priorityLabel(task.priority)),
    escapeCsv(statusLabel(task.status)),
    escapeCsv(formatCreatedAt(task.createdAt)),
  ]);
  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}

export function downloadCsv(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function filterTasksByCurrentWeek(tasks: Task[]): Task[] {
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setHours(0, 0, 0, 0);
  startOfWeek.setDate(now.getDate() - now.getDay());
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 7);

  return tasks.filter(task => {
    const deadlineMs = Number(task.deadline) / 1_000_000;
    return deadlineMs >= startOfWeek.getTime() && deadlineMs < endOfWeek.getTime();
  });
}

export function filterTasksByCurrentMonth(tasks: Task[]): Task[] {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  return tasks.filter(task => {
    const deadlineMs = Number(task.deadline) / 1_000_000;
    return deadlineMs >= startOfMonth.getTime() && deadlineMs < endOfMonth.getTime();
  });
}

export function filterTasksByCustomRange(tasks: Task[], startDate: Date, endDate: Date): Task[] {
  const start = startDate.getTime();
  // Include the full end day
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);
  const endMs = end.getTime();

  return tasks.filter(task => {
    const deadlineMs = Number(task.deadline) / 1_000_000;
    return deadlineMs >= start && deadlineMs <= endMs;
  });
}

export function exportCustomRangeTasks(tasks: Task[], startDate: Date, endDate: Date): void {
  const filtered = filterTasksByCustomRange(tasks, startDate, endDate);
  const csv = generateCsv(filtered);
  const startStr = startDate.toISOString().split('T')[0];
  const endStr = endDate.toISOString().split('T')[0];
  downloadCsv(csv, `tasks-${startStr}-to-${endStr}.csv`);
}

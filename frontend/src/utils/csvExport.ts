import { Task, TaskStatus, Priority } from '../backend';

function formatDate(deadline: bigint | undefined): string {
  if (!deadline) return '';
  const date = new Date(Number(deadline) / 1_000_000);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function priorityLabel(p: Priority): string {
  switch (p) {
    case Priority.High: return 'High';
    case Priority.Medium: return 'Medium';
    case Priority.Low: return 'Low';
  }
}

function statusLabel(s: TaskStatus): string {
  switch (s) {
    case TaskStatus.ToDo: return 'To Do';
    case TaskStatus.InProgress: return 'In Progress';
    case TaskStatus.Done: return 'Done';
  }
}

function escapeCsv(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function tasksToCsv(tasks: Task[]): string {
  const headers = ['Title', 'Description', 'Assignees', 'Deadline', 'Priority', 'Status', 'Conference'];
  const rows = tasks.map((task) => [
    escapeCsv(task.title),
    escapeCsv(task.description ?? ''),
    escapeCsv(task.assignees.join('; ')),
    escapeCsv(formatDate(task.deadline)),
    escapeCsv(priorityLabel(task.priority)),
    escapeCsv(statusLabel(task.status)),
    escapeCsv(task.conference),
  ]);
  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}

function downloadCsv(content: string, filename: string): void {
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

export function exportThisWeek(tasks: Task[]): void {
  const now = Date.now();
  const weekMs = 7 * 24 * 60 * 60 * 1000;
  const weekStart = now - weekMs;
  const filtered = tasks.filter((t) => {
    if (!t.deadline) return false;
    const ms = Number(t.deadline) / 1_000_000;
    return ms >= weekStart && ms <= now + weekMs;
  });
  downloadCsv(tasksToCsv(filtered), 'tasks-this-week.csv');
}

export function exportThisMonth(tasks: Task[]): void {
  const now = new Date();
  const filtered = tasks.filter((t) => {
    if (!t.deadline) return false;
    const date = new Date(Number(t.deadline) / 1_000_000);
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  });
  downloadCsv(tasksToCsv(filtered), 'tasks-this-month.csv');
}

export function exportDateRange(tasks: Task[], from: Date, to: Date): void {
  const fromMs = from.getTime();
  const toMs = to.getTime() + 24 * 60 * 60 * 1000; // inclusive end
  const filtered = tasks.filter((t) => {
    if (!t.deadline) return false;
    const ms = Number(t.deadline) / 1_000_000;
    return ms >= fromMs && ms <= toMs;
  });
  const fromStr = from.toISOString().slice(0, 10);
  const toStr = to.toISOString().slice(0, 10);
  downloadCsv(tasksToCsv(filtered), `tasks-${fromStr}-to-${toStr}.csv`);
}

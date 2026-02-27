import React from 'react';
import { Task, TaskStatus } from '../backend';
import TaskCard from './TaskCard';
import { CheckSquare, Clock, Circle } from 'lucide-react';

interface KanbanBoardProps {
  tasks: Task[];
  onStatusChange: (taskId: bigint, newStatus: TaskStatus) => void;
}

const columns = [
  {
    status: TaskStatus.ToDo,
    label: 'To Do',
    icon: Circle,
    headerClass: 'bg-slate-700/60 text-slate-100',
    badgeClass: 'bg-slate-500 text-white',
    emptyClass: 'text-slate-400',
  },
  {
    status: TaskStatus.InProgress,
    label: 'In Progress',
    icon: Clock,
    headerClass: 'bg-amber-700/60 text-amber-100',
    badgeClass: 'bg-amber-500 text-white',
    emptyClass: 'text-amber-400',
  },
  {
    status: TaskStatus.Done,
    label: 'Done',
    icon: CheckSquare,
    headerClass: 'bg-emerald-700/60 text-emerald-100',
    badgeClass: 'bg-emerald-500 text-white',
    emptyClass: 'text-emerald-400',
  },
];

export default function KanbanBoard({ tasks, onStatusChange }: KanbanBoardProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {columns.map(col => {
        const colTasks = tasks.filter(t => t.status === col.status);
        const Icon = col.icon;
        return (
          <div key={col.status} className="flex flex-col gap-3">
            <div className={`flex items-center justify-between px-3 py-2.5 rounded-xl ${col.headerClass}`}>
              <div className="flex items-center gap-2">
                <Icon className="w-4 h-4" />
                <span className="text-sm font-semibold">{col.label}</span>
              </div>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${col.badgeClass}`}>
                {colTasks.length}
              </span>
            </div>
            <div className="flex flex-col gap-2 min-h-[200px]">
              {colTasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32 rounded-xl border-2 border-dashed border-border">
                  <Icon className={`w-6 h-6 mb-1 ${col.emptyClass}`} />
                  <p className="text-xs text-muted-foreground">No tasks</p>
                </div>
              ) : (
                colTasks.map(task => (
                  <TaskCard
                    key={String(task.id)}
                    task={task}
                    onStatusChange={onStatusChange}
                    showStatusDropdown
                  />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

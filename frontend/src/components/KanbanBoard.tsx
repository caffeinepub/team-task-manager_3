import React from 'react';
import { Task, TaskStatus, TeamMember } from '../backend';
import TaskCard from './TaskCard';
import { CheckSquare, Clock, Circle } from 'lucide-react';

interface KanbanBoardProps {
  tasks: Task[];
  members: TeamMember[];
  isAdmin: boolean;
}

const columns = [
  {
    status: TaskStatus.ToDo,
    label: 'To Do',
    icon: <Circle size={14} />,
    headerBg: 'bg-slate-700/60',
    headerBorder: 'border-slate-600/50',
    headerText: 'text-slate-100',
    countBg: 'bg-slate-600',
    countText: 'text-white',
  },
  {
    status: TaskStatus.InProgress,
    label: 'In Progress',
    icon: <Clock size={14} />,
    headerBg: 'bg-blue-900/60',
    headerBorder: 'border-blue-700/50',
    headerText: 'text-blue-100',
    countBg: 'bg-blue-600',
    countText: 'text-white',
  },
  {
    status: TaskStatus.Done,
    label: 'Done',
    icon: <CheckSquare size={14} />,
    headerBg: 'bg-emerald-900/60',
    headerBorder: 'border-emerald-700/50',
    headerText: 'text-emerald-100',
    countBg: 'bg-emerald-600',
    countText: 'text-white',
  },
];

const emptyDotColors = {
  [TaskStatus.ToDo]: 'bg-slate-600 text-slate-300',
  [TaskStatus.InProgress]: 'bg-blue-900/50 text-blue-300',
  [TaskStatus.Done]: 'bg-emerald-900/50 text-emerald-300',
};

export default function KanbanBoard({ tasks, members, isAdmin }: KanbanBoardProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {columns.map((col) => {
        const colTasks = tasks.filter((t) => t.status === col.status);
        return (
          <div key={col.status} className="flex flex-col min-h-[400px]">
            {/* Column Header */}
            <div
              className={`flex items-center justify-between px-4 py-3 rounded-xl ${col.headerBg} border ${col.headerBorder} mb-3`}
            >
              <div className={`flex items-center gap-2 font-semibold text-sm ${col.headerText}`}>
                {col.icon}
                {col.label}
              </div>
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded-full ${col.countBg} ${col.countText} min-w-[22px] text-center`}
              >
                {colTasks.length}
              </span>
            </div>

            {/* Tasks */}
            <div className="flex-1 space-y-3">
              {colTasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-border rounded-2xl text-muted-foreground">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${emptyDotColors[col.status]}`}
                  >
                    {col.icon}
                  </div>
                  <p className="text-xs">No tasks</p>
                </div>
              ) : (
                colTasks.map((task) => (
                  <TaskCard
                    key={task.id.toString()}
                    task={task}
                    members={members}
                    isAdmin={isAdmin}
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

import React from 'react';
import { Calendar, User } from 'lucide-react';
import { Task } from '../backend';
import PriorityBadge from './PriorityBadge';
import StatusBadgeDropdown from './StatusBadgeDropdown';

interface TaskCardProps {
  task: Task;
  onStatusChange?: (taskId: bigint, newStatus: import('../backend').TaskStatus) => void;
  showStatusDropdown?: boolean;
}

export default function TaskCard({ task, onStatusChange, showStatusDropdown = false }: TaskCardProps) {
  const isDone = task.status === 'Done';

  const formatDeadline = (deadline?: bigint) => {
    if (!deadline) return null;
    const date = new Date(Number(deadline));
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className={`bg-card rounded-xl p-4 border border-border card-shadow hover:shadow-md transition-all ${isDone ? 'opacity-75' : ''}`}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className={`text-sm font-semibold text-foreground leading-snug ${isDone ? 'line-through text-muted-foreground' : ''}`}>
          {task.title}
        </h3>
        <PriorityBadge priority={task.priority} />
      </div>

      {task.description && (
        <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{task.description}</p>
      )}

      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-3">
          {task.assignees.length > 0 && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <User className="w-3 h-3" />
              <span>{task.assignees[0]}{task.assignees.length > 1 ? ` +${task.assignees.length - 1}` : ''}</span>
            </div>
          )}
          {task.deadline && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="w-3 h-3" />
              <span>{formatDeadline(task.deadline)}</span>
            </div>
          )}
        </div>
        {showStatusDropdown && onStatusChange ? (
          <StatusBadgeDropdown
            status={task.status}
            taskId={task.id}
            onStatusChange={onStatusChange}
          />
        ) : (
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
            task.status === 'Done'
              ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
              : task.status === 'InProgress'
              ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
              : 'bg-slate-500/15 text-slate-600 dark:text-slate-400'
          }`}>
            {task.status === 'InProgress' ? 'In Progress' : task.status === 'ToDo' ? 'To Do' : 'Done'}
          </span>
        )}
      </div>
    </div>
  );
}

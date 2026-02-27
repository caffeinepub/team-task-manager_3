import React, { useState } from 'react';
import { Calendar, Clock, Edit, ChevronDown, Building2 } from 'lucide-react';
import { Task, TaskStatus, Priority, TeamMember } from '../backend';
import StatusBadgeDropdown from './StatusBadgeDropdown';
import EditTaskModal from './EditTaskModal';

interface TaskCardProps {
  task: Task;
  members: TeamMember[];
  isAdmin: boolean;
}

function getInitials(name: string): string {
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
}

function formatDate(deadline: bigint | undefined): string {
  if (!deadline) return 'No deadline';
  const date = new Date(Number(deadline) / 1_000_000);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatTime(time: bigint | undefined): string {
  if (!time || time === 0n) return '';
  const date = new Date(Number(time) / 1_000_000);
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

function isOverdue(deadline: bigint | undefined, status: TaskStatus): boolean {
  if (!deadline) return false;
  return status !== TaskStatus.Done && Number(deadline) < Date.now() * 1_000_000;
}

function getPriorityConfig(priority: Priority) {
  switch (priority) {
    case Priority.High:
      return { label: '🔴 High', className: 'bg-red-600/25 text-red-200 border border-red-500/40' };
    case Priority.Medium:
      return { label: '🟡 Medium', className: 'bg-yellow-600/25 text-yellow-200 border border-yellow-500/40' };
    case Priority.Low:
      return { label: '🟢 Low', className: 'bg-emerald-600/25 text-emerald-200 border border-emerald-500/40' };
  }
}

export default function TaskCard({ task, members, isAdmin }: TaskCardProps) {
  const [editOpen, setEditOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const overdue = isOverdue(task.deadline, task.status);
  const priorityConfig = getPriorityConfig(task.priority);

  // task.assignees is string[] of names — display them directly
  const assigneeNames = task.assignees;

  const startTimeStr = formatTime(task.startTime);
  const endTimeStr = formatTime(task.endTime);

  return (
    <>
      <div
        className={`bg-card border rounded-2xl p-4 card-elevated hover:card-hover transition-all duration-200 ${
          overdue ? 'border-red-500/50' : 'border-border'
        }`}
      >
        {/* Conference badge */}
        {task.conference && task.conference.trim() !== '' && (
          <div className="flex items-center gap-1.5 mb-2">
            <Building2 size={11} className="text-primary/80 flex-shrink-0" />
            <span className="text-xs text-primary font-medium truncate">{task.conference}</span>
          </div>
        )}

        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex-1 min-w-0">
            <h3
              className={`font-semibold text-sm leading-snug ${
                task.status === TaskStatus.Done
                  ? 'line-through text-slate-400'
                  : 'text-foreground'
              }`}
            >
              {task.title}
            </h3>
          </div>
          <span
            className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${priorityConfig.className}`}
          >
            {priorityConfig.label}
          </span>
        </div>

        {/* Description (expandable) */}
        {task.description && (
          <div className="mb-3">
            <p
              className={`text-xs text-slate-300 leading-relaxed ${!expanded ? 'line-clamp-2' : ''}`}
            >
              {task.description}
            </p>
            {task.description.length > 80 && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="text-xs text-primary hover:text-primary/80 mt-1 flex items-center gap-0.5 transition-colors"
              >
                {expanded ? 'Less' : 'More'}
                <ChevronDown
                  size={12}
                  className={`transition-transform ${expanded ? 'rotate-180' : ''}`}
                />
              </button>
            )}
          </div>
        )}

        {/* Assignees */}
        {assigneeNames.length > 0 && (
          <div className="flex items-center gap-1 mb-3">
            <div className="flex -space-x-1.5">
              {assigneeNames.slice(0, 3).map((name) => (
                <div
                  key={name}
                  className="w-6 h-6 rounded-full bg-primary/30 border-2 border-card flex items-center justify-center"
                  title={name}
                >
                  <span className="text-primary-foreground text-[9px] font-bold">
                    {getInitials(name)}
                  </span>
                </div>
              ))}
              {assigneeNames.length > 3 && (
                <div className="w-6 h-6 rounded-full bg-muted border-2 border-card flex items-center justify-center">
                  <span className="text-foreground text-[9px] font-bold">
                    +{assigneeNames.length - 3}
                  </span>
                </div>
              )}
            </div>
            <span className="text-xs text-slate-300 ml-1">
              {assigneeNames.length === 1 ? assigneeNames[0] : `${assigneeNames.length} members`}
            </span>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-border/60">
          <div className="flex items-center gap-3 text-xs">
            {task.deadline && (
              <span
                className={`flex items-center gap-1 ${
                  overdue ? 'text-red-400 font-medium' : 'text-slate-300'
                }`}
              >
                <Calendar size={11} />
                {formatDate(task.deadline)}
              </span>
            )}
            {startTimeStr && endTimeStr && (
              <span className="flex items-center gap-1 text-slate-300">
                <Clock size={11} />
                {startTimeStr}–{endTimeStr}
              </span>
            )}
            {startTimeStr && !endTimeStr && (
              <span className="flex items-center gap-1 text-slate-300">
                <Clock size={11} />
                {startTimeStr}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {/* Clickable status badge dropdown — available to all users */}
            <StatusBadgeDropdown
              taskId={task.id}
              currentStatus={task.status}
              taskTitle={task.title}
            />
            {/* Edit button — admin only */}
            {isAdmin && (
              <button
                onClick={() => setEditOpen(true)}
                className="w-7 h-7 rounded-lg bg-muted hover:bg-primary/20 hover:text-primary text-slate-300 flex items-center justify-center transition-all duration-200"
                title="Edit task"
              >
                <Edit size={13} />
              </button>
            )}
          </div>
        </div>
      </div>

      <EditTaskModal
        open={editOpen}
        onOpenChange={setEditOpen}
        task={task}
        members={members}
      />
    </>
  );
}

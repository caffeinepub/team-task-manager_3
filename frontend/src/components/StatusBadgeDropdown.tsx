import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { TaskStatus } from '../backend';

interface StatusBadgeDropdownProps {
  status: TaskStatus;
  taskId: bigint;
  onStatusChange: (taskId: bigint, newStatus: TaskStatus) => void;
  disabled?: boolean;
}

const statusConfig: Record<TaskStatus, { label: string; classes: string }> = {
  [TaskStatus.ToDo]: {
    label: 'To Do',
    classes: 'bg-slate-500/15 text-slate-600 dark:text-slate-300',
  },
  [TaskStatus.InProgress]: {
    label: 'In Progress',
    classes: 'bg-amber-500/15 text-amber-600 dark:text-amber-300',
  },
  [TaskStatus.Done]: {
    label: 'Done',
    classes: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300',
  },
};

export default function StatusBadgeDropdown({ status, taskId, onStatusChange, disabled = false }: StatusBadgeDropdownProps) {
  const [open, setOpen] = useState(false);
  const config = statusConfig[status];

  return (
    <div className="relative">
      <button
        onClick={() => !disabled && setOpen(!open)}
        disabled={disabled}
        className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium transition-all ${config.classes} ${
          disabled ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-80 cursor-pointer'
        }`}
      >
        {config.label}
        {!disabled && <ChevronDown className="w-3 h-3" />}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 bg-popover border border-border rounded-xl shadow-lg z-50 overflow-hidden min-w-[120px]">
            {Object.entries(statusConfig).map(([key, cfg]) => (
              <button
                key={key}
                onClick={() => {
                  onStatusChange(taskId, key as TaskStatus);
                  setOpen(false);
                }}
                className={`w-full text-left px-3 py-2 text-xs font-medium text-foreground hover:bg-muted transition-colors ${
                  key === status ? 'bg-muted/50' : ''
                }`}
              >
                {cfg.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

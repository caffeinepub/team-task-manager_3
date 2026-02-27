import React, { useState } from 'react';
import { Check, ChevronDown, Loader2, Trash2 } from 'lucide-react';
import { TaskStatus } from '../backend';
import { useUpdateTaskStatus, useDeleteTask } from '../hooks/useQueries';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface StatusBadgeDropdownProps {
  taskId: bigint;
  currentStatus: TaskStatus;
  taskTitle: string;
}

const STATUS_CONFIG: Record<TaskStatus, { label: string; badgeClass: string; dotClass: string }> = {
  [TaskStatus.ToDo]: {
    label: 'To Do',
    badgeClass:
      'bg-slate-700 text-slate-100 border border-slate-500/60 hover:bg-slate-600',
    dotClass: 'bg-slate-300',
  },
  [TaskStatus.InProgress]: {
    label: 'In Progress',
    badgeClass:
      'bg-amber-700/80 text-amber-100 border border-amber-500/60 hover:bg-amber-700',
    dotClass: 'bg-amber-300',
  },
  [TaskStatus.Done]: {
    label: 'Done',
    badgeClass:
      'bg-emerald-700/80 text-emerald-100 border border-emerald-500/60 hover:bg-emerald-700',
    dotClass: 'bg-emerald-300',
  },
};

const STATUS_OPTIONS = [
  { value: TaskStatus.ToDo, label: 'To Do' },
  { value: TaskStatus.InProgress, label: 'In Progress' },
  { value: TaskStatus.Done, label: 'Done' },
];

export default function StatusBadgeDropdown({
  taskId,
  currentStatus,
  taskTitle,
}: StatusBadgeDropdownProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const updateStatus = useUpdateTaskStatus();
  const deleteTask = useDeleteTask();

  const config = STATUS_CONFIG[currentStatus] ?? STATUS_CONFIG[TaskStatus.ToDo];
  const isUpdating = updateStatus.isPending;
  const isDeleting = deleteTask.isPending;
  const isBusy = isUpdating || isDeleting;

  const handleStatusChange = async (newStatus: TaskStatus) => {
    if (newStatus === currentStatus) {
      setDropdownOpen(false);
      return;
    }
    setDropdownOpen(false);
    try {
      await updateStatus.mutateAsync({ taskId, newStatus });
      toast.success(`Status updated to ${STATUS_CONFIG[newStatus].label}`);
    } catch {
      toast.error('Failed to update status');
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteTask.mutateAsync(taskId);
      toast.success('Task deleted');
    } catch {
      toast.error('Failed to delete task');
    }
  };

  return (
    <>
      <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
        <DropdownMenuTrigger asChild>
          <button
            disabled={isBusy}
            className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium transition-all duration-200 cursor-pointer select-none disabled:opacity-60 disabled:cursor-not-allowed ${config.badgeClass}`}
            onClick={(e) => e.stopPropagation()}
          >
            {isBusy ? (
              <Loader2 size={10} className="animate-spin flex-shrink-0" />
            ) : (
              <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${config.dotClass}`} />
            )}
            {config.label}
            <ChevronDown
              size={10}
              className={`flex-shrink-0 transition-transform duration-200 ${
                dropdownOpen ? 'rotate-180' : ''
              }`}
            />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-40 bg-card border-border shadow-lg">
          {STATUS_OPTIONS.map((opt) => (
            <DropdownMenuItem
              key={opt.value}
              onClick={() => handleStatusChange(opt.value)}
              className="flex items-center justify-between text-xs cursor-pointer text-foreground"
            >
              <span>{opt.label}</span>
              {currentStatus === opt.value && (
                <Check size={12} className="text-primary" />
              )}
            </DropdownMenuItem>
          ))}

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              setDropdownOpen(false);
              setDeleteDialogOpen(true);
            }}
            className="flex items-center gap-2 text-xs cursor-pointer text-red-400 hover:text-red-300 focus:text-red-300"
          >
            <Trash2 size={12} />
            Delete task
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">Delete Task</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Are you sure you want to delete{' '}
              <span className="font-semibold text-foreground">"{taskTitle}"</span>? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-muted text-foreground border-border hover:bg-secondary">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <Loader2 size={14} className="animate-spin mr-1.5" />
              ) : (
                <Trash2 size={14} className="mr-1.5" />
              )}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

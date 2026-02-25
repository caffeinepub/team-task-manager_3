import { useState } from 'react';
import { Calendar, User, Trash2, ChevronDown, ChevronUp, Building2 } from 'lucide-react';
import { type Task, Status } from '../backend';
import { getUrgencyLevel, getCardClasses, getUrgencyBadgeClasses, getUrgencyLabel } from '../utils/taskUrgency';
import PriorityBadge from './PriorityBadge';
import TaskStatusControl from './TaskStatusControl';
import { useDeleteTask } from '../hooks/useQueries';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';

interface TaskCardProps {
  task: Task;
  showAssignee?: boolean;
}

function formatDeadline(deadline: bigint): string {
  const ms = Number(deadline) / 1_000_000;
  return new Date(ms).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function TaskCard({ task, showAssignee = true }: TaskCardProps) {
  const [expanded, setExpanded] = useState(false);
  const urgency = getUrgencyLevel(task);
  const cardClasses = getCardClasses(urgency);
  const urgencyBadgeClasses = getUrgencyBadgeClasses(urgency);
  const isCompleted = task.status === Status.Completed;
  const deleteTask = useDeleteTask();

  const handleDelete = async () => {
    try {
      await deleteTask.mutateAsync(task.id);
      toast.success('Task deleted');
    } catch {
      toast.error('Failed to delete task');
    }
  };

  return (
    <div
      className={`rounded-xl border p-4 transition-all duration-200 hover:shadow-card-hover animate-fade-in ${cardClasses}`}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3
            className={`font-display font-semibold text-sm leading-snug truncate ${
              isCompleted ? 'line-through text-muted-foreground' : 'text-foreground'
            }`}
          >
            {task.title}
          </h3>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <PriorityBadge priority={task.priority} />
          <span className={`text-[10px] px-1.5 py-0.5 rounded-full border font-medium ${urgencyBadgeClasses}`}>
            {getUrgencyLabel(urgency)}
          </span>
        </div>
      </div>

      {/* Meta row */}
      <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
        {showAssignee && (
          <span className="flex items-center gap-1">
            <User className="h-3 w-3" />
            {task.assignedTo}
          </span>
        )}
        <span className="flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          {formatDeadline(task.deadline)}
        </span>
        {task.conferenceName && (
          <span className="flex items-center gap-1">
            <Building2 className="h-3 w-3" />
            {task.conferenceName}
          </span>
        )}
      </div>

      {/* Description toggle */}
      {task.description && (
        <button
          onClick={() => setExpanded(v => !v)}
          className="mt-2 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          {expanded ? 'Hide' : 'Show'} description
        </button>
      )}
      {expanded && task.description && (
        <p className="mt-2 text-xs text-muted-foreground leading-relaxed border-t border-border/30 pt-2">
          {task.description}
        </p>
      )}

      {/* Footer row */}
      <div className="mt-3 flex items-center justify-between gap-2">
        <TaskStatusControl taskId={task.id} currentStatus={task.status} />
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Task</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{task.title}"? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}

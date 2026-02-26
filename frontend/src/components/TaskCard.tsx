import { useState } from 'react';
import { Trash2, ChevronDown, ChevronUp, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
import PriorityBadge from './PriorityBadge';
import TaskStatusControl from './TaskStatusControl';
import { getUrgencyLevel, getCardClasses, getUrgencyBadgeClasses, getUrgencyLabel } from '../utils/taskUrgency';
import { Status, type Task } from '../backend';

interface TaskCardProps {
  task: Task;
  showAssignee?: boolean;
  onDelete?: (taskId: bigint) => void;
  onEdit?: (task: Task) => void;
}

function formatDeadline(deadline: bigint): string {
  const ms = Number(deadline) / 1_000_000;
  return new Date(ms).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

function formatCreatedAt(createdAt: bigint): string {
  if (!createdAt || createdAt === BigInt(0)) return '';
  const ms = Number(createdAt) / 1_000_000;
  return new Date(ms).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export default function TaskCard({ task, showAssignee = true, onDelete, onEdit }: TaskCardProps) {
  const [showDescription, setShowDescription] = useState(false);

  const urgency = getUrgencyLevel(task);
  const cardClasses = getCardClasses(urgency);
  const urgencyBadgeClasses = getUrgencyBadgeClasses(urgency);
  const urgencyLabel = getUrgencyLabel(urgency);

  const isCarryForward = task.status === Status.CarryForward;
  const isCompleted = task.status === Status.Completed;
  const createdAtStr = formatCreatedAt(task.createdAt);

  return (
    <div className={`rounded-xl border p-4 transition-all duration-200 hover:shadow-sm animate-fade-in ${
      isCarryForward
        ? 'border-carry-forward/40 bg-carry-forward/5'
        : cardClasses
    }`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className={`font-semibold text-sm leading-snug truncate ${
              isCompleted ? 'line-through text-muted-foreground' : 'text-foreground'
            }`}>
              {task.title}
            </h3>
            <PriorityBadge priority={task.priority} />
            {isCarryForward ? (
              <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-carry-forward/20 text-carry-forward border border-carry-forward/30">
                Carry Forward
              </span>
            ) : (
              <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${urgencyBadgeClasses}`}>
                {urgencyLabel}
              </span>
            )}
          </div>

          {task.conferenceName && (
            <p className="text-xs text-muted-foreground mt-1">
              📅 {task.conferenceName}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-muted-foreground">
            {showAssignee && <span>👤 {task.assignedTo}</span>}
            <span>⏰ {formatDeadline(task.deadline)}</span>
            {createdAtStr && <span>📌 Created {createdAtStr}</span>}
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {task.description && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setShowDescription(v => !v)}
            >
              {showDescription ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </Button>
          )}

          {onEdit && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-blue-500 hover:text-blue-600"
              onClick={() => onEdit(task)}
              title="Edit task"
            >
              <Edit2 size={14} />
            </Button>
          )}

          {onDelete && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive"
                  title="Delete task"
                >
                  <Trash2 size={14} />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Task?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete "{task.title}"? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    onClick={() => onDelete(task.id)}
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>

      {showDescription && task.description && (
        <div className="mt-3 pt-3 border-t border-border/50">
          <p className="text-sm text-muted-foreground">{task.description}</p>
        </div>
      )}

      <div className="mt-3 pt-3 border-t border-border/50">
        <TaskStatusControl taskId={task.id} currentStatus={task.status} />
      </div>
    </div>
  );
}

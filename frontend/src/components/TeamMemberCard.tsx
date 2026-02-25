import { useState } from 'react';
import { ChevronDown, ChevronUp, User, CheckCircle2, Clock, RotateCcw, Loader2 } from 'lucide-react';
import { Status, type Task } from '../backend';
import { useGetTasksByAssignee } from '../hooks/useQueries';
import { sortTasksByDeadlineAndPriority } from '../utils/taskSorting';
import TaskCard from './TaskCard';

interface StatusSummaryProps {
  tasks: Task[];
}

function StatusSummary({ tasks }: StatusSummaryProps) {
  const pending = tasks.filter(t => t.status === Status.Pending).length;
  const inProgress = tasks.filter(t => t.status === Status.InProgress).length;
  const completed = tasks.filter(t => t.status === Status.Completed).length;
  const carryForward = tasks.filter(t => t.status === Status.CarryForward).length;

  return (
    <div className="flex flex-wrap items-center gap-2 mt-1">
      {pending > 0 && (
        <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-muted/60 text-muted-foreground border border-border/40">
          <Clock className="h-2.5 w-2.5" />
          {pending} Pending
        </span>
      )}
      {inProgress > 0 && (
        <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/20">
          <span className="h-1.5 w-1.5 rounded-full bg-blue-400 inline-block" />
          {inProgress} In Progress
        </span>
      )}
      {completed > 0 && (
        <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-green-500/15 text-green-400 border border-green-500/20">
          <CheckCircle2 className="h-2.5 w-2.5" />
          {completed} Completed
        </span>
      )}
      {carryForward > 0 && (
        <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-carry-forward/15 text-carry-forward border border-carry-forward/20">
          <RotateCcw className="h-2.5 w-2.5" />
          {carryForward} Carry Forward
        </span>
      )}
      {tasks.length === 0 && (
        <span className="text-[10px] text-muted-foreground">No tasks assigned</span>
      )}
    </div>
  );
}

interface TeamMemberCardProps {
  memberName: string;
}

export default function TeamMemberCard({ memberName }: TeamMemberCardProps) {
  const [expanded, setExpanded] = useState(false);
  const { data: tasks = [], isLoading } = useGetTasksByAssignee(memberName);
  const sortedTasks = sortTasksByDeadlineAndPriority(tasks);

  const initials = memberName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="rounded-xl border border-border/50 bg-card overflow-hidden transition-all duration-200">
      {/* Member header — always visible */}
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 hover:bg-secondary/30 transition-colors text-left"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-9 w-9 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold font-display shrink-0">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="font-display font-semibold text-sm text-foreground truncate">{memberName}</p>
            {isLoading ? (
              <span className="text-[10px] text-muted-foreground">Loading tasks…</span>
            ) : (
              <StatusSummary tasks={tasks} />
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {isLoading && <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />}
          <span className="text-[10px] text-muted-foreground font-medium bg-secondary/60 px-2 py-0.5 rounded-full">
            {tasks.length} task{tasks.length !== 1 ? 's' : ''}
          </span>
          {expanded ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </button>

      {/* Expanded task list */}
      {expanded && (
        <div className="border-t border-border/40 bg-secondary/10 px-4 py-3 space-y-2.5 animate-fade-in">
          {isLoading ? (
            <div className="flex items-center justify-center py-6 gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Loading tasks…</span>
            </div>
          ) : sortedTasks.length === 0 ? (
            <div className="text-center py-6">
              <User className="h-7 w-7 text-muted-foreground/40 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No tasks assigned to {memberName}</p>
            </div>
          ) : (
            sortedTasks.map(task => (
              <TaskCard key={String(task.id)} task={task} showAssignee={false} />
            ))
          )}
        </div>
      )}
    </div>
  );
}

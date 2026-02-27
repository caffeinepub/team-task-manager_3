import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { TeamMember, Task, TaskStatus } from '../backend';

interface TeamMemberCardProps {
  member: TeamMember;
  tasks?: Task[];
  showTasks?: boolean;
  onRemove?: (id: bigint) => void;
}

export default function TeamMemberCard({ member, tasks = [], showTasks = false, onRemove }: TeamMemberCardProps) {
  const [expanded, setExpanded] = useState(false);

  const doneTasks = tasks.filter(t => t.status === TaskStatus.Done);
  const pendingTasks = tasks.filter(t => t.status !== TaskStatus.Done);

  const initials = member.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="bg-card rounded-xl border border-border p-4 card-shadow hover:shadow-md transition-all">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
          <span className="text-primary font-bold text-sm">{initials}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground truncate">{member.name}</p>
          <p className="text-xs text-muted-foreground">
            {member.claimedBy ? 'Active' : 'Unclaimed'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {showTasks && tasks.length > 0 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          )}
          {onRemove && (
            <button
              onClick={() => onRemove(member.id)}
              className="text-xs text-destructive hover:text-destructive/80 transition-colors px-2 py-1 rounded-lg hover:bg-destructive/10"
            >
              Remove
            </button>
          )}
        </div>
      </div>

      <div className="flex gap-4 mt-3 pt-3 border-t border-border">
        <div className="text-center">
          <p className="text-lg font-bold text-foreground">{doneTasks.length}</p>
          <p className="text-xs text-muted-foreground">Done</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-foreground">{pendingTasks.length}</p>
          <p className="text-xs text-muted-foreground">Pending</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-foreground">{tasks.length}</p>
          <p className="text-xs text-muted-foreground">Total</p>
        </div>
      </div>

      {expanded && tasks.length > 0 && (
        <div className="mt-3 space-y-2">
          {tasks.map(task => (
            <div key={String(task.id)} className="flex items-center gap-2 text-xs">
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                task.status === TaskStatus.Done ? 'bg-emerald-500' :
                task.status === TaskStatus.InProgress ? 'bg-amber-500' : 'bg-slate-400'
              }`} />
              <span className={`text-foreground truncate ${task.status === TaskStatus.Done ? 'line-through text-muted-foreground' : ''}`}>
                {task.title}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

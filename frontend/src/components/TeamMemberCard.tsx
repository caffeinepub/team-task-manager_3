import React, { useState } from 'react';
import { ChevronDown, ChevronUp, User, CheckCircle, Clock } from 'lucide-react';
import { TeamMember } from '../backend';
import { useGetTasksByAssignee } from '../hooks/useQueries';
import { TaskStatus } from '../backend';

interface TeamMemberCardProps {
  member: TeamMember;
  isAdmin: boolean;
}

function getInitials(name: string): string {
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
}

const avatarColors = [
  'bg-purple-500/20 text-purple-300 border-purple-500/30',
  'bg-blue-500/20 text-blue-300 border-blue-500/30',
  'bg-green-500/20 text-green-300 border-green-500/30',
  'bg-orange-500/20 text-orange-300 border-orange-500/30',
  'bg-pink-500/20 text-pink-300 border-pink-500/30',
];

export default function TeamMemberCard({ member, isAdmin }: TeamMemberCardProps) {
  const [expanded, setExpanded] = useState(false);
  const { data: tasks = [] } = useGetTasksByAssignee(member.name);

  const colorClass = avatarColors[Number(member.id) % avatarColors.length];
  const completedTasks = tasks.filter((t) => t.status === TaskStatus.Done).length;
  const pendingTasks = tasks.filter((t) => t.status !== TaskStatus.Done).length;

  return (
    <div className="bg-card border border-border rounded-2xl p-5 card-elevated hover:card-hover transition-all duration-200">
      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center flex-shrink-0 ${colorClass}`}>
          <span className="text-sm font-bold">{getInitials(member.name)}</span>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground truncate">{member.name}</h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium bg-muted text-muted-foreground border border-border">
              <User size={10} />
              Member
            </span>
            <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${
              member.claimedBy
                ? 'bg-green-500/15 text-green-400'
                : 'bg-muted text-muted-foreground'
            }`}>
              {member.claimedBy ? '● Active' : '○ Unclaimed'}
            </span>
          </div>
        </div>
      </div>

      {/* Task Stats */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="bg-muted rounded-xl p-2.5 text-center">
          <div className="flex items-center justify-center gap-1 text-green-400 mb-0.5">
            <CheckCircle size={12} />
            <span className="text-sm font-bold">{completedTasks}</span>
          </div>
          <p className="text-xs text-muted-foreground">Done</p>
        </div>
        <div className="bg-muted rounded-xl p-2.5 text-center">
          <div className="flex items-center justify-center gap-1 text-blue-400 mb-0.5">
            <Clock size={12} />
            <span className="text-sm font-bold">{pendingTasks}</span>
          </div>
          <p className="text-xs text-muted-foreground">Pending</p>
        </div>
      </div>

      {/* Expand for task details (admin only) */}
      {isAdmin && tasks.length > 0 && (
        <div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors w-full justify-center py-1"
          >
            {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            {expanded ? 'Hide Tasks' : `View ${tasks.length} Task${tasks.length !== 1 ? 's' : ''}`}
          </button>

          {expanded && (
            <div className="mt-3 pt-3 border-t border-border space-y-1.5">
              {tasks.slice(0, 5).map((task) => (
                <div key={task.id.toString()} className="flex items-center gap-2 text-xs">
                  <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                    task.status === TaskStatus.Done ? 'bg-green-400' :
                    task.status === TaskStatus.InProgress ? 'bg-blue-400' : 'bg-muted-foreground'
                  }`} />
                  <span className={`truncate ${task.status === TaskStatus.Done ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                    {task.title}
                  </span>
                </div>
              ))}
              {tasks.length > 5 && (
                <p className="text-xs text-muted-foreground text-center">+{tasks.length - 5} more</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

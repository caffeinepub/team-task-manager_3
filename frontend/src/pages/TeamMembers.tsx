import React, { useState } from 'react';
import { useGetTeamMembers, useGetAllTasks, useRemoveTeamMember } from '../hooks/useQueries';
import { useAuth } from '../hooks/useAuth';
import AddUserModal from '../components/AddUserModal';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { UserPlus, Trash2, ChevronDown, ChevronUp, CheckCircle2, Clock, AlertCircle, RotateCcw } from 'lucide-react';
import { Status } from '../backend';
import { toast } from 'sonner';

type MemberStats = {
  pending: number;
  inProgress: number;
  completed: number;
  carryForward: number;
};

function getMemberStats(memberName: string, tasks: any[]): MemberStats {
  const memberTasks = tasks.filter(t => t.assignedTo === memberName);
  return {
    pending: memberTasks.filter(t => t.status === Status.Pending).length,
    inProgress: memberTasks.filter(t => t.status === Status.InProgress).length,
    completed: memberTasks.filter(t => t.status === Status.Completed).length,
    carryForward: memberTasks.filter(t => t.status === Status.CarryForward).length,
  };
}

function getAvatarColor(name: string): string {
  const colors = [
    'bg-primary text-primary-foreground',
    'bg-secondary text-secondary-foreground',
    'bg-accent text-accent-foreground',
    'bg-emerald-500 text-white',
    'bg-blue-500 text-white',
    'bg-purple-500 text-white',
    'bg-rose-500 text-white',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

export default function TeamMembers() {
  const { isAdmin, currentUser } = useAuth();
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [expandedMember, setExpandedMember] = useState<string | null>(null);

  const { data: members = [], isLoading: membersLoading } = useGetTeamMembers();
  const { data: tasks = [], isLoading: tasksLoading } = useGetAllTasks();
  const removeTeamMember = useRemoveTeamMember();

  // Extra safety check: also check role string directly in case of enum serialization issues
  const userIsAdmin = isAdmin || (currentUser?.role as string) === 'Admin';

  const handleRemove = async (name: string) => {
    if (!confirm(`Remove ${name} from the team?`)) return;
    try {
      await removeTeamMember.mutateAsync(name);
      toast.success(`${name} removed from team`);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to remove member');
    }
  };

  const isLoading = membersLoading || tasksLoading;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Team Members</h1>
          <p className="text-muted-foreground mt-1">
            {members.length} member{members.length !== 1 ? 's' : ''} in your team
          </p>
        </div>
        {userIsAdmin && (
          <Button
            onClick={() => setAddModalOpen(true)}
            size="lg"
            className="gap-2 rounded-xl"
          >
            <UserPlus className="w-5 h-5" />
            Add Team Member
          </Button>
        )}
      </div>

      {/* Loading skeletons */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-40 rounded-2xl" />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && members.length === 0 && (
        <div className="text-center py-20 text-muted-foreground">
          <UserPlus className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p className="text-lg font-medium">No team members yet</p>
          {userIsAdmin && (
            <p className="text-sm mt-1">Click "Add Team Member" to get started</p>
          )}
        </div>
      )}

      {/* Member cards grid */}
      {!isLoading && members.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {members.map(member => {
            const stats = getMemberStats(member, tasks);
            const isExpanded = expandedMember === member;
            const memberTasks = tasks.filter(t => t.assignedTo === member);

            return (
              <div
                key={member}
                className="bg-card border border-border rounded-2xl shadow-card p-5 flex flex-col gap-3"
              >
                {/* Member header */}
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold shrink-0 ${getAvatarColor(member)}`}>
                    {member.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground truncate">{member}</p>
                    <p className="text-xs text-muted-foreground">{memberTasks.length} task{memberTasks.length !== 1 ? 's' : ''} assigned</p>
                  </div>
                  {userIsAdmin && (
                    <button
                      onClick={() => handleRemove(member)}
                      className="text-muted-foreground hover:text-destructive transition-colors p-1 rounded-lg hover:bg-destructive/10"
                      title="Remove member"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="bg-muted/50 rounded-xl p-2">
                    <p className="text-xs text-muted-foreground">Pending</p>
                    <p className="font-bold text-foreground">{stats.pending}</p>
                  </div>
                  <div className="bg-blue-500/10 rounded-xl p-2">
                    <p className="text-xs text-blue-600 dark:text-blue-400">In Progress</p>
                    <p className="font-bold text-blue-700 dark:text-blue-300">{stats.inProgress}</p>
                  </div>
                  <div className="bg-emerald-500/10 rounded-xl p-2">
                    <p className="text-xs text-emerald-600 dark:text-emerald-400">Done</p>
                    <p className="font-bold text-emerald-700 dark:text-emerald-300">{stats.completed}</p>
                  </div>
                  <div className="bg-purple-500/10 rounded-xl p-2">
                    <p className="text-xs text-purple-600 dark:text-purple-400">Carry</p>
                    <p className="font-bold text-purple-700 dark:text-purple-300">{stats.carryForward}</p>
                  </div>
                </div>

                {/* Expand/collapse tasks */}
                {memberTasks.length > 0 && (
                  <button
                    onClick={() => setExpandedMember(isExpanded ? null : member)}
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors self-start"
                  >
                    {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    {isExpanded ? 'Hide tasks' : 'Show tasks'}
                  </button>
                )}

                {/* Task list */}
                {isExpanded && (
                  <div className="flex flex-col gap-2 mt-1">
                    {memberTasks.map(task => (
                      <div key={task.id.toString()} className="flex items-center gap-2 text-sm bg-muted/40 rounded-xl px-3 py-2">
                        {task.status === Status.Completed && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />}
                        {task.status === Status.InProgress && <Clock className="w-3.5 h-3.5 text-blue-500 shrink-0" />}
                        {task.status === Status.Pending && <AlertCircle className="w-3.5 h-3.5 text-muted-foreground shrink-0" />}
                        {task.status === Status.CarryForward && <RotateCcw className="w-3.5 h-3.5 text-purple-500 shrink-0" />}
                        <span className="truncate text-foreground">{task.title}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add User Modal */}
      <AddUserModal open={addModalOpen} onOpenChange={setAddModalOpen} />
    </div>
  );
}

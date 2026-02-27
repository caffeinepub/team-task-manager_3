import React, { useState } from 'react';
import { CheckCircle, Clock, AlertCircle, User } from 'lucide-react';
import { useListTeamMembers, useGetTasksByAssignee, useClaimTeamMember } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { TaskStatus } from '../backend';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import StatusBadgeDropdown from '../components/StatusBadgeDropdown';

function getInitials(name: string): string {
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
}

function formatDeadline(deadline: bigint | undefined): string {
  if (!deadline) return '';
  const date = new Date(Number(deadline) / 1_000_000);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function TeamMemberView() {
  const { identity } = useInternetIdentity();
  const { data: members = [], isLoading: membersLoading } = useListTeamMembers();
  const claimMember = useClaimTeamMember();

  const principal = identity?.getPrincipal();

  // Find the member claimed by the current user
  const myMember = members.find(
    (m) => m.claimedBy && principal && m.claimedBy.toString() === principal.toString()
  );

  const { data: tasks = [], isLoading: tasksLoading } = useGetTasksByAssignee(myMember?.name ?? '');

  const pending = tasks.filter((t) => t.status === TaskStatus.ToDo).length;
  const inProgress = tasks.filter((t) => t.status === TaskStatus.InProgress).length;
  const completed = tasks.filter((t) => t.status === TaskStatus.Done).length;

  const handleClaim = async (memberId: bigint) => {
    try {
      await claimMember.mutateAsync(memberId);
      toast.success('Profile claimed successfully!');
    } catch {
      toast.error('Failed to claim profile');
    }
  };

  if (membersLoading) {
    return (
      <div className="space-y-4 animate-fade-in">
        <div className="h-8 bg-muted rounded-xl animate-pulse w-48" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => <div key={i} className="h-24 bg-muted rounded-2xl animate-pulse" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">My Tasks</h1>
        <p className="text-muted-foreground text-sm mt-1">Your personal task dashboard</p>
      </div>

      {/* Claim Profile Section */}
      {!myMember && (
        <div className="bg-card border border-border rounded-2xl p-6 card-elevated">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-yellow-500/10 text-yellow-400 flex items-center justify-center flex-shrink-0">
              <AlertCircle size={20} />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground mb-1">Claim Your Profile</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Select your name from the team list to see your assigned tasks.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {members
                  .filter((m) => !m.claimedBy)
                  .map((member) => (
                    <button
                      key={member.id.toString()}
                      onClick={() => handleClaim(member.id)}
                      disabled={claimMember.isPending}
                      className="flex items-center gap-2 p-2.5 rounded-xl bg-muted hover:bg-primary/10 hover:border-primary/30 border border-border transition-all duration-200 text-left disabled:opacity-50"
                    >
                      <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-primary text-[10px] font-bold">{getInitials(member.name)}</span>
                      </div>
                      <span className="text-xs font-medium text-foreground truncate">{member.name}</span>
                    </button>
                  ))}
              </div>
              {members.filter((m) => !m.claimedBy).length === 0 && (
                <p className="text-sm text-muted-foreground">All profiles have been claimed.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* My Profile Card */}
      {myMember && (
        <>
          <div className="bg-card border border-border rounded-2xl p-5 card-elevated">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center">
                <span className="text-primary text-lg font-bold">{getInitials(myMember.name)}</span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">{myMember.name}</h2>
                <div className="flex items-center gap-1.5 mt-1">
                  <User size={12} className="text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Team Member</span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-card border border-border rounded-2xl p-4 card-elevated text-center">
              <div className="flex items-center justify-center gap-1.5 text-muted-foreground mb-1">
                <Clock size={14} />
                <span className="text-xs">To Do</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{pending}</p>
            </div>
            <div className="bg-card border border-blue-500/20 rounded-2xl p-4 card-elevated text-center">
              <div className="flex items-center justify-center gap-1.5 text-blue-400 mb-1">
                <Clock size={14} />
                <span className="text-xs">In Progress</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{inProgress}</p>
            </div>
            <div className="bg-card border border-green-500/20 rounded-2xl p-4 card-elevated text-center">
              <div className="flex items-center justify-center gap-1.5 text-green-400 mb-1">
                <CheckCircle size={14} />
                <span className="text-xs">Done</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{completed}</p>
            </div>
          </div>

          {/* Task List */}
          <div className="bg-card border border-border rounded-2xl p-5 card-elevated">
            <h3 className="font-semibold text-foreground mb-4">My Tasks</h3>
            {tasksLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => <div key={i} className="h-14 bg-muted rounded-xl animate-pulse" />)}
              </div>
            ) : tasks.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle size={32} className="mx-auto mb-2 opacity-40" />
                <p className="text-sm">No tasks assigned yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {tasks.map((task) => (
                  <div
                    key={task.id.toString()}
                    className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${
                        task.status === TaskStatus.Done ? 'line-through text-muted-foreground' : 'text-foreground'
                      }`}>
                        {task.title}
                      </p>
                      {task.deadline && (
                        <p className="text-xs text-muted-foreground mt-0.5">{formatDeadline(task.deadline)}</p>
                      )}
                    </div>
                    <StatusBadgeDropdown
                      taskId={task.id}
                      currentStatus={task.status}
                      taskTitle={task.title}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

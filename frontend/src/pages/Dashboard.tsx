import React, { useState } from 'react';
import { CheckSquare, Clock, AlertTriangle, TrendingUp, Plus, Calendar, Users, ArrowRight } from 'lucide-react';
import { useGetTasks, useListTeamMembers, useIsCallerAdmin } from '../hooks/useQueries';
import { TaskStatus, Priority } from '../backend';
import CreateTaskModal from '../components/CreateTaskModal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

function getInitials(name: string): string {
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
}

function formatDeadline(deadline: bigint | undefined): string {
  if (!deadline) return 'No deadline';
  const date = new Date(Number(deadline) / 1_000_000);
  const now = new Date();
  const diff = date.getTime() - now.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days < 0) return `${Math.abs(days)}d overdue`;
  if (days === 0) return 'Due today';
  if (days === 1) return 'Due tomorrow';
  return `Due in ${days}d`;
}

function getPriorityColor(priority: Priority): string {
  switch (priority) {
    case Priority.High: return 'bg-red-500/20 text-red-400 border-red-500/30';
    case Priority.Medium: return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    case Priority.Low: return 'bg-green-500/20 text-green-400 border-green-500/30';
  }
}

export default function Dashboard() {
  const [createTaskOpen, setCreateTaskOpen] = useState(false);
  const { data: tasks = [], isLoading: tasksLoading } = useGetTasks();
  const { data: members = [] } = useListTeamMembers();
  const { data: isAdmin } = useIsCallerAdmin();

  const totalTasks = tasks.length;
  const inProgressTasks = tasks.filter((t) => t.status === TaskStatus.InProgress).length;
  const completedTasks = tasks.filter((t) => t.status === TaskStatus.Done).length;
  const now = Date.now() * 1_000_000;
  const overdueTasks = tasks.filter(
    (t) => t.status !== TaskStatus.Done && t.deadline !== undefined && Number(t.deadline) < now
  ).length;

  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const recentTasks = [...tasks]
    .sort((a, b) => Number(b.createdAt) - Number(a.createdAt))
    .slice(0, 5);

  const upcomingTasks = tasks
    .filter((t) => t.status !== TaskStatus.Done && t.deadline !== undefined && Number(t.deadline) > now)
    .sort((a, b) => Number(a.deadline ?? 0n) - Number(b.deadline ?? 0n))
    .slice(0, 4);

  const statCards = [
    {
      label: 'Total Tasks',
      value: totalTasks,
      icon: <CheckSquare size={20} />,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10',
      border: 'border-purple-500/20',
    },
    {
      label: 'In Progress',
      value: inProgressTasks,
      icon: <TrendingUp size={20} />,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/20',
    },
    {
      label: 'Completed',
      value: completedTasks,
      icon: <CheckSquare size={20} />,
      color: 'text-green-400',
      bg: 'bg-green-500/10',
      border: 'border-green-500/20',
    },
    {
      label: 'Overdue',
      value: overdueTasks,
      icon: <AlertTriangle size={20} />,
      color: 'text-red-400',
      bg: 'bg-red-500/10',
      border: 'border-red-500/20',
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Overview</h1>
          <p className="text-muted-foreground text-sm mt-1">Track your team's progress</p>
        </div>
        {isAdmin && (
          <Button
            onClick={() => setCreateTaskOpen(true)}
            className="bg-purple-500 hover:bg-purple-600 text-white gap-2 rounded-xl shadow-glow"
          >
            <Plus size={16} />
            New Task
          </Button>
        )}
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div
            key={card.label}
            className={`bg-card border ${card.border} rounded-2xl p-5 card-elevated hover:card-hover transition-all duration-200`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl ${card.bg} ${card.color} flex items-center justify-center`}>
                {card.icon}
              </div>
            </div>
            <p className="text-3xl font-bold text-foreground">{card.value}</p>
            <p className="text-muted-foreground text-sm mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Progress Bar */}
      <div className="bg-card border border-border rounded-2xl p-5 card-elevated">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-semibold text-foreground">Overall Progress</h3>
            <p className="text-muted-foreground text-sm">Task completion rate</p>
          </div>
          <span className="text-2xl font-bold text-purple-400">{completionRate}%</span>
        </div>
        <div className="w-full bg-muted rounded-full h-2.5">
          <div
            className="bg-purple-500 h-2.5 rounded-full transition-all duration-500"
            style={{ width: `${completionRate}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-muted-foreground mt-2">
          <span>{completedTasks} completed</span>
          <span>{totalTasks - completedTasks} remaining</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Deadlines */}
        <div className="bg-card border border-border rounded-2xl p-5 card-elevated">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <Calendar size={16} className="text-purple-400" />
              Upcoming Deadlines
            </h3>
            <Badge variant="secondary" className="text-xs">{upcomingTasks.length}</Badge>
          </div>
          {tasksLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 bg-muted rounded-xl animate-pulse" />
              ))}
            </div>
          ) : upcomingTasks.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar size={32} className="mx-auto mb-2 opacity-40" />
              <p className="text-sm">No upcoming deadlines</p>
            </div>
          ) : (
            <div className="space-y-2">
              {upcomingTasks.map((task) => (
                <div
                  key={task.id.toString()}
                  className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                    task.priority === Priority.High ? 'bg-red-400' :
                    task.priority === Priority.Medium ? 'bg-yellow-400' : 'bg-green-400'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{task.title}</p>
                    <p className="text-xs text-muted-foreground">{formatDeadline(task.deadline)}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${getPriorityColor(task.priority)}`}>
                    {task.priority}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Team Overview */}
        <div className="bg-card border border-border rounded-2xl p-5 card-elevated">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <Users size={16} className="text-purple-400" />
              Team Members
            </h3>
            <Badge variant="secondary" className="text-xs">{members.length}</Badge>
          </div>
          {members.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users size={32} className="mx-auto mb-2 opacity-40" />
              <p className="text-sm">No team members yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {members.slice(0, 5).map((member) => (
                <div
                  key={member.id.toString()}
                  className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center flex-shrink-0">
                    <span className="text-purple-300 text-xs font-bold">{getInitials(member.name)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{member.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {member.claimedBy ? 'Active' : 'Unclaimed'}
                    </p>
                  </div>
                  <div className={`w-2 h-2 rounded-full ${member.claimedBy ? 'bg-green-400' : 'bg-muted-foreground'}`} />
                </div>
              ))}
              {members.length > 5 && (
                <p className="text-xs text-muted-foreground text-center pt-1">
                  +{members.length - 5} more members
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Recent Tasks */}
      <div className="bg-card border border-border rounded-2xl p-5 card-elevated">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <CheckSquare size={16} className="text-purple-400" />
            Recent Tasks
          </h3>
          <a href="/tasks" className="text-purple-400 hover:text-purple-300 text-sm flex items-center gap-1 transition-colors">
            View all <ArrowRight size={14} />
          </a>
        </div>
        {tasksLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-14 bg-muted rounded-xl animate-pulse" />
            ))}
          </div>
        ) : recentTasks.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <CheckSquare size={32} className="mx-auto mb-2 opacity-40" />
            <p className="text-sm">No tasks yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {recentTasks.map((task) => {
              const assigneeDisplay = task.assignees.length > 0
                ? task.assignees.join(', ')
                : 'Unassigned';
              return (
                <div
                  key={task.id.toString()}
                  className="flex items-center gap-4 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className={`w-2 h-8 rounded-full flex-shrink-0 ${
                    task.status === TaskStatus.Done ? 'bg-green-400' :
                    task.status === TaskStatus.InProgress ? 'bg-blue-400' : 'bg-muted-foreground'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{task.title}</p>
                    <p className="text-xs text-muted-foreground">{assigneeDisplay}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      task.status === TaskStatus.Done ? 'bg-green-500/20 text-green-400' :
                      task.status === TaskStatus.InProgress ? 'bg-blue-500/20 text-blue-400' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {task.status === TaskStatus.ToDo ? 'To Do' :
                       task.status === TaskStatus.InProgress ? 'In Progress' : 'Done'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <CreateTaskModal
        open={createTaskOpen}
        onClose={() => setCreateTaskOpen(false)}
      />
    </div>
  );
}

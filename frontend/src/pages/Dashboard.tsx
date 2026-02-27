import React, { useState } from 'react';
import { Plus, Search, Share2, CheckSquare, TrendingUp, AlertTriangle, Clock } from 'lucide-react';
import StatsCard from '../components/StatsCard';
import OngoingTaskCard from '../components/OngoingTaskCard';
import ProjectRow from '../components/ProjectRow';
import { useGetTasks } from '../hooks/useQueries';
import { TaskStatus } from '../backend';
import CreateTaskModal from '../components/CreateTaskModal';

const ONGOING_TASKS = [
  {
    title: 'Brand Identity Design',
    description: 'Create a comprehensive brand identity including logo, color palette, and typography guidelines.',
    tags: ['Design', 'Branding'],
    members: ['Alice', 'Bob', 'Carol'],
    isGradient: true,
    progress: 65,
  },
  {
    title: 'Mobile App Prototype',
    description: 'Build interactive prototype for the new mobile application with user flow diagrams.',
    tags: ['Development', 'Mobile'],
    members: ['Dave', 'Eve'],
    isGradient: false,
    progress: 40,
  },
  {
    title: 'Marketing Campaign',
    description: 'Plan and execute Q1 marketing campaign across social media and email channels.',
    tags: ['Marketing'],
    members: ['Frank', 'Grace', 'Heidi'],
    isGradient: false,
    progress: 80,
  },
  {
    title: 'API Integration',
    description: 'Integrate third-party payment and analytics APIs into the main platform.',
    tags: ['Backend', 'API'],
    members: ['Ivan', 'Judy'],
    isGradient: false,
    progress: 25,
  },
];

const PROJECTS = [
  { icon: '🌊', name: 'TaskWave', subtitle: 'Task management platform', status: 'Active' as const, budget: '$12,400', deadline: 'Mar 15, 2026', members: ['A', 'B', 'C', 'D'] },
  { icon: '📊', name: 'ProjectPulse', subtitle: 'Analytics dashboard', status: 'On Hold' as const, budget: '$8,200', deadline: 'Apr 30, 2026', members: ['E', 'F'] },
  { icon: '🐝', name: 'SprintHive', subtitle: 'Agile sprint tracker', status: 'Active' as const, budget: '$15,600', deadline: 'Feb 28, 2026', members: ['G', 'H', 'I'] },
  { icon: '🎯', name: 'SprintMaster', subtitle: 'Sprint planning tool', status: 'Planning' as const, budget: '$5,000', deadline: 'May 20, 2026', members: ['J', 'K'] },
];

export default function Dashboard() {
  const { data: tasks = [] } = useGetTasks();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const totalTasks = tasks.length;
  const inProgressTasks = tasks.filter(t => t.status === TaskStatus.InProgress).length;
  const completedTasks = tasks.filter(t => t.status === TaskStatus.Done).length;
  const now = Date.now();
  const overdueTasks = tasks.filter(t =>
    t.deadline && Number(t.deadline) < now && t.status !== TaskStatus.Done
  ).length;

  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="flex-1 overflow-y-auto scrollbar-thin bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-foreground">Overview</h1>
            <p className="text-sm text-muted-foreground">Track your team's progress</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="bg-muted text-foreground placeholder-muted-foreground text-sm pl-9 pr-4 py-2 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-ring w-52"
              />
            </div>
            <button className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-all">
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-semibold hover:bg-primary/90 transition-all shadow-sm"
            >
              <Plus className="w-4 h-4" />
              New Task
            </button>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            icon={<CheckSquare className="w-5 h-5 text-primary" />}
            value={totalTasks}
            label="Total Tasks"
            iconBgClass="bg-primary/10"
          />
          <StatsCard
            icon={<TrendingUp className="w-5 h-5 text-blue-500" />}
            value={inProgressTasks}
            label="In Progress"
            iconBgClass="bg-blue-500/10"
          />
          <StatsCard
            icon={<CheckSquare className="w-5 h-5 text-emerald-500" />}
            value={completedTasks}
            label="Completed"
            iconBgClass="bg-emerald-500/10"
          />
          <StatsCard
            icon={<AlertTriangle className="w-5 h-5 text-destructive" />}
            value={overdueTasks}
            label="Overdue"
            iconBgClass="bg-destructive/10"
          />
        </div>

        {/* Completion Rate */}
        <div className="bg-card rounded-2xl p-5 border border-border card-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">Task completion rate</span>
            </div>
            <span className="text-2xl font-bold text-primary">{completionRate}%</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${completionRate}%` }}
            />
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-xs text-muted-foreground">{completedTasks} completed</span>
            <span className="text-xs text-muted-foreground">{totalTasks - completedTasks} remaining</span>
          </div>
        </div>

        {/* Ongoing Tasks */}
        <div>
          <h2 className="text-base font-semibold text-foreground mb-3">Ongoing Tasks</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {ONGOING_TASKS.map((task, i) => (
              <OngoingTaskCard key={i} {...task} />
            ))}
          </div>
        </div>

        {/* All Projects */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-foreground">All Projects</h2>
            <button className="text-xs text-primary hover:text-primary/80 font-medium transition-colors">
              View all
            </button>
          </div>
          <div className="bg-card rounded-2xl border border-border overflow-hidden card-shadow">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Project</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Budget</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Deadline</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Team</th>
                </tr>
              </thead>
              <tbody>
                {PROJECTS.map((project, i) => (
                  <ProjectRow key={i} {...project} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showCreateModal && (
        <CreateTaskModal
          open={showCreateModal}
          onClose={() => setShowCreateModal(false)}
        />
      )}
    </div>
  );
}

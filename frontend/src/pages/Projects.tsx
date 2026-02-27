import React, { useState } from 'react';
import { LayoutGrid, List, Plus, Search } from 'lucide-react';

type ProjectStatus = 'Active' | 'On Hold' | 'Completed' | 'Planning';

interface Project {
  id: number;
  icon: string;
  name: string;
  description: string;
  status: ProjectStatus;
  progress: number;
  members: string[];
  tasksDone: number;
  tasksTotal: number;
  deadline: string;
}

const PROJECTS: Project[] = [
  { id: 1, icon: '🌊', name: 'TaskWave', description: 'Task management platform', status: 'Active', progress: 72, members: ['A', 'B', 'C', 'D'], tasksDone: 18, tasksTotal: 25, deadline: 'Mar 15, 2026' },
  { id: 2, icon: '📊', name: 'ProjectPulse', description: 'Analytics dashboard', status: 'On Hold', progress: 45, members: ['E', 'F'], tasksDone: 9, tasksTotal: 20, deadline: 'Apr 30, 2026' },
  { id: 3, icon: '🐝', name: 'SprintHive', description: 'Agile sprint tracker', status: 'Active', progress: 88, members: ['G', 'H', 'I'], tasksDone: 22, tasksTotal: 25, deadline: 'Feb 28, 2026' },
  { id: 4, icon: '🎯', name: 'SprintMaster', description: 'Sprint planning tool', status: 'Planning', progress: 15, members: ['J', 'K'], tasksDone: 3, tasksTotal: 20, deadline: 'May 20, 2026' },
  { id: 5, icon: '🚀', name: 'LaunchPad', description: 'Product launch tracker', status: 'Active', progress: 60, members: ['L', 'M', 'N'], tasksDone: 12, tasksTotal: 20, deadline: 'Jun 10, 2026' },
  { id: 6, icon: '🔮', name: 'VisionBoard', description: 'Strategic planning tool', status: 'Completed', progress: 100, members: ['O', 'P'], tasksDone: 30, tasksTotal: 30, deadline: 'Jan 31, 2026' },
];

const statusColors: Record<ProjectStatus, string> = {
  Active: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
  'On Hold': 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
  Completed: 'bg-primary/15 text-primary',
  Planning: 'bg-blue-500/15 text-blue-600 dark:text-blue-400',
};

export default function Projects() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'all'>('all');

  const filtered = PROJECTS.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex-1 overflow-y-auto scrollbar-thin bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border px-6 py-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-xl font-bold text-foreground">Projects</h1>
            <p className="text-sm text-muted-foreground">{PROJECTS.length} total projects</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-muted rounded-xl p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
            <button className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-semibold hover:bg-primary/90 transition-all shadow-sm">
              <Plus className="w-4 h-4" />
              New Project
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3 mt-3 flex-wrap">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="bg-muted text-foreground placeholder-muted-foreground text-sm pl-8 pr-3 py-1.5 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-ring w-48"
            />
          </div>
          <div className="flex items-center gap-1">
            {(['all', 'Active', 'On Hold', 'Planning', 'Completed'] as const).map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${
                  statusFilter === s
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                {s === 'all' ? 'All' : s}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="p-6">
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(project => (
              <div key={project.id} className="bg-card rounded-2xl p-5 border border-border card-shadow hover:shadow-md transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-xl">
                      {project.icon}
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">{project.name}</h3>
                      <p className="text-xs text-muted-foreground">{project.description}</p>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[project.status]}`}>
                    {project.status}
                  </span>
                </div>

                <div className="mb-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium text-foreground">{project.progress}%</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex -space-x-2">
                    {project.members.slice(0, 4).map((m, i) => (
                      <div key={i} className="w-6 h-6 rounded-full bg-primary/20 border-2 border-card flex items-center justify-center text-xs font-bold text-primary">
                        {m}
                      </div>
                    ))}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {project.tasksDone}/{project.tasksTotal} tasks
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-border">
                  <p className="text-xs text-muted-foreground">Due: <span className="text-foreground font-medium">{project.deadline}</span></p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-card rounded-2xl border border-border overflow-hidden card-shadow">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Project</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Progress</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tasks</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Deadline</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(project => (
                  <tr key={project.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{project.icon}</span>
                        <div>
                          <p className="text-sm font-semibold text-foreground">{project.name}</p>
                          <p className="text-xs text-muted-foreground">{project.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[project.status]}`}>
                        {project.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-24 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-primary rounded-full" style={{ width: `${project.progress}%` }} />
                        </div>
                        <span className="text-xs text-foreground font-medium">{project.progress}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">{project.tasksDone}/{project.tasksTotal}</td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">{project.deadline}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

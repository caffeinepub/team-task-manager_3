import React, { useState } from 'react';
import { Plus, Search, CheckCircle2, Circle, Clock, AlertCircle } from 'lucide-react';

type TaskStatus = 'todo' | 'inprogress' | 'done';
type Priority = 'high' | 'medium' | 'low';

interface Task {
  id: number;
  title: string;
  project: string;
  status: TaskStatus;
  priority: Priority;
  deadline: string;
  tags: string[];
}

const mockTasks: Task[] = [
  { id: 1, title: 'Design new landing page wireframes', project: 'TaskWave', status: 'inprogress', priority: 'high', deadline: 'Today', tags: ['Design', 'UI'] },
  { id: 2, title: 'Review pull request for auth module', project: 'SprintHive', status: 'todo', priority: 'high', deadline: 'Tomorrow', tags: ['Dev', 'Review'] },
  { id: 3, title: 'Update component documentation', project: 'ProjectPulse', status: 'todo', priority: 'medium', deadline: '28 Aug', tags: ['Docs'] },
  { id: 4, title: 'Conduct user interviews for onboarding flow', project: 'TaskWave', status: 'inprogress', priority: 'medium', deadline: '30 Aug', tags: ['Research', 'UX'] },
  { id: 5, title: 'Fix responsive layout bugs on mobile', project: 'SprintHive', status: 'done', priority: 'low', deadline: '22 Aug', tags: ['Dev', 'Bug'] },
  { id: 6, title: 'Create icon set for dashboard', project: 'ProjectPulse', status: 'done', priority: 'low', deadline: '20 Aug', tags: ['Design'] },
  { id: 7, title: 'Set up CI/CD pipeline for staging', project: 'SprintHive', status: 'todo', priority: 'high', deadline: '1 Sep', tags: ['DevOps'] },
  { id: 8, title: 'Write unit tests for API endpoints', project: 'TaskWave', status: 'inprogress', priority: 'medium', deadline: '3 Sep', tags: ['Dev', 'Testing'] },
];

const statusConfig: Record<TaskStatus, { label: string; icon: React.ReactNode; color: string; bg: string }> = {
  todo: { label: 'To Do', icon: <Circle className="w-4 h-4" />, color: '#6B7280', bg: '#F3F4F6' },
  inprogress: { label: 'In Progress', icon: <Clock className="w-4 h-4" />, color: '#F59E0B', bg: '#FEF3C7' },
  done: { label: 'Done', icon: <CheckCircle2 className="w-4 h-4" />, color: '#10B981', bg: '#D1FAE5' },
};

const priorityConfig: Record<Priority, { color: string; bg: string }> = {
  high: { color: '#EF4444', bg: '#FEE2E2' },
  medium: { color: '#F59E0B', bg: '#FEF3C7' },
  low: { color: '#10B981', bg: '#D1FAE5' },
};

export default function MyTasks() {
  const [filter, setFilter] = useState<TaskStatus | 'all'>('all');
  const [search, setSearch] = useState('');

  const filtered = mockTasks.filter((t) => {
    const matchesFilter = filter === 'all' || t.status === filter;
    const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const counts = {
    all: mockTasks.length,
    todo: mockTasks.filter((t) => t.status === 'todo').length,
    inprogress: mockTasks.filter((t) => t.status === 'inprogress').length,
    done: mockTasks.filter((t) => t.status === 'done').length,
  };

  return (
    <div className="p-8 min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Tasks</h1>
          <p className="text-muted-foreground mt-1">{mockTasks.length} tasks assigned to you</p>
        </div>
        <button
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold transition-all hover:opacity-90 shadow-md"
          style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #F5A623 100%)' }}
        >
          <Plus className="w-4 h-4" />
          New Task
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 mb-6">
        {(['all', 'todo', 'inprogress', 'done'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              filter === status
                ? 'text-white shadow-md'
                : 'bg-card text-muted-foreground hover:text-foreground border border-border card-shadow'
            }`}
            style={
              filter === status
                ? { background: 'linear-gradient(135deg, #F5A623 0%, #F7C948 100%)' }
                : {}
            }
          >
            {status === 'all' ? 'All' : statusConfig[status].label}
            <span className="ml-2 text-xs opacity-70">({counts[status]})</span>
          </button>
        ))}

        {/* Search */}
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-xl border ml-auto bg-card card-shadow"
          style={{ borderColor: 'var(--border)' }}
        >
          <Search className="w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent text-sm outline-none w-48 placeholder:text-muted-foreground text-foreground"
          />
        </div>
      </div>

      {/* Tasks List */}
      <div className="bg-card rounded-2xl card-shadow overflow-hidden">
        {filtered.map((task, i) => {
          const sc = statusConfig[task.status];
          const pc = priorityConfig[task.priority];
          return (
            <div
              key={task.id}
              className={`flex items-center gap-4 px-5 py-4 hover:bg-muted/30 transition-colors ${
                i < filtered.length - 1 ? 'border-b' : ''
              }`}
              style={{ borderColor: 'var(--border)' }}
            >
              {/* Status Icon */}
              <div style={{ color: sc.color }}>{sc.icon}</div>

              {/* Title + Tags */}
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold text-foreground ${task.status === 'done' ? 'line-through text-muted-foreground' : ''}`}>
                  {task.title}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-muted-foreground">{task.project}</span>
                  {task.tags.map((tag) => (
                    <span key={tag} className="px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Priority */}
              <span
                className="px-2.5 py-1 rounded-full text-xs font-semibold capitalize"
                style={{ backgroundColor: pc.bg, color: pc.color }}
              >
                {task.priority}
              </span>

              {/* Status Badge */}
              <span
                className="px-3 py-1 rounded-full text-xs font-semibold"
                style={{ backgroundColor: sc.bg, color: sc.color }}
              >
                {sc.label}
              </span>

              {/* Deadline */}
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground w-20 flex-shrink-0">
                <AlertCircle className="w-3.5 h-3.5" />
                {task.deadline}
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="py-12 text-center text-muted-foreground">
            <CheckCircle2 className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No tasks found</p>
          </div>
        )}
      </div>
    </div>
  );
}

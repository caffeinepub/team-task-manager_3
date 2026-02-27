import React, { useState } from 'react';
import { Plus, LayoutGrid, List, Search } from 'lucide-react';
import { useGetTasks } from '../hooks/useQueries';
import { TaskStatus } from '../backend';
import KanbanBoard from '../components/KanbanBoard';
import TaskCard from '../components/TaskCard';
import CreateTaskModal from '../components/CreateTaskModal';
import { useUpdateTaskStatus } from '../hooks/useQueries';
import ReportExportButtons from '../components/ReportExportButtons';

type ViewMode = 'kanban' | 'list';

export default function Tasks() {
  const { data: tasks = [], isLoading } = useGetTasks();
  const { mutate: updateStatus } = useUpdateTaskStatus();
  const [viewMode, setViewMode] = useState<ViewMode>('kanban');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all');

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = (taskId: bigint, newStatus: TaskStatus) => {
    updateStatus({ taskId, newStatus });
  };

  return (
    <div className="flex-1 overflow-y-auto scrollbar-thin bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border px-6 py-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-xl font-bold text-foreground">Tasks</h1>
            <p className="text-sm text-muted-foreground">{tasks.length} total tasks</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <ReportExportButtons tasks={tasks} />
            <div className="flex items-center bg-muted rounded-xl p-1">
              <button
                onClick={() => setViewMode('kanban')}
                className={`p-1.5 rounded-lg transition-all ${viewMode === 'kanban' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
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
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-semibold hover:bg-primary/90 transition-all shadow-sm"
            >
              <Plus className="w-4 h-4" />
              New Task
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 mt-3 flex-wrap">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="bg-muted text-foreground placeholder-muted-foreground text-sm pl-8 pr-3 py-1.5 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-ring w-48"
            />
          </div>
          <div className="flex items-center gap-1">
            {(['all', TaskStatus.ToDo, TaskStatus.InProgress, TaskStatus.Done] as const).map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${
                  statusFilter === s
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                {s === 'all' ? 'All' : s === TaskStatus.ToDo ? 'To Do' : s === TaskStatus.InProgress ? 'In Progress' : 'Done'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="p-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : viewMode === 'kanban' ? (
          <KanbanBoard tasks={filteredTasks} onStatusChange={handleStatusChange} />
        ) : (
          <div className="space-y-3">
            {filteredTasks.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-muted-foreground">No tasks found</p>
              </div>
            ) : (
              filteredTasks.map(task => (
                <TaskCard
                  key={String(task.id)}
                  task={task}
                  onStatusChange={handleStatusChange}
                  showStatusDropdown
                />
              ))
            )}
          </div>
        )}
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

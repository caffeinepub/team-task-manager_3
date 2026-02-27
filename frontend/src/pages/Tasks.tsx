import React, { useState } from 'react';
import { LayoutGrid, List, Plus } from 'lucide-react';
import { useGetTasks, useListTeamMembers, useIsCallerAdmin } from '../hooks/useQueries';
import { useTaskFilters } from '../hooks/useTaskFilters';
import KanbanBoard from '../components/KanbanBoard';
import TaskFilters from '../components/TaskFilters';
import CreateTaskModal from '../components/CreateTaskModal';
import InlineTaskForm from '../components/InlineTaskForm';
import PersistentTaskForm from '../components/PersistentTaskForm';
import ReportExportButtons from '../components/ReportExportButtons';
import { Button } from '@/components/ui/button';
import { Task } from '../backend';
import TaskCard from '../components/TaskCard';

export default function Tasks() {
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [createTaskOpen, setCreateTaskOpen] = useState(false);
  const [filters, setFilters] = useState({ search: '', assigneeId: '' });

  const { data: tasks = [], isLoading } = useGetTasks();
  const { data: members = [] } = useListTeamMembers();
  const { data: isAdmin } = useIsCallerAdmin();

  const filteredTasks = useTaskFilters(tasks, filters);

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Tasks</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {tasks.length} total · {filteredTasks.length} shown
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <div className="flex items-center bg-card border border-border rounded-xl p-1">
            <button
              onClick={() => setViewMode('kanban')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                viewMode === 'kanban'
                  ? 'bg-primary text-primary-foreground shadow-glow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <LayoutGrid size={15} />
              <span className="hidden sm:inline">Kanban</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                viewMode === 'list'
                  ? 'bg-primary text-primary-foreground shadow-glow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <List size={15} />
              <span className="hidden sm:inline">List</span>
            </button>
          </div>

          <ReportExportButtons tasks={tasks} />

          {isAdmin && (
            <Button
              onClick={() => setCreateTaskOpen(true)}
              className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 rounded-xl shadow-glow-sm"
            >
              <Plus size={16} />
              <span className="hidden sm:inline">Add Task</span>
            </Button>
          )}
        </div>
      </div>

      {/* Inline Task Form (admin only, collapsible) — rendered at the top */}
      <InlineTaskForm isAdmin={!!isAdmin} />

      {/* Filters */}
      <TaskFilters
        filters={filters}
        onFiltersChange={setFilters}
        members={members}
      />

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-40 bg-card border border-border rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : viewMode === 'kanban' ? (
        <KanbanBoard tasks={filteredTasks} members={members} isAdmin={!!isAdmin} />
      ) : (
        <div className="space-y-3">
          {filteredTasks.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground bg-card border border-border rounded-2xl">
              <List size={40} className="mx-auto mb-3 opacity-40" />
              <p className="font-medium">No tasks found</p>
              <p className="text-sm mt-1">Try adjusting your filters</p>
            </div>
          ) : (
            filteredTasks.map((task: Task) => (
              <TaskCard
                key={task.id.toString()}
                task={task}
                members={members}
                isAdmin={!!isAdmin}
              />
            ))
          )}
        </div>
      )}

      {/* ── Persistent Add Task Form (visible to all authenticated users) ── */}
      <div className="pt-2">
        <PersistentTaskForm />
      </div>

      <CreateTaskModal
        open={createTaskOpen}
        onClose={() => setCreateTaskOpen(false)}
      />
    </div>
  );
}

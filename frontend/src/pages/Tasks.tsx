import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useGetAllTasks, useDeleteTask, useGetTeamMembers } from '../hooks/useQueries';
import { useAuth } from '../contexts/AuthContext';
import { sortTasksByDeadlineAndPriority } from '../utils/taskSorting';
import { useTaskFilters, type TaskFiltersState } from '../hooks/useTaskFilters';
import TaskCard from '../components/TaskCard';
import TaskFilters from '../components/TaskFilters';
import CreateTaskModal from '../components/CreateTaskModal';
import EditTaskModal from '../components/EditTaskModal';
import ReportExportButtons from '../components/ReportExportButtons';
import type { Task } from '../backend';

export default function Tasks() {
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin } = useAuth();
  const { data: tasks = [], isLoading } = useGetAllTasks();
  const { data: teamMembers = [] } = useGetTeamMembers();
  const deleteTask = useDeleteTask();

  const [filters, setFilters] = useState<TaskFiltersState>({ searchText: '', selectedAssignee: '' });
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // All hooks must be called before any early return
  const sortedTasks = sortTasksByDeadlineAndPriority(tasks);
  const filteredTasks = useTaskFilters(sortedTasks, filters);

  if (!isAuthenticated) {
    navigate({ to: '/login' });
    return null;
  }

  const handleDelete = async (taskId: bigint) => {
    try {
      await deleteTask.mutateAsync(taskId);
      toast.success('Task deleted');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete task';
      toast.error(msg);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Tasks</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {filteredTasks.length} of {tasks.length} tasks
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <ReportExportButtons tasks={filteredTasks} />
          <Button
            onClick={() => setCreateModalOpen(true)}
            className="gap-2 rounded-xl font-semibold shadow-sm"
            size="lg"
          >
            <Plus size={18} />
            Create Task
          </Button>
        </div>
      </div>

      {/* Filters */}
      <TaskFilters
        filters={filters}
        teamMembers={teamMembers}
        onChange={setFilters}
      />

      {/* Task list */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-32 w-full rounded-2xl" />
          ))}
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-lg font-bold">No tasks found</p>
          <p className="text-sm mt-1">
            {filters.searchText || filters.selectedAssignee
              ? 'Try adjusting your filters'
              : 'Create your first task to get started'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTasks.map(task => (
            <TaskCard
              key={task.id.toString()}
              task={task}
              onDelete={isAdmin ? handleDelete : undefined}
              onEdit={setEditingTask}
            />
          ))}
        </div>
      )}

      <CreateTaskModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        teamMembers={teamMembers}
      />

      {editingTask && (
        <EditTaskModal
          task={editingTask}
          open={!!editingTask}
          onOpenChange={open => { if (!open) setEditingTask(null); }}
        />
      )}
    </div>
  );
}

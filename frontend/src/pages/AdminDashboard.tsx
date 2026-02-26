import React, { useState } from 'react';
import { useGetAllTasks, useGetTeamMembers, useDeleteTask, useGetAllUsers } from '../hooks/useQueries';
import { useAuth } from '../hooks/useAuth';
import CreateTaskModal from '../components/CreateTaskModal';
import EditTaskModal from '../components/EditTaskModal';
import TaskCard from '../components/TaskCard';
import TaskFilters from '../components/TaskFilters';
import ReportExportButtons from '../components/ReportExportButtons';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Users, ClipboardList, BarChart3, UserPlus } from 'lucide-react';
import { Task, Status } from '../backend';
import { useTaskFilters, type TaskFiltersState } from '../hooks/useTaskFilters';
import { sortTasksByDeadlineAndPriority } from '../utils/taskSorting';
import AddUserModal from '../components/AddUserModal';
import { toast } from 'sonner';

export default function AdminDashboard() {
  const { currentUser, isAdmin } = useAuth();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [addUserModalOpen, setAddUserModalOpen] = useState(false);

  const { data: tasks = [], isLoading: tasksLoading } = useGetAllTasks();
  const { data: members = [], isLoading: membersLoading } = useGetTeamMembers();
  const { data: users = [], isLoading: usersLoading } = useGetAllUsers(isAdmin);
  const deleteTask = useDeleteTask();

  const [filters, setFilters] = useState<TaskFiltersState>({ searchText: '', selectedAssignee: '' });
  const filteredTasks = useTaskFilters(tasks, filters);
  const sortedTasks = sortTasksByDeadlineAndPriority(filteredTasks);

  const handleDelete = async (taskId: bigint) => {
    if (!confirm('Delete this task?')) return;
    try {
      await deleteTask.mutateAsync(taskId);
      toast.success('Task deleted');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to delete task');
    }
  };

  const handleEditOpen = (task: Task) => {
    setEditTask(task);
    setEditModalOpen(true);
  };

  const handleEditClose = (open: boolean) => {
    setEditModalOpen(open);
    if (!open) setEditTask(null);
  };

  const completedCount = tasks.filter(t => t.status === Status.Completed).length;
  const inProgressCount = tasks.filter(t => t.status === Status.InProgress).length;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">Welcome back, {currentUser?.name}</p>
        </div>
        <Button
          onClick={() => setCreateModalOpen(true)}
          size="lg"
          className="gap-2 rounded-xl"
        >
          <Plus className="w-5 h-5" />
          Create Task
        </Button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Tasks', value: tasks.length, icon: ClipboardList, color: 'text-primary', bg: 'bg-primary/10' },
          { label: 'In Progress', value: inProgressCount, icon: BarChart3, color: 'text-blue-600', bg: 'bg-blue-500/10' },
          { label: 'Completed', value: completedCount, icon: ClipboardList, color: 'text-emerald-600', bg: 'bg-emerald-500/10' },
          { label: 'Team Members', value: members.length, icon: Users, color: 'text-purple-600', bg: 'bg-purple-500/10' },
        ].map(stat => (
          <div key={stat.label} className="bg-card border border-border rounded-2xl p-4 shadow-card">
            <div className="flex items-center gap-3 mb-2">
              <div className={`p-2 rounded-xl ${stat.bg}`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
            </div>
            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="tasks">
        <TabsList className="mb-6 bg-muted rounded-xl p-1">
          <TabsTrigger value="tasks" className="rounded-lg">
            <ClipboardList className="w-4 h-4 mr-2" />
            Tasks
          </TabsTrigger>
          <TabsTrigger value="team" className="rounded-lg">
            <Users className="w-4 h-4 mr-2" />
            Team Members
          </TabsTrigger>
        </TabsList>

        {/* Tasks Tab */}
        <TabsContent value="tasks">
          <div className="flex items-center justify-between mb-4 gap-4 flex-wrap">
            <TaskFilters
              filters={filters}
              teamMembers={members}
              onChange={setFilters}
            />
            <ReportExportButtons tasks={tasks} />
          </div>

          {tasksLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-40 rounded-2xl" />)}
            </div>
          ) : sortedTasks.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <ClipboardList className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p className="text-lg font-medium">No tasks found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sortedTasks.map(task => (
                <TaskCard
                  key={task.id.toString()}
                  task={task}
                  onEdit={() => handleEditOpen(task)}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Team Members Tab */}
        <TabsContent value="team">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Team Members ({members.length})</h2>
            <Button
              onClick={() => setAddUserModalOpen(true)}
              className="gap-2 rounded-xl"
            >
              <UserPlus className="w-4 h-4" />
              Add Team Member
            </Button>
          </div>

          {membersLoading ? (
            <div className="flex flex-col gap-3">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 rounded-xl" />)}
            </div>
          ) : members.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>No team members yet</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {members.map(member => (
                <div key={member} className="flex items-center gap-3 bg-card border border-border rounded-xl p-4 shadow-card">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                    {member.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{member}</p>
                    <p className="text-xs text-muted-foreground">
                      {tasks.filter(t => t.assignedTo === member).length} tasks assigned
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <CreateTaskModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        teamMembers={members}
      />
      {editTask && (
        <EditTaskModal
          task={editTask}
          open={editModalOpen}
          onOpenChange={handleEditClose}
        />
      )}
      <AddUserModal
        open={addUserModalOpen}
        onOpenChange={setAddUserModalOpen}
      />
    </div>
  );
}

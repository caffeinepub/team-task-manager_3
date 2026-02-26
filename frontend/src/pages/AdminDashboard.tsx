import React, { useState } from 'react';
import { useGetAllTasks, useGetTeamMembers, useDeleteTask } from '../hooks/useQueries';
import { useAuth } from '../contexts/AuthContext';
import AddUserModal from '../components/AddUserModal';
import CreateTaskModal from '../components/CreateTaskModal';
import EditTaskModal from '../components/EditTaskModal';
import TaskCard from '../components/TaskCard';
import ReportExportButtons from '../components/ReportExportButtons';
import { Task, Status, Priority, TeamMember } from '../backend';
import {
  LayoutDashboard,
  Users,
  CheckSquare,
  TrendingUp,
  UserPlus,
  Plus,
  Trash2,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

export default function AdminDashboard() {
  const { currentUser, isAdmin } = useAuth();
  const { data: tasks = [], isLoading: tasksLoading } = useGetAllTasks();
  const { data: members = [], isLoading: membersLoading } = useGetTeamMembers();
  const deleteTask = useDeleteTask();

  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Extra safety check for admin role
  const userIsAdmin =
    isAdmin ||
    (currentUser?.role != null &&
      String(currentUser.role).toLowerCase() === 'admin');

  // Stats
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === Status.Completed).length;
  const inProgressTasks = tasks.filter((t) => t.status === Status.InProgress).length;
  const highPriorityTasks = tasks.filter((t) => t.priority === Priority.High).length;

  const memberNames = members.map((m: TeamMember) => m.name);

  const handleDeleteTask = async (taskId: bigint) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    try {
      await deleteTask.mutateAsync(taskId);
      toast.success('Task deleted successfully');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to delete task');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-xl">
            <LayoutDashboard className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              Welcome back, {currentUser?.name || 'Admin'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ReportExportButtons tasks={tasks} />
          <Button onClick={() => setShowCreateTaskModal(true)} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            New Task
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Tasks" value={totalTasks} icon={<CheckSquare className="w-5 h-5" />} color="primary" />
        <StatCard label="Completed" value={completedTasks} icon={<TrendingUp className="w-5 h-5" />} color="success" />
        <StatCard label="In Progress" value={inProgressTasks} icon={<TrendingUp className="w-5 h-5" />} color="warning" />
        <StatCard label="High Priority" value={highPriorityTasks} icon={<AlertCircle className="w-5 h-5" />} color="destructive" />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="tasks">
        <TabsList className="mb-6">
          <TabsTrigger value="tasks" className="flex items-center gap-2">
            <CheckSquare className="w-4 h-4" />
            Tasks ({totalTasks})
          </TabsTrigger>
          <TabsTrigger value="team" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Team ({members.length})
          </TabsTrigger>
        </TabsList>

        {/* Tasks Tab */}
        <TabsContent value="tasks">
          {tasksLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 bg-muted animate-pulse rounded-2xl" />
              ))}
            </div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <CheckSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-lg font-medium">No tasks yet</p>
              <p className="text-sm mt-1">Click "New Task" to create one</p>
            </div>
          ) : (
            <div className="space-y-3">
              {tasks.map((task) => (
                <div key={String(task.id)} className="relative group">
                  <TaskCard task={task} />
                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 bg-background/80 backdrop-blur-sm"
                      onClick={() => setEditingTask(task)}
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 bg-background/80 backdrop-blur-sm text-destructive hover:text-destructive"
                      onClick={() => handleDeleteTask(task.id)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Team Tab */}
        <TabsContent value="team">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Team Members</h2>
            {/* Add Team Member button for admins */}
            {userIsAdmin && (
              <Button
                onClick={() => setShowAddUserModal(true)}
                className="flex items-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                Add Team Member
              </Button>
            )}
          </div>

          {membersLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-muted animate-pulse rounded-2xl" />
              ))}
            </div>
          ) : members.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No team members yet</p>
              {userIsAdmin && (
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => setShowAddUserModal(true)}
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Add First Member
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {members.map((member: TeamMember) => (
                <div
                  key={member.email || member.name}
                  className="flex items-center justify-between p-4 bg-card border border-border rounded-2xl"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{member.name}</p>
                      <p className="text-xs text-muted-foreground">{member.email}</p>
                    </div>
                  </div>
                  <Badge variant={String(member.role).toLowerCase() === 'admin' ? 'default' : 'secondary'}>
                    {String(member.role).toLowerCase() === 'admin' ? 'Admin' : 'Member'}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Modals — use onOpenChange as defined in AddUserModal/EditTaskModal */}
      <AddUserModal
        open={showAddUserModal}
        onOpenChange={setShowAddUserModal}
      />

      <CreateTaskModal
        open={showCreateTaskModal}
        onClose={() => setShowCreateTaskModal(false)}
        teamMembers={memberNames}
      />

      {editingTask && (
        <EditTaskModal
          open={!!editingTask}
          onOpenChange={(open) => { if (!open) setEditingTask(null); }}
          task={editingTask}
        />
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: 'primary' | 'success' | 'warning' | 'destructive';
}) {
  const colorMap = {
    primary: 'text-primary bg-primary/10',
    success: 'text-green-600 bg-green-50 dark:bg-green-950/30',
    warning: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-950/30',
    destructive: 'text-destructive bg-destructive/10',
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-4 shadow-card">
      <div className={`inline-flex p-2 rounded-xl mb-3 ${colorMap[color]}`}>
        {icon}
      </div>
      <p className="text-2xl font-bold text-foreground">{value}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}

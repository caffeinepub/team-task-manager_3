import { useState } from 'react';
import { Plus, Users, BarChart2, CheckCircle2, Clock, AlertTriangle, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import TaskCard from '../components/TaskCard';
import TaskFilters from '../components/TaskFilters';
import CreateTaskModal from '../components/CreateTaskModal';
import ManageTeamModal from '../components/ManageTeamModal';
import ReportExportButtons from '../components/ReportExportButtons';
import TeamMemberCard from '../components/TeamMemberCard';
import { useGetAllTasks, useGetTeamMembers } from '../hooks/useQueries';
import { useTaskFilters, type TaskFiltersState } from '../hooks/useTaskFilters';
import { sortTasksByDeadlineAndPriority } from '../utils/taskSorting';
import { Status } from '../backend';

function StatCard({ label, value, icon: Icon, color }: { label: string; value: number; icon: React.ElementType; color: string }) {
  return (
    <div className="rounded-xl border border-border/50 bg-card p-4 flex items-center gap-3">
      <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${color}`}>
        <Icon className="h-4.5 w-4.5" />
      </div>
      <div>
        <p className="text-2xl font-display font-bold">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [createOpen, setCreateOpen] = useState(false);
  const [teamOpen, setTeamOpen] = useState(false);
  const [filters, setFilters] = useState<TaskFiltersState>({ searchText: '', selectedAssignee: '' });
  const [activeTab, setActiveTab] = useState<'tasks' | 'members'>('tasks');

  const { data: tasks = [], isLoading: tasksLoading } = useGetAllTasks();
  const { data: teamMembers = [], isLoading: membersLoading } = useGetTeamMembers();

  const sortedTasks = sortTasksByDeadlineAndPriority(tasks);
  const filteredTasks = useTaskFilters(sortedTasks, filters);

  // Stats
  const pendingCount = tasks.filter(t => t.status === Status.Pending).length;
  const inProgressCount = tasks.filter(t => t.status === Status.InProgress).length;
  const completedCount = tasks.filter(t => t.status === Status.Completed).length;
  const carryForwardCount = tasks.filter(t => t.status === Status.CarryForward).length;
  const overdueCount = tasks.filter(t => {
    if (t.status === Status.Completed) return false;
    return Number(t.deadline) / 1_000_000 < Date.now();
  }).length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold">Admin Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {tasks.length} task{tasks.length !== 1 ? 's' : ''} · {teamMembers.length} team member{teamMembers.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <ReportExportButtons tasks={tasks} />
          <Button
            variant="outline"
            size="sm"
            onClick={() => setTeamOpen(true)}
            className="h-9 text-sm border-border/50"
          >
            <Users className="h-4 w-4 mr-1.5" />
            Manage Team
          </Button>
          <Button size="sm" onClick={() => setCreateOpen(true)} className="h-9 text-sm">
            <Plus className="h-4 w-4 mr-1.5" />
            New Task
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <StatCard label="Pending" value={pendingCount} icon={Clock} color="bg-muted/60 text-muted-foreground" />
        <StatCard label="In Progress" value={inProgressCount} icon={BarChart2} color="bg-blue-500/15 text-blue-400" />
        <StatCard label="Completed" value={completedCount} icon={CheckCircle2} color="bg-green-500/15 text-green-400" />
        <StatCard label="Carry Forward" value={carryForwardCount} icon={RotateCcw} color="bg-carry-forward/15 text-carry-forward" />
        <StatCard label="Overdue" value={overdueCount} icon={AlertTriangle} color="bg-red-500/15 text-red-400" />
      </div>

      {/* Tab switcher */}
      <div className="flex items-center gap-1 p-1 bg-secondary/40 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab('tasks')}
          className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
            activeTab === 'tasks'
              ? 'bg-card text-foreground shadow-xs'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          All Tasks
        </button>
        <button
          onClick={() => setActiveTab('members')}
          className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
            activeTab === 'members'
              ? 'bg-card text-foreground shadow-xs'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Team Members
          {teamMembers.length > 0 && (
            <span className="ml-1.5 text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded-full">
              {teamMembers.length}
            </span>
          )}
        </button>
      </div>

      {/* Tasks tab */}
      {activeTab === 'tasks' && (
        <>
          {/* Filters */}
          <TaskFilters
            filters={filters}
            teamMembers={teamMembers}
            onChange={setFilters}
          />

          {/* Task list */}
          {tasksLoading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-28 w-full rounded-xl" />
              ))}
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-border/40 rounded-xl">
              <div className="text-4xl mb-3">📋</div>
              <p className="font-display font-semibold text-foreground">
                {tasks.length === 0 ? 'No tasks yet' : 'No tasks match your filters'}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {tasks.length === 0
                  ? 'Create your first task to get started'
                  : 'Try adjusting your search or filter criteria'}
              </p>
              {tasks.length === 0 && (
                <div className="flex items-center justify-center gap-2 mt-4">
                  <Button size="sm" variant="outline" onClick={() => setTeamOpen(true)}>
                    <Users className="h-4 w-4 mr-1.5" />
                    Add Team Members
                  </Button>
                  <Button size="sm" onClick={() => setCreateOpen(true)}>
                    <Plus className="h-4 w-4 mr-1.5" />
                    Create Task
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTasks.map(task => (
                <TaskCard key={String(task.id)} task={task} showAssignee />
              ))}
            </div>
          )}
        </>
      )}

      {/* Team Members tab */}
      {activeTab === 'members' && (
        <div className="space-y-3">
          {membersLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-xl" />
              ))}
            </div>
          ) : teamMembers.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-border/40 rounded-xl">
              <div className="text-4xl mb-3">👥</div>
              <p className="font-display font-semibold text-foreground">No team members yet</p>
              <p className="text-sm text-muted-foreground mt-1">Add team members to assign tasks to them</p>
              <Button size="sm" variant="outline" className="mt-4" onClick={() => setTeamOpen(true)}>
                <Users className="h-4 w-4 mr-1.5" />
                Add Team Members
              </Button>
            </div>
          ) : (
            <>
              <p className="text-xs text-muted-foreground">
                Click on a team member's name to view their assigned tasks.
              </p>
              {teamMembers.map(member => (
                <TeamMemberCard key={member} memberName={member} />
              ))}
            </>
          )}
        </div>
      )}

      {/* Modals */}
      <CreateTaskModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        teamMembers={teamMembers}
      />
      <ManageTeamModal
        open={teamOpen}
        onClose={() => setTeamOpen(false)}
      />
    </div>
  );
}

import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { CheckSquare, Clock, AlertTriangle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useGetAllTasks, useGetTeamMembers } from '../hooks/useQueries';
import { useAuth } from '../contexts/AuthContext';
import { sortTasksByDeadlineAndPriority } from '../utils/taskSorting';
import TaskCard from '../components/TaskCard';
import { Status } from '../backend';

export default function TeamMemberView() {
  const navigate = useNavigate();
  const { isAuthenticated, currentUser } = useAuth();
  const { data: tasks = [], isLoading: tasksLoading } = useGetAllTasks();
  const { data: teamMembers = [], isLoading: membersLoading } = useGetTeamMembers();

  const [selectedMember, setSelectedMember] = useState(currentUser?.name ?? '');

  // All hooks must be called before any early return
  const memberTasks = sortTasksByDeadlineAndPriority(
    tasks.filter(t => t.assignedTo === selectedMember)
  );

  const stats = {
    pending: memberTasks.filter(t => t.status === Status.Pending).length,
    inProgress: memberTasks.filter(t => t.status === Status.InProgress).length,
    completed: memberTasks.filter(t => t.status === Status.Completed).length,
    overdue: memberTasks.filter(t => {
      const ms = Number(t.deadline) / 1_000_000;
      return ms < Date.now() && t.status !== Status.Completed;
    }).length,
  };

  if (!isAuthenticated) {
    navigate({ to: '/login' });
    return null;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">My Tasks</h1>
        <p className="text-sm text-muted-foreground mt-1">View tasks assigned to a team member</p>
      </div>

      {/* Member selector */}
      <div className="max-w-xs">
        {membersLoading ? (
          <Skeleton className="h-10 w-full" />
        ) : (
          <Select value={selectedMember} onValueChange={setSelectedMember}>
            <SelectTrigger>
              <SelectValue placeholder="Select team member" />
            </SelectTrigger>
            <SelectContent>
              {teamMembers.map(member => (
                <SelectItem key={member} value={member}>{member}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {selectedMember && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Pending', value: stats.pending, icon: Clock, color: 'text-yellow-500' },
              { label: 'In Progress', value: stats.inProgress, icon: CheckSquare, color: 'text-blue-500' },
              { label: 'Completed', value: stats.completed, icon: CheckSquare, color: 'text-green-500' },
              { label: 'Overdue', value: stats.overdue, icon: AlertTriangle, color: 'text-destructive' },
            ].map(({ label, value, icon: Icon, color }) => (
              <Card key={label} className="shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-muted-foreground">{label}</span>
                    <Icon size={14} className={color} />
                  </div>
                  <p className={`text-2xl font-bold ${color}`}>{value}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Tasks */}
          {tasksLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 w-full rounded-xl" />)}
            </div>
          ) : memberTasks.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-lg font-medium">No tasks assigned</p>
            </div>
          ) : (
            <div className="space-y-3">
              {memberTasks.map(task => (
                <TaskCard key={task.id.toString()} task={task} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

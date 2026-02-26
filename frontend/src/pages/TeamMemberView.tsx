import { useState } from 'react';
import { CheckSquare, Clock, AlertTriangle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useGetAllTasks, useGetTeamMembers } from '../hooks/useQueries';
import { useAuth } from '../contexts/AuthContext';
import { sortTasksByDeadlineAndPriority } from '../utils/taskSorting';
import TaskCard from '../components/TaskCard';
import { Status, type TeamMember } from '../backend';

export default function TeamMemberView() {
  const { currentUser } = useAuth();
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
              {teamMembers.map((member: TeamMember) => (
                <SelectItem key={member.name} value={member.name}>
                  {member.name}
                </SelectItem>
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
              { label: 'Pending', value: stats.pending, icon: <Clock size={16} />, color: 'text-warning' },
              { label: 'In Progress', value: stats.inProgress, icon: <CheckSquare size={16} />, color: 'text-primary' },
              { label: 'Completed', value: stats.completed, icon: <CheckSquare size={16} />, color: 'text-emerald-500' },
              { label: 'Overdue', value: stats.overdue, icon: <AlertTriangle size={16} />, color: 'text-destructive' },
            ].map(({ label, value, icon, color }) => (
              <Card key={label} className="rounded-2xl shadow-card">
                <CardContent className="p-4">
                  <div className={`flex items-center gap-2 ${color} mb-1`}>
                    {icon}
                    <span className="text-xs font-semibold">{label}</span>
                  </div>
                  <p className="text-2xl font-bold text-foreground">{value}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Tasks */}
          {tasksLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <Skeleton key={i} className="h-28 w-full rounded-2xl" />
              ))}
            </div>
          ) : memberTasks.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <CheckSquare size={40} className="mx-auto mb-3 opacity-30" />
              <p className="font-semibold">No tasks assigned to {selectedMember}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {memberTasks.map(task => (
                <TaskCard key={task.id.toString()} task={task} />
              ))}
            </div>
          )}
        </>
      )}

      {!selectedMember && !membersLoading && (
        <div className="text-center py-12 text-muted-foreground">
          <p className="font-semibold">Select a team member to view their tasks</p>
        </div>
      )}
    </div>
  );
}

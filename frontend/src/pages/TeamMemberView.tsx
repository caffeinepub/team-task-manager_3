import { useState } from 'react';
import { User, ChevronDown } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import TaskCard from '../components/TaskCard';
import { useGetTeamMembers, useGetTasksByAssignee } from '../hooks/useQueries';
import { sortTasksByDeadlineAndPriority } from '../utils/taskSorting';
import { Status } from '../backend';

export default function TeamMemberView() {
  const [selectedMember, setSelectedMember] = useState('');
  const { data: teamMembers = [], isLoading: membersLoading } = useGetTeamMembers();
  const { data: tasks = [], isLoading: tasksLoading } = useGetTasksByAssignee(selectedMember);

  const sortedTasks = sortTasksByDeadlineAndPriority(tasks);

  const pendingCount = tasks.filter(t => t.status === Status.Pending).length;
  const inProgressCount = tasks.filter(t => t.status === Status.InProgress).length;
  const completedCount = tasks.filter(t => t.status === Status.Completed).length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page header */}
      <div>
        <h1 className="font-display text-2xl font-bold">My Tasks</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Select your name to view your assigned tasks
        </p>
      </div>

      {/* Member selector */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground shrink-0">
          <User className="h-4 w-4" />
          <span>Viewing as:</span>
        </div>
        {membersLoading ? (
          <Skeleton className="h-9 w-48" />
        ) : (
          <Select value={selectedMember || '__none__'} onValueChange={val => setSelectedMember(val === '__none__' ? '' : val)}>
            <SelectTrigger className="w-48 h-9 text-sm bg-secondary/50 border-border/50">
              <SelectValue placeholder="Select your name..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__none__" disabled>
                Select your name...
              </SelectItem>
              {teamMembers.map(member => (
                <SelectItem key={member} value={member}>
                  {member}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Content */}
      {!selectedMember ? (
        <div className="text-center py-16 border border-dashed border-border/40 rounded-xl">
          <div className="text-4xl mb-3">👤</div>
          <p className="font-display font-semibold text-foreground">Select your name above</p>
          <p className="text-sm text-muted-foreground mt-1">
            Choose your name from the dropdown to see your assigned tasks
          </p>
        </div>
      ) : tasksLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-xl" />
          ))}
        </div>
      ) : (
        <>
          {/* Stats for this member */}
          {tasks.length > 0 && (
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary/40 border border-border/30 text-sm">
                <span className="h-2 w-2 rounded-full bg-muted-foreground" />
                <span className="text-muted-foreground">{pendingCount} Pending</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-sm">
                <span className="h-2 w-2 rounded-full bg-blue-400" />
                <span className="text-blue-400">{inProgressCount} In Progress</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/20 text-sm">
                <span className="h-2 w-2 rounded-full bg-green-400" />
                <span className="text-green-400">{completedCount} Completed</span>
              </div>
            </div>
          )}

          {/* Task list */}
          {sortedTasks.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-border/40 rounded-xl">
              <div className="text-4xl mb-3">🎉</div>
              <p className="font-display font-semibold text-foreground">No tasks assigned</p>
              <p className="text-sm text-muted-foreground mt-1">
                {selectedMember} has no tasks assigned yet
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                {sortedTasks.length} task{sortedTasks.length !== 1 ? 's' : ''} assigned to{' '}
                <span className="font-medium text-foreground">{selectedMember}</span>
              </p>
              {sortedTasks.map(task => (
                <TaskCard key={String(task.id)} task={task} showAssignee={false} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

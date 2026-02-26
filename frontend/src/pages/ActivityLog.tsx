import { useState, useMemo } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Activity, Filter, User, Calendar, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useGetAllActivityLogs } from '../hooks/useQueries';
import { useAuth } from '../contexts/AuthContext';
import { Variant_Login_StatusChanged_TaskEdited_TaskCreated_TaskDeleted } from '../backend';
import type { ActivityEntry } from '../backend';

function formatTimestamp(ts: bigint): string {
  const ms = Number(ts) / 1_000_000;
  const date = new Date(ms);
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }) + ' at ' + date.toLocaleTimeString('en-IN', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

function ActionBadge({ actionType }: { actionType: Variant_Login_StatusChanged_TaskEdited_TaskCreated_TaskDeleted }) {
  const config: Record<string, { label: string; className: string }> = {
    [Variant_Login_StatusChanged_TaskEdited_TaskCreated_TaskDeleted.TaskCreated]: {
      label: 'Created',
      className: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25',
    },
    [Variant_Login_StatusChanged_TaskEdited_TaskCreated_TaskDeleted.TaskEdited]: {
      label: 'Edited',
      className: 'bg-blue-500/15 text-blue-400 border border-blue-500/25',
    },
    [Variant_Login_StatusChanged_TaskEdited_TaskCreated_TaskDeleted.StatusChanged]: {
      label: 'Status Changed',
      className: 'bg-warning/15 text-warning border border-warning/25',
    },
    [Variant_Login_StatusChanged_TaskEdited_TaskCreated_TaskDeleted.TaskDeleted]: {
      label: 'Deleted',
      className: 'bg-destructive/15 text-destructive border border-destructive/25',
    },
    [Variant_Login_StatusChanged_TaskEdited_TaskCreated_TaskDeleted.Login]: {
      label: 'Login',
      className: 'bg-primary/15 text-primary border border-primary/25',
    },
  };
  const c = config[actionType] ?? { label: String(actionType), className: 'bg-muted text-muted-foreground border border-border' };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${c.className}`}>
      {c.label}
    </span>
  );
}

function dotColor(actionType: Variant_Login_StatusChanged_TaskEdited_TaskCreated_TaskDeleted): string {
  switch (actionType) {
    case Variant_Login_StatusChanged_TaskEdited_TaskCreated_TaskDeleted.TaskCreated: return 'bg-emerald-400';
    case Variant_Login_StatusChanged_TaskEdited_TaskCreated_TaskDeleted.TaskEdited: return 'bg-blue-400';
    case Variant_Login_StatusChanged_TaskEdited_TaskCreated_TaskDeleted.StatusChanged: return 'bg-warning';
    case Variant_Login_StatusChanged_TaskEdited_TaskCreated_TaskDeleted.TaskDeleted: return 'bg-destructive';
    case Variant_Login_StatusChanged_TaskEdited_TaskCreated_TaskDeleted.Login: return 'bg-primary';
    default: return 'bg-muted-foreground';
  }
}

export default function ActivityLog() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { data: logs = [], isLoading } = useGetAllActivityLogs();

  const [actorFilter, setActorFilter] = useState('');
  const [taskFilter, setTaskFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Sort descending by timestamp — hooks must be called before any early return
  const sortedLogs = useMemo(() =>
    [...logs].sort((a, b) => Number(b.timestamp - a.timestamp)),
    [logs]
  );

  // Distinct actor names
  const actorNames = useMemo(() =>
    Array.from(new Set(sortedLogs.map(l => l.actorName))).filter(Boolean),
    [sortedLogs]
  );

  // Apply filters
  const filteredLogs = useMemo(() => {
    return sortedLogs.filter(entry => {
      if (actorFilter && entry.actorName !== actorFilter) return false;
      if (taskFilter && !entry.taskTitle.toLowerCase().includes(taskFilter.toLowerCase())) return false;
      if (dateFrom) {
        const fromMs = new Date(dateFrom).getTime();
        const entryMs = Number(entry.timestamp) / 1_000_000;
        if (entryMs < fromMs) return false;
      }
      if (dateTo) {
        const toMs = new Date(dateTo).getTime() + 86400000;
        const entryMs = Number(entry.timestamp) / 1_000_000;
        if (entryMs > toMs) return false;
      }
      return true;
    });
  }, [sortedLogs, actorFilter, taskFilter, dateFrom, dateTo]);

  // Auth guard after all hooks
  if (!isAuthenticated) {
    navigate({ to: '/login' });
    return null;
  }

  const clearFilters = () => {
    setActorFilter('');
    setTaskFilter('');
    setDateFrom('');
    setDateTo('');
  };

  const hasFilters = actorFilter || taskFilter || dateFrom || dateTo;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
              <Activity size={20} className="text-primary" />
            </div>
            Activity Log
          </h1>
          <p className="text-sm text-muted-foreground mt-1 ml-13">
            {filteredLogs.length} {filteredLogs.length === 1 ? 'entry' : 'entries'}
            {hasFilters ? ' (filtered)' : ''}
          </p>
        </div>
        {hasFilters && (
          <button
            onClick={clearFilters}
            className="text-sm text-primary hover:underline font-semibold"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-card border border-border rounded-2xl p-5 space-y-4 shadow-card">
        <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
          <Filter size={14} />
          Filters
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Actor filter */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold flex items-center gap-1">
              <User size={12} /> User
            </Label>
            <Select value={actorFilter || '__all__'} onValueChange={v => setActorFilter(v === '__all__' ? '' : v)}>
              <SelectTrigger className="h-9 text-sm rounded-xl">
                <SelectValue placeholder="All users" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="__all__">All users</SelectItem>
                {actorNames.map(name => (
                  <SelectItem key={name} value={name}>{name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Task filter */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold flex items-center gap-1">
              <Search size={12} /> Task Title
            </Label>
            <Input
              placeholder="Search task..."
              value={taskFilter}
              onChange={e => setTaskFilter(e.target.value)}
              className="h-9 text-sm rounded-xl"
            />
          </div>

          {/* Date from */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold flex items-center gap-1">
              <Calendar size={12} /> From Date
            </Label>
            <Input
              type="date"
              value={dateFrom}
              onChange={e => setDateFrom(e.target.value)}
              className="h-9 text-sm rounded-xl"
            />
          </div>

          {/* Date to */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold flex items-center gap-1">
              <Calendar size={12} /> To Date
            </Label>
            <Input
              type="date"
              value={dateTo}
              onChange={e => setDateTo(e.target.value)}
              className="h-9 text-sm rounded-xl"
            />
          </div>
        </div>
      </div>

      {/* Timeline */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-20 w-full rounded-2xl" />
          ))}
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
            <Activity size={28} className="opacity-40" />
          </div>
          <p className="text-lg font-bold">No activity found</p>
          <p className="text-sm mt-1">
            {hasFilters ? 'Try adjusting your filters' : 'Activity will appear here as tasks are created and modified'}
          </p>
        </div>
      ) : (
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-border/60" />

          <div className="space-y-4">
            {filteredLogs.map(entry => (
              <div key={entry.id.toString()} className="relative flex gap-4 pl-12">
                {/* Dot */}
                <div className={`absolute left-3.5 top-4 w-3 h-3 rounded-full border-2 border-background ${dotColor(entry.actionType)}`} />

                {/* Card */}
                <div className="flex-1 bg-card border border-border rounded-2xl p-4 shadow-card hover:shadow-card-hover transition-shadow">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <ActionBadge actionType={entry.actionType} />
                      <span className="text-sm font-medium text-foreground">
                        {entry.description}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatTimestamp(entry.timestamp)}
                    </span>
                  </div>
                  <div className="mt-1.5 flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <User size={11} />
                      {entry.actorName}
                    </span>
                    {entry.taskTitle && (
                      <>
                        <span>·</span>
                        <span>Task: <strong className="text-foreground">{entry.taskTitle}</strong></span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

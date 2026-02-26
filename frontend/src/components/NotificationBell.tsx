import React, { useState, useRef, useEffect } from 'react';
import { Bell, X, Clock, CheckCircle, AlertTriangle, LogIn } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useGetRecentLoginEvents } from '../hooks/useQueries';
import { useTaskReminders } from '../hooks/useTaskReminders';
import { Variant_Login_StatusChanged_TaskEdited_TaskCreated_TaskDeleted } from '../backend';

function formatTimestamp(ts: bigint): string {
  const ms = Number(ts / 1_000_000n);
  const date = new Date(ms);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60_000);
  const diffHours = Math.floor(diffMs / 3_600_000);
  const diffDays = Math.floor(diffMs / 86_400_000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const { isAdmin } = useAuth();

  // useTaskReminders fetches tasks internally — no argument needed
  const reminders = useTaskReminders();
  const { data: loginEvents = [] } = useGetRecentLoginEvents();

  const sortedLoginEvents = [...loginEvents]
    .filter(e => e.actionType === Variant_Login_StatusChanged_TaskEdited_TaskCreated_TaskDeleted.Login)
    .sort((a, b) => Number(b.timestamp - a.timestamp))
    .slice(0, 10);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const loginCount = isAdmin ? sortedLoginEvents.length : 0;
  const totalCount = reminders.totalCount + loginCount;

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {totalCount > 0 && (
          <span className="absolute top-1 right-1 h-4 w-4 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center font-bold">
            {totalCount > 9 ? '9+' : totalCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-card border border-border rounded-xl shadow-lg z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <h3 className="font-semibold text-foreground">Notifications</h3>
            <button
              onClick={() => setOpen(false)}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {/* Overdue tasks */}
            {reminders.overdue.length > 0 && (
              <div className="px-4 py-2">
                <p className="text-xs font-semibold text-destructive uppercase tracking-wide mb-2">
                  Overdue
                </p>
                {reminders.overdue.map((task) => (
                  <div key={task.id.toString()} className="flex items-start gap-2 py-2 border-b border-border/50 last:border-0">
                    <AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{task.title}</p>
                      <p className="text-xs text-muted-foreground">Assigned to {task.assignedTo}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Due in 1 hour */}
            {reminders.dueInOneHour.length > 0 && (
              <div className="px-4 py-2">
                <p className="text-xs font-semibold text-warning uppercase tracking-wide mb-2">
                  Due in 1 Hour
                </p>
                {reminders.dueInOneHour.map((task) => (
                  <div key={task.id.toString()} className="flex items-start gap-2 py-2 border-b border-border/50 last:border-0">
                    <Clock className="h-4 w-4 text-warning shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{task.title}</p>
                      <p className="text-xs text-muted-foreground">Assigned to {task.assignedTo}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Due in 24 hours */}
            {reminders.dueInTwentyFourHours.length > 0 && (
              <div className="px-4 py-2">
                <p className="text-xs font-semibold text-yellow-600 dark:text-yellow-400 uppercase tracking-wide mb-2">
                  Due in 24 Hours
                </p>
                {reminders.dueInTwentyFourHours.map((task) => (
                  <div key={task.id.toString()} className="flex items-start gap-2 py-2 border-b border-border/50 last:border-0">
                    <Clock className="h-4 w-4 text-yellow-600 dark:text-yellow-400 shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{task.title}</p>
                      <p className="text-xs text-muted-foreground">Assigned to {task.assignedTo}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Carry forward tasks */}
            {reminders.carryForward.length > 0 && (
              <div className="px-4 py-2">
                <p className="text-xs font-semibold text-carry-forward uppercase tracking-wide mb-2">
                  Carry Forward
                </p>
                {reminders.carryForward.map((task) => (
                  <div key={task.id.toString()} className="flex items-start gap-2 py-2 border-b border-border/50 last:border-0">
                    <Clock className="h-4 w-4 text-carry-forward shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{task.title}</p>
                      <p className="text-xs text-muted-foreground">Assigned to {task.assignedTo}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Recent Logins — Admin Only */}
            {isAdmin && sortedLoginEvents.length > 0 && (
              <div className="px-4 py-2">
                <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-2">
                  Recent Logins
                </p>
                {sortedLoginEvents.map((event) => (
                  <div key={event.id.toString()} className="flex items-start gap-2 py-2 border-b border-border/50 last:border-0">
                    <LogIn className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground truncate">{event.actorName}</p>
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs text-muted-foreground truncate">{event.actorEmail}</p>
                        <p className="text-xs text-muted-foreground shrink-0">{formatTimestamp(event.timestamp)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Empty state */}
            {totalCount === 0 && (
              <div className="px-4 py-8 text-center">
                <CheckCircle className="h-8 w-8 text-success mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">All caught up!</p>
                <p className="text-xs text-muted-foreground mt-1">No pending notifications</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

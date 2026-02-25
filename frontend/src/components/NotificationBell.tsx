import { useState, useRef, useEffect } from 'react';
import { Bell, AlertTriangle, Clock, AlertCircle, X, RotateCcw } from 'lucide-react';
import { useTaskReminders } from '../hooks/useTaskReminders';
import { type Task } from '../backend';

function formatDeadline(deadline: bigint): string {
  const ms = Number(deadline) / 1_000_000;
  return new Date(ms).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

interface ReminderItemProps {
  task: Task;
  type: 'overdue' | 'critical' | 'warning' | 'carryForward';
}

function ReminderItem({ task, type }: ReminderItemProps) {
  const config = {
    overdue: { icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-500/10', label: 'Overdue' },
    critical: { icon: AlertCircle, color: 'text-orange-400', bg: 'bg-orange-500/10', label: 'Due < 1hr' },
    warning: { icon: Clock, color: 'text-yellow-400', bg: 'bg-yellow-500/10', label: 'Due < 24hr' },
    carryForward: { icon: RotateCcw, color: 'text-carry-forward', bg: 'bg-carry-forward/10', label: 'Carry Forward' },
  }[type];

  const Icon = config.icon;

  return (
    <div className={`flex items-start gap-2.5 p-2.5 rounded-lg ${config.bg} border border-border/20`}>
      <Icon className={`h-3.5 w-3.5 mt-0.5 shrink-0 ${config.color}`} />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium truncate">{task.title}</p>
        <p className="text-[10px] text-muted-foreground mt-0.5">
          {task.assignedTo} · {formatDeadline(task.deadline)}
        </p>
      </div>
      <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${config.color} ${config.bg} border border-current/20 shrink-0`}>
        {config.label}
      </span>
    </div>
  );
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { overdue, dueInOneHour, dueInTwentyFourHours, carryForward, totalCount } = useTaskReminders();

  // Close on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => setOpen(v => !v)}
        className="relative flex items-center justify-center h-9 w-9 rounded-lg hover:bg-secondary/60 transition-colors"
        aria-label="Notifications"
      >
        <Bell className="h-4.5 w-4.5 text-muted-foreground" />
        {totalCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-destructive-foreground">
            {totalCount > 9 ? '9+' : totalCount}
          </span>
        )}
      </button>

      {open && (
        <div
          ref={panelRef}
          className="absolute right-0 top-11 z-50 w-80 rounded-xl border border-border/60 bg-popover shadow-card-hover animate-fade-in"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border/40">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold font-display">Reminders</span>
              {totalCount > 0 && (
                <span className="text-xs bg-destructive/20 text-destructive px-1.5 py-0.5 rounded-full font-medium">
                  {totalCount}
                </span>
              )}
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Content */}
          <div className="max-h-96 overflow-y-auto p-3 space-y-3">
            {totalCount === 0 ? (
              <div className="text-center py-6">
                <Bell className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">All caught up! No pending reminders.</p>
              </div>
            ) : (
              <>
                {overdue.length > 0 && (
                  <div>
                    <p className="text-[10px] font-semibold text-red-400 uppercase tracking-wider mb-1.5">
                      Overdue ({overdue.length})
                    </p>
                    <div className="space-y-1.5">
                      {overdue.map(task => (
                        <ReminderItem key={String(task.id)} task={task} type="overdue" />
                      ))}
                    </div>
                  </div>
                )}

                {dueInOneHour.length > 0 && (
                  <div>
                    <p className="text-[10px] font-semibold text-orange-400 uppercase tracking-wider mb-1.5">
                      Due Soon — &lt;1 Hour ({dueInOneHour.length})
                    </p>
                    <div className="space-y-1.5">
                      {dueInOneHour.map(task => (
                        <ReminderItem key={String(task.id)} task={task} type="critical" />
                      ))}
                    </div>
                  </div>
                )}

                {dueInTwentyFourHours.length > 0 && (
                  <div>
                    <p className="text-[10px] font-semibold text-yellow-400 uppercase tracking-wider mb-1.5">
                      Due Today — &lt;24 Hours ({dueInTwentyFourHours.length})
                    </p>
                    <div className="space-y-1.5">
                      {dueInTwentyFourHours.map(task => (
                        <ReminderItem key={String(task.id)} task={task} type="warning" />
                      ))}
                    </div>
                  </div>
                )}

                {carryForward.length > 0 && (
                  <div>
                    <p className="text-[10px] font-semibold text-carry-forward uppercase tracking-wider mb-1.5">
                      Carry Forward — Needs Attention ({carryForward.length})
                    </p>
                    <div className="space-y-1.5">
                      {carryForward.map(task => (
                        <ReminderItem key={String(task.id)} task={task} type="carryForward" />
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

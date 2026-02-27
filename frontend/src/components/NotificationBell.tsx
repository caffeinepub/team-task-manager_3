import { useState, useRef, useEffect } from 'react';
import { Bell, X } from 'lucide-react';
import { useGetTasks } from '../hooks/useQueries';
import { useTaskReminders } from '../hooks/useTaskReminders';
import { type Task } from '../backend';

const NS_PER_MS = 1_000_000n;

function formatDeadline(deadline: bigint | undefined): string {
  if (!deadline) return 'No deadline';
  return new Date(Number(deadline / NS_PER_MS)).toLocaleString();
}

function ReminderItem({
  task,
  type,
}: {
  task: Task;
  type: 'overdue' | 'critical' | 'warning';
}) {
  const colors = {
    overdue: 'border-l-red-500 bg-red-500/10',
    critical: 'border-l-orange-500 bg-orange-500/10',
    warning: 'border-l-yellow-500 bg-yellow-500/10',
  };
  const labels = {
    overdue: '🔴 Overdue',
    critical: '🟠 Due in <1hr',
    warning: '🟡 Due in <24hrs',
  };
  const textColors = {
    overdue: 'text-red-300',
    critical: 'text-orange-300',
    warning: 'text-yellow-300',
  };

  const assigneeDisplay = task.assignees.length > 0 ? task.assignees.join(', ') : '';

  return (
    <div className={`border-l-2 pl-3 py-2 rounded-r-lg ${colors[type]}`}>
      <p className="text-xs font-semibold text-white truncate">{task.title}</p>
      {assigneeDisplay && <p className="text-xs text-slate-300">{assigneeDisplay}</p>}
      <p className="text-xs text-slate-400">{formatDeadline(task.deadline)}</p>
      <span className={`text-xs font-medium ${textColors[type]}`}>{labels[type]}</span>
    </div>
  );
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { data: tasks = [] } = useGetTasks();
  const reminders = useTaskReminders(tasks);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const hasReminders = reminders.totalCount > 0;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className="relative p-2 rounded-xl hover:bg-muted transition-colors"
        aria-label="Notifications"
      >
        <Bell size={20} className={hasReminders ? 'text-primary' : 'text-muted-foreground'} />
        {hasReminders && (
          <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
            {reminders.totalCount > 9 ? '9+' : reminders.totalCount}
          </span>
        )}
      </button>

      {open && (
        <div
          className="fixed z-[200] w-72 rounded-2xl shadow-2xl overflow-hidden border border-border"
          style={{
            top: (() => {
              const el = ref.current;
              if (!el) return 60;
              const rect = el.getBoundingClientRect();
              return rect.bottom + 8;
            })(),
            right: (() => {
              const el = ref.current;
              if (!el) return 16;
              return window.innerWidth - el.getBoundingClientRect().right;
            })(),
            background: 'oklch(0.19 0.04 285)',
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card">
            <div>
              <h3 className="font-semibold text-sm text-foreground">Reminders</h3>
              <p className="text-xs text-muted-foreground">{reminders.totalCount} active alerts</p>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="p-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            >
              <X size={14} />
            </button>
          </div>

          <div className="max-h-72 overflow-y-auto p-3 space-y-2">
            {reminders.totalCount === 0 ? (
              <div className="text-center py-6">
                <Bell size={24} className="mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">No reminders right now</p>
              </div>
            ) : (
              <>
                {reminders.overdue.map(t => (
                  <ReminderItem key={t.id.toString()} task={t} type="overdue" />
                ))}
                {reminders.dueInOneHour.map(t => (
                  <ReminderItem key={t.id.toString()} task={t} type="critical" />
                ))}
                {reminders.dueInTwentyFourHours.map(t => (
                  <ReminderItem key={t.id.toString()} task={t} type="warning" />
                ))}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

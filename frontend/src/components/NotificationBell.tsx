import React, { useState } from 'react';
import { Bell } from 'lucide-react';
import { useGetTasks } from '../hooks/useQueries';
import { useTaskReminders } from '../hooks/useTaskReminders';

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const { data: tasks = [] } = useGetTasks();
  const { overdue, dueInOneHour, dueInTwentyFourHours, totalCount } = useTaskReminders(tasks);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
      >
        <Bell className="w-5 h-5" />
        {totalCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center font-bold">
            {totalCount > 9 ? '9+' : totalCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-80 bg-popover border border-border rounded-xl shadow-lg z-50 overflow-hidden">
            <div className="p-3 border-b border-border">
              <h3 className="text-sm font-semibold text-foreground">Notifications</h3>
              {totalCount > 0 && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  {totalCount} pending reminder{totalCount !== 1 ? 's' : ''}
                </p>
              )}
            </div>
            <div className="max-h-72 overflow-y-auto">
              {totalCount === 0 ? (
                <div className="p-6 text-center">
                  <Bell className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No pending reminders</p>
                </div>
              ) : (
                <div className="p-2 space-y-1">
                  {overdue.map(task => (
                    <div key={String(task.id)} className="flex items-start gap-2 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                      <span className="w-2 h-2 rounded-full bg-destructive mt-1.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-medium text-foreground">{task.title}</p>
                        <p className="text-xs text-destructive">Overdue</p>
                      </div>
                    </div>
                  ))}
                  {dueInOneHour.map(task => (
                    <div key={String(task.id)} className="flex items-start gap-2 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                      <span className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-medium text-foreground">{task.title}</p>
                        <p className="text-xs text-amber-500 dark:text-amber-400">Due within 1 hour</p>
                      </div>
                    </div>
                  ))}
                  {dueInTwentyFourHours.map(task => (
                    <div key={String(task.id)} className="flex items-start gap-2 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                      <span className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-medium text-foreground">{task.title}</p>
                        <p className="text-xs text-primary">Due within 24 hours</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

import React, { useState } from 'react';
import { CheckCircle, MessageSquare, Plus, Edit, Trash2, Activity } from 'lucide-react';

type ActivityType = 'completed' | 'commented' | 'created' | 'updated' | 'deleted';

interface ActivityItem {
  id: number;
  type: ActivityType;
  user: string;
  action: string;
  target: string;
  timestamp: string;
  date: string;
}

const ACTIVITIES: ActivityItem[] = [
  { id: 1, type: 'completed', user: 'Alice Johnson', action: 'completed task', target: 'Brand Identity Design', timestamp: '2 hours ago', date: 'Today' },
  { id: 2, type: 'commented', user: 'Bob Smith', action: 'commented on', target: 'Mobile App Prototype', timestamp: '3 hours ago', date: 'Today' },
  { id: 3, type: 'created', user: 'Carol White', action: 'created task', target: 'API Integration', timestamp: '5 hours ago', date: 'Today' },
  { id: 4, type: 'updated', user: 'Dave Brown', action: 'updated', target: 'Marketing Campaign', timestamp: '1 day ago', date: 'Yesterday' },
  { id: 5, type: 'deleted', user: 'Eve Davis', action: 'deleted task', target: 'Old Design Files', timestamp: '1 day ago', date: 'Yesterday' },
  { id: 6, type: 'completed', user: 'Frank Miller', action: 'completed task', target: 'Sprint Planning', timestamp: '2 days ago', date: 'Feb 25' },
  { id: 7, type: 'created', user: 'Grace Wilson', action: 'created project', target: 'VisionBoard', timestamp: '2 days ago', date: 'Feb 25' },
  { id: 8, type: 'updated', user: 'Heidi Moore', action: 'updated status of', target: 'TaskWave', timestamp: '3 days ago', date: 'Feb 24' },
];

const typeConfig: Record<ActivityType, { icon: React.ReactNode; color: string; badgeClass: string }> = {
  completed: {
    icon: <CheckCircle className="w-4 h-4" />,
    color: 'text-emerald-500',
    badgeClass: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
  },
  commented: {
    icon: <MessageSquare className="w-4 h-4" />,
    color: 'text-primary',
    badgeClass: 'bg-primary/15 text-primary',
  },
  created: {
    icon: <Plus className="w-4 h-4" />,
    color: 'text-blue-500',
    badgeClass: 'bg-blue-500/15 text-blue-600 dark:text-blue-400',
  },
  updated: {
    icon: <Edit className="w-4 h-4" />,
    color: 'text-amber-500',
    badgeClass: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
  },
  deleted: {
    icon: <Trash2 className="w-4 h-4" />,
    color: 'text-destructive',
    badgeClass: 'bg-destructive/15 text-destructive',
  },
};

export default function Activities() {
  const [activeFilter, setActiveFilter] = useState<ActivityType | 'all'>('all');

  const filtered = ACTIVITIES.filter(a => activeFilter === 'all' || a.type === activeFilter);

  const grouped = filtered.reduce<Record<string, ActivityItem[]>>((acc, item) => {
    if (!acc[item.date]) acc[item.date] = [];
    acc[item.date].push(item);
    return acc;
  }, {});

  return (
    <div className="flex-1 overflow-y-auto scrollbar-thin bg-background">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border px-6 py-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-xl font-bold text-foreground">Activity Log</h1>
            <p className="text-sm text-muted-foreground">Track all team activities</p>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-3 flex-wrap">
          {(['all', 'completed', 'commented', 'created', 'updated', 'deleted'] as const).map(type => (
            <button
              key={type}
              onClick={() => setActiveFilter(type)}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium capitalize transition-all ${
                activeFilter === type
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      <div className="p-6 space-y-6">
        {Object.keys(grouped).length === 0 ? (
          <div className="text-center py-16">
            <Activity className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-muted-foreground">No activities found</p>
          </div>
        ) : (
          Object.entries(grouped).map(([date, items]) => (
            <div key={date}>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">{date}</h3>
              <div className="space-y-2">
                {items.map(item => {
                  const config = typeConfig[item.type];
                  return (
                    <div key={item.id} className="bg-card rounded-xl border border-border p-4 flex items-start gap-3 hover:shadow-sm transition-all">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${config.badgeClass}`}>
                        {config.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground">
                          <span className="font-semibold">{item.user}</span>
                          {' '}{item.action}{' '}
                          <span className="font-medium text-primary">{item.target}</span>
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">{item.timestamp}</p>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${config.badgeClass}`}>
                        {item.type}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

import React from 'react';
import { Activity } from 'lucide-react';

export default function ActivityLog() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Activity Log</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Recent activity across your team</p>
      </div>
      <div className="glass-card rounded-xl p-12 text-center">
        <Activity className="h-10 w-10 mx-auto text-muted-foreground mb-3 opacity-50" />
        <p className="text-muted-foreground font-medium">No activity recorded yet</p>
      </div>
    </div>
  );
}

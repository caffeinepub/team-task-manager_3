import React from 'react';
import { Check } from 'lucide-react';

const tasks = [
  { id: 1, label: 'Mascot Illustration', done: true },
  { id: 2, label: 'Mobile Prototype', done: false },
  { id: 3, label: 'UI Design Kits', done: false },
];

export default function TasksChecklist() {
  const doneCount = tasks.filter(t => t.done).length;
  const progress = Math.round((doneCount / tasks.length) * 100);

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-foreground">Tasks</h3>
        <span className="text-xs text-muted-foreground">{doneCount}/{tasks.length}</span>
      </div>
      <div className="space-y-2 mb-3">
        {tasks.map(task => (
          <div key={task.id} className="flex items-center gap-2.5">
            <div className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 ${
              task.done ? 'bg-primary' : 'border border-border bg-muted'
            }`}>
              {task.done && <Check className="w-2.5 h-2.5 text-primary-foreground" />}
            </div>
            <span className={`text-xs ${task.done ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
              {task.label}
            </span>
          </div>
        ))}
      </div>
      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-xs text-muted-foreground mt-1">{progress}% complete</p>
    </div>
  );
}

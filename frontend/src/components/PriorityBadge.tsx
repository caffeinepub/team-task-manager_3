import React from 'react';
import { Priority } from '../backend';

interface PriorityBadgeProps {
  priority: Priority;
}

export default function PriorityBadge({ priority }: PriorityBadgeProps) {
  const styles: Record<Priority, string> = {
    [Priority.High]: 'bg-red-500/15 text-red-600 dark:text-red-400',
    [Priority.Medium]: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
    [Priority.Low]: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
  };

  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${styles[priority]}`}>
      {priority}
    </span>
  );
}

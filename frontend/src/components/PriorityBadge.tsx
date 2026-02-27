import { Priority } from '../backend';

interface PriorityBadgeProps {
  priority: Priority;
  size?: 'sm' | 'md';
}

export default function PriorityBadge({ priority, size = 'sm' }: PriorityBadgeProps) {
  const config = {
    [Priority.High]: {
      label: 'High',
      emoji: '🔴',
      classes: 'bg-red-700/40 text-red-200 border border-red-500/40',
    },
    [Priority.Medium]: {
      label: 'Medium',
      emoji: '🟡',
      classes: 'bg-yellow-700/40 text-yellow-200 border border-yellow-500/40',
    },
    [Priority.Low]: {
      label: 'Low',
      emoji: '🟢',
      classes: 'bg-emerald-700/40 text-emerald-200 border border-emerald-500/40',
    },
  };

  const { label, emoji, classes } = config[priority];
  const sizeClasses = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1';

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium ${classes} ${sizeClasses}`}
    >
      <span>{emoji}</span>
      {label}
    </span>
  );
}

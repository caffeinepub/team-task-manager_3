import { Priority } from '../backend';

interface PriorityBadgeProps {
  priority: Priority;
  size?: 'sm' | 'md';
}

const PRIORITY_CONFIG = {
  [Priority.High]: {
    label: 'High',
    emoji: '🔴',
    classes: 'bg-red-500/15 text-red-400 border-red-500/30',
  },
  [Priority.Medium]: {
    label: 'Medium',
    emoji: '🟡',
    classes: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
  },
  [Priority.Low]: {
    label: 'Low',
    emoji: '🟢',
    classes: 'bg-green-500/15 text-green-400 border-green-500/30',
  },
};

export default function PriorityBadge({ priority, size = 'sm' }: PriorityBadgeProps) {
  const config = PRIORITY_CONFIG[priority] ?? PRIORITY_CONFIG[Priority.Medium];
  const sizeClasses = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-2.5 py-1';

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border font-medium ${sizeClasses} ${config.classes}`}
    >
      <span className="text-[10px]">{config.emoji}</span>
      {config.label}
    </span>
  );
}

import { useUpdateTaskStatus } from '../hooks/useQueries';
import { Task, TaskStatus } from '../backend';
import { Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface TaskStatusControlProps {
  task: Task;
}

const STATUS_OPTIONS = [
  { value: TaskStatus.ToDo, label: 'To Do', color: 'text-blue-400' },
  { value: TaskStatus.InProgress, label: 'In Progress', color: 'text-yellow-400' },
  { value: TaskStatus.Done, label: 'Done', color: 'text-green-400' },
];

const STATUS_STYLES: Record<string, string> = {
  [TaskStatus.ToDo]: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  [TaskStatus.InProgress]: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  [TaskStatus.Done]: 'bg-green-500/10 text-green-400 border-green-500/20',
};

export default function TaskStatusControl({ task }: TaskStatusControlProps) {
  const updateStatus = useUpdateTaskStatus();
  const isPending = updateStatus.isPending;

  const handleChange = async (value: string) => {
    try {
      await updateStatus.mutateAsync({
        taskId: task.id,
        newStatus: value as TaskStatus,
      });
    } catch {
      // error handled by toast in parent or silently
    }
  };

  return (
    <div className="flex items-center gap-1.5">
      {isPending && <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />}
      <Select value={task.status as string} onValueChange={handleChange} disabled={isPending}>
        <SelectTrigger className={`h-7 text-xs border rounded-full px-2.5 w-auto min-w-[90px] ${STATUS_STYLES[task.status as string] || ''}`}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {STATUS_OPTIONS.map(opt => (
            <SelectItem key={opt.value} value={opt.value} className={`text-xs ${opt.color}`}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Status } from '../backend';
import { useUpdateTaskStatus } from '../hooks/useQueries';
import { toast } from 'sonner';

interface TaskStatusControlProps {
  taskId: bigint;
  currentStatus: Status;
}

const STATUS_CONFIG = {
  [Status.Pending]: { label: 'Pending', classes: 'text-muted-foreground' },
  [Status.InProgress]: { label: 'In Progress', classes: 'text-blue-400' },
  [Status.Completed]: { label: 'Completed', classes: 'text-green-400' },
};

export default function TaskStatusControl({ taskId, currentStatus }: TaskStatusControlProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const updateStatus = useUpdateTaskStatus();

  const handleStatusChange = async (value: string) => {
    const newStatus = value as Status;
    if (newStatus === currentStatus) return;

    setIsUpdating(true);
    try {
      await updateStatus.mutateAsync({ taskId, newStatus });
      toast.success(`Status updated to ${STATUS_CONFIG[newStatus]?.label ?? newStatus}`);
    } catch {
      toast.error('Failed to update status');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="relative flex items-center gap-1.5">
      {isUpdating && <Loader2 className="h-3 w-3 animate-spin text-primary" />}
      <Select value={currentStatus} onValueChange={handleStatusChange} disabled={isUpdating}>
        <SelectTrigger className="h-7 w-[130px] text-xs border-border/50 bg-secondary/50">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={Status.Pending} className="text-xs">
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground inline-block" />
              Pending
            </span>
          </SelectItem>
          <SelectItem value={Status.InProgress} className="text-xs">
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-400 inline-block" />
              In Progress
            </span>
          </SelectItem>
          <SelectItem value={Status.Completed} className="text-xs">
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-green-400 inline-block" />
              Completed
            </span>
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

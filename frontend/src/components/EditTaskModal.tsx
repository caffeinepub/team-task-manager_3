import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useEditTask, useGetTeamMembers } from '../hooks/useQueries';
import { Priority, type Task, type TeamMember } from '../backend';

interface EditTaskModalProps {
  task: Task;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function EditTaskModal({ task, open, onOpenChange }: EditTaskModalProps) {
  const editTask = useEditTask();
  const { data: teamMembers = [] } = useGetTeamMembers();

  const [title, setTitle] = useState('');
  const [conferenceName, setConferenceName] = useState('');
  const [description, setDescription] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [deadline, setDeadline] = useState('');
  const [priority, setPriority] = useState<Priority>(Priority.Medium);

  // Pre-populate fields when task changes
  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setConferenceName(task.conferenceName ?? '');
      setDescription(task.description ?? '');
      setAssignedTo(task.assignedTo);
      // Convert bigint nanoseconds to datetime-local string
      const ms = Number(task.deadline) / 1_000_000;
      const date = new Date(ms);
      const pad = (n: number) => n.toString().padStart(2, '0');
      setDeadline(
        `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
      );
      setPriority(task.priority);
    }
  }, [task]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Task title is required');
      return;
    }
    if (!assignedTo) {
      toast.error('Please assign the task to a team member');
      return;
    }
    if (!deadline) {
      toast.error('Please set a deadline');
      return;
    }

    const deadlineMs = new Date(deadline).getTime();
    const deadlineNs = BigInt(deadlineMs) * BigInt(1_000_000);

    try {
      await editTask.mutateAsync({
        taskId: task.id,
        title: title.trim(),
        description: description.trim() || null,
        assignedTo,
        deadline: deadlineNs,
        priority,
        conferenceName: conferenceName.trim() || null,
      });
      toast.success('Task updated successfully');
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update task');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="edit-title">Task Title *</Label>
            <Input
              id="edit-title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Enter task title"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-conference">Conference Name</Label>
            <Input
              id="edit-conference"
              value={conferenceName}
              onChange={e => setConferenceName(e.target.value)}
              placeholder="Optional conference name"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-description">Description</Label>
            <Textarea
              id="edit-description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Optional description"
              rows={3}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Assign To *</Label>
            <Select value={assignedTo} onValueChange={setAssignedTo}>
              <SelectTrigger>
                <SelectValue placeholder="Select team member" />
              </SelectTrigger>
              <SelectContent>
                {teamMembers.map((member: TeamMember) => (
                  <SelectItem key={member.name} value={member.name}>
                    {member.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-deadline">Deadline *</Label>
            <Input
              id="edit-deadline"
              type="datetime-local"
              value={deadline}
              onChange={e => setDeadline(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Priority *</Label>
            <RadioGroup
              value={priority}
              onValueChange={v => setPriority(v as Priority)}
              className="flex gap-4"
            >
              {[Priority.High, Priority.Medium, Priority.Low].map(p => (
                <div key={p} className="flex items-center gap-2">
                  <RadioGroupItem value={p} id={`edit-priority-${p}`} />
                  <Label htmlFor={`edit-priority-${p}`} className="cursor-pointer font-normal">
                    {p}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={editTask.isPending}>
              {editTask.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

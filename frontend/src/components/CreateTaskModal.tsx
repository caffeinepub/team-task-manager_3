import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Priority } from '../backend';
import { useCreateTask } from '../hooks/useQueries';
import { toast } from 'sonner';

interface CreateTaskModalProps {
  open: boolean;
  onClose: () => void;
  teamMembers: string[];
}

export default function CreateTaskModal({ open, onClose, teamMembers }: CreateTaskModalProps) {
  const [title, setTitle] = useState('');
  const [conferenceName, setConferenceName] = useState('');
  const [description, setDescription] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [deadline, setDeadline] = useState('');
  const [priority, setPriority] = useState<Priority>(Priority.Medium);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const createTask = useCreateTask();

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!title.trim()) newErrors.title = 'Title is required';
    if (!assignedTo) newErrors.assignedTo = 'Please assign to a team member';
    if (!deadline) newErrors.deadline = 'Deadline is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    // Convert local datetime to nanoseconds (ICP uses nanoseconds)
    const deadlineMs = new Date(deadline).getTime();
    const deadlineNs = BigInt(deadlineMs) * BigInt(1_000_000);

    try {
      await createTask.mutateAsync({
        title: title.trim(),
        conferenceName: conferenceName.trim() || null,
        description: description.trim() || null,
        assignedTo,
        deadline: deadlineNs,
        priority,
      });
      toast.success('Task created successfully!');
      handleClose();
    } catch (err) {
      toast.error('Failed to create task. Please try again.');
    }
  };

  const handleClose = () => {
    setTitle('');
    setConferenceName('');
    setDescription('');
    setAssignedTo('');
    setDeadline('');
    setPriority(Priority.Medium);
    setErrors({});
    onClose();
  };

  // Min datetime: now
  const minDatetime = new Date().toISOString().slice(0, 16);

  return (
    <Dialog open={open} onOpenChange={open => !open && handleClose()}>
      <DialogContent className="sm:max-w-[500px] bg-card border-border/60">
        <DialogHeader>
          <DialogTitle className="font-display text-lg">Create New Task</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Fill in the details below to assign a task to your team.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {/* Title */}
          <div className="space-y-1.5">
            <Label htmlFor="task-title" className="text-sm font-medium">
              Task Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="task-title"
              placeholder="Enter task title..."
              value={title}
              onChange={e => setTitle(e.target.value)}
              className={`bg-secondary/50 border-border/50 ${errors.title ? 'border-destructive' : ''}`}
            />
            {errors.title && <p className="text-xs text-destructive">{errors.title}</p>}
          </div>

          {/* Conference Name */}
          <div className="space-y-1.5">
            <Label htmlFor="task-conference" className="text-sm font-medium">
              Conference Name <span className="text-muted-foreground text-xs">(optional)</span>
            </Label>
            <Input
              id="task-conference"
              placeholder="Enter conference name..."
              value={conferenceName}
              onChange={e => setConferenceName(e.target.value)}
              className="bg-secondary/50 border-border/50"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="task-desc" className="text-sm font-medium">
              Description <span className="text-muted-foreground text-xs">(optional)</span>
            </Label>
            <Textarea
              id="task-desc"
              placeholder="Add more details..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
              className="bg-secondary/50 border-border/50 resize-none text-sm"
            />
          </div>

          {/* Assignee */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">
              Assign To <span className="text-destructive">*</span>
            </Label>
            <Select value={assignedTo} onValueChange={setAssignedTo}>
              <SelectTrigger className={`bg-secondary/50 border-border/50 ${errors.assignedTo ? 'border-destructive' : ''}`}>
                <SelectValue placeholder="Select team member..." />
              </SelectTrigger>
              <SelectContent>
                {teamMembers.length === 0 ? (
                  <SelectItem value="__none__" disabled>
                    No team members yet
                  </SelectItem>
                ) : (
                  teamMembers.map(member => (
                    <SelectItem key={member} value={member}>
                      {member}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {errors.assignedTo && <p className="text-xs text-destructive">{errors.assignedTo}</p>}
          </div>

          {/* Deadline */}
          <div className="space-y-1.5">
            <Label htmlFor="task-deadline" className="text-sm font-medium">
              Deadline <span className="text-destructive">*</span>
            </Label>
            <Input
              id="task-deadline"
              type="datetime-local"
              value={deadline}
              min={minDatetime}
              onChange={e => setDeadline(e.target.value)}
              className={`bg-secondary/50 border-border/50 ${errors.deadline ? 'border-destructive' : ''}`}
            />
            {errors.deadline && <p className="text-xs text-destructive">{errors.deadline}</p>}
          </div>

          {/* Priority */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Priority</Label>
            <RadioGroup
              value={priority}
              onValueChange={val => setPriority(val as Priority)}
              className="flex gap-4"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value={Priority.High} id="p-high" />
                <Label htmlFor="p-high" className="text-sm cursor-pointer flex items-center gap-1">
                  <span>🔴</span> High
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value={Priority.Medium} id="p-medium" />
                <Label htmlFor="p-medium" className="text-sm cursor-pointer flex items-center gap-1">
                  <span>🟡</span> Medium
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value={Priority.Low} id="p-low" />
                <Label htmlFor="p-low" className="text-sm cursor-pointer flex items-center gap-1">
                  <span>🟢</span> Low
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={handleClose} disabled={createTask.isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={createTask.isPending} className="min-w-[100px]">
              {createTask.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Creating...
                </>
              ) : (
                'Create Task'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

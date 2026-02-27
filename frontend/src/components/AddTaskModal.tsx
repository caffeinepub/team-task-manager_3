import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useCreateTask, useListTeamMembers } from '../hooks/useQueries';
import { Priority } from '../backend';
import { toast } from 'sonner';

interface AddTaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PREDEFINED_MEMBERS = [
  'Gurudas',
  'James',
  'Jesin',
  'Pavithra',
  'Pramila',
  'Sampath',
  'Seshadri Pa',
  'Shabeena',
  'Shashank',
  'Vinay',
  'Veidhehi',
];

export default function AddTaskModal({ open, onOpenChange }: AddTaskModalProps) {
  const [conference, setConference] = useState('');
  const [conferenceTouched, setConferenceTouched] = useState(false);
  const [title, setTitle] = useState('');
  const [assigneeName, setAssigneeName] = useState('');
  const [dueDate, setDueDate] = useState('');

  const createTask = useCreateTask();
  const { data: backendMembers = [] } = useListTeamMembers();

  const memberNames: string[] =
    backendMembers.length > 0
      ? backendMembers.map((m) => m.name)
      : PREDEFINED_MEMBERS;

  const resetForm = () => {
    setConference('');
    setConferenceTouched(false);
    setTitle('');
    setAssigneeName('');
    setDueDate('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setConferenceTouched(true);
    if (!title.trim() || !conference.trim()) return;

    try {
      const deadlineBigInt = dueDate
        ? BigInt(new Date(dueDate).getTime() * 1_000_000)
        : null;

      await createTask.mutateAsync({
        title: title.trim(),
        description: null,
        assignees: assigneeName && assigneeName !== 'unassigned' ? [assigneeName] : [],
        deadline: deadlineBigInt,
        startTime: null,
        endTime: null,
        priority: Priority.Medium,
        conference: conference.trim(),
      });

      toast.success('Task created!');
      resetForm();
      onOpenChange(false);
    } catch {
      toast.error('Failed to create task');
    }
  };

  const showConferenceError = conferenceTouched && !conference.trim();

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) resetForm(); onOpenChange(o); }}>
      <DialogContent className="bg-card border-border max-w-md">
        <DialogHeader>
          <DialogTitle className="text-foreground text-lg font-bold">Add Task</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {/* Conference */}
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">
              Conference <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={conference}
              onChange={(e) => setConference(e.target.value)}
              onBlur={() => setConferenceTouched(true)}
              placeholder="Enter conference name..."
              required
              className={`w-full px-3 py-2.5 bg-muted border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all ${
                showConferenceError ? 'border-red-500/60 focus:ring-red-500/30' : 'border-border focus:border-primary/50'
              }`}
            />
            {showConferenceError && (
              <p className="text-xs text-red-400 mt-1">Conference is required</p>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">
              Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Task title..."
              required
              className="w-full px-3 py-2.5 bg-muted border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
            />
          </div>

          {/* Assignee */}
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Assignee</label>
            <select
              value={assigneeName}
              onChange={(e) => setAssigneeName(e.target.value)}
              className="w-full px-3 py-2.5 bg-muted border border-border rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
            >
              <option value="">Unassigned</option>
              {memberNames.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>

          {/* Due Date */}
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Due Date</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3 py-2.5 bg-muted border border-border rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => { resetForm(); onOpenChange(false); }}
              className="flex-1 py-2.5 rounded-xl border border-border text-muted-foreground hover:text-foreground text-sm font-medium transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createTask.isPending || !title.trim() || !conference.trim()}
              className="flex-1 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {createTask.isPending && <Loader2 size={14} className="animate-spin" />}
              Add Task
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

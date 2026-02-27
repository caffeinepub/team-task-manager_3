import React, { useState } from 'react';
import { Loader2, ChevronDown, ChevronUp, Plus } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCreateTask, useListTeamMembers } from '../hooks/useQueries';
import { Priority } from '../backend';
import { toast } from 'sonner';

interface InlineTaskFormProps {
  isAdmin: boolean;
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

const priorityOptions = [
  { value: Priority.High, label: 'High', emoji: '🔴', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/30' },
  { value: Priority.Medium, label: 'Medium', emoji: '🟡', color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/30' },
  { value: Priority.Low, label: 'Low', emoji: '🟢', color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/30' },
];

export default function InlineTaskForm({ isAdmin }: InlineTaskFormProps) {
  const [expanded, setExpanded] = useState(false);
  const [conference, setConference] = useState('');
  const [conferenceTouched, setConferenceTouched] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>(Priority.Medium);
  const [deadline, setDeadline] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [selectedAssignee, setSelectedAssignee] = useState<string>('');

  const createTask = useCreateTask();
  const { data: backendMembers = [] } = useListTeamMembers();

  const memberNames: string[] =
    backendMembers.length > 0
      ? backendMembers.map((m) => m.name)
      : PREDEFINED_MEMBERS;

  if (!isAdmin) return null;

  const resetForm = () => {
    setConference('');
    setConferenceTouched(false);
    setTitle('');
    setDescription('');
    setPriority(Priority.Medium);
    setDeadline('');
    setStartTime('');
    setEndTime('');
    setSelectedAssignee('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setConferenceTouched(true);
    if (!title.trim() || !conference.trim()) return;

    try {
      const deadlineBigInt = deadline
        ? BigInt(new Date(deadline).getTime() * 1_000_000)
        : null;

      const startBigInt =
        startTime && deadline
          ? BigInt(new Date(`${deadline}T${startTime}`).getTime() * 1_000_000)
          : null;

      const endBigInt =
        endTime && deadline
          ? BigInt(new Date(`${deadline}T${endTime}`).getTime() * 1_000_000)
          : null;

      await createTask.mutateAsync({
        title: title.trim(),
        description: description.trim() || null,
        assignees: selectedAssignee && selectedAssignee !== 'unassigned' ? [selectedAssignee] : [],
        deadline: deadlineBigInt,
        startTime: startBigInt,
        endTime: endBigInt,
        priority,
        conference: conference.trim(),
      });

      toast.success('Task created successfully');
      resetForm();
      setExpanded(false);
    } catch {
      toast.error('Failed to create task');
    }
  };

  const showConferenceError = conferenceTouched && !conference.trim();

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden transition-all duration-300">
      {/* Collapsible Header */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-muted/40 transition-colors group"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-primary/15 flex items-center justify-center group-hover:bg-primary/25 transition-colors">
            <Plus size={16} className="text-primary" />
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold text-foreground">Add New Task</p>
            <p className="text-xs text-muted-foreground">Fill in the details below — task will be added to the To Do column</p>
          </div>
        </div>
        <div className="text-muted-foreground">
          {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </div>
      </button>

      {/* Expandable Form Body */}
      {expanded && (
        <div className="border-t border-border px-5 pb-5 pt-4">
          <form onSubmit={handleSubmit} className="space-y-4">
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
                Task Title <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter task title..."
                required
                autoFocus
                className="w-full px-3 py-2.5 bg-muted border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
              />
              {!title.trim() && title.length > 0 && (
                <p className="text-xs text-red-400 mt-1">Title is required</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">
                Description{' '}
                <span className="text-muted-foreground text-xs font-normal">(optional)</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add a description..."
                rows={3}
                className="w-full px-3 py-2.5 bg-muted border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all resize-none"
              />
            </div>

            {/* Priority */}
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Priority</label>
              <div className="flex gap-2">
                {priorityOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setPriority(opt.value)}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all flex items-center justify-center gap-1.5 ${
                      priority === opt.value
                        ? `${opt.bg} ${opt.color} border-current`
                        : 'bg-muted border-border text-muted-foreground hover:border-border/80'
                    }`}
                  >
                    <span>{opt.emoji}</span>
                    <span>{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Deadline + Time Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">
                  Deadline Date{' '}
                  <span className="text-muted-foreground text-xs font-normal">(optional)</span>
                </label>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full px-3 py-2.5 bg-muted border border-border rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">
                  Start Time{' '}
                  <span className="text-muted-foreground text-xs font-normal">(optional)</span>
                </label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  disabled={!deadline}
                  className="w-full px-3 py-2.5 bg-muted border border-border rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">
                  End Time{' '}
                  <span className="text-muted-foreground text-xs font-normal">(optional)</span>
                </label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  disabled={!deadline}
                  className="w-full px-3 py-2.5 bg-muted border border-border rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
            </div>
            {!deadline && (startTime || endTime) && (
              <p className="text-xs text-yellow-400 -mt-2">
                Set a deadline date to enable time pickers
              </p>
            )}

            {/* Assign To */}
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">
                Assign To{' '}
                <span className="text-muted-foreground text-xs font-normal">(optional)</span>
              </label>
              <Select value={selectedAssignee} onValueChange={setSelectedAssignee}>
                <SelectTrigger className="w-full bg-muted border-border rounded-xl text-sm text-foreground focus:ring-primary/50">
                  <SelectValue placeholder="Select a team member..." />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="unassigned" className="text-muted-foreground">
                    Unassigned
                  </SelectItem>
                  {memberNames.map((name) => (
                    <SelectItem key={name} value={name} className="text-foreground">
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  setExpanded(false);
                }}
                className="flex-1 py-2.5 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:border-border/80 text-sm font-medium transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createTask.isPending || !title.trim() || !conference.trim()}
                className="flex-1 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-glow-sm"
              >
                {createTask.isPending && <Loader2 size={14} className="animate-spin" />}
                {createTask.isPending ? 'Creating...' : 'Create Task'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

import { useState } from 'react';
import { Loader2, UserPlus, Trash2, Users } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useAddTeamMember, useRemoveTeamMember, useGetTeamMembers } from '../hooks/useQueries';
import { toast } from 'sonner';

interface ManageTeamModalProps {
  open: boolean;
  onClose: () => void;
}

export default function ManageTeamModal({ open, onClose }: ManageTeamModalProps) {
  const [newMemberName, setNewMemberName] = useState('');

  const { data: teamMembers = [], isLoading: membersLoading } = useGetTeamMembers();
  const addMember = useAddTeamMember();
  const removeMember = useRemoveTeamMember();

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = newMemberName.trim();
    if (!name) return;

    try {
      await addMember.mutateAsync(name);
      toast.success(`${name} added to team`);
      setNewMemberName('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to add member';
      toast.error(msg.includes('already exists') ? `"${name}" is already a team member` : msg);
    }
  };

  const handleRemove = async (name: string) => {
    try {
      await removeMember.mutateAsync(name);
      toast.success(`${name} removed from team`);
    } catch {
      toast.error('Failed to remove member');
    }
  };

  return (
    <Dialog open={open} onOpenChange={open => !open && onClose()}>
      <DialogContent className="sm:max-w-[420px] bg-card border-border/60">
        <DialogHeader>
          <DialogTitle className="font-display text-lg flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Manage Team
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Add or remove team members from your roster.
          </DialogDescription>
        </DialogHeader>

        {/* Add member form */}
        <form onSubmit={handleAdd} className="flex gap-2 mt-2">
          <Input
            placeholder="Enter member name..."
            value={newMemberName}
            onChange={e => setNewMemberName(e.target.value)}
            className="bg-secondary/50 border-border/50 text-sm"
            autoFocus
          />
          <Button type="submit" size="sm" disabled={addMember.isPending || !newMemberName.trim()}>
            {addMember.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <UserPlus className="h-4 w-4 mr-1" />
                Add
              </>
            )}
          </Button>
        </form>

        {/* Member list */}
        <div className="mt-3 space-y-1.5 max-h-64 overflow-y-auto">
          {membersLoading ? (
            <div className="space-y-1.5">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-10 w-full rounded-lg" />
              ))}
            </div>
          ) : teamMembers.length === 0 ? (
            <div className="text-center py-8 border border-dashed border-border/40 rounded-lg">
              <Users className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                No team members yet.
              </p>
              <p className="text-xs text-muted-foreground/70 mt-0.5">
                Add your first member using the form above.
              </p>
            </div>
          ) : (
            teamMembers.map(member => (
              <div
                key={member}
                className="flex items-center justify-between px-3 py-2 rounded-lg bg-secondary/40 border border-border/30"
              >
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-full bg-primary/20 flex items-center justify-center text-xs font-semibold text-primary">
                    {member.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium">{member}</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  onClick={() => handleRemove(member)}
                  disabled={removeMember.isPending}
                  title={`Remove ${member}`}
                >
                  {removeMember.isPending ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="h-3.5 w-3.5" />
                  )}
                </Button>
              </div>
            ))
          )}
        </div>

        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-muted-foreground">
            {teamMembers.length} member{teamMembers.length !== 1 ? 's' : ''}
          </p>
          <Button variant="outline" size="sm" onClick={onClose}>
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

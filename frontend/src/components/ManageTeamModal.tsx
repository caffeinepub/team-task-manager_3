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
import { Label } from '@/components/ui/label';
import { useAddTeamMember, useRemoveTeamMember } from '../hooks/useQueries';
import { toast } from 'sonner';

interface ManageTeamModalProps {
  open: boolean;
  onClose: () => void;
  teamMembers: string[];
}

export default function ManageTeamModal({ open, onClose, teamMembers }: ManageTeamModalProps) {
  const [newMemberName, setNewMemberName] = useState('');
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
      toast.error(msg.includes('already exists') ? 'Member already exists' : msg);
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
            placeholder="Member name..."
            value={newMemberName}
            onChange={e => setNewMemberName(e.target.value)}
            className="bg-secondary/50 border-border/50 text-sm"
          />
          <Button type="submit" size="sm" disabled={addMember.isPending || !newMemberName.trim()}>
            {addMember.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <UserPlus className="h-4 w-4" />
            )}
          </Button>
        </form>

        {/* Member list */}
        <div className="mt-3 space-y-1.5 max-h-64 overflow-y-auto">
          {teamMembers.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              No team members yet. Add your first member above.
            </p>
          ) : (
            teamMembers.map(member => (
              <div
                key={member}
                className="flex items-center justify-between px-3 py-2 rounded-lg bg-secondary/40 border border-border/30"
              >
                <span className="text-sm font-medium">{member}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  onClick={() => handleRemove(member)}
                  disabled={removeMember.isPending}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))
          )}
        </div>

        <div className="flex justify-end pt-2">
          <Button variant="outline" size="sm" onClick={onClose}>
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

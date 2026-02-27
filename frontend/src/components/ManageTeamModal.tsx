import React from 'react';
import { Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useListTeamMembers, useRemoveTeamMember } from '../hooks/useQueries';
import { toast } from 'sonner';

interface ManageTeamModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function getInitials(name: string): string {
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
}

export default function ManageTeamModal({ open, onOpenChange }: ManageTeamModalProps) {
  const { data: members = [] } = useListTeamMembers();
  const removeTeamMember = useRemoveTeamMember();

  const handleRemove = async (memberId: bigint, name: string) => {
    try {
      await removeTeamMember.mutateAsync(memberId);
      toast.success(`${name} removed from team`);
    } catch {
      toast.error('Failed to remove team member');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-foreground text-lg font-bold">Manage Team</DialogTitle>
        </DialogHeader>

        <div className="space-y-2 mt-2">
          {members.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">No team members yet</p>
            </div>
          ) : (
            members.map((member) => (
              <div
                key={member.id.toString()}
                className="flex items-center gap-3 p-3 bg-muted rounded-xl"
              >
                <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center flex-shrink-0">
                  <span className="text-purple-300 text-xs font-bold">{getInitials(member.name)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{member.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {member.claimedBy ? 'Active' : 'Unclaimed'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <button className="w-7 h-7 rounded-lg bg-card hover:bg-red-500/20 hover:text-red-400 text-muted-foreground flex items-center justify-center transition-all">
                        <Trash2 size={13} />
                      </button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-card border-border">
                      <AlertDialogHeader>
                        <AlertDialogTitle>Remove Member</AlertDialogTitle>
                        <AlertDialogDescription>
                          Remove {member.name} from the team? This cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleRemove(member.id, member.name)}
                          className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                        >
                          Remove
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

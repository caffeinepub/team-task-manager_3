import React, { useState } from 'react';
import { useGetTeamMembers, useRemoveTeamMember } from '../hooks/useQueries';
import { useAuth } from '../contexts/AuthContext';
import AddUserModal from '../components/AddUserModal';
import { Role, TeamMember } from '../backend';
import { UserPlus, Trash2, Users, Shield, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export default function TeamMembers() {
  const { currentUser, isAdmin } = useAuth();
  const { data: members = [], isLoading } = useGetTeamMembers();
  const removeTeamMember = useRemoveTeamMember();
  const [showAddModal, setShowAddModal] = useState(false);

  // Extra safety: check role directly from currentUser in case isAdmin context lags
  const userIsAdmin =
    isAdmin ||
    (currentUser?.role != null &&
      String(currentUser.role).toLowerCase() === 'admin');

  const handleRemove = async (member: TeamMember) => {
    if (!confirm(`Remove ${member.name} from the team?`)) return;
    try {
      await removeTeamMember.mutateAsync(member.name);
      toast.success(`${member.name} removed from team`);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to remove team member');
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-xl">
            <Users className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Team Members</h1>
            <p className="text-sm text-muted-foreground">
              {members.length} member{members.length !== 1 ? 's' : ''} in your team
            </p>
          </div>
        </div>

        {/* Add button for admins */}
        {userIsAdmin && (
          <Button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            Add Team Member
          </Button>
        )}
      </div>

      {/* Members List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-muted animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : members.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-lg font-medium">No team members yet</p>
          {userIsAdmin && (
            <p className="text-sm mt-1">
              Click "Add Team Member" to get started
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {members.map((member) => (
            <div
              key={member.email || member.name}
              className="flex items-center justify-between p-4 bg-card border border-border rounded-2xl shadow-card hover:shadow-card-hover transition-shadow"
            >
              <div className="flex items-center gap-4">
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm shrink-0">
                  {member.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-foreground">{member.name}</p>
                  <p className="text-sm text-muted-foreground">{member.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Role Badge */}
                <Badge
                  variant={
                    String(member.role).toLowerCase() === 'admin'
                      ? 'default'
                      : 'secondary'
                  }
                  className="flex items-center gap-1"
                >
                  {String(member.role).toLowerCase() === 'admin' ? (
                    <Shield className="w-3 h-3" />
                  ) : (
                    <User className="w-3 h-3" />
                  )}
                  {String(member.role) === Role.Admin ? 'Admin' : 'Member'}
                </Badge>

                {/* Remove button (admin only) */}
                {userIsAdmin && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemove(member)}
                    disabled={removeTeamMember.isPending}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Team Member Modal — uses onOpenChange as defined in AddUserModal */}
      <AddUserModal
        open={showAddModal}
        onOpenChange={setShowAddModal}
      />
    </div>
  );
}

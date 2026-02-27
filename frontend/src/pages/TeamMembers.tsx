import React, { useState } from 'react';
import { Users, UserCheck, UserX, Plus } from 'lucide-react';
import { useListTeamMembers, useIsCallerAdmin } from '../hooks/useQueries';
import TeamMemberCard from '../components/TeamMemberCard';
import AddTeamMemberModal from '../components/AddTeamMemberModal';
import { Button } from '@/components/ui/button';

export default function TeamMembers() {
  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const { data: members = [], isLoading } = useListTeamMembers();
  const { data: isAdmin } = useIsCallerAdmin();

  const totalMembers = members.length;
  const claimedMembers = members.filter((m) => m.claimedBy).length;
  const unclaimedMembers = members.filter((m) => !m.claimedBy).length;

  const statCards = [
    {
      label: 'Total Members',
      value: totalMembers,
      icon: <Users size={20} />,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10',
      border: 'border-purple-500/20',
    },
    {
      label: 'Active',
      value: claimedMembers,
      icon: <UserCheck size={20} />,
      color: 'text-green-400',
      bg: 'bg-green-500/10',
      border: 'border-green-500/20',
    },
    {
      label: 'Unclaimed',
      value: unclaimedMembers,
      icon: <UserX size={20} />,
      color: 'text-yellow-400',
      bg: 'bg-yellow-500/10',
      border: 'border-yellow-500/20',
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Team Members</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage your team</p>
        </div>
        {isAdmin && (
          <Button
            onClick={() => setAddMemberOpen(true)}
            className="bg-purple-500 hover:bg-purple-600 text-white gap-2 rounded-xl shadow-glow-sm"
          >
            <Plus size={16} />
            Add Member
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((card) => (
          <div
            key={card.label}
            className={`bg-card border ${card.border} rounded-2xl p-5 card-elevated`}
          >
            <div className={`w-10 h-10 rounded-xl ${card.bg} ${card.color} flex items-center justify-center mb-3`}>
              {card.icon}
            </div>
            <p className="text-3xl font-bold text-foreground">{card.value}</p>
            <p className="text-muted-foreground text-sm mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Members List */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 bg-card border border-border rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : members.length === 0 ? (
        <div className="text-center py-16 bg-card border border-border rounded-2xl text-muted-foreground">
          <Users size={48} className="mx-auto mb-3 opacity-40" />
          <p className="font-medium text-foreground">No team members yet</p>
          <p className="text-sm mt-1">Add your first team member to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {members.map((member) => (
            <TeamMemberCard
              key={member.id.toString()}
              member={member}
              isAdmin={!!isAdmin}
            />
          ))}
        </div>
      )}

      <AddTeamMemberModal
        open={addMemberOpen}
        onOpenChange={setAddMemberOpen}
      />
    </div>
  );
}

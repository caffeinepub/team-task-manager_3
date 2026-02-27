import React, { useState } from 'react';
import { Users, UserPlus, Search } from 'lucide-react';
import { useListTeamMembers, useGetTasks, useRemoveTeamMember } from '../hooks/useQueries';
import TeamMemberCard from '../components/TeamMemberCard';
import AddTeamMemberModal from '../components/AddTeamMemberModal';

export default function TeamMembers() {
  const { data: members = [], isLoading } = useListTeamMembers();
  const { data: tasks = [] } = useGetTasks();
  const { mutate: removeMember } = useRemoveTeamMember();
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredMembers = members.filter(m =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalMembers = members.length;
  const activeMembers = members.filter(m => m.claimedBy).length;
  const unclaimedMembers = members.filter(m => !m.claimedBy).length;

  const getTasksForMember = (memberName: string) =>
    tasks.filter(t => t.assignees.includes(memberName));

  return (
    <div className="flex-1 overflow-y-auto bg-background">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border px-6 py-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-xl font-bold text-foreground">Team Members</h1>
            <p className="text-sm text-muted-foreground">{totalMembers} members total</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-semibold hover:bg-primary/90 transition-all shadow-sm"
          >
            <UserPlus className="w-4 h-4" />
            Add Member
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="bg-card rounded-2xl p-4 border border-border card-shadow text-center">
            <p className="text-2xl font-bold text-foreground">{totalMembers}</p>
            <p className="text-xs text-muted-foreground mt-1">Total Members</p>
          </div>
          <div className="bg-card rounded-2xl p-4 border border-border card-shadow text-center">
            <p className="text-2xl font-bold text-emerald-500">{activeMembers}</p>
            <p className="text-xs text-muted-foreground mt-1">Active</p>
          </div>
          <div className="bg-card rounded-2xl p-4 border border-border card-shadow text-center">
            <p className="text-2xl font-bold text-amber-500">{unclaimedMembers}</p>
            <p className="text-xs text-muted-foreground mt-1">Unclaimed</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search members..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-muted text-foreground placeholder-muted-foreground text-sm pl-9 pr-4 py-2 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {/* Members Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="text-center py-16">
            <Users className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-muted-foreground">
              {searchQuery ? 'No members match your search' : 'No team members yet'}
            </p>
            {!searchQuery && (
              <button
                onClick={() => setShowAddModal(true)}
                className="mt-3 text-sm text-primary hover:text-primary/80 font-medium transition-colors"
              >
                Add your first member
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMembers.map(member => (
              <TeamMemberCard
                key={String(member.id)}
                member={member}
                tasks={getTasksForMember(member.name)}
                showTasks
                onRemove={(id) => removeMember(id)}
              />
            ))}
          </div>
        )}
      </div>

      {showAddModal && (
        <AddTeamMemberModal
          open={showAddModal}
          onOpenChange={setShowAddModal}
        />
      )}
    </div>
  );
}

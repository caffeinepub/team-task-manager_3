import React from 'react';
import { Search, X } from 'lucide-react';
import { TeamMember } from '../backend';

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

interface TaskFiltersProps {
  filters: { search: string; assigneeId: string };
  onFiltersChange: (filters: { search: string; assigneeId: string }) => void;
  members: TeamMember[];
}

export default function TaskFilters({ filters, onFiltersChange, members }: TaskFiltersProps) {
  const hasFilters = filters.search || filters.assigneeId;

  const memberNames: string[] =
    members.length > 0
      ? members.map((m) => m.name)
      : PREDEFINED_MEMBERS;

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      {/* Search */}
      <div className="relative flex-1">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search tasks..."
          value={filters.search}
          onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
          className="w-full pl-9 pr-4 py-2.5 bg-card border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
        />
      </div>

      {/* Assignee Filter */}
      <div className="relative">
        <select
          value={filters.assigneeId}
          onChange={(e) => onFiltersChange({ ...filters, assigneeId: e.target.value })}
          className="appearance-none pl-3 pr-8 py-2.5 bg-card border border-border rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all min-w-[160px]"
        >
          <option value="">All Members</option>
          {memberNames.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>

      {/* Clear Filters */}
      {hasFilters && (
        <button
          onClick={() => onFiltersChange({ search: '', assigneeId: '' })}
          className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:border-border/80 text-sm transition-all"
        >
          <X size={14} />
          Clear
        </button>
      )}
    </div>
  );
}

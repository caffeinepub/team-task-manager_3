import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { type TaskFiltersState } from '../hooks/useTaskFilters';

interface TaskFiltersProps {
  filters: TaskFiltersState;
  teamMembers: string[];
  onChange: (filters: TaskFiltersState) => void;
}

export default function TaskFilters({ filters, teamMembers, onChange }: TaskFiltersProps) {
  const hasActiveFilters = filters.searchText.trim() || filters.selectedAssignee;

  const clearFilters = () => {
    onChange({ searchText: '', selectedAssignee: '' });
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Search */}
      <div className="relative flex-1 min-w-[180px]">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
        <Input
          placeholder="Search tasks..."
          value={filters.searchText}
          onChange={e => onChange({ ...filters, searchText: e.target.value })}
          className="pl-8 h-9 text-sm bg-secondary/50 border-border/50"
        />
      </div>

      {/* Assignee filter */}
      <Select
        value={filters.selectedAssignee || '__all__'}
        onValueChange={val => onChange({ ...filters, selectedAssignee: val === '__all__' ? '' : val })}
      >
        <SelectTrigger className="h-9 w-[160px] text-sm bg-secondary/50 border-border/50">
          <SelectValue placeholder="All members" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__all__">All members</SelectItem>
          {teamMembers.map(member => (
            <SelectItem key={member} value={member}>
              {member}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Clear */}
      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearFilters}
          className="h-9 px-2 text-muted-foreground hover:text-foreground"
        >
          <X className="h-3.5 w-3.5 mr-1" />
          Clear
        </Button>
      )}
    </div>
  );
}

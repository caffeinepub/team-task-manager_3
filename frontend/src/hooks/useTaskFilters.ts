import { useMemo } from 'react';
import { type Task } from '../backend';

export interface TaskFiltersState {
  searchText: string;
  selectedAssignee: string;
}

export function useTaskFilters(tasks: Task[], filters: TaskFiltersState): Task[] {
  return useMemo(() => {
    let filtered = tasks;

    if (filters.searchText.trim()) {
      const lower = filters.searchText.toLowerCase();
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(lower)
      );
    }

    if (filters.selectedAssignee) {
      filtered = filtered.filter(task => task.assignedTo === filters.selectedAssignee);
    }

    return filtered;
  }, [tasks, filters.searchText, filters.selectedAssignee]);
}

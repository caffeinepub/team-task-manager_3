import { useMemo } from 'react';
import { Task } from '../backend';

interface TaskFiltersState {
  search: string;
  assigneeId: string; // now stores member name for filtering
}

export function useTaskFilters(tasks: Task[], filters: TaskFiltersState): Task[] {
  return useMemo(() => {
    return tasks.filter(task => {
      const matchesSearch =
        !filters.search ||
        task.title.toLowerCase().includes(filters.search.toLowerCase());

      // task.assignees is now string[] of names; filter by name match
      const matchesAssignee =
        !filters.assigneeId ||
        task.assignees.some(name => name === filters.assigneeId);

      return matchesSearch && matchesAssignee;
    });
  }, [tasks, filters]);
}

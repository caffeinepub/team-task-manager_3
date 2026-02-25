import { useMemo } from 'react';
import { type Task } from '../backend';
import { useGetAllTasks } from './useQueries';
import { isTaskOverdue, isTaskDueWithinOneHour, isTaskDueWithinTwentyFourHours } from '../utils/reminderLogic';

export interface TaskReminders {
  overdue: Task[];
  dueInOneHour: Task[];
  dueInTwentyFourHours: Task[];
  totalCount: number;
}

export function useTaskReminders(): TaskReminders & { isLoading: boolean } {
  const { data: tasks = [], isLoading } = useGetAllTasks();

  const reminders = useMemo(() => {
    const overdue = tasks.filter(isTaskOverdue);
    const dueInOneHour = tasks.filter(isTaskDueWithinOneHour);
    const dueInTwentyFourHours = tasks.filter(isTaskDueWithinTwentyFourHours);
    const totalCount = overdue.length + dueInOneHour.length + dueInTwentyFourHours.length;
    return { overdue, dueInOneHour, dueInTwentyFourHours, totalCount };
  }, [tasks]);

  return { ...reminders, isLoading };
}

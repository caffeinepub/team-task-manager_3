import { useMemo } from 'react';
import { type Task, Status } from '../backend';
import { useGetAllTasks } from './useQueries';
import { isTaskOverdue, isTaskDueWithinOneHour, isTaskDueWithinTwentyFourHours } from '../utils/reminderLogic';

export interface TaskReminders {
  overdue: Task[];
  dueInOneHour: Task[];
  dueInTwentyFourHours: Task[];
  carryForward: Task[];
  totalCount: number;
}

export function useTaskReminders(): TaskReminders & { isLoading: boolean } {
  const { data: tasks = [], isLoading } = useGetAllTasks();

  const reminders = useMemo(() => {
    const overdue = tasks.filter(isTaskOverdue);
    const dueInOneHour = tasks.filter(isTaskDueWithinOneHour);
    const dueInTwentyFourHours = tasks.filter(isTaskDueWithinTwentyFourHours);
    const carryForward = tasks.filter(t => t.status === Status.CarryForward);
    const totalCount = overdue.length + dueInOneHour.length + dueInTwentyFourHours.length + carryForward.length;
    return { overdue, dueInOneHour, dueInTwentyFourHours, carryForward, totalCount };
  }, [tasks]);

  return { ...reminders, isLoading };
}

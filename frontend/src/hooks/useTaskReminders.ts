import { useMemo } from 'react';
import { type Task } from '../backend';
import { isTaskOverdue, isTaskDueSoon, isTaskDueWithin24Hours } from '../utils/reminderLogic';

export interface TaskReminders {
  overdue: Task[];
  dueInOneHour: Task[];
  dueInTwentyFourHours: Task[];
  totalCount: number;
}

export function useTaskReminders(tasks: Task[]): TaskReminders {
  return useMemo(() => {
    const overdue = tasks.filter(isTaskOverdue);
    const dueInOneHour = tasks.filter((t) => isTaskDueSoon(t, 60 * 60 * 1000));
    const dueInTwentyFourHours = tasks.filter(isTaskDueWithin24Hours);
    const totalCount = overdue.length + dueInOneHour.length + dueInTwentyFourHours.length;
    return { overdue, dueInOneHour, dueInTwentyFourHours, totalCount };
  }, [tasks]);
}

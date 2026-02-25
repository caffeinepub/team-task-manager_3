import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { type Task } from '../backend';
import { generateCsv, downloadCsv, filterTasksByCurrentWeek, filterTasksByCurrentMonth } from '../utils/csvExport';

interface ReportExportButtonsProps {
  tasks: Task[];
}

export default function ReportExportButtons({ tasks }: ReportExportButtonsProps) {
  const handleExportWeekly = () => {
    const filtered = filterTasksByCurrentWeek(tasks);
    const csv = generateCsv(filtered);
    const now = new Date();
    downloadCsv(csv, `tasks-week-${now.getFullYear()}-W${getWeekNumber(now)}.csv`);
  };

  const handleExportMonthly = () => {
    const filtered = filterTasksByCurrentMonth(tasks);
    const csv = generateCsv(filtered);
    const now = new Date();
    const month = now.toLocaleString('en-US', { month: 'short' });
    downloadCsv(csv, `tasks-${month}-${now.getFullYear()}.csv`);
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handleExportWeekly}
        className="h-9 text-xs border-border/50 bg-secondary/30 hover:bg-secondary/60"
      >
        <Download className="h-3.5 w-3.5 mr-1.5" />
        Weekly
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={handleExportMonthly}
        className="h-9 text-xs border-border/50 bg-secondary/30 hover:bg-secondary/60"
      >
        <Download className="h-3.5 w-3.5 mr-1.5" />
        Monthly
      </Button>
    </div>
  );
}

function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

import { useState } from 'react';
import { Download, Calendar, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { type Task } from '../backend';
import {
  filterTasksByCurrentWeek,
  filterTasksByCurrentMonth,
  generateCsv,
  downloadCsv,
  exportCustomRangeTasks,
} from '../utils/csvExport';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface ReportExportButtonsProps {
  tasks: Task[];
}

export default function ReportExportButtons({ tasks }: ReportExportButtonsProps) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [customOpen, setCustomOpen] = useState(false);
  const [validationError, setValidationError] = useState('');

  const handleWeeklyExport = () => {
    const filtered = filterTasksByCurrentWeek(tasks);
    const csv = generateCsv(filtered);
    const now = new Date();
    const weekStr = `${now.getFullYear()}-W${String(Math.ceil(now.getDate() / 7)).padStart(2, '0')}`;
    downloadCsv(csv, `tasks-weekly-${weekStr}.csv`);
  };

  const handleMonthlyExport = () => {
    const filtered = filterTasksByCurrentMonth(tasks);
    const csv = generateCsv(filtered);
    const now = new Date();
    const monthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    downloadCsv(csv, `tasks-monthly-${monthStr}.csv`);
  };

  const handleCustomExport = () => {
    setValidationError('');

    if (!startDate || !endDate) {
      setValidationError('Please select both start and end dates.');
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start > end) {
      setValidationError('Start date must be before or equal to end date.');
      return;
    }

    exportCustomRangeTasks(tasks, start, end);
    setCustomOpen(false);
    setStartDate('');
    setEndDate('');
    setValidationError('');
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handleWeeklyExport}
        className="h-9 text-sm border-border/50"
      >
        <Download className="h-4 w-4 mr-1.5" />
        Weekly
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={handleMonthlyExport}
        className="h-9 text-sm border-border/50"
      >
        <Download className="h-4 w-4 mr-1.5" />
        Monthly
      </Button>

      <Popover open={customOpen} onOpenChange={(open) => {
        setCustomOpen(open);
        if (!open) {
          setValidationError('');
        }
      }}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="h-9 text-sm border-border/50"
          >
            <Calendar className="h-4 w-4 mr-1.5" />
            Custom Range
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-72 p-4" align="end">
          <div className="space-y-3">
            <div>
              <p className="text-sm font-semibold font-display mb-1">Custom Date Range</p>
              <p className="text-xs text-muted-foreground">Export tasks by deadline within a date range.</p>
            </div>

            <div className="space-y-2">
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={e => {
                    setStartDate(e.target.value);
                    setValidationError('');
                  }}
                  className="w-full h-8 px-2.5 text-xs rounded-md border border-border/60 bg-secondary/40 text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  min={startDate}
                  onChange={e => {
                    setEndDate(e.target.value);
                    setValidationError('');
                  }}
                  className="w-full h-8 px-2.5 text-xs rounded-md border border-border/60 bg-secondary/40 text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>
            </div>

            {validationError && (
              <div className="flex items-start gap-1.5 text-xs text-destructive">
                <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                <span>{validationError}</span>
              </div>
            )}

            <Button
              size="sm"
              className="w-full h-8 text-xs"
              onClick={handleCustomExport}
              disabled={!startDate || !endDate}
            >
              <Download className="h-3.5 w-3.5 mr-1.5" />
              Export Custom Range
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

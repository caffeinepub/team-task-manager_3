import { useState } from 'react';
import { Download, Calendar, ChevronDown } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { type Task } from '../backend';
import { exportThisWeek, exportThisMonth, exportDateRange } from '../utils/csvExport';
import { toast } from 'sonner';

interface ReportExportButtonsProps {
  tasks: Task[];
}

export default function ReportExportButtons({ tasks }: ReportExportButtonsProps) {
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [customError, setCustomError] = useState('');
  const [popoverOpen, setPopoverOpen] = useState(false);

  const handleWeek = () => {
    exportThisWeek(tasks);
    toast.success('Weekly report exported!');
  };

  const handleMonth = () => {
    exportThisMonth(tasks);
    toast.success('Monthly report exported!');
  };

  const handleCustom = () => {
    if (!customStart || !customEnd) {
      setCustomError('Please select both start and end dates');
      return;
    }
    const start = new Date(customStart);
    const end = new Date(customEnd);
    if (end <= start) {
      setCustomError('End date must be after start date');
      return;
    }
    setCustomError('');
    exportDateRange(tasks, start, end);
    toast.success('Custom report exported!');
    setPopoverOpen(false);
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted-foreground hidden sm:block">Export:</span>
      <button
        onClick={handleWeek}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-muted hover:bg-secondary border border-border rounded-lg transition-colors"
      >
        <Download size={12} />
        This Week
      </button>
      <button
        onClick={handleMonth}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-muted hover:bg-secondary border border-border rounded-lg transition-colors"
      >
        <Download size={12} />
        This Month
      </button>

      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <PopoverTrigger asChild>
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-muted hover:bg-secondary border border-border rounded-lg transition-colors">
            <Calendar size={12} />
            Custom
            <ChevronDown size={10} />
          </button>
        </PopoverTrigger>
        <PopoverContent className="glass-card border-border w-72 p-4" align="end">
          <h4 className="text-sm font-semibold mb-3">Custom Date Range</h4>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label className="text-xs">Start Date</Label>
              <Input
                type="date"
                value={customStart}
                onChange={e => setCustomStart(e.target.value)}
                className="bg-muted border-border text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">End Date</Label>
              <Input
                type="date"
                value={customEnd}
                onChange={e => setCustomEnd(e.target.value)}
                className="bg-muted border-border text-sm"
              />
            </div>
            {customError && <p className="text-xs text-destructive">{customError}</p>}
            <Button onClick={handleCustom} size="sm" className="w-full glow-primary-sm">
              <Download size={12} className="mr-1.5" />
              Export CSV
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

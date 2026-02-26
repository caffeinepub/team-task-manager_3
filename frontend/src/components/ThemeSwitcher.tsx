import { Sun, Moon, Contrast } from 'lucide-react';
import { useTheme, type AppTheme } from '@/hooks/useTheme';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const themes: { value: AppTheme; label: string; icon: React.ElementType }[] = [
  { value: 'light', label: 'Daylight', icon: Sun },
  { value: 'normal', label: 'Normal', icon: Contrast },
  { value: 'dark', label: 'Dark', icon: Moon },
];

export default function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex items-center gap-0.5 rounded-lg border border-border/50 bg-secondary/40 p-0.5">
        {themes.map(({ value, label, icon: Icon }) => {
          const isActive = theme === value;
          return (
            <Tooltip key={value}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setTheme(value)}
                  aria-label={label}
                  aria-pressed={isActive}
                  className={`flex items-center justify-center w-7 h-7 rounded-md transition-all duration-150 ${
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">
                {label}
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
}

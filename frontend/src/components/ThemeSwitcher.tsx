import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';

export default function ThemeSwitcher() {
  const { theme, toggleTheme } = useTheme();

  const isDark = theme === 'dark';

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={toggleTheme}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            className="relative w-9 h-9 flex items-center justify-center rounded-xl border border-border bg-muted/50 hover:bg-muted transition-all duration-200 text-muted-foreground hover:text-foreground"
          >
            <span
              className={`absolute transition-all duration-300 ${
                isDark ? 'opacity-100 scale-100 rotate-0' : 'opacity-0 scale-75 rotate-90'
              }`}
            >
              <Moon size={16} />
            </span>
            <span
              className={`absolute transition-all duration-300 ${
                !isDark ? 'opacity-100 scale-100 rotate-0' : 'opacity-0 scale-75 -rotate-90'
              }`}
            >
              <Sun size={16} />
            </span>
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          {isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

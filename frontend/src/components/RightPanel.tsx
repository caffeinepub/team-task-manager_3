import React from 'react';
import MiniCalendar from './MiniCalendar';
import TasksChecklist from './TasksChecklist';
import TeamMembersList from './TeamMembersList';

export default function RightPanel() {
  const appId = typeof window !== 'undefined' ? encodeURIComponent(window.location.hostname) : 'taskflow-app';

  return (
    <aside className="w-72 h-full flex flex-col bg-card border-l border-border overflow-y-auto scrollbar-thin">
      <div className="p-4 space-y-5">
        {/* Internal Teams */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-foreground">Internal Teams</h3>
            <span className="text-xs text-muted-foreground">4 members</span>
          </div>
          <div className="flex -space-x-2">
            {['A', 'B', 'C', 'D', 'E'].map((letter, i) => (
              <div
                key={i}
                className="w-8 h-8 rounded-full bg-primary/20 border-2 border-card flex items-center justify-center text-xs font-bold text-primary"
              >
                {letter}
              </div>
            ))}
          </div>
        </div>

        <MiniCalendar />
        <TasksChecklist />
        <TeamMembersList />
      </div>

      {/* Footer */}
      <div className="mt-auto p-4 border-t border-border">
        <p className="text-xs text-muted-foreground text-center">
          Built with{' '}
          <span className="text-red-500">♥</span>{' '}
          using{' '}
          <a
            href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${appId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline font-medium"
          >
            caffeine.ai
          </a>
        </p>
        <p className="text-xs text-muted-foreground text-center mt-1">
          © {new Date().getFullYear()} TaskFlow
        </p>
      </div>
    </aside>
  );
}

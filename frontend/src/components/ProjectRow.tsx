import React from 'react';

interface ProjectRowProps {
  icon: string;
  name: string;
  subtitle: string;
  status: 'Active' | 'On Hold' | 'Completed' | 'Planning';
  budget: string;
  deadline: string;
  members: string[];
}

const statusColors: Record<string, string> = {
  Active: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10',
  'On Hold': 'text-amber-600 dark:text-amber-400 bg-amber-500/10',
  Completed: 'text-primary bg-primary/10',
  Planning: 'text-blue-600 dark:text-blue-400 bg-blue-500/10',
};

const statusDots: Record<string, string> = {
  Active: 'bg-emerald-500',
  'On Hold': 'bg-amber-500',
  Completed: 'bg-primary',
  Planning: 'bg-blue-500',
};

export default function ProjectRow({ icon, name, subtitle, status, budget, deadline, members }: ProjectRowProps) {
  return (
    <tr className="border-b border-border hover:bg-muted/30 transition-colors">
      <td className="py-3 px-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-base">
            {icon}
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">{name}</p>
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          </div>
        </div>
      </td>
      <td className="py-3 px-4">
        <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${statusColors[status]}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${statusDots[status]}`} />
          {status}
        </span>
      </td>
      <td className="py-3 px-4 text-sm text-foreground font-medium">{budget}</td>
      <td className="py-3 px-4 text-sm text-muted-foreground">{deadline}</td>
      <td className="py-3 px-4">
        <div className="flex -space-x-2">
          {members.slice(0, 4).map((member, i) => (
            <div
              key={i}
              className="w-7 h-7 rounded-full bg-primary/20 border-2 border-card flex items-center justify-center text-xs font-bold text-primary"
            >
              {member.charAt(0).toUpperCase()}
            </div>
          ))}
          {members.length > 4 && (
            <div className="w-7 h-7 rounded-full bg-muted border-2 border-card flex items-center justify-center text-xs font-medium text-muted-foreground">
              +{members.length - 4}
            </div>
          )}
        </div>
      </td>
    </tr>
  );
}

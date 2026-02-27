import React from 'react';
import { Mail } from 'lucide-react';

const MEMBERS = [
  { name: 'Guy Hawkins', email: 'guy@example.com', color: 'bg-blue-500/20 text-blue-600 dark:text-blue-400' },
  { name: 'Eleanor Pena', email: 'eleanor@example.com', color: 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' },
  { name: 'Courtney Henry', email: 'courtney@example.com', color: 'bg-amber-500/20 text-amber-600 dark:text-amber-400' },
  { name: 'Arlene McCoy', email: 'arlene@example.com', color: 'bg-primary/20 text-primary' },
];

export default function TeamMembersList() {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-foreground">Team Members</h3>
        <span className="text-xs bg-primary/15 text-primary px-2 py-0.5 rounded-full font-medium">
          {MEMBERS.length}
        </span>
      </div>
      <div className="space-y-2">
        {MEMBERS.map(member => (
          <div key={member.name} className="flex items-center gap-2.5 group">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${member.color}`}>
              {member.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-foreground truncate">{member.name}</p>
              <p className="text-xs text-muted-foreground truncate">{member.email}</p>
            </div>
            <button className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground">
              <Mail className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

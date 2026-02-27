import React from 'react';
import { MoreHorizontal } from 'lucide-react';

interface StatsCardProps {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  iconBgClass?: string;
}

export default function StatsCard({ icon, value, label, iconBgClass = 'bg-primary/10' }: StatsCardProps) {
  return (
    <div className="bg-card rounded-2xl p-5 card-shadow border border-border hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-11 h-11 rounded-xl ${iconBgClass} flex items-center justify-center`}>
          {icon}
        </div>
        <button className="text-muted-foreground hover:text-foreground transition-colors">
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>
      <div>
        <p className="text-2xl font-bold text-foreground">{value}</p>
        <p className="text-sm text-muted-foreground mt-0.5">{label}</p>
      </div>
    </div>
  );
}

import React from 'react';
import { ArrowRight } from 'lucide-react';

interface OngoingTaskCardProps {
  title: string;
  description: string;
  tags: string[];
  members: string[];
  isGradient?: boolean;
  progress?: number;
}

export default function OngoingTaskCard({
  title,
  description,
  tags,
  members,
  isGradient = false,
  progress = 0,
}: OngoingTaskCardProps) {
  return (
    <div
      className={`rounded-2xl p-5 flex flex-col gap-3 ${
        isGradient
          ? 'bg-gradient-to-br from-primary to-accent text-primary-foreground'
          : 'bg-card border border-border card-shadow'
      }`}
    >
      <div className="flex flex-wrap gap-1.5">
        {tags.map((tag) => (
          <span
            key={tag}
            className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
              isGradient
                ? 'bg-white/20 text-white'
                : 'bg-primary/10 text-primary'
            }`}
          >
            {tag}
          </span>
        ))}
      </div>

      <div>
        <h3 className={`font-semibold text-sm leading-snug ${isGradient ? 'text-white' : 'text-foreground'}`}>
          {title}
        </h3>
        <p className={`text-xs mt-1 line-clamp-2 ${isGradient ? 'text-white/75' : 'text-muted-foreground'}`}>
          {description}
        </p>
      </div>

      {progress > 0 && (
        <div>
          <div className={`h-1.5 rounded-full ${isGradient ? 'bg-white/20' : 'bg-muted'}`}>
            <div
              className={`h-full rounded-full ${isGradient ? 'bg-white' : 'bg-primary'}`}
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className={`text-xs mt-1 ${isGradient ? 'text-white/70' : 'text-muted-foreground'}`}>
            {progress}% complete
          </p>
        </div>
      )}

      <div className="flex items-center justify-between mt-auto">
        <div className="flex -space-x-2">
          {members.slice(0, 4).map((member, i) => (
            <div
              key={i}
              className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold ${
                isGradient
                  ? 'border-white/30 bg-white/20 text-white'
                  : 'border-card bg-primary/20 text-primary'
              }`}
            >
              {member.charAt(0).toUpperCase()}
            </div>
          ))}
        </div>
        <button className={`flex items-center gap-1 text-xs font-medium transition-colors ${
          isGradient ? 'text-white/80 hover:text-white' : 'text-primary hover:text-primary/80'
        }`}>
          Details <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}

import React from 'react';

const DAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr'];
const DATES = [4, 5, 6, 7, 8];

export default function MiniCalendar() {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-foreground">August 2024</h3>
        <span className="text-xs text-muted-foreground">Week 32</span>
      </div>
      <div className="grid grid-cols-5 gap-1">
        {DAYS.map(day => (
          <div key={day} className="text-center text-xs text-muted-foreground font-medium py-1">
            {day}
          </div>
        ))}
        {DATES.map(date => (
          <div
            key={date}
            className={`text-center text-xs py-2 rounded-lg font-medium transition-colors ${
              date === 7
                ? 'bg-primary text-primary-foreground'
                : 'text-foreground hover:bg-muted cursor-pointer'
            }`}
          >
            {date}
          </div>
        ))}
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

interface CalendarEvent {
  id: number;
  title: string;
  date: string;
  time: string;
  type: 'meeting' | 'deadline' | 'review' | 'launch';
  color: string;
}

const EVENTS: CalendarEvent[] = [
  { id: 1, title: 'Team Standup', date: '2026-02-03', time: '09:00 AM', type: 'meeting', color: 'bg-primary/20 text-primary border-primary/30' },
  { id: 2, title: 'Design Review', date: '2026-02-07', time: '02:00 PM', type: 'review', color: 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30' },
  { id: 3, title: 'Sprint Deadline', date: '2026-02-14', time: '05:00 PM', type: 'deadline', color: 'bg-destructive/20 text-destructive border-destructive/30' },
  { id: 4, title: 'Product Launch', date: '2026-02-20', time: '10:00 AM', type: 'launch', color: 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30' },
  { id: 5, title: 'Client Meeting', date: '2026-02-25', time: '03:00 PM', type: 'meeting', color: 'bg-primary/20 text-primary border-primary/30' },
  { id: 6, title: 'Q1 Planning', date: '2026-02-27', time: '11:00 AM', type: 'review', color: 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30' },
];

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function Schedule() {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 1, 1));

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const getEventsForDate = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return EVENTS.filter(e => e.date === dateStr);
  };

  const upcomingEvents = EVENTS.filter(e => new Date(e.date) >= today).slice(0, 5);

  return (
    <div className="flex-1 overflow-y-auto scrollbar-thin bg-background">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border px-6 py-4">
        <h1 className="text-xl font-bold text-foreground">Schedule</h1>
        <p className="text-sm text-muted-foreground">Manage your calendar and events</p>
      </div>

      <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2 bg-card rounded-2xl border border-border card-shadow p-5">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-semibold text-foreground">
              {MONTHS[month]} {year}
            </h2>
            <div className="flex items-center gap-1">
              <button onClick={prevMonth} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button onClick={nextMonth} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {DAYS.map(day => (
              <div key={day} className="text-center text-xs font-semibold text-muted-foreground py-1">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const events = getEventsForDate(day);
              const isToday = today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;

              return (
                <div
                  key={day}
                  className={`min-h-[52px] p-1 rounded-lg transition-colors ${
                    isToday ? 'bg-primary/15 ring-1 ring-primary' : 'hover:bg-muted/50'
                  }`}
                >
                  <span className={`text-xs font-medium block text-center mb-1 ${
                    isToday ? 'text-primary font-bold' : 'text-foreground'
                  }`}>
                    {day}
                  </span>
                  {events.slice(0, 2).map(event => (
                    <div key={event.id} className={`text-xs px-1 py-0.5 rounded mb-0.5 truncate border ${event.color}`}>
                      {event.title}
                    </div>
                  ))}
                  {events.length > 2 && (
                    <div className="text-xs text-muted-foreground text-center">+{events.length - 2}</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="bg-card rounded-2xl border border-border card-shadow p-5">
          <h2 className="text-base font-semibold text-foreground mb-4">Upcoming Events</h2>
          {upcomingEvents.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No upcoming events</p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingEvents.map(event => (
                <div key={event.id} className={`p-3 rounded-xl border ${event.color}`}>
                  <p className="text-sm font-semibold">{event.title}</p>
                  <p className="text-xs mt-0.5 opacity-75">{event.date} · {event.time}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

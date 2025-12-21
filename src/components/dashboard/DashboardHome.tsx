import { useState, useEffect } from 'react';
import { Calendar, ScrollText, User } from 'lucide-react';
import { PwCScoreboard } from './PwCScoreboard';
import { PendingSessionsList } from './PendingSessionsList';
import { useMembers } from '@/contexts/MembersContext';

function getNextMonday(): Date {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const daysUntilMonday = dayOfWeek === 0 ? 1 : dayOfWeek === 1 ? 0 : 8 - dayOfWeek;
  const nextMonday = new Date(today);
  nextMonday.setDate(today.getDate() + daysUntilMonday);
  nextMonday.setHours(19, 0, 0, 0);
  return nextMonday;
}

function getCountdownParts(targetDate: Date) {
  const now = new Date();
  const diff = targetDate.getTime() - now.getTime();
  
  if (diff <= 0) {
    return { days: 0, hours: 0, mins: 0, secs: 0 };
  }
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const secs = Math.floor((diff % (1000 * 60)) / 1000);
  
  return { days, hours, mins, secs };
}

function getWeekRange() {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  
  const formatDate = (date: Date) => 
    date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  
  return `${formatDate(monday)} - ${formatDate(sunday)}`;
}

export function DashboardHome() {
  const [countdown, setCountdown] = useState(getCountdownParts(getNextMonday()));
  const nextSession = getNextMonday();
  const { getCurrentScribe } = useMembers();
  const scribe = getCurrentScribe();

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(getCountdownParts(nextSession));
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);

  const formatNumber = (num: number) => num.toString().padStart(2, '0');

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Page Header */}
      <div>
        <h1 className="section-header">Dashboard</h1>
      </div>

      {/* Compact Info Bar - Next Session & Duty Roster */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Compact Countdown */}
        <div className="bg-card border border-border rounded px-4 py-3 flex items-center gap-4">
          <Calendar className="w-4 h-4 text-primary shrink-0" />
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">Next Session:</span>
            <div className="flex items-center gap-2">
              {[
                { value: formatNumber(countdown.days), label: 'd' },
                { value: formatNumber(countdown.hours), label: 'h' },
                { value: formatNumber(countdown.mins), label: 'm' },
                { value: formatNumber(countdown.secs), label: 's' },
              ].map((item, i) => (
                <span key={item.label} className="flex items-center">
                  <span className="font-mono font-semibold text-primary">{item.value}</span>
                  <span className="text-xs text-muted-foreground ml-0.5">{item.label}</span>
                  {i < 3 && <span className="text-muted-foreground mx-1">:</span>}
                </span>
              ))}
            </div>
            <span className="text-xs text-muted-foreground">(Mon 19:00)</span>
          </div>
        </div>

        {/* Compact Duty Roster */}
        <div className="bg-card border border-border rounded px-4 py-3 flex items-center gap-4">
          <ScrollText className="w-4 h-4 text-primary shrink-0" />
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <span className="text-sm text-muted-foreground shrink-0">Scribe:</span>
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <User className="w-4 h-4 text-primary" />
              </div>
              <div className="min-w-0">
                <span className="font-medium text-foreground truncate block">{scribe.name}</span>
              </div>
            </div>
            <span className="text-xs text-muted-foreground ml-auto shrink-0">{getWeekRange()}</span>
          </div>
        </div>
      </div>

      {/* Main Scoreboard - Full Width */}
      <PwCScoreboard />

      {/* Pending Sessions */}
      <PendingSessionsList />
    </div>
  );
}

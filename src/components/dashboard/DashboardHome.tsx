import { useState, useEffect } from 'react';
import { Calendar, Users, Award, Clock } from 'lucide-react';
import { members } from '@/data/members';
import { DutyRoster } from './DutyRoster';
import { PendingSessionsList } from './PendingSessionsList';
import { Leaderboard } from './Leaderboard';

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

export function DashboardHome() {
  const [countdown, setCountdown] = useState(getCountdownParts(getNextMonday()));
  const nextSession = getNextMonday();

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(getCountdownParts(nextSession));
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);

  const royalCount = members.filter(m => m.role === 'royalty').length;
  const peasantCount = members.filter(m => m.role === 'peasant').length;

  const formatNumber = (num: number) => num.toString().padStart(2, '0');

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Page Header */}
      <div>
        <h1 className="section-header">Dashboard</h1>
      </div>

      {/* Hero Banner */}
      <div className="bg-secondary rounded overflow-hidden">
        <div className="p-8 md:p-10">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-secondary-foreground mb-2">
            Tennisklubben Stora Tennisligan
          </h2>
          <p className="text-secondary-foreground/80 text-lg mb-4">
            Where Excellence Meets Clay
          </p>
          <p className="text-secondary-foreground/60 max-w-2xl">
            Welcome to the most exclusive tennis society this side of Roland Garros. 
            Here, legends are forged, peasants are tolerated, and the clay courts whisper tales of glory.
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center">
              <Clock className="w-5 h-5 text-primary" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">Years Active</span>
          </div>
          <p className="font-serif text-4xl font-bold text-foreground">7</p>
        </div>

        <div className="bg-card border border-border rounded p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded bg-secondary/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-secondary" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">Total Members</span>
          </div>
          <p className="font-serif text-4xl font-bold text-foreground">{members.length}</p>
        </div>

        <div className="bg-card border border-border rounded p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center">
              <Award className="w-5 h-5 text-primary" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">Royal Founders</span>
          </div>
          <p className="font-serif text-4xl font-bold text-foreground">{royalCount}</p>
        </div>

        <div className="bg-card border border-border rounded p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded bg-muted flex items-center justify-center">
              <Users className="w-5 h-5 text-muted-foreground" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">Peasants</span>
          </div>
          <p className="font-serif text-4xl font-bold text-foreground">{peasantCount}</p>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Countdown Timer */}
        <div className="bg-card border border-border rounded p-6">
          <div className="flex items-center gap-3 mb-6">
            <Calendar className="w-5 h-5 text-primary" />
            <h3 className="font-serif text-xl font-semibold text-foreground uppercase tracking-wide">
              Next Session
            </h3>
          </div>
          
          <p className="text-sm text-muted-foreground mb-4">Monday at 19:00</p>
          
          <div className="grid grid-cols-4 gap-3">
            {[
              { value: formatNumber(countdown.days), label: 'Days' },
              { value: formatNumber(countdown.hours), label: 'Hours' },
              { value: formatNumber(countdown.mins), label: 'Mins' },
              { value: formatNumber(countdown.secs), label: 'Secs' },
            ].map((item) => (
              <div 
                key={item.label} 
                className="bg-muted rounded p-4 text-center"
              >
                <p className="font-serif text-3xl font-bold text-primary">
                  {item.value}
                </p>
                <p className="text-xs text-muted-foreground mt-1 uppercase tracking-wide">
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Duty Roster */}
        <DutyRoster />
      </div>

      {/* Pending Sessions */}
      <PendingSessionsList />

      {/* Scoreboard */}
      <Leaderboard />
    </div>
  );
}
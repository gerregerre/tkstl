import { useState, useEffect } from 'react';
import { CrownIcon } from '@/components/icons/CrownIcon';
import { Calendar } from 'lucide-react';
import { members } from '@/data/members';
import { DutyRoster } from './DutyRoster';
import { PendingSessionsList } from './PendingSessionsList';

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
    <div className="space-y-6 animate-fade-in-up">
      {/* Hero Banner */}
      <div className="bg-primary rounded-xl overflow-hidden border border-primary/20">
        <div className="p-8 md:p-10">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-gold flex items-center justify-center shrink-0">
              <CrownIcon className="w-9 h-9 text-secondary" />
            </div>
            <div>
              <h1 className="font-serif text-3xl md:text-4xl font-bold text-primary-foreground">
                Tennisklubben Stora Tennisligan
              </h1>
              <p className="text-primary-foreground/80 font-serif-body text-lg mt-1">
                Where Excellence Meets Clay
              </p>
            </div>
          </div>
          <p className="text-primary-foreground/70 max-w-3xl font-serif-body text-base md:text-lg">
            Welcome to the most exclusive tennis society this side of Roland Garros. Here, legends are forged, peasants are tolerated, and the clay courts whisper tales of glory and humiliation.
          </p>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Countdown Timer */}
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="font-serif text-xl font-semibold text-foreground">Next Session</h2>
              <p className="text-sm text-muted-foreground">Monday at 19:00</p>
            </div>
          </div>
          
          <div className="grid grid-cols-4 gap-3">
            {[
              { value: formatNumber(countdown.days), label: 'DAYS' },
              { value: formatNumber(countdown.hours), label: 'HOURS' },
              { value: formatNumber(countdown.mins), label: 'MINS' },
              { value: formatNumber(countdown.secs), label: 'SECS' },
            ].map((item) => (
              <div 
                key={item.label} 
                className="bg-muted/50 rounded-lg p-4 text-center border border-border"
              >
                <p className="font-serif text-3xl md:text-4xl font-bold text-primary">
                  {item.value}
                </p>
                <p className="text-xs text-muted-foreground font-medium mt-1">
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Season Stats */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h2 className="font-serif text-xl font-semibold text-foreground mb-6">
            Season at a Glance
          </h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gold/10 rounded-lg p-4 border border-gold/20">
              <p className="font-serif text-4xl font-bold text-primary">7</p>
              <p className="text-sm text-muted-foreground font-medium">Years of Glory</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-4 border border-border">
              <p className="font-serif text-4xl font-bold text-secondary">{members.length}</p>
              <p className="text-sm text-muted-foreground font-medium">Active Members</p>
            </div>
            <div className="bg-gold/10 rounded-lg p-4 border border-gold/20">
              <p className="font-serif text-4xl font-bold text-primary">{royalCount}</p>
              <p className="text-sm text-muted-foreground font-medium">Royal Founders</p>
            </div>
            <div className="bg-primary/5 rounded-lg p-4 border border-primary/10">
              <p className="font-serif text-4xl font-bold text-secondary">{peasantCount}</p>
              <p className="text-sm text-muted-foreground font-medium">Tolerated Peasants</p>
            </div>
          </div>
        </div>
      </div>

      {/* Duty Roster */}
      <DutyRoster />

      {/* Pending Sessions */}
      <PendingSessionsList />
    </div>
  );
}

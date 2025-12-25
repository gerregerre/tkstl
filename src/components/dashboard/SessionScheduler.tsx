import { useState, useEffect } from 'react';
import { useMembers } from '@/contexts/MembersContext';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { CrownIcon } from '@/components/icons/CrownIcon';
import { DirtIcon } from '@/components/icons/DirtIcon';
import { Calendar, Clock, Users, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

function getNextMonday(): Date {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const daysUntilMonday = dayOfWeek === 0 ? 1 : dayOfWeek === 1 ? 0 : 8 - dayOfWeek;
  const nextMonday = new Date(today);
  nextMonday.setDate(today.getDate() + daysUntilMonday);
  nextMonday.setHours(19, 0, 0, 0);
  return nextMonday;
}

function formatCountdown(targetDate: Date): string {
  const now = new Date();
  const diff = targetDate.getTime() - now.getTime();
  
  if (diff <= 0) return "Session in progress!";
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  
  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`;
  }
  return `${hours}h ${minutes}m ${seconds}s`;
}

export function SessionScheduler() {
  const { members, checkedInPlayers, setCheckedInPlayers } = useMembers();
  const [countdown, setCountdown] = useState('');
  const nextSession = getNextMonday();

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(formatCountdown(nextSession));
    }, 1000);
    
    setCountdown(formatCountdown(nextSession));
    return () => clearInterval(interval);
  }, []);

  const togglePlayer = (playerId: string) => {
    if (checkedInPlayers.includes(playerId)) {
      setCheckedInPlayers(checkedInPlayers.filter(id => id !== playerId));
    } else if (checkedInPlayers.length >= 4) {
      toast({
        title: "The Holy Quartet is Complete",
        description: "Only 4 players may participate in each sacred session.",
        variant: "destructive",
      });
    } else {
      setCheckedInPlayers([...checkedInPlayers, playerId]);
    }
  };

  const confirmSession = () => {
    if (checkedInPlayers.length !== 4) {
      toast({
        title: "Incomplete Quartet",
        description: "Exactly 4 players must be selected for the session.",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Session Confirmed",
      description: "The Holy Quartet has been assembled. Proceed to Record Session.",
    });
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Countdown */}
      <div className="bg-card rounded-lg border border-border p-6 shadow-card text-center">
        <h2 className="font-serif text-2xl font-bold text-foreground mb-2">
          Next Sacred Session
        </h2>
        <div className="flex items-center justify-center gap-2 text-muted-foreground mb-4">
          <Calendar className="w-4 h-4" />
          <span>
            {nextSession.toLocaleDateString('en-US', { 
              weekday: 'long', 
              month: 'long', 
              day: 'numeric' 
            })}
          </span>
          <span className="mx-2">•</span>
          <Clock className="w-4 h-4" />
          <span>19:00</span>
        </div>
        <div className="bg-gradient-noble text-foreground rounded-lg py-4 px-6 inline-block">
          <p className="text-sm uppercase tracking-wider mb-1 opacity-80">Countdown</p>
          <p className="font-serif text-3xl font-bold">{countdown}</p>
        </div>
      </div>

      {/* Player Selection */}
      <div className="bg-card rounded-lg border border-border p-6 shadow-card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-serif text-xl font-semibold text-foreground">
              The Holy Quartet
            </h3>
            <p className="text-sm text-muted-foreground">
              Select exactly 4 players for the session
            </p>
          </div>
          <div className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium",
            checkedInPlayers.length === 4 
              ? "bg-hunter-green/20 text-hunter-green" 
              : "bg-muted text-muted-foreground"
          )}>
            <Users className="w-4 h-4" />
            {checkedInPlayers.length}/4
          </div>
        </div>

        {checkedInPlayers.length < 4 && (
          <div className="flex items-center gap-2 p-3 bg-accent/50 rounded-lg mb-4 text-sm">
            <AlertCircle className="w-4 h-4 text-accent-foreground" />
            <span className="text-accent-foreground">
              {4 - checkedInPlayers.length} more player{4 - checkedInPlayers.length !== 1 ? 's' : ''} needed
            </span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {members.map((member) => {
            const isSelected = checkedInPlayers.includes(member.id);
            const isRoyal = member.role === 'royalty';
            
            return (
              <button
                key={member.id}
                onClick={() => togglePlayer(member.id)}
                className={cn(
                  "flex items-center gap-3 p-4 rounded-lg border-2 transition-all text-left",
                  isSelected
                    ? isRoyal
                      ? "border-gold bg-gold/10"
                      : "border-burlap bg-burlap/10"
                    : "border-border hover:border-muted-foreground/30 bg-background"
                )}
              >
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center font-serif font-bold",
                  isRoyal
                    ? "bg-gradient-noble text-foreground"
                    : "bg-gradient-peasant text-foreground"
                )}>
                  {member.name[0]}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground">
                      {member.name}
                    </span>
                    {isRoyal ? (
                      <CrownIcon className="w-4 h-4 text-gold" />
                    ) : (
                      <DirtIcon className="w-4 h-4 text-burlap" />
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {member.wins}W - {member.losses}L
                  </span>
                </div>
                <Checkbox checked={isSelected} className="pointer-events-none" />
              </button>
            );
          })}
        </div>

        <Button
          onClick={confirmSession}
          variant="gold"
          size="lg"
          className="w-full mt-6"
          disabled={checkedInPlayers.length !== 4}
        >
          Confirm The Holy Quartet
        </Button>
      </div>

      {/* Game Modes */}
      <div className="bg-card rounded-lg border border-border p-6 shadow-card">
        <h3 className="font-serif text-xl font-semibold text-foreground mb-4">
          The Sacred Games
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-muted/30 rounded-lg p-4 border border-border">
            <h4 className="font-serif font-semibold text-terra-cotta mb-2">Mini-Single</h4>
            <p className="text-xs text-muted-foreground">
              One-on-one combat. The purest form of tennis warfare.
            </p>
          </div>
          <div className="bg-muted/30 rounded-lg p-4 border border-border">
            <h4 className="font-serif font-semibold text-hunter-green mb-2">Shibuya Crossing</h4>
            <p className="text-xs text-muted-foreground">
              Chaotic doubles where alliances shift like cherry blossoms in wind.
            </p>
          </div>
          <div className="bg-muted/30 rounded-lg p-4 border border-border">
            <h4 className="font-serif font-semibold text-gold mb-2">Ladder</h4>
            <p className="text-xs text-muted-foreground">
              The eternal climb. Winners ascend, losers contemplate existence.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect, useMemo } from 'react';
import { Plus, X, Check, ChevronDown, Calendar, Users, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePlayers } from '@/hooks/usePlayers';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface SessionSignupProps {
  sessionDate: Date;
}

interface SlotPlayer {
  id: string;
  name: string;
}

// Get the next Monday at 19:00
const getNextMondaySession = (): Date => {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const daysUntilMonday = dayOfWeek === 0 ? 1 : (8 - dayOfWeek) % 7 || 7;
  
  const nextMonday = new Date(now);
  nextMonday.setDate(now.getDate() + daysUntilMonday);
  nextMonday.setHours(19, 0, 0, 0);
  
  // If it's Monday but before 19:00, use today
  if (dayOfWeek === 1 && now.getHours() < 19) {
    nextMonday.setDate(now.getDate());
  }
  
  return nextMonday;
};

// Check if we should reset (it's past the session time)
const shouldResetSession = (sessionDate: Date): boolean => {
  const now = new Date();
  return now > sessionDate;
};

export function SessionSignup({ sessionDate: initialSessionDate }: SessionSignupProps) {
  const [slots, setSlots] = useState<(SlotPlayer | null)[]>([null, null, null, null]);
  const [openPopover, setOpenPopover] = useState<number | null>(null);
  const [currentSessionDate, setCurrentSessionDate] = useState<Date>(getNextMondaySession());
  const { players, loading: isLoading } = usePlayers();

  const filledSlots = slots.filter(Boolean).length;
  const isSessionFull = filledSlots === 4;

  // Check for weekly reset every minute
  useEffect(() => {
    const checkReset = () => {
      if (shouldResetSession(currentSessionDate)) {
        // Clear all slots
        setSlots([null, null, null, null]);
        // Set the next session date
        setCurrentSessionDate(getNextMondaySession());
      }
    };

    // Check immediately
    checkReset();

    // Check every minute
    const interval = setInterval(checkReset, 60000);
    return () => clearInterval(interval);
  }, [currentSessionDate]);

  // Get available players (not already selected) - sorted alphabetically
  const availablePlayers = useMemo(() => {
    const selectedIds = slots.filter(Boolean).map(s => s!.id);
    return players
      .filter(p => !selectedIds.includes(p.id))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [players, slots]);

  const handleSelectPlayer = (slotIndex: number, player: { id: string; name: string }) => {
    const newSlots = [...slots];
    newSlots[slotIndex] = { id: player.id, name: player.name };
    setSlots(newSlots);
    setOpenPopover(null);
  };

  const handleRemovePlayer = (slotIndex: number) => {
    const newSlots = [...slots];
    newSlots[slotIndex] = null;
    setSlots(newSlots);
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="bg-card border border-border rounded-md overflow-hidden shadow-card">
      {/* Header */}
      <div className={cn(
        "px-5 py-4 flex items-center gap-3 border-b border-border transition-colors duration-300",
        isSessionFull ? "bg-primary/20" : "bg-secondary/50"
      )}>
        <div className={cn(
          "w-1 h-5 rounded-full transition-all duration-300",
          isSessionFull 
            ? "bg-accent shadow-[0_0_8px_hsl(var(--accent)/0.5)]" 
            : "bg-primary shadow-[0_0_6px_hsl(var(--primary)/0.4)]"
        )} />
        {isSessionFull ? (
          <Trophy className="w-4 h-4 text-accent" />
        ) : (
          <Users className="w-4 h-4 text-primary" />
        )}
        <h3 className={cn(
          "text-[11px] font-bold uppercase tracking-widest transition-colors duration-300",
          isSessionFull ? "text-accent" : "text-foreground"
        )}>
          {isSessionFull ? "Session Full!" : "Weekly Matchup"}
        </h3>
      </div>

      <div className="p-5">
        {/* CTA Header */}
        <div className="mb-5">
          {isSessionFull ? (
            <>
              <h4 className="font-display text-xl font-bold text-accent mb-1 animate-pulse">
                🎾 SESSION FULL!
              </h4>
              <p className="text-sm text-muted-foreground">
                All spots filled. See you on the court!
              </p>
            </>
          ) : (
            <>
              <h4 className="font-display text-lg font-bold text-foreground mb-1">
                The Court is Waiting
              </h4>
              <p className="text-sm text-muted-foreground">
                Grab your spot · <span className="text-primary font-semibold">{4 - filledSlots} {4 - filledSlots === 1 ? 'spot' : 'spots'}</span> remaining
              </p>
            </>
          )}
        </div>

        {/* Session Date */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-5 pb-4 border-b border-border/50">
          <Calendar className="w-4 h-4" />
          <span className="font-medium">
            {currentSessionDate.toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric'
            })} at 19:00
          </span>
          <span className="text-[10px] text-muted-foreground/60 ml-auto">
            Resets weekly
          </span>
        </div>

        {/* Player Slots - 2x2 Grid on larger screens, vertical on mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {slots.map((slot, index) => (
            <div key={index}>
              {slot ? (
                // Filled Slot
                <div className={cn(
                  "flex items-center gap-3 px-3 py-3 rounded-md border transition-all group",
                  isSessionFull 
                    ? "bg-accent/10 border-accent/30 hover:bg-accent/15" 
                    : "bg-secondary/40 border-primary/30 hover:bg-secondary/50"
                )}>
                  <div className={cn(
                    "w-9 h-9 rounded-md flex items-center justify-center text-sm font-bold",
                    isSessionFull 
                      ? "bg-accent/15 border border-accent/25 text-accent" 
                      : "bg-primary/15 border border-primary/25 text-primary"
                  )}>
                    {getInitials(slot.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-semibold text-foreground truncate block">
                      {slot.name}
                    </span>
                    <span className="text-[10px] text-muted-foreground">Spot {index + 1}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wide flex items-center gap-1",
                      isSessionFull 
                        ? "bg-accent/15 text-accent" 
                        : "bg-primary/15 text-primary"
                    )}>
                      <Check className="w-2.5 h-2.5" />
                      Ready
                    </span>
                    <button
                      onClick={() => handleRemovePlayer(index)}
                      className="w-6 h-6 rounded flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors opacity-0 group-hover:opacity-100"
                      aria-label="Remove player"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ) : (
                // Empty Slot - Clickable
                <Popover 
                  open={openPopover === index} 
                  onOpenChange={(open) => setOpenPopover(open ? index : null)}
                >
                  <PopoverTrigger asChild>
                    <button
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-3 rounded-md border-2 border-dashed transition-all",
                        "border-border/60 hover:border-primary/50 hover:bg-secondary/20",
                        "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50"
                      )}
                    >
                      <div className="w-9 h-9 rounded-md bg-muted/30 border border-border/50 flex items-center justify-center">
                        <Plus className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div className="flex-1 text-left">
                        <span className="text-sm font-medium text-muted-foreground">
                          Add Player
                        </span>
                        <span className="text-[10px] text-muted-foreground/70 block">Spot {index + 1}</span>
                      </div>
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent 
                    className="w-64 p-0 bg-card border-border shadow-lg z-50" 
                    align="start"
                    sideOffset={4}
                  >
                    <div className="px-3 py-2.5 border-b border-border bg-secondary/30">
                      <p className="text-xs font-semibold text-foreground">Select Player</p>
                      <p className="text-[10px] text-muted-foreground">Sorted A-Z · {availablePlayers.length} available</p>
                    </div>
                    <div className="relative">
                      {/* Custom scrollable container */}
                      <div className="h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-primary/30 scrollbar-track-transparent hover:scrollbar-thumb-primary/50">
                        {isLoading ? (
                          <div className="p-4 text-center text-sm text-muted-foreground">
                            Loading players...
                          </div>
                        ) : availablePlayers.length === 0 ? (
                          <div className="p-4 text-center text-sm text-muted-foreground">
                            No available players
                          </div>
                        ) : (
                          <div className="p-1 pb-8">
                            {availablePlayers.map((player) => (
                              <button
                                key={player.id}
                                onClick={() => handleSelectPlayer(index, player)}
                                className="w-full flex items-center gap-3 px-3 py-2 rounded hover:bg-secondary/50 transition-colors text-left"
                              >
                                <div className="w-7 h-7 rounded-md bg-muted/50 border border-border/30 flex items-center justify-center text-xs font-bold text-muted-foreground">
                                  {getInitials(player.name)}
                                </div>
                                <span className="text-sm font-medium text-foreground">
                                  {player.name}
                                </span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      {/* Bottom fade gradient */}
                      {availablePlayers.length > 6 && (
                        <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-card to-transparent pointer-events-none" />
                      )}
                    </div>
                  </PopoverContent>
                </Popover>
              )}
            </div>
          ))}
        </div>

        {/* Ready Status */}
        {isSessionFull && (
          <div className="mt-4 pt-4 border-t border-border/50">
            <div className="flex items-center justify-center gap-2 text-sm text-accent font-medium">
              <Check className="w-4 h-4" />
              <span>All players confirmed for this session</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

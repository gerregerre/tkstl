import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Player } from '@/hooks/usePlayers';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  RotateCcw, 
  Check, 
  ChevronRight,
  Shield
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface TeamDraftProps {
  players: Player[];
  gameNumber: number;
  gameName: string;
  onConfirm: (teamA: string[], teamB: string[]) => void;
  onBack?: () => void;
}

export function TeamDraft({ 
  players, 
  gameNumber, 
  gameName, 
  onConfirm,
  onBack 
}: TeamDraftProps) {
  const [teamA, setTeamA] = useState<string[]>([]);
  const [teamB, setTeamB] = useState<string[]>([]);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const maxTeamSize = 2;

  // Auto-assign remaining players to Team B when Team A is full
  useEffect(() => {
    if (teamA.length === maxTeamSize) {
      const remaining = players
        .filter(p => !teamA.includes(p.name))
        .map(p => p.name);
      setTeamB(remaining);
    } else {
      setTeamB([]);
    }
  }, [teamA, players]);

  const handlePlayerSelect = (playerName: string) => {
    if (isConfirmed) return;
    
    if (teamA.includes(playerName)) {
      // Remove from Team A
      setTeamA(prev => prev.filter(p => p !== playerName));
    } else if (teamA.length < maxTeamSize) {
      // Add to Team A
      setTeamA(prev => [...prev, playerName]);
    }
  };

  const handleReset = () => {
    setTeamA([]);
    setTeamB([]);
    setIsConfirmed(false);
  };

  const handleConfirm = () => {
    if (teamA.length === maxTeamSize && teamB.length === maxTeamSize) {
      setIsConfirmed(true);
      onConfirm(teamA, teamB);
    }
  };

  const getPlayerStatus = (playerName: string) => {
    if (teamA.includes(playerName)) return 'teamA';
    if (teamB.includes(playerName)) return 'teamB';
    return 'available';
  };

  const isTeamsComplete = teamA.length === maxTeamSize && teamB.length === maxTeamSize;

  return (
    <div className="space-y-6">
      {/* Game Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center font-bold",
            gameNumber === 1 && "bg-primary/20 text-primary",
            gameNumber === 2 && "bg-secondary/40 text-secondary-foreground",
            gameNumber === 3 && "bg-gold/20 text-gold"
          )}>
            {gameNumber}
          </div>
          <div>
            <h3 className="font-display text-lg font-bold text-foreground">{gameName}</h3>
            <p className="text-sm text-muted-foreground">Select 2 players for Team A</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleReset}
          disabled={isConfirmed}
          className="gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          Reset
        </Button>
      </div>

      {/* Team Status Indicators */}
      <div className="grid grid-cols-2 gap-4">
        <div className={cn(
          "p-4 rounded-lg border-2 transition-all",
          teamA.length === maxTeamSize 
            ? "border-primary bg-primary/10" 
            : "border-border bg-card"
        )}>
          <div className="flex items-center justify-between mb-2">
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary">
              Team A
            </Badge>
            <span className="text-sm font-medium text-muted-foreground">
              {teamA.length}/{maxTeamSize}
            </span>
          </div>
          <div className="min-h-[48px] flex flex-wrap gap-2">
            <AnimatePresence mode="popLayout">
              {teamA.map((name, index) => (
                <motion.div
                  key={name}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  className="px-3 py-1.5 bg-primary text-primary-foreground rounded-full text-sm font-medium"
                >
                  {name}
                </motion.div>
              ))}
            </AnimatePresence>
            {teamA.length === 0 && (
              <span className="text-sm text-muted-foreground italic">
                Tap players to assign...
              </span>
            )}
          </div>
        </div>

        <div className={cn(
          "p-4 rounded-lg border-2 transition-all",
          teamB.length === maxTeamSize 
            ? "border-secondary bg-secondary/10" 
            : "border-border bg-card"
        )}>
          <div className="flex items-center justify-between mb-2">
            <Badge variant="outline" className="bg-secondary/20 text-secondary-foreground border-secondary">
              Team B
            </Badge>
            <span className="text-sm font-medium text-muted-foreground">
              {teamB.length}/{maxTeamSize}
            </span>
          </div>
          <div className="min-h-[48px] flex flex-wrap gap-2">
            <AnimatePresence mode="popLayout">
              {teamB.map((name) => (
                <motion.div
                  key={name}
                  initial={{ scale: 0.8, opacity: 0, x: 20 }}
                  animate={{ scale: 1, opacity: 1, x: 0 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30, delay: 0.1 }}
                  className="px-3 py-1.5 bg-secondary text-secondary-foreground rounded-full text-sm font-medium"
                >
                  {name}
                </motion.div>
              ))}
            </AnimatePresence>
            {teamA.length < maxTeamSize && (
              <span className="text-sm text-muted-foreground italic">
                Auto-assigned when Team A is full
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Player Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {players.map((player) => {
          const status = getPlayerStatus(player.name);
          const isDisabled = isConfirmed || (status === 'teamB');
          
          return (
            <motion.button
              key={player.id}
              onClick={() => handlePlayerSelect(player.name)}
              disabled={isDisabled}
              whileHover={!isDisabled ? { scale: 1.02 } : undefined}
              whileTap={!isDisabled ? { scale: 0.98 } : undefined}
              className={cn(
                "relative p-4 rounded-lg border-2 transition-all text-left",
                status === 'teamA' && "border-primary bg-primary/10 ring-2 ring-primary/30",
                status === 'teamB' && "border-secondary bg-secondary/10 opacity-75",
                status === 'available' && !isConfirmed && "border-border hover:border-primary/50 bg-card hover:bg-card/80",
                isDisabled && "cursor-not-allowed"
              )}
            >
              {/* Selection indicator */}
              <AnimatePresence>
                {status !== 'available' && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className={cn(
                      "absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center",
                      status === 'teamA' && "bg-primary text-primary-foreground",
                      status === 'teamB' && "bg-secondary text-secondary-foreground"
                    )}
                  >
                    <Shield className="w-3.5 h-3.5" />
                  </motion.div>
                )}
              </AnimatePresence>

              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center font-display font-bold mb-2 mx-auto",
                status === 'teamA' && "bg-primary text-primary-foreground",
                status === 'teamB' && "bg-secondary text-secondary-foreground",
                status === 'available' && "bg-muted text-muted-foreground"
              )}>
                {player.name[0]}
              </div>
              <div className="text-center">
                <span className={cn(
                  "font-semibold block",
                  status === 'available' ? "text-foreground" : "text-foreground"
                )}>
                  {player.name}
                </span>
                <span className="text-xs text-muted-foreground">
                  {status === 'teamA' && 'Team A'}
                  {status === 'teamB' && 'Team B'}
                  {status === 'available' && 'Tap to select'}
                </span>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Confirm Button */}
      <motion.div
        initial={false}
        animate={{ opacity: isTeamsComplete ? 1 : 0.5 }}
        className="flex gap-3"
      >
        {onBack && (
          <Button variant="outline" onClick={onBack} className="flex-1">
            Back
          </Button>
        )}
        <Button
          onClick={handleConfirm}
          disabled={!isTeamsComplete || isConfirmed}
          className="flex-1 gap-2"
          variant="atp"
        >
          {isConfirmed ? (
            <>
              <Check className="w-4 h-4" />
              Teams Locked
            </>
          ) : (
            <>
              Confirm Teams
              <ChevronRight className="w-4 h-4" />
            </>
          )}
        </Button>
      </motion.div>
    </div>
  );
}

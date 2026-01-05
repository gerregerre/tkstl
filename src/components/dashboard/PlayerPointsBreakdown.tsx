import { usePlayerGameBreakdown, GameBreakdownItem } from '@/hooks/usePlayerGameBreakdown';
import { cn } from '@/lib/utils';
import { Trophy, Target, Loader2 } from 'lucide-react';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';

interface PlayerPointsBreakdownProps {
  playerName: string;
  children: React.ReactNode;
}

function BreakdownContent({ breakdown, loading, playerName }: { 
  breakdown: GameBreakdownItem[]; 
  loading: boolean;
  playerName: string;
}) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (breakdown.length === 0) {
    return (
      <div className="text-center py-4 text-sm text-muted-foreground">
        No games played yet
      </div>
    );
  }

  const totalPoints = breakdown.reduce((sum, g) => sum + g.pointsEarned, 0);
  const avgPoints = totalPoints / breakdown.length;
  const wins = breakdown.filter(g => g.won).length;

  return (
    <div className="space-y-3">
      {/* Summary */}
      <div className="flex items-center justify-between pb-2 border-b border-border">
        <span className="font-semibold text-foreground">{playerName}</span>
        <span className="text-xs text-muted-foreground">
          {breakdown.length} games · {wins}W/{breakdown.length - wins}L
        </span>
      </div>

      {/* Points Summary */}
      <div className="grid grid-cols-2 gap-2 text-center pb-2 border-b border-border">
        <div>
          <div className="text-lg font-bold text-primary">{totalPoints.toFixed(1)}</div>
          <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Total</div>
        </div>
        <div>
          <div className="text-lg font-bold text-foreground">{avgPoints.toFixed(2)}</div>
          <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Average</div>
        </div>
      </div>

      {/* Game Breakdown */}
      <div className="space-y-1.5 max-h-48 overflow-y-auto">
        {breakdown.map((game) => (
          <div
            key={game.id}
            className={cn(
              "flex items-center justify-between p-2 rounded text-xs",
              game.won ? "bg-green-500/10" : "bg-red-500/10"
            )}
          >
            <div className="flex items-center gap-2">
              {game.won ? (
                <Trophy className="w-3 h-3 text-green-500" />
              ) : (
                <Target className="w-3 h-3 text-red-400" />
              )}
              <div>
                <div className="font-medium text-foreground">{game.gameType}</div>
                <div className="text-[10px] text-muted-foreground">
                  w/ {game.teammate} vs {game.opponents}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className={cn(
                "font-bold",
                game.won ? "text-green-500" : "text-red-400"
              )}>
                +{game.pointsEarned.toFixed(2)}
              </div>
              {game.teamScore !== null && (
                <div className="text-[10px] text-muted-foreground">
                  {game.teamScore}-{game.opponentScore}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Calculation Formula */}
      <div className="pt-2 border-t border-border">
        <div className="text-[10px] text-muted-foreground">
          <span className="font-semibold">Formula:</span> PwC/Shibuya: (score ÷ total) × 10 | Tug Of War: Win=10, Loss=5
        </div>
      </div>
    </div>
  );
}

export function PlayerPointsBreakdown({ playerName, children }: PlayerPointsBreakdownProps) {
  const { breakdown, loading } = usePlayerGameBreakdown(playerName);

  return (
    <HoverCard openDelay={200} closeDelay={100}>
      <HoverCardTrigger asChild>
        {children}
      </HoverCardTrigger>
      <HoverCardContent 
        className="w-80 p-3" 
        side="right" 
        align="start"
        sideOffset={8}
      >
        <BreakdownContent breakdown={breakdown} loading={loading} playerName={playerName} />
      </HoverCardContent>
    </HoverCard>
  );
}

// Inline breakdown for mobile expanded view
export function PlayerPointsBreakdownInline({ playerName }: { playerName: string }) {
  const { breakdown, loading } = usePlayerGameBreakdown(playerName);

  return (
    <div className="px-4 py-3 bg-muted/20 border-t border-border/50">
      <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-2">
        Points Breakdown
      </div>
      <BreakdownContent breakdown={breakdown} loading={loading} playerName={playerName} />
    </div>
  );
}

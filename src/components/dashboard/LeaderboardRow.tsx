import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Trophy, Medal, Award, Star, ChevronDown, CheckCircle2, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { PlayerPointsBreakdown, PlayerPointsBreakdownInline } from './PlayerPointsBreakdown';
import { usePlayerGameBreakdown } from '@/hooks/usePlayerGameBreakdown';
import { motion, AnimatePresence } from 'framer-motion';
import { Progress } from '@/components/ui/progress';
interface LeaderboardRowProps {
  rank: number;
  mode: 'singles' | 'doubles';
  name: string; // For singles: player name, for doubles: "Player1 & Player2"
  avgPoints: number;
  winPercentage: number;
  gamesPlayed: number;
  totalPoints: number;
  qualificationGames: number;
  onClick?: () => void;
  variant?: 'desktop' | 'mobile';
}
const getRankIcon = (rank: number) => {
  switch (rank) {
    case 1:
      return <Trophy className="w-5 h-5 text-gold" />;
    case 2:
      return <Medal className="w-5 h-5 text-silver" />;
    case 3:
      return <Award className="w-5 h-5 text-bronze" />;
    default:
      return null;
  }
};
const getRankColor = (rank: number) => {
  if (rank === 1) return 'text-gold';
  if (rank === 2) return 'text-silver';
  if (rank === 3) return 'text-bronze';
  return 'text-foreground';
};
const getAvatarStyle = (rank: number) => {
  if (rank === 1) return 'bg-gold/20 text-gold ring-1 ring-gold/30';
  if (rank === 2) return 'bg-silver/15 text-silver ring-1 ring-silver/20';
  if (rank === 3) return 'bg-bronze/15 text-bronze ring-1 ring-bronze/20';
  return 'bg-muted text-foreground';
};
const getRowBackground = (rank: number) => {
  if (rank === 1) return 'bg-gold/[0.04] hover:bg-gold/[0.08]';
  if (rank === 2) return 'bg-silver/[0.03] hover:bg-silver/[0.06]';
  if (rank === 3) return 'bg-bronze/[0.03] hover:bg-bronze/[0.06]';
  return 'hover:bg-muted/40';
};

// Parse team name into individual players for doubles display
const parseTeamName = (teamName: string): [string, string] | null => {
  const parts = teamName.split(' & ');
  if (parts.length === 2) {
    return [parts[0].trim(), parts[1].trim()];
  }
  return null;
};

// Expanded Details Component for Singles
function ExpandedPlayerDetails({
  playerName,
  gamesPlayed,
  qualificationGames
}: {
  playerName: string;
  gamesPlayed: number;
  qualificationGames: number;
}) {
  const {
    breakdown,
    loading
  } = usePlayerGameBreakdown(playerName);
  const qualifies = gamesPlayed >= qualificationGames;
  const qualificationProgress = Math.min(gamesPlayed / qualificationGames * 100, 100);

  // Get last 5 games for recent form
  const recentGames = breakdown.slice(0, 5);

  // Calculate stats
  const totalPoints = breakdown.reduce((sum, g) => sum + g.pointsEarned, 0);
  const wins = breakdown.filter(g => g.won).length;
  const losses = breakdown.filter(g => !g.won).length;
  if (loading) {
    return <div className="px-4 py-4 flex items-center justify-center">
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
      </div>;
  }
  return <motion.div initial={{
    opacity: 0,
    height: 0
  }} animate={{
    opacity: 1,
    height: 'auto'
  }} exit={{
    opacity: 0,
    height: 0
  }} transition={{
    duration: 0.2,
    ease: 'easeInOut'
  }} className="overflow-hidden">
      <div className="px-4 py-4 bg-muted/30 border-t border-border/50 space-y-4">
        {/* Qualification Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground font-medium">Qualification Progress</span>
            <span className={cn("font-bold", qualifies ? "text-secondary" : "text-muted-foreground")}>
              {gamesPlayed}/{qualificationGames} games
            </span>
          </div>
          <Progress value={qualificationProgress} className="h-2 bg-muted" />
          {qualifies && <div className="flex items-center gap-1 text-xs text-secondary">
              <Star className="w-3 h-3" />
              <span>Qualified for rankings</span>
            </div>}
        </div>

        {/* Recent Form - Last 5 Games */}
        {recentGames.length > 0 && <div className="space-y-2">
            <span className="text-xs text-muted-foreground font-medium">Recent Form (Last 5)</span>
            <div className="flex items-center gap-1.5">
              {recentGames.map((game, idx) => <div key={game.id} className={cn("w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-transform hover:scale-110", game.won ? "bg-secondary/20 text-secondary ring-1 ring-secondary/30" : "bg-destructive/20 text-destructive ring-1 ring-destructive/30")} title={`${game.gameType}: ${game.won ? 'Won' : 'Lost'} (${game.pointsEarned.toFixed(1)} pts)`}>
                  {game.won ? 'W' : 'L'}
                </div>)}
              {recentGames.length < 5 && <span className="text-xs text-muted-foreground ml-1">
                  ({5 - recentGames.length} more to show)
                </span>}
            </div>
          </div>}

        {/* Stats Summary */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-background/50 rounded-lg p-2.5 text-center border border-border/50">
            <div className="text-lg font-bold text-foreground">{totalPoints.toFixed(1)}</div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Total Pts</div>
          </div>
          <div className="bg-background/50 rounded-lg p-2.5 text-center border border-border/50">
            <div className="text-lg font-bold text-secondary">{wins}</div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Wins</div>
          </div>
          <div className="bg-background/50 rounded-lg p-2.5 text-center border border-border/50">
            <div className="text-lg font-bold text-destructive">{losses}</div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Losses</div>
          </div>
        </div>

        {/* Points Breakdown (Inline for expanded view) */}
        {breakdown.length > 0 && <div className="space-y-2">
            <span className="text-xs text-muted-foreground font-medium">Points Breakdown</span>
            <div className="max-h-32 overflow-y-auto space-y-1 pr-1">
              {breakdown.slice(0, 6).map(game => <div key={game.id} className="flex items-center justify-between text-xs bg-background/40 rounded px-2 py-1.5">
                  <div className="flex items-center gap-2">
                    {game.won ? <CheckCircle2 className="w-3 h-3 text-secondary" /> : <XCircle className="w-3 h-3 text-destructive" />}
                    <span className="text-muted-foreground">{game.gameType}</span>
                  </div>
                  <span className="font-medium text-foreground">+{game.pointsEarned.toFixed(1)}</span>
                </div>)}
            </div>
          </div>}
      </div>
    </motion.div>;
}

// Desktop Row Component
export function LeaderboardRowDesktop({
  rank,
  mode,
  name,
  avgPoints,
  winPercentage,
  gamesPlayed,
  totalPoints,
  qualificationGames,
  onClick
}: LeaderboardRowProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const qualifies = gamesPlayed >= qualificationGames;
  const players = mode === 'doubles' ? parseTeamName(name) : null;
  const handleRowClick = () => {
    if (mode === 'singles') {
      setIsExpanded(!isExpanded);
    }
    onClick?.();
  };
  const renderAvatar = () => {
    if (mode === 'singles') {
      return <div className={cn("w-10 h-10 rounded-full flex items-center justify-center font-display font-bold text-sm transition-transform duration-200 group-hover:scale-105 shrink-0", getAvatarStyle(rank))}>
          {name[0]}
        </div>;
    }

    // Doubles: Two overlapping avatars
    if (players) {
      return <div className="flex items-center -space-x-2 shrink-0">
          <div className={cn("w-10 h-10 rounded-full flex items-center justify-center font-display font-bold text-sm ring-2 ring-background z-10 transition-transform duration-200 group-hover:scale-105", getAvatarStyle(rank))}>
            {players[0][0]}
          </div>
          <div className={cn("w-10 h-10 rounded-full flex items-center justify-center font-display font-bold text-sm ring-2 ring-background transition-transform duration-200 group-hover:scale-105", getAvatarStyle(rank))}>
            {players[1][0]}
          </div>
        </div>;
    }

    // Fallback for unparseable team names
    return <div className={cn("w-10 h-10 rounded-full flex items-center justify-center font-display font-bold text-sm transition-transform duration-200 group-hover:scale-105 shrink-0", getAvatarStyle(rank))}>
        {name[0]}
      </div>;
  };
  const renderName = () => {
    if (mode === 'singles') {
      return <div className="flex items-center gap-3">
          {renderAvatar()}
          <span className="font-medium text-foreground group-hover:text-primary transition-colors duration-200 truncate max-w-[200px]">
            {name}
          </span>
          <ChevronDown className={cn("w-4 h-4 text-muted-foreground transition-transform duration-200", isExpanded && "rotate-180")} />
        </div>;
    }

    // Doubles: Stacked vertical layout for team names
    if (players) {
      return <div className="flex items-center gap-3">
          {renderAvatar()}
          <div className="flex flex-col justify-center leading-tight">
            <span className="font-medium text-foreground text-sm group-hover:text-primary transition-colors duration-200">
              {players[0]}
            </span>
            <span className="font-medium text-foreground/80 text-sm group-hover:text-primary/80 transition-colors duration-200">
              {players[1]}
            </span>
          </div>
        </div>;
    }

    // Fallback for unparseable team names
    return <div className="flex items-center gap-3">
        {renderAvatar()}
        <span className="font-medium text-foreground group-hover:text-primary transition-colors duration-200 truncate max-w-[200px]">
          {name}
        </span>
      </div>;
  };
  return <>
      <tr onClick={handleRowClick} className={cn("transition-all duration-200 cursor-pointer group", getRowBackground(rank))}>
        {/* Rank */}
        <td className="px-3 py-3 whitespace-nowrap">
          <div className="flex items-center gap-1.5">
            <span className={cn("font-display font-bold text-lg w-5", getRankColor(rank))}>
              {rank}
            </span>
            {getRankIcon(rank)}
          </div>
        </td>

        {/* Name - Auto width based on content */}
        <td className="px-3 py-3 whitespace-nowrap">
          {renderName()}
        </td>

        {/* Avg Points */}
        <td className="px-3 py-3 text-center whitespace-nowrap">
          <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-md text-sm font-bold bg-primary/15 text-primary ring-1 ring-primary/20">
            {avgPoints.toFixed(2)}
          </span>
        </td>

        {/* Win Percentage */}
        <td className="px-3 py-3 text-center font-medium text-foreground tabular-nums whitespace-nowrap">
          {winPercentage.toFixed(0)}%
        </td>

        {/* Games Played */}
        <td className="px-3 py-3 text-center font-semibold text-foreground tabular-nums whitespace-nowrap">
          {gamesPlayed}
        </td>

        {/* Total Points */}
        <td className="px-3 py-3 text-center font-medium text-muted-foreground tabular-nums whitespace-nowrap">
          {totalPoints.toFixed(1)}
        </td>

      </tr>
      
      {/* Expanded Details Row */}
      {mode === 'singles' && <AnimatePresence>
          {isExpanded && <tr>
              <td colSpan={6} className="p-0">
                <ExpandedPlayerDetails playerName={name} gamesPlayed={gamesPlayed} qualificationGames={qualificationGames} />
              </td>
            </tr>}
        </AnimatePresence>}
    </>;
}

// Mobile Row Component
export function LeaderboardRowMobile({
  rank,
  mode,
  name,
  avgPoints,
  winPercentage,
  gamesPlayed,
  totalPoints,
  qualificationGames,
  onClick
}: LeaderboardRowProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const qualifies = gamesPlayed >= qualificationGames;
  const players = mode === 'doubles' ? parseTeamName(name) : null;
  const handleRowClick = () => {
    if (mode === 'singles') {
      setIsExpanded(!isExpanded);
    }
    onClick?.();
  };
  const renderAvatar = () => {
    if (mode === 'singles') {
      return <div className={cn("w-7 h-7 rounded-full flex items-center justify-center font-display font-bold text-xs shrink-0", getAvatarStyle(rank))}>
          {name[0]}
        </div>;
    }

    // Doubles: Two overlapping smaller avatars
    if (players) {
      return <div className="flex items-center -space-x-1.5 shrink-0">
          <div className={cn("w-7 h-7 rounded-full flex items-center justify-center font-display font-bold text-xs ring-2 ring-background z-10", getAvatarStyle(rank))}>
            {players[0][0]}
          </div>
          <div className={cn("w-7 h-7 rounded-full flex items-center justify-center font-display font-bold text-xs ring-2 ring-background", getAvatarStyle(rank))}>
            {players[1][0]}
          </div>
        </div>;
    }
    return <div className={cn("w-7 h-7 rounded-full flex items-center justify-center font-display font-bold text-xs shrink-0", getAvatarStyle(rank))}>
        {name[0]}
      </div>;
  };
  return <>
      <tr onClick={handleRowClick} className={cn("transition-all duration-200 cursor-pointer", getRowBackground(rank))}>
        {/* Player/Team Column */}
        <td className="py-2.5 w-fit px-2 whitespace-nowrap">
          <div className="flex items-center gap-1">
            <span className={cn("font-display font-bold text-xs w-4 shrink-0", getRankColor(rank))}>
              {rank}
            </span>
            {renderAvatar()}
            {mode === 'doubles' && players ? <div className="flex flex-col justify-center leading-tight">
                <span className="font-medium text-foreground text-[10px]">
                  {players[0]}
                </span>
                <span className="font-medium text-foreground/80 text-[10px]">
                  {players[1]}
                </span>
              </div> : <div className="flex items-center gap-0.5">
                <span className="font-medium text-foreground text-[11px] truncate max-w-[55px]">
                  {name}
                </span>
                {mode === 'singles' && <ChevronDown className={cn("w-3 h-3 text-muted-foreground transition-transform duration-200 shrink-0", isExpanded && "rotate-180")} />}
              </div>}
          </div>
        </td>

        {/* Avg Points */}
        <td className="px-2 py-2.5 text-center">
          <span className="inline-flex items-center justify-center px-1.5 py-0.5 rounded text-[11px] font-bold bg-primary/15 text-primary">
            {avgPoints.toFixed(2)}
          </span>
        </td>

        {/* Win Percentage */}
        <td className="px-2 py-2.5 text-center font-medium text-foreground text-xs tabular-nums">
          {winPercentage.toFixed(0)}%
        </td>

        {/* Games Played */}
        <td className="px-2 py-2.5 text-center font-medium text-foreground text-xs tabular-nums">
          {gamesPlayed}
        </td>

        {/* Total Points */}
        <td className="px-2 py-2.5 text-center font-medium text-muted-foreground text-xs tabular-nums">
          {totalPoints.toFixed(0)}
        </td>

      </tr>

      {/* Expanded Details Row for Mobile */}
      {mode === 'singles' && <AnimatePresence>
          {isExpanded && <tr>
              <td colSpan={5} className="p-0 bg-background">
                <ExpandedPlayerDetails playerName={name} gamesPlayed={gamesPlayed} qualificationGames={qualificationGames} />
              </td>
            </tr>}
        </AnimatePresence>}
    </>;
}
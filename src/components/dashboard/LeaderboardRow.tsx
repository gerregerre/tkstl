import { cn } from '@/lib/utils';
import { Trophy, Medal, Award, Star, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { PlayerPointsBreakdown } from './PlayerPointsBreakdown';

interface LeaderboardRowProps {
  rank: number;
  mode: 'singles' | 'doubles';
  name: string; // For singles: player name, for doubles: "Player1 & Player2"
  avgPoints: number;
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

// Desktop Row Component
export function LeaderboardRowDesktop({
  rank,
  mode,
  name,
  avgPoints,
  gamesPlayed,
  totalPoints,
  qualificationGames,
  onClick,
}: LeaderboardRowProps) {
  const qualifies = gamesPlayed >= qualificationGames;
  const players = mode === 'doubles' ? parseTeamName(name) : null;

  const renderAvatar = () => {
    if (mode === 'singles') {
      return (
        <div className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center font-display font-bold text-sm transition-transform duration-200 group-hover:scale-105 shrink-0",
          getAvatarStyle(rank)
        )}>
          {name[0]}
        </div>
      );
    }

    // Doubles: Two overlapping avatars
    if (players) {
      return (
        <div className="flex items-center -space-x-2 shrink-0">
          <div className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center font-display font-bold text-sm ring-2 ring-background z-10 transition-transform duration-200 group-hover:scale-105",
            getAvatarStyle(rank)
          )}>
            {players[0][0]}
          </div>
          <div className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center font-display font-bold text-sm ring-2 ring-background transition-transform duration-200 group-hover:scale-105",
            getAvatarStyle(rank)
          )}>
            {players[1][0]}
          </div>
        </div>
      );
    }

    // Fallback for unparseable team names
    return (
      <div className={cn(
        "w-10 h-10 rounded-full flex items-center justify-center font-display font-bold text-sm transition-transform duration-200 group-hover:scale-105 shrink-0",
        getAvatarStyle(rank)
      )}>
        {name[0]}
      </div>
    );
  };

  const renderName = () => {
    if (mode === 'singles') {
      return (
        <PlayerPointsBreakdown playerName={name}>
          <div className="flex items-center gap-3 cursor-help">
            {renderAvatar()}
            <span className="font-medium text-foreground group-hover:text-primary transition-colors duration-200 underline decoration-dotted decoration-muted-foreground/50 underline-offset-2 truncate max-w-[200px]">
              {name}
            </span>
          </div>
        </PlayerPointsBreakdown>
      );
    }

    // Doubles: Stacked vertical layout for team names
    if (players) {
      return (
        <div className="flex items-center gap-3">
          {renderAvatar()}
          <div className="flex flex-col justify-center leading-tight">
            <span className="font-medium text-foreground text-sm group-hover:text-primary transition-colors duration-200">
              {players[0]}
            </span>
            <span className="font-medium text-foreground/80 text-sm group-hover:text-primary/80 transition-colors duration-200">
              {players[1]}
            </span>
          </div>
        </div>
      );
    }

    // Fallback for unparseable team names
    return (
      <div className="flex items-center gap-3">
        {renderAvatar()}
        <span className="font-medium text-foreground group-hover:text-primary transition-colors duration-200 truncate max-w-[200px]">
          {name}
        </span>
      </div>
    );
  };

  return (
    <tr
      onClick={onClick}
      className={cn(
        "transition-all duration-200 cursor-pointer group",
        getRowBackground(rank)
      )}
    >
      {/* Rank - Fixed width */}
      <td className="w-[80px] px-5 py-4">
        <div className="flex items-center gap-2.5">
          <span className={cn("font-display font-bold text-lg w-6", getRankColor(rank))}>
            {rank}
          </span>
          {getRankIcon(rank)}
        </div>
      </td>

      {/* Name - Flexible, takes remaining space */}
      <td className="px-5 py-4">
        {renderName()}
      </td>

      {/* Avg Points - Fixed width */}
      <td className="w-[120px] px-5 py-4 text-center">
        <span className="inline-flex items-center justify-center px-3 py-1.5 rounded-md text-sm font-bold bg-primary/15 text-primary ring-1 ring-primary/20">
          {avgPoints.toFixed(2)}
        </span>
      </td>

      {/* Games Played - Fixed width */}
      <td className="w-[100px] px-5 py-4 text-center font-semibold text-foreground tabular-nums">
        {gamesPlayed}
      </td>

      {/* Total Points - Fixed width */}
      <td className="w-[100px] px-5 py-4 text-center font-medium text-muted-foreground tabular-nums">
        {totalPoints.toFixed(1)}
      </td>

      {/* Status - Fixed width */}
      <td className="w-[180px] px-4 py-4 text-center">
        <div className="flex items-center justify-center gap-2">
          {qualifies ? (
            <Badge variant="default" className="bg-secondary text-secondary-foreground">
              <Star className="w-3 h-3 mr-1" />
              Qualified
            </Badge>
          ) : (
            <Badge variant="outline" className="text-muted-foreground">
              {qualificationGames - gamesPlayed} left
            </Badge>
          )}
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </div>
      </td>
    </tr>
  );
}

// Mobile Row Component
export function LeaderboardRowMobile({
  rank,
  mode,
  name,
  avgPoints,
  gamesPlayed,
  totalPoints,
  qualificationGames,
  onClick,
}: LeaderboardRowProps) {
  const qualifies = gamesPlayed >= qualificationGames;
  const players = mode === 'doubles' ? parseTeamName(name) : null;

  const renderAvatar = () => {
    if (mode === 'singles') {
      return (
        <div className={cn(
          "w-7 h-7 rounded-full flex items-center justify-center font-display font-bold text-xs shrink-0",
          getAvatarStyle(rank)
        )}>
          {name[0]}
        </div>
      );
    }

    // Doubles: Two overlapping smaller avatars
    if (players) {
      return (
        <div className="flex items-center -space-x-1.5 shrink-0">
          <div className={cn(
            "w-7 h-7 rounded-full flex items-center justify-center font-display font-bold text-xs ring-2 ring-background z-10",
            getAvatarStyle(rank)
          )}>
            {players[0][0]}
          </div>
          <div className={cn(
            "w-7 h-7 rounded-full flex items-center justify-center font-display font-bold text-xs ring-2 ring-background",
            getAvatarStyle(rank)
          )}>
            {players[1][0]}
          </div>
        </div>
      );
    }

    return (
      <div className={cn(
        "w-7 h-7 rounded-full flex items-center justify-center font-display font-bold text-xs shrink-0",
        getAvatarStyle(rank)
      )}>
        {name[0]}
      </div>
    );
  };

  return (
    <tr
      onClick={onClick}
      className={cn(
        "transition-all duration-200 cursor-pointer",
        getRowBackground(rank)
      )}
    >
      {/* Sticky Player/Team Column */}
      <td className="sticky left-0 z-10 px-3 py-3 bg-background min-w-[160px]">
        <div className="flex items-center gap-2">
          <span className={cn("font-display font-bold text-sm w-5 shrink-0", getRankColor(rank))}>
            {rank}
          </span>
          {renderAvatar()}
          {mode === 'doubles' && players ? (
            <div className="flex flex-col justify-center leading-tight">
              <span className="font-medium text-foreground text-xs">
                {players[0]}
              </span>
              <span className="font-medium text-foreground/80 text-xs">
                {players[1]}
              </span>
            </div>
          ) : (
            <span className="font-medium text-foreground text-sm truncate max-w-[90px]">
              {name}
            </span>
          )}
        </div>
      </td>

      {/* Avg Points */}
      <td className="px-3 py-3 text-center">
        <span className="inline-flex items-center justify-center px-2 py-0.5 rounded text-xs font-bold bg-primary/15 text-primary">
          {avgPoints.toFixed(2)}
        </span>
      </td>

      {/* Games Played */}
      <td className="px-3 py-3 text-center font-medium text-foreground text-sm tabular-nums">
        {gamesPlayed}
      </td>

      {/* Total Points */}
      <td className="px-3 py-3 text-center font-medium text-muted-foreground text-sm tabular-nums">
        {totalPoints.toFixed(1)}
      </td>

      {/* Status */}
      <td className="px-3 py-3 text-center">
        {qualifies ? (
          <Badge variant="default" className="bg-secondary text-secondary-foreground text-[10px] px-1.5 py-0.5">
            <Star className="w-2.5 h-2.5 mr-0.5" />
            OK
          </Badge>
        ) : (
          <span className="text-muted-foreground text-[10px] whitespace-nowrap tabular-nums">
            {qualificationGames - gamesPlayed} left
          </span>
        )}
      </td>
    </tr>
  );
}

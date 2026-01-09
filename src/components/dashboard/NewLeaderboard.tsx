import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePlayers } from '@/hooks/usePlayers';
import { useTeams } from '@/hooks/useTeams';
import { useFilteredPlayerStats, GameTypeFilter } from '@/hooks/useFilteredPlayerStats';
import { cn } from '@/lib/utils';
import { Trophy, Medal, Award, Star, ChevronDown, ChevronRight, Users, User, RefreshCw, Filter } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { PlayerPointsBreakdown, PlayerPointsBreakdownInline } from './PlayerPointsBreakdown';

const GAME_TYPE_LABELS: Record<GameTypeFilter, string> = {
  all: 'All Games',
  pwc: 'PwC Single',
  shibuya: 'Shibuya Crossing',
  tow: 'Tug Of War',
};

interface NewLeaderboardProps {
  onPlayerSelect?: (playerName: string) => void;
}

export function NewLeaderboard({ onPlayerSelect }: NewLeaderboardProps) {
  const { players, loading: playersLoading, getAveragePoints, getGamesPlayed, getTotalPoints, getLeaderboard, recalculateStats } = usePlayers();
  const { teams, loading: teamsLoading, getAveragePoints: getTeamAvgPoints, getTeamLeaderboard, getTeamName } = useTeams();
  const [mode, setMode] = useState<'singles' | 'doubles'>('singles');
  const [gameTypeFilter, setGameTypeFilter] = useState<GameTypeFilter>('all');
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);

  // Filtered stats hook
  const { playerStats: filteredPlayerStats, teamStats: filteredTeamStats, loading: filteredLoading, isFiltered } = useFilteredPlayerStats(gameTypeFilter);

  const toggleRowExpansion = (id: string) => {
    setExpandedRowId(prev => prev === id ? null : id);
  };

  const handleRecalculate = async () => {
    setIsRecalculating(true);
    try {
      await recalculateStats();
      toast.success('Stats recalculated from game history');
    } catch (error) {
      toast.error('Failed to recalculate stats');
    } finally {
      setIsRecalculating(false);
    }
  };
  
  const loading = playersLoading || teamsLoading || (isFiltered && filteredLoading);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Use filtered data when a game type filter is active
  const singlesLeaderboard = isFiltered 
    ? filteredPlayerStats.map((p, i) => ({ 
        id: `filtered-${i}`, 
        name: p.name, 
        avgPoints: p.avgPoints, 
        gamesPlayed: p.gamesPlayed, 
        totalPoints: p.totalPoints 
      }))
    : getLeaderboard('singles').map(p => ({
        id: p.id,
        name: p.name,
        avgPoints: getAveragePoints(p, 'singles'),
        gamesPlayed: getGamesPlayed(p, 'singles'),
        totalPoints: getTotalPoints(p, 'singles'),
      }));

  const doublesLeaderboard = isFiltered
    ? filteredTeamStats.map((t, i) => ({
        id: `filtered-team-${i}`,
        teamName: t.teamName,
        avgPoints: t.avgPoints,
        gamesPlayed: t.gamesPlayed,
        totalPoints: t.totalPoints,
      }))
    : getTeamLeaderboard().map(t => ({
        id: t.id,
        teamName: getTeamName(t),
        avgPoints: getTeamAvgPoints(t),
        gamesPlayed: t.games_played,
        totalPoints: t.total_points,
      }));

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

  const qualificationGames = 18;

  return (
    <div className="space-y-4 md:space-y-6 animate-fade-in-up">
      {/* Page Header */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="section-header text-lg md:text-xl">Leaderboard</h1>
            <p className="text-muted-foreground mt-2 ml-4 md:ml-5 text-sm md:text-base">
              {mode === 'singles' ? 'Individual Rankings by Average Points' : 'Team Rankings by Combined Average'}
            </p>
          </div>

          <div className="flex items-center gap-2 md:gap-3 ml-4 md:ml-0">
            {/* Recalculate Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleRecalculate}
              disabled={isRecalculating}
              className="gap-1 md:gap-2 text-xs md:text-sm"
            >
              <RefreshCw className={cn("w-3 h-3 md:w-4 md:h-4", isRecalculating && "animate-spin")} />
              <span className="hidden sm:inline">Recalculate</span>
            </Button>

            {/* Game Type Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1 md:gap-2 text-xs md:text-sm">
                  <Filter className="w-3 h-3 md:w-4 md:h-4" />
                  <span className="hidden sm:inline">{GAME_TYPE_LABELS[gameTypeFilter]}</span>
                  <span className="sm:hidden">Filter</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {(Object.keys(GAME_TYPE_LABELS) as GameTypeFilter[]).map((type) => (
                  <DropdownMenuCheckboxItem
                    key={type}
                    checked={gameTypeFilter === type}
                    onCheckedChange={() => setGameTypeFilter(type)}
                  >
                    {GAME_TYPE_LABELS[type]}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mode Toggle */}
            <div className="flex items-center bg-muted rounded-lg p-0.5 md:p-1">
              <button
                onClick={() => setMode('singles')}
                className={cn(
                  "flex items-center gap-1 md:gap-2 px-2 md:px-4 py-1.5 md:py-2 rounded-md text-xs md:text-sm font-medium transition-all",
                  mode === 'singles'
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <User className="w-3 h-3 md:w-4 md:h-4" />
                <span className="hidden xs:inline">Singles</span>
              </button>
              <button
                onClick={() => setMode('doubles')}
                className={cn(
                  "flex items-center gap-1 md:gap-2 px-2 md:px-4 py-1.5 md:py-2 rounded-md text-xs md:text-sm font-medium transition-all",
                  mode === 'doubles'
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Users className="w-3 h-3 md:w-4 md:h-4" />
                <span className="hidden xs:inline">Doubles</span>
              </button>
            </div>
          </div>
        </div>
        
        {/* Active Filter Badge */}
        {gameTypeFilter !== 'all' && (
          <div className="flex items-center gap-2 ml-4 md:ml-5">
            <Badge variant="secondary" className="text-xs">
              Filtered: {GAME_TYPE_LABELS[gameTypeFilter]}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setGameTypeFilter('all')}
              className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
            >
              Clear
            </Button>
          </div>
        )}
      </div>

      {mode === 'singles' ? (
        <>
          {/* Singles Desktop Table */}
          <div className="hidden md:block bg-card rounded-md border border-border overflow-hidden shadow-card">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-secondary/40">
                    <th className="px-5 py-4 text-left text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                      Rank
                    </th>
                    <th className="px-5 py-4 text-left text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                      Name
                    </th>
                    <th className="px-5 py-4 text-center text-[11px] font-bold uppercase tracking-widest text-primary">
                      Avg Points
                    </th>
                    <th className="px-5 py-4 text-center text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                      Games Played
                    </th>
                    <th className="px-5 py-4 text-center text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                      Total Points
                    </th>
                    <th className="px-5 py-4 text-center text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {singlesLeaderboard.map((player, index) => {
                    const qualifies = player.gamesPlayed >= qualificationGames;
                    
                    return (
                      <tr
                        key={player.id}
                        onClick={() => onPlayerSelect?.(player.name)}
                        className={cn(
                          "hover:bg-muted/40 transition-all duration-200 cursor-pointer group",
                          index === 0 && "bg-gold/[0.04] hover:bg-gold/[0.08]",
                          index === 1 && "bg-silver/[0.03] hover:bg-silver/[0.06]",
                          index === 2 && "bg-bronze/[0.03] hover:bg-bronze/[0.06]"
                        )}
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2.5">
                            <span className={cn(
                              "font-display font-bold text-lg w-6",
                              index === 0 && "text-gold",
                              index === 1 && "text-silver",
                              index === 2 && "text-bronze",
                              index > 2 && "text-foreground"
                            )}>
                              {index + 1}
                            </span>
                            {getRankIcon(index + 1)}
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <PlayerPointsBreakdown playerName={player.name}>
                            <div className="flex items-center gap-3 cursor-help">
                              <div className={cn(
                                "w-10 h-10 rounded-full flex items-center justify-center font-display font-bold text-sm transition-transform duration-200 group-hover:scale-105",
                                index === 0
                                  ? "bg-gold/20 text-gold ring-1 ring-gold/30"
                                  : index === 1
                                  ? "bg-silver/15 text-silver ring-1 ring-silver/20"
                                  : index === 2
                                  ? "bg-bronze/15 text-bronze ring-1 ring-bronze/20"
                                  : "bg-muted text-foreground"
                              )}>
                                {player.name[0]}
                              </div>
                              <span className="font-medium text-foreground group-hover:text-primary transition-colors duration-200 underline decoration-dotted decoration-muted-foreground/50 underline-offset-2">
                                {player.name}
                              </span>
                            </div>
                          </PlayerPointsBreakdown>
                        </td>
                        <td className="px-5 py-4 text-center">
                          <span className="inline-flex items-center justify-center px-3 py-1.5 rounded-md text-sm font-bold bg-primary/15 text-primary ring-1 ring-primary/20">
                            {player.avgPoints.toFixed(2)}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-center font-semibold text-foreground tabular-nums">
                          {player.gamesPlayed}
                        </td>
                        <td className="px-5 py-4 text-center font-medium text-muted-foreground tabular-nums">
                          {player.totalPoints.toFixed(1)}
                        </td>
                        <td className="px-4 py-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            {qualifies ? (
                              <Badge variant="default" className="bg-secondary text-secondary-foreground">
                                <Star className="w-3 h-3 mr-1" />
                                Qualified
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-muted-foreground">
                                {qualificationGames - player.gamesPlayed} games to qualify
                              </Badge>
                            )}
                            <ChevronRight className="w-4 h-4 text-muted-foreground" />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Singles Mobile Table - Horizontally Scrollable with Sticky Name Column */}
          <div className="md:hidden bg-background rounded-md border border-border overflow-hidden shadow-card">
            <div className="overflow-x-auto scrollbar-visible bg-background">
              <table className="w-full min-w-[500px]">
                <thead>
                  <tr className="border-b border-border bg-secondary/80">
                    <th className="sticky left-0 z-10 bg-secondary/80 px-3 py-2.5 text-left text-[10px] font-bold uppercase tracking-widest text-muted-foreground min-w-[140px]">
                      Player
                    </th>
                    <th className="px-3 py-2.5 text-center text-[10px] font-bold uppercase tracking-widest text-primary whitespace-nowrap">
                      Avg Pts
                    </th>
                    <th className="px-3 py-2.5 text-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground whitespace-nowrap">
                      GP
                    </th>
                    <th className="px-3 py-2.5 text-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground whitespace-nowrap">
                      Total
                    </th>
                    <th className="px-3 py-2.5 text-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground whitespace-nowrap">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/70">
                  {singlesLeaderboard.map((player, index) => {
                    const qualifies = player.gamesPlayed >= qualificationGames;
                    
                    return (
                      <tr
                        key={player.id}
                        onClick={() => onPlayerSelect?.(player.name)}
                        className={cn(
                          "transition-all duration-200 cursor-pointer",
                          index === 0 && "bg-gold/[0.04]",
                          index === 1 && "bg-silver/[0.03]",
                          index === 2 && "bg-bronze/[0.03]"
                        )}
                      >
                        {/* Sticky Player Column */}
                        <td className={cn(
                          "sticky left-0 z-10 px-3 py-3 bg-background",
                          index === 0 && "bg-[hsl(216_100%_7%)]",
                          index === 1 && "bg-[hsl(216_100%_7%)]",
                          index === 2 && "bg-[hsl(216_100%_7%)]"
                        )}>
                          <div className="flex items-center gap-2">
                            <span className={cn(
                              "font-display font-bold text-sm w-5",
                              index === 0 && "text-gold",
                              index === 1 && "text-silver",
                              index === 2 && "text-bronze",
                              index > 2 && "text-foreground"
                            )}>
                              {index + 1}
                            </span>
                            <div className={cn(
                              "w-7 h-7 rounded-full flex items-center justify-center font-display font-bold text-xs shrink-0",
                              index === 0
                                ? "bg-gold/20 text-gold ring-1 ring-gold/30"
                                : index === 1
                                ? "bg-silver/15 text-silver ring-1 ring-silver/20"
                                : index === 2
                                ? "bg-bronze/15 text-bronze ring-1 ring-bronze/20"
                                : "bg-muted text-foreground"
                            )}>
                              {player.name[0]}
                            </div>
                            <span className="font-medium text-foreground text-sm truncate max-w-[80px]">
                              {player.name}
                            </span>
                          </div>
                        </td>
                        {/* Avg Points */}
                        <td className="px-3 py-3 text-center">
                          <span className="inline-flex items-center justify-center px-2 py-0.5 rounded text-xs font-bold bg-primary/15 text-primary">
                            {player.avgPoints.toFixed(2)}
                          </span>
                        </td>
                        {/* Games Played */}
                        <td className="px-3 py-3 text-center font-medium text-foreground text-sm">
                          {player.gamesPlayed}
                        </td>
                        {/* Total Points */}
                        <td className="px-3 py-3 text-center font-medium text-muted-foreground text-sm">
                          {player.totalPoints.toFixed(1)}
                        </td>
                        {/* Status */}
                        <td className="px-3 py-3 text-center">
                          {qualifies ? (
                            <Badge variant="default" className="bg-secondary text-secondary-foreground text-[10px] px-1.5 py-0.5">
                              <Star className="w-2.5 h-2.5 mr-0.5" />
                              OK
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground text-[10px] whitespace-nowrap">
                              {qualificationGames - player.gamesPlayed} left
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </>
      ) : (
        <>
          {/* Doubles Desktop Table */}
          <div className="hidden md:block bg-card rounded border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted">
                    <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Rank
                    </th>
                    <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Team
                    </th>
                    <th className="px-4 py-4 text-center text-xs font-semibold uppercase tracking-wider text-primary">
                      Avg Points
                    </th>
                    <th className="px-4 py-4 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Games Played
                    </th>
                    <th className="px-4 py-4 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Total Points
                    </th>
                    <th className="px-4 py-4 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {doublesLeaderboard.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                        No team data yet. Record a session to see team rankings.
                      </td>
                    </tr>
                  ) : (
                    doublesLeaderboard.map((team, index) => {
                      const qualifies = team.gamesPlayed >= qualificationGames;
                      
                      return (
                        <tr
                          key={team.id}
                          className={cn(
                            "hover:bg-muted/50 transition-colors",
                            index === 0 && "bg-gold/5",
                            index === 1 && "bg-muted/30",
                            index === 2 && "bg-primary/5"
                          )}
                        >
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2">
                              <span className={cn(
                                "font-display font-bold text-lg w-6 text-foreground",
                                index === 0 && "text-gold",
                                index === 1 && "text-foreground",
                                index === 2 && "text-primary"
                              )}>
                                {index + 1}
                              </span>
                              {getRankIcon(index + 1)}
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-3">
                              <div className={cn(
                                "w-10 h-10 rounded-full flex items-center justify-center font-display font-bold text-xs text-foreground",
                                index === 0
                                  ? "bg-gold/20 text-gold"
                                  : index === 1
                                  ? "bg-muted text-foreground"
                                  : index === 2
                                  ? "bg-primary/20 text-primary"
                                  : "bg-muted text-foreground"
                              )}>
                                <Users className="w-5 h-5" />
                              </div>
                              <span className="font-medium text-foreground">
                                {team.teamName}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-center">
                            <span className="inline-flex items-center justify-center px-3 py-1 rounded text-sm font-bold bg-accent text-accent-foreground">
                              {team.avgPoints.toFixed(2)}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-center font-medium text-foreground">
                            {team.gamesPlayed}
                          </td>
                          <td className="px-4 py-4 text-center font-medium text-muted-foreground">
                            {team.totalPoints.toFixed(1)}
                          </td>
                          <td className="px-4 py-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              {qualifies ? (
                                <Badge variant="default" className="bg-secondary text-secondary-foreground">
                                  <Star className="w-3 h-3 mr-1" />
                                  Qualified
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="text-muted-foreground">
                                  {qualificationGames - team.gamesPlayed} games to qualify
                                </Badge>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Doubles Mobile Table - Horizontally Scrollable with Sticky Team Column */}
          <div className="md:hidden bg-background rounded-md border border-border overflow-hidden shadow-card">
            <div className="overflow-x-auto scrollbar-visible bg-background">
              <table className="w-full min-w-[500px]">
                <thead>
                  <tr className="border-b border-border bg-secondary/80">
                    <th className="sticky left-0 z-10 bg-secondary/80 px-3 py-2.5 text-left text-[10px] font-bold uppercase tracking-widest text-muted-foreground min-w-[160px]">
                      Team
                    </th>
                    <th className="px-3 py-2.5 text-center text-[10px] font-bold uppercase tracking-widest text-primary whitespace-nowrap">
                      Avg Pts
                    </th>
                    <th className="px-3 py-2.5 text-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground whitespace-nowrap">
                      GP
                    </th>
                    <th className="px-3 py-2.5 text-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground whitespace-nowrap">
                      Total
                    </th>
                    <th className="px-3 py-2.5 text-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground whitespace-nowrap">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {doublesLeaderboard.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-3 py-6 text-center text-muted-foreground text-sm">
                        No team data yet. Record a session to see team rankings.
                      </td>
                    </tr>
                  ) : (
                    doublesLeaderboard.map((team, index) => {
                      const qualifies = team.gamesPlayed >= qualificationGames;
                      
                      return (
                        <tr
                          key={team.id}
                          className={cn(
                            "transition-colors",
                            index === 0 && "bg-gold/5",
                            index === 1 && "bg-muted/20",
                            index === 2 && "bg-primary/5"
                          )}
                        >
                          {/* Sticky Team Column */}
                          <td className={cn(
                            "sticky left-0 z-10 px-3 py-3 bg-background",
                            index === 0 && "bg-[hsl(216_100%_7%)]",
                            index === 1 && "bg-[hsl(216_100%_7%)]",
                            index === 2 && "bg-[hsl(216_100%_7%)]"
                          )}>
                            <div className="flex items-center gap-2">
                              <span className={cn(
                                "font-display font-bold text-sm w-5",
                                index === 0 && "text-gold",
                                index === 1 && "text-foreground",
                                index === 2 && "text-primary"
                              )}>
                                {index + 1}
                              </span>
                              <div className={cn(
                                "w-7 h-7 rounded-full flex items-center justify-center shrink-0",
                                index === 0
                                  ? "bg-gold/20 text-gold"
                                  : index === 1
                                  ? "bg-muted text-foreground"
                                  : index === 2
                                  ? "bg-primary/20 text-primary"
                                  : "bg-muted text-foreground"
                              )}>
                                <Users className="w-4 h-4" />
                              </div>
                              <span className="font-medium text-foreground text-xs leading-tight truncate max-w-[90px]">
                                {team.teamName}
                              </span>
                            </div>
                          </td>
                          {/* Avg Points */}
                          <td className="px-3 py-3 text-center">
                            <span className="inline-flex items-center justify-center px-2 py-0.5 rounded text-xs font-bold bg-accent text-accent-foreground">
                              {team.avgPoints.toFixed(2)}
                            </span>
                          </td>
                          {/* Games Played */}
                          <td className="px-3 py-3 text-center font-medium text-foreground text-sm">
                            {team.gamesPlayed}
                          </td>
                          {/* Total Points */}
                          <td className="px-3 py-3 text-center font-medium text-muted-foreground text-sm">
                            {team.totalPoints.toFixed(1)}
                          </td>
                          {/* Status */}
                          <td className="px-3 py-3 text-center">
                            {qualifies ? (
                              <Badge variant="default" className="bg-secondary text-secondary-foreground text-[10px] px-1.5 py-0.5">
                                <Star className="w-2.5 h-2.5 mr-0.5" />
                                OK
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground text-[10px] whitespace-nowrap">
                                {qualificationGames - team.gamesPlayed} left
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

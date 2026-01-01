import { useState } from 'react';
import { usePlayers, LeaderboardMode } from '@/hooks/usePlayers';
import { useTeams } from '@/hooks/useTeams';
import { cn } from '@/lib/utils';
import { Trophy, Medal, Award, Star, ChevronDown, ChevronRight, Users, User, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface NewLeaderboardProps {
  onPlayerSelect?: (playerName: string) => void;
}

export function NewLeaderboard({ onPlayerSelect }: NewLeaderboardProps) {
  const { players, loading: playersLoading, getAveragePoints, getGamesPlayed, getTotalPoints, getLeaderboard, recalculateStats } = usePlayers();
  const { teams, loading: teamsLoading, getAveragePoints: getTeamAvgPoints, getTeamLeaderboard, getTeamName } = useTeams();
  const [mode, setMode] = useState<'singles' | 'doubles'>('singles');
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);

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
  
  const loading = playersLoading || teamsLoading;

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const singlesLeaderboard = getLeaderboard('singles');
  const doublesLeaderboard = getTeamLeaderboard();

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-5 h-5 text-gold" />;
      case 2:
        return <Medal className="w-5 h-5 text-muted-foreground" />;
      case 3:
        return <Award className="w-5 h-5 text-primary" />;
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
      </div>

      {mode === 'singles' ? (
        <>
          {/* Singles Desktop Table */}
          <div className="hidden md:block bg-card rounded border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted">
                    <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Rank
                    </th>
                    <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Name
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
                  {singlesLeaderboard.map((player, index) => {
                    const avgPoints = getAveragePoints(player, 'singles');
                    const gamesPlayed = getGamesPlayed(player, 'singles');
                    const totalPoints = getTotalPoints(player, 'singles');
                    const qualifies = gamesPlayed >= qualificationGames;
                    
                    return (
                      <tr
                        key={player.id}
                        onClick={() => onPlayerSelect?.(player.name)}
                        className={cn(
                          "hover:bg-muted/50 transition-colors cursor-pointer",
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
                              "w-10 h-10 rounded-full flex items-center justify-center font-display font-bold text-sm text-foreground",
                              index === 0
                                ? "bg-gold/20 text-gold"
                                : index === 1
                                ? "bg-muted text-foreground"
                                : index === 2
                                ? "bg-primary/20 text-primary"
                                : "bg-muted text-foreground"
                            )}>
                              {player.name[0]}
                            </div>
                            <span className="font-medium text-foreground">
                              {player.name}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span className="inline-flex items-center justify-center px-3 py-1 rounded text-sm font-bold bg-accent text-accent-foreground">
                            {avgPoints.toFixed(2)}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-center font-medium text-foreground">
                          {gamesPlayed}
                        </td>
                        <td className="px-4 py-4 text-center font-medium text-muted-foreground">
                          {totalPoints.toFixed(1)}
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
                                {qualificationGames - gamesPlayed} games to qualify
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

          {/* Singles Mobile List */}
          <div className="md:hidden bg-card rounded border border-border overflow-hidden">
            {/* Mobile Header */}
            <div className="grid grid-cols-12 gap-1 px-3 py-2 bg-muted border-b border-border text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <div className="col-span-1">#</div>
              <div className="col-span-6">Player</div>
              <div className="col-span-3 text-center text-primary">Avg</div>
              <div className="col-span-2 text-center">GP</div>
            </div>
            
            {/* Mobile Rows */}
            <div className="divide-y divide-border">
              {singlesLeaderboard.map((player, index) => {
                const avgPoints = getAveragePoints(player, 'singles');
                const gamesPlayed = getGamesPlayed(player, 'singles');
                const totalPoints = getTotalPoints(player, 'singles');
                const qualifies = gamesPlayed >= qualificationGames;
                const isExpanded = expandedRowId === player.id;
                
                return (
                  <div key={player.id}>
                    <button
                      onClick={() => toggleRowExpansion(player.id)}
                      className={cn(
                        "w-full grid grid-cols-12 gap-1 px-3 py-3 items-center text-left transition-colors hover:bg-muted/50",
                        index === 0 && "bg-gold/5",
                        index === 1 && "bg-muted/20",
                        index === 2 && "bg-primary/5"
                      )}
                    >
                      {/* Rank */}
                      <div className="col-span-1 flex items-center">
                        <span className={cn(
                          "font-display font-bold text-base text-foreground",
                          index === 0 && "text-gold",
                          index === 1 && "text-foreground",
                          index === 2 && "text-primary"
                        )}>
                          {index + 1}
                        </span>
                      </div>
                      
                      {/* Player Name */}
                      <div className="col-span-5 flex items-center gap-2">
                        <div className={cn(
                          "w-7 h-7 rounded-full flex items-center justify-center font-display font-bold text-xs shrink-0",
                          index === 0
                            ? "bg-gold/20 text-gold"
                            : index === 1
                            ? "bg-muted text-foreground"
                            : index === 2
                            ? "bg-primary/20 text-primary"
                            : "bg-muted text-foreground"
                        )}>
                          {player.name[0]}
                        </div>
                        <span className="font-medium text-foreground text-sm truncate">
                          {player.name}
                        </span>
                      </div>
                      
                      {/* Avg Points */}
                      <div className="col-span-3 text-center">
                        <span className="inline-flex items-center justify-center px-2 py-0.5 rounded text-xs font-bold bg-accent text-accent-foreground">
                          {avgPoints.toFixed(2)}
                        </span>
                      </div>
                      
                      {/* Games Played */}
                      <div className="col-span-2 text-center font-medium text-foreground text-sm">
                        {gamesPlayed}
                      </div>
                      
                      {/* Expand Icon */}
                      <div className="col-span-1 flex justify-end">
                        <ChevronDown className={cn(
                          "w-4 h-4 text-muted-foreground transition-transform duration-200",
                          isExpanded && "rotate-180"
                        )} />
                      </div>
                    </button>
                    
                    {/* Expanded Details */}
                    <div className={cn(
                      "overflow-hidden transition-all duration-200 bg-muted/30",
                      isExpanded ? "max-h-32 opacity-100" : "max-h-0 opacity-0"
                    )}>
                      <div className="px-4 py-3 grid grid-cols-3 gap-3 text-xs">
                        <div className="text-center">
                          <div className="text-muted-foreground mb-1">Total Points</div>
                          <div className="font-bold text-foreground text-sm">{totalPoints.toFixed(1)}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-muted-foreground mb-1">Games Played</div>
                          <div className="font-bold text-foreground text-sm">{gamesPlayed}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-muted-foreground mb-1">Status</div>
                          {qualifies ? (
                            <Badge variant="default" className="bg-secondary text-secondary-foreground text-[10px] px-1.5 py-0.5">
                              <Star className="w-2.5 h-2.5 mr-0.5" />
                              Qualified
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground text-[10px]">
                              {qualificationGames - gamesPlayed} to qualify
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="px-4 pb-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onPlayerSelect?.(player.name);
                          }}
                          className="w-full py-2 text-xs font-medium text-primary hover:text-primary/80 transition-colors border border-border rounded bg-background"
                        >
                          View Full Profile
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
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
                      const avgPoints = getTeamAvgPoints(team);
                      const qualifies = team.games_played >= qualificationGames;
                      
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
                                {getTeamName(team)}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-center">
                            <span className="inline-flex items-center justify-center px-3 py-1 rounded text-sm font-bold bg-accent text-accent-foreground">
                              {avgPoints.toFixed(2)}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-center font-medium text-foreground">
                            {team.games_played}
                          </td>
                          <td className="px-4 py-4 text-center font-medium text-muted-foreground">
                            {team.total_points.toFixed(1)}
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
                                  {qualificationGames - team.games_played} games to qualify
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

          {/* Doubles Mobile List */}
          <div className="md:hidden bg-card rounded border border-border overflow-hidden">
            {/* Mobile Header */}
            <div className="grid grid-cols-12 gap-1 px-3 py-2 bg-muted border-b border-border text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <div className="col-span-1">#</div>
              <div className="col-span-6">Team</div>
              <div className="col-span-3 text-center text-primary">Avg</div>
              <div className="col-span-2 text-center">GP</div>
            </div>
            
            {/* Mobile Rows */}
            <div className="divide-y divide-border">
              {doublesLeaderboard.length === 0 ? (
                <div className="px-3 py-6 text-center text-muted-foreground text-sm">
                  No team data yet. Record a session to see team rankings.
                </div>
              ) : (
                doublesLeaderboard.map((team, index) => {
                  const avgPoints = getTeamAvgPoints(team);
                  const qualifies = team.games_played >= qualificationGames;
                  const isExpanded = expandedRowId === team.id;
                  
                  return (
                    <div key={team.id}>
                      <button
                        onClick={() => toggleRowExpansion(team.id)}
                        className={cn(
                          "w-full grid grid-cols-12 gap-1 px-3 py-3 items-center text-left transition-colors hover:bg-muted/50",
                          index === 0 && "bg-gold/5",
                          index === 1 && "bg-muted/20",
                          index === 2 && "bg-primary/5"
                        )}
                      >
                        {/* Rank */}
                        <div className="col-span-1 flex items-center">
                          <span className={cn(
                            "font-display font-bold text-base text-foreground",
                            index === 0 && "text-gold",
                            index === 1 && "text-foreground",
                            index === 2 && "text-primary"
                          )}>
                            {index + 1}
                          </span>
                        </div>
                        
                        {/* Team Name */}
                        <div className="col-span-5 flex items-center gap-2">
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
                          <span className="font-medium text-foreground text-sm truncate">
                            {getTeamName(team)}
                          </span>
                        </div>
                        
                        {/* Avg Points */}
                        <div className="col-span-3 text-center">
                          <span className="inline-flex items-center justify-center px-2 py-0.5 rounded text-xs font-bold bg-accent text-accent-foreground">
                            {avgPoints.toFixed(2)}
                          </span>
                        </div>
                        
                        {/* Games Played */}
                        <div className="col-span-2 text-center font-medium text-foreground text-sm">
                          {team.games_played}
                        </div>
                        
                        {/* Expand Icon */}
                        <div className="col-span-1 flex justify-end">
                          <ChevronDown className={cn(
                            "w-4 h-4 text-muted-foreground transition-transform duration-200",
                            isExpanded && "rotate-180"
                          )} />
                        </div>
                      </button>
                      
                      {/* Expanded Details */}
                      <div className={cn(
                        "overflow-hidden transition-all duration-200 bg-muted/30",
                        isExpanded ? "max-h-24 opacity-100" : "max-h-0 opacity-0"
                      )}>
                        <div className="px-4 py-3 grid grid-cols-3 gap-3 text-xs">
                          <div className="text-center">
                            <div className="text-muted-foreground mb-1">Total Points</div>
                            <div className="font-bold text-foreground text-sm">{team.total_points.toFixed(1)}</div>
                          </div>
                          <div className="text-center">
                            <div className="text-muted-foreground mb-1">Games Played</div>
                            <div className="font-bold text-foreground text-sm">{team.games_played}</div>
                          </div>
                          <div className="text-center">
                            <div className="text-muted-foreground mb-1">Status</div>
                            {qualifies ? (
                              <Badge variant="default" className="bg-secondary text-secondary-foreground text-[10px] px-1.5 py-0.5">
                                <Star className="w-2.5 h-2.5 mr-0.5" />
                                Qualified
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground text-[10px]">
                                {qualificationGames - team.games_played} to qualify
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

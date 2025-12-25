import { useState } from 'react';
import { usePlayers, LeaderboardMode } from '@/hooks/usePlayers';
import { useTeams } from '@/hooks/useTeams';
import { cn } from '@/lib/utils';
import { Trophy, Medal, Award, Star, ChevronRight, Users, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface NewLeaderboardProps {
  onPlayerSelect?: (playerName: string) => void;
}

export function NewLeaderboard({ onPlayerSelect }: NewLeaderboardProps) {
  const { players, loading: playersLoading, getAveragePoints, getGamesPlayed, getTotalPoints, getLeaderboard } = usePlayers();
  const { teams, loading: teamsLoading, getAveragePoints: getTeamAvgPoints, getTeamLeaderboard, getTeamName } = useTeams();
  const [mode, setMode] = useState<'singles' | 'doubles'>('singles');
  
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
    <div className="space-y-6 animate-fade-in-up">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="section-header">Leaderboard</h1>
          <p className="text-muted-foreground mt-2 ml-5">
            {mode === 'singles' ? 'Individual Rankings by Average Points' : 'Team Rankings by Combined Average'}
          </p>
        </div>

        {/* Mode Toggle */}
        <div className="flex items-center bg-muted rounded-lg p-1 ml-5 sm:ml-0">
          <button
            onClick={() => setMode('singles')}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all",
              mode === 'singles'
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <User className="w-4 h-4" />
            <span>Singles</span>
          </button>
          <button
            onClick={() => setMode('doubles')}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all",
              mode === 'doubles'
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Users className="w-4 h-4" />
            <span>Doubles</span>
          </button>
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
                              "font-serif font-bold text-lg w-6",
                              index === 0 && "text-gold",
                              index === 1 && "text-muted-foreground",
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
                              "w-10 h-10 rounded-full flex items-center justify-center font-serif font-bold text-sm",
                              index === 0
                                ? "bg-gold/20 text-gold"
                                : index === 1
                                ? "bg-muted text-muted-foreground"
                                : index === 2
                                ? "bg-primary/20 text-primary"
                                : "bg-muted text-muted-foreground"
                            )}>
                              {player.name[0]}
                            </div>
                            <span className="font-medium text-foreground">
                              {player.name}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span className={cn(
                            "inline-flex items-center justify-center px-3 py-1 rounded text-sm font-bold",
                            avgPoints >= 8 && "bg-secondary/10 text-secondary",
                            avgPoints >= 6 && avgPoints < 8 && "bg-primary/10 text-primary",
                            avgPoints < 6 && "bg-muted text-muted-foreground"
                          )}>
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

          {/* Singles Mobile Cards */}
          <div className="md:hidden space-y-3">
            {singlesLeaderboard.map((player, index) => {
              const avgPoints = getAveragePoints(player, 'singles');
              const gamesPlayed = getGamesPlayed(player, 'singles');
              const totalPoints = getTotalPoints(player, 'singles');
              const qualifies = gamesPlayed >= qualificationGames;
              
              return (
                <button
                  key={player.id}
                  onClick={() => onPlayerSelect?.(player.name)}
                  className={cn(
                    "w-full bg-card rounded border border-border p-4 text-left transition-colors hover:bg-muted/50",
                    index === 0 && "border-gold/50 bg-gold/5",
                    index === 1 && "border-muted-foreground/30",
                    index === 2 && "border-primary/50 bg-primary/5"
                  )}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <span className={cn(
                          "font-serif font-bold text-2xl w-8",
                          index === 0 && "text-gold",
                          index === 1 && "text-muted-foreground",
                          index === 2 && "text-primary"
                        )}>
                          {index + 1}
                        </span>
                        {getRankIcon(index + 1)}
                      </div>
                      <div className={cn(
                        "w-12 h-12 rounded-full flex items-center justify-center font-serif font-bold text-lg",
                        index === 0
                          ? "bg-gold/20 text-gold"
                          : index === 1
                          ? "bg-muted text-muted-foreground"
                          : index === 2
                          ? "bg-primary/20 text-primary"
                          : "bg-muted text-muted-foreground"
                      )}>
                        {player.name[0]}
                      </div>
                      <div>
                        <span className="font-medium text-foreground">
                          {player.name}
                        </span>
                        {qualifies && (
                          <div className="flex items-center gap-1 text-xs text-secondary">
                            <Star className="w-3 h-3" />
                            Qualified
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "px-3 py-1 rounded text-sm font-bold",
                        avgPoints >= 8 && "bg-secondary/10 text-secondary",
                        avgPoints >= 6 && avgPoints < 8 && "bg-primary/10 text-primary",
                        avgPoints < 6 && "bg-muted text-muted-foreground"
                      )}>
                        {avgPoints.toFixed(2)}
                      </span>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-center text-sm">
                    <div className="bg-muted rounded p-2">
                      <p className="text-xs text-muted-foreground">Games Played</p>
                      <p className="font-semibold text-foreground">{gamesPlayed}</p>
                    </div>
                    <div className="bg-muted rounded p-2">
                      <p className="text-xs text-muted-foreground">Total Points</p>
                      <p className="font-semibold text-foreground">{totalPoints.toFixed(1)}</p>
                    </div>
                  </div>
                  {!qualifies && (
                    <div className="mt-2 text-center text-xs text-muted-foreground">
                      {qualificationGames - gamesPlayed} more games to qualify for final leaderboard
                    </div>
                  )}
                </button>
              );
            })}
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
                                "font-serif font-bold text-lg w-6",
                                index === 0 && "text-gold",
                                index === 1 && "text-muted-foreground",
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
                                "w-10 h-10 rounded-full flex items-center justify-center font-serif font-bold text-xs",
                                index === 0
                                  ? "bg-gold/20 text-gold"
                                  : index === 1
                                  ? "bg-muted text-muted-foreground"
                                  : index === 2
                                  ? "bg-primary/20 text-primary"
                                  : "bg-muted text-muted-foreground"
                              )}>
                                <Users className="w-5 h-5" />
                              </div>
                              <span className="font-medium text-foreground">
                                {getTeamName(team)}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-center">
                            <span className={cn(
                              "inline-flex items-center justify-center px-3 py-1 rounded text-sm font-bold",
                              avgPoints >= 8 && "bg-secondary/10 text-secondary",
                              avgPoints >= 6 && avgPoints < 8 && "bg-primary/10 text-primary",
                              avgPoints < 6 && "bg-muted text-muted-foreground"
                            )}>
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

          {/* Doubles Mobile Cards */}
          <div className="md:hidden space-y-3">
            {doublesLeaderboard.length === 0 ? (
              <div className="bg-card rounded border border-border p-8 text-center text-muted-foreground">
                No team data yet. Record a session to see team rankings.
              </div>
            ) : (
              doublesLeaderboard.map((team, index) => {
                const avgPoints = getTeamAvgPoints(team);
                const qualifies = team.games_played >= qualificationGames;
                
                return (
                  <div
                    key={team.id}
                    className={cn(
                      "w-full bg-card rounded border border-border p-4 text-left",
                      index === 0 && "border-gold/50 bg-gold/5",
                      index === 1 && "border-muted-foreground/30",
                      index === 2 && "border-primary/50 bg-primary/5"
                    )}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <span className={cn(
                            "font-serif font-bold text-2xl w-8",
                            index === 0 && "text-gold",
                            index === 1 && "text-muted-foreground",
                            index === 2 && "text-primary"
                          )}>
                            {index + 1}
                          </span>
                          {getRankIcon(index + 1)}
                        </div>
                        <div className={cn(
                          "w-12 h-12 rounded-full flex items-center justify-center font-serif font-bold text-lg",
                          index === 0
                            ? "bg-gold/20 text-gold"
                            : index === 1
                            ? "bg-muted text-muted-foreground"
                            : index === 2
                            ? "bg-primary/20 text-primary"
                            : "bg-muted text-muted-foreground"
                        )}>
                          <Users className="w-6 h-6" />
                        </div>
                        <div>
                          <span className="font-medium text-foreground">
                            {getTeamName(team)}
                          </span>
                          {qualifies && (
                            <div className="flex items-center gap-1 text-xs text-secondary">
                              <Star className="w-3 h-3" />
                              Qualified
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "px-3 py-1 rounded text-sm font-bold",
                          avgPoints >= 8 && "bg-secondary/10 text-secondary",
                          avgPoints >= 6 && avgPoints < 8 && "bg-primary/10 text-primary",
                          avgPoints < 6 && "bg-muted text-muted-foreground"
                        )}>
                          {avgPoints.toFixed(2)}
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-center text-sm">
                      <div className="bg-muted rounded p-2">
                        <p className="text-xs text-muted-foreground">Games Played</p>
                        <p className="font-semibold text-foreground">{team.games_played}</p>
                      </div>
                      <div className="bg-muted rounded p-2">
                        <p className="text-xs text-muted-foreground">Total Points</p>
                        <p className="font-semibold text-foreground">{team.total_points.toFixed(1)}</p>
                      </div>
                    </div>
                    {!qualifies && (
                      <div className="mt-2 text-center text-xs text-muted-foreground">
                        {qualificationGames - team.games_played} more games to qualify for final leaderboard
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </>
      )}
    </div>
  );
}

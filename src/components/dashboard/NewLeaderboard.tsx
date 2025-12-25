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
        return <Trophy className="w-5 h-5 text-primary" />;
      case 2:
        return <Medal className="w-5 h-5 text-muted-foreground" />;
      case 3:
        return <Award className="w-5 h-5 text-accent" />;
      default:
        return null;
    }
  };

  const qualificationGames = 18;

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Page Header - ATP Style */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-1 h-12 bg-primary rounded-full" />
          <div>
            <h1 className="font-display text-2xl font-black text-foreground uppercase tracking-tight">
              Leaderboard
            </h1>
            <p className="text-muted-foreground text-sm font-medium">
              {mode === 'singles' ? 'Individual Rankings by Average Points' : 'Team Rankings by Combined Average'}
            </p>
          </div>
        </div>

        {/* Mode Toggle - ATP Style */}
        <div className="flex items-center bg-card border border-border rounded p-1">
          <button
            onClick={() => setMode('singles')}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded text-sm font-bold uppercase tracking-wide transition-all",
              mode === 'singles'
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <User className="w-4 h-4" />
            <span>Singles</span>
          </button>
          <button
            onClick={() => setMode('doubles')}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded text-sm font-bold uppercase tracking-wide transition-all",
              mode === 'doubles'
                ? "bg-primary text-primary-foreground"
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
          {/* Singles Desktop Table - ATP Style */}
          <div className="hidden md:block bg-card rounded border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-secondary/50">
                    <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Rank
                    </th>
                    <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Name
                    </th>
                    <th className="px-4 py-4 text-center text-xs font-bold uppercase tracking-wider text-primary">
                      Avg Points
                    </th>
                    <th className="px-4 py-4 text-center text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Games Played
                    </th>
                    <th className="px-4 py-4 text-center text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Total Points
                    </th>
                    <th className="px-4 py-4 text-center text-xs font-bold uppercase tracking-wider text-muted-foreground">
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
                          "hover:bg-secondary/30 transition-colors cursor-pointer",
                          index === 0 && "bg-primary/10",
                          index === 1 && "bg-secondary/20",
                          index === 2 && "bg-accent/10"
                        )}
                      >
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <span className={cn(
                              "font-display font-black text-lg w-6",
                              index === 0 && "text-primary",
                              index === 1 && "text-muted-foreground",
                              index === 2 && "text-accent"
                            )}>
                              {index + 1}
                            </span>
                            {getRankIcon(index + 1)}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "w-10 h-10 rounded flex items-center justify-center font-display font-bold text-sm",
                              index === 0
                                ? "bg-primary/20 text-primary"
                                : index === 1
                                ? "bg-secondary text-secondary-foreground"
                                : index === 2
                                ? "bg-accent/20 text-accent"
                                : "bg-secondary text-muted-foreground"
                            )}>
                              {player.name[0]}
                            </div>
                            <span className="font-semibold text-foreground">
                              {player.name}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span className={cn(
                            "inline-flex items-center justify-center px-3 py-1 rounded text-sm font-black",
                            avgPoints >= 8 && "bg-primary/20 text-primary",
                            avgPoints >= 6 && avgPoints < 8 && "bg-accent/20 text-accent",
                            avgPoints < 6 && "bg-secondary text-muted-foreground"
                          )}>
                            {avgPoints.toFixed(2)}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-center font-bold text-foreground">
                          {gamesPlayed}
                        </td>
                        <td className="px-4 py-4 text-center font-medium text-muted-foreground">
                          {totalPoints.toFixed(1)}
                        </td>
                        <td className="px-4 py-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            {qualifies ? (
                              <Badge className="bg-primary text-primary-foreground font-bold uppercase">
                                <Star className="w-3 h-3 mr-1" />
                                Qualified
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-muted-foreground font-medium">
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

          {/* Singles Mobile Cards - ATP Style */}
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
                    "w-full bg-card rounded border border-border p-4 text-left transition-colors hover:bg-secondary/30",
                    index === 0 && "border-primary/50 bg-primary/10",
                    index === 1 && "border-muted-foreground/30",
                    index === 2 && "border-accent/50 bg-accent/10"
                  )}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <span className={cn(
                          "font-display font-black text-2xl w-8",
                          index === 0 && "text-primary",
                          index === 1 && "text-muted-foreground",
                          index === 2 && "text-accent"
                        )}>
                          {index + 1}
                        </span>
                        {getRankIcon(index + 1)}
                      </div>
                      <div className={cn(
                        "w-12 h-12 rounded flex items-center justify-center font-display font-bold text-lg",
                        index === 0
                          ? "bg-primary/20 text-primary"
                          : index === 1
                          ? "bg-secondary text-muted-foreground"
                          : index === 2
                          ? "bg-accent/20 text-accent"
                          : "bg-secondary text-muted-foreground"
                      )}>
                        {player.name[0]}
                      </div>
                      <div>
                        <span className="font-bold text-foreground">
                          {player.name}
                        </span>
                        {qualifies && (
                          <div className="flex items-center gap-1 text-xs text-primary font-bold uppercase">
                            <Star className="w-3 h-3" />
                            Qualified
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "px-3 py-1 rounded text-sm font-black",
                        avgPoints >= 8 && "bg-primary/20 text-primary",
                        avgPoints >= 6 && avgPoints < 8 && "bg-accent/20 text-accent",
                        avgPoints < 6 && "bg-secondary text-muted-foreground"
                      )}>
                        {avgPoints.toFixed(2)}
                      </span>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-center text-sm">
                    <div className="bg-secondary/50 rounded p-2">
                      <p className="text-xs text-muted-foreground font-bold uppercase">Games</p>
                      <p className="font-black text-foreground">{gamesPlayed}</p>
                    </div>
                    <div className="bg-secondary/50 rounded p-2">
                      <p className="text-xs text-muted-foreground font-bold uppercase">Total Pts</p>
                      <p className="font-black text-foreground">{totalPoints.toFixed(1)}</p>
                    </div>
                  </div>
                  {!qualifies && (
                    <div className="mt-2 text-center text-xs text-muted-foreground font-medium">
                      {qualificationGames - gamesPlayed} more games to qualify
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </>
      ) : (
        <>
          {/* Doubles Desktop Table - ATP Style */}
          <div className="hidden md:block bg-card rounded border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-secondary/50">
                    <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Rank
                    </th>
                    <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Team
                    </th>
                    <th className="px-4 py-4 text-center text-xs font-bold uppercase tracking-wider text-primary">
                      Avg Points
                    </th>
                    <th className="px-4 py-4 text-center text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Games Played
                    </th>
                    <th className="px-4 py-4 text-center text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Total Points
                    </th>
                    <th className="px-4 py-4 text-center text-xs font-bold uppercase tracking-wider text-muted-foreground">
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
                            "hover:bg-secondary/30 transition-colors",
                            index === 0 && "bg-primary/10",
                            index === 1 && "bg-secondary/20",
                            index === 2 && "bg-accent/10"
                          )}
                        >
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2">
                              <span className={cn(
                                "font-display font-black text-lg w-6",
                                index === 0 && "text-primary",
                                index === 1 && "text-muted-foreground",
                                index === 2 && "text-accent"
                              )}>
                                {index + 1}
                              </span>
                              {getRankIcon(index + 1)}
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-3">
                              <div className={cn(
                                "w-10 h-10 rounded flex items-center justify-center font-display font-bold text-xs",
                                index === 0
                                  ? "bg-primary/20 text-primary"
                                  : index === 1
                                  ? "bg-secondary text-muted-foreground"
                                  : index === 2
                                  ? "bg-accent/20 text-accent"
                                  : "bg-secondary text-muted-foreground"
                              )}>
                                <Users className="w-5 h-5" />
                              </div>
                              <span className="font-semibold text-foreground">
                                {getTeamName(team)}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-center">
                            <span className={cn(
                              "inline-flex items-center justify-center px-3 py-1 rounded text-sm font-black",
                              avgPoints >= 8 && "bg-primary/20 text-primary",
                              avgPoints >= 6 && avgPoints < 8 && "bg-accent/20 text-accent",
                              avgPoints < 6 && "bg-secondary text-muted-foreground"
                            )}>
                              {avgPoints.toFixed(2)}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-center font-bold text-foreground">
                            {team.games_played}
                          </td>
                          <td className="px-4 py-4 text-center font-medium text-muted-foreground">
                            {team.total_points.toFixed(1)}
                          </td>
                          <td className="px-4 py-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              {qualifies ? (
                                <Badge className="bg-primary text-primary-foreground font-bold uppercase">
                                  <Star className="w-3 h-3 mr-1" />
                                  Qualified
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="text-muted-foreground font-medium">
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

          {/* Doubles Mobile Cards - ATP Style */}
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
                      "w-full bg-card rounded border border-border p-4 transition-colors",
                      index === 0 && "border-primary/50 bg-primary/10",
                      index === 1 && "border-muted-foreground/30",
                      index === 2 && "border-accent/50 bg-accent/10"
                    )}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <span className={cn(
                            "font-display font-black text-2xl w-8",
                            index === 0 && "text-primary",
                            index === 1 && "text-muted-foreground",
                            index === 2 && "text-accent"
                          )}>
                            {index + 1}
                          </span>
                          {getRankIcon(index + 1)}
                        </div>
                        <div className={cn(
                          "w-12 h-12 rounded flex items-center justify-center",
                          index === 0
                            ? "bg-primary/20 text-primary"
                            : index === 1
                            ? "bg-secondary text-muted-foreground"
                            : index === 2
                            ? "bg-accent/20 text-accent"
                            : "bg-secondary text-muted-foreground"
                        )}>
                          <Users className="w-6 h-6" />
                        </div>
                        <div>
                          <span className="font-bold text-foreground">
                            {getTeamName(team)}
                          </span>
                          {qualifies && (
                            <div className="flex items-center gap-1 text-xs text-primary font-bold uppercase">
                              <Star className="w-3 h-3" />
                              Qualified
                            </div>
                          )}
                        </div>
                      </div>
                      <span className={cn(
                        "px-3 py-1 rounded text-sm font-black",
                        avgPoints >= 8 && "bg-primary/20 text-primary",
                        avgPoints >= 6 && avgPoints < 8 && "bg-accent/20 text-accent",
                        avgPoints < 6 && "bg-secondary text-muted-foreground"
                      )}>
                        {avgPoints.toFixed(2)}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-center text-sm">
                      <div className="bg-secondary/50 rounded p-2">
                        <p className="text-xs text-muted-foreground font-bold uppercase">Games</p>
                        <p className="font-black text-foreground">{team.games_played}</p>
                      </div>
                      <div className="bg-secondary/50 rounded p-2">
                        <p className="text-xs text-muted-foreground font-bold uppercase">Total Pts</p>
                        <p className="font-black text-foreground">{team.total_points.toFixed(1)}</p>
                      </div>
                    </div>
                    {!qualifies && (
                      <div className="mt-2 text-center text-xs text-muted-foreground font-medium">
                        {qualificationGames - team.games_played} more games to qualify
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
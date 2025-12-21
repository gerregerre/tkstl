import { usePlayers } from '@/hooks/usePlayers';
import { cn } from '@/lib/utils';
import { Trophy, Medal, Award, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function NewLeaderboard() {
  const { players, loading, getAveragePoints, getLeaderboard } = usePlayers();
  
  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const leaderboard = getLeaderboard();

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

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Page Header */}
      <div>
        <h1 className="section-header">Leaderboard</h1>
        <p className="text-muted-foreground mt-2 ml-5">
          Ranked by Average Points Per Game
        </p>
      </div>

      {/* Desktop Table */}
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
              {leaderboard.map((player, index) => {
                const avgPoints = getAveragePoints(player);
                const qualifies = player.games_played >= 5;
                
                return (
                  <tr
                    key={player.id}
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
                      {player.games_played}
                    </td>
                    <td className="px-4 py-4 text-center font-medium text-muted-foreground">
                      {player.total_points.toFixed(1)}
                    </td>
                    <td className="px-4 py-4 text-center">
                      {qualifies ? (
                        <Badge variant="default" className="bg-secondary text-secondary-foreground">
                          <Star className="w-3 h-3 mr-1" />
                          Qualified
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-muted-foreground">
                          {5 - player.games_played} games to qualify
                        </Badge>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {leaderboard.map((player, index) => {
          const avgPoints = getAveragePoints(player);
          const qualifies = player.games_played >= 5;
          
          return (
            <div
              key={player.id}
              className={cn(
                "bg-card rounded border border-border p-4",
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
                <span className={cn(
                  "px-3 py-1 rounded text-sm font-bold",
                  avgPoints >= 8 && "bg-secondary/10 text-secondary",
                  avgPoints >= 6 && avgPoints < 8 && "bg-primary/10 text-primary",
                  avgPoints < 6 && "bg-muted text-muted-foreground"
                )}>
                  {avgPoints.toFixed(2)}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-center text-sm">
                <div className="bg-muted rounded p-2">
                  <p className="text-xs text-muted-foreground">Games Played</p>
                  <p className="font-semibold text-foreground">{player.games_played}</p>
                </div>
                <div className="bg-muted rounded p-2">
                  <p className="text-xs text-muted-foreground">Total Points</p>
                  <p className="font-semibold text-foreground">{player.total_points.toFixed(1)}</p>
                </div>
              </div>
              {!qualifies && (
                <div className="mt-2 text-center text-xs text-muted-foreground">
                  {5 - player.games_played} more games to qualify for final leaderboard
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="bg-muted rounded p-4 border border-border">
        <h3 className="font-serif font-semibold text-sm mb-2 uppercase tracking-wide">Scoring System</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-muted-foreground">
          <div>
            <strong>Games 1 & 2:</strong> Winners get 10 pts, Losers get (Score/9)×10 pts
          </div>
          <div>
            <strong>Game 3 (Ladder):</strong> Winners get 10 pts, Losers get 5 pts
          </div>
        </div>
        <div className="mt-2 pt-2 border-t border-border text-sm text-muted-foreground">
          <strong>Qualification:</strong> Players need minimum 5 games to qualify for the final leaderboard
        </div>
      </div>
    </div>
  );
}

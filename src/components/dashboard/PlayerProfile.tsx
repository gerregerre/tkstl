import { useState, useEffect } from 'react';
import { usePlayers, Player } from '@/hooks/usePlayers';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Trophy, 
  Target, 
  TrendingUp, 
  TrendingDown,
  Minus,
  Calendar,
  Star,
  Award
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface SessionGame {
  id: string;
  session_date: string;
  game_number: number;
  team_a_player1: string;
  team_a_player2: string;
  team_b_player1: string;
  team_b_player2: string;
  team_a_score: number | null;
  team_b_score: number | null;
  winner: string | null;
}

interface PlayerProfileProps {
  playerName: string;
  onBack: () => void;
}

// Calculate points earned in a game
function calculateGamePoints(game: SessionGame, playerName: string): number {
  const isTeamA = game.team_a_player1 === playerName || game.team_a_player2 === playerName;
  
  if (game.game_number === 3) {
    // Game 3: Win/Loss only
    const teamAWon = game.winner === 'A';
    if (isTeamA) {
      return teamAWon ? 10 : 5;
    } else {
      return teamAWon ? 5 : 10;
    }
  } else {
    // Games 1 & 2: Score-based
    const teamAScore = game.team_a_score || 0;
    const teamBScore = game.team_b_score || 0;
    const teamAWon = teamAScore > teamBScore;
    
    if (isTeamA) {
      return teamAWon ? 10 : (teamAScore / 9) * 10;
    } else {
      return teamAWon ? (teamBScore / 9) * 10 : 10;
    }
  }
}

export function PlayerProfile({ playerName, onBack }: PlayerProfileProps) {
  const { players, getAveragePoints } = usePlayers();
  const [games, setGames] = useState<SessionGame[]>([]);
  const [loading, setLoading] = useState(true);

  const player = players.find(p => p.name === playerName);

  useEffect(() => {
    const fetchGames = async () => {
      const { data, error } = await supabase
        .from('session_games')
        .select('*')
        .or(`team_a_player1.eq.${playerName},team_a_player2.eq.${playerName},team_b_player1.eq.${playerName},team_b_player2.eq.${playerName}`)
        .order('session_date', { ascending: true });

      if (error) {
        console.error('Error fetching games:', error);
      } else {
        setGames(data || []);
      }
      setLoading(false);
    };

    fetchGames();
  }, [playerName]);

  if (!player) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Player not found</p>
        <Button onClick={onBack} variant="outline" className="mt-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
      </div>
    );
  }

  const avgPoints = getAveragePoints(player);
  const qualifies = player.games_played >= 18;

  // Calculate performance trend data
  let cumulativePoints = 0;
  let cumulativeGames = 0;
  const trendData = games.map((game, index) => {
    const points = calculateGamePoints(game, playerName);
    cumulativePoints += points;
    cumulativeGames += 1;
    return {
      game: cumulativeGames,
      points: points,
      avgPoints: cumulativePoints / cumulativeGames,
      date: new Date(game.session_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    };
  });

  // Calculate win rate
  const wins = games.filter(game => {
    const isTeamA = game.team_a_player1 === playerName || game.team_a_player2 === playerName;
    if (game.game_number === 3) {
      return isTeamA ? game.winner === 'A' : game.winner === 'B';
    }
    const teamAScore = game.team_a_score || 0;
    const teamBScore = game.team_b_score || 0;
    return isTeamA ? teamAScore > teamBScore : teamBScore > teamAScore;
  }).length;

  const winRate = games.length > 0 ? (wins / games.length) * 100 : 0;

  // Recent form (last 5 games)
  const recentGames = games.slice(-5);
  const recentPoints = recentGames.map(g => calculateGamePoints(g, playerName));
  const recentAvg = recentPoints.length > 0 
    ? recentPoints.reduce((a, b) => a + b, 0) / recentPoints.length 
    : 0;

  // Trend indicator
  const getTrend = () => {
    if (games.length < 3) return 'neutral';
    const lastThree = games.slice(-3).map(g => calculateGamePoints(g, playerName));
    const firstHalf = games.slice(0, Math.floor(games.length / 2)).map(g => calculateGamePoints(g, playerName));
    const avgLast = lastThree.reduce((a, b) => a + b, 0) / lastThree.length;
    const avgFirst = firstHalf.length > 0 ? firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length : avgLast;
    if (avgLast > avgFirst + 0.5) return 'up';
    if (avgLast < avgFirst - 0.5) return 'down';
    return 'neutral';
  };

  const trend = getTrend();

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button onClick={onBack} variant="atp-outline" size="sm">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="section-header">{playerName}</h1>
          <p className="text-muted-foreground ml-5">Player Profile & Statistics</p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card rounded border border-border p-4 shadow-card hover:border-primary/30 transition-colors">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Target className="w-4 h-4 text-primary" />
            <span className="text-xs uppercase tracking-wide font-medium">Avg Points</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={cn(
              "text-3xl font-bold font-display",
              avgPoints >= 8 && "text-secondary",
              avgPoints >= 6 && avgPoints < 8 && "text-primary",
              avgPoints < 6 && "text-muted-foreground"
            )}>
              {avgPoints.toFixed(2)}
            </span>
            {trend === 'up' && <TrendingUp className="w-5 h-5 text-secondary" />}
            {trend === 'down' && <TrendingDown className="w-5 h-5 text-destructive" />}
            {trend === 'neutral' && <Minus className="w-5 h-5 text-muted-foreground" />}
          </div>
        </div>

        <div className="bg-card rounded border border-border p-4 shadow-card hover:border-primary/30 transition-colors">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Calendar className="w-4 h-4 text-primary" />
            <span className="text-xs uppercase tracking-wide font-medium">Games Played</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-3xl font-bold font-display text-foreground">
              {player.games_played}
            </span>
            {qualifies && <Star className="w-5 h-5 text-secondary" />}
          </div>
        </div>

        <div className="bg-card rounded border border-border p-4 shadow-card hover:border-primary/30 transition-colors">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Trophy className="w-4 h-4 text-primary" />
            <span className="text-xs uppercase tracking-wide font-medium">Win Rate</span>
          </div>
          <span className={cn(
            "text-3xl font-bold font-display",
            winRate >= 60 && "text-secondary",
            winRate >= 40 && winRate < 60 && "text-foreground",
            winRate < 40 && "text-muted-foreground"
          )}>
            {winRate.toFixed(0)}%
          </span>
        </div>

        <div className="bg-card rounded border border-border p-4 shadow-card hover:border-primary/30 transition-colors">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Award className="w-4 h-4 text-primary" />
            <span className="text-xs uppercase tracking-wide font-medium">Total Points</span>
          </div>
          <span className="text-3xl font-bold font-display text-foreground">
            {player.total_points.toFixed(1)}
          </span>
        </div>
      </div>

      {/* Status Badge */}
      <div className="flex items-center gap-3 flex-wrap">
        {qualifies ? (
          <Badge variant="default" className="bg-secondary text-secondary-foreground">
            <Star className="w-3 h-3 mr-1" />
            Qualified for Final Leaderboard
          </Badge>
        ) : (
          <Badge variant="outline" className="text-muted-foreground border-border">
            {18 - player.games_played} more games to qualify
          </Badge>
        )}
        {recentGames.length > 0 && (
          <Badge variant="outline" className={cn(
            recentAvg >= 8 && "border-secondary text-secondary",
            recentAvg >= 6 && recentAvg < 8 && "border-primary text-primary",
            recentAvg < 6 && "border-muted-foreground text-muted-foreground"
          )}>
            Recent Form: {recentAvg.toFixed(1)} avg
          </Badge>
        )}
      </div>

      {/* Performance Trend Chart */}
      {trendData.length > 0 && (
        <div className="bg-card rounded border border-border p-6 shadow-card">
          <h3 className="font-display text-lg font-semibold mb-4 uppercase tracking-wide">Performance Trend</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="game" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickFormatter={(value) => `G${value}`}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  domain={[0, 10]}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '4px',
                  }}
                  labelFormatter={(value) => `Game ${value}`}
                />
                <Line 
                  type="monotone" 
                  dataKey="points" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2 }}
                  name="Points"
                />
                <Line 
                  type="monotone" 
                  dataKey="avgPoints" 
                  stroke="hsl(var(--secondary))" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                  name="Running Avg"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-center gap-6 mt-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary"></div>
              <span className="text-muted-foreground">Points per Game</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-0.5 bg-secondary" style={{ width: '12px' }}></div>
              <span className="text-muted-foreground">Running Average</span>
            </div>
          </div>
        </div>
      )}

      {/* Game History */}
      <div className="bg-card rounded border border-border shadow-card overflow-hidden">
        <div className="p-4 border-b border-border bg-muted/30">
          <h3 className="font-display text-lg font-semibold uppercase tracking-wide">Game History</h3>
          <p className="text-sm text-muted-foreground">All recorded games</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : games.length === 0 ? (
          <div className="text-center p-8 text-muted-foreground">
            No games recorded yet
          </div>
        ) : (
          <div className="divide-y divide-border">
            {[...games].reverse().map((game) => {
              const isTeamA = game.team_a_player1 === playerName || game.team_a_player2 === playerName;
              const teammate = isTeamA 
                ? (game.team_a_player1 === playerName ? game.team_a_player2 : game.team_a_player1)
                : (game.team_b_player1 === playerName ? game.team_b_player2 : game.team_b_player1);
              const opponents = isTeamA 
                ? [game.team_b_player1, game.team_b_player2]
                : [game.team_a_player1, game.team_a_player2];
              
              let won = false;
              if (game.game_number === 3) {
                won = isTeamA ? game.winner === 'A' : game.winner === 'B';
              } else {
                const teamAScore = game.team_a_score || 0;
                const teamBScore = game.team_b_score || 0;
                won = isTeamA ? teamAScore > teamBScore : teamBScore > teamAScore;
              }

              const points = calculateGamePoints(game, playerName);

              return (
                <div key={game.id} className="p-4 hover:bg-muted/30 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-10 h-10 rounded flex items-center justify-center font-bold text-sm",
                        won ? "bg-secondary/20 text-secondary" : "bg-muted text-muted-foreground"
                      )}>
                        G{game.game_number}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-foreground">
                            {playerName} & {teammate}
                          </span>
                          <span className="text-muted-foreground">vs</span>
                          <span className="text-muted-foreground">
                            {opponents.join(' & ')}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>
                            {new Date(game.session_date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </span>
                          {game.game_number !== 3 && (
                            <>
                              <span>•</span>
                              <span className="font-medium">
                                {isTeamA ? game.team_a_score : game.team_b_score} - {isTeamA ? game.team_b_score : game.team_a_score}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={won ? "default" : "secondary"} className={cn(
                        won ? "bg-secondary text-secondary-foreground" : "bg-muted text-muted-foreground"
                      )}>
                        {won ? 'Won' : 'Lost'}
                      </Badge>
                      <span className={cn(
                        "font-bold text-lg font-display",
                        points >= 8 && "text-secondary",
                        points >= 5 && points < 8 && "text-primary",
                        points < 5 && "text-muted-foreground"
                      )}>
                        +{points.toFixed(1)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

import { useState, useEffect, useMemo } from 'react';
import { usePlayers } from '@/hooks/usePlayers';
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
  Award,
  Zap,
  Swords,
  CalendarDays,
  List,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getPlayerAvatar } from '@/lib/playerAvatars';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
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

function calculateGamePoints(game: SessionGame, playerName: string): number {
  const isTeamA = game.team_a_player1 === playerName || game.team_a_player2 === playerName;
  
  if (game.game_number === 3) {
    const teamAWon = game.winner === 'A';
    if (isTeamA) {
      return teamAWon ? 10 : 5;
    } else {
      return teamAWon ? 5 : 10;
    }
  } else {
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

// Custom tooltip for the chart
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card/95 backdrop-blur-xl border border-primary/20 rounded-lg px-4 py-3 shadow-[0_8px_32px_-4px_hsl(197_100%_47%/0.2)]">
      <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Game {label}</p>
      {payload.map((entry: any, i: number) => (
        <div key={i} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: entry.color }} />
          <span className="text-xs text-muted-foreground">{entry.name}:</span>
          <span className="text-sm font-bold text-foreground">{Number(entry.value).toFixed(2)}</span>
        </div>
      ))}
    </div>
  );
}

// Custom dot with glow effect
function GlowDot(props: any) {
  const { cx, cy, payload, dataKey } = props;
  if (!cx || !cy) return null;
  return (
    <g>
      <circle cx={cx} cy={cy} r={6} fill="hsl(197 100% 47% / 0.15)" />
      <circle cx={cx} cy={cy} r={3.5} fill="hsl(197 100% 47%)" stroke="hsl(197 100% 60%)" strokeWidth={1} />
    </g>
  );
}

export function PlayerProfile({ playerName, onBack }: PlayerProfileProps) {
  const { players, getAveragePoints } = usePlayers();
  const [games, setGames] = useState<SessionGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [historyView, setHistoryView] = useState<'games' | 'sessions'>('sessions');
  const [expandedSessions, setExpandedSessions] = useState<Set<string>>(new Set());

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
  const avatar = getPlayerAvatar(playerName);

  // Trend data
  let cumulativePoints = 0;
  let cumulativeGames = 0;
  const trendData = games.map((game) => {
    const points = calculateGamePoints(game, playerName);
    cumulativePoints += points;
    cumulativeGames += 1;
    return {
      game: cumulativeGames,
      points: parseFloat(points.toFixed(2)),
      avgPoints: parseFloat((cumulativePoints / cumulativeGames).toFixed(2)),
      date: new Date(game.session_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    };
  });

  // Win rate
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

  // Recent form
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

  const metricCards = [
    {
      icon: Target,
      label: 'Avg Points',
      value: avgPoints.toFixed(2),
      trend: trend,
      color: avgPoints >= 8 ? 'text-emerald-400' : avgPoints >= 6 ? 'text-primary' : 'text-muted-foreground',
      iconColor: 'text-primary',
      glowColor: 'shadow-[0_0_20px_-4px_hsl(197_100%_47%/0.3)]',
    },
    {
      icon: Calendar,
      label: 'Games Played',
      value: player.games_played.toString(),
      badge: qualifies ? 'Qualified' : `${18 - player.games_played} to go`,
      color: 'text-foreground',
      iconColor: 'text-amber-400',
      glowColor: 'shadow-[0_0_20px_-4px_hsl(38_92%_50%/0.2)]',
    },
    {
      icon: Trophy,
      label: 'Win Rate',
      value: `${winRate.toFixed(0)}%`,
      color: winRate >= 60 ? 'text-emerald-400' : winRate >= 40 ? 'text-foreground' : 'text-muted-foreground',
      iconColor: 'text-emerald-400',
      glowColor: 'shadow-[0_0_20px_-4px_hsl(160_84%_39%/0.2)]',
    },
    {
      icon: Award,
      label: 'Total Points',
      value: player.total_points.toFixed(1),
      color: 'text-foreground',
      iconColor: 'text-violet-400',
      glowColor: 'shadow-[0_0_20px_-4px_hsl(263_70%_60%/0.2)]',
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Back Button */}
      <Button 
        onClick={onBack} 
        variant="ghost" 
        size="sm" 
        className="text-muted-foreground hover:text-foreground gap-2 -ml-2"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-xs uppercase tracking-widest font-semibold">Back to Rankings</span>
      </Button>

      {/* Hero Header */}
      <div className="relative bg-card border border-border rounded-xl overflow-hidden shadow-card">
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-violet-500/5 pointer-events-none" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
        
        <div className="relative p-6 md:p-8 flex flex-col sm:flex-row items-center gap-6">
          {/* Avatar with neon glow */}
          <div className="relative shrink-0">
            {/* Outer glow rings */}
            <div className="absolute -inset-2 rounded-full bg-gradient-to-br from-primary/20 via-primary/5 to-cyan-400/20 blur-md animate-pulse-subtle" />
            <div className="absolute -inset-1 rounded-full bg-gradient-to-br from-primary/30 to-cyan-300/20 rounded-full" />
            
            {/* Avatar */}
            <div className="relative w-28 h-28 md:w-36 md:h-36 rounded-full player-avatar ring-2 ring-primary/40 shadow-[0_0_30px_-4px_hsl(197_100%_47%/0.4)]">
              {avatar ? (
                <img 
                  src={avatar} 
                  alt={playerName} 
                  className="player-avatar-img w-full h-full" 
                />
              ) : (
                <div className="w-full h-full rounded-full bg-gradient-to-br from-primary/30 to-secondary/20 flex items-center justify-center font-display text-4xl text-primary">
                  {playerName[0]}
                </div>
              )}
            </div>
          </div>

          {/* Player Info */}
          <div className="text-center sm:text-left flex-1">
            <h1 className="font-display text-3xl md:text-4xl text-foreground tracking-tight uppercase">
              {playerName}
            </h1>
            <p className="text-muted-foreground text-sm mt-1 tracking-wide">
              Player Statistics & Performance
            </p>
            
            {/* Status Badges */}
            <div className="flex flex-wrap items-center gap-2 mt-4 justify-center sm:justify-start">
              {qualifies ? (
                <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/20 gap-1.5 px-3 py-1">
                  <Star className="w-3 h-3" />
                  Qualified
                </Badge>
              ) : (
                <Badge variant="outline" className="text-muted-foreground border-border gap-1.5 px-3 py-1">
                  <Zap className="w-3 h-3" />
                  {18 - player.games_played} games to qualify
                </Badge>
              )}
              {recentGames.length > 0 && (
                <Badge variant="outline" className={cn(
                  "gap-1.5 px-3 py-1",
                  recentAvg >= 8 && "border-emerald-500/30 text-emerald-400",
                  recentAvg >= 6 && recentAvg < 8 && "border-primary/30 text-primary",
                  recentAvg < 6 && "border-border text-muted-foreground"
                )}>
                  {trend === 'up' && <TrendingUp className="w-3 h-3" />}
                  {trend === 'down' && <TrendingDown className="w-3 h-3" />}
                  {trend === 'neutral' && <Minus className="w-3 h-3" />}
                  Form: {recentAvg.toFixed(1)}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bento Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {metricCards.map((card, i) => (
          <div 
            key={card.label}
            className={cn(
              "relative group bg-card/80 backdrop-blur-sm border border-border rounded-lg p-4 md:p-5 transition-all duration-300 hover:border-primary/20",
              card.glowColor
            )}
          >
            {/* Top accent line */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/10 to-transparent rounded-t-lg" />
            
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-secondary/50 flex items-center justify-center">
                <card.icon className={cn("w-4 h-4", card.iconColor)} />
              </div>
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
                {card.label}
              </span>
            </div>
            
            <div className="flex items-end gap-2">
              <span className={cn("text-2xl md:text-3xl font-display tracking-tight", card.color)}>
                {card.value}
              </span>
              {card.trend && (
                <span className="mb-1">
                  {card.trend === 'up' && <TrendingUp className="w-4 h-4 text-emerald-400" />}
                  {card.trend === 'down' && <TrendingDown className="w-4 h-4 text-destructive" />}
                  {card.trend === 'neutral' && <Minus className="w-4 h-4 text-muted-foreground" />}
                </span>
              )}
            </div>
            
            {card.badge && (
              <p className={cn(
                "text-[10px] mt-2 uppercase tracking-wider font-semibold",
                qualifies ? "text-emerald-400/70" : "text-muted-foreground/70"
              )}>
                {card.badge}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Performance Trend Chart */}
      {trendData.length > 0 && (
        <div className="relative bg-card border border-border rounded-xl overflow-hidden shadow-card">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
          
          <div className="p-6 md:p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-display text-sm uppercase tracking-widest text-foreground">Performance Trend</h3>
                <p className="text-xs text-muted-foreground mt-1">Points per game with running average</p>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-primary shadow-[0_0_6px_hsl(197_100%_47%/0.5)]" />
                  <span className="text-muted-foreground">Points</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-px bg-amber-400/70" />
                  <span className="text-muted-foreground">Avg</span>
                </div>
              </div>
            </div>
            
            <div className="h-72 md:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="pointsGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(197 100% 47%)" stopOpacity={0.15} />
                      <stop offset="100%" stopColor="hsl(197 100% 47%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid 
                    strokeDasharray="3 3" 
                    stroke="hsl(216 35% 18%)" 
                    vertical={false}
                  />
                  <XAxis 
                    dataKey="game" 
                    stroke="hsl(210 15% 40%)"
                    fontSize={10}
                    tickFormatter={(value) => `${value}`}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    stroke="hsl(210 15% 40%)"
                    fontSize={10}
                    domain={[0, 10]}
                    tickLine={false}
                    axisLine={false}
                    tickCount={6}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="points"
                    stroke="hsl(197 100% 47%)"
                    strokeWidth={2}
                    fill="url(#pointsGradient)"
                    dot={<GlowDot />}
                    activeDot={{ r: 5, fill: 'hsl(197 100% 60%)', stroke: 'hsl(197 100% 47%)', strokeWidth: 2 }}
                    name="Points"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="avgPoints" 
                    stroke="hsl(38 92% 60%)" 
                    strokeWidth={1.5}
                    strokeDasharray="6 4"
                    dot={false}
                    name="Running Avg"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Game History */}
      <div className="relative bg-card border border-border rounded-xl shadow-card overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
        
        <div className="p-5 md:p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display text-sm uppercase tracking-widest text-foreground">Game History</h3>
              <p className="text-xs text-muted-foreground mt-1">{games.length} games recorded</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Swords className="w-3.5 h-3.5" />
              <span>{wins}W / {games.length - wins}L</span>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center p-12">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary/30 border-t-primary"></div>
          </div>
        ) : games.length === 0 ? (
          <div className="text-center p-12 text-muted-foreground text-sm">
            No games recorded yet
          </div>
        ) : (
          <div className="divide-y divide-border/50 max-h-[500px] overflow-y-auto scrollbar-thin">
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
                <div key={game.id} className="px-5 md:px-6 py-4 hover:bg-secondary/20 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-9 h-9 rounded-lg flex items-center justify-center font-display text-xs tracking-wide",
                        won 
                          ? "bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20" 
                          : "bg-secondary/50 text-muted-foreground ring-1 ring-border"
                      )}>
                        G{game.game_number}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-semibold text-foreground">
                            {playerName} & {teammate}
                          </span>
                          <span className="text-muted-foreground/50 text-xs">vs</span>
                          <span className="text-muted-foreground text-sm">
                            {opponents.join(' & ')}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                          <span>
                            {new Date(game.session_date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </span>
                          {game.game_number !== 3 && (
                            <>
                              <span className="text-border">·</span>
                              <span className={cn(won ? "text-emerald-400/70" : "text-muted-foreground")}>
                                {isTeamA ? game.team_a_score : game.team_b_score} - {isTeamA ? game.team_b_score : game.team_a_score}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className={cn(
                        "text-[10px] px-2 py-0.5 font-semibold uppercase tracking-wider",
                        won 
                          ? "border-emerald-500/20 text-emerald-400 bg-emerald-500/5" 
                          : "border-border text-muted-foreground bg-secondary/20"
                      )}>
                        {won ? 'W' : 'L'}
                      </Badge>
                      <span className={cn(
                        "font-display text-base tabular-nums",
                        points >= 8 && "text-emerald-400",
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

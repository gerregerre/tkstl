import { useState, useEffect, useMemo } from 'react';
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
  Award,
  Zap,
  Swords,
  CalendarDays,
  List,
  ChevronDown,
  ChevronRight,
  Users,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getPlayerAvatar } from '@/lib/playerAvatars';
import { computeTeamAchievements } from '@/lib/teamAchievements';
import { AchievementsBadges } from '@/components/dashboard/AchievementsBadges';
import { TeamBestOpponentAnalysis } from '@/components/dashboard/TeamBestOpponentAnalysis';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
  Line,
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

interface TeamProfileProps {
  teamName: string; // "Player1 & Player2"
  onBack: () => void;
}

function isTeamInGame(game: SessionGame, p1: string, p2: string): 'A' | 'B' | null {
  const teamA = [game.team_a_player1, game.team_a_player2].sort().join('|');
  const teamB = [game.team_b_player1, game.team_b_player2].sort().join('|');
  const key = [p1, p2].sort().join('|');
  if (teamA === key) return 'A';
  if (teamB === key) return 'B';
  return null;
}

function didTeamWin(game: SessionGame, side: 'A' | 'B'): boolean {
  if (game.game_number === 3) return game.winner === side;
  const teamAScore = game.team_a_score || 0;
  const teamBScore = game.team_b_score || 0;
  return side === 'A' ? teamAScore > teamBScore : teamBScore > teamAScore;
}

function getTeamPoints(game: SessionGame, side: 'A' | 'B'): number {
  const totalScore = (game.team_a_score || 0) + (game.team_b_score || 0);
  if (totalScore > 0) {
    return side === 'A' ? (game.team_a_score || 0) : (game.team_b_score || 0);
  }
  return didTeamWin(game, side) ? 10 : 5;
}

// Custom tooltip
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

function GlowDot(props: any) {
  const { cx, cy } = props;
  if (!cx || !cy) return null;
  return (
    <g>
      <circle cx={cx} cy={cy} r={6} fill="hsl(197 100% 47% / 0.15)" />
      <circle cx={cx} cy={cy} r={3.5} fill="hsl(197 100% 47%)" stroke="hsl(197 100% 60%)" strokeWidth={1} />
    </g>
  );
}

interface SessionGroup {
  date: string;
  dateFormatted: string;
  games: { game: SessionGame; side: 'A' | 'B' }[];
  totalPoints: number;
  wins: number;
  losses: number;
  avgPoints: number;
}

function groupTeamGamesBySessions(teamGames: { game: SessionGame; side: 'A' | 'B' }[]): SessionGroup[] {
  const map = new Map<string, { game: SessionGame; side: 'A' | 'B' }[]>();
  for (const tg of teamGames) {
    const dateKey = new Date(tg.game.session_date).toISOString().split('T')[0];
    if (!map.has(dateKey)) map.set(dateKey, []);
    map.get(dateKey)!.push(tg);
  }

  const sessions: SessionGroup[] = [];
  for (const [date, items] of map) {
    const points = items.map(({ game, side }) => getTeamPoints(game, side));
    const totalPoints = points.reduce((a, b) => a + b, 0);
    const winsCount = items.filter(({ game, side }) => didTeamWin(game, side)).length;
    sessions.push({
      date,
      dateFormatted: new Date(date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      games: items,
      totalPoints,
      wins: winsCount,
      losses: items.length - winsCount,
      avgPoints: totalPoints / items.length,
    });
  }
  return sessions.sort((a, b) => b.date.localeCompare(a.date));
}

export function TeamProfile({ teamName, onBack }: TeamProfileProps) {
  const [allGames, setAllGames] = useState<SessionGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [historyView, setHistoryView] = useState<'games' | 'sessions'>('sessions');
  const [expandedSessions, setExpandedSessions] = useState<Set<string>>(new Set());
  const [seasonTitles, setSeasonTitles] = useState<string[]>([]);

  const players = teamName.split(' & ').map(s => s.trim());
  const player1 = players[0];
  const player2 = players[1];

  useEffect(() => {
    const fetchGames = async () => {
      const { data, error } = await supabase
        .from('session_games')
        .select('*')
        .not('winner', 'is', null)
        .order('session_date', { ascending: true });

      if (error) {
        console.error('Error fetching games:', error);
      } else {
        setAllGames(data || []);
      }
      setLoading(false);
    };

    const fetchSeasonTitles = async () => {
      const { data } = await supabase
        .from('seasons')
        .select('name, champion_doubles')
        .eq('is_active', false);

      if (data) {
        // Check both orderings of team name
        const sorted = [player1, player2].sort().join(' & ');
        const titles = data
          .filter(s => {
            if (!s.champion_doubles) return false;
            const champSorted = s.champion_doubles.split(' & ').map((n: string) => n.trim()).sort().join(' & ');
            return champSorted === sorted;
          })
          .map(s => s.name);
        setSeasonTitles(titles);
      }
    };

    fetchGames();
    fetchSeasonTitles();
  }, [player1, player2]);

  // Filter to team games
  const teamGames = useMemo(() => {
    const result: { game: SessionGame; side: 'A' | 'B' }[] = [];
    for (const game of allGames) {
      const side = isTeamInGame(game, player1, player2);
      if (side) result.push({ game, side });
    }
    return result;
  }, [allGames, player1, player2]);

  const totalGames = teamGames.length;
  const totalWins = teamGames.filter(({ game, side }) => didTeamWin(game, side)).length;
  const totalPoints = teamGames.reduce((sum, { game, side }) => sum + getTeamPoints(game, side), 0);
  const avgPoints = totalGames > 0 ? totalPoints / totalGames : 0;
  const winRate = totalGames > 0 ? (totalWins / totalGames) * 100 : 0;

  // Trend data
  let cumulativePoints = 0;
  let cumulativeGames = 0;
  const trendData = teamGames.map(({ game, side }) => {
    const points = getTeamPoints(game, side);
    cumulativePoints += points;
    cumulativeGames += 1;
    return {
      game: cumulativeGames,
      points: parseFloat(points.toFixed(2)),
      avgPoints: parseFloat((cumulativePoints / cumulativeGames).toFixed(2)),
    };
  });

  // Recent form
  const recentGames = teamGames.slice(-5);
  const recentPoints = recentGames.map(({ game, side }) => getTeamPoints(game, side));
  const recentAvg = recentPoints.length > 0
    ? recentPoints.reduce((a, b) => a + b, 0) / recentPoints.length
    : 0;

  const getTrend = () => {
    if (teamGames.length < 3) return 'neutral';
    const lastThree = teamGames.slice(-3).map(({ game, side }) => getTeamPoints(game, side));
    const firstHalf = teamGames.slice(0, Math.floor(teamGames.length / 2)).map(({ game, side }) => getTeamPoints(game, side));
    const avgLast = lastThree.reduce((a, b) => a + b, 0) / lastThree.length;
    const avgFirst = firstHalf.length > 0 ? firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length : avgLast;
    if (avgLast > avgFirst + 0.5) return 'up';
    if (avgLast < avgFirst - 0.5) return 'down';
    return 'neutral';
  };
  const trend = getTrend();

  const avatar1 = getPlayerAvatar(player1);
  const avatar2 = getPlayerAvatar(player2);

  const sessions = useMemo(() => groupTeamGamesBySessions(teamGames), [teamGames]);

  const toggleSession = (date: string) => {
    const next = new Set(expandedSessions);
    if (next.has(date)) next.delete(date);
    else next.add(date);
    setExpandedSessions(next);
  };

  const metricCards = [
    {
      icon: Target,
      label: 'Avg Points',
      value: avgPoints.toFixed(2),
      trend,
      color: avgPoints >= 8 ? 'text-emerald-400' : avgPoints >= 6 ? 'text-primary' : 'text-muted-foreground',
      iconColor: 'text-primary',
      glowColor: 'shadow-[0_0_20px_-4px_hsl(197_100%_47%/0.3)]',
    },
    {
      icon: Calendar,
      label: 'Games Together',
      value: totalGames.toString(),
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
      value: totalPoints.toFixed(1),
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
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-violet-500/5 pointer-events-none" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

        <div className="relative p-4 md:p-8 flex flex-col items-center sm:flex-row gap-4 md:gap-6">
          {/* Dual Avatar */}
          <div className="relative shrink-0 flex items-center">
            <div className="absolute -inset-2 rounded-full bg-gradient-to-br from-primary/20 via-primary/5 to-cyan-400/20 blur-md animate-pulse-subtle" />
            <div className="relative w-16 h-16 md:w-28 md:h-28 rounded-full overflow-hidden ring-2 ring-primary/40 shadow-[0_0_30px_-4px_hsl(197_100%_47%/0.4)] z-10">
              {avatar1 ? (
                <img src={avatar1} alt={player1} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary/30 to-secondary/20 flex items-center justify-center font-display text-2xl md:text-3xl text-primary">
                  {player1[0]}
                </div>
              )}
            </div>
            <div className="relative w-16 h-16 md:w-28 md:h-28 rounded-full overflow-hidden ring-2 ring-primary/40 shadow-[0_0_30px_-4px_hsl(197_100%_47%/0.4)] -ml-5 md:-ml-6 z-0">
              {avatar2 ? (
                <img src={avatar2} alt={player2} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary/30 to-secondary/20 flex items-center justify-center font-display text-2xl md:text-3xl text-primary">
                  {player2[0]}
                </div>
              )}
            </div>
          </div>

          {/* Team Info */}
          <div className="text-center sm:text-left flex-1">
            <h1 className="font-display text-xl md:text-3xl text-foreground tracking-tight uppercase">
              {player1} & {player2}
            </h1>
            <p className="text-muted-foreground text-sm mt-1 tracking-wide">
              Doubles Team Statistics & Performance
            </p>

            <div className="flex flex-wrap items-center gap-2 mt-4 justify-center sm:justify-start">
              <Badge variant="outline" className="text-muted-foreground border-border gap-1.5 px-3 py-1">
                <Users className="w-3 h-3" />
                Doubles Pair
              </Badge>
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
              {seasonTitles.map((title, i) => (
                <Badge 
                  key={i} 
                  className="bg-amber-500/15 text-amber-400 border-amber-500/20 gap-1.5 px-3 py-1"
                >
                  <Trophy className="w-3 h-3" />
                  {title} Doubles Champion
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {metricCards.map((card) => (
          <div
            key={card.label}
            className={cn(
              "relative group bg-card/80 backdrop-blur-sm border border-border rounded-lg p-4 md:p-5 transition-all duration-300 hover:border-primary/20",
              card.glowColor
            )}
          >
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
          </div>
        ))}
      </div>

      {/* Team Achievements */}
      {!loading && teamGames.length > 0 && (
        <AchievementsBadges achievements={computeTeamAchievements(allGames, player1, player2)} />
      )}

      {/* Opponent Analysis */}
      {!loading && teamGames.length > 0 && (
        <TeamBestOpponentAnalysis games={allGames} player1={player1} player2={player2} />
      )}

      {/* Performance Trend */}
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
                    <linearGradient id="teamPointsGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(197 100% 47%)" stopOpacity={0.15} />
                      <stop offset="100%" stopColor="hsl(197 100% 47%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(216 35% 18%)" vertical={false} />
                  <XAxis dataKey="game" stroke="hsl(210 15% 40%)" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(210 15% 40%)" fontSize={10} domain={[0, 10]} tickLine={false} axisLine={false} tickCount={6} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="points"
                    stroke="hsl(197 100% 47%)"
                    strokeWidth={2}
                    fill="url(#teamPointsGradient)"
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
              <h3 className="font-display text-sm uppercase tracking-widest text-foreground">
                {historyView === 'sessions' ? 'Session Breakdown' : 'Game History'}
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                {historyView === 'sessions' ? `${sessions.length} sessions` : `${totalGames} games`}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center bg-secondary/30 rounded-lg p-0.5 border border-border/50">
                <button
                  onClick={() => setHistoryView('sessions')}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[10px] uppercase tracking-widest font-semibold transition-all",
                    historyView === 'sessions' ? "bg-primary/15 text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <CalendarDays className="w-3 h-3" />Sessions
                </button>
                <button
                  onClick={() => setHistoryView('games')}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[10px] uppercase tracking-widest font-semibold transition-all",
                    historyView === 'games' ? "bg-primary/15 text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <List className="w-3 h-3" />Games
                </button>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground ml-2">
                <Swords className="w-3.5 h-3.5" />
                <span>{totalWins}W / {totalGames - totalWins}L</span>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center p-12">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary/30 border-t-primary" />
          </div>
        ) : totalGames === 0 ? (
          <div className="text-center p-12 text-muted-foreground text-sm">No games recorded yet</div>
        ) : historyView === 'sessions' ? (
          <div className="divide-y divide-border/50 max-h-[600px] overflow-y-auto scrollbar-thin">
            {sessions.map((session) => {
              const isExpanded = expandedSessions.has(session.date);
              const sessionWinRate = session.games.length > 0 ? (session.wins / session.games.length) * 100 : 0;
              return (
                <div key={session.date}>
                  <button
                    onClick={() => toggleSession(session.date)}
                    className="w-full px-5 md:px-6 py-4 hover:bg-secondary/20 transition-colors text-left"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-9 h-9 rounded-lg flex items-center justify-center transition-colors",
                          sessionWinRate >= 60 ? "bg-emerald-500/10 ring-1 ring-emerald-500/20"
                            : sessionWinRate >= 40 ? "bg-primary/10 ring-1 ring-primary/20"
                            : "bg-secondary/50 ring-1 ring-border"
                        )}>
                          {isExpanded ? <ChevronDown className="w-4 h-4 text-primary" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-foreground text-sm">{session.dateFormatted}</span>
                            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{session.games.length} game{session.games.length !== 1 ? 's' : ''}</span>
                          </div>
                          <div className="flex items-center gap-1 mt-0.5">
                            {session.games.map(({ game, side }, gi) => {
                              const won = didTeamWin(game, side);
                              return (
                                <div key={gi} className={cn("w-5 h-5 rounded text-[9px] font-bold flex items-center justify-center", won ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/10 text-red-400/70")}>
                                  {won ? 'W' : 'L'}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className={cn("font-display text-base tabular-nums", session.avgPoints >= 8 && "text-emerald-400", session.avgPoints >= 5 && session.avgPoints < 8 && "text-primary", session.avgPoints < 5 && "text-muted-foreground")}>
                            {session.avgPoints.toFixed(1)}
                          </div>
                          <div className="text-[10px] text-muted-foreground uppercase tracking-wider">avg</div>
                        </div>
                        <div className="text-right">
                          <div className="font-display text-base tabular-nums text-foreground">{session.totalPoints.toFixed(1)}</div>
                          <div className="text-[10px] text-muted-foreground uppercase tracking-wider">total</div>
                        </div>
                      </div>
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="bg-secondary/10 border-t border-border/30">
                      {session.games.map(({ game, side }) => {
                        const won = didTeamWin(game, side);
                        const points = getTeamPoints(game, side);
                        const opponents = side === 'A'
                          ? `${game.team_b_player1} & ${game.team_b_player2}`
                          : `${game.team_a_player1} & ${game.team_a_player2}`;

                        return (
                          <div key={game.id} className="px-5 md:px-6 pl-12 md:pl-14 py-3 border-t border-border/20">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2.5">
                                <div className={cn("w-7 h-7 rounded flex items-center justify-center font-display text-[10px] tracking-wide", won ? "bg-emerald-500/10 text-emerald-400" : "bg-secondary/50 text-muted-foreground")}>
                                  G{game.game_number}
                                </div>
                                <div>
                                  <div className="flex items-center gap-1.5 text-xs">
                                    <span className="text-muted-foreground/50">vs</span>
                                    <span className="text-muted-foreground">{opponents}</span>
                                  </div>
                                  {game.game_number !== 3 && (
                                    <span className={cn("text-[10px] mt-0.5", won ? "text-emerald-400/60" : "text-muted-foreground/60")}>
                                      Score: {side === 'A' ? game.team_a_score : game.team_b_score} - {side === 'A' ? game.team_b_score : game.team_a_score}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className={cn("text-[9px] px-1.5 py-0 font-semibold uppercase tracking-wider", won ? "border-emerald-500/20 text-emerald-400 bg-emerald-500/5" : "border-border text-muted-foreground bg-secondary/20")}>
                                  {won ? 'W' : 'L'}
                                </Badge>
                                <span className={cn("font-display text-sm tabular-nums", points >= 8 && "text-emerald-400", points >= 5 && points < 8 && "text-primary", points < 5 && "text-muted-foreground")}>
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
              );
            })}
          </div>
        ) : (
          <div className="divide-y divide-border/50 max-h-[500px] overflow-y-auto scrollbar-thin">
            {[...teamGames].reverse().map(({ game, side }) => {
              const won = didTeamWin(game, side);
              const points = getTeamPoints(game, side);
              const opponents = side === 'A'
                ? `${game.team_b_player1} & ${game.team_b_player2}`
                : `${game.team_a_player1} & ${game.team_a_player2}`;

              return (
                <div key={game.id} className="px-5 md:px-6 py-4 hover:bg-secondary/20 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center font-display text-xs tracking-wide", won ? "bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20" : "bg-secondary/50 text-muted-foreground ring-1 ring-border")}>
                        G{game.game_number}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-muted-foreground/50 text-xs">vs</span>
                          <span className="text-muted-foreground text-sm">{opponents}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                          <span>{new Date(game.session_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                          {game.game_number !== 3 && (
                            <>
                              <span className="text-border">·</span>
                              <span className={cn(won ? "text-emerald-400/70" : "text-muted-foreground")}>
                                {side === 'A' ? game.team_a_score : game.team_b_score} - {side === 'A' ? game.team_b_score : game.team_a_score}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className={cn("text-[10px] px-2 py-0.5 font-semibold uppercase tracking-wider", won ? "border-emerald-500/20 text-emerald-400 bg-emerald-500/5" : "border-border text-muted-foreground bg-secondary/20")}>
                        {won ? 'W' : 'L'}
                      </Badge>
                      <span className={cn("font-display text-base tabular-nums", points >= 8 && "text-emerald-400", points >= 5 && points < 8 && "text-primary", points < 5 && "text-muted-foreground")}>
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

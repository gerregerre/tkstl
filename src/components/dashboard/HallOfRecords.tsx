import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { getPlayerAvatar } from '@/lib/playerAvatars';
import {
  Flame,
  Trophy,
  Target,
  Zap,
  Crown,
  Medal,
  Star,
  TrendingUp,
  Calendar,
  Swords,
} from 'lucide-react';

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

interface RecordEntry {
  icon: React.ElementType;
  title: string;
  description: string;
  holder: string;
  value: string;
  accentClass: string;
  iconBgClass: string;
}

function getPlayers(game: SessionGame): string[] {
  return [game.team_a_player1, game.team_a_player2, game.team_b_player1, game.team_b_player2];
}

function isOnTeamA(game: SessionGame, name: string): boolean {
  return game.team_a_player1 === name || game.team_a_player2 === name;
}

function didWin(game: SessionGame, name: string): boolean {
  const teamA = isOnTeamA(game, name);
  if (game.game_number === 3) return teamA ? game.winner === 'A' : game.winner === 'B';
  const sa = game.team_a_score || 0;
  const sb = game.team_b_score || 0;
  return teamA ? sa > sb : sb > sa;
}

function getPoints(game: SessionGame, name: string): number {
  const teamA = isOnTeamA(game, name);
  const total = (game.team_a_score || 0) + (game.team_b_score || 0);
  if (total > 0) return teamA ? (game.team_a_score || 0) : (game.team_b_score || 0);
  return didWin(game, name) ? 10 : 5;
}

function computeRecords(games: SessionGame[]): RecordEntry[] {
  if (games.length === 0) return [];

  const completed = games.filter(g => g.winner !== null);
  const allPlayers = new Set<string>();
  for (const g of completed) getPlayers(g).forEach(p => allPlayers.add(p));

  // --- Longest Win Streak ---
  let bestStreakPlayer = '';
  let bestStreak = 0;
  for (const player of allPlayers) {
    const playerGames = completed
      .filter(g => getPlayers(g).includes(player))
      .sort((a, b) => new Date(a.session_date).getTime() - new Date(b.session_date).getTime());
    let streak = 0;
    for (const g of playerGames) {
      if (didWin(g, player)) {
        streak++;
        if (streak > bestStreak) { bestStreak = streak; bestStreakPlayer = player; }
      } else {
        streak = 0;
      }
    }
  }

  // --- Highest Session Average ---
  let bestSessionAvgPlayer = '';
  let bestSessionAvg = 0;
  let bestSessionAvgDate = '';
  for (const player of allPlayers) {
    const playerGames = completed.filter(g => getPlayers(g).includes(player));
    const sessionMap = new Map<string, SessionGame[]>();
    for (const g of playerGames) {
      const key = new Date(g.session_date).toISOString().split('T')[0];
      if (!sessionMap.has(key)) sessionMap.set(key, []);
      sessionMap.get(key)!.push(g);
    }
    for (const [date, sg] of sessionMap) {
      if (sg.length < 2) continue;
      const avg = sg.reduce((s, g) => s + getPoints(g, player), 0) / sg.length;
      if (avg > bestSessionAvg) {
        bestSessionAvg = avg;
        bestSessionAvgPlayer = player;
        bestSessionAvgDate = date;
      }
    }
  }

  // --- Most Points in a Single Session ---
  let bestSessionTotalPlayer = '';
  let bestSessionTotal = 0;
  for (const player of allPlayers) {
    const playerGames = completed.filter(g => getPlayers(g).includes(player));
    const sessionMap = new Map<string, SessionGame[]>();
    for (const g of playerGames) {
      const key = new Date(g.session_date).toISOString().split('T')[0];
      if (!sessionMap.has(key)) sessionMap.set(key, []);
      sessionMap.get(key)!.push(g);
    }
    for (const [, sg] of sessionMap) {
      const total = sg.reduce((s, g) => s + getPoints(g, player), 0);
      if (total > bestSessionTotal) {
        bestSessionTotal = total;
        bestSessionTotalPlayer = player;
      }
    }
  }

  // --- Most Games Played ---
  let mostGamesPlayer = '';
  let mostGames = 0;
  for (const player of allPlayers) {
    const count = completed.filter(g => getPlayers(g).includes(player)).length;
    if (count > mostGames) { mostGames = count; mostGamesPlayer = player; }
  }

  // --- Most Wins ---
  let mostWinsPlayer = '';
  let mostWins = 0;
  for (const player of allPlayers) {
    const w = completed.filter(g => getPlayers(g).includes(player) && didWin(g, player)).length;
    if (w > mostWins) { mostWins = w; mostWinsPlayer = player; }
  }

  // --- Best Win Rate (min 10 games) ---
  let bestWinRatePlayer = '';
  let bestWinRate = 0;
  let bestWinRateGames = 0;
  for (const player of allPlayers) {
    const pg = completed.filter(g => getPlayers(g).includes(player));
    if (pg.length < 10) continue;
    const wr = pg.filter(g => didWin(g, player)).length / pg.length;
    if (wr > bestWinRate) { bestWinRate = wr; bestWinRatePlayer = player; bestWinRateGames = pg.length; }
  }

  // --- Biggest Blowout (scored games only) ---
  let blowoutHolder = '';
  let blowoutMargin = 0;
  let blowoutScore = '';
  for (const g of completed) {
    if (g.game_number === 3) continue;
    const diff = Math.abs((g.team_a_score || 0) - (g.team_b_score || 0));
    if (diff > blowoutMargin) {
      blowoutMargin = diff;
      const winnerTeam = (g.team_a_score || 0) > (g.team_b_score || 0) ? 'A' : 'B';
      blowoutHolder = winnerTeam === 'A'
        ? `${g.team_a_player1} & ${g.team_a_player2}`
        : `${g.team_b_player1} & ${g.team_b_player2}`;
      blowoutScore = `${Math.max(g.team_a_score || 0, g.team_b_score || 0)}-${Math.min(g.team_a_score || 0, g.team_b_score || 0)}`;
    }
  }

  // --- Most Sessions Attended ---
  let mostSessionsPlayer = '';
  let mostSessions = 0;
  for (const player of allPlayers) {
    const sessions = new Set(
      completed.filter(g => getPlayers(g).includes(player))
        .map(g => new Date(g.session_date).toISOString().split('T')[0])
    );
    if (sessions.size > mostSessions) { mostSessions = sessions.size; mostSessionsPlayer = player; }
  }

  // --- Highest Single Game Score (scored games) ---
  let highScorePlayer = '';
  let highScore = 0;
  for (const g of completed) {
    if (g.game_number === 3) continue;
    if ((g.team_a_score || 0) > highScore) {
      highScore = g.team_a_score || 0;
      highScorePlayer = `${g.team_a_player1} & ${g.team_a_player2}`;
    }
    if ((g.team_b_score || 0) > highScore) {
      highScore = g.team_b_score || 0;
      highScorePlayer = `${g.team_b_player1} & ${g.team_b_player2}`;
    }
  }

  return [
    {
      icon: Flame,
      title: 'Longest Win Streak',
      description: 'Most consecutive games won',
      holder: bestStreakPlayer,
      value: `${bestStreak} games`,
      accentClass: 'text-orange-400',
      iconBgClass: 'bg-orange-500/10',
    },
    {
      icon: Star,
      title: 'Highest Session Average',
      description: 'Best average points in a single session (min 2 games)',
      holder: bestSessionAvgPlayer,
      value: bestSessionAvg.toFixed(2),
      accentClass: 'text-amber-400',
      iconBgClass: 'bg-amber-500/10',
    },
    {
      icon: Zap,
      title: 'Most Points in a Session',
      description: 'Highest total points scored in a single session',
      holder: bestSessionTotalPlayer,
      value: `${bestSessionTotal} pts`,
      accentClass: 'text-primary',
      iconBgClass: 'bg-primary/10',
    },
    {
      icon: Calendar,
      title: 'Most Games Played',
      description: 'All-time most games played',
      holder: mostGamesPlayer,
      value: `${mostGames} games`,
      accentClass: 'text-emerald-400',
      iconBgClass: 'bg-emerald-500/10',
    },
    {
      icon: Trophy,
      title: 'Most Wins',
      description: 'All-time most victories',
      holder: mostWinsPlayer,
      value: `${mostWins} wins`,
      accentClass: 'text-yellow-400',
      iconBgClass: 'bg-yellow-500/10',
    },
    {
      icon: TrendingUp,
      title: 'Best Win Rate',
      description: 'Highest win percentage (min 10 games)',
      holder: bestWinRatePlayer || 'N/A',
      value: bestWinRatePlayer ? `${(bestWinRate * 100).toFixed(1)}% (${bestWinRateGames} GP)` : '—',
      accentClass: 'text-violet-400',
      iconBgClass: 'bg-violet-500/10',
    },
    {
      icon: Target,
      title: 'Biggest Blowout',
      description: 'Largest margin of victory in a scored game',
      holder: blowoutHolder,
      value: blowoutScore,
      accentClass: 'text-red-400',
      iconBgClass: 'bg-red-500/10',
    },
    {
      icon: Medal,
      title: 'Most Sessions Attended',
      description: 'Total unique sessions played',
      holder: mostSessionsPlayer,
      value: `${mostSessions} sessions`,
      accentClass: 'text-cyan-400',
      iconBgClass: 'bg-cyan-500/10',
    },
    {
      icon: Crown,
      title: 'Highest Game Score',
      description: 'Highest score in a single scored game',
      holder: highScorePlayer,
      value: `${highScore} pts`,
      accentClass: 'text-amber-300',
      iconBgClass: 'bg-amber-400/10',
    },
  ];
}

function RecordCard({ record, index }: { record: RecordEntry; index: number }) {
  const Icon = record.icon;
  const avatar = record.holder.includes('&') ? null : getPlayerAvatar(record.holder);

  return (
    <div
      className={cn(
        "group relative bg-card border border-border rounded-xl overflow-hidden shadow-card transition-all duration-300 hover:border-primary/20",
        index === 0 && "md:col-span-2 lg:col-span-2"
      )}
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/15 to-transparent" />
      
      <div className="p-5 md:p-6">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shrink-0", record.iconBgClass)}>
            <Icon className={cn("w-6 h-6", record.accentClass)} />
          </div>

          <div className="flex-1 min-w-0">
            {/* Title */}
            <h3 className="font-display text-sm uppercase tracking-widest text-foreground">
              {record.title}
            </h3>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">
              {record.description}
            </p>

            {/* Record Holder */}
            <div className="flex items-center gap-3 mt-4">
              {avatar ? (
                <div className="w-9 h-9 rounded-full overflow-hidden ring-1 ring-border shrink-0">
                  <img src={avatar} alt={record.holder} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-9 h-9 rounded-full bg-secondary/50 ring-1 ring-border flex items-center justify-center font-display text-xs text-muted-foreground shrink-0">
                  {record.holder[0]}
                </div>
              )}
              <div className="min-w-0">
                <p className="font-semibold text-sm text-foreground truncate">{record.holder}</p>
                <p className={cn("font-display text-lg tabular-nums", record.accentClass)}>
                  {record.value}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function HallOfRecords() {
  const [games, setGames] = useState<SessionGame[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGames = async () => {
      const { data, error } = await supabase
        .from('session_games')
        .select('*')
        .not('winner', 'is', null)
        .order('session_date', { ascending: true });

      if (error) {
        console.error('Error fetching games for records:', error);
      } else {
        setGames(data || []);
      }
      setLoading(false);
    };
    fetchGames();
  }, []);

  const records = useMemo(() => computeRecords(games), [games]);

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="relative bg-card border border-border rounded-xl overflow-hidden shadow-card">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-violet-500/5 pointer-events-none" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-400/30 to-transparent" />
        <div className="relative p-6 md:p-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Crown className="w-8 h-8 text-amber-400" />
          </div>
          <h1 className="font-display text-3xl md:text-4xl text-foreground tracking-tight uppercase">
            Hall of Records
          </h1>
          <p className="text-sm text-muted-foreground mt-2 tracking-wide">
            All-time records & legendary feats
          </p>
        </div>
      </div>

      {/* Records Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary/30 border-t-primary" />
        </div>
      ) : records.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">No records yet — play some games!</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {records.map((record, i) => (
            <RecordCard key={record.title} record={record} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}

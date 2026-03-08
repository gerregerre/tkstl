import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { getPlayerAvatar } from '@/lib/playerAvatars';
import { Swords, Shield } from 'lucide-react';

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

interface OpponentStat {
  name: string; // "Player1 & Player2"
  games: number;
  wins: number;
  winRate: number;
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

function computeOpponentStats(games: SessionGame[], player1: string, player2: string): { easiest: OpponentStat[]; toughest: OpponentStat[] } {
  const opponentMap = new Map<string, { games: number; wins: number }>();

  for (const game of games) {
    if (!game.winner) continue;
    const side = isTeamInGame(game, player1, player2);
    if (!side) continue;

    const won = didTeamWin(game, side);
    const opps = side === 'A'
      ? [game.team_b_player1, game.team_b_player2].sort().join(' & ')
      : [game.team_a_player1, game.team_a_player2].sort().join(' & ');

    if (!opponentMap.has(opps)) opponentMap.set(opps, { games: 0, wins: 0 });
    const os = opponentMap.get(opps)!;
    os.games++;
    if (won) os.wins++;
  }

  const toStats = (map: Map<string, { games: number; wins: number }>): OpponentStat[] =>
    Array.from(map.entries())
      .filter(([, s]) => s.games >= 2)
      .map(([name, s]) => ({ name, games: s.games, wins: s.wins, winRate: (s.wins / s.games) * 100 }));

  const all = toStats(opponentMap);

  return {
    easiest: [...all].sort((a, b) => b.winRate - a.winRate || b.games - a.games),
    toughest: [...all].sort((a, b) => a.winRate - b.winRate || b.games - a.games),
  };
}

function OpponentRow({ stat, type }: { stat: OpponentStat; type: 'easy' | 'tough' }) {
  const players = stat.name.split(' & ');
  const isEasy = type === 'easy';

  return (
    <div className="flex items-center gap-3 py-3">
      <div className="flex -space-x-2 shrink-0">
        {players.map((p) => {
          const avatar = getPlayerAvatar(p.trim());
          return (
            <div key={p} className="relative w-8 h-8 rounded-full overflow-hidden ring-1 ring-border">
              {avatar ? (
                <img src={avatar} alt={p} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-secondary/50 flex items-center justify-center font-display text-xs text-muted-foreground">
                  {p.trim()[0]}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm text-foreground truncate">{stat.name}</p>
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
          {stat.wins}W {stat.games - stat.wins}L · {stat.games} games
        </p>
      </div>
      <div className={cn(
        "font-display text-lg tabular-nums",
        isEasy && stat.winRate >= 60 && "text-emerald-400",
        isEasy && stat.winRate < 60 && "text-foreground",
        !isEasy && stat.winRate <= 40 && "text-red-400",
        !isEasy && stat.winRate > 40 && "text-foreground",
      )}>
        {stat.winRate.toFixed(0)}%
      </div>
    </div>
  );
}

interface TeamBestOpponentAnalysisProps {
  games: SessionGame[];
  player1: string;
  player2: string;
}

export function TeamBestOpponentAnalysis({ games, player1, player2 }: TeamBestOpponentAnalysisProps) {
  const { easiest, toughest } = useMemo(() => computeOpponentStats(games, player1, player2), [games, player1, player2]);

  if (easiest.length === 0 && toughest.length === 0) return null;

  const bestMatchup = easiest[0];
  const worstMatchup = toughest[0];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {/* Easiest Opponent */}
      <div className="relative bg-card border border-border rounded-xl overflow-hidden shadow-card">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />
        <div className="p-5 md:p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <Shield className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-display text-sm uppercase tracking-widest text-foreground">Easiest Matchup</h3>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Highest win rate against</p>
            </div>
          </div>

          {bestMatchup && (
            <div className="mb-3 p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
              <OpponentRow stat={bestMatchup} type="easy" />
            </div>
          )}

          {easiest.length > 1 && (
            <div className="space-y-0 divide-y divide-border/40">
              {easiest.slice(1, 4).map(o => (
                <OpponentRow key={o.name} stat={o} type="easy" />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Toughest Opponent */}
      <div className="relative bg-card border border-border rounded-xl overflow-hidden shadow-card">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-red-500/20 to-transparent" />
        <div className="p-5 md:p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
              <Swords className="w-4 h-4 text-red-400" />
            </div>
            <div>
              <h3 className="font-display text-sm uppercase tracking-widest text-foreground">Toughest Matchup</h3>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Lowest win rate against</p>
            </div>
          </div>

          {worstMatchup && (
            <div className="mb-3 p-3 rounded-lg bg-red-500/5 border border-red-500/10">
              <OpponentRow stat={worstMatchup} type="tough" />
            </div>
          )}

          {toughest.length > 1 && (
            <div className="space-y-0 divide-y divide-border/40">
              {toughest.slice(1, 4).map(o => (
                <OpponentRow key={o.name} stat={o} type="tough" />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

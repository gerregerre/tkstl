import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { getPlayerAvatar } from '@/lib/playerAvatars';
import { Users, Swords, Trophy, TrendingDown } from 'lucide-react';

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

interface PartnerStat {
  name: string;
  games: number;
  wins: number;
  winRate: number;
}

function didWin(game: SessionGame, playerName: string): boolean {
  const isTeamA = game.team_a_player1 === playerName || game.team_a_player2 === playerName;
  if (game.game_number === 3) {
    return isTeamA ? game.winner === 'A' : game.winner === 'B';
  }
  const teamAScore = game.team_a_score || 0;
  const teamBScore = game.team_b_score || 0;
  return isTeamA ? teamAScore > teamBScore : teamBScore > teamAScore;
}

function computePartnerStats(games: SessionGame[], playerName: string): { teammates: PartnerStat[]; opponents: PartnerStat[] } {
  const teammateMap = new Map<string, { games: number; wins: number }>();
  const opponentMap = new Map<string, { games: number; wins: number }>();

  for (const game of games) {
    if (!game.winner) continue;
    const isTeamA = game.team_a_player1 === playerName || game.team_a_player2 === playerName;
    const won = didWin(game, playerName);

    // Teammate
    const mate = isTeamA
      ? (game.team_a_player1 === playerName ? game.team_a_player2 : game.team_a_player1)
      : (game.team_b_player1 === playerName ? game.team_b_player2 : game.team_b_player1);
    
    if (!teammateMap.has(mate)) teammateMap.set(mate, { games: 0, wins: 0 });
    const ts = teammateMap.get(mate)!;
    ts.games++;
    if (won) ts.wins++;

    // Opponents
    const opps = isTeamA
      ? [game.team_b_player1, game.team_b_player2]
      : [game.team_a_player1, game.team_a_player2];
    
    for (const opp of opps) {
      if (!opponentMap.has(opp)) opponentMap.set(opp, { games: 0, wins: 0 });
      const os = opponentMap.get(opp)!;
      os.games++;
      if (won) os.wins++;
    }
  }

  const toStats = (map: Map<string, { games: number; wins: number }>): PartnerStat[] =>
    Array.from(map.entries())
      .filter(([, s]) => s.games >= 2)
      .map(([name, s]) => ({ name, games: s.games, wins: s.wins, winRate: (s.wins / s.games) * 100 }));

  return {
    teammates: toStats(teammateMap).sort((a, b) => b.winRate - a.winRate || b.games - a.games),
    opponents: toStats(opponentMap).sort((a, b) => a.winRate - b.winRate || b.games - a.games),
  };
}

function PlayerRow({ stat, type }: { stat: PartnerStat; type: 'best' | 'worst' }) {
  const avatar = getPlayerAvatar(stat.name);
  const isBest = type === 'best';
  
  return (
    <div className="flex items-center gap-3 py-3">
      <div className="relative w-10 h-10 rounded-full overflow-hidden ring-1 ring-border shrink-0">
        {avatar ? (
          <img src={avatar} alt={stat.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-secondary/50 flex items-center justify-center font-display text-sm text-muted-foreground">
            {stat.name[0]}
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm text-foreground truncate">{stat.name}</p>
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
          {stat.wins}W {stat.games - stat.wins}L · {stat.games} games
        </p>
      </div>
      <div className={cn(
        "font-display text-lg tabular-nums",
        isBest && stat.winRate >= 60 && "text-emerald-400",
        isBest && stat.winRate < 60 && "text-foreground",
        !isBest && stat.winRate <= 40 && "text-red-400",
        !isBest && stat.winRate > 40 && "text-foreground",
      )}>
        {stat.winRate.toFixed(0)}%
      </div>
    </div>
  );
}

interface BestPartnerAnalysisProps {
  games: SessionGame[];
  playerName: string;
}

export function BestPartnerAnalysis({ games, playerName }: BestPartnerAnalysisProps) {
  const { teammates, opponents } = useMemo(() => computePartnerStats(games, playerName), [games, playerName]);

  if (teammates.length === 0 && opponents.length === 0) return null;

  const bestPartner = teammates[0];
  const worstNemesis = opponents[0]; // sorted by lowest win rate

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {/* Best Partner */}
      <div className="relative bg-card border border-border rounded-xl overflow-hidden shadow-card">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />
        <div className="p-5 md:p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <Users className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-display text-sm uppercase tracking-widest text-foreground">Best Partner</h3>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Highest win rate together</p>
            </div>
          </div>
          
          {bestPartner && (
            <div className="mb-3 p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
              <PlayerRow stat={bestPartner} type="best" />
            </div>
          )}

          {teammates.length > 1 && (
            <div className="space-y-0 divide-y divide-border/40">
              {teammates.slice(1, 4).map(t => (
                <PlayerRow key={t.name} stat={t} type="best" />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Worst Nemesis */}
      <div className="relative bg-card border border-border rounded-xl overflow-hidden shadow-card">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-red-500/20 to-transparent" />
        <div className="p-5 md:p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
              <Swords className="w-4 h-4 text-red-400" />
            </div>
            <div>
              <h3 className="font-display text-sm uppercase tracking-widest text-foreground">Toughest Nemesis</h3>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Lowest win rate against</p>
            </div>
          </div>
          
          {worstNemesis && (
            <div className="mb-3 p-3 rounded-lg bg-red-500/5 border border-red-500/10">
              <PlayerRow stat={worstNemesis} type="worst" />
            </div>
          )}

          {opponents.length > 1 && (
            <div className="space-y-0 divide-y divide-border/40">
              {opponents.slice(1, 4).map(o => (
                <PlayerRow key={o.name} stat={o} type="worst" />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

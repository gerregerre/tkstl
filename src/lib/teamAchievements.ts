import { Achievement } from './achievements';

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

function isTeamInGame(game: SessionGame, p1: string, p2: string): 'A' | 'B' | null {
  const teamA = [game.team_a_player1, game.team_a_player2].sort().join('|');
  const teamB = [game.team_b_player1, game.team_b_player2].sort().join('|');
  const key = [p1, p2].sort().join('|');
  if (teamA === key) return 'A';
  if (teamB === key) return 'B';
  return null;
}

function didTeamWin(game: SessionGame, side: 'A' | 'B'): boolean {
  const totalScore = (game.team_a_score || 0) + (game.team_b_score || 0);
  if (totalScore === 0) {
    return game.winner === side;
  }
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

function groupBySession(games: SessionGame[]): Map<string, SessionGame[]> {
  const map = new Map<string, SessionGame[]>();
  for (const g of games) {
    const key = new Date(g.session_date).toISOString().split('T')[0];
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(g);
  }
  return map;
}

export function computeTeamAchievements(allGames: SessionGame[], player1: string, player2: string): Achievement[] {
  // Filter to only games where this team played together
  const teamGames: { game: SessionGame; side: 'A' | 'B' }[] = [];
  for (const game of allGames) {
    if (!game.winner) continue;
    const side = isTeamInGame(game, player1, player2);
    if (side) teamGames.push({ game, side });
  }

  const sorted = teamGames.sort(
    (a, b) => new Date(a.game.session_date).getTime() - new Date(b.game.session_date).getTime()
  );

  const totalGames = sorted.length;
  const totalWins = sorted.filter(({ game, side }) => didTeamWin(game, side)).length;
  const sessions = groupBySession(sorted.map(s => s.game));
  const sessionCount = sessions.size;

  // Win streak
  let maxStreak = 0;
  let currentStreak = 0;
  for (const { game, side } of sorted) {
    if (didTeamWin(game, side)) {
      currentStreak++;
      maxStreak = Math.max(maxStreak, currentStreak);
    } else {
      currentStreak = 0;
    }
  }

  // Perfect sessions
  let perfectSessions = 0;
  for (const [, sessionGames] of sessions) {
    const teamSessionGames = sessionGames
      .map(g => {
        const side = isTeamInGame(g, player1, player2);
        return side ? { game: g, side } : null;
      })
      .filter(Boolean) as { game: SessionGame; side: 'A' | 'B' }[];
    
    if (teamSessionGames.length >= 2 && teamSessionGames.every(({ game, side }) => didTeamWin(game, side))) {
      perfectSessions++;
    }
  }

  // Shutouts (9-0)
  const shutouts = sorted.filter(({ game, side }) => {
    const totalScore = (game.team_a_score || 0) + (game.team_b_score || 0);
    if (totalScore === 0) return false;
    const myScore = side === 'A' ? game.team_a_score : game.team_b_score;
    const theirScore = side === 'A' ? game.team_b_score : game.team_a_score;
    return myScore === 9 && theirScore === 0;
  }).length;

  // Best session avg
  let bestSessionAvg = 0;
  for (const [, sessionGames] of sessions) {
    const pts = sessionGames.map(g => {
      const side = isTeamInGame(g, player1, player2);
      return side ? getTeamPoints(g, side) : 0;
    });
    const avg = pts.reduce((a, b) => a + b, 0) / pts.length;
    bestSessionAvg = Math.max(bestSessionAvg, avg);
  }

  // Opponents faced
  const opponents = new Set<string>();
  for (const { game, side } of sorted) {
    const opps = side === 'A'
      ? [game.team_b_player1, game.team_b_player2]
      : [game.team_a_player1, game.team_a_player2];
    const oppKey = opps.sort().join(' & ');
    opponents.add(oppKey);
  }

  return [
    {
      id: 'team-first-game',
      name: 'First Rally',
      description: 'Play your first game together',
      icon: '🎾',
      tier: 'bronze',
      earned: totalGames >= 1,
      progress: totalGames < 1 ? `${totalGames}/1` : undefined,
    },
    {
      id: 'team-games-5',
      name: 'Regular Duo',
      description: 'Play 5 games together',
      icon: '📋',
      tier: 'bronze',
      earned: totalGames >= 5,
      progress: totalGames < 5 ? `${totalGames}/5` : undefined,
    },
    {
      id: 'team-games-15',
      name: 'Veteran Duo',
      description: 'Play 15 games together',
      icon: '🎖️',
      tier: 'silver',
      earned: totalGames >= 15,
      progress: totalGames < 15 ? `${totalGames}/15` : undefined,
    },
    {
      id: 'team-games-30',
      name: 'Legendary Pair',
      description: 'Play 30 games together',
      icon: '👑',
      tier: 'gold',
      earned: totalGames >= 30,
      progress: totalGames < 30 ? `${totalGames}/30` : undefined,
    },
    {
      id: 'team-first-win',
      name: 'First Blood',
      description: 'Win your first game together',
      icon: '⚡',
      tier: 'bronze',
      earned: totalWins >= 1,
    },
    {
      id: 'team-wins-5',
      name: 'Winning Pair',
      description: 'Win 5 games together',
      icon: '🏅',
      tier: 'bronze',
      earned: totalWins >= 5,
      progress: totalWins < 5 ? `${totalWins}/5` : undefined,
    },
    {
      id: 'team-wins-15',
      name: 'Power Couple',
      description: 'Win 15 games together',
      icon: '🏆',
      tier: 'silver',
      earned: totalWins >= 15,
      progress: totalWins < 15 ? `${totalWins}/15` : undefined,
    },
    {
      id: 'team-streak-3',
      name: 'Hot Streak',
      description: 'Win 3 games in a row together',
      icon: '🔥',
      tier: 'bronze',
      earned: maxStreak >= 3,
      progress: maxStreak < 3 ? `Best: ${maxStreak}/3` : undefined,
    },
    {
      id: 'team-streak-5',
      name: 'On Fire',
      description: 'Win 5 games in a row together',
      icon: '🔥',
      tier: 'silver',
      earned: maxStreak >= 5,
      progress: maxStreak < 5 ? `Best: ${maxStreak}/5` : undefined,
    },
    {
      id: 'team-streak-8',
      name: 'Unstoppable Duo',
      description: 'Win 8 games in a row together',
      icon: '💎',
      tier: 'legendary',
      earned: maxStreak >= 8,
      progress: maxStreak < 8 ? `Best: ${maxStreak}/8` : undefined,
    },
    {
      id: 'team-perfect-session',
      name: 'Flawless Victory',
      description: 'Win every game in a session together',
      icon: '✨',
      tier: 'gold',
      earned: perfectSessions >= 1,
    },
    {
      id: 'team-perfect-3',
      name: 'Perfectionist Duo',
      description: 'Have 3 perfect sessions together',
      icon: '💫',
      tier: 'legendary',
      earned: perfectSessions >= 3,
      progress: perfectSessions < 3 ? `${perfectSessions}/3` : undefined,
    },
    {
      id: 'team-shutout',
      name: 'Shutout',
      description: 'Win a scored game 9-0 together',
      icon: '🚫',
      tier: 'gold',
      earned: shutouts >= 1,
    },
    {
      id: 'team-best-avg-9',
      name: 'Near Perfect',
      description: 'Average 9+ points in a session together',
      icon: '⭐',
      tier: 'silver',
      earned: bestSessionAvg >= 9,
    },
    {
      id: 'team-best-avg-10',
      name: 'Perfect 10',
      description: 'Average 10.0 in a session together',
      icon: '💯',
      tier: 'legendary',
      earned: bestSessionAvg >= 10,
    },
    {
      id: 'team-opponents-3',
      name: 'Rivals',
      description: 'Face 3 different opposing teams',
      icon: '⚔️',
      tier: 'bronze',
      earned: opponents.size >= 3,
      progress: opponents.size < 3 ? `${opponents.size}/3` : undefined,
    },
    {
      id: 'team-sessions-5',
      name: 'Faithful Duo',
      description: 'Play together in 5 different sessions',
      icon: '📅',
      tier: 'silver',
      earned: sessionCount >= 5,
      progress: sessionCount < 5 ? `${sessionCount}/5` : undefined,
    },
  ];
}

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

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string; // emoji
  tier: 'bronze' | 'silver' | 'gold' | 'legendary';
  earned: boolean;
  progress?: string; // e.g. "3/5"
}

function didWin(game: SessionGame, playerName: string): boolean {
  const isTeamA = game.team_a_player1 === playerName || game.team_a_player2 === playerName;
  const totalScore = (game.team_a_score || 0) + (game.team_b_score || 0);
  if (totalScore === 0) {
    return isTeamA ? game.winner === 'A' : game.winner === 'B';
  }
  const teamAScore = game.team_a_score || 0;
  const teamBScore = game.team_b_score || 0;
  return isTeamA ? teamAScore > teamBScore : teamBScore > teamAScore;
}

function getGamePoints(game: SessionGame, playerName: string): number {
  const isTeamA = game.team_a_player1 === playerName || game.team_a_player2 === playerName;
  const totalScore = (game.team_a_score || 0) + (game.team_b_score || 0);
  if (totalScore > 0) {
    return isTeamA ? (game.team_a_score || 0) : (game.team_b_score || 0);
  }
  return didWin(game, playerName) ? 10 : 5;
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

export function computeAchievements(games: SessionGame[], playerName: string): Achievement[] {
  const sorted = [...games].sort(
    (a, b) => new Date(a.session_date).getTime() - new Date(b.session_date).getTime()
  );

  const totalGames = sorted.length;
  const totalWins = sorted.filter(g => didWin(g, playerName)).length;
  const sessions = groupBySession(sorted);
  const sessionCount = sessions.size;

  // --- Win Streak ---
  let maxStreak = 0;
  let currentStreak = 0;
  for (const g of sorted) {
    if (didWin(g, playerName)) {
      currentStreak++;
      maxStreak = Math.max(maxStreak, currentStreak);
    } else {
      currentStreak = 0;
    }
  }

  // --- Perfect Sessions (won every game in a session) ---
  let perfectSessions = 0;
  for (const [, sessionGames] of sessions) {
    if (sessionGames.length >= 2 && sessionGames.every(g => didWin(g, playerName))) {
      perfectSessions++;
    }
  }

  // --- Comeback (lost G1, won G2+G3 or lost first 2 won last) ---
  let comebacks = 0;
  for (const [, sessionGames] of sessions) {
    if (sessionGames.length >= 3) {
      const sortedSession = [...sessionGames].sort((a, b) => a.game_number - b.game_number);
      const results = sortedSession.map(g => didWin(g, playerName));
      // Lost first game(s) but won majority
      if (!results[0] && results.filter(Boolean).length > results.filter(r => !r).length) {
        comebacks++;
      }
    }
  }

  // --- 9-0 Shutout ---
  const shutouts = sorted.filter(g => {
    const totalScore = (g.team_a_score || 0) + (g.team_b_score || 0);
    if (totalScore === 0) return false;
    const isTeamA = g.team_a_player1 === playerName || g.team_a_player2 === playerName;
    const myScore = isTeamA ? g.team_a_score : g.team_b_score;
    const theirScore = isTeamA ? g.team_b_score : g.team_a_score;
    return myScore === 9 && theirScore === 0;
  }).length;

  // --- Best session avg ---
  let bestSessionAvg = 0;
  for (const [, sessionGames] of sessions) {
    const pts = sessionGames.map(g => getGamePoints(g, playerName));
    const avg = pts.reduce((a, b) => a + b, 0) / pts.length;
    bestSessionAvg = Math.max(bestSessionAvg, avg);
  }

  // --- Most games in a session ---
  let maxGamesInSession = 0;
  for (const [, sessionGames] of sessions) {
    maxGamesInSession = Math.max(maxGamesInSession, sessionGames.length);
  }

  // --- Unique teammates ---
  const teammates = new Set<string>();
  for (const g of sorted) {
    const isTeamA = g.team_a_player1 === playerName || g.team_a_player2 === playerName;
    const mate = isTeamA
      ? (g.team_a_player1 === playerName ? g.team_a_player2 : g.team_a_player1)
      : (g.team_b_player1 === playerName ? g.team_b_player2 : g.team_b_player1);
    teammates.add(mate);
  }

  return [
    // Attendance
    {
      id: 'first-game',
      name: 'First Rally',
      description: 'Play your first game',
      icon: '🎾',
      tier: 'bronze',
      earned: totalGames >= 1,
      progress: totalGames >= 1 ? undefined : `${totalGames}/1`,
    },
    {
      id: 'games-10',
      name: 'Regular',
      description: 'Play 10 games',
      icon: '📋',
      tier: 'bronze',
      earned: totalGames >= 10,
      progress: totalGames < 10 ? `${totalGames}/10` : undefined,
    },
    {
      id: 'games-25',
      name: 'Veteran',
      description: 'Play 25 games',
      icon: '🎖️',
      tier: 'silver',
      earned: totalGames >= 25,
      progress: totalGames < 25 ? `${totalGames}/25` : undefined,
    },
    {
      id: 'games-50',
      name: 'Legend',
      description: 'Play 50 games',
      icon: '👑',
      tier: 'gold',
      earned: totalGames >= 50,
      progress: totalGames < 50 ? `${totalGames}/50` : undefined,
    },
    {
      id: 'sessions-5',
      name: 'Faithful',
      description: 'Attend 5 sessions',
      icon: '📅',
      tier: 'bronze',
      earned: sessionCount >= 5,
      progress: sessionCount < 5 ? `${sessionCount}/5` : undefined,
    },
    {
      id: 'sessions-10',
      name: 'Iron Man',
      description: 'Attend 10 sessions',
      icon: '🦾',
      tier: 'silver',
      earned: sessionCount >= 10,
      progress: sessionCount < 10 ? `${sessionCount}/10` : undefined,
    },

    // Winning
    {
      id: 'first-win',
      name: 'First Blood',
      description: 'Win your first game',
      icon: '⚡',
      tier: 'bronze',
      earned: totalWins >= 1,
    },
    {
      id: 'wins-10',
      name: 'Winner',
      description: 'Win 10 games',
      icon: '🏅',
      tier: 'bronze',
      earned: totalWins >= 10,
      progress: totalWins < 10 ? `${totalWins}/10` : undefined,
    },
    {
      id: 'wins-25',
      name: 'Champion',
      description: 'Win 25 games',
      icon: '🏆',
      tier: 'silver',
      earned: totalWins >= 25,
      progress: totalWins < 25 ? `${totalWins}/25` : undefined,
    },
    {
      id: 'streak-3',
      name: 'Hot Streak',
      description: 'Win 3 games in a row',
      icon: '🔥',
      tier: 'bronze',
      earned: maxStreak >= 3,
      progress: maxStreak < 3 ? `Best: ${maxStreak}/3` : undefined,
    },
    {
      id: 'streak-5',
      name: 'On Fire',
      description: 'Win 5 games in a row',
      icon: '🔥',
      tier: 'silver',
      earned: maxStreak >= 5,
      progress: maxStreak < 5 ? `Best: ${maxStreak}/5` : undefined,
    },
    {
      id: 'streak-10',
      name: 'Unstoppable',
      description: 'Win 10 games in a row',
      icon: '💎',
      tier: 'legendary',
      earned: maxStreak >= 10,
      progress: maxStreak < 10 ? `Best: ${maxStreak}/10` : undefined,
    },

    // Special
    {
      id: 'perfect-session',
      name: 'Flawless Victory',
      description: 'Win every game in a session',
      icon: '✨',
      tier: 'gold',
      earned: perfectSessions >= 1,
    },
    {
      id: 'perfect-3',
      name: 'Perfectionist',
      description: 'Have 3 perfect sessions',
      icon: '💫',
      tier: 'legendary',
      earned: perfectSessions >= 3,
      progress: perfectSessions < 3 ? `${perfectSessions}/3` : undefined,
    },
    {
      id: 'comeback',
      name: 'Comeback King',
      description: 'Lose the first game but win the session',
      icon: '👊',
      tier: 'gold',
      earned: comebacks >= 1,
    },
    {
      id: 'shutout',
      name: 'Shutout',
      description: 'Win a scored game 9-0',
      icon: '🚫',
      tier: 'gold',
      earned: shutouts >= 1,
    },
    {
      id: 'best-avg-9',
      name: 'Near Perfect',
      description: 'Average 9+ points in a session',
      icon: '⭐',
      tier: 'silver',
      earned: bestSessionAvg >= 9,
    },
    {
      id: 'best-avg-10',
      name: 'Perfect 10',
      description: 'Average 10.0 in a session',
      icon: '💯',
      tier: 'legendary',
      earned: bestSessionAvg >= 10,
    },

    // Social
    {
      id: 'teammates-3',
      name: 'Team Player',
      description: 'Play with 3 different teammates',
      icon: '🤝',
      tier: 'bronze',
      earned: teammates.size >= 3,
      progress: teammates.size < 3 ? `${teammates.size}/3` : undefined,
    },
    {
      id: 'teammates-5',
      name: 'Social Butterfly',
      description: 'Play with 5 different teammates',
      icon: '🦋',
      tier: 'silver',
      earned: teammates.size >= 5,
      progress: teammates.size < 5 ? `${teammates.size}/5` : undefined,
    },
  ];
}

export const TIER_STYLES = {
  bronze: {
    bg: 'bg-amber-900/20',
    border: 'border-amber-700/30',
    text: 'text-amber-500',
    glow: '',
  },
  silver: {
    bg: 'bg-slate-400/10',
    border: 'border-slate-400/30',
    text: 'text-slate-300',
    glow: '',
  },
  gold: {
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/30',
    text: 'text-yellow-400',
    glow: 'shadow-[0_0_12px_-3px_hsl(45_93%_58%/0.3)]',
  },
  legendary: {
    bg: 'bg-violet-500/10',
    border: 'border-violet-500/30',
    text: 'text-violet-400',
    glow: 'shadow-[0_0_16px_-3px_hsl(263_70%_60%/0.4)]',
  },
};

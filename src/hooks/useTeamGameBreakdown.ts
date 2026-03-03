import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SessionGame {
  id: string;
  game_number: number;
  session_date: string;
  team_a_player1: string;
  team_a_player2: string;
  team_b_player1: string;
  team_b_player2: string;
  team_a_score: number | null;
  team_b_score: number | null;
  winner: string | null;
}

export interface TeamGameBreakdownItem {
  id: string;
  gameNumber: number;
  gameType: string;
  sessionDate: string;
  team: 'A' | 'B';
  opponents: string;
  teamScore: number | null;
  opponentScore: number | null;
  pointsEarned: number;
  won: boolean;
}

const GAME_TYPE_NAMES: Record<number, string> = {
  1: 'PwC Single',
  2: 'Shibuya Crossing',
  3: 'Tug Of War',
};

function calculatePoints(game: SessionGame, team: 'A' | 'B'): number {
  const totalScore = (game.team_a_score || 0) + (game.team_b_score || 0);
  if (totalScore > 0) {
    return team === 'A' ? game.team_a_score || 0 : game.team_b_score || 0;
  } else {
    return game.winner === team ? 10 : 5;
  }
}

export function useTeamGameBreakdown(player1: string | null, player2: string | null) {
  const [breakdown, setBreakdown] = useState<TeamGameBreakdownItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!player1 || !player2) {
      setBreakdown([]);
      return;
    }

    const fetchBreakdown = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from('session_games')
        .select('*')
        .not('winner', 'is', null)
        .order('session_date', { ascending: false });

      if (error) {
        console.error('Error fetching team game breakdown:', error);
        setBreakdown([]);
      } else {
        const [p1, p2] = [player1, player2].sort();
        const items: TeamGameBreakdownItem[] = (data || [])
          .filter((game: SessionGame) => {
            const teamAKey = [game.team_a_player1, game.team_a_player2].sort().join('|');
            const teamBKey = [game.team_b_player1, game.team_b_player2].sort().join('|');
            const targetKey = `${p1}|${p2}`;
            return teamAKey === targetKey || teamBKey === targetKey;
          })
          .map((game: SessionGame) => {
            const teamAKey = [game.team_a_player1, game.team_a_player2].sort().join('|');
            const targetKey = `${p1}|${p2}`;
            const isTeamA = teamAKey === targetKey;
            const team: 'A' | 'B' = isTeamA ? 'A' : 'B';

            const opponents = isTeamA
              ? `${game.team_b_player1} & ${game.team_b_player2}`
              : `${game.team_a_player1} & ${game.team_a_player2}`;

            return {
              id: game.id,
              gameNumber: game.game_number,
              gameType: GAME_TYPE_NAMES[game.game_number] || `Game ${game.game_number}`,
              sessionDate: game.session_date,
              team,
              opponents,
              teamScore: isTeamA ? game.team_a_score : game.team_b_score,
              opponentScore: isTeamA ? game.team_b_score : game.team_a_score,
              pointsEarned: calculatePoints(game, team),
              won: game.winner === team,
            };
          });

        setBreakdown(items);
      }

      setLoading(false);
    };

    fetchBreakdown();
  }, [player1, player2]);

  return { breakdown, loading };
}

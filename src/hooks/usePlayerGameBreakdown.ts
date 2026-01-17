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

export interface GameBreakdownItem {
  id: string;
  gameNumber: number;
  gameType: string;
  sessionDate: string;
  team: 'A' | 'B';
  teammate: string;
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
    // Scored games (PwC & Shibuya): Raw score as points
    const teamScore = team === 'A' ? game.team_a_score || 0 : game.team_b_score || 0;
    return teamScore;
  } else {
    // Tug of War (game 3): Winner gets 10, loser gets 5
    const isWinner = game.winner === team;
    return isWinner ? 10 : 5;
  }
}

export function usePlayerGameBreakdown(playerName: string | null) {
  const [breakdown, setBreakdown] = useState<GameBreakdownItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!playerName) {
      setBreakdown([]);
      return;
    }

    const fetchBreakdown = async () => {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('session_games')
        .select('*')
        .not('winner', 'is', null)
        .or(`team_a_player1.eq.${playerName},team_a_player2.eq.${playerName},team_b_player1.eq.${playerName},team_b_player2.eq.${playerName}`)
        .order('session_date', { ascending: false });

      if (error) {
        console.error('Error fetching game breakdown:', error);
        setBreakdown([]);
      } else {
        const items: GameBreakdownItem[] = (data || []).map((game: SessionGame) => {
          const isTeamA = game.team_a_player1 === playerName || game.team_a_player2 === playerName;
          const team: 'A' | 'B' = isTeamA ? 'A' : 'B';
          
          const teammate = isTeamA
            ? (game.team_a_player1 === playerName ? game.team_a_player2 : game.team_a_player1)
            : (game.team_b_player1 === playerName ? game.team_b_player2 : game.team_b_player1);
          
          const opponents = isTeamA
            ? `${game.team_b_player1} & ${game.team_b_player2}`
            : `${game.team_a_player1} & ${game.team_a_player2}`;

          return {
            id: game.id,
            gameNumber: game.game_number,
            gameType: GAME_TYPE_NAMES[game.game_number] || `Game ${game.game_number}`,
            sessionDate: game.session_date,
            team,
            teammate,
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
  }, [playerName]);

  return { breakdown, loading };
}

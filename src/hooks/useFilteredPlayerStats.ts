import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type GameTypeFilter = 'all' | 'pwc' | 'shibuya' | 'tow';

interface SessionGame {
  id: string;
  game_number: number;
  team_a_player1: string;
  team_a_player2: string;
  team_b_player1: string;
  team_b_player2: string;
  team_a_score: number | null;
  team_b_score: number | null;
  winner: string | null;
}

interface FilteredPlayerStats {
  name: string;
  totalPoints: number;
  gamesPlayed: number;
  avgPoints: number;
  wins: number;
  winPercentage: number;
}

interface FilteredTeamStats {
  teamName: string;
  player1: string;
  player2: string;
  totalPoints: number;
  gamesPlayed: number;
  avgPoints: number;
  wins: number;
  winPercentage: number;
}

const GAME_TYPE_TO_NUMBER: Record<Exclude<GameTypeFilter, 'all'>, number> = {
  pwc: 1,
  shibuya: 2,
  tow: 3,
};

export function useFilteredPlayerStats(filter: GameTypeFilter) {
  const [sessionGames, setSessionGames] = useState<SessionGame[]>([]);
  const [allPlayers, setAllPlayers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch all registered players
  useEffect(() => {
    const fetchAllPlayers = async () => {
      const { data, error } = await supabase
        .from('players')
        .select('name');
      if (!error && data) {
        setAllPlayers(data.map(p => p.name));
      }
    };
    fetchAllPlayers();

    // Subscribe to player changes
    const playersChannel = supabase
      .channel('players-list-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'players' },
        () => fetchAllPlayers()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(playersChannel);
    };
  }, []);

  useEffect(() => {
    const fetchSessionGames = async () => {
      setLoading(true);
      let query = supabase
        .from('session_games')
        .select('*')
        .not('winner', 'is', null);

      // Filter by game type if not 'all'
      if (filter !== 'all') {
        query = query.eq('game_number', GAME_TYPE_TO_NUMBER[filter]);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching session games:', error);
      } else {
        setSessionGames(data || []);
      }
      setLoading(false);
    };

    fetchSessionGames();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('filtered-stats-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'session_games' },
        () => fetchSessionGames()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [filter]);

  const playerStats = useMemo((): FilteredPlayerStats[] => {
    const statsMap = new Map<string, { totalPoints: number; gamesPlayed: number; wins: number }>();

    sessionGames.forEach((game) => {
      const totalScore = (game.team_a_score || 0) + (game.team_b_score || 0);
      let pointsA: number;
      let pointsB: number;
      const teamAWon = game.winner === 'A';
      const teamBWon = game.winner === 'B';

      if (totalScore > 0) {
        // Scored games (games 1 & 2): Raw score as points
        pointsA = game.team_a_score || 0;
        pointsB = game.team_b_score || 0;
      } else {
        // Game 3 (Tug Of War): Winner gets 10, loser gets 5
        if (game.winner === 'A') {
          pointsA = 10;
          pointsB = 5;
        } else {
          pointsA = 5;
          pointsB = 10;
        }
      }

      // Update Team A players
      [game.team_a_player1, game.team_a_player2].forEach((player) => {
        const existing = statsMap.get(player) || { totalPoints: 0, gamesPlayed: 0, wins: 0 };
        statsMap.set(player, {
          totalPoints: existing.totalPoints + pointsA,
          gamesPlayed: existing.gamesPlayed + 1,
          wins: existing.wins + (teamAWon ? 1 : 0),
        });
      });

      // Update Team B players
      [game.team_b_player1, game.team_b_player2].forEach((player) => {
        const existing = statsMap.get(player) || { totalPoints: 0, gamesPlayed: 0, wins: 0 };
        statsMap.set(player, {
          totalPoints: existing.totalPoints + pointsB,
          gamesPlayed: existing.gamesPlayed + 1,
          wins: existing.wins + (teamBWon ? 1 : 0),
        });
      });
    });

    // Add all registered players (including those with no games)
    allPlayers.forEach((playerName) => {
      if (!statsMap.has(playerName)) {
        statsMap.set(playerName, { totalPoints: 0, gamesPlayed: 0, wins: 0 });
      }
    });

    return Array.from(statsMap.entries())
      .map(([name, stats]) => ({
        name,
        totalPoints: stats.totalPoints,
        gamesPlayed: stats.gamesPlayed,
        avgPoints: stats.gamesPlayed > 0 ? stats.totalPoints / stats.gamesPlayed : 0,
        wins: stats.wins,
        winPercentage: stats.gamesPlayed > 0 ? (stats.wins / stats.gamesPlayed) * 100 : 0,
      }))
      .sort((a, b) => {
        // Players with 0 games go to bottom
        if (a.gamesPlayed === 0 && b.gamesPlayed > 0) return 1;
        if (b.gamesPlayed === 0 && a.gamesPlayed > 0) return -1;
        // Both have 0 games: sort alphabetically
        if (a.gamesPlayed === 0 && b.gamesPlayed === 0) return a.name.localeCompare(b.name);
        // Both have games: sort by avgPoints descending
        return b.avgPoints - a.avgPoints;
      });
  }, [sessionGames, allPlayers]);

  const teamStats = useMemo((): FilteredTeamStats[] => {
    const statsMap = new Map<string, { player1: string; player2: string; totalPoints: number; gamesPlayed: number; wins: number }>();

    sessionGames.forEach((game) => {
      const totalScore = (game.team_a_score || 0) + (game.team_b_score || 0);
      let pointsA: number;
      let pointsB: number;
      const teamAWon = game.winner === 'A';
      const teamBWon = game.winner === 'B';

      if (totalScore > 0) {
        // Scored games: Raw score as points
        pointsA = game.team_a_score || 0;
        pointsB = game.team_b_score || 0;
      } else {
        if (game.winner === 'A') {
          pointsA = 10;
          pointsB = 5;
        } else {
          pointsA = 5;
          pointsB = 10;
        }
      }

      // Team A
      const teamAKey = [game.team_a_player1, game.team_a_player2].sort().join(' & ');
      const existingA = statsMap.get(teamAKey) || {
        player1: game.team_a_player1 < game.team_a_player2 ? game.team_a_player1 : game.team_a_player2,
        player2: game.team_a_player1 < game.team_a_player2 ? game.team_a_player2 : game.team_a_player1,
        totalPoints: 0,
        gamesPlayed: 0,
        wins: 0,
      };
      statsMap.set(teamAKey, {
        ...existingA,
        totalPoints: existingA.totalPoints + pointsA,
        gamesPlayed: existingA.gamesPlayed + 1,
        wins: existingA.wins + (teamAWon ? 1 : 0),
      });

      // Team B
      const teamBKey = [game.team_b_player1, game.team_b_player2].sort().join(' & ');
      const existingB = statsMap.get(teamBKey) || {
        player1: game.team_b_player1 < game.team_b_player2 ? game.team_b_player1 : game.team_b_player2,
        player2: game.team_b_player1 < game.team_b_player2 ? game.team_b_player2 : game.team_b_player1,
        totalPoints: 0,
        gamesPlayed: 0,
        wins: 0,
      };
      statsMap.set(teamBKey, {
        ...existingB,
        totalPoints: existingB.totalPoints + pointsB,
        gamesPlayed: existingB.gamesPlayed + 1,
        wins: existingB.wins + (teamBWon ? 1 : 0),
      });
    });

    return Array.from(statsMap.entries())
      .map(([teamName, stats]) => ({
        teamName,
        player1: stats.player1,
        player2: stats.player2,
        totalPoints: stats.totalPoints,
        gamesPlayed: stats.gamesPlayed,
        avgPoints: stats.gamesPlayed > 0 ? stats.totalPoints / stats.gamesPlayed : 0,
        wins: stats.wins,
        winPercentage: stats.gamesPlayed > 0 ? (stats.wins / stats.gamesPlayed) * 100 : 0,
      }))
      .sort((a, b) => b.avgPoints - a.avgPoints);
  }, [sessionGames]);

  return {
    playerStats,
    teamStats,
    loading,
    isFiltered: filter !== 'all',
  };
}

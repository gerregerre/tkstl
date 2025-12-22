import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Player {
  id: string;
  name: string;
  total_points: number;
  games_played: number;
  doubles_points: number;
  doubles_games: number;
  singles_points: number;
  singles_games: number;
  created_at: string;
  updated_at: string;
}

export type LeaderboardMode = 'combined' | 'doubles' | 'singles';

export function usePlayers() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPlayers = async () => {
    const { data, error } = await supabase
      .from('players')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching players:', error);
    } else {
      setPlayers(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPlayers();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('players-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'players' },
        () => fetchPlayers()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const updatePlayerStats = async (playerName: string, pointsToAdd: number) => {
    const player = players.find(p => p.name === playerName);
    if (!player) return;

    // Doubles games update both singles and doubles stats
    const updateData: Record<string, number> = {
      total_points: player.total_points + pointsToAdd,
      games_played: player.games_played + 1,
      doubles_points: player.doubles_points + pointsToAdd,
      doubles_games: player.doubles_games + 1,
      singles_points: player.singles_points + pointsToAdd,
      singles_games: player.singles_games + 1,
    };

    const { error } = await supabase
      .from('players')
      .update(updateData)
      .eq('name', playerName);

    if (error) {
      console.error('Error updating player stats:', error);
    }
  };

  const getAveragePoints = (player: Player, mode: LeaderboardMode = 'combined') => {
    if (mode === 'doubles') {
      if (player.doubles_games === 0) return 0;
      return player.doubles_points / player.doubles_games;
    }
    if (mode === 'singles') {
      if (player.singles_games === 0) return 0;
      return player.singles_points / player.singles_games;
    }
    if (player.games_played === 0) return 0;
    return player.total_points / player.games_played;
  };

  const getGamesPlayed = (player: Player, mode: LeaderboardMode = 'combined') => {
    if (mode === 'doubles') return player.doubles_games;
    if (mode === 'singles') return player.singles_games;
    return player.games_played;
  };

  const getTotalPoints = (player: Player, mode: LeaderboardMode = 'combined') => {
    if (mode === 'doubles') return player.doubles_points;
    if (mode === 'singles') return player.singles_points;
    return player.total_points;
  };

  const getLeaderboard = (mode: LeaderboardMode = 'combined') => {
    return [...players].sort((a, b) => {
      const avgA = getAveragePoints(a, mode);
      const avgB = getAveragePoints(b, mode);
      return avgB - avgA;
    });
  };

  return {
    players,
    loading,
    fetchPlayers,
    updatePlayerStats,
    getAveragePoints,
    getGamesPlayed,
    getTotalPoints,
    getLeaderboard,
  };
}

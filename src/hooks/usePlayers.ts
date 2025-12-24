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

  const updateSinglesStats = async (playerName: string, pointsToAdd: number) => {
    // Use atomic increment function - now updates both singles AND doubles stats
    const { error } = await supabase.rpc('increment_singles_stats', {
      p_player_name: playerName,
      p_points: pointsToAdd,
    });

    if (error) {
      console.error('Error updating stats:', error);
    }
  };

  const updateTeamStats = async (player1: string, player2: string, pointsToAdd: number) => {
    // Use atomic increment function for team stats
    const { error } = await supabase.rpc('increment_team_stats', {
      p_player1: player1,
      p_player2: player2,
      p_points: pointsToAdd,
    });

    if (error) {
      console.error('Error updating team stats:', error);
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

  const recalculateStats = async () => {
    const { error } = await supabase.rpc('recalculate_player_stats');
    if (error) {
      console.error('Error recalculating stats:', error);
      throw error;
    }
    // Refresh the players data after recalculation
    await fetchPlayers();
  };

  return {
    players,
    loading,
    fetchPlayers,
    updateSinglesStats,
    updateTeamStats,
    getAveragePoints,
    getGamesPlayed,
    getTotalPoints,
    getLeaderboard,
    recalculateStats,
  };
}

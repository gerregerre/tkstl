import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Player {
  id: string;
  name: string;
  total_points: number;
  games_played: number;
  created_at: string;
  updated_at: string;
}

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

    const { error } = await supabase
      .from('players')
      .update({
        total_points: player.total_points + pointsToAdd,
        games_played: player.games_played + 1,
      })
      .eq('name', playerName);

    if (error) {
      console.error('Error updating player stats:', error);
    }
  };

  const getAveragePoints = (player: Player) => {
    if (player.games_played === 0) return 0;
    return player.total_points / player.games_played;
  };

  const getLeaderboard = () => {
    return [...players].sort((a, b) => {
      const avgA = getAveragePoints(a);
      const avgB = getAveragePoints(b);
      return avgB - avgA;
    });
  };

  return {
    players,
    loading,
    fetchPlayers,
    updatePlayerStats,
    getAveragePoints,
    getLeaderboard,
  };
}

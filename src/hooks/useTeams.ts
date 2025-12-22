import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Team {
  id: string;
  player1_name: string;
  player2_name: string;
  total_points: number;
  games_played: number;
  created_at: string;
  updated_at: string;
}

export function useTeams() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTeams = async () => {
    const { data, error } = await supabase
      .from('team_stats')
      .select('*')
      .order('total_points', { ascending: false });

    if (error) {
      console.error('Error fetching teams:', error);
    } else {
      setTeams(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTeams();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('team-stats-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'team_stats' },
        () => fetchTeams()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const getAveragePoints = (team: Team) => {
    if (team.games_played === 0) return 0;
    return team.total_points / team.games_played;
  };

  const getTeamLeaderboard = () => {
    return [...teams].sort((a, b) => {
      const avgA = getAveragePoints(a);
      const avgB = getAveragePoints(b);
      return avgB - avgA;
    });
  };

  const getTeamName = (team: Team) => {
    return `${team.player1_name} & ${team.player2_name}`;
  };

  return {
    teams,
    loading,
    fetchTeams,
    getAveragePoints,
    getTeamLeaderboard,
    getTeamName,
  };
}

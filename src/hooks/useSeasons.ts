import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Season {
  id: string;
  name: string;
  start_date: string;
  end_date: string | null;
  is_active: boolean;
  champion_singles: string | null;
  champion_doubles: string | null;
  total_sessions: number | null;
  total_games: number | null;
  created_at: string;
}

export interface SeasonStanding {
  id: string;
  season_id: string;
  name: string;
  type: string;
  rank: number;
  avg_points: number;
  win_percentage: number;
  games_played: number;
  total_points: number;
  is_champion: boolean;
  created_at: string;
}

export function useSeasons() {
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSeasons = async () => {
    const { data, error } = await supabase
      .from('seasons')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching seasons:', error);
    } else {
      setSeasons((data as Season[]) || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSeasons();
  }, []);

  const getStandings = async (seasonId: string): Promise<SeasonStanding[]> => {
    const { data, error } = await supabase
      .from('season_standings')
      .select('*')
      .eq('season_id', seasonId)
      .order('rank', { ascending: true });

    if (error) {
      console.error('Error fetching standings:', error);
      return [];
    }
    return (data as SeasonStanding[]) || [];
  };

  const endSeason = async (seasonId: string, seasonName: string, singlesStandings: Omit<SeasonStanding, 'id' | 'season_id' | 'created_at'>[], doublesStandings: Omit<SeasonStanding, 'id' | 'season_id' | 'created_at'>[]) => {
    // Insert standings
    const allStandings = [
      ...singlesStandings.map(s => ({ ...s, season_id: seasonId })),
      ...doublesStandings.map(s => ({ ...s, season_id: seasonId })),
    ];

    if (allStandings.length > 0) {
      const { error: standingsError } = await supabase
        .from('season_standings')
        .insert(allStandings);

      if (standingsError) {
        console.error('Error inserting standings:', standingsError);
        throw standingsError;
      }
    }

    // Count total games for the season
    const { count: gameCount } = await supabase
      .from('session_games')
      .select('*', { count: 'exact', head: true })
      .not('winner', 'is', null);

    // Get unique session dates as session count
    const { data: sessionDates } = await supabase
      .from('session_games')
      .select('session_date')
      .not('winner', 'is', null);
    
    const uniqueSessions = new Set(sessionDates?.map(g => new Date(g.session_date).toDateString())).size;

    // Find champions
    const singlesChamp = singlesStandings.find(s => s.is_champion)?.name || singlesStandings[0]?.name || null;
    const doublesChamp = doublesStandings.find(s => s.is_champion)?.name || doublesStandings[0]?.name || null;

    // Close the season
    const { error: updateError } = await supabase
      .from('seasons')
      .update({
        is_active: false,
        end_date: new Date().toISOString(),
        champion_singles: singlesChamp,
        champion_doubles: doublesChamp,
        total_sessions: uniqueSessions,
        total_games: gameCount || 0,
      })
      .eq('id', seasonId);

    if (updateError) {
      console.error('Error closing season:', updateError);
      throw updateError;
    }

    await fetchSeasons();
  };

  const startSeason = async (name: string) => {
    const { error } = await supabase
      .from('seasons')
      .insert({ name, is_active: true });

    if (error) {
      console.error('Error starting season:', error);
      throw error;
    }

    await fetchSeasons();
  };

  const activeSeason = seasons.find(s => s.is_active) || null;
  const pastSeasons = seasons.filter(s => !s.is_active);

  return {
    seasons,
    activeSeason,
    pastSeasons,
    loading,
    fetchSeasons,
    getStandings,
    endSeason,
    startSeason,
  };
}

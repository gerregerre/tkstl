import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronRight, Calendar, Trophy, Users } from 'lucide-react';
import { format, parseISO } from 'date-fns';

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

interface GroupedSession {
  date: string;
  games: SessionGame[];
  players: string[];
}

export function SessionHistory() {
  const [sessions, setSessions] = useState<GroupedSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [openSessions, setOpenSessions] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    const { data, error } = await supabase
      .from('session_games')
      .select('*')
      .order('session_date', { ascending: false })
      .order('game_number', { ascending: true });

    if (error) {
      console.error('Error fetching sessions:', error);
      setLoading(false);
      return;
    }

    // Group games by date
    const grouped = (data || []).reduce((acc: Record<string, SessionGame[]>, game) => {
      const dateKey = format(parseISO(game.session_date), 'yyyy-MM-dd');
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(game);
      return acc;
    }, {});

    // Convert to array and extract unique players per session
    const sessionArray: GroupedSession[] = Object.entries(grouped).map(([date, games]) => {
      const playerSet = new Set<string>();
      games.forEach(game => {
        playerSet.add(game.team_a_player1);
        playerSet.add(game.team_a_player2);
        playerSet.add(game.team_b_player1);
        playerSet.add(game.team_b_player2);
      });
      return {
        date,
        games,
        players: Array.from(playerSet).sort(),
      };
    });

    setSessions(sessionArray);
    setLoading(false);
  };

  const toggleSession = (date: string) => {
    setOpenSessions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(date)) {
        newSet.delete(date);
      } else {
        newSet.add(date);
      }
      return newSet;
    });
  };

  const getScoreDisplay = (game: SessionGame) => {
    if (game.team_a_score !== null && game.team_b_score !== null) {
      return `${game.team_a_score} - ${game.team_b_score}`;
    }
    if (game.winner) {
      return game.winner === 'Team A' ? 'Win - Loss' : 'Loss - Win';
    }
    return 'No result';
  };

  const getWinnerBadge = (game: SessionGame) => {
    if (!game.winner) return null;
    return (
      <Badge variant="outline" className="ml-2 bg-primary/10 text-primary border-primary/20">
        <Trophy className="w-3 h-3 mr-1" />
        {game.winner}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Calendar className="w-12 h-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No sessions recorded yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Session History</h2>
        <Badge variant="secondary">{sessions.length} Sessions</Badge>
      </div>

      <div className="space-y-3">
        {sessions.map((session) => (
          <Collapsible
            key={session.date}
            open={openSessions.has(session.date)}
            onOpenChange={() => toggleSession(session.date)}
          >
            <Card>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {openSessions.has(session.date) ? (
                        <ChevronDown className="w-5 h-5 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-muted-foreground" />
                      )}
                      <div>
                        <CardTitle className="text-lg">
                          {format(parseISO(session.date), 'EEEE, MMMM d, yyyy')}
                        </CardTitle>
                        <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                          <Users className="w-4 h-4" />
                          <span>{session.players.join(', ')}</span>
                        </div>
                      </div>
                    </div>
                    <Badge>{session.games.length} Games</Badge>
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              
              <CollapsibleContent>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    {session.games.map((game) => (
                      <div
                        key={game.id}
                        className="p-4 rounded-lg bg-muted/30 border border-border/50"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <span className="font-semibold text-sm">
                            Game {game.game_number}
                          </span>
                          {getWinnerBadge(game)}
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4 items-center">
                          <div className="text-center">
                            <div className="text-xs text-muted-foreground mb-1">Team A</div>
                            <div className="font-medium text-sm">
                              {game.team_a_player1}
                            </div>
                            <div className="font-medium text-sm">
                              {game.team_a_player2}
                            </div>
                          </div>
                          
                          <div className="text-center">
                            <div className="text-2xl font-bold text-primary">
                              {getScoreDisplay(game)}
                            </div>
                          </div>
                          
                          <div className="text-center">
                            <div className="text-xs text-muted-foreground mb-1">Team B</div>
                            <div className="font-medium text-sm">
                              {game.team_b_player1}
                            </div>
                            <div className="font-medium text-sm">
                              {game.team_b_player2}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        ))}
      </div>
    </div>
  );
}

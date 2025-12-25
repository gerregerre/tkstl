import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ChevronDown, ChevronRight, Calendar, Trophy, Users, Pencil, Trash2, Loader2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { toast } from 'sonner';

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
  
  // Edit state
  const [editingGame, setEditingGame] = useState<SessionGame | null>(null);
  const [editScoreA, setEditScoreA] = useState('');
  const [editScoreB, setEditScoreB] = useState('');
  const [editWinner, setEditWinner] = useState<'Team A' | 'Team B'>('Team A');
  const [isGame3, setIsGame3] = useState(false);
  
  // Delete state
  const [deletingGame, setDeletingGame] = useState<SessionGame | null>(null);
  
  // Recalculate loading state
  const [isRecalculating, setIsRecalculating] = useState(false);

  useEffect(() => {
    fetchSessions();

    const channel = supabase
      .channel('session-history-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'session_games' },
        () => fetchSessions()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
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

    const grouped = (data || []).reduce((acc: Record<string, SessionGame[]>, game) => {
      const dateKey = format(parseISO(game.session_date), 'yyyy-MM-dd');
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(game);
      return acc;
    }, {});

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

  const openEditDialog = (game: SessionGame) => {
    setEditingGame(game);
    const gameIsGame3 = game.game_number === 3;
    setIsGame3(gameIsGame3);
    
    if (gameIsGame3) {
      setEditWinner(game.winner as 'Team A' | 'Team B' || 'Team A');
    } else {
      setEditScoreA(game.team_a_score?.toString() || '0');
      setEditScoreB(game.team_b_score?.toString() || '0');
    }
  };

  const handleEditSave = async () => {
    if (!editingGame) return;

    let updateData: Partial<SessionGame>;
    
    if (isGame3) {
      updateData = {
        winner: editWinner,
        team_a_score: null,
        team_b_score: null,
      };
    } else {
      const scoreA = parseInt(editScoreA) || 0;
      const scoreB = parseInt(editScoreB) || 0;
      updateData = {
        team_a_score: scoreA,
        team_b_score: scoreB,
        winner: scoreA > scoreB ? 'Team A' : scoreB > scoreA ? 'Team B' : null,
      };
    }

    const { error } = await supabase
      .from('session_games')
      .update(updateData)
      .eq('id', editingGame.id);

    if (error) {
      console.error('Error updating game:', error);
      toast.error('Failed to update game');
      return;
    }

    await recalculatePlayerStats();
    
    toast.success('Game updated successfully');
    setEditingGame(null);
    fetchSessions();
  };

  const handleDelete = async () => {
    if (!deletingGame) return;

    const { error } = await supabase
      .from('session_games')
      .delete()
      .eq('id', deletingGame.id);

    if (error) {
      console.error('Error deleting game:', error);
      toast.error('Failed to delete game');
      return;
    }

    await recalculatePlayerStats();
    
    toast.success('Game deleted successfully');
    setDeletingGame(null);
    fetchSessions();
  };

  const recalculatePlayerStats = async () => {
    const { error } = await supabase.rpc('recalculate_player_stats');
    
    if (error) {
      console.error('Error recalculating stats:', error);
      throw error;
    }
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
      <Badge className="bg-primary/20 text-primary border-primary/30 font-bold uppercase">
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
      <div className="bg-card border border-border rounded p-12 text-center">
        <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground font-medium">No sessions recorded yet</p>
      </div>
    );
  }

  const handleRecalculateAll = async () => {
    setIsRecalculating(true);
    toast.info('Recalculating all stats...');
    await recalculatePlayerStats();
    setIsRecalculating(false);
    toast.success('All player and team stats recalculated!');
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header - ATP Style */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-1 h-12 bg-primary rounded-full" />
          <div>
            <h1 className="font-display text-2xl font-black text-foreground uppercase tracking-tight">
              Session History
            </h1>
            <p className="text-muted-foreground text-sm font-medium">
              All recorded match results
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleRecalculateAll} disabled={isRecalculating} className="font-bold uppercase">
            {isRecalculating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Recalculate Stats
          </Button>
          <Badge className="bg-primary text-primary-foreground font-bold">{sessions.length} Sessions</Badge>
        </div>
      </div>

      <div className="space-y-3">
        {sessions.map((session) => (
          <Collapsible
            key={session.date}
            open={openSessions.has(session.date)}
            onOpenChange={() => toggleSession(session.date)}
          >
            <div className="bg-card border border-border rounded overflow-hidden">
              <CollapsibleTrigger asChild>
                <div className="cursor-pointer hover:bg-secondary/30 transition-colors p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {openSessions.has(session.date) ? (
                        <ChevronDown className="w-5 h-5 text-primary" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-muted-foreground" />
                      )}
                      <div>
                        <h3 className="font-display text-lg font-bold uppercase tracking-tight">
                          {format(parseISO(session.date), 'EEEE, MMMM d, yyyy')}
                        </h3>
                        <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                          <Users className="w-4 h-4" />
                          <span>{session.players.join(', ')}</span>
                        </div>
                      </div>
                    </div>
                    <Badge variant="outline" className="font-bold">{session.games.length} Games</Badge>
                  </div>
                </div>
              </CollapsibleTrigger>
              
              <CollapsibleContent>
                <div className="px-5 pb-5">
                  <div className="space-y-3">
                    {session.games.map((game) => (
                      <div
                        key={game.id}
                        className="p-4 rounded bg-secondary/30 border border-border/50"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm uppercase tracking-wide">
                              Game {game.game_number}
                            </span>
                            {getWinnerBadge(game)}
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={(e) => {
                                e.stopPropagation();
                                openEditDialog(game);
                              }}
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeletingGame(game);
                              }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4 items-center">
                          <div className="text-center">
                            <div className="text-xs text-muted-foreground mb-1 font-bold uppercase">Team A</div>
                            <div className="font-semibold text-sm">
                              {game.team_a_player1}
                            </div>
                            <div className="font-semibold text-sm">
                              {game.team_a_player2}
                            </div>
                          </div>
                          
                          <div className="text-center">
                            <div className="text-2xl font-black text-primary font-display">
                              {getScoreDisplay(game)}
                            </div>
                          </div>
                          
                          <div className="text-center">
                            <div className="text-xs text-muted-foreground mb-1 font-bold uppercase">Team B</div>
                            <div className="font-semibold text-sm">
                              {game.team_b_player1}
                            </div>
                            <div className="font-semibold text-sm">
                              {game.team_b_player2}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CollapsibleContent>
            </div>
          </Collapsible>
        ))}
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingGame} onOpenChange={() => setEditingGame(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display uppercase">Edit Game {editingGame?.game_number}</DialogTitle>
            <DialogDescription>
              Update the score for this game. Player stats will be recalculated.
            </DialogDescription>
          </DialogHeader>
          
          {editingGame && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4 text-center text-sm text-muted-foreground">
                <div>
                  <div className="font-bold text-foreground">{editingGame.team_a_player1}</div>
                  <div className="font-bold text-foreground">{editingGame.team_a_player2}</div>
                </div>
                <div>
                  <div className="font-bold text-foreground">{editingGame.team_b_player1}</div>
                  <div className="font-bold text-foreground">{editingGame.team_b_player2}</div>
                </div>
              </div>

              {isGame3 ? (
                <div className="space-y-3">
                  <Label className="font-bold uppercase">Winner</Label>
                  <div className="flex items-center justify-center gap-4">
                    <Button
                      variant={editWinner === 'Team A' ? 'atp' : 'outline'}
                      onClick={() => setEditWinner('Team A')}
                    >
                      Team A Wins
                    </Button>
                    <Button
                      variant={editWinner === 'Team B' ? 'atp' : 'outline'}
                      onClick={() => setEditWinner('Team B')}
                    >
                      Team B Wins
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="font-bold uppercase">Team A Score</Label>
                    <Input
                      type="number"
                      min="0"
                      max="9"
                      value={editScoreA}
                      onChange={(e) => setEditScoreA(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold uppercase">Team B Score</Label>
                    <Input
                      type="number"
                      min="0"
                      max="9"
                      value={editScoreB}
                      onChange={(e) => setEditScoreB(e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingGame(null)}>
              Cancel
            </Button>
            <Button variant="atp" onClick={handleEditSave}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingGame} onOpenChange={() => setDeletingGame(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display uppercase">Delete Game?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete Game {deletingGame?.game_number} and recalculate all player statistics. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
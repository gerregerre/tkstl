import { useState, useEffect } from 'react';
import { usePlayers, Player } from '@/hooks/usePlayers';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Swords, 
  Trophy,
  TrendingUp,
  ArrowRight,
  Handshake
} from 'lucide-react';
import { cn } from '@/lib/utils';

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

interface HeadToHeadStats {
  gamesAsTeammates: number;
  gamesAsOpponents: number;
  winsAsTeammates: number;
  winsAsOpponents: { player1: number; player2: number };
  totalPointsAsTeammates: { player1: number; player2: number };
  totalPointsAsOpponents: { player1: number; player2: number };
  recentGames: SessionGame[];
}

function calculateGamePoints(game: SessionGame, playerName: string): number {
  const isTeamA = game.team_a_player1 === playerName || game.team_a_player2 === playerName;
  
  if (game.game_number === 3) {
    const teamAWon = game.winner === 'A';
    if (isTeamA) {
      return teamAWon ? 10 : 5;
    } else {
      return teamAWon ? 5 : 10;
    }
  } else {
    const teamAScore = game.team_a_score || 0;
    const teamBScore = game.team_b_score || 0;
    const teamAWon = teamAScore > teamBScore;
    
    if (isTeamA) {
      return teamAWon ? 10 : (teamAScore / 9) * 10;
    } else {
      return teamAWon ? (teamBScore / 9) * 10 : 10;
    }
  }
}

function didPlayerWin(game: SessionGame, playerName: string): boolean {
  const isTeamA = game.team_a_player1 === playerName || game.team_a_player2 === playerName;
  if (game.game_number === 3) {
    return isTeamA ? game.winner === 'A' : game.winner === 'B';
  }
  const teamAScore = game.team_a_score || 0;
  const teamBScore = game.team_b_score || 0;
  return isTeamA ? teamAScore > teamBScore : teamBScore > teamAScore;
}

export function HeadToHead() {
  const { players, loading } = usePlayers();
  const [player1, setPlayer1] = useState<string | null>(null);
  const [player2, setPlayer2] = useState<string | null>(null);
  const [games, setGames] = useState<SessionGame[]>([]);
  const [loadingGames, setLoadingGames] = useState(false);
  const [stats, setStats] = useState<HeadToHeadStats | null>(null);

  useEffect(() => {
    if (player1 && player2) {
      fetchGames();
    } else {
      setGames([]);
      setStats(null);
    }
  }, [player1, player2]);

  useEffect(() => {
    const channel = supabase
      .channel('head-to-head-games')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'session_games' },
        () => {
          if (player1 && player2) {
            fetchGames();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [player1, player2]);

  const fetchGames = async () => {
    if (!player1 || !player2) return;
    setLoadingGames(true);

    const { data, error } = await supabase
      .from('session_games')
      .select('*')
      .order('session_date', { ascending: false });

    if (error) {
      console.error('Error fetching games:', error);
      setLoadingGames(false);
      return;
    }

    const relevantGames = (data || []).filter(game => {
      const teamA = [game.team_a_player1, game.team_a_player2];
      const teamB = [game.team_b_player1, game.team_b_player2];
      const allPlayers = [...teamA, ...teamB];
      return allPlayers.includes(player1) && allPlayers.includes(player2);
    });

    setGames(relevantGames);
    calculateStats(relevantGames);
    setLoadingGames(false);
  };

  const calculateStats = (gamesList: SessionGame[]) => {
    if (!player1 || !player2) return;

    let gamesAsTeammates = 0;
    let gamesAsOpponents = 0;
    let winsAsTeammates = 0;
    let winsAsOpponentsP1 = 0;
    let winsAsOpponentsP2 = 0;
    let pointsTeammatesP1 = 0;
    let pointsTeammatesP2 = 0;
    let pointsOpponentsP1 = 0;
    let pointsOpponentsP2 = 0;

    gamesList.forEach(game => {
      const teamA = [game.team_a_player1, game.team_a_player2];
      const teamB = [game.team_b_player1, game.team_b_player2];
      
      const p1InTeamA = teamA.includes(player1);
      const p2InTeamA = teamA.includes(player2);
      const sameTeam = p1InTeamA === p2InTeamA;

      if (sameTeam) {
        gamesAsTeammates++;
        const p1Won = didPlayerWin(game, player1);
        if (p1Won) winsAsTeammates++;
        pointsTeammatesP1 += calculateGamePoints(game, player1);
        pointsTeammatesP2 += calculateGamePoints(game, player2);
      } else {
        gamesAsOpponents++;
        if (didPlayerWin(game, player1)) winsAsOpponentsP1++;
        if (didPlayerWin(game, player2)) winsAsOpponentsP2++;
        pointsOpponentsP1 += calculateGamePoints(game, player1);
        pointsOpponentsP2 += calculateGamePoints(game, player2);
      }
    });

    setStats({
      gamesAsTeammates,
      gamesAsOpponents,
      winsAsTeammates,
      winsAsOpponents: { player1: winsAsOpponentsP1, player2: winsAsOpponentsP2 },
      totalPointsAsTeammates: { player1: pointsTeammatesP1, player2: pointsTeammatesP2 },
      totalPointsAsOpponents: { player1: pointsOpponentsP1, player2: pointsOpponentsP2 },
      recentGames: gamesList.slice(0, 10),
    });
  };

  const selectPlayer = (name: string) => {
    if (!player1) {
      setPlayer1(name);
    } else if (!player2 && name !== player1) {
      setPlayer2(name);
    }
  };

  const clearSelection = () => {
    setPlayer1(null);
    setPlayer2(null);
    setStats(null);
    setGames([]);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header - ATP Style */}
      <div className="flex items-center gap-3">
        <div className="w-1 h-12 bg-primary rounded-full" />
        <div>
          <h1 className="font-display text-2xl font-black text-foreground uppercase tracking-tight">
            Head-to-Head
          </h1>
          <p className="text-muted-foreground text-sm font-medium">
            Compare performance between two players
          </p>
        </div>
      </div>

      {/* Player Selection - ATP Style */}
      <div className="bg-card rounded border border-border p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-lg font-bold uppercase tracking-tight">Select Two Players</h3>
          {(player1 || player2) && (
            <Button variant="outline" size="sm" onClick={clearSelection} className="font-bold uppercase">
              Clear Selection
            </Button>
          )}
        </div>

        {/* Selected Players Display */}
        {(player1 || player2) && (
          <div className="flex items-center justify-center gap-4 mb-6 p-4 bg-secondary/30 rounded border border-border">
            <div className={cn(
              "flex flex-col items-center gap-2 p-4 rounded border-2",
              player1 ? "border-primary bg-primary/10" : "border-dashed border-muted-foreground"
            )}>
              {player1 ? (
                <>
                  <div className="w-12 h-12 rounded bg-primary/20 flex items-center justify-center font-display font-black text-lg text-primary">
                    {player1[0]}
                  </div>
                  <span className="font-bold text-foreground">{player1}</span>
                </>
              ) : (
                <span className="text-muted-foreground text-sm font-medium">Select Player 1</span>
              )}
            </div>

            <div className="flex items-center gap-2 text-muted-foreground">
              <Swords className="w-6 h-6 text-primary" />
              <span className="font-display font-black text-primary">VS</span>
            </div>

            <div className={cn(
              "flex flex-col items-center gap-2 p-4 rounded border-2",
              player2 ? "border-accent bg-accent/10" : "border-dashed border-muted-foreground"
            )}>
              {player2 ? (
                <>
                  <div className="w-12 h-12 rounded bg-accent/20 flex items-center justify-center font-display font-black text-lg text-accent">
                    {player2[0]}
                  </div>
                  <span className="font-bold text-foreground">{player2}</span>
                </>
              ) : (
                <span className="text-muted-foreground text-sm font-medium">Select Player 2</span>
              )}
            </div>
          </div>
        )}

        {/* Player Grid - ATP Style */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {players.map(player => {
            const isSelected = player.name === player1 || player.name === player2;
            const isDisabled = player1 && player2 && !isSelected;
            
            return (
              <button
                key={player.id}
                onClick={() => !isDisabled && selectPlayer(player.name)}
                disabled={isDisabled}
                className={cn(
                  "flex items-center gap-3 p-3 rounded border-2 transition-all text-left",
                  isSelected && player.name === player1 && "border-primary bg-primary/10",
                  isSelected && player.name === player2 && "border-accent bg-accent/10",
                  !isSelected && !isDisabled && "border-border hover:border-primary/50 hover:bg-secondary/30",
                  isDisabled && "opacity-50 cursor-not-allowed border-border"
                )}
              >
                <div className={cn(
                  "w-10 h-10 rounded flex items-center justify-center font-display font-bold",
                  isSelected && player.name === player1 && "bg-primary text-primary-foreground",
                  isSelected && player.name === player2 && "bg-accent text-accent-foreground",
                  !isSelected && "bg-secondary text-muted-foreground"
                )}>
                  {player.name[0]}
                </div>
                <span className="font-semibold text-foreground">{player.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Stats Display */}
      {loadingGames && (
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}

      {stats && player1 && player2 && !loadingGames && (
        <>
          {/* Summary Stats - ATP Style */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* As Teammates */}
            <div className="bg-card rounded border border-border p-6">
              <div className="flex items-center gap-2 mb-4">
                <Handshake className="w-5 h-5 text-primary" />
                <h3 className="font-display text-lg font-bold uppercase tracking-tight">As Teammates</h3>
              </div>

              {stats.gamesAsTeammates === 0 ? (
                <p className="text-muted-foreground text-center py-4 font-medium">No games as teammates yet</p>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="bg-secondary/30 rounded p-3">
                      <p className="text-2xl font-black font-display text-foreground">{stats.gamesAsTeammates}</p>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide font-bold">Games Together</p>
                    </div>
                    <div className="bg-primary/10 rounded p-3">
                      <p className="text-2xl font-black font-display text-primary">{stats.winsAsTeammates}</p>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide font-bold">Wins</p>
                    </div>
                  </div>
                  
                  <div className="pt-2 border-t border-border">
                    <p className="text-sm text-muted-foreground mb-2 font-bold uppercase">Win Rate Together</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-secondary rounded-full h-2">
                        <div 
                          className="bg-primary rounded-full h-2 transition-all"
                          style={{ width: `${(stats.winsAsTeammates / stats.gamesAsTeammates) * 100}%` }}
                        />
                      </div>
                      <span className="font-black text-primary">
                        {((stats.winsAsTeammates / stats.gamesAsTeammates) * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex justify-between p-2 bg-secondary/20 rounded">
                      <span className="text-muted-foreground font-medium">{player1} Pts:</span>
                      <span className="font-bold">{stats.totalPointsAsTeammates.player1.toFixed(1)}</span>
                    </div>
                    <div className="flex justify-between p-2 bg-secondary/20 rounded">
                      <span className="text-muted-foreground font-medium">{player2} Pts:</span>
                      <span className="font-bold">{stats.totalPointsAsTeammates.player2.toFixed(1)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* As Opponents */}
            <div className="bg-card rounded border border-border p-6">
              <div className="flex items-center gap-2 mb-4">
                <Swords className="w-5 h-5 text-destructive" />
                <h3 className="font-display text-lg font-bold uppercase tracking-tight">As Opponents</h3>
              </div>

              {stats.gamesAsOpponents === 0 ? (
                <p className="text-muted-foreground text-center py-4 font-medium">No games as opponents yet</p>
              ) : (
                <div className="space-y-4">
                  <div className="text-center bg-secondary/30 rounded p-3">
                    <p className="text-2xl font-black font-display text-foreground">{stats.gamesAsOpponents}</p>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide font-bold">Games Against Each Other</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className={cn(
                      "rounded p-3 text-center border-2",
                      stats.winsAsOpponents.player1 > stats.winsAsOpponents.player2 
                        ? "border-primary bg-primary/10" 
                        : "border-border"
                    )}>
                      <p className="font-bold text-sm text-muted-foreground">{player1}</p>
                      <p className="text-2xl font-black font-display text-primary">{stats.winsAsOpponents.player1}</p>
                      <p className="text-xs text-muted-foreground uppercase font-bold">Wins</p>
                    </div>
                    <div className={cn(
                      "rounded p-3 text-center border-2",
                      stats.winsAsOpponents.player2 > stats.winsAsOpponents.player1 
                        ? "border-accent bg-accent/10" 
                        : "border-border"
                    )}>
                      <p className="font-bold text-sm text-muted-foreground">{player2}</p>
                      <p className="text-2xl font-black font-display text-accent">{stats.winsAsOpponents.player2}</p>
                      <p className="text-xs text-muted-foreground uppercase font-bold">Wins</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex justify-between p-2 bg-secondary/20 rounded">
                      <span className="text-muted-foreground font-medium">{player1} Pts:</span>
                      <span className="font-bold">{stats.totalPointsAsOpponents.player1.toFixed(1)}</span>
                    </div>
                    <div className="flex justify-between p-2 bg-secondary/20 rounded">
                      <span className="text-muted-foreground font-medium">{player2} Pts:</span>
                      <span className="font-bold">{stats.totalPointsAsOpponents.player2.toFixed(1)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Recent Games - ATP Style */}
          {stats.recentGames.length > 0 && (
            <div className="bg-card rounded border border-border overflow-hidden">
              <div className="p-4 border-b border-border bg-secondary/30">
                <h3 className="font-display text-lg font-bold uppercase tracking-tight">Recent Matchups</h3>
              </div>
              <div className="divide-y divide-border">
                {stats.recentGames.map(game => {
                  const teamA = [game.team_a_player1, game.team_a_player2];
                  const teamB = [game.team_b_player1, game.team_b_player2];
                  const p1InTeamA = teamA.includes(player1);
                  const p2InTeamA = teamA.includes(player2);
                  const sameTeam = p1InTeamA === p2InTeamA;
                  const p1Won = didPlayerWin(game, player1);

                  return (
                    <div key={game.id} className="p-4 hover:bg-secondary/20 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <Badge 
                            className={cn(
                              "font-bold uppercase",
                              sameTeam 
                                ? "bg-primary/20 text-primary" 
                                : "bg-destructive/20 text-destructive"
                            )}
                          >
                            {sameTeam ? (
                              <><Handshake className="w-3 h-3 mr-1" /> Teammates</>
                            ) : (
                              <><Swords className="w-3 h-3 mr-1" /> Opponents</>
                            )}
                          </Badge>
                          
                          <div className="text-sm">
                            <span className="font-bold">{teamA.join(' & ')}</span>
                            <span className="text-muted-foreground mx-2">vs</span>
                            <span className="font-bold">{teamB.join(' & ')}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="font-display font-black text-primary">
                            {game.team_a_score !== null && game.team_b_score !== null
                              ? `${game.team_a_score} - ${game.team_b_score}`
                              : game.winner || 'TBD'}
                          </span>
                          {!sameTeam && (
                            <Badge className={cn(
                              "font-bold",
                              p1Won ? "bg-primary text-primary-foreground" : "bg-accent text-accent-foreground"
                            )}>
                              <Trophy className="w-3 h-3 mr-1" />
                              {p1Won ? player1 : player2}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
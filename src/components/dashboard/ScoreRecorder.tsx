import { useState } from 'react';
import { usePlayers } from '@/hooks/usePlayers';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  User, 
  Users, 
  Trophy, 
  Swords,
  Send,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

type MatchMode = 'singles' | 'doubles';

interface GameScore {
  teamAScore: number;
  teamBScore: number;
  teamAWon?: boolean;
}

// Calculate points for singles match (same as doubles games 1 & 2)
function calculateSinglesPoints(score: number, isWinner: boolean): number {
  if (isWinner) return 10;
  return (score / 9) * 10;
}

// Round Robin rotation for 4 players
function getRoundRobinTeams(players: string[]): { teamA: string[], teamB: string[] }[] {
  if (players.length !== 4) return [];
  const [p1, p2, p3, p4] = players;
  return [
    { teamA: [p1, p2], teamB: [p3, p4] },
    { teamA: [p1, p3], teamB: [p2, p4] },
    { teamA: [p1, p4], teamB: [p2, p3] },
  ];
}

// Calculate points for games 1 & 2
function calculatePointsGame12(score: number, isWinner: boolean): number {
  if (isWinner) return 10;
  return (score / 9) * 10;
}

// Calculate points for game 3
function calculatePointsGame3(isWinner: boolean): number {
  return isWinner ? 10 : 5;
}

export function ScoreRecorder() {
  const { players, loading, updatePlayerStats } = usePlayers();
  const [mode, setMode] = useState<MatchMode>('singles');
  
  // Singles state
  const [player1, setPlayer1] = useState<string | null>(null);
  const [player2, setPlayer2] = useState<string | null>(null);
  const [player1Score, setPlayer1Score] = useState(0);
  const [player2Score, setPlayer2Score] = useState(0);
  
  // Doubles state
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
  const [gameScores, setGameScores] = useState<GameScore[]>([
    { teamAScore: 0, teamBScore: 0 },
    { teamAScore: 0, teamBScore: 0 },
    { teamAScore: 0, teamBScore: 0, teamAWon: undefined },
  ]);
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Singles handlers
  const selectSinglesPlayer = (playerName: string, slot: 1 | 2) => {
    if (slot === 1) {
      if (player2 === playerName) {
        toast({
          title: "Already selected",
          description: "This player is already selected as Player 2",
          variant: "destructive",
        });
        return;
      }
      setPlayer1(player1 === playerName ? null : playerName);
    } else {
      if (player1 === playerName) {
        toast({
          title: "Already selected",
          description: "This player is already selected as Player 1",
          variant: "destructive",
        });
        return;
      }
      setPlayer2(player2 === playerName ? null : playerName);
    }
  };

  // Doubles handlers
  const togglePlayer = (playerName: string) => {
    if (selectedPlayers.includes(playerName)) {
      setSelectedPlayers(prev => prev.filter(p => p !== playerName));
    } else if (selectedPlayers.length < 4) {
      setSelectedPlayers(prev => [...prev, playerName]);
    } else {
      toast({
        title: "Maximum 4 players",
        description: "You can only select 4 players for a session.",
        variant: "destructive",
      });
    }
  };

  const updateGameScore = (gameIndex: number, field: keyof GameScore, value: number | boolean) => {
    setGameScores(prev => {
      const updated = [...prev];
      updated[gameIndex] = { ...updated[gameIndex], [field]: value };
      return updated;
    });
  };

  const roundRobinTeams = getRoundRobinTeams(selectedPlayers);
  const canSubmitSingles = player1 && player2 && player1Score !== player2Score;
  const canSubmitDoubles = selectedPlayers.length === 4 && gameScores[2].teamAWon !== undefined;

  const handleSubmitSingles = async () => {
    if (!canSubmitSingles || !player1 || !player2) return;
    setIsSubmitting(true);

    try {
      const player1Won = player1Score > player2Score;
      const player1Points = calculateSinglesPoints(player1Score, player1Won);
      const player2Points = calculateSinglesPoints(player2Score, !player1Won);

      await updatePlayerStats(player1, player1Points, 'singles');
      await updatePlayerStats(player2, player2Points, 'singles');

      await supabase.from('match_results').insert({
        match_type: 'Singles',
        player1_name: player1,
        player2_name: player2,
        player1_score: player1Score,
        player2_score: player2Score,
      });

      toast({
        title: "Match Recorded!",
        description: `${player1Won ? player1 : player2} wins the singles match!`,
      });

      setPlayer1(null);
      setPlayer2(null);
      setPlayer1Score(0);
      setPlayer2Score(0);
    } catch (error) {
      console.error('Error recording match:', error);
      toast({
        title: "Error",
        description: "Failed to record match. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitDoubles = async () => {
    if (!canSubmitDoubles) return;
    setIsSubmitting(true);

    try {
      for (let gameIndex = 0; gameIndex < 3; gameIndex++) {
        const teams = roundRobinTeams[gameIndex];
        const score = gameScores[gameIndex];

        if (gameIndex < 2) {
          const teamAWon = score.teamAScore > score.teamBScore;
          const teamAPoints = calculatePointsGame12(score.teamAScore, teamAWon);
          const teamBPoints = calculatePointsGame12(score.teamBScore, !teamAWon);

          for (const player of teams.teamA) {
            await updatePlayerStats(player, teamAPoints);
          }
          for (const player of teams.teamB) {
            await updatePlayerStats(player, teamBPoints);
          }

          await supabase.from('session_games').insert({
            game_number: gameIndex + 1,
            team_a_player1: teams.teamA[0],
            team_a_player2: teams.teamA[1],
            team_b_player1: teams.teamB[0],
            team_b_player2: teams.teamB[1],
            team_a_score: score.teamAScore,
            team_b_score: score.teamBScore,
          });
        } else {
          const teamAWon = score.teamAWon === true;
          const teamAPoints = calculatePointsGame3(teamAWon);
          const teamBPoints = calculatePointsGame3(!teamAWon);

          for (const player of teams.teamA) {
            await updatePlayerStats(player, teamAPoints);
          }
          for (const player of teams.teamB) {
            await updatePlayerStats(player, teamBPoints);
          }

          await supabase.from('session_games').insert({
            game_number: 3,
            team_a_player1: teams.teamA[0],
            team_a_player2: teams.teamA[1],
            team_b_player1: teams.teamB[0],
            team_b_player2: teams.teamB[1],
            winner: teamAWon ? 'A' : 'B',
          });
        }
      }

      toast({
        title: "Session Recorded!",
        description: "All game results and player stats have been updated.",
      });

      setSelectedPlayers([]);
      setGameScores([
        { teamAScore: 0, teamBScore: 0 },
        { teamAScore: 0, teamBScore: 0 },
        { teamAScore: 0, teamBScore: 0, teamAWon: undefined },
      ]);
    } catch (error) {
      console.error('Error recording session:', error);
      toast({
        title: "Error",
        description: "Failed to record session. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
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
      {/* Header with Mode Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="section-header">Score Recorder</h1>
          <p className="text-muted-foreground mt-2 ml-5">
            Record singles or doubles matches
          </p>
        </div>
        
        <div className="flex items-center bg-muted rounded-lg p-1 ml-5 sm:ml-0">
          <button
            onClick={() => setMode('singles')}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all",
              mode === 'singles'
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <User className="w-4 h-4" />
            <span>Singles</span>
          </button>
          <button
            onClick={() => setMode('doubles')}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all",
              mode === 'doubles'
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Users className="w-4 h-4" />
            <span>Doubles</span>
          </button>
        </div>
      </div>

      {/* Singles Mode */}
      {mode === 'singles' && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Player 1 Selection */}
            <div className="bg-card rounded-lg border-2 border-primary/30 p-6 shadow-card">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-foreground">Player 1</h3>
                  <p className="text-sm text-muted-foreground">Select first player</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-4">
                {players.map((player) => (
                  <button
                    key={player.id}
                    onClick={() => selectSinglesPlayer(player.name, 1)}
                    disabled={player2 === player.name}
                    className={cn(
                      "flex items-center gap-2 p-3 rounded-lg border-2 transition-all text-left text-sm",
                      player1 === player.name
                        ? "border-primary bg-primary/10"
                        : player2 === player.name
                        ? "border-border bg-muted/50 opacity-50 cursor-not-allowed"
                        : "border-border hover:border-primary/50 bg-background"
                    )}
                  >
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center font-serif font-bold text-xs",
                      player1 === player.name
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    )}>
                      {player.name[0]}
                    </div>
                    <span className="font-medium text-foreground truncate">
                      {player.name}
                    </span>
                  </button>
                ))}
              </div>

              {player1 && (
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Score (0-9)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="9"
                    value={player1Score}
                    onChange={(e) => setPlayer1Score(Math.min(9, Math.max(0, parseInt(e.target.value) || 0)))}
                    className="text-center text-2xl font-bold h-14"
                  />
                </div>
              )}
            </div>

            {/* Player 2 Selection */}
            <div className="bg-card rounded-lg border-2 border-secondary/30 p-6 shadow-card">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center">
                  <User className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-foreground">Player 2</h3>
                  <p className="text-sm text-muted-foreground">Select second player</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-4">
                {players.map((player) => (
                  <button
                    key={player.id}
                    onClick={() => selectSinglesPlayer(player.name, 2)}
                    disabled={player1 === player.name}
                    className={cn(
                      "flex items-center gap-2 p-3 rounded-lg border-2 transition-all text-left text-sm",
                      player2 === player.name
                        ? "border-secondary bg-secondary/10"
                        : player1 === player.name
                        ? "border-border bg-muted/50 opacity-50 cursor-not-allowed"
                        : "border-border hover:border-secondary/50 bg-background"
                    )}
                  >
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center font-serif font-bold text-xs",
                      player2 === player.name
                        ? "bg-secondary text-secondary-foreground"
                        : "bg-muted text-muted-foreground"
                    )}>
                      {player.name[0]}
                    </div>
                    <span className="font-medium text-foreground truncate">
                      {player.name}
                    </span>
                  </button>
                ))}
              </div>

              {player2 && (
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Score (0-9)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="9"
                    value={player2Score}
                    onChange={(e) => setPlayer2Score(Math.min(9, Math.max(0, parseInt(e.target.value) || 0)))}
                    className="text-center text-2xl font-bold h-14"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Match Preview */}
          {player1 && player2 && (
            <div className="bg-card rounded-lg border border-border p-6 shadow-card">
              <div className="flex items-center justify-center gap-4 mb-4">
                <Swords className="w-5 h-5 text-primary" />
                <h3 className="font-serif text-lg font-bold text-foreground">Match Preview</h3>
              </div>

              <div className="flex items-center justify-center gap-8">
                <div className="text-center">
                  <div className={cn(
                    "w-16 h-16 rounded-full flex items-center justify-center font-serif font-bold text-xl mx-auto mb-2",
                    player1Score > player2Score ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  )}>
                    {player1[0]}
                  </div>
                  <p className="font-semibold text-foreground">{player1}</p>
                  <p className="text-3xl font-bold text-primary mt-1">{player1Score}</p>
                  {player1Score > player2Score && (
                    <Badge className="mt-2 bg-primary">
                      <Trophy className="w-3 h-3 mr-1" />
                      Winner
                    </Badge>
                  )}
                </div>

                <div className="text-2xl font-bold text-muted-foreground">VS</div>

                <div className="text-center">
                  <div className={cn(
                    "w-16 h-16 rounded-full flex items-center justify-center font-serif font-bold text-xl mx-auto mb-2",
                    player2Score > player1Score ? "bg-secondary text-secondary-foreground" : "bg-muted text-muted-foreground"
                  )}>
                    {player2[0]}
                  </div>
                  <p className="font-semibold text-foreground">{player2}</p>
                  <p className="text-3xl font-bold text-secondary mt-1">{player2Score}</p>
                  {player2Score > player1Score && (
                    <Badge className="mt-2 bg-secondary">
                      <Trophy className="w-3 h-3 mr-1" />
                      Winner
                    </Badge>
                  )}
                </div>
              </div>

              {player1Score === player2Score && (
                <p className="text-center text-sm text-destructive mt-4">
                  Scores cannot be tied. Please enter different scores.
                </p>
              )}
            </div>
          )}

          <Button
            onClick={handleSubmitSingles}
            variant="default"
            size="lg"
            className="w-full"
            disabled={!canSubmitSingles || isSubmitting}
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground"></div>
                Recording Match...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Send className="w-4 h-4" />
                Record Singles Match
              </span>
            )}
          </Button>

          <div className="bg-muted rounded p-4 border border-border">
            <h3 className="font-serif font-semibold text-sm mb-2 uppercase tracking-wide">Singles Scoring</h3>
            <p className="text-sm text-muted-foreground">
              <strong>Winner:</strong> 10 points • <strong>Loser:</strong> (Score/9) × 10 points
            </p>
          </div>
        </>
      )}

      {/* Doubles Mode */}
      {mode === 'doubles' && (
        <>
          {/* Player Selection */}
          <div className="bg-card rounded-lg border border-border p-6 shadow-card">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-serif text-xl font-semibold text-foreground">
                  Select 4 Players
                </h3>
                <p className="text-sm text-muted-foreground">
                  Choose the participants for this session
                </p>
              </div>
              <div className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium",
                selectedPlayers.length === 4 
                  ? "bg-secondary/20 text-secondary" 
                  : "bg-muted text-muted-foreground"
              )}>
                <Users className="w-4 h-4" />
                {selectedPlayers.length}/4
              </div>
            </div>

            {selectedPlayers.length < 4 && (
              <div className="flex items-center gap-2 p-3 bg-accent/10 rounded-lg mb-4 text-sm">
                <AlertCircle className="w-4 h-4 text-accent" />
                <span className="text-accent-foreground">
                  {4 - selectedPlayers.length} more player{4 - selectedPlayers.length !== 1 ? 's' : ''} needed
                </span>
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {players.map((player) => {
                const isSelected = selectedPlayers.includes(player.name);
                const selectionIndex = selectedPlayers.indexOf(player.name);
                
                return (
                  <button
                    key={player.id}
                    onClick={() => togglePlayer(player.name)}
                    className={cn(
                      "flex items-center gap-3 p-4 rounded-lg border-2 transition-all text-left",
                      isSelected
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-muted-foreground/30 bg-background"
                    )}
                  >
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center font-serif font-bold",
                      isSelected
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    )}>
                      {isSelected ? `P${selectionIndex + 1}` : player.name[0]}
                    </div>
                    <div className="flex-1">
                      <span className="font-semibold text-foreground">
                        {player.name}
                      </span>
                      <div className="text-xs text-muted-foreground">
                        {player.games_played} games
                      </div>
                    </div>
                    <Checkbox checked={isSelected} className="pointer-events-none" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Round Robin Games */}
          {selectedPlayers.length === 4 && (
            <div className="space-y-4">
              <div>
                <h3 className="font-serif text-xl font-semibold text-foreground mb-2">
                  Round Robin Games
                </h3>
                <p className="text-sm text-muted-foreground">
                  Teams are automatically assigned. Enter scores for each game.
                </p>
              </div>

              {/* Game 1 */}
              <div className="bg-card rounded-lg border-2 border-primary/30 p-6 shadow-card">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary">
                    1
                  </div>
                  <div>
                    <h4 className="font-serif text-lg font-bold text-foreground">Game 1</h4>
                    <p className="text-sm text-muted-foreground">Score 0-9 • Winners: 10pts • Losers: (Score/9)×10 pts</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary">Team A</Badge>
                    <div className="text-sm font-medium text-foreground">
                      {roundRobinTeams[0]?.teamA.join(' & ')}
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Score (0-9)</Label>
                      <Input
                        type="number"
                        min="0"
                        max="9"
                        value={gameScores[0].teamAScore}
                        onChange={(e) => updateGameScore(0, 'teamAScore', Math.min(9, Math.max(0, parseInt(e.target.value) || 0)))}
                        className="mt-1"
                      />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Badge variant="outline" className="bg-secondary/10 text-secondary border-secondary">Team B</Badge>
                    <div className="text-sm font-medium text-foreground">
                      {roundRobinTeams[0]?.teamB.join(' & ')}
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Score (0-9)</Label>
                      <Input
                        type="number"
                        min="0"
                        max="9"
                        value={gameScores[0].teamBScore}
                        onChange={(e) => updateGameScore(0, 'teamBScore', Math.min(9, Math.max(0, parseInt(e.target.value) || 0)))}
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Game 2 */}
              <div className="bg-card rounded-lg border-2 border-secondary/30 p-6 shadow-card">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center font-bold text-secondary">
                    2
                  </div>
                  <div>
                    <h4 className="font-serif text-lg font-bold text-foreground">Game 2</h4>
                    <p className="text-sm text-muted-foreground">Score 0-9 • Winners: 10pts • Losers: (Score/9)×10 pts</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary">Team A</Badge>
                    <div className="text-sm font-medium text-foreground">
                      {roundRobinTeams[1]?.teamA.join(' & ')}
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Score (0-9)</Label>
                      <Input
                        type="number"
                        min="0"
                        max="9"
                        value={gameScores[1].teamAScore}
                        onChange={(e) => updateGameScore(1, 'teamAScore', Math.min(9, Math.max(0, parseInt(e.target.value) || 0)))}
                        className="mt-1"
                      />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Badge variant="outline" className="bg-secondary/10 text-secondary border-secondary">Team B</Badge>
                    <div className="text-sm font-medium text-foreground">
                      {roundRobinTeams[1]?.teamB.join(' & ')}
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Score (0-9)</Label>
                      <Input
                        type="number"
                        min="0"
                        max="9"
                        value={gameScores[1].teamBScore}
                        onChange={(e) => updateGameScore(1, 'teamBScore', Math.min(9, Math.max(0, parseInt(e.target.value) || 0)))}
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Game 3 */}
              <div className="bg-card rounded-lg border-2 border-gold/30 p-6 shadow-card">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center font-bold text-gold">
                    3
                  </div>
                  <div>
                    <h4 className="font-serif text-lg font-bold text-foreground">Game 3 (Ladder)</h4>
                    <p className="text-sm text-muted-foreground">Win/Loss only • Winners: 10pts • Losers: 5pts</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary">Team A</Badge>
                    <div className="text-sm font-medium text-foreground">
                      {roundRobinTeams[2]?.teamA.join(' & ')}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Badge variant="outline" className="bg-secondary/10 text-secondary border-secondary">Team B</Badge>
                    <div className="text-sm font-medium text-foreground">
                      {roundRobinTeams[2]?.teamB.join(' & ')}
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-border">
                  <Label className="text-sm font-medium mb-3 block">Who Won?</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => updateGameScore(2, 'teamAWon', true)}
                      className={cn(
                        "p-4 rounded-lg border-2 transition-all flex items-center justify-center gap-2",
                        gameScores[2].teamAWon === true
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      <Trophy className="w-5 h-5" />
                      <span className="font-semibold">Team A Won</span>
                    </button>
                    <button
                      onClick={() => updateGameScore(2, 'teamAWon', false)}
                      className={cn(
                        "p-4 rounded-lg border-2 transition-all flex items-center justify-center gap-2",
                        gameScores[2].teamAWon === false
                          ? "border-secondary bg-secondary/10 text-secondary"
                          : "border-border hover:border-secondary/50"
                      )}
                    >
                      <Trophy className="w-5 h-5" />
                      <span className="font-semibold">Team B Won</span>
                    </button>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleSubmitDoubles}
                variant="default"
                size="lg"
                className="w-full"
                disabled={!canSubmitDoubles || isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground"></div>
                    Recording Session...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Send className="w-4 h-4" />
                    Record Doubles Session
                  </span>
                )}
              </Button>

              <div className="bg-muted rounded p-4 border border-border">
                <h3 className="font-serif font-semibold text-sm mb-2 uppercase tracking-wide">Doubles Scoring</h3>
                <p className="text-sm text-muted-foreground">
                  <strong>Games 1 & 2:</strong> Winner: 10pts • Loser: (Score/9)×10 pts<br />
                  <strong>Game 3:</strong> Winner: 10pts • Loser: 5pts
                </p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

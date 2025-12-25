import { useState, useEffect } from 'react';
import { usePlayers, Player } from '@/hooks/usePlayers';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Users, 
  Trophy, 
  ArrowRight,
  Check,
  AlertCircle,
  Send
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

interface GameScore {
  teamAScore: number;
  teamBScore: number;
  teamAWon?: boolean; // For game 3
}

// Round Robin rotation for 4 players: P1, P2, P3, P4
// Game 1: P1&P2 vs P3&P4
// Game 2: P1&P3 vs P2&P4
// Game 3: P1&P4 vs P2&P3
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

export function NewSessionRecorder() {
  const { players, loading, updateSinglesStats, updateTeamStats } = usePlayers();
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState<'select' | 'games' | 'confirm'>('select');
  const [gameScores, setGameScores] = useState<GameScore[]>([
    { teamAScore: 0, teamBScore: 0 },
    { teamAScore: 0, teamBScore: 0 },
    { teamAScore: 0, teamBScore: 0, teamAWon: undefined },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const roundRobinTeams = getRoundRobinTeams(selectedPlayers);

  const updateGameScore = (gameIndex: number, field: keyof GameScore, value: number | boolean) => {
    setGameScores(prev => {
      const updated = [...prev];
      updated[gameIndex] = { ...updated[gameIndex], [field]: value };
      return updated;
    });
  };

  const isGame3Valid = gameScores[2].teamAWon !== undefined;
  const canSubmit = selectedPlayers.length === 4 && isGame3Valid;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setIsSubmitting(true);

    try {
      // Calculate and update points for each game
      for (let gameIndex = 0; gameIndex < 3; gameIndex++) {
        const teams = roundRobinTeams[gameIndex];
        const score = gameScores[gameIndex];

        if (gameIndex < 2) {
          // Games 1 & 2: Score-based
          const teamAWon = score.teamAScore > score.teamBScore;
          const teamAPoints = calculatePointsGame12(score.teamAScore, teamAWon);
          const teamBPoints = calculatePointsGame12(score.teamBScore, !teamAWon);

          // Update singles stats for all players
          for (const player of teams.teamA) {
            await updateSinglesStats(player, teamAPoints);
          }
          for (const player of teams.teamB) {
            await updateSinglesStats(player, teamBPoints);
          }

          // Update team stats for doubles
          await updateTeamStats(teams.teamA[0], teams.teamA[1], teamAPoints);
          await updateTeamStats(teams.teamB[0], teams.teamB[1], teamBPoints);

          // Record game in database
          const { error: insertError } = await supabase.from('session_games').insert({
            game_number: gameIndex + 1,
            team_a_player1: teams.teamA[0],
            team_a_player2: teams.teamA[1],
            team_b_player1: teams.teamB[0],
            team_b_player2: teams.teamB[1],
            team_a_score: score.teamAScore,
            team_b_score: score.teamBScore,
            winner: score.teamAScore > score.teamBScore ? 'A' : 'B',
          });
          if (insertError) {
            console.error('Error inserting game:', insertError);
          }
        } else {
          // Game 3: Win/Loss toggle
          const teamAWon = score.teamAWon === true;
          const teamAPoints = calculatePointsGame3(teamAWon);
          const teamBPoints = calculatePointsGame3(!teamAWon);

          // Update singles stats for all players
          for (const player of teams.teamA) {
            await updateSinglesStats(player, teamAPoints);
          }
          for (const player of teams.teamB) {
            await updateSinglesStats(player, teamBPoints);
          }

          // Update team stats for doubles
          await updateTeamStats(teams.teamA[0], teams.teamA[1], teamAPoints);
          await updateTeamStats(teams.teamB[0], teams.teamB[1], teamBPoints);

          // Record game in database
          const { error: insertError } = await supabase.from('session_games').insert({
            game_number: 3,
            team_a_player1: teams.teamA[0],
            team_a_player2: teams.teamA[1],
            team_b_player1: teams.teamB[0],
            team_b_player2: teams.teamB[1],
            team_a_score: null,
            team_b_score: null,
            winner: teamAWon ? 'A' : 'B',
          });
          if (insertError) {
            console.error('Error inserting game 3:', insertError);
          }
        }
      }

      toast({
        title: "Session Recorded!",
        description: "All game results and player stats have been updated.",
      });

      // Reset form
      setSelectedPlayers([]);
      setGameScores([
        { teamAScore: 0, teamBScore: 0 },
        { teamAScore: 0, teamBScore: 0 },
        { teamAScore: 0, teamBScore: 0, teamAWon: undefined },
      ]);
      setCurrentStep('select');
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
      {/* Header */}
      <div>
        <h1 className="section-header">Session Recorder</h1>
        <p className="text-muted-foreground mt-2 ml-5">
          Select 4 players, record scores, update the leaderboard
        </p>
      </div>

      {/* Step 1: Player Selection */}
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
          {players.map((player, index) => {
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

      {/* Step 2: Round Robin Games */}
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
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary">Team A</Badge>
                </div>
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
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-secondary/10 text-secondary border-secondary">Team B</Badge>
                </div>
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
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary">Team A</Badge>
                </div>
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
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-secondary/10 text-secondary border-secondary">Team B</Badge>
                </div>
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
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary">Team A</Badge>
                </div>
                <div className="text-sm font-medium text-foreground">
                  {roundRobinTeams[2]?.teamA.join(' & ')}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-secondary/10 text-secondary border-secondary">Team B</Badge>
                </div>
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

          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            variant="default"
            size="lg"
            className="w-full"
            disabled={!canSubmit || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2"></div>
                Recording...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Submit Session Results
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}

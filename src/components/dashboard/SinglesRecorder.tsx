import { useState } from 'react';
import { usePlayers } from '@/hooks/usePlayers';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Trophy, 
  Swords,
  Send
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

// Calculate points for singles match (same as doubles games 1 & 2)
function calculateSinglesPoints(score: number, isWinner: boolean): number {
  if (isWinner) return 10;
  return (score / 9) * 10;
}

export function SinglesRecorder() {
  const { players, loading, updatePlayerStats } = usePlayers();
  const [player1, setPlayer1] = useState<string | null>(null);
  const [player2, setPlayer2] = useState<string | null>(null);
  const [player1Score, setPlayer1Score] = useState(0);
  const [player2Score, setPlayer2Score] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectPlayer = (playerName: string, slot: 1 | 2) => {
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

  const canSubmit = player1 && player2 && player1Score !== player2Score;

  const handleSubmit = async () => {
    if (!canSubmit || !player1 || !player2) return;
    setIsSubmitting(true);

    try {
      const player1Won = player1Score > player2Score;
      const player1Points = calculateSinglesPoints(player1Score, player1Won);
      const player2Points = calculateSinglesPoints(player2Score, !player1Won);

      // Update player stats
      await updatePlayerStats(player1, player1Points, 'singles');
      await updatePlayerStats(player2, player2Points, 'singles');

      // Record match in database
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

      // Reset form
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
        <h1 className="section-header">Singles Match</h1>
        <p className="text-muted-foreground mt-2 ml-5">
          Record a 1v1 singles match between two players
        </p>
      </div>

      {/* Player Selection */}
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
                onClick={() => selectPlayer(player.name, 1)}
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
                onClick={() => selectPlayer(player.name, 2)}
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

      {/* Submit Button */}
      <Button
        onClick={handleSubmit}
        variant="default"
        size="lg"
        className="w-full"
        disabled={!canSubmit || isSubmitting}
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

      {/* Scoring Info */}
      <div className="bg-muted rounded p-4 border border-border">
        <h3 className="font-serif font-semibold text-sm mb-2 uppercase tracking-wide">Singles Scoring</h3>
        <p className="text-sm text-muted-foreground">
          <strong>Winner:</strong> 10 points • <strong>Loser:</strong> (Score/9) × 10 points
        </p>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePlayers, Player } from '@/hooks/usePlayers';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Users, 
  Trophy, 
  Check,
  AlertCircle,
  Send,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Plus,
  Trash2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { SessionPasswordGate } from './SessionPasswordGate';
import { TeamDraft } from './TeamDraft';

interface GameScore {
  teamAScore: number;
  teamBScore: number;
  teamAWon?: boolean;
}

interface GameTeams {
  teamA: string[];
  teamB: string[];
}

interface GameData {
  teams: GameTeams;
  score: GameScore;
  type: 'scored' | 'winloss'; // scored = PwC Single/Shibuya, winloss = Tug Of War
}

const GAME_NAMES = ['PwC Single', 'Shibuya Crossing', 'Tug Of War'];

const getGameName = (index: number): string => {
  if (index < 2) return GAME_NAMES[index];
  return 'Tug Of War';
};

const getGameType = (index: number): 'scored' | 'winloss' => {
  // Games 1 & 2 are scored, Game 3+ are win/loss (Tug of War style)
  return index < 2 ? 'scored' : 'winloss';
};

export function NewSessionRecorder() {
  const { players, loading } = usePlayers();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState<'select' | number>('select'); // 'select' or game index
  const [currentPhase, setCurrentPhase] = useState<'draft' | 'score'>('draft');
  const [games, setGames] = useState<GameData[]>([
    { teams: { teamA: [], teamB: [] }, score: { teamAScore: 0, teamBScore: 0 }, type: 'scored' },
    { teams: { teamA: [], teamB: [] }, score: { teamAScore: 0, teamBScore: 0 }, type: 'scored' },
    { teams: { teamA: [], teamB: [] }, score: { teamAScore: 0, teamBScore: 0, teamAWon: undefined }, type: 'winloss' },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const isAuth = sessionStorage.getItem('session_recorder_auth') === 'true';
    setIsAuthenticated(isAuth);
  }, []);

  const selectedPlayerObjects = players.filter(p => selectedPlayers.includes(p.name));

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
    setGames(prev => {
      const updated = [...prev];
      updated[gameIndex] = { 
        ...updated[gameIndex], 
        score: { ...updated[gameIndex].score, [field]: value } 
      };
      return updated;
    });
  };

  const handleTeamConfirm = (gameIndex: number, teamA: string[], teamB: string[]) => {
    setGames(prev => {
      const updated = [...prev];
      updated[gameIndex] = { 
        ...updated[gameIndex], 
        teams: { teamA, teamB } 
      };
      return updated;
    });
  };

  const addGame = () => {
    const newGameIndex = games.length;
    const newGameType = getGameType(newGameIndex);
    setGames(prev => [
      ...prev,
      { 
        teams: { teamA: [], teamB: [] }, 
        score: { teamAScore: 0, teamBScore: 0, teamAWon: undefined }, 
        type: newGameType 
      }
    ]);
  };

  const removeGame = (index: number) => {
    if (games.length <= 1) return;
    setGames(prev => prev.filter((_, i) => i !== index));
    // If we're on a step that no longer exists, go back
    if (typeof currentStep === 'number' && currentStep >= games.length - 1) {
      setCurrentStep(games.length - 2);
      setCurrentPhase('score');
    }
  };

  const navigateToGame = (gameIndex: number, phase: 'draft' | 'score') => {
    setCurrentStep(gameIndex);
    setCurrentPhase(phase);
  };

  const resetSession = () => {
    setSelectedPlayers([]);
    setCurrentStep('select');
    setCurrentPhase('draft');
    setGames([
      { teams: { teamA: [], teamB: [] }, score: { teamAScore: 0, teamBScore: 0 }, type: 'scored' },
      { teams: { teamA: [], teamB: [] }, score: { teamAScore: 0, teamBScore: 0 }, type: 'scored' },
      { teams: { teamA: [], teamB: [] }, score: { teamAScore: 0, teamBScore: 0, teamAWon: undefined }, type: 'winloss' },
    ]);
  };

  const isGameValid = (game: GameData): boolean => {
    const hasTeams = game.teams.teamA.length === 2 && game.teams.teamB.length === 2;
    if (!hasTeams) return false;
    
    if (game.type === 'winloss') {
      return game.score.teamAWon !== undefined;
    }
    return true; // Scored games are always valid if teams are set
  };

  const allGamesValid = games.every(isGameValid);
  const canSubmit = selectedPlayers.length === 4 && allGamesValid;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setIsSubmitting(true);

    try {
      const gamesToInsert = games.map((game, gameIndex) => {
        if (game.type === 'scored') {
          return {
            game_number: gameIndex + 1,
            team_a_player1: game.teams.teamA[0],
            team_a_player2: game.teams.teamA[1],
            team_b_player1: game.teams.teamB[0],
            team_b_player2: game.teams.teamB[1],
            team_a_score: game.score.teamAScore,
            team_b_score: game.score.teamBScore,
            winner: game.score.teamAScore > game.score.teamBScore ? 'A' : 'B',
          };
        } else {
          return {
            game_number: gameIndex + 1,
            team_a_player1: game.teams.teamA[0],
            team_a_player2: game.teams.teamA[1],
            team_b_player1: game.teams.teamB[0],
            team_b_player2: game.teams.teamB[1],
            team_a_score: null,
            team_b_score: null,
            winner: game.score.teamAWon ? 'A' : 'B',
          };
        }
      });

      const { error: insertError } = await supabase.from('session_games').insert(gamesToInsert);
      
      if (insertError) throw insertError;

      const { error: recalcError } = await supabase.rpc('recalculate_player_stats');
      
      if (recalcError) throw recalcError;

      toast({
        title: "Session Recorded!",
        description: `All ${games.length} game results and player stats have been updated.`,
      });

      resetSession();
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

  if (!isAuthenticated) {
    return <SessionPasswordGate onAuthenticated={() => setIsAuthenticated(true)} />;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Progress indicator - dynamic based on number of games
  const progressSteps = [
    { key: 'select', label: 'Players' },
    ...games.map((_, i) => ({ key: `game${i}`, label: getGameName(i) }))
  ];

  const getProgressIndex = () => {
    if (currentStep === 'select') return 0;
    return (currentStep as number) + 1;
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-header">Session Recorder</h1>
          <p className="text-muted-foreground mt-2 ml-5">
            Draft teams for each game and record scores
          </p>
        </div>
        {currentStep !== 'select' && (
          <Button variant="ghost" size="sm" onClick={resetSession} className="gap-2">
            <RotateCcw className="w-4 h-4" />
            Start Over
          </Button>
        )}
      </div>

      {/* Progress Bar */}
      <div className="bg-card rounded-lg border border-border p-4">
        <div className="flex items-center justify-between mb-2 overflow-x-auto gap-2">
          {progressSteps.map((step, index) => (
            <div 
              key={step.key}
              className={cn(
                "flex items-center gap-2 flex-shrink-0",
                index <= getProgressIndex() ? "text-primary" : "text-muted-foreground"
              )}
            >
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors",
                index < getProgressIndex() && "bg-primary text-primary-foreground",
                index === getProgressIndex() && "bg-primary/20 text-primary border-2 border-primary",
                index > getProgressIndex() && "bg-muted text-muted-foreground"
              )}>
                {index < getProgressIndex() ? <Check className="w-4 h-4" /> : index + 1}
              </div>
              <span className="hidden sm:inline text-sm font-medium whitespace-nowrap">{step.label}</span>
            </div>
          ))}
        </div>
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-primary rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${((getProgressIndex() + 1) / progressSteps.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        {/* Player Selection */}
        {currentStep === 'select' && (
          <motion.div
            key="select"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="bg-card rounded-lg border border-border p-6 shadow-card"
          >
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
                  ? "bg-primary/20 text-primary" 
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
                  <motion.button
                    key={player.id}
                    onClick={() => togglePlayer(player.name)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={cn(
                      "flex items-center gap-3 p-4 rounded-lg border-2 transition-all text-left",
                      isSelected
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-muted-foreground/30 bg-background"
                    )}
                  >
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center font-display font-bold",
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
                  </motion.button>
                );
              })}
            </div>

            {/* Game Count Manager */}
            {selectedPlayers.length === 4 && (
              <div className="mt-6 p-4 bg-muted/30 rounded-lg border border-border">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-medium text-foreground">Games to record: {games.length}</span>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={addGame}
                    className="gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Game
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {games.map((_, index) => (
                    <div 
                      key={index}
                      className="flex items-center gap-1 px-3 py-1.5 bg-background rounded-full border border-border"
                    >
                      <span className="text-sm font-medium">{getGameName(index)}</span>
                      {games.length > 1 && (
                        <button 
                          onClick={() => removeGame(index)}
                          className="ml-1 text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6">
              <Button
                onClick={() => navigateToGame(0, 'draft')}
                disabled={selectedPlayers.length !== 4}
                variant="atp"
                className="w-full gap-2"
              >
                Continue to Team Draft
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        )}

        {/* Game Steps - Dynamic */}
        {typeof currentStep === 'number' && games[currentStep] && (
          <>
            {currentPhase === 'draft' && (
              <motion.div
                key={`draft${currentStep}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className={cn(
                  "bg-card rounded-lg border-2 p-6 shadow-card",
                  currentStep === 0 && "border-primary/30",
                  currentStep === 1 && "border-secondary/30",
                  currentStep >= 2 && "border-gold/30"
                )}
              >
                <TeamDraft
                  players={selectedPlayerObjects}
                  gameNumber={currentStep + 1}
                  gameName={getGameName(currentStep)}
                  onConfirm={(teamA, teamB) => {
                    handleTeamConfirm(currentStep, teamA, teamB);
                    setCurrentPhase('score');
                  }}
                  onBack={() => {
                    if (currentStep === 0) {
                      setCurrentStep('select');
                    } else {
                      navigateToGame(currentStep - 1, 'score');
                    }
                  }}
                />
              </motion.div>
            )}

            {currentPhase === 'score' && (
              <motion.div
                key={`score${currentStep}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className={cn(
                  "bg-card rounded-lg border-2 p-6 shadow-card",
                  currentStep === 0 && "border-primary/30",
                  currentStep === 1 && "border-secondary/30",
                  currentStep >= 2 && "border-gold/30"
                )}
              >
                {games[currentStep].type === 'scored' ? (
                  <ScoreInput
                    gameNumber={currentStep + 1}
                    gameName={getGameName(currentStep)}
                    teams={games[currentStep].teams}
                    score={games[currentStep].score}
                    onScoreChange={(field, value) => updateGameScore(currentStep, field, value)}
                    onNext={() => {
                      if (currentStep < games.length - 1) {
                        navigateToGame(currentStep + 1, 'draft');
                      }
                    }}
                    onBack={() => setCurrentPhase('draft')}
                    isLastGame={currentStep === games.length - 1}
                    onSubmit={handleSubmit}
                    isSubmitting={isSubmitting}
                    canSubmit={canSubmit}
                  />
                ) : (
                  <TugOfWarInput
                    gameNumber={currentStep + 1}
                    gameName={getGameName(currentStep)}
                    teams={games[currentStep].teams}
                    teamAWon={games[currentStep].score.teamAWon}
                    onWinnerChange={(teamAWon) => updateGameScore(currentStep, 'teamAWon', teamAWon)}
                    onNext={() => {
                      if (currentStep < games.length - 1) {
                        navigateToGame(currentStep + 1, 'draft');
                      }
                    }}
                    onSubmit={handleSubmit}
                    onBack={() => setCurrentPhase('draft')}
                    isSubmitting={isSubmitting}
                    canSubmit={canSubmit}
                    isLastGame={currentStep === games.length - 1}
                  />
                )}
              </motion.div>
            )}
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// Score Input Component for scored games (PwC Single, Shibuya)
interface ScoreInputProps {
  gameNumber: number;
  gameName: string;
  teams: GameTeams;
  score: GameScore;
  onScoreChange: (field: keyof GameScore, value: number) => void;
  onNext: () => void;
  onBack: () => void;
  isLastGame: boolean;
  onSubmit: () => void;
  isSubmitting: boolean;
  canSubmit: boolean;
}

function ScoreInput({ 
  gameNumber, 
  gameName, 
  teams, 
  score, 
  onScoreChange, 
  onNext, 
  onBack,
  isLastGame,
  onSubmit,
  isSubmitting,
  canSubmit
}: ScoreInputProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center font-bold",
          gameNumber === 1 && "bg-primary/20 text-primary",
          gameNumber === 2 && "bg-secondary/40 text-secondary-foreground",
          gameNumber >= 3 && "bg-gold/20 text-gold"
        )}>
          {gameNumber}
        </div>
        <div>
          <h3 className="font-display text-lg font-bold text-foreground">{gameName}</h3>
          <p className="text-sm text-muted-foreground">Score 0-9 • Winners: 10pts • Losers: (Score/9)×10 pts</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-3">
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary">
            Team A
          </Badge>
          <div className="text-sm font-medium text-foreground">
            {teams.teamA.join(' & ')}
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Score (0-9)</Label>
            <Input
              type="number"
              min="0"
              max="9"
              value={score.teamAScore === 0 ? '' : score.teamAScore}
              onChange={(e) => {
                const val = e.target.value === '' ? 0 : Math.min(9, Math.max(0, parseInt(e.target.value) || 0));
                onScoreChange('teamAScore', val);
              }}
              onBlur={(e) => {
                if (e.target.value === '') onScoreChange('teamAScore', 0);
              }}
              placeholder="0"
              className="mt-1 text-center text-2xl font-bold h-14"
            />
          </div>
        </div>

        <div className="space-y-3">
          <Badge variant="outline" className="bg-secondary/20 text-secondary-foreground border-secondary">
            Team B
          </Badge>
          <div className="text-sm font-medium text-foreground">
            {teams.teamB.join(' & ')}
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Score (0-9)</Label>
            <Input
              type="number"
              min="0"
              max="9"
              value={score.teamBScore === 0 ? '' : score.teamBScore}
              onChange={(e) => {
                const val = e.target.value === '' ? 0 : Math.min(9, Math.max(0, parseInt(e.target.value) || 0));
                onScoreChange('teamBScore', val);
              }}
              onBlur={(e) => {
                if (e.target.value === '') onScoreChange('teamBScore', 0);
              }}
              placeholder="0"
              className="mt-1 text-center text-2xl font-bold h-14"
            />
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack} className="flex-1 gap-2">
          <ChevronLeft className="w-4 h-4" />
          Back
        </Button>
        {isLastGame ? (
          <Button
            onClick={onSubmit}
            variant="atp"
            className="flex-1 gap-2"
            disabled={!canSubmit || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground"></div>
                Recording...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Submit Session
              </>
            )}
          </Button>
        ) : (
          <Button variant="atp" onClick={onNext} className="flex-1 gap-2">
            Next Game
            <ChevronRight className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

// Tug of War Input Component (Win/Loss only)
interface TugOfWarInputProps {
  gameNumber: number;
  gameName: string;
  teams: GameTeams;
  teamAWon: boolean | undefined;
  onWinnerChange: (teamAWon: boolean) => void;
  onNext: () => void;
  onSubmit: () => void;
  onBack: () => void;
  isSubmitting: boolean;
  canSubmit: boolean;
  isLastGame: boolean;
}

function TugOfWarInput({ 
  gameNumber,
  gameName,
  teams, 
  teamAWon, 
  onWinnerChange, 
  onNext,
  onSubmit, 
  onBack, 
  isSubmitting, 
  canSubmit,
  isLastGame
}: TugOfWarInputProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center font-bold text-gold">
          {gameNumber}
        </div>
        <div>
          <h3 className="font-display text-lg font-bold text-foreground">{gameName}</h3>
          <p className="text-sm text-muted-foreground">Win/Loss only • Winners: 10pts • Losers: 5pts</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="p-4 rounded-lg border border-border bg-background">
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary mb-2">
            Team A
          </Badge>
          <div className="text-sm font-medium text-foreground">
            {teams.teamA.join(' & ')}
          </div>
        </div>
        <div className="p-4 rounded-lg border border-border bg-background">
          <Badge variant="outline" className="bg-secondary/20 text-secondary-foreground border-secondary mb-2">
            Team B
          </Badge>
          <div className="text-sm font-medium text-foreground">
            {teams.teamB.join(' & ')}
          </div>
        </div>
      </div>

      <div>
        <Label className="text-sm font-medium mb-3 block">Who Won?</Label>
        <div className="grid grid-cols-2 gap-4">
          <motion.button
            onClick={() => onWinnerChange(true)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={cn(
              "p-6 rounded-lg border-2 transition-all flex flex-col items-center justify-center gap-2",
              teamAWon === true
                ? "border-primary bg-primary/10 text-primary shadow-cyan"
                : "border-border hover:border-primary/50"
            )}
          >
            <Trophy className="w-8 h-8" />
            <span className="font-bold">Team A Won</span>
          </motion.button>
          <motion.button
            onClick={() => onWinnerChange(false)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={cn(
              "p-6 rounded-lg border-2 transition-all flex flex-col items-center justify-center gap-2",
              teamAWon === false
                ? "border-secondary bg-secondary/10 text-secondary-foreground shadow-card"
                : "border-border hover:border-secondary/50"
            )}
          >
            <Trophy className="w-8 h-8" />
            <span className="font-bold">Team B Won</span>
          </motion.button>
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <Button variant="outline" onClick={onBack} className="flex-1 gap-2">
          <ChevronLeft className="w-4 h-4" />
          Back
        </Button>
        {isLastGame ? (
          <Button
            onClick={onSubmit}
            variant="atp"
            className="flex-1 gap-2"
            disabled={!canSubmit || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground"></div>
                Recording...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Submit Session
              </>
            )}
          </Button>
        ) : (
          <Button 
            variant="atp" 
            onClick={onNext} 
            className="flex-1 gap-2"
            disabled={teamAWon === undefined}
          >
            Next Game
            <ChevronRight className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

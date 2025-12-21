import { useState } from 'react';
import { useMembers } from '@/contexts/MembersContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { 
  Users, 
  Swords, 
  Shuffle, 
  Trophy, 
  ArrowRight, 
  ArrowLeft,
  Check,
  Clock,
  Target,
  Package,
  Laugh,
  ThermometerSun,
  Send,
  Lock,
  Crown
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

interface GameResult {
  type: 'mini-single' | 'shibuya' | 'ladder';
  pairA: string[];
  pairB: string[];
  pairAScore?: number;
  pairBScore?: number;
  winner?: 'A' | 'B';
}

interface NobleRatings {
  punctuality: number;
  commitment: number;
  equipment: number;
  humor: number;
  sauna: number;
}

const nobleCategories = [
  { id: 'punctuality', label: 'Punctuality', question: 'Was everyone on time and ready?', icon: Clock },
  { id: 'commitment', label: 'Commitment', question: 'Commitment to a worthy session?', icon: Target },
  { id: 'equipment', label: 'Equipment', question: 'Adequate balls & professional standard?', icon: Package },
  { id: 'humor', label: 'Humor & Stories', question: 'Quality of jokes/storytelling?', icon: Laugh },
  { id: 'sauna', label: 'Sauna Session', question: 'Sauna Session Rating (0 if none)', icon: ThermometerSun },
];

export function SessionRecorder() {
  const { members, checkedInPlayers, submitForAssent } = useMembers();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  
  // Game states
  const [miniSingle, setMiniSingle] = useState<GameResult>({
    type: 'mini-single',
    pairA: [],
    pairB: [],
    pairAScore: 0,
    pairBScore: 0,
  });
  
  const [shibuya, setShibuya] = useState<GameResult>({
    type: 'shibuya',
    pairA: [],
    pairB: [],
    pairAScore: 0,
    pairBScore: 0,
  });
  
  const [ladder, setLadder] = useState<GameResult>({
    type: 'ladder',
    pairA: [],
    pairB: [],
    winner: undefined,
  });
  
  const [nobleRatings, setNobleRatings] = useState<NobleRatings>({
    punctuality: 5,
    commitment: 5,
    equipment: 5,
    humor: 5,
    sauna: 0,
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const checkedInMembers = members.filter(m => checkedInPlayers.includes(m.id));
  const hasQuartet = checkedInPlayers.length === 4;

  const steps = [
    { id: 0, title: 'Mini-Single', icon: Swords },
    { id: 1, title: 'Shibuya', icon: Shuffle },
    { id: 2, title: 'Ladder', icon: Trophy },
    { id: 3, title: 'Noble Standard', icon: Target },
  ];

  const togglePlayerInPair = (
    playerId: string,
    pair: 'A' | 'B',
    game: GameResult,
    setGame: (g: GameResult) => void
  ) => {
    const currentPairA = [...game.pairA];
    const currentPairB = [...game.pairB];
    
    // Remove from both pairs first
    const idxA = currentPairA.indexOf(playerId);
    const idxB = currentPairB.indexOf(playerId);
    if (idxA !== -1) currentPairA.splice(idxA, 1);
    if (idxB !== -1) currentPairB.splice(idxB, 1);
    
    // Add to selected pair if not already there and pair has space
    if (pair === 'A' && currentPairA.length < 2) {
      currentPairA.push(playerId);
    } else if (pair === 'B' && currentPairB.length < 2) {
      currentPairB.push(playerId);
    }
    
    setGame({ ...game, pairA: currentPairA, pairB: currentPairB });
  };

  const getPlayerPair = (playerId: string, game: GameResult): 'A' | 'B' | null => {
    if (game.pairA.includes(playerId)) return 'A';
    if (game.pairB.includes(playerId)) return 'B';
    return null;
  };

  const isStepValid = (step: number): boolean => {
    switch (step) {
      case 0:
        return miniSingle.pairA.length === 2 && miniSingle.pairB.length === 2;
      case 1:
        return shibuya.pairA.length === 2 && shibuya.pairB.length === 2;
      case 2:
        return ladder.pairA.length === 2 && ladder.pairB.length === 2 && ladder.winner !== undefined;
      case 3:
        return true;
      default:
        return false;
    }
  };

  const nobleStandard = Object.values(nobleRatings).reduce((a, b) => a + b, 0) / 5;

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-gold';
    if (score >= 6) return 'text-hunter-green';
    if (score >= 4) return 'text-terra-cotta';
    return 'text-destructive';
  };

  const handleSubmit = async () => {
    if (!user) return;
    
    setIsSubmitting(true);
    
    const games: GameResult[] = [miniSingle, shibuya, ladder];
    
    submitForAssent(games, nobleStandard, user.id);
    
    toast({
      title: "Submitted for Royal Assent",
      description: "The Scribe has spoken. All attendees must now verify the records.",
    });
    
    // Reset form
    setCurrentStep(0);
    setMiniSingle({ type: 'mini-single', pairA: [], pairB: [], pairAScore: 0, pairBScore: 0 });
    setShibuya({ type: 'shibuya', pairA: [], pairB: [], pairAScore: 0, pairBScore: 0 });
    setLadder({ type: 'ladder', pairA: [], pairB: [], winner: undefined });
    setNobleRatings({ punctuality: 5, commitment: 5, equipment: 5, humor: 5, sauna: 0 });
    setIsSubmitting(false);
  };

  const renderPlayerSelector = (
    game: GameResult,
    setGame: (g: GameResult) => void,
    pairALabel: string = 'Pair A',
    pairBLabel: string = 'Pair B'
  ) => (
    <div className="grid grid-cols-2 gap-4">
      {/* Pair A */}
      <div className="space-y-3">
        <Label className="font-serif font-semibold text-lg flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-terra-cotta" />
          {pairALabel}
        </Label>
        <div className="space-y-2">
          {checkedInMembers.map(member => {
            const currentPair = getPlayerPair(member.id, game);
            const isRoyal = member.role === 'royalty';
            return (
              <button
                key={member.id}
                onClick={() => togglePlayerInPair(member.id, 'A', game, setGame)}
                className={cn(
                  "w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-all text-left",
                  currentPair === 'A'
                    ? "border-terra-cotta bg-terra-cotta/10"
                    : currentPair === 'B'
                    ? "border-muted bg-muted/30 opacity-50"
                    : "border-border hover:border-terra-cotta/50"
                )}
              >
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center font-serif font-bold text-sm",
                  isRoyal ? "bg-gradient-noble" : "bg-gradient-peasant"
                )}>
                  {member.name[0]}
                </div>
                <span className="font-medium text-foreground">{member.name}</span>
                {isRoyal && (
                  <Crown className="w-4 h-4 text-primary ml-auto" />
                )}
              </button>
            );
          })}
        </div>
      </div>
      
      {/* Pair B */}
      <div className="space-y-3">
        <Label className="font-serif font-semibold text-lg flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-hunter-green" />
          {pairBLabel}
        </Label>
        <div className="space-y-2">
          {checkedInMembers.map(member => {
            const currentPair = getPlayerPair(member.id, game);
            const isRoyal = member.role === 'royalty';
            return (
              <button
                key={member.id}
                onClick={() => togglePlayerInPair(member.id, 'B', game, setGame)}
                className={cn(
                  "w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-all text-left",
                  currentPair === 'B'
                    ? "border-hunter-green bg-hunter-green/10"
                    : currentPair === 'A'
                    ? "border-muted bg-muted/30 opacity-50"
                    : "border-border hover:border-hunter-green/50"
                )}
              >
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center font-serif font-bold text-sm",
                  isRoyal ? "bg-gradient-noble" : "bg-gradient-peasant"
                )}>
                  {member.name[0]}
                </div>
                <span className="font-medium text-foreground">{member.name}</span>
                {isRoyal && (
                  <Crown className="w-4 h-4 text-primary ml-auto" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  // Check if user is logged in
  if (!user) {
    return (
      <div className="space-y-6 animate-fade-in-up">
        <div className="text-center">
          <h2 className="font-serif text-3xl font-bold text-foreground">
            Post-Match Report
          </h2>
          <p className="text-muted-foreground mt-1 font-serif-body italic">
            Chronicle the PwC session results
          </p>
        </div>
        
        <div className="bg-card rounded-lg border-2 border-destructive/30 p-8 shadow-card text-center">
          <Lock className="w-16 h-16 text-destructive/50 mx-auto mb-4" />
          <h3 className="font-serif text-xl font-semibold text-foreground mb-2">
            Authentication Required
          </h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            You must be logged in to record sessions.
          </p>
        </div>
      </div>
    );
  }

  if (!hasQuartet) {
    return (
      <div className="space-y-6 animate-fade-in-up">
        <div className="text-center">
          <h2 className="font-serif text-3xl font-bold text-foreground">
            Post-Match Report
          </h2>
          <p className="text-muted-foreground mt-1 font-serif-body italic">
            Chronicle the PwC session results
          </p>
        </div>
        
        <div className="bg-card rounded-lg border-2 border-destructive/30 p-8 shadow-card text-center">
          <Lock className="w-16 h-16 text-destructive/50 mx-auto mb-4" />
          <h3 className="font-serif text-xl font-semibold text-foreground mb-2">
            Access Restricted
          </h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            The Post-Match Report is only accessible once the Holy Quartet has been assembled. 
            Please check in exactly 4 players in the Session Scheduler first.
          </p>
          <div className="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Users className="w-4 h-4" />
            <span>Currently checked in: {checkedInPlayers.length}/4</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="text-center">
        <h2 className="font-serif text-3xl font-bold text-foreground">
          Post-Match Report
        </h2>
        <p className="text-muted-foreground mt-1 font-serif-body italic">
          Chronicle the PwC session results
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center gap-2 overflow-x-auto pb-2">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isActive = currentStep === idx;
          const isCompleted = currentStep > idx;
          return (
            <button
              key={step.id}
              onClick={() => setCurrentStep(idx)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded border transition-all whitespace-nowrap",
                isActive
                  ? "border-primary bg-primary/10"
                  : isCompleted
                  ? "border-secondary/50 bg-secondary/5"
                  : "border-border bg-background hover:border-primary/30"
              )}
            >
              {isCompleted ? (
                <Check className="w-4 h-4 text-secondary" />
              ) : (
                <Icon className={cn("w-4 h-4", isActive ? "text-primary" : "text-muted-foreground")} />
              )}
              <span className={cn(
                "font-medium text-sm",
                isActive ? "text-foreground" : "text-muted-foreground"
              )}>
                {step.title}
              </span>
            </button>
          );
        })}
      </div>

      {/* Step Content */}
      {currentStep === 0 && (
        <div className="bg-card rounded-lg border-2 border-terra-cotta/30 p-6 shadow-card space-y-6">
          <div className="flex items-center gap-3 border-b border-border pb-4">
            <div className="p-3 rounded-lg bg-terra-cotta/10">
              <Swords className="w-6 h-6 text-terra-cotta" />
            </div>
            <div>
              <h3 className="font-serif text-xl font-bold text-foreground">Game 1: Mini-Single</h3>
              <p className="text-sm text-muted-foreground">2v2 Doubles • Points count toward +/-</p>
            </div>
          </div>
          
          {renderPlayerSelector(miniSingle, setMiniSingle)}
          
          {miniSingle.pairA.length === 2 && miniSingle.pairB.length === 2 && (
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
              <div className="space-y-2">
                <Label className="text-terra-cotta font-semibold">Pair A Score</Label>
                <Input
                  type="number"
                  min="0"
                  value={miniSingle.pairAScore || ''}
                  onChange={(e) => setMiniSingle({ ...miniSingle, pairAScore: parseInt(e.target.value) || 0 })}
                  className="border-terra-cotta/30 focus:ring-terra-cotta"
                  placeholder="Points"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-hunter-green font-semibold">Pair B Score</Label>
                <Input
                  type="number"
                  min="0"
                  value={miniSingle.pairBScore || ''}
                  onChange={(e) => setMiniSingle({ ...miniSingle, pairBScore: parseInt(e.target.value) || 0 })}
                  className="border-hunter-green/30 focus:ring-hunter-green"
                  placeholder="Points"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {currentStep === 1 && (
        <div className="bg-card rounded-lg border-2 border-hunter-green/30 p-6 shadow-card space-y-6">
          <div className="flex items-center gap-3 border-b border-border pb-4">
            <div className="p-3 rounded-lg bg-hunter-green/10">
              <Shuffle className="w-6 h-6 text-hunter-green" />
            </div>
            <div>
              <h3 className="font-serif text-xl font-bold text-foreground">Game 2: Shibuya Crossing</h3>
              <p className="text-sm text-muted-foreground">2v2 Doubles • Teams may shuffle • Points count toward +/-</p>
            </div>
          </div>
          
          {renderPlayerSelector(shibuya, setShibuya)}
          
          {shibuya.pairA.length === 2 && shibuya.pairB.length === 2 && (
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
              <div className="space-y-2">
                <Label className="text-terra-cotta font-semibold">Pair A Score</Label>
                <Input
                  type="number"
                  min="0"
                  value={shibuya.pairAScore || ''}
                  onChange={(e) => setShibuya({ ...shibuya, pairAScore: parseInt(e.target.value) || 0 })}
                  className="border-terra-cotta/30 focus:ring-terra-cotta"
                  placeholder="Points"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-hunter-green font-semibold">Pair B Score</Label>
                <Input
                  type="number"
                  min="0"
                  value={shibuya.pairBScore || ''}
                  onChange={(e) => setShibuya({ ...shibuya, pairBScore: parseInt(e.target.value) || 0 })}
                  className="border-hunter-green/30 focus:ring-hunter-green"
                  placeholder="Points"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {currentStep === 2 && (
        <div className="bg-card rounded-lg border-2 border-gold/30 p-6 shadow-card space-y-6">
          <div className="flex items-center gap-3 border-b border-border pb-4">
            <div className="p-3 rounded-lg bg-gold/10">
              <Trophy className="w-6 h-6 text-gold" />
            </div>
            <div>
              <h3 className="font-serif text-xl font-bold text-foreground">Game 3: Ladder</h3>
              <p className="text-sm text-muted-foreground">2v2 Doubles • Binary result only • No point differential</p>
            </div>
          </div>
          
          {renderPlayerSelector(ladder, setLadder)}
          
          {ladder.pairA.length === 2 && ladder.pairB.length === 2 && (
            <div className="pt-4 border-t border-border">
              <Label className="text-gold font-semibold mb-3 block">Who Won?</Label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setLadder({ ...ladder, winner: 'A' })}
                  className={cn(
                    "p-4 rounded-lg border-2 transition-all text-center",
                    ladder.winner === 'A'
                      ? "border-gold bg-gold/10"
                      : "border-border hover:border-gold/50"
                  )}
                >
                  <Trophy className={cn(
                    "w-8 h-8 mx-auto mb-2",
                    ladder.winner === 'A' ? "text-gold" : "text-muted-foreground"
                  )} />
                  <span className="font-serif font-bold">Pair A Wins</span>
                  <p className="text-xs text-muted-foreground mt-1">
                    {ladder.pairA.map(id => members.find(m => m.id === id)?.name).join(' & ')}
                  </p>
                </button>
                <button
                  onClick={() => setLadder({ ...ladder, winner: 'B' })}
                  className={cn(
                    "p-4 rounded-lg border-2 transition-all text-center",
                    ladder.winner === 'B'
                      ? "border-gold bg-gold/10"
                      : "border-border hover:border-gold/50"
                  )}
                >
                  <Trophy className={cn(
                    "w-8 h-8 mx-auto mb-2",
                    ladder.winner === 'B' ? "text-gold" : "text-muted-foreground"
                  )} />
                  <span className="font-serif font-bold">Pair B Wins</span>
                  <p className="text-xs text-muted-foreground mt-1">
                    {ladder.pairB.map(id => members.find(m => m.id === id)?.name).join(' & ')}
                  </p>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {currentStep === 3 && (
        <div className="space-y-6">
          <div className="bg-card rounded-lg border-2 border-terra-cotta/30 p-6 shadow-card">
            <div className="flex items-center gap-3 border-b border-border pb-4 mb-6">
              <div className="p-3 rounded-lg bg-terra-cotta/10">
                <Target className="w-6 h-6 text-terra-cotta" />
              </div>
              <div>
                <h3 className="font-serif text-xl font-bold text-foreground">Step 4: Noble Standard Survey</h3>
                <p className="text-sm text-muted-foreground">Rate today's sacred session with honesty</p>
              </div>
            </div>
            
            <div className="space-y-8">
              {nobleCategories.map((category) => {
                const Icon = category.icon;
                return (
                  <div key={category.id} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-muted text-muted-foreground">
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-foreground">{category.label}</h4>
                          <p className="text-sm text-muted-foreground">{category.question}</p>
                        </div>
                      </div>
                      <span className={cn(
                        "font-serif font-bold text-xl min-w-[3rem] text-right",
                        getScoreColor(nobleRatings[category.id as keyof NobleRatings])
                      )}>
                        {nobleRatings[category.id as keyof NobleRatings].toFixed(1)}
                      </span>
                    </div>
                    <Slider
                      value={[nobleRatings[category.id as keyof NobleRatings]]}
                      onValueChange={(value) => setNobleRatings(prev => ({
                        ...prev,
                        [category.id]: value[0],
                      }))}
                      max={10}
                      step={0.1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>0 - Shameful</span>
                      <span>5 - Adequate</span>
                      <span>10 - Divine</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Noble Standard Preview */}
          <div className="bg-card rounded-lg border-2 border-gold/30 p-6 shadow-noble text-center">
            <h3 className="font-serif text-lg text-muted-foreground mb-2">
              Session Noble Standard
            </h3>
            <div className={cn(
              "font-serif text-5xl font-bold mb-2",
              getScoreColor(nobleStandard)
            )}>
              {nobleStandard.toFixed(2)}
            </div>
            <p className="text-sm text-muted-foreground">
              This score will be recorded for all 4 participants
            </p>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
          disabled={currentStep === 0}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>
        
        {currentStep < 3 ? (
          <Button
            variant="royal"
            onClick={() => setCurrentStep(prev => prev + 1)}
            disabled={!isStepValid(currentStep)}
          >
            Next Step
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        ) : (
          <Button
            variant="royal"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Recording...
              </span>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Submit Full Report
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
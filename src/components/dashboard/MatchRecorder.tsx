import { useState } from 'react';
import { useMembers } from '@/contexts/MembersContext';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CrownIcon } from '@/components/icons/CrownIcon';
import { DirtIcon } from '@/components/icons/DirtIcon';
import { Trophy, Skull, Plus, History } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

export function MatchRecorder() {
  const { members, matchHistory, recordMatch } = useMembers();
  const [winnerId, setWinnerId] = useState('');
  const [loserId, setLoserId] = useState('');
  const [winnerScore, setWinnerScore] = useState('');
  const [loserScore, setLoserScore] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!winnerId || !loserId) {
      toast({
        title: "Incomplete Selection",
        description: "Both a victor and a vanquished must be selected.",
        variant: "destructive",
      });
      return;
    }

    if (winnerId === loserId) {
      toast({
        title: "Invalid Match",
        description: "One cannot defeat oneself... or can they?",
        variant: "destructive",
      });
      return;
    }

    const wScore = parseInt(winnerScore) || 0;
    const lScore = parseInt(loserScore) || 0;

    if (wScore <= lScore) {
      toast({
        title: "Score Error",
        description: "The victor's score must exceed the vanquished.",
        variant: "destructive",
      });
      return;
    }

    recordMatch(winnerId, loserId, wScore, lScore);
    
    const winner = members.find(m => m.id === winnerId);
    const loser = members.find(m => m.id === loserId);
    
    toast({
      title: "Match Recorded",
      description: `${winner?.name} has triumphed over ${loser?.name}. The scoreboard has been updated.`,
    });

    setWinnerId('');
    setLoserId('');
    setWinnerScore('');
    setLoserScore('');
  };

  const getMemberById = (id: string) => members.find(m => m.id === id);

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="text-center">
        <h2 className="font-serif text-3xl font-bold text-foreground">
          Record Match Result
        </h2>
        <p className="text-muted-foreground mt-1 font-serif-body italic">
          Chronicle the glory and the shame
        </p>
      </div>

      {/* Match Recording Form */}
      <div className="bg-card rounded-lg border border-border p-6 shadow-card">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Winner */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-gold" />
                <Label className="font-serif font-semibold text-lg text-gold">The Victor</Label>
              </div>
              <Select value={winnerId} onValueChange={setWinnerId}>
                <SelectTrigger className="w-full border-gold/30 focus:ring-gold">
                  <SelectValue placeholder="Select the glorious winner" />
                </SelectTrigger>
                <SelectContent>
                  {members.map(member => (
                    <SelectItem key={member.id} value={member.id} disabled={member.id === loserId}>
                      <div className="flex items-center gap-2">
                        {member.role === 'royalty' ? (
                          <CrownIcon className="w-4 h-4 text-gold" />
                        ) : (
                          <DirtIcon className="w-4 h-4 text-burlap" />
                        )}
                        {member.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="space-y-1">
                <Label className="text-sm text-muted-foreground">Winner's Score</Label>
                <Input
                  type="number"
                  min="0"
                  value={winnerScore}
                  onChange={(e) => setWinnerScore(e.target.value)}
                  placeholder="Points scored"
                  className="border-gold/30 focus:ring-gold"
                />
              </div>
            </div>

            {/* Loser */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Skull className="w-5 h-5 text-destructive/70" />
                <Label className="font-serif font-semibold text-lg text-destructive/70">The Vanquished</Label>
              </div>
              <Select value={loserId} onValueChange={setLoserId}>
                <SelectTrigger className="w-full border-destructive/30 focus:ring-destructive">
                  <SelectValue placeholder="Select the defeated" />
                </SelectTrigger>
                <SelectContent>
                  {members.map(member => (
                    <SelectItem key={member.id} value={member.id} disabled={member.id === winnerId}>
                      <div className="flex items-center gap-2">
                        {member.role === 'royalty' ? (
                          <CrownIcon className="w-4 h-4 text-gold" />
                        ) : (
                          <DirtIcon className="w-4 h-4 text-burlap" />
                        )}
                        {member.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="space-y-1">
                <Label className="text-sm text-muted-foreground">Loser's Score</Label>
                <Input
                  type="number"
                  min="0"
                  value={loserScore}
                  onChange={(e) => setLoserScore(e.target.value)}
                  placeholder="Points scored"
                  className="border-destructive/30 focus:ring-destructive"
                />
              </div>
            </div>
          </div>

          <Button type="submit" variant="royal" size="lg" className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Record This Historic Match
          </Button>
        </form>
      </div>

      {/* Match History */}
      <div className="bg-card rounded-lg border border-border p-6 shadow-card">
        <div className="flex items-center gap-2 mb-4">
          <History className="w-5 h-5 text-muted-foreground" />
          <h3 className="font-serif text-xl font-semibold text-foreground">Recent Battles</h3>
        </div>
        
        {matchHistory.length === 0 ? (
          <p className="text-muted-foreground text-center py-8 italic">
            No matches have been recorded yet. The history awaits its first chapter.
          </p>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {matchHistory.slice(0, 10).map((match) => {
              const winner = getMemberById(match.winnerId);
              const loser = getMemberById(match.loserId);
              const isWinnerRoyal = winner?.role === 'royalty';
              const isLoserRoyal = loser?.role === 'royalty';
              
              return (
                <div
                  key={match.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border"
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center font-serif font-bold",
                      isWinnerRoyal ? "bg-gradient-noble" : "bg-gradient-peasant"
                    )}>
                      {winner?.name[0]}
                    </div>
                    <div>
                      <div className="flex items-center gap-1">
                        <span className="font-semibold text-hunter-green">{winner?.name}</span>
                        {isWinnerRoyal ? (
                          <CrownIcon className="w-3 h-3 text-gold" />
                        ) : (
                          <DirtIcon className="w-3 h-3 text-burlap" />
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">Victor</span>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <span className="font-serif font-bold text-lg">
                      {match.winnerScore} - {match.loserScore}
                    </span>
                    <p className="text-xs text-muted-foreground">
                      {new Date(match.date).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div>
                      <div className="flex items-center gap-1 justify-end">
                        <span className="font-semibold text-destructive/70">{loser?.name}</span>
                        {isLoserRoyal ? (
                          <CrownIcon className="w-3 h-3 text-gold" />
                        ) : (
                          <DirtIcon className="w-3 h-3 text-burlap" />
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground text-right block">Vanquished</span>
                    </div>
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center font-serif font-bold",
                      isLoserRoyal ? "bg-gradient-noble" : "bg-gradient-peasant"
                    )}>
                      {loser?.name[0]}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

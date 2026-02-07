import { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Vote, Trophy, CheckCircle2, Clock, Loader2, PartyPopper, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { members } from '@/data/members';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface PendingVoter {
  id: string;
  display_name: string | null;
}

interface VoteResult {
  vote_option: string;
  count: number;
}

const voteOptions = [
  {
    value: 'last_singles',
    label: 'Last place in singles',
    description: 'The person finishing last in the singles table (based on average points)',
  },
  {
    value: 'last_two_singles',
    label: 'Last two in singles',
    description: 'The two people finishing last in the singles table (based on average points)',
  },
  {
    value: 'last_two_doubles',
    label: 'Last two in doubles',
    description: 'The two individuals finishing last on the doubles table (based on average points)',
  },
];

// Vibrant avatar colors for pending voters
const avatarColors = [
  'from-pink-500 to-rose-500',
  'from-violet-500 to-purple-500',
  'from-cyan-400 to-blue-500',
  'from-emerald-400 to-teal-500',
  'from-orange-400 to-amber-500',
  'from-fuchsia-500 to-pink-500',
];

// Stadium-style progress pips component
function StadiumPips({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center justify-center gap-1.5 py-2">
      {Array.from({ length: total }).map((_, i) => {
        const isFilled = i < current;
        return (
          <div
            key={i}
            className={cn(
              'w-3 h-6 rounded-full transition-all duration-500',
              isFilled
                ? 'bg-gradient-to-t from-primary to-primary/70 shadow-[0_0_12px_hsl(var(--primary)/0.6)] animate-pulse'
                : 'bg-muted/40 border border-border/50'
            )}
            style={{
              animationDelay: isFilled ? `${i * 100}ms` : undefined,
              animationDuration: '2s',
            }}
          />
        );
      })}
    </div>
  );
}

// Animated gradient border wrapper
function GradientBorderCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('relative p-[2px] rounded-lg overflow-hidden', className)}>
      {/* Animated gradient border */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary via-accent to-gold animate-gradient-x" />
      {/* Inner content */}
      <div className="relative bg-card rounded-[6px] overflow-hidden">
        {children}
      </div>
    </div>
  );
}

export function PartyVoting() {
  const { user } = useAuth();
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [hasVoted, setHasVoted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [voteCount, setVoteCount] = useState(0);
  const [voteResults, setVoteResults] = useState<VoteResult[]>([]);
  const [allVoted, setAllVoted] = useState(false);
  const [pendingVoters, setPendingVoters] = useState<PendingVoter[]>([]);
  const confettiTriggered = useRef(false);
  const voteConfettiTriggered = useRef(false);

  const totalMembers = members.length;

  // Trigger grand confetti when results are revealed
  useEffect(() => {
    if (allVoted && !confettiTriggered.current) {
      confettiTriggered.current = true;
      
      const duration = 4000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 4,
          angle: 60,
          spread: 65,
          origin: { x: 0, y: 0.6 },
          colors: ['#00d4ff', '#fbbf24', '#a855f7', '#22d3ee', '#f472b6'],
        });
        confetti({
          particleCount: 4,
          angle: 120,
          spread: 65,
          origin: { x: 1, y: 0.6 },
          colors: ['#00d4ff', '#fbbf24', '#a855f7', '#22d3ee', '#f472b6'],
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };

      frame();
    }
  }, [allVoted]);

  // Trigger brief confetti burst when user votes
  const triggerVoteConfetti = () => {
    if (voteConfettiTriggered.current) return;
    voteConfettiTriggered.current = true;

    confetti({
      particleCount: 80,
      spread: 100,
      origin: { x: 0.5, y: 0.6 },
      colors: ['#00d4ff', '#fbbf24', '#a855f7', '#22d3ee', '#10b981'],
      scalar: 0.8,
    });
  };

  useEffect(() => {
    if (user) {
      checkVotingStatus();
    }
  }, [user]);

  const checkVotingStatus = async () => {
    if (!user) return;

    try {
      const { data: userVote } = await supabase
        .from('party_votes')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      setHasVoted(!!userVote);

      const { data: votes } = await supabase
        .from('party_votes')
        .select('user_id');

      const votedUserIds = votes?.map(v => v.user_id) || [];
      const currentVoteCount = votedUserIds.length;
      setVoteCount(currentVoteCount);
      setAllVoted(currentVoteCount >= totalMembers);

      if (currentVoteCount >= totalMembers) {
        await fetchResults();
      } else {
        const { data: allProfiles } = await supabase
          .from('user_profiles')
          .select('id, display_name');

        if (allProfiles) {
          const pending = allProfiles.filter(
            profile => !votedUserIds.includes(profile.id)
          );
          setPendingVoters(pending);
        }
      }
    } catch (error) {
      console.error('Error checking voting status:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchResults = async () => {
    const { data, error } = await supabase
      .from('party_votes')
      .select('vote_option');

    if (!error && data) {
      const counts: Record<string, number> = {};
      data.forEach((vote) => {
        counts[vote.vote_option] = (counts[vote.vote_option] || 0) + 1;
      });

      const results = Object.entries(counts).map(([vote_option, count]) => ({
        vote_option,
        count,
      }));

      results.sort((a, b) => b.count - a.count);
      setVoteResults(results);
    }
  };

  const handleSubmit = async () => {
    if (!selectedOption || !user) return;

    setSubmitting(true);
    try {
      const { error } = await supabase.from('party_votes').insert({
        user_id: user.id,
        vote_option: selectedOption,
      });

      if (error) {
        if (error.code === '23505') {
          setHasVoted(true);
        }
        console.error('Error submitting vote:', error);
      } else {
        triggerVoteConfetti();
        setHasVoted(true);
        await checkVotingStatus();
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const getOptionLabel = (value: string) => {
    return voteOptions.find((opt) => opt.value === value)?.label || value;
  };

  if (loading) {
    return (
      <GradientBorderCard>
        <CardContent className="py-12 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </CardContent>
      </GradientBorderCard>
    );
  }

  // Show results if all members have voted
  if (allVoted) {
    const maxVotes = Math.max(...voteResults.map((r) => r.count), 1);
    const tiedOptions = voteResults.filter((r) => r.count === maxVotes);
    const isTie = tiedOptions.length > 1;

    return (
      <GradientBorderCard className="animate-fade-in">
        {/* Celebratory Header */}
        <div className="relative bg-gradient-to-br from-primary/20 via-accent/10 to-gold/20 px-6 py-5 border-b border-border overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.15),transparent_70%)]" />
          <div className="relative flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gold to-primary flex items-center justify-center shadow-[0_0_20px_hsl(var(--gold)/0.4)]">
              <Trophy className="w-6 h-6 text-background" />
            </div>
            <div>
              <h3 className="font-display text-lg font-black text-foreground tracking-tight uppercase">
                Vote Results
              </h3>
              <p className="text-xs text-muted-foreground font-medium">
                All {totalMembers} members have voted!
              </p>
            </div>
            <PartyPopper className="w-5 h-5 text-gold ml-auto animate-bounce" />
          </div>
        </div>

        <CardContent className="p-6 space-y-5">
          {/* Tie notification */}
          {isTie && (
            <div className="flex items-center gap-3 p-4 bg-warning/10 border border-warning/30 rounded-lg">
              <span className="text-2xl">⚖️</span>
              <div>
                <p className="font-display font-bold text-foreground">It's a tie!</p>
                <p className="text-xs text-muted-foreground">
                  {tiedOptions.length} options have {maxVotes} vote{maxVotes !== 1 ? 's' : ''} each
                </p>
              </div>
            </div>
          )}

          {/* Results with stadium-style bars */}
          <div className="space-y-4">
            {voteResults.map((result, index) => {
              const isLeader = result.count === maxVotes;
              const percentage = Math.round((result.count / totalMembers) * 100);
              
              return (
                <div
                  key={result.vote_option}
                  className={cn(
                    'relative p-4 rounded-lg border transition-all overflow-hidden',
                    isLeader
                      ? isTie
                        ? 'bg-warning/10 border-warning/40'
                        : 'bg-primary/10 border-primary/40 shadow-[0_0_20px_hsl(var(--primary)/0.2)]'
                      : 'bg-muted/20 border-border/50'
                  )}
                >
                  {/* Background fill bar */}
                  <div
                    className={cn(
                      'absolute inset-y-0 left-0 transition-all duration-1000 ease-out',
                      isLeader && !isTie
                        ? 'bg-gradient-to-r from-primary/20 to-transparent'
                        : 'bg-gradient-to-r from-muted/30 to-transparent'
                    )}
                    style={{ width: `${percentage}%` }}
                  />
                  
                  <div className="relative flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="font-display font-bold text-foreground">
                        {getOptionLabel(result.vote_option)}
                      </span>
                      {isLeader && (
                        <span className={cn(
                          'text-[10px] px-2 py-1 rounded-full font-black uppercase tracking-wider',
                          isTie 
                            ? 'bg-warning/20 text-warning' 
                            : 'bg-primary/20 text-primary shadow-[0_0_10px_hsl(var(--primary)/0.3)]'
                        )}>
                          {isTie ? '🤝 Tied' : '🏆 Winner'}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-lg text-foreground tabular-nums">
                        {result.count}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        ({percentage}%)
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </GradientBorderCard>
    );
  }

  // Show voting form or waiting state
  return (
    <GradientBorderCard className="animate-fade-in">
      {/* Celebratory Header */}
      <div className="relative bg-gradient-to-br from-primary/15 via-accent/10 to-gold/15 px-6 py-5 border-b border-border overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.1),transparent_70%)]" />
        <div className="relative flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-[0_0_20px_hsl(var(--primary)/0.4)]">
            <Vote className="w-6 h-6 text-background" />
          </div>
          <div>
            <h3 className="font-display text-lg font-black text-foreground tracking-tight uppercase flex items-center gap-2">
              Season Finale Vote
              <Sparkles className="w-4 h-4 text-gold" />
            </h3>
            <p className="text-xs text-muted-foreground font-medium">
              Who organizes the party?
            </p>
          </div>
        </div>
      </div>

      <CardContent className="p-6 space-y-5">
        {/* Stadium-style progress */}
        <div className="bg-muted/20 rounded-lg p-4 border border-border/50">
          <div className="flex items-center justify-between mb-2">
            <span className="font-display font-bold text-sm text-foreground uppercase tracking-wide">
              Votes Cast
            </span>
            <span className="font-mono font-black text-lg text-primary tabular-nums">
              {voteCount}/{totalMembers}
            </span>
          </div>
          <StadiumPips current={voteCount} total={totalMembers} />
        </div>

        {hasVoted ? (
          // User has voted - waiting state
          <div className="text-center py-6 space-y-5">
            <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-[0_0_30px_hsl(var(--primary)/0.4)]">
              <CheckCircle2 className="w-8 h-8 text-background" />
            </div>
            <div>
              <p className="font-display font-black text-xl text-foreground">Vote Submitted!</p>
              <p className="text-sm text-muted-foreground mt-1">
                Waiting for {totalMembers - voteCount} more member{totalMembers - voteCount !== 1 ? 's' : ''}
              </p>
            </div>

            {/* Pending voters with pulsing glow */}
            {pendingVoters.length > 0 && (
              <div className="pt-4 border-t border-border/50">
                <p className="font-display font-bold text-xs text-muted-foreground mb-4 uppercase tracking-wider">
                  Still need to vote
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                  {pendingVoters.map((voter, i) => {
                    const initials = voter.display_name
                      ? voter.display_name.slice(0, 2).toUpperCase()
                      : '??';
                    const colorClass = avatarColors[i % avatarColors.length];
                    
                    return (
                      <div key={voter.id} className="flex flex-col items-center gap-1.5 group">
                        <div className="relative">
                          {/* Pulsing glow ring */}
                          <div className={cn(
                            'absolute -inset-1 rounded-full bg-gradient-to-r opacity-75 blur-sm animate-pulse',
                            colorClass
                          )} />
                          <Avatar className="relative w-10 h-10 border-2 border-background">
                            <AvatarFallback className={cn(
                              'bg-gradient-to-br text-white font-bold text-xs',
                              colorClass
                            )}>
                              {initials}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                        <span className="text-[10px] font-medium text-muted-foreground max-w-[60px] truncate group-hover:text-foreground transition-colors">
                          {voter.display_name || 'Unknown'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground bg-muted/20 rounded-full px-4 py-2 mx-auto w-fit">
              <Clock className="w-3.5 h-3.5 animate-pulse" />
              <span className="font-medium">Results reveal when everyone votes</span>
            </div>
          </div>
        ) : (
          // Voting form
          <>
            <div>
              <h4 className="font-display font-bold text-foreground mb-1">
                Who should arrange the end of season party?
              </h4>
              <p className="text-xs text-muted-foreground">
                Select one option below
              </p>
            </div>

            <RadioGroup
              value={selectedOption}
              onValueChange={setSelectedOption}
              className="space-y-3"
            >
              {voteOptions.map((option) => (
                <div
                  key={option.value}
                  className={cn(
                    'relative flex items-start gap-3 p-4 rounded-lg border transition-all cursor-pointer',
                    selectedOption === option.value
                      ? 'bg-primary/10 border-primary/50 shadow-[0_0_15px_hsl(var(--primary)/0.2)]'
                      : 'bg-muted/10 border-border/50 hover:bg-muted/30 hover:border-border'
                  )}
                  onClick={() => setSelectedOption(option.value)}
                >
                  <RadioGroupItem
                    value={option.value}
                    id={option.value}
                    className="mt-0.5 border-primary/50 text-primary"
                  />
                  <Label
                    htmlFor={option.value}
                    className="flex-1 cursor-pointer"
                  >
                    <span className="font-display font-bold text-foreground block">
                      {option.label}
                    </span>
                    <span className="text-xs text-muted-foreground mt-1 block">
                      {option.description}
                    </span>
                  </Label>
                </div>
              ))}
            </RadioGroup>

            <Button
              onClick={handleSubmit}
              disabled={!selectedOption || submitting}
              className="w-full h-12 font-display font-black text-base uppercase tracking-wide bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-[0_0_20px_hsl(var(--primary)/0.3)] transition-all"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Vote className="w-5 h-5 mr-2" />
                  Cast Your Vote
                </>
              )}
            </Button>
          </>
        )}
      </CardContent>
    </GradientBorderCard>
  );
}

import { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Vote, Trophy, Users, CheckCircle2, Clock, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { members } from '@/data/members';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

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

  const totalMembers = members.length;

  // Trigger confetti when results are revealed
  useEffect(() => {
    if (allVoted && !confettiTriggered.current) {
      confettiTriggered.current = true;
      
      // Fire confetti from both sides
      const duration = 3000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.6 },
          colors: ['#00d4ff', '#0ea5e9', '#22d3ee', '#06b6d4', '#14b8a6'],
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.6 },
          colors: ['#00d4ff', '#0ea5e9', '#22d3ee', '#06b6d4', '#14b8a6'],
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };

      frame();
    }
  }, [allVoted]);

  useEffect(() => {
    if (user) {
      checkVotingStatus();
    }
  }, [user]);

  const checkVotingStatus = async () => {
    if (!user) return;

    try {
      // Check if current user has voted
      const { data: userVote } = await supabase
        .from('party_votes')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      setHasVoted(!!userVote);

      // Get all votes with user_ids
      const { data: votes } = await supabase
        .from('party_votes')
        .select('user_id');

      const votedUserIds = votes?.map(v => v.user_id) || [];
      const currentVoteCount = votedUserIds.length;
      setVoteCount(currentVoteCount);
      setAllVoted(currentVoteCount >= totalMembers);

      // If all have voted, get results
      if (currentVoteCount >= totalMembers) {
        await fetchResults();
      } else {
        // Fetch all user profiles to determine who hasn't voted
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
      // Count votes for each option
      const counts: Record<string, number> = {};
      data.forEach((vote) => {
        counts[vote.vote_option] = (counts[vote.vote_option] || 0) + 1;
      });

      const results = Object.entries(counts).map(([vote_option, count]) => ({
        vote_option,
        count,
      }));

      // Sort by count descending
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
        setHasVoted(true);
        // Refresh vote count
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
      <Card className="bg-card border-border shadow-card">
        <CardContent className="py-8 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  // Show results if all members have voted
  if (allVoted) {
    const maxVotes = Math.max(...voteResults.map((r) => r.count), 1);
    const leadingOption = voteResults[0];

    return (
      <Card className="bg-card border-border shadow-card overflow-hidden animate-fade-in-up">
        <CardHeader className="bg-secondary/50 px-5 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-1 h-5 bg-primary rounded-full shadow-[0_0_6px_hsl(var(--primary)/0.4)]" />
            <Trophy className="w-4 h-4 text-primary" />
            <h3 className="text-[11px] font-bold text-foreground uppercase tracking-widest">
              Party Organizer Vote Results
            </h3>
          </div>
        </CardHeader>
        <CardContent className="p-5 space-y-4">
          <p className="text-sm text-muted-foreground">
            All {totalMembers} members have voted! Here are the results:
          </p>

          <div className="space-y-3">
            {voteResults.map((result, index) => (
              <div
                key={result.vote_option}
                className={`p-3 rounded-md border transition-all ${
                  index === 0
                    ? 'bg-primary/10 border-primary/30'
                    : 'bg-muted/30 border-border/50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-foreground">
                      {getOptionLabel(result.vote_option)}
                    </span>
                    {index === 0 && (
                      <span className="text-[9px] px-1.5 py-0.5 bg-primary/20 text-primary rounded font-bold uppercase tracking-wide">
                        Winner
                      </span>
                    )}
                  </div>
                  <span className="text-sm font-mono font-bold text-foreground tabular-nums">
                    {result.count} vote{result.count !== 1 ? 's' : ''}
                  </span>
                </div>
                <Progress
                  value={(result.count / maxVotes) * 100}
                  className="h-2"
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show voting form or waiting state
  return (
    <Card className="bg-card border-border shadow-card overflow-hidden animate-fade-in-up">
      <CardHeader className="bg-secondary/50 px-5 py-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-1 h-5 bg-primary rounded-full shadow-[0_0_6px_hsl(var(--primary)/0.4)]" />
          <Vote className="w-4 h-4 text-primary" />
          <h3 className="text-[11px] font-bold text-foreground uppercase tracking-widest">
            End of Season Party Vote
          </h3>
        </div>
      </CardHeader>
      <CardContent className="p-5 space-y-4">
        {/* Progress indicator */}
        <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-md border border-border/50">
          <Users className="w-4 h-4 text-muted-foreground" />
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted-foreground">Votes cast</span>
              <span className="text-xs font-mono font-bold text-foreground tabular-nums">
                {voteCount}/{totalMembers}
              </span>
            </div>
            <Progress value={(voteCount / totalMembers) * 100} className="h-1.5" />
          </div>
        </div>

        {hasVoted ? (
          // User has voted but waiting for others
          <div className="text-center py-4 space-y-4">
            <div className="w-12 h-12 mx-auto rounded-full bg-primary/15 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Vote submitted!</p>
              <p className="text-xs text-muted-foreground mt-1">
                Waiting for {totalMembers - voteCount} more member{totalMembers - voteCount !== 1 ? 's' : ''} to vote
              </p>
            </div>

            {/* Pending voters display */}
            {pendingVoters.length > 0 && (
              <div className="pt-2 border-t border-border/50">
                <p className="text-xs text-muted-foreground mb-2">Still need to vote:</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {pendingVoters.map((voter) => {
                    const initials = voter.display_name
                      ? voter.display_name.slice(0, 2).toUpperCase()
                      : '??';
                    return (
                      <div key={voter.id} className="flex flex-col items-center gap-1">
                        <Avatar className="w-8 h-8 border border-border/50">
                          <AvatarFallback className="bg-muted text-muted-foreground text-xs font-medium">
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-[10px] text-muted-foreground max-w-[50px] truncate">
                          {voter.display_name || 'Unknown'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              <span>Results will appear when everyone has voted</span>
            </div>
          </div>
        ) : (
          // Voting form
          <>
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-1">
                Who should arrange the end of season party?
              </h4>
              <p className="text-xs text-muted-foreground">
                Select one option below
              </p>
            </div>

            <RadioGroup
              value={selectedOption}
              onValueChange={setSelectedOption}
              className="space-y-2"
            >
              {voteOptions.map((option) => (
                <div
                  key={option.value}
                  className={`relative flex items-start gap-3 p-3 rounded-md border transition-all cursor-pointer ${
                    selectedOption === option.value
                      ? 'bg-primary/10 border-primary/40 shadow-[0_0_8px_hsl(var(--primary)/0.15)]'
                      : 'bg-muted/20 border-border/50 hover:bg-muted/40 hover:border-border'
                  }`}
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
                    <span className="text-sm font-semibold text-foreground block">
                      {option.label}
                    </span>
                    <span className="text-xs text-muted-foreground mt-0.5 block">
                      {option.description}
                    </span>
                  </Label>
                </div>
              ))}
            </RadioGroup>

            <Button
              onClick={handleSubmit}
              disabled={!selectedOption || submitting}
              variant="atp"
              className="w-full"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Vote className="w-4 h-4 mr-2" />
                  Submit Vote
                </>
              )}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}

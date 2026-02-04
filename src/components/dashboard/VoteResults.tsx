import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { Vote, Users, Trophy, TrendingUp } from 'lucide-react';
import { PasswordModal } from './PasswordModal';

interface VoteTally {
  option: string;
  count: number;
  label: string;
  description: string;
}

const VOTE_OPTIONS = {
  last_singles: {
    label: 'Last in Singles',
    description: 'The person finishing last in the singles table',
  },
  last_two_singles: {
    label: 'Last Two in Singles',
    description: 'The two people finishing last in the singles table',
  },
  last_two_doubles: {
    label: 'Last Two in Doubles',
    description: 'The two individuals finishing last on the doubles table',
  },
};

export function VoteResults() {
  const [tallies, setTallies] = useState<VoteTally[]>([]);
  const [totalVotes, setTotalVotes] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      fetchVoteResults();
    }
  }, [isAuthenticated]);

  const fetchVoteResults = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('party_votes')
      .select('vote_option');

    if (error) {
      toast({
        title: 'Error fetching votes',
        description: error.message,
        variant: 'destructive',
      });
      setLoading(false);
      return;
    }

    // Count votes for each option
    const counts: Record<string, number> = {
      last_singles: 0,
      last_two_singles: 0,
      last_two_doubles: 0,
    };

    data?.forEach((vote) => {
      if (counts[vote.vote_option] !== undefined) {
        counts[vote.vote_option]++;
      }
    });

    const total = Object.values(counts).reduce((sum, count) => sum + count, 0);
    setTotalVotes(total);

    const results: VoteTally[] = Object.entries(counts).map(([option, count]) => ({
      option,
      count,
      label: VOTE_OPTIONS[option as keyof typeof VOTE_OPTIONS]?.label || option,
      description: VOTE_OPTIONS[option as keyof typeof VOTE_OPTIONS]?.description || '',
    }));

    // Sort by count descending
    results.sort((a, b) => b.count - a.count);
    setTallies(results);
    setLoading(false);
  };

  const handlePasswordSuccess = () => {
    setIsAuthenticated(true);
    setShowPasswordModal(false);
  };

  const getPercentage = (count: number) => {
    if (totalVotes === 0) return 0;
    return Math.round((count / totalVotes) * 100);
  };

  const getPositionIcon = (index: number) => {
    if (index === 0) return <Trophy className="h-5 w-5 text-yellow-500" />;
    return null;
  };

  if (!isAuthenticated) {
    return (
      <PasswordModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        onAuthenticated={handlePasswordSuccess}
        title="Vote Results Access"
        description="Enter the manager password to view voting results."
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-display font-black text-foreground uppercase tracking-tight flex items-center gap-3">
          <Vote className="h-7 w-7 text-primary" />
          Vote Results
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          End of season party arrangement poll results
        </p>
      </div>

      {/* Summary Card */}
      <Card className="border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
              <Users className="h-7 w-7 text-primary" />
            </div>
            <div>
              <p className="text-3xl font-display font-black text-foreground">{totalVotes}</p>
              <p className="text-sm text-muted-foreground uppercase tracking-wide">
                Total Votes Cast
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 bg-muted/50 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {tallies.map((tally, index) => {
            const percentage = getPercentage(tally.count);
            const isLeading = index === 0 && tally.count > 0;

            return (
              <Card
                key={tally.option}
                className={`relative overflow-hidden transition-all ${
                  isLeading ? 'border-primary/50 shadow-lg' : ''
                }`}
              >
                {/* Progress bar background */}
                <div
                  className="absolute inset-0 bg-primary/10 transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                />

                <CardContent className="relative p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {getPositionIcon(index)}
                        <h3 className="font-display font-bold text-foreground uppercase tracking-tight">
                          {tally.label}
                        </h3>
                        {isLeading && (
                          <Badge className="bg-primary text-primary-foreground text-xs">
                            Leading
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{tally.description}</p>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="text-2xl font-display font-black text-foreground">
                        {tally.count}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {percentage}%
                      </p>
                    </div>
                  </div>

                  {/* Visual progress indicator */}
                  <div className="mt-4 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isLeading ? 'bg-primary' : 'bg-muted-foreground/30'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Info footer */}
      <Card className="bg-muted/30 border-dashed">
        <CardContent className="p-4 flex items-center gap-3">
          <TrendingUp className="h-5 w-5 text-muted-foreground shrink-0" />
          <p className="text-sm text-muted-foreground">
            Votes are collected from authenticated users. Each user can only vote once.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

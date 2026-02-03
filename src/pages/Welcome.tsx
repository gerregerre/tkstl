import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Loader2, Trophy, Check } from 'lucide-react';
import { toast } from 'sonner';
import heroImage from '@/assets/hero-tennis-court.jpg';

const VOTE_OPTIONS = [
  {
    value: 'last_singles',
    label: 'The person finishing last in the singles table',
    description: 'Based on average points',
  },
  {
    value: 'last_two_singles',
    label: 'The two people finishing last in the singles table',
    description: 'Based on average points',
  },
  {
    value: 'last_two_doubles',
    label: 'The two individuals finishing last on the doubles table',
    description: 'Based on average points',
  },
];

const LOCAL_STORAGE_KEY = 'tkstl_party_vote_submitted';

export default function Welcome() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [checkingVote, setCheckingVote] = useState(true);
  const [showThankYou, setShowThankYou] = useState(false);

  useEffect(() => {
    const checkExistingVote = async () => {
      // Check local storage first for quick redirect
      const localVote = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (localVote === 'true') {
        navigate('/dashboard', { replace: true });
        return;
      }

      // If user is logged in, check database
      if (user) {
        const { data, error } = await supabase
          .from('party_votes')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle();

        if (data && !error) {
          localStorage.setItem(LOCAL_STORAGE_KEY, 'true');
          navigate('/dashboard', { replace: true });
          return;
        }
      }

      setCheckingVote(false);
    };

    if (!authLoading) {
      checkExistingVote();
    }
  }, [user, authLoading, navigate]);

  const handleSubmit = async () => {
    if (!selectedOption) {
      toast.error('Please select an option');
      return;
    }

    if (!user) {
      toast.error('You must be logged in to vote');
      return;
    }

    setSubmitting(true);

    try {
      const { error } = await supabase.from('party_votes').insert({
        user_id: user.id,
        vote_option: selectedOption,
      });

      if (error) {
        if (error.code === '23505') {
          // Unique constraint violation - already voted
          toast.info('You have already voted!');
          localStorage.setItem(LOCAL_STORAGE_KEY, 'true');
          navigate('/dashboard', { replace: true });
        } else {
          throw error;
        }
        return;
      }

      // Success
      localStorage.setItem(LOCAL_STORAGE_KEY, 'true');
      setShowThankYou(true);
      
      // Redirect after showing thank you message
      setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 2500);
    } catch (error) {
      console.error('Error submitting vote:', error);
      toast.error('Failed to submit vote. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || checkingVote) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden">
      {/* Background Image with blur */}
      <div 
        className="absolute inset-0 bg-cover bg-center scale-110"
        style={{ 
          backgroundImage: `url(${heroImage})`,
          filter: 'blur(6px)',
        }}
      />
      
      {/* Dark gradient overlay - ATP style */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/95 via-background/85 to-background/95" />
      
      {/* Diagonal accent */}
      <div className="absolute inset-0 diagonal-accent opacity-40" />
      
      {/* Subtle radial glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl" />

      {/* Voting Card */}
      <Card className="relative z-10 w-full max-w-lg glass-card border-primary/20 shadow-2xl">
        {showThankYou ? (
          <div className="p-8 text-center">
            {/* Success Icon */}
            <div className="mb-6 flex justify-center">
              <div className="w-20 h-20 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center shadow-glow">
                <Check className="w-10 h-10 text-primary" />
              </div>
            </div>
            
            <h2 className="font-display text-2xl font-bold text-foreground mb-2 uppercase tracking-tight">
              Thank You!
            </h2>
            <p className="text-muted-foreground mb-6">Your vote has been recorded.</p>
            
            <div className="flex items-center justify-center gap-2 text-primary">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm font-medium">Redirecting to dashboard...</span>
            </div>
          </div>
        ) : (
          <>
            <CardHeader className="text-center pb-2 pt-8">
              {/* Trophy Icon */}
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center">
                  <Trophy className="w-8 h-8 text-primary" />
                </div>
              </div>
              
              {/* Badge */}
              <div className="flex justify-center mb-4">
                <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/30 rounded px-3 py-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  <span className="text-primary font-bold tracking-widest text-[10px] uppercase">
                    End of Season Poll
                  </span>
                </div>
              </div>

              {/* Title */}
              <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground tracking-tight uppercase mb-2">
                Welcome to TKSTL
              </h1>
              
              <p className="text-muted-foreground text-sm">
                Before we begin, we need your vote on an important matter...
              </p>
            </CardHeader>

            <CardContent className="pt-6 pb-8 px-6">
              {/* Question */}
              <div className="mb-6">
                <h3 className="font-display text-base font-bold text-foreground text-center mb-5 uppercase tracking-wide">
                  Who should arrange the end of season party?
                </h3>

                <RadioGroup
                  value={selectedOption}
                  onValueChange={setSelectedOption}
                  className="space-y-3"
                >
                  {VOTE_OPTIONS.map((option) => (
                    <div
                      key={option.value}
                      className={`
                        relative flex items-start gap-3 p-4 rounded-lg border transition-all cursor-pointer
                        ${selectedOption === option.value 
                          ? 'border-primary bg-primary/10 shadow-cyan' 
                          : 'border-border/50 bg-secondary/30 hover:border-primary/50 hover:bg-secondary/50'
                        }
                      `}
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
                        <span className="block font-semibold text-foreground text-sm">
                          {option.label}
                        </span>
                        <span className="block text-xs text-muted-foreground mt-0.5">
                          {option.description}
                        </span>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              {/* Submit Button - ATP style */}
              <Button
                onClick={handleSubmit}
                disabled={!selectedOption || submitting}
                variant="atp"
                className="w-full h-12 text-base"
                size="lg"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Submitting...
                  </>
                ) : (
                  'Submit Vote'
                )}
              </Button>

              <p className="text-center text-xs text-muted-foreground mt-4">
                You can only vote once. Your vote is anonymous.
              </p>
            </CardContent>
          </>
        )}
        
        {/* Bottom accent line */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-60 rounded-b" />
      </Card>

      {/* Bottom edge accent */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
    </div>
  );
}

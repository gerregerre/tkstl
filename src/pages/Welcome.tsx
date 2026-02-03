import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Loader2, Trophy, PartyPopper, Check } from 'lucide-react';
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
    <div className="min-h-screen relative flex items-center justify-center p-4">
      {/* Blurred tennis court background */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ 
          backgroundImage: `url(${heroImage})`,
          filter: 'blur(8px)',
          transform: 'scale(1.05)',
        }}
      />
      <div className="absolute inset-0 bg-black/50" />

      {/* Voting Card */}
      <Card className="relative z-10 w-full max-w-lg bg-white/95 backdrop-blur-sm shadow-2xl border-0">
        {showThankYou ? (
          <div className="p-8 text-center">
            <div className="mb-6 flex justify-center">
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
                <Check className="w-10 h-10 text-green-600" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h2>
            <p className="text-gray-600 mb-4">Your vote has been recorded.</p>
            <div className="flex items-center justify-center gap-2 text-primary">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Redirecting to dashboard...</span>
            </div>
          </div>
        ) : (
          <>
            <CardHeader className="text-center pb-2">
              <div className="flex justify-center gap-3 mb-4">
                <Trophy className="w-8 h-8 text-amber-500" />
                <PartyPopper className="w-8 h-8 text-pink-500" />
              </div>
              <CardTitle className="text-2xl text-gray-900 normal-case tracking-normal">
                Welcome to TKSTL!
              </CardTitle>
              <CardDescription className="text-gray-600 text-base mt-2">
                Before we begin, we need your vote on an important matter...
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-4">
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 text-center mb-4 text-lg">
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
                        relative flex items-start gap-3 p-4 rounded-lg border-2 transition-all cursor-pointer
                        ${selectedOption === option.value 
                          ? 'border-primary bg-primary/5' 
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }
                      `}
                      onClick={() => setSelectedOption(option.value)}
                    >
                      <RadioGroupItem
                        value={option.value}
                        id={option.value}
                        className="mt-0.5"
                      />
                      <Label
                        htmlFor={option.value}
                        className="flex-1 cursor-pointer"
                      >
                        <span className="block font-medium text-gray-900">
                          {option.label}
                        </span>
                        <span className="block text-sm text-gray-500 mt-0.5">
                          {option.description}
                        </span>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <Button
                onClick={handleSubmit}
                disabled={!selectedOption || submitting}
                className="w-full h-12 text-lg font-bold"
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

              <p className="text-center text-xs text-gray-400 mt-4">
                You can only vote once. Your vote is anonymous.
              </p>
            </CardContent>
          </>
        )}
      </Card>
    </div>
  );
}

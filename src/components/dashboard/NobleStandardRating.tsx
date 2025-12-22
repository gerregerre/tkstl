import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { ClipboardCheck, Clock, Target, Package, Laugh, ThermometerSun, Send } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface RatingCategory {
  id: string;
  label: string;
  question: string;
  icon: React.ReactNode;
}

const categories: RatingCategory[] = [
  {
    id: 'punctuality',
    label: 'Punctuality',
    question: 'Was everyone on time and ready?',
    icon: <Clock className="w-5 h-5" />,
  },
  {
    id: 'commitment',
    label: 'Commitment',
    question: 'Commitment to a worthy session?',
    icon: <Target className="w-5 h-5" />,
  },
  {
    id: 'equipment',
    label: 'Equipment',
    question: 'Adequate balls & professional standard?',
    icon: <Package className="w-5 h-5" />,
  },
  {
    id: 'humor',
    label: 'Humor & Stories',
    question: 'Quality of jokes/storytelling?',
    icon: <Laugh className="w-5 h-5" />,
  },
  {
    id: 'sauna',
    label: 'Sauna Session',
    question: 'Sauna Session Rating (0 if none)',
    icon: <ThermometerSun className="w-5 h-5" />,
  },
];

export function NobleStandardRating() {
  const [ratings, setRatings] = useState<Record<string, number>>({
    punctuality: 5,
    commitment: 5,
    equipment: 5,
    humor: 5,
    sauna: 0,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate the Noble Standard
  const nobleStandard = Object.values(ratings).reduce((a, b) => a + b, 0) / 5;

  const handleRatingChange = (categoryId: string, value: number[]) => {
    setRatings(prev => ({
      ...prev,
      [categoryId]: value[0],
    }));
  };

  const submitRating = async () => {
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({
      title: "Noble Standard Recorded",
      description: `Your rating of ${nobleStandard.toFixed(2)} has been submitted to the annals.`,
    });
    
    setIsSubmitting(false);
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-gold';
    if (score >= 6) return 'text-hunter-green';
    if (score >= 4) return 'text-terra-cotta';
    return 'text-destructive';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 9) return 'Legendary';
    if (score >= 8) return 'Noble';
    if (score >= 7) return 'Worthy';
    if (score >= 6) return 'Acceptable';
    if (score >= 5) return 'Mediocre';
    if (score >= 4) return 'Disappointing';
    return 'Shameful';
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <ClipboardCheck className="w-12 h-12 text-terra-cotta" />
        </div>
        <h2 className="font-serif text-3xl font-bold text-foreground">
          The Noble Standard Survey
        </h2>
        <p className="text-muted-foreground mt-1 font-serif-body italic">
          Rate today's sacred session with honesty and grace
        </p>
      </div>

      {/* Rating Form */}
      <div className="bg-card rounded-lg border border-border p-6 shadow-card">
        <div className="space-y-8">
          {categories.map((category) => (
            <div key={category.id} className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-muted text-muted-foreground">
                    {category.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">
                      {category.label}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {category.question}
                    </p>
                  </div>
                </div>
                <span className={cn(
                  "font-serif font-bold text-xl min-w-[3rem] text-right",
                  getScoreColor(ratings[category.id])
                )}>
                  {ratings[category.id].toFixed(1)}
                </span>
              </div>
              <Slider
                value={[ratings[category.id]]}
                onValueChange={(value) => handleRatingChange(category.id, value)}
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
          ))}
        </div>
      </div>

      {/* Noble Standard Preview */}
      <div className="bg-card rounded-lg border-2 border-gold/30 p-6 shadow-noble text-center">
        <h3 className="font-serif text-lg text-muted-foreground mb-2">
          Your Noble Standard
        </h3>
        <div className={cn(
          "font-serif text-6xl font-bold mb-2",
          getScoreColor(nobleStandard)
        )}>
          {nobleStandard.toFixed(2)}
        </div>
        <p className={cn(
          "text-lg font-semibold",
          getScoreColor(nobleStandard)
        )}>
          {getScoreLabel(nobleStandard)}
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          Average of all five categories
        </p>
      </div>

      {/* Submit */}
      <div className="bg-card rounded-lg border border-border p-6 shadow-card">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="font-semibold text-foreground">
              Ready to submit?
            </p>
            <p className="text-sm text-muted-foreground">
              Your rating will be recorded in the permanent archives.
            </p>
          </div>
          <Button
            onClick={submitRating}
            variant="royal"
            size="lg"
            disabled={isSubmitting}
            className="w-full sm:w-auto"
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
                Submit to the Annals
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Note */}
      <p className="text-xs text-center text-muted-foreground italic">
        Note: Only players who participated in today's Holy Quartet may submit ratings. 
        Fraudulent submissions will be... dealt with.
      </p>
    </div>
  );
}

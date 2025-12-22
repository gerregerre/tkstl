import { useEffect, useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

interface NewsItem {
  id: string;
  title: string;
  description: string;
  date_label: string;
  type: 'update' | 'announcement' | 'result' | 'feature';
}

const typeColors = {
  update: 'from-blue-500/20 to-blue-600/10 border-blue-500/30',
  announcement: 'from-amber-500/20 to-amber-600/10 border-amber-500/30',
  result: 'from-green-500/20 to-green-600/10 border-green-500/30',
  feature: 'from-purple-500/20 to-purple-600/10 border-purple-500/30'
};

const typeBadgeColors = {
  update: 'bg-blue-500/20 text-blue-300',
  announcement: 'bg-amber-500/20 text-amber-300',
  result: 'bg-green-500/20 text-green-300',
  feature: 'bg-purple-500/20 text-purple-300'
};

export default function NewsCarousel() {
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const fetchNews = async () => {
      const { data, error } = await supabase
        .from('news_items')
        .select('id, title, description, date_label, type')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(5);

      if (!error && data) {
        setNewsItems(data as NewsItem[]);
      }
      setLoading(false);
    };

    fetchNews();
  }, []);

  const goToNext = useCallback(() => {
    if (newsItems.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % newsItems.length);
  }, [newsItems.length]);

  const goToPrev = useCallback(() => {
    if (newsItems.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + newsItems.length) % newsItems.length);
  }, [newsItems.length]);

  useEffect(() => {
    if (!isAutoPlaying || isHovered || newsItems.length === 0) return;

    const interval = setInterval(goToNext, 5000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, isHovered, goToNext, newsItems.length]);

  if (loading) {
    return (
      <div className="w-full max-w-2xl mx-auto">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Sparkles className="h-4 w-4 text-primary" />
          <h3 className="text-sm uppercase tracking-widest text-muted-foreground font-medium">
            Latest Updates
          </h3>
          <Sparkles className="h-4 w-4 text-primary" />
        </div>
        <div className="h-40 bg-card/50 rounded-xl animate-pulse" />
      </div>
    );
  }

  if (newsItems.length === 0) {
    return null;
  }

  return (
    <div 
      className="relative w-full max-w-xl mx-auto"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Header */}
      <div className="flex items-center justify-center gap-1.5 mb-2">
        <Sparkles className="h-3 w-3 text-primary" />
        <h3 className="text-xs uppercase tracking-widest text-muted-foreground font-medium">
          Updates
        </h3>
        <Sparkles className="h-3 w-3 text-primary" />
      </div>

      {/* Carousel Container */}
      <div className="relative overflow-hidden rounded-lg">
        {/* Glassmorphism Background */}
        <div className="absolute inset-0 bg-background/40 backdrop-blur-xl border border-border/50 rounded-lg" />
        
        {/* Navigation Arrows */}
        <button
          onClick={goToPrev}
          className="absolute left-1 top-1/2 -translate-y-1/2 z-20 p-1 rounded-full bg-background/60 backdrop-blur-sm border border-border/50 text-foreground hover:bg-background/80 transition-all duration-200"
          aria-label="Previous news"
        >
          <ChevronLeft className="h-3 w-3" />
        </button>
        
        <button
          onClick={goToNext}
          className="absolute right-1 top-1/2 -translate-y-1/2 z-20 p-1 rounded-full bg-background/60 backdrop-blur-sm border border-border/50 text-foreground hover:bg-background/80 transition-all duration-200"
          aria-label="Next news"
        >
          <ChevronRight className="h-3 w-3" />
        </button>

        {/* Slides Container */}
        <div 
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {newsItems.map((item) => (
            <div
              key={item.id}
              className="w-full flex-shrink-0 px-8 py-3 relative"
            >
              {/* Gradient overlay based on type */}
              <div className={cn(
                "absolute inset-0 bg-gradient-to-br opacity-50 rounded-lg",
                typeColors[item.type]
              )} />
              
              <div className="relative z-10 text-center space-y-1">
                {/* Title */}
                <h4 className="font-serif text-sm font-semibold text-foreground">
                  {item.title}
                </h4>
                
                {/* Description */}
                <p className="text-muted-foreground text-xs max-w-sm mx-auto leading-snug line-clamp-2">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dots Navigation */}
      <div className="flex justify-center gap-1.5 mt-1.5">
        {newsItems.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setCurrentIndex(index);
              setIsAutoPlaying(false);
            }}
            className={cn(
              "w-1.5 h-1.5 rounded-full transition-all duration-300",
              index === currentIndex 
                ? "bg-primary w-4" 
                : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
            )}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

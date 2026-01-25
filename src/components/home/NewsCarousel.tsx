import { useEffect, useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

interface NewsItem {
  id: string;
  title: string;
  description: string;
  date_label: string;
  type: 'update' | 'announcement' | 'result' | 'feature';
}

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
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
          <h3 className="text-xs uppercase tracking-widest text-muted-foreground font-medium">
            Club News
          </h3>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
        </div>
        <div className="h-24 glass-card rounded-xl animate-pulse" />
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
      <div className="flex items-center justify-center gap-3 mb-3">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border/50 to-transparent" />
        <h3 className="text-xs uppercase tracking-widest text-muted-foreground font-medium">
          Club News
        </h3>
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border/50 to-transparent" />
      </div>

      {/* Carousel Container */}
      <div className="relative overflow-hidden rounded-xl glass-card">
        {/* Navigation Arrows */}
        <button
          onClick={goToPrev}
          className="absolute left-2 top-1/2 -translate-y-1/2 z-20 p-1.5 rounded-lg bg-muted/50 border border-border/30 text-muted-foreground hover:text-primary hover:border-primary/30 transition-all duration-200"
          aria-label="Previous news"
        >
          <ChevronLeft className="h-3 w-3" />
        </button>
        
        <button
          onClick={goToNext}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-20 p-1.5 rounded-lg bg-muted/50 border border-border/30 text-muted-foreground hover:text-primary hover:border-primary/30 transition-all duration-200"
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
              className="w-full flex-shrink-0 px-10 py-5 relative"
            >
              <div className="relative z-10 text-center space-y-2">
                {/* Title */}
                <h4 className="text-base font-semibold text-foreground">
                  {item.title}
                </h4>
                
                {/* Description */}
                <p className="text-muted-foreground text-sm max-w-md mx-auto leading-relaxed line-clamp-3">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dots Navigation */}
      <div className="flex justify-center gap-2 mt-3">
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
                ? "bg-primary w-5" 
                : "bg-border hover:bg-muted-foreground/50"
            )}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
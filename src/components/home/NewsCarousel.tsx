import { useEffect, useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Newspaper } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

interface NewsItem {
  id: string;
  title: string;
  description: string;
  date_label: string;
  type: 'update' | 'announcement' | 'result' | 'feature' | 'breaking';
}

const TYPE_STYLES = {
  announcement: 'bg-primary/20 text-primary border-primary/30',
  update: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  result: 'bg-green-500/20 text-green-400 border-green-500/30',
  feature: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  breaking: 'bg-red-500/30 text-red-400 border-red-500/50',
};

const TYPE_LABELS = {
  announcement: 'Announcement',
  update: 'Update',
  result: 'Result',
  feature: 'Feature',
  breaking: '⚡ BREAKING',
};

export default function NewsCarousel() {
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Minimum swipe distance (in px)
  const minSwipeDistance = 50;

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (isLeftSwipe) {
      goToNext();
      setIsAutoPlaying(false);
    } else if (isRightSwipe) {
      goToPrev();
      setIsAutoPlaying(false);
    }
  };

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

    const interval = setInterval(goToNext, 6000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, isHovered, goToNext, newsItems.length]);

  if (loading) {
    return (
      <div className="w-full max-w-2xl mx-auto px-4">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
          <div className="flex items-center gap-2">
            <Newspaper className="h-4 w-4 text-primary" />
            <h3 className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">
              Club News
            </h3>
          </div>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
        </div>
        <div className="h-32 bg-card/80 border border-border/50 rounded-xl animate-pulse" />
      </div>
    );
  }

  if (newsItems.length === 0) {
    return null;
  }

  const currentItem = newsItems[currentIndex];

  return (
    <div 
      className="relative w-full max-w-2xl mx-auto px-4"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Header */}
      <div className="flex items-center justify-center gap-3 mb-4">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border/50 to-transparent" />
        <div className="flex items-center gap-2">
          <Newspaper className="h-4 w-4 text-primary" />
          <h3 className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">
            Club News
          </h3>
        </div>
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border/50 to-transparent" />
      </div>

      {/* News Card Container */}
      <div className={cn(
        "relative bg-card/90 backdrop-blur-sm border rounded-xl shadow-lg overflow-hidden transition-all duration-500",
        currentItem.type === 'breaking' 
          ? "border-red-500/60 shadow-red-500/20 shadow-xl" 
          : "border-border/60"
      )}>
        {/* Top accent bar */}
        <div className={cn(
          "absolute top-0 left-0 right-0 h-1",
          currentItem.type === 'breaking'
            ? "bg-gradient-to-r from-red-600 via-red-500 to-red-600"
            : "bg-gradient-to-r from-primary/50 via-primary to-primary/50"
        )} />
        
        {/* Breaking News Glow Effect */}
        {currentItem.type === 'breaking' && (
          <div className="absolute inset-0 bg-gradient-to-b from-red-500/10 via-transparent to-transparent pointer-events-none" />
        )}
        
        {/* Navigation Arrows - Desktop */}
        <button
          onClick={goToPrev}
          className="hidden sm:flex absolute left-3 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-background/80 border border-border/50 text-muted-foreground hover:text-primary hover:border-primary/50 hover:bg-background transition-all duration-200 shadow-sm"
          aria-label="Previous news"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        
        <button
          onClick={goToNext}
          className="hidden sm:flex absolute right-3 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-background/80 border border-border/50 text-muted-foreground hover:text-primary hover:border-primary/50 hover:bg-background transition-all duration-200 shadow-sm"
          aria-label="Next news"
        >
          <ChevronRight className="h-4 w-4" />
        </button>

        {/* Content Area with Touch Support */}
        <div 
          className="relative overflow-hidden touch-pan-y"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div 
            className="flex transition-transform duration-500 ease-out"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {newsItems.map((item) => (
              <div
                key={item.id}
                className="w-full flex-shrink-0 px-4 sm:px-12 py-6 sm:py-8"
              >
                <div className="flex flex-col items-center text-center space-y-3">
                  {/* Type Badge & Date */}
                  <div className="flex items-center gap-3 flex-wrap justify-center">
                    <span className={cn(
                      "px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold uppercase tracking-wider border",
                      TYPE_STYLES[item.type],
                      item.type === 'breaking' && "shadow-lg shadow-red-500/30"
                    )}>
                      {TYPE_LABELS[item.type]}
                    </span>
                    <span className="text-[10px] sm:text-xs text-muted-foreground/70 font-medium">
                      {item.date_label}
                    </span>
                  </div>
                  
                  {/* Title */}
                  <h4 className={cn(
                    "text-base sm:text-lg font-bold leading-tight px-2",
                    item.type === 'breaking' ? "text-red-400" : "text-foreground"
                  )}>
                    {item.title}
                  </h4>
                  
                  {/* Description */}
                  <p className="text-muted-foreground text-sm sm:text-base leading-relaxed max-w-lg px-2">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile Navigation - Touch friendly */}
        <div className="sm:hidden flex items-center justify-between px-4 pb-4 -mt-2">
          <button
            onClick={goToPrev}
            className="p-2.5 rounded-full bg-muted/50 border border-border/50 text-muted-foreground active:bg-muted transition-colors"
            aria-label="Previous news"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          
          {/* Mobile Dots */}
          <div className="flex items-center gap-2">
            {newsItems.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setCurrentIndex(index);
                  setIsAutoPlaying(false);
                }}
                className={cn(
                  "h-2 rounded-full transition-all duration-300",
                  index === currentIndex 
                    ? "bg-primary w-6" 
                    : "bg-border w-2 hover:bg-muted-foreground/50"
                )}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
          
          <button
            onClick={goToNext}
            className="p-2.5 rounded-full bg-muted/50 border border-border/50 text-muted-foreground active:bg-muted transition-colors"
            aria-label="Next news"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Desktop Dots Navigation */}
      <div className="hidden sm:flex justify-center gap-2 mt-4">
        {newsItems.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setCurrentIndex(index);
              setIsAutoPlaying(false);
            }}
            className={cn(
              "h-2 rounded-full transition-all duration-300",
              index === currentIndex 
                ? "bg-primary w-6" 
                : "bg-border w-2 hover:bg-muted-foreground/50"
            )}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* News Counter - Professional touch */}
      <div className="flex justify-center mt-3">
        <span className="text-[10px] text-muted-foreground/60 font-medium uppercase tracking-wider">
          {currentIndex + 1} of {newsItems.length}
        </span>
      </div>
    </div>
  );
}
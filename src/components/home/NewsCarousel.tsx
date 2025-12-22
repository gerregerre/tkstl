import { useEffect, useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NewsItem {
  id: number;
  title: string;
  description: string;
  date: string;
  type: 'update' | 'announcement' | 'result' | 'feature';
}

const newsData: NewsItem[] = [
  {
    id: 1,
    title: "Session History Now Available",
    description: "Track all your past games with our new session history feature. View scores, teams, and match details.",
    date: "Dec 2024",
    type: "feature"
  },
  {
    id: 2,
    title: "Edit & Delete Games",
    description: "Made a scoring mistake? You can now edit or delete recorded session games directly from the history.",
    date: "Dec 2024",
    type: "update"
  },
  {
    id: 3,
    title: "New Leaderboard Design",
    description: "Check out the refreshed leaderboard with improved player cards and real-time stat updates.",
    date: "Nov 2024",
    type: "feature"
  },
  {
    id: 4,
    title: "Head-to-Head Stats",
    description: "Compare your performance against any player with our new head-to-head statistics feature.",
    date: "Nov 2024",
    type: "feature"
  },
  {
    id: 5,
    title: "Welcome to TKSTL",
    description: "The official digital home of Tennisklubben Stora Tennisligan. Track scores, compete, and rise through the ranks!",
    date: "Est. 2017",
    type: "announcement"
  }
];

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
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % newsData.length);
  }, []);

  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + newsData.length) % newsData.length);
  }, []);

  useEffect(() => {
    if (!isAutoPlaying || isHovered) return;

    const interval = setInterval(goToNext, 5000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, isHovered, goToNext]);

  return (
    <div 
      className="relative w-full max-w-2xl mx-auto"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Header */}
      <div className="flex items-center justify-center gap-2 mb-4">
        <Sparkles className="h-4 w-4 text-primary" />
        <h3 className="text-sm uppercase tracking-widest text-muted-foreground font-medium">
          Latest Updates
        </h3>
        <Sparkles className="h-4 w-4 text-primary" />
      </div>

      {/* Carousel Container */}
      <div className="relative overflow-hidden rounded-xl">
        {/* Glassmorphism Background */}
        <div className="absolute inset-0 bg-background/40 backdrop-blur-xl border border-border/50 rounded-xl" />
        
        {/* Navigation Arrows */}
        <button
          onClick={goToPrev}
          className="absolute left-2 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-background/60 backdrop-blur-sm border border-border/50 text-foreground hover:bg-background/80 transition-all duration-200 hover:scale-110"
          aria-label="Previous news"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        
        <button
          onClick={goToNext}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-background/60 backdrop-blur-sm border border-border/50 text-foreground hover:bg-background/80 transition-all duration-200 hover:scale-110"
          aria-label="Next news"
        >
          <ChevronRight className="h-4 w-4" />
        </button>

        {/* Slides Container */}
        <div 
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {newsData.map((item) => (
            <div
              key={item.id}
              className="w-full flex-shrink-0 p-8 relative"
            >
              {/* Gradient overlay based on type */}
              <div className={cn(
                "absolute inset-0 bg-gradient-to-br opacity-50 rounded-xl",
                typeColors[item.type]
              )} />
              
              <div className="relative z-10 text-center space-y-4">
                {/* Type Badge */}
                <span className={cn(
                  "inline-block px-3 py-1 rounded-full text-xs uppercase tracking-wider font-medium",
                  typeBadgeColors[item.type]
                )}>
                  {item.type}
                </span>
                
                {/* Title */}
                <h4 className="font-serif text-xl md:text-2xl font-semibold text-foreground">
                  {item.title}
                </h4>
                
                {/* Description */}
                <p className="text-muted-foreground text-sm md:text-base max-w-md mx-auto leading-relaxed">
                  {item.description}
                </p>
                
                {/* Date */}
                <p className="text-xs text-muted-foreground/70 uppercase tracking-wider">
                  {item.date}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dots Navigation */}
      <div className="flex justify-center gap-2 mt-4">
        {newsData.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setCurrentIndex(index);
              setIsAutoPlaying(false);
            }}
            className={cn(
              "w-2 h-2 rounded-full transition-all duration-300",
              index === currentIndex 
                ? "bg-primary w-6" 
                : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
            )}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Auto-play indicator */}
      <button
        onClick={() => setIsAutoPlaying(!isAutoPlaying)}
        className="mt-3 mx-auto block text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors"
      >
        {isAutoPlaying ? '⏸ Auto-playing' : '▶ Paused'}
      </button>
    </div>
  );
}

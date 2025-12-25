import heroImage from '@/assets/hero-tennis-court.jpg';
import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeroSectionProps {
  onScrollDown?: () => void;
}

export function HeroSection({ onScrollDown }: HeroSectionProps) {
  return (
    <div className="relative w-full h-[70vh] min-h-[500px] -mt-8 -mx-8 mb-8" style={{ width: 'calc(100% + 4rem)' }}>
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroImage})` }}
      />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-secondary/80 via-secondary/60 to-secondary/90" />
      
      {/* Content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-8">
        <p className="text-primary font-medium tracking-[0.3em] text-sm uppercase mb-6 animate-fade-in">
          Est. 2017
        </p>
        
        <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-semibold text-secondary-foreground mb-3 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          Where Tradition
        </h1>
        
        <h2 className="font-serif text-5xl md:text-6xl lg:text-7xl font-semibold text-primary italic mb-8 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          Meets Excellence
        </h2>
        
        <p className="text-secondary-foreground/80 max-w-2xl mx-auto text-lg md:text-xl leading-relaxed mb-10 animate-fade-in" style={{ animationDelay: '0.3s' }}>
          Experience the finest doubles tennis in an atmosphere of timeless elegance. 
          Our weekly sessions offer an unforgettable journey through competition and camaraderie.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <Button variant="gold" size="lg" className="min-w-[180px]">
            View Leaderboard
          </Button>
          <Button variant="elegant" size="lg" className="min-w-[180px] text-secondary-foreground border-secondary-foreground/30 hover:border-primary hover:text-primary">
            Explore the Club
          </Button>
        </div>
      </div>

      {/* Scroll Indicator */}
      {onScrollDown && (
        <button 
          onClick={onScrollDown}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 text-secondary-foreground/60 hover:text-primary transition-colors animate-fade-in"
          style={{ animationDelay: '0.5s' }}
        >
          <span className="text-xs uppercase tracking-widest">Scroll</span>
          <div className="w-6 h-10 rounded-full border-2 border-current flex items-start justify-center p-1">
            <div className="w-1 h-2 bg-current rounded-full animate-bounce" />
          </div>
        </button>
      )}
    </div>
  );
}
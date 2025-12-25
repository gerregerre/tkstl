import heroImage from '@/assets/hero-tennis-court.jpg';
import { ChevronDown, Mouse } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeroSectionProps {
  onScrollDown?: () => void;
}

export function HeroSection({ onScrollDown }: HeroSectionProps) {
  return (
    <section className="relative w-screen h-screen -ml-[calc((100vw-100%)/2)] left-0">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroImage})` }}
      />
      
      {/* Deep Green Overlay */}
      <div className="absolute inset-0 bg-forest/85" />
      
      {/* Content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6">
        <p className="text-gold font-medium tracking-[0.25em] text-sm uppercase mb-8 animate-fade-in">
          Est. 2017
        </p>
        
        <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold text-cream mb-2 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          Where Tradition
        </h1>
        
        <h2 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold text-gold italic mb-8 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          Meets Excellence
        </h2>
        
        <p className="text-cream/80 max-w-2xl mx-auto text-base sm:text-lg md:text-xl leading-relaxed mb-12 animate-fade-in" style={{ animationDelay: '0.3s' }}>
          Experience the finest championship tennis in an atmosphere of timeless elegance. 
          Our weekly doubles sessions offer an unforgettable journey through competition and camaraderie.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <Button variant="gold" size="lg" className="min-w-[180px] px-8">
            View Leaderboard
          </Button>
          <Button 
            variant="outline" 
            size="lg" 
            className="min-w-[180px] px-8 border-cream/40 text-cream hover:bg-cream/10 hover:text-cream hover:border-cream/60 bg-transparent"
          >
            Explore the Club
          </Button>
        </div>
      </div>

      {/* Scroll Indicator */}
      {onScrollDown && (
        <button 
          onClick={onScrollDown}
          className="absolute bottom-12 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-3 text-cream/60 hover:text-gold transition-colors animate-fade-in cursor-pointer"
          style={{ animationDelay: '0.6s' }}
        >
          <div className="w-6 h-10 rounded-full border-2 border-current flex items-start justify-center p-1.5">
            <div className="w-1 h-2.5 bg-current rounded-full animate-bounce" />
          </div>
        </button>
      )}
    </section>
  );
}
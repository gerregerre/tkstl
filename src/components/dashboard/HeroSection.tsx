import heroImage from '@/assets/hero-tennis-court.jpg';
import { Button } from '@/components/ui/button';
interface HeroSectionProps {
  onScrollDown?: () => void;
}
export function HeroSection({
  onScrollDown
}: HeroSectionProps) {
  return <section className="relative w-screen min-h-[80vh] sm:h-screen -ml-[calc((100vw-100%)/2)] left-0 overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105" style={{
      backgroundImage: `url(${heroImage})`
    }} />
      
      {/* ATP-Style Gradient Overlay - Cool Black with diagonal accent */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/95 via-background/80 to-background" />
      
      {/* Diagonal Speed Line Accent */}
      <div className="absolute inset-0 diagonal-accent opacity-60" />
      
      {/* Subtle Radial Glow - Cyan */}
      <div className="absolute inset-0 bg-gradient-radial-glow opacity-40" />
      
      {/* Content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center text-center sm:px-6 px-px py-[160px]">
        {/* ATP-Style Badge */}
        <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/30 rounded px-3 sm:px-4 py-1.5 mb-6 sm:mb-8 animate-fade-in">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="text-primary font-bold tracking-widest text-[10px] sm:text-xs uppercase">
            Est. 2017
          </span>
        </div>
        
        {/* Main Heading - Bold Montserrat */}
        <h1 className="font-display text-3xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black text-foreground mb-1 sm:mb-2 animate-fade-in tracking-tight uppercase" style={{
        animationDelay: '0.1s'
      }}>WHERE TRADITIONS</h1>
        
        <h2 className="font-display text-3xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black text-gradient-cyan mb-6 sm:mb-8 animate-fade-in tracking-tight uppercase" style={{
        animationDelay: '0.2s'
      }}>MEETS EXELLENCE</h2>
        
        {/* Subheading */}
        <p className="text-muted-foreground max-w-xs sm:max-w-lg md:max-w-2xl mx-auto text-sm sm:text-base md:text-lg lg:text-xl leading-relaxed mb-8 sm:mb-12 animate-fade-in font-medium px-4" style={{
        animationDelay: '0.3s'
      }}>
          Experience championship-level doubles tennis with precision, energy, and the spirit of competition.
        </p>

      </div>

      {/* Scroll Indicator - ATP Style */}
      {onScrollDown && <button onClick={onScrollDown} className="absolute bottom-12 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-3 text-muted-foreground hover:text-primary transition-colors animate-fade-in cursor-pointer group" style={{
      animationDelay: '0.6s'
    }}>
          <div className="w-6 h-10 rounded-full border-2 border-current flex items-start justify-center p-1.5 group-hover:border-primary transition-colors">
            <div className="w-1.5 h-3 bg-current rounded-full animate-bounce group-hover:bg-primary transition-colors" />
          </div>
        </button>}

      {/* Bottom Edge - Speed Line Accent */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-60" />
    </section>;
}
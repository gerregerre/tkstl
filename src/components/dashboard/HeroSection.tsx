import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import heroImage from '@/assets/hero-tennis-court.jpg';
import playersLineup from '@/assets/players-lineup.png';

interface HeroSectionProps {
  onScrollDown?: () => void;
}

const staggerChildren = {
  animate: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
};

const ease: [number, number, number, number] = [0.25, 0.1, 0.25, 1];

const fadeSlideUp = {
  initial: { opacity: 0, y: 24 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease },
  },
};

const fadeScale = {
  initial: { opacity: 0, scale: 0.92 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease },
  },
};

export function HeroSection({ onScrollDown }: HeroSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });

  // Parallax: image moves slower than scroll
  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '25%']);
  // Slight scale-up on scroll for depth
  const bgScale = useTransform(scrollYProgress, [0, 1], [1.05, 1.15]);
  // Content fades out as you scroll past
  const contentOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const contentY = useTransform(scrollYProgress, [0, 0.6], [0, -40]);

  return (
    <section ref={sectionRef} className="relative w-full min-h-[85vh] sm:min-h-screen overflow-hidden flex flex-col">
      {/* Parallax Background Image */}
      <motion.div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${heroImage})`,
          y: bgY,
          scale: bgScale,
        }}
      />

      {/* Gradient Overlay - dark banner at top, open court below */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/70 to-background/95" />

      {/* Diagonal Speed Line Accent */}
      <div className="absolute inset-0 diagonal-accent opacity-60" />

      {/* Subtle Radial Glow */}
      <div className="absolute inset-0 bg-gradient-radial-glow opacity-40" />

      {/* Top text stack */}
      <motion.div
        style={{ opacity: contentOpacity, y: contentY }}
        className="relative z-20 flex flex-col items-center text-center px-4 sm:px-6 pt-10 sm:pt-16"
      >
        <motion.div
          variants={staggerChildren}
          initial="initial"
          animate="animate"
          className="flex flex-col items-center"
        >
          {/* Badge */}
          <motion.div
            variants={fadeScale}
            className="inline-flex items-center gap-2 bg-primary/10 border border-primary/30 rounded px-3 sm:px-4 py-1.5 mb-4 sm:mb-6"
          >
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-primary font-bold tracking-widest text-[10px] sm:text-xs uppercase">
              Est. 2017
            </span>
          </motion.div>

          {/* Club Name */}
          <motion.p
            variants={fadeSlideUp}
            className="font-display text-xs sm:text-base md:text-lg font-bold mb-2 sm:mb-3 tracking-[0.2em] uppercase text-muted-foreground"
          >
            TENNISKLUBBEN STORA TENNISLIGAN
          </motion.p>

          {/* Main Heading */}
          <motion.h1
            variants={fadeSlideUp}
            className="font-display text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-foreground tracking-tight uppercase drop-shadow-lg leading-[0.95]"
          >
            WHERE TRADITIONS
          </motion.h1>

          <motion.h2
            variants={fadeSlideUp}
            className="font-display text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-gradient-atp tracking-tight uppercase drop-shadow-lg leading-[0.95]"
          >
            MEETS EXCELLENCE
          </motion.h2>
        </motion.div>
      </motion.div>

      {/* Full-body Player Lineup - Avengers style */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.9, ease }}
        className="relative z-10 mt-6 sm:mt-8 flex justify-center pointer-events-none"
      >
        <img
          src={playersLineup}
          alt="The six TKSTL players standing together with tennis rackets"
          className="w-full max-w-4xl object-contain object-bottom drop-shadow-[0_18px_28px_hsl(var(--background)/0.85)]"
        />
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-background via-background/70 to-transparent" />
      </motion.div>

      {/* Bottom copy + scroll cue */}
      <div className="relative z-20 flex flex-col items-center text-center px-4 pb-10 sm:pb-14 -mt-4">
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6, ease }}
          className="text-foreground/90 max-w-xs sm:max-w-xl md:max-w-2xl mx-auto text-xs sm:text-sm md:text-base leading-relaxed font-medium"
        >
          Experience championship-level doubles tennis with precision, energy, and the spirit of competition.
        </motion.p>

        {onScrollDown && (
          <motion.button
            onClick={onScrollDown}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.5 }}
            aria-label="Scroll down"
            className="mt-6 flex flex-col items-center gap-3 text-muted-foreground hover:text-primary transition-colors cursor-pointer group"
          >
            <div className="w-6 h-10 rounded-full border-2 border-current flex items-start justify-center p-1.5 group-hover:border-primary transition-colors">
              <div className="w-1.5 h-3 bg-current rounded-full animate-bounce group-hover:bg-primary transition-colors" />
            </div>
          </motion.button>
        )}
      </div>

      {/* Bottom Edge */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-60" />
    </section>
  );
}


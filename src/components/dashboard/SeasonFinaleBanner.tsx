import { motion } from 'framer-motion';
import { Flame, Trophy } from 'lucide-react';

interface SeasonFinaleBannerProps {
  sessionsRemaining?: number;
}

export function SeasonFinaleBanner({ sessionsRemaining = 2 }: SeasonFinaleBannerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
      className="relative overflow-hidden rounded-md border border-primary/40 bg-gradient-to-r from-primary/10 via-card to-primary/10 shadow-card"
    >
      {/* Animated shimmer overlay */}
      <motion.div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/15 to-transparent"
        initial={{ x: '-100%' }}
        animate={{ x: '100%' }}
        transition={{ duration: 3.5, repeat: Infinity, ease: 'linear', repeatDelay: 0.8 }}
        style={{ width: '50%' }}
      />

      {/* Pulsing glow accents */}
      <div className="pointer-events-none absolute -left-8 top-1/2 -translate-y-1/2 w-32 h-32 rounded-full bg-primary/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-8 top-1/2 -translate-y-1/2 w-32 h-32 rounded-full bg-primary/20 blur-3xl" />

      <div className="relative flex flex-col md:flex-row items-center gap-3 md:gap-5 px-4 md:px-6 py-4 md:py-5">
        {/* Flame icon with pulse */}
        <motion.div
          animate={{ scale: [1, 1.15, 1], rotate: [-4, 4, -4] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          className="shrink-0 w-11 h-11 md:w-12 md:h-12 rounded-md bg-primary/15 border border-primary/40 flex items-center justify-center shadow-[0_0_18px_hsl(var(--primary)/0.45)]"
        >
          <Flame className="w-5 h-5 md:w-6 md:h-6 text-primary" />
        </motion.div>

        {/* Copy */}
        <div className="flex-1 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
            <span className="text-[10px] md:text-[11px] font-bold text-primary uppercase tracking-[0.25em]">
              Season Finale
            </span>
            <span className="hidden md:inline-block w-1 h-1 rounded-full bg-primary/60" />
            <span className="hidden md:inline text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              The Reckoning Approaches
            </span>
          </div>
          <h3 className="font-display text-xl md:text-2xl font-black text-foreground leading-tight">
            Only{' '}
            <motion.span
              animate={{ opacity: [1, 0.55, 1] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
              className="text-primary drop-shadow-[0_0_10px_hsl(var(--primary)/0.7)]"
            >
              {sessionsRemaining} sessions
            </motion.span>{' '}
            remain. Every point. Every game. Legacy on the line.
          </h3>
        </div>

        {/* Trophy badge */}
        <div className="shrink-0 hidden sm:flex items-center gap-2 px-3 py-2 rounded-md bg-primary/10 border border-primary/30">
          <Trophy className="w-4 h-4 text-primary" />
          <span className="font-display text-[11px] font-bold text-primary uppercase tracking-widest whitespace-nowrap">
            Champion Decided
          </span>
        </div>
      </div>
    </motion.div>
  );
}

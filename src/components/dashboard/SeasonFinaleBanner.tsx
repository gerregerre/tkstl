import { motion } from 'framer-motion';
import { Flame, Trophy, Skull, Pizza } from 'lucide-react';
import { useFilteredPlayerStats } from '@/hooks/useFilteredPlayerStats';
import { getPlayerAvatar } from '@/lib/playerAvatars';

interface SeasonFinaleBannerProps {
  sessionsRemaining?: number;
  endDateLabel?: string;
}

export function SeasonFinaleBanner({ sessionsRemaining = 2, endDateLabel = 'June 8th' }: SeasonFinaleBannerProps) {
  const { teamStats } = useFilteredPlayerStats('all');
  const lastTeam = teamStats.length > 1 ? teamStats[teamStats.length - 1] : null;
  const avatar1 = lastTeam ? getPlayerAvatar(lastTeam.player1) : null;
  const avatar2 = lastTeam ? getPlayerAvatar(lastTeam.player2) : null;

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

      <div className="relative flex flex-col gap-4 px-4 md:px-6 py-4 md:py-5">
        <div className="flex flex-col md:flex-row items-center gap-3 md:gap-5">
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
            <div className="flex items-center justify-center md:justify-start gap-2 mb-1 flex-wrap">
              <span className="text-[10px] md:text-[11px] font-bold text-primary uppercase tracking-[0.25em]">
                Season Finale
              </span>
              <span className="hidden md:inline-block w-1 h-1 rounded-full bg-primary/60" />
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                Ends {endDateLabel}
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

        {/* Projected Party Planners */}
        {lastTeam && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="relative rounded-md border border-red-500/40 bg-red-950/30 px-4 py-3 flex flex-col sm:flex-row items-center gap-3 sm:gap-4 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 via-transparent to-red-500/5 pointer-events-none" />

            <div className="relative flex items-center gap-2 shrink-0">
              <Skull className="w-4 h-4 text-red-400" />
              <span className="text-[10px] font-bold text-red-300 uppercase tracking-[0.18em] whitespace-nowrap">
                Projected Party Planners
              </span>
            </div>

            <div className="relative flex-1 flex items-center justify-center sm:justify-start gap-3">
              <div className="flex -space-x-2">
                {avatar1 ? (
                  <div className="w-9 h-9 rounded-full player-avatar ring-2 ring-red-500/50 bg-card">
                    <img src={avatar1} alt={lastTeam.player1} className="player-avatar-img w-full h-full" />
                  </div>
                ) : (
                  <div className="w-9 h-9 rounded-full bg-red-900/50 ring-2 ring-red-500/50 flex items-center justify-center text-xs font-bold text-red-300">
                    {lastTeam.player1[0]}
                  </div>
                )}
                {avatar2 ? (
                  <div className="w-9 h-9 rounded-full player-avatar ring-2 ring-red-500/50 bg-card">
                    <img src={avatar2} alt={lastTeam.player2} className="player-avatar-img w-full h-full" />
                  </div>
                ) : (
                  <div className="w-9 h-9 rounded-full bg-red-900/50 ring-2 ring-red-500/50 flex items-center justify-center text-xs font-bold text-red-300">
                    {lastTeam.player2[0]}
                  </div>
                )}
              </div>
              <div className="flex flex-col">
                <p className="font-display font-black text-sm text-foreground leading-tight">
                  {lastTeam.player1} & {lastTeam.player2}
                </p>
                <p className="text-[10px] text-red-300/70 italic flex items-center gap-1">
                  <Pizza className="w-3 h-3" /> Currently last — pizza duty pending
                </p>
              </div>
            </div>

            <div className="relative hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded bg-red-950/50 border border-red-500/30">
              <span className="text-[9px] font-bold text-red-300/80 uppercase tracking-widest">2 sessions to escape</span>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

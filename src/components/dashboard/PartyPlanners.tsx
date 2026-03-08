import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFilteredPlayerStats } from '@/hooks/useFilteredPlayerStats';
import { getPlayerAvatar } from '@/lib/playerAvatars';
import { PartyPopper, Pizza, Flame, Trophy, Skull } from 'lucide-react';

const ROASTS = [
  "At least you're good at something... right? 😬",
  "The only trophy you're getting is a receipt from the caterer.",
  "Maybe focus less on tennis and more on party planning skills.",
  "Your serve is weak but your event budget better not be.",
  "Legends say they once won a game. Nobody can confirm.",
  "Even the net has a better win rate than these two.",
  "Don't worry, the party will be the only W you get this year.",
  "Two players enter, zero points leave.",
  "The table has a bottom and you found it. Congrats.",
  "If losing was an Olympic sport, you'd still come second.",
];

export function PartyPlanners() {
  const { teamStats, loading } = useFilteredPlayerStats('all');
  const [roastIndex, setRoastIndex] = useState(0);

  const lastTeam = teamStats.length > 1 ? teamStats[teamStats.length - 1] : null;

  useEffect(() => {
    if (!lastTeam) return;
    const startIndex = (lastTeam.player1.length + lastTeam.player2.length) % ROASTS.length;
    setRoastIndex(startIndex);
    const interval = setInterval(() => {
      setRoastIndex((prev) => (prev + 1) % ROASTS.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [lastTeam?.player1, lastTeam?.player2]);

  if (loading) {
    return (
      <div className="relative bg-card/90 backdrop-blur-sm border border-border rounded-xl overflow-hidden shadow-card">
        <div className="p-5 text-center text-sm text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!lastTeam) return null;

  const avatar1 = getPlayerAvatar(lastTeam.player1);
  const avatar2 = getPlayerAvatar(lastTeam.player2);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] }}
      className="relative bg-card/90 backdrop-blur-sm border rounded-xl overflow-hidden transition-all duration-500 border-red-500/60 shadow-red-500/20 shadow-xl"
    >
      {/* Animated top bar — pulsing danger gradient */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-600 via-red-500 to-red-600" />

      {/* Subtle danger overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-red-500/10 via-transparent to-transparent pointer-events-none" />

      {/* Animated background embers */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-red-500/30"
            initial={{ x: `${20 + i * 30}%`, y: '100%', opacity: 0 }}
            animate={{
              y: [null, '-20%'],
              opacity: [0, 0.6, 0],
              x: `${20 + i * 30 + Math.sin(i) * 10}%`,
            }}
            transition={{
              duration: 3 + i,
              repeat: Infinity,
              delay: i * 1.2,
              ease: 'easeOut',
            }}
          />
        ))}
      </div>

      {/* Header */}
      <div className="relative bg-red-950/40 px-5 py-3.5 flex items-center gap-3 border-b border-red-500/20">
        <div className="flex items-center gap-2">
          <Skull className="w-4 h-4 text-red-400" />
          <h3 className="text-[11px] font-bold text-red-300 uppercase tracking-[0.15em]">
            Party Planners
          </h3>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <Flame className="w-3.5 h-3.5 text-red-500 animate-pulse" />
          <span className="text-[9px] font-bold text-red-400/80 uppercase tracking-widest">Last Place</span>
        </div>
      </div>

      {/* Content */}
      <div className="relative p-5 space-y-4">
        {/* Subtitle */}
        <p className="text-[9px] text-red-300/60 uppercase tracking-[0.2em] font-bold text-center">
          Current organizers of the year-end bash
        </p>

        {/* Avatars with dramatic presentation */}
        <div className="flex items-center justify-center gap-4">
          <motion.div
            whileHover={{ scale: 1.08, rotate: -3 }}
            transition={{ type: 'spring', stiffness: 300 }}
            className="relative"
          >
            {avatar1 ? (
              <div className="w-14 h-14 rounded-full player-avatar ring-2 ring-red-500/40 shadow-[0_0_20px_-4px_hsl(0,70%,50%,0.4)]">
                <img src={avatar1} alt={lastTeam.player1} className="player-avatar-img w-full h-full" />
              </div>
            ) : (
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-red-500/30 to-red-900/40 flex items-center justify-center font-display font-bold text-xl text-red-400 ring-2 ring-red-500/40">
                {lastTeam.player1[0]}
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-card border border-red-500/40 flex items-center justify-center text-[10px]">
              💀
            </div>
          </motion.div>

          <div className="flex flex-col items-center gap-0.5">
            <span className="text-red-500/60 font-black text-lg">&</span>
          </div>

          <motion.div
            whileHover={{ scale: 1.08, rotate: 3 }}
            transition={{ type: 'spring', stiffness: 300 }}
            className="relative"
          >
            {avatar2 ? (
              <div className="w-14 h-14 rounded-full player-avatar ring-2 ring-red-500/40 shadow-[0_0_20px_-4px_hsl(0,70%,50%,0.4)]">
                <img src={avatar2} alt={lastTeam.player2} className="player-avatar-img w-full h-full" />
              </div>
            ) : (
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-red-900/40 to-red-500/30 flex items-center justify-center font-display font-bold text-xl text-red-400 ring-2 ring-red-500/40">
                {lastTeam.player2[0]}
              </div>
            )}
            <div className="absolute -bottom-1 -left-1 w-5 h-5 rounded-full bg-card border border-red-500/40 flex items-center justify-center text-[10px]">
              💀
            </div>
          </motion.div>
        </div>

        {/* Names */}
        <div className="text-center space-y-1.5">
          <p className="font-display font-black text-foreground text-base tracking-tight">
            {lastTeam.player1} & {lastTeam.player2}
          </p>
          <div className="flex items-center justify-center gap-3 text-xs">
            <span className="flex items-center gap-1 text-muted-foreground">
              Avg: <span className="font-mono font-bold text-red-400">{lastTeam.avgPoints.toFixed(2)}</span>
            </span>
            <span className="text-red-500/30">|</span>
            <span className="flex items-center gap-1 text-muted-foreground">
              W%: <span className="font-mono font-bold text-red-400">{lastTeam.winPercentage.toFixed(0)}%</span>
            </span>
          </div>
        </div>

        {/* Rotating roast with animation */}
        <div className="bg-red-950/30 border border-red-500/15 rounded-lg px-3.5 py-3 text-center min-h-[3rem] flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.p
              key={roastIndex}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              className="text-[11px] text-red-300/70 italic leading-relaxed flex items-start gap-2"
            >
              <Pizza className="w-3.5 h-3.5 text-red-500/50 shrink-0 mt-0.5" />
              <span>{ROASTS[roastIndex]}</span>
            </motion.p>
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

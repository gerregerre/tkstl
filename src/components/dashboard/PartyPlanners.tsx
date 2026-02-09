import { useFilteredPlayerStats } from '@/hooks/useFilteredPlayerStats';
import { PartyPopper, Pizza } from 'lucide-react';

const FUNNY_SUBTITLES = [
  "Start looking for catering deals now! 🍕",
  "The bottom of the table looks... expensive.",
  "Hope you like organizing events!",
  "DJ bookings don't make themselves.",
  "Better start a group chat for decorations.",
  "Pro tip: Costco has bulk napkins.",
];

export function PartyPlanners() {
  const { teamStats, loading } = useFilteredPlayerStats('all');

  if (loading) {
    return (
      <div className="bg-card border border-border rounded-md overflow-hidden shadow-card">
        <div className="p-5 text-center text-sm text-muted-foreground">Loading...</div>
      </div>
    );
  }

  // Get last place team (teams are sorted by avg descending in the hook)
  const lastTeam = teamStats.length > 1 ? teamStats[teamStats.length - 1] : null;

  if (!lastTeam) {
    return null;
  }

  // Pick a "random" subtitle based on the team name length for consistency
  const subtitleIndex = (lastTeam.player1.length + lastTeam.player2.length) % FUNNY_SUBTITLES.length;
  const subtitle = FUNNY_SUBTITLES[subtitleIndex];

  return (
    <div className="bg-card border border-border rounded-md overflow-hidden shadow-card relative">
      {/* Animated gradient border accent */}
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-amber-500 via-rose-500 to-purple-500 animate-pulse" />

      {/* Header */}
      <div className="bg-secondary/50 px-5 py-4 flex items-center gap-3 border-b border-border">
        <div className="w-1 h-5 bg-amber-500 rounded-full shadow-[0_0_6px_hsl(38,92%,50%,0.4)]" />
        <PartyPopper className="w-4 h-4 text-amber-500" />
        <h3 className="text-[11px] font-bold text-foreground uppercase tracking-widest">
          Party Planners
        </h3>
        <span className="text-sm ml-auto">🥳</span>
      </div>

      {/* Content */}
      <div className="p-5 space-y-4">
        {/* Title */}
        <div className="text-center space-y-1">
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
            Current Organizers of the Year-End Bash
          </p>
        </div>

        {/* The "Winners" */}
        <div className="flex items-center justify-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500/30 to-rose-500/20 flex items-center justify-center font-display font-bold text-lg text-amber-500 ring-2 ring-amber-500/30 shadow-[0_0_16px_-4px_hsl(38,92%,50%,0.3)]">
            {lastTeam.player1[0]}
          </div>
          <span className="text-muted-foreground font-bold text-xs">&</span>
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-rose-500/30 to-purple-500/20 flex items-center justify-center font-display font-bold text-lg text-rose-400 ring-2 ring-rose-500/30 shadow-[0_0_16px_-4px_hsl(350,80%,55%,0.3)]">
            {lastTeam.player2[0]}
          </div>
        </div>

        <div className="text-center">
          <p className="font-display font-black text-foreground text-base tracking-tight">
            {lastTeam.player1} & {lastTeam.player2}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Avg: <span className="font-mono font-bold text-foreground">{lastTeam.avgPoints.toFixed(2)}</span>
            <span className="mx-2 text-border">·</span>
            W%: <span className="font-mono font-bold text-foreground">{lastTeam.winPercentage.toFixed(0)}%</span>
          </p>
        </div>

        {/* Funny subtitle */}
        <div className="bg-muted/50 border border-border/50 rounded-md px-3 py-2.5 text-center">
          <p className="text-xs text-muted-foreground italic flex items-center justify-center gap-1.5">
            <Pizza className="w-3.5 h-3.5 text-amber-500/70 shrink-0" />
            {subtitle}
          </p>
        </div>
      </div>
    </div>
  );
}

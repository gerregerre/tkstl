import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { getPlayerAvatar } from '@/lib/playerAvatars';
import { cn } from '@/lib/utils';
import { Trophy, Medal, Award, Lock } from 'lucide-react';

interface Standing {
  id: string;
  season_id: string;
  name: string;
  rank: number;
  type: string;
  total_points: number;
  avg_points: number;
  games_played: number;
}

interface Season {
  id: string;
  name: string;
  start_date: string;
  end_date: string | null;
}

const PODIUM = {
  1: {
    label: 'Champion',
    icon: Trophy,
    ring: 'ring-[hsl(43,74%,55%)]/70',
    glow: 'shadow-[0_0_50px_-8px_hsl(43,74%,55%,0.55)]',
    text: 'text-[hsl(43,80%,66%)]',
    plate: 'from-[hsl(43,74%,55%)]/25 to-transparent',
    height: 'md:h-40',
  },
  2: {
    label: 'Silver',
    icon: Medal,
    ring: 'ring-[hsl(210,12%,72%)]/60',
    glow: 'shadow-[0_0_36px_-10px_hsl(210,12%,80%,0.4)]',
    text: 'text-[hsl(210,14%,80%)]',
    plate: 'from-[hsl(210,12%,72%)]/20 to-transparent',
    height: 'md:h-28',
  },
  3: {
    label: 'Bronze',
    icon: Award,
    ring: 'ring-[hsl(25,45%,48%)]/60',
    glow: 'shadow-[0_0_30px_-10px_hsl(25,55%,50%,0.4)]',
    text: 'text-[hsl(25,55%,62%)]',
    plate: 'from-[hsl(25,45%,48%)]/20 to-transparent',
    height: 'md:h-20',
  },
} as const;

function getMemberNames(name: string): string[] {
  return name.split(/\s*&\s*/).map((n) => n.trim());
}

function AvatarRing({
  names,
  rank,
  ring,
  glow,
}: {
  names: string[];
  rank: number;
  ring: string;
  glow: string;
}) {
  const sizeClass = 'w-20 h-20 md:w-24 md:h-24';
  const isDoubles = names.length > 1;

  return (
    <div
      className={cn(
        'relative rounded-full ring-2 overflow-hidden bg-muted/40 shrink-0',
        sizeClass,
        ring,
        glow
      )}
    >
      {isDoubles ? (
        <div className="w-full h-full flex -space-x-2 items-center justify-center p-1.5">
          {names.map((name, i) => {
            const avatar = getPlayerAvatar(name);
            return (
              <div
                key={name}
                className={cn(
                  'relative w-1/2 h-full rounded-full overflow-hidden border-2 border-background/80 bg-white',
                  i === 0 && '-ml-1'
                )}
              >
                {avatar ? (
                  <img
                    src={avatar}
                    alt={`${name} podium portrait`}
                    className="w-full h-full object-cover mix-blend-multiply"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-display text-lg font-black text-foreground/70 bg-muted/40">
                    {name.charAt(0)}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="w-full h-full player-avatar">
          {names.map((name) => {
            const avatar = getPlayerAvatar(name);
            return avatar ? (
              <img
                key={name}
                src={avatar}
                alt={`${name} podium portrait`}
                className="player-avatar-img w-full h-full"
              />
            ) : (
              <div
                key={name}
                className="w-full h-full flex items-center justify-center font-display text-2xl font-black text-foreground/70"
              >
                {name.charAt(0)}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Pedestal({ standing }: { standing: Standing }) {
  const cfg = PODIUM[standing.rank as 1 | 2 | 3] ?? PODIUM[3];
  const Icon = cfg.icon;
  const memberNames = getMemberNames(standing.name);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: standing.rank * 0.08 }}
      className="flex flex-col items-center justify-end flex-1 min-w-0"
    >
      <Icon className={cn('h-6 w-6 mb-3', cfg.text)} strokeWidth={1.5} />

      <AvatarRing names={memberNames} rank={standing.rank} ring={cfg.ring} glow={cfg.glow} />

      <p className="mt-3 px-1 font-display text-sm md:text-base font-black uppercase tracking-tight text-foreground text-center leading-tight break-words">
        {standing.name}
      </p>
      <p className={cn('text-[10px] uppercase tracking-[0.2em] font-bold', cfg.text)}>{cfg.label}</p>

      <div
        className={cn(
          'mt-3 w-full h-14 rounded-t-sm border-t border-x border-border/60 bg-gradient-to-b flex flex-col items-center justify-center gap-0.5',
          cfg.plate,
          cfg.height
        )}
      >
        <span className="font-display text-xl font-black text-foreground tabular-nums">{standing.total_points}</span>
        <span className="text-[9px] uppercase tracking-[0.18em] text-muted-foreground">
          {standing.avg_points.toFixed(2)} avg · {standing.games_played} G
        </span>
      </div>
    </motion.div>
  );
}

function Hall({ title, standings }: { title: string; standings: Standing[] }) {
  const podium = [2, 1, 3]
    .map((r) => standings.find((s) => s.rank === r))
    .filter(Boolean) as Standing[];

  if (podium.length === 0) return null;

  return (
    <div className="relative rounded-lg border border-border/70 bg-card/70 backdrop-blur-sm p-6 md:p-8 overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[hsl(43,74%,55%)]/50 to-transparent" />
      <p className="text-center text-[10px] uppercase tracking-[0.35em] text-muted-foreground mb-8">{title}</p>
      <div className="flex items-end gap-3 md:gap-6">
        {podium.map((s) => (
          <Pedestal key={s.id} standing={s} />
        ))}
      </div>
    </div>
  );
}

export function TrophyRoom() {
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [standings, setStandings] = useState<Standing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [{ data: s }, { data: st }] = await Promise.all([
        supabase.from('seasons').select('id, name, start_date, end_date').order('start_date', { ascending: false }),
        supabase.from('season_standings').select('*').lte('rank', 3),
      ]);
      setSeasons((s ?? []) as Season[]);
      setStandings((st ?? []) as Standing[]);
      setLoading(false);
    };
    load();
  }, []);

  const archived = useMemo(() => seasons.filter((s) => s.end_date), [seasons]);

  const inductees = useMemo(() => {
    const names = new Set(standings.map((s) => s.name));
    return names.size;
  }, [standings]);

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-10 md:py-14">
      {/* Room header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-10 md:mb-14"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[hsl(43,74%,55%)]/40 bg-[hsl(43,74%,55%)]/10 mb-5">
          <Lock className="h-3 w-3 text-[hsl(43,80%,66%)]" />
          <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-[hsl(43,80%,66%)]">
            Members only
          </span>
        </div>
        <h1 className="font-display text-4xl md:text-6xl font-black uppercase tracking-tighter text-foreground">
          The Trophy Room
        </h1>
        <div className="mx-auto mt-4 h-px w-40 bg-gradient-to-r from-transparent via-[hsl(43,74%,55%)]/70 to-transparent" />
        <p className="mt-4 text-sm text-muted-foreground max-w-xl mx-auto">
          Reserved for those who finished on the podium. Gold, silver and bronze only — everyone else watches from the
          corridor.
        </p>
        <p className="mt-3 text-[10px] uppercase tracking-[0.25em] text-muted-foreground/70">
          {inductees} inductees · {archived.length} season{archived.length === 1 ? '' : 's'} enshrined
        </p>
      </motion.div>

      {loading ? (
        <div className="text-center text-sm text-muted-foreground py-16">Polishing the silverware…</div>
      ) : archived.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border/70 bg-card/50 p-12 text-center">
          <Trophy className="h-8 w-8 mx-auto text-muted-foreground/50 mb-4" strokeWidth={1.5} />
          <p className="font-display text-lg font-bold uppercase tracking-tight text-foreground">
            The plinths are empty
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            No season has been archived yet. Finish a season to earn your place in here.
          </p>
        </div>
      ) : (
        <div className="space-y-12 md:space-y-16">
          {archived.map((season) => {
            const singles = standings.filter((s) => s.season_id === season.id && s.type === 'singles');
            const doubles = standings.filter((s) => s.season_id === season.id && s.type === 'doubles');
            if (singles.length === 0 && doubles.length === 0) return null;

            return (
              <section key={season.id}>
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-px flex-1 bg-border/60" />
                  <h2 className="font-display text-xl md:text-2xl font-black uppercase tracking-tight text-foreground whitespace-nowrap">
                    {season.name}
                  </h2>
                  <div className="h-px flex-1 bg-border/60" />
                </div>
                <div className="grid gap-6 md:grid-cols-2">
                  <Hall title="Singles podium" standings={singles} />
                  <Hall title="Doubles podium" standings={doubles} />
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}

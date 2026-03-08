import { Achievement, TIER_STYLES } from '@/lib/achievements';
import { cn } from '@/lib/utils';
import { Award, Lock } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface AchievementsBadgesProps {
  achievements: Achievement[];
}

export function AchievementsBadges({ achievements }: AchievementsBadgesProps) {
  const earned = achievements.filter(a => a.earned);
  const locked = achievements.filter(a => !a.earned);

  return (
    <div className="relative bg-card border border-border rounded-xl shadow-card overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

      <div className="p-5 md:p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display text-sm uppercase tracking-widest text-foreground">Achievements</h3>
            <p className="text-xs text-muted-foreground mt-1">
              {earned.length} of {achievements.length} unlocked
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <Award className="w-4 h-4 text-primary" />
            <span className="font-display text-lg text-primary">{earned.length}</span>
          </div>
        </div>
        {/* Progress bar */}
        <div className="mt-3 h-1.5 bg-secondary/50 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full transition-all duration-500"
            style={{ width: `${(earned.length / achievements.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="p-5 md:p-6 space-y-5">
        {/* Earned */}
        {earned.length > 0 && (
          <div>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-3">Unlocked</p>
            <TooltipProvider delayDuration={200}>
              <div className="flex flex-wrap gap-2">
                {earned.map(a => (
                  <Tooltip key={a.id}>
                    <TooltipTrigger asChild>
                      <div className={cn(
                        "flex items-center gap-2 px-3 py-2 rounded-lg border transition-all cursor-default",
                        TIER_STYLES[a.tier].bg,
                        TIER_STYLES[a.tier].border,
                        TIER_STYLES[a.tier].glow,
                      )}>
                        <span className="text-base">{a.icon}</span>
                        <span className={cn("text-xs font-semibold", TIER_STYLES[a.tier].text)}>
                          {a.name}
                        </span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-52">
                      <p className="font-semibold text-sm">{a.name}</p>
                      <p className="text-xs text-muted-foreground">{a.description}</p>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
            </TooltipProvider>
          </div>
        )}

        {/* Locked */}
        {locked.length > 0 && (
          <div>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-3">Locked</p>
            <TooltipProvider delayDuration={200}>
              <div className="flex flex-wrap gap-2">
                {locked.map(a => (
                  <Tooltip key={a.id}>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border/50 bg-secondary/20 opacity-50 cursor-default">
                        <Lock className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="text-xs font-medium text-muted-foreground">{a.name}</span>
                        {a.progress && (
                          <span className="text-[10px] text-muted-foreground/70 font-mono">{a.progress}</span>
                        )}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-52">
                      <p className="font-semibold text-sm">{a.name}</p>
                      <p className="text-xs text-muted-foreground">{a.description}</p>
                      {a.progress && <p className="text-xs text-primary mt-1">Progress: {a.progress}</p>}
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
            </TooltipProvider>
          </div>
        )}
      </div>
    </div>
  );
}

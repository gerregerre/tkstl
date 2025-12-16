import { useMembers } from '@/contexts/MembersContext';
import { CrownIcon } from '@/components/icons/CrownIcon';
import { DirtIcon } from '@/components/icons/DirtIcon';
import { cn } from '@/lib/utils';

export function Leaderboard() {
  const { members } = useMembers();
  const sortedMembers = [...members].sort((a, b) => {
    // Sort by Noble Standard first, then by wins
    if (b.nobleStandard !== a.nobleStandard) {
      return b.nobleStandard - a.nobleStandard;
    }
    return b.wins - a.wins;
  });

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="text-center">
        <h2 className="font-serif text-3xl font-bold text-foreground">
          The PwC Scoreboard
        </h2>
        <p className="text-muted-foreground mt-1 font-serif-body italic">
          Where legends are quantified and peasants are reminded of their place
        </p>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block bg-card rounded-lg border border-border overflow-hidden shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-muted/50 border-b border-border">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Rank
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Name
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Wins
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Losses
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  +/-
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Win %
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <span className="text-gold">Noble Standard</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {sortedMembers.map((member, index) => {
                const isRoyal = member.role === 'royalty';
                const winRate = ((member.wins / (member.wins + member.losses)) * 100).toFixed(1);
                
                return (
                  <tr
                    key={member.id}
                    className={cn(
                      "transition-colors",
                      isRoyal ? "bg-gold/5 hover:bg-gold/10" : "hover:bg-muted/50"
                    )}
                  >
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "font-serif font-bold text-lg",
                          index === 0 && "text-gold",
                          index === 1 && "text-terra-cotta",
                          index === 2 && "text-hunter-green"
                        )}>
                          {index + 1}
                        </span>
                        {index < 3 && (
                          <span className="text-xs">
                            {index === 0 && "👑"}
                            {index === 1 && "🥈"}
                            {index === 2 && "🥉"}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center font-serif font-bold",
                          isRoyal
                            ? "bg-gradient-noble text-foreground"
                            : "bg-gradient-peasant text-foreground"
                        )}>
                          {member.name[0]}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-foreground">
                              {member.name}
                            </span>
                            {isRoyal ? (
                              <CrownIcon className="w-4 h-4 text-gold" />
                            ) : (
                              <DirtIcon className="w-4 h-4 text-burlap" />
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground italic">
                            {member.title}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center font-semibold text-hunter-green">
                      {member.wins}
                    </td>
                    <td className="px-4 py-4 text-center font-semibold text-destructive/70">
                      {member.losses}
                    </td>
                    <td className={cn(
                      "px-4 py-4 text-center font-semibold",
                      member.pointDifferential > 0 ? "text-hunter-green" : "text-destructive/70"
                    )}>
                      {member.pointDifferential > 0 ? '+' : ''}{member.pointDifferential}
                    </td>
                    <td className="px-4 py-4 text-center font-medium">
                      {winRate}%
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className={cn(
                        "inline-flex items-center justify-center px-3 py-1 rounded-full font-serif font-bold text-sm",
                        member.nobleStandard >= 8 && "bg-gold/20 text-gold",
                        member.nobleStandard >= 6 && member.nobleStandard < 8 && "bg-hunter-green/20 text-hunter-green",
                        member.nobleStandard < 6 && "bg-burlap/20 text-burlap"
                      )}>
                        {member.nobleStandard.toFixed(1)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {sortedMembers.map((member, index) => {
          const isRoyal = member.role === 'royalty';
          const winRate = ((member.wins / (member.wins + member.losses)) * 100).toFixed(1);
          
          return (
            <div
              key={member.id}
              className={cn(
                "bg-card rounded-lg border border-border p-4 shadow-card",
                isRoyal && "border-gold/30"
              )}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className={cn(
                    "font-serif font-bold text-2xl w-8",
                    index === 0 && "text-gold",
                    index === 1 && "text-terra-cotta",
                    index === 2 && "text-hunter-green"
                  )}>
                    {index + 1}
                  </span>
                  <div className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center font-serif font-bold text-lg",
                    isRoyal
                      ? "bg-gradient-noble text-foreground"
                      : "bg-gradient-peasant text-foreground"
                  )}>
                    {member.name[0]}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground">
                        {member.name}
                      </span>
                      {isRoyal ? (
                        <CrownIcon className="w-4 h-4 text-gold" />
                      ) : (
                        <DirtIcon className="w-4 h-4 text-burlap" />
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground italic">
                      {member.title}
                    </span>
                  </div>
                </div>
                <span className={cn(
                  "px-3 py-1 rounded-full font-serif font-bold text-sm",
                  member.nobleStandard >= 8 && "bg-gold/20 text-gold",
                  member.nobleStandard >= 6 && member.nobleStandard < 8 && "bg-hunter-green/20 text-hunter-green",
                  member.nobleStandard < 6 && "bg-burlap/20 text-burlap"
                )}>
                  {member.nobleStandard.toFixed(1)}
                </span>
              </div>
              <div className="grid grid-cols-4 gap-2 text-center text-sm">
                <div className="bg-muted/50 rounded-lg p-2">
                  <p className="text-xs text-muted-foreground">Wins</p>
                  <p className="font-semibold text-hunter-green">{member.wins}</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-2">
                  <p className="text-xs text-muted-foreground">Losses</p>
                  <p className="font-semibold text-destructive/70">{member.losses}</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-2">
                  <p className="text-xs text-muted-foreground">+/-</p>
                  <p className={cn(
                    "font-semibold",
                    member.pointDifferential > 0 ? "text-hunter-green" : "text-destructive/70"
                  )}>
                    {member.pointDifferential > 0 ? '+' : ''}{member.pointDifferential}
                  </p>
                </div>
                <div className="bg-muted/50 rounded-lg p-2">
                  <p className="text-xs text-muted-foreground">Win %</p>
                  <p className="font-semibold">{winRate}%</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="bg-muted/30 rounded-lg p-4 border border-border">
        <h3 className="font-serif font-semibold text-sm mb-2">The Noble Standard (KPI)</h3>
        <p className="text-xs text-muted-foreground">
          A composite score derived from: Punctuality, Commitment, Equipment Quality, 
          Humor/Storytelling, and Sauna Performance. Scores above 8.0 indicate true nobility; 
          below 6.0 suggests one should consider their life choices.
        </p>
      </div>
    </div>
  );
}

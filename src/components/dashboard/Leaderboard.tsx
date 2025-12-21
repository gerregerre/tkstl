import { useMembers } from '@/contexts/MembersContext';
import { cn } from '@/lib/utils';
import { Crown, User } from 'lucide-react';

export function Leaderboard() {
  const { members } = useMembers();
  const sortedMembers = [...members].sort((a, b) => {
    if (b.nobleStandard !== a.nobleStandard) {
      return b.nobleStandard - a.nobleStandard;
    }
    return b.wins - a.wins;
  });

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Page Header */}
      <div>
        <h1 className="section-header">PwC Scoreboard</h1>
        <p className="text-muted-foreground mt-2 ml-5">
          Where legends are quantified and peasants are reminded of their place
        </p>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block bg-card rounded border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted">
                <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Rank
                </th>
                <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Player
                </th>
                <th className="px-4 py-4 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  W
                </th>
                <th className="px-4 py-4 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  L
                </th>
                <th className="px-4 py-4 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  +/-
                </th>
                <th className="px-4 py-4 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Win %
                </th>
                <th className="px-4 py-4 text-center text-xs font-semibold uppercase tracking-wider text-primary">
                  Noble Standard
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {sortedMembers.map((member, index) => {
                const isRoyal = member.role === 'royalty';
                const total = member.wins + member.losses;
                const winRate = total > 0 ? ((member.wins / total) * 100).toFixed(1) : '0.0';
                
                return (
                  <tr
                    key={member.id}
                    className="hover:bg-muted/50 transition-colors"
                  >
                    <td className="px-4 py-4">
                      <span className={cn(
                        "font-serif font-bold text-lg",
                        index === 0 && "text-primary",
                        index === 1 && "text-secondary",
                        index === 2 && "text-muted-foreground"
                      )}>
                        {index + 1}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center font-serif font-bold text-sm",
                          isRoyal
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                        )}>
                          {member.name[0]}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-foreground">
                              {member.name}
                            </span>
                            {isRoyal && (
                              <Crown className="w-3.5 h-3.5 text-primary" />
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {member.title}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center font-semibold text-secondary">
                      {member.wins}
                    </td>
                    <td className="px-4 py-4 text-center font-semibold text-muted-foreground">
                      {member.losses}
                    </td>
                    <td className={cn(
                      "px-4 py-4 text-center font-semibold",
                      member.pointDifferential > 0 ? "text-secondary" : member.pointDifferential < 0 ? "text-destructive" : "text-muted-foreground"
                    )}>
                      {member.pointDifferential > 0 ? '+' : ''}{member.pointDifferential}
                    </td>
                    <td className="px-4 py-4 text-center font-medium text-foreground">
                      {winRate}%
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className={cn(
                        "inline-flex items-center justify-center px-3 py-1 rounded text-sm font-bold",
                        member.nobleStandard >= 8 && "bg-primary/10 text-primary",
                        member.nobleStandard >= 6 && member.nobleStandard < 8 && "bg-secondary/10 text-secondary",
                        member.nobleStandard < 6 && "bg-muted text-muted-foreground"
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
          const total = member.wins + member.losses;
          const winRate = total > 0 ? ((member.wins / total) * 100).toFixed(1) : '0.0';
          
          return (
            <div
              key={member.id}
              className="bg-card rounded border border-border p-4"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className={cn(
                    "font-serif font-bold text-2xl w-8",
                    index === 0 && "text-primary",
                    index === 1 && "text-secondary",
                    index === 2 && "text-muted-foreground"
                  )}>
                    {index + 1}
                  </span>
                  <div className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center font-serif font-bold text-lg",
                    isRoyal
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  )}>
                    {member.name[0]}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">
                        {member.name}
                      </span>
                      {isRoyal && (
                        <Crown className="w-3.5 h-3.5 text-primary" />
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {member.title}
                    </span>
                  </div>
                </div>
                <span className={cn(
                  "px-3 py-1 rounded text-sm font-bold",
                  member.nobleStandard >= 8 && "bg-primary/10 text-primary",
                  member.nobleStandard >= 6 && member.nobleStandard < 8 && "bg-secondary/10 text-secondary",
                  member.nobleStandard < 6 && "bg-muted text-muted-foreground"
                )}>
                  {member.nobleStandard.toFixed(1)}
                </span>
              </div>
              <div className="grid grid-cols-4 gap-2 text-center text-sm">
                <div className="bg-muted rounded p-2">
                  <p className="text-xs text-muted-foreground">W</p>
                  <p className="font-semibold text-secondary">{member.wins}</p>
                </div>
                <div className="bg-muted rounded p-2">
                  <p className="text-xs text-muted-foreground">L</p>
                  <p className="font-semibold text-muted-foreground">{member.losses}</p>
                </div>
                <div className="bg-muted rounded p-2">
                  <p className="text-xs text-muted-foreground">+/-</p>
                  <p className={cn(
                    "font-semibold",
                    member.pointDifferential > 0 ? "text-secondary" : member.pointDifferential < 0 ? "text-destructive" : "text-muted-foreground"
                  )}>
                    {member.pointDifferential > 0 ? '+' : ''}{member.pointDifferential}
                  </p>
                </div>
                <div className="bg-muted rounded p-2">
                  <p className="text-xs text-muted-foreground">Win %</p>
                  <p className="font-semibold text-foreground">{winRate}%</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="bg-muted rounded p-4 border border-border">
        <h3 className="font-serif font-semibold text-sm mb-2 uppercase tracking-wide">The Noble Standard</h3>
        <p className="text-sm text-muted-foreground">
          A composite score from: Punctuality, Commitment, Equipment Quality, 
          Humor/Storytelling, and Sauna Performance.
        </p>
      </div>
    </div>
  );
}
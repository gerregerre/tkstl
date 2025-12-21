import { Trophy, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { members } from '@/data/members';

export function PwCScoreboard() {
  // Sort members by wins, then by point differential
  const sortedMembers = [...members].sort((a, b) => {
    if (b.wins !== a.wins) return b.wins - a.wins;
    return b.pointDifferential - a.pointDifferential;
  });

  const getTrendIcon = (index: number) => {
    // Mock trend data - in real app this would come from historical data
    const trends = ['up', 'same', 'down', 'up', 'same', 'down'];
    const trend = trends[index % trends.length];
    
    if (trend === 'up') return <TrendingUp className="w-4 h-4 text-green-600" />;
    if (trend === 'down') return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-muted-foreground" />;
  };

  return (
    <div className="bg-card border border-border rounded overflow-hidden">
      {/* PwC-style Header */}
      <div className="bg-[#dc6900] px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Trophy className="w-5 h-5 text-white" />
            <h3 className="font-serif text-lg font-semibold text-white uppercase tracking-wide">
              Live Standings
            </h3>
          </div>
          <span className="text-xs text-white/80 font-medium uppercase tracking-wider">
            PwC Scoreboard
          </span>
        </div>
      </div>

      {/* Table Header */}
      <div className="grid grid-cols-12 gap-2 px-6 py-3 bg-muted/50 border-b border-border text-xs font-medium text-muted-foreground uppercase tracking-wide">
        <div className="col-span-1">Pos</div>
        <div className="col-span-5">Player</div>
        <div className="col-span-2 text-center">W-L</div>
        <div className="col-span-2 text-center">+/-</div>
        <div className="col-span-2 text-center">Form</div>
      </div>

      {/* Player Rows */}
      <div className="divide-y divide-border">
        {sortedMembers.map((member, index) => (
          <div
            key={member.id}
            className={`grid grid-cols-12 gap-2 px-6 py-4 items-center transition-colors hover:bg-muted/30 ${
              index < 3 ? 'bg-primary/5' : ''
            }`}
          >
            {/* Position */}
            <div className="col-span-1">
              <span className={`font-serif text-lg font-bold ${
                index === 0 ? 'text-[#dc6900]' : 
                index === 1 ? 'text-secondary' : 
                index === 2 ? 'text-primary' : 'text-muted-foreground'
              }`}>
                {index + 1}
              </span>
            </div>

            {/* Player Name */}
            <div className="col-span-5">
              <div className="flex items-center gap-2">
                <span className="font-medium text-foreground">{member.name}</span>
                {member.role === 'royalty' && (
                  <span className="text-xs px-1.5 py-0.5 bg-[#dc6900]/10 text-[#dc6900] rounded font-medium">
                    RF
                  </span>
                )}
              </div>
              <span className="text-xs text-muted-foreground">{member.title}</span>
            </div>

            {/* Win-Loss */}
            <div className="col-span-2 text-center">
              <span className="font-mono text-sm font-medium text-foreground">
                {member.wins}-{member.losses}
              </span>
            </div>

            {/* Point Differential */}
            <div className="col-span-2 text-center">
              <span className={`font-mono text-sm font-medium ${
                member.pointDifferential > 0 ? 'text-green-600' : 
                member.pointDifferential < 0 ? 'text-red-500' : 'text-muted-foreground'
              }`}>
                {member.pointDifferential > 0 ? '+' : ''}{member.pointDifferential}
              </span>
            </div>

            {/* Form/Trend */}
            <div className="col-span-2 flex justify-center">
              {getTrendIcon(index)}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="px-6 py-3 bg-muted/30 border-t border-border">
        <p className="text-xs text-muted-foreground text-center">
          Updated in real-time • Season 2024/25
        </p>
      </div>
    </div>
  );
}

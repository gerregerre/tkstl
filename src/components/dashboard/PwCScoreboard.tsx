import { useState, useEffect, useRef } from 'react';
import { Trophy, TrendingUp, TrendingDown, Minus, ChevronUp, ChevronDown } from 'lucide-react';
import { members } from '@/data/members';
import { User } from '@/types/user';

interface PositionChange {
  memberId: string;
  previousPosition: number;
  currentPosition: number;
  direction: 'up' | 'down' | 'same';
}

export function PwCScoreboard() {
  const [sortedMembers, setSortedMembers] = useState<User[]>([]);
  const [positionChanges, setPositionChanges] = useState<Map<string, PositionChange>>(new Map());
  const [animatingRows, setAnimatingRows] = useState<Set<string>>(new Set());
  const previousPositionsRef = useRef<Map<string, number>>(new Map());

  // Sort members by wins, then by point differential
  const sortMembers = (memberList: User[]) => {
    return [...memberList].sort((a, b) => {
      if (b.wins !== a.wins) return b.wins - a.wins;
      return b.pointDifferential - a.pointDifferential;
    });
  };

  useEffect(() => {
    const sorted = sortMembers(members);
    
    // Calculate position changes
    const newChanges = new Map<string, PositionChange>();
    const newAnimating = new Set<string>();
    
    sorted.forEach((member, index) => {
      const currentPosition = index + 1;
      const previousPosition = previousPositionsRef.current.get(member.id);
      
      if (previousPosition !== undefined && previousPosition !== currentPosition) {
        const direction = currentPosition < previousPosition ? 'up' : 'down';
        newChanges.set(member.id, {
          memberId: member.id,
          previousPosition,
          currentPosition,
          direction,
        });
        newAnimating.add(member.id);
      }
    });

    // Update previous positions for next comparison
    sorted.forEach((member, index) => {
      previousPositionsRef.current.set(member.id, index + 1);
    });

    setSortedMembers(sorted);
    setPositionChanges(newChanges);
    setAnimatingRows(newAnimating);

    // Clear animations after they complete
    if (newAnimating.size > 0) {
      const timer = setTimeout(() => {
        setAnimatingRows(new Set());
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [members]);

  const getPositionChangeIndicator = (memberId: string) => {
    const change = positionChanges.get(memberId);
    if (!change || change.direction === 'same') return null;

    const diff = Math.abs(change.previousPosition - change.currentPosition);
    
    if (change.direction === 'up') {
      return (
        <div className="flex items-center gap-0.5 text-green-600 animate-slide-up">
          <ChevronUp className="w-3 h-3" />
          <span className="text-xs font-medium">{diff}</span>
        </div>
      );
    }
    
    return (
      <div className="flex items-center gap-0.5 text-red-500 animate-slide-down">
        <ChevronDown className="w-3 h-3" />
        <span className="text-xs font-medium">{diff}</span>
      </div>
    );
  };

  const getRowAnimation = (memberId: string) => {
    if (!animatingRows.has(memberId)) return '';
    
    const change = positionChanges.get(memberId);
    if (!change) return '';
    
    return change.direction === 'up' 
      ? 'animate-position-up' 
      : 'animate-position-down';
  };

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
          <div className="flex items-center gap-2">
            {animatingRows.size > 0 && (
              <span className="text-xs text-white/90 font-medium px-2 py-1 bg-white/20 rounded animate-pulse">
                LIVE UPDATE
              </span>
            )}
            <span className="text-xs text-white/80 font-medium uppercase tracking-wider">
              PwC Scoreboard
            </span>
          </div>
        </div>
      </div>

      {/* Table Header */}
      <div className="grid grid-cols-12 gap-2 px-6 py-3 bg-muted/50 border-b border-border text-xs font-medium text-muted-foreground uppercase tracking-wide">
        <div className="col-span-1">Pos</div>
        <div className="col-span-4">Player</div>
        <div className="col-span-2 text-center">W-L</div>
        <div className="col-span-2 text-center">Win %</div>
        <div className="col-span-2 text-center">+/-</div>
        <div className="col-span-1 text-center">Form</div>
      </div>

      {/* Player Rows */}
      <div className="divide-y divide-border">
        {sortedMembers.map((member, index) => {
          const totalGames = member.wins + member.losses;
          const winPercentage = totalGames > 0 ? (member.wins / totalGames) * 100 : 0;
          
          return (
            <div
              key={member.id}
              className={`grid grid-cols-12 gap-2 px-6 py-4 items-center transition-all duration-300 hover:bg-muted/30 ${
                index < 3 ? 'bg-primary/5' : ''
              } ${getRowAnimation(member.id)}`}
            >
              {/* Position with change indicator */}
              <div className="col-span-1 flex items-center gap-1">
                <span className={`font-serif text-lg font-bold transition-transform ${
                  animatingRows.has(member.id) ? 'animate-number-pop' : ''
                } ${
                  index === 0 ? 'text-[#dc6900]' : 
                  index === 1 ? 'text-secondary' : 
                  index === 2 ? 'text-primary' : 'text-muted-foreground'
                }`}>
                  {index + 1}
                </span>
                {getPositionChangeIndicator(member.id)}
              </div>

              {/* Player Name */}
              <div className="col-span-4">
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
                <span className={`font-mono text-sm font-medium text-foreground transition-all ${
                  animatingRows.has(member.id) ? 'animate-highlight-pulse' : ''
                }`}>
                  {member.wins}-{member.losses}
                </span>
              </div>

              {/* Win Percentage */}
              <div className="col-span-2 text-center">
                <span className={`font-mono text-sm font-medium ${
                  winPercentage >= 60 ? 'text-green-600' : 
                  winPercentage >= 40 ? 'text-foreground' : 
                  totalGames === 0 ? 'text-muted-foreground' : 'text-red-500'
                }`}>
                  {totalGames > 0 ? `${winPercentage.toFixed(0)}%` : '-'}
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
              <div className="col-span-1 flex justify-center">
                {getTrendIcon(index)}
              </div>
            </div>
          );
        })}
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

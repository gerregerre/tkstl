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

  const sortMembers = (memberList: User[]) => {
    return [...memberList].sort((a, b) => {
      if (b.wins !== a.wins) return b.wins - a.wins;
      return b.pointDifferential - a.pointDifferential;
    });
  };

  useEffect(() => {
    const sorted = sortMembers(members);
    
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

    sorted.forEach((member, index) => {
      previousPositionsRef.current.set(member.id, index + 1);
    });

    setSortedMembers(sorted);
    setPositionChanges(newChanges);
    setAnimatingRows(newAnimating);

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
        <div className="flex items-center gap-0.5 text-green-600">
          <ChevronUp className="w-3 h-3" />
          <span className="text-xs font-medium">{diff}</span>
        </div>
      );
    }
    
    return (
      <div className="flex items-center gap-0.5 text-red-500">
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
    const trends = ['up', 'same', 'down', 'up', 'same', 'down'];
    const trend = trends[index % trends.length];
    
    if (trend === 'up') return <TrendingUp className="w-3 h-3 text-green-600" />;
    if (trend === 'down') return <TrendingDown className="w-3 h-3 text-red-500" />;
    return <Minus className="w-3 h-3 text-muted-foreground" />;
  };

  return (
    <div className="bg-card border-b border-border">
      {/* Compact Header */}
      <div className="bg-[#dc6900] px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-white" />
          <h3 className="font-serif text-sm font-semibold text-white uppercase tracking-wide">
            Live Standings
          </h3>
        </div>
        <div className="flex items-center gap-2">
          {animatingRows.size > 0 && (
            <span className="text-[10px] text-white/90 font-medium px-1.5 py-0.5 bg-white/20 rounded animate-pulse">
              LIVE
            </span>
          )}
          <span className="text-[10px] text-white/80 font-medium uppercase tracking-wider">
            PwC Scoreboard
          </span>
        </div>
      </div>

      {/* Horizontal Scrollable Table */}
      <div className="overflow-x-auto">
        <div className="flex items-center gap-4 px-4 py-2 min-w-max">
          {sortedMembers.slice(0, 6).map((member, index) => {
            const totalGames = member.wins + member.losses;
            const winPercentage = totalGames > 0 ? (member.wins / totalGames) * 100 : 0;
            
            return (
              <div
                key={member.id}
                className={`flex items-center gap-3 px-3 py-2 rounded transition-all duration-300 ${
                  index < 3 ? 'bg-primary/5' : 'bg-muted/30'
                } ${getRowAnimation(member.id)}`}
              >
                {/* Position */}
                <div className="flex items-center gap-1">
                  <span className={`font-serif text-lg font-bold ${
                    index === 0 ? 'text-[#dc6900]' : 
                    index === 1 ? 'text-secondary' : 
                    index === 2 ? 'text-primary' : 'text-muted-foreground'
                  }`}>
                    {index + 1}
                  </span>
                  {getPositionChangeIndicator(member.id)}
                </div>

                {/* Player Info */}
                <div className="min-w-[100px]">
                  <div className="flex items-center gap-1.5">
                    <span className="font-medium text-sm text-foreground">{member.name}</span>
                    {member.role === 'royalty' && (
                      <span className="text-[10px] px-1 py-0.5 bg-[#dc6900]/10 text-[#dc6900] rounded font-medium">
                        RF
                      </span>
                    )}
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-3 text-xs">
                  <span className="font-mono text-muted-foreground">
                    {member.wins}-{member.losses}
                  </span>
                  <span className={`font-mono ${
                    winPercentage >= 60 ? 'text-green-600' : 
                    winPercentage >= 40 ? 'text-foreground' : 
                    totalGames === 0 ? 'text-muted-foreground' : 'text-red-500'
                  }`}>
                    {totalGames > 0 ? `${winPercentage.toFixed(0)}%` : '-'}
                  </span>
                  <span className={`font-mono ${
                    member.pointDifferential > 0 ? 'text-green-600' : 
                    member.pointDifferential < 0 ? 'text-red-500' : 'text-muted-foreground'
                  }`}>
                    {member.pointDifferential > 0 ? '+' : ''}{member.pointDifferential}
                  </span>
                  {getTrendIcon(index)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

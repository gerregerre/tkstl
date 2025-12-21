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
    
    if (trend === 'up') return <TrendingUp className="w-4 h-4 text-green-600" />;
    if (trend === 'down') return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-muted-foreground" />;
  };

  return (
    <div className="bg-card border border-border rounded overflow-hidden">
      {/* Header */}
      <div className="bg-[#dc6900] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Trophy className="w-5 h-5 text-white" />
          <h3 className="font-serif text-lg font-semibold text-white uppercase tracking-wide">
            PwC Scoreboard - Live Standings
          </h3>
        </div>
        {animatingRows.size > 0 && (
          <span className="text-xs text-white/90 font-medium px-2 py-1 bg-white/20 rounded animate-pulse">
            LIVE
          </span>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-muted/50 border-b border-border">
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider w-16">Pos</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Player</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider w-20">W</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider w-20">L</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider w-24">Win %</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider w-24">+/-</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider w-20">Trend</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {sortedMembers.map((member, index) => {
              const totalGames = member.wins + member.losses;
              const winPercentage = totalGames > 0 ? (member.wins / totalGames) * 100 : 0;
              
              return (
                <tr
                  key={member.id}
                  className={`transition-all duration-300 hover:bg-muted/30 ${
                    index < 3 ? 'bg-primary/5' : ''
                  } ${getRowAnimation(member.id)}`}
                >
                  {/* Position */}
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <span className={`font-serif text-xl font-bold ${
                        index === 0 ? 'text-[#dc6900]' : 
                        index === 1 ? 'text-secondary-foreground' : 
                        index === 2 ? 'text-primary' : 'text-muted-foreground'
                      }`}>
                        {index + 1}
                      </span>
                      {getPositionChangeIndicator(member.id)}
                    </div>
                  </td>

                  {/* Player */}
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">{member.name}</span>
                      {member.role === 'royalty' && (
                        <span className="text-[10px] px-1.5 py-0.5 bg-[#dc6900]/10 text-[#dc6900] rounded font-medium">
                          RF
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Wins */}
                  <td className="px-4 py-4 text-center">
                    <span className="font-mono font-semibold text-green-600">{member.wins}</span>
                  </td>

                  {/* Losses */}
                  <td className="px-4 py-4 text-center">
                    <span className="font-mono font-semibold text-red-500">{member.losses}</span>
                  </td>

                  {/* Win % */}
                  <td className="px-4 py-4 text-center">
                    <span className={`font-mono font-semibold ${
                      winPercentage >= 60 ? 'text-green-600' : 
                      winPercentage >= 40 ? 'text-foreground' : 
                      totalGames === 0 ? 'text-muted-foreground' : 'text-red-500'
                    }`}>
                      {totalGames > 0 ? `${winPercentage.toFixed(0)}%` : '-'}
                    </span>
                  </td>

                  {/* Point Differential */}
                  <td className="px-4 py-4 text-center">
                    <span className={`font-mono font-semibold ${
                      member.pointDifferential > 0 ? 'text-green-600' : 
                      member.pointDifferential < 0 ? 'text-red-500' : 'text-muted-foreground'
                    }`}>
                      {member.pointDifferential > 0 ? '+' : ''}{member.pointDifferential}
                    </span>
                  </td>

                  {/* Trend */}
                  <td className="px-4 py-4">
                    <div className="flex justify-center">
                      {getTrendIcon(index)}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

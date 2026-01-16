import { useState } from 'react';
import { usePlayers } from '@/hooks/usePlayers';
import { useFilteredPlayerStats, GameTypeFilter } from '@/hooks/useFilteredPlayerStats';
import { cn } from '@/lib/utils';
import { User, Users, RefreshCw, Filter } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LeaderboardRowDesktop, LeaderboardRowMobile } from './LeaderboardRow';

const GAME_TYPE_LABELS: Record<GameTypeFilter, string> = {
  all: 'All Games',
  pwc: 'PwC Single',
  shibuya: 'Shibuya Crossing',
  tow: 'Tug Of War',
};

interface NewLeaderboardProps {
  onPlayerSelect?: (playerName: string) => void;
}

interface LeaderboardEntry {
  id: string;
  name: string;
  avgPoints: number;
  winPercentage: number;
  gamesPlayed: number;
  totalPoints: number;
}

export function NewLeaderboard({ onPlayerSelect }: NewLeaderboardProps) {
  const { recalculateStats } = usePlayers();
  const [mode, setMode] = useState<'singles' | 'doubles'>('singles');
  const [gameTypeFilter, setGameTypeFilter] = useState<GameTypeFilter>('all');
  const [isRecalculating, setIsRecalculating] = useState(false);

  // Filtered stats hook - always used for accurate win percentage calculation
  const { playerStats: filteredPlayerStats, teamStats: filteredTeamStats, loading: filteredLoading } = useFilteredPlayerStats(gameTypeFilter);

  const handleRecalculate = async () => {
    setIsRecalculating(true);
    try {
      await recalculateStats();
      toast.success('Stats recalculated from game history');
    } catch (error) {
      toast.error('Failed to recalculate stats');
    } finally {
      setIsRecalculating(false);
    }
  };
  
  const loading = filteredLoading;

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Unified leaderboard data structure for both modes
  // Always use filteredPlayerStats/filteredTeamStats since they calculate win percentage
  // When filter is 'all', the hook still fetches all games and computes stats correctly
  const leaderboardData: LeaderboardEntry[] = mode === 'singles'
    ? filteredPlayerStats.map((p, i) => ({ 
        id: `filtered-${i}`, 
        name: p.name, 
        avgPoints: p.avgPoints, 
        winPercentage: p.winPercentage,
        gamesPlayed: p.gamesPlayed, 
        totalPoints: p.totalPoints 
      }))
    : filteredTeamStats.map((t, i) => ({
        id: `filtered-team-${i}`,
        name: t.teamName,
        avgPoints: t.avgPoints,
        winPercentage: t.winPercentage,
        gamesPlayed: t.gamesPlayed,
        totalPoints: t.totalPoints,
      }));

  const qualificationGames = 18;

  return (
    <div className="space-y-4 md:space-y-6 animate-fade-in-up">
      {/* Page Header */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="section-header text-lg md:text-xl">Leaderboard</h1>
            <p className="text-muted-foreground mt-2 ml-4 md:ml-5 text-sm md:text-base">
              {mode === 'singles' ? 'Individual Rankings by Average Points' : 'Team Rankings by Combined Average'}
            </p>
          </div>

          <div className="flex items-center gap-2 md:gap-3 ml-4 md:ml-0">
            {/* Recalculate Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleRecalculate}
              disabled={isRecalculating}
              className="gap-1 md:gap-2 text-xs md:text-sm"
            >
              <RefreshCw className={cn("w-3 h-3 md:w-4 md:h-4", isRecalculating && "animate-spin")} />
              <span className="hidden sm:inline">Recalculate</span>
            </Button>

            {/* Game Type Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1 md:gap-2 text-xs md:text-sm">
                  <Filter className="w-3 h-3 md:w-4 md:h-4" />
                  <span className="hidden sm:inline">{GAME_TYPE_LABELS[gameTypeFilter]}</span>
                  <span className="sm:hidden">Filter</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {(Object.keys(GAME_TYPE_LABELS) as GameTypeFilter[]).map((type) => (
                  <DropdownMenuCheckboxItem
                    key={type}
                    checked={gameTypeFilter === type}
                    onCheckedChange={() => setGameTypeFilter(type)}
                  >
                    {GAME_TYPE_LABELS[type]}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mode Toggle */}
            <div className="flex items-center bg-muted rounded-lg p-0.5 md:p-1">
              <button
                onClick={() => setMode('singles')}
                className={cn(
                  "flex items-center gap-1 md:gap-2 px-2 md:px-4 py-1.5 md:py-2 rounded-md text-xs md:text-sm font-medium transition-all",
                  mode === 'singles'
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <User className="w-3 h-3 md:w-4 md:h-4" />
                <span className="hidden xs:inline">Singles</span>
              </button>
              <button
                onClick={() => setMode('doubles')}
                className={cn(
                  "flex items-center gap-1 md:gap-2 px-2 md:px-4 py-1.5 md:py-2 rounded-md text-xs md:text-sm font-medium transition-all",
                  mode === 'doubles'
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Users className="w-3 h-3 md:w-4 md:h-4" />
                <span className="hidden xs:inline">Doubles</span>
              </button>
            </div>
          </div>
        </div>
        
        {/* Active Filter Badge */}
        {gameTypeFilter !== 'all' && (
          <div className="flex items-center gap-2 ml-4 md:ml-5">
            <Badge variant="secondary" className="text-xs">
              Filtered: {GAME_TYPE_LABELS[gameTypeFilter]}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setGameTypeFilter('all')}
              className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
            >
              Clear
            </Button>
          </div>
        )}
      </div>

      {/* Desktop Table - Unified for both Singles and Doubles */}
      <div className="hidden md:flex justify-center bg-card rounded-md border border-border overflow-hidden shadow-card">
        <div className="overflow-x-auto">
          <table className="w-auto">
            <thead>
              <tr className="border-b border-border bg-secondary/40">
                <th className="px-3 py-3 text-left text-[11px] font-bold uppercase tracking-widest text-muted-foreground whitespace-nowrap">
                  Rank
                </th>
                <th className="px-3 py-3 text-left text-[11px] font-bold uppercase tracking-widest text-muted-foreground whitespace-nowrap">
                  {mode === 'singles' ? 'Player' : 'Team'}
                </th>
                <th className="px-3 py-3 text-center text-[11px] font-bold uppercase tracking-widest text-primary whitespace-nowrap">
                  Avg
                </th>
                <th className="px-3 py-3 text-center text-[11px] font-bold uppercase tracking-widest text-muted-foreground whitespace-nowrap">
                  W%
                </th>
                <th className="px-3 py-3 text-center text-[11px] font-bold uppercase tracking-widest text-muted-foreground whitespace-nowrap">
                  GP
                </th>
                <th className="px-3 py-3 text-center text-[11px] font-bold uppercase tracking-widest text-muted-foreground whitespace-nowrap">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {leaderboardData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-muted-foreground">
                    {mode === 'singles' 
                      ? 'No player data yet. Record a session to see rankings.'
                      : 'No team data yet. Record a session to see team rankings.'}
                  </td>
                </tr>
              ) : (
                leaderboardData.map((entry, index) => (
                  <LeaderboardRowDesktop
                    key={entry.id}
                    rank={index + 1}
                    mode={mode}
                    name={entry.name}
                    avgPoints={entry.avgPoints}
                    winPercentage={entry.winPercentage}
                    gamesPlayed={entry.gamesPlayed}
                    totalPoints={entry.totalPoints}
                    qualificationGames={qualificationGames}
                    onClick={() => mode === 'singles' && onPlayerSelect?.(entry.name)}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Table - Unified for both Singles and Doubles */}
      <div className="md:hidden px-3">
        <div className="bg-background rounded-md border border-border overflow-hidden shadow-card w-full">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-secondary/80">
                <th className="px-2 py-2 text-left text-[9px] font-bold uppercase tracking-wider text-muted-foreground whitespace-nowrap">
                  {mode === 'singles' ? 'Player' : 'Team'}
                </th>
                <th className="px-2 py-2 text-center text-[9px] font-bold uppercase tracking-wider text-primary whitespace-nowrap">
                  Avg
                </th>
                <th className="px-2 py-2 text-center text-[9px] font-bold uppercase tracking-wider text-muted-foreground whitespace-nowrap">
                  W%
                </th>
                <th className="px-2 py-2 text-center text-[9px] font-bold uppercase tracking-wider text-muted-foreground whitespace-nowrap">
                  GP
                </th>
                <th className="px-2 py-2 text-center text-[9px] font-bold uppercase tracking-wider text-muted-foreground whitespace-nowrap">
                  Tot
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/70">
              {leaderboardData.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-3 py-6 text-center text-muted-foreground text-sm">
                    {mode === 'singles' 
                      ? 'No player data yet. Record a session.'
                      : 'No team data yet. Record a session.'}
                  </td>
                </tr>
              ) : (
                leaderboardData.map((entry, index) => (
                  <LeaderboardRowMobile
                    key={entry.id}
                    rank={index + 1}
                    mode={mode}
                    name={entry.name}
                    avgPoints={entry.avgPoints}
                    winPercentage={entry.winPercentage}
                    gamesPlayed={entry.gamesPlayed}
                    totalPoints={entry.totalPoints}
                    qualificationGames={qualificationGames}
                    onClick={() => mode === 'singles' && onPlayerSelect?.(entry.name)}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

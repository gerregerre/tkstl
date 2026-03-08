import { useState, useEffect } from 'react';
import { useSeasons, Season, SeasonStanding } from '@/hooks/useSeasons';
import { useFilteredPlayerStats } from '@/hooks/useFilteredPlayerStats';
import { cn } from '@/lib/utils';
import { Trophy, Calendar, Users, User, Crown, ChevronDown, ChevronRight, Play, Square, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { getPlayerAvatar } from '@/lib/playerAvatars';

export function SeasonArchives() {
  const { activeSeason, pastSeasons, loading, endSeason, startSeason, getStandings } = useSeasons();
  const { playerStats, teamStats } = useFilteredPlayerStats('all');
  const [selectedSeason, setSelectedSeason] = useState<Season | null>(null);
  const [standings, setStandings] = useState<SeasonStanding[]>([]);
  const [standingsLoading, setStandingsLoading] = useState(false);
  const [newSeasonName, setNewSeasonName] = useState('');
  const [showStartDialog, setShowStartDialog] = useState(false);
  const [showEndDialog, setShowEndDialog] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [endPassword, setEndPassword] = useState('');
  const [standingsMode, setStandingsMode] = useState<'singles' | 'doubles'>('singles');

  const handleSelectSeason = async (season: Season) => {
    setSelectedSeason(season);
    setStandingsLoading(true);
    const data = await getStandings(season.id);
    setStandings(data);
    setStandingsLoading(false);
  };

  const handleEndSeason = async () => {
    if (!activeSeason) return;
    if (endPassword !== 'tennis2024') {
      toast.error('Incorrect manager password');
      return;
    }
    setProcessing(true);
    try {
      const singlesStandings = playerStats
        .filter(p => p.gamesPlayed > 0)
        .map((p, i) => ({
          name: p.name,
          type: 'singles' as string,
          rank: i + 1,
          avg_points: p.avgPoints,
          win_percentage: p.winPercentage,
          games_played: p.gamesPlayed,
          total_points: p.totalPoints,
          is_champion: i === 0,
        }));

      const doublesStandings = teamStats
        .filter(t => t.gamesPlayed > 0)
        .map((t, i) => ({
          name: t.teamName,
          type: 'doubles' as string,
          rank: i + 1,
          avg_points: t.avgPoints,
          win_percentage: t.winPercentage,
          games_played: t.gamesPlayed,
          total_points: t.totalPoints,
          is_champion: i === 0,
        }));

      await endSeason(activeSeason.id, activeSeason.name, singlesStandings, doublesStandings);
      toast.success(`Season "${activeSeason.name}" has been archived!`);
      setShowEndDialog(false);
      setEndPassword('');
    } catch {
      toast.error('Failed to end season');
    } finally {
      setProcessing(false);
    }
  };

  const handleStartSeason = async () => {
    if (!newSeasonName.trim()) return;
    setProcessing(true);
    try {
      await startSeason(newSeasonName.trim());
      toast.success(`Season "${newSeasonName}" started!`);
      setNewSeasonName('');
      setShowStartDialog(false);
    } catch {
      toast.error('Failed to start season');
    } finally {
      setProcessing(false);
    }
  };

  const filteredStandings = standings.filter(s => s.type === standingsMode);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="section-header text-lg md:text-xl">Season Archives</h1>
          <p className="text-muted-foreground mt-2 ml-4 md:ml-5 text-sm md:text-base">
            Browse past seasons, champions, and historical standings
          </p>
        </div>
        <div className="flex items-center gap-2 ml-4 md:ml-0">
          {activeSeason ? (
            <Dialog open={showEndDialog} onOpenChange={setShowEndDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Square className="w-4 h-4" />
                  End Season
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>End Season: {activeSeason.name}</DialogTitle>
                  <DialogDescription>
                    This will archive the current leaderboard standings and mark this season as complete. This action cannot be undone.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-3 py-4">
                  <p className="text-sm text-muted-foreground">
                    Current standings will be saved with {playerStats.filter(p => p.gamesPlayed > 0).length} singles and {teamStats.filter(t => t.gamesPlayed > 0).length} doubles entries.
                  </p>
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 block">
                      Manager Password
                    </label>
                    <Input
                      type="password"
                      placeholder="Enter manager password"
                      value={endPassword}
                      onChange={(e) => setEndPassword(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => { setShowEndDialog(false); setEndPassword(''); }}>Cancel</Button>
                  <Button onClick={handleEndSeason} disabled={processing || !endPassword}>
                    {processing ? 'Archiving...' : 'End & Archive'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          ) : (
            <Dialog open={showStartDialog} onOpenChange={setShowStartDialog}>
              <DialogTrigger asChild>
                <Button variant="atp" size="sm" className="gap-2">
                  <Play className="w-4 h-4" />
                  Start New Season
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Start New Season</DialogTitle>
                  <DialogDescription>
                    Give this season a name to get started.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <Input
                    placeholder="e.g. Spring 2026, Season 3"
                    value={newSeasonName}
                    onChange={(e) => setNewSeasonName(e.target.value)}
                  />
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowStartDialog(false)}>Cancel</Button>
                  <Button onClick={handleStartSeason} disabled={processing || !newSeasonName.trim()}>
                    {processing ? 'Starting...' : 'Start Season'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Active Season Banner */}
      {activeSeason && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="flex items-center gap-4 py-4">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <Trophy className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-foreground">{activeSeason.name}</p>
              <p className="text-xs text-muted-foreground">
                Active since {new Date(activeSeason.start_date).toLocaleDateString()}
              </p>
            </div>
            <Badge variant="default" className="bg-primary/20 text-primary border-primary/30">
              Active
            </Badge>
          </CardContent>
        </Card>
      )}

      {/* Past Seasons List */}
      {pastSeasons.length === 0 && !activeSeason ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Trophy className="w-12 h-12 text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground font-medium">No seasons yet</p>
            <p className="text-sm text-muted-foreground/70 mt-1">Start your first season to begin tracking history</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {pastSeasons.map((season) => (
            <Card
              key={season.id}
              className={cn(
                "cursor-pointer transition-all hover:border-primary/40 hover:shadow-md",
                selectedSeason?.id === season.id && "border-primary/50 shadow-md bg-primary/5"
              )}
              onClick={() => handleSelectSeason(season)}
            >
              <CardContent className="flex items-center gap-4 py-4">
                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center shrink-0">
                  <Award className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground truncate">{season.name}</p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(season.start_date).toLocaleDateString()} – {season.end_date ? new Date(season.end_date).toLocaleDateString() : '?'}
                    </span>
                    {season.total_games != null && (
                      <span>{season.total_games} games</span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  {season.champion_singles && (
                    <div className="flex items-center gap-1.5 text-xs">
                      <Crown className="w-3 h-3 text-yellow-500" />
                      <span className="text-foreground font-medium">{season.champion_singles}</span>
                    </div>
                  )}
                  {season.champion_doubles && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Users className="w-3 h-3" />
                      <span>{season.champion_doubles}</span>
                    </div>
                  )}
                </div>
                {selectedSeason?.id === season.id ? (
                  <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Selected Season Detail */}
      {selectedSeason && (
        <div className="space-y-4 animate-fade-in-up">
          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Card>
              <CardContent className="py-4 text-center">
                <p className="text-2xl font-black text-foreground">{selectedSeason.total_sessions || 0}</p>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Sessions</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="py-4 text-center">
                <p className="text-2xl font-black text-foreground">{selectedSeason.total_games || 0}</p>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Games</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="py-4 text-center">
                <div className="flex items-center justify-center gap-1.5">
                  <Crown className="w-4 h-4 text-yellow-500" />
                  <p className="text-lg font-black text-foreground truncate">{selectedSeason.champion_singles || '—'}</p>
                </div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Singles Champ</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="py-4 text-center">
                <div className="flex items-center justify-center gap-1.5">
                  <Crown className="w-4 h-4 text-yellow-500" />
                  <p className="text-sm font-black text-foreground truncate">{selectedSeason.champion_doubles || '—'}</p>
                </div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Doubles Champ</p>
              </CardContent>
            </Card>
          </div>

          {/* Standings Toggle */}
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-muted rounded-lg p-0.5 md:p-1">
              <button
                onClick={() => setStandingsMode('singles')}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs md:text-sm font-medium transition-all",
                  standingsMode === 'singles'
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <User className="w-3 h-3 md:w-4 md:h-4" />
                Singles
              </button>
              <button
                onClick={() => setStandingsMode('doubles')}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs md:text-sm font-medium transition-all",
                  standingsMode === 'doubles'
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Users className="w-3 h-3 md:w-4 md:h-4" />
                Doubles
              </button>
            </div>
          </div>

          {/* Standings Table */}
          {standingsLoading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          ) : (
            <Card>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-secondary/40">
                      <th className="px-3 py-3 text-left text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Rank</th>
                      <th className="px-3 py-3 text-left text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                        {standingsMode === 'singles' ? 'Player' : 'Team'}
                      </th>
                      <th className="px-3 py-3 text-center text-[11px] font-bold uppercase tracking-widest text-primary">Avg</th>
                      <th className="px-3 py-3 text-center text-[11px] font-bold uppercase tracking-widest text-muted-foreground">W%</th>
                      <th className="px-3 py-3 text-center text-[11px] font-bold uppercase tracking-widest text-muted-foreground">GP</th>
                      <th className="px-3 py-3 text-center text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredStandings.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-5 py-8 text-center text-muted-foreground">
                          No standings recorded for this season.
                        </td>
                      </tr>
                    ) : (
                      filteredStandings.map((entry) => {
                        const avatar = standingsMode === 'singles' ? getPlayerAvatar(entry.name) : null;
                        return (
                          <tr key={entry.id} className={cn(
                            "transition-colors hover:bg-muted/30",
                            entry.is_champion && "bg-yellow-500/5"
                          )}>
                            <td className="px-3 py-3 text-sm font-mono">
                              <div className="flex items-center gap-1.5">
                                {entry.is_champion && <Crown className="w-3.5 h-3.5 text-yellow-500" />}
                                <span className={cn(
                                  "font-bold",
                                  entry.rank === 1 && "text-yellow-500",
                                  entry.rank === 2 && "text-muted-foreground",
                                  entry.rank === 3 && "text-orange-400"
                                )}>
                                  {entry.rank}
                                </span>
                              </div>
                            </td>
                            <td className="px-3 py-3">
                              <div className="flex items-center gap-2.5">
                                {avatar && (
                                  <img src={avatar} alt={entry.name} className="w-7 h-7 rounded-full object-cover border border-border" />
                                )}
                                <span className="font-semibold text-sm text-foreground">{entry.name}</span>
                                {entry.is_champion && (
                                  <Badge variant="secondary" className="text-[10px] bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
                                    Champion
                                  </Badge>
                                )}
                              </div>
                            </td>
                            <td className="px-3 py-3 text-center text-sm font-bold text-primary">
                              {entry.avg_points.toFixed(1)}
                            </td>
                            <td className="px-3 py-3 text-center text-sm text-muted-foreground">
                              {entry.win_percentage.toFixed(0)}%
                            </td>
                            <td className="px-3 py-3 text-center text-sm text-muted-foreground">
                              {entry.games_played}
                            </td>
                            <td className="px-3 py-3 text-center text-sm text-muted-foreground">
                              {entry.total_points}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

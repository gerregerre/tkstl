import { useState, useEffect } from 'react';
import { Calendar, ScrollText, User, Trophy, Clock, Users } from 'lucide-react';
import { NewLeaderboard } from './NewLeaderboard';
import { PendingSessionsList } from './PendingSessionsList';
import { MessageBoard } from './MessageBoard';
import { useMembers } from '@/contexts/MembersContext';
import { members } from '@/data/members';
import { supabase } from '@/integrations/supabase/client';
import NewsCarousel from '@/components/home/NewsCarousel';

interface DashboardHomeProps {
  onPlayerSelect?: (playerName: string) => void;
}
interface MatchResult {
  id: string;
  match_type: string;
  match_date: string;
  player1_name: string;
  player2_name: string;
  player1_score: number;
  player2_score: number;
}

function getNextMonday(): Date {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const daysUntilMonday = dayOfWeek === 0 ? 1 : dayOfWeek === 1 ? 0 : 8 - dayOfWeek;
  const nextMonday = new Date(today);
  nextMonday.setDate(today.getDate() + daysUntilMonday);
  nextMonday.setHours(19, 0, 0, 0);
  return nextMonday;
}

function getCountdownParts(targetDate: Date) {
  const now = new Date();
  const diff = targetDate.getTime() - now.getTime();
  
  if (diff <= 0) {
    return { days: 0, hours: 0, mins: 0, secs: 0 };
  }
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const secs = Math.floor((diff % (1000 * 60)) / 1000);
  
  return { days, hours, mins, secs };
}

function getWeekRange() {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  
  const formatDate = (date: Date) => 
    date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  
  return `${formatDate(monday)} - ${formatDate(sunday)}`;
}

export function DashboardHome({ onPlayerSelect }: DashboardHomeProps) {
  const [countdown, setCountdown] = useState(getCountdownParts(getNextMonday()));
  const [recentResults, setRecentResults] = useState<MatchResult[]>([]);
  const [loadingResults, setLoadingResults] = useState(true);
  const nextSession = getNextMonday();
  const { getCurrentScribe, checkedInPlayers } = useMembers();
  const scribe = getCurrentScribe();

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(getCountdownParts(nextSession));
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);

  // Fetch recent match results from database
  useEffect(() => {
    const fetchResults = async () => {
      const { data, error } = await supabase
        .from('match_results')
        .select('*')
        .order('match_date', { ascending: false })
        .limit(5);
      
      if (!error && data) {
        setRecentResults(data);
      }
      setLoadingResults(false);
    };

    fetchResults();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('match_results_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'match_results' },
        () => {
          fetchResults();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const formatNumber = (num: number) => num.toString().padStart(2, '0');

  // Get checked-in players or default to first 4 members
  const sessionParticipants = checkedInPlayers.length > 0 
    ? checkedInPlayers.map(id => members.find(m => m.id === id)).filter(Boolean)
    : members.slice(0, 4);

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* News Carousel */}
      <NewsCarousel />

      {/* Compact Info Bar - Next Session & Duty Roster */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Compact Countdown */}
        <div className="bg-card border border-border rounded px-4 py-3 flex items-center gap-4">
          <Calendar className="w-4 h-4 text-primary shrink-0" />
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">Next Session:</span>
            <div className="flex items-center gap-2">
              {[
                { value: formatNumber(countdown.days), label: 'd' },
                { value: formatNumber(countdown.hours), label: 'h' },
                { value: formatNumber(countdown.mins), label: 'm' },
                { value: formatNumber(countdown.secs), label: 's' },
              ].map((item, i) => (
                <span key={item.label} className="flex items-center">
                  <span className="font-mono font-semibold text-primary">{item.value}</span>
                  <span className="text-xs text-muted-foreground ml-0.5">{item.label}</span>
                  {i < 3 && <span className="text-muted-foreground mx-1">:</span>}
                </span>
              ))}
            </div>
            <span className="text-xs text-muted-foreground">(Mon 19:00)</span>
          </div>
        </div>

        {/* Compact Duty Roster */}
        <div className="bg-card border border-border rounded px-4 py-3 flex items-center gap-4">
          <ScrollText className="w-4 h-4 text-primary shrink-0" />
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <span className="text-sm text-muted-foreground shrink-0">Scribe:</span>
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <User className="w-4 h-4 text-primary" />
              </div>
              <div className="min-w-0">
                <span className="font-medium text-foreground truncate block">{scribe.name}</span>
              </div>
            </div>
            <span className="text-xs text-muted-foreground ml-auto shrink-0">{getWeekRange()}</span>
          </div>
        </div>
      </div>

      {/* Main Content - Leaderboard & Right Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Leaderboard - Takes 2 columns */}
        <div className="lg:col-span-2">
          <NewLeaderboard onPlayerSelect={onPlayerSelect} />
        </div>

        {/* Right Panel - Recent Results & Next Session */}
        <div className="space-y-6">
          {/* Next Scheduled Session */}
          <div className="bg-card border border-border rounded overflow-hidden">
            <div className="bg-primary px-4 py-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary-foreground" />
              <h3 className="font-serif text-sm font-semibold text-primary-foreground uppercase tracking-wide">
                Next Session
              </h3>
            </div>
            <div className="p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                <Calendar className="w-4 h-4" />
                <span>
                  {nextSession.toLocaleDateString('en-US', { 
                    weekday: 'short', 
                    month: 'short', 
                    day: 'numeric' 
                  })} at 19:00
                </span>
              </div>
              
              <div className="flex items-center gap-2 mb-3">
                <Users className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground uppercase tracking-wide">Participants</span>
              </div>
              
              <div className="space-y-2">
                {sessionParticipants.map((player) => (
                  <div 
                    key={player?.id} 
                    className="flex items-center gap-2 px-3 py-2 bg-muted/30 rounded"
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      player?.role === 'royalty' 
                        ? 'bg-[#dc6900]/20 text-[#dc6900]' 
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {player?.name?.[0]}
                    </div>
                    <span className="text-sm font-medium text-foreground">{player?.name}</span>
                    {player?.role === 'royalty' && (
                      <span className="text-[9px] px-1.5 py-0.5 bg-[#dc6900]/10 text-[#dc6900] rounded font-medium ml-auto">
                        RF
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Results */}
          <div className="bg-card border border-border rounded overflow-hidden">
            <div className="bg-secondary px-4 py-3 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-secondary-foreground" />
              <h3 className="font-serif text-sm font-semibold text-secondary-foreground uppercase tracking-wide">
                Recent Results
              </h3>
            </div>
            <div className="divide-y divide-border">
              {loadingResults ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  Loading results...
                </div>
              ) : recentResults.length === 0 ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  No match results yet
                </div>
              ) : (
                recentResults.map((result) => (
                  <div key={result.id} className="p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wide">
                        {result.match_type}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(result.match_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-medium ${result.player1_score > result.player2_score ? 'text-foreground' : 'text-muted-foreground'}`}>
                          {result.player1_name}
                        </span>
                        {result.player1_score > result.player2_score && (
                          <span className="text-[8px] px-1 py-0.5 bg-green-500/10 text-green-600 rounded font-bold">W</span>
                        )}
                      </div>
                      <span className="font-mono text-sm font-bold text-foreground">
                        {result.player1_score} - {result.player2_score}
                      </span>
                      <div className="flex items-center gap-2">
                        {result.player2_score > result.player1_score && (
                          <span className="text-[8px] px-1 py-0.5 bg-green-500/10 text-green-600 rounded font-bold">W</span>
                        )}
                        <span className={`text-sm font-medium ${result.player2_score > result.player1_score ? 'text-foreground' : 'text-muted-foreground'}`}>
                          {result.player2_name}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Pending Sessions */}
      <PendingSessionsList />

      {/* Messageboard */}
      <MessageBoard />
    </div>
  );
}

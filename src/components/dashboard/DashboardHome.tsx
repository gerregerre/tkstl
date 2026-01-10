import { useState, useEffect, useRef } from 'react';
import { Calendar, Trophy } from 'lucide-react';
import { NewLeaderboard } from './NewLeaderboard';
import { MessageBoard } from './MessageBoard';
import { HeroSection } from './HeroSection';
import { SessionSignup } from './SessionSignup';
import { supabase } from '@/integrations/supabase/client';
import NewsCarousel from '@/components/home/NewsCarousel';

interface DashboardHomeProps {
  onPlayerSelect?: (playerName: string) => void;
}
interface SessionGame {
  id: string;
  game_number: number;
  session_date: string;
  team_a_player1: string;
  team_a_player2: string;
  team_b_player1: string;
  team_b_player2: string;
  team_a_score: number | null;
  team_b_score: number | null;
  winner: string | null;
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
    return {
      days: 0,
      hours: 0,
      mins: 0,
      secs: 0
    };
  }
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor(diff % (1000 * 60 * 60 * 24) / (1000 * 60 * 60));
  const mins = Math.floor(diff % (1000 * 60 * 60) / (1000 * 60));
  const secs = Math.floor(diff % (1000 * 60) / 1000);
  return {
    days,
    hours,
    mins,
    secs
  };
}
function getWeekRange() {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  const formatDate = (date: Date) => date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });
  return `${formatDate(monday)} - ${formatDate(sunday)}`;
}
export function DashboardHome({
  onPlayerSelect
}: DashboardHomeProps) {
  const [countdown, setCountdown] = useState(getCountdownParts(getNextMonday()));
  const [recentResults, setRecentResults] = useState<SessionGame[]>([]);
  const [loadingResults, setLoadingResults] = useState(true);
  const nextSession = getNextMonday();
  const contentRef = useRef<HTMLDivElement>(null);
  const handleScrollDown = () => {
    contentRef.current?.scrollIntoView({
      behavior: 'smooth'
    });
  };
  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(getCountdownParts(nextSession));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch recent session games from database
  useEffect(() => {
    const fetchResults = async () => {
      const {
        data,
        error
      } = await supabase.from('session_games').select('*').order('session_date', {
        ascending: false
      }).order('game_number', {
        ascending: false
      }).limit(5);
      if (!error && data) {
        setRecentResults(data);
      }
      setLoadingResults(false);
    };
    fetchResults();

    // Subscribe to realtime updates
    const channel = supabase.channel('session_games_changes').on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'session_games'
    }, () => {
      fetchResults();
    }).subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
  const formatNumber = (num: number) => num.toString().padStart(2, '0');

  return <div className="animate-fade-in-up -mx-4 md:-mx-8 -mt-4 md:-mt-8">
      {/* Hero Section */}
      <HeroSection onScrollDown={handleScrollDown} />

      {/* Main Content */}
      <div ref={contentRef} className="space-y-6 md:space-y-8 pt-8 md:pt-16 px-4 md:px-8 max-w-7xl mx-auto">
        {/* News Carousel */}
        <NewsCarousel />

        {/* Compact Info Bar - Next Session & Duty Roster */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
          {/* Compact Countdown - ATP Style */}
          <div className="bg-card border border-border rounded-md px-4 md:px-5 py-3.5 md:py-4 flex items-center gap-3 md:gap-4 shadow-card">
            <div className="w-9 md:w-10 h-9 md:h-10 rounded-md bg-primary/10 border border-primary/25 flex items-center justify-center shrink-0">
              <Calendar className="w-4 md:w-5 h-4 md:h-5 text-primary" />
            </div>
            <div className="flex items-center gap-2 md:gap-3 flex-wrap">
              <span className="text-[10px] md:text-xs text-muted-foreground font-bold uppercase tracking-widest">Next:</span>
              <div className="flex items-center gap-1 md:gap-2">
                {[{
                value: formatNumber(countdown.days),
                label: 'D'
              }, {
                value: formatNumber(countdown.hours),
                label: 'H'
              }, {
                value: formatNumber(countdown.mins),
                label: 'M'
              }, {
                value: formatNumber(countdown.secs),
                label: 'S'
              }].map((item, i) => <span key={item.label} className="flex items-center">
                    <span className="font-mono font-black text-primary text-base md:text-lg tabular-nums">{item.value}</span>
                    <span className="text-[9px] md:text-[10px] text-muted-foreground font-bold ml-0.5 uppercase">{item.label}</span>
                    {i < 3 && <span className="text-border mx-1 md:mx-1.5 font-light opacity-50">:</span>}
                  </span>)}
              </div>
            </div>
          </div>

          {/* Compact Duty Roster - ATP Style */}
          
        </div>

        {/* Main Content - Leaderboard & Right Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Leaderboard - Takes 2 columns */}
          <div className="lg:col-span-2">
            <NewLeaderboard onPlayerSelect={onPlayerSelect} />
          </div>

          {/* Right Panel - Recent Results & Next Session */}
          <div className="space-y-6">
            {/* Interactive Session Signup */}
            <SessionSignup sessionDate={nextSession} />

            {/* Recent Results - ATP Style */}
            <div className="bg-card border border-border rounded-md overflow-hidden shadow-card">
              <div className="bg-secondary/50 px-5 py-4 flex items-center gap-3 border-b border-border">
                <div className="w-1 h-5 bg-primary rounded-full shadow-[0_0_6px_hsl(var(--primary)/0.4)]" />
                <Trophy className="w-4 h-4 text-primary" />
                <h3 className="text-[11px] font-bold text-foreground uppercase tracking-widest">
                  Recent Results
                </h3>
              </div>
              <div className="divide-y divide-border/50">
                {loadingResults ? <div className="p-5 text-center text-sm text-muted-foreground">
                    Loading results...
                  </div> : recentResults.length === 0 ? <div className="p-5 text-center text-sm text-muted-foreground">
                    No session games yet
                  </div> : recentResults.map(game => {
                const teamAWon = game.winner === 'A';
                const teamBWon = game.winner === 'B';
                const teamADisplay = `${game.team_a_player1} & ${game.team_a_player2}`;
                const teamBDisplay = `${game.team_b_player1} & ${game.team_b_player2}`;
                const scoreDisplay = game.team_a_score !== null && game.team_b_score !== null ? `${game.team_a_score} - ${game.team_b_score}` : game.winner ? teamAWon ? 'W - L' : 'L - W' : 'TBD';
                return <div key={game.id} className="p-4 transition-colors hover:bg-muted/20">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
                            {game.game_number === 1 ? 'PwC Single' : game.game_number === 2 ? 'Shibuya Crossing' : 'Tug Of War'}
                          </span>
                          <span className="text-[10px] text-muted-foreground font-medium tabular-nums">
                            {new Date(game.session_date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric'
                      })}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <span className={`text-xs font-semibold truncate ${teamAWon ? 'text-foreground' : 'text-muted-foreground'}`}>
                              {teamADisplay}
                            </span>
                            {teamAWon && <span className="text-[8px] px-1.5 py-0.5 bg-primary/15 text-primary rounded font-bold shrink-0 uppercase tracking-wide">W</span>}
                          </div>
                          <span className="font-mono text-sm font-black text-foreground mx-3 shrink-0 tabular-nums">
                            {scoreDisplay}
                          </span>
                          <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
                            {teamBWon && <span className="text-[8px] px-1.5 py-0.5 bg-primary/15 text-primary rounded font-bold shrink-0 uppercase tracking-wide">W</span>}
                            <span className={`text-xs font-semibold truncate ${teamBWon ? 'text-foreground' : 'text-muted-foreground'}`}>
                              {teamBDisplay}
                            </span>
                          </div>
                        </div>
                      </div>;
              })}
              </div>
            </div>
          </div>
        </div>

        {/* Messageboard */}
        <MessageBoard />
      </div>
    </div>;
}
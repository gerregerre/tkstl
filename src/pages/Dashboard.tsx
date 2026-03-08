import { useState } from 'react';
import { getPlayerAvatar } from '@/lib/playerAvatars';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { DashboardHome } from '@/components/dashboard/DashboardHome';
import { NewLeaderboard } from '@/components/dashboard/NewLeaderboard';
import { TheLore } from '@/components/dashboard/TheLore';
import { MemberProfiles } from '@/components/dashboard/MemberProfiles';
import { NewSessionRecorder } from '@/components/dashboard/NewSessionRecorder';
import { PlayerProfile } from '@/components/dashboard/PlayerProfile';
import { TeamProfile } from '@/components/dashboard/TeamProfile';
import { HeadToHead } from '@/components/dashboard/HeadToHead';
import { SessionHistory } from '@/components/dashboard/SessionHistory';
import { Information } from '@/components/dashboard/Information';
import { NewsAdmin } from '@/components/dashboard/NewsAdmin';
import { SeasonArchives } from '@/components/dashboard/SeasonArchives';


export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('home');
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);

  const handlePlayerSelect = (playerName: string) => {
    setSelectedPlayer(playerName);
    setSelectedTeam(null);
    setActiveTab('profile');
  };

  const handleTeamSelect = (teamName: string) => {
    setSelectedTeam(teamName);
    setSelectedPlayer(null);
    setActiveTab('team-profile');
  };

  const handleBackFromProfile = () => {
    setSelectedPlayer(null);
    setSelectedTeam(null);
    setActiveTab('leaderboard');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <DashboardHome onPlayerSelect={handlePlayerSelect} onTeamSelect={handleTeamSelect} />;
      case 'headtohead':
        return <HeadToHead />;
      case 'history':
        return <SessionHistory />;
      case 'recorder':
        return <NewSessionRecorder />;
      case 'lore':
        return <TheLore />;
      case 'info':
        return <Information />;
      case 'members':
        return <MemberProfiles />;
      case 'news-admin':
        return <NewsAdmin />;
      case 'seasons':
        return <SeasonArchives />;
      case 'team-profile':
        return selectedTeam ? (
          <TeamProfile teamName={selectedTeam} onBack={handleBackFromProfile} />
        ) : (
          <NewLeaderboard onPlayerSelect={handlePlayerSelect} onTeamSelect={handleTeamSelect} />
        );
      case 'profile':
        return selectedPlayer ? (
          <PlayerProfile playerName={selectedPlayer} onBack={handleBackFromProfile} />
        ) : (
          <NewLeaderboard onPlayerSelect={handlePlayerSelect} onTeamSelect={handleTeamSelect} />
        );
      default:
        return <DashboardHome onPlayerSelect={handlePlayerSelect} onTeamSelect={handleTeamSelect} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      
      <main className="pt-16 min-h-screen">
        <div className={activeTab === 'home' ? '' : 'p-4 md:p-8 max-w-7xl mx-auto'}>
          {renderContent()}
        </div>

        {/* Team Photo & Footer */}
        <footer className="border-t border-border mt-8 md:mt-16 bg-card/50">
          {/* Team Photo Section */}
          <div className="max-w-3xl mx-auto px-4 md:px-8 pt-10 md:pt-14 pb-6">
            <div className="text-center mb-6">
              <p className="text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
                The Squad
              </p>
            </div>
            <div className="relative rounded-lg overflow-hidden border border-border/50 shadow-lg bg-gradient-to-b from-[hsl(220,25%,12%)] via-[hsl(220,20%,15%)] to-[hsl(220,25%,10%)] py-8 md:py-12 px-4">
              {/* Stadium lights effect */}
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(220,30%,25%)_0%,transparent_60%)] opacity-60" />
              <div className="absolute top-0 left-1/4 w-1/2 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
              
              {/* Back Row */}
              <div className="relative flex justify-center gap-4 md:gap-8 mb-2 md:mb-4">
                {['Kockum', 'Gerard', 'Ludvig'].map((name) => (
                  <div key={name} className="flex flex-col items-center gap-2">
                    <div className="w-20 h-20 md:w-28 md:h-28 rounded-full overflow-hidden border-2 border-border/40 shadow-[0_4px_20px_rgba(0,0,0,0.5)] bg-white">
                      <img 
                        src={getPlayerAvatar(name)!} 
                        alt={name}
                        className="w-full h-full object-cover mix-blend-multiply"
                      />
                    </div>
                    <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-muted-foreground">{name}</span>
                  </div>
                ))}
              </div>
              
              {/* Front Row */}
              <div className="relative flex justify-center gap-4 md:gap-8 -mt-2 md:-mt-3">
                {['Hampus', 'Joel', 'Viktor'].map((name) => (
                  <div key={name} className="flex flex-col items-center gap-2">
                    <div className="w-20 h-20 md:w-28 md:h-28 rounded-full overflow-hidden border-2 border-border/40 shadow-[0_4px_20px_rgba(0,0,0,0.5)] bg-white">
                      <img 
                        src={getPlayerAvatar(name)!} 
                        alt={name}
                        className="w-full h-full object-cover mix-blend-multiply"
                      />
                    </div>
                    <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-muted-foreground">{name}</span>
                  </div>
                ))}
              </div>

              {/* Bottom fade */}
              <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-[hsl(220,25%,10%)] to-transparent" />
            </div>
          </div>

          {/* Footer Text */}
          <div className="py-8 md:py-10">
            <div className="max-w-7xl mx-auto text-center px-4 md:px-8">
              <div className="flex items-center justify-center gap-2 mb-3">
                <div className="w-1 h-6 bg-primary rounded-full" />
                <p className="font-display text-lg md:text-xl font-black text-foreground tracking-tight uppercase">
                  TKSTL
                </p>
              </div>
              <p className="text-xs md:text-sm text-muted-foreground font-medium uppercase tracking-wider">
                Where Tradition Meets Excellence · Est. 2017
              </p>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
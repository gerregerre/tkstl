import { useState } from 'react';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { DashboardHome } from '@/components/dashboard/DashboardHome';
import { NewLeaderboard } from '@/components/dashboard/NewLeaderboard';
import { TheLore } from '@/components/dashboard/TheLore';
import { MemberProfiles } from '@/components/dashboard/MemberProfiles';
import { NewSessionRecorder } from '@/components/dashboard/NewSessionRecorder';
import { PlayerProfile } from '@/components/dashboard/PlayerProfile';
import { HeadToHead } from '@/components/dashboard/HeadToHead';
import { SessionHistory } from '@/components/dashboard/SessionHistory';
import { Information } from '@/components/dashboard/Information';


export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('home');
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);

  const handlePlayerSelect = (playerName: string) => {
    setSelectedPlayer(playerName);
    setActiveTab('profile');
  };

  const handleBackFromProfile = () => {
    setSelectedPlayer(null);
    setActiveTab('leaderboard');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <DashboardHome onPlayerSelect={handlePlayerSelect} />;
      case 'leaderboard':
        return <NewLeaderboard onPlayerSelect={handlePlayerSelect} />;
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
      case 'profile':
        return selectedPlayer ? (
          <PlayerProfile playerName={selectedPlayer} onBack={handleBackFromProfile} />
        ) : (
          <NewLeaderboard onPlayerSelect={handlePlayerSelect} />
        );
      default:
        return <DashboardHome onPlayerSelect={handlePlayerSelect} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      
      <main className="pt-16 min-h-screen">
        <div className={activeTab === 'home' ? '' : 'p-8 max-w-7xl mx-auto'}>
          {renderContent()}
        </div>

        <footer className="border-t border-border py-12 mt-16 glass">
          <div className="max-w-7xl mx-auto text-center px-8">
            <p className="text-xl font-light text-foreground mb-3 tracking-tight">
              TKSTL
            </p>
            <p className="text-sm text-muted-foreground font-light">
              Where Tradition Meets Excellence · Est. 2017
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
}
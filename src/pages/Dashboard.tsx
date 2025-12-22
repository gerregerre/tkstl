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
    <div className="min-h-screen bg-muted/30">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      
      <main className="pt-16 min-h-screen">
        <div className="p-8 max-w-7xl mx-auto">
          {renderContent()}
        </div>

        <footer className="border-t border-border py-6 mt-12 px-8 bg-background">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              TKSTL — Est. 2017 — Long May We Reign
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
}

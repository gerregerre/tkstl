import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

const pageTransition = {
  duration: 0.25,
  ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
};


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
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab + (selectedPlayer || '') + (selectedTeam || '')}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={pageTransition}
            className={activeTab === 'home' ? '' : 'p-4 md:p-8 max-w-7xl mx-auto'}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>

        {/* ATP-Style Footer */}
        <footer className="border-t border-border py-8 md:py-12 mt-8 md:mt-16 bg-card/50">
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
        </footer>
      </main>
    </div>
  );
}
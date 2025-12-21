import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { DashboardHome } from '@/components/dashboard/DashboardHome';
import { Leaderboard } from '@/components/dashboard/Leaderboard';
import { SessionScheduler } from '@/components/dashboard/SessionScheduler';
import { TheLore } from '@/components/dashboard/TheLore';
import { MemberProfiles } from '@/components/dashboard/MemberProfiles';
import { NobleStandardRating } from '@/components/dashboard/NobleStandardRating';
import { Noteboard } from '@/components/dashboard/Noteboard';
import { SessionRecorder } from '@/components/dashboard/SessionRecorder';
import { PwCScoreboard } from '@/components/dashboard/PwCScoreboard';

export default function Dashboard() {
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('home');

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <DashboardHome />;
      case 'leaderboard':
        return <Leaderboard />;
      case 'session':
        return <SessionScheduler />;
      case 'matches':
        return <SessionRecorder />;
      case 'lore':
        return <TheLore />;
      case 'members':
        return <MemberProfiles />;
      case 'rating':
        return <NobleStandardRating />;
      case 'noteboard':
        return <Noteboard />;
      default:
        return <DashboardHome />;
    }
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      
      <main className="pt-16 min-h-screen">
        {/* PwC Scoreboard Banner */}
        <div className="sticky top-16 z-40">
          <PwCScoreboard />
        </div>

        <div className="p-8 max-w-7xl mx-auto">
          {renderContent()}
        </div>

        {/* Footer */}
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
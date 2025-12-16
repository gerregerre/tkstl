import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Header } from '@/components/dashboard/Header';
import { Navigation } from '@/components/dashboard/Navigation';
import { Leaderboard } from '@/components/dashboard/Leaderboard';
import { SessionScheduler } from '@/components/dashboard/SessionScheduler';
import { TheLore } from '@/components/dashboard/TheLore';
import { MemberProfiles } from '@/components/dashboard/MemberProfiles';
import { NobleStandardRating } from '@/components/dashboard/NobleStandardRating';
import { Noteboard } from '@/components/dashboard/Noteboard';

export default function Dashboard() {
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('leaderboard');

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'leaderboard':
        return <Leaderboard />;
      case 'session':
        return <SessionScheduler />;
      case 'lore':
        return <TheLore />;
      case 'members':
        return <MemberProfiles />;
      case 'rating':
        return <NobleStandardRating />;
      case 'noteboard':
        return <Noteboard />;
      default:
        return <Leaderboard />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      
      <main className="container mx-auto px-4 py-8">
        {renderContent()}
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-6 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground font-serif-body italic">
            "The court separates the worthy from the merely ambitious."
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            TKSTL — Est. 2017 — Long May We Reign
          </p>
        </div>
      </footer>
    </div>
  );
}

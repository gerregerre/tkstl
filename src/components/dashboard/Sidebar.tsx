import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { CrownIcon } from '@/components/icons/CrownIcon';
import { 
  Home,
  BookOpen, 
  Users, 
  Calendar, 
  Trophy,
  ClipboardList,
  Swords,
  LogOut
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { id: 'home', label: 'Dashboard', icon: Home },
  { id: 'lore', label: 'The Lore', icon: BookOpen },
  { id: 'members', label: 'Members', icon: Users },
  { id: 'session', label: 'Schedule', icon: Calendar },
  { id: 'matches', label: 'Record Session', icon: Swords },
  { id: 'leaderboard', label: 'PwC Scoreboard', icon: Trophy },
];

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const { logout } = useAuth();

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-secondary flex flex-col z-50">
      {/* Logo */}
      <div className="p-6 flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-gold flex items-center justify-center">
          <CrownIcon className="w-7 h-7 text-secondary" />
        </div>
        <div>
          <h1 className="font-serif text-xl font-bold text-secondary-foreground">TKSTL</h1>
          <p className="text-xs text-secondary-foreground/70">Est. 2017</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-secondary-foreground/80 hover:text-secondary-foreground hover:bg-secondary-foreground/10"
              )}
            >
              <Icon className="w-5 h-5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-secondary-foreground/10">
        <p className="text-xs text-secondary-foreground/60 italic text-center mb-4">
          "Excellence on Clay"
        </p>
        <Button
          variant="ghost"
          size="sm"
          onClick={logout}
          className="w-full text-secondary-foreground/70 hover:text-secondary-foreground hover:bg-secondary-foreground/10"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </aside>
  );
}

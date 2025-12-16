import { cn } from '@/lib/utils';
import { 
  Trophy, 
  Calendar, 
  BookOpen, 
  Users, 
  ClipboardList, 
  MessageSquare,
  Timer
} from 'lucide-react';

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
  { id: 'session', label: 'Sessions', icon: Calendar },
  { id: 'lore', label: 'The Lore', icon: BookOpen },
  { id: 'members', label: 'Members', icon: Users },
  { id: 'rating', label: 'Rate Session', icon: ClipboardList },
  { id: 'noteboard', label: 'Decrees', icon: MessageSquare },
];

export function Navigation({ activeTab, onTabChange }: NavigationProps) {
  return (
    <nav className="bg-card border-b border-border overflow-x-auto">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-1 py-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

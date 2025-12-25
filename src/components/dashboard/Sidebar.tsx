import { cn } from '@/lib/utils';
import { 
  BookOpen, 
  Users, 
  Swords,
  GitCompare,
  History,
  Info
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { id: 'headtohead', label: 'Head-to-Head', icon: GitCompare },
  { id: 'history', label: 'History', icon: History },
  { id: 'recorder', label: 'Record Score', icon: Swords },
  { id: 'lore', label: 'The Lore', icon: BookOpen },
  { id: 'info', label: 'Information', icon: Info },
  { id: 'members', label: 'Members', icon: Users },
];

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const handleLogoClick = () => {
    onTabChange('home');
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-secondary flex items-center z-50 border-b border-sidebar-border">
      {/* Left section with logo */}
      <div className="flex items-center px-6">
        <button 
          onClick={handleLogoClick}
          className="flex items-center gap-3 hover:opacity-90 transition-opacity"
        >
          <span className="font-serif text-xl font-semibold text-sidebar-foreground italic tracking-wide">
            TKSTL
          </span>
        </button>
      </div>

      {/* Center Navigation */}
      <nav className="flex items-center gap-1 flex-1 justify-center">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all",
                isActive
                  ? "text-sidebar-primary"
                  : "text-sidebar-foreground/70 hover:text-sidebar-foreground"
              )}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Right section - Est. date */}
      <div className="px-6">
        <span className="text-xs text-sidebar-foreground/50 uppercase tracking-widest">
          Est. 2017
        </span>
      </div>
    </header>
  );
}
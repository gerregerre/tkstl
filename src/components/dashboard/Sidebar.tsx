import { cn } from '@/lib/utils';
import { 
  BookOpen, 
  Users, 
  Swords,
  GitCompare,
  History,
  Info,
  MessageSquare
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { id: 'messages', label: 'Messages', icon: MessageSquare },
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
    <header className="fixed top-0 left-0 right-0 h-16 bg-secondary flex items-center z-50 px-6">
      {/* Logo - clickable to go home */}
      <button 
        onClick={handleLogoClick}
        className="flex items-center gap-3 mr-8 hover:opacity-80 transition-opacity"
      >
        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
          <span className="font-serif text-sm font-bold text-primary-foreground">TK</span>
        </div>
        <div className="text-left">
          <h1 className="font-serif text-base font-bold text-sidebar-foreground tracking-wide leading-tight">
            TKSTL
          </h1>
          <p className="text-[10px] text-sidebar-foreground/60 uppercase tracking-wider">
            Est. 2017
          </p>
        </div>
      </button>

      {/* Navigation */}
      <nav className="flex items-center gap-1 flex-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded text-sm font-medium transition-all",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent"
              )}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </header>
  );
}

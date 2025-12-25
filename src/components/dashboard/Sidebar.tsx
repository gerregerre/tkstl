import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const navLinks = [
  { id: 'home', label: 'Home' },
  { id: 'leaderboard', label: 'Leaderboard' },
  { id: 'headtohead', label: 'Head-to-Head' },
  { id: 'history', label: 'History' },
  { id: 'lore', label: 'The Lore' },
  { id: 'members', label: 'Members' },
];

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  return (
    <header className="fixed top-0 left-0 right-0 h-16 glass flex items-center z-50">
      {/* Left section with logo */}
      <div className="flex items-center pl-8">
        <button 
          onClick={() => onTabChange('home')}
          className="flex items-center hover:opacity-80 transition-opacity"
        >
          <span className="text-xl font-semibold text-foreground tracking-tight">
            TKSTL
          </span>
        </button>
      </div>

      {/* Center Navigation */}
      <nav className="flex items-center gap-1 flex-1 justify-center">
        {navLinks.map((link) => {
          const isActive = activeTab === link.id;
          
          return (
            <button
              key={link.id}
              onClick={() => onTabChange(link.id)}
            className={cn(
                "px-4 py-2 text-sm font-medium transition-all rounded-lg",
                isActive
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              {link.label}
            </button>
          );
        })}
      </nav>

      {/* Right section - CTA Button */}
      <div className="pr-8">
        <Button 
          variant="gold" 
          size="sm"
          onClick={() => onTabChange('recorder')}
        >
          Record Session
        </Button>
      </div>
    </header>
  );
}
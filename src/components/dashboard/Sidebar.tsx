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
    <header className="fixed top-0 left-0 right-0 h-16 bg-card flex items-center z-50 border-b border-border shadow-sm">
      {/* Left section with logo */}
      <div className="flex items-center pl-8">
        <button 
          onClick={() => onTabChange('home')}
          className="flex items-center hover:opacity-80 transition-opacity"
        >
          <span className="font-serif text-xl font-semibold text-forest tracking-wide">
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
                "px-4 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "text-forest"
                  : "text-muted-foreground hover:text-forest"
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
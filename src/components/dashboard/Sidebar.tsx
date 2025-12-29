import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const navLinks = [
  { id: 'home', label: 'Home' },
  { id: 'headtohead', label: 'Head-to-Head' },
  { id: 'history', label: 'History' },
  { id: 'lore', label: 'The Lore' },
  { id: 'members', label: 'Members' },
];

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-card/95 backdrop-blur-md border-b border-border flex items-center z-50">
      {/* Left section with logo - ATP Style */}
      <div className="flex items-center pl-8">
        <button 
          onClick={() => onTabChange('home')}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity group"
        >
          {/* Logo accent bar */}
          <div className="w-1 h-8 bg-primary rounded-full" />
          <span className="font-display text-xl font-black text-foreground tracking-tight uppercase">
            TKSTL
          </span>
        </button>
      </div>

      {/* Center Navigation - ATP Style */}
      <nav className="flex items-center gap-1 flex-1 justify-center">
        {navLinks.map((link) => {
          const isActive = activeTab === link.id;
          
          return (
            <button
              key={link.id}
              onClick={() => onTabChange(link.id)}
              className={cn(
                "relative px-4 py-2 text-sm font-semibold transition-all uppercase tracking-wide",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {link.label}
              {/* Active indicator - ATP cyan bar */}
              {isActive && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Right section - CTA Button */}
      <div className="pr-8">
        <Button 
          variant="atp" 
          size="sm"
          onClick={() => onTabChange('recorder')}
          className="uppercase tracking-wide font-bold"
        >
          Record Session
        </Button>
      </div>
    </header>
  );
}
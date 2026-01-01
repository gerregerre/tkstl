import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const navLinks = [
  { id: 'home', label: 'Home' },
  { id: 'headtohead', label: 'Head-to-Head' },
  { id: 'history', label: 'History' },
  { id: 'info', label: 'Information' },
  { id: 'lore', label: 'The Lore' },
  { id: 'members', label: 'Members' },
];

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (tabId: string) => {
    onTabChange(tabId);
    setMobileMenuOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-card/95 backdrop-blur-md border-b border-border flex items-center z-50">
      {/* Left section with logo - ATP Style */}
      <div className="flex items-center pl-4 md:pl-8">
        <button 
          onClick={() => handleNavClick('home')}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity group"
        >
          {/* Logo accent bar */}
          <div className="w-1 h-8 bg-primary rounded-full" />
          <span className="font-display text-xl font-black text-foreground tracking-tight uppercase">
            TKSTL
          </span>
        </button>
      </div>

      {/* Desktop Navigation - ATP Style */}
      <nav className="hidden lg:flex items-center gap-1 flex-1 justify-center">
        {navLinks.map((link) => {
          const isActive = activeTab === link.id;
          
          return (
            <button
              key={link.id}
              onClick={() => handleNavClick(link.id)}
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

      {/* Right section - Desktop CTA Button */}
      <div className="hidden md:block pr-4 md:pr-8 ml-auto lg:ml-0">
        <Button 
          variant="atp" 
          size="sm"
          onClick={() => handleNavClick('recorder')}
          className="uppercase tracking-wide font-bold"
        >
          Record Session
        </Button>
      </div>

      {/* Mobile Menu Button */}
      <div className="lg:hidden ml-auto pr-4">
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="h-10 w-10">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Open menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[280px] sm:w-[320px] p-0">
            <div className="flex flex-col h-full">
              {/* Mobile Menu Header */}
              <div className="flex items-center justify-between p-4 border-b border-border">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-6 bg-primary rounded-full" />
                  <span className="font-display text-lg font-black text-foreground tracking-tight uppercase">
                    TKSTL
                  </span>
                </div>
              </div>

              {/* Mobile Navigation Links */}
              <nav className="flex-1 overflow-y-auto py-4">
                {navLinks.map((link) => {
                  const isActive = activeTab === link.id;
                  
                  return (
                    <button
                      key={link.id}
                      onClick={() => handleNavClick(link.id)}
                      className={cn(
                        "w-full flex items-center px-6 py-4 text-left text-base font-semibold transition-all uppercase tracking-wide border-l-4",
                        isActive
                          ? "text-primary bg-primary/10 border-l-primary"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/50 border-l-transparent"
                      )}
                    >
                      {link.label}
                    </button>
                  );
                })}
              </nav>

              {/* Mobile CTA Button */}
              <div className="p-4 border-t border-border">
                <Button 
                  variant="atp" 
                  size="lg"
                  onClick={() => handleNavClick('recorder')}
                  className="w-full uppercase tracking-wide font-bold"
                >
                  Record Session
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
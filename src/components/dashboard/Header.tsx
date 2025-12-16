import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { CrownIcon } from '@/components/icons/CrownIcon';
import { DirtIcon } from '@/components/icons/DirtIcon';
import { LogOut } from 'lucide-react';

export function Header() {
  const { user, logout } = useAuth();
  const isRoyal = user?.role === 'royalty';

  return (
    <header className="bg-card border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isRoyal ? 'bg-gold/10' : 'bg-burlap/10'}`}>
              {isRoyal ? (
                <CrownIcon className="w-6 h-6 text-gold" />
              ) : (
                <DirtIcon className="w-6 h-6 text-burlap" />
              )}
            </div>
            <div>
              <h1 className="font-serif text-xl font-bold text-foreground">TKSTL</h1>
              <p className="text-xs text-muted-foreground -mt-0.5">
                {isRoyal ? 'Royal Chamber' : 'Peasant Quarters'}
              </p>
            </div>
          </div>

          {/* User info */}
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className={`font-serif font-semibold ${isRoyal ? 'text-gold' : 'text-burlap'}`}>
                {user?.name}
              </p>
              <p className="text-xs text-muted-foreground italic">{user?.title}</p>
            </div>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-serif font-bold text-lg ${
              isRoyal 
                ? 'bg-gradient-noble text-foreground border-2 border-gold/30' 
                : 'bg-gradient-peasant text-foreground border-2 border-burlap/30'
            }`}>
              {user?.name?.[0]}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={logout}
              className="text-muted-foreground hover:text-foreground"
            >
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}

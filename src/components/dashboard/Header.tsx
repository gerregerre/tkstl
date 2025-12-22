import { Link } from 'react-router-dom';
import { CrownIcon } from '@/components/icons/CrownIcon';
import { UserMenu } from '@/components/dashboard/UserMenu';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { LogIn } from 'lucide-react';

export function Header() {
  const { user, loading } = useAuth();

  return (
    <header className="bg-card border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gold/10">
              <CrownIcon className="w-6 h-6 text-gold" />
            </div>
            <div>
              <h1 className="font-serif text-xl font-bold text-foreground">TKSTL</h1>
              <p className="text-xs text-muted-foreground -mt-0.5">
                Tennis Society
              </p>
            </div>
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-2">
            {!loading && (
              user ? (
                <UserMenu />
              ) : (
                <Button asChild variant="outline" size="sm">
                  <Link to="/auth">
                    <LogIn className="w-4 h-4 mr-2" />
                    Sign In
                  </Link>
                </Button>
              )
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

import { CrownIcon } from '@/components/icons/CrownIcon';

export function Header() {
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
        </div>
      </div>
    </header>
  );
}

import { getRoyalty, getPeasants } from '@/data/members';
import { CrownIcon } from '@/components/icons/CrownIcon';
import { DirtIcon } from '@/components/icons/DirtIcon';
import { Users, Star, Trophy } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function MemberProfiles() {
  const royalty = getRoyalty();
  const peasants = getPeasants();

  return (
    <div className="space-y-10 animate-fade-in-up">
      {/* Header - ATP Style */}
      <div className="flex items-center gap-4">
        <div className="w-1 h-14 bg-primary rounded-full" />
        <div className="w-12 h-12 rounded bg-primary/10 border border-primary/30 flex items-center justify-center">
          <Users className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="font-display text-3xl font-black text-foreground uppercase tracking-tight">The Membership</h1>
          <p className="text-muted-foreground font-medium">A Study in Hierarchy</p>
        </div>
      </div>

      {/* Royalty Section - ATP Style */}
      <section>
        <div className="flex items-center gap-3 mb-3">
          <Trophy className="w-6 h-6 text-primary" />
          <h2 className="font-display text-2xl font-black text-primary uppercase tracking-tight">
            The Royal Court
          </h2>
        </div>
        <p className="text-muted-foreground mb-6 max-w-2xl">
          The founding triumvirate, blessed with tennis divinity and seven years of unbroken reign. 
          Their presence on court is a gift to all who witness it.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {royalty.map((member) => (
            <div
              key={member.id}
              className="bg-card rounded border border-primary/30 p-6 relative overflow-hidden"
            >
              {/* Corner Accent - ATP Style */}
              <div className="absolute top-0 right-0 w-16 h-16">
                <div className="absolute top-0 right-0 w-0 h-0 border-t-[64px] border-t-primary/20 border-l-[64px] border-l-transparent" />
                <Star className="absolute top-2 right-2 w-4 h-4 text-primary" />
              </div>

              <div className="mb-4">
                <h3 className="font-display text-2xl font-black text-primary uppercase tracking-tight">
                  {member.name}
                </h3>
                <p className="text-accent text-sm font-medium">
                  {member.title}
                </p>
                <Badge className="mt-2 bg-primary/10 text-primary border-primary/30 font-bold">
                  {member.yearsOfService} years of reign
                </Badge>
              </div>

              <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                {member.bio}
              </p>

              <div>
                <p className="text-xs font-bold text-primary uppercase tracking-wider mb-3">
                  Noble Accomplishments
                </p>
                <ul className="space-y-1.5">
                  {member.accomplishments.map((acc, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                      <span>{acc}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Peasants Section - ATP Style */}
      <section>
        <div className="flex items-center gap-3 mb-3">
          <Users className="w-6 h-6 text-muted-foreground" />
          <h2 className="font-display text-2xl font-black text-foreground uppercase tracking-tight">
            The Common Folk
          </h2>
        </div>
        <p className="text-muted-foreground mb-6 max-w-2xl">
          Admitted through the benevolence of the Founders, these individuals have been granted the supreme 
          privilege of sharing oxygen with tennis royalty. Their journey from complete obscurity to slight 
          obscurity is truly inspiring.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {peasants.map((member) => (
            <div
              key={member.id}
              className="bg-card rounded border border-border p-6 relative overflow-hidden"
            >
              {/* Corner Accent */}
              <div className="absolute top-0 right-0 w-12 h-12">
                <div className="absolute top-0 right-0 w-0 h-0 border-t-[48px] border-t-secondary/30 border-l-[48px] border-l-transparent" />
              </div>

              <div className="mb-4">
                <h3 className="font-display text-2xl font-black text-foreground uppercase tracking-tight">
                  {member.name}
                </h3>
                <p className="text-muted-foreground text-sm font-medium">
                  {member.title}
                </p>
                <Badge variant="outline" className="mt-2 text-muted-foreground font-bold">
                  {member.yearsOfService} {member.yearsOfService === 1 ? 'year' : 'years'} of servitude
                </Badge>
              </div>

              <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                {member.bio}
              </p>

              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
                  Noted Traits
                </p>
                <ul className="space-y-1.5">
                  {member.accomplishments.map((acc, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground mt-1.5 shrink-0" />
                      <span>{acc}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer Note - ATP Style */}
      <div className="bg-secondary/30 rounded p-6 text-center border border-border">
        <p className="text-sm text-muted-foreground">
          <span className="font-bold text-foreground uppercase">Note:</span> Membership applications are currently closed. 
          The club has reached its optimal balance of excellence and charitable tolerance. 
          Any inquiries will be ceremonially ignored.
        </p>
      </div>
    </div>
  );
}
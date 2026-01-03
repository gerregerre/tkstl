import { getRoyalty, getPeasants } from "@/data/members";
import { CrownIcon } from "@/components/icons/CrownIcon";
import { DirtIcon } from "@/components/icons/DirtIcon";
import { Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
export function MemberProfiles() {
  const royalty = getRoyalty();
  const peasants = getPeasants();
  return (
    <div className="space-y-10 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
          <Users className="w-6 h-6 text-foreground" />
        </div>
        <div>
          <h1 className="font-serif text-3xl font-bold text-foreground">The Membership</h1>
          <p className="text-muted-foreground font-serif-body italic">A Study in Hierarchy</p>
        </div>
      </div>

      {/* Royalty Section */}
      <section>
        <div className="flex items-center gap-3 mb-3">
          <CrownIcon className="w-6 h-6 text-gold" />
          <h2 className="font-serif text-2xl font-bold text-primary">The Royal Court</h2>
        </div>
        <p className="text-muted-foreground font-serif-body mb-6 max-w-4xl">
          The founding triumvirate, blessed with tennis divinity and seven years of unbroken reign. Their presence on
          court is a gift to all who witness it. They sit upon a throne of countless victories, ruling the clay and
          grass with an absolute and terrifying majesty. To challenge them is to challenge fate itself, for they do not
          merely play the game—they dictate its very laws by royal decree.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {royalty.map((member) => (
            <div key={member.id} className="bg-card rounded-xl border border-gold/30 p-6 relative overflow-hidden">
              {/* Corner Accent */}
              <div className="absolute top-0 right-0 w-8 h-8">
                <div className="absolute top-0 right-0 w-0 h-0 border-t-[32px] border-t-gold/40 border-l-[32px] border-l-transparent" />
              </div>

              <div className="mb-4">
                <h3 className="font-serif text-2xl font-bold text-primary">{member.name}</h3>
                <p className="text-gold text-sm font-serif-body italic">{member.title}</p>
                <Badge variant="outline" className="mt-2 border-gold/50 text-gold bg-gold/5">
                  {member.yearsOfService} years of reign
                </Badge>
              </div>

              <p className="text-sm text-muted-foreground leading-relaxed font-serif-body mb-6">{member.bio}</p>

              <div>
                <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-3">
                  Noble Accomplishments
                </p>
                <ul className="space-y-1.5">
                  {member.accomplishments.map((acc, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="w-1.5 h-1.5 rounded-full bg-gold mt-1.5 shrink-0" />
                      <span>{acc}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Peasants Section */}
      <section>
        <div className="flex items-center gap-3 mb-3">
          <DirtIcon className="w-6 h-6 text-burlap" />
          <h2 className="font-serif text-2xl font-bold text-foreground">The Common Folk</h2>
        </div>
        <p className="text-muted-foreground font-serif-body mb-6 max-w-2xl">
          Admitted through the benevolence of the Founders, these individuals have been granted the supreme privilege of
          sharing oxygen with tennis royalty. Their journey from complete obscurity to slight obscurity is truly
          inspiring. Even though sharing the court with Royalty, the common folk shall always be seen as scum of the
          earth.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {peasants.map((member) => (
            <div key={member.id} className="bg-card rounded-xl border border-burlap/30 p-6 relative overflow-hidden">
              {/* Corner Accent */}
              <div className="absolute top-0 right-0 w-8 h-8">
                <div className="absolute top-0 right-0 w-0 h-0 border-t-[32px] border-t-burlap/30 border-l-[32px] border-l-transparent" />
              </div>

              <div className="mb-4">
                <h3 className="font-serif text-2xl font-bold text-foreground">{member.name}</h3>
                <p className="text-burlap text-sm font-serif-body italic">{member.title}</p>
                <Badge variant="outline" className="mt-2 border-burlap/50 text-burlap bg-burlap/5">
                  {member.yearsOfService} {member.yearsOfService === 1 ? "year" : "years"} of servitude
                </Badge>
              </div>

              <p className="text-sm text-muted-foreground leading-relaxed font-serif-body mb-6">{member.bio}</p>

              <div>
                <p className="text-xs font-semibold text-burlap uppercase tracking-wider mb-3">Noted Traits</p>
                <ul className="space-y-1.5">
                  {member.accomplishments.map((acc, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="w-1.5 h-1.5 rounded-full bg-burlap mt-1.5 shrink-0" />
                      <span>{acc}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer Note */}
      <div className="bg-muted/30 rounded-xl p-6 text-center border border-border">
        <p className="text-sm text-muted-foreground font-serif-body italic">
          <span className="font-semibold text-foreground">Note:</span> Membership applications are currently closed. The
          club has reached its optimal balance of excellence and charitable tolerance. Any inquiries will be
          ceremonially ignored.
        </p>
      </div>
    </div>
  );
}

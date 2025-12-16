import { getRoyalty, getPeasants } from '@/data/members';
import { CrownIcon } from '@/components/icons/CrownIcon';
import { DirtIcon } from '@/components/icons/DirtIcon';
import { cn } from '@/lib/utils';

export function MemberProfiles() {
  const royalty = getRoyalty();
  const peasants = getPeasants();

  return (
    <div className="space-y-10 animate-fade-in-up">
      {/* Royalty Section */}
      <section>
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-3 mb-2">
            <CrownIcon className="w-8 h-8 text-gold animate-crown-shine" />
            <h2 className="font-serif text-3xl font-bold text-foreground">
              The Royalty
            </h2>
            <CrownIcon className="w-8 h-8 text-gold animate-crown-shine" />
          </div>
          <p className="text-muted-foreground font-serif-body italic">
            The Founding Triumvirate — Architects of Glory
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {royalty.map((member, index) => (
            <div
              key={member.id}
              className="bg-card rounded-lg border-2 border-gold/30 p-6 shadow-card hover:shadow-noble transition-all animate-noble-pulse"
              style={{ animationDelay: `${index * 200}ms` }}
            >
              <div className="text-center mb-4">
                <div className="w-20 h-20 mx-auto rounded-full bg-gradient-noble flex items-center justify-center font-serif text-3xl font-bold text-foreground shadow-lg mb-3">
                  {member.name[0]}
                </div>
                <h3 className="font-serif text-2xl font-bold text-foreground">
                  {member.name}
                </h3>
                <p className="text-gold text-sm font-semibold italic">
                  {member.title}
                </p>
              </div>

              <div className="bg-gold/5 rounded-lg p-4 mb-4">
                <p className="text-sm text-foreground/80 leading-relaxed font-serif-body">
                  {member.bio}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-sm">
                <div className="bg-muted/50 rounded-lg p-2">
                  <p className="text-xs text-muted-foreground">Record</p>
                  <p className="font-semibold">
                    <span className="text-hunter-green">{member.wins}</span>
                    <span className="text-muted-foreground mx-1">-</span>
                    <span className="text-destructive/70">{member.losses}</span>
                  </p>
                </div>
                <div className="bg-muted/50 rounded-lg p-2">
                  <p className="text-xs text-muted-foreground">+/-</p>
                  <p className={cn(
                    "font-semibold",
                    member.pointDifferential > 0 ? "text-hunter-green" : "text-destructive/70"
                  )}>
                    {member.pointDifferential > 0 ? '+' : ''}{member.pointDifferential}
                  </p>
                </div>
                <div className="bg-gold/10 rounded-lg p-2">
                  <p className="text-xs text-gold/80">Noble</p>
                  <p className="font-serif font-bold text-gold">
                    {member.nobleStandard.toFixed(1)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Divider */}
      <div className="flex items-center gap-4">
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        <span className="text-sm text-muted-foreground italic font-serif-body">
          "The line between royalty and peasantry is drawn in clay"
        </span>
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      </div>

      {/* Peasants Section */}
      <section>
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-3 mb-2">
            <DirtIcon className="w-8 h-8 text-burlap" />
            <h2 className="font-serif text-3xl font-bold text-foreground">
              The Peasants
            </h2>
            <DirtIcon className="w-8 h-8 text-burlap" />
          </div>
          <p className="text-muted-foreground font-serif-body italic">
            The Grateful Recipients — Lucky to Breathe the Same Air
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {peasants.map((member, index) => (
            <div
              key={member.id}
              className="bg-card rounded-lg border border-burlap/30 p-6 shadow-card hover:shadow-md transition-all"
              style={{ animationDelay: `${(index + 3) * 200}ms` }}
            >
              <div className="text-center mb-4">
                <div className="w-20 h-20 mx-auto rounded-full bg-gradient-peasant flex items-center justify-center font-serif text-3xl font-bold text-foreground shadow-md mb-3">
                  {member.name[0]}
                </div>
                <h3 className="font-serif text-2xl font-bold text-foreground">
                  {member.name}
                </h3>
                <p className="text-burlap text-sm font-semibold italic">
                  {member.title}
                </p>
              </div>

              <div className="bg-burlap/5 rounded-lg p-4 mb-4">
                <p className="text-sm text-foreground/80 leading-relaxed font-serif-body">
                  {member.bio}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-sm">
                <div className="bg-muted/50 rounded-lg p-2">
                  <p className="text-xs text-muted-foreground">Record</p>
                  <p className="font-semibold">
                    <span className="text-hunter-green">{member.wins}</span>
                    <span className="text-muted-foreground mx-1">-</span>
                    <span className="text-destructive/70">{member.losses}</span>
                  </p>
                </div>
                <div className="bg-muted/50 rounded-lg p-2">
                  <p className="text-xs text-muted-foreground">+/-</p>
                  <p className={cn(
                    "font-semibold",
                    member.pointDifferential > 0 ? "text-hunter-green" : "text-destructive/70"
                  )}>
                    {member.pointDifferential > 0 ? '+' : ''}{member.pointDifferential}
                  </p>
                </div>
                <div className="bg-burlap/10 rounded-lg p-2">
                  <p className="text-xs text-burlap/80">Noble</p>
                  <p className="font-serif font-bold text-burlap">
                    {member.nobleStandard.toFixed(1)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* The Empty Chair */}
      <section className="mt-12">
        <div className="bg-card rounded-lg border border-dashed border-destructive/30 p-8 text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-muted/50 flex items-center justify-center mb-4 border-2 border-dashed border-muted-foreground/30">
            <span className="text-3xl text-muted-foreground/50">?</span>
          </div>
          <h3 className="font-serif text-xl font-bold text-muted-foreground mb-2">
            The Empty Position
          </h3>
          <p className="text-sm text-muted-foreground/70 italic max-w-md mx-auto">
            A seat remains vacant in both Royalty and Peasant ranks. Some say it serves as a warning. 
            Others suggest it honors a memory that cannot be spoken. We simply... do not speak of it.
          </p>
        </div>
      </section>
    </div>
  );
}

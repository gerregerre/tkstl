import { useState } from 'react';
import { clubHistory } from '@/data/lore';
import { Button } from '@/components/ui/button';
import { BookOpen, Lock, AlertTriangle, Rocket, Crown, Globe } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const iconMap: Record<string, React.ElementType> = {
  rocket: Rocket,
  crown: Crown,
  globe: Globe,
};

export function TheLore() {
  const [showClassified, setShowClassified] = useState(false);
  const { user } = useAuth();
  const isRoyal = user?.role === 'royalty';

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
          <BookOpen className="w-6 h-6 text-foreground" />
        </div>
        <div>
          <h1 className="font-serif text-3xl font-bold text-foreground">{clubHistory.title}</h1>
          <p className="text-muted-foreground font-serif-body italic">{clubHistory.subtitle}</p>
        </div>
      </div>

      {/* Sections */}
      <div className="space-y-6">
        {clubHistory.sections.map((section, index) => {
          const IconComponent = iconMap[section.icon] || Rocket;
          
          return (
            <article 
              key={index} 
              className="bg-card rounded-xl border border-border p-6 md:p-8"
            >
              <div className="flex items-center gap-3 mb-4">
                <IconComponent className="w-5 h-5 text-gold" />
                <h2 className="font-serif text-xl font-bold text-primary">
                  {section.title}
                </h2>
              </div>
              
              <div className="space-y-4">
                {section.paragraphs.map((paragraph, pIndex) => (
                  <p 
                    key={pIndex} 
                    className="text-muted-foreground leading-relaxed font-serif-body"
                  >
                    {paragraph}
                  </p>
                ))}
                
                {section.features && (
                  <div className="mt-6">
                    <p className="text-muted-foreground font-serif-body mb-3">
                      Our current roster includes legendary players whose Noble Standard ratings have achieved sentience and occasionally file tax returns independently. The league now features:
                    </p>
                    <ul className="space-y-2">
                      {section.features.map((feature, fIndex) => (
                        <li key={fIndex} className="flex items-start gap-2 text-muted-foreground">
                          <span className="w-1.5 h-1.5 rounded-full bg-gold mt-2 shrink-0" />
                          <span className="font-serif-body">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {section.quote && (
                  <p className="mt-6 text-foreground font-semibold font-serif-body">
                    As we like to say at {section.quote.author}: "{section.quote.text}"
                  </p>
                )}
              </div>
            </article>
          );
        })}
      </div>

      {/* Classified Section */}
      <div className="bg-card rounded-xl border-2 border-destructive/30 p-6 md:p-8">
        <div className="flex items-center gap-3 mb-4">
          {showClassified ? (
            <AlertTriangle className="w-5 h-5 text-destructive" />
          ) : (
            <Lock className="w-5 h-5 text-muted-foreground" />
          )}
          <h2 className="font-serif text-xl font-bold text-foreground">
            {clubHistory.theRedacted.title}
          </h2>
          <span className="text-xs bg-destructive/10 text-destructive px-2 py-0.5 rounded font-mono">
            CLASSIFIED
          </span>
        </div>

        {showClassified ? (
          <div className="space-y-4">
            <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-4">
              <p className="text-xs text-destructive font-mono mb-1">
                ⚠ CLEARANCE LEVEL: {isRoyal ? 'SOVEREIGN' : 'PEASANT (UNAUTHORIZED)'}
              </p>
              {!isRoyal && (
                <p className="text-xs text-destructive/80 italic">
                  Warning: Peasant access to this document has been logged and reported to the Founders.
                </p>
              )}
            </div>
            <div className="font-serif-body text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {clubHistory.theRedacted.content}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowClassified(false)}
              className="mt-2"
            >
              Re-seal Document
            </Button>
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-muted-foreground mb-4 italic font-serif-body">
              "Some knowledge carries a weight that the unprepared cannot bear."
            </p>
            <p className="text-xs text-muted-foreground mb-6">
              This document contains classified information regarding The Fourth Founder.
            </p>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowClassified(true)}
            >
              <Lock className="w-4 h-4 mr-2" />
              Access Classified Records
            </Button>
          </div>
        )}
      </div>

      {/* Footer Quote */}
      <div className="text-center py-6">
        <blockquote className="font-serif-body text-lg italic text-muted-foreground">
          "We do not play tennis. Tennis, in its truest form, plays us."
        </blockquote>
        <p className="text-sm text-muted-foreground mt-2">— Gerard, Annual Assembly, Year Seven</p>
      </div>
    </div>
  );
}

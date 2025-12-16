import { useState } from 'react';
import { clubHistory } from '@/data/lore';
import { Button } from '@/components/ui/button';
import { BookOpen, Lock, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

export function TheLore() {
  const [showClassified, setShowClassified] = useState(false);
  const { user } = useAuth();
  const isRoyal = user?.role === 'royalty';

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Header */}
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <BookOpen className="w-12 h-12 text-terra-cotta" />
        </div>
        <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground">
          {clubHistory.title}
        </h2>
        <p className="font-serif-body text-xl text-muted-foreground mt-2 italic">
          {clubHistory.subtitle}
        </p>
        <div className="flex items-center justify-center gap-3 mt-4">
          <div className="h-px w-16 bg-gradient-noble" />
          <span className="text-terra-cotta">⚜</span>
          <div className="h-px w-16 bg-gradient-noble" />
        </div>
      </div>

      {/* Chapters */}
      <div className="space-y-8">
        {clubHistory.chapters.map((chapter, index) => (
          <article 
            key={index} 
            className="bg-card rounded-lg border border-border p-6 md:p-8 shadow-card"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-start gap-4 mb-4">
              <div className="bg-terra-cotta/10 rounded-lg p-3 hidden sm:block">
                <span className="font-serif text-2xl font-bold text-terra-cotta">
                  {String(index + 1).padStart(2, '0')}
                </span>
              </div>
              <div>
                <span className="text-xs uppercase tracking-wider text-muted-foreground">
                  {chapter.year}
                </span>
                <h3 className="font-serif text-2xl font-bold text-foreground mt-1">
                  {chapter.title}
                </h3>
              </div>
            </div>
            <div className="prose prose-sm max-w-none">
              {chapter.content.split('\n\n').map((paragraph, pIndex) => (
                <p 
                  key={pIndex} 
                  className={cn(
                    "text-foreground/80 leading-relaxed mb-4 last:mb-0",
                    paragraph.includes('The Redacted') || paragraph.includes('He Who Stumbled')
                      ? "bg-destructive/5 border-l-2 border-destructive/30 pl-4 py-2 italic"
                      : ""
                  )}
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </article>
        ))}
      </div>

      {/* Classified Section */}
      <div className="relative">
        <div className={cn(
          "bg-card rounded-lg border-2 p-6 md:p-8 shadow-card transition-all",
          showClassified ? "border-destructive/50" : "border-border"
        )}>
          <div className="flex items-center gap-3 mb-4">
            {showClassified ? (
              <AlertTriangle className="w-6 h-6 text-destructive" />
            ) : (
              <Lock className="w-6 h-6 text-muted-foreground" />
            )}
            <h3 className="font-serif text-xl font-bold text-foreground">
              {clubHistory.theRedacted.title}
            </h3>
          </div>

          {showClassified ? (
            <div className="space-y-4">
              <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-4">
                <p className="text-xs text-destructive font-mono mb-2">
                  ⚠ CLEARANCE LEVEL: {isRoyal ? 'SOVEREIGN' : 'PEASANT (UNAUTHORIZED)'}
                </p>
                {!isRoyal && (
                  <p className="text-xs text-destructive italic">
                    Warning: Peasant access to this document has been logged.
                  </p>
                )}
              </div>
              <div className="font-mono text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">
                {clubHistory.theRedacted.content}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowClassified(false)}
                className="mt-4"
              >
                Re-seal Document
              </Button>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4 italic font-serif-body">
                "Some knowledge carries a weight that the unprepared cannot bear."
              </p>
              <p className="text-xs text-muted-foreground mb-6">
                This document contains classified information regarding The Fourth Founder.
              </p>
              <Button
                variant="destructive"
                onClick={() => setShowClassified(true)}
              >
                <Lock className="w-4 h-4 mr-2" />
                Access Classified Records
              </Button>
            </div>
          )}
        </div>

        {/* Decorative corners */}
        <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-terra-cotta/30 rounded-tl-lg" />
        <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-terra-cotta/30 rounded-tr-lg" />
        <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-terra-cotta/30 rounded-bl-lg" />
        <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-terra-cotta/30 rounded-br-lg" />
      </div>

      {/* Footer Quote */}
      <div className="text-center py-8">
        <blockquote className="font-serif-body text-xl italic text-muted-foreground">
          "We do not play tennis. Tennis, in its truest form, plays us."
        </blockquote>
        <p className="text-sm text-muted-foreground mt-2">— Gerard, Annual Assembly, Year Seven</p>
      </div>
    </div>
  );
}

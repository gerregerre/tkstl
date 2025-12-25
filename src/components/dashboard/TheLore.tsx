import { useState } from 'react';
import { clubHistory } from '@/data/lore';
import { Button } from '@/components/ui/button';
import { BookOpen, Lock, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

export function TheLore() {
  const [showClassified, setShowClassified] = useState(false);

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Header */}
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <div className="p-3 rounded bg-primary/20">
            <BookOpen className="w-10 h-10 text-primary" />
          </div>
        </div>
        <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground uppercase tracking-wide">
          {clubHistory.title}
        </h2>
        <p className="font-sans text-lg text-muted-foreground mt-2">
          {clubHistory.subtitle}
        </p>
        <div className="flex items-center justify-center gap-3 mt-4">
          <div className="h-px w-16 bg-primary/50" />
          <span className="text-primary">◆</span>
          <div className="h-px w-16 bg-primary/50" />
        </div>
      </div>

      {/* Chapters */}
      <div className="space-y-6">
        {clubHistory.chapters.map((chapter, index) => (
          <article 
            key={index} 
            className="bg-card rounded border border-border p-6 md:p-8 shadow-card hover:border-primary/30 transition-colors"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-start gap-4 mb-4">
              <div className="bg-primary/10 rounded p-3 hidden sm:flex items-center justify-center">
                <span className="font-display text-2xl font-bold text-primary">
                  {String(index + 1).padStart(2, '0')}
                </span>
              </div>
              <div>
                <span className="text-xs uppercase tracking-wider text-primary font-medium">
                  {chapter.year}
                </span>
                <h3 className="font-display text-xl font-bold text-foreground mt-1 uppercase tracking-wide">
                  {chapter.title}
                </h3>
              </div>
            </div>
            <div className="prose prose-sm max-w-none">
              {chapter.content.split('\n\n').map((paragraph, pIndex) => (
                <p 
                  key={pIndex} 
                  className={cn(
                    "text-foreground/80 leading-relaxed mb-4 last:mb-0 font-sans",
                    paragraph.includes('The Redacted') || paragraph.includes('He Who Stumbled')
                      ? "bg-destructive/10 border-l-2 border-destructive/50 pl-4 py-2 italic"
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
          "bg-card rounded border-2 p-6 md:p-8 shadow-card transition-all",
          showClassified ? "border-destructive/50" : "border-border"
        )}>
          <div className="flex items-center gap-3 mb-4">
            {showClassified ? (
              <div className="p-2 rounded bg-destructive/20">
                <AlertTriangle className="w-5 h-5 text-destructive" />
              </div>
            ) : (
              <div className="p-2 rounded bg-muted">
                <Lock className="w-5 h-5 text-muted-foreground" />
              </div>
            )}
            <h3 className="font-display text-xl font-bold text-foreground uppercase tracking-wide">
              {clubHistory.theRedacted.title}
            </h3>
          </div>

          {showClassified ? (
            <div className="space-y-4">
              <div className="bg-destructive/10 border border-destructive/30 rounded p-4">
                <p className="text-xs text-destructive font-mono font-medium">
                  ⚠ CLEARANCE LEVEL: READER
                </p>
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
              <p className="text-muted-foreground mb-4 italic font-sans">
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
        <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-primary/30 rounded-tl" />
        <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-primary/30 rounded-tr" />
        <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-primary/30 rounded-bl" />
        <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-primary/30 rounded-br" />
      </div>

      {/* Footer Quote */}
      <div className="text-center py-8">
        <blockquote className="font-sans text-xl italic text-muted-foreground">
          "We do not play tennis. Tennis, in its truest form, plays us."
        </blockquote>
        <p className="text-sm text-primary mt-2 font-medium">— Gerard, Annual Assembly, Year Seven</p>
      </div>
    </div>
  );
}

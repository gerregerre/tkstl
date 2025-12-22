import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Trophy, Target, Sword, Scale, BookOpen, Calculator } from 'lucide-react';

export function Information() {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-foreground">The Sacred Compendium</h1>
        <p className="text-muted-foreground italic">
          For those who require illumination on matters that ought to be self-evident
        </p>
      </div>

      {/* Session Overview */}
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            What Constitutes a "Session"
          </CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none text-muted-foreground">
          <p>
            A session, for those blissfully unaware, comprises precisely <strong>three individual games</strong>. 
            Not two. Not four. Three. One might think this elementary, yet here we are, 
            providing written documentation.
          </p>
          <p className="italic">
            Each game presents its own peculiar charm, designed to test not merely one's athletic prowess, 
            but also one's patience, partnership compatibility, and tolerance for chaos.
          </p>
        </CardContent>
      </Card>

      {/* The Three Games */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-foreground flex items-center gap-2">
          <Sword className="w-6 h-6 text-primary" />
          The Triumvirate of Torment
        </h2>

        <Accordion type="single" collapsible className="space-y-2">
          {/* PwC Single */}
          <AccordionItem value="pwc" className="border rounded-lg px-4 bg-card">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Target className="w-5 h-5 text-primary" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-foreground">PwC Single</h3>
                  <p className="text-sm text-muted-foreground">The Accountant's Paradox</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-4 space-y-4">
              <div className="space-y-3 text-muted-foreground">
                <h4 className="font-medium text-foreground">The Rules (For the Uninitiated)</h4>
                <p>
                  The court is divided—much like opinions at a family dinner—into two mini single courts 
                  where two singles matches proceed simultaneously. One might describe this as "efficient." 
                  Others might call it "barely controlled chaos."
                </p>
                <p>
                  Once a point is determined in <em>either</em> singles match, the entire affair transforms 
                  into a doubles match. The victorious singles player has earned their team a fighting 
                  chance at a full team point. The vanquished? They must now rely on their partner to 
                  salvage what remains of their dignity.
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Winner of singles gains opportunity for full team point via doubles</li>
                  <li>Loser must win doubles to avoid conceding the match point</li>
                  <li>First team to <strong>9 points</strong> claims victory</li>
                </ul>
              </div>
              
              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <h4 className="font-medium text-foreground flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  Historical Origins
                </h4>
                <p className="text-sm text-muted-foreground italic">
                  Legend has it this format was conceived during a particularly tedious quarterly 
                  review at a prestigious accounting firm, where partners discovered that watching 
                  paint dry was marginally more exciting than their spreadsheets. The name "PwC" 
                  is purely coincidental and bears absolutely no relation to any Big Four firm. 
                  Legal counsel has assured us of this.
                </p>
                <p className="text-sm text-muted-foreground italic">
                  The simultaneous singles format was allegedly inspired by the firm's belief that 
                  "if one person can do a job, surely two people doing it at once is twice as good." 
                  This philosophy, we note, explains much about modern corporate culture.
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Shibuya Crossing */}
          <AccordionItem value="shibuya" className="border rounded-lg px-4 bg-card">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <svg className="w-5 h-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4l16 16M20 4L4 20" />
                  </svg>
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-foreground">Shibuya Crossing</h3>
                  <p className="text-sm text-muted-foreground">Organised Pandemonium</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-4 space-y-4">
              <div className="space-y-3 text-muted-foreground">
                <h4 className="font-medium text-foreground">The Rules (Do Try to Keep Up)</h4>
                <p>
                  Similar to the PwC Single in its fundamental chaos, yet with a delightful twist 
                  that makes spatial awareness absolutely essential. The matches proceed 
                  <strong> cross-court</strong>—hence the name, for those struggling to connect 
                  the dots.
                </p>
                <p>
                  Two singles matches occur simultaneously, crossing paths like the famous Tokyo 
                  intersection. Once one match concludes, the survivors reconvene for doubles. 
                  The winner of two points receives a full team point.
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Cross-court singles format (yes, balls may intersect)</li>
                  <li>Transitions to doubles upon first point determination</li>
                  <li>Two points required for one team point</li>
                  <li>First team to <strong>9 points</strong> emerges victorious</li>
                </ul>
              </div>
              
              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <h4 className="font-medium text-foreground flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  Historical Origins
                </h4>
                <p className="text-sm text-muted-foreground italic">
                  Named after Tokyo's Shibuya Crossing—reportedly the world's busiest pedestrian 
                  intersection—this format was developed by someone who clearly felt that regular 
                  tennis lacked sufficient opportunities for collision and confusion.
                </p>
                <p className="text-sm text-muted-foreground italic">
                  Historical records indicate the game was first played in 2019, when a group of 
                  distinguished players, having consumed one too many post-match refreshments, 
                  decided that playing perpendicular to one another would be "a jolly good laugh." 
                  They were not entirely wrong.
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Tug of War */}
          <AccordionItem value="tugofwar" className="border rounded-lg px-4 bg-card">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Scale className="w-5 h-5 text-primary" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-foreground">Tug of War</h3>
                  <p className="text-sm text-muted-foreground">The Zero-Sum Showdown</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-4 space-y-4">
              <div className="space-y-3 text-muted-foreground">
                <h4 className="font-medium text-foreground">The Rules (Refreshingly Simple)</h4>
                <p>
                  At last, a format that even the most distracted among us can comprehend. 
                  Pure doubles. One ball. No pretense of multitasking.
                </p>
                <p>
                  The scoring operates on a <strong>zero-sum system</strong>—a concept familiar 
                  to economists and siblings dividing dessert. Both teams commence at 5-5. 
                  Win a point, you advance to 6 whilst your opponents retreat to 4. 
                  It is, quite literally, a tug of war.
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Pure doubles format (one ball, two teams, infinite tension)</li>
                  <li>Starting score: 5-5</li>
                  <li>Every point gained is a point lost by opponents</li>
                  <li>First team to reach <strong>10 points</strong> wins</li>
                </ul>
              </div>
              
              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <h4 className="font-medium text-foreground flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  Historical Origins
                </h4>
                <p className="text-sm text-muted-foreground italic">
                  The Tug of War format traces its lineage to ancient Greek athletic festivals, 
                  where philosophers would debate the nature of zero-sum games whilst 
                  simultaneously demonstrating them. Plato reportedly despised this format, 
                  calling it "needlessly dramatic." Aristotle, predictably, thought it "perfectly 
                  balanced."
                </p>
                <p className="text-sm text-muted-foreground italic">
                  The modern iteration emerged when players grew weary of complex scoring systems 
                  that required advanced mathematics. "What if," one visionary suggested, "we simply 
                  made winning feel like you're stealing something?" The rest, as they say, is history.
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      {/* Scoring System */}
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-primary" />
            The Mysterious Art of Scoring
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3 text-muted-foreground">
            <p>
              For those who've gazed upon the leaderboard with confusion and mild despair, 
              allow us to illuminate the arcane mathematics that govern one's standing.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="bg-muted/50 rounded-lg p-4 space-y-3">
              <h4 className="font-medium text-foreground">Session Scoring</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p><strong>Games 1 & 2 (PwC Single / Shibuya Crossing):</strong></p>
                <ul className="list-disc list-inside ml-2 space-y-1">
                  <li>Winner: Points equal to their final score</li>
                  <li>Loser: Points equal to their final score (yes, even in defeat)</li>
                </ul>
                <p className="mt-2"><strong>Game 3 (Tug of War):</strong></p>
                <ul className="list-disc list-inside ml-2 space-y-1">
                  <li>Winner: Awarded points for glory</li>
                  <li>Loser: Awarded points for participation (we're nothing if not compassionate)</li>
                </ul>
              </div>
            </div>

            <div className="bg-muted/50 rounded-lg p-4 space-y-3">
              <h4 className="font-medium text-foreground">Leaderboard Calculation</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>
                  The leaderboard ranking is determined by one's <strong>average points per game</strong>. 
                  This sophisticated metric ensures that:
                </p>
                <ul className="list-disc list-inside ml-2 space-y-1">
                  <li>Consistency is rewarded over mere participation</li>
                  <li>One spectacular session won't eclipse chronic mediocrity</li>
                  <li>New players aren't unfairly advantaged by sample size</li>
                </ul>
                <p className="mt-2 italic">
                  Formula: Total Points ÷ Games Played = Your Worth as a Human Being 
                  (in tennis terms, at least)
                </p>
              </div>
            </div>
          </div>

          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 space-y-2">
            <h4 className="font-medium text-foreground flex items-center gap-2">
              <Trophy className="w-4 h-4 text-primary" />
              Doubles vs Singles Distinction
            </h4>
            <p className="text-sm text-muted-foreground">
              The leaderboard graciously tracks both <strong>doubles</strong> and <strong>singles</strong> 
              performance separately, for those who wish to examine exactly where their partnerships 
              are failing them—or vice versa. One can toggle between combined, doubles-only, and 
              singles-only views, allowing for maximally targeted self-criticism.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Philosophical Closing */}
      <Card className="bg-gradient-to-br from-primary/5 to-transparent border-primary/20">
        <CardContent className="py-6 text-center space-y-2">
          <p className="text-muted-foreground italic">
            "In tennis, as in life, the scoring may seem arbitrary, the rules Byzantine, 
            and the outcomes frequently unjust. Yet we persist, for what is sport if not 
            a metaphor for existence itself?"
          </p>
          <p className="text-xs text-muted-foreground">
            — Anonymous, likely after a particularly devastating loss
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Trophy, Target, Sword, Scale, BookOpen, Calculator, Zap } from 'lucide-react';

export function Information() {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-foreground">The Sacred Compendium</h1>
        <p className="text-muted-foreground italic">
          Because apparently, some of you still don't get it
        </p>
      </div>

      {/* Session Overview */}
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            What the Hell is a "Session"
          </CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none text-muted-foreground">
          <p>
            A session is <strong>three games</strong>. That's it. Three. 
            Not "until someone gets tired." Not "best of whatever." Three games. Done.
          </p>
          <p>
            You show up, you play three different formats, you go home questioning 
            your life choices. Simple.
          </p>
        </CardContent>
      </Card>

      {/* The Three Games */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-foreground flex items-center gap-2">
          <Sword className="w-6 h-6 text-primary" />
          The Three Formats (Pay Attention)
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
                  <p className="text-sm text-muted-foreground">Corporate Chaos</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-4 space-y-4">
              <div className="space-y-3 text-muted-foreground">
                <h4 className="font-medium text-foreground">How It Works</h4>
                <p>
                  Court splits into two mini singles courts. Two singles matches happen 
                  at the same time. Yes, it's chaos. That's the point.
                </p>
                <p>
                  The second someone wins their singles point, everything stops. Now it's 
                  doubles. The team that won the singles gets to fight for the full point. 
                  The losers? They have to claw it back or eat the L.
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Win your singles = your team gets the doubles chance</li>
                  <li>Lose your singles = pray your partner carries</li>
                  <li>First to <strong>9 points</strong> wins</li>
                </ul>
              </div>
              
              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <h4 className="font-medium text-foreground flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  Why "PwC"?
                </h4>
                <p className="text-sm text-muted-foreground italic">
                  Named after the accounting firm because someone thought running 
                  parallel operations simultaneously was "efficient." 
                  Lawyers assure us this is purely coincidental.
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
                  <p className="text-sm text-muted-foreground">Controlled Disaster</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-4 space-y-4">
              <div className="space-y-3 text-muted-foreground">
                <h4 className="font-medium text-foreground">How It Works</h4>
                <p>
                  Same idea as PwC, except now the singles matches are <strong>cross-court</strong>. 
                  You're playing diagonal to someone else who's also playing diagonal. 
                  Balls cross paths. Collisions happen. Deal with it.
                </p>
                <p>
                  One twist: you need <strong>two points</strong> for one team point. 
                  So even if you clutch your singles, you still gotta win the doubles.
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Cross-court singles (yes, it's as messy as it sounds)</li>
                  <li>First singles winner triggers doubles phase</li>
                  <li>Two points = one team point</li>
                  <li>First to <strong>9 points</strong> wins</li>
                </ul>
              </div>
              
              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <h4 className="font-medium text-foreground flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  Why "Shibuya Crossing"?
                </h4>
                <p className="text-sm text-muted-foreground italic">
                  Named after Tokyo's busiest intersection where thousands of people 
                  cross simultaneously without dying. Same energy here. Mostly.
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
                  <p className="text-sm text-muted-foreground">Zero-Sum Brutality</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-4 space-y-4">
              <div className="space-y-3 text-muted-foreground">
                <h4 className="font-medium text-foreground">How It Works</h4>
                <p>
                  Finally, something simple. Pure doubles. One ball. No weird phases.
                </p>
                <p>
                  Both teams start at <strong>5-5</strong>. You win a point, you go to 6, 
                  they drop to 4. You lose a point, opposite happens. Every point you 
                  gain is literally stolen from them.
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Straight doubles (no singles nonsense)</li>
                  <li>Start: 5-5</li>
                  <li>Your gain = their loss</li>
                  <li>First to <strong>10</strong> wins</li>
                </ul>
              </div>
              
              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <h4 className="font-medium text-foreground flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  Why "Tug of War"?
                </h4>
                <p className="text-sm text-muted-foreground italic">
                  Because that's literally what it is. You pull points away from them. 
                  They pull points away from you. Someone hits 10. Done.
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      {/* Points Breakdown - NEW SECTION */}
      <Card className="border-destructive/30 bg-destructive/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <Zap className="w-5 h-5" />
            How Points Actually Work (Read This)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-muted-foreground font-medium">
            Everyone gets points. Winners. Losers. Everyone. Here's the breakdown:
          </p>

          <div className="space-y-4">
            <div className="border rounded-lg p-4 bg-card space-y-3">
              <h4 className="font-bold text-foreground">Games 1 & 2: PwC / Shibuya</h4>
              <div className="grid gap-3 text-sm">
                <div className="flex items-start gap-3">
                  <div className="w-20 flex-shrink-0 font-semibold text-green-500">WINNER:</div>
                  <div className="text-muted-foreground">
                    Gets points equal to their final score. If you win 9-7, you get <strong>9 points</strong>.
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-20 flex-shrink-0 font-semibold text-red-500">LOSER:</div>
                  <div className="text-muted-foreground">
                    Gets points equal to their final score too. Lost 7-9? You still get <strong>7 points</strong>. 
                    Not nothing. Just... less.
                  </div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground/70 italic">
                So yeah, even if you choke, you walk away with something. You're welcome.
              </p>
            </div>

            <div className="border rounded-lg p-4 bg-card space-y-3">
              <h4 className="font-bold text-foreground">Game 3: Tug of War</h4>
              <div className="grid gap-3 text-sm">
                <div className="flex items-start gap-3">
                  <div className="w-20 flex-shrink-0 font-semibold text-green-500">WINNER:</div>
                  <div className="text-muted-foreground">
                    Gets <strong>10 points</strong> (the winning score).
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-20 flex-shrink-0 font-semibold text-red-500">LOSER:</div>
                  <div className="text-muted-foreground">
                    Gets <strong>0 points</strong>. Zero-sum means zero-sum. You got dragged to 0, 
                    you get nothing. It's brutal. That's the game.
                  </div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground/70 italic">
                This is why Tug of War matters. It's all or nothing.
              </p>
            </div>
          </div>

          <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
            <h4 className="font-bold text-foreground mb-2">Example Session</h4>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>Game 1 (PwC): Your team wins 9-5 → You get <strong>9 pts</strong></p>
              <p>Game 2 (Shibuya): Your team loses 6-9 → You get <strong>6 pts</strong></p>
              <p>Game 3 (Tug): Your team wins 10-0 → You get <strong>10 pts</strong></p>
              <p className="pt-2 font-medium text-foreground">Total: 25 points from 3 games = 8.33 avg</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Leaderboard Calculation */}
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-primary" />
            Leaderboard Rankings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3 text-muted-foreground">
            <p>
              Your ranking is your <strong>average points per game</strong>. Not total points. Average. 
              This stops people from gaming the system by just playing more.
            </p>
            <p className="font-medium">
              Formula: Total Points ÷ Games Played = Your Rank
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="bg-muted/50 rounded-lg p-4 space-y-3">
              <h4 className="font-medium text-foreground">Why Averages?</h4>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                <li>Can't climb by just showing up more</li>
                <li>One bad session won't destroy you</li>
                <li>Consistency actually matters</li>
                <li>Quality over quantity</li>
              </ul>
            </div>

            <div className="bg-muted/50 rounded-lg p-4 space-y-3">
              <h4 className="font-medium text-foreground">The Modes</h4>
              <div className="text-sm text-muted-foreground space-y-1">
                <p><strong>Combined:</strong> All your games, singles + doubles</p>
                <p><strong>Doubles:</strong> Just your doubles performance</p>
                <p><strong>Singles:</strong> Just your singles performance</p>
                <p className="italic text-xs mt-2">
                  Use these to see exactly who's carrying and who's getting carried.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 space-y-2">
            <h4 className="font-medium text-foreground flex items-center gap-2">
              <Trophy className="w-4 h-4 text-primary" />
              Bottom Line
            </h4>
            <p className="text-sm text-muted-foreground">
              Win big, get more points. Lose close, still get decent points. 
              Get steamrolled in Tug of War, get nothing. 
              Play more games, your average evens out. Simple.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Closing */}
      <Card className="bg-gradient-to-br from-primary/5 to-transparent border-primary/20">
        <CardContent className="py-6 text-center space-y-2">
          <p className="text-muted-foreground italic">
            "Stop asking questions the rulebook already answers."
          </p>
          <p className="text-xs text-muted-foreground">
            — Management
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

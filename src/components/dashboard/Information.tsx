import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Trophy, Target, Sword, Scale, BookOpen, Calculator, Zap, Scroll, User, CheckCircle2, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
export function Information() {
  return <div className="space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gold">The Sacred Compendium</h1>
        <p className="text-muted-foreground italic">
          A chronicle of noble traditions and their legendary origins
        </p>
      </div>

      {/* Session Overview */}
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            What Exactly is a "Session"
          </CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none text-muted-foreground">
          <p>
            A session consists of <strong>three games</strong>. Not more, not less. This sacred number 
            was established in the Treaty of the First Serve (2023), when the founders realized that 
            four games made people grumpy and two games left everyone unsatisfied.
          </p>
          <p>
            Each session features three distinct formats, carefully designed to test every aspect 
            of your badminton prowess—and your ability to handle chaos.
          </p>
        </CardContent>
      </Card>

      {/* The Three Games */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-foreground flex items-center gap-2">
          <Sword className="w-6 h-6 text-primary" />
          The Three Sacred Formats
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
                  <p className="text-sm text-muted-foreground">The Accountant's Legacy</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-4 space-y-4">
              {/* Court Diagram */}
              <div className="bg-muted/30 rounded-lg p-4 border border-border/50">
                <h4 className="font-medium text-foreground text-sm mb-3 text-center">Court Layout</h4>
                <svg viewBox="0 0 200 120" className="w-full max-w-xs mx-auto">
                  {/* Court background */}
                  <rect x="10" y="10" width="180" height="100" fill="hsl(var(--primary) / 0.1)" stroke="hsl(var(--primary))" strokeWidth="2" rx="2" />
                  
                  {/* Center line (vertical split) */}
                  <line x1="100" y1="10" x2="100" y2="110" stroke="hsl(var(--primary))" strokeWidth="2" />
                  
                  {/* Net line */}
                  <line x1="10" y1="60" x2="190" y2="60" stroke="hsl(var(--foreground) / 0.5)" strokeWidth="1" strokeDasharray="4,2" />
                  
                  {/* Left court - Player A (Team 1) */}
                  <circle cx="55" cy="85" r="8" fill="hsl(var(--primary))" />
                  <text x="55" y="88" textAnchor="middle" fontSize="8" fill="hsl(var(--primary-foreground))" fontWeight="bold">A</text>
                  
                  {/* Left court - Player C (Team 2) */}
                  <circle cx="55" cy="35" r="8" fill="hsl(220 70% 50%)" />
                  <text x="55" y="38" textAnchor="middle" fontSize="8" fill="white" fontWeight="bold">C</text>
                  
                  {/* Right court - Player B (Team 1) */}
                  <circle cx="145" cy="85" r="8" fill="hsl(var(--primary))" />
                  <text x="145" y="88" textAnchor="middle" fontSize="8" fill="hsl(var(--primary-foreground))" fontWeight="bold">B</text>
                  
                  {/* Right court - Player D (Team 2) */}
                  <circle cx="145" cy="35" r="8" fill="hsl(220 70% 50%)" />
                  <text x="145" y="38" textAnchor="middle" fontSize="8" fill="white" fontWeight="bold">D</text>
                  
                  {/* Arrows showing parallel play */}
                  <path d="M55 75 L55 45" stroke="hsl(var(--primary))" strokeWidth="2" markerEnd="url(#arrowhead)" fill="none" />
                  <path d="M145 75 L145 45" stroke="hsl(var(--primary))" strokeWidth="2" markerEnd="url(#arrowhead)" fill="none" />
                  
                  {/* Arrow marker definition */}
                  <defs>
                    <marker id="arrowhead" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                      <polygon points="0 0, 6 3, 0 6" fill="hsl(var(--primary))" />
                    </marker>
                  </defs>
                </svg>
                <div className="flex justify-center gap-6 mt-3 text-xs">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-primary" />
                    <span className="text-muted-foreground">Team 1 (A+B)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full" style={{
                    backgroundColor: 'hsl(220 70% 50%)'
                  }} />
                    <span className="text-muted-foreground">Team 2 (C+D)</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground text-center mt-2 italic">
                  Parallel singles: A vs C, B vs D simultaneously
                </p>
              </div>

              <div className="space-y-3 text-muted-foreground">
                <h4 className="font-medium text-foreground">How It Works</h4>
                <p>
                  The court splits into two mini singles courts. Two singles matches happen 
                  simultaneously—a concept inspired by PwC's famous motto: "Why do one thing 
                  when you can bill for two?"
                </p>
                <p>
                  The moment someone wins their singles point, everything freezes. Now it's 
                  doubles time. The team that won the singles gets to fight for the full point, 
                  while the other team tries to claw it back.
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Win your singles = your team gets the doubles opportunity</li>
                  <li>Lose your singles = hope your partner is better than you</li>
                  <li>First to <strong>9 points</strong> claims victory</li>
                </ul>
              </div>
              
              <div className="bg-amber-500/10 rounded-lg p-4 space-y-2 border border-amber-500/20">
                <h4 className="font-medium text-foreground flex items-center gap-2">
                  <Scroll className="w-4 h-4 text-amber-600" />
                  Historical Note
                </h4>
                <p className="text-sm text-muted-foreground italic">
                  Named by Hampus the Brave, who worked at the actual accounting firm PwC. 
                  Legend has it he proposed the name during a tax audit, forever linking 
                  parallel efficiency with parallel badminton. His manager still doesn't 
                  understand what any of this means.
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
                  <p className="text-sm text-muted-foreground">Organized Chaos</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-4 space-y-4">
              {/* Court Diagram */}
              <div className="bg-muted/30 rounded-lg p-4 border border-border/50">
                <h4 className="font-medium text-foreground text-sm mb-3 text-center">Court Layout</h4>
                <svg viewBox="0 0 200 120" className="w-full max-w-xs mx-auto">
                  {/* Court background */}
                  <rect x="10" y="10" width="180" height="100" fill="hsl(346 77% 50% / 0.1)" stroke="hsl(346 77% 50%)" strokeWidth="2" rx="2" />
                  
                  {/* Center line (vertical split) */}
                  <line x1="100" y1="10" x2="100" y2="110" stroke="hsl(346 77% 50%)" strokeWidth="2" />
                  
                  {/* Net line */}
                  <line x1="10" y1="60" x2="190" y2="60" stroke="hsl(var(--foreground) / 0.5)" strokeWidth="1" strokeDasharray="4,2" />
                  
                  {/* Bottom-left - Player A (Team 1) */}
                  <circle cx="35" cy="85" r="8" fill="hsl(346 77% 50%)" />
                  <text x="35" y="88" textAnchor="middle" fontSize="8" fill="white" fontWeight="bold">A</text>
                  
                  {/* Top-right - Player D (Team 2) - A's opponent */}
                  <circle cx="165" cy="35" r="8" fill="hsl(262 83% 58%)" />
                  <text x="165" y="38" textAnchor="middle" fontSize="8" fill="white" fontWeight="bold">D</text>
                  
                  {/* Bottom-right - Player B (Team 1) */}
                  <circle cx="165" cy="85" r="8" fill="hsl(346 77% 50%)" />
                  <text x="165" y="88" textAnchor="middle" fontSize="8" fill="white" fontWeight="bold">B</text>
                  
                  {/* Top-left - Player C (Team 2) - B's opponent */}
                  <circle cx="35" cy="35" r="8" fill="hsl(262 83% 58%)" />
                  <text x="35" y="38" textAnchor="middle" fontSize="8" fill="white" fontWeight="bold">C</text>
                  
                  {/* Diagonal arrows showing cross-court play */}
                  <path d="M42 78 L158 42" stroke="hsl(346 77% 50%)" strokeWidth="2" markerEnd="url(#arrowhead-shibuya)" fill="none" opacity="0.8" />
                  <path d="M158 78 L42 42" stroke="hsl(262 83% 58%)" strokeWidth="2" markerEnd="url(#arrowhead-shibuya2)" fill="none" opacity="0.8" />
                  
                  {/* Crossing indicator */}
                  <circle cx="100" cy="60" r="6" fill="hsl(var(--foreground) / 0.2)" stroke="hsl(var(--foreground) / 0.5)" strokeWidth="1" />
                  <text x="100" y="63" textAnchor="middle" fontSize="6" fill="hsl(var(--foreground))">X</text>
                  
                  {/* Arrow marker definitions */}
                  <defs>
                    <marker id="arrowhead-shibuya" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                      <polygon points="0 0, 6 3, 0 6" fill="hsl(346 77% 50%)" />
                    </marker>
                    <marker id="arrowhead-shibuya2" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                      <polygon points="0 0, 6 3, 0 6" fill="hsl(262 83% 58%)" />
                    </marker>
                  </defs>
                </svg>
                <div className="flex justify-center gap-6 mt-3 text-xs">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full" style={{
                    backgroundColor: 'hsl(346 77% 50%)'
                  }} />
                    <span className="text-muted-foreground">Team 1 (A+B)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full" style={{
                    backgroundColor: 'hsl(262 83% 58%)'
                  }} />
                    <span className="text-muted-foreground">Team 2 (C+D)</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground text-center mt-2 italic">
                  Diagonal singles: A vs D, B vs C — paths cross at center
                </p>
              </div>

              <div className="space-y-3 text-muted-foreground">
                <h4 className="font-medium text-foreground">How It Works</h4>
                <p>
                  Similar concept to PwC, but now the singles matches are <strong>cross-court</strong>. 
                  You're playing diagonally while someone else is also playing diagonally. 
                  Shuttles cross paths. Confusion ensues. It's beautiful.
                </p>
                <p>
                  Key difference: you need <strong>two points</strong> to earn one team point. 
                  Win your singles, then you still need to win the doubles to secure the point.
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Cross-court singles (paths may intersect)</li>
                  <li>First singles winner triggers doubles phase</li>
                  <li>Two sub-points = one team point</li>
                  <li>First to <strong>9 points</strong> wins</li>
                </ul>
              </div>
              
              <div className="bg-rose-500/10 rounded-lg p-4 space-y-2 border border-rose-500/20">
                <h4 className="font-medium text-foreground flex items-center gap-2">
                  <Scroll className="w-4 h-4 text-rose-600" />
                  The Legend of Kenji the Wanderer
                </h4>
                <p className="text-sm text-muted-foreground italic">
                  In the winter of 2023, a mysterious figure known only as <strong>Kenji</strong> arrived 
                  at the training grounds. He spoke little, but carried with him tales of the legendary 
                  Shibuya Crossing in Tokyo—where 3,000 souls traverse simultaneously without collision.
                </p>
                <p className="text-sm text-muted-foreground italic">
                  "What if," Kenji whispered during the Second Council of Formats, "we played... diagonally?" 
                  The elders laughed. "Impossible!" they cried. "Shuttles will collide! Chaos will reign!" 
                  But Kenji merely smiled and drew an X in the air with his finger.
                </p>
                <p className="text-sm text-muted-foreground italic">
                  Three days later, after 47 test matches and only 12 minor shuttle-related injuries, 
                  the format was perfected. Kenji vanished as mysteriously as he arrived, leaving only 
                  a single feather shuttle and a note: <em>"Trust the crossing."</em>
                </p>
                <p className="text-xs text-rose-600/80 mt-2">
                  Some say he still wanders between courts, appearing whenever players forget to call "crossing."
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
                  <p className="text-sm text-muted-foreground">Zero-Sum Drama</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-4 space-y-4">
              <div className="space-y-3 text-muted-foreground">
                <h4 className="font-medium text-foreground">How It Works</h4>
                <p>
                  Finally, something straightforward. Pure doubles. One shuttle. No phases or transitions.
                </p>
                <p>
                  Both teams start at <strong>5-5</strong>. Win a point, you move up one, 
                  they move down one. Every point you gain is literally taken from your opponents. 
                  It's a tug of war. Hence the name.
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Traditional doubles format</li>
                  <li>Starting score: 5-5</li>
                  <li>Your gain = their loss</li>
                  <li>First to <strong>10</strong> wins</li>
                </ul>
              </div>
              
              <div className="bg-violet-500/10 rounded-lg p-4 space-y-2 border border-violet-500/20">
                <h4 className="font-medium text-foreground flex items-center gap-2">
                  <Scroll className="w-4 h-4 text-violet-600" />
                  The Ancient Origins
                </h4>
                <p className="text-sm text-muted-foreground italic">
                  Archaeological evidence suggests that in 2500 BC, Egyptian pharaohs settled disputes 
                  through ceremonial rope-pulling contests. When <strong>Magnus the Undefeated</strong> 
                  proposed adapting this ancient tradition for badminton in early 2024, scholars initially 
                  dismissed him as "historically confused."
                </p>
                <p className="text-sm text-muted-foreground italic">
                  But Magnus persisted. He spent seventeen sleepless nights studying hieroglyphics, 
                  eventually discovering a tomb painting depicting what he claimed was "clearly a 
                  5-5 starting position." Egyptologists disagree, but the Council was convinced.
                </p>
                <p className="text-sm text-muted-foreground italic">
                  The first official Tug of War match ended 10-0 in just 4 minutes. Magnus won, naturally. 
                  When asked for comment, he simply raised both arms and shouted: <em>"ZERO SUM!"</em>—a 
                  phrase that echoes through the halls to this day.
                </p>
                <p className="text-xs text-violet-600/80 mt-2">
                  Magnus now holds the record for most dramatic Tug of War victories (all of them).
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      {/* Points Breakdown */}
      <Card className="border-primary/30 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            How Points Actually Work
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-muted-foreground font-medium">
            Here's the important part: everyone gets points. Winners get more, but losers don't walk away empty-handed (usually).
          </p>

          <div className="space-y-4">
            <div className="border rounded-lg p-4 bg-card space-y-3">
              <h4 className="font-bold text-foreground">Games 1 & 2: PwC / Shibuya</h4>
              <div className="grid gap-3 text-sm">
                <div className="flex items-start gap-3">
                  <div className="w-20 flex-shrink-0 font-semibold text-green-500">WINNER:</div>
                  <div className="text-muted-foreground">
                    Receives points equal to their final score. Win 9-7? That's <strong>9 points</strong> for you.
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-20 flex-shrink-0 font-semibold text-red-500">LOSER:</div>
                  <div className="text-muted-foreground">
                    Also receives points equal to their score. Lose 7-9? You still take home <strong>7 points</strong>. 
                    Not a win, but not nothing either.
                  </div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground/70 italic">
                This system rewards competitive play—close losses are less painful than blowouts.
              </p>
            </div>

            <div className="border rounded-lg p-4 bg-card space-y-3">
              <h4 className="font-bold text-foreground">Game 3: Tug of War</h4>
              <div className="grid gap-3 text-sm">
                <div className="flex items-start gap-3">
                  <div className="w-20 flex-shrink-0 font-semibold text-green-500">WINNER:</div>
                  <div className="text-muted-foreground">
                    Receives <strong>10 points</strong> (the winning score).
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-20 flex-shrink-0 font-semibold text-red-500">LOSER:</div>
                  <div className="text-muted-foreground">
                    Receives <strong>0 points</strong>. Zero-sum means zero-sum—when the winner reaches 10, 
                    the loser is at 0. It's dramatic. It's intentional.
                  </div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground/70 italic">
                This is why Game 3 matters so much. High risk, high reward.
              </p>
            </div>
          </div>

          <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
            <h4 className="font-bold text-foreground mb-2">Example Session</h4>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>Game 1 (PwC): Your team wins 9-5 → You receive <strong>9 pts</strong></p>
              <p>Game 2 (Shibuya): Your team loses 6-9 → You receive <strong>6 pts</strong></p>
              <p>Game 3 (Tug): Your team wins 10-0 → You receive <strong>10 pts</strong></p>
              <p className="pt-2 font-medium text-foreground">Total: 25 points from 3 games = 8.33 average</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Points Breakdown Example */}
      <Card className="border-primary/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            Detailed Points Breakdown Example
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Using Gerard's performance data to illustrate how points are calculated
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Summary Header */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-muted/50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-primary">30.10</p>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Total Points</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-foreground">4</p>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Games Played</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-4 text-center">
              <div className="flex items-center justify-center gap-1">
                <span className="text-2xl font-bold text-green-500">3</span>
                <span className="text-muted-foreground">-</span>
                <span className="text-2xl font-bold text-red-500">1</span>
              </div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Win/Loss</p>
            </div>
            <div className="bg-primary/10 rounded-lg p-4 text-center border border-primary/20">
              <p className="text-2xl font-bold text-primary">7.53</p>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Avg Points</p>
            </div>
          </div>

          {/* Calculation Logic Cards */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="border rounded-lg p-4 bg-card">
              <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                <Target className="w-4 h-4 text-primary" />
                Scored Games (PwC & Shibuya)
              </h4>
              <div className="bg-muted/30 rounded p-3">
                <code className="text-sm text-primary">Points = (Team Score / Total Score) × 10</code>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Points scale based on performance—closer games mean closer points.
              </p>
            </div>
            <div className="border rounded-lg p-4 bg-card">
              <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                <Scale className="w-4 h-4 text-primary" />
                Win/Loss Games (Tug of War)
              </h4>
              <div className="bg-muted/30 rounded p-3 space-y-1">
                <p className="text-sm"><span className="text-green-500 font-semibold">Winner:</span> <code className="text-primary">10 points</code></p>
                <p className="text-sm"><span className="text-red-500 font-semibold">Loser:</span> <code className="text-primary">5 points</code></p>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Fixed points—win big or lose modestly.
              </p>
            </div>
          </div>

          {/* Breakdown Table */}
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold">Game</TableHead>
                  <TableHead className="font-semibold">Teammate & Opponents</TableHead>
                  <TableHead className="font-semibold text-center">Result</TableHead>
                  <TableHead className="font-semibold text-right">Points</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* Game 1 - PwC Single WIN */}
                <TableRow>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">Game 1</Badge>
                      <span className="text-sm font-medium">PwC Single</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-muted-foreground">
                      <span className="text-foreground">w/ Simon</span>
                      <span className="mx-1">vs</span>
                      <span>Eric & Hampus</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      <span className="font-mono font-bold">9-2</span>
                      <Badge className="bg-green-500/20 text-green-500 border-green-500/30 hover:bg-green-500/30">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        WIN
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div>
                      <span className="font-bold text-primary">8.18</span>
                      <p className="text-xs text-muted-foreground">(9/11) × 10</p>
                    </div>
                  </TableCell>
                </TableRow>

                {/* Game 2 - Shibuya Crossing WIN */}
                <TableRow>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">Game 2</Badge>
                      <span className="text-sm font-medium">Shibuya Crossing</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-muted-foreground">
                      <span className="text-foreground">w/ Simon</span>
                      <span className="mx-1">vs</span>
                      <span>Eric & Hampus</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      <span className="font-mono font-bold">9-4</span>
                      <Badge className="bg-green-500/20 text-green-500 border-green-500/30 hover:bg-green-500/30">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        WIN
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div>
                      <span className="font-bold text-primary">6.92</span>
                      <p className="text-xs text-muted-foreground">(9/13) × 10</p>
                    </div>
                  </TableCell>
                </TableRow>

                {/* Game 3 - Tug of War WIN */}
                <TableRow>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">Game 3</Badge>
                      <span className="text-sm font-medium">Tug of War</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-muted-foreground">
                      <span className="text-foreground">w/ Simon</span>
                      <span className="mx-1">vs</span>
                      <span>Eric & Hampus</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      <span className="font-mono font-bold">—</span>
                      <Badge className="bg-green-500/20 text-green-500 border-green-500/30 hover:bg-green-500/30">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        WIN
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div>
                      <span className="font-bold text-primary">10.00</span>
                      <p className="text-xs text-muted-foreground">Winner → 10</p>
                    </div>
                  </TableCell>
                </TableRow>

                {/* Game 3 - Tug of War LOSS (different session) */}
                <TableRow>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">Game 3</Badge>
                      <span className="text-sm font-medium">Tug of War</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-muted-foreground">
                      <span className="text-foreground">w/ Eric</span>
                      <span className="mx-1">vs</span>
                      <span>Simon & Hampus</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      <span className="font-mono font-bold">—</span>
                      <Badge className="bg-red-500/20 text-red-500 border-red-500/30 hover:bg-red-500/30">
                        <XCircle className="w-3 h-3 mr-1" />
                        LOSS
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div>
                      <span className="font-bold text-primary">5.00</span>
                      <p className="text-xs text-muted-foreground">Loser → 5</p>
                    </div>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>

          {/* Total Summary */}
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Calculation</p>
                <p className="font-mono text-foreground">8.18 + 6.92 + 10.00 + 5.00 = <span className="font-bold text-primary">30.10</span></p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Average Points</p>
                <p className="font-mono text-foreground">30.10 ÷ 4 = <span className="font-bold text-primary text-xl">7.53</span></p>
              </div>
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
              Your ranking is based on <strong>average points per game</strong>—not total points. 
              This prevents anyone from climbing the ranks simply by playing more often.
            </p>
            <p className="font-medium">
              Formula: Total Points ÷ Games Played = Your Ranking Score
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="bg-muted/50 rounded-lg p-4 space-y-3">
              <h4 className="font-medium text-foreground">Why Averages?</h4>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                <li>Quantity doesn't trump quality</li>
                <li>A bad session won't ruin everything</li>
                <li>Rewards consistency over time</li>
                <li>Everyone's on equal footing</li>
              </ul>
            </div>

            <div className="bg-muted/50 rounded-lg p-4 space-y-3">
              <h4 className="font-medium text-foreground">The Modes</h4>
              <div className="text-sm text-muted-foreground space-y-1">
                <p><strong>Combined:</strong> All your games, singles + doubles</p>
                <p><strong>Doubles:</strong> Just your doubles performance</p>
                <p><strong>Singles:</strong> Just your singles performance</p>
                <p className="italic text-xs mt-2">
                  Use these to analyze specific strengths and weaknesses.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 space-y-2">
            <h4 className="font-medium text-foreground flex items-center gap-2">
              <Trophy className="w-4 h-4 text-primary" />
              Summary
            </h4>
            <p className="text-sm text-muted-foreground">
              Win decisively, earn more points. Lose closely, still earn respectable points. 
              Get swept in Tug of War, earn nothing. Over time, your average tells the true story.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Closing */}
      <Card className="bg-gradient-to-br from-amber-500/5 to-transparent border-amber-500/20">
        <CardContent className="py-6 text-center space-y-2">
          <p className="text-muted-foreground italic">
            "In the end, it matters not whether you are noble or peasant—only whether you can clear to the back court."
          </p>
          <p className="text-xs text-muted-foreground">
            — Hampus, probably (2023)
          </p>
        </CardContent>
      </Card>
    </div>;
}
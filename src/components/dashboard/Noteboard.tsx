import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { CrownIcon } from '@/components/icons/CrownIcon';
import { DirtIcon } from '@/components/icons/DirtIcon';
import { Scroll, Send, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Decree } from '@/types/user';
import { toast } from '@/hooks/use-toast';

// Mock data for decrees
const initialDecrees: Decree[] = [
  {
    id: '1',
    author: 'Gerard',
    content: 'Let it be known: The Monday Session shall commence precisely at 19:00. Those who arrive at 19:01 shall be noted in the Book of Tardiness.',
    timestamp: new Date('2024-01-08T14:30:00'),
    isPeasantPlea: false,
  },
  {
    id: '2',
    author: 'Ludvig',
    content: 'Humble plea: Might the Founders consider allowing water breaks between sets? Asking for... myself.',
    timestamp: new Date('2024-01-07T11:20:00'),
    isPeasantPlea: true,
  },
  {
    id: '3',
    author: 'Kockum',
    content: 'The annual restringings shall occur on the winter solstice. All members shall present their rackets for inspection.',
    timestamp: new Date('2024-01-06T16:45:00'),
    isPeasantPlea: false,
  },
  {
    id: '4',
    author: 'Joel',
    content: 'A humble observation: The net height seemed slightly elevated last session. Could this be... intentional?',
    timestamp: new Date('2024-01-05T09:15:00'),
    isPeasantPlea: true,
  },
  {
    id: '5',
    author: 'Viktor',
    content: 'Regarding sauna protocol: Steam shall be generated at 15-minute intervals. This is non-negotiable.',
    timestamp: new Date('2024-01-04T18:00:00'),
    isPeasantPlea: false,
  },
];

export function Noteboard() {
  const { profile } = useAuth();
  const [decrees, setDecrees] = useState<Decree[]>(initialDecrees);
  const [newMessage, setNewMessage] = useState('');
  const [filter, setFilter] = useState<'all' | 'decrees' | 'pleas'>('all');

  const isRoyal = profile?.role === 'royalty';

  const filteredDecrees = decrees.filter(decree => {
    if (filter === 'all') return true;
    if (filter === 'decrees') return !decree.isPeasantPlea;
    return decree.isPeasantPlea;
  });

  const submitMessage = () => {
    if (!newMessage.trim()) return;

    const newDecree: Decree = {
      id: Date.now().toString(),
      author: profile?.name || 'Anonymous',
      content: newMessage,
      timestamp: new Date(),
      isPeasantPlea: !isRoyal,
    };

    setDecrees([newDecree, ...decrees]);
    setNewMessage('');

    toast({
      title: isRoyal ? "Royal Decree Issued" : "Peasant Plea Submitted",
      description: isRoyal 
        ? "Your decree has been proclaimed to all members."
        : "Your plea has been humbly submitted for consideration.",
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <Scroll className="w-12 h-12 text-terra-cotta" />
        </div>
        <h2 className="font-serif text-3xl font-bold text-foreground">
          Royal Decrees & Peasant Pleas
        </h2>
        <p className="text-muted-foreground mt-1 font-serif-body italic">
          The official bulletin board of TKSTL
        </p>
      </div>

      {/* Compose */}
      <div className="bg-card rounded-lg border border-border p-6 shadow-card">
        <div className="flex items-center gap-3 mb-4">
          {isRoyal ? (
            <>
              <CrownIcon className="w-5 h-5 text-gold" />
              <span className="font-semibold text-gold">Issue a Royal Decree</span>
            </>
          ) : (
            <>
              <DirtIcon className="w-5 h-5 text-burlap" />
              <span className="font-semibold text-burlap">Submit a Humble Plea</span>
            </>
          )}
        </div>
        <Textarea
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder={isRoyal 
            ? "Proclaim your royal decree..." 
            : "Humbly submit your plea for consideration..."
          }
          className="min-h-[100px] mb-4"
        />
        <div className="flex justify-end">
          <Button
            onClick={submitMessage}
            variant={isRoyal ? "royal" : "peasant"}
            disabled={!newMessage.trim()}
          >
            <Send className="w-4 h-4 mr-2" />
            {isRoyal ? "Issue Decree" : "Submit Plea"}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('all')}
        >
          All Messages
        </Button>
        <Button
          variant={filter === 'decrees' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('decrees')}
        >
          <CrownIcon className="w-4 h-4 mr-1" />
          Royal Decrees
        </Button>
        <Button
          variant={filter === 'pleas' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('pleas')}
        >
          <DirtIcon className="w-4 h-4 mr-1" />
          Peasant Pleas
        </Button>
      </div>

      {/* Messages */}
      <div className="space-y-4">
        {filteredDecrees.length === 0 ? (
          <div className="bg-card rounded-lg border border-border p-8 text-center">
            <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">No messages in this category.</p>
          </div>
        ) : (
          filteredDecrees.map((decree) => {
            const isDecreeRoyal = !decree.isPeasantPlea;
            
            return (
              <div
                key={decree.id}
                className={cn(
                  "bg-card rounded-lg border p-5 shadow-card",
                  isDecreeRoyal 
                    ? "border-gold/30 bg-gold/5" 
                    : "border-burlap/30"
                )}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center font-serif font-bold",
                      isDecreeRoyal
                        ? "bg-gradient-noble text-foreground"
                        : "bg-gradient-peasant text-foreground"
                    )}>
                      {decree.author[0]}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground">
                          {decree.author}
                        </span>
                        {isDecreeRoyal ? (
                          <CrownIcon className="w-4 h-4 text-gold" />
                        ) : (
                          <DirtIcon className="w-4 h-4 text-burlap" />
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(decree.timestamp)}
                      </span>
                    </div>
                  </div>
                  <span className={cn(
                    "text-xs px-2 py-1 rounded-full",
                    isDecreeRoyal
                      ? "bg-gold/20 text-gold"
                      : "bg-burlap/20 text-burlap"
                  )}>
                    {isDecreeRoyal ? "Royal Decree" : "Peasant Plea"}
                  </span>
                </div>
                <p className={cn(
                  "text-foreground/80 leading-relaxed",
                  isDecreeRoyal && "font-serif-body"
                )}>
                  {decree.content}
                </p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

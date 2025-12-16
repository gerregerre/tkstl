import { useMembers } from '@/contexts/MembersContext';
import { CrownIcon } from '@/components/icons/CrownIcon';
import { ScrollText, Feather } from 'lucide-react';
import { cn } from '@/lib/utils';

export function DutyRoster() {
  const { getCurrentScribe } = useMembers();
  const scribe = getCurrentScribe();

  // Get current week's start date (Monday)
  const getWeekRange = () => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    
    const formatDate = (date: Date) => 
      date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    
    return `${formatDate(monday)} - ${formatDate(sunday)}`;
  };

  return (
    <div className="bg-card rounded-xl border-2 border-gold/30 p-6 shadow-noble">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center">
          <ScrollText className="w-5 h-5 text-gold" />
        </div>
        <div>
          <h2 className="font-serif text-xl font-semibold text-foreground">Duty Roster</h2>
          <p className="text-xs text-muted-foreground">{getWeekRange()}</p>
        </div>
      </div>

      <div className="bg-gradient-noble rounded-lg p-4 border border-gold/20">
        <p className="text-xs text-gold/80 font-medium uppercase tracking-wide mb-2">
          This Week's Royal Scribe
        </p>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gold/20 flex items-center justify-center border-2 border-gold/40">
            <span className="font-serif text-xl font-bold text-gold">
              {scribe.name[0]}
            </span>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-serif text-lg font-bold text-foreground">
                {scribe.name}
              </span>
              <CrownIcon className="w-4 h-4 text-gold" />
            </div>
            <p className="text-xs text-muted-foreground">{scribe.title}</p>
          </div>
          <Feather className="w-6 h-6 text-gold/60" />
        </div>
      </div>

      <p className="text-xs text-muted-foreground mt-3 italic text-center">
        Only the appointed Scribe may chronicle this week's sacred matches.
      </p>
    </div>
  );
}

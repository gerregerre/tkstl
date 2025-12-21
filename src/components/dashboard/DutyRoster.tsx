import { useMembers } from '@/contexts/MembersContext';
import { ScrollText, User } from 'lucide-react';

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
    <div className="bg-card border border-border rounded p-6">
      <div className="flex items-center gap-3 mb-6">
        <ScrollText className="w-5 h-5 text-primary" />
        <h3 className="font-serif text-xl font-semibold text-foreground uppercase tracking-wide">
          Duty Roster
        </h3>
      </div>

      <p className="text-sm text-muted-foreground mb-4">{getWeekRange()}</p>

      <div className="bg-primary rounded p-4">
        <p className="text-xs text-primary-foreground/70 uppercase tracking-wider mb-3">
          This Week's Royal Scribe
        </p>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-primary-foreground/20 flex items-center justify-center">
            <User className="w-7 h-7 text-primary-foreground" />
          </div>
          <div>
            <p className="font-serif text-xl font-bold text-primary-foreground">
              {scribe.name}
            </p>
            <p className="text-sm text-primary-foreground/70">{scribe.title}</p>
          </div>
        </div>
      </div>

      <p className="text-xs text-muted-foreground mt-4 text-center">
        Only the appointed Scribe may chronicle this week's matches.
      </p>
    </div>
  );
}
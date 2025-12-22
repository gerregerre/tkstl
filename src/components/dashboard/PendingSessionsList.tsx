import { useState } from 'react';
import { useMembers, PendingSession } from '@/contexts/MembersContext';
import { VerificationModal } from './VerificationModal';
import { Button } from '@/components/ui/button';
import { CrownIcon } from '@/components/icons/CrownIcon';
import { DirtIcon } from '@/components/icons/DirtIcon';
import { getRoyalty } from '@/data/members';
import {
  Clock,
  AlertTriangle,
  CheckCircle,
  Eye,
  Users,
  Check,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function PendingSessionsList() {
  const { members, pendingSessions } = useMembers();
  const [selectedSession, setSelectedSession] = useState<PendingSession | null>(null);

  const getStatusIcon = (status: PendingSession['status']) => {
    switch (status) {
      case 'pending': return Clock;
      case 'contested': return AlertTriangle;
      case 'finalized': return CheckCircle;
    }
  };

  const getStatusColor = (status: PendingSession['status']) => {
    switch (status) {
      case 'pending': return 'text-gold border-gold/30 bg-gold/10';
      case 'contested': return 'text-destructive border-destructive/30 bg-destructive/10';
      case 'finalized': return 'text-hunter-green border-hunter-green/30 bg-hunter-green/10';
    }
  };

  const getStatusLabel = (status: PendingSession['status']) => {
    switch (status) {
      case 'pending': return 'Awaiting Royal Assent';
      case 'contested': return 'Contested';
      case 'finalized': return 'Finalized';
    }
  };

  const getPlayerName = (id: string) => members.find(m => m.id === id)?.name || id;
  const founders = getRoyalty();

  // Show all non-finalized sessions
  const relevantSessions = pendingSessions.filter(s => s.status !== 'finalized');

  if (relevantSessions.length === 0) {
    return null;
  }

  return (
    <>
      <div className="space-y-4">
        <h3 className="font-serif text-lg font-semibold text-foreground flex items-center gap-2">
          <Clock className="w-5 h-5 text-gold" />
          Pending Royal Assent
        </h3>
        
        {relevantSessions.map(session => {
          const StatusIcon = getStatusIcon(session.status);
          const scribe = members.find(m => m.id === session.scribeId);
          const needsAction = session.status === 'pending';
          
          // Count founder approvals
          const founderApprovals = session.votes.filter(v => 
            founders.some(f => f.id === v.memberId) && v.vote === 'confirm'
          ).length;

          return (
            <div
              key={session.id}
            className={cn(
              "bg-card rounded-lg border-2 p-4 shadow-card transition-all",
              needsAction ? "border-gold" : "border-border",
              session.status === 'contested' && "border-destructive/50"
            )}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1",
                    getStatusColor(session.status)
                  )}>
                    <StatusIcon className="w-3 h-3" />
                    {getStatusLabel(session.status)}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(session.date).toLocaleDateString()}
                  </span>
                </div>
                
                {session.status === 'pending' && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedSession(session)}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </Button>
                )}
              </div>

              {/* Scribe */}
              <div className="flex items-center gap-2 text-sm mb-2">
                <span className="text-muted-foreground">Scribe:</span>
                <CrownIcon className="w-3 h-3 text-gold" />
                <span className="font-medium">{scribe?.name}</span>
              </div>

              {/* Players */}
              <div className="flex items-center gap-2 text-sm mb-3">
                <Users className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">
                  {session.players.map(getPlayerName).join(', ')}
                </span>
              </div>

              {/* Vote Progress */}
              <div className="border-t border-border pt-3">
                <p className="text-xs text-muted-foreground mb-2">Royal Assent Progress</p>
                <div className="flex items-center gap-2">
                  {founders.map(founder => {
                    const vote = session.votes.find(v => v.memberId === founder.id);
                    return (
                      <div
                        key={founder.id}
                        className={cn(
                          "flex items-center gap-1 px-2 py-1 rounded-full text-xs border",
                          vote?.vote === 'confirm' 
                            ? "bg-hunter-green/10 border-hunter-green/30 text-hunter-green"
                            : vote?.vote === 'disagree'
                            ? "bg-destructive/10 border-destructive/30 text-destructive"
                            : "bg-muted/30 border-border text-muted-foreground"
                        )}
                      >
                        {vote?.vote === 'confirm' ? (
                          <Check className="w-3 h-3" />
                        ) : vote?.vote === 'disagree' ? (
                          <X className="w-3 h-3" />
                        ) : (
                          <Clock className="w-3 h-3" />
                        )}
                        {founder.name}
                      </div>
                    );
                  })}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {founderApprovals}/3 Royal Confirmations
                </p>
              </div>

              {/* Peasant votes (shown small) */}
              {session.votes.filter(v => !founders.some(f => f.id === v.memberId)).length > 0 && (
                <div className="mt-2 pt-2 border-t border-border">
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <DirtIcon className="w-3 h-3 text-burlap" />
                    Peasant acknowledgments (ceremonial):
                    {session.votes
                      .filter(v => !founders.some(f => f.id === v.memberId))
                      .map(v => (
                        <span key={v.memberId} className="ml-1 text-burlap">
                          {getPlayerName(v.memberId)} ({v.vote === 'confirm' ? '✓' : '✗'})
                        </span>
                      ))
                    }
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {selectedSession && (
        <VerificationModal
          session={selectedSession}
          isOpen={!!selectedSession}
          onClose={() => setSelectedSession(null)}
        />
      )}
    </>
  );
}

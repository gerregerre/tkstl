import { useState } from 'react';
import { useMembers, PendingSession } from '@/contexts/MembersContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { CrownIcon } from '@/components/icons/CrownIcon';
import { DirtIcon } from '@/components/icons/DirtIcon';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Check, 
  X, 
  Swords, 
  Shuffle, 
  Trophy, 
  Target,
  AlertTriangle,
  ScrollText
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

interface VerificationModalProps {
  session: PendingSession;
  isOpen: boolean;
  onClose: () => void;
}

export function VerificationModal({ session, isOpen, onClose }: VerificationModalProps) {
  const { members, castVote } = useMembers();
  const { profile } = useAuth();
  const [isVoting, setIsVoting] = useState(false);

  if (!profile) return null;

  const isRoyal = profile.role === 'royalty';
  const scribe = members.find(m => m.id === session.scribeId);
  const hasVoted = session.votes.some(v => v.memberId === profile.member_id);
  const userVote = session.votes.find(v => v.memberId === profile.member_id);

  const handleVote = async (vote: 'confirm' | 'disagree') => {
    setIsVoting(true);
    
    // Add artificial delay for dramatic effect
    await new Promise(resolve => setTimeout(resolve, 500));
    
    castVote(session.id, profile.member_id, profile.role, vote);
    
    if (vote === 'confirm') {
      if (isRoyal) {
        toast({
          title: "Royal Confirmation Recorded",
          description: "Your sovereign approval has been sealed in the court records.",
        });
      } else {
        // Peasant confirmed
        toast({
          title: "Good boy.",
          description: "You have done the bare minimum.",
        });
      }
    } else {
      if (isRoyal) {
        toast({
          title: "Royal Objection Lodged",
          description: "The records have been contested. The Scribe must revise.",
          variant: "destructive",
        });
      } else {
        // Peasant disagreed
        toast({
          title: "Objection Noted",
          description: "Your objection has been noted in the trash can.",
        });
      }
    }
    
    setIsVoting(false);
    onClose();
  };

  const getPlayerName = (id: string) => members.find(m => m.id === id)?.name || id;

  const gameIcons = {
    'mini-single': Swords,
    'shibuya': Shuffle,
    'ladder': Trophy,
  };

  const gameLabels = {
    'mini-single': 'Mini-Single',
    'shibuya': 'Shibuya Crossing',
    'ladder': 'Ladder',
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl flex items-center gap-2">
            <ScrollText className="w-6 h-6 text-gold" />
            Verify the Records
          </DialogTitle>
        </DialogHeader>

        {/* Scribe Info */}
        <div className="bg-gold/5 rounded-lg p-3 border border-gold/20 mb-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
            Chronicled by the Royal Scribe
          </p>
          <div className="flex items-center gap-2">
            <CrownIcon className="w-4 h-4 text-gold" />
            <span className="font-serif font-semibold">{scribe?.name}</span>
            <span className="text-xs text-muted-foreground">
              on {new Date(session.date).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Role-based disclaimer */}
        {isRoyal ? (
          <p className="text-sm text-muted-foreground italic border-l-2 border-gold pl-3 mb-4">
            As a Founding Father, verify that these records align with the truth of the court.
          </p>
        ) : (
          <div className="bg-burlap/10 rounded-lg p-3 border border-burlap/30 mb-4">
            <div className="flex items-center gap-2 mb-1">
              <DirtIcon className="w-4 h-4 text-burlap" />
              <span className="text-xs font-semibold text-burlap uppercase">Peasant Notice</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Please sign off below. Note that your signature is purely ceremonial and holds no actual administrative power.
            </p>
          </div>
        )}

        {/* Game Results */}
        <div className="space-y-3 mb-4">
          <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
            Match Results
          </h4>
          {session.games.map((game, idx) => {
            const Icon = gameIcons[game.type];
            return (
              <div key={idx} className="bg-muted/30 rounded-lg p-3 border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <Icon className="w-4 h-4 text-terra-cotta" />
                  <span className="font-medium text-sm">{gameLabels[game.type]}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className={cn(
                    "p-2 rounded border",
                    game.type === 'ladder' 
                      ? game.winner === 'A' ? "border-gold bg-gold/5" : "border-border"
                      : (game.pairAScore || 0) > (game.pairBScore || 0) ? "border-gold bg-gold/5" : "border-border"
                  )}>
                    <p className="text-xs text-muted-foreground">Pair A</p>
                    <p className="font-medium">{game.pairA.map(getPlayerName).join(' & ')}</p>
                    {game.type !== 'ladder' && (
                      <p className="font-bold text-lg">{game.pairAScore}</p>
                    )}
                    {game.type === 'ladder' && game.winner === 'A' && (
                      <Trophy className="w-4 h-4 text-gold mt-1" />
                    )}
                  </div>
                  <div className={cn(
                    "p-2 rounded border",
                    game.type === 'ladder' 
                      ? game.winner === 'B' ? "border-gold bg-gold/5" : "border-border"
                      : (game.pairBScore || 0) > (game.pairAScore || 0) ? "border-gold bg-gold/5" : "border-border"
                  )}>
                    <p className="text-xs text-muted-foreground">Pair B</p>
                    <p className="font-medium">{game.pairB.map(getPlayerName).join(' & ')}</p>
                    {game.type !== 'ladder' && (
                      <p className="font-bold text-lg">{game.pairBScore}</p>
                    )}
                    {game.type === 'ladder' && game.winner === 'B' && (
                      <Trophy className="w-4 h-4 text-gold mt-1" />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Noble Standard */}
        <div className="bg-terra-cotta/10 rounded-lg p-3 border border-terra-cotta/20 mb-6">
          <div className="flex items-center gap-2 mb-1">
            <Target className="w-4 h-4 text-terra-cotta" />
            <span className="text-xs font-semibold text-terra-cotta uppercase">Noble Standard</span>
          </div>
          <p className="font-serif text-3xl font-bold text-foreground">
            {session.nobleStandard.toFixed(2)}
          </p>
        </div>

        {/* Voting Status */}
        {session.status === 'contested' && (
          <div className="bg-destructive/10 rounded-lg p-3 border border-destructive/30 mb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-destructive" />
              <span className="font-semibold text-destructive">Records Contested</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              A Founding Father has challenged these records. The Scribe must revise.
            </p>
          </div>
        )}

        {/* Vote Buttons */}
        {session.status === 'pending' && !hasVoted && (
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1 border-destructive/50 text-destructive hover:bg-destructive/10"
              onClick={() => handleVote('disagree')}
              disabled={isVoting}
            >
              <X className="w-4 h-4 mr-2" />
              Disagree
            </Button>
            <Button
              variant="royal"
              className="flex-1"
              onClick={() => handleVote('confirm')}
              disabled={isVoting}
            >
              <Check className="w-4 h-4 mr-2" />
              Confirm
            </Button>
          </div>
        )}

        {hasVoted && (
          <div className={cn(
            "rounded-lg p-3 text-center",
            userVote?.vote === 'confirm' ? "bg-hunter-green/10 border border-hunter-green/30" : "bg-destructive/10 border border-destructive/30"
          )}>
            <p className="text-sm font-medium">
              You have {userVote?.vote === 'confirm' ? 'confirmed' : 'contested'} these records
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

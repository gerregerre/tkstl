import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types/user';
import { members as initialMembers, getRoyalty } from '@/data/members';

interface GameResult {
  type: 'mini-single' | 'shibuya' | 'ladder';
  pairA: string[];
  pairB: string[];
  pairAScore?: number;
  pairBScore?: number;
  winner?: 'A' | 'B';
}

interface Vote {
  memberId: string;
  vote: 'confirm' | 'disagree';
  timestamp: Date;
}

export interface PendingSession {
  id: string;
  date: Date;
  scribeId: string;
  players: string[];
  games: GameResult[];
  nobleStandard: number;
  status: 'pending' | 'contested' | 'finalized';
  votes: Vote[];
  contestedBy?: string;
}

interface SessionResult {
  id: string;
  date: Date;
  players: string[];
  games: GameResult[];
  nobleStandard: number;
}

interface MembersContextType {
  members: User[];
  sessionHistory: SessionResult[];
  pendingSessions: PendingSession[];
  checkedInPlayers: string[];
  setCheckedInPlayers: (players: string[]) => void;
  getCurrentScribe: () => User;
  submitForAssent: (games: GameResult[], nobleStandard: number, scribeId: string) => void;
  castVote: (sessionId: string, memberId: string, memberRole: 'royalty' | 'peasant', vote: 'confirm' | 'disagree') => void;
  resubmitSession: (sessionId: string, games: GameResult[], nobleStandard: number) => void;
  recordSession: (games: GameResult[], nobleStandard: number) => void;
  updateNobleStandard: (memberId: string, score: number) => void;
  resetStats: () => void;
}

const MembersContext = createContext<MembersContextType | undefined>(undefined);

const STORAGE_KEY = 'tennis-club-members';
const SESSION_HISTORY_KEY = 'tennis-club-sessions';
const CHECKED_IN_KEY = 'tennis-club-checked-in';
const PENDING_SESSIONS_KEY = 'tennis-club-pending-sessions';

// Get the current week's scribe (rotates weekly among founders)
function calculateCurrentScribe(): User {
  const founders = getRoyalty();
  const referenceDate = new Date('2024-01-01'); // A Monday
  const today = new Date();
  const weeksDiff = Math.floor((today.getTime() - referenceDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
  const scribeIndex = weeksDiff % founders.length;
  return founders[scribeIndex];
}

export function MembersProvider({ children }: { children: ReactNode }) {
  const [members, setMembers] = useState<User[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return initialMembers;
      }
    }
    return initialMembers;
  });

  const [sessionHistory, setSessionHistory] = useState<SessionResult[]>(() => {
    const stored = localStorage.getItem(SESSION_HISTORY_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return [];
      }
    }
    return [];
  });

  const [pendingSessions, setPendingSessions] = useState<PendingSession[]>(() => {
    const stored = localStorage.getItem(PENDING_SESSIONS_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return [];
      }
    }
    return [];
  });

  const [checkedInPlayers, setCheckedInPlayers] = useState<string[]>(() => {
    const stored = localStorage.getItem(CHECKED_IN_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return [];
      }
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(members));
  }, [members]);

  useEffect(() => {
    localStorage.setItem(SESSION_HISTORY_KEY, JSON.stringify(sessionHistory));
  }, [sessionHistory]);

  useEffect(() => {
    localStorage.setItem(PENDING_SESSIONS_KEY, JSON.stringify(pendingSessions));
  }, [pendingSessions]);

  useEffect(() => {
    localStorage.setItem(CHECKED_IN_KEY, JSON.stringify(checkedInPlayers));
  }, [checkedInPlayers]);

  const getCurrentScribe = (): User => {
    return calculateCurrentScribe();
  };

  const submitForAssent = (games: GameResult[], nobleStandard: number, scribeId: string) => {
    const newPendingSession: PendingSession = {
      id: crypto.randomUUID(),
      date: new Date(),
      scribeId,
      players: checkedInPlayers,
      games,
      nobleStandard,
      status: 'pending',
      votes: [],
    };

    setPendingSessions(prev => [newPendingSession, ...prev]);
  };

  const castVote = (
    sessionId: string, 
    memberId: string, 
    memberRole: 'royalty' | 'peasant', 
    vote: 'confirm' | 'disagree'
  ) => {
    setPendingSessions(prev => {
      return prev.map(session => {
        if (session.id !== sessionId) return session;
        
        // Check if already voted
        const existingVoteIdx = session.votes.findIndex(v => v.memberId === memberId);
        let updatedVotes = [...session.votes];
        
        if (existingVoteIdx !== -1) {
          updatedVotes[existingVoteIdx] = { memberId, vote, timestamp: new Date() };
        } else {
          updatedVotes.push({ memberId, vote, timestamp: new Date() });
        }

        // If a founder disagrees, immediately contest
        if (memberRole === 'royalty' && vote === 'disagree') {
          return {
            ...session,
            votes: updatedVotes,
            status: 'contested' as const,
            contestedBy: memberId,
          };
        }

        // Check if all founders have confirmed
        const founders = getRoyalty();
        const founderVotes = updatedVotes.filter(v => 
          founders.some(f => f.id === v.memberId)
        );
        const allFoundersConfirmed = founders.every(f => 
          founderVotes.some(v => v.memberId === f.id && v.vote === 'confirm')
        );

        if (allFoundersConfirmed) {
          // Finalize the session - apply stats to leaderboard
          finalizeSession(session, updatedVotes);
          return {
            ...session,
            votes: updatedVotes,
            status: 'finalized' as const,
          };
        }

        return {
          ...session,
          votes: updatedVotes,
        };
      });
    });
  };

  const finalizeSession = (session: PendingSession, votes: Vote[]) => {
    // Apply game results to member stats
    setMembers(prev => {
      const updated = [...prev];
      
      session.games.forEach(game => {
        if (game.type === 'mini-single' || game.type === 'shibuya') {
          const pairAScore = game.pairAScore || 0;
          const pairBScore = game.pairBScore || 0;
          const diff = Math.abs(pairAScore - pairBScore);
          const winnersIds = pairAScore > pairBScore ? game.pairA : game.pairB;
          const losersIds = pairAScore > pairBScore ? game.pairB : game.pairA;
          
          winnersIds.forEach(id => {
            const idx = updated.findIndex(m => m.id === id);
            if (idx !== -1) {
              updated[idx] = {
                ...updated[idx],
                wins: updated[idx].wins + 1,
                pointDifferential: updated[idx].pointDifferential + diff,
              };
            }
          });
          
          losersIds.forEach(id => {
            const idx = updated.findIndex(m => m.id === id);
            if (idx !== -1) {
              updated[idx] = {
                ...updated[idx],
                losses: updated[idx].losses + 1,
                pointDifferential: updated[idx].pointDifferential - diff,
              };
            }
          });
        } else if (game.type === 'ladder') {
          const winnersIds = game.winner === 'A' ? game.pairA : game.pairB;
          const losersIds = game.winner === 'A' ? game.pairB : game.pairA;
          
          winnersIds.forEach(id => {
            const idx = updated.findIndex(m => m.id === id);
            if (idx !== -1) {
              updated[idx] = {
                ...updated[idx],
                wins: updated[idx].wins + 1,
              };
            }
          });
          
          losersIds.forEach(id => {
            const idx = updated.findIndex(m => m.id === id);
            if (idx !== -1) {
              updated[idx] = {
                ...updated[idx],
                losses: updated[idx].losses + 1,
              };
            }
          });
        }
      });

      // Update Noble Standard for all session players
      session.players.forEach(id => {
        const idx = updated.findIndex(m => m.id === id);
        if (idx !== -1) {
          const current = updated[idx].nobleStandard;
          updated[idx] = {
            ...updated[idx],
            nobleStandard: current === 0 ? session.nobleStandard : (current + session.nobleStandard) / 2,
          };
        }
      });

      return updated;
    });

    // Add to session history
    const newSession: SessionResult = {
      id: session.id,
      date: session.date,
      players: session.players,
      games: session.games,
      nobleStandard: session.nobleStandard,
    };

    setSessionHistory(prev => [newSession, ...prev]);
  };

  const resubmitSession = (sessionId: string, games: GameResult[], nobleStandard: number) => {
    setPendingSessions(prev => prev.map(session => {
      if (session.id !== sessionId) return session;
      return {
        ...session,
        games,
        nobleStandard,
        status: 'pending' as const,
        votes: [],
        contestedBy: undefined,
      };
    }));
  };

  const recordSession = (games: GameResult[], nobleStandard: number) => {
    // Legacy function - now redirects to submitForAssent
    const scribe = getCurrentScribe();
    submitForAssent(games, nobleStandard, scribe.id);
  };

  const updateNobleStandard = (memberId: string, score: number) => {
    setMembers(prev => prev.map(member => {
      if (member.id === memberId) {
        return { ...member, nobleStandard: score };
      }
      return member;
    }));
  };

  const resetStats = () => {
    setMembers(initialMembers);
    setSessionHistory([]);
    setPendingSessions([]);
    setCheckedInPlayers([]);
  };

  return (
    <MembersContext.Provider value={{ 
      members, 
      sessionHistory, 
      pendingSessions,
      checkedInPlayers,
      setCheckedInPlayers,
      getCurrentScribe,
      submitForAssent,
      castVote,
      resubmitSession,
      recordSession, 
      updateNobleStandard, 
      resetStats 
    }}>
      {children}
    </MembersContext.Provider>
  );
}

export function useMembers() {
  const context = useContext(MembersContext);
  if (!context) {
    throw new Error('useMembers must be used within a MembersProvider');
  }
  return context;
}

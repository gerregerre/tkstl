import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types/user';
import { members as initialMembers } from '@/data/members';

interface GameResult {
  type: 'mini-single' | 'shibuya' | 'ladder';
  pairA: string[];
  pairB: string[];
  pairAScore?: number;
  pairBScore?: number;
  winner?: 'A' | 'B'; // For ladder (binary result)
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
  checkedInPlayers: string[];
  setCheckedInPlayers: (players: string[]) => void;
  recordSession: (games: GameResult[], nobleStandard: number) => void;
  updateNobleStandard: (memberId: string, score: number) => void;
  resetStats: () => void;
}

const MembersContext = createContext<MembersContextType | undefined>(undefined);

const STORAGE_KEY = 'tennis-club-members';
const SESSION_HISTORY_KEY = 'tennis-club-sessions';
const CHECKED_IN_KEY = 'tennis-club-checked-in';

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
    localStorage.setItem(CHECKED_IN_KEY, JSON.stringify(checkedInPlayers));
  }, [checkedInPlayers]);

  const recordSession = (games: GameResult[], nobleStandard: number) => {
    // Process each game and update member stats
    setMembers(prev => {
      const updated = [...prev];
      
      games.forEach(game => {
        if (game.type === 'mini-single' || game.type === 'shibuya') {
          // Point-based games
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
          // Binary result - win/loss only, no point differential
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

      // Update Noble Standard for all checked-in players
      checkedInPlayers.forEach(id => {
        const idx = updated.findIndex(m => m.id === id);
        if (idx !== -1) {
          // Average the new noble standard with existing (or set if 0)
          const current = updated[idx].nobleStandard;
          updated[idx] = {
            ...updated[idx],
            nobleStandard: current === 0 ? nobleStandard : (current + nobleStandard) / 2,
          };
        }
      });

      return updated;
    });

    const newSession: SessionResult = {
      id: crypto.randomUUID(),
      date: new Date(),
      players: checkedInPlayers,
      games,
      nobleStandard,
    };

    setSessionHistory(prev => [newSession, ...prev]);
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
    setCheckedInPlayers([]);
  };

  return (
    <MembersContext.Provider value={{ 
      members, 
      sessionHistory, 
      checkedInPlayers,
      setCheckedInPlayers,
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

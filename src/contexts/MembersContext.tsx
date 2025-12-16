import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types/user';
import { members as initialMembers } from '@/data/members';

interface MatchResult {
  id: string;
  date: Date;
  winnerId: string;
  loserId: string;
  winnerScore: number;
  loserScore: number;
}

interface MembersContextType {
  members: User[];
  matchHistory: MatchResult[];
  recordMatch: (winnerId: string, loserId: string, winnerScore: number, loserScore: number) => void;
  updateNobleStandard: (memberId: string, score: number) => void;
  resetStats: () => void;
}

const MembersContext = createContext<MembersContextType | undefined>(undefined);

const STORAGE_KEY = 'tennis-club-members';
const MATCH_HISTORY_KEY = 'tennis-club-matches';

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

  const [matchHistory, setMatchHistory] = useState<MatchResult[]>(() => {
    const stored = localStorage.getItem(MATCH_HISTORY_KEY);
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
    localStorage.setItem(MATCH_HISTORY_KEY, JSON.stringify(matchHistory));
  }, [matchHistory]);

  const recordMatch = (winnerId: string, loserId: string, winnerScore: number, loserScore: number) => {
    const pointDiff = winnerScore - loserScore;

    setMembers(prev => prev.map(member => {
      if (member.id === winnerId) {
        return {
          ...member,
          wins: member.wins + 1,
          pointDifferential: member.pointDifferential + pointDiff,
        };
      }
      if (member.id === loserId) {
        return {
          ...member,
          losses: member.losses + 1,
          pointDifferential: member.pointDifferential - pointDiff,
        };
      }
      return member;
    }));

    const newMatch: MatchResult = {
      id: crypto.randomUUID(),
      date: new Date(),
      winnerId,
      loserId,
      winnerScore,
      loserScore,
    };

    setMatchHistory(prev => [newMatch, ...prev]);
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
    setMatchHistory([]);
  };

  return (
    <MembersContext.Provider value={{ members, matchHistory, recordMatch, updateNobleStandard, resetStats }}>
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

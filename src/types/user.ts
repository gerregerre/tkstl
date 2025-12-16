export type UserRole = 'royalty' | 'peasant';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  title: string;
  bio: string;
  wins: number;
  losses: number;
  pointDifferential: number;
  nobleStandard: number;
  avatarUrl?: string;
}

export interface Session {
  id: string;
  date: Date;
  players: string[];
  completed: boolean;
  nobleStandard?: number;
}

export interface NobleRating {
  punctuality: number;
  commitment: number;
  equipment: number;
  humor: number;
  sauna: number;
}

export interface Decree {
  id: string;
  author: string;
  content: string;
  timestamp: Date;
  isPeasantPlea: boolean;
}

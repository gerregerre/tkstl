import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types/user';
import { members } from '@/data/members';

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Simple password for demo - in production this would be proper auth
const PASSWORDS: Record<string, string> = {
  gerard: 'sovereign2017',
  kockum: 'strategist2017',
  viktor: 'velvet2017',
  ludvig: 'peasant123',
  joel: 'peasant123',
  hampus: 'peasant123',
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check for stored session
    const stored = localStorage.getItem('tkstl_user');
    if (stored) {
      const userData = JSON.parse(stored);
      const member = members.find(m => m.id === userData.id);
      if (member) {
        setUser(member);
        setIsAuthenticated(true);
      }
    }
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    const normalizedUsername = username.toLowerCase().trim();
    const member = members.find(m => m.id === normalizedUsername || m.name.toLowerCase() === normalizedUsername);
    
    if (member && PASSWORDS[member.id] === password) {
      setUser(member);
      setIsAuthenticated(true);
      localStorage.setItem('tkstl_user', JSON.stringify({ id: member.id }));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('tkstl_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

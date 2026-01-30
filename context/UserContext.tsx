'use client';

import React, { createContext, useContext, useState } from 'react';
import type { LibraryItem, HistoryItem, ReadingStatus, User } from '@/lib/types';

interface UserContextType {
  user: User | null;
  library: Record<string, LibraryItem>;
  history: HistoryItem[];
  isLoading: boolean;
  login: (username: string, email: string) => void;
  signup: (username: string, email: string) => void;
  logout: () => void;
  addToLibrary: (item: Omit<LibraryItem, 'addedAt'>) => void;
  removeFromLibrary: (mangaId: string) => void;
  updateLibraryStatus: (mangaId: string, status: ReadingStatus) => void;
  addToHistory: (item: Omit<HistoryItem, 'timestamp' | 'page' | 'totalPages'>, page: number, totalPages: number) => void;
  removeFromHistory: (chapterId: string) => void;
  clearHistory: () => void;
  exportData: () => string;
  importData: (jsonData: string) => boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [library, setLibrary] = useState<Record<string, LibraryItem>>({});
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoading] = useState(false);

  const login = (username: string, email: string) => {
    setUser({ username, email });
  };

  const signup = (username: string, email: string) => {
    login(username, email);
  };

  const logout = () => {
    setUser(null);
  };

  const addToLibrary = (item: Omit<LibraryItem, 'addedAt'>) => {
    setLibrary(prev => ({
      ...prev,
      [item.mangaId]: { ...item, addedAt: new Date().toISOString() }
    }));
  };

  const removeFromLibrary = (mangaId: string) => {
    setLibrary(prev => {
      const next = { ...prev };
      delete next[mangaId];
      return next;
    });
  };

  const updateLibraryStatus = (mangaId: string, status: ReadingStatus) => {
    setLibrary(prev => {
      if (!prev[mangaId]) return prev;
      return {
        ...prev,
        [mangaId]: { ...prev[mangaId], status }
      };
    });
  };

  const addToHistory = (item: Omit<HistoryItem, 'timestamp' | 'page' | 'totalPages'>, page: number, totalPages: number) => {
    setHistory(prev => {
      const filtered = prev.filter(h => h.chapterId !== item.chapterId);
      const newEntry: HistoryItem = {
        ...item,
        page,
        totalPages,
        timestamp: new Date().toISOString()
      };
      return [newEntry, ...filtered].slice(0, 100);
    });
  };

  const removeFromHistory = (chapterId: string) => {
    setHistory(prev => prev.filter(h => h.chapterId !== chapterId));
  };

  const clearHistory = () => {
    setHistory([]);
  };

  const exportData = () => JSON.stringify({ library, history });

  const importData = (jsonData: string) => {
    try {
      const data = JSON.parse(jsonData);
      if (data.library) setLibrary(data.library);
      if (data.history) setHistory(data.history);
      return true;
    } catch (e) {
      return false;
    }
  };

  return (
    <UserContext.Provider value={{
      user,
      library,
      history,
      isLoading,
      login,
      signup,
      logout,
      addToLibrary,
      removeFromLibrary,
      updateLibraryStatus,
      addToHistory,
      removeFromHistory,
      clearHistory,
      exportData,
      importData
    }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}

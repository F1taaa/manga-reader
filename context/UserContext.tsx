'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import type { UserData, LibraryItem, HistoryItem, ReadingStatus } from '@/lib/types';

interface UserContextType extends UserData {
  isLoading: boolean;
  login: (username: string, email: string) => void;
  signup: (username: string, email: string) => void;
  logout: () => void;
  addToLibrary: (item: Omit<LibraryItem, 'addedAt'>) => void;
  removeFromLibrary: (mangaId: string) => void;
  updateLibraryStatus: (mangaId: string, status: ReadingStatus) => void;
  addToHistory: (item: Omit<HistoryItem, 'timestamp'>) => void;
  removeFromHistory: (chapterId: string) => void;
  clearHistory: () => void;
  exportData: () => string;
  importData: (jsonData: string) => boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const STORAGE_KEY = 'mangadex_reader_user_data';

const DEFAULT_DATA: UserData = {
  library: {},
  history: [],
  user: null,
};

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<UserData>(DEFAULT_DATA);
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        setData(JSON.parse(savedData));
      } catch (e) {
        console.error('Failed to parse user data', e);
      }
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
  }, [data, mounted]);

  const login = (username: string, email: string) => {
    setData((prev: UserData) => ({ ...prev, user: { username, email } }));
  };

  const signup = (username: string, email: string) => {
    setData((prev: UserData) => ({ ...prev, user: { username, email } }));
  };

  const logout = () => {
    setData((prev: UserData) => ({ ...prev, user: null }));
  };

  const addToLibrary = (item: Omit<LibraryItem, 'addedAt'>) => {
    setData((prev: UserData) => ({
      ...prev,
      library: {
        ...prev.library,
        [item.mangaId]: {
          ...item,
          addedAt: new Date().toISOString(),
        },
      },
    }));
  };

  const removeFromLibrary = (mangaId: string) => {
    setData((prev: UserData) => {
      const newLibrary = { ...prev.library };
      delete newLibrary[mangaId];
      return { ...prev, library: newLibrary };
    });
  };

  const updateLibraryStatus = (mangaId: string, status: ReadingStatus) => {
    setData((prev: UserData) => {
      if (!prev.library[mangaId]) return prev;
      return {
        ...prev,
        library: {
          ...prev.library,
          [mangaId]: {
            ...prev.library[mangaId],
            status,
          },
        },
      };
    });
  };

  const addToHistory = (item: Omit<HistoryItem, 'timestamp'>) => {
    setData((prev: UserData) => {
      // Remove existing entry for this manga+chapter if it exists to move it to top
      const filteredHistory = prev.history.filter(
        (h: HistoryItem) => !(h.mangaId === item.mangaId && h.chapterId === item.chapterId)
      );

      const newHistory = [
        { ...item, timestamp: new Date().toISOString() },
        ...filteredHistory,
      ].slice(0, 100);

      // Also update library item if it exists
      const newLibrary = { ...prev.library };
      if (newLibrary[item.mangaId]) {
        newLibrary[item.mangaId] = {
          ...newLibrary[item.mangaId],
          lastReadAt: new Date().toISOString(),
          lastChapterRead: item.chapterNumber,
        };
      }

      return { ...prev, history: newHistory, library: newLibrary };
    });
  };

  const removeFromHistory = (chapterId: string) => {
    setData((prev: UserData) => ({
      ...prev,
      history: prev.history.filter((h: HistoryItem) => h.chapterId !== chapterId),
    }));
  };

  const clearHistory = () => {
    setData((prev: UserData) => ({ ...prev, history: [] }));
  };

  const exportData = () => {
    return JSON.stringify({ ...data, exportDate: new Date().toISOString() });
  };

  const importData = (jsonData: string) => {
    try {
      const parsed = JSON.parse(jsonData);
      if (parsed.library && Array.isArray(parsed.history)) {
        setData({
          library: parsed.library,
          history: parsed.history,
          user: parsed.user || null,
        });
        return true;
      }
    } catch (e) {
      console.error('Failed to import data', e);
    }
    return false;
  };

  return (
    <UserContext.Provider
      value={{
        ...data,
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
        importData,
      }}
    >
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
'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { UserData, LibraryItem, HistoryItem, ReadingStatus, AppStorage, UserAccount, User } from '@/lib/types';

interface UserContextType extends UserData {
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

const STORAGE_KEY = 'mangadex_reader_app_storage';
const LEGACY_STORAGE_KEY = 'mangadex_reader_user_data';

const DEFAULT_ACCOUNT: UserAccount = {
  user: null,
  library: {},
  history: [],
};

const INITIAL_STORAGE: AppStorage = {
  accounts: {
    guest: DEFAULT_ACCOUNT,
  },
  currentAccountEmail: 'guest',
};

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [storage, setStorage] = useState<AppStorage>(INITIAL_STORAGE);
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    setMounted(true);
    const savedStorage = localStorage.getItem(STORAGE_KEY);
    const legacyData = localStorage.getItem(LEGACY_STORAGE_KEY);

    if (savedStorage) {
      try {
        setStorage(JSON.parse(savedStorage));
      } catch (e) {
        console.error('Failed to parse app storage', e);
      }
    } else if (legacyData) {
      // Migrate legacy data
      try {
        const parsedLegacy = JSON.parse(legacyData);
        const migratedStorage: AppStorage = {
          accounts: {
            guest: {
              user: null,
              library: parsedLegacy.library || {},
              history: parsedLegacy.history || [],
            },
          },
          currentAccountEmail: 'guest',
        };

        // If there was a user in legacy data, create an account for them
        if (parsedLegacy.user?.email) {
          migratedStorage.accounts[parsedLegacy.user.email] = {
            user: parsedLegacy.user,
            library: parsedLegacy.library || {},
            history: parsedLegacy.history || [],
          };
          migratedStorage.currentAccountEmail = parsedLegacy.user.email;
        }

        setStorage(migratedStorage);
        // Clear legacy data after migration
        localStorage.removeItem(LEGACY_STORAGE_KEY);
      } catch (e) {
        console.error('Failed to migrate legacy data', e);
      }
    }
    setIsLoading(false);
  }, []);

  // Save to localStorage whenever storage changes
  useEffect(() => {
    if (mounted) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(storage));
    }
  }, [storage, mounted]);

  // Derived state for the current account
  const currentAccount = storage.accounts[storage.currentAccountEmail] || storage.accounts.guest;

  const login = (username: string, email: string) => {
    setStorage(prev => {
      const existingAccount = prev.accounts[email] || { ...DEFAULT_ACCOUNT, user: { username, email } };
      return {
        ...prev,
        accounts: {
          ...prev.accounts,
          [email]: {
            ...existingAccount,
            user: { username, email },
          }
        },
        currentAccountEmail: email,
      };
    });
  };

  const signup = (username: string, email: string) => {
    login(username, email);
  };

  const logout = () => {
    setStorage(prev => ({
      ...prev,
      currentAccountEmail: 'guest',
    }));
  };

  const addToLibrary = (item: Omit<LibraryItem, 'addedAt'>) => {
    setStorage(prev => {
      const email = prev.currentAccountEmail;
      const account = prev.accounts[email] || DEFAULT_ACCOUNT;
      return {
        ...prev,
        accounts: {
          ...prev.accounts,
          [email]: {
            ...account,
            library: {
              ...account.library,
              [item.mangaId]: {
                ...item,
                addedAt: new Date().toISOString(),
              },
            },
          },
        },
      };
    });
  };

  const removeFromLibrary = (mangaId: string) => {
    setStorage(prev => {
      const email = prev.currentAccountEmail;
      const account = prev.accounts[email] || DEFAULT_ACCOUNT;
      const newLibrary = { ...account.library };
      delete newLibrary[mangaId];
      return {
        ...prev,
        accounts: {
          ...prev.accounts,
          [email]: {
            ...account,
            library: newLibrary,
          },
        },
      };
    });
  };

  const updateLibraryStatus = (mangaId: string, status: ReadingStatus) => {
    setStorage(prev => {
      const email = prev.currentAccountEmail;
      const account = prev.accounts[email] || DEFAULT_ACCOUNT;
      if (!account.library[mangaId]) return prev;
      return {
        ...prev,
        accounts: {
          ...prev.accounts,
          [email]: {
            ...account,
            library: {
              ...account.library,
              [mangaId]: {
                ...account.library[mangaId],
                status,
              },
            },
          },
        },
      };
    });
  };

  const addToHistory = (item: Omit<HistoryItem, 'timestamp' | 'page' | 'totalPages'>, page: number, totalPages: number) => {
    setStorage(prev => {
      const email = prev.currentAccountEmail;
      const account = prev.accounts[email] || DEFAULT_ACCOUNT;

      const filteredHistory = account.history.filter(
        (h: HistoryItem) => !(h.mangaId === item.mangaId && h.chapterId === item.chapterId)
      );

      const newHistoryItem: HistoryItem = {
        ...item,
        page,
        totalPages,
        timestamp: new Date().toISOString(),
      };

      const newHistory = [newHistoryItem, ...filteredHistory].slice(0, 100);

      const newLibrary = { ...account.library };
      if (newLibrary[item.mangaId]) {
        newLibrary[item.mangaId] = {
          ...newLibrary[item.mangaId],
          lastReadAt: new Date().toISOString(),
          lastChapterRead: item.chapterNumber,
        };
      }

      return {
        ...prev,
        accounts: {
          ...prev.accounts,
          [email]: {
            ...account,
            history: newHistory,
            library: newLibrary,
          },
        },
      };
    });
  };

  const removeFromHistory = (chapterId: string) => {
    setStorage(prev => {
      const email = prev.currentAccountEmail;
      const account = prev.accounts[email] || DEFAULT_ACCOUNT;
      return {
        ...prev,
        accounts: {
          ...prev.accounts,
          [email]: {
            ...account,
            history: account.history.filter((h: HistoryItem) => h.chapterId !== chapterId),
          },
        },
      };
    });
  };

  const clearHistory = () => {
    setStorage(prev => {
      const email = prev.currentAccountEmail;
      const account = prev.accounts[email] || DEFAULT_ACCOUNT;
      return {
        ...prev,
        accounts: {
          ...prev.accounts,
          [email]: {
            ...account,
            history: [],
          },
        },
      };
    });
  };

  const exportData = () => {
    return JSON.stringify({ ...currentAccount, exportDate: new Date().toISOString() });
  };

  const importData = (jsonData: string) => {
    try {
      const parsed = JSON.parse(jsonData);
      if (parsed.library && Array.isArray(parsed.history)) {
        setStorage(prev => {
          const email = prev.currentAccountEmail;
          return {
            ...prev,
            accounts: {
              ...prev.accounts,
              [email]: {
                user: parsed.user || prev.accounts[email]?.user || null,
                library: parsed.library,
                history: parsed.history,
              },
            },
          };
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
        ...currentAccount,
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
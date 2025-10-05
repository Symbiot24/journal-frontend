import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  username: string;
}

interface JournalEntry {
  id: string;
  title: string;
  content: string;
  mood: 'happy' | 'sad' | 'angry' | 'anxious' | 'neutral';
  createdAt: string;
  insights?: string[];
  userId?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  entries: JournalEntry[];
  setAuth: (auth: { user: User; token: string }) => void;
  login: (email: string, password: string) => Promise<boolean>;
  register: (username: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  addEntry: (entry: Omit<JournalEntry, 'id'>) => void;
  fetchEntries: () => void;
  updateEntry: (id: string, updates: Partial<Omit<JournalEntry, 'id' | 'userId'>>) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing token on mount
    const savedToken = localStorage.getItem('mindecho_token');
    const savedUser = localStorage.getItem('mindecho_user');
    
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const setAuth = (auth: { user: User; token: string }) => {
    setUser(auth.user);
    setToken(auth.token);
    localStorage.setItem('mindecho_token', auth.token);
    localStorage.setItem('mindecho_user', JSON.stringify(auth.user));
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      // Mock API call - replace with actual API endpoint
      const mockUser = {
        id: '1',
        email,
        username: email.split('@')[0]
      };
      const mockToken = 'mock-jwt-token-' + Date.now();
      
      setUser(mockUser);
      setToken(mockToken);
      localStorage.setItem('mindecho_token', mockToken);
      localStorage.setItem('mindecho_user', JSON.stringify(mockUser));
      
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (username: string, email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      // Mock API call - replace with actual API endpoint
      const mockUser = {
        id: Math.random().toString(36).substr(2, 9),
        email,
        username
      };
      const mockToken = 'mock-jwt-token-' + Date.now();
      
      setUser(mockUser);
      setToken(mockToken);
      localStorage.setItem('mindecho_token', mockToken);
      localStorage.setItem('mindecho_user', JSON.stringify(mockUser));
      
      return true;
    } catch (error) {
      console.error('Registration failed:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setEntries([]);
    localStorage.removeItem('mindecho_token');
    localStorage.removeItem('mindecho_user');
  };

  const addEntry = (entry: Omit<JournalEntry, 'id'>) => {
    const newEntry: JournalEntry = {
      ...entry,
      id: Math.random().toString(36).substr(2, 9),
      userId: entry.userId ?? user?.id,
      // Fallback insights if none provided
      insights: entry.insights ?? [
        'Consider practicing mindfulness for 10 minutes today',
        'Your mood patterns suggest better sleep might help',
        'Try connecting with a friend when feeling anxious',
      ],
      // Ensure createdAt exists
      createdAt: entry.createdAt ?? new Date().toISOString(),
    };
    setEntries((prev) => [newEntry, ...prev]);
  };

  const fetchEntries = async () => {
    const baseUrl = `${import.meta.env.VITE_APP_API_URL}/journal`;
    const url = user?.id ? `${baseUrl}?userId=${encodeURIComponent(user.id)}` : baseUrl;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    const data = await response.json();

    // Normalize server objects so UI consistently uses `id` (not `_id`)
    const normalized: JournalEntry[] = (Array.isArray(data) ? data : []).map((e: any) => ({
      id: e.id ?? e._id ?? e.uuid ?? Math.random().toString(36).substr(2, 9),
      title: e.title,
      content: e.content,
      mood: e.mood,
      createdAt: e.createdAt ?? e.created_at ?? new Date().toISOString(),
      insights: e.insights,
      userId: e.userId ?? e.user_id,
    }));

    // If backend returns all entries, filter client-side by current user as a fallback
    const filtered = user?.id ? normalized.filter((e) => !e.userId || e.userId === user.id) : normalized;
    setEntries(filtered);
  };

  const updateEntry = async (
    id: string,
    updates: Partial<Omit<JournalEntry, 'id' | 'userId'>>
  ) => {
    // Optimistic update
    setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, ...updates } : e)));
    try {
      await fetch(`${import.meta.env.VITE_APP_API_URL}/journal/${encodeURIComponent(id)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(updates),
      });
    } catch (error) {
      // On error, refetch to sync
      console.error('Failed to update entry', error);
      fetchEntries();
    }
  };

  const deleteEntry = async (id: string) => {
    // Optimistic remove
    const previous = entries;
    setEntries((prev) => prev.filter((e) => e.id !== id));
    try {
      await fetch(`${import.meta.env.VITE_APP_API_URL}/journal/${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
    } catch (error) {
      console.error('Failed to delete entry', error);
      // revert
      setEntries(previous);
    }
  };

  const value: AuthContextType = {
    user,
    token,
    entries,
    setAuth,
    login,
    register,
    logout,
    addEntry,
    fetchEntries,
    updateEntry,
    deleteEntry,
    isLoading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
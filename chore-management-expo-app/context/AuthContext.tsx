import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from '@/types';
import { signIn, signUp, signOut, getCurrentUser, getSession } from '@/services/auth';
import { supabase } from '@/services/supabase';

interface AuthContextType {
  user: User | null;
  session: any | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, username: string, role: 'host' | 'tenant') => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Clear any existing session on app start to force re-login
    const clearSession = async () => {
      try {
        // Sign out any existing session
        await supabase.auth.signOut();
      } catch (error) {
        console.error('Error clearing session:', error);
      }
      setSession(null);
      setUser(null);
      setLoading(false);
    };

    clearSession();

    // Listen for auth changes (will only fire after manual login)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      if (session) {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleSignIn = async (email: string, password: string) => {
    const userData = await signIn({ email, password });
    setUser(userData);
  };

  const handleSignUp = async (email: string, password: string, username: string, role: 'host' | 'tenant') => {
    const userData = await signUp({ email, password, username, role });
    setUser(userData);
  };

  const handleSignOut = async () => {
    await signOut();
    setUser(null);
    setSession(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        signIn: handleSignIn,
        signUp: handleSignUp,
        signOut: handleSignOut,
      }}
    >
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


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
      } catch (error: any) {
        // Handle refresh token errors gracefully - these are expected if session is invalid
        if (error?.message?.includes('Invalid Refresh Token') || 
            error?.message?.includes('Refresh Token Not Found')) {
          console.log('Invalid refresh token on startup (expected if logged out), clearing session');
        } else {
          console.error('Error clearing session:', error);
        }
      }
      setSession(null);
      setUser(null);
      setLoading(false);
    };

    clearSession();

    // Listen for auth changes (will only fire after manual login)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session ? 'session exists' : 'no session');
      
      // Handle signed out events
      if (event === 'SIGNED_OUT') {
        setSession(null);
        setUser(null);
        setLoading(false);
        return;
      }

      setSession(session);
      if (session) {
        try {
          const currentUser = await getCurrentUser();
          setUser(currentUser);
        } catch (error: any) {
          console.error('Error getting current user:', error);
          // If there's an auth error (invalid refresh token, etc.), clear the session
          if (error?.message?.includes('Invalid Refresh Token') || 
              error?.message?.includes('Refresh Token Not Found') ||
              error?.message?.includes('JWT')) {
            console.log('Invalid/expired token detected, clearing session');
            try {
              await supabase.auth.signOut();
            } catch (signOutError) {
              // Ignore errors during cleanup - session is already invalid
              console.warn('Error during cleanup sign out (safe to ignore):', signOutError);
            }
            setSession(null);
            setUser(null);
          }
        }
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
    try {
      console.log('AuthContext: Signing out...');
      await signOut();
      setUser(null);
      setSession(null);
      console.log('AuthContext: Sign out complete');
    } catch (error) {
      console.error('AuthContext: Error signing out:', error);
      // Still clear local state even if signOut fails
      setUser(null);
      setSession(null);
      throw error; // Re-throw so calling code can handle it
    }
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

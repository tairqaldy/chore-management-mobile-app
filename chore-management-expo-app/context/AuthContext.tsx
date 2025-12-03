import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from '@/types';
import { signIn, signUp, signOut, getCurrentUser, getSession, isEmailVerified, resendVerificationEmail } from '@/services/auth';
import { supabase } from '@/services/supabase';

interface AuthContextType {
  user: User | null;
  session: any | null;
  loading: boolean;
  emailVerified: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, username: string, role: 'host' | 'tenant') => Promise<void>;
  signOut: () => Promise<void>;
  checkEmailVerification: () => Promise<boolean>;
  resendVerificationEmail: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [emailVerified, setEmailVerified] = useState(false);

  const checkVerificationStatus = async (session: any) => {
    if (session?.user) {
      const verified = await isEmailVerified();
      setEmailVerified(verified);
      return verified;
    }
    setEmailVerified(false);
    return false;
  };

  useEffect(() => {
    // Check for existing session on app start
    const initializeAuth = async () => {
      try {
        const existingSession = await getSession();
        if (existingSession) {
          setSession(existingSession);
          const currentUser = await getCurrentUser();
          setUser(currentUser);
          await checkVerificationStatus(existingSession);
        } else {
          setSession(null);
          setUser(null);
          setEmailVerified(false);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        setSession(null);
        setUser(null);
        setEmailVerified(false);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      if (session) {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
        await checkVerificationStatus(session);
      } else {
        setUser(null);
        setEmailVerified(false);
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
    // Check email verification status after signin
    const session = await getSession();
    if (session) {
      setSession(session);
      await checkVerificationStatus(session);
    }
  };

  const handleSignUp = async (email: string, password: string, username: string, role: 'host' | 'tenant') => {
    const userData = await signUp({ email, password, username, role });
    setUser(userData);
    // Check email verification status after signup
    const session = await getSession();
    if (session) {
      setSession(session);
      await checkVerificationStatus(session);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    setUser(null);
    setSession(null);
    setEmailVerified(false);
  };

  const handleCheckEmailVerification = async (): Promise<boolean> => {
    const verified = await isEmailVerified();
    setEmailVerified(verified);
    if (session) {
      // Refresh the session to get updated user data
      const { data: { session: newSession } } = await supabase.auth.refreshSession();
      if (newSession) {
        setSession(newSession);
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      }
    }
    return verified;
  };

  const handleResendVerificationEmail = async (): Promise<void> => {
    await resendVerificationEmail();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        emailVerified,
        signIn: handleSignIn,
        signUp: handleSignUp,
        signOut: handleSignOut,
        checkEmailVerification: handleCheckEmailVerification,
        resendVerificationEmail: handleResendVerificationEmail,
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


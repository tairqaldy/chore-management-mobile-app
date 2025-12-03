import { supabase } from './supabase';
import { User, UserRole } from '@/types';

export interface SignUpData {
  email: string;
  password: string;
  username: string;
  role: UserRole;
}

export interface SignInData {
  email: string;
  password: string;
}

/**
 * Sign up a new user
 */
export async function signUp(data: SignUpData): Promise<User> {
  const { email, password, username, role } = data;

  // Create auth user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (authError) {
    throw new Error(authError.message);
  }

  if (!authData.user) {
    throw new Error('Failed to create user');
  }

  // Create user profile in users table
  const { data: userData, error: userError } = await supabase
    .from('users')
    .insert({
      id: authData.user.id,
      email,
      username,
      role,
    })
    .select()
    .single();

  if (userError) {
    throw new Error(userError.message);
  }

  return userData;
}

/**
 * Sign in an existing user
 */
export async function signIn(data: SignInData): Promise<User> {
  const { email, password } = data;

  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (authError) {
    throw new Error(authError.message);
  }

  if (!authData.user) {
    throw new Error('Failed to sign in');
  }

  // Fetch user profile
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('id', authData.user.id)
    .single();

  if (userError) {
    throw new Error(userError.message);
  }

  return userData;
}

/**
 * Sign out the current user
 */
export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw new Error(error.message);
  }
}

/**
 * Get the current authenticated user
 */
export async function getCurrentUser(): Promise<User | null> {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: userData, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error || !userData) {
    return null;
  }

  return userData;
}

/**
 * Get the current session
 */
export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

/**
 * Check if the current user's email is verified
 */
export async function isEmailVerified(): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return false;
  }

  // Check if email is confirmed
  return user.email_confirmed_at !== null;
}

/**
 * Resend verification email
 */
export async function resendVerificationEmail(): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user || !user.email) {
    throw new Error('No user found');
  }

  const { error } = await supabase.auth.resend({
    type: 'signup',
    email: user.email,
  });

  if (error) {
    throw new Error(error.message);
  }
}


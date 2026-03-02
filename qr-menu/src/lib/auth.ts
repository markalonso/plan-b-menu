import type { AuthChangeEvent, Session } from '@supabase/supabase-js';
import { isAdmin } from './api/menu';
import { supabase } from './supabase';

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
}

export function onAuthChange(callback: (event: AuthChangeEvent, session: Session | null) => void) {
  const {
    data: { subscription }
  } = supabase.auth.onAuthStateChange(callback);

  return () => subscription.unsubscribe();
}

export async function requireAdmin() {
  const session = await getSession();

  if (!session?.user) {
    throw new Error('Unauthorized: no active session');
  }

  const admin = await isAdmin(session.user.id);

  if (!admin) {
    throw new Error('Forbidden: admin access required');
  }

  return session;
}


export const onAuthStateChange = onAuthChange;

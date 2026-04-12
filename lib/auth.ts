import { supabase, UserProfile, UserRole } from './supabase';

export async function signUp(email: string, password: string, name: string, role: UserRole, phone?: string) {
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (authError) throw authError;

  if (authData.user) {
    const { error: profileError } = await supabase
      .from('user_profiles')
      .insert({
        user_id: authData.user.id,
        name,
        email,
        role,
        phone,
      });

    if (profileError) throw profileError;
  }

  return authData;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function updateUserProfile(userId: string, updates: Partial<UserProfile>) {
  const finalUpdates = { ...updates };
  
  if (finalUpdates.availability === true as any) finalUpdates.availability = 'open';
  else if (finalUpdates.availability === false as any) finalUpdates.availability = 'booked';

  const { data, error } = await supabase
    .from('user_profiles')
    .update(finalUpdates)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function hasRole(userId: string, role: UserRole): Promise<boolean> {
  const profile = await getUserProfile(userId);
  return profile?.role === role;
}

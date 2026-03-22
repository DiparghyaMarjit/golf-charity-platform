import { supabase } from './supabaseClient';
import { User } from '@/types';

/**
 * Get current authenticated user
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    
    if (!authUser) return null;

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUser.id)
      .single();

    if (error) {
      // If there is no profile row yet, create one from auth payload
      if (error.details?.includes('No rows found') || error.message?.includes('No rows')) {
        const fallback = {
          id: authUser.id,
          email: authUser.email ?? '',
          full_name: authUser.user_metadata?.full_name ?? '',
          avatar_url: authUser.user_metadata?.avatar_url ?? '',
          role: 'user',
          selected_charity_id: null,
          charity_contribution_percentage: 10,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        const { data: created, error: createError } = await supabase
          .from('users')
          .insert(fallback)
          .select()
          .single();

        if (createError) {
          console.error('Error creating fallback user profile:', createError);
          return null;
        }

        return created as User;
      }

      console.error('Error fetching user:', error);
      return null;
    }

    return data as User;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

/**
 * Check if user is logged in
 */
export async function isLoggedIn(): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  return !!user;
}

/**
 * Sign up a new user
 */
export async function signUp(
  email: string,
  password: string,
  fullName: string,
  charityId: string,
  charityPercentage: number = 10
): Promise<{ success: boolean; error?: string }> {
  try {
    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      return { success: false, error: authError.message };
    }

    if (!authData.user) {
      return { success: false, error: 'Failed to create user' };
    }

    // Create user profile
    const { error: profileError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email,
        full_name: fullName,
        role: 'user',
        selected_charity_id: charityId,
        charity_contribution_percentage: Math.max(charityPercentage, 10), // Minimum 10%
      });

    if (profileError) {
      return { success: false, error: profileError.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Signup error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Signup failed' 
    };
  }
}

/**
 * Sign in user
 */
export async function signIn(
  email: string,
  password: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Sign in error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Sign in failed',
    };
  }
}

/**
 * Sign out user
 */
export async function signOut(): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Sign out error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Sign out failed',
    };
  }
}

/**
 * Update user profile
 */
export async function updateUserProfile(
  userId: string,
  updates: Partial<User>
): Promise<{ success: boolean; error?: string; user?: User }> {
  try {
    const { data, error } = await supabase
      .from('users')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, user: data as User };
  } catch (error) {
    console.error('Update profile error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Update failed',
    };
  }
}

/**
 * Change user's selected charity
 */
export async function updateSelectedCharity(
  userId: string,
  charityId: string,
  percentage: number = 10
): Promise<{ success: boolean; error?: string }> {
  try {
    if (percentage < 10) {
      return { success: false, error: 'Minimum charity contribution is 10%' };
    }

    const { error } = await supabase
      .from('users')
      .update({
        selected_charity_id: charityId,
        charity_contribution_percentage: percentage,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Update charity error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Update failed',
    };
  }
}

/**
 * Check if user is admin
 */
export async function isAdmin(): Promise<boolean> {
  const user = await getCurrentUser();
  return user?.role === 'admin';
}
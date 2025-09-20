// lib/services/auth.ts
import 'server-only';
import { createSupabaseAdmin } from '@/lib/supabase-server';
import type { AuthUser } from '@/types';

type ProfileRow = {
  id: string;
  email: string | null;
  first_name: string | null;
  surname: string | null;
  user_type: 'athlete' | 'team_manager';
};

export async function signIn(email: string, password: string): Promise<{
  user: AuthUser | null;
  accessToken: string | null;
  error: string | null;
}> {
  try {
    const supabase = createSupabaseAdmin();

    // Server-side: sign in to obtain a session (access token).
    // Caller (API route) should set this token to an httpOnly cookie.
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { user: null, accessToken: null, error: error.message };
    if (!data?.user || !data?.session?.access_token)
      return { user: null, accessToken: null, error: 'Invalid credentials' };

    // Load profile from your public.users table
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single<ProfileRow>();

    if (profileError || !profile) {
      return { user: null, accessToken: null, error: 'User profile not found' };
    }

    const authUser: AuthUser = {
      id: profile.id,
      email: profile.email ?? '',
      firstName: profile.first_name ?? '',
      surname: profile.surname ?? '',
      userType: profile.user_type,
    };

    return { user: authUser, accessToken: data.session.access_token, error: null };
  } catch (e) {
    console.error('signIn error:', e);
    return { user: null, accessToken: null, error: 'Authentication failed' };
  }
}

export async function signUp(userData: {
  email: string;
  password: string;
  firstName: string;
  surname: string;
  userType: 'athlete' | 'team_manager';
  clubId?: string;
  clubRole?: string;
  telephone?: string;
  mobile?: string;
  clubColours?: string;
}): Promise<{ user: AuthUser | null; needsEmailConfirm: boolean; error: string | null }> {
  try {
    const supabase = createSupabaseAdmin();

    // Create auth user (metadata is optional; you may also insert into your users table explicitly)
    const { data, error } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        data: {
          first_name: userData.firstName,
          surname: userData.surname,
          user_type: userData.userType,
          club_id: userData.clubId,
          club_role: userData.clubRole,
          telephone: userData.telephone,
          mobile: userData.mobile,
          club_colours: userData.clubColours,
        },
        // You can set emailRedirectTo if you want a custom confirm link target
      },
    });

    if (error) return { user: null, needsEmailConfirm: false, error: error.message };
    if (!data?.user) return { user: null, needsEmailConfirm: false, error: 'No user created' };

    // If confirmation is required, user won’t be active yet.
    const needsEmailConfirm = !data.user.email_confirmed_at;

    // Option A: Insert a profile row now (admin bypasses RLS), if you’re not using triggers:
    // await supabase.from('users').insert({
    //   id: data.user.id,
    //   email: userData.email,
    //   first_name: userData.firstName,
    //   surname: userData.surname,
    //   user_type: userData.userType,
    //   club_id: userData.clubId ?? null,
    //   club_role: userData.clubRole ?? null,
    //   telephone: userData.telephone ?? null,
    //   mobile: userData.mobile ?? null,
    //   club_colours: userData.clubColours ?? null,
    // });

    const authUser: AuthUser = {
      id: data.user.id,
      email: data.user.email ?? userData.email,
      firstName: userData.firstName,
      surname: userData.surname,
      userType: userData.userType,
    };

    return { user: authUser, needsEmailConfirm, error: null };
  } catch (e) {
    console.error('signUp error:', e);
    return { user: null, needsEmailConfirm: false, error: 'Registration failed' };
  }
}

/**
 * Server-only sign out:
 * There is no client session store on the server. Your API route should just clear the httpOnly cookie.
 * This function exists for symmetry; it does not need to call supabase.auth.signOut().
 */
export async function signOut(): Promise<{ error: string | null }> {
  try {
    // No-op; your /api/auth/logout route should clear the 'sb' cookie.
    return { error: null };
  } catch (e) {
    console.error('signOut error:', e);
    return { error: 'Sign out failed' };
  }
}

/**
 * Resolve the current authenticated user from an ACCESS TOKEN (e.g., from an httpOnly cookie).
 * Do NOT use auth.getSession() on the server; pass the token explicitly.
 */
export async function getUserFromToken(accessToken: string | null): Promise<{
  user: AuthUser | null;
  error: string | null;
}> {
  try {
    if (!accessToken) return { user: null, error: null };

    const supabase = createSupabaseAdmin();
    const { data, error } = await supabase.auth.getUser(accessToken);
    if (error || !data?.user) return { user: null, error: null };

    const userId = data.user.id;

    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single<ProfileRow>();

    if (profileError || !profile) {
      return { user: null, error: 'User profile not found' };
    }

    const authUser: AuthUser = {
      id: profile.id,
      email: profile.email ?? '',
      firstName: profile.first_name ?? '',
      surname: profile.surname ?? '',
      userType: profile.user_type,
    };

    return { user: authUser, error: null };
  } catch (e) {
    console.error('getUserFromToken error:', e);
    return { user: null, error: 'Session check failed' };
  }
}

// lib/services/auth.ts
import 'server-only';
import { createSupabaseAdmin } from '@/lib/supabase-server';
import type { AuthUser } from '@/types';

/** Shape of a row in your public.users table */
type ProfileRow = {
  id: string;
  email: string | null;
  first_name: string | null;
  surname: string | null;
  user_type: 'athlete' | 'team_manager';
  // add any other columns you actually have in `users`
};

/**
 * SIGN IN (server-only)
 * - Authenticates with Supabase
 * - Loads profile from `users`
 * - Returns snake_case `access_token` for your route to set as an httpOnly cookie
 */
export async function signIn(
  email: string,
  password: string
): Promise<{ user: AuthUser | null; access_token: string | null; error: string | null }> {
  try {
    const supabase = createSupabaseAdmin();

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { user: null, access_token: null, error: error.message };
    if (!data?.user || !data.session?.access_token)
      return { user: null, access_token: null, error: 'Invalid credentials' };

    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single<ProfileRow>();

    if (profileError || !profile)
      return { user: null, access_token: null, error: 'User profile not found' };

    const user: AuthUser = {
      id: profile.id,
      email: profile.email ?? '',
      firstName: profile.first_name ?? '',
      surname: profile.surname ?? '',
      userType: profile.user_type,
    };

    return { user, access_token: data.session.access_token, error: null };
  } catch (e) {
    console.error('signIn error:', e);
    return { user: null, access_token: null, error: 'Authentication failed' };
  }
}

/**
 * SIGN UP (server-only)
 * - Creates auth user
 * - Optionally you can insert a row in `users` here if you’re not using DB triggers
 * - Returns `needsEmailConfirm` so the UI can show the right message
 */
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
        // emailRedirectTo: 'https://your-app/confirm' // optional
      },
    });

    if (error) return { user: null, needsEmailConfirm: false, error: error.message };
    if (!data?.user) return { user: null, needsEmailConfirm: false, error: 'No user created' };

    const needsEmailConfirm = !data.user.email_confirmed_at;

    // Optionally insert into your `users` table now if you don’t have a trigger:
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

    const user: AuthUser = {
      id: data.user.id,
      email: data.user.email ?? userData.email,
      firstName: userData.firstName,
      surname: userData.surname,
      userType: userData.userType,
    };

    return { user, needsEmailConfirm, error: null };
  } catch (e) {
    console.error('signUp error:', e);
    return { user: null, needsEmailConfirm: false, error: 'Registration failed' };
  }
}

/**
 * SIGN OUT (server-only)
 * - No client session store; your /api/auth/logout route should clear the httpOnly cookie
 */
export async function signOut(): Promise<{ error: string | null }> {
  try {
    // No-op for server-only flow. Your route clears the 'sb' cookie.
    return { error: null };
  } catch (e) {
    console.error('signOut error:', e);
    return { error: 'Sign out failed' };
  }
}

/**
 * Resolve current user from an ACCESS TOKEN (e.g., from the `sb` httpOnly cookie)
 * - Do NOT call supabase.auth.getSession() server-side; pass the token explicitly
 */
export async function getUserFromToken(
  accessToken: string | null
): Promise<{ user: AuthUser | null; error: string | null }> {
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

    if (profileError || !profile)
      return { user: null, error: 'User profile not found' };

    const user: AuthUser = {
      id: profile.id,
      email: profile.email ?? '',
      firstName: profile.first_name ?? '',
      surname: profile.surname ?? '',
      userType: profile.user_type,
    };

    return { user, error: null };
  } catch (e) {
    console.error('getUserFromToken error:', e);
    return { user: null, error: 'Session check failed' };
  }
}

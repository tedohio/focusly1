'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export type Theme = 'light' | 'dark' | 'system';

export async function getUserTheme(userId: string): Promise<Theme | null> {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('theme')
    .eq('user_id', userId)
    .single();

  if (error) {
    console.error('Error fetching user theme:', error);
    return null;
  }

  return profile?.theme as Theme || 'system';
}

export async function updateUserTheme(userId: string, theme: Theme): Promise<void> {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  const { error } = await supabase
    .from('profiles')
    .update({ theme })
    .eq('user_id', userId);

  if (error) {
    console.error('Error updating user theme:', error);
    throw new Error(`Failed to update theme: ${error.message}`);
  }
}

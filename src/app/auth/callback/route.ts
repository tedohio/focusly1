import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

  if (code) {
    const cookieStore = await cookies();
    // DANGEROUS DANGEROUS DANGEROUS - Critical authentication callback setup
    // This is the most fragile part of the auth flow - handles Supabase magic link authentication
    // Any changes to cookie handling or Supabase auth flow will break user login
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: { [key: string]: any }) {
            cookieStore.set({ name, value, ...options });
          },
          remove(name: string, options: { [key: string]: any }) {
            cookieStore.set({ name, value: '', ...options });
          },
        },
      }
    );

    // DANGEROUS DANGEROUS DANGEROUS - Critical auth code exchange
    // This is where the magic link code gets exchanged for a session
    // If this fails, users cannot log in at all
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error) {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // DANGEROUS DANGEROUS DANGEROUS - Automatic profile creation logic
        // This creates user profiles automatically but could create duplicate profiles
        // if the logic fails or if there are race conditions
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (!profile) {
          await supabase
            .from('profiles')
            .insert({
              user_id: user.id,
              onboarding_completed: false,
              timezone: 'UTC',
            });
        }
      }
    } else {
      console.error('Auth error:', error);
    }
  }

  // URL to redirect to after sign in process completes
  return NextResponse.redirect(`${origin}${next}`);
}

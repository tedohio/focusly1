import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

  // DANGEROUS DANGEROUS DANGEROUS - Critical authentication callback setup
  // This is the most fragile part of the auth flow - handles Supabase magic link authentication
  // Any changes to cookie handling or Supabase auth flow will break user login
  
  console.log('🔍 Auth callback debug:', {
    origin,
    code: code ? 'present' : 'missing',
    next,
    env: {
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'set' : 'missing',
      supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'set' : 'missing',
    }
  });

  if (code) {
    const cookieStore = await cookies();
    // DANGEROUS DANGEROUS DANGEROUS - Critical authentication callback setup
    // This is the most fragile part of the auth flow - handles Supabase magic link authentication
    // Any changes to cookie handling or Supabase auth flow will break user login
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';
    
    const supabase = createServerClient(
      supabaseUrl,
      supabaseAnonKey,
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
      console.log('✅ Auth exchange successful, user:', user ? user.id : 'null');
      
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
          console.log('📝 Creating new profile for user:', user.id);
          await supabase
            .from('profiles')
            .insert({
              user_id: user.id,
              onboarding_completed: false,
              timezone: 'UTC',
            });
        } else {
          console.log('👤 Profile exists for user:', user.id);
        }
      }
    } else {
      console.error('❌ Auth exchange error:', error);
    }
  }

  // Create a proper redirect response with the cookies
  const response = NextResponse.redirect(`${origin}${next}`);
  
  // Ensure all cookies are properly set in the response
  const cookieStore = await cookies();
  cookieStore.getAll().forEach(cookie => {
    response.cookies.set(cookie.name, cookie.value, {
      path: cookie.path,
      domain: cookie.domain,
      secure: cookie.secure,
      httpOnly: cookie.httpOnly,
      sameSite: cookie.sameSite,
      maxAge: cookie.maxAge,
    });
  });

  return response;
}

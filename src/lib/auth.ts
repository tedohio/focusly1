import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function getUser() {
  const cookieStore = await cookies();
  // DANGEROUS DANGEROUS DANGEROUS - Core authentication function used everywhere
  // This is fragile because it's the foundation of all auth checks
  // If this breaks, the entire app becomes inaccessible
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
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      return null;
    }
    
    return user;
  } catch (error) {
    console.error('Error getting user:', error);
    return null;
  }
}

export async function requireAuth() {
  const user = await getUser();
  
  // DANGEROUS DANGEROUS DANGEROUS - Critical auth guard function
  // This function is used in every protected route and action
  // If this logic changes, it could break access control for the entire app
  if (!user) {
    redirect('/login');
  }
  
  return user;
}

export async function getProfile(userId: string) {
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
  
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error) {
      console.error('Error getting profile:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error getting profile:', error);
    return null;
  }
}

export async function createProfile(userId: string) {
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
  
  try {
    const { data, error } = await supabase
      .from('profiles')
      .insert({
        user_id: userId,
        onboarding_completed: false,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating profile:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error creating profile:', error);
    return null;
  }
}

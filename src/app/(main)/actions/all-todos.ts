'use server';

import { createServerClient } from '@supabase/ssr';
import { requireAuth } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function getTodos() {
  const user = await requireAuth();
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
  
  const { data: todos, error } = await supabase
    .from('todos')
    .select('*')
    .eq('user_id', user.id)
    .order('for_date', { ascending: false })
    .order('order', { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch todos: ${error.message}`);
  }
  return todos || [];
}

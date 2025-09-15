'use server';

import { createServerClient } from '@supabase/ssr';
import { requireAuth, getProfile } from '@/lib/auth';
import { reflectionSchema } from '@/lib/validators';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { getCurrentDateInTimezone } from '@/lib/timezone';

export async function getReflections() {
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
  
  const { data: reflections, error } = await supabase
    .from('reflections')
    .select('*')
    .eq('user_id', user.id)
    .order('for_date', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch reflections: ${error.message}`);
  }
  
  // Map database field names (snake_case) to frontend field names (camelCase)
  return (reflections || []).map(reflection => ({
    id: reflection.id,
    userId: reflection.user_id,
    whatWentWell: reflection.what_went_well,
    whatDidntGoWell: reflection.what_didnt_go_well,
    improvements: reflection.improvements,
    forDate: reflection.for_date,
    isMonthly: reflection.is_monthly,
    createdAt: reflection.created_at,
    updatedAt: reflection.updated_at,
  }));
}

export async function getReflection(forDate: string) {
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
  
  const { data: reflection, error } = await supabase
    .from('reflections')
    .select('*')
    .eq('user_id', user.id)
    .eq('for_date', forDate)
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
    throw new Error(`Failed to fetch reflection: ${error.message}`);
  }
  
  // Map database field names (snake_case) to frontend field names (camelCase)
  if (reflection) {
    return {
      id: reflection.id,
      userId: reflection.user_id,
      whatWentWell: reflection.what_went_well,
      whatDidntGoWell: reflection.what_didnt_go_well,
      improvements: reflection.improvements,
      forDate: reflection.for_date,
      isMonthly: reflection.is_monthly,
      createdAt: reflection.created_at,
      updatedAt: reflection.updated_at,
    };
  }
  
  return null;
}

export async function createReflection(data: {
  whatWentWell?: string;
  whatDidntGoWell?: string;
  improvements?: string;
  forDate?: string; // Make optional, will use current date in user's timezone if not provided
  isMonthly?: boolean;
}) {
  const user = await requireAuth();
  const profile = await getProfile(user.id);
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
  
  // DANGEROUS DANGEROUS DANGEROUS - Critical timezone-aware date handling
  // If this is wrong, reflections will be created for the wrong date
  const forDate = data.forDate || getCurrentDateInTimezone(profile?.timezone || 'UTC');
  
  const validatedData = reflectionSchema.parse({ ...data, forDate });

  // Check if reflection already exists for this date
  const existing = await getReflection(forDate);
  
  if (existing) {
    // Update existing reflection
    const { data: updatedReflection, error } = await supabase
      .from('reflections')
      .update({
        what_went_well: validatedData.whatWentWell, // camelCase -> snake_case
        what_didnt_go_well: validatedData.whatDidntGoWell, // camelCase -> snake_case
        improvements: validatedData.improvements,
        is_monthly: validatedData.isMonthly, // camelCase -> snake_case
        updated_at: new Date(),
      })
      .eq('id', existing.id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update reflection: ${error.message}`);
    }

    revalidatePath('/history');
    revalidatePath('/actions');
    return updatedReflection;
  } else {
    // Create new reflection
    const { data: newReflection, error } = await supabase
      .from('reflections')
      .insert({
        what_went_well: validatedData.whatWentWell, // camelCase -> snake_case
        what_didnt_go_well: validatedData.whatDidntGoWell, // camelCase -> snake_case
        improvements: validatedData.improvements,
        for_date: validatedData.forDate, // camelCase -> snake_case
        is_monthly: validatedData.isMonthly, // camelCase -> snake_case
        user_id: user.id, // camelCase -> snake_case
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create reflection: ${error.message}`);
    }

    revalidatePath('/history');
    revalidatePath('/actions');
    return newReflection;
  }
}

export async function updateReflection(id: string, data: Partial<{
  whatWentWell: string;
  whatDidntGoWell: string;
  improvements: string;
}>) {
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
  
  const updateData: any = {
    updated_at: new Date(),
  };
  
  if (data.whatWentWell !== undefined) updateData.what_went_well = data.whatWentWell; // camelCase -> snake_case
  if (data.whatDidntGoWell !== undefined) updateData.what_didnt_go_well = data.whatDidntGoWell; // camelCase -> snake_case
  if (data.improvements !== undefined) updateData.improvements = data.improvements;

  const { data: updatedReflection, error } = await supabase
    .from('reflections')
    .update(updateData)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update reflection: ${error.message}`);
  }

  revalidatePath('/history');
  revalidatePath('/actions');
  return updatedReflection;
}

export async function deleteReflection(id: string) {
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
  
  const { error } = await supabase
    .from('reflections')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    throw new Error(`Failed to delete reflection: ${error.message}`);
  }

  revalidatePath('/history');
  revalidatePath('/actions');
}

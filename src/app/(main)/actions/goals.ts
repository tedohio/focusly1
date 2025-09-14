'use server';

import { db } from '@/db/drizzle';
import { longTermGoals, focusAreas, monthlyGoals } from '@/db/schema';
import { requireAuth } from '@/lib/auth';
import { longTermGoalSchema, focusAreaSchema, monthlyGoalSchema } from '@/lib/validators';
import { eq, and, desc } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// Long-term Goals
export async function getLongTermGoals() {
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
        set(name: string, value: string, options: { [key: string]: any }) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: { [key: string]: any }) {
          cookieStore.set({ name, value: '', ...options });
        },
      },
    }
  );
  
  const { data: goals, error } = await supabase
    .from('long_term_goals')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch long-term goals: ${error.message}`);
  }

  return goals || [];
}

export async function createLongTermGoal(data: {
  title: string;
  description?: string;
  targetYears: number;
}) {
  const user = await requireAuth();
  
  const validatedData = longTermGoalSchema.parse(data);
  const cookieStore = await cookies();
  // DANGEROUS DANGEROUS DANGEROUS - Complex Supabase client setup with cookie handling
  // This is fragile because it manually constructs the server client with cookie access
  // Any changes to Supabase auth flow or cookie structure will break this
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

  // Delete existing long-term goal (enforce 1 per user)
  await supabase
    .from('long_term_goals')
    .delete()
    .eq('user_id', user.id);

  // DANGEROUS DANGEROUS DANGEROUS - Critical field mapping from camelCase to snake_case
  // This mapping is fragile and must match exactly with database schema
  // If database column names change, this will break silently
  const { data: newGoal, error } = await supabase
    .from('long_term_goals')
    .insert({
      title: validatedData.title,
      description: validatedData.description,
      target_years: validatedData.targetYears, // camelCase -> snake_case mapping
      user_id: user.id,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create long-term goal: ${error.message}`);
  }

  revalidatePath('/goals');
  revalidatePath('/');
  return newGoal;
}

export async function updateLongTermGoal(id: string, data: Partial<{
  title: string;
  description: string;
  targetYears: number;
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
        set(name: string, value: string, options: { [key: string]: any }) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: { [key: string]: any }) {
          cookieStore.set({ name, value: '', ...options });
        },
      },
    }
  );
  
  // Map camelCase to snake_case for database
  const updateData: any = {
    updated_at: new Date(),
  };
  
  if (data.title !== undefined) updateData.title = data.title;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.targetYears !== undefined) updateData.target_years = data.targetYears;

  const { data: updatedGoal, error } = await supabase
    .from('long_term_goals')
    .update(updateData)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update long-term goal: ${error.message}`);
  }

  revalidatePath('/goals');
  revalidatePath('/');
  return updatedGoal;
}

// Focus Areas
export async function getFocusAreas() {
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
        set(name: string, value: string, options: { [key: string]: any }) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: { [key: string]: any }) {
          cookieStore.set({ name, value: '', ...options });
        },
      },
    }
  );
  
  const { data: areas, error } = await supabase
    .from('focus_areas')
    .select('*')
    .eq('user_id', user.id)
    .order('order', { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch focus areas: ${error.message}`);
  }

  return areas || [];
}

export async function createFocusAreas(data: Array<{
  title: string;
  description?: string;
  order: number;
}>) {
  const user = await requireAuth();
  
  // Validate all focus areas
  const validatedData = data.map(item => focusAreaSchema.parse(item));
  const cookieStore = await cookies();
  // DANGEROUS DANGEROUS DANGEROUS - Critical Supabase client setup for focus areas
  // This must match the exact pattern used in createLongTermGoal for RLS to work
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

  // Debug: Check if user is properly authenticated
  const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
  if (authError || !authUser) {
    throw new Error(`Authentication failed: ${authError?.message || 'No user found'}`);
  }
  if (authUser.id !== user.id) {
    throw new Error(`User ID mismatch: auth=${authUser.id}, expected=${user.id}`);
  }

  // Delete existing focus areas
  const { error: deleteError } = await supabase
    .from('focus_areas')
    .delete()
    .eq('user_id', user.id);

  if (deleteError) {
    throw new Error(`Failed to delete existing focus areas: ${deleteError.message}`);
  }

  // DANGEROUS DANGEROUS DANGEROUS - Complex array mapping with field transformation
  // This is fragile because it maps over validated data and transforms field names
  // Any changes to the data structure or validation schema will break this
  const insertData = validatedData.map(item => ({
    title: item.title,
    description: item.description,
    order: item.order,
    user_id: user.id, // camelCase -> snake_case mapping
  }));

  console.log('Debug - Insert data:', JSON.stringify(insertData, null, 2));
  console.log('Debug - User ID:', user.id);
  console.log('Debug - Auth User ID:', authUser.id);

  // Test: Try to insert just one record first
  const testData = insertData[0];
  console.log('Debug - Testing single insert:', JSON.stringify(testData, null, 2));

  const { data: newAreas, error } = await supabase
    .from('focus_areas')
    .insert([testData])
    .select();

  if (error) {
    throw new Error(`Failed to create focus areas: ${error.message}`);
  }

  revalidatePath('/goals');
  revalidatePath('/');
  return newAreas || [];
}

export async function updateFocusArea(id: string, data: Partial<{
  title: string;
  description: string;
  order: number;
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
        set(name: string, value: string, options: { [key: string]: any }) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: { [key: string]: any }) {
          cookieStore.set({ name, value: '', ...options });
        },
      },
    }
  );
  
  const updateData: any = {
    updated_at: new Date(),
  };
  
  if (data.title !== undefined) updateData.title = data.title;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.order !== undefined) updateData.order = data.order;

  const { data: updatedArea, error } = await supabase
    .from('focus_areas')
    .update(updateData)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update focus area: ${error.message}`);
  }

  revalidatePath('/goals');
  revalidatePath('/');
  return updatedArea;
}

export async function deleteFocusArea(id: string) {
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
        set(name: string, value: string, options: { [key: string]: any }) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: { [key: string]: any }) {
          cookieStore.set({ name, value: '', ...options });
        },
      },
    }
  );
  
  const { error } = await supabase
    .from('focus_areas')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    throw new Error(`Failed to delete focus area: ${error.message}`);
  }

  revalidatePath('/goals');
  revalidatePath('/');
}

// Monthly Goals
export async function getMonthlyGoals() {
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
        set(name: string, value: string, options: { [key: string]: any }) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: { [key: string]: any }) {
          cookieStore.set({ name, value: '', ...options });
        },
      },
    }
  );
  
  const { data: goals, error } = await supabase
    .from('monthly_goals')
    .select('*')
    .eq('user_id', user.id)
    .order('year', { ascending: false })
    .order('month', { ascending: false })
    .order('order', { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch monthly goals: ${error.message}`);
  }
  return goals || [];
}

export async function createMonthlyGoals(data: Array<{
  title: string;
  month: number;
  year: number;
  order: number;
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
        set(name: string, value: string, options: { [key: string]: any }) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: { [key: string]: any }) {
          cookieStore.set({ name, value: '', ...options });
        },
      },
    }
  );
  
  // Validate all monthly goals
  const validatedData = data.map(item => monthlyGoalSchema.parse(item));

  // Delete existing monthly goals for this month/year
  const firstGoal = validatedData[0];
  if (firstGoal) {
    const { error: deleteError } = await supabase
      .from('monthly_goals')
      .delete()
      .eq('user_id', user.id)
      .eq('month', firstGoal.month)
      .eq('year', firstGoal.year);
      
    if (deleteError) {
      throw new Error(`Failed to delete existing monthly goals: ${deleteError.message}`);
    }
  }

  // DANGEROUS DANGEROUS DANGEROUS - Complex array mapping for monthly goals
  const { data: newGoals, error } = await supabase
    .from('monthly_goals')
    .insert(validatedData.map(item => ({
      title: item.title,
      month: item.month,
      year: item.year,
      order: item.order,
      status: 'active',
      user_id: user.id, // camelCase -> snake_case
    })))
    .select();

  if (error) {
    throw new Error(`Failed to create monthly goals: ${error.message}`);
  }

  revalidatePath('/goals');
  revalidatePath('/');
  return newGoals || [];
}

export async function updateMonthlyGoal(id: string, data: Partial<{
  title: string;
  order: number;
  status: 'active' | 'done' | 'dropped';
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
        set(name: string, value: string, options: { [key: string]: any }) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: { [key: string]: any }) {
          cookieStore.set({ name, value: '', ...options });
        },
      },
    }
  );
  
  const updateData: any = {
    updated_at: new Date(),
  };
  
  if (data.title !== undefined) updateData.title = data.title;
  if (data.order !== undefined) updateData.order = data.order;
  if (data.status !== undefined) updateData.status = data.status;

  const { data: updatedGoal, error } = await supabase
    .from('monthly_goals')
    .update(updateData)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update monthly goal: ${error.message}`);
  }

  revalidatePath('/goals');
  revalidatePath('/');
  return updatedGoal;
}

export async function deleteMonthlyGoal(id: string) {
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
        set(name: string, value: string, options: { [key: string]: any }) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: { [key: string]: any }) {
          cookieStore.set({ name, value: '', ...options });
        },
      },
    }
  );
  
  const { error } = await supabase
    .from('monthly_goals')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    throw new Error(`Failed to delete monthly goal: ${error.message}`);
  }

  revalidatePath('/goals');
  revalidatePath('/');
}

export async function reorderMonthlyGoals(goalIds: string[]) {
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
        set(name: string, value: string, options: { [key: string]: any }) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: { [key: string]: any }) {
          cookieStore.set({ name, value: '', ...options });
        },
      },
    }
  );
  
  // Update order for each goal
  for (let i = 0; i < goalIds.length; i++) {
    const { error } = await supabase
      .from('monthly_goals')
      .update({
        order: (i + 1) * 100,
        updated_at: new Date(),
      })
      .eq('id', goalIds[i])
      .eq('user_id', user.id);
      
    if (error) {
      throw new Error(`Failed to reorder monthly goal: ${error.message}`);
    }
  }

  revalidatePath('/goals');
  revalidatePath('/');
}

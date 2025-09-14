'use server';

import { createServerClient } from '@supabase/ssr';
import { requireAuth } from '@/lib/auth';
import { profileSchema } from '@/lib/validators';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

export async function getProfile() {
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
  
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
    throw new Error(`Failed to fetch profile: ${error.message}`);
  }
  
  if (!profile) return null;
  
  // DANGEROUS DANGEROUS DANGEROUS - Critical field mapping for profile data
  // This maps database snake_case fields to camelCase for frontend consumption
  // If this mapping is wrong, onboarding completion detection will fail
  return {
    ...profile,
    onboardingCompleted: profile.onboarding_completed,
    lastMonthlyReviewAt: profile.last_monthly_review_at,
    createdAt: profile.created_at,
    updatedAt: profile.updated_at,
  };
}

export async function updateProfile(data: Partial<{
  onboardingCompleted: boolean;
  lastMonthlyReviewAt: string;
  timezone: string;
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
  
  const validatedData = profileSchema.parse(data);

  const updateData: any = {
    updated_at: new Date(),
  };
  
  if (data.onboardingCompleted !== undefined) updateData.onboarding_completed = data.onboardingCompleted; // camelCase -> snake_case
  if (data.lastMonthlyReviewAt !== undefined) updateData.last_monthly_review_at = data.lastMonthlyReviewAt; // camelCase -> snake_case
  if (data.timezone !== undefined) updateData.timezone = data.timezone;

  const { data: updatedProfile, error } = await supabase
    .from('profiles')
    .update(updateData)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update profile: ${error.message}`);
  }

  revalidatePath('/');
  revalidatePath('/settings');
  
  // DANGEROUS DANGEROUS DANGEROUS - Critical field mapping for updated profile
  // This maps database snake_case fields to camelCase for frontend consumption
  // If this mapping is wrong, onboarding completion detection will fail
  return {
    ...updatedProfile,
    onboardingCompleted: updatedProfile.onboarding_completed,
    lastMonthlyReviewAt: updatedProfile.last_monthly_review_at,
    createdAt: updatedProfile.created_at,
    updatedAt: updatedProfile.updated_at,
  };
}

export async function completeOnboarding() {
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
  
  const { data: updatedProfile, error } = await supabase
    .from('profiles')
    .update({
      onboarding_completed: true, // camelCase -> snake_case
      updated_at: new Date(),
    })
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to complete onboarding: ${error.message}`);
  }

  revalidatePath('/');
  revalidatePath('/onboarding');
  
  // DANGEROUS DANGEROUS DANGEROUS - Critical field mapping for completed onboarding
  // This maps database snake_case fields to camelCase for frontend consumption
  // If this mapping is wrong, onboarding completion detection will fail
  return {
    ...updatedProfile,
    onboardingCompleted: updatedProfile.onboarding_completed,
    lastMonthlyReviewAt: updatedProfile.last_monthly_review_at,
    createdAt: updatedProfile.created_at,
    updatedAt: updatedProfile.updated_at,
  };
}

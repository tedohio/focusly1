'use server';

import { createServerClient } from '@supabase/ssr';
import { requireAuth } from '@/lib/auth';
import { noteSchema } from '@/lib/validators';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

export async function getNotes() {
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
  
  const { data: notes, error } = await supabase
    .from('notes')
    .select('*')
    .eq('user_id', user.id)
    .order('for_date', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch notes: ${error.message}`);
  }
  return notes || [];
}

export async function getNote(forDate: string) {
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
  
  const { data: note, error } = await supabase
    .from('notes')
    .select('*')
    .eq('user_id', user.id)
    .eq('for_date', forDate)
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
    throw new Error(`Failed to fetch note: ${error.message}`);
  }
  return note || null;
}

export async function createNote(data: {
  content: string;
  forDate: string;
}) {
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
  
  const validatedData = noteSchema.parse(data);

  // Check if note already exists for this date
  const existing = await getNote(data.forDate);
  
  if (existing) {
    // Update existing note
    const { data: updatedNote, error } = await supabase
      .from('notes')
      .update({
        content: validatedData.content,
        updated_at: new Date(),
      })
      .eq('id', existing.id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update note: ${error.message}`);
    }

    revalidatePath('/history');
    revalidatePath('/actions');
    return updatedNote;
  } else {
    // Create new note
    const { data: newNote, error } = await supabase
      .from('notes')
      .insert({
        content: validatedData.content,
        for_date: validatedData.forDate, // camelCase -> snake_case
        user_id: user.id, // camelCase -> snake_case
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create note: ${error.message}`);
    }

    revalidatePath('/history');
    revalidatePath('/actions');
    return newNote;
  }
}

export async function updateNote(id: string, data: Partial<{
  content: string;
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
  
  if (data.content !== undefined) updateData.content = data.content;

  const { data: updatedNote, error } = await supabase
    .from('notes')
    .update(updateData)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update note: ${error.message}`);
  }

  revalidatePath('/history');
  revalidatePath('/actions');
  return updatedNote;
}

export async function deleteNote(id: string) {
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
    .from('notes')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    throw new Error(`Failed to delete note: ${error.message}`);
  }

  revalidatePath('/history');
  revalidatePath('/actions');
}

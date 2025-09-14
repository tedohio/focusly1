'use server';

import { createServerClient } from '@supabase/ssr';
import { requireAuth } from '@/lib/auth';
import { todoSchema } from '@/lib/validators';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

export async function getTodos(forDate: string) {
  const user = await requireAuth();
  const cookieStore = await cookies();
  // DANGEROUS DANGEROUS DANGEROUS - Supabase client setup for todos
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
    .eq('for_date', forDate)
    .order('order', { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch todos: ${error.message}`);
  }
  return todos || [];
}

export async function createTodo(data: {
  title: string;
  forDate: string;
  dueDate?: string;
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
  
  const validatedData = todoSchema.parse({
    ...data,
    order: 0, // Will be updated after getting max order
    done: false,
  });

  // Get the highest order for this date
  const { data: maxOrderResult, error: maxOrderError } = await supabase
    .from('todos')
    .select('order')
    .eq('user_id', user.id)
    .eq('for_date', data.forDate)
    .order('order', { ascending: false })
    .limit(1);

  if (maxOrderError) {
    throw new Error(`Failed to get max order: ${maxOrderError.message}`);
  }

  const newOrder = (maxOrderResult[0]?.order || 0) + 100;

  // DANGEROUS DANGEROUS DANGEROUS - Critical field mapping for todos
  const { data: newTodo, error } = await supabase
    .from('todos')
    .insert({
      title: validatedData.title,
      for_date: validatedData.forDate, // camelCase -> snake_case
      due_date: validatedData.dueDate, // camelCase -> snake_case
      order: newOrder,
      done: validatedData.done,
      user_id: user.id, // camelCase -> snake_case
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create todo: ${error.message}`);
  }

  revalidatePath('/');
  return newTodo;
}

export async function updateTodo(id: string, data: Partial<{
  title: string;
  done: boolean;
  dueDate: string;
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
  
  if (data.title !== undefined) updateData.title = data.title;
  if (data.done !== undefined) updateData.done = data.done;
  if (data.dueDate !== undefined) updateData.due_date = data.dueDate; // camelCase -> snake_case

  const { data: updatedTodo, error } = await supabase
    .from('todos')
    .update(updateData)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update todo: ${error.message}`);
  }

  revalidatePath('/');
  return updatedTodo;
}

export async function deleteTodo(id: string) {
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
    .from('todos')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    throw new Error(`Failed to delete todo: ${error.message}`);
  }

  revalidatePath('/');
}

export async function reorderTodos(todoIds: string[]) {
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
  
  // Update order for each todo
  for (let i = 0; i < todoIds.length; i++) {
    const { error } = await supabase
      .from('todos')
      .update({
        order: (i + 1) * 100,
        updated_at: new Date(),
      })
      .eq('id', todoIds[i])
      .eq('user_id', user.id);
      
    if (error) {
      throw new Error(`Failed to reorder todo: ${error.message}`);
    }
  }

  revalidatePath('/');
}

export async function duplicateTodoToTomorrow(id: string) {
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
  
  const { data: todo, error: fetchError } = await supabase
    .from('todos')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .limit(1)
    .single();

  if (fetchError || !todo) {
    throw new Error('Todo not found');
  }

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowDate = tomorrow.toISOString().split('T')[0];

  // Get the highest order for tomorrow
  const { data: maxOrderResult, error: maxOrderError } = await supabase
    .from('todos')
    .select('order')
    .eq('user_id', user.id)
    .eq('for_date', tomorrowDate)
    .order('order', { ascending: false })
    .limit(1);

  if (maxOrderError) {
    throw new Error(`Failed to get max order: ${maxOrderError.message}`);
  }

  const newOrder = (maxOrderResult[0]?.order || 0) + 100;

  const { data: newTodo, error } = await supabase
    .from('todos')
    .insert({
      user_id: user.id,
      title: todo.title,
      for_date: tomorrowDate,
      order: newOrder,
      done: false,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to duplicate todo: ${error.message}`);
  }

  revalidatePath('/');
  return newTodo;
}

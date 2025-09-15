import { createBrowserClient, createServerClient } from '@supabase/ssr';

// Helper function to get environment variables with fallbacks
const getSupabaseConfig = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';
  
  return { supabaseUrl, supabaseAnonKey };
};

// Singleton pattern for client-side Supabase client to prevent multiple instances
// Use globalThis to ensure the singleton persists across hydration
declare global {
  var __supabase_client__: ReturnType<typeof createBrowserClient> | undefined;
}

export const createClientComponentClient = () => {
  // Check if we're in the browser
  if (typeof window === 'undefined') {
    // Return a mock client for SSR - this prevents build errors
    // The real client will be created when the component hydrates
    return {
      auth: {
        signInWithOtp: () => Promise.resolve({ error: null }),
        signOut: () => Promise.resolve({ error: null }),
        getUser: () => Promise.resolve({ data: { user: null }, error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      },
      from: () => ({
        select: () => ({ eq: () => ({ data: [], error: null }) }),
        insert: () => ({ data: [], error: null }),
        update: () => ({ eq: () => ({ data: [], error: null }) }),
        delete: () => ({ eq: () => ({ data: [], error: null }) }),
      }),
    } as any;
  }

  // Use globalThis to ensure singleton across hydration
  if (!globalThis.__supabase_client__) {
    const { supabaseUrl, supabaseAnonKey } = getSupabaseConfig();
    globalThis.__supabase_client__ = createBrowserClient(supabaseUrl, supabaseAnonKey);
  }
  return globalThis.__supabase_client__;
};

// Server-side Supabase client (always create new instance for server context)
export const createServerComponentClient = () => {
  const { supabaseUrl, supabaseAnonKey } = getSupabaseConfig();
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        // This will be handled by the middleware
        return undefined;
      },
      set(name: string, value: string, options: { [key: string]: any }) {
        // This will be handled by the middleware
      },
      remove(name: string, options: { [key: string]: any }) {
        // This will be handled by the middleware
      },
    },
  });
};

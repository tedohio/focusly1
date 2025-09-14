import { createClient } from '@supabase/supabase-js';
import { createBrowserClient, createServerClient } from '@supabase/ssr';

// Helper function to get environment variables with fallbacks
const getSupabaseConfig = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';
  
  return { supabaseUrl, supabaseAnonKey };
};

// Client-side Supabase client
export const createClientComponentClient = () => {
  const { supabaseUrl, supabaseAnonKey } = getSupabaseConfig();
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
};

// Server-side Supabase client
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

// Legacy client for non-SSR usage (lazy initialization)
let _supabaseClient: ReturnType<typeof createClient> | null = null;
export const supabase = (() => {
  if (!_supabaseClient) {
    const { supabaseUrl, supabaseAnonKey } = getSupabaseConfig();
    _supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
  }
  return _supabaseClient;
})();

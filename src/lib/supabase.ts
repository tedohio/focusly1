import { createClient } from '@supabase/supabase-js';
import { createBrowserClient, createServerClient } from '@supabase/ssr';

// Helper function to get environment variables with fallbacks
const getSupabaseConfig = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';
  
  return { supabaseUrl, supabaseAnonKey };
};

// Singleton pattern for client-side Supabase client to prevent multiple instances
let _browserClient: ReturnType<typeof createBrowserClient> | null = null;
export const createClientComponentClient = () => {
  if (!_browserClient) {
    const { supabaseUrl, supabaseAnonKey } = getSupabaseConfig();
    _browserClient = createBrowserClient(supabaseUrl, supabaseAnonKey);
  }
  return _browserClient;
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

// Legacy client for non-SSR usage (lazy initialization)
let _supabaseClient: ReturnType<typeof createClient> | null = null;
export const supabase = (() => {
  if (!_supabaseClient) {
    const { supabaseUrl, supabaseAnonKey } = getSupabaseConfig();
    _supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
  }
  return _supabaseClient;
})();

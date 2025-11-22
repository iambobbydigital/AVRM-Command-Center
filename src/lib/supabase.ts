import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Lazy initialization to avoid build-time errors
let _supabase: ReturnType<typeof createSupabaseClient> | null = null;

export const supabase = () => {
  if (!_supabase) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    _supabase = createSupabaseClient(supabaseUrl, supabaseAnonKey);
  }
  return _supabase;
};

// Server-side client with service role (for API routes)
export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

  if (!supabaseUrl || !serviceRoleKey) {
    // Return a placeholder during build time
    if (typeof window === 'undefined' && process.env.NODE_ENV !== 'production') {
      return {} as ReturnType<typeof createSupabaseClient>;
    }
  }

  return createSupabaseClient(supabaseUrl, serviceRoleKey);
}

// Alias for backwards compatibility
export const createServerClient = createClient;

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
  // Use SUPABASE_URL (without NEXT_PUBLIC prefix) for server-side code
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

  if (!supabaseUrl || !serviceRoleKey) {
    // Return a placeholder during build time
    if (typeof window === 'undefined' && process.env.NODE_ENV !== 'production') {
      return {} as ReturnType<typeof createSupabaseClient>;
    }

    // Throw error in production if env vars are missing
    throw new Error(
      `Missing Supabase environment variables. ` +
      `Server-side requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY. ` +
      `Got: supabaseUrl=${!!supabaseUrl}, serviceRoleKey=${!!serviceRoleKey}`
    );
  }

  return createSupabaseClient(supabaseUrl, serviceRoleKey);
}

// Alias for backwards compatibility
export const createServerClient = createClient;

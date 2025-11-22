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

  // During build time, return a mock client to avoid build errors
  // This is safe because the real client will be used at runtime
  if (!supabaseUrl || !serviceRoleKey) {
    // Check if we're in a build context (CI environment or no env vars)
    const isBuildTime = process.env.CI || process.env.VERCEL_ENV === undefined;

    if (isBuildTime) {
      console.log('[Build Time] Returning placeholder Supabase client');
      return {} as ReturnType<typeof createSupabaseClient>;
    }

    // At runtime, throw a descriptive error
    const availableEnvVars = Object.keys(process.env)
      .filter(key => key.includes('SUPABASE'))
      .join(', ');

    throw new Error(
      `Missing Supabase environment variables at runtime. ` +
      `Required: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY. ` +
      `Found Supabase-related vars: ${availableEnvVars || 'none'}`
    );
  }

  return createSupabaseClient(supabaseUrl, serviceRoleKey);
}

// Alias for backwards compatibility
export const createServerClient = createClient;

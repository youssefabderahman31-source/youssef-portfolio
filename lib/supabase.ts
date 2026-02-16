import { createClient } from '@supabase/supabase-js';

// Browser/public client (for client-side reads)
let _supabaseClient: ReturnType<typeof createClient> | null = null;
if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  _supabaseClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export const supabaseClient = _supabaseClient as ReturnType<typeof createClient> | null;

// Server-side client factory (use service role key for admin server actions)
export function createServerSupabaseClient(serviceRoleKey?: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const key = serviceRoleKey || process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  if (!url || !key) {
    throw new Error('Supabase service URL or key is not configured.');
  }
  return createClient(url, key);
}

export default supabaseClient;

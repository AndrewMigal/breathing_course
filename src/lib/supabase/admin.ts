import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

// Service role client — bypasses RLS. Use ONLY in server-side code (Server Components, Server Actions).
// Never expose SUPABASE_SERVICE_ROLE_KEY to the client.
export function createAdminClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

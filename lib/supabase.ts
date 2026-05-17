import { createClient } from "@supabase/supabase-js";
import { getEnv } from "./env.ts";

let adminClient: ReturnType<typeof createClient> | null = null;

export function getSupabaseAdminClient(): ReturnType<typeof createClient> {
  if (adminClient) {
    return adminClient;
  }

  const env = getEnv();

  adminClient = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });

  return adminClient;
}

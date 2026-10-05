import { createClient } from "@supabase/supabase-js";
import { getServerEnv, publicEnv } from "@/lib/env";

export function createAdminClient() {
  const server = getServerEnv();
  if (!publicEnv.NEXT_PUBLIC_SUPABASE_URL || !server.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Supabase is not configured.");
  }

  return createClient(
    publicEnv.NEXT_PUBLIC_SUPABASE_URL,
    server.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: { persistSession: false, autoRefreshToken: false }
    }
  );
}

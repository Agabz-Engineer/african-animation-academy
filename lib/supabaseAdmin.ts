import { createClient } from "@supabase/supabase-js";

// This client must ONLY be used in server actions or server components.
// It bypasses Row Level Security (RLS) and can perform powerful admin actions.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn("Missing SUPABASE_SERVICE_ROLE_KEY or URL. Admin actions will fail.");
}

export const supabaseAdmin = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null;

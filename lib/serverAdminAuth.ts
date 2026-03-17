import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { isAdminPanelRole } from "@/lib/adminRoles";

export async function assertAdminAccess(accessToken: string) {
  if (!supabaseAdmin) {
    throw new Error("Supabase Admin not initialized");
  }

  if (!accessToken) {
    throw new Error("Admin access required.");
  }

  const {
    data: { user },
    error: userError,
  } = await supabaseAdmin.auth.getUser(accessToken);

  if (userError || !user) {
    throw new Error("Admin access required.");
  }

  const { data: profile, error: profileError } = await supabaseAdmin
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    throw new Error(profileError.message || "Unable to verify admin access.");
  }

  const role = profile?.role || user.app_metadata?.role;

  if (!isAdminPanelRole(role)) {
    throw new Error("Admin access required.");
  }

  return { user, role };
}

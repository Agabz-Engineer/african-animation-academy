import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { isAdminPanelRole, type AdminPanelRole } from "@/lib/adminRoles";

type AdminClientAccess = {
  accessToken: string;
  role: AdminPanelRole;
  user: User;
};

export async function getAdminClientAccess(): Promise<AdminClientAccess | null> {
  if (!supabase) return null;

  const [
    {
      data: { session },
    },
    {
      data: { user },
    },
  ] = await Promise.all([supabase.auth.getSession(), supabase.auth.getUser()]);

  if (!session?.access_token || !user) {
    return null;
  }

  let role = user.app_metadata?.role;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (typeof profile?.role === "string") {
    role = profile.role;
  }

  if (!isAdminPanelRole(role)) {
    return null;
  }

  return {
    accessToken: session.access_token,
    role,
    user,
  };
}

export async function getAdminActionAccessToken() {
  return (await getAdminClientAccess())?.accessToken ?? null;
}


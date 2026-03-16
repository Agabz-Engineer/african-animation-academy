import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function userHasActiveProAccess(userId: string): Promise<boolean> {
  if (!supabaseAdmin) return false;

  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("subscription_tier, role")
    .eq("id", userId)
    .maybeSingle();

  if (profile?.role === "admin") return true;

  const profileHasPro =
    profile?.subscription_tier === "pro" || profile?.subscription_tier === "team";

  let hasPro = profileHasPro;

  const { data: subscription } = await supabaseAdmin
    .from("subscriptions")
    .select("plan, status, ends_at, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (subscription && (subscription.plan === "pro" || subscription.plan === "team")) {
    if (subscription.status !== "active") {
      hasPro = false;
    } else if (subscription.ends_at) {
      const endsAtDate = new Date(subscription.ends_at);
      hasPro = !Number.isNaN(endsAtDate.getTime()) ? endsAtDate > new Date() : true;
    } else {
      hasPro = true;
    }
  }

  return hasPro;
}

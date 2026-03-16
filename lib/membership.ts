"use client";

import type { SupabaseClient } from "@supabase/supabase-js";

export type MembershipAccess = {
  tier: "free" | "pro";
  hasPro: boolean;
};

export async function getMembershipAccess(
  client: SupabaseClient,
  userId: string
): Promise<MembershipAccess> {
  const { data: profile } = await client
    .from("profiles")
    .select("subscription_tier")
    .eq("id", userId)
    .single();

  const profileHasPro =
    profile?.subscription_tier === "pro" || profile?.subscription_tier === "team";

  let hasPro = profileHasPro;

  const { data: subscription } = await client
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

  return {
    tier: hasPro ? "pro" : "free",
    hasPro,
  };
}

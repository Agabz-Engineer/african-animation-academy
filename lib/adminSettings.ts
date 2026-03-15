import { supabaseAdmin } from "@/lib/supabaseAdmin";

export type AdminSettings = {
  maintenance_mode: boolean;
  allow_signups: boolean;
  post_moderation: boolean;
  payment_sandbox: boolean;
  weekly_digest: boolean;
  notification_alerts: boolean;
  updated_at?: string;
};

export const DEFAULT_ADMIN_SETTINGS: AdminSettings = {
  maintenance_mode: false,
  allow_signups: true,
  post_moderation: true,
  payment_sandbox: true,
  weekly_digest: true,
  notification_alerts: true,
};

const SETTINGS_ROW_ID = 1;

export const getAdminSettings = async (): Promise<AdminSettings> => {
  if (!supabaseAdmin) {
    return DEFAULT_ADMIN_SETTINGS;
  }

  const { data, error } = await supabaseAdmin
    .from("admin_settings")
    .select("*")
    .eq("id", SETTINGS_ROW_ID)
    .maybeSingle();

  if (error || !data) {
    return DEFAULT_ADMIN_SETTINGS;
  }

  return {
    maintenance_mode: Boolean(data.maintenance_mode),
    allow_signups: Boolean(data.allow_signups),
    post_moderation: Boolean(data.post_moderation),
    payment_sandbox: Boolean(data.payment_sandbox),
    weekly_digest: Boolean(data.weekly_digest),
    notification_alerts: Boolean(data.notification_alerts),
    updated_at: data.updated_at ?? undefined,
  };
};

export const saveAdminSettingsRecord = async (settings: AdminSettings) => {
  if (!supabaseAdmin) {
    throw new Error("Supabase Admin not initialized");
  }

  const payload = {
    id: SETTINGS_ROW_ID,
    maintenance_mode: settings.maintenance_mode,
    allow_signups: settings.allow_signups,
    post_moderation: settings.post_moderation,
    payment_sandbox: settings.payment_sandbox,
    weekly_digest: settings.weekly_digest,
    notification_alerts: settings.notification_alerts,
  };

  const { error } = await supabaseAdmin
    .from("admin_settings")
    .upsert(payload, { onConflict: "id" });

  if (error) throw error;

  return payload;
};

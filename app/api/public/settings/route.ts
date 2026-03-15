import { NextResponse } from "next/server";
import { getAdminSettings } from "@/lib/adminSettings";

export const runtime = "nodejs";

export async function GET() {
  const settings = await getAdminSettings();

  return NextResponse.json({
    maintenanceMode: settings.maintenance_mode,
    allowSignups: settings.allow_signups,
    postModeration: settings.post_moderation,
    paymentSandbox: settings.payment_sandbox,
    notificationAlerts: settings.notification_alerts,
  });
}

import crypto from "crypto";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

export const runtime = "nodejs";

const addDays = (date: Date, days: number) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

export async function POST(request: Request) {
  if (!PAYSTACK_SECRET_KEY) {
    return NextResponse.json({ error: "PAYSTACK_SECRET_KEY is not configured." }, { status: 500 });
  }

  const signature = request.headers.get("x-paystack-signature");
  const rawBody = await request.text();
  const hash = crypto.createHmac("sha512", PAYSTACK_SECRET_KEY).update(rawBody).digest("hex");

  if (!signature || signature !== hash) {
    return NextResponse.json({ error: "Invalid signature." }, { status: 401 });
  }

  const event = JSON.parse(rawBody);

  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Supabase admin not configured." }, { status: 500 });
  }

  if (event?.event === "charge.success") {
    const data = event.data;
    const metadata = data?.metadata || {};
    const userId = metadata.user_id as string | undefined;
    const billingCycle = (metadata.billing_cycle as "monthly" | "annual") || "monthly";

    if (!userId) {
      return NextResponse.json({ received: true });
    }

    const amount = Number(data?.amount || 0) / 100;
    const paidAt = data?.paid_at ? new Date(data.paid_at) : new Date();
    const expiresAt = billingCycle === "annual" ? addDays(paidAt, 365) : addDays(paidAt, 30);

    const { data: existingPayment } = await supabaseAdmin
      .from("payments")
      .select("id")
      .eq("provider_reference", data?.reference || "")
      .maybeSingle();

    if (!existingPayment) {
      await supabaseAdmin.from("payments").insert({
        user_id: userId,
        subscription_id: null,
        amount,
        currency: data?.currency || "GHS",
        status: "completed",
        payment_method: data?.channel || null,
        provider: "paystack",
        provider_payment_id: data?.id ? String(data.id) : null,
        provider_reference: data?.reference || null,
        provider_customer_id: data?.customer?.customer_code || null,
        created_at: paidAt.toISOString(),
        completed_at: paidAt.toISOString(),
      });
    }

    const { data: existingSubscription } = await supabaseAdmin
      .from("subscriptions")
      .select("id")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existingSubscription?.id) {
      await supabaseAdmin
        .from("subscriptions")
        .update({
          plan: "pro",
          status: "active",
          price: amount,
          billing_cycle: billingCycle,
          started_at: paidAt.toISOString(),
          ends_at: expiresAt.toISOString(),
          provider: "paystack",
          provider_customer_id: data?.customer?.customer_code || null,
          provider_reference: data?.reference || null,
        })
        .eq("id", existingSubscription.id);
    } else {
      await supabaseAdmin.from("subscriptions").insert({
        user_id: userId,
        plan: "pro",
        status: "active",
        price: amount,
        billing_cycle: billingCycle,
        started_at: paidAt.toISOString(),
        ends_at: expiresAt.toISOString(),
        provider: "paystack",
        provider_customer_id: data?.customer?.customer_code || null,
        provider_reference: data?.reference || null,
      });
    }

    await supabaseAdmin
      .from("profiles")
      .upsert({ id: userId, subscription_tier: "pro" }, { onConflict: "id" });
  }

  return NextResponse.json({ received: true });
}

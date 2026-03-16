import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getProMonthlyRate, type BillingTermMonths } from "@/lib/pricing";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: "Supabase admin is not configured." }, { status: 500 });
    }

    const body = (await request.json()) as {
      userId?: string;
      email?: string;
      termMonths?: BillingTermMonths;
      reference?: string;
      note?: string;
    };

    const userId = body.userId?.trim();
    const email = body.email?.trim().toLowerCase();
    const reference = body.reference?.trim();
    const note = body.note?.trim() || "";
    const termMonths = body.termMonths === 1 ? 1 : 1;

    if (!userId || !email) {
      return NextResponse.json({ error: "You must be signed in to request Pro access." }, { status: 401 });
    }

    if (!reference || reference.length < 3) {
      return NextResponse.json({ error: "Add your payment reference so admin can verify it." }, { status: 400 });
    }

    const amount = getProMonthlyRate(termMonths);

    const { error } = await supabaseAdmin.from("payments").insert({
      user_id: userId,
      amount,
      currency: "GHS",
      status: "pending",
      payment_method: "manual_momo",
      provider: "manual-admin",
      provider_reference: note ? `${reference} | ${note}` : reference,
    });

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not submit manual payment request." },
      { status: 500 }
    );
  }
}

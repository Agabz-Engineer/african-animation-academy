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
      paymentMethod?: string;
      reference?: string;
      senderName?: string;
      senderPhone?: string;
      note?: string;
      proofPath?: string;
    };

    const userId = body.userId?.trim();
    const email = body.email?.trim().toLowerCase();
    const paymentMethod = body.paymentMethod === "manual_bank_transfer" ? "manual_bank_transfer" : "manual_momo";
    const reference = body.reference?.trim();
    const senderName = body.senderName?.trim();
    const senderPhone = body.senderPhone?.trim();
    const note = body.note?.trim() || "";
    const proofPath = body.proofPath?.trim();
    const termMonths = body.termMonths === 1 ? 1 : 1;

    if (!userId || !email) {
      return NextResponse.json({ error: "You must be signed in to request Pro access." }, { status: 401 });
    }

    if (!reference || reference.length < 3) {
      return NextResponse.json({ error: "Add your payment reference so admin can verify it." }, { status: 400 });
    }

    if (!senderName || senderName.length < 2) {
      return NextResponse.json({ error: "Add the sender name used for the payment." }, { status: 400 });
    }

    if (!senderPhone || senderPhone.length < 7) {
      return NextResponse.json({ error: "Add the sender phone number used for the payment." }, { status: 400 });
    }

    if (!proofPath) {
      return NextResponse.json({ error: "Upload your payment proof before submitting." }, { status: 400 });
    }

    const amount = getProMonthlyRate(termMonths);
    const paymentPayload = {
      amount,
      currency: "GHS",
      status: "pending" as const,
      payment_method: paymentMethod,
      provider: "manual-admin",
      provider_reference: reference,
      term_months: termMonths,
      manual_sender_name: senderName,
      manual_sender_phone: senderPhone,
      manual_note: note,
      manual_proof_path: proofPath,
      completed_at: null,
    };

    const { data: existingPending, error: pendingLookupError } = await supabaseAdmin
      .from("payments")
      .select("id")
      .eq("user_id", userId)
      .eq("provider", "manual-admin")
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (pendingLookupError) throw pendingLookupError;

    const { error } = existingPending
      ? await supabaseAdmin.from("payments").update(paymentPayload).eq("id", existingPending.id)
      : await supabaseAdmin.from("payments").insert({
          user_id: userId,
          ...paymentPayload,
        });

    if (error) throw error;

    return NextResponse.json({ success: true, mode: existingPending ? "updated" : "created" });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not submit manual payment request." },
      { status: 500 }
    );
  }
}

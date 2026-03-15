import { NextResponse } from "next/server";
import { getAdminSettings } from "@/lib/adminSettings";
import {
  TERM_MONTHS,
  getProMonthlyRate,
  toMinorUnits,
  type BillingTermMonths,
} from "@/lib/pricing";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || process.env.PAYSTACK_CALLBACK_BASE_URL;

const getPaystackSecretKey = async () => {
  const settings = await getAdminSettings();
  const liveKey = process.env.PAYSTACK_LIVE_SECRET_KEY;
  const testKey = process.env.PAYSTACK_TEST_SECRET_KEY || process.env.PAYSTACK_SECRET_KEY;

  if (settings.payment_sandbox) {
    return {
      key: testKey,
      sandbox: true,
    };
  }

  return {
    key: liveKey || process.env.PAYSTACK_SECRET_KEY,
    sandbox: false,
  };
};

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const { key: paystackSecretKey, sandbox } = await getPaystackSecretKey();

    if (!paystackSecretKey) {
      return NextResponse.json({ error: "PAYSTACK_SECRET_KEY is not configured." }, { status: 500 });
    }

    const body = await request.json();
    const termRaw = Number(body?.termMonths ?? 1);
    const userId = body?.userId as string | undefined;
    const email = body?.email as string | undefined;

    if (!userId || !email) {
      return NextResponse.json({ error: "User not authenticated." }, { status: 401 });
    }

    if (!TERM_MONTHS.includes(termRaw as BillingTermMonths)) {
      return NextResponse.json({ error: "Unsupported term length." }, { status: 400 });
    }

    const termMonths = termRaw as BillingTermMonths;
    const amountGhs = getProMonthlyRate(termMonths);
    const amount = toMinorUnits(amountGhs);
    const callbackUrl = SITE_URL ? `${SITE_URL.replace(/\/$/, "")}/pricing?status=success` : undefined;

    const payload: Record<string, unknown> = {
      email,
      amount,
      currency: "GHS",
      metadata: {
        user_id: userId,
        plan: "pro",
        billing_cycle: "monthly",
        term_months: termMonths,
        payment_type: "topup",
        payment_mode: sandbox ? "sandbox" : "live",
      },
      channels: ["card", "mobile_money", "bank_transfer", "bank", "ussd"],
    };
    if (callbackUrl) {
      payload.callback_url = callbackUrl;
    }

    const response = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${paystackSecretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (!response.ok || !data?.status) {
      return NextResponse.json({ error: data?.message || "Paystack initialization failed." }, { status: 400 });
    }

    return NextResponse.json({
      authorization_url: data.data?.authorization_url,
      reference: data.data?.reference,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Initialization failed." },
      { status: 500 }
    );
  }
}

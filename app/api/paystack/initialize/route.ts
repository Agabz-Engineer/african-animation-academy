import { NextResponse } from "next/server";
import { getProAmount, toMinorUnits, type BillingCycle } from "@/lib/pricing";

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || process.env.PAYSTACK_CALLBACK_BASE_URL;

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    if (!PAYSTACK_SECRET_KEY) {
      return NextResponse.json({ error: "PAYSTACK_SECRET_KEY is not configured." }, { status: 500 });
    }

    const body = await request.json();
    const billingCycle = (body?.billingCycle as BillingCycle) || "monthly";
    const userId = body?.userId as string | undefined;
    const email = body?.email as string | undefined;

    if (!userId || !email) {
      return NextResponse.json({ error: "User not authenticated." }, { status: 401 });
    }

    if (!["monthly", "annual"].includes(billingCycle)) {
      return NextResponse.json({ error: "Unsupported billing cycle." }, { status: 400 });
    }

    const amountGhs = getProAmount(billingCycle);
    const amount = toMinorUnits(amountGhs);
    const callbackUrl = SITE_URL ? `${SITE_URL.replace(/\/$/, "")}/pricing?status=success` : undefined;

    const payload: Record<string, unknown> = {
      email,
      amount,
      currency: "GHS",
      metadata: {
        user_id: userId,
        plan: "pro",
        billing_cycle: billingCycle,
      },
      channels: ["card", "mobile_money", "bank_transfer", "bank", "ussd"],
    };
    if (callbackUrl) {
      payload.callback_url = callbackUrl;
    }

    const response = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
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

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getAdminSettings } from "@/lib/adminSettings";
import { normalizeAccountType } from "@/lib/accountRouting";
import {
  getEmailValidationError,
  getSignupEmailRedirectUrl,
  normalizeEmailAddress,
} from "@/lib/authValidation";

type SignupBody = {
  email?: string;
  password?: string;
  data?: Record<string, unknown>;
};

const getSignupClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !publishableKey) {
    return null;
  }

  return createClient(supabaseUrl, publishableKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};

export async function POST(request: Request) {
  const settings = await getAdminSettings();
  if (!settings.allow_signups) {
    return NextResponse.json(
      { error: "New signups are temporarily disabled by the admin." },
      { status: 403 }
    );
  }

  const client = getSignupClient();
  if (!client) {
    return NextResponse.json(
      { error: "Signup service is not configured. Please contact support." },
      { status: 500 }
    );
  }

  let body: SignupBody;
  try {
    body = (await request.json()) as SignupBody;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const email = normalizeEmailAddress(body.email || "");
  const password = body.password || "";
  const rawUserData =
    typeof body.data === "object" && body.data !== null
      ? (body.data as Record<string, unknown>)
      : {};
  const userData = {
    ...rawUserData,
    account_type: normalizeAccountType(
      rawUserData.account_type
    ),
  };

  const emailError = getEmailValidationError(email);
  if (emailError || !password) {
    return NextResponse.json(
      { error: emailError || "Email and password are required." },
      { status: 400 }
    );
  }
  if (password.length < 8) {
    return NextResponse.json(
      { error: "Password must be at least 8 characters." },
      { status: 400 }
    );
  }

  const { data, error } = await client.auth.signUp({
    email,
    password,
    options: {
      data: userData,
      emailRedirectTo: getSignupEmailRedirectUrl(request),
    },
  });

  if (error) {
    const msg = error.message || "Could not create account.";
    const lower = msg.toLowerCase();
    const isConflict =
      lower.includes("already") || lower.includes("duplicate") || lower.includes("exists");
    return NextResponse.json({ error: msg }, { status: isConflict ? 409 : 400 });
  }

  return NextResponse.json(
    {
      userId: data.user?.id || null,
      email,
      requiresEmailConfirmation: true,
    },
    { status: 201 }
  );
}

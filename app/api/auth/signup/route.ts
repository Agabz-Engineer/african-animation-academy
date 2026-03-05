import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

type SignupBody = {
  email?: string;
  password?: string;
  data?: Record<string, unknown>;
};

const getSignupClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return null;
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};

export async function POST(request: Request) {
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

  const email = (body.email || "").trim().toLowerCase();
  const password = body.password || "";
  const userData = body.data || {};

  if (!email || !password) {
    return NextResponse.json(
      { error: "Email and password are required." },
      { status: 400 }
    );
  }
  if (password.length < 8) {
    return NextResponse.json(
      { error: "Password must be at least 8 characters." },
      { status: 400 }
    );
  }

  const { data, error } = await client.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: userData,
  });

  if (error) {
    const msg = error.message || "Could not create account.";
    const lower = msg.toLowerCase();
    const isConflict =
      lower.includes("already") || lower.includes("duplicate") || lower.includes("exists");
    return NextResponse.json({ error: msg }, { status: isConflict ? 409 : 400 });
  }

  return NextResponse.json({ userId: data.user?.id || null }, { status: 201 });
}

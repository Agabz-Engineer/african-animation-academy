import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const COMMUNITY_POST_TTL_MS = 7 * 24 * 60 * 60 * 1000;

const getCommunityCutoffIso = () => new Date(Date.now() - COMMUNITY_POST_TTL_MS).toISOString();

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");
  const isDevelopment = process.env.NODE_ENV !== "production";

  if (!cronSecret) {
    if (!isDevelopment) {
      return NextResponse.json({ error: "CRON_SECRET is not configured." }, { status: 500 });
    }
  } else if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Supabase admin is not configured." }, { status: 500 });
  }

  const cutoffIso = getCommunityCutoffIso();

  const { count, error: countError } = await supabaseAdmin
    .from("community_posts")
    .select("id", { count: "exact", head: true })
    .lt("created_at", cutoffIso);

  if (countError) {
    return NextResponse.json({ error: countError.message }, { status: 500 });
  }

  if (!count) {
    return NextResponse.json({ success: true, deleted: 0, cutoffIso });
  }

  const { error: deleteError } = await supabaseAdmin
    .from("community_posts")
    .delete()
    .lt("created_at", cutoffIso);

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, deleted: count, cutoffIso });
}

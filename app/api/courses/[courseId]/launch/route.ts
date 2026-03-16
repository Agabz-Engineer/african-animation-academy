import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { userHasActiveProAccess } from "@/lib/serverMembership";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{
    courseId: string;
  }>;
};

const isExternalUrl = (value: string) => /^https?:\/\//i.test(value);

export async function POST(request: Request, context: RouteContext) {
  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Supabase admin is not configured." }, { status: 500 });
  }

  const authHeader = request.headers.get("authorization");
  const accessToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!accessToken) {
    return NextResponse.json({ error: "Authentication is required." }, { status: 401 });
  }

  const {
    data: { user },
    error: userError,
  } = await supabaseAdmin.auth.getUser(accessToken);

  if (userError || !user) {
    return NextResponse.json({ error: "Your session is no longer valid." }, { status: 401 });
  }

  const { courseId } = await context.params;

  const { data: course, error: courseError } = await supabaseAdmin
    .from("courses")
    .select("id, title, access_tier, price, status, video_path")
    .eq("id", courseId)
    .maybeSingle();

  if (courseError) {
    return NextResponse.json({ error: "Unable to load this course right now." }, { status: 500 });
  }

  if (!course || course.status !== "published") {
    return NextResponse.json({ error: "This course is not currently available." }, { status: 404 });
  }

  if (!course.video_path) {
    return NextResponse.json({ error: "This course does not have content attached yet." }, { status: 404 });
  }

  const requiresPro = course.access_tier === "pro" || Number(course.price || 0) > 0;
  const hasPro = requiresPro ? await userHasActiveProAccess(user.id) : true;

  if (requiresPro && !hasPro) {
    return NextResponse.json(
      { error: "Upgrade to Pro to access this course." },
      { status: 403 }
    );
  }

  if (isExternalUrl(course.video_path)) {
    return NextResponse.json({ url: course.video_path });
  }

  const { data: signedData, error: signedError } = await supabaseAdmin.storage
    .from("course-videos")
    .createSignedUrl(course.video_path, 60 * 30);

  if (signedError || !signedData?.signedUrl) {
    return NextResponse.json(
      { error: "Unable to generate course access right now." },
      { status: 500 }
    );
  }

  return NextResponse.json({ url: signedData.signedUrl });
}

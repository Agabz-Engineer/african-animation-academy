"use server";

import nodemailer from "nodemailer";
import { DEFAULT_ADMIN_SETTINGS, getAdminSettings as loadAdminSettings, saveAdminSettingsRecord, type AdminSettings } from "@/lib/adminSettings";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import type { User } from "@supabase/supabase-js";

const AUTH_USERS_PAGE_SIZE = 1000;
const PROFILE_SYNC_BATCH_SIZE = 500;

type ProfileRow = {
  id: string;
  full_name: string | null;
  role: string | null;
  status: string | null;
  created_at: string | null;
  skill_level?: string | null;
  subscription_tier?: string | null;
};

type PaymentRow = {
  id: string;
  user_id: string;
  amount: string | number | null;
  currency: string | null;
  status: "pending" | "completed" | "failed" | "refunded";
  payment_method: string | null;
  provider?: string | null;
  provider_reference?: string | null;
  term_months?: number | null;
  created_at: string;
  completed_at: string | null;
};

type CourseInput = {
  title: string;
  description: string;
  instructor: string;
  level: string;
  duration: number | string;
  lessons: number;
  price: string | number;
  rating?: number;
  thumbnail_url?: string | null;
  video_path?: string | null;
  status: string;
};

type EmailCampaign = {
  id: string;
  title: string;
  audience: string;
  status: "draft" | "scheduled" | "sent" | "paused";
  send_date: string | null;
  subject: string;
  message: string;
  sent_to: string[] | null;
  open_rate: number | null;
  click_rate: number | null;
  created_at: string;
};

const listAllAuthUsers = async (): Promise<User[]> => {
  if (!supabaseAdmin) throw new Error("Supabase Admin not initialized");

  const users: User[] = [];
  let page = 1;

  while (true) {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({
      page,
      perPage: AUTH_USERS_PAGE_SIZE,
    });

    if (error) throw error;

    const batch = data?.users || [];
    users.push(...batch);

    if (batch.length < AUTH_USERS_PAGE_SIZE) break;
    page += 1;
  }

  return users;
};

const safeCount = async (
  query: PromiseLike<{ count: number | null; error: { message?: string } | null }>,
  label: string
): Promise<number | null> => {
  const { count, error } = await query;
  if (error) {
    console.warn(`Admin stats count failed for ${label}:`, error.message || error);
    return null;
  }
  return count ?? 0;
};

const safeSelect = async <T>(
  query: PromiseLike<{ data: T[] | null; error: { message?: string } | null }>,
  label: string
): Promise<T[]> => {
  const { data, error } = await query;
  if (error) {
    console.warn(`Admin stats query failed for ${label}:`, error.message || error);
    return [];
  }
  return data || [];
};

const chunkArray = <T>(items: T[], size: number): T[][] => {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
};

// ==========================================
// Data Fetching Actions (Bypass RLS)
// ==========================================

export async function getAdminDashboardData() {
  if (!supabaseAdmin) throw new Error("Supabase Admin not initialized");

  const today = new Date();
  const todayDate = today.toISOString().split("T")[0];
  const thisMonth = today.toISOString().slice(0, 7);
  const activeCutoff = new Date();
  activeCutoff.setDate(activeCutoff.getDate() - 30);

  const [
    authUsers,
    activeProfilesCount,
    totalCourses,
    totalPosts,
    pendingPosts,
    payments,
    recentCourses,
    recentPosts,
    recentPayments,
  ] = await Promise.all([
    listAllAuthUsers(),
    safeCount(
      supabaseAdmin.from("profiles").select("*", { count: "exact", head: true }).eq("status", "active"),
      "profiles active"
    ),
    safeCount(
      supabaseAdmin.from("courses").select("*", { count: "exact", head: true }),
      "courses total"
    ),
    safeCount(
      supabaseAdmin.from("community_posts").select("*", { count: "exact", head: true }),
      "community_posts total"
    ),
    safeCount(
      supabaseAdmin.from("community_posts").select("*", { count: "exact", head: true }).eq("status", "pending"),
      "community_posts pending"
    ),
    safeSelect(
      supabaseAdmin.from("payments").select("id, amount, created_at").eq("status", "completed"),
      "payments"
    ),
    safeSelect(
      supabaseAdmin
        .from("courses")
        .select("id, title, created_at, status")
        .order("created_at", { ascending: false })
        .limit(3),
      "recent courses"
    ),
    safeSelect(
      supabaseAdmin
        .from("community_posts")
        .select("id, content, created_at")
        .order("created_at", { ascending: false })
        .limit(3),
      "recent posts"
    ),
    safeSelect(
      supabaseAdmin
        .from("payments")
        .select("id, amount, created_at")
        .eq("status", "completed")
        .order("created_at", { ascending: false })
        .limit(3),
      "recent payments"
    ),
  ]);

  const totalUsers = authUsers.length;
  const newUsersToday = authUsers.filter((user) => user.created_at?.startsWith(todayDate)).length;
  const activeUsersFallback = authUsers.filter((user) => {
    if (!user.last_sign_in_at) return false;
    return new Date(user.last_sign_in_at) >= activeCutoff;
  }).length;
  const totalCoursesValue = totalCourses ?? 0;
  const totalPostsValue = totalPosts ?? 0;
  const pendingPostsValue = pendingPosts ?? 0;
  const activeUsers =
    activeProfilesCount === null ? activeUsersFallback : activeProfilesCount;

  const totalRevenue =
    payments.reduce((sum, payment) => sum + parseFloat(payment.amount || "0"), 0) || 0;
  const monthlyRevenue =
    payments
      .filter((payment) => payment.created_at?.startsWith(thisMonth))
      .reduce((sum, payment) => sum + parseFloat(payment.amount || "0"), 0) || 0;

  const recentUsers = authUsers
    .slice()
    .sort((a, b) => (a.created_at > b.created_at ? -1 : 1))
    .slice(0, 3)
    .map((user) => {
      const name =
        (user.user_metadata?.full_name as string | undefined) ||
        (user.user_metadata?.name as string | undefined) ||
        user.email ||
        "New user";
      return {
        id: `user-${user.id}`,
        type: "user" as const,
        title: "New User Registration",
        description: `${name} joined the platform`,
        timestamp: user.created_at || today.toISOString(),
        status: "success" as const,
      };
    });

  const recentCourseActivity = recentCourses.map((course) => ({
    id: `course-${course.id}`,
    type: "course" as const,
    title: "Course Update",
    description: `${course.title} created`,
    timestamp: course.created_at || today.toISOString(),
    status: course.status === "published" ? ("success" as const) : ("info" as const),
  }));

  const recentPostActivity = recentPosts.map((post) => ({
    id: `post-${post.id}`,
    type: "post" as const,
    title: "Community Post",
    description: String(post.content || "").replace(/\s+/g, " ").slice(0, 80),
    timestamp: post.created_at || today.toISOString(),
    status: "warning" as const,
  }));

  const recentPaymentActivity = recentPayments.map((payment) => ({
    id: `payment-${payment.id}`,
    type: "payment" as const,
    title: "Payment Received",
    description: `Payment completed: ${payment.amount || "0"}`,
    timestamp: payment.created_at || today.toISOString(),
    status: "success" as const,
  }));

  const recentActivity = [
    ...recentUsers,
    ...recentCourseActivity,
    ...recentPostActivity,
    ...recentPaymentActivity,
  ]
    .sort((a, b) => (a.timestamp > b.timestamp ? -1 : 1))
    .slice(0, 6);

  return {
    stats: {
      totalUsers,
      activeUsers,
      newUsersToday,
      totalCourses: totalCoursesValue,
      totalPosts: totalPostsValue,
      pendingPosts: pendingPostsValue,
      totalRevenue,
      monthlyRevenue,
    },
    recentActivity,
  };
}

export async function getAdminUsers() {
  if (!supabaseAdmin) throw new Error("Supabase Admin not initialized");

  const [{ data: profiles, error: profilesError }, authUsers] = await Promise.all([
    supabaseAdmin.from("profiles").select("*").order("created_at", { ascending: false }),
    listAllAuthUsers(),
  ]);

  if (profilesError) {
    console.warn("Failed to load profiles for admin users list:", profilesError.message || profilesError);
  }

  const profileMap = new Map((profiles || []).map((profile: ProfileRow) => [profile.id, profile]));

  const users = authUsers.map((user) => {
    const profile = profileMap.get(user.id);
    return {
      id: user.id,
      email: user.email || "unknown",
      full_name:
        profile?.full_name ||
        (user.user_metadata?.full_name as string | undefined) ||
        (user.user_metadata?.name as string | undefined) ||
        null,
      role: profile?.role || (user.app_metadata?.role as string | undefined) || "user",
      status: profile?.status || "active",
      created_at: profile?.created_at || user.created_at || new Date().toISOString(),
      last_sign_in: user.last_sign_in_at || null,
      skill_level: profile?.skill_level || null,
      subscription_tier: profile?.subscription_tier || null,
    };
  });

  return { users };
}

export async function syncProfilesFromAuth() {
  if (!supabaseAdmin) throw new Error("Supabase Admin not initialized");

  const authUsers = await listAllAuthUsers();

  const { data: profiles, error: profilesError } = await supabaseAdmin
    .from("profiles")
    .select("id");

  if (profilesError) {
    throw new Error(
      profilesError.message ||
        "Failed to load profiles. Make sure the profiles table exists."
    );
  }

  const existingIds = new Set((profiles || []).map((profile) => profile.id));
  const missingUsers = authUsers.filter((user) => !existingIds.has(user.id));

  if (missingUsers.length === 0) {
    return { total: authUsers.length, inserted: 0 };
  }

  const payload = missingUsers.map((user) => ({
    id: user.id,
    full_name:
      (user.user_metadata?.full_name as string | undefined) ||
      (user.user_metadata?.name as string | undefined) ||
      null,
    avatar_url: (user.user_metadata?.avatar_url as string | undefined) || null,
  }));

  const chunks = chunkArray(payload, PROFILE_SYNC_BATCH_SIZE);

  for (const chunk of chunks) {
    const { error } = await supabaseAdmin
      .from("profiles")
      .upsert(chunk, { onConflict: "id", ignoreDuplicates: true });
    if (error) {
      throw error;
    }
  }

  return { total: authUsers.length, inserted: missingUsers.length };
}

export async function getAdminCourses() {
  if (!supabaseAdmin) throw new Error("Supabase Admin not initialized");
  
  const { data, error } = await supabaseAdmin
    .from('courses')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getAdminCommunityPosts() {
  if (!supabaseAdmin) throw new Error("Supabase Admin not initialized");
  
  const { data, error } = await supabaseAdmin
    .from('community_posts')
    .select(`
      *,
      profiles (full_name, avatar_url),
      community_reports (count)
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getAdminPayments() {
  if (!supabaseAdmin) throw new Error("Supabase Admin not initialized");

  const [{ data: payments, error }, authUsers, { data: profiles, error: profilesError }] = await Promise.all([
    supabaseAdmin
      .from("payments")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200),
    listAllAuthUsers(),
    supabaseAdmin.from("profiles").select("id, subscription_tier, role"),
  ]);

  if (error) throw error;
  if (profilesError) throw profilesError;

  const userMap = new Map(
    authUsers.map((user) => [
      user.id,
      {
        email: user.email || "unknown",
        name:
          (user.user_metadata?.full_name as string | undefined) ||
          (user.user_metadata?.name as string | undefined) ||
          user.email ||
          "Unknown",
        },
    ])
  );
  const profileMap = new Map(
    (profiles || []).map((profile: { id: string; subscription_tier: string | null; role: string | null }) => [
      profile.id,
      profile,
    ])
  );

  return (payments || []).map((payment: PaymentRow) => {
    const userInfo = userMap.get(payment.user_id);
    const profileInfo = profileMap.get(payment.user_id);
    return {
      ...payment,
      amount: payment.amount ?? 0,
      currency: payment.currency || "USD",
      user_email: userInfo?.email || "unknown",
      user_name: userInfo?.name || null,
      user_subscription_tier: profileInfo?.subscription_tier || null,
      user_role: profileInfo?.role || "user",
    };
  });
}

// ==========================================
// User Management Actions
// ==========================================

export async function banUser(userId: string) {
  if (!supabaseAdmin) throw new Error("Supabase Admin not initialized");
  const { error } = await supabaseAdmin
    .from('profiles')
    .upsert({ id: userId, status: 'banned' }, { onConflict: 'id' });
  if (error) throw error;
  return { success: true };
}

export async function unbanUser(userId: string) {
   if (!supabaseAdmin) throw new Error("Supabase Admin not initialized");
   const { error } = await supabaseAdmin
    .from('profiles')
    .upsert({ id: userId, status: 'active' }, { onConflict: 'id' });
   if (error) throw error;
   return { success: true };
}

export async function setUserRole(userId: string, role: string) {
  if (!supabaseAdmin) throw new Error("Supabase Admin not initialized");
  const { data: authUserData, error: authUserError } = await supabaseAdmin.auth.admin.getUserById(userId);
  if (authUserError) throw authUserError;

  const { error } = await supabaseAdmin
    .from('profiles')
    .upsert({ id: userId, role }, { onConflict: 'id' });
  if (error) throw error;

  const { error: authUpdateError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
    app_metadata: {
      ...(authUserData.user?.app_metadata || {}),
      role,
    },
  });
  if (authUpdateError) throw authUpdateError;

  return { success: true };
}

export async function grantUserProAccess(input: { userId: string; paymentId?: string }) {
  if (!supabaseAdmin) throw new Error("Supabase Admin not initialized");

  let payment: PaymentRow | null = null;

  if (input.paymentId) {
    const { data, error } = await supabaseAdmin
      .from("payments")
      .select("id, user_id, amount, currency, status, payment_method, provider, provider_reference, term_months, created_at, completed_at")
      .eq("id", input.paymentId)
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error("Payment record not found.");

    payment = data as PaymentRow;

    if (payment.user_id !== input.userId) {
      throw new Error("Payment does not belong to the selected user.");
    }

    if (payment.status !== "completed") {
      throw new Error("Only completed payments can grant Pro access.");
    }
  }

  const termMonths = Math.max(1, payment?.term_months || 1);
  const billingCycle = termMonths === 1 ? "monthly" : "annual";
  const startedAt = payment?.completed_at || payment?.created_at || new Date().toISOString();
  const endsAt = new Date(startedAt);
  endsAt.setMonth(endsAt.getMonth() + termMonths);

  const { data: existingSubscription, error: subscriptionLookupError } = await supabaseAdmin
    .from("subscriptions")
    .select("id")
    .eq("user_id", input.userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (subscriptionLookupError) throw subscriptionLookupError;

  const subscriptionPayload = {
    user_id: input.userId,
    plan: "pro",
    status: "active",
    price: Number(payment?.amount || 0),
    billing_cycle: billingCycle,
    term_months: termMonths,
    started_at: startedAt,
    ends_at: endsAt.toISOString(),
    provider: payment?.provider || "manual-admin",
    provider_reference: payment?.provider_reference || payment?.id || "manual-admin-grant",
  };

  if (existingSubscription?.id) {
    const { error } = await supabaseAdmin
      .from("subscriptions")
      .update(subscriptionPayload)
      .eq("id", existingSubscription.id);
    if (error) throw error;
  } else {
    const { error } = await supabaseAdmin
      .from("subscriptions")
      .insert(subscriptionPayload);
    if (error) throw error;
  }

  const { error: profileError } = await supabaseAdmin
    .from("profiles")
    .upsert({ id: input.userId, subscription_tier: "pro" }, { onConflict: "id" });
  if (profileError) throw profileError;

  return { success: true };
}

export async function deleteUser(userId: string) {
  if (!supabaseAdmin) throw new Error("Supabase Admin not initialized");
  
  // Try to delete profile first to respect foreign keys
  const { error: profileError } = await supabaseAdmin
    .from('profiles')
    .delete()
    .eq('id', userId);
    
  if (profileError) throw profileError;

  // Then delete from auth
  const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);
  if (authError) throw authError;
  
  return { success: true };
}

export async function createAdminUser(input: {
  email: string;
  password: string;
  fullName?: string;
  role?: "user" | "admin" | "moderator";
  status?: "active" | "inactive" | "banned";
}) {
  if (!supabaseAdmin) throw new Error("Supabase Admin not initialized");

  const email = input.email.trim().toLowerCase();
  const password = input.password.trim();
  const fullName = input.fullName?.trim() || null;
  const role = input.role || "user";
  const status = input.status || "active";

  if (!email) throw new Error("Email is required.");
  if (password.length < 8) throw new Error("Password must be at least 8 characters.");

  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: fullName,
    },
    app_metadata: {
      role,
    },
  });

  if (error) throw error;
  if (!data.user?.id) throw new Error("User could not be created.");

  const { error: profileError } = await supabaseAdmin.from("profiles").upsert(
    {
      id: data.user.id,
      full_name: fullName,
      role,
      status,
    },
    { onConflict: "id" }
  );

  if (profileError) throw profileError;

  return { success: true, userId: data.user.id };
}


// ==========================================
// Course Management Actions
// ==========================================

export async function publishCourse(courseId: string) {
  if (!supabaseAdmin) throw new Error("Supabase Admin not initialized");
  const { error } = await supabaseAdmin
    .from('courses')
    .update({ status: 'published' })
    .eq('id', courseId);
  if (error) throw error;
  return { success: true };
}

export async function archiveCourse(courseId: string) {
  if (!supabaseAdmin) throw new Error("Supabase Admin not initialized");
  const { error } = await supabaseAdmin
    .from('courses')
    .update({ status: 'archived' })
    .eq('id', courseId);
  if (error) throw error;
  return { success: true };
}

export async function draftCourse(courseId: string) {
   if (!supabaseAdmin) throw new Error("Supabase Admin not initialized");
   const { error } = await supabaseAdmin
     .from('courses')
     .update({ status: 'draft' })
     .eq('id', courseId);
   if (error) throw error;
   return { success: true };
}
 
export async function deleteCourse(courseId: string) {
  if (!supabaseAdmin) throw new Error("Supabase Admin not initialized");
  const { error } = await supabaseAdmin
    .from('courses')
    .delete()
    .eq('id', courseId);
  if (error) throw error;
  return { success: true };
}

export async function saveCourse(courseData: Partial<CourseInput>, isEditing: boolean, courseId?: string) {
  if (!supabaseAdmin) throw new Error("Supabase Admin not initialized");

  if (!courseData.title || !courseData.description || !courseData.instructor || !courseData.level || courseData.duration === undefined || courseData.lessons === undefined || courseData.price === undefined || !courseData.status) {
    throw new Error("Course title, description, instructor, level, duration, lessons, price, and status are required.");
  }

  const normalizedDuration =
    typeof courseData.duration === "number"
      ? courseData.duration
      : parseInt(String(courseData.duration).replace(/[^\d]/g, ""), 10);
  const normalizedPrice =
    typeof courseData.price === "number"
      ? courseData.price
      : parseFloat(String(courseData.price).replace(/[^\d.]/g, ""));

  if (!Number.isFinite(normalizedDuration) || normalizedDuration <= 0) {
    throw new Error("Course duration must be a positive number of minutes.");
  }

  if (!Number.isFinite(normalizedPrice) || normalizedPrice < 0) {
    throw new Error("Course price must be zero or greater.");
  }

  const payload = {
    ...courseData,
    duration: normalizedDuration,
    price: normalizedPrice.toFixed(2),
    rating: courseData.rating ?? 0,
    thumbnail_url: courseData.thumbnail_url || null,
    video_path: courseData.video_path || null,
  };

  if (isEditing && courseId) {
    const { error } = await supabaseAdmin
      .from('courses')
      .update(payload)
      .eq('id', courseId);
    if (error) throw error;
  } else {
    const { error } = await supabaseAdmin
      .from('courses')
      .insert([payload]);
    if (error) throw error;
  }
  
  return { success: true };
}


// ==========================================
// Community Management Actions
// ==========================================

export async function approvePost(postId: string) {
  if (!supabaseAdmin) throw new Error("Supabase Admin not initialized");
  const { error } = await supabaseAdmin
    .from('community_posts')
    .update({ status: 'approved' })
    .eq('id', postId);
  if (error) throw error;
  return { success: true };
}

export async function rejectPost(postId: string) {
  if (!supabaseAdmin) throw new Error("Supabase Admin not initialized");
  const { error } = await supabaseAdmin
    .from('community_posts')
    .update({ status: 'rejected' })
    .eq('id', postId);
  if (error) throw error;
  return { success: true };
}

export async function flagPost(postId: string) {
  if (!supabaseAdmin) throw new Error("Supabase Admin not initialized");
  const { error } = await supabaseAdmin
    .from('community_posts')
    .update({ status: 'flagged' })
    .eq('id', postId);
  if (error) throw error;
  return { success: true };
}

export async function deletePost(postId: string) {
  if (!supabaseAdmin) throw new Error("Supabase Admin not initialized");
  const { error } = await supabaseAdmin
    .from('community_posts')
    .delete()
    .eq('id', postId);
  if (error) throw error;
  return { success: true };
}

export async function bulkApprovePosts(postIds: string[]) {
  if (!supabaseAdmin) throw new Error("Supabase Admin not initialized");
  const { error } = await supabaseAdmin
    .from('community_posts')
    .update({ status: 'approved' })
    .in('id', postIds);
  if (error) throw error;
  return { success: true };
}

export async function bulkRejectPosts(postIds: string[]) {
  if (!supabaseAdmin) throw new Error("Supabase Admin not initialized");
  const { error } = await supabaseAdmin
    .from('community_posts')
    .update({ status: 'rejected' })
    .in('id', postIds);
  if (error) throw error;
  return { success: true };
}

export async function bulkDeletePosts(postIds: string[]) {
  if (!supabaseAdmin) throw new Error("Supabase Admin not initialized");
  const { error } = await supabaseAdmin
    .from('community_posts')
    .delete()
    .in('id', postIds);
  if (error) throw error;
  return { success: true };
}

export async function getAdminSettings() {
  return loadAdminSettings();
}

export async function saveAdminSettings(settings: AdminSettings) {
  const nextSettings = {
    ...DEFAULT_ADMIN_SETTINGS,
    ...settings,
  };

  await saveAdminSettingsRecord(nextSettings);
  return nextSettings;
}

export async function getAdminEmailCampaigns() {
  if (!supabaseAdmin) throw new Error("Supabase Admin not initialized");

  const { data, error } = await supabaseAdmin
    .from("admin_email_campaigns")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data || []).map((campaign: EmailCampaign) => ({
    id: campaign.id,
    title: campaign.title,
    audience: campaign.audience,
    status: campaign.status,
    sendDate: campaign.send_date ? new Date(campaign.send_date).toISOString().slice(0, 10) : "Not scheduled",
    openRate: campaign.open_rate || 0,
    clickRate: campaign.click_rate || 0,
    subject: campaign.subject,
    message: campaign.message,
    createdAt: campaign.created_at,
    sentTo: campaign.sent_to || [],
  }));
}

export async function sendAdminTestEmail(input: {
  title: string;
  audience: string;
  subject: string;
  message: string;
}) {
  if (!supabaseAdmin) throw new Error("Supabase Admin not initialized");

  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = Number(process.env.SMTP_PORT || 587);
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const smtpFrom = process.env.SMTP_FROM || smtpUser;
  const adminRecipients = (process.env.ADMIN_NOTIFY_EMAILS || "")
    .split(",")
    .map((email) => email.trim())
    .filter(Boolean);

  if (!smtpHost || !smtpUser || !smtpPass || !smtpFrom) {
    throw new Error("SMTP is not configured.");
  }

  if (adminRecipients.length === 0) {
    throw new Error("ADMIN_NOTIFY_EMAILS is not configured.");
  }

  const transport = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: String(process.env.SMTP_SECURE).toLowerCase() === "true",
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });

  await transport.sendMail({
    from: smtpFrom,
    to: adminRecipients,
    subject: input.subject,
    text: input.message,
    html: `<div style="font-family:Arial,sans-serif;line-height:1.6"><h2>${input.subject}</h2><p>${input.message.replace(/\n/g, "<br />")}</p></div>`,
  });

  const { error } = await supabaseAdmin.from("admin_email_campaigns").insert({
    title: input.title.trim() || input.subject.trim(),
    audience: input.audience.trim() || "Admin test audience",
    status: "sent",
    send_date: new Date().toISOString(),
    subject: input.subject.trim(),
    message: input.message.trim(),
    sent_to: adminRecipients,
  });

  if (error) throw error;

  return { success: true, sentTo: adminRecipients.length };
}

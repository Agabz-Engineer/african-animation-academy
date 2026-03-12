"use server";

import { supabaseAdmin } from "@/lib/supabaseAdmin";

// ==========================================
// Data Fetching Actions (Bypass RLS)
// ==========================================

export async function getAdminDashboardData() {
  if (!supabaseAdmin) throw new Error("Supabase Admin not initialized");

  const [
    { count: totalUsers },
    { count: activeUsers },
    { count: totalCourses },
    { count: publishedCourses },
    { count: totalPosts },
    { count: pendingPosts },
    { data: payments }
  ] = await Promise.all([
    supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabaseAdmin.from('courses').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('courses').select('*', { count: 'exact', head: true }).eq('status', 'published'),
    supabaseAdmin.from('community_posts').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('community_posts').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabaseAdmin.from('payments').select('amount, created_at').eq('status', 'completed')
  ]);

  const today = new Date().toISOString().split('T')[0];
  const { count: newUsersToday } = await supabaseAdmin
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', today);

  const totalRevenue = payments?.reduce((sum, p) => sum + parseFloat(p.amount), 0) || 0;
  
  const thisMonth = new Date().toISOString().slice(0, 7);
  const monthlyRevenue = payments
    ?.filter(p => p.created_at.startsWith(thisMonth))
    .reduce((sum, p) => sum + parseFloat(p.amount), 0) || 0;

  return {
    totalUsers: totalUsers || 0,
    activeUsers: activeUsers || 0,
    newUsersToday: newUsersToday || 0,
    totalCourses: totalCourses || 0,
    publishedCourses: publishedCourses || 0,
    totalPosts: totalPosts || 0,
    pendingPosts: pendingPosts || 0,
    totalRevenue,
    monthlyRevenue,
  };
}

export async function getAdminUsers() {
  if (!supabaseAdmin) throw new Error("Supabase Admin not initialized");
  
  const { data: profiles, error: profilesError } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (profilesError) throw profilesError;

  const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers();
  if (authError) throw authError;

  return { profiles: profiles || [], authUsers: authUsers.users || [] };
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
      profiles!inner (full_name, avatar_url),
      community_reports (count)
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

// ==========================================
// User Management Actions
// ==========================================

export async function banUser(userId: string) {
  if (!supabaseAdmin) throw new Error("Supabase Admin not initialized");
  const { error } = await supabaseAdmin
    .from('profiles')
    .update({ status: 'banned' })
    .eq('id', userId);
  if (error) throw error;
  return { success: true };
}

export async function unbanUser(userId: string) {
   if (!supabaseAdmin) throw new Error("Supabase Admin not initialized");
   const { error } = await supabaseAdmin
    .from('profiles')
    .update({ status: 'active' })
    .eq('id', userId);
   if (error) throw error;
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

export async function saveCourse(courseData: any, isEditing: boolean, courseId?: string) {
  if (!supabaseAdmin) throw new Error("Supabase Admin not initialized");
  
  if (isEditing && courseId) {
    const { error } = await supabaseAdmin
      .from('courses')
      .update(courseData)
      .eq('id', courseId);
    if (error) throw error;
  } else {
    const { error } = await supabaseAdmin
      .from('courses')
      .insert([courseData]);
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

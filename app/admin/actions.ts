"use server";

import { supabaseAdmin } from "@/lib/supabaseAdmin";

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

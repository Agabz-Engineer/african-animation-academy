"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import type { RealtimeChannel } from "@supabase/supabase-js";
import {
  CalendarDays,
  Flame,
  Hash,
  Heart,
  Lock,
  MessageCircle,
  MessageSquare,
  PenSquare,
  Search,
  Send,
  Sparkles,
  Trophy,
  Users,
  Zap,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useGamification } from "@/lib/useGamification";
import { useThemeMode } from "@/lib/useThemeMode";
import { getMembershipAccess } from "@/lib/membership";
import FollowButton from "@/app/components/ui/FollowButton";
import MessageModal from "@/app/components/ui/MessageModal";

type FeedFilter = "For You" | "Latest" | "Following";

type CommunityPost = {
  id: string;
  userId: string | null;
  userName: string;
  userHandle: string;
  content: string;
  tags: string[];
  likesCount: number;
  commentsCount: number;
  createdAt: string;
  isFollowing: boolean;
  profiles?: {
    followers_count: number;
    total_platform_likes: number;
    avatar_url: string | null;
  };
};

type DbPost = {
  id: string;
  user_id: string | null;
  user_name: string | null;
  user_handle: string | null;
  content: string;
  tags: string[] | null;
  likes_count: number | null;
  comments_count: number | null;
  created_at: string;
  profiles?:
    | {
        followers_count: number;
        total_platform_likes: number;
        avatar_url: string | null;
      }
    | {
        followers_count: number;
        total_platform_likes: number;
        avatar_url: string | null;
      }[];
};

type CommunityComment = {
  id: string;
  postId: string;
  userId?: string | null;
  userName: string;
  userHandle: string;
  content: string;
  createdAt: string;
};

type DbComment = {
  id: string;
  post_id: string;
  user_id: string | null;
  user_name: string | null;
  user_handle: string | null;
  content: string;
  created_at: string;
};

type DbLike = {
  post_id: string;
  user_id: string;
};

type UserSummary = { id: string; name: string; handle: string };

type PublicAdminSettings = {
  maintenanceMode: boolean;
  allowSignups: boolean;
  postModeration: boolean;
  paymentSandbox: boolean;
  notificationAlerts: boolean;
};

const groupCommentsByPost = (comments: CommunityComment[]) => {
  return comments.reduce<Record<string, CommunityComment[]>>((acc, comment) => {
    if (!acc[comment.postId]) acc[comment.postId] = [];
    acc[comment.postId].push(comment);
    acc[comment.postId].sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt));
    return acc;
  }, {});
};

const mergePosts = (...sources: CommunityPost[][]): CommunityPost[] => {
  const seen = new Set<string>();
  const merged: CommunityPost[] = [];
  sources.flat().forEach((post) => {
    if (!seen.has(post.id)) {
      seen.add(post.id);
      merged.push(post);
    }
  });
  return merged.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
};


const DARK = {
  pageBg: "#222222",
  pageGlowA: "rgba(255,109,31,0.17)",
  pageGlowB: "rgba(255,109,31,0.12)",
  panel: "rgba(44, 44, 44, 0.90)",
  panelSoft: "rgba(44, 44, 44, 0.72)",
  border: "rgba(255,255,255,0.12)",
  text: "#FAF3E1",
  muted: "#D2C9B8",
  dim: "#9E9688",
  accent: "#FF6D1F",
  accentSoft: "rgba(255,109,31,0.18)",
  chip: "rgba(255,255,255,0.06)",
  input: "#2C2C2C",
  highlight: "#FF6D1F",
  danger: "#E46464",
};

const LIGHT = {
  pageBg: "#FAF3E1",
  pageGlowA: "rgba(255,109,31,0.14)",
  pageGlowB: "rgba(255,109,31,0.19)",
  panel: "rgba(255, 255, 255, 0.89)",
  panelSoft: "rgba(255, 255, 255, 0.72)",
  border: "rgba(0, 0, 0, 0.12)",
  text: "#222222",
  muted: "#555555",
  dim: "#9E9688",
  accent: "#FF6D1F",
  accentSoft: "rgba(255,109,31,0.12)",
  chip: "rgba(0,0,0,0.045)",
  input: "#FFFFFF",
  highlight: "#FF6D1F",
  danger: "#C94040",
};

const timeAgo = (isoDate: string) => {
  const mins = Math.floor((Date.now() - new Date(isoDate).getTime()) / 60000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.floor(hrs / 24)}d`;
};

const parseTags = (value: string) =>
  value
    .split(",")
    .map((item) => item.trim().replace(/^#/, "").toLowerCase())
    .filter(Boolean)
    .slice(0, 4);

const normalizePost = (row: DbPost, followedIds: Set<string>): CommunityPost => ({
  id: row.id,
  userId: row.user_id,
  userName: row.user_name || "Animator",
  userHandle: row.user_handle || "animator",
  content: row.content,
  tags: Array.isArray(row.tags) ? row.tags : [],
  likesCount: Math.max(0, row.likes_count || 0),
  commentsCount: Math.max(0, row.comments_count || 0),
  createdAt: row.created_at,
  isFollowing: typeof row.user_id === "string" ? followedIds.has(row.user_id) : false,
  profiles: Array.isArray(row.profiles) ? row.profiles[0] ?? null : row.profiles
});

const normalizeComment = (row: DbComment): CommunityComment => ({
  id: row.id,
  postId: row.post_id,
  userId: row.user_id,
  userName: row.user_name || "Animator",
  userHandle: row.user_handle || "animator",
  content: row.content,
  createdAt: row.created_at,
});

const isPermissionError = (error: { message?: string; code?: string } | null) =>
  Boolean(
    error &&
      (error.code === "42501" ||
        `${error.message || ""}`.toLowerCase().includes("permission denied"))
  );

const isMissingTableError = (
  error: { message?: string; code?: string } | null,
  tableName: string
) =>
  Boolean(
    error &&
      (error.code === "42P01" ||
        (`${error.message || ""}`.toLowerCase().includes("does not exist") &&
          `${error.message || ""}`.toLowerCase().includes(tableName)) ||
        (`${error.message || ""}`.toLowerCase().includes("could not find the table") &&
          `${error.message || ""}`.toLowerCase().includes(tableName)))
  );

const isSetupError = (error: { message?: string; code?: string } | null) =>
  isMissingTableError(error, "community_posts");

const isCommentSetupError = (error: { message?: string; code?: string } | null) =>
  isMissingTableError(error, "community_post_comments");

const isLikeSetupError = (error: { message?: string; code?: string } | null) =>
  isMissingTableError(error, "community_post_likes");

export default function CommunityPage() {
  const theme = useThemeMode();
  const T = theme === "dark" ? DARK : LIGHT;

  const [user, setUser] = useState<UserSummary | null>(null);
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [setupNeeded, setSetupNeeded] = useState(false);
  const [filter, setFilter] = useState<FeedFilter>("For You");
  const [search, setSearch] = useState("");
  const [liked, setLiked] = useState<Set<string>>(new Set());
  const [postText, setPostText] = useState("");
  const [postTags, setPostTags] = useState("wip, character");
  const [submitPending, setSubmitPending] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitInfo, setSubmitInfo] = useState("");
  const [commentsByPost, setCommentsByPost] = useState<Record<string, CommunityComment[]>>({});
  const [commentsSetupNeeded, setCommentsSetupNeeded] = useState(false);
  const [commentsAuthNeeded, setCommentsAuthNeeded] = useState(false);
  const [likesSetupNeeded, setLikesSetupNeeded] = useState(false);
  const [memberCount, setMemberCount] = useState(0);
  const [likePendingFor, setLikePendingFor] = useState<string | null>(null);
  const [openCommentFor, setOpenCommentFor] = useState<string | null>(null);
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});
  const [followedIds, setFollowedIds] = useState<Set<string>>(new Set());
  const [publicSettings, setPublicSettings] = useState<PublicAdminSettings | null>(null);
  const [hasProAccess, setHasProAccess] = useState(false);

  const refreshFollowersCount = async (targetUserId: string) => {
    if (!supabase) return;
    const { data, error } = await supabase
      .from("profiles")
      .select("followers_count")
      .eq("id", targetUserId)
      .single();
    if (error || !data) return;
    setPosts((prev) =>
      prev.map((post) =>
        post.userId === targetUserId
          ? {
              ...post,
              profiles: {
                followers_count: data.followers_count,
                total_platform_likes: post.profiles?.total_platform_likes ?? 0,
                avatar_url: post.profiles?.avatar_url ?? null
              }
            }
          : post
      )
    );
  };
  const [commentPendingFor, setCommentPendingFor] = useState<string | null>(null);
  const [commentErrorByPost, setCommentErrorByPost] = useState<Record<string, string>>({});
  const [commentInfoByPost, setCommentInfoByPost] = useState<Record<string, string>>({});
  const {
    state: momentum,
    quests,
    questsCompletedToday,
    questsTotalToday,
    recordAction,
  } = useGamification(user?.id || null);
  const pendingQuestPreview = quests.filter((quest) => !quest.completed).slice(0, 3);
  const questReminder =
    pendingQuestPreview.length > 0
      ? `${pendingQuestPreview[0].title} (${pendingQuestPreview[0].remaining} left)`
      : "All daily tasks complete. Keep posting and supporting others.";

  const userIdRef = useRef<string | null>(null);
  const likedRef = useRef<Set<string>>(new Set());
  const commentsByPostRef = useRef<Record<string, CommunityComment[]>>({});
  const followedIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    userIdRef.current = user?.id ?? null;
    likedRef.current = liked;
    commentsByPostRef.current = commentsByPost;
    followedIdsRef.current = followedIds;
  }, [user, liked, commentsByPost, followedIds]);

  useEffect(() => {
    let active = true;

    const loadPublicSettings = async () => {
      try {
        const response = await fetch("/api/public/settings");
        if (!response.ok) return;
        const data = (await response.json()) as PublicAdminSettings;
        if (active) setPublicSettings(data);
      } catch (error) {
        console.warn("Failed to load public admin settings:", error);
      }
    };

    void loadPublicSettings();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    let channel: RealtimeChannel | null = null;
    const client = supabase;

    const load = async () => {
      if (!client) {
        if (!mounted) return;
        setPosts([]);
        setCommentsByPost({});
        setSubmitInfo("Live community is unavailable. Configure Supabase to load posts.");
        setLoading(false);
        return;
      }

      const [
        { data: userData },
        { data: postData, error: postError },
        { data: commentData, error: commentError },
      ] = await Promise.all([
        client.auth.getUser(),
        (() => {
          let query = client
            .from("community_posts")
            .select("id, user_id, user_name, user_handle, content, tags, likes_count, comments_count, created_at, profiles!community_posts_user_id_fkey(followers_count, total_platform_likes, avatar_url)")
            .order("created_at", { ascending: false })
            .limit(40)
            .neq("status", "rejected");

          if (publicSettings?.postModeration) {
            query = query.eq("status", "approved");
          }

          return query;
        })(),
        client
          .from("community_post_comments")
          .select("id,post_id,user_id,user_name,user_handle,content,created_at")
          .order("created_at", { ascending: true })
          .limit(250),
      ]);

      if (!mounted) return;

      const authUser = userData.user;
      const followedIds = new Set<string>();
      if (authUser) {
        const meta = authUser.user_metadata || {};
        const name =
          (typeof meta.full_name === "string" && meta.full_name) ||
          (typeof meta.username === "string" && meta.username) ||
          authUser.email?.split("@")[0] ||
          "Creative";
        const handle = name
          .toLowerCase()
          .replace(/[^a-z0-9_]/g, "_")
          .replace(/_+/g, "_")
          .replace(/^_+|_+$/g, "")
          .slice(0, 20);
        setUser({ id: authUser.id, name, handle: handle || "creative" });
        const access = await getMembershipAccess(client, authUser.id);
        setHasProAccess(access.hasPro);

        const { data: followData } = await client
          .from("user_follows")
          .select("following_id")
          .eq("follower_id", authUser.id);

        if (followData) {
          const ids = new Set(followData.map((f) => f.following_id));
          ids.add(authUser.id);
          setFollowedIds(ids);
          ids.forEach((id) => followedIds.add(id));
        }
        followedIds.add(authUser.id);
      } else {
        setUser(null);
        setHasProAccess(false);
      }

      const livePosts = Array.isArray(postData) ? (postData as DbPost[]).map(p => normalizePost(p, followedIds)) : [];
      const liveComments = Array.isArray(commentData) ? (commentData as DbComment[]).map(normalizeComment) : [];
      const livePostIds = livePosts.map((post) => post.id);
      let likeRows: DbLike[] = [];

      if (!postError && livePostIds.length > 0) {
        const { data: likeData, error: likeError } = await client
          .from("community_post_likes")
          .select("post_id,user_id")
          .in("post_id", livePostIds)
          .limit(5000);

        if (likeError) {
          setLikesSetupNeeded(isLikeSetupError(likeError));
        } else {
          setLikesSetupNeeded(false);
          likeRows = Array.isArray(likeData) ? (likeData as DbLike[]) : [];
        }
      } else {
        setLikesSetupNeeded(false);
      }

      if (authUser && likeRows.length > 0) {
        setLiked(
          new Set(
            likeRows
              .filter((row) => row.user_id === authUser.id)
              .map((row) => row.post_id)
          )
        );
      } else {
        setLiked(new Set());
      }

      const likesByPost = likeRows.reduce<Map<string, number>>((acc, row) => {
        acc.set(row.post_id, (acc.get(row.post_id) || 0) + 1);
        return acc;
      }, new Map<string, number>());

      if (postError) {
        const missingSetup = isSetupError(postError);
        const needsAuth = isPermissionError(postError) && !authUser;
        setSetupNeeded(missingSetup);
        setPosts([]);
        if (missingSetup) {
          setSubmitInfo("Live community database is not configured yet.");
        } else if (needsAuth) {
          setSubmitInfo("Sign in to load live community posts.");
        } else {
          setSubmitInfo("Unable to load community posts right now.");
        }
      } else {
        const livePostsWithLikes = livePosts.map((post) => ({
          ...post,
          likesCount: likesByPost.get(post.id) ?? post.likesCount,
        }));
        setSetupNeeded(false);
        setSubmitInfo("");
        setPosts(mergePosts(livePostsWithLikes));
      }

      if (commentError) {
        const missingCommentsSetup = isCommentSetupError(commentError);
        const needsAuth = isPermissionError(commentError) && !authUser;
        setCommentsSetupNeeded(missingCommentsSetup);
        setCommentsAuthNeeded(needsAuth);
        setCommentsByPost({});
      } else {
        setCommentsSetupNeeded(false);
        setCommentsAuthNeeded(false);
        setCommentsByPost(groupCommentsByPost(liveComments));
      }

      const liveMembers = new Set<string>();
      livePosts.forEach((post) => {
        if (typeof post.userId === "string" && post.userId) liveMembers.add(post.userId);
      });
      liveComments.forEach((comment) => {
        if (typeof comment.userId === "string" && comment.userId) liveMembers.add(comment.userId);
      });
      likeRows.forEach((row) => {
        if (row.user_id) liveMembers.add(row.user_id);
      });

      if (authUser) liveMembers.add(authUser.id);
      setMemberCount(liveMembers.size);

      setLoading(false);
    };

    const subscribeToLive = () => {
      if (!client) return;
      channel = client
        .channel("community-feed")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "community_posts" },
          async (payload) => {
            if (!mounted) return;
            const eventType = payload.eventType;
            if (eventType === "INSERT") {
              const row = payload.new as DbPost;
              const { data } = await client
                .from("community_posts")
                .select("*, profiles!community_posts_user_id_fkey(followers_count, total_platform_likes, avatar_url)")
                .eq("id", row.id)
                .single();
              if (!mounted) return;
              const normalized = data
                ? normalizePost(data as DbPost, followedIdsRef.current)
                : normalizePost(row, followedIdsRef.current);
              setPosts((prev) => mergePosts([normalized], prev));
              return;
            }
            if (eventType === "UPDATE") {
              const row = payload.new as DbPost;
              const normalized = normalizePost(row, followedIdsRef.current);
              setPosts((prev) =>
                prev.map((post) =>
                  post.id === row.id
                    ? {
                        ...post,
                        ...normalized,
                        likesCount: post.likesCount,
                        commentsCount: post.commentsCount,
                        isFollowing: post.isFollowing,
                        profiles: normalized.profiles ?? post.profiles,
                      }
                    : post
                )
              );
              return;
            }
            if (eventType === "DELETE") {
              const row = payload.old as DbPost;
              if (!row?.id) return;
              setPosts((prev) => prev.filter((post) => post.id !== row.id));
              setCommentsByPost((prev) => {
                if (!prev[row.id]) return prev;
                const next = { ...prev };
                delete next[row.id];
                return next;
              });
              setLiked((prev) => {
                if (!prev.has(row.id)) return prev;
                const next = new Set(prev);
                next.delete(row.id);
                return next;
              });
            }
          }
        )
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "community_post_comments" },
          (payload) => {
            if (!mounted) return;
            const eventType = payload.eventType;
            if (eventType === "INSERT") {
              const row = payload.new as DbComment;
              const existing = commentsByPostRef.current[row.post_id] || [];
              if (existing.some((comment) => comment.id === row.id)) return;
              const normalized = normalizeComment(row);
              setCommentsByPost((prev) => {
                const nextForPost = [...(prev[row.post_id] || []), normalized].sort(
                  (a, b) => +new Date(a.createdAt) - +new Date(b.createdAt)
                );
                const next = { ...prev, [row.post_id]: nextForPost };
                commentsByPostRef.current = next;
                return next;
              });
              setPosts((prev) =>
                prev.map((post) =>
                  post.id === row.post_id
                    ? { ...post, commentsCount: Math.max(0, post.commentsCount + 1) }
                    : post
                )
              );
              return;
            }
            if (eventType === "UPDATE") {
              const row = payload.new as DbComment;
              setCommentsByPost((prev) => {
                const nextForPost = (prev[row.post_id] || []).map((comment) =>
                  comment.id === row.id ? normalizeComment(row) : comment
                );
                const next = { ...prev, [row.post_id]: nextForPost };
                commentsByPostRef.current = next;
                return next;
              });
              return;
            }
            if (eventType === "DELETE") {
              const row = payload.old as DbComment;
              if (!row?.post_id) return;
              const existing = commentsByPostRef.current[row.post_id] || [];
              if (!existing.some((comment) => comment.id === row.id)) return;
              setCommentsByPost((prev) => {
                const nextForPost = (prev[row.post_id] || []).filter((comment) => comment.id !== row.id);
                if (nextForPost.length === 0) {
                  const next = { ...prev };
                  delete next[row.post_id];
                  commentsByPostRef.current = next;
                  return next;
                }
                const next = { ...prev, [row.post_id]: nextForPost };
                commentsByPostRef.current = next;
                return next;
              });
              setPosts((prev) =>
                prev.map((post) =>
                  post.id === row.post_id
                    ? { ...post, commentsCount: Math.max(0, post.commentsCount - 1) }
                    : post
                )
              );
            }
          }
        )
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "community_post_likes" },
          (payload) => {
            if (!mounted) return;
            const eventType = payload.eventType;
            if (eventType === "INSERT") {
              const row = payload.new as DbLike;
              const isSelf = userIdRef.current && row.user_id === userIdRef.current;
              const alreadySelfLiked = isSelf && likedRef.current.has(row.post_id);
              if (!alreadySelfLiked) {
                setPosts((prev) =>
                  prev.map((post) =>
                    post.id === row.post_id
                      ? { ...post, likesCount: Math.max(0, post.likesCount + 1) }
                      : post
                  )
                );
              }
              if (isSelf && !likedRef.current.has(row.post_id)) {
                setLiked((prev) => {
                  const next = new Set(prev);
                  next.add(row.post_id);
                  likedRef.current = next;
                  return next;
                });
              }
              return;
            }
            if (eventType === "DELETE") {
              const row = payload.old as DbLike;
              const isSelf = userIdRef.current && row.user_id === userIdRef.current;
              const shouldDecrement = !isSelf || likedRef.current.has(row.post_id);
              if (shouldDecrement) {
                setPosts((prev) =>
                  prev.map((post) =>
                    post.id === row.post_id
                      ? { ...post, likesCount: Math.max(0, post.likesCount - 1) }
                      : post
                  )
                );
              }
              if (isSelf && likedRef.current.has(row.post_id)) {
                setLiked((prev) => {
                  const next = new Set(prev);
                  next.delete(row.post_id);
                  likedRef.current = next;
                  return next;
                });
              }
            }
          }
        )
        .subscribe();
    };

    load().then(() => {
      if (mounted) subscribeToLive();
    });

    return () => {
      mounted = false;
      if (channel && client) {
        client.removeChannel(channel);
      }
    };
  }, [publicSettings?.postModeration]);

  const filteredPosts = useMemo(() => {
    let next = [...posts];
    if (filter === "Latest") {
      next.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
    }
    if (filter === "Following") {
      next = next.filter((post) => post.isFollowing);
    }
    const q = search.trim().toLowerCase();
    if (q) {
      next = next.filter(
        (post) =>
          post.content.toLowerCase().includes(q) ||
          post.userName.toLowerCase().includes(q) ||
          post.tags.join(" ").toLowerCase().includes(q)
      );
    }
    return next;
  }, [filter, posts, search]);

  const trendingTags = useMemo<Array<[string, number]>>(() => {
    const map = new Map<string, number>();
    posts.forEach((post) => {
      post.tags.forEach((tag) => map.set(tag, (map.get(tag) || 0) + 1));
    });
    const ranked = Array.from(map.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5);
    return ranked.length > 0 ? ranked : [["wip", 4], ["character", 3], ["blender", 2]];
  }, [posts]);

  const toggleLike = async (postId: string) => {
    const alreadyLiked = liked.has(postId);

    const applyLikeLocally = (likeIt: boolean) => {
      setLiked((prev) => {
        const next = new Set(prev);
        if (likeIt) next.add(postId);
        else next.delete(postId);
        likedRef.current = next;
        return next;
      });
      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId
            ? { ...post, likesCount: Math.max(0, post.likesCount + (likeIt ? 1 : -1)) }
            : post
        )
      );
      if (likeIt && !alreadyLiked) {
        recordAction("like");
      }
    };

    if (!user) {
      setSubmitError("Sign in to like posts.");
      return;
    }

    if (likePendingFor === postId) return;

    if (!supabase) {
      setSubmitError("Live likes are unavailable. Configure Supabase first.");
      return;
    }

    if (likesSetupNeeded) {
      setSubmitError("Likes are not configured yet.");
      return;
    }

    setLikePendingFor(postId);

    if (alreadyLiked) {
      const { error } = await supabase
        .from("community_post_likes")
        .delete()
        .eq("post_id", postId)
        .eq("user_id", user.id);
      setLikePendingFor(null);

      if (error) {
        if (isLikeSetupError(error || null)) {
          setLikesSetupNeeded(true);
          setSubmitError("Likes are not configured yet.");
          return;
        }
        setSubmitError(error.message || "Could not remove like.");
        return;
      }

      applyLikeLocally(false);
      return;
    }

    if (!supabase) return;
    const { error } = await supabase
      .from("community_post_likes")
      .insert({ post_id: postId, user_id: user.id });
    setLikePendingFor(null);

    if (error) {
      if (error.code === "23505") {
        // Like row already exists; sync local UI state without re-incrementing.
        setLiked((prev) => {
          const next = new Set(prev);
          next.add(postId);
          likedRef.current = next;
          return next;
        });
        return;
      }
      if (isLikeSetupError(error || null)) {
        setLikesSetupNeeded(true);
        setSubmitError("Likes are not configured yet.");
        return;
      }
      setSubmitError(error.message || "Could not like post.");
      return;
    }

    applyLikeLocally(true);
  };

  const publishPost = async () => {
    setSubmitError("");
    setSubmitInfo("");

    if (!user) {
      setSubmitError("Sign in first so the post is linked to your account.");
      return;
    }

    if (!hasProAccess) {
      setSubmitError("Upgrade to Pro to publish in the community feed.");
      return;
    }

    const content = postText.trim();
    if (content.length < 8) {
      setSubmitError("Write at least 8 characters.");
      return;
    }

    if (publicSettings?.maintenanceMode) {
      setSubmitError("Community posting is temporarily paused during maintenance.");
      return;
    }

    const tags = parseTags(postTags);

    if (setupNeeded) {
      setSubmitError("Live community database is not configured yet.");
      return;
    }

    setSubmitPending(true);
    if (!supabase) {
      setSubmitPending(false);
      setSubmitError("Live community is unavailable. Configure Supabase first.");
      return;
    }
    const { data, error } = await supabase
      .from("community_posts")
      .insert({
        user_id: user.id,
        user_name: user.name,
        user_handle: user.handle,
        content,
        tags,
        status: publicSettings?.postModeration ? "pending" : "approved",
      })
      .select("*, profiles!community_posts_user_id_fkey(followers_count, total_platform_likes, avatar_url)")
      .single();
    setSubmitPending(false);

    if (error || !data) {
      if (isSetupError(error || null)) {
        setSetupNeeded(true);
        setSubmitError("Live community database is not configured yet.");
        return;
      }
      setSubmitError(error?.message || "Post failed.");
      return;
    }

    if (!publicSettings?.postModeration) {
      setPosts((prev) => mergePosts([normalizePost(data as DbPost, followedIds)], prev));
    }
    setFilter("Latest");
    setPostText("");
    setSubmitInfo(publicSettings?.postModeration ? "Post submitted for admin review." : "Posted to live community.");
    recordAction("post");
  };

  const submitComment = async (postId: string) => {
    const content = (commentDrafts[postId] || "").trim();
    setCommentErrorByPost((prev) => ({ ...prev, [postId]: "" }));
    setCommentInfoByPost((prev) => ({ ...prev, [postId]: "" }));

    if (!user) {
      setCommentErrorByPost((prev) => ({ ...prev, [postId]: "Sign in to comment." }));
      return;
    }
    if (!hasProAccess) {
      setCommentErrorByPost((prev) => ({ ...prev, [postId]: "Upgrade to Pro to join the conversation." }));
      return;
    }
    if (content.length < 2) {
      setCommentErrorByPost((prev) => ({ ...prev, [postId]: "Write at least 2 characters." }));
      return;
    }

    const pushCommentToState = (comment: CommunityComment) => {
      setCommentsByPost((prev) => {
        const nextForPost = [...(prev[postId] || []), comment].sort(
          (a, b) => +new Date(a.createdAt) - +new Date(b.createdAt)
        );
        const next = { ...prev, [postId]: nextForPost };
        commentsByPostRef.current = next;
        return next;
      });
      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId ? { ...post, commentsCount: Math.max(0, post.commentsCount + 1) } : post
        )
      );
      setCommentDrafts((prev) => ({ ...prev, [postId]: "" }));
      recordAction("comment");
    };

    if (commentsSetupNeeded) {
      setCommentErrorByPost((prev) => ({ ...prev, [postId]: "Live comments are not configured yet." }));
      return;
    }

    setCommentPendingFor(postId);
    if (!supabase) {
      setCommentPendingFor(null);
      setCommentErrorByPost((prev) => ({ ...prev, [postId]: "Live comments are unavailable right now." }));
      return;
    }
    const { data, error } = await supabase
      .from("community_post_comments")
      .insert({
        post_id: postId,
        user_id: user.id,
        user_name: user.name,
        user_handle: user.handle,
        content,
      })
      .select("id,post_id,user_id,user_name,user_handle,content,created_at")
      .single();
    setCommentPendingFor(null);

    if (error || !data) {
      if (isCommentSetupError(error || null)) {
        setCommentsSetupNeeded(true);
        setCommentErrorByPost((prev) => ({ ...prev, [postId]: "Live comments are not configured yet." }));
        return;
      }
      if (error?.code === "22P02" || error?.code === "23503") {
        setCommentErrorByPost((prev) => ({ ...prev, [postId]: "This post is not available in the live DB yet." }));
        return;
      }
      setCommentErrorByPost((prev) => ({ ...prev, [postId]: error?.message || "Comment failed." }));
      return;
    }

    pushCommentToState(normalizeComment(data as DbComment));
    setCommentInfoByPost((prev) => ({ ...prev, [postId]: "Comment posted." }));
  };

  const getCommentCount = (post: CommunityPost) =>
    Math.max(post.commentsCount, commentsByPost[post.id]?.length || 0);

  const totalLikes = posts.reduce((sum, post) => sum + post.likesCount, 0);

  return (
    <div
      style={{
        minHeight: "100vh",
        color: T.text,
        position: "relative",
        overflow: "hidden",
        background: `radial-gradient(circle at 16% 8%, ${T.pageGlowA}, transparent 38%), radial-gradient(circle at 86% 0%, ${T.pageGlowB}, transparent 42%), ${T.pageBg}`,
      }}
    >
      {theme === "dark" && <div className="community-dark-layer" aria-hidden="true" />}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.06) 100%)" }} />

      <div style={{ position: "relative", zIndex: 1, padding: "1.4rem 1.6rem 3.2rem" }}>
        <section
          style={{
            border: `1px solid ${T.border}`,
            borderRadius: "22px",
            background: `linear-gradient(135deg, ${T.panel} 0%, ${T.panelSoft} 100%)`,
            padding: "1.2rem",
            marginBottom: "1rem",
            boxShadow: "0 18px 45px rgba(0,0,0,0.16)",
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
              borderRadius: "999px",
              border: `1px solid ${T.accent}66`,
              backgroundColor: T.accentSoft,
              color: T.accent,
              padding: "0.34rem 0.78rem",
              fontFamily: "'Satoshi', sans-serif",
              fontSize: "0.74rem",
              fontWeight: 700,
              marginBottom: "0.85rem",
            }}
          >
            <Sparkles style={{ width: "13px", height: "13px" }} />
            Creator Circle
          </div>

          <h1
            style={{
              fontFamily: "'Clash Display', sans-serif",
              fontWeight: 700,
              fontSize: "clamp(2rem, 5vw, 2.7rem)",
              lineHeight: 1.08,
              marginBottom: "0.45rem",
              letterSpacing: "-0.03em",
            }}
          >
            Community
          </h1>

          <p
            style={{
              color: T.muted,
              fontSize: "0.93rem",
              lineHeight: 1.65,
              maxWidth: "760px",
              fontFamily: "'Satoshi', sans-serif",
            }}
          >
            Share WIP shots, ask for critique, and find collaborators. The feed is open to all signed-in creatives, and your updates show instantly.
          </p>

          <div className="community-metric-grid" style={{ marginTop: "0.95rem" }}>
            <div className="community-metric-card" style={{ borderColor: T.border, backgroundColor: T.chip }}>
              <Users style={{ width: "15px", height: "15px", color: T.accent }} />
              <div>
                <p style={{ color: T.dim, fontSize: "0.68rem", fontFamily: "'Satoshi', sans-serif", marginBottom: "0.1rem" }}>Members</p>
                <p style={{ color: T.text, fontSize: "1rem", fontWeight: 700, fontFamily: "'Cabinet Grotesk', sans-serif" }}>{memberCount}</p>
              </div>
            </div>
            <div className="community-metric-card" style={{ borderColor: T.border, backgroundColor: T.chip }}>
              <PenSquare style={{ width: "15px", height: "15px", color: T.accent }} />
              <div>
                <p style={{ color: T.dim, fontSize: "0.68rem", fontFamily: "'Satoshi', sans-serif", marginBottom: "0.1rem" }}>Posts</p>
                <p style={{ color: T.text, fontSize: "1rem", fontWeight: 700, fontFamily: "'Cabinet Grotesk', sans-serif" }}>{posts.length}</p>
              </div>
            </div>
            <div className="community-metric-card" style={{ borderColor: T.border, backgroundColor: T.chip }}>
              <Flame style={{ width: "15px", height: "15px", color: T.accent }} />
              <div>
                <p style={{ color: T.dim, fontSize: "0.68rem", fontFamily: "'Satoshi', sans-serif", marginBottom: "0.1rem" }}>Likes</p>
                <p style={{ color: T.text, fontSize: "1rem", fontWeight: 700, fontFamily: "'Cabinet Grotesk', sans-serif" }}>{totalLikes}</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Discovery Hub ────────────────────────────────────── */}
        <section 
          style={{ 
            display: "grid", 
            gridTemplateColumns: "1fr 1fr", 
            gap: "1rem", 
            marginBottom: "1.5rem" 
          }}
        >
          <Link
            href="/explore/portfolios"
            style={{
              textDecoration: "none",
              border: `1px solid ${T.border}`,
              borderRadius: "18px",
              background: `linear-gradient(135deg, ${T.accent}15 0%, transparent 100%), ${T.panel}`,
              padding: "1.2rem",
              display: "flex",
              flexDirection: "column",
              gap: "0.5rem",
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
              boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-3px)";
              e.currentTarget.style.boxShadow = "0 12px 40px rgba(0,0,0,0.12)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "none";
              e.currentTarget.style.boxShadow = "0 8px 30px rgba(0,0,0,0.08)";
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
              <div style={{ padding: "0.5rem", borderRadius: "10px", backgroundColor: T.accentSoft }}>
                <Users style={{ width: "18px", height: "18px", color: T.accent }} />
              </div>
              <span style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontWeight: 700, fontSize: "1.05rem" }}>Explore Portfolios</span>
            </div>
            <p style={{ margin: 0, fontSize: "0.82rem", color: T.muted, fontFamily: "'Satoshi', sans-serif", lineHeight: 1.5 }}>
              Browse works from creators across the continent and get inspired.
            </p>
          </Link>

          <button
            onClick={() => {
              const composer = document.querySelector("#community-composer");
              if (composer) {
                composer.scrollIntoView({ behavior: "smooth", block: "center" });
              }
            }}
            style={{
              textAlign: "left",
              cursor: "pointer",
              border: `1px solid ${T.border}`,
              borderRadius: "18px",
              background: `linear-gradient(135deg, ${T.accent}15 0%, transparent 100%), ${T.panel}`,
              padding: "1.2rem",
              display: "flex",
              flexDirection: "column",
              gap: "0.5rem",
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
              boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-3px)";
              e.currentTarget.style.boxShadow = "0 12px 40px rgba(0,0,0,0.12)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "none";
              e.currentTarget.style.boxShadow = "0 8px 30px rgba(0,0,0,0.08)";
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
              <div style={{ padding: "0.5rem", borderRadius: "10px", backgroundColor: T.accentSoft }}>
                <PenSquare style={{ width: "18px", height: "18px", color: T.accent }} />
              </div>
              <span style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontWeight: 700, fontSize: "1.05rem" }}>Share Update</span>
            </div>
            <p style={{ margin: 0, fontSize: "0.82rem", color: T.muted, fontFamily: "'Satoshi', sans-serif", lineHeight: 1.5 }}>
              Post your latest WIP, ask for help, or share a milestone.
            </p>
          </button>
        </section>

        <div className="community-grid">
          <section style={{ display: "flex", flexDirection: "column", gap: "0.9rem" }}>
            <div
              id="community-composer"
              style={{
                border: `1px solid ${T.border}`,
                borderRadius: "16px",
                background: T.panel,
                padding: "1rem",
                boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.6rem", marginBottom: "0.68rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                  <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#4CAF50", boxShadow: "0 0 8px #4CAF50" }} />
                  <div>
                    <p style={{ color: T.text, fontSize: "0.92rem", fontFamily: "'Cabinet Grotesk', sans-serif", fontWeight: 700 }}>Live Update</p>
                    <p style={{ color: T.muted, fontSize: "0.78rem", fontFamily: "'Satoshi', sans-serif" }}>
                      {user
                        ? hasProAccess
                          ? `Posting as @${user.handle}`
                          : "Free users can browse, like, follow, and message. Upgrade to Pro to post."
                        : "Sign in to publish to the feed"}
                    </p>
                  </div>
                </div>
                {!user && (
                  <Link
                    href="/login"
                    style={{
                      fontSize: "0.73rem",
                      color: T.accent,
                      display: "inline-flex",
                      gap: "0.35rem",
                      alignItems: "center",
                      fontFamily: "'Satoshi', sans-serif",
                      textDecoration: "none",
                      fontWeight: 700,
                    }}
                  >
                    <Lock style={{ width: "12px", height: "12px" }} />
                    sign in
                  </Link>
                )}
              </div>

              <textarea
                value={postText}
                onChange={(event) => setPostText(event.target.value)}
                placeholder="Share what you are building..."
                disabled={!user || submitPending || !hasProAccess}
                rows={4}
                style={{
                  width: "100%",
                  borderRadius: "11px",
                  border: `1px solid ${T.border}`,
                  backgroundColor: T.input,
                  color: T.text,
                  padding: "0.78rem",
                  fontSize: "0.88rem",
                  outline: "none",
                  resize: "vertical",
                  fontFamily: "'Satoshi', sans-serif",
                }}
              />

              <div className="community-compose-row" style={{ marginTop: "0.58rem" }}>
                <div style={{ position: "relative" }}>
                  <Hash style={{ position: "absolute", left: "0.72rem", top: "50%", transform: "translateY(-50%)", width: "12px", height: "12px", color: T.dim }} />
                  <input
                    value={postTags}
                    onChange={(event) => setPostTags(event.target.value)}
                    disabled={!user || submitPending || !hasProAccess}
                    placeholder="wip, character"
                    style={{
                      width: "100%",
                      borderRadius: "9px",
                      border: `1px solid ${T.border}`,
                      backgroundColor: T.input,
                      color: T.text,
                      padding: "0.58rem 0.75rem 0.58rem 1.92rem",
                      fontSize: "0.8rem",
                      outline: "none",
                      fontFamily: "'Satoshi', sans-serif",
                    }}
                  />
                </div>
                <button
                  onClick={publishPost}
                  disabled={!user || submitPending || !hasProAccess}
                  style={{
                    borderRadius: "10px",
                    border: "none",
                    backgroundColor: user && hasProAccess ? T.accent : T.chip,
                    color: user && hasProAccess ? "#FFFFFF" : T.dim,
                    fontWeight: 700,
                    cursor: user && hasProAccess ? "pointer" : "not-allowed",
                    fontSize: "0.82rem",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.35rem",
                    fontFamily: "'Satoshi', sans-serif",
                  }}
                >
                  <Send style={{ width: "13px", height: "13px" }} />
                  {submitPending ? "Posting..." : hasProAccess ? "Post" : "Pro only"}
                </button>
              </div>

              <p
                style={{
                  marginTop: "0.48rem",
                  fontSize: "0.75rem",
                  color: submitError ? T.danger : submitInfo ? T.accent : T.dim,
                  fontFamily: "'Satoshi', sans-serif",
                }}
              >
                {submitError ||
                  submitInfo ||
                  (user && !hasProAccess
                    ? "Upgrade to Pro to publish posts, comment, and unlock reward-eligible community participation."
                    : "Use tags to help people discover your post quickly.")}
              </p>
            </div>

            <div
              style={{
                border: `1px solid ${T.border}`,
                borderRadius: "14px",
                background: T.panel,
                padding: "0.72rem",
                display: "flex",
                gap: "0.55rem",
                flexWrap: "wrap",
                alignItems: "center",
              }}
            >
              {(["For You", "Latest", "Following"] as FeedFilter[]).map((tab) => {
                const active = filter === tab;
                return (
                  <button
                    key={tab}
                    onClick={() => setFilter(tab)}
                    style={{
                      borderRadius: "999px",
                      border: `1px solid ${active ? T.accent : T.border}`,
                      backgroundColor: active ? T.accentSoft : T.chip,
                      color: active ? T.accent : T.muted,
                      fontSize: "0.76rem",
                      fontWeight: active ? 700 : 500,
                      fontFamily: "'Satoshi', sans-serif",
                      padding: "0.35rem 0.82rem",
                      cursor: "pointer",
                    }}
                  >
                    {tab}
                  </button>
                );
              })}
              <div style={{ marginLeft: "auto", position: "relative", minWidth: "190px", flex: "1 1 230px" }}>
                <Search style={{ position: "absolute", left: "0.72rem", top: "50%", transform: "translateY(-50%)", width: "13px", height: "13px", color: T.dim }} />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search feed"
                  style={{
                    width: "100%",
                    borderRadius: "9px",
                    border: `1px solid ${T.border}`,
                    backgroundColor: T.input,
                    color: T.text,
                    padding: "0.48rem 0.72rem 0.48rem 1.85rem",
                    fontSize: "0.8rem",
                    outline: "none",
                    fontFamily: "'Satoshi', sans-serif",
                  }}
                />
              </div>
            </div>

            {loading ? (
              <div style={{ border: `1px solid ${T.border}`, borderRadius: "16px", backgroundColor: T.panel, padding: "1rem", color: T.dim, fontFamily: "'Satoshi', sans-serif" }}>
                Loading community feed...
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                {filteredPosts.map((post, index) => {
                  const hasLiked = liked.has(post.id);
                  const postComments = commentsByPost[post.id] || [];
                  const commentOpen = openCommentFor === post.id;
                  const visibleCommentCount = getCommentCount(post);
                  return <PostCard key={post.id} post={post} index={index} hasLiked={hasLiked} postComments={postComments} commentOpen={commentOpen} visibleCommentCount={visibleCommentCount} T={T} user={user} hasProAccess={hasProAccess} setOpenCommentFor={setOpenCommentFor} toggleLike={toggleLike} likePendingFor={likePendingFor} commentDrafts={commentDrafts} setCommentDrafts={setCommentDrafts} commentPendingFor={commentPendingFor} submitComment={submitComment} commentErrorByPost={commentErrorByPost} commentInfoByPost={commentInfoByPost} commentsSetupNeeded={commentsSetupNeeded} commentsAuthNeeded={commentsAuthNeeded} timeAgo={timeAgo} setSearch={setSearch} onFollowUpdate={refreshFollowersCount} />;
                })}
              </AnimatePresence>
            )}
          </section>

          <aside style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
            <div
              style={{
                border: `1px solid ${T.border}`,
                borderRadius: "16px",
                background: T.panel,
                padding: "0.95rem",
                boxShadow: "0 10px 24px rgba(0,0,0,0.1)",
              }}
            >
              <p style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontWeight: 700, fontSize: "1rem", marginBottom: "0.55rem" }}>Community highlights</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.48rem" }}>
                <div style={{ border: `1px solid ${T.border}`, borderRadius: "11px", padding: "0.5rem 0.58rem", backgroundColor: T.chip, display: "flex", gap: "0.48rem", alignItems: "center" }}>
                  <Zap style={{ width: "14px", height: "14px", color: T.accent }} />
                  <span style={{ fontSize: "0.78rem", color: T.muted, fontFamily: "'Satoshi', sans-serif" }}>Fast critique threads on WIP posts</span>
                </div>
                <div style={{ border: `1px solid ${T.border}`, borderRadius: "11px", padding: "0.5rem 0.58rem", backgroundColor: T.chip, display: "flex", gap: "0.48rem", alignItems: "center" }}>
                  <CalendarDays style={{ width: "14px", height: "14px", color: T.accent }} />
                  <span style={{ fontSize: "0.78rem", color: T.muted, fontFamily: "'Satoshi', sans-serif" }}>Monthly challenge prompts and results</span>
                </div>
                <div style={{ border: `1px solid ${T.border}`, borderRadius: "11px", padding: "0.5rem 0.58rem", backgroundColor: T.chip, display: "flex", gap: "0.48rem", alignItems: "center" }}>
                  <Trophy style={{ width: "14px", height: "14px", color: T.accent }} />
                  <span style={{ fontSize: "0.78rem", color: T.muted, fontFamily: "'Satoshi', sans-serif" }}>Weekly standout creators board</span>
                </div>
              </div>
            </div>

            <div
              style={{
                border: `1px solid ${T.border}`,
                borderRadius: "16px",
                background: T.panel,
                padding: "0.9rem",
                boxShadow: "0 10px 24px rgba(0,0,0,0.1)",
              }}
            >
              <p style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontWeight: 700, fontSize: "1rem", marginBottom: "0.2rem" }}>
                Daily creator tasks
              </p>
              <p style={{ color: T.muted, fontSize: "0.75rem", fontFamily: "'Satoshi', sans-serif", marginBottom: "0.42rem" }}>
                {questsCompletedToday}/{questsTotalToday} completed - Level {momentum.level + 1}
              </p>
              <div style={{ height: "4px", borderRadius: "999px", backgroundColor: T.border, overflow: "hidden", marginBottom: "0.5rem" }}>
                <div
                  style={{
                    width: `${questsTotalToday > 0 ? Math.round((questsCompletedToday / questsTotalToday) * 100) : 0}%`,
                    height: "100%",
                    borderRadius: "999px",
                    backgroundColor: T.accent,
                  }}
                />
              </div>
              {pendingQuestPreview.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.36rem" }}>
                  {pendingQuestPreview.map((quest) => (
                    <Link
                      key={quest.id}
                      href={quest.href}
                      onClick={() => {
                        if (quest.action === "course_session") {
                          recordAction("course_session");
                        }
                      }}
                      style={{
                        borderRadius: "10px",
                        border: `1px solid ${T.border}`,
                        backgroundColor: T.chip,
                        color: T.text,
                        padding: "0.38rem 0.55rem",
                        fontSize: "0.75rem",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: "0.4rem",
                        textDecoration: "none",
                        fontFamily: "'Satoshi', sans-serif",
                      }}
                    >
                      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{quest.title}</span>
                      <span style={{ color: T.accent, fontFamily: "'Cabinet Grotesk', sans-serif", fontWeight: 700 }}>
                        {quest.remaining}
                      </span>
                    </Link>
                  ))}
                </div>
              ) : (
                <p style={{ color: T.muted, fontSize: "0.78rem", lineHeight: 1.5, fontFamily: "'Satoshi', sans-serif" }}>
                  You are clear for today. Keep helping the community to keep your momentum rising.
                </p>
              )}
              <p style={{ color: T.dim, fontSize: "0.72rem", marginTop: "0.52rem", fontFamily: "'Satoshi', sans-serif" }}>
                Next reminder: {questReminder}
              </p>
            </div>

            <div
              style={{
                border: `1px solid ${T.border}`,
                borderRadius: "16px",
                background: T.panel,
                padding: "0.9rem",
                boxShadow: "0 10px 24px rgba(0,0,0,0.1)",
              }}
            >
              <p style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontWeight: 700, fontSize: "1rem", marginBottom: "0.5rem" }}>Trending tags</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.42rem" }}>
                {trendingTags.map(([tag, count]) => (
                  <button
                    key={tag}
                    onClick={() => setSearch(tag)}
                    style={{
                      borderRadius: "10px",
                      border: `1px solid ${T.border}`,
                      backgroundColor: T.chip,
                      color: T.text,
                      padding: "0.4rem 0.58rem",
                      fontSize: "0.76rem",
                      display: "flex",
                      justifyContent: "space-between",
                      cursor: "pointer",
                      fontFamily: "'Satoshi', sans-serif",
                    }}
                  >
                    <span>#{tag}</span>
                    <span style={{ color: T.dim }}>{count}</span>
                  </button>
                ))}
              </div>
            </div>

            <div
              style={{
                border: `1px solid ${T.border}`,
                borderRadius: "16px",
                background: T.panel,
                padding: "0.9rem",
                boxShadow: "0 10px 24px rgba(0,0,0,0.1)",
              }}
            >
              <p style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontWeight: 700, fontSize: "1rem", marginBottom: "0.35rem" }}>Pulse</p>
              <p style={{ color: T.muted, fontSize: "0.8rem", lineHeight: 1.6, fontFamily: "'Satoshi', sans-serif" }}>
                Early access is active, so engagement numbers remain intentionally realistic while the community grows.
              </p>
              <div style={{ marginTop: "0.58rem", color: T.highlight, fontSize: "0.75rem", fontFamily: "'Satoshi', sans-serif", display: "inline-flex", alignItems: "center", gap: "0.36rem" }}>
                <Sparkles style={{ width: "12px", height: "12px" }} />
                Healthy growth week over week
              </div>
            </div>
          </aside>
        </div>
      </div>

      <style jsx>{`
        .community-dark-layer {
          position: absolute;
          inset: 0;
          pointer-events: none;
          background-image: url("/images/community-bg-dark.webp");
          background-position: center 40%;
          background-size: cover;
          background-repeat: no-repeat;
          opacity: 0.6;
          transform: translateZ(0);
          will-change: opacity;
        }
        .community-grid {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 300px;
          gap: 1rem;
          align-items: start;
        }
        .community-metric-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 0.6rem;
        }
        .community-metric-card {
          border: 1px solid;
          border-radius: 12px;
          padding: 0.52rem 0.64rem;
          display: flex;
          align-items: center;
          gap: 0.55rem;
        }
        .community-compose-row {
          display: grid;
          grid-template-columns: 1fr 122px;
          gap: 0.52rem;
        }
        .community-comment-row {
          display: grid;
          grid-template-columns: 1fr 64px;
          gap: 0.45rem;
        }
        @media (max-width: 1100px) {
          .community-grid {
            grid-template-columns: minmax(0, 1fr);
          }
        }
        @media (max-width: 767px) {
          .community-dark-layer {
            background-position: center 35%;
          }
          div[style*="padding: 1.4rem 1.6rem 3.2rem"] {
            padding: 1rem 1rem 5.2rem !important;
          }
          .community-metric-grid {
            grid-template-columns: 1fr;
          }
          .community-compose-row {
            grid-template-columns: 1fr;
          }
          .community-comment-row {
            grid-template-columns: 1fr 72px;
          }
        }
      `}</style>
    </div>
  );
}

// ─── Post Card Component ──────────────────────────────────
type CommunityTheme = typeof DARK;

type PostCardProps = {
  post: CommunityPost;
  index: number;
  hasLiked: boolean;
  postComments: CommunityComment[];
  commentOpen: boolean;
  visibleCommentCount: number;
  T: CommunityTheme;
  user: UserSummary | null;
  hasProAccess: boolean;
  setOpenCommentFor: React.Dispatch<React.SetStateAction<string | null>>;
  toggleLike: (postId: string) => void;
  likePendingFor: string | null;
  commentDrafts: Record<string, string>;
  setCommentDrafts: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  commentPendingFor: string | null;
  submitComment: (postId: string) => Promise<void>;
  commentErrorByPost: Record<string, string>;
  commentInfoByPost: Record<string, string>;
  commentsSetupNeeded: boolean;
  commentsAuthNeeded: boolean;
  timeAgo: (isoDate: string) => string;
  setSearch: React.Dispatch<React.SetStateAction<string>>;
  onFollowUpdate?: (targetUserId: string) => void;
};

function PostCard({ 
  post, index, hasLiked, postComments, commentOpen, visibleCommentCount, T, user, hasProAccess,
  setOpenCommentFor, toggleLike, likePendingFor, commentDrafts, setCommentDrafts, 
  commentPendingFor, submitComment, commentErrorByPost, commentInfoByPost, 
  commentsSetupNeeded, commentsAuthNeeded, timeAgo, setSearch, onFollowUpdate 
}: PostCardProps) {
  const [isMsgOpen, setIsMsgOpen] = useState(false);

  return (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.22, delay: index * 0.02 }}
      style={{
        border: `1px solid ${T.border}`,
        borderRadius: "16px",
        background: T.panel,
        padding: "0.95rem",
        boxShadow: "0 10px 26px rgba(0,0,0,0.1)",
        marginBottom: "1rem"
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: "0.6rem", marginBottom: "0.52rem" }}>
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
          <div style={{ 
            width: "36px", 
            height: "36px", 
            borderRadius: "50%", 
            backgroundColor: T.accent, 
            backgroundImage: post.profiles?.avatar_url ? `url(${post.profiles.avatar_url})` : "none",
            backgroundSize: "cover",
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center", 
            fontSize: "0.8rem", 
            color: "#fff", 
            fontWeight: 700 
          }}>
            {!post.profiles?.avatar_url && post.userName.charAt(0)}
          </div>
          <div>
            <p style={{ fontWeight: 700, fontSize: "0.89rem", fontFamily: "'Cabinet Grotesk', sans-serif", margin: 0 }}>{post.userName}</p>
            <p style={{ color: T.dim, fontSize: "0.73rem", fontFamily: "'Satoshi', sans-serif", margin: 0 }}>
              @{post.userHandle} - {timeAgo(post.createdAt)}
            </p>
          </div>
        </div>

        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
           <div style={{ textAlign: "right", marginRight: "0.5rem" }}>
             <p style={{ margin: 0, fontSize: "0.65rem", color: T.dim }}>{post.profiles?.followers_count || 0} followers</p>
             <p style={{ margin: 0, fontSize: "0.65rem", color: T.dim }}>{post.profiles?.total_platform_likes || 0} likes</p>
           </div>
           
           {user?.id !== post.userId && (
             <button 
                onClick={(e) => { e.stopPropagation(); setIsMsgOpen(true); }}
                style={{ background: T.accentSoft, border: "none", color: T.accent, padding: "0.35rem", borderRadius: "8px", cursor: "pointer" }}
             >
                <MessageSquare size={13} />
             </button>
           )}
           <FollowButton targetUserId={post.userId as string} onUpdate={() => onFollowUpdate?.(post.userId as string)} />
        </div>
      </div>

      <p style={{ fontSize: "0.9rem", lineHeight: 1.6, marginBottom: "0.62rem", fontFamily: "'Satoshi', sans-serif" }}>{post.content}</p>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.38rem", marginBottom: "0.62rem" }}>
        {post.tags.map((tag: string) => (
          <button
            key={`${post.id}-${tag}`}
            onClick={() => setSearch(tag)}
            style={{
              borderRadius: "999px",
              border: `1px solid ${T.border}`,
              backgroundColor: T.chip,
              color: T.muted,
              fontSize: "0.69rem",
              padding: "0.16rem 0.52rem",
              cursor: "pointer",
              fontFamily: "'Satoshi', sans-serif",
            }}
          >
            #{tag}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.5rem" }}>
        <div style={{ display: "flex", gap: "0.46rem" }}>
          <button
            onClick={() => toggleLike(post.id)}
            disabled={!user || likePendingFor === post.id}
            style={{
              borderRadius: "999px",
              border: `1px solid ${hasLiked ? `${T.accent}66` : T.border}`,
              backgroundColor: hasLiked ? T.accentSoft : T.chip,
              color: hasLiked ? T.accent : T.muted,
              padding: "0.28rem 0.62rem",
              fontSize: "0.74rem",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.33rem",
              cursor: !user || likePendingFor === post.id ? "not-allowed" : "pointer",
              fontFamily: "'Satoshi', sans-serif",
            }}
          >
            <Heart style={{ width: "12px", height: "12px", fill: hasLiked ? T.accent : "transparent" }} />
            {likePendingFor === post.id ? "..." : post.likesCount}
          </button>
          <button
            onClick={() =>
              setOpenCommentFor((prev) => (prev === post.id ? null : post.id))
            }
            style={{
              borderRadius: "999px",
              border: `1px solid ${commentOpen ? `${T.accent}66` : T.border}`,
              backgroundColor: commentOpen ? T.accentSoft : T.chip,
              color: commentOpen ? T.accent : T.muted,
              padding: "0.28rem 0.62rem",
              fontSize: "0.74rem",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.33rem",
              cursor: "pointer",
              fontFamily: "'Satoshi', sans-serif",
            }}
          >
            <MessageCircle style={{ width: "12px", height: "12px" }} />
            {visibleCommentCount}
          </button>
        </div>
        {post.likesCount < 2 && <span style={{ color: T.dim, fontSize: "0.7rem", fontFamily: "'Satoshi', sans-serif" }}>Be first to like</span>}
      </div>

      {(commentOpen || postComments.length > 0) && (
        <div
          style={{
            marginTop: "0.66rem",
            borderTop: `1px solid ${T.border}`,
            paddingTop: "0.62rem",
          }}
        >
          {postComments.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.45rem", marginBottom: "0.58rem" }}>
              {postComments.map((comment) => (
                <div
                  key={comment.id}
                  style={{
                    border: `1px solid ${T.border}`,
                    backgroundColor: T.chip,
                    borderRadius: "10px",
                    padding: "0.45rem 0.56rem",
                  }}
                >
                  <p style={{ fontSize: "0.72rem", color: T.dim, fontFamily: "'Satoshi', sans-serif", marginBottom: "0.2rem" }}>
                    @{comment.userHandle} - {timeAgo(comment.createdAt)}
                  </p>
                  <p style={{ fontSize: "0.82rem", color: T.text, lineHeight: 1.5, fontFamily: "'Satoshi', sans-serif" }}>{comment.content}</p>
                </div>
              ))}
            </div>
          )}

          {commentOpen && (
            <div>
              <div className="community-comment-row">
                <input
                  value={commentDrafts[post.id] || ""}
                  onChange={(event) =>
                    setCommentDrafts((prev) => ({
                      ...prev,
                      [post.id]: event.target.value,
                    }))
                  }
                  placeholder={user ? (hasProAccess ? "Write a comment..." : "Upgrade to Pro to comment") : "Sign in to comment"}
                  disabled={!user || commentPendingFor === post.id || !hasProAccess}
                  style={{
                    width: "100%",
                    borderRadius: "9px",
                    border: `1px solid ${T.border}`,
                    backgroundColor: T.input,
                    color: T.text,
                    padding: "0.44rem 0.66rem",
                    fontSize: "0.78rem",
                    outline: "none",
                    fontFamily: "'Satoshi', sans-serif",
                  }}
                />
                <button
                  onClick={() => submitComment(post.id)}
                  disabled={!user || commentPendingFor === post.id || !hasProAccess}
                  style={{
                    borderRadius: "9px",
                    border: "none",
                    backgroundColor: user && hasProAccess ? T.accent : T.chip,
                    color: user && hasProAccess ? "#FFFFFF" : T.dim,
                    cursor: user && hasProAccess ? "pointer" : "not-allowed",
                    fontFamily: "'Satoshi', sans-serif",
                    fontSize: "0.74rem",
                    fontWeight: 700,
                    padding: "0.44rem 0.55rem",
                  }}
                >
                  {commentPendingFor === post.id ? "..." : hasProAccess ? "Send" : "Pro"}
                </button>
              </div>
              <p
                style={{
                  marginTop: "0.38rem",
                  fontSize: "0.72rem",
                  color: commentErrorByPost[post.id]
                    ? T.danger
                    : commentInfoByPost[post.id]
                    ? T.accent
                    : T.dim,
                  fontFamily: "'Satoshi', sans-serif",
                }}
              >
                {commentErrorByPost[post.id] ||
                  commentInfoByPost[post.id] ||
                  (user && !hasProAccess
                    ? "Upgrade to Pro to reply in community discussions."
                    : commentsSetupNeeded
                    ? "Live comments are not configured yet."
                    : commentsAuthNeeded
                    ? "Sign in to view comments and reply."
                    : "Reply and help move the discussion forward.")}
              </p>
            </div>
          )}
        </div>
      )}

      {post.userId && (
        <MessageModal
          isOpen={isMsgOpen}
          onClose={() => setIsMsgOpen(false)}
          receiverId={post.userId}
          receiverName={post.userName}
          contextTitle={post.content.substring(0, 30) + "..."}
        />
      )}
    </motion.article>
  );
}


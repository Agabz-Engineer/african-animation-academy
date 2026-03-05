"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  CalendarDays,
  Flame,
  Hash,
  Heart,
  Lock,
  MessageCircle,
  PenSquare,
  Search,
  Send,
  Sparkles,
  Trophy,
  Users,
  Zap,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useThemeMode } from "@/lib/useThemeMode";

type FeedFilter = "For You" | "Latest" | "Following";

type CommunityPost = {
  id: string;
  userName: string;
  userHandle: string;
  content: string;
  tags: string[];
  likesCount: number;
  commentsCount: number;
  createdAt: string;
  isFollowing: boolean;
  localOnly?: boolean;
};

type DbPost = {
  id: string;
  user_name: string | null;
  user_handle: string | null;
  content: string;
  tags: string[] | null;
  likes_count: number | null;
  comments_count: number | null;
  created_at: string;
};

type CommunityComment = {
  id: string;
  postId: string;
  userName: string;
  userHandle: string;
  content: string;
  createdAt: string;
  localOnly?: boolean;
};

type DbComment = {
  id: string;
  post_id: string;
  user_name: string | null;
  user_handle: string | null;
  content: string;
  created_at: string;
};

type UserSummary = { id: string; name: string; handle: string };

const LOCAL_POSTS_KEY = "africafx-community-local-posts";
const LOCAL_COMMENTS_KEY = "africafx-community-local-comments";

const readLocalPosts = (): CommunityPost[] => {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(LOCAL_POSTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item) => item && typeof item.id === "string");
  } catch {
    return [];
  }
};

const writeLocalPosts = (posts: CommunityPost[]) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(LOCAL_POSTS_KEY, JSON.stringify(posts.slice(0, 40)));
};

const readLocalComments = (): CommunityComment[] => {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(LOCAL_COMMENTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item) => item && typeof item.id === "string" && typeof item.postId === "string");
  } catch {
    return [];
  }
};

const writeLocalComments = (comments: CommunityComment[]) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(LOCAL_COMMENTS_KEY, JSON.stringify(comments.slice(0, 300)));
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

const mergeComments = (...sources: CommunityComment[][]): CommunityComment[] => {
  const seen = new Set<string>();
  const merged: CommunityComment[] = [];
  sources.flat().forEach((comment) => {
    if (!seen.has(comment.id)) {
      seen.add(comment.id);
      merged.push(comment);
    }
  });
  return merged.sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt));
};

const DARK = {
  pageBg: "#0D0A08",
  pageGlowA: "rgba(255,140,0,0.17)",
  pageGlowB: "rgba(255,188,116,0.12)",
  panel: "rgba(29, 23, 18, 0.90)",
  panelSoft: "rgba(26, 20, 15, 0.72)",
  border: "rgba(255,255,255,0.12)",
  text: "#F8F3EA",
  muted: "#CABCA9",
  dim: "#948677",
  accent: "#FF8C00",
  accentSoft: "rgba(255,140,0,0.18)",
  chip: "rgba(255,255,255,0.06)",
  input: "#1A1511",
  highlight: "#FFD08A",
  danger: "#E46464",
};

const LIGHT = {
  pageBg: "#F9F4E8",
  pageGlowA: "rgba(255,140,0,0.14)",
  pageGlowB: "rgba(255,210,140,0.19)",
  panel: "rgba(255, 252, 247, 0.89)",
  panelSoft: "rgba(255, 250, 242, 0.72)",
  border: "rgba(123, 100, 72, 0.18)",
  text: "#1F1A15",
  muted: "#5D5347",
  dim: "#7D7265",
  accent: "#DE6F00",
  accentSoft: "rgba(222,111,0,0.12)",
  chip: "rgba(0,0,0,0.045)",
  input: "#FFFFFF",
  highlight: "#8A4900",
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

const isUuid = (value: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);

const normalizePost = (row: DbPost): CommunityPost => ({
  id: row.id,
  userName: row.user_name || "Animator",
  userHandle: row.user_handle || "animator",
  content: row.content,
  tags: Array.isArray(row.tags) ? row.tags : [],
  likesCount: Math.max(0, row.likes_count || 0),
  commentsCount: Math.max(0, row.comments_count || 0),
  createdAt: row.created_at,
  isFollowing: false,
});

const normalizeComment = (row: DbComment): CommunityComment => ({
  id: row.id,
  postId: row.post_id,
  userName: row.user_name || "Animator",
  userHandle: row.user_handle || "animator",
  content: row.content,
  createdAt: row.created_at,
});

const isSetupError = (error: { message?: string; code?: string } | null) =>
  Boolean(
    error &&
      (error.code === "42P01" ||
        `${error.message || ""}`.toLowerCase().includes("community_posts") ||
        `${error.message || ""}`.toLowerCase().includes("does not exist"))
  );

const isCommentSetupError = (error: { message?: string; code?: string } | null) =>
  Boolean(
    error &&
      (error.code === "42P01" ||
        `${error.message || ""}`.toLowerCase().includes("community_post_comments") ||
        `${error.message || ""}`.toLowerCase().includes("does not exist"))
  );

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
  const [openCommentFor, setOpenCommentFor] = useState<string | null>(null);
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});
  const [commentPendingFor, setCommentPendingFor] = useState<string | null>(null);
  const [commentErrorByPost, setCommentErrorByPost] = useState<Record<string, string>>({});
  const [commentInfoByPost, setCommentInfoByPost] = useState<Record<string, string>>({});

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      const localPosts = readLocalPosts();
      const localComments = readLocalComments();
      const [{ data: userData }, { data: postData, error: postError }, { data: commentData, error: commentError }] =
        await Promise.all([
        supabase.auth.getUser(),
        supabase
          .from("community_posts")
          .select("id,user_name,user_handle,content,tags,likes_count,comments_count,created_at")
          .order("created_at", { ascending: false })
          .limit(40),
        supabase
          .from("community_post_comments")
          .select("id,post_id,user_name,user_handle,content,created_at")
          .order("created_at", { ascending: true })
          .limit(250),
      ]);

      if (!mounted) return;

      const authUser = userData.user;
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
      } else {
        setUser(null);
      }

      if (postError) {
        const missingSetup = isSetupError(postError);
        setSetupNeeded(missingSetup);
        setPosts(mergePosts(localPosts));
        if (missingSetup) {
          setSubmitInfo("Live posting is not configured yet. Posts will save locally on this device.");
        } else if (postError.code === "42501") {
          setSubmitInfo("Sign in to load live community posts.");
        } else {
          setSubmitInfo("");
        }
      } else {
        const livePosts = Array.isArray(postData) ? (postData as DbPost[]).map(normalizePost) : [];
        setSetupNeeded(false);
        setSubmitInfo("");
        setPosts(mergePosts(localPosts, livePosts));
      }

      if (commentError) {
        const missingCommentsSetup = isCommentSetupError(commentError);
        setCommentsSetupNeeded(missingCommentsSetup);
        setCommentsByPost(groupCommentsByPost(localComments));
      } else {
        const liveComments = Array.isArray(commentData) ? (commentData as DbComment[]).map(normalizeComment) : [];
        setCommentsSetupNeeded(false);
        setCommentsByPost(groupCommentsByPost(mergeComments(localComments, liveComments)));
      }

      setLoading(false);
    };

    load();
    return () => {
      mounted = false;
    };
  }, []);

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

  const toggleLike = (postId: string) => {
    let increment = 1;
    setLiked((prev) => {
      const next = new Set(prev);
      if (next.has(postId)) {
        next.delete(postId);
        increment = -1;
      } else {
        next.add(postId);
        increment = 1;
      }
      return next;
    });

    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? { ...post, likesCount: Math.max(0, post.likesCount + increment) }
          : post
      )
    );
  };

  const publishPost = async () => {
    setSubmitError("");
    setSubmitInfo("");

    if (!user) {
      setSubmitError("Sign in first so the post is linked to your account.");
      return;
    }

    const content = postText.trim();
    if (content.length < 8) {
      setSubmitError("Write at least 8 characters.");
      return;
    }

    const tags = parseTags(postTags);
    const saveLocalOnlyPost = (notice: string) => {
      const localPost: CommunityPost = {
        id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        userName: user.name,
        userHandle: user.handle,
        content,
        tags,
        likesCount: 0,
        commentsCount: 0,
        createdAt: new Date().toISOString(),
        isFollowing: true,
        localOnly: true,
      };
      setPosts((prev) => {
        const next = mergePosts([localPost], prev);
        writeLocalPosts(next.filter((post) => post.localOnly));
        return next;
      });
      setFilter("Latest");
      setPostText("");
      setSubmitInfo(notice);
    };

    if (setupNeeded) {
      saveLocalOnlyPost("Live DB is not ready yet. Your post was saved locally on this device.");
      return;
    }

    setSubmitPending(true);
    const { data, error } = await supabase
      .from("community_posts")
      .insert({
        user_id: user.id,
        user_name: user.name,
        user_handle: user.handle,
        content,
        tags,
      })
      .select("id,user_name,user_handle,content,tags,likes_count,comments_count,created_at")
      .single();
    setSubmitPending(false);

    if (error || !data) {
      if (isSetupError(error || null)) {
        setSetupNeeded(true);
        saveLocalOnlyPost("Live DB is not ready yet. Your post was saved locally on this device.");
        return;
      }
      setSubmitError(error?.message || "Post failed.");
      return;
    }

    setPosts((prev) => mergePosts([normalizePost(data as DbPost)], prev));
    setFilter("Latest");
    setPostText("");
    setSubmitInfo("Posted to live community.");
  };

  const submitComment = async (postId: string) => {
    const content = (commentDrafts[postId] || "").trim();
    const targetPost = posts.find((post) => post.id === postId);
    setCommentErrorByPost((prev) => ({ ...prev, [postId]: "" }));
    setCommentInfoByPost((prev) => ({ ...prev, [postId]: "" }));

    if (!user) {
      setCommentErrorByPost((prev) => ({ ...prev, [postId]: "Sign in to comment." }));
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
        writeLocalComments(Object.values(next).flat().filter((item) => item.localOnly));
        return next;
      });
      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId ? { ...post, commentsCount: Math.max(0, post.commentsCount + 1) } : post
        )
      );
      setCommentDrafts((prev) => ({ ...prev, [postId]: "" }));
    };

    const saveLocalComment = (notice: string) => {
      pushCommentToState({
        id: `local-comment-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        postId,
        userName: user.name,
        userHandle: user.handle,
        content,
        createdAt: new Date().toISOString(),
        localOnly: true,
      });
      setCommentInfoByPost((prev) => ({ ...prev, [postId]: notice }));
    };

    // Demo/local posts do not exist in the live DB, so comments stay local.
    if (!isUuid(postId) || targetPost?.localOnly) {
      saveLocalComment("This post is local only. Comment saved on this device.");
      return;
    }

    if (commentsSetupNeeded) {
      saveLocalComment("Live comments are not configured yet. Saved locally on this device.");
      return;
    }

    setCommentPendingFor(postId);
    const { data, error } = await supabase
      .from("community_post_comments")
      .insert({
        post_id: postId,
        user_id: user.id,
        user_name: user.name,
        user_handle: user.handle,
        content,
      })
      .select("id,post_id,user_name,user_handle,content,created_at")
      .single();
    setCommentPendingFor(null);

    if (error || !data) {
      if (isCommentSetupError(error || null)) {
        setCommentsSetupNeeded(true);
        saveLocalComment("Live comments are not configured yet. Saved locally on this device.");
        return;
      }
      if (error?.code === "22P02" || error?.code === "23503") {
        saveLocalComment("This post is not available in live DB yet. Comment saved locally.");
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
              fontFamily: "'General Sans', sans-serif",
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
                <p style={{ color: T.dim, fontSize: "0.68rem", fontFamily: "'General Sans', sans-serif", marginBottom: "0.1rem" }}>Members</p>
                <p style={{ color: T.text, fontSize: "1rem", fontWeight: 700, fontFamily: "'Cabinet Grotesk', sans-serif" }}>{126 + posts.length * 2}</p>
              </div>
            </div>
            <div className="community-metric-card" style={{ borderColor: T.border, backgroundColor: T.chip }}>
              <PenSquare style={{ width: "15px", height: "15px", color: T.accent }} />
              <div>
                <p style={{ color: T.dim, fontSize: "0.68rem", fontFamily: "'General Sans', sans-serif", marginBottom: "0.1rem" }}>Posts</p>
                <p style={{ color: T.text, fontSize: "1rem", fontWeight: 700, fontFamily: "'Cabinet Grotesk', sans-serif" }}>{posts.length}</p>
              </div>
            </div>
            <div className="community-metric-card" style={{ borderColor: T.border, backgroundColor: T.chip }}>
              <Flame style={{ width: "15px", height: "15px", color: T.accent }} />
              <div>
                <p style={{ color: T.dim, fontSize: "0.68rem", fontFamily: "'General Sans', sans-serif", marginBottom: "0.1rem" }}>Likes</p>
                <p style={{ color: T.text, fontSize: "1rem", fontWeight: 700, fontFamily: "'Cabinet Grotesk', sans-serif" }}>{totalLikes}</p>
              </div>
            </div>
          </div>
        </section>

        <div className="community-grid">
          <section style={{ display: "flex", flexDirection: "column", gap: "0.9rem" }}>
            <div
              style={{
                border: `1px solid ${T.border}`,
                borderRadius: "16px",
                background: T.panel,
                padding: "1rem",
                boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.6rem", marginBottom: "0.68rem" }}>
                <div>
                  <p style={{ color: T.text, fontSize: "0.92rem", fontFamily: "'Cabinet Grotesk', sans-serif", fontWeight: 700 }}>Start a conversation</p>
                  <p style={{ color: T.muted, fontSize: "0.78rem", fontFamily: "'General Sans', sans-serif" }}>
                    {user ? `Posting as @${user.handle}` : "Sign in to publish to the feed"}
                  </p>
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
                      fontFamily: "'General Sans', sans-serif",
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
                disabled={!user || submitPending}
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
                    disabled={!user || submitPending}
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
                      fontFamily: "'General Sans', sans-serif",
                    }}
                  />
                </div>
                <button
                  onClick={publishPost}
                  disabled={!user || submitPending}
                  style={{
                    borderRadius: "10px",
                    border: "none",
                    backgroundColor: user ? T.accent : T.chip,
                    color: user ? "#FFFFFF" : T.dim,
                    fontWeight: 700,
                    cursor: user ? "pointer" : "not-allowed",
                    fontSize: "0.82rem",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.35rem",
                    fontFamily: "'General Sans', sans-serif",
                  }}
                >
                  <Send style={{ width: "13px", height: "13px" }} />
                  {submitPending ? "Posting..." : "Post"}
                </button>
              </div>

              <p
                style={{
                  marginTop: "0.48rem",
                  fontSize: "0.75rem",
                  color: submitError ? T.danger : submitInfo ? T.accent : T.dim,
                  fontFamily: "'General Sans', sans-serif",
                }}
              >
                {submitError || submitInfo || "Use tags to help people discover your post quickly."}
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
                      fontFamily: "'General Sans', sans-serif",
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
                    fontFamily: "'General Sans', sans-serif",
                  }}
                />
              </div>
            </div>

            {loading ? (
              <div style={{ border: `1px solid ${T.border}`, borderRadius: "16px", backgroundColor: T.panel, padding: "1rem", color: T.dim, fontFamily: "'General Sans', sans-serif" }}>
                Loading community feed...
              </div>
            ) : filteredPosts.length === 0 ? (
              <div style={{ border: `1px solid ${T.border}`, borderRadius: "16px", backgroundColor: T.panel, padding: "1rem", color: T.muted, fontFamily: "'General Sans', sans-serif" }}>
                No posts yet. You can be first to post.
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                {filteredPosts.map((post, index) => {
                  const hasLiked = liked.has(post.id);
                  const postComments = commentsByPost[post.id] || [];
                  const commentOpen = openCommentFor === post.id;
                  const visibleCommentCount = getCommentCount(post);
                  return (
                    <motion.article
                      key={post.id}
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
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", gap: "0.6rem", marginBottom: "0.52rem" }}>
                        <div>
                          <p style={{ fontWeight: 700, fontSize: "0.89rem", fontFamily: "'Cabinet Grotesk', sans-serif" }}>{post.userName}</p>
                          <p style={{ color: T.dim, fontSize: "0.73rem", fontFamily: "'General Sans', sans-serif" }}>
                            @{post.userHandle} - {timeAgo(post.createdAt)}
                          </p>
                        </div>
                      </div>

                      <p style={{ fontSize: "0.9rem", lineHeight: 1.6, marginBottom: "0.62rem", fontFamily: "'Satoshi', sans-serif" }}>{post.content}</p>

                      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.38rem", marginBottom: "0.62rem" }}>
                        {post.tags.map((tag) => (
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
                              fontFamily: "'General Sans', sans-serif",
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
                              cursor: "pointer",
                              fontFamily: "'General Sans', sans-serif",
                            }}
                          >
                            <Heart style={{ width: "12px", height: "12px", fill: hasLiked ? T.accent : "transparent" }} />
                            {post.likesCount}
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
                              fontFamily: "'General Sans', sans-serif",
                            }}
                          >
                            <MessageCircle style={{ width: "12px", height: "12px" }} />
                            {visibleCommentCount}
                          </button>
                        </div>
                        {post.likesCount < 2 && <span style={{ color: T.dim, fontSize: "0.7rem", fontFamily: "'General Sans', sans-serif" }}>Be first to like</span>}
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
                                  <p style={{ fontSize: "0.72rem", color: T.dim, fontFamily: "'General Sans', sans-serif", marginBottom: "0.2rem" }}>
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
                                  placeholder={user ? "Write a comment..." : "Sign in to comment"}
                                  disabled={!user || commentPendingFor === post.id}
                                  style={{
                                    width: "100%",
                                    borderRadius: "9px",
                                    border: `1px solid ${T.border}`,
                                    backgroundColor: T.input,
                                    color: T.text,
                                    padding: "0.44rem 0.66rem",
                                    fontSize: "0.78rem",
                                    outline: "none",
                                    fontFamily: "'General Sans', sans-serif",
                                  }}
                                />
                                <button
                                  onClick={() => submitComment(post.id)}
                                  disabled={!user || commentPendingFor === post.id}
                                  style={{
                                    borderRadius: "9px",
                                    border: "none",
                                    backgroundColor: user ? T.accent : T.chip,
                                    color: user ? "#FFFFFF" : T.dim,
                                    cursor: user ? "pointer" : "not-allowed",
                                    fontFamily: "'General Sans', sans-serif",
                                    fontSize: "0.74rem",
                                    fontWeight: 700,
                                    padding: "0.44rem 0.55rem",
                                  }}
                                >
                                  {commentPendingFor === post.id ? "..." : "Send"}
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
                                  fontFamily: "'General Sans', sans-serif",
                                }}
                              >
                                {commentErrorByPost[post.id] ||
                                  commentInfoByPost[post.id] ||
                                  (commentsSetupNeeded
                                    ? "Comments currently save locally on this device."
                                    : "Reply and help move the discussion forward.")}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </motion.article>
                  );
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
                  <span style={{ fontSize: "0.78rem", color: T.muted, fontFamily: "'General Sans', sans-serif" }}>Fast critique threads on WIP posts</span>
                </div>
                <div style={{ border: `1px solid ${T.border}`, borderRadius: "11px", padding: "0.5rem 0.58rem", backgroundColor: T.chip, display: "flex", gap: "0.48rem", alignItems: "center" }}>
                  <CalendarDays style={{ width: "14px", height: "14px", color: T.accent }} />
                  <span style={{ fontSize: "0.78rem", color: T.muted, fontFamily: "'General Sans', sans-serif" }}>Monthly challenge prompts and results</span>
                </div>
                <div style={{ border: `1px solid ${T.border}`, borderRadius: "11px", padding: "0.5rem 0.58rem", backgroundColor: T.chip, display: "flex", gap: "0.48rem", alignItems: "center" }}>
                  <Trophy style={{ width: "14px", height: "14px", color: T.accent }} />
                  <span style={{ fontSize: "0.78rem", color: T.muted, fontFamily: "'General Sans', sans-serif" }}>Weekly standout creators board</span>
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
                      fontFamily: "'General Sans', sans-serif",
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
              <div style={{ marginTop: "0.58rem", color: T.highlight, fontSize: "0.75rem", fontFamily: "'General Sans', sans-serif", display: "inline-flex", alignItems: "center", gap: "0.36rem" }}>
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

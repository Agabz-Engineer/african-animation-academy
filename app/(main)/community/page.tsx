"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Flame,
  Hash,
  Heart,
  Lock,
  MessageCircle,
  PenSquare,
  Search,
  Send,
  Sparkles,
  Users,
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
  demo?: boolean;
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

type UserSummary = { id: string; name: string; handle: string };

const STARTER_POSTS: CommunityPost[] = [
  {
    id: "starter-1",
    userName: "Ama Serwaa",
    userHandle: "ama_serwaa",
    content: "Testing cloth simulation on an Adinkra jacket. Feedback welcome.",
    tags: ["wip", "cloth", "blender"],
    likesCount: 3,
    commentsCount: 2,
    createdAt: "2026-03-04T09:15:00Z",
    isFollowing: true,
    demo: true,
  },
  {
    id: "starter-2",
    userName: "Kojo Mensah",
    userHandle: "kojo_frames",
    content: "Before and after on skin shading for my character turnaround.",
    tags: ["character", "lookdev"],
    likesCount: 5,
    commentsCount: 4,
    createdAt: "2026-03-03T21:00:00Z",
    isFollowing: false,
    demo: true,
  },
];

const DARK = {
  pageBg: "#0F0D0B",
  panel: "rgba(24,21,17,0.95)",
  border: "#342E28",
  text: "#FAF8F0",
  muted: "#BEB6A8",
  dim: "#8A8176",
  accent: "#FF8C00",
  accentSoft: "rgba(255,140,0,0.14)",
  chip: "rgba(255,255,255,0.05)",
  input: "#1E1A16",
};

const LIGHT = {
  pageBg: "#FAF8F0",
  panel: "rgba(255,251,243,0.96)",
  border: "#E2D7C7",
  text: "#1C1C1C",
  muted: "#5A534A",
  dim: "#8A8175",
  accent: "#FF8C00",
  accentSoft: "rgba(255,140,0,0.12)",
  chip: "rgba(0,0,0,0.04)",
  input: "#FFFFFF",
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

const isSetupError = (error: { message?: string; code?: string } | null) =>
  Boolean(
    error &&
      (error.code === "42P01" ||
        error.code === "42501" ||
        `${error.message || ""}`.toLowerCase().includes("community_posts"))
  );

export default function CommunityPage() {
  const theme = useThemeMode();
  const T = theme === "dark" ? DARK : LIGHT;

  const [user, setUser] = useState<UserSummary | null>(null);
  const [posts, setPosts] = useState<CommunityPost[]>(STARTER_POSTS);
  const [loading, setLoading] = useState(true);
  const [setupNeeded, setSetupNeeded] = useState(false);
  const [filter, setFilter] = useState<FeedFilter>("For You");
  const [search, setSearch] = useState("");
  const [liked, setLiked] = useState<Set<string>>(new Set());
  const [postText, setPostText] = useState("");
  const [postTags, setPostTags] = useState("wip, character");
  const [submitPending, setSubmitPending] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      const [{ data: userData }, { data, error }] = await Promise.all([
        supabase.auth.getUser(),
        supabase
          .from("community_posts")
          .select("id,user_name,user_handle,content,tags,likes_count,comments_count,created_at")
          .order("created_at", { ascending: false })
          .limit(40),
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
      }

      if (error) {
        setSetupNeeded(isSetupError(error));
        setPosts(STARTER_POSTS);
      } else if (Array.isArray(data) && data.length > 0) {
        setSetupNeeded(false);
        setPosts((data as DbPost[]).map(normalizePost));
      } else {
        setSetupNeeded(false);
        setPosts([]);
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

  const trendingTags = useMemo(() => {
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

    if (!user) {
      setSubmitError("Sign in first so the post is linked to your account.");
      return;
    }
    if (setupNeeded) {
      setSubmitError("Run supabase/community_posts.sql first.");
      return;
    }

    const content = postText.trim();
    if (content.length < 8) {
      setSubmitError("Write at least 8 characters.");
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
        tags: parseTags(postTags),
      })
      .select("id,user_name,user_handle,content,tags,likes_count,comments_count,created_at")
      .single();
    setSubmitPending(false);

    if (error || !data) {
      setSubmitError(error?.message || "Post failed.");
      return;
    }

    setPosts((prev) => [normalizePost(data as DbPost), ...prev.filter((p) => !p.demo)]);
    setFilter("Latest");
    setPostText("");
  };

  const totalLikes = posts.reduce((sum, post) => sum + post.likesCount, 0);

  return (
    <div style={{ backgroundColor: T.pageBg, minHeight: "100vh", color: T.text, padding: "1.5rem 2rem 3rem" }}>
      <div style={{ border: `1px solid ${T.border}`, borderRadius: "18px", padding: "1rem", backgroundColor: T.panel, marginBottom: "1rem" }}>
        <div style={{ display: "inline-flex", gap: "6px", alignItems: "center", borderRadius: "999px", border: `1px solid ${T.accent}55`, backgroundColor: T.accentSoft, padding: "0.3rem 0.75rem", marginBottom: "0.65rem" }}>
          <Sparkles style={{ width: "12px", height: "12px", color: T.accent }} />
          <span style={{ color: T.accent, fontSize: "0.7rem", fontWeight: 700 }}>Premium Community</span>
        </div>
        <h1 style={{ fontSize: "1.9rem", fontWeight: 700, marginBottom: "0.35rem", fontFamily: "'General Sans',sans-serif" }}>Community</h1>
        <p style={{ color: T.muted, fontSize: "0.86rem", lineHeight: 1.6, maxWidth: "760px" }}>
          Launch stage is active, so likes stay low and realistic. Any signed-in user can post updates, ask for feedback, and join discussions.
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.55rem", marginTop: "0.8rem" }}>
          <div style={{ border: `1px solid ${T.border}`, borderRadius: "10px", backgroundColor: T.chip, padding: "0.4rem 0.65rem", fontSize: "0.75rem", color: T.muted, display: "inline-flex", alignItems: "center", gap: "5px" }}><Users style={{ width: "12px", height: "12px" }} /> Members: {126 + posts.length * 2}</div>
          <div style={{ border: `1px solid ${T.border}`, borderRadius: "10px", backgroundColor: T.chip, padding: "0.4rem 0.65rem", fontSize: "0.75rem", color: T.muted, display: "inline-flex", alignItems: "center", gap: "5px" }}><PenSquare style={{ width: "12px", height: "12px" }} /> Posts: {posts.length}</div>
          <div style={{ border: `1px solid ${T.border}`, borderRadius: "10px", backgroundColor: T.chip, padding: "0.4rem 0.65rem", fontSize: "0.75rem", color: T.muted, display: "inline-flex", alignItems: "center", gap: "5px" }}><Flame style={{ width: "12px", height: "12px", color: T.accent }} /> Likes: {totalLikes}</div>
        </div>
      </div>

      <div className="community-grid">
        <section style={{ display: "flex", flexDirection: "column", gap: "0.9rem" }}>
          <div style={{ border: `1px solid ${T.border}`, borderRadius: "14px", backgroundColor: T.panel, padding: "0.9rem" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.65rem" }}>
              <p style={{ fontSize: "0.82rem", color: T.muted }}>{user ? `Posting as @${user.handle}` : "Sign in to post"}</p>
              {!user && <span style={{ fontSize: "0.72rem", color: T.dim, display: "inline-flex", gap: "5px", alignItems: "center" }}><Lock style={{ width: "11px", height: "11px" }} /> login required</span>}
            </div>
            <textarea
              value={postText}
              onChange={(event) => setPostText(event.target.value)}
              placeholder="Share what you are building..."
              disabled={!user || setupNeeded || submitPending}
              rows={4}
              style={{ width: "100%", borderRadius: "10px", border: `1px solid ${T.border}`, backgroundColor: T.input, color: T.text, padding: "0.75rem", fontSize: "0.84rem", outline: "none", resize: "vertical" }}
            />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 120px", gap: "0.5rem", marginTop: "0.55rem" }}>
              <div style={{ position: "relative" }}>
                <Hash style={{ position: "absolute", left: "0.7rem", top: "50%", transform: "translateY(-50%)", width: "12px", height: "12px", color: T.dim }} />
                <input
                  value={postTags}
                  onChange={(event) => setPostTags(event.target.value)}
                  disabled={!user || setupNeeded || submitPending}
                  placeholder="wip, character"
                  style={{ width: "100%", borderRadius: "9px", border: `1px solid ${T.border}`, backgroundColor: T.input, color: T.text, padding: "0.5rem 0.75rem 0.5rem 1.85rem", fontSize: "0.78rem", outline: "none" }}
                />
              </div>
              <button
                onClick={publishPost}
                disabled={!user || setupNeeded || submitPending}
                style={{ borderRadius: "9px", border: "none", backgroundColor: user && !setupNeeded ? T.accent : T.chip, color: user && !setupNeeded ? "#FFFFFF" : T.dim, fontWeight: 700, cursor: user && !setupNeeded ? "pointer" : "not-allowed", fontSize: "0.8rem", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "5px" }}
              >
                <Send style={{ width: "12px", height: "12px" }} /> {submitPending ? "Posting..." : "Post"}
              </button>
            </div>
            <p style={{ marginTop: "0.45rem", fontSize: "0.74rem", color: submitError ? "#E05252" : T.dim }}>
              {submitError || (setupNeeded ? "Run supabase/community_posts.sql to enable publishing." : "Any signed-in user can post here.")}
            </p>
          </div>

          <div style={{ border: `1px solid ${T.border}`, borderRadius: "12px", backgroundColor: T.panel, padding: "0.7rem", display: "flex", gap: "0.55rem", flexWrap: "wrap", alignItems: "center" }}>
            {(["For You", "Latest", "Following"] as FeedFilter[]).map((tab) => {
              const active = filter === tab;
              return (
                <button key={tab} onClick={() => setFilter(tab)} style={{ borderRadius: "999px", border: `1px solid ${active ? T.accent : T.border}`, backgroundColor: active ? T.accentSoft : T.chip, color: active ? T.accent : T.muted, fontSize: "0.74rem", fontWeight: active ? 700 : 500, padding: "0.3rem 0.8rem", cursor: "pointer" }}>
                  {tab}
                </button>
              );
            })}
            <div style={{ marginLeft: "auto", position: "relative", minWidth: "190px", flex: "1 1 230px" }}>
              <Search style={{ position: "absolute", left: "0.7rem", top: "50%", transform: "translateY(-50%)", width: "12px", height: "12px", color: T.dim }} />
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search feed" style={{ width: "100%", borderRadius: "9px", border: `1px solid ${T.border}`, backgroundColor: T.input, color: T.text, padding: "0.45rem 0.7rem 0.45rem 1.8rem", fontSize: "0.78rem", outline: "none" }} />
            </div>
          </div>

          {loading ? (
            <div style={{ border: `1px solid ${T.border}`, borderRadius: "14px", backgroundColor: T.panel, padding: "0.95rem", color: T.dim }}>Loading community feed...</div>
          ) : filteredPosts.length === 0 ? (
            <div style={{ border: `1px solid ${T.border}`, borderRadius: "14px", backgroundColor: T.panel, padding: "0.95rem", color: T.muted }}>No posts yet. You can be first to post.</div>
          ) : (
            <AnimatePresence mode="popLayout">
              {filteredPosts.map((post, index) => {
                const hasLiked = liked.has(post.id);
                return (
                  <motion.article key={post.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2, delay: index * 0.02 }} style={{ border: `1px solid ${T.border}`, borderRadius: "14px", backgroundColor: T.panel, padding: "0.9rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: "0.6rem", marginBottom: "0.45rem" }}>
                      <div>
                        <p style={{ fontWeight: 600, fontSize: "0.84rem" }}>{post.userName}</p>
                        <p style={{ color: T.dim, fontSize: "0.72rem" }}>@{post.userHandle} · {timeAgo(post.createdAt)}</p>
                      </div>
                      {post.demo && <span style={{ borderRadius: "999px", border: `1px solid ${T.border}`, backgroundColor: T.chip, color: T.dim, fontSize: "0.66rem", padding: "0.18rem 0.45rem", height: "fit-content" }}>starter</span>}
                    </div>
                    <p style={{ fontSize: "0.84rem", lineHeight: 1.6, marginBottom: "0.55rem" }}>{post.content}</p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem", marginBottom: "0.55rem" }}>
                      {post.tags.map((tag) => (
                        <button key={`${post.id}-${tag}`} onClick={() => setSearch(tag)} style={{ borderRadius: "999px", border: `1px solid ${T.border}`, backgroundColor: T.chip, color: T.muted, fontSize: "0.68rem", padding: "0.15rem 0.5rem", cursor: "pointer" }}>#{tag}</button>
                      ))}
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.5rem" }}>
                      <div style={{ display: "flex", gap: "0.45rem" }}>
                        <button onClick={() => toggleLike(post.id)} style={{ borderRadius: "999px", border: `1px solid ${hasLiked ? `${T.accent}55` : T.border}`, backgroundColor: hasLiked ? T.accentSoft : T.chip, color: hasLiked ? T.accent : T.muted, padding: "0.25rem 0.6rem", fontSize: "0.73rem", display: "inline-flex", alignItems: "center", gap: "5px", cursor: "pointer" }}><Heart style={{ width: "12px", height: "12px", fill: hasLiked ? T.accent : "transparent" }} /> {post.likesCount}</button>
                        <button style={{ borderRadius: "999px", border: `1px solid ${T.border}`, backgroundColor: T.chip, color: T.muted, padding: "0.25rem 0.6rem", fontSize: "0.73rem", display: "inline-flex", alignItems: "center", gap: "5px", cursor: "pointer" }}><MessageCircle style={{ width: "12px", height: "12px" }} /> {post.commentsCount}</button>
                      </div>
                      {post.likesCount < 2 && <span style={{ color: T.dim, fontSize: "0.68rem" }}>Be first to like</span>}
                    </div>
                  </motion.article>
                );
              })}
            </AnimatePresence>
          )}
        </section>

        <aside style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
          <div style={{ border: `1px solid ${T.border}`, borderRadius: "14px", backgroundColor: T.panel, padding: "0.85rem" }}>
            <p style={{ fontWeight: 700, marginBottom: "0.4rem" }}>Early Access Signal</p>
            <p style={{ color: T.muted, fontSize: "0.8rem", lineHeight: 1.6 }}>We keep engagement realistic right now, so most posts are in single-digit likes.</p>
          </div>
          <div style={{ border: `1px solid ${T.border}`, borderRadius: "14px", backgroundColor: T.panel, padding: "0.85rem" }}>
            <p style={{ fontWeight: 700, marginBottom: "0.4rem" }}>Trending Tags</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
              {trendingTags.map(([tag, count]) => (
                <button key={tag} onClick={() => setSearch(tag)} style={{ borderRadius: "9px", border: `1px solid ${T.border}`, backgroundColor: T.chip, color: T.text, padding: "0.35rem 0.55rem", fontSize: "0.74rem", display: "flex", justifyContent: "space-between", cursor: "pointer" }}>
                  <span>#{tag}</span>
                  <span style={{ color: T.dim }}>{count}</span>
                </button>
              ))}
            </div>
          </div>
        </aside>
      </div>

      <style jsx>{`
        .community-grid {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 290px;
          gap: 1rem;
          align-items: start;
        }
        @media (max-width: 1024px) {
          .community-grid {
            grid-template-columns: minmax(0, 1fr);
          }
        }
        @media (max-width: 767px) {
          div[style*="min-height: 100vh"] {
            padding: 1rem 1rem 5.2rem !important;
          }
        }
      `}</style>
    </div>
  );
}

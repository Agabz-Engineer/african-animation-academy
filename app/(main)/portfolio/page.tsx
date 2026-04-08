"use client";

import Link from "next/link";
import NextImage from "next/image";
import type { User } from "@supabase/supabase-js";
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Grid3X3,
  List,
  ChevronRight,
  Clock,
  Plus,
  Upload,
  Hash,
  X,
  Check
} from "lucide-react";
import { useThemeMode } from "@/lib/useThemeMode";
import { supabase } from "@/lib/supabase";
import { getMembershipAccess } from "@/lib/membership";

// ─── Colour tokens ────────────────────────────────────────
const DARK_UI = {
  text: "#FAF3E1",
  muted: "#D2C9B8",
  line: "#444444",
  cardBg: "rgba(44, 44, 44, 0.70)",
  cardBorder: "rgba(68, 68, 68, 0.40)",
  hoverBg: "rgba(255,109,31,0.1)",
  overlayBg: "rgba(0,0,0,0.8)",
  filterBg: "rgba(44, 44, 44, 0.95)",
  filterBorder: "rgba(68, 68, 68, 0.6)",
  pillActive: "#FF6D1F",
  pillActiveTxt: "#222222",
  pillInactive: "rgba(44,44,44,0.8)",
  pillInactiveTxt: "#D2C9B8",
  dim: "#9E9688",
};

const LIGHT_UI = {
  text: "#222222",
  muted: "#555555",
  line: "#E7DBBD",
  cardBg: "rgba(255, 255, 255, 0.90)",
  cardBorder: "rgba(231, 219, 189, 0.50)",
  hoverBg: "rgba(255,109,31,0.08)",
  overlayBg: "rgba(0,0,0,0.6)",
  filterBg: "rgba(250, 243, 225, 0.95)",
  filterBorder: "rgba(231, 219, 189, 0.6)",
  pillActive: "#FF6D1F",
  pillActiveTxt: "#ffffff",
  pillInactive: "rgba(245,231,198,0.9)",
  pillInactiveTxt: "#555555",
  dim: "#9E9688",
};
type ThemeTokens = typeof DARK_UI;
type CommunityPostDraft = {
  id: string;
  content: string;
  tags: string[];
};

// ─── Static animation variants (defined ONCE, not per render) ─
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 120, damping: 14 },
  },
};

// ─── Data ─────────────────────────────────────────────────
type Project = {
  id: string;
  title: string;
  category: string;
  description: string;
  tags: string[];
  thumbnail_url: string | null;
  media_url: string | null;
  community_post_id?: string;
  created_at: string;
  featured?: boolean;
};

const CATEGORIES = ["All", "2D Animation", "3D Animation", "Character Design", "Motion Graphics", "VFX"];

// ─── Thumbnail placeholder ─────────────────────────────────
function Thumbnail({ size = 48 }: { size?: number }) {
  return (
    <div
      style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(135deg, rgba(255,109,31,0.12), rgba(224,77,0,0.08))",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}
    >
      <Play size={size} style={{ color: "#FF6D1F", opacity: 0.85 }} />
    </div>
  );
}

// ─── Grid Card ─────────────────────────────────────────────
function GridCard({ project, C }: { project: Project; C: ThemeTokens }) {
  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ y: -4, boxShadow: `0 8px 28px rgba(255,109,31,0.15)` }}
      style={{
        backgroundColor: C.cardBg,
        border: `1px solid ${C.cardBorder}`,
        borderRadius: "12px",
        overflow: "hidden",
        cursor: "pointer",
        transition: "border-color 0.2s",
      }}
    >
      {/* Thumbnail */}
      <div style={{ position: "relative", paddingBottom: "56.25%", overflow: "hidden" }}>
        {project.thumbnail_url ? (
          <NextImage
            src={project.thumbnail_url}
            alt={project.title}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            style={{ objectFit: "cover" }}
          />
        ) : (
          <Thumbnail size={36} />
        )}
      </div>

      {/* Body */}
      <div style={{ padding: "0.875rem 1rem" }}>
        <h3 style={{
          fontFamily: "'Cabinet Grotesk', sans-serif",
          fontSize: "0.95rem", fontWeight: 700,
          margin: "0 0 0.375rem", color: C.text,
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
        }}>
          {project.title}
        </h3>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
          <span style={{ fontSize: "0.72rem", color: C.muted, fontFamily: "'General Sans', sans-serif" }}>
            {project.category}
          </span>
          <span style={{ fontSize: "0.72rem", color: C.muted, display: "flex", alignItems: "center", gap: "3px" }}>
            <Clock size={11} />
            {new Date(project.created_at).toLocaleDateString()}
          </span>
        </div>

        <div style={{ display: "flex", gap: "0.375rem", flexWrap: "wrap", marginBottom: "0.625rem" }}>
          {project.tags?.slice(0, 2).map((tag: string) => (
            <span key={tag} style={{
              padding: "0.125rem 0.375rem",
              backgroundColor: C.hoverBg,
              color: "#FF6D1F",
              borderRadius: "4px",
              fontSize: "0.6rem",
              fontFamily: "'General Sans', sans-serif",
              fontWeight: 600,
            }}>{tag}</span>
          ))}
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center" }}>
          <button style={{
            padding: "0.3rem 0.625rem",
            backgroundColor: "#FF6D1F",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            fontSize: "0.68rem",
            fontWeight: 700,
            cursor: "pointer",
            display: "flex", alignItems: "center", gap: "2px",
            fontFamily: "'General Sans', sans-serif",
          }}>
            View <ChevronRight size={11} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ─── List Card ─────────────────────────────────────────────
function ListCard({ project, C }: { project: Project; C: ThemeTokens }) {
  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ x: 4, boxShadow: `0 4px 20px rgba(255,109,31,0.12)` }}
      style={{
        backgroundColor: C.cardBg,
        border: `1px solid ${C.cardBorder}`,
        borderRadius: "12px",
        padding: "1rem",
        display: "flex",
        gap: "1rem",
        cursor: "pointer",
        alignItems: "flex-start",
      }}
    >
      {/* Thumbnail */}
      <div style={{ position: "relative", width: "160px", height: "90px", flexShrink: 0, borderRadius: "8px", overflow: "hidden" }}>
        {project.thumbnail_url ? (
          <NextImage
            src={project.thumbnail_url}
            alt={project.title}
            fill
            sizes="160px"
            style={{ objectFit: "cover" }}
          />
        ) : (
          <Thumbnail size={24} />
        )}
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.5rem" }}>
          <h3 style={{
            fontFamily: "'Cabinet Grotesk', sans-serif",
            fontSize: "1rem", fontWeight: 700,
            margin: "0 0 0.25rem", color: C.text,
          }}>
            {project.title}
          </h3>
          <button style={{
            padding: "0.3rem 0.625rem",
            backgroundColor: "#FF6D1F",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            fontSize: "0.68rem",
            fontWeight: 700,
            cursor: "pointer",
            display: "flex", alignItems: "center", gap: "2px",
            fontFamily: "'General Sans', sans-serif",
            flexShrink: 0,
          }}>
            View <ChevronRight size={11} />
          </button>
        </div>

        <p style={{ fontSize: "0.8rem", color: C.muted, margin: "0 0 0.5rem", lineHeight: 1.5, fontFamily: "'Satoshi', sans-serif" }}>
          {project.description}
        </p>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", alignItems: "center" }}>
          <span style={{ fontSize: "0.7rem", color: C.muted, fontFamily: "'General Sans', sans-serif" }}>
            {project.category}
          </span>
          <span style={{ fontSize: "0.7rem", color: C.muted, display: "flex", alignItems: "center", gap: "3px" }}>
            <Clock size={11} />
            {new Date(project.created_at).toLocaleDateString()}
          </span>
          {project.tags?.map((tag: string) => (
            <span key={tag} style={{
              padding: "0.125rem 0.375rem",
              backgroundColor: C.hoverBg,
              color: "#FF6D1F",
              borderRadius: "4px",
              fontSize: "0.6rem",
              fontFamily: "'General Sans', sans-serif",
              fontWeight: 600,
            }}>{tag}</span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main Page ─────────────────────────────────────────────
export default function PortfolioPage() {
  const theme = useThemeMode();
  const C = theme === "dark" ? DARK_UI : LIGHT_UI;
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedCategory, setSelectedCategory] = useState("All");
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  
  // Form State
  const [newProject, setNewProject] = useState({
    title: "",
    category: "2D Animation",
    description: "",
    tags: "",
    thumbnail_url: "",
    media_url: ""
  });
  const [communityPosts, setCommunityPosts] = useState<CommunityPostDraft[]>([]);
  const [isTaggingMode, setIsTaggingMode] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [hasProAccess, setHasProAccess] = useState(false);
  const [freeUploadsThisMonth, setFreeUploadsThisMonth] = useState(0);

  const freeUploadLimit = 3;
  const freeUploadsRemaining = Math.max(0, freeUploadLimit - freeUploadsThisMonth);
  const canPublishProject = hasProAccess || freeUploadsRemaining > 0;

  useEffect(() => {
    async function init() {
      if (!supabase) return;
      
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      
      if (user && supabase) {
        const access = await getMembershipAccess(supabase, user.id);
        setHasProAccess(access.hasPro);

        // Fetch projects
        const { data: projData } = await supabase
          .from("portfolio_projects")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });
        
        if (projData) {
          setProjects(projData);
          const monthStart = new Date();
          monthStart.setDate(1);
          monthStart.setHours(0, 0, 0, 0);
          const uploadsThisMonth = projData.filter((project) => {
            const createdAt = new Date(project.created_at);
            return !Number.isNaN(createdAt.getTime()) && createdAt >= monthStart;
          }).length;
          setFreeUploadsThisMonth(uploadsThisMonth);
        }
        
        // Fetch community posts for tagging
        const { data: postData } = await supabase
          .from("community_posts")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });
          
        if (postData) setCommunityPosts(postData);
      }
      if (!user) {
        setHasProAccess(false);
        setFreeUploadsThisMonth(0);
      }
      setLoading(false);
    }
    init();
  }, []);

  const handleAddProject = async () => {
    if (!user || !newProject.title || !supabase) return;
    if (!hasProAccess && freeUploadsRemaining <= 0) return;
    setSubmitting(true);
    
    const projectToSave = {
      user_id: user.id,
      user_name: user.user_metadata.full_name || user.email?.split("@")[0] || "Anonymous",
      user_handle: user.user_metadata.handle || user.email?.split("@")[0] || "user",
      title: newProject.title,
      category: newProject.category,
      description: newProject.description,
      tags: newProject.tags.split(",").map(t => t.trim()).filter(t => t),
      thumbnail_url: newProject.thumbnail_url || null,
      media_url: newProject.media_url || null
    };

    const { data, error } = await supabase
      .from("portfolio_projects")
      .insert([projectToSave])
      .select();

    if (!error && data) {
      setProjects([data[0], ...projects]);
      if (!hasProAccess) {
        setFreeUploadsThisMonth((prev) => prev + 1);
      }
      setIsModalOpen(false);
      setNewProject({ title: "", category: "2D Animation", description: "", tags: "", thumbnail_url: "", media_url: "" });
    }
    setSubmitting(false);
  };

  const tagPost = (post: CommunityPostDraft) => {
    setNewProject({
      ...newProject,
      title: post.content.split("\n")[0].substring(0, 50),
      description: post.content,
      tags: post.tags.join(", ")
    });
    setIsTaggingMode(false);
  };

  const filteredProjects = useMemo(
    () => selectedCategory === "All"
      ? projects
      : projects.filter(p => p.category === selectedCategory),
    [selectedCategory, projects]
  );

  return (
    <div style={{ padding: "1.75rem 2rem", color: C.text, width: "100%", minHeight: "100vh" }}>
      
      {/* ── Header ─────────────────────────────────────── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem" }}>
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 style={{
            fontFamily: "'Clash Display', sans-serif",
            fontSize: "clamp(1.6rem, 4vw, 2.5rem)",
            fontWeight: 700,
            margin: "0 0 0.375rem",
            background: "linear-gradient(135deg, #FF6D1F, #E04D00)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
          }}>
            Here are some of your works
          </h1>
          <p style={{ color: C.muted, margin: 0, fontFamily: "'General Sans', sans-serif", fontSize: "0.9rem" }}>
            Showcase your creative journey through animation
          </p>
        </motion.div>

        <button 
          onClick={() => canPublishProject && setIsModalOpen(true)}
          style={{
            backgroundColor: canPublishProject ? "#FF6D1F" : C.dim,
            color: "#fff",
            border: "none",
            borderRadius: "12px",
            padding: "0.75rem 1.25rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            fontSize: "0.85rem",
            fontWeight: 700,
            cursor: canPublishProject ? "pointer" : "not-allowed",
            boxShadow: canPublishProject ? "0 4px 20px rgba(255,109,31,0.25)" : "none",
            fontFamily: "'General Sans', sans-serif"
          }}
        >
          <Plus style={{ width: "18px", height: "18px" }} />
          {hasProAccess ? "Add Work" : freeUploadsRemaining > 0 ? `Add Work (${freeUploadsRemaining} left)` : "Upgrade for more uploads"}
        </button>
      </div>

      {!hasProAccess && (
        <div style={{ marginBottom: "1.25rem", padding: "0.9rem 1rem", borderRadius: "16px", border: `1px solid ${C.cardBorder}`, backgroundColor: C.cardBg, display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
          <div>
            <p style={{ margin: 0, fontSize: "0.86rem", fontWeight: 700, color: C.text, fontFamily: "'Cabinet Grotesk', sans-serif" }}>
              Free plan portfolio access
            </p>
            <p style={{ margin: "0.25rem 0 0", color: C.muted, fontSize: "0.8rem", fontFamily: "'General Sans', sans-serif" }}>
              You can publish up to {freeUploadLimit} projects per month on Free. Messaging stays available for everyone.
            </p>
          </div>
          <Link href="/pricing" style={{ color: "#FF6D1F", textDecoration: "none", fontWeight: 700, fontSize: "0.8rem", fontFamily: "'General Sans', sans-serif" }}>
            Upgrade to Pro
          </Link>
        </div>
      )}

      {/* ── Controls Row ────────────────────────────────── */}
      <div style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "0.75rem",
        alignItems: "center",
        marginBottom: "2rem",
      }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.375rem", flex: 1 }}>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                padding: "0.375rem 0.875rem",
                border: `1px solid ${selectedCategory === cat ? "#FF6D1F" : C.filterBorder}`,
                backgroundColor: selectedCategory === cat ? C.pillActive : C.pillInactive,
                color: selectedCategory === cat ? C.pillActiveTxt : C.pillInactiveTxt,
                borderRadius: "999px",
                cursor: "pointer",
                fontFamily: "'General Sans', sans-serif",
                fontSize: "0.78rem",
                fontWeight: selectedCategory === cat ? 700 : 400,
                transition: "all 0.18s ease",
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        <div style={{
          display: "flex",
          border: `1px solid ${C.filterBorder}`,
          borderRadius: "8px",
          backgroundColor: C.filterBg,
          padding: "2px",
          flexShrink: 0,
        }}>
          <button
            onClick={() => setViewMode("grid")}
            style={{
              padding: "0.4rem 0.7rem",
              border: "none",
              backgroundColor: viewMode === "grid" ? "#FF6D1F" : "transparent",
              color: viewMode === "grid" ? "#222" : C.text,
              borderRadius: "6px 0 0 6px",
              cursor: "pointer",
              display: "flex", alignItems: "center", gap: "0.375rem",
              fontSize: "0.8rem", fontWeight: 600,
            }}
          >
            <Grid3X3 size={15} /> Grid
          </button>
          <button
            onClick={() => setViewMode("list")}
            style={{
              padding: "0.4rem 0.7rem",
              border: "none",
              backgroundColor: viewMode === "list" ? "#FF6D1F" : "transparent",
              color: viewMode === "list" ? "#222" : C.text,
              borderRadius: "0 6px 6px 0",
              cursor: "pointer",
              display: "flex", alignItems: "center", gap: "0.375rem",
              fontSize: "0.8rem", fontWeight: 600,
            }}
          >
            <List size={15} /> List
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "1rem" }}>
          {[1, 2, 3].map(i => <div key={i} style={{ height: "200px", borderRadius: "12px", backgroundColor: C.cardBg, opacity: 0.5 }} />)}
        </div>
      ) : filteredProjects.length === 0 ? (
        <div style={{ 
          textAlign: "center", 
          padding: "5rem 2rem", 
          border: `1px dashed ${C.filterBorder}`, 
          borderRadius: "20px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center"
        }}>
          <Upload style={{ width: "48px", height: "48px", color: C.dim, marginBottom: "1.25rem", opacity: 0.5 }} />
          <h2 style={{ fontSize: "1.25rem", fontFamily: "'Clash Display', sans-serif", margin: "0 0 0.5rem" }}>Your portfolio is empty</h2>
          <p style={{ color: C.muted, fontSize: "0.9rem", margin: 0 }}>Start by adding your first project!</p>
        </div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          style={viewMode === "grid" ? {
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: "1.5rem",
          } : {
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
          }}
        >
          {filteredProjects.map(project => (
            viewMode === "grid"
              ? <GridCard key={project.id} project={project} C={C} />
              : <ListCard key={project.id} project={project} C={C} />
          ))}
        </motion.div>
      )}

      {/* ── Add Project Modal ─────────────────────────────── */}
      <AnimatePresence>
        {isModalOpen && (
          <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem", backgroundColor: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)" }}>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              style={{
                width: "100%",
                maxWidth: "600px",
                backgroundColor: C.cardBg,
                border: `1px solid ${C.cardBorder}`,
                borderRadius: "24px",
                padding: "2rem",
                position: "relative",
                maxHeight: "90vh",
                overflowY: "auto"
              }}
            >
              <button 
                onClick={() => setIsModalOpen(false)}
                style={{ position: "absolute", top: "1.5rem", right: "1.5rem", background: "none", border: "none", cursor: "pointer", color: C.text }}
              >
                <X size={24} />
              </button>

              <h2 style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: "1.75rem", fontWeight: 700, marginBottom: "0.5rem" }}>
                Add New Project
              </h2>
              <p style={{ color: C.muted, fontSize: "0.9rem", marginBottom: "1.5rem" }}>
                {hasProAccess
                  ? "Share your latest masterpiece with the community."
                  : `Share your latest masterpiece with the community. Free plan: ${freeUploadsRemaining} of ${freeUploadLimit} uploads left this month.`}
              </p>

              {!hasProAccess && !canPublishProject && (
                <div style={{ marginBottom: "1.25rem", padding: "0.85rem 0.95rem", borderRadius: "14px", border: `1px solid ${C.cardBorder}`, backgroundColor: C.hoverBg, color: C.text, fontSize: "0.82rem", fontFamily: "'General Sans', sans-serif", lineHeight: 1.5 }}>
                  You have reached your free monthly portfolio limit. Upgrade to Pro for unlimited uploads.
                </div>
              )}

              {/* Tag from Community Banner */}
              <div 
                onClick={() => setIsTaggingMode(!isTaggingMode)}
                style={{
                  padding: "1rem",
                  borderRadius: "16px",
                  backgroundColor: C.hoverBg,
                  border: `1px solid ${C.pillActive}44`,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "1.5rem"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <Hash style={{ color: C.pillActive }} />
                  <div>
                    <p style={{ margin: 0, fontSize: "0.85rem", fontWeight: 700 }}>Tag from Community Feed</p>
                    <p style={{ margin: 0, fontSize: "0.75rem", color: C.muted }}>Quickly import details from a post you already made.</p>
                  </div>
                </div>
                <ChevronRight size={16} />
              </div>

              {isTaggingMode ? (
                <div style={{ marginBottom: "1.5rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  <p style={{ fontSize: "0.8rem", fontWeight: 700, color: C.muted }}>Select a post to import:</p>
                  {communityPosts.length === 0 ? (
                    <p style={{ fontSize: "0.8rem", color: C.dim, textAlign: "center", padding: "1rem" }}>No community posts found.</p>
                  ) : (
                    communityPosts.slice(0, 5).map(post => (
                      <div 
                        key={post.id}
                        onClick={() => tagPost(post)}
                        style={{ padding: "0.75rem", borderRadius: "10px", border: `1px solid ${C.cardBorder}`, cursor: "pointer", fontSize: "0.8rem", color: C.text }}
                      >
                        {post.content.substring(0, 80)}...
                      </div>
                    ))
                  )}
                  <button onClick={() => setIsTaggingMode(false)} style={{ background: "none", border: "none", color: C.pillActive, fontSize: "0.8rem", cursor: "pointer" }}>Cancel</button>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, marginBottom: "0.5rem" }}>Title</label>
                    <input 
                      value={newProject.title}
                        onChange={e => setNewProject({...newProject, title: e.target.value})}
                        disabled={!canPublishProject}
                      placeholder="My Animation Project"
                      style={{ width: "100%", padding: "0.75rem", borderRadius: "10px", border: `1px solid ${C.cardBorder}`, backgroundColor: "rgba(0,0,0,0.1)", color: C.text }}
                    />
                  </div>
                  
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, marginBottom: "0.5rem" }}>Category</label>
                      <select 
                        value={newProject.category}
                        onChange={e => setNewProject({...newProject, category: e.target.value})}
                        disabled={!canPublishProject}
                        style={{ width: "100%", padding: "0.75rem", borderRadius: "10px", border: `1px solid ${C.cardBorder}`, backgroundColor: "rgba(0,0,0,0.1)", color: C.text }}
                      >
                        {CATEGORIES.slice(1).map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, marginBottom: "0.5rem" }}>Tags (comma separated)</label>
                      <input 
                        value={newProject.tags}
                        onChange={e => setNewProject({...newProject, tags: e.target.value})}
                        disabled={!canPublishProject}
                        placeholder="2d, character, wip"
                        style={{ width: "100%", padding: "0.75rem", borderRadius: "10px", border: `1px solid ${C.cardBorder}`, backgroundColor: "rgba(0,0,0,0.1)", color: C.text }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, marginBottom: "0.5rem" }}>Description</label>
                    <textarea 
                      value={newProject.description}
                        onChange={e => setNewProject({...newProject, description: e.target.value})}
                        disabled={!canPublishProject}
                      rows={3}
                      placeholder="Tell us about your work..."
                      style={{ width: "100%", padding: "0.75rem", borderRadius: "10px", border: `1px solid ${C.cardBorder}`, backgroundColor: "rgba(0,0,0,0.1)", color: C.text, resize: "none" }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, marginBottom: "0.5rem" }}>Project URL (optional)</label>
                    <input 
                      value={newProject.media_url}
                        onChange={e => setNewProject({...newProject, media_url: e.target.value})}
                        disabled={!canPublishProject}
                      placeholder="vimeo.com/..."
                      style={{ width: "100%", padding: "0.75rem", borderRadius: "10px", border: `1px solid ${C.cardBorder}`, backgroundColor: "rgba(0,0,0,0.1)", color: C.text }}
                    />
                  </div>

                  <button 
                    disabled={submitting || !newProject.title || !canPublishProject}
                    onClick={handleAddProject}
                    style={{
                      marginTop: "0.5rem",
                      backgroundColor: submitting || !canPublishProject ? C.dim : "#FF6D1F",
                      color: "#fff",
                      border: "none",
                      borderRadius: "12px",
                      padding: "1rem",
                      fontWeight: 700,
                      cursor: submitting || !canPublishProject ? "not-allowed" : "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "0.5rem"
                    }}
                  >
                    {submitting ? "Adding..." : canPublishProject ? "Publish to Portfolio" : "Upgrade to Pro"}
                    {!submitting && canPublishProject && <Check style={{ width: "18px", height: "18px" }} />}
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

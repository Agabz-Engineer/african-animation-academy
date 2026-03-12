"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Play,
  Heart,
  MessageCircle,
  Grid3X3,
  List,
  ChevronRight,
  Eye,
  Clock,
} from "lucide-react";
import { useThemeMode } from "@/lib/useThemeMode";

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
const ANIMATION_PROJECTS = [
  {
    id: 1, title: "African Sunset Journey", category: "2D Animation",
    duration: "2:30", views: 1234, likes: 89, comments: 12, featured: true,
    description: "A vibrant 2D animation celebrating African landscapes and culture",
    tags: ["2D", "Cultural", "Landscape"],
  },
  {
    id: 2, title: "Character Design: Adanna", category: "Character Design",
    duration: "1:45", views: 892, likes: 67, comments: 8, featured: true,
    description: "Original character design inspired by West African aesthetics",
    tags: ["Character", "Design", "Cultural"],
  },
  {
    id: 3, title: "City Rhythm", category: "Motion Graphics",
    duration: "0:30", views: 2341, likes: 156, comments: 23, featured: false,
    description: "Dynamic motion graphics capturing the pulse of African city life",
    tags: ["Motion Graphics", "Urban", "Abstract"],
  },
  {
    id: 4, title: "Wildlife Documentary Intro", category: "3D Animation",
    duration: "1:15", views: 3456, likes: 234, comments: 45, featured: true,
    description: "3D animated introduction for African wildlife documentary",
    tags: ["3D", "Wildlife", "Documentary"],
  },
  {
    id: 5, title: "Traditional Patterns", category: "Motion Design",
    duration: "0:45", views: 1567, likes: 98, comments: 15, featured: false,
    description: "Animated traditional African patterns with a modern twist",
    tags: ["Patterns", "Traditional", "Modern"],
  },
  {
    id: 6, title: "Dance of the Spirits", category: "2D Animation",
    duration: "3:20", views: 4567, likes: 312, comments: 67, featured: true,
    description: "Spiritual dance animation inspired by African folklore",
    tags: ["2D", "Dance", "Folklore"],
  },
];

const CATEGORIES = ["All", "2D Animation", "3D Animation", "Character Design", "Motion Graphics", "Motion Design"];

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
function GridCard({ project, C }: { project: typeof ANIMATION_PROJECTS[0]; C: typeof DARK_UI }) {
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
      <div style={{ position: "relative", paddingBottom: "56.25%" }}>
        <Thumbnail size={36} />
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
            {project.duration}
          </span>
        </div>

        <div style={{ display: "flex", gap: "0.375rem", flexWrap: "wrap", marginBottom: "0.625rem" }}>
          {project.tags.slice(0, 2).map(tag => (
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

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <span style={{ fontSize: "0.68rem", color: C.muted, display: "flex", alignItems: "center", gap: "3px" }}>
              <Eye size={11} />{project.views.toLocaleString()}
            </span>
            <span style={{ fontSize: "0.68rem", color: C.muted, display: "flex", alignItems: "center", gap: "3px" }}>
              <Heart size={11} />{project.likes}
            </span>
            <span style={{ fontSize: "0.68rem", color: C.muted, display: "flex", alignItems: "center", gap: "3px" }}>
              <MessageCircle size={11} />{project.comments}
            </span>
          </div>
          <button style={{
            padding: "0.3rem 0.625rem",
            backgroundColor: "#FF6D1F",
            color: "#222",
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
function ListCard({ project, C }: { project: typeof ANIMATION_PROJECTS[0]; C: typeof DARK_UI }) {
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
        <Thumbnail size={24} />
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
            color: "#222",
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
            <Clock size={11} />{project.duration}
          </span>
          <span style={{ fontSize: "0.7rem", color: C.muted, display: "flex", alignItems: "center", gap: "3px" }}>
            <Eye size={11} />{project.views.toLocaleString()}
          </span>
          <span style={{ fontSize: "0.7rem", color: C.muted, display: "flex", alignItems: "center", gap: "3px" }}>
            <Heart size={11} />{project.likes}
          </span>
          {project.tags.map(tag => (
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

  const filteredProjects = useMemo(
    () => selectedCategory === "All"
      ? ANIMATION_PROJECTS
      : ANIMATION_PROJECTS.filter(p => p.category === selectedCategory),
    [selectedCategory]
  );

  const featuredProjects = useMemo(
    () => ANIMATION_PROJECTS.filter(p => p.featured),
    []
  );

  return (
    <div style={{ padding: "1.75rem 2rem", color: C.text, width: "100%" }}>

      {/* ── Header ─────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{ marginBottom: "1.5rem" }}
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
          Animation Portfolio
        </h1>
        <p style={{ color: C.muted, margin: 0, fontFamily: "'General Sans', sans-serif", fontSize: "0.9rem" }}>
          Showcase your creative journey through animation
        </p>
      </motion.div>

      {/* ── Controls Row ────────────────────────────────── */}
      <div style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "0.75rem",
        alignItems: "center",
        marginBottom: "2rem",
      }}>
        {/* Category Pills */}
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

        {/* Grid / List Toggle */}
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
            title="Grid view"
            style={{
              padding: "0.4rem 0.7rem",
              border: "none",
              backgroundColor: viewMode === "grid" ? "#FF6D1F" : "transparent",
              color: viewMode === "grid" ? "#222" : C.text,
              borderRadius: "6px 0 0 6px",
              cursor: "pointer",
              display: "flex", alignItems: "center", gap: "0.375rem",
              fontFamily: "'General Sans', sans-serif",
              fontSize: "0.8rem", fontWeight: 600,
              transition: "background-color 0.18s",
            }}
          >
            <Grid3X3 size={15} />
            Grid
          </button>
          <button
            onClick={() => setViewMode("list")}
            title="List view"
            style={{
              padding: "0.4rem 0.7rem",
              border: "none",
              backgroundColor: viewMode === "list" ? "#FF6D1F" : "transparent",
              color: viewMode === "list" ? "#222" : C.text,
              borderRadius: "0 6px 6px 0",
              cursor: "pointer",
              display: "flex", alignItems: "center", gap: "0.375rem",
              fontFamily: "'General Sans', sans-serif",
              fontSize: "0.8rem", fontWeight: 600,
              transition: "background-color 0.18s",
            }}
          >
            <List size={15} />
            List
          </button>
        </div>
      </div>

      {/* ── Featured Works (only when "All" selected) ──── */}
      {selectedCategory === "All" && (
        <section style={{ marginBottom: "2.5rem" }}>
          <h2 style={{
            fontFamily: "'Clash Display', sans-serif",
            fontSize: "1.25rem", fontWeight: 700,
            marginBottom: "1.25rem", color: C.text,
          }}>
            ⭐ Featured Works
          </h2>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            style={viewMode === "grid" ? {
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
              gap: "1rem",
            } : {
              display: "flex",
              flexDirection: "column",
              gap: "0.875rem",
            }}
          >
            {featuredProjects.map(project =>
              viewMode === "grid"
                ? <GridCard key={project.id} project={project} C={C} />
                : <ListCard key={project.id} project={project} C={C} />
            )}
          </motion.div>
        </section>
      )}

      {/* ── All / Filtered Projects ─────────────────────── */}
      <section>
        <h2 style={{
          fontFamily: "'Clash Display', sans-serif",
          fontSize: "1.25rem", fontWeight: 700,
          marginBottom: "1.25rem", color: C.text,
        }}>
          {selectedCategory === "All" ? "All Projects" : selectedCategory}
          <span style={{ marginLeft: "0.5rem", fontSize: "0.8rem", color: C.muted, fontWeight: 400 }}>
            ({filteredProjects.length})
          </span>
        </h2>

        {filteredProjects.length === 0 ? (
          <div style={{
            textAlign: "center", padding: "3rem 1rem",
            border: `1px dashed ${C.filterBorder}`,
            borderRadius: "12px",
            color: C.muted,
            fontFamily: "'General Sans', sans-serif",
          }}>
            No projects found in <strong>{selectedCategory}</strong>
          </div>
        ) : (
          <motion.div
            key={`${selectedCategory}-${viewMode}`}
            variants={containerVariants}
            initial="hidden"
            animate="show"
            style={viewMode === "grid" ? {
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))",
              gap: "1rem",
            } : {
              display: "flex",
              flexDirection: "column",
              gap: "0.875rem",
            }}
          >
            {filteredProjects.map(project =>
              viewMode === "grid"
                ? <GridCard key={project.id} project={project} C={C} />
                : <ListCard key={project.id} project={project} C={C} />
            )}
          </motion.div>
        )}
      </section>
    </div>
  );
}

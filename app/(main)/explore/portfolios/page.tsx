"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  Filter, 
  Grid3X3, 
  List as ListIcon, 
  ChevronRight, 
  Play, 
  Users as UsersIcon,
  Sparkles,
  ExternalLink,
  MessageSquare,
  Heart
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useThemeMode } from "@/lib/useThemeMode";
import FollowButton from "@/app/components/ui/FollowButton";
import MessageModal from "@/app/components/ui/MessageModal";

// ─── Types ─────────────────────────────────────────────────
type PortfolioProject = {
  id: string;
  user_id: string;
  user_name: string;
  user_handle: string;
  title: string;
  description: string;
  category: string;
  thumbnail_url: string | null;
  media_url: string | null;
  tags: string[];
  created_at: string;
  profiles?: {
    followers_count: number;
    total_platform_likes: number;
    avatar_url: string | null;
  };
};

// ─── Themes ───────────────────────────────────────────────
const DARK = {
  pageBg: "#222222",
  panel: "rgba(44, 44, 44, 0.90)",
  border: "rgba(255,255,255,0.12)",
  text: "#FAF3E1",
  muted: "#D2C9B8",
  dim: "#9E9688",
  accent: "#FF6D1F",
  accentSoft: "rgba(255,109,31,0.12)",
  cardBg: "rgba(44, 44, 44, 0.70)",
  cardBorder: "rgba(68, 68, 68, 0.40)",
  input: "#2C2C2C",
};

const LIGHT = {
  pageBg: "#FAF3E1",
  panel: "rgba(255, 255, 255, 0.89)",
  border: "rgba(0, 0, 0, 0.12)",
  text: "#222222",
  muted: "#555555",
  dim: "#9E9688",
  accent: "#FF6D1F",
  accentSoft: "rgba(255,109,31,0.10)",
  cardBg: "rgba(255, 255, 255, 0.90)",
  cardBorder: "rgba(231, 219, 189, 0.50)",
  input: "#FFFFFF",
};

const CATEGORIES = ["All", "2D Animation", "3D Animation", "Character Design", "Motion Graphics", "VFX"];

// ─── Components ──────────────────────────────────────────
function ProjectCard({ project, theme, viewMode }: { project: PortfolioProject, theme: any, viewMode: "grid" | "list" }) {
  const isGrid = viewMode === "grid";
  const [isMsgOpen, setIsMsgOpen] = useState(false);
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, boxShadow: `0 12px 30px rgba(0,0,0,0.15)` }}
      style={{
        backgroundColor: theme.cardBg,
        border: `1px solid ${theme.cardBorder}`,
        borderRadius: "16px",
        overflow: "hidden",
        display: isGrid ? "block" : "flex",
        gap: isGrid ? 0 : "1.5rem",
        padding: isGrid ? 0 : "1rem",
        cursor: "pointer",
        transition: "transform 0.2s ease",
      }}
    >
      {/* Thumbnail */}
      <div style={{ 
        position: "relative", 
        width: isGrid ? "100%" : "200px",
        height: isGrid ? "180px" : "112px",
        borderRadius: isGrid ? 0 : "10px",
        overflow: "hidden",
        backgroundColor: theme.accentSoft,
        flexShrink: 0
      }}>
        {project.thumbnail_url ? (
          <img src={project.thumbnail_url} alt={project.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Play style={{ width: "32px", height: "32px", color: theme.accent, opacity: 0.6 }} />
          </div>
        )}
        <div style={{ position: "absolute", top: "0.75rem", right: "0.75rem", backgroundColor: "rgba(0,0,0,0.6)", padding: "0.25rem 0.6rem", borderRadius: "999px", fontSize: "0.65rem", color: "#fff", backdropFilter: "blur(4px)" }}>
          {project.category}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: isGrid ? "1.2rem" : "0.5rem 0", flex: 1, display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.4rem" }}>
          <h3 style={{ 
            fontFamily: "'Cabinet Grotesk', sans-serif", 
            fontSize: "1.1rem", 
            fontWeight: 700, 
            margin: 0,
            color: theme.text
          }}>
            {project.title}
          </h3>
          <div style={{ display: "flex", gap: "0.5rem", flexShrink: 0 }}>
             {/* Messaging action */}
             <button 
                onClick={(e) => { e.stopPropagation(); setIsMsgOpen(true); }}
                style={{ background: theme.accentSoft, border: "none", color: theme.accent, padding: "0.4rem", borderRadius: "8px", cursor: "pointer" }}
             >
                <MessageSquare size={14} />
             </button>
             <FollowButton targetUserId={project.user_id} />
          </div>
        </div>

        <p style={{ 
          fontSize: "0.85rem", 
          color: theme.muted, 
          lineHeight: 1.5, 
          margin: "0 0 1rem",
          display: "-webkit-box",
          WebkitLineClamp: isGrid ? 2 : 3,
          WebkitBoxOrient: "vertical",
          overflow: "hidden"
        }}>
          {project.description || "No description provided."}
        </p>

        {/* Social Stats */}
        <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
           <div style={{ display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.75rem", color: theme.dim }}>
              <UsersIcon size={12} />
              <span>{project.profiles?.followers_count || 0} followers</span>
           </div>
           <div style={{ display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.75rem", color: theme.dim }}>
              <Heart size={12} />
              <span>{project.profiles?.total_platform_likes || 0} platform likes</span>
           </div>
        </div>
        
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <div style={{ 
              width: "24px", 
              height: "24px", 
              borderRadius: "50%", 
              backgroundColor: theme.accent, 
              backgroundImage: project.profiles?.avatar_url ? `url(${project.profiles.avatar_url})` : "none",
              backgroundSize: "cover",
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center", 
              fontSize: "0.65rem", 
              color: "#fff", 
              fontWeight: 700 
            }}>
              {!project.profiles?.avatar_url && project.user_name.charAt(0)}
            </div>
            <span style={{ fontSize: "0.78rem", color: theme.dim, fontFamily: "'Satoshi', sans-serif" }}>@{project.user_handle}</span>
          </div>
          <button style={{ background: "none", border: "none", color: theme.accent, display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.78rem", fontWeight: 700, cursor: "pointer" }}>
            View <ExternalLink style={{ width: "12px", height: "12px" }} />
          </button>
        </div>
      </div>

      <MessageModal
        isOpen={isMsgOpen}
        onClose={() => setIsMsgOpen(false)}
        receiverId={project.user_id}
        receiverName={project.user_name}
        contextTitle={project.title}
      />
    </motion.div>
  );
}

// ─── Main Page ─────────────────────────────────────────────
export default function ExplorePortfoliosPage() {
  const themeMode = useThemeMode();
  const theme = themeMode === "dark" ? DARK : LIGHT;
  
  const [projects, setProjects] = useState<PortfolioProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  useEffect(() => {
    async function fetchProjects() {
      if (!supabase) {
        setLoading(false);
        return;
      }
      
      const { data, error } = await supabase
        .from("portfolio_projects")
        .select("*, profiles!portfolio_projects_user_id_fkey(followers_count, total_platform_likes, avatar_url)")
        .order("created_at", { ascending: false });
        
      if (!error && data) {
        setProjects(data as any);
      }
      setLoading(false);
    }
    
    fetchProjects();
  }, []);

  const filteredProjects = useMemo(() => {
    return projects.filter(p => {
      const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase()) || 
                           p.user_name.toLowerCase().includes(search.toLowerCase()) ||
                           p.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));
      const matchesCategory = category === "All" || p.category === category;
      return matchesSearch && matchesCategory;
    });
  }, [projects, search, category]);

  return (
    <div style={{ 
      minHeight: "100vh", 
      backgroundColor: theme.pageBg,
      color: theme.text,
      padding: "2rem"
    }}>
      {/* Header */}
      <header style={{ marginBottom: "2.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.75rem" }}>
          <div style={{ padding: "0.4rem", borderRadius: "8px", backgroundColor: theme.accentSoft }}>
            <Sparkles style={{ width: "16px", height: "16px", color: theme.accent }} />
          </div>
          <span style={{ fontSize: "0.85rem", fontWeight: 700, color: theme.accent, textTransform: "uppercase", letterSpacing: "0.05em" }}>Discovery Hub</span>
        </div>
        <h1 style={{ 
          fontFamily: "'Clash Display', sans-serif", 
          fontSize: "clamp(2rem, 5vw, 3rem)", 
          fontWeight: 700, 
          margin: "0 0 0.5rem",
          letterSpacing: "-0.02em"
        }}>
          Explore Portfolios
        </h1>
        <p style={{ color: theme.muted, fontSize: "1.1rem", maxWidth: "600px" }}>
          Discover the next generation of African animators, designers, and visual storytellers.
        </p>
      </header>

      {/* Controls */}
      <div style={{ 
        display: "flex", 
        flexWrap: "wrap", 
        gap: "1rem", 
        marginBottom: "2rem",
        alignItems: "center",
        justifyContent: "space-between"
      }}>
        {/* Search & Category */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", flex: 1 }}>
          <div style={{ position: "relative", minWidth: "280px" }}>
            <Search style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", width: "16px", height: "16px", color: theme.dim }} />
            <input 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, creator, or tags..."
              style={{
                width: "100%",
                padding: "0.85rem 1rem 0.85rem 2.75rem",
                borderRadius: "12px",
                border: `1px solid ${theme.border}`,
                backgroundColor: theme.input,
                color: theme.text,
                fontSize: "0.95rem",
                outline: "none",
                fontFamily: "'Satoshi', sans-serif"
              }}
            />
          </div>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                style={{
                  padding: "0.6rem 1.25rem",
                  borderRadius: "999px",
                  border: `1px solid ${category === cat ? theme.accent : theme.border}`,
                  backgroundColor: category === cat ? theme.accent : "transparent",
                  color: category === cat ? "#fff" : theme.muted,
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.2s ease"
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* View Toggle */}
        <div style={{ 
          display: "flex", 
          gap: "2px", 
          backgroundColor: theme.input, 
          padding: "3px", 
          borderRadius: "10px",
          border: `1px solid ${theme.border}`
        }}>
          <button 
            onClick={() => setViewMode("grid")}
            style={{ 
              padding: "0.5rem", 
              borderRadius: "8px", 
              backgroundColor: viewMode === "grid" ? theme.accent : "transparent",
              color: viewMode === "grid" ? "#fff" : theme.dim,
              border: "none",
              cursor: "pointer"
            }}
          >
            <Grid3X3 style={{ width: "18px", height: "18px" }} />
          </button>
          <button 
            onClick={() => setViewMode("list")}
            style={{ 
              padding: "0.5rem", 
              borderRadius: "8px", 
              backgroundColor: viewMode === "list" ? theme.accent : "transparent",
              color: viewMode === "list" ? "#fff" : theme.dim,
              border: "none",
              cursor: "pointer"
            }}
          >
            <ListIcon style={{ width: "18px", height: "18px" }} />
          </button>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1.5rem" }}>
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} style={{ height: "300px", borderRadius: "16px", backgroundColor: theme.cardBg, border: `1px solid ${theme.cardBorder}`, opacity: 0.5 }} />
          ))}
        </div>
      ) : filteredProjects.length > 0 ? (
        <motion.div 
          layout
          style={{ 
            display: viewMode === "grid" ? "grid" : "flex", 
            flexDirection: viewMode === "grid" ? "column" : "column",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", 
            gap: "1.5rem" 
          }}
        >
          <AnimatePresence>
            {filteredProjects.map(project => (
              <ProjectCard key={project.id} project={project} theme={theme} viewMode={viewMode} />
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        <div style={{ 
          textAlign: "center", 
          padding: "5rem 2rem", 
          border: `2px dashed ${theme.border}`, 
          borderRadius: "20px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center"
        }}>
          <UsersIcon style={{ width: "48px", height: "48px", color: theme.dim, marginBottom: "1.25rem", opacity: 0.5 }} />
          <h2 style={{ fontSize: "1.5rem", fontFamily: "'Clash Display', sans-serif", margin: "0 0 0.5rem" }}>No portfolios found</h2>
          <p style={{ color: theme.dim, margin: 0 }}>Try adjusting your search or category filters.</p>
        </div>
      )}
    </div>
  );
}

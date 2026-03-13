"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, 
  MapPin, 
  Briefcase, 
  GraduationCap, 
  Plus,
  Mail,
  Heart,
  Users as UsersIcon,
  Play,
  Settings,
  Edit3
} from "lucide-react";
import DashboardLayout from "@/app/components/ui/DashboardLayout";
import { useThemeMode } from "@/lib/useThemeMode";
import { supabase } from "@/lib/supabase";

const TABS = ["Portfolio", "Experience", "Education", "About"];

export default function ProfilePage() {
  const theme = useThemeMode();
  const [activeTab, setActiveTab] = useState("Portfolio");
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);

  const isDark = theme === "dark";
  const C = {
    bg: isDark ? "#222222" : "#FAF3E1",
    cardBg: isDark ? "rgba(44, 44, 44, 0.70)" : "rgba(255, 255, 255, 0.90)",
    border: isDark ? "rgba(255,255,255,0.12)" : "rgba(0, 0, 0, 0.12)",
    text: isDark ? "#FAF3E1" : "#222222",
    muted: isDark ? "#D2C9B8" : "#555555",
    accent: "#FF6D1F",
    accentSoft: isDark ? "rgba(255,109,31,0.12)" : "rgba(255,109,31,0.10)",
    input: isDark ? "#2C2C2C" : "#FFFFFF"
  };

  useEffect(() => {
    async function fetchProfileData() {
      if (!supabase) { setLoading(false); return; }
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setLoading(false); return; }

      // Fetch Profile Stats
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();
        
      if (profile) setUserProfile(profile);

      // Fetch Portfolio
      const { data: portfolio } = await supabase
        .from("portfolio_projects")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });
        
      if (portfolio) setProjects(portfolio);
      
      setLoading(false);
    }
    
    fetchProfileData();
  }, []);

  return (
    <DashboardLayout>
      <div style={{ padding: "2rem", color: C.text, minHeight: "100vh", backgroundColor: C.bg }}>
        
        {/* Header Cover & Profile */}
        <div style={{ position: "relative", marginBottom: "4rem" }}>
          <div style={{ 
            height: "200px", 
            borderRadius: "20px", 
            background: "linear-gradient(135deg, #FF6D1F, #8E2DE2)",
            position: "relative"
          }}>
             <button style={{ position: "absolute", top: "1rem", right: "1rem", background: "rgba(0,0,0,0.5)", color: "#fff", border: "none", padding: "0.5rem", borderRadius: "8px", cursor: "pointer", display: "flex", gap: "0.5rem", alignItems: "center" }}>
               <Edit3 size={16} /> Edit Cover
             </button>
          </div>
          
          <div style={{ 
            position: "absolute", 
            bottom: "-3rem", 
            left: "2rem", 
            display: "flex", 
            alignItems: "flex-end", 
            gap: "1.5rem" 
          }}>
            <div style={{ 
              width: "120px", 
              height: "120px", 
              borderRadius: "50%", 
              backgroundColor: C.cardBg, 
              border: `4px solid ${C.bg}`,
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center",
              overflow: "hidden",
              backgroundImage: userProfile?.avatar_url ? `url(${userProfile.avatar_url})` : "none",
              backgroundSize: "cover"
            }}>
              {!userProfile?.avatar_url && <User size={50} color={C.muted} />}
            </div>
            <div style={{ paddingBottom: "0.5rem" }}>
              <h1 style={{ fontSize: "2rem", fontWeight: 700, margin: 0, fontFamily: "'Clash Display', sans-serif" }}>
                {userProfile?.full_name || "Creative Animator"}
              </h1>
              <p style={{ color: C.muted, margin: 0, fontSize: "1rem" }}>@{userProfile?.username || "animator"}</p>
            </div>
          </div>
          
          <div style={{ position: "absolute", bottom: "-2rem", right: "2rem", display: "flex", gap: "1rem" }}>
             <button style={{ 
                background: C.cardBg, 
                color: C.text,
                border: `1px solid ${C.border}`,
                padding: "0.6rem 1.2rem",
                borderRadius: "8px",
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                cursor: "pointer"
              }}>
                <Settings size={18} /> Settings
              </button>
          </div>
        </div>

        {/* Stats Row */}
        <div style={{ display: "flex", gap: "2rem", paddingLeft: "2rem", marginBottom: "3rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <UsersIcon style={{ color: C.accent }} size={20} />
            <span style={{ fontWeight: 700, fontSize: "1.1rem" }}>{userProfile?.followers_count || 0}</span>
            <span style={{ color: C.muted, fontSize: "0.9rem" }}>Followers</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Heart style={{ color: C.accent }} size={20} />
            <span style={{ fontWeight: 700, fontSize: "1.1rem" }}>{userProfile?.total_platform_likes || 0}</span>
            <span style={{ color: C.muted, fontSize: "0.9rem" }}>Total Likes</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <MapPin style={{ color: C.muted }} size={18} />
            <span style={{ color: C.muted, fontSize: "0.9rem" }}>Africa</span>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: "2rem", borderBottom: `1px solid ${C.border}`, marginBottom: "2rem", overflowX: "auto" }}>
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                background: "none",
                border: "none",
                padding: "1rem 0",
                color: activeTab === tab ? C.text : C.muted,
                fontWeight: activeTab === tab ? 600 : 500,
                fontSize: "1rem",
                cursor: "pointer",
                position: "relative",
                transition: "color 0.2s"
              }}
            >
              {tab}
              {activeTab === tab && (
                <motion.div 
                  layoutId="activeProfileTab"
                  style={{ position: "absolute", bottom: -1, left: 0, right: 0, height: "2px", background: C.accent }} 
                />
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div style={{ minHeight: "400px" }}>
          <AnimatePresence mode="wait">
            
            {activeTab === "Portfolio" && (
              <motion.div key="portfolio" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
                  <h2 style={{ fontSize: "1.5rem", fontWeight: 700, fontFamily: "'Clash Display', sans-serif" }}>My Work</h2>
                  <button style={{ 
                    background: C.accent, 
                    color: "#fff",
                    border: "none",
                    padding: "0.6rem 1.2rem",
                    borderRadius: "8px",
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    cursor: "pointer"
                  }}>
                    <Plus size={18} /> Add Project
                  </button>
                </div>
                
                {loading ? (
                   <p style={{ color: C.muted }}>Loading portfolio...</p>
                ) : projects.length > 0 ? (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1.5rem" }}>
                    {projects.map(project => (
                      <div key={project.id} style={{ 
                        background: C.cardBg, 
                        border: `1px solid ${C.border}`,
                        borderRadius: "16px",
                        overflow: "hidden",
                        display: "flex",
                        flexDirection: "column"
                      }}>
                        <div style={{ position: "relative", width: "100%", height: "200px", background: C.input, display: "flex", alignItems: "center", justifyContent: "center" }}>
                          {project.thumbnail_url ? (
                            <img src={project.thumbnail_url} alt={project.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          ) : (
                            <Play size={40} color={C.muted} opacity={0.5} />
                          )}
                        </div>
                        <div style={{ padding: "1.5rem" }}>
                          <h3 style={{ margin: "0 0 0.5rem", fontSize: "1.1rem", fontWeight: 700 }}>{project.title}</h3>
                          <p style={{ margin: "0 0 1rem", fontSize: "0.9rem", color: C.muted, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                            {project.description}
                          </p>
                          <span style={{ fontSize: "0.75rem", padding: "0.3rem 0.8rem", borderRadius: "999px", background: C.accentSoft, color: C.accent, fontWeight: 600 }}>
                            {project.category}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ textAlign: "center", padding: "4rem 2rem", border: `2px dashed ${C.border}`, borderRadius: "16px" }}>
                    <Play size={40} color={C.muted} style={{ margin: "0 auto 1rem", opacity: 0.5 }} />
                    <h3 style={{ fontSize: "1.2rem", marginBottom: "0.5rem" }}>No projects yet</h3>
                    <p style={{ color: C.muted }}>Upload your first animation or design project to showcase your skills.</p>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === "Experience" && (
              <motion.div key="experience" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
                  <h2 style={{ fontSize: "1.5rem", fontWeight: 700, fontFamily: "'Clash Display', sans-serif" }}>Experience</h2>
                  <button style={{ 
                    background: "transparent", 
                    color: C.accent,
                    border: `1px solid ${C.accent}`,
                    padding: "0.5rem 1rem",
                    borderRadius: "8px",
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    cursor: "pointer"
                  }}>
                    <Plus size={16} /> Add Role
                  </button>
                </div>
                
                <div style={{ background: C.cardBg, border: `1px solid ${C.border}`, borderRadius: "16px", padding: "2rem" }}>
                  <div style={{ display: "flex", gap: "1.5rem", position: "relative" }}>
                    <div style={{ width: "2px", background: C.accentSoft, position: "absolute", left: "24px", top: "50px", bottom: 0 }} />
                    
                    <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: C.accentSoft, color: C.accent, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1 }}>
                      <Briefcase size={24} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: "1.2rem", fontWeight: 700, margin: "0 0 0.2rem" }}>Senior Animator</h3>
                      <p style={{ color: C.accent, fontWeight: 600, margin: "0 0 0.5rem", fontSize: "0.9rem" }}>Studio XYZ <span style={{ color: C.muted, fontWeight: 400 }}>• Full-time</span></p>
                      <p style={{ color: C.muted, fontSize: "0.85rem", margin: "0 0 1rem" }}>Jan 2022 - Present • 2 yrs 3 mos</p>
                      <p style={{ fontSize: "0.95rem", lineHeight: 1.6, margin: 0 }}>
                        Lead animator for several award-winning short films. Responsible for character rigging, 3D modeling, and final rendering pipelines.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "Education" && (
              <motion.div key="education" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                 <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
                  <h2 style={{ fontSize: "1.5rem", fontWeight: 700, fontFamily: "'Clash Display', sans-serif" }}>Education</h2>
                  <button style={{ 
                    background: "transparent", 
                    color: C.accent,
                    border: `1px solid ${C.accent}`,
                    padding: "0.5rem 1rem",
                    borderRadius: "8px",
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    cursor: "pointer"
                  }}>
                    <Plus size={16} /> Add Education
                  </button>
                </div>

                <div style={{ background: C.cardBg, border: `1px solid ${C.border}`, borderRadius: "16px", padding: "2rem" }}>
                  <div style={{ display: "flex", gap: "1.5rem" }}>
                     <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: C.accentSoft, color: C.accent, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <GraduationCap size={24} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: "1.2rem", fontWeight: 700, margin: "0 0 0.2rem" }}>Bachelor of Fine Arts in Animation</h3>
                      <p style={{ color: C.text, fontWeight: 600, margin: "0 0 0.5rem", fontSize: "0.9rem" }}>African Animation Academy</p>
                      <p style={{ color: C.muted, fontSize: "0.85rem", margin: "0 0 1rem" }}>2018 - 2021</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "About" && (
              <motion.div key="about" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <h2 style={{ fontSize: "1.5rem", fontWeight: 700, fontFamily: "'Clash Display', sans-serif", marginBottom: "1.5rem" }}>About Me</h2>
                <div style={{ background: C.cardBg, border: `1px solid ${C.border}`, borderRadius: "16px", padding: "2rem" }}>
                  <p style={{ fontSize: "1.05rem", lineHeight: 1.7, color: C.text }}>
                    Passionate 3D animator and visual storyteller specializing in character design and motion graphics. 
                    I love bringing African stories to life through vibrant and dynamic animations. Always eager to collaborate 
                    on ambitious projects that push creative boundaries.
                  </p>
                  
                  <div style={{ marginTop: "2rem", paddingTop: "2rem", borderTop: `1px solid ${C.border}` }}>
                    <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "1rem" }}>Contact & Links</h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                        <Mail size={18} color={C.muted} />
                        <span style={{ color: C.accent }}>{userProfile?.email || "Contact via Direct Message"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
            
          </AnimatePresence>
        </div>

      </div>
    </DashboardLayout>
  );
}

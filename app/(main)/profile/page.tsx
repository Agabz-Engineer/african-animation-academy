"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  IdCard, 
  Briefcase, 
  Plus,
  MoreHorizontal,
  CreditCard,
  Clock,
  Heart,
  MessageCircle,
  GraduationCap,
  History,
  Play,
  Share2,
  Trash2,
  Settings,
  X,
  Camera,
  Loader2,
  Image as ImageIcon
} from "lucide-react";
import DashboardLayout from "@/app/components/ui/DashboardLayout";
import { useThemeMode } from "@/lib/useThemeMode";
import { supabase } from "@/lib/supabase";

// ─── Types ─────────────────────────────────────────────────
type Experience = {
  company: string;
  role: string;
  period: string;
  description: string;
};

type Education = {
  school: string;
  degree: string;
  year: string;
};

type Profile = {
  id: string;
  full_name: string;
  user_name: string;
  avatar_url: string | null;
  skill_level: string;
  total_platform_likes: number;
  education: Education[];
  experience: Experience[];
  status: string;
  role: string;
};

type Project = {
  id: string;
  title: string;
  category: string;
  description: string;
  thumbnail_url: string | null;
  likes_count: number;
  created_at: string;
  has_liked?: boolean;
};

const TABS = ["Overview", "Portfolio", "Compensation", "Security"];

const EMOJIS = ["😀", "😂", "🥰", "😎", "🤔", "🤩", "😊", "🔥", "✨", "🙌", "👍", "❤️"];

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("Overview");
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLiking, setIsLiking] = useState<string | null>(null);

  // New Project State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProj, setNewProj] = useState({ title: "", description: "", category: "Animation" });
  const [projFile, setProjFile] = useState<File | null>(null);
  const [projPreview, setProjPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  // Compression Utility
  const compressImage = async (file: File): Promise<Blob> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;
          
          // Max dimension 1200px
          const max = 1200;
          if (width > height && width > max) {
            height *= max / width;
            width = max;
          } else if (height > max) {
            width *= max / height;
            height = max;
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, width, height);
          
          // Initial quality
          let quality = 0.8;
          let dataUrl = canvas.toDataURL("image/jpeg", quality);
          
          // Heuristic: if dataUrl is still too big, lower quality
          // 1MB is about 1.3M chars in base64
          while (dataUrl.length > 1300000 && quality > 0.1) {
            quality -= 0.1;
            dataUrl = canvas.toDataURL("image/jpeg", quality);
          }
          
          canvas.toBlob((blob) => {
            if (blob) resolve(blob);
            else resolve(file);
          }, "image/jpeg", quality);
        };
      };
    });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProjFile(file);
      setProjPreview(URL.createObjectURL(file));
    }
  };

  const handleUploadProject = async () => {
    if (!profile || !projFile || !newProj.title.trim() || uploading || !supabase) return;
    setUploading(true);
    try {
      // 1. Compress
      const compressedBlob = await compressImage(projFile);
      
      // 2. Upload to Storage
      const fileExt = projFile.name.split('.').pop();
      const fileName = `${profile.id}-${Math.random()}.${fileExt}`;
      const filePath = `portfolio/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('portfolio-attachments')
        .upload(filePath, compressedBlob);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('portfolio-attachments')
        .getPublicUrl(filePath);

      // 3. Insert into DB
      const { data, error } = await supabase
        .from("portfolio_projects")
        .insert({
          user_id: profile.id,
          title: newProj.title,
          description: newProj.description,
          category: newProj.category,
          thumbnail_url: publicUrl,
          likes_count: 0
        })
        .select("*")
        .single();

      if (error) throw error;

      setProjects(prev => [data, ...prev]);
      setShowAddModal(false);
      setNewProj({ title: "", description: "", category: "Animation" });
      setProjFile(null);
      setProjPreview(null);
    } catch (err) {
      console.error("Upload error:", err);
      alert("Failed to upload project. Check your storage bucket settings.");
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    async function fetchProfile() {
      if (!supabase) return;
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 1. Fetch Profile
      const { data: prof } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      
      if (prof) setProfile(prof);

      // 2. Fetch Portfolio Projects
      const { data: projs } = await supabase
        .from("portfolio_projects")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      
      if (projs) setProjects(projs);
      setLoading(false);
    }
    fetchProfile();
  }, []);

  const handleLike = async (projectId: string) => {
    if (!supabase || !profile || isLiking) return;
    setIsLiking(projectId);
    
    // Optimistic toggle
    const project = projects.find(p => p.id === projectId);
    if (!project) return;
    
    // Simplified for now - we'd normally check if already liked
    const { error } = await supabase
      .from("portfolio_likes")
      .insert({ project_id: projectId, user_id: profile.id });

    if (!error) {
      setProjects(prev => prev.map(p => 
        p.id === projectId ? { ...p, likes_count: p.likes_count + 1 } : p
      ));
    }
    setIsLiking(null);
  };

  const theme = useThemeMode();
  const isDark = theme === "dark";
  const C = {
    bg: isDark ? "#222222" : "#FAF3E1",
    cardBg: isDark ? "#2C2C2C" : "#FFFFFF",
    border: isDark ? "#444444" : "#E7DBBD",
    text: isDark ? "#FAF3E1" : "#222222",
    muted: isDark ? "#D2C9B8" : "#555555",
    accent: "#FF6D1F",
    accentSoft: "rgba(255, 109, 31, 0.1)",
    shadow: isDark ? "0 4px 24px rgba(0,0,0,0.4)" : "0 4px 20px rgba(0,0,0,0.05)",
  };

  if (loading) return <DashboardLayout><div style={{ padding: "4rem", textAlign: "center", color: C.text }}>Loading Profile...</div></DashboardLayout>;

  return (
    <>
      <DashboardLayout>
        <div style={{ padding: "1.5rem", color: C.text, fontFamily: "'General Sans', sans-serif" }}>
          
          {/* Header Section */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "2rem" }}>
            <div>
              <div style={{ fontSize: "0.85rem", color: C.accent, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.25rem" }}>Creator Dashboard</div>
              <h1 style={{ fontSize: "2.5rem", fontWeight: 800, fontFamily: "'Clash Display', sans-serif", letterSpacing: "-0.03em" }}>My Profile</h1>
            </div>
            <div style={{ display: "flex", gap: "1rem" }}>
              <button style={{ 
                background: C.bg, 
                color: C.text,
                border: `1px solid ${C.border}`,
                padding: "0.75rem 1.5rem",
                borderRadius: "14px",
                fontWeight: 700,
                fontSize: "0.9rem",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem"
              }}>
                <Share2 size={18} /> Public View
              </button>
              <button style={{ 
                background: C.accent, 
                color: "#fff",
                border: "none",
                padding: "0.75rem 1.5rem",
                borderRadius: "14px",
                fontWeight: 700,
                fontSize: "0.9rem",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                boxShadow: `0 8px 20px ${C.accent}33`
              }}>
                <Settings size={18} /> Settings
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", gap: "2rem", borderBottom: `1px solid ${C.border}`, marginBottom: "2rem", overflowX: "auto", whiteSpace: "nowrap", paddingBottom: "2px" }}>
            {TABS.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  background: "none",
                  border: "none",
                  padding: "0.75rem 0",
                  color: activeTab === tab ? C.text : C.muted,
                  fontWeight: activeTab === tab ? 600 : 500,
                  fontSize: "0.9rem",
                  cursor: "pointer",
                  position: "relative",
                  transition: "color 0.2s"
                }}
              >
                {tab}
                {activeTab === tab && (
                  <motion.div 
                    layoutId="activeTab"
                    style={{ position: "absolute", bottom: -1, left: 0, right: 0, height: "2px", background: C.accent }} 
                  />
                )}
              </button>
            ))}
          </div>

          {/* Main Content Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: "2rem" }} className="profile-grid">
            
            {/* Left Column: Personal Info */}
            <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ 
                  background: C.cardBg, 
                  borderRadius: "24px", 
                  padding: "2rem",
                  border: `1px solid ${C.border}`,
                  boxShadow: C.shadow
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem" }}>
                  <div style={{ width: "80px", height: "80px", borderRadius: "24px", background: "linear-gradient(135deg, #FF6D1F, #E04D00)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", position: "relative" }}>
                    {profile?.avatar_url ? (
                      <img src={profile.avatar_url} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <User size={40} color="#fff" />
                    )}
                    <div style={{ position: "absolute", bottom: -2, right: -2, width: 24, height: 24, borderRadius: "50%", background: C.accent, border: `3px solid ${C.cardBg}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.6rem" }}>⚡</div>
                  </div>
                  <button style={{ background: "none", border: "none", color: C.muted, cursor: "pointer" }}><MoreHorizontal /></button>
                </div>
                <h2 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: "0.25rem", letterSpacing: "-0.02em" }}>{profile?.full_name || "Creative Member"}</h2>
                <div style={{ fontSize: "0.85rem", color: C.muted, marginBottom: "1.5rem", fontWeight: 600 }}>@{profile?.user_name || "anonymous"}</div>

                <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                  <section>
                    <h3 style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.1em", color: C.muted, marginBottom: "0.75rem", fontWeight: 800 }}>Contact Info</h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", fontSize: "0.9rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}><Mail size={14} color={C.accent} /> {profile?.id.substring(0, 12)}...</div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}><MapPin size={14} color={C.accent} /> Based in Africa</div>
                    </div>
                  </section>

                  <section>
                    <h3 style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.1em", color: C.muted, marginBottom: "0.75rem", fontWeight: 800 }}>Skill Level</h3>
                    <div style={{ padding: "0.75rem", borderRadius: "12px", background: C.bg, border: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: "0.75rem" }}>
                      <div style={{ fontSize: "1.2rem" }}>🎨</div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: "0.85rem" }}>{profile?.skill_level || "Apprentice"}</div>
                        <div style={{ fontSize: "0.7rem", color: C.muted }}>Artist Level</div>
                      </div>
                    </div>
                  </section>

                  <div style={{ paddingTop: "1rem", display: "flex", gap: "0.75rem" }}>
                    <button style={{ flex: 1, padding: "0.8rem", borderRadius: "12px", background: C.accent, color: "#fff", border: "none", fontWeight: 700, fontSize: "0.85rem", cursor: "pointer", boxShadow: `0 4px 15px ${C.accent}44` }}>Edit Profile</button>
                    <button style={{ padding: "0.8rem", borderRadius: "12px", background: C.bg, border: `1px solid ${C.border}`, color: C.text, cursor: "pointer" }}><Share2 size={18} /></button>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Right Column: Dynamic Content based on Tabs */}
            <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
              
              <AnimatePresence mode="wait">
                {activeTab === "Overview" && (
                  <motion.div
                    key="overview"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    style={{ display: "flex", flexDirection: "column", gap: "2rem" }}
                  >
                    {/* Experience Section */}
                    <div style={{ background: C.cardBg, borderRadius: "24px", padding: "2rem", border: `1px solid ${C.border}`, boxShadow: C.shadow }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                          <div style={{ padding: "0.5rem", borderRadius: "12px", background: C.accentSoft, color: C.accent }}>
                            <History size={20} />
                          </div>
                          <h3 style={{ fontWeight: 700, fontSize: "1.2rem" }}>Employment History</h3>
                        </div>
                        <button style={{ color: C.accent, background: "none", border: "none", fontWeight: 600, fontSize: "0.85rem", cursor: "pointer" }}>+ Add</button>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                        {profile?.experience?.length ? profile.experience.map((exp, idx) => (
                          <div key={idx} style={{ display: "flex", gap: "1.5rem", position: "relative" }}>
                            <div style={{ width: "2px", background: C.border, margin: "0.5rem 0", position: "relative" }}>
                              <div style={{ position: "absolute", top: 0, left: "-4px", width: "10px", height: "10px", borderRadius: "50%", background: C.accent }} />
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.25rem" }}>
                                <h4 style={{ fontWeight: 700, fontSize: "1rem" }}>{exp.role}</h4>
                                <span style={{ fontSize: "0.8rem", color: C.muted }}>{exp.period}</span>
                              </div>
                              <div style={{ fontSize: "0.9rem", color: C.accent, fontWeight: 600, marginBottom: "0.5rem" }}>{exp.company}</div>
                              <p style={{ fontSize: "0.85rem", color: C.muted, lineHeight: 1.6 }}>{exp.description}</p>
                            </div>
                          </div>
                        )) : (
                          <p style={{ fontSize: "0.9rem", color: C.muted }}>No experience listed yet.</p>
                        )}
                      </div>
                    </div>

                    {/* Awards & Education Grid */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
                      {/* Education */}
                      <div style={{ background: C.cardBg, borderRadius: "24px", padding: "2rem", border: `1px solid ${C.border}`, boxShadow: C.shadow }}>
                        <h3 style={{ fontWeight: 700, fontSize: "1.1rem", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                          <GraduationCap size={18} color={C.accent} /> Education
                        </h3>
                        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                          {profile?.education?.length ? profile.education.map((edu, idx) => (
                            <div key={idx}>
                              <div style={{ fontWeight: 700, fontSize: "0.95rem" }}>{edu.degree}</div>
                              <div style={{ fontSize: "0.85rem", color: C.muted }}>{edu.school} • {edu.year}</div>
                            </div>
                          )) : (
                            <p style={{ fontSize: "0.85rem", color: C.muted }}>Degrees and certifications will appear here.</p>
                          )}
                        </div>
                      </div>

                      {/* Stats/Metrics */}
                      <div style={{ background: C.cardBg, borderRadius: "24px", padding: "2rem", border: `1px solid ${C.border}`, boxShadow: C.shadow }}>
                        <h3 style={{ fontWeight: 700, fontSize: "1.1rem", marginBottom: "1.5rem" }}>Quick Stats</h3>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                          <div style={{ padding: "1rem", borderRadius: "16px", background: C.bg, border: `1px solid ${C.border}` }}>
                            <div style={{ fontSize: "1.5rem", fontWeight: 800, color: C.accent }}>{projects.length}</div>
                            <div style={{ fontSize: "0.7rem", color: C.muted, textTransform: "uppercase", fontWeight: 600 }}>Projects</div>
                          </div>
                          <div style={{ padding: "1rem", borderRadius: "16px", background: C.bg, border: `1px solid ${C.border}` }}>
                            <div style={{ fontSize: "1.5rem", fontWeight: 800, color: C.accent }}>{profile?.total_platform_likes || 0}</div>
                            <div style={{ fontSize: "0.7rem", color: C.muted, textTransform: "uppercase", fontWeight: 600 }}>Likes</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === "Portfolio" && (
                  <motion.div
                    key="portfolio"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1.5rem" }}>
                      {projects.map(project => (
                        <motion.div 
                          key={project.id}
                          whileHover={{ y: -5 }}
                          style={{ background: C.cardBg, borderRadius: "20px", overflow: "hidden", border: `1px solid ${C.border}`, boxShadow: C.shadow }}
                        >
                          <div style={{ height: "160px", background: "#111", position: "relative", overflow: "hidden" }}>
                            {project.thumbnail_url ? (
                              <img src={project.thumbnail_url} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            ) : (
                              <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: C.accentSoft }}>
                                <Play size={40} />
                              </div>
                            )}
                            <div style={{ position: "absolute", top: "1rem", right: "1rem", padding: "0.4rem 0.8rem", borderRadius: "99px", background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", fontSize: "0.7rem", fontWeight: 600, color: "#fff" }}>
                              {project.category}
                            </div>
                          </div>
                          <div style={{ padding: "1.25rem" }}>
                            <h4 style={{ fontWeight: 700, fontSize: "1.05rem", marginBottom: "0.5rem" }}>{project.title}</h4>
                            <p style={{ fontSize: "0.85rem", color: C.muted, marginBottom: "1rem", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{project.description}</p>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                              <div style={{ display: "flex", gap: "1rem" }}>
                                <button 
                                  onClick={() => handleLike(project.id)}
                                  style={{ background: "none", border: "none", display: "flex", alignItems: "center", gap: "0.25rem", color: project.has_liked ? C.accent : C.muted, cursor: "pointer", transition: "transform 0.2s" }}
                                  onMouseDown={e => (e.currentTarget.style.transform = "scale(0.9)")}
                                  onMouseUp={e => (e.currentTarget.style.transform = "scale(1)")}
                                >
                                  <Heart size={16} fill={project.has_liked ? C.accent : "none"} />
                                  <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>{project.likes_count}</span>
                                </button>
                                <div style={{ fontSize: "0.85rem", color: C.muted, display: "flex", alignItems: "center", gap: "0.25rem" }}>
                                  <MessageCircle size={16} />
                                  <span>0</span>
                                </div>
                              </div>
                              <button style={{ background: "none", border: "none", color: C.muted, cursor: "pointer" }}><Share2 size={16} /></button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                      <motion.div 
                        onClick={() => setShowAddModal(true)}
                        whileHover={{ scale: 0.98, borderColor: C.accent }}
                        style={{ border: `2px dashed ${C.border}`, borderRadius: "20px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "1rem", minHeight: "280px", cursor: "pointer", color: C.muted, transition: "all 0.2s" }}
                      >
                        <div style={{ padding: "1rem", borderRadius: "50%", background: C.accentSoft, color: C.accent }}><Plus size={24} /></div>
                        <span style={{ fontWeight: 600, fontSize: "0.9rem" }}>Add New Work</span>
                      </motion.div>
                    </div>
                  </motion.div>
                )}

                {activeTab === "Compensation" && (
                  <motion.div
                    key="compensation"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    style={{ background: C.cardBg, borderRadius: "24px", padding: "3rem", border: `1px solid ${C.border}`, textAlign: "center" }}
                  >
                    <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: C.accentSoft, color: C.accent, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem" }}>
                      <CreditCard size={32} />
                    </div>
                    <h3 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "0.5rem" }}>Compensation & Benefits</h3>
                    <p style={{ color: C.muted, fontSize: "0.9rem", maxWidth: "400px", margin: "0 auto" }}>This section is currently under review for your account. Please check back later for full details.</p>
                  </motion.div>
                )}

                {activeTab === "Security" && (
                  <motion.div
                    key="security"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    style={{ background: C.cardBg, borderRadius: "24px", padding: "3rem", border: `1px solid ${C.border}`, textAlign: "center" }}
                  >
                    <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: C.accentSoft, color: C.accent, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem" }}>
                      <Plus size={32} />
                    </div>
                    <h3 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "0.5rem" }}>Security Settings</h3>
                    <p style={{ color: C.muted, fontSize: "0.9rem", maxWidth: "400px", margin: "0 auto" }}>Manage your password, multi-factor authentication, and active sessions from this panel.</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>

          <style jsx>{`
            .profile-grid { grid-template-columns: 320px 1fr; }
            @media (max-width: 1024px) {
              .profile-grid { grid-template-columns: 1fr; }
              .stats-grid { grid-template-columns: 1fr; }
            }
          `}</style>
        </div>
      </DashboardLayout>
      
      <AnimatePresence>
        {showAddModal && (
          <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: "1.5rem" }}>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !uploading && setShowAddModal(false)}
              style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)" }} 
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              style={{ 
                width: "100%", 
                maxWidth: "500px", 
                background: C.cardBg, 
                borderRadius: "32px", 
                border: `1px solid ${C.border}`, 
                boxShadow: "0 24px 48px rgba(0,0,0,0.5)",
                position: "relative",
                overflow: "hidden"
              }}
            >
              <div style={{ padding: "1.5rem 2rem", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h3 style={{ fontWeight: 800, fontSize: "1.25rem" }}>Add New Work</h3>
                <button 
                  onClick={() => setShowAddModal(false)}
                  disabled={uploading}
                  style={{ background: "none", border: "none", color: C.muted, cursor: "pointer" }}
                >
                  <X size={24} />
                </button>
              </div>

              <div style={{ padding: "2rem", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                <div style={{ textAlign: "center" }}>
                  <input 
                    type="file" 
                    accept="image/*" 
                    id="proj-upload" 
                    style={{ display: "none" }} 
                    onChange={handleFileSelect}
                  />
                  <label 
                    htmlFor="proj-upload"
                    style={{ 
                      display: "block",
                      width: "100%",
                      height: "180px",
                      borderRadius: "20px",
                      border: projPreview ? "none" : `2px dashed ${C.border}`,
                      background: projPreview ? `url(${projPreview}) center/cover` : C.bg,
                      cursor: "pointer",
                      transition: "all 0.2s"
                    }}
                  >
                    {!projPreview && (
                      <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "0.5rem", color: C.muted }}>
                        <Camera size={32} />
                        <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>Click to upload thumbnail</span>
                        <span style={{ fontSize: "0.7rem" }}>compressed to &lt; 1MB automatically</span>
                      </div>
                    )}
                    {projPreview && (
                      <div style={{ position: "absolute", top: "10px", right: "10px", padding: "0.4rem", borderRadius: "8px", background: "rgba(0,0,0,0.5)", color: "#fff" }}>
                        <ImageIcon size={16} />
                      </div>
                    )}
                  </label>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  <input 
                    placeholder="Project Title"
                    value={newProj.title}
                    onChange={e => setNewProj(prev => ({ ...prev, title: e.target.value }))}
                    style={{ width: "100%", padding: "1rem", borderRadius: "14px", border: `1px solid ${C.border}`, background: C.bg, color: C.text, outline: "none" }}
                  />
                  <select
                    value={newProj.category}
                    onChange={e => setNewProj(prev => ({ ...prev, category: e.target.value }))}
                    style={{ width: "100%", padding: "1rem", borderRadius: "14px", border: `1px solid ${C.border}`, background: C.bg, color: C.text, outline: "none" }}
                  >
                    <option>Animation</option>
                    <option>Character Design</option>
                    <option>Illustration</option>
                    <option>UI/UX Design</option>
                    <option>3D Model</option>
                  </select>
                  <textarea 
                    placeholder="Short description..."
                    value={newProj.description}
                    onChange={e => setNewProj(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    style={{ width: "100%", padding: "1rem", borderRadius: "14px", border: `1px solid ${C.border}`, background: C.bg, color: C.text, outline: "none", resize: "none" }}
                  />
                </div>

                <button 
                  onClick={handleUploadProject}
                  disabled={uploading || !projFile || !newProj.title.trim()}
                  style={{ 
                    width: "100%", 
                    padding: "1rem", 
                    borderRadius: "16px", 
                    background: (uploading || !projFile || !newProj.title.trim()) ? C.border : C.accent, 
                    color: "#fff", 
                    border: "none", 
                    fontWeight: 800, 
                    fontSize: "1rem", 
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.75rem",
                    boxShadow: !uploading ? `0 8px 24px ${C.accent}44` : "none"
                  }}
                >
                  {uploading ? <Loader2 className="animate-spin" size={20} /> : <Plus size={20} />}
                  {uploading ? "Compressing & Publishing..." : "Publish Work"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

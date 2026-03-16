"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, 
  Mail, 
  MapPin, 
  Plus,
  MoreHorizontal,
  CreditCard,
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
  Image as ImageIcon,
  Globe,
  Twitter,
  Instagram,
  Linkedin
} from "lucide-react";
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
  cover_url: string | null;
  bio: string | null;
  location: string | null;
  skill_level: string;
  total_platform_likes: number;
  education: Education[];
  experience: Experience[];
  status: string;
  role: string;
  website_url?: string | null;
  twitter_url?: string | null;
  instagram_url?: string | null;
  linkedin_url?: string | null;
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

const addCacheBuster = (url: string) =>
  `${url}${url.includes("?") ? "&" : "?"}v=${Date.now()}`;

export default function ProfilePage() {
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);
  const [activeTab, setActiveTab] = useState("Overview");
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLiking, setIsLiking] = useState<string | null>(null);
  const [stats, setStats] = useState({ followers: 0, following: 0 });

  // Edit Profile States
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<Profile>>({});
  const [saving, setSaving] = useState(false);

  // Experience/Education Edit States
  const [isEditingExp, setIsEditingExp] = useState(false);
  const [isEditingEdu, setIsEditingEdu] = useState(false);
  const [selectedExp, setSelectedExp] = useState<Experience | null>(null);
  const [selectedEdu, setSelectedEdu] = useState<Education | null>(null);
  const [expIndex, setExpIndex] = useState<number | null>(null);
  const [eduIndex, setEduIndex] = useState<number | null>(null);

  // New Project State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProj, setNewProj] = useState({ title: "", description: "", category: "Animation" });
  const [projFile, setProjFile] = useState<File | null>(null);
  const [projPreview, setProjPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [coverUploading, setCoverUploading] = useState(false);
  const coverInputRef = useRef<HTMLInputElement | null>(null);

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

  const handleAvatarUpload = async (file: File) => {
    if (!profile || !supabase || avatarUploading) return;
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.");
      return;
    }

    setAvatarUploading(true);

    try {
      const blob = await compressImage(file);
      const fileExt = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const filePath = `${profile.id}/${Date.now()}-avatar.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, blob, {
          upsert: false,
          contentType: file.type,
        });

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(filePath);

      const { error: authError } = await supabase.auth.updateUser({
        data: { avatar_url: publicUrl, avatar_path: filePath },
      });

      if (authError) throw authError;

      const { error: profileError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", profile.id);

      if (profileError) throw profileError;

      setProfile((prev) => (prev ? { ...prev, avatar_url: publicUrl } : prev));
      setEditData((prev) => ({ ...prev, avatar_url: publicUrl }));
    } catch (err) {
      console.error("Avatar upload error:", err);
      alert("Failed to upload profile photo.");
    } finally {
      setAvatarUploading(false);
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
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
      const filePath = `portfolio/${profile.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('portfolio-attachments')
        .upload(filePath, compressedBlob, {
          upsert: false,
          contentType: projFile.type || "image/jpeg",
        });

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
    if (typeof window === "undefined") return;

    const syncViewport = () => {
      setIsMobile(window.innerWidth < 768);
    };

    syncViewport();
    window.addEventListener("resize", syncViewport);
    return () => window.removeEventListener("resize", syncViewport);
  }, []);

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
      
      if (prof) {
        setProfile(prof);
        setEditData(prof);
      }

      // 2. Fetch Portfolio Projects
      const { data: projs } = await supabase
        .from("portfolio_projects")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      
      if (projs) setProjects(projs);

      // 3. Fetch Social Stats
      const { count: followers } = await supabase
        .from("user_follows")
        .select("*", { count: 'exact', head: true })
        .eq("following_id", user.id);
      
      const { count: following } = await supabase
        .from("user_follows")
        .select("*", { count: 'exact', head: true })
        .eq("follower_id", user.id);

      setStats({ followers: followers || 0, following: following || 0 });
      setLoading(false);
    }
    fetchProfile();
  }, []);

  const handleUpdateProfile = async () => {
    if (!profile || !supabase || saving) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: editData.full_name,
          user_name: editData.user_name,
          bio: editData.bio,
          location: editData.location,
          website_url: editData.website_url,
          twitter_url: editData.twitter_url,
          instagram_url: editData.instagram_url,
          linkedin_url: editData.linkedin_url,
        })
        .eq("id", profile.id);

      if (error) throw error;
      setProfile(prev => prev ? { ...prev, ...editData } : null);
      setIsEditing(false);
    } catch (err) {
      console.error("Update profile error:", err);
      alert("Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateExperience = async (newExp: Experience[]) => {
    if (!profile || !supabase) return;
    const { error } = await supabase
      .from("profiles")
      .update({ experience: newExp })
      .eq("id", profile.id);
    
    if (!error) setProfile(prev => prev ? { ...prev, experience: newExp } : null);
  };

  const handleUpdateEducation = async (newEdu: Education[]) => {
    if (!profile || !supabase) return;
    const { error } = await supabase
      .from("profiles")
      .update({ education: newEdu })
      .eq("id", profile.id);
    
    if (!error) setProfile(prev => prev ? { ...prev, education: newEdu } : null);
  };

  const handleSaveExperience = async () => {
    if (!profile || !selectedExp) return;
    const newExperience = [...(profile.experience || [])];
    if (expIndex !== null) {
      newExperience[expIndex] = selectedExp;
    } else {
      newExperience.unshift(selectedExp);
    }
    await handleUpdateExperience(newExperience);
    setIsEditingExp(false);
    setSelectedExp(null);
    setExpIndex(null);
  };

  const handleDeleteExperience = async (index: number) => {
    if (!profile) return;
    const newExperience = profile.experience.filter((_, i) => i !== index);
    await handleUpdateExperience(newExperience);
  };

  const handleSaveEducation = async () => {
    if (!profile || !selectedEdu) return;
    const newEducation = [...(profile.education || [])];
    if (eduIndex !== null) {
      newEducation[eduIndex] = selectedEdu;
    } else {
      newEducation.unshift(selectedEdu);
    }
    await handleUpdateEducation(newEducation);
    setIsEditingEdu(false);
    setSelectedEdu(null);
    setEduIndex(null);
  };

  const handleDeleteEducation = async (index: number) => {
    if (!profile) return;
    const newEducation = profile.education.filter((_, i) => i !== index);
    await handleUpdateEducation(newEducation);
  };

  const handleCoverUpload = async (file: File) => {
    if (!profile || !supabase || coverUploading) return;
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.");
      return;
    }

    setCoverUploading(true);

    try {
      const blob = await compressImage(file);
      const fileName = `${Date.now()}-cover.jpg`;
      const filePath = `covers/${profile.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage.from('portfolio-attachments').upload(filePath, blob, {
        upsert: false,
        contentType: "image/jpeg",
      });
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('portfolio-attachments').getPublicUrl(filePath);
      if (!publicUrl) {
        throw new Error("Cover upload succeeded but no public URL was returned.");
      }

      const { error } = await supabase.from("profiles").update({ cover_url: publicUrl }).eq("id", profile.id);
      if (error) throw error;

      const freshUrl = addCacheBuster(publicUrl);
      setProfile(prev => prev ? { ...prev, cover_url: freshUrl } : null);
      setEditData(prev => ({ ...prev, cover_url: freshUrl }));
    } catch (err) {
      console.error("Cover upload error:", err);
      const message = err instanceof Error ? err.message : "Unknown error.";
      alert(`Failed to upload cover image: ${message}`);
    } finally {
      if (coverInputRef.current) {
        coverInputRef.current.value = "";
      }
      setCoverUploading(false);
    }
  };

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
  const T = {
    bg: isDark ? "#222222" : "#FAF3E1",
    cardBg: isDark ? "#2C2C2C" : "#FFFFFF",
    border: isDark ? "#444444" : "#E7DBBD",
    text: isDark ? "#FAF3E1" : "#222222",
    muted: isDark ? "#D2C9B8" : "#555555",
    accent: "#FF6D1F",
    accentSoft: "rgba(255, 109, 31, 0.1)",
    shadow: isDark ? "0 4px 24px rgba(0,0,0,0.4)" : "0 4px 20px rgba(0,0,0,0.05)",
  };

  if (loading) return <div style={{ padding: "4rem", textAlign: "center", color: T.text }}>Loading Profile...</div>;

  return (
    <>
      <div style={{ padding: isMobile ? "1rem" : "1.5rem", color: T.text, fontFamily: "'General Sans', sans-serif" }}>
          
          {/* Cover Photo Area */}
          <div style={{ position: "relative", marginBottom: isMobile ? "1.5rem" : "3rem" }}>
            <div style={{ 
              height: isMobile ? "180px" : "220px", 
              borderRadius: isMobile ? "24px" : "32px", 
              background: profile?.cover_url ? `url(${profile.cover_url}) center/cover` : "linear-gradient(45deg, #FF6D1F, #FFAC71)",
              boxShadow: T.shadow,
              overflow: "hidden",
              position: "relative",
              border: `1px solid ${T.border}`
            }}>
              {!profile?.cover_url && (
                <div style={{ position: "absolute", inset: 0, opacity: 0.1, backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
              )}
              
              <label 
                htmlFor="cover-upload"
                style={{ 
                  position: "absolute", 
                  bottom: isMobile ? "1rem" : "1.5rem", 
                  right: isMobile ? "1rem" : "1.5rem", 
                  background: "rgba(0,0,0,0.5)", 
                  backdropFilter: "blur(10px)",
                  color: "#fff",
                  padding: isMobile ? "0.55rem 0.9rem" : "0.6rem 1.25rem",
                  borderRadius: "12px",
                  fontSize: isMobile ? "0.72rem" : "0.8rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  border: "1px solid rgba(255,255,255,0.2)"
                }}
              >
                {coverUploading ? <Loader2 size={16} className="animate-spin" /> : <Camera size={16} />}
                {coverUploading ? "Uploading..." : "Change Cover"}
                <input
                  ref={coverInputRef}
                  type="file"
                  id="cover-upload"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleCoverUpload(file);
                  }}
                />
              </label>
            </div>
            
            {/* Presence Stats Overlay */}
            <div style={{ 
              position: isMobile ? "relative" : "absolute", 
              bottom: isMobile ? "auto" : "-1.5rem", 
              left: isMobile ? "auto" : "2rem", 
              marginTop: isMobile ? "0.85rem" : 0,
              width: isMobile ? "100%" : "auto",
              display: "flex", 
              justifyContent: isMobile ? "space-between" : "flex-start",
              gap: isMobile ? "0.75rem" : "1rem", 
              background: T.cardBg, 
              padding: isMobile ? "0.75rem 1rem" : "0.75rem 1.5rem", 
              borderRadius: "18px", 
              boxShadow: T.shadow,
              border: `1px solid ${T.border}`
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span style={{ fontWeight: 800, color: T.accent }}>{stats.followers}</span>
                <span style={{ fontSize: "0.75rem", color: T.muted, textTransform: "uppercase", fontWeight: 700 }}>Followers</span>
              </div>
              <div style={{ width: "1px", height: "14px", background: T.border, alignSelf: "center" }} />
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span style={{ fontWeight: 800, color: T.text }}>{stats.following}</span>
                <span style={{ fontSize: "0.75rem", color: T.muted, textTransform: "uppercase", fontWeight: 700 }}>Following</span>
              </div>
            </div>
          </div>

          {/* Header Section */}
          <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", justifyContent: "space-between", alignItems: isMobile ? "stretch" : "flex-end", gap: isMobile ? "1rem" : 0, marginBottom: "2rem" }}>
            <div>
              <div style={{ fontSize: "0.85rem", color: T.accent, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.25rem" }}>Creator Profile</div>
              <h1 style={{ fontSize: isMobile ? "2rem" : "2.5rem", fontWeight: 800, fontFamily: "'Clash Display', sans-serif", letterSpacing: "-0.03em" }}>My Profile</h1>
            </div>
            <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: "1rem", width: isMobile ? "100%" : "auto" }}>
              <button style={{ 
                background: T.bg, 
                color: T.text,
                border: `1px solid ${T.border}`,
                padding: "0.75rem 1.5rem",
                borderRadius: "14px",
                fontWeight: 700,
                fontSize: "0.9rem",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
                width: isMobile ? "100%" : "auto"
              }}>
                <Share2 size={18} /> Public View
              </button>
              <button style={{ 
                background: T.accent, 
                color: "#fff",
                border: "none",
                padding: "0.75rem 1.5rem",
                borderRadius: "14px",
                fontWeight: 700,
                fontSize: "0.9rem",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
                boxShadow: `0 8px 20px ${T.accent}33`,
                width: isMobile ? "100%" : "auto"
              }}
              onClick={() => router.push("/settings")}>
                <Settings size={18} /> Settings
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "repeat(2, minmax(0, 1fr))" : "repeat(4, max-content)",
              gap: isMobile ? "0.75rem" : "2rem",
              borderBottom: isMobile ? "none" : `1px solid ${T.border}`,
              marginBottom: "2rem",
              overflowX: isMobile ? "visible" : "auto",
              whiteSpace: isMobile ? "normal" : "nowrap",
              paddingBottom: isMobile ? 0 : "2px",
            }}
          >
            {TABS.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  background: "none",
                  padding: isMobile ? "0.9rem 0.75rem" : "0.75rem 0",
                  color: activeTab === tab ? T.text : T.muted,
                  fontWeight: activeTab === tab ? 600 : 500,
                  fontSize: "0.9rem",
                  cursor: "pointer",
                  position: "relative",
                  transition: "color 0.2s",
                  borderRadius: isMobile ? "14px" : 0,
                  backgroundColor: isMobile ? (activeTab === tab ? T.cardBg : T.bg) : "transparent",
                  borderBottom: !isMobile && activeTab === tab ? `2px solid ${T.accent}` : "none",
                  border: isMobile ? `1px solid ${activeTab === tab ? T.accent : T.border}` : "none",
                  minWidth: 0,
                }}
              >
                {tab}
                {!isMobile && activeTab === tab && (
                  <motion.div 
                    layoutId="activeTab"
                    style={{ position: "absolute", bottom: -1, left: 0, right: 0, height: "2px", background: T.accent }} 
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
                  background: T.cardBg, 
                  borderRadius: "24px", 
                  padding: "2rem",
                  border: `1px solid ${T.border}`,
                  boxShadow: T.shadow
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem" }}>
                  <div
                    onClick={() => document.getElementById("profile-avatar-upload")?.click()}
                    style={{ width: "80px", height: "80px", borderRadius: "24px", background: "linear-gradient(135deg, #FF6D1F, #E04D00)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", position: "relative", cursor: avatarUploading ? "progress" : "pointer" }}
                  >
                    {profile?.avatar_url ? (
                      <img src={profile.avatar_url} alt={`${profile.full_name || "Profile"} avatar`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <User size={40} color="#fff" />
                    )}
                    <div style={{ position: "absolute", bottom: -2, right: -2, width: 24, height: 24, borderRadius: "50%", background: T.accent, border: `3px solid ${T.cardBg}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.6rem" }}>⚡</div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "0.6rem" }}>
                    <input
                      id="profile-avatar-upload"
                      type="file"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          void handleAvatarUpload(file);
                        }
                        e.currentTarget.value = "";
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => document.getElementById("profile-avatar-upload")?.click()}
                      disabled={avatarUploading}
                      style={{ padding: "0.45rem 0.7rem", borderRadius: "10px", border: `1px solid ${T.border}`, background: T.bg, color: T.text, fontSize: "0.72rem", fontWeight: 700, cursor: avatarUploading ? "progress" : "pointer" }}
                    >
                      {avatarUploading ? "Uploading..." : "Change photo"}
                    </button>
                    <button style={{ background: "none", border: "none", color: T.muted, cursor: "pointer" }}><MoreHorizontal /></button>
                  </div>
                </div>
                <h2 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: "0.25rem", letterSpacing: "-0.02em" }}>{profile?.full_name || "Creative Member"}</h2>
                <div style={{ fontSize: "0.85rem", color: T.muted, marginBottom: "1rem", fontWeight: 600 }}>@{profile?.user_name || "anonymous"}</div>

                {profile?.bio && (
                  <p style={{ fontSize: "0.88rem", color: T.muted, lineHeight: 1.6, marginBottom: "1.5rem" }}>{profile.bio}</p>
                )}

                <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                  <section>
                    <h3 style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.1em", color: T.muted, marginBottom: "0.75rem", fontWeight: 800 }}>Contact Info</h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", fontSize: "0.9rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}><Mail size={14} color={T.accent} /> {profile?.id.substring(0, 12)}...</div>
                      {profile?.location && (
                        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}><MapPin size={14} color={T.accent} /> {profile.location}</div>
                      )}
                      {!profile?.location && (
                        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}><MapPin size={14} color={T.accent} /> Based in Africa</div>
                      )}
                    </div>
                  </section>
                  
                  {(profile?.twitter_url || profile?.instagram_url || profile?.linkedin_url || profile?.website_url) && (
                    <section>
                      <h3 style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.1em", color: T.muted, marginBottom: "0.75rem", fontWeight: 800 }}>Social Links</h3>
                      <div style={{ display: "flex", gap: "1rem", color: T.muted }}>
                        {profile?.twitter_url && <a href={profile.twitter_url} target="_blank" rel="noreferrer" style={{ color: "inherit" }}><Twitter size={18} /></a>}
                        {profile?.instagram_url && <a href={profile.instagram_url} target="_blank" rel="noreferrer" style={{ color: "inherit" }}><Instagram size={18} /></a>}
                        {profile?.linkedin_url && <a href={profile.linkedin_url} target="_blank" rel="noreferrer" style={{ color: "inherit" }}><Linkedin size={18} /></a>}
                        {profile?.website_url && <a href={profile.website_url} target="_blank" rel="noreferrer" style={{ color: "inherit" }}><Globe size={18} /></a>}
                      </div>
                    </section>
                  )}

                  <section>
                    <h3 style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.1em", color: T.muted, marginBottom: "0.75rem", fontWeight: 800 }}>Skill Level</h3>
                    <div style={{ padding: "0.75rem", borderRadius: "12px", background: T.bg, border: `1px solid ${T.border}`, display: "flex", alignItems: "center", gap: "0.75rem" }}>
                      <div style={{ fontSize: "1.2rem" }}>🎨</div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: "0.85rem" }}>{profile?.skill_level || "Apprentice"}</div>
                        <div style={{ fontSize: "0.7rem", color: T.muted }}>Artist Level</div>
                      </div>
                    </div>
                  </section>

                  <div style={{ paddingTop: "1rem", display: "flex", gap: "0.75rem" }}>
                    <button 
                      onClick={() => {
                        setEditData(profile || {});
                        setIsEditing(true);
                      }}
                      style={{ flex: 1, padding: "0.8rem", borderRadius: "12px", background: T.accent, color: "#fff", border: "none", fontWeight: 700, fontSize: "0.85rem", cursor: "pointer", boxShadow: `0 4px 15px ${T.accent}44` }}
                    >
                      Edit Profile
                    </button>
                    <button style={{ padding: "0.8rem", borderRadius: "12px", background: T.bg, border: `1px solid ${T.border}`, color: T.text, cursor: "pointer" }}><Share2 size={18} /></button>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Right Column: Dynamic Content based on Tabs */}
            <div style={{ display: "flex", flexDirection: "column", gap: "2rem", minWidth: 0, overflow: "hidden" }}>
              
              <AnimatePresence mode="wait">
                {activeTab === "Overview" && (
                  <motion.div
                    key="overview"
                    initial={isMobile ? { opacity: 0, y: 12 } : { opacity: 0, x: 20 }}
                    animate={isMobile ? { opacity: 1, y: 0 } : { opacity: 1, x: 0 }}
                    exit={isMobile ? { opacity: 0, y: -12 } : { opacity: 0, x: -20 }}
                    style={{ display: "flex", flexDirection: "column", gap: "2rem" }}
                  >
                    {/* Experience Section */}
                    <div style={{ background: T.cardBg, borderRadius: "24px", padding: "2rem", border: `1px solid ${T.border}`, boxShadow: T.shadow }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                          <div style={{ padding: "0.5rem", borderRadius: "12px", background: T.accentSoft, color: T.accent }}>
                            <History size={20} />
                          </div>
                          <h3 style={{ fontWeight: 700, fontSize: "1.2rem" }}>Employment History</h3>
                        </div>
                        <button 
                          onClick={() => {
                            setSelectedExp({ role: "", company: "", period: "", description: "" });
                            setExpIndex(null);
                            setIsEditingExp(true);
                          }}
                          style={{ color: T.accent, background: "none", border: "none", fontWeight: 600, fontSize: "0.85rem", cursor: "pointer" }}
                        >
                          + Add
                        </button>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                        {profile?.experience?.length ? profile.experience.map((exp, idx) => (
                          <div key={idx} style={{ display: "flex", gap: "1.5rem", position: "relative" }}>
                            <div style={{ width: "2px", background: T.border, margin: "0.5rem 0", position: "relative" }}>
                              <div style={{ position: "absolute", top: 0, left: "-4px", width: "10px", height: "10px", borderRadius: "50%", background: T.accent }} />
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.25rem" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                  <h4 style={{ fontWeight: 700, fontSize: "1rem" }}>{exp.role}</h4>
                                  <div style={{ display: "flex", gap: "0.5rem", opacity: 0 }} className="card-actions">
                                    <button 
                                      onClick={() => {
                                        setSelectedExp(exp);
                                        setExpIndex(idx);
                                        setIsEditingExp(true);
                                      }}
                                      style={{ background: "none", border: "none", color: T.muted, cursor: "pointer" }}
                                    >
                                      <Settings size={14} />
                                    </button>
                                    <button 
                                      onClick={() => handleDeleteExperience(idx)}
                                      style={{ background: "none", border: "none", color: "#ff4d4d", cursor: "pointer" }}
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  </div>
                                </div>
                                <span style={{ fontSize: "0.8rem", color: T.muted }}>{exp.period}</span>
                              </div>
                              <div style={{ fontSize: "0.9rem", color: T.accent, fontWeight: 600, marginBottom: "0.5rem" }}>{exp.company}</div>
                              <p style={{ fontSize: "0.85rem", color: T.muted, lineHeight: 1.6 }}>{exp.description}</p>
                            </div>
                          </div>
                        )) : (
                          <p style={{ fontSize: "0.9rem", color: T.muted }}>No experience listed yet.</p>
                        )}
                      </div>
                    </div>

                    {/* Awards & Education Grid */}
                    <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "2rem" }}>
                      {/* Education */}
                      <div style={{ background: T.cardBg, borderRadius: "24px", padding: "2rem", border: `1px solid ${T.border}`, boxShadow: T.shadow }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                          <h3 style={{ fontWeight: 700, fontSize: "1.1rem", display: "flex", alignItems: "center", gap: "0.5rem", margin: 0 }}>
                            <GraduationCap size={18} color={T.accent} /> Education
                          </h3>
                          <button 
                            onClick={() => {
                              setSelectedEdu({ school: "", degree: "", year: "" });
                              setEduIndex(null);
                              setIsEditingEdu(true);
                            }}
                            style={{ color: T.accent, background: "none", border: "none", fontWeight: 600, fontSize: "0.8rem", cursor: "pointer" }}
                          >
                            + Add
                          </button>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                          {profile?.education?.length ? profile.education.map((edu, idx) => (
                            <div key={idx} style={{ position: "relative" }} className="group">
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <div style={{ fontWeight: 700, fontSize: "0.95rem" }}>{edu.degree}</div>
                                <div style={{ display: "flex", gap: "0.5rem", opacity: 0 }} className="card-actions">
                                  <button onClick={() => { setSelectedEdu(edu); setEduIndex(idx); setIsEditingEdu(true); }} style={{ background: "none", border: "none", color: T.muted, cursor: "pointer" }}><Settings size={12} /></button>
                                  <button onClick={() => handleDeleteEducation(idx)} style={{ background: "none", border: "none", color: "#ff4d4d", cursor: "pointer" }}><Trash2 size={12} /></button>
                                </div>
                              </div>
                              <div style={{ fontSize: "0.85rem", color: T.muted }}>{edu.school} • {edu.year}</div>
                            </div>
                          )) : (
                            <p style={{ fontSize: "0.85rem", color: T.muted }}>Degrees and certifications will appear here.</p>
                          )}
                        </div>
                      </div>

                      {/* Stats/Metrics */}
                      <div style={{ background: T.cardBg, borderRadius: "24px", padding: "2rem", border: `1px solid ${T.border}`, boxShadow: T.shadow }}>
                        <h3 style={{ fontWeight: 700, fontSize: "1.1rem", marginBottom: "1.5rem" }}>Quick Stats</h3>
                        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "1rem" }}>
                          <div style={{ padding: "1rem", borderRadius: "16px", background: T.bg, border: `1px solid ${T.border}` }}>
                            <div style={{ fontSize: "1.5rem", fontWeight: 800, color: T.accent }}>{projects.length}</div>
                            <div style={{ fontSize: "0.7rem", color: T.muted, textTransform: "uppercase", fontWeight: 600 }}>Projects</div>
                          </div>
                          <div style={{ padding: "1rem", borderRadius: "16px", background: T.bg, border: `1px solid ${T.border}` }}>
                            <div style={{ fontSize: "1.5rem", fontWeight: 800, color: T.accent }}>{profile?.total_platform_likes || 0}</div>
                            <div style={{ fontSize: "0.7rem", color: T.muted, textTransform: "uppercase", fontWeight: 600 }}>Likes</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === "Portfolio" && (
                  <motion.div
                    key="portfolio"
                    initial={isMobile ? { opacity: 0, y: 12 } : { opacity: 0, x: 20 }}
                    animate={isMobile ? { opacity: 1, y: 0 } : { opacity: 1, x: 0 }}
                    exit={isMobile ? { opacity: 0, y: -12 } : { opacity: 0, x: -20 }}
                  >
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1.5rem" }}>
                      {projects.map(project => (
                        <motion.div 
                          key={project.id}
                          whileHover={{ y: -5 }}
                          style={{ background: T.cardBg, borderRadius: "20px", overflow: "hidden", border: `1px solid ${T.border}`, boxShadow: T.shadow }}
                        >
                          <div style={{ height: "160px", background: "#111", position: "relative", overflow: "hidden" }}>
                            {project.thumbnail_url ? (
                              <img src={project.thumbnail_url} alt={`${project.title} thumbnail`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            ) : (
                              <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: T.accentSoft }}>
                                <Play size={40} />
                              </div>
                            )}
                            <div style={{ position: "absolute", top: "1rem", right: "1rem", padding: "0.4rem 0.8rem", borderRadius: "99px", background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", fontSize: "0.7rem", fontWeight: 600, color: "#fff" }}>
                              {project.category}
                            </div>
                          </div>
                          <div style={{ padding: "1.25rem" }}>
                            <h4 style={{ fontWeight: 700, fontSize: "1.05rem", marginBottom: "0.5rem" }}>{project.title}</h4>
                            <p style={{ fontSize: "0.85rem", color: T.muted, marginBottom: "1rem", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{project.description}</p>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                              <div style={{ display: "flex", gap: "1rem" }}>
                                <button 
                                  onClick={() => handleLike(project.id)}
                                  style={{ background: "none", border: "none", display: "flex", alignItems: "center", gap: "0.25rem", color: project.has_liked ? T.accent : T.muted, cursor: "pointer", transition: "transform 0.2s" }}
                                  onMouseDown={e => (e.currentTarget.style.transform = "scale(0.9)")}
                                  onMouseUp={e => (e.currentTarget.style.transform = "scale(1)")}
                                >
                                  <Heart size={16} fill={project.has_liked ? T.accent : "none"} />
                                  <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>{project.likes_count}</span>
                                </button>
                                <div style={{ fontSize: "0.85rem", color: T.muted, display: "flex", alignItems: "center", gap: "0.25rem" }}>
                                  <MessageCircle size={16} />
                                  <span>0</span>
                                </div>
                              </div>
                              <button style={{ background: "none", border: "none", color: T.muted, cursor: "pointer" }}><Share2 size={16} /></button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                      <motion.div 
                        onClick={() => setShowAddModal(true)}
                        whileHover={{ scale: 0.98, borderColor: T.accent }}
                        style={{ border: `2px dashed ${T.border}`, borderRadius: "20px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "1rem", minHeight: "280px", cursor: "pointer", color: T.muted, transition: "all 0.2s" }}
                      >
                        <div style={{ padding: "1rem", borderRadius: "50%", background: T.accentSoft, color: T.accent }}><Plus size={24} /></div>
                        <span style={{ fontWeight: 600, fontSize: "0.9rem" }}>Add New Work</span>
                      </motion.div>
                    </div>
                  </motion.div>
                )}

                {activeTab === "Compensation" && (
                  <motion.div
                    key="compensation"
                    initial={isMobile ? { opacity: 0, y: 12 } : { opacity: 0, x: 20 }}
                    animate={isMobile ? { opacity: 1, y: 0 } : { opacity: 1, x: 0 }}
                    exit={isMobile ? { opacity: 0, y: -12 } : { opacity: 0, x: -20 }}
                    style={{ background: T.cardBg, borderRadius: "24px", padding: "3rem", border: `1px solid ${T.border}`, textAlign: "center" }}
                  >
                    <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: T.accentSoft, color: T.accent, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem" }}>
                      <CreditCard size={32} />
                    </div>
                    <h3 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "0.5rem" }}>Compensation & Benefits</h3>
                    <p style={{ color: T.muted, fontSize: "0.9rem", maxWidth: "400px", margin: "0 auto" }}>This section is currently under review for your account. Please check back later for full details.</p>
                  </motion.div>
                )}

                {activeTab === "Security" && (
                  <motion.div
                    key="security"
                    initial={isMobile ? { opacity: 0, y: 12 } : { opacity: 0, x: 20 }}
                    animate={isMobile ? { opacity: 1, y: 0 } : { opacity: 1, x: 0 }}
                    exit={isMobile ? { opacity: 0, y: -12 } : { opacity: 0, x: -20 }}
                    style={{ background: T.cardBg, borderRadius: "24px", padding: "3rem", border: `1px solid ${T.border}`, textAlign: "center" }}
                  >
                    <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: T.accentSoft, color: T.accent, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem" }}>
                      <Plus size={32} />
                    </div>
                    <h3 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "0.5rem" }}>Security Settings</h3>
                    <p style={{ color: T.muted, fontSize: "0.9rem", maxWidth: "400px", margin: "0 auto" }}>Manage your password, multi-factor authentication, and active sessions from this panel.</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>

          <style jsx>{`
            .profile-grid { grid-template-columns: 320px 1fr; }
            .card-actions { transition: opacity 0.2s; }
            div[key]:hover .card-actions, 
            div[style*="relative"]:hover .card-actions { opacity: 1 !important; }
            @media (max-width: 1024px) {
              .profile-grid { grid-template-columns: 1fr; }
              .stats-grid { grid-template-columns: 1fr; }
            }
            .hide-scroll::-webkit-scrollbar { display: none; }
            .hide-scroll { -ms-overflow-style: none; scrollbar-width: none; }
          `}</style>
      </div>
      
      <AnimatePresence>
        {isEditing && (
          <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: isMobile ? "1rem" : "1.5rem" }}>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !saving && setIsEditing(false)}
              style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)" }} 
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              style={{ 
                width: "100%", 
                maxWidth: "600px", 
                maxHeight: "90vh",
                background: T.cardBg, 
                borderRadius: isMobile ? "24px" : "32px", 
                border: `1px solid ${T.border}`, 
                boxShadow: "0 24px 48px rgba(0,0,0,0.5)",
                position: "relative",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden"
              }}
            >
              <div style={{ padding: isMobile ? "1.1rem 1.25rem" : "1.5rem 2rem", borderBottom: `1px solid ${T.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
                <h3 style={{ fontWeight: 800, fontSize: "1.25rem" }}>Edit Profile</h3>
                <button 
                  onClick={() => setIsEditing(false)}
                  disabled={saving}
                  style={{ background: "none", border: "none", color: T.muted, cursor: "pointer" }}
                >
                  <X size={24} />
                </button>
              </div>

              <div style={{ padding: isMobile ? "1.25rem" : "2rem", overflowY: "auto", display: "flex", flexDirection: "column", gap: "2rem" }} className="hide-scroll">
                
                {/* Basic Identity */}
                <section style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  <h4 style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.1em", color: T.muted, fontWeight: 800 }}>Identity</h4>
                  <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "1rem" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                      <label style={{ fontSize: "0.8rem", fontWeight: 600, color: T.muted }}>Full Name</label>
                      <input 
                        value={editData.full_name || ""}
                        onChange={e => setEditData(prev => ({ ...prev, full_name: e.target.value }))}
                        style={{ padding: "1rem", borderRadius: "14px", border: `1px solid ${T.border}`, background: T.bg, color: T.text, outline: "none" }}
                      />
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                      <label style={{ fontSize: "0.8rem", fontWeight: 600, color: T.muted }}>Username</label>
                      <input 
                        value={editData.user_name || ""}
                        onChange={e => setEditData(prev => ({ ...prev, user_name: e.target.value }))}
                        style={{ padding: "1rem", borderRadius: "14px", border: `1px solid ${T.border}`, background: T.bg, color: T.text, outline: "none" }}
                      />
                    </div>
                  </div>
                </section>

                <section style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  <h4 style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.1em", color: T.muted, fontWeight: 800 }}>About</h4>
                  <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                      <label style={{ fontSize: "0.8rem", fontWeight: 600, color: T.muted }}>Bio</label>
                      <textarea 
                        rows={3}
                        value={editData.bio || ""}
                        onChange={e => setEditData(prev => ({ ...prev, bio: e.target.value }))}
                        placeholder="Tell the community who you are..."
                        style={{ padding: "1rem", borderRadius: "14px", border: `1px solid ${T.border}`, background: T.bg, color: T.text, outline: "none", resize: "none" }}
                      />
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                      <label style={{ fontSize: "0.8rem", fontWeight: 600, color: T.muted }}>Location</label>
                      <input 
                        value={editData.location || ""}
                        onChange={e => setEditData(prev => ({ ...prev, location: e.target.value }))}
                        placeholder="City, Country"
                        style={{ padding: "1rem", borderRadius: "14px", border: `1px solid ${T.border}`, background: T.bg, color: T.text, outline: "none" }}
                      />
                    </div>
                  </div>
                </section>

                <section style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  <h4 style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.1em", color: T.muted, fontWeight: 800 }}>Social Links</h4>
                  <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "1rem" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                      <label style={{ fontSize: "0.8rem", fontWeight: 600, color: T.muted }}>Website</label>
                      <input 
                        value={editData.website_url || ""}
                        onChange={e => setEditData(prev => ({ ...prev, website_url: e.target.value }))}
                        placeholder="https://yourportfolio.com"
                        style={{ padding: "1rem", borderRadius: "14px", border: `1px solid ${T.border}`, background: T.bg, color: T.text, outline: "none" }}
                      />
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                      <label style={{ fontSize: "0.8rem", fontWeight: 600, color: T.muted }}>Twitter</label>
                      <input 
                        value={editData.twitter_url || ""}
                        onChange={e => setEditData(prev => ({ ...prev, twitter_url: e.target.value }))}
                        placeholder="@username"
                        style={{ padding: "1rem", borderRadius: "14px", border: `1px solid ${T.border}`, background: T.bg, color: T.text, outline: "none" }}
                      />
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                      <label style={{ fontSize: "0.8rem", fontWeight: 600, color: T.muted }}>Instagram</label>
                      <input 
                        value={editData.instagram_url || ""}
                        onChange={e => setEditData(prev => ({ ...prev, instagram_url: e.target.value }))}
                        placeholder="@username"
                        style={{ padding: "1rem", borderRadius: "14px", border: `1px solid ${T.border}`, background: T.bg, color: T.text, outline: "none" }}
                      />
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                      <label style={{ fontSize: "0.8rem", fontWeight: 600, color: T.muted }}>LinkedIn</label>
                      <input 
                        value={editData.linkedin_url || ""}
                        onChange={e => setEditData(prev => ({ ...prev, linkedin_url: e.target.value }))}
                        placeholder="linkedin.com/in/username"
                        style={{ padding: "1rem", borderRadius: "14px", border: `1px solid ${T.border}`, background: T.bg, color: T.text, outline: "none" }}
                      />
                    </div>
                  </div>
                </section>
              </div>

              <div style={{ padding: isMobile ? "1.1rem 1.25rem" : "1.5rem 2rem", background: T.bg, borderTop: `1px solid ${T.border}`, display: "flex", flexDirection: isMobile ? "column" : "row", gap: "1rem", flexShrink: 0 }}>
                <button 
                  onClick={() => setIsEditing(false)}
                  style={{ flex: 1, padding: "1rem", borderRadius: "16px", background: "none", border: `1px solid ${T.border}`, color: T.text, fontWeight: 700, cursor: "pointer" }}
                >
                  Cancel
                </button>
                <button 
                  onClick={handleUpdateProfile}
                  disabled={saving}
                  style={{ flex: 2, padding: "1rem", borderRadius: "16px", background: T.accent, color: "#fff", border: "none", fontWeight: 800, cursor: "pointer", boxShadow: `0 8px 24px ${T.accent}44` }}
                >
                  {saving ? "Saving Changes..." : "Save Profile"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAddModal && (
          <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: isMobile ? "1rem" : "1.5rem" }}>
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
                background: T.cardBg, 
                borderRadius: isMobile ? "24px" : "32px", 
                border: `1px solid ${T.border}`, 
                boxShadow: "0 24px 48px rgba(0,0,0,0.5)",
                position: "relative",
                overflow: "hidden"
              }}
            >
              <div style={{ padding: isMobile ? "1.1rem 1.25rem" : "1.5rem 2rem", borderBottom: `1px solid ${T.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h3 style={{ fontWeight: 800, fontSize: "1.25rem" }}>Add New Work</h3>
                <button 
                  onClick={() => setShowAddModal(false)}
                  disabled={uploading}
                  style={{ background: "none", border: "none", color: T.muted, cursor: "pointer" }}
                >
                  <X size={24} />
                </button>
              </div>

              <div style={{ padding: isMobile ? "1.25rem" : "2rem", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
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
                      border: projPreview ? "none" : `2px dashed ${T.border}`,
                      background: projPreview ? `url(${projPreview}) center/cover` : T.bg,
                      cursor: "pointer",
                      transition: "all 0.2s"
                    }}
                  >
                    {!projPreview && (
                      <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "0.5rem", color: T.muted }}>
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
                    style={{ width: "100%", padding: "1rem", borderRadius: "14px", border: `1px solid ${T.border}`, background: T.bg, color: T.text, outline: "none" }}
                  />
                  <select
                    value={newProj.category}
                    onChange={e => setNewProj(prev => ({ ...prev, category: e.target.value }))}
                    style={{ width: "100%", padding: "1rem", borderRadius: "14px", border: `1px solid ${T.border}`, background: T.bg, color: T.text, outline: "none" }}
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
                    style={{ width: "100%", padding: "1rem", borderRadius: "14px", border: `1px solid ${T.border}`, background: T.bg, color: T.text, outline: "none", resize: "none" }}
                  />
                </div>

                <button 
                  onClick={handleUploadProject}
                  disabled={uploading || !projFile || !newProj.title.trim()}
                  style={{ 
                    width: "100%", 
                    padding: "1rem", 
                    borderRadius: "16px", 
                    background: (uploading || !projFile || !newProj.title.trim()) ? T.border : T.accent, 
                    color: "#fff", 
                    border: "none", 
                    fontWeight: 800, 
                    fontSize: "1rem", 
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.75rem",
                    boxShadow: !uploading ? `0 8px 24px ${T.accent}44` : "none"
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

      {/* Experience Edit Modal */}
      <AnimatePresence>
        {isEditingExp && (
          <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: "1.5rem" }}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsEditingExp(false)} style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)" }} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} style={{ width: "100%", maxWidth: "500px", background: T.cardBg, borderRadius: "32px", border: `1px solid ${T.border}`, boxShadow: "0 24px 48px rgba(0,0,0,0.5)", position: "relative", overflow: "hidden" }}>
              <div style={{ padding: "1.5rem 2rem", borderBottom: `1px solid ${T.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h3 style={{ fontWeight: 800, fontSize: "1.25rem" }}>{expIndex !== null ? "Edit Experience" : "Add Experience"}</h3>
                <button onClick={() => setIsEditingExp(false)} style={{ background: "none", border: "none", color: T.muted, cursor: "pointer" }}><X size={24} /></button>
              </div>
              <div style={{ padding: "2rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
                <input placeholder="Role / Job Title" value={selectedExp?.role || ""} onChange={e => setSelectedExp(prev => ({ ...prev!, role: e.target.value }))} style={{ width: "100%", padding: "1rem", borderRadius: "14px", border: `1px solid ${T.border}`, background: T.bg, color: T.text, outline: "none" }} />
                <input placeholder="Company / Studio" value={selectedExp?.company || ""} onChange={e => setSelectedExp(prev => ({ ...prev!, company: e.target.value }))} style={{ width: "100%", padding: "1rem", borderRadius: "14px", border: `1px solid ${T.border}`, background: T.bg, color: T.text, outline: "none" }} />
                <input placeholder="Period (e.g. 2020 - Present)" value={selectedExp?.period || ""} onChange={e => setSelectedExp(prev => ({ ...prev!, period: e.target.value }))} style={{ width: "100%", padding: "1rem", borderRadius: "14px", border: `1px solid ${T.border}`, background: T.bg, color: T.text, outline: "none" }} />
                <textarea placeholder="Description of your work..." rows={4} value={selectedExp?.description || ""} onChange={e => setSelectedExp(prev => ({ ...prev!, description: e.target.value }))} style={{ width: "100%", padding: "1rem", borderRadius: "14px", border: `1px solid ${T.border}`, background: T.bg, color: T.text, outline: "none", resize: "none" }} />
                <button onClick={handleSaveExperience} style={{ width: "100%", padding: "1rem", borderRadius: "16px", background: T.accent, color: "#fff", border: "none", fontWeight: 800, cursor: "pointer", boxShadow: `0 8px 24px ${T.accent}44` }}>Save Experience</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Education Edit Modal */}
      <AnimatePresence>
        {isEditingEdu && (
          <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: "1.5rem" }}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsEditingEdu(false)} style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)" }} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} style={{ width: "100%", maxWidth: "500px", background: T.cardBg, borderRadius: "32px", border: `1px solid ${T.border}`, boxShadow: "0 24px 48px rgba(0,0,0,0.5)", position: "relative", overflow: "hidden" }}>
              <div style={{ padding: "1.5rem 2rem", borderBottom: `1px solid ${T.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h3 style={{ fontWeight: 800, fontSize: "1.25rem" }}>{eduIndex !== null ? "Edit Education" : "Add Education"}</h3>
                <button onClick={() => setIsEditingEdu(false)} style={{ background: "none", border: "none", color: T.muted, cursor: "pointer" }}><X size={24} /></button>
              </div>
              <div style={{ padding: "2rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
                <input placeholder="Degree / Certification" value={selectedEdu?.degree || ""} onChange={e => setSelectedEdu(prev => ({ ...prev!, degree: e.target.value }))} style={{ width: "100%", padding: "1rem", borderRadius: "14px", border: `1px solid ${T.border}`, background: T.bg, color: T.text, outline: "none" }} />
                <input placeholder="Institution / School" value={selectedEdu?.school || ""} onChange={e => setSelectedEdu(prev => ({ ...prev!, school: e.target.value }))} style={{ width: "100%", padding: "1rem", borderRadius: "14px", border: `1px solid ${T.border}`, background: T.bg, color: T.text, outline: "none" }} />
                <input placeholder="Year" value={selectedEdu?.year || ""} onChange={e => setSelectedEdu(prev => ({ ...prev!, year: e.target.value }))} style={{ width: "100%", padding: "1rem", borderRadius: "14px", border: `1px solid ${T.border}`, background: T.bg, color: T.text, outline: "none" }} />
                <button onClick={handleSaveEducation} style={{ width: "100%", padding: "1rem", borderRadius: "16px", background: T.accent, color: "#fff", border: "none", fontWeight: 800, cursor: "pointer", boxShadow: `0 8px 24px ${T.accent}44` }}>Save Education</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

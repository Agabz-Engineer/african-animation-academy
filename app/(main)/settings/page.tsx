"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, Lock, Bell, Palette,
  Camera, ChevronRight, Check, AlertTriangle,
  Eye, EyeOff, Save, Trash2
} from "lucide-react";
import { supabase } from "@/lib/supabase";

/* ── Palette ── */
const DARK = {
  pageBg:    "#222222",
  cardBg:    "#2C2C2C",
  surface:   "#333333",
  border:    "#444444",
  inputBg:   "#2C2C2C",
  inputBorder:"#555555",
  text:      "#FAF3E1",
  textMuted: "#D2C9B8",
  textDim:   "#9E9688",
  accent:    "#FF6D1F",
  accentSoft:"rgba(255,109,31,0.09)",
  accentGlow:"rgba(255,109,31,0.22)",
  danger:    "#E05252",
  dangerSoft:"rgba(224,82,82,0.10)",
  success:   "#4CAF50",
  sidebarBg: "#333333",
  toggleOff: "#555555",
};
const LIGHT = {
  pageBg:    "#FAF3E1",
  cardBg:    "#FFFFFF",
  surface:   "#F5E7C6",
  border:    "#E7DBBD",
  inputBg:   "#FFFFFF",
  inputBorder:"#E7DBBD",
  text:      "#222222",
  textMuted: "#555555",
  textDim:   "#9E9688",
  accent:    "#FF6D1F",
  accentSoft:"rgba(255,109,31,0.09)",
  accentGlow:"rgba(255,109,31,0.18)",
  danger:    "#D94040",
  dangerSoft:"rgba(217,64,64,0.08)",
  success:   "#4CAF50",
  sidebarBg: "#F5E7C6",
  toggleOff: "#E7DBBD",
};

const TABS = [
  { id: "profile",       label: "Profile",       icon: User   },
  { id: "account",       label: "Account",        icon: Lock   },
  { id: "notifications", label: "Notifications",  icon: Bell   },
  { id: "appearance",    label: "Appearance",     icon: Palette},
];

const SKILL_LEVELS = ["beginner", "intermediate", "advanced"];
const GOALS = [
  "Get a job at an animation studio",
  "Freelance as an animator",
  "Build my own animated series",
  "Improve my existing skills",
  "Just exploring animation",
];
const LANGUAGES = [
  { id: "en-GB", label: "English (UK)" },
  { id: "en-US", label: "English (US)" },
  { id: "fr", label: "French" },
  { id: "sw", label: "Swahili" },
  { id: "ha", label: "Hausa" },
];

type NotifKey = "newLessons" | "communityReplies" | "events" | "weeklyReport";
type LanguageId = (typeof LANGUAGES)[number]["id"];

const getInitialTheme = (): "dark" | "light" => {
  if (typeof window === "undefined") return "dark";
  const saved = localStorage.getItem("africafx-theme");
  if (saved === "dark" || saved === "light") return saved;
  const attr = document.documentElement.getAttribute("data-theme");
  return attr === "light" ? "light" : "dark";
};

const getInitialLanguage = (): LanguageId => {
  if (typeof window === "undefined") return "en-GB";
  const saved = localStorage.getItem("africafx-language");
  if (saved && LANGUAGES.some((lang) => lang.id === saved)) {
    return saved as LanguageId;
  }
  const browser = (navigator.language || "en-GB").toLowerCase();
  const match = LANGUAGES.find((lang) => lang.id.toLowerCase() === browser);
  return match?.id || "en-GB";
};

const addCacheBuster = (url: string) =>
  `${url}${url.includes("?") ? "&" : "?"}v=${Date.now()}`;

const resolveAvatarDisplayUrl = async (
  avatarPath: string | null,
  avatarPublicUrl: string | null
) => {
  if (avatarPath && supabase) {
    const { data: signedData, error: signedError } = await supabase.storage
      .from("avatars")
      .createSignedUrl(avatarPath, 60 * 60);

    if (!signedError && signedData?.signedUrl) {
      return addCacheBuster(signedData.signedUrl);
    }

    const { data: publicData } = supabase.storage
      .from("avatars")
      .getPublicUrl(avatarPath);
    if (publicData?.publicUrl) return addCacheBuster(publicData.publicUrl);
  }

  return avatarPublicUrl ? addCacheBuster(avatarPublicUrl) : null;
};

export default function SettingsPage() {
  const [theme, setTheme]   = useState<"dark"|"light">(getInitialTheme);
  const [tab, setTab]       = useState("profile");
  const [saved, setSaved]   = useState(false);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState<LanguageId>(getInitialLanguage);

  /* Profile fields */
  const [fullName,    setFullName]    = useState("");
  const [username,    setUsername]    = useState("");
  const [bio,         setBio]         = useState("");
  const [skillLevel,  setSkillLevel]  = useState("beginner");
  const [goal,        setGoal]        = useState(GOALS[0]);
  const [email,       setEmail]       = useState("");
  const [avatarUrl,   setAvatarUrl]   = useState<string|null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarLoadError, setAvatarLoadError] = useState(false);

  /* Account fields */
  const [newPw,      setNewPw]      = useState("");
  const [confirmPw,  setConfirmPw]  = useState("");
  const [showPw,     setShowPw]     = useState(false);
  const [pwError,    setPwError]    = useState("");
  const [deleteInput, setDeleteInput] = useState("");

  /* Notifications */
  const [notifs, setNotifs] = useState<Record<NotifKey, boolean>>({
    newLessons:      true,
    communityReplies:true,
    events:          false,
    weeklyReport:    true,
  });

  useEffect(() => {
    const obs = new MutationObserver(() => {
      const t = document.documentElement.getAttribute("data-theme") as "dark"|"light";
      if (t) setTheme(t);
    });
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

    let mounted = true;

    const loadUser = async () => {
      if (!supabase) return;
      const { data: { user } } = await supabase.auth.getUser();
      if (!mounted) return;

      if (user) {
        const metadata = user.user_metadata || {};
        const avatarPath = typeof metadata.avatar_path === "string" ? metadata.avatar_path : null;
        const avatarPublicUrl = typeof metadata.avatar_url === "string" ? metadata.avatar_url : null;

        setEmail(user.email || "");
        setFullName(metadata.full_name || "");
        setUsername(metadata.username || "");
        setBio(metadata.bio || "");
        setSkillLevel(metadata.skill_level || "beginner");
        setGoal(metadata.goal || GOALS[0]);

        const displayAvatarUrl = await resolveAvatarDisplayUrl(avatarPath, avatarPublicUrl);
        if (!mounted) return;
        setAvatarUrl(displayAvatarUrl);
        setAvatarLoadError(false);
      }

      setLoading(false);
    };

    loadUser();

    return () => {
      mounted = false;
      obs.disconnect();
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem("africafx-language", language);
    document.documentElement.setAttribute("lang", language);
  }, [language]);

  const T = theme === "dark" ? DARK : LIGHT;

  const toggleAppTheme = (mode: "dark"|"light") => {
    setTheme(mode);
    localStorage.setItem("africafx-theme", mode);
    document.documentElement.setAttribute("data-theme", mode);
  };

  const showSavedToast = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2400);
  };

  const handleSaveProfile = async () => {
    if (!supabase) return;
    await supabase.auth.updateUser({
      data: { full_name: fullName, username, bio, skill_level: skillLevel, goal }
    });
    showSavedToast();
  };

  const handleChangePassword = async () => {
    setPwError("");
    if (newPw.length < 8) { setPwError("Password must be at least 8 characters."); return; }
    if (newPw !== confirmPw) { setPwError("Passwords do not match."); return; }
    if (!supabase) return;
    const { error } = await supabase.auth.updateUser({ password: newPw });
    if (error) { setPwError(error.message); return; }
    setNewPw(""); setConfirmPw("");
    showSavedToast();
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    /* Validate — image only, max 2MB */
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file."); return;
    }
    if (file.size > 2 * 1024 * 1024) {
      alert("Image must be under 2MB."); return;
    }

    setAvatarUploading(true);
    setAvatarLoadError(false);
    if (!supabase) return;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const metadata = user.user_metadata || {};
      const previousAvatarPath =
        typeof metadata.avatar_path === "string" ? metadata.avatar_path : null;

      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const filePath = `${user.id}/${Date.now()}-avatar.${ext}`;

      /* Upload to Supabase Storage bucket "avatars" */
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: false, contentType: file.type });

      if (uploadError) throw uploadError;

      /* Get public URL */
      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      const { data: signedData } = await supabase.storage
        .from("avatars")
        .createSignedUrl(filePath, 60 * 60);

      /* Save to user metadata */
      await supabase.auth.updateUser({
        data: { avatar_url: publicUrl, avatar_path: filePath }
      });

      if (previousAvatarPath && previousAvatarPath !== filePath) {
        await supabase.storage.from("avatars").remove([previousAvatarPath]);
      }

      setAvatarUrl(addCacheBuster(signedData?.signedUrl || publicUrl));
      setAvatarLoadError(false);
      showSavedToast();
    } catch (err) {
      console.error("Avatar upload failed:", err);
      const message = err instanceof Error ? err.message : "Unknown error";
      if (message.toLowerCase().includes("row-level security")) {
        alert("Upload failed: avatar storage policy is blocking this. Apply the latest Supabase migration, then try again.");
        return;
      }
      alert(`Upload failed: ${message}`);
    } finally {
      setAvatarUploading(false);
      e.target.value = "";
    }
  };

  /* ── Reusable input ── */
  const Input = ({
    label, value, onChange, type = "text", placeholder = "", disabled = false, hint = ""
  }: {
    label: string; value: string; onChange: (v: string) => void;
    type?: string; placeholder?: string; disabled?: boolean; hint?: string;
  }) => (
    <div style={{ marginBottom: "1.25rem" }}>
      <label style={{ display: "block", fontSize: "0.78rem", fontFamily: "'General Sans',sans-serif", fontWeight: 600, color: T.textMuted, marginBottom: "0.4rem", letterSpacing: "0.01em" }}>
        {label}
      </label>
      <input
        type={type} value={value} disabled={disabled}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: "100%", boxSizing: "border-box",
          backgroundColor: disabled ? T.surface : T.inputBg,
          border: `1px solid ${T.inputBorder}`,
          borderRadius: "10px",
          padding: "0.65rem 0.9rem",
          color: disabled ? T.textDim : T.text,
          fontSize: "0.85rem",
          fontFamily: "'General Sans',sans-serif",
          outline: "none",
          transition: "border-color 0.18s",
          cursor: disabled ? "not-allowed" : "text",
        }}
        onFocus={(e) => { if (!disabled) e.currentTarget.style.borderColor = T.accent; }}
        onBlur={(e)  => { e.currentTarget.style.borderColor = T.inputBorder; }}
      />
      {hint && <p style={{ fontSize: "0.7rem", color: T.textDim, fontFamily: "'General Sans',sans-serif", marginTop: "0.3rem" }}>{hint}</p>}
    </div>
  );

  /* ── Toggle switch ── */
  const Toggle = ({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) => (
    <button
      onClick={() => onChange(!on)}
      style={{
        width: "44px", height: "24px", borderRadius: "999px",
        backgroundColor: on ? T.accent : T.toggleOff,
        border: "none", cursor: "pointer",
        position: "relative", flexShrink: 0,
        transition: "background-color 0.22s ease",
        boxShadow: on ? `0 0 10px ${T.accentGlow}` : "none",
      }}
    >
      <motion.div
        animate={{ x: on ? 20 : 2 }}
        transition={{ type: "spring", stiffness: 500, damping: 35 }}
        style={{ position: "absolute", top: "2px", width: "20px", height: "20px", borderRadius: "50%", backgroundColor: "#FFFFFF", boxShadow: "0 1px 4px rgba(0,0,0,0.25)" }}
      />
    </button>
  );

  /* ── Section heading ── */
  const SectionHead = ({ title, desc }: { title: string; desc: string }) => (
    <div style={{ marginBottom: "1.75rem", paddingBottom: "1.25rem", borderBottom: `1px solid ${T.border}` }}>
      <h2 style={{ fontFamily: "'General Sans',sans-serif", fontWeight: 700, fontSize: "1.25rem", color: T.text, marginBottom: "0.3rem", letterSpacing: "-0.01em" }}>{title}</h2>
      <p style={{ fontSize: "0.9rem", color: T.textMuted, fontFamily: "'General Sans',sans-serif", lineHeight: 1.6 }}>{desc}</p>
    </div>
  );

  /* ── Save button ── */
  const SaveBtn = ({ onClick, label = "Save changes" }: { onClick: () => void; label?: string }) => (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      style={{
        display: "flex", alignItems: "center", gap: "7px",
        padding: "0.6rem 1.4rem", borderRadius: "10px",
        backgroundColor: T.accent, border: "none",
        color: "#FFFFFF", fontFamily: "'General Sans',sans-serif",
        fontWeight: 700, fontSize: "0.82rem", cursor: "pointer",
        boxShadow: `0 2px 12px ${T.accentGlow}`,
      }}
    >
      <Save style={{ width: "13px", height: "13px" }} />
      {label}
    </motion.button>
  );

  if (loading) return (
    <div style={{ backgroundColor: DARK.pageBg, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: "28px", height: "28px", border: "2px solid #444444", borderTopColor: "#FF6D1F", borderRadius: "50%", animation: "spin 0.75s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  /* ── Tab content ── */
  const renderTab = () => {
    switch (tab) {

      /* ════════════════ PROFILE ════════════════ */
      case "profile": return (
        <div>
          <SectionHead title="Profile" desc="Update your public profile and how others see you on Africa Fx." />

          {/* Avatar — real upload */}
          <div style={{ display: "flex", alignItems: "center", gap: "1.25rem", marginBottom: "1.75rem" }}>
            <div style={{ position: "relative", flexShrink: 0 }}>
              {/* Avatar image or initial fallback */}
              {avatarUrl && !avatarLoadError ? (
                <Image
                  src={avatarUrl}
                  alt="Profile"
                  width={64}
                  height={64}
                  unoptimized
                  onError={() => setAvatarLoadError(true)}
                  style={{ width: "64px", height: "64px", borderRadius: "50%", objectFit: "cover", boxShadow: `0 0 0 3px ${T.pageBg}, 0 0 0 4.5px ${T.accent}44` }}
                />
              ) : (
                <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "linear-gradient(135deg,#FF6D1F,#E04D00)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'General Sans',sans-serif", fontWeight: 700, fontSize: "1.5rem", color: "#FFFFFF", boxShadow: `0 0 0 3px ${T.pageBg}, 0 0 0 4.5px ${T.accent}44` }}>
                  {(fullName || email).charAt(0).toUpperCase()}
                </div>
              )}

              {/* Upload button — triggers hidden file input */}
              <label htmlFor="avatar-upload" style={{ position: "absolute", bottom: 0, right: 0, width: "22px", height: "22px", borderRadius: "50%", backgroundColor: avatarUploading ? T.textDim : T.accent, border: `2px solid ${T.pageBg}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: avatarUploading ? "wait" : "pointer" }}>
                {avatarUploading
                  ? <div style={{ width: "12px", height: "12px", border: "1.5px solid #FFFFFF", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                  : <Camera style={{ width: "10px", height: "10px", color: "#FFFFFF" }} />
                }
              </label>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                style={{ display: "none" }}
              />
            </div>

            <div>
              <p style={{ fontFamily: "'General Sans',sans-serif", fontWeight: 600, fontSize: "0.85rem", color: T.text }}>{fullName || "Your Name"}</p>
              <p style={{ fontSize: "0.72rem", color: T.textDim, fontFamily: "'General Sans',sans-serif", marginTop: "2px" }}>
                {avatarUrl ? "Click the camera to change your photo" : "Click the camera icon to upload a photo"}
              </p>
              <p style={{ fontSize: "0.68rem", color: T.textDim, fontFamily: "'General Sans',sans-serif", marginTop: "1px" }}>
                JPG, PNG or WebP · max 2MB
              </p>
            </div>
          </div>

          <Input label="Full name"  value={fullName}  onChange={setFullName}  placeholder="e.g. Kwame Mensah" />
          <Input label="Username"   value={username}  onChange={setUsername}  placeholder="e.g. kwame_draws" hint="Used on your public profile and community posts." />

          {/* Bio */}
          <div style={{ marginBottom: "1.25rem" }}>
            <label style={{ display: "block", fontSize: "0.78rem", fontFamily: "'General Sans',sans-serif", fontWeight: 600, color: T.textMuted, marginBottom: "0.4rem" }}>Bio</label>
            <textarea
              value={bio} rows={3}
              placeholder="Tell the community a bit about yourself..."
              onChange={(e) => setBio(e.target.value)}
              style={{ width: "100%", boxSizing: "border-box", backgroundColor: T.inputBg, border: `1px solid ${T.inputBorder}`, borderRadius: "10px", padding: "0.65rem 0.9rem", color: T.text, fontSize: "0.85rem", fontFamily: "'General Sans',sans-serif", outline: "none", resize: "vertical", lineHeight: 1.55, transition: "border-color 0.18s" }}
              onFocus={(e) => { e.currentTarget.style.borderColor = T.accent; }}
              onBlur={(e)  => { e.currentTarget.style.borderColor = T.inputBorder; }}
            />
            <p style={{ fontSize: "0.7rem", color: T.textDim, marginTop: "0.3rem", fontFamily: "'General Sans',sans-serif" }}>{bio.length}/160 characters</p>
          </div>

          {/* Skill level */}
          <div style={{ marginBottom: "1.25rem" }}>
            <label style={{ display: "block", fontSize: "0.78rem", fontFamily: "'General Sans',sans-serif", fontWeight: 600, color: T.textMuted, marginBottom: "0.6rem" }}>Skill level</label>
            <div style={{ display: "flex", gap: "0.625rem" }}>
              {SKILL_LEVELS.map((lvl) => {
                const active = skillLevel === lvl;
                const col = lvl === "beginner" ? "#4CAF50" : lvl === "intermediate" ? "#FF8C00" : "#C8A882";
                return (
                  <button key={lvl} onClick={() => setSkillLevel(lvl)} style={{ flex: 1, padding: "0.55rem", borderRadius: "10px", border: `1.5px solid ${active ? col : T.border}`, backgroundColor: active ? `${col}14` : T.surface, color: active ? col : T.textMuted, fontFamily: "'General Sans',sans-serif", fontWeight: active ? 700 : 400, fontSize: "0.78rem", cursor: "pointer", transition: "all 0.18s", textTransform: "capitalize" }}>
                    {lvl}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Goal */}
          <div style={{ marginBottom: "1.75rem" }}>
            <label style={{ display: "block", fontSize: "0.78rem", fontFamily: "'General Sans',sans-serif", fontWeight: 600, color: T.textMuted, marginBottom: "0.6rem" }}>Your goal</label>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {GOALS.map((g) => {
                const active = goal === g;
                return (
                  <button key={g} onClick={() => setGoal(g)} style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.7rem 0.875rem", borderRadius: "10px", border: `1px solid ${active ? T.accent : T.border}`, backgroundColor: active ? T.accentSoft : T.surface, color: active ? T.accent : T.textMuted, fontFamily: "'General Sans',sans-serif", fontWeight: active ? 600 : 400, fontSize: "0.82rem", cursor: "pointer", textAlign: "left", transition: "all 0.18s" }}>
                    <div style={{ width: "16px", height: "16px", borderRadius: "50%", border: `1.5px solid ${active ? T.accent : T.border}`, backgroundColor: active ? T.accent : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      {active && <Check style={{ width: "9px", height: "9px", color: "#FFFFFF" }} />}
                    </div>
                    {g}
                  </button>
                );
              })}
            </div>
          </div>

          <SaveBtn onClick={handleSaveProfile} />
        </div>
      );

      /* ════════════════ ACCOUNT ════════════════ */
      case "account": return (
        <div>
          <SectionHead title="Account" desc="Manage your email, password and account security." />

          {/* Email */}
          <Input label="Email address" value={email} onChange={() => {}} disabled hint="Your email cannot be changed. Contact support if needed." />

          {/* Change password */}
          <div style={{ backgroundColor: T.surface, border: `1px solid ${T.border}`, borderRadius: "14px", padding: "1.25rem", marginBottom: "1.5rem" }}>
            <h3 style={{ fontFamily: "'General Sans',sans-serif", fontWeight: 700, fontSize: "0.98rem", color: T.text, marginBottom: "1rem" }}>Change password</h3>

            <div style={{ position: "relative", marginBottom: "1rem" }}>
              <input type={showPw ? "text" : "password"} placeholder="New password" value={newPw} onChange={(e) => setNewPw(e.target.value)}
                style={{ width: "100%", boxSizing: "border-box", backgroundColor: T.inputBg, border: `1px solid ${T.inputBorder}`, borderRadius: "10px", padding: "0.65rem 2.5rem 0.65rem 0.9rem", color: T.text, fontSize: "0.85rem", fontFamily: "'General Sans',sans-serif", outline: "none" }}
                onFocus={(e) => { e.currentTarget.style.borderColor = T.accent; }}
                onBlur={(e)  => { e.currentTarget.style.borderColor = T.inputBorder; }}
              />
              <button onClick={() => setShowPw(!showPw)} style={{ position: "absolute", right: "0.875rem", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: T.textDim }}>
                {showPw ? <EyeOff style={{ width: "14px", height: "14px" }} /> : <Eye style={{ width: "14px", height: "14px" }} />}
              </button>
            </div>

            <input type="password" placeholder="Confirm new password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)}
              style={{ width: "100%", boxSizing: "border-box", backgroundColor: T.inputBg, border: `1px solid ${pwError ? T.danger : T.inputBorder}`, borderRadius: "10px", padding: "0.65rem 0.9rem", color: T.text, fontSize: "0.85rem", fontFamily: "'General Sans',sans-serif", outline: "none", marginBottom: "0.75rem" }}
              onFocus={(e) => { e.currentTarget.style.borderColor = T.accent; }}
              onBlur={(e)  => { e.currentTarget.style.borderColor = pwError ? T.danger : T.inputBorder; }}
            />

            {pwError && (
              <p style={{ fontSize: "0.72rem", color: T.danger, fontFamily: "'General Sans',sans-serif", marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "4px" }}>
                <AlertTriangle style={{ width: "11px", height: "11px" }} />{pwError}
              </p>
            )}

            <SaveBtn onClick={handleChangePassword} label="Update password" />
          </div>

          {/* Danger zone */}
          <div style={{ backgroundColor: T.dangerSoft, border: `1px solid ${T.danger}33`, borderRadius: "14px", padding: "1.25rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "0.5rem" }}>
              <Trash2 style={{ width: "15px", height: "15px", color: T.danger }} />
              <h3 style={{ fontFamily: "'General Sans',sans-serif", fontWeight: 700, fontSize: "0.98rem", color: T.danger }}>Delete account</h3>
            </div>
            <p style={{ fontSize: "0.82rem", color: T.textMuted, fontFamily: "'General Sans',sans-serif", lineHeight: 1.55, marginBottom: "1rem" }}>
              This is permanent. All your progress, courses and community posts will be erased. Type <strong style={{ color: T.text, fontFamily: "'Fira Code',monospace" }}>DELETE</strong> to confirm.
            </p>
            <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
              <input type="text" placeholder="Type DELETE" value={deleteInput} onChange={(e) => setDeleteInput(e.target.value)}
                style={{ flex: 1, backgroundColor: T.inputBg, border: `1px solid ${T.danger}44`, borderRadius: "10px", padding: "0.6rem 0.875rem", color: T.text, fontSize: "0.82rem", fontFamily: "'General Sans',sans-serif", outline: "none" }}
              />
              <button
                disabled={deleteInput !== "DELETE"}
                style={{ padding: "0.6rem 1.2rem", borderRadius: "10px", border: "none", backgroundColor: deleteInput === "DELETE" ? T.danger : T.toggleOff, color: deleteInput === "DELETE" ? "#FFFFFF" : T.textDim, fontFamily: "'General Sans',sans-serif", fontWeight: 700, fontSize: "0.78rem", cursor: deleteInput === "DELETE" ? "pointer" : "not-allowed", transition: "all 0.2s", whiteSpace: "nowrap" }}
              >
                Delete account
              </button>
            </div>
          </div>
        </div>
      );

      /* ════════════════ NOTIFICATIONS ════════════════ */
      case "notifications": return (
        <div>
          <SectionHead title="Notifications" desc="Choose what you hear about and how often." />

          {[
            { key: "newLessons",       title: "New lessons",         desc: "Get notified when instructors add new content to your enrolled courses." },
            { key: "communityReplies", title: "Community replies",   desc: "When someone replies to your post or mentions you in the community." },
            { key: "events",           title: "Events & challenges", desc: "Monthly design challenges, live workshops and community events." },
            { key: "weeklyReport",     title: "Weekly progress",     desc: "A summary of your learning activity and streak every Monday." },
          ].map(({ key, title, desc }) => (
            <div key={key} style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1.5rem", padding: "1.125rem 0", borderBottom: `1px solid ${T.border}` }}>
              <div style={{ flex: 1 }}>
                <p style={{ fontFamily: "'General Sans',sans-serif", fontWeight: 600, fontSize: "0.85rem", color: T.text, marginBottom: "0.25rem" }}>{title}</p>
                <p style={{ fontSize: "0.8rem", color: T.textDim, fontFamily: "'General Sans',sans-serif", lineHeight: 1.55 }}>{desc}</p>
              </div>
              <Toggle on={notifs[key as NotifKey]} onChange={(v) => setNotifs(n => ({ ...n, [key]: v }))} />
            </div>
          ))}

          <div style={{ marginTop: "1.5rem" }}>
            <SaveBtn onClick={showSavedToast} label="Save preferences" />
          </div>
        </div>
      );

      /* ════════════════ APPEARANCE ════════════════ */
      case "appearance": return (
        <div>
          <SectionHead title="Appearance" desc="Customise how Africa Fx looks and feels for you." />

          <p style={{ fontSize: "0.78rem", fontFamily: "'General Sans',sans-serif", fontWeight: 600, color: T.textMuted, marginBottom: "0.875rem" }}>Theme</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.875rem", marginBottom: "1.75rem", maxWidth: "480px" }}>
            {(["dark","light"] as const).map((mode) => {
              const active = theme === mode;
              const isDark = mode === "dark";
              return (
                <button key={mode} onClick={() => toggleAppTheme(mode)} style={{ borderRadius: "14px", border: `2px solid ${active ? T.accent : T.border}`, backgroundColor: isDark ? "#0F0D0B" : "#FAF8F0", padding: "1.25rem", cursor: "pointer", textAlign: "left", transition: "border-color 0.2s", position: "relative", overflow: "hidden" }}>
                  {active && (
                    <div style={{ position: "absolute", top: "10px", right: "10px", width: "18px", height: "18px", borderRadius: "50%", backgroundColor: T.accent, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Check style={{ width: "10px", height: "10px", color: "#FFFFFF" }} />
                    </div>
                  )}
                  {/* Mini preview */}
                  <div style={{ display: "flex", gap: "4px", marginBottom: "0.75rem" }}>
                    <div style={{ width: "28px", borderRadius: "4px", backgroundColor: isDark ? "#161412" : "#EEE6D2", height: "36px" }} />
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "3px" }}>
                      <div style={{ height: "6px", borderRadius: "3px", backgroundColor: isDark ? "#242018" : "#E8E0D0", width: "70%" }} />
                      <div style={{ height: "6px", borderRadius: "3px", backgroundColor: isDark ? "#242018" : "#E8E0D0", width: "50%" }} />
                      <div style={{ height: "6px", borderRadius: "3px", backgroundColor: "#FF8C00", width: "35%", marginTop: "4px" }} />
                    </div>
                  </div>
                  <p style={{ fontFamily: "'General Sans',sans-serif", fontWeight: 700, fontSize: "0.8rem", color: isDark ? "#FAF8F0" : "#1C1C1C", textTransform: "capitalize" }}>{mode} mode</p>
                </button>
              );
            })}
          </div>

          <div style={{ backgroundColor: T.surface, border: `1px solid ${T.border}`, borderRadius: "12px", padding: "1rem 1.125rem", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
            <div>
              <p style={{ fontFamily: "'General Sans',sans-serif", fontWeight: 600, fontSize: "0.85rem", color: T.text }}>Language</p>
              <p style={{ fontSize: "0.78rem", color: T.textDim, fontFamily: "'General Sans',sans-serif", marginTop: "2px" }}>Choose the language for menus and labels.</p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <select
                value={language}
                onChange={(event) => {
                  setLanguage(event.target.value as LanguageId);
                  showSavedToast();
                }}
                style={{
                  backgroundColor: T.inputBg,
                  border: `1px solid ${T.inputBorder}`,
                  borderRadius: "10px",
                  padding: "0.5rem 0.75rem",
                  color: T.text,
                  fontFamily: "'General Sans',sans-serif",
                  fontSize: "0.78rem",
                  outline: "none",
                  cursor: "pointer",
                }}
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang.id} value={lang.id}>
                    {lang.label}
                  </option>
                ))}
              </select>
              <ChevronRight style={{ width: "13px", height: "13px", color: T.textDim }} />
            </div>
          </div>
        </div>
      );

      default: return null;
    }
  };

  return (
    <div style={{ backgroundColor: T.pageBg, minHeight: "100vh", color: T.text, fontFamily: "'General Sans',sans-serif", transition: "background-color 0.3s" }}>

      {/* ── Page header ── */}
      <div style={{ padding: "2.5rem 2.5rem 0" }}>
        <div style={{ display: "flex", gap: "3px", marginBottom: "1.25rem" }}>
          {["#FF8C00","#1C1C1C","#EDE5CC","#FF8C00"].map((c, i) => (
            <div key={i} style={{ height: "3px", width: i === 0 || i === 3 ? "24px" : "8px", backgroundColor: c, borderRadius: "999px" }} />
          ))}
        </div>
        <h1 style={{ fontFamily: "'General Sans',sans-serif", fontWeight: 700, fontSize: "2rem", color: T.text, letterSpacing: "-0.01em", marginBottom: "0.375rem" }}>Settings</h1>
        <p style={{ fontSize: "0.92rem", color: T.textMuted, fontFamily: "'General Sans',sans-serif", lineHeight: 1.6, marginBottom: "2rem" }}>Manage your profile, account and preferences.</p>
      </div>

      {/* ── Layout: tabs left + content right ── */}
      <div style={{ display: "flex", gap: 0, padding: "0 2.5rem 4rem", alignItems: "flex-start" }}>

        {/* Left tab list */}
        <div style={{ width: "196px", minWidth: "196px", marginRight: "2rem", flexShrink: 0 }}>
          <div style={{ backgroundColor: T.sidebarBg, borderRadius: "14px", padding: "0.5rem", border: `1px solid ${T.border}` }}>
            {TABS.map((t) => {
              const active = tab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  style={{
                    display: "flex", alignItems: "center", gap: "0.65rem",
                    width: "100%", padding: "0.6rem 0.75rem",
                    borderRadius: "9px", border: "none", cursor: "pointer",
                    backgroundColor: active ? T.accentSoft : "transparent",
                    color: active ? T.accent : T.textMuted,
                    fontFamily: "'General Sans',sans-serif",
                    fontWeight: active ? 700 : 400,
                    fontSize: "0.82rem",
                    textAlign: "left",
                    transition: "all 0.16s",
                    outline: active ? `1px solid ${T.accent}22` : "none",
                    marginBottom: "2px",
                  }}
                >
                  <t.icon style={{ width: "15px", height: "15px", flexShrink: 0 }} />
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right content panel */}
        <div style={{ flex: 1, minWidth: 0, backgroundColor: T.cardBg, border: `1px solid ${T.border}`, borderRadius: "16px", padding: "1.75rem 2rem" }}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{    opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              {renderTab()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* ── Saved toast ── */}
      <AnimatePresence>
        {saved && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0,  scale: 1    }}
            exit={{    opacity: 0, y: 16, scale: 0.95 }}
            transition={{ duration: 0.22 }}
            style={{ position: "fixed", bottom: "2rem", left: "50%", transform: "translateX(-50%)", backgroundColor: T.success, color: "#FFFFFF", padding: "0.65rem 1.4rem", borderRadius: "999px", fontFamily: "'General Sans',sans-serif", fontWeight: 700, fontSize: "0.82rem", display: "flex", alignItems: "center", gap: "7px", boxShadow: "0 4px 20px rgba(76,175,80,0.35)", zIndex: 100, whiteSpace: "nowrap" }}
          >
            <Check style={{ width: "14px", height: "14px" }} /> Changes saved
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500;600&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 767px) {
          .hide-mobile { display: none !important; }
        }
      `}</style>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Clock, Camera, X, Lock, Play } from "lucide-react";
import { supabase } from "@/lib/supabase";

type Course = {
  title: string;
  instructor: string;
  level: string;
  duration: string;
  desc: string;
  videoUrl?: string;
  enrollUrl?: string;
  access?: "free" | "pro";
};

const COURSES: Course[] = [
  { title: "Quick Poses for Strong Silhouettes", instructor: "Kwame Mensah", level: "Beginner", duration: "4h 30m", desc: "Master the core principles of designing compelling characters for animation.", videoUrl: "https://www.canva.com/design/DAHD3nwYBvg/GZo8Ds7IPpm-D8lFgi4oQA/watch?utm_content=DAHD3nwYBvg&utm_campaign=designshare&utm_medium=link2&utm_source=uniquelinks&utlId=h6f9a7dbd10", enrollUrl: "https://www.canva.com/design/DAHD3nwYBvg/GZo8Ds7IPpm-D8lFgi4oQA/watch?utm_content=DAHD3nwYBvg&utm_campaign=designshare&utm_medium=link2&utm_source=uniquelinks&utlId=h6f9a7dbd10", access: "free" },
  { title: "Expressive Walk Cycles: The Gathering Place Study", instructor: "TBA", level: "Beginner", duration: "TBD", desc: "Study rhythm, weight, and personality in walk cycles using a lively gathering‑place scene.", videoUrl: "https://www.canva.com/design/DAHD3m29zmY/lVC08kbRQRHEcrTBgHF8mA/watch?utm_content=DAHD3m29zmY&utm_campaign=designshare&utm_medium=link2&utm_source=uniquelinks&utlId=h685ad4c8f0", enrollUrl: "https://www.canva.com/design/DAHD3m29zmY/lVC08kbRQRHEcrTBgHF8mA/watch?utm_content=DAHD3m29zmY&utm_campaign=designshare&utm_medium=link2&utm_source=uniquelinks&utlId=h685ad4c8f0", access: "free" },
  { title: "Bouncing Ball with Tail — Moho Tutorial", instructor: "TBA", level: "Intermediate", duration: "TBD", desc: "Practice follow-through and overlap by animating a bouncing ball with a tail in Moho.", videoUrl: "https://drive.google.com/file/d/1CDqHpKXvK2GyXGRsoTtweWRBO5IrD8mH/view?ts=69b01be4", enrollUrl: "https://drive.google.com/file/d/1CDqHpKXvK2GyXGRsoTtweWRBO5IrD8mH/view?ts=69b01be4", access: "pro" },
  { title: "oon Boom Fundamentals", instructor: "TBA", level: "Intermediate", duration: "TBD", desc: "Core tools, timelines, and workflows to start animating confidently in Toon Boom.", videoUrl: "https://www.canva.com/design/DAHD39i_yZs/hd3HNHIO-T3poAO-1K3DFQ/watch?utm_content=DAHD39i_yZs&utm_campaign=designshare&utm_medium=link2&utm_source=uniquelinks&utlId=h25e241a9eb", enrollUrl: "https://www.canva.com/design/DAHD39i_yZs/hd3HNHIO-T3poAO-1K3DFQ/watch?utm_content=DAHD39i_yZs&utm_campaign=designshare&utm_medium=link2&utm_source=uniquelinks&utlId=h25e241a9eb", access: "pro" },
];

const ACCESSIBLE: Record<string, string[]> = {
  beginner:     ["Beginner"],
  intermediate: ["Beginner", "Intermediate"],
  advanced:     ["Beginner", "Intermediate", "Advanced"],
};

const DARK = {
  pageBg:    "#222222",
  cardBg:    "#2C2C2C",
  surface:   "#333333",
  border:    "#444444",
  text:      "#FAF3E1",
  textMuted: "#D2C9B8",
  textDim:   "#9E9688",
  accent:    "#FF6D1F",
  accentText:"#222222",
  accentSoft:"rgba(255,109,31,0.10)",
  imgBg:     "#333333",
  inputBg:   "#2C2C2C",
};

const LIGHT = {
  pageBg:    "#FAF3E1",
  cardBg:    "#FFFFFF",
  surface:   "#F5E7C6",
  border:    "#E7DBBD",
  text:      "#222222",
  textMuted: "#555555",
  textDim:   "#9E9688",
  accent:    "#FF6D1F",
  accentText:"#FFFFFF",
  accentSoft:"rgba(255,109,31,0.10)",
  imgBg:     "#F5E7C6",
  inputBg:   "#FFFFFF",
};

const getInitialTheme = (): "dark" | "light" => {
  if (typeof window === "undefined") return "dark";
  const saved = localStorage.getItem("africafx-theme");
  if (saved === "dark" || saved === "light") return saved;
  const attr = document.documentElement.getAttribute("data-theme");
  return attr === "light" ? "light" : "dark";
};

export default function CoursesPage() {
  const [theme, setTheme]       = useState<"dark"|"light">(getInitialTheme);
  const [search, setSearch]     = useState("");
  const [skillLevel, setSkill]  = useState("beginner");
  const [subscriptionTier, setSubscriptionTier] = useState<"free" | "pro" | "team">("free");
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    const obs = new MutationObserver(() => {
      const t = document.documentElement.getAttribute("data-theme") as "dark"|"light";
      if (t) setTheme(t);
    });
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    if (supabase) {
      supabase.auth.getUser().then(async ({ data: { user } }) => {
        setSkill(user?.user_metadata?.skill_level || "beginner");
        if (user?.id) {
          const { data } = await supabase
            .from("profiles")
            .select("subscription_tier")
            .eq("id", user.id)
            .single();
          if (data?.subscription_tier === "pro" || data?.subscription_tier === "team") {
            setSubscriptionTier(data.subscription_tier);
          }
        }
        setLoading(false);
      });
    } else {
      // Small delay to avoid synchronous state update in effect
      const timer = setTimeout(() => setLoading(false), 0);
      return () => {
        obs.disconnect();
        clearTimeout(timer);
      };
    }
    return () => obs.disconnect();
  }, []);

  const T          = theme === "dark" ? DARK : LIGHT;
  const accessible = ACCESSIBLE[skillLevel] || ["Beginner"];
  const filtered   = COURSES.filter(c =>
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.instructor.toLowerCase().includes(search.toLowerCase())
  );
  const hasPro     = subscriptionTier === "pro" || subscriptionTier === "team";
  const isLocked   = (course: Course) => {
    const levelLocked = !accessible.includes(course.level);
    const proLocked = (course.access ?? "free") === "pro" && !hasPro;
    return levelLocked || proLocked;
  };
  const lockNotes  = (course: Course) => {
    const notes: string[] = [];
    if ((course.access ?? "free") === "pro" && !hasPro) notes.push("Pro members only");
    if (!accessible.includes(course.level)) notes.push(`Complete ${skillLevel} first`);
    return notes;
  };

  const levelColor = (l: string) =>
    l === "Beginner"     ? "#4CAF50" :
    l === "Intermediate" ? "#FF8C00" : "#888";

  if (loading) return (
    <div style={{ backgroundColor: "#222222", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: "28px", height: "28px", border: "2px solid #444444", borderTopColor: "#FF6D1F", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
    </div>
  );

  return (
    <div style={{ backgroundColor: T.pageBg, minHeight: "100vh", color: T.text, transition: "background-color 0.3s" }}>

      {/* Header */}
      <div style={{ padding: "3rem 2.5rem 0" }}>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <div style={{ width: "28px", height: "3px", background: "repeating-linear-gradient(90deg,#FF6D1F 0,#FF6D1F 8px,#222222 8px,#222222 16px)", borderRadius: "999px", marginBottom: "1.25rem" }} />
          <h1 style={{ fontFamily: "'Clash Display',sans-serif", fontWeight: 700, fontSize: "2rem", color: T.text, marginBottom: "0.5rem", letterSpacing: "-0.02em" }}>
            Your Courses
          </h1>
          <p style={{ fontSize: "0.875rem", color: T.textMuted, fontFamily: "'Satoshi',sans-serif", lineHeight: 1.6, maxWidth: "400px" }}>
            Courses matched to your level. Complete each stage to unlock the next.
          </p>

          {/* Skill level badge */}
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", marginTop: "1rem", padding: "6px 14px", borderRadius: "8px", backgroundColor: T.surface, border: `1px solid ${T.border}` }}>
            <div style={{ width: "7px", height: "7px", borderRadius: "50%", backgroundColor: levelColor(skillLevel.charAt(0).toUpperCase() + skillLevel.slice(1)) }} />
            <span style={{ fontSize: "0.775rem", fontFamily: "'General Sans',sans-serif", fontWeight: 600, color: T.text }}>
              {skillLevel.charAt(0).toUpperCase() + skillLevel.slice(1)} level
            </span>
            <span style={{ fontSize: "0.68rem", color: T.textDim, fontFamily: "'General Sans',sans-serif" }}>
              · {accessible.join(" + ")} unlocked
            </span>
          </div>
        </motion.div>
      </div>

      {/* Search bar */}
      <div style={{ padding: "2rem 2.5rem 1.5rem", borderBottom: `1px solid ${T.border}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{ position: "relative", flex: 1, maxWidth: "300px" }}>
            <Search style={{ position: "absolute", left: "0.875rem", top: "50%", transform: "translateY(-50%)", width: "14px", height: "14px", color: T.textDim }} />
            <input
              type="text"
              placeholder="Search courses..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: "100%", backgroundColor: T.inputBg, border: `1px solid ${T.border}`, borderRadius: "10px", padding: "0.6rem 2.25rem 0.6rem 2.4rem", color: T.text, fontSize: "0.825rem", outline: "none", fontFamily: "'General Sans',sans-serif" }}
            />
            {search && (
              <button onClick={() => setSearch("")} style={{ position: "absolute", right: "0.875rem", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: T.textDim, display: "flex" }}>
                <X style={{ width: "13px", height: "13px" }} />
              </button>
            )}
          </div>
          <span style={{ fontSize: "0.775rem", color: T.textDim, fontFamily: "'General Sans',sans-serif", marginLeft: "auto" }}>
            {filtered.filter(c => !isLocked(c)).length} available · {filtered.filter(c => isLocked(c)).length} locked
          </span>
        </div>
      </div>

      {/* Course list */}
      <div style={{ padding: "0 2.5rem 3rem" }}>
        {filtered.map((course, i) => {
          const locked = isLocked(course);
          const hasPreview = Boolean(course.videoUrl);
          const canPreview = hasPreview && !locked;
          const thumbnail = (
            <div style={{ width: "96px", height: "68px", borderRadius: "10px", backgroundColor: T.imgBg, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", border: `1px solid ${T.border}`, position: "relative", overflow: "hidden" }}>
              {hasPreview ? (
                <>
                  <div style={{ position: "absolute", inset: 0, background: theme === "dark" ? "linear-gradient(135deg, rgba(255,109,31,0.2), rgba(34,34,34,0.8))" : "linear-gradient(135deg, rgba(255,109,31,0.18), rgba(255,255,255,0.9))" }} />
                  <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <div style={{ width: "34px", height: "34px", borderRadius: "999px", backgroundColor: theme === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)", display: "flex", alignItems: "center", justifyContent: "center", border: `1px solid ${T.border}` }}>
                      <Play style={{ width: "16px", height: "16px", color: T.text }} />
                    </div>
                  </div>
                  <span style={{ position: "absolute", top: "6px", left: "6px", fontSize: "0.55rem", fontFamily: "'General Sans',sans-serif", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: T.text, backgroundColor: theme === "dark" ? "rgba(0,0,0,0.35)" : "rgba(255,255,255,0.7)", padding: "2px 6px", borderRadius: "6px", border: `1px solid ${T.border}` }}>
                    Official preview
                  </span>
                  <span style={{ position: "absolute", bottom: "6px", right: "6px", fontSize: "0.55rem", fontFamily: "'General Sans',sans-serif", fontWeight: 700, color: T.accent, backgroundColor: T.accentSoft, padding: "2px 6px", borderRadius: "6px" }}>
                    Open Drive
                  </span>
                </>
              ) : (
                <Camera style={{ width: "16px", height: "16px", color: T.textDim, opacity: 0.4 }} />
              )}
              {locked && (
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: theme === "dark" ? "rgba(34,34,34,0.85)" : "rgba(250,243,225,0.85)" }}>
                  <Lock style={{ width: "15px", height: "15px", color: T.textDim }} />
                </div>
              )}
            </div>
          );

          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.04 }}
              style={{ display: "flex", alignItems: "center", gap: "1.5rem", padding: "1.5rem 0", borderBottom: `1px solid ${T.border}`, cursor: locked ? "not-allowed" : "default", opacity: locked ? 0.4 : 1, transition: "opacity 0.2s" }}
            >
              {/* Thumbnail */}
              {canPreview ? (
                <a
                  href={course.videoUrl}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`Open ${course.title} preview on Google Drive`}
                  style={{ display: "block", textDecoration: "none" }}
                >
                  {thumbnail}
                </a>
              ) : (
                thumbnail
              )}

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "0.25rem" }}>
                  <span style={{ fontSize: "0.6rem", fontFamily: "'General Sans',sans-serif", fontWeight: 700, color: levelColor(course.level), backgroundColor: `${levelColor(course.level)}18`, padding: "2px 7px", borderRadius: "5px" }}>
                    {course.level}
                  </span>
                  {locked && lockNotes(course).map((note) => (
                    <span key={note} style={{ fontSize: "0.6rem", color: T.textDim, fontFamily: "'General Sans',sans-serif", padding: "2px 7px", borderRadius: "5px", backgroundColor: T.surface }}>
                      {note}
                    </span>
                  ))}
                </div>
                <h3 style={{ fontFamily: "'Cabinet Grotesk',sans-serif", fontWeight: 700, fontSize: "0.95rem", color: T.text, marginBottom: "0.2rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {course.title}
                </h3>
                <p style={{ fontSize: "0.72rem", color: T.textMuted, fontFamily: "'General Sans',sans-serif", marginBottom: "0.2rem" }}>
                  {course.instructor}
                </p>
                <p className="hide-mobile" style={{ fontSize: "0.7rem", color: T.textDim, fontFamily: "'Satoshi',sans-serif", lineHeight: 1.5 }}>
                  {course.desc}
                </p>
              </div>

              {/* Meta */}
              <div className="hide-mobile" style={{ display: "flex", alignItems: "center", gap: "1.5rem", flexShrink: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <Clock style={{ width: "12px", height: "12px", color: T.textDim }} />
                  <span style={{ fontSize: "0.775rem", color: T.textMuted, fontFamily: "'General Sans',sans-serif" }}>{course.duration}</span>
                </div>
              </div>

              {/* Price + button */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.5rem", flexShrink: 0 }}>
                <span style={{ fontFamily: "'General Sans',sans-serif", fontWeight: 600, fontSize: "0.75rem", color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  {(course.access ?? "free") === "pro" ? "Pro members only" : "Included in subscription"}
                </span>
                {locked ? (
                  <button
                    disabled
                    style={{ padding: "0.45rem 1.1rem", borderRadius: "8px", border: `1px solid ${T.border}`, backgroundColor: "transparent", color: T.textDim, fontFamily: "'General Sans',sans-serif", fontWeight: 700, fontSize: "0.775rem", cursor: "not-allowed", transition: "all 0.18s", whiteSpace: "nowrap" }}
                  >
                    Locked
                  </button>
                ) : (
                  <a
                    href={course.enrollUrl || course.videoUrl}
                    target="_blank"
                    rel="noreferrer"
                    style={{ padding: "0.45rem 1.1rem", borderRadius: "8px", border: `1px solid ${T.accent}`, backgroundColor: "transparent", color: T.accent, fontFamily: "'General Sans',sans-serif", fontWeight: 700, fontSize: "0.775rem", cursor: "pointer", transition: "all 0.18s", whiteSpace: "nowrap", textDecoration: "none", display: "inline-flex" }}
                    onMouseEnter={(e) => { const b = e.currentTarget as HTMLAnchorElement; b.style.backgroundColor = T.accent; b.style.color = T.accentText; }}
                    onMouseLeave={(e) => { const b = e.currentTarget as HTMLAnchorElement; b.style.backgroundColor = "transparent"; b.style.color = T.accent; }}
                  >
                    Enrol
                  </a>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

    </div>
  );
}

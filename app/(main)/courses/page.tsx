"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Clock, BookOpen, Star, Camera, X, Lock } from "lucide-react";
import { supabase } from "@/lib/supabase";

const COURSES = [
  {
    title:      "Character Design Fundamentals",
    instructor: "Kwame Mensah",
    level:      "Beginner",
    duration:   "4h 30m",
    lessons:    12,
    price:      "Free",
    rating:     4.8,
    desc:       "Master the core principles of designing compelling characters for animation.",
  },
  {
    title:      "Storyboarding & Animatics",
    instructor: "Amara Diallo",
    level:      "Beginner",
    duration:   "3h 45m",
    lessons:    10,
    price:      "Free",
    rating:     4.7,
    desc:       "Learn how to turn ideas into visual sequences that studios can produce.",
  },
  {
    title:      "Motion Graphics & After Effects",
    instructor: "Kofi Asante",
    level:      "Intermediate",
    duration:   "6h 15m",
    lessons:    18,
    price:      "$49",
    rating:     4.9,
    desc:       "Create professional motion graphics used in ads, intros and explainer videos.",
  },
  {
    title:      "3D Modelling & Rigging",
    instructor: "Ngozi Okafor",
    level:      "Intermediate",
    duration:   "8h 20m",
    lessons:    24,
    price:      "$79",
    rating:     4.8,
    desc:       "Industry-standard Blender and Maya skills every studio expects animators to have.",
  },
  {
    title:      "Lip Sync & Dialogue Animation",
    instructor: "Fatima Al-Hassan",
    level:      "Intermediate",
    duration:   "5h 00m",
    lessons:    15,
    price:      "$59",
    rating:     4.7,
    desc:       "The essential skill for character animation — bring dialogue to life.",
  },
  {
    title:      "Compositing & VFX",
    instructor: "Seun Adeyemi",
    level:      "Advanced",
    duration:   "7h 10m",
    lessons:    20,
    price:      "$69",
    rating:     4.8,
    desc:       "Master finishing and post-production techniques used in professional studios.",
  },
  {
    title:      "Portfolio Building for Studios",
    instructor: "Ama Owusu",
    level:      "Advanced",
    duration:   "2h 50m",
    lessons:    8,
    price:      "Free",
    rating:     4.9,
    desc:       "How to present your work so studios notice you and want to hire you.",
  },
];

/* Which levels a user can access based on their skill */
const ACCESSIBLE_LEVELS: Record<string, string[]> = {
  beginner:     ["Beginner"],
  intermediate: ["Beginner", "Intermediate"],
  advanced:     ["Beginner", "Intermediate", "Advanced"],
};

const LEVEL_LABELS: Record<string, string[]> = {
  beginner:     ["Beginner"],
  intermediate: ["Beginner", "Intermediate"],
  advanced:     ["All Levels"],
};

const DARK = {
  pageBg:    "#0D0905",
  cardBg:    "#140C04",
  border:    "#2A1E0A",
  inputBg:   "#140C04",
  text:      "#F5ECD7",
  textMuted: "#A89070",
  textDim:   "#6B5A40",
  accent:    "#E8A020",
  imgBg:     "#0D0905",
  pillBg:    "#140C04",
  lockBg:    "rgba(13,9,5,0.85)",
};

const LIGHT = {
  pageBg:    "#FAFAF8",
  cardBg:    "#FFFFFF",
  border:    "#EBEBEB",
  inputBg:   "#FFFFFF",
  text:      "#111111",
  textMuted: "#666666",
  textDim:   "#999999",
  accent:    "#E8520C",
  imgBg:     "#F5F0E8",
  pillBg:    "#F5F0E8",
  lockBg:    "rgba(250,250,248,0.90)",
};

export default function CoursesPage() {
  const [theme, setTheme]       = useState<"dark"|"light">("dark");
  const [search, setSearch]     = useState("");
  const [skillLevel, setSkillLevel] = useState<string>("beginner");
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("africafx-theme") as "dark"|"light";
    if (saved) setTheme(saved);
    const obs = new MutationObserver(() => {
      const t = document.documentElement.getAttribute("data-theme") as "dark"|"light";
      if (t) setTheme(t);
    });
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

    /* Get user skill level from Supabase */
    supabase.auth.getUser().then(({ data: { user } }) => {
      const level = user?.user_metadata?.skill_level || "beginner";
      setSkillLevel(level);
      setLoading(false);
    });

    return () => obs.disconnect();
  }, []);

  const T = theme === "dark" ? DARK : LIGHT;
  const accessible = ACCESSIBLE_LEVELS[skillLevel] || ["Beginner"];

  const filtered = COURSES.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.instructor.toLowerCase().includes(search.toLowerCase())
  );

  const levelColor = (l: string) =>
    l === "Beginner"     ? "#4CAF50" :
    l === "Intermediate" ? "#E8A020" : "#C1440E";

  const isLocked = (courseLevel: string) => !accessible.includes(courseLevel);

  if (loading) {
    return (
      <div style={{ backgroundColor: DARK.pageBg, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: "32px", height: "32px", border: "2px solid #3D2E10", borderTopColor: "#E8A020", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: T.pageBg, minHeight: "100vh", color: T.text, transition: "background-color 0.3s" }}>

      {/* ── Header ── */}
      <div style={{ padding: "3rem 2.5rem 0" }}>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>

          <div style={{ width: "32px", height: "3px", background: "repeating-linear-gradient(90deg,#E8A020 0,#E8A020 8px,#C1440E 8px,#C1440E 16px)", borderRadius: "999px", marginBottom: "1.25rem" }} />

          <h1 style={{ fontFamily: "'Clash Display',sans-serif", fontWeight: 700, fontSize: "2rem", color: T.text, marginBottom: "0.5rem", letterSpacing: "-0.02em" }}>
            Your Courses
          </h1>
          <p style={{ fontSize: "0.875rem", color: T.textMuted, fontFamily: "'Satoshi',sans-serif", lineHeight: 1.6, maxWidth: "420px" }}>
            Courses matched to your skill level. Complete each level to unlock the next.
          </p>

          {/* Skill level badge */}
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", marginTop: "1rem", padding: "6px 14px", borderRadius: "999px", backgroundColor: T.pillBg, border: `1px solid ${T.border}` }}>
            <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: levelColor(skillLevel.charAt(0).toUpperCase() + skillLevel.slice(1)) }} />
            <span style={{ fontSize: "0.775rem", fontFamily: "'General Sans',sans-serif", fontWeight: 600, color: T.text }}>
              Your level: {skillLevel.charAt(0).toUpperCase() + skillLevel.slice(1)}
            </span>
            <span style={{ fontSize: "0.68rem", color: T.textDim, fontFamily: "'General Sans',sans-serif" }}>
              — {LEVEL_LABELS[skillLevel]?.join(" + ")} unlocked
            </span>
          </div>
        </motion.div>
      </div>

      {/* ── Search bar ── */}
      <div style={{ padding: "2rem 2.5rem 1.5rem", borderBottom: `1px solid ${T.border}` }}>
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
          <div style={{ position: "relative", flex: 1, maxWidth: "320px" }}>
            <Search style={{ position: "absolute", left: "0.875rem", top: "50%", transform: "translateY(-50%)", width: "14px", height: "14px", color: T.textDim }} />
            <input
              type="text"
              placeholder="Search courses..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: "100%", backgroundColor: T.inputBg, border: `1px solid ${T.border}`, borderRadius: "10px", padding: "0.625rem 2.25rem 0.625rem 2.4rem", color: T.text, fontSize: "0.825rem", outline: "none", fontFamily: "'General Sans',sans-serif" }}
            />
            {search && (
              <button onClick={() => setSearch("")} style={{ position: "absolute", right: "0.875rem", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: T.textDim, display: "flex" }}>
                <X style={{ width: "13px", height: "13px" }} />
              </button>
            )}
          </div>
          <span style={{ fontSize: "0.775rem", color: T.textDim, fontFamily: "'General Sans',sans-serif", marginLeft: "auto" }}>
            {filtered.filter(c => !isLocked(c.level)).length} available · {filtered.filter(c => isLocked(c.level)).length} locked
          </span>
        </div>
      </div>

      {/* ── Course list ── */}
      <div style={{ padding: "0 2.5rem 3rem" }}>
        {filtered.map((course, i) => {
          const locked = isLocked(course.level);
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: i * 0.05 }}
              style={{
                display: "flex", alignItems: "center", gap: "1.5rem",
                padding: "1.5rem 0",
                borderBottom: `1px solid ${T.border}`,
                cursor: locked ? "not-allowed" : "pointer",
                opacity: locked ? 0.45 : 1,
                transition: "opacity 0.2s",
                position: "relative",
              }}
            >
              {/* Thumbnail */}
              <div style={{ width: "100px", height: "70px", borderRadius: "10px", backgroundColor: T.imgBg, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", border: `1px solid ${T.border}`, position: "relative", overflow: "hidden" }}>
                <Camera style={{ width: "18px", height: "18px", color: T.textDim, opacity: 0.4 }} />
                {locked && (
                  <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: T.lockBg }}>
                    <Lock style={{ width: "16px", height: "16px", color: T.textDim }} />
                  </div>
                )}
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.3rem" }}>
                  <span style={{ fontSize: "0.6rem", fontFamily: "'General Sans',sans-serif", fontWeight: 700, color: levelColor(course.level), backgroundColor: `${levelColor(course.level)}18`, padding: "2px 7px", borderRadius: "999px" }}>
                    {course.level}
                  </span>
                  {locked && (
                    <span style={{ fontSize: "0.6rem", fontFamily: "'General Sans',sans-serif", fontWeight: 600, color: T.textDim, padding: "2px 7px", borderRadius: "999px", backgroundColor: T.pillBg, border: `1px solid ${T.border}` }}>
                      Complete {skillLevel} first
                    </span>
                  )}
                </div>
                <h3 style={{ fontFamily: "'Cabinet Grotesk',sans-serif", fontWeight: 700, fontSize: "0.95rem", color: T.text, marginBottom: "0.25rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {course.title}
                </h3>
                <p style={{ fontSize: "0.72rem", color: T.textMuted, fontFamily: "'General Sans',sans-serif", marginBottom: "0.25rem" }}>
                  {course.instructor}
                </p>
                <p className="hide-mobile" style={{ fontSize: "0.72rem", color: T.textDim, fontFamily: "'Satoshi',sans-serif", lineHeight: 1.5 }}>
                  {course.desc}
                </p>
              </div>

              {/* Meta */}
              <div className="hide-mobile" style={{ display: "flex", alignItems: "center", gap: "1.5rem", flexShrink: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <Star style={{ width: "12px", height: "12px", color: "#E8A020" }} />
                  <span style={{ fontSize: "0.775rem", fontFamily: "'General Sans',sans-serif", fontWeight: 600, color: T.text }}>{course.rating}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <Clock style={{ width: "12px", height: "12px", color: T.textDim }} />
                  <span style={{ fontSize: "0.775rem", color: T.textMuted, fontFamily: "'General Sans',sans-serif" }}>{course.duration}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <BookOpen style={{ width: "12px", height: "12px", color: T.textDim }} />
                  <span style={{ fontSize: "0.775rem", color: T.textMuted, fontFamily: "'General Sans',sans-serif" }}>{course.lessons} lessons</span>
                </div>
              </div>

              {/* Price + button */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.5rem", flexShrink: 0 }}>
                <span style={{ fontFamily: "'Clash Display',sans-serif", fontWeight: 700, fontSize: "1rem", color: course.price === "Free" ? "#4CAF50" : T.text }}>
                  {course.price}
                </span>
                <button
                  disabled={locked}
                  style={{ padding: "0.45rem 1.1rem", borderRadius: "8px", border: `1px solid ${locked ? T.border : T.accent}`, backgroundColor: "transparent", color: locked ? T.textDim : T.accent, fontFamily: "'General Sans',sans-serif", fontWeight: 700, fontSize: "0.775rem", cursor: locked ? "not-allowed" : "pointer", transition: "all 0.18s", whiteSpace: "nowrap" }}
                  onMouseEnter={(e) => { if (!locked) { (e.currentTarget as HTMLButtonElement).style.backgroundColor = T.accent; (e.currentTarget as HTMLButtonElement).style.color = "#FFFFFF"; }}}
                  onMouseLeave={(e) => { if (!locked) { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent"; (e.currentTarget as HTMLButtonElement).style.color = T.accent; }}}
                >
                  {locked ? "Locked" : "Enrol"}
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      <style jsx global>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
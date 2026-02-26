"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Clock, BookOpen, Star, Camera, X, Lock } from "lucide-react";
import { supabase } from "@/lib/supabase";

const COURSES = [
  { title: "Character Design Fundamentals", instructor: "Kwame Mensah",     level: "Beginner",     duration: "4h 30m", lessons: 12, price: "Free", rating: 4.8, desc: "Master the core principles of designing compelling characters for animation." },
  { title: "Storyboarding & Animatics",     instructor: "Amara Diallo",     level: "Beginner",     duration: "3h 45m", lessons: 10, price: "Free", rating: 4.7, desc: "Turn ideas into visual sequences that studios can produce." },
  { title: "Motion Graphics & After Effects",instructor: "Kofi Asante",     level: "Intermediate", duration: "6h 15m", lessons: 18, price: "$49",  rating: 4.9, desc: "Create professional motion graphics for ads, intros and explainer videos." },
  { title: "3D Modelling & Rigging",        instructor: "Ngozi Okafor",     level: "Intermediate", duration: "8h 20m", lessons: 24, price: "$79",  rating: 4.8, desc: "Industry-standard Blender and Maya skills every studio expects." },
  { title: "Lip Sync & Dialogue Animation", instructor: "Fatima Al-Hassan", level: "Intermediate", duration: "5h 00m", lessons: 15, price: "$59",  rating: 4.7, desc: "The essential skill for character animation — bring dialogue to life." },
  { title: "Compositing & VFX",             instructor: "Seun Adeyemi",     level: "Advanced",     duration: "7h 10m", lessons: 20, price: "$69",  rating: 4.8, desc: "Finishing and post-production techniques used in professional studios." },
  { title: "Portfolio Building for Studios",instructor: "Ama Owusu",        level: "Advanced",     duration: "2h 50m", lessons: 8,  price: "Free", rating: 4.9, desc: "Present your work so studios notice you and want to hire you." },
];

const ACCESSIBLE: Record<string, string[]> = {
  beginner:     ["Beginner"],
  intermediate: ["Beginner", "Intermediate"],
  advanced:     ["Beginner", "Intermediate", "Advanced"],
};

const DARK = {
  pageBg:    "#1C1C1C",
  cardBg:    "#2C2926",
  surface:   "#252320",
  border:    "#3A3530",
  text:      "#FAF8F0",
  textMuted: "#C8C4BC",
  textDim:   "#8A8680",
  accent:    "#FF8C00",
  accentText:"#1C1C1C",
  accentSoft:"rgba(255,140,0,0.10)",
  imgBg:     "#252320",
  inputBg:   "#2C2926",
};

const LIGHT = {
  pageBg:    "#FAF8F0",
  cardBg:    "#FFFFFF",
  surface:   "#EDE5CC",
  border:    "#E0D8C3",
  text:      "#1C1C1C",
  textMuted: "#4A4744",
  textDim:   "#7A7570",
  accent:    "#FF8C00",
  accentText:"#FFFFFF",
  accentSoft:"rgba(255,140,0,0.10)",
  imgBg:     "#EDE5CC",
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
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    const obs = new MutationObserver(() => {
      const t = document.documentElement.getAttribute("data-theme") as "dark"|"light";
      if (t) setTheme(t);
    });
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    supabase.auth.getUser().then(({ data: { user } }) => {
      setSkill(user?.user_metadata?.skill_level || "beginner");
      setLoading(false);
    });
    return () => obs.disconnect();
  }, []);

  const T          = theme === "dark" ? DARK : LIGHT;
  const accessible = ACCESSIBLE[skillLevel] || ["Beginner"];
  const filtered   = COURSES.filter(c =>
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.instructor.toLowerCase().includes(search.toLowerCase())
  );
  const isLocked   = (level: string) => !accessible.includes(level);

  const levelColor = (l: string) =>
    l === "Beginner"     ? "#4CAF50" :
    l === "Intermediate" ? "#FF8C00" : "#888";

  if (loading) return (
    <div style={{ backgroundColor: "#1C1C1C", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: "28px", height: "28px", border: "2px solid #3A3530", borderTopColor: "#FF8C00", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
    </div>
  );

  return (
    <div style={{ backgroundColor: T.pageBg, minHeight: "100vh", color: T.text, transition: "background-color 0.3s" }}>

      {/* Header */}
      <div style={{ padding: "3rem 2.5rem 0" }}>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <div style={{ width: "28px", height: "3px", background: "repeating-linear-gradient(90deg,#FF8C00 0,#FF8C00 8px,#1C1C1C 8px,#1C1C1C 16px)", borderRadius: "999px", marginBottom: "1.25rem" }} />
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
            {filtered.filter(c => !isLocked(c.level)).length} available · {filtered.filter(c => isLocked(c.level)).length} locked
          </span>
        </div>
      </div>

      {/* Course list */}
      <div style={{ padding: "0 2.5rem 3rem" }}>
        {filtered.map((course, i) => {
          const locked = isLocked(course.level);
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.04 }}
              style={{ display: "flex", alignItems: "center", gap: "1.5rem", padding: "1.5rem 0", borderBottom: `1px solid ${T.border}`, cursor: locked ? "not-allowed" : "pointer", opacity: locked ? 0.4 : 1, transition: "opacity 0.2s" }}
            >
              {/* Thumbnail */}
              <div style={{ width: "96px", height: "68px", borderRadius: "10px", backgroundColor: T.imgBg, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", border: `1px solid ${T.border}`, position: "relative", overflow: "hidden" }}>
                <Camera style={{ width: "16px", height: "16px", color: T.textDim, opacity: 0.4 }} />
                {locked && (
                  <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: theme === "dark" ? "rgba(28,28,28,0.85)" : "rgba(250,248,240,0.85)" }}>
                    <Lock style={{ width: "15px", height: "15px", color: T.textDim }} />
                  </div>
                )}
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "0.25rem" }}>
                  <span style={{ fontSize: "0.6rem", fontFamily: "'General Sans',sans-serif", fontWeight: 700, color: levelColor(course.level), backgroundColor: `${levelColor(course.level)}18`, padding: "2px 7px", borderRadius: "5px" }}>
                    {course.level}
                  </span>
                  {locked && (
                    <span style={{ fontSize: "0.6rem", color: T.textDim, fontFamily: "'General Sans',sans-serif", padding: "2px 7px", borderRadius: "5px", backgroundColor: T.surface }}>
                      Complete {skillLevel} first
                    </span>
                  )}
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
                  <Star style={{ width: "12px", height: "12px", color: T.accent }} />
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
                  onMouseEnter={(e) => { if (!locked) { const b = e.currentTarget as HTMLButtonElement; b.style.backgroundColor = T.accent; b.style.color = T.accentText; }}}
                  onMouseLeave={(e) => { if (!locked) { const b = e.currentTarget as HTMLButtonElement; b.style.backgroundColor = "transparent"; b.style.color = T.accent; }}}
                >
                  {locked ? "Locked" : "Enrol"}
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

    </div>
  );
}

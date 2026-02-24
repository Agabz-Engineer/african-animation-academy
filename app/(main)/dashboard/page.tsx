"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  BookOpen, Calendar, Users, Bell, Trophy,
  Flame, Clock, ChevronRight, Camera, Play,
  TrendingUp, Star, Filter, Search
} from "lucide-react";
import { supabase } from "@/lib/supabase";

const FILTER_TABS = ["Hot", "New", "Event"];

const SHOWCASE_CARDS = [
  { title: "Character Design", category: "Colorimetry", price: "99",  tag: "Hot"   },
  { title: "Background Art",   category: "Background",  price: "199", tag: "New"   },
  { title: "Texture: Afro",    category: "Texturing",   price: "249", tag: "Hot"   },
  { title: "Clothing Design",  category: "Clothing",    price: "149", tag: "Event" },
];

/* ─── Colour tokens ─────────────────────────────────────────
   LIGHT: Animated Collective style — cream bg, charcoal text,
          orange accents, white cards
   DARK:  Africa Fx style — deep brown bg, warm text, gold accents
──────────────────────────────────────────────────────────── */
const LIGHT = {
  pageBg:        "#F5E6C8",   /* warm cream from mockup */
  topbarBg:      "rgba(245,230,200,0.97)",
  cardBg:        "#FFFFFF",
  cardBorder:    "#E8D5B0",
  inputBg:       "#FFFFFF",
  inputBorder:   "#D4B896",
  text:          "#1A0F00",   /* deep charcoal */
  textMuted:     "#6B4F2A",
  textDim:       "#A0845C",
  accent:        "#E8520C",   /* bright orange from mockup */
  accentSoft:    "rgba(232,82,12,0.10)",
  accentBorder:  "rgba(232,82,12,0.25)",
  imgPlaceholder:"#EDD9B8",
  statBg:        "#FFF8F0",
  tagHot:        { color: "#E8520C", bg: "rgba(232,82,12,0.12)" },
  tagNew:        { color: "#2E8B57", bg: "rgba(46,139,87,0.12)"  },
  tagEvent:      { color: "#C1440E", bg: "rgba(193,68,14,0.12)"  },
};

const DARK = {
  pageBg:        "#0D0905",
  topbarBg:      "rgba(13,9,5,0.97)",
  cardBg:        "rgba(26,16,6,0.90)",
  cardBorder:    "#3D2E10",
  inputBg:       "rgba(34,24,8,0.85)",
  inputBorder:   "#3D2E10",
  text:          "#F5ECD7",
  textMuted:     "#A89070",
  textDim:       "#6B5A40",
  accent:        "#E8A020",   /* Kente Gold */
  accentSoft:    "rgba(232,160,32,0.10)",
  accentBorder:  "rgba(232,160,32,0.25)",
  imgPlaceholder:"rgba(13,9,5,0.65)",
  statBg:        "rgba(26,16,6,0.90)",
  tagHot:        { color: "#E8A020", bg: "rgba(232,160,32,0.15)" },
  tagNew:        { color: "#4CAF50", bg: "rgba(76,175,80,0.15)"  },
  tagEvent:      { color: "#C1440E", bg: "rgba(193,68,14,0.15)"  },
};

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("Hot");
  const [theme, setTheme]         = useState<"dark"|"light">("dark");
  const [user, setUser]           = useState<{ email?: string; user_metadata?: { full_name?: string } } | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("africafx-theme") as "dark"|"light";
    if (saved) setTheme(saved);
    const obs = new MutationObserver(() => {
      const t = document.documentElement.getAttribute("data-theme") as "dark"|"light";
      if (t) setTheme(t);
    });
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
    return () => obs.disconnect();
  }, []);

  const T = theme === "dark" ? DARK : LIGHT;
  const firstName = user?.user_metadata?.full_name?.split(" ")[0]
                 || user?.email?.split("@")[0]
                 || "Creative";

  const tagColor = (tag: string) =>
    tag === "Hot" ? T.tagHot : tag === "New" ? T.tagNew : T.tagEvent;

  /* ── gradient text helper for light mode uses orange, dark uses gold ── */
  const accentGradient = theme === "light"
    ? "linear-gradient(135deg,#E8520C,#C1440E)"
    : "linear-gradient(135deg,#E8A020,#C1440E)";

  return (
    <div style={{ backgroundColor: T.pageBg, minHeight: "100vh", color: T.text, transition: "background-color 0.3s,color 0.3s" }}>

      {/* ══════════════════════════════════════
          TOP BAR — desktop only
      ══════════════════════════════════════ */}
      <div className="hide-mobile" style={{
        position: "sticky", top: 0, zIndex: 9,
        backgroundColor: T.topbarBg,
        backdropFilter: "blur(12px)",
        borderBottom: `2px solid ${theme === "light" ? "#E8520C" : "#3D2E10"}`,
        padding: "0.875rem 2rem",
        display: "flex", alignItems: "center", gap: "1rem"
      }}>
        {/* Brand */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginRight: "auto" }}>
          <div style={{ width: "3px", height: "32px", background: accentGradient, borderRadius: "999px" }} />
          <div>
            <div style={{ display: "flex", gap: "5px", alignItems: "baseline" }}>
              <span style={{ fontFamily: "'Clash Display',sans-serif", fontWeight: 700, fontSize: "1rem", color: T.accent }}>Animated</span>
              <span style={{ fontFamily: "'Clash Display',sans-serif", fontWeight: 700, fontSize: "1rem", color: T.text }}>Collective</span>
            </div>
            <div style={{ fontSize: "0.6rem", color: T.textDim, fontFamily: "'General Sans',sans-serif" }}>Your art out identity</div>
          </div>
        </div>

        {/* Search */}
        <div style={{ position: "relative", flex: 1, maxWidth: "360px" }}>
          <Search style={{ position: "absolute", left: "0.875rem", top: "50%", transform: "translateY(-50%)", width: "14px", height: "14px", color: T.textDim }} />
          <input
            type="text"
            placeholder="Search courses, events, artists..."
            style={{
              width: "100%",
              backgroundColor: T.inputBg,
              border: `1.5px solid ${T.inputBorder}`,
              borderRadius: "999px",
              padding: "0.5rem 1rem 0.5rem 2.4rem",
              color: T.text, fontSize: "0.8rem", outline: "none",
              fontFamily: "'General Sans',sans-serif",
              transition: "border-color 0.2s"
            }}
          />
        </div>

        {/* Bell */}
        <button style={{ width: "36px", height: "36px", borderRadius: "10px", backgroundColor: T.inputBg, border: `1.5px solid ${T.inputBorder}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", position: "relative" }}>
          <Bell style={{ width: "15px", height: "15px", color: T.textMuted }} />
          <div style={{ position: "absolute", top: "6px", right: "6px", width: "7px", height: "7px", borderRadius: "50%", background: accentGradient }} />
        </button>

        {/* Streak + Rank pills */}
        <div style={{ display: "flex", gap: "0.4rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "4px", padding: "5px 12px", borderRadius: "999px", backgroundColor: T.accentSoft, border: `1px solid ${T.accentBorder}` }}>
            <Flame style={{ width: "12px", height: "12px", color: T.accent }} />
            <span style={{ fontSize: "0.72rem", color: T.accent, fontFamily: "'General Sans',sans-serif", fontWeight: 700 }}>3 day streak</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "4px", padding: "5px 12px", borderRadius: "999px", backgroundColor: "rgba(193,68,14,0.10)", border: "1px solid rgba(193,68,14,0.25)" }}>
            <Trophy style={{ width: "12px", height: "12px", color: "#C1440E" }} />
            <span style={{ fontSize: "0.72rem", color: "#C1440E", fontFamily: "'General Sans',sans-serif", fontWeight: 700 }}>Rank #42</span>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════
          PAGE CONTENT
      ══════════════════════════════════════ */}
      <div className="dash-padding" style={{ padding: "1.75rem 2rem" }}>

        {/* Welcome */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} style={{ marginBottom: "1.5rem" }}>
          <h1 style={{ fontFamily: "'Clash Display',sans-serif", fontWeight: 700, fontSize: "1.6rem", color: T.text, marginBottom: "3px" }}>
            Welcome back,{" "}
            <span style={{ background: accentGradient, WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              {firstName}
            </span>{" "}👋
          </h1>
          <p style={{ fontSize: "0.8rem", color: T.textMuted, fontFamily: "'General Sans',sans-serif" }}>
            Here is what is happening in your creative world today
          </p>
        </motion.div>

        {/* Filter tabs */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.25rem", flexWrap: "wrap" }}>
          {FILTER_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: "0.4rem 1.25rem", borderRadius: "999px",
                border: activeTab === tab ? "none" : `1.5px solid ${T.cardBorder}`,
                cursor: "pointer",
                fontFamily: "'General Sans',sans-serif", fontWeight: 700, fontSize: "0.825rem",
                transition: "all 0.2s",
                backgroundColor: activeTab === tab ? T.accent : T.cardBg,
                color: activeTab === tab ? "#FFFFFF" : T.textMuted,
                boxShadow: activeTab === tab ? `0 4px 14px ${T.accentBorder}` : "none",
              }}
            >
              {tab}
            </button>
          ))}
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "5px", color: T.textDim, fontSize: "0.75rem", fontFamily: "'General Sans',sans-serif", cursor: "pointer" }}>
            <Filter style={{ width: "13px", height: "13px" }} /> Filter
          </div>
        </div>

        {/* Hero banner placeholder */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="dash-hero"
          style={{
            width: "100%", height: "230px", borderRadius: "20px",
            backgroundColor: T.imgPlaceholder,
            border: `2px dashed ${theme === "light" ? "#D4B896" : "rgba(232,160,32,0.22)"}`,
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            marginBottom: "1.25rem", position: "relative", overflow: "hidden", cursor: "pointer"
          }}
        >
          {/* Corner markers */}
          {([[true,true],[true,false],[false,true],[false,false]] as [boolean,boolean][]).map(([top,left],i) => (
            <div key={i} style={{
              position: "absolute",
              top: top ? "12px" : "auto", bottom: top ? "auto" : "12px",
              left: left ? "12px" : "auto", right: left ? "auto" : "12px",
              width: "18px", height: "18px",
              borderTop:    top  ? `2px solid ${T.accent}` : "none",
              borderBottom: top  ? "none" : `2px solid ${T.accent}`,
              borderLeft:   left ? `2px solid ${T.accent}` : "none",
              borderRight:  left ? "none" : `2px solid ${T.accent}`,
            }} />
          ))}

          <div style={{ width: "52px", height: "52px", borderRadius: "14px", backgroundColor: T.accentSoft, border: `1px solid ${T.accentBorder}`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "0.75rem" }}>
            <Camera style={{ width: "22px", height: "22px", color: T.accent }} />
          </div>
          <p style={{ fontFamily: "'Cabinet Grotesk',sans-serif", fontWeight: 700, fontSize: "0.95rem", color: T.text, marginBottom: "3px" }}>Featured Banner</p>
          <p style={{ fontSize: "0.72rem", color: T.textDim, fontFamily: "'General Sans',sans-serif" }}>Recommended: 1200 × 400px</p>

          {/* Play button */}
          <div style={{ position: "absolute", right: "1.25rem", bottom: "1.25rem", width: "40px", height: "40px", borderRadius: "50%", background: accentGradient, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 12px rgba(0,0,0,0.2)" }}>
            <Play style={{ width: "16px", height: "16px", color: "#FFFFFF", marginLeft: "2px" }} />
          </div>

          {/* Date range */}
          <div style={{ position: "absolute", left: "1.25rem", bottom: "1.25rem", display: "flex", alignItems: "center", gap: "6px" }}>
            {["25 July 2025", "29 July 2025"].map((d, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "4px", padding: "5px 10px", borderRadius: "7px", backgroundColor: theme === "light" ? "rgba(255,255,255,0.85)" : "rgba(13,9,5,0.75)", border: `1px solid ${T.cardBorder}`, fontSize: "0.68rem", color: T.textMuted, fontFamily: "'General Sans',sans-serif" }}>
                <Calendar style={{ width: "10px", height: "10px" }} />{d}
              </div>
            ))}
          </div>

          {/* Pagination dots */}
          <div style={{ position: "absolute", right: "1.25rem", top: "1.25rem", display: "flex", gap: "4px" }}>
            {[1,2,3].map((n) => (
              <div key={n} style={{ width: n===2?"18px":"7px", height: "7px", borderRadius: "999px", backgroundColor: n===2 ? T.accent : T.cardBorder, transition: "all 0.3s" }} />
            ))}
          </div>
        </motion.div>

        {/* ── Card grid ── */}
        <div className="dash-grid-4" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "1rem" }}>
          {SHOWCASE_CARDS.map((card, i) => {
            const ts = tagColor(card.tag);
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.07 }}
                whileHover={{ y: -5, boxShadow: theme === "light" ? "0 8px 24px rgba(232,82,12,0.15)" : "0 8px 24px rgba(232,160,32,0.15)" }}
                style={{
                  backgroundColor: T.cardBg,
                  border: `1.5px solid ${T.cardBorder}`,
                  borderRadius: "16px", overflow: "hidden",
                  cursor: "pointer", transition: "all 0.2s",
                }}
              >
                {/* Image placeholder */}
                <div style={{ width: "100%", height: "145px", backgroundColor: T.imgPlaceholder, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", position: "relative" }}>
                  <Camera style={{ width: "22px", height: "22px", color: theme === "light" ? "rgba(232,82,12,0.35)" : "rgba(232,160,32,0.35)", marginBottom: "5px" }} />
                  <span style={{ fontSize: "0.6rem", color: T.textDim, fontFamily: "'General Sans',sans-serif" }}>400 × 290px</span>
                  <div style={{ position: "absolute", top: "8px", left: "8px", padding: "2px 8px", borderRadius: "999px", fontSize: "0.6rem", fontFamily: "'General Sans',sans-serif", fontWeight: 700, backgroundColor: ts.bg, color: ts.color }}>
                    {card.tag}
                  </div>
                </div>

                {/* Card info */}
                <div style={{ padding: "0.75rem" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
                    <span style={{ fontFamily: "'General Sans',sans-serif", fontWeight: 700, fontSize: "0.8rem", color: T.text }}>{card.title}</span>
                    <Star style={{ width: "13px", height: "13px", color: T.accent, flexShrink: 0 }} />
                  </div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: "0.68rem", color: T.textDim, fontFamily: "'General Sans',sans-serif" }}>{card.category}</span>
                    <span style={{ fontFamily: "'Clash Display',sans-serif", fontWeight: 700, fontSize: "0.85rem", color: T.accent }}>${card.price}</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* ── Bottom row ── */}
        <div className="dash-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginTop: "1.1rem" }}>

          {/* Continue Learning */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.35 }}
            style={{ backgroundColor: T.cardBg, border: `1.5px solid ${T.cardBorder}`, borderRadius: "16px", padding: "1.1rem" }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.875rem" }}>
              <h3 style={{ fontFamily: "'Cabinet Grotesk',sans-serif", fontWeight: 700, fontSize: "0.875rem", color: T.text }}>Continue Learning</h3>
              <Link href="/courses" style={{ display: "flex", alignItems: "center", gap: "3px", fontSize: "0.7rem", color: T.accent, textDecoration: "none", fontFamily: "'General Sans',sans-serif", fontWeight: 600 }}>
                View all <ChevronRight style={{ width: "11px", height: "11px" }} />
              </Link>
            </div>
            <div style={{ width: "100%", height: "90px", borderRadius: "12px", backgroundColor: T.imgPlaceholder, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "0.75rem" }}>
              <Camera style={{ width: "18px", height: "18px", color: theme === "light" ? "rgba(232,82,12,0.30)" : "rgba(232,160,32,0.28)" }} />
            </div>
            <p style={{ fontFamily: "'General Sans',sans-serif", fontWeight: 600, fontSize: "0.8rem", color: T.text, marginBottom: "4px" }}>Enrol in a course to start</p>
            <div style={{ height: "4px", borderRadius: "999px", backgroundColor: T.cardBorder, marginBottom: "4px" }}>
              <div style={{ width: "0%", height: "100%", borderRadius: "999px", background: accentGradient }} />
            </div>
            <p style={{ fontSize: "0.63rem", color: T.textDim, fontFamily: "'General Sans',sans-serif" }}>0% complete</p>
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.45 }}
            style={{ backgroundColor: T.cardBg, border: `1.5px solid ${T.cardBorder}`, borderRadius: "16px", padding: "1.1rem" }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.875rem" }}>
              <h3 style={{ fontFamily: "'Cabinet Grotesk',sans-serif", fontWeight: 700, fontSize: "0.875rem", color: T.text }}>Recent Activity</h3>
              <TrendingUp style={{ width: "15px", height: "15px", color: T.accent }} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem" }}>
              {[
                { text: "New challenge: Character of the Month", time: "2h ago",  icon: Trophy },
                { text: "New lesson by Kwame Mensah",           time: "5h ago",  icon: Play },
                { text: "Your post got 3 replies",              time: "1d ago",  icon: Users },
                { text: "Weekly streak milestone reached!",     time: "2d ago",  icon: Flame },
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "0.65rem" }}>
                  <div style={{ width: "26px", height: "26px", borderRadius: "8px", backgroundColor: T.accentSoft, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <item.icon style={{ width: "11px", height: "11px", color: T.accent }} />
                  </div>
                  <div>
                    <p style={{ fontSize: "0.72rem", color: T.text, fontFamily: "'Satoshi',sans-serif", lineHeight: 1.4 }}>{item.text}</p>
                    <p style={{ fontSize: "0.62rem", color: T.textDim, fontFamily: "'General Sans',sans-serif", marginTop: "1px" }}>{item.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* ── Stats row ── */}
        <div className="dash-grid-stats" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "1rem", marginTop: "1.1rem" }}>
          {[
            { label: "Courses Enrolled", value: "0",   icon: BookOpen, color: T.accent },
            { label: "Lessons Done",     value: "0",   icon: Clock,    color: "#C1440E" },
            { label: "Day Streak",       value: "3",   icon: Flame,    color: "#D4A853" },
            { label: "Community Rank",   value: "#42", icon: Trophy,   color: T.accent },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.55 + i * 0.05 }}
              style={{ backgroundColor: T.cardBg, border: `1.5px solid ${T.cardBorder}`, borderRadius: "14px", padding: "1rem", display: "flex", alignItems: "center", gap: "0.75rem" }}
            >
              <div style={{ width: "36px", height: "36px", borderRadius: "10px", backgroundColor: stat.color === T.accent ? T.accentSoft : "rgba(193,68,14,0.10)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <stat.icon style={{ width: "16px", height: "16px", color: stat.color }} />
              </div>
              <div>
                <div style={{ fontFamily: "'Clash Display',sans-serif", fontWeight: 700, fontSize: "1.2rem", color: T.text }}>{stat.value}</div>
                <div style={{ fontSize: "0.65rem", color: T.textMuted, fontFamily: "'General Sans',sans-serif" }}>{stat.label}</div>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </div>
  );
}
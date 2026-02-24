"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Home, BookOpen, Calendar, Image, Users, Tag,
  User, Settings, LogOut, Search, Bell, Trophy,
  Flame, Clock, ChevronRight, Camera, Play,
  TrendingUp, Star, Filter, Sun, Moon
} from "lucide-react";
import { supabase } from "@/lib/supabase";

const NAV_LINKS = [
  { label: "Home",      href: "/dashboard",  icon: Home },
  { label: "Courses",   href: "/courses",    icon: BookOpen },
  { label: "Events",    href: "/events",     icon: Calendar },
  { label: "Portfolio", href: "/portfolio",  icon: Image },
  { label: "Community", href: "/community",  icon: Users },
  { label: "Promo",     href: "/promo",      icon: Tag },
  { label: "User",      href: "/profile",    icon: User },
];

const FILTER_TABS = ["Hot", "New", "Event"];

const SHOWCASE_CARDS = [
  { title: "Character Design", category: "Colorimetry",  price: "99",  tag: "Hot"   },
  { title: "Background Art",   category: "Background",   price: "199", tag: "New"   },
  { title: "Texture: Afro",    category: "Texturing",    price: "249", tag: "Hot"   },
  { title: "Clothing Design",  category: "Clothing",     price: "149", tag: "Event" },
];

/* ─── Palette tokens ─── */
const DARK = {
  sidebarBg:    "#110A06",
  sidebarBorder:"#3D2E10",
  mainBg:       "#0D0905",
  topbarBg:     "rgba(13,9,5,0.95)",
  cardBg:       "rgba(26,16,6,0.85)",
  inputBg:      "rgba(34,24,8,0.80)",
  text:         "#F5ECD7",
  textMuted:    "#A89070",
  textDim:      "#6B5A40",
  border:       "#3D2E10",
  activeNavBg:  "rgba(232,160,32,0.10)",
  imgPlaceholder:"rgba(13,9,5,0.60)",
};

const LIGHT = {
  sidebarBg:    "#F5E6C8",        /* warm parchment from mockup */
  sidebarBorder:"#E2C99A",
  mainBg:       "#FDF6EC",
  topbarBg:     "rgba(253,246,236,0.95)",
  cardBg:       "rgba(255,255,255,0.90)",
  inputBg:      "rgba(255,255,255,0.85)",
  text:         "#1A0F00",
  textMuted:    "#6B4F2A",
  textDim:      "#A0845C",
  border:       "#E2C99A",
  activeNavBg:  "rgba(232,160,32,0.15)",
  imgPlaceholder:"rgba(240,225,200,0.70)",
};

export default function AnimatorDashboard() {
  const [user, setUser]       = useState<{ email?: string; user_metadata?: { full_name?: string } } | null>(null);
  const [activeTab, setActiveTab] = useState("Hot");
  const [activeNav, setActiveNav] = useState("Home");
  const [theme, setTheme]     = useState<"dark"|"light">("dark");

  useEffect(() => {
    /* Sync with global theme set by ThemeProvider */
    const saved = localStorage.getItem("africafx-theme") as "dark"|"light";
    if (saved) setTheme(saved);

    const observer = new MutationObserver(() => {
      const t = document.documentElement.getAttribute("data-theme") as "dark"|"light";
      if (t) setTheme(t);
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));

    return () => observer.disconnect();
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("africafx-theme", next);
    document.documentElement.setAttribute("data-theme", next);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  const T = theme === "dark" ? DARK : LIGHT;
  const firstName = user?.user_metadata?.full_name?.split(" ")[0]
                 || user?.email?.split("@")[0]
                 || "Creative";

  /* tag colours stay the same across themes */
  const tagStyle = (tag: string) => ({
    color: tag === "Hot" ? "#E8A020" : tag === "New" ? "#4CAF50" : "#C1440E",
    bg:    tag === "Hot" ? "rgba(232,160,32,0.18)" : tag === "New" ? "rgba(76,175,80,0.18)" : "rgba(193,68,14,0.18)",
  });

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: T.mainBg, color: T.text, fontFamily: "'Satoshi',sans-serif", transition: "background-color 0.3s,color 0.3s" }}>

      {/* ══════════════════════════════════════
          SIDEBAR
      ══════════════════════════════════════ */}
      <aside style={{ width: "200px", flexShrink: 0, backgroundColor: T.sidebarBg, borderRight: `1px solid ${T.sidebarBorder}`, display: "flex", flexDirection: "column", position: "fixed", top: 0, left: 0, bottom: 0, zIndex: 10, transition: "background-color 0.3s" }}>

        {/* Kente stripe */}
        <div style={{ height: "4px", background: "repeating-linear-gradient(90deg,#E8A020 0,#E8A020 20px,#C1440E 20px,#C1440E 40px,#D4A853 40px,#D4A853 60px,#8B2E08 60px,#8B2E08 80px)" }} />

        {/* Logo + user */}
        <div style={{ padding: "1.25rem 1rem", borderBottom: `1px solid ${T.sidebarBorder}` }}>
          {/* AFX mark */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "1.25rem" }}>
            <div style={{ width: "34px", height: "28px", backgroundColor: theme === "dark" ? "#221808" : "#fff", border: `1px solid ${T.sidebarBorder}`, borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <span style={{ fontFamily: "'Clash Display',sans-serif", fontWeight: 700, fontSize: "0.7rem", color: "#E8A020" }}>A</span>
              <span style={{ fontFamily: "'Clash Display',sans-serif", fontWeight: 700, fontSize: "0.8rem", color: "#C1440E" }}>F</span>
              <span style={{ fontFamily: "'Clash Display',sans-serif", fontWeight: 700, fontSize: "0.7rem", color: "#D4A853" }}>X</span>
            </div>
            <div>
              <div style={{ fontFamily: "'Clash Display',sans-serif", fontWeight: 700, fontSize: "0.78rem", color: T.text }}>Africa Fx</div>
              <div style={{ fontSize: "0.6rem", color: T.textDim, fontFamily: "'General Sans',sans-serif" }}>Your art. Our identity.</div>
            </div>
          </div>

          {/* User avatar */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ width: "34px", height: "34px", borderRadius: "50%", background: "linear-gradient(135deg,#E8A020,#C1440E)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Clash Display',sans-serif", fontWeight: 700, fontSize: "0.85rem", color: "#0D0905", flexShrink: 0 }}>
              {firstName.charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={{ fontFamily: "'General Sans',sans-serif", fontWeight: 600, fontSize: "0.78rem", color: T.text }}>{firstName}</div>
              <div style={{ fontSize: "0.6rem", color: T.textDim }}>Animator</div>
            </div>
          </div>
        </div>

        {/* Nav links */}
        <nav style={{ flex: 1, padding: "0.75rem 0", overflowY: "auto" }}>
          {NAV_LINKS.map((link) => {
            const isActive = activeNav === link.label;
            return (
              <Link key={link.label} href={link.href} onClick={() => setActiveNav(link.label)} style={{
                display: "flex", alignItems: "center", gap: "0.65rem",
                padding: "0.65rem 1rem", textDecoration: "none",
                color: isActive ? "#E8A020" : T.textMuted,
                backgroundColor: isActive ? T.activeNavBg : "transparent",
                borderLeft: isActive ? "3px solid #E8A020" : "3px solid transparent",
                transition: "all 0.2s", fontSize: "0.825rem",
                fontFamily: "'General Sans',sans-serif", fontWeight: isActive ? 600 : 400
              }}>
                <link.icon style={{ width: "16px", height: "16px", flexShrink: 0 }} />
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Theme toggle + bottom links */}
        <div style={{ borderTop: `1px solid ${T.sidebarBorder}`, padding: "0.75rem 0" }}>

          {/* Theme toggle row */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.5rem 1rem 0.75rem" }}>
            <span style={{ fontSize: "0.75rem", color: T.textDim, fontFamily: "'General Sans',sans-serif" }}>
              {theme === "dark" ? "Dark mode" : "Light mode"}
            </span>
            <button onClick={toggleTheme} style={{ width: "52px", height: "26px", borderRadius: "999px", border: "none", cursor: "pointer", position: "relative", backgroundColor: theme === "dark" ? "#3D2E10" : "#E8D5B0", transition: "background-color 0.3s" }}>
              <div style={{ position: "absolute", top: "3px", left: theme === "dark" ? "3px" : "27px", width: "20px", height: "20px", borderRadius: "50%", background: "linear-gradient(135deg,#E8A020,#C1440E)", transition: "left 0.3s ease", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {theme === "dark"
                  ? <Moon style={{ width: "10px", height: "10px", color: "#0D0905" }} />
                  : <Sun  style={{ width: "10px", height: "10px", color: "#0D0905" }} />}
              </div>
            </button>
          </div>

          <Link href="/settings" style={{ display: "flex", alignItems: "center", gap: "0.65rem", padding: "0.65rem 1rem", textDecoration: "none", color: T.textDim, fontSize: "0.825rem", fontFamily: "'General Sans',sans-serif" }}>
            <Settings style={{ width: "15px", height: "15px" }} /> Settings
          </Link>
          <button onClick={handleLogout} style={{ display: "flex", alignItems: "center", gap: "0.65rem", padding: "0.65rem 1rem", width: "100%", background: "none", border: "none", cursor: "pointer", color: T.textDim, fontSize: "0.825rem", fontFamily: "'General Sans',sans-serif" }}>
            <LogOut style={{ width: "15px", height: "15px" }} /> Log Out
          </button>
        </div>
      </aside>

      {/* ══════════════════════════════════════
          MAIN CONTENT
      ══════════════════════════════════════ */}
      <div style={{ marginLeft: "200px", flex: 1, display: "flex", flexDirection: "column" }}>

        {/* Top Bar */}
        <div style={{ position: "sticky", top: 0, zIndex: 9, backgroundColor: T.topbarBg, backdropFilter: "blur(12px)", borderBottom: `1px solid ${T.border}`, padding: "0.875rem 2rem", display: "flex", alignItems: "center", gap: "1rem", transition: "background-color 0.3s" }}>

          {/* Left vertical bar + brand */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginRight: "auto" }}>
            <div style={{ width: "3px", height: "36px", background: "linear-gradient(to bottom,#E8A020,#C1440E)", borderRadius: "999px" }} />
            <div>
              <div style={{ display: "flex", gap: "6px" }}>
                <span style={{ fontFamily: "'Clash Display',sans-serif", fontWeight: 700, fontSize: "1rem", color: "#E8A020" }}>Animated</span>
                <span style={{ fontFamily: "'Clash Display',sans-serif", fontWeight: 700, fontSize: "1rem", color: T.text }}>Collective</span>
              </div>
              <div style={{ fontSize: "0.65rem", color: T.textDim, fontFamily: "'General Sans',sans-serif" }}>Your art out identity</div>
            </div>
          </div>

          {/* Search */}
          <div style={{ position: "relative", flex: 1, maxWidth: "380px" }}>
            <Search style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", width: "15px", height: "15px", color: T.textDim }} />
            <input type="text" placeholder="Search courses, events, artists..." style={{ width: "100%", backgroundColor: T.inputBg, border: `1px solid ${T.border}`, borderRadius: "999px", padding: "0.55rem 1rem 0.55rem 2.5rem", color: T.text, fontSize: "0.825rem", outline: "none", fontFamily: "'General Sans',sans-serif", transition: "background-color 0.3s" }} />
          </div>

          {/* Bell */}
          <button style={{ width: "34px", height: "34px", borderRadius: "10px", backgroundColor: T.inputBg, border: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", position: "relative" }}>
            <Bell style={{ width: "15px", height: "15px", color: T.textMuted }} />
            <div style={{ position: "absolute", top: "6px", right: "6px", width: "7px", height: "7px", borderRadius: "50%", background: "linear-gradient(135deg,#E8A020,#C1440E)" }} />
          </button>

          {/* Orcelle-style brand mark */}
          <div style={{ padding: "4px 12px", borderRadius: "8px", background: "linear-gradient(135deg,#E8A020,#C1440E)", fontFamily: "'Clash Display',sans-serif", fontWeight: 700, fontSize: "0.75rem", color: "#0D0905" }}>
            AFX Pro
          </div>
        </div>

        {/* ── Page Content ── */}
        <div style={{ padding: "1.75rem 2rem", flex: 1 }}>

          {/* Filter tabs */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.25rem" }}>
            {FILTER_TABS.map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)} style={{ padding: "0.35rem 1.1rem", borderRadius: "999px", border: "none", cursor: "pointer", fontFamily: "'General Sans',sans-serif", fontWeight: 600, fontSize: "0.825rem", transition: "all 0.2s", backgroundColor: activeTab === tab ? "#E8A020" : T.cardBg, color: activeTab === tab ? "#0D0905" : T.textMuted, boxShadow: activeTab === tab ? "0 0 12px rgba(232,160,32,0.35)" : "none" }}>
                {tab}
              </button>
            ))}
            <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "5px", color: T.textDim, fontSize: "0.78rem", fontFamily: "'General Sans',sans-serif", cursor: "pointer" }}>
              <Filter style={{ width: "13px", height: "13px" }} /> Filter
            </div>
          </div>

          {/* Hero banner placeholder */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            style={{ width: "100%", height: "240px", borderRadius: "20px", backgroundColor: T.imgPlaceholder, border: `2px dashed ${theme === "dark" ? "rgba(232,160,32,0.22)" : "#E2C99A"}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", marginBottom: "1.25rem", position: "relative", overflow: "hidden", cursor: "pointer" }}
          >
            {/* Gold corner markers */}
            {([[true,true],[true,false],[false,true],[false,false]] as [boolean,boolean][]).map(([top, left], i) => (
              <div key={i} style={{ position: "absolute", top: top ? "10px" : "auto", bottom: top ? "auto" : "10px", left: left ? "10px" : "auto", right: left ? "auto" : "10px", width: "18px", height: "18px", borderTop: top ? "2px solid #E8A020" : "none", borderBottom: top ? "none" : "2px solid #E8A020", borderLeft: left ? "2px solid #E8A020" : "none", borderRight: left ? "none" : "2px solid #E8A020" }} />
            ))}

            <div style={{ width: "52px", height: "52px", borderRadius: "14px", backgroundColor: "rgba(232,160,32,0.12)", border: "1px solid rgba(232,160,32,0.25)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "0.875rem" }}>
              <Camera style={{ width: "22px", height: "22px", color: "#E8A020" }} />
            </div>
            <p style={{ fontFamily: "'Cabinet Grotesk',sans-serif", fontWeight: 700, fontSize: "0.95rem", color: T.text, marginBottom: "3px" }}>Featured Banner</p>
            <p style={{ fontSize: "0.75rem", color: T.textDim, fontFamily: "'General Sans',sans-serif" }}>Recommended: 1200 × 400px</p>

            {/* Play btn */}
            <div style={{ position: "absolute", right: "1.25rem", bottom: "1.25rem", width: "40px", height: "40px", borderRadius: "50%", background: "linear-gradient(135deg,#E8A020,#C1440E)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Play style={{ width: "16px", height: "16px", color: "#0D0905", marginLeft: "2px" }} />
            </div>

            {/* Date range */}
            <div style={{ position: "absolute", left: "1.25rem", bottom: "1.25rem", display: "flex", alignItems: "center", gap: "6px" }}>
              {["25 July 2025", "29 July 2025"].map((d, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: "5px", padding: "5px 10px", borderRadius: "7px", backgroundColor: theme === "dark" ? "rgba(13,9,5,0.75)" : "rgba(255,255,255,0.80)", border: `1px solid ${T.border}`, fontSize: "0.7rem", color: T.textMuted, fontFamily: "'General Sans',sans-serif" }}>
                  <Calendar style={{ width: "11px", height: "11px" }} />{d}
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div style={{ position: "absolute", right: "1.25rem", top: "1.25rem", display: "flex", gap: "4px" }}>
              {[1,2,3].map((n) => <div key={n} style={{ width: n === 2 ? "18px" : "7px", height: "7px", borderRadius: "999px", backgroundColor: n === 2 ? "#E8A020" : T.border }} />)}
            </div>
          </motion.div>

          {/* Card grid — 4 columns */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "0.875rem" }}>
            {SHOWCASE_CARDS.map((card, i) => {
              const ts = tagStyle(card.tag);
              return (
                <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: i * 0.07 }} whileHover={{ y: -4, boxShadow: "0 8px 24px rgba(232,160,32,0.15)" }}
                  style={{ backgroundColor: T.cardBg, border: `1px solid ${T.border}`, borderRadius: "14px", overflow: "hidden", cursor: "pointer", transition: "all 0.2s" }}
                >
                  {/* Image placeholder */}
                  <div style={{ width: "100%", height: "150px", backgroundColor: T.imgPlaceholder, border: `1.5px dashed ${theme === "dark" ? "rgba(232,160,32,0.15)" : "#E2C99A"}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", position: "relative" }}>
                    <Camera style={{ width: "22px", height: "22px", color: "rgba(232,160,32,0.35)", marginBottom: "5px" }} />
                    <span style={{ fontSize: "0.6rem", color: T.textDim, fontFamily: "'General Sans',sans-serif" }}>400 × 300px</span>
                    <div style={{ position: "absolute", top: "7px", left: "7px", padding: "2px 7px", borderRadius: "999px", fontSize: "0.6rem", fontFamily: "'General Sans',sans-serif", fontWeight: 600, backgroundColor: ts.bg, color: ts.color }}>
                      {card.tag}
                    </div>
                  </div>
                  {/* Info */}
                  <div style={{ padding: "0.75rem" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "3px" }}>
                      <span style={{ fontFamily: "'General Sans',sans-serif", fontWeight: 600, fontSize: "0.8rem", color: T.text }}>{card.title}</span>
                      <Star style={{ width: "13px", height: "13px", color: "#E8A020", flexShrink: 0 }} />
                    </div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{ fontSize: "0.7rem", color: T.textDim, fontFamily: "'General Sans',sans-serif" }}>{card.category}</span>
                      <span style={{ fontFamily: "'Clash Display',sans-serif", fontWeight: 700, fontSize: "0.825rem", color: "#E8A020" }}>${card.price}</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Bottom row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.875rem", marginTop: "1.25rem" }}>

            {/* Continue Learning */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.35 }}
              style={{ backgroundColor: T.cardBg, border: `1px solid ${T.border}`, borderRadius: "14px", padding: "1.1rem", transition: "background-color 0.3s" }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.875rem" }}>
                <h3 style={{ fontFamily: "'Cabinet Grotesk',sans-serif", fontWeight: 700, fontSize: "0.875rem", color: T.text }}>Continue Learning</h3>
                <Link href="/courses" style={{ display: "flex", alignItems: "center", gap: "3px", fontSize: "0.7rem", color: "#E8A020", textDecoration: "none", fontFamily: "'General Sans',sans-serif" }}>
                  View all <ChevronRight style={{ width: "11px", height: "11px" }} />
                </Link>
              </div>
              <div style={{ width: "100%", height: "90px", borderRadius: "10px", backgroundColor: T.imgPlaceholder, border: `1.5px dashed ${theme === "dark" ? "rgba(232,160,32,0.15)" : "#E2C99A"}`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "0.75rem" }}>
                <Camera style={{ width: "18px", height: "18px", color: "rgba(232,160,32,0.28)" }} />
              </div>
              <p style={{ fontFamily: "'General Sans',sans-serif", fontWeight: 600, fontSize: "0.8rem", color: T.text, marginBottom: "3px" }}>Enrol in a course to start</p>
              <div style={{ height: "3px", borderRadius: "999px", backgroundColor: T.border, marginBottom: "3px" }}>
                <div style={{ width: "0%", height: "100%", borderRadius: "999px", background: "linear-gradient(90deg,#E8A020,#C1440E)" }} />
              </div>
              <p style={{ fontSize: "0.65rem", color: T.textDim, fontFamily: "'General Sans',sans-serif" }}>0% complete</p>
            </motion.div>

            {/* Recent Activity */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.45 }}
              style={{ backgroundColor: T.cardBg, border: `1px solid ${T.border}`, borderRadius: "14px", padding: "1.1rem", transition: "background-color 0.3s" }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.875rem" }}>
                <h3 style={{ fontFamily: "'Cabinet Grotesk',sans-serif", fontWeight: 700, fontSize: "0.875rem", color: T.text }}>Recent Activity</h3>
                <TrendingUp style={{ width: "15px", height: "15px", color: "#E8A020" }} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem" }}>
                {[
                  { text: "New challenge: Character of the Month", time: "2h ago",  icon: Trophy },
                  { text: "New lesson by Kwame Mensah",           time: "5h ago",  icon: Play },
                  { text: "Your post got 3 replies",              time: "1d ago",  icon: Users },
                  { text: "Weekly streak milestone reached!",     time: "2d ago",  icon: Flame },
                ].map((item, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "0.65rem" }}>
                    <div style={{ width: "26px", height: "26px", borderRadius: "7px", backgroundColor: "rgba(232,160,32,0.10)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <item.icon style={{ width: "11px", height: "11px", color: "#E8A020" }} />
                    </div>
                    <div>
                      <p style={{ fontSize: "0.73rem", color: T.text, fontFamily: "'Satoshi',sans-serif", lineHeight: 1.4 }}>{item.text}</p>
                      <p style={{ fontSize: "0.63rem", color: T.textDim, fontFamily: "'General Sans',sans-serif", marginTop: "1px" }}>{item.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Stats row */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "0.875rem", marginTop: "1.25rem" }}>
            {[
              { label: "Courses Enrolled", value: "0",  icon: BookOpen, color: "#E8A020" },
              { label: "Lessons Done",     value: "0",  icon: Clock,    color: "#C1440E" },
              { label: "Day Streak",       value: "3",  icon: Flame,    color: "#D4A853" },
              { label: "Community Rank",   value: "#42",icon: Trophy,   color: "#E8A020" },
            ].map((stat, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.55 + i * 0.05 }}
                style={{ backgroundColor: T.cardBg, border: `1px solid ${T.border}`, borderRadius: "12px", padding: "0.875rem", display: "flex", alignItems: "center", gap: "0.65rem", transition: "background-color 0.3s" }}
              >
                <div style={{ width: "34px", height: "34px", borderRadius: "9px", backgroundColor: `rgba(${stat.color === "#E8A020" ? "232,160,32" : stat.color === "#C1440E" ? "193,68,14" : "212,168,83"},0.12)`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <stat.icon style={{ width: "15px", height: "15px", color: stat.color }} />
                </div>
                <div>
                  <div style={{ fontFamily: "'Clash Display',sans-serif", fontWeight: 700, fontSize: "1.15rem", color: T.text }}>{stat.value}</div>
                  <div style={{ fontSize: "0.65rem", color: T.textMuted, fontFamily: "'General Sans',sans-serif" }}>{stat.label}</div>
                </div>
              </motion.div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}
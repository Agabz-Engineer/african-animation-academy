"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Calendar, Users, Bell, Trophy,
  Flame, Clock, ChevronRight, Camera, Play,
  TrendingUp, Star, Filter, Search
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useGamification } from "@/lib/useGamification";

const FILTER_TABS = ["Hot", "New", "Event"];

const SHOWCASE_CARDS = [
  { title: "Character Design", category: "Colorimetry", price: "99",  tag: "Hot"   },
  { title: "Background Art",   category: "Background",  price: "199", tag: "New"   },
  { title: "Texture: Afro",    category: "Texturing",   price: "249", tag: "Hot"   },
  { title: "Clothing Design",  category: "Clothing",    price: "149", tag: "Event" },
];

/* ══════════════════════════════════════════════
   COLOUR TOKENS — 4-colour palette
   ──────────────────────────────────────────────
   #FAF8F0  cream   → light bg
   #EDE5CC  sand    → light surfaces
   #FF8C00  orange  → accent
   #1C1C1C  black   → text (light) / bg (dark)

   READABILITY RULE:
   → dark text (#1C1C1C) on light surfaces ✓
   → light text (#FAF8F0) on dark surfaces ✓
   → orange only for accent, never as text bg
══════════════════════════════════════════════ */
const DARK = {
  pageBg:     "#1C1C1C",
  cardBg:     "#2C2926",
  surface:    "#252320",
  border:     "#3A3530",
  text:       "#FAF8F0",       /* light on dark ✓  */
  textMuted:  "#C8C4BC",       /* still readable   */
  textDim:    "#8A8680",       /* labels only      */
  accent:     "#FF8C00",
  accentText: "#1C1C1C",       /* dark on orange ✓ */
  accentSoft: "rgba(255,140,0,0.10)",
  imgBg:      "#252320",
  inputBg:    "#2C2926",
  topbarBg:   "rgba(28,28,28,0.97)",
  dateBg:     "rgba(28,28,28,0.80)",
};

const LIGHT = {
  pageBg:     "#FAF8F0",
  cardBg:     "#FFFFFF",
  surface:    "#EDE5CC",
  border:     "#E0D8C3",
  text:       "#1C1C1C",       /* dark on light ✓  */
  textMuted:  "#4A4744",       /* still dark       */
  textDim:    "#7A7570",       /* labels only      */
  accent:     "#FF8C00",
  accentText: "#FFFFFF",       /* white on orange ✓ */
  accentSoft: "rgba(255,140,0,0.10)",
  imgBg:      "#EDE5CC",
  inputBg:    "#FFFFFF",
  topbarBg:   "rgba(250,248,240,0.97)",
  dateBg:     "rgba(255,255,255,0.85)",
};

const getInitialTheme = (): "dark" | "light" => {
  if (typeof window === "undefined") return "dark";
  const saved = localStorage.getItem("africafx-theme");
  if (saved === "dark" || saved === "light") return saved;
  const attr = document.documentElement.getAttribute("data-theme");
  return attr === "light" ? "light" : "dark";
};

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("Hot");
  const [theme, setTheme] = useState<"dark" | "light">(getInitialTheme);
  const [userLoading, setUserLoading] = useState(true);
  const [userError, setUserError] = useState<string | null>(null);
  const [user, setUser] = useState<{
    id: string;
    email?: string;
    user_metadata?: { full_name?: string };
  } | null>(null);

  const hydrateUser = useCallback(async () => {
    setUserLoading(true);
    setUserError(null);
    if (!supabase) {
      setUserError("Authentication service not available");
      return;
    }
    try {
      const { data, error } = await supabase.auth.getUser();
      if (error) throw error;
      setUser(data.user);
    } catch (error) {
      setUserError(
        error instanceof Error ? error.message : "Unable to load your account."
      );
    } finally {
      setUserLoading(false);
    }
  }, []);

  useEffect(() => {
    const obs = new MutationObserver(() => {
      const t = document.documentElement.getAttribute("data-theme") as
        | "dark"
        | "light";
      if (t) setTheme(t);
    });
    obs.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    void hydrateUser();
    const authSub = supabase?.auth.onAuthStateChange(() => {
      void hydrateUser();
    });

    return () => {
      obs.disconnect();
      if (authSub?.data?.subscription) {
        authSub.data.subscription.unsubscribe();
      }
    };
  }, [hydrateUser]);

  const T = theme === "dark" ? DARK : LIGHT;
  const firstName = user?.user_metadata?.full_name?.split(" ")[0]
                 || user?.email?.split("@")[0]
                 || "Creative";
  const {
    state: momentum,
    quests,
    levelName,
    levelProgressPct,
    xpToNextLevel,
    questsCompletedToday,
    questsTotalToday,
    recordAction,
  } = useGamification(user?.id || null);
  const pendingQuests = quests.filter((quest) => !quest.completed);
  const displayLevel = momentum.level + 1;
  const dailyQuestPreview = pendingQuests.slice(0, 3);
  const filteredShowcaseCards = useMemo(
    () => SHOWCASE_CARDS.filter((card) => card.tag === activeTab),
    [activeTab]
  );
  const questCompletionPct =
    questsTotalToday > 0 ? Math.round((questsCompletedToday / questsTotalToday) * 100) : 0;
  const nextReminder =
    pendingQuests.length > 0
      ? `${pendingQuests[0].title} - ${pendingQuests[0].remaining} left`
      : "All daily tasks completed. Keep creating to bank more XP.";

  /*
    FIX 1: tagColor now uses only 4-colour palette.
    Hot   → orange (accent)
    New   → success green (status colour, kept from globals)
    Event → textMuted (neutral — no terracotta in new palette)
  */
  const tagColor = (tag: string) =>
    tag === "Hot"
      ? { color: T.accent,      bg: T.accentSoft }
      : tag === "New"
        ? { color: "#4CAF50",   bg: "rgba(76,175,80,0.14)" }
        : { color: T.textMuted, bg: theme === "dark" ? "rgba(200,196,188,0.12)" : "rgba(74,71,68,0.10)" };

  if (userLoading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          backgroundColor: T.pageBg,
          color: T.text,
          fontFamily: "'Satoshi',sans-serif",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.6rem" }}>
          <motion.div
            aria-hidden
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, ease: "linear", duration: 1 }}
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              border: `2px solid ${T.border}`,
              borderTopColor: T.accent,
            }}
          />
          <p style={{ margin: 0, color: T.textMuted, fontSize: "0.86rem" }}>
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (userError) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          backgroundColor: T.pageBg,
          color: T.text,
          padding: "1rem",
          fontFamily: "'Satoshi',sans-serif",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 420,
            border: `1px solid ${T.border}`,
            borderRadius: "14px",
            backgroundColor: T.cardBg,
            padding: "1rem",
          }}
        >
          <p style={{ margin: 0, fontSize: "1rem", fontWeight: 700 }}>
            Could not load dashboard data
          </p>
          <p style={{ margin: "0.45rem 0 0", color: T.textMuted, fontSize: "0.82rem", lineHeight: 1.5 }}>
            {userError}
          </p>
          <button
            type="button"
            onClick={() => {
              void hydrateUser();
            }}
            style={{
              marginTop: "0.82rem",
              border: `1px solid ${T.accent}`,
              backgroundColor: T.accentSoft,
              color: T.accent,
              borderRadius: "9px",
              padding: "0.4rem 0.68rem",
              fontWeight: 600,
              fontSize: "0.77rem",
              cursor: "pointer",
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: T.pageBg, minHeight: "100vh", color: T.text, transition: "background-color 0.3s,color 0.3s" }}>

      {/* ── Desktop top bar ── */}
      <div className="hide-mobile" style={{
        position: "sticky", top: 0, zIndex: 9,
        backgroundColor: T.topbarBg,
        backdropFilter: "blur(12px)",
        borderBottom: `1px solid ${T.border}`,   /* FIX 6: 1px border, not 2px accent */
        padding: "0.875rem 2rem",
        display: "flex", alignItems: "center", gap: "1rem"
      }}>

        {/* Brand */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginRight: "auto" }}>
          <div style={{ width: "3px", height: "32px", backgroundColor: T.accent, borderRadius: "999px" }} />
          <div>
            <div style={{ display: "flex", gap: "5px", alignItems: "baseline" }}>
              <span style={{ fontFamily: "'Clash Display',sans-serif", fontWeight: 700, fontSize: "1rem", color: T.accent }}>Animated</span>
              <span style={{ fontFamily: "'Clash Display',sans-serif", fontWeight: 700, fontSize: "1rem", color: T.text }}>Collective</span>
            </div>
            <div style={{ fontSize: "0.6rem", color: T.textDim, fontFamily: "'Satoshi',sans-serif" }}>Your art. Our identity.</div>
          </div>
        </div>

        {/* Search */}
        <div style={{ position: "relative", flex: 1, maxWidth: "360px" }}>
          <Search style={{ position: "absolute", left: "0.875rem", top: "50%", transform: "translateY(-50%)", width: "14px", height: "14px", color: T.textDim }} />
          <input
            type="text"
            placeholder="Search courses, events, artists..."
            style={{ width: "100%", backgroundColor: T.inputBg, border: `1px solid ${T.border}`, borderRadius: "10px", padding: "0.5rem 1rem 0.5rem 2.4rem", color: T.text, fontSize: "0.8rem", outline: "none", fontFamily: "'Satoshi',sans-serif" }}
          />
        </div>

        {/* Bell */}
        <button style={{ width: "36px", height: "36px", borderRadius: "10px", backgroundColor: T.surface, border: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", position: "relative" }}>
          <Bell style={{ width: "15px", height: "15px", color: T.textMuted }} />
          <div style={{ position: "absolute", top: "7px", right: "7px", width: "6px", height: "6px", borderRadius: "50%", backgroundColor: T.accent }} />
        </button>

        {/* Streak + Rank pills */}
        <div style={{ display: "flex", gap: "0.4rem" }}>
          {/* Streak — orange accent */}
          <div style={{ display: "flex", alignItems: "center", gap: "4px", padding: "5px 12px", borderRadius: "8px", backgroundColor: T.accentSoft, border: `1px solid ${T.accent}33` }}>
            <Flame style={{ width: "12px", height: "12px", color: T.accent }} />
            <span style={{ fontSize: "0.72rem", color: T.accent, fontFamily: "'Satoshi',sans-serif", fontWeight: 700 }}>
              {momentum.streak} day streak
            </span>
          </div>
          {/* FIX 4: Rank — uses surface + textMuted, no terracotta hardcode */}
          <div style={{ display: "flex", alignItems: "center", gap: "4px", padding: "5px 12px", borderRadius: "8px", backgroundColor: T.surface, border: `1px solid ${T.border}` }}>
            <Trophy style={{ width: "12px", height: "12px", color: T.textMuted }} />
            <span style={{ fontSize: "0.72rem", color: T.textMuted, fontFamily: "'Satoshi',sans-serif", fontWeight: 600 }}>
              Level {displayLevel}
            </span>
          </div>
        </div>
      </div>

      {/* ── Page content ── */}
      <div className="dash-padding" style={{ padding: "1.75rem 2rem" }}>

        {/* Welcome */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} style={{ marginBottom: "1.5rem" }}>
          <h1 style={{ fontFamily: "'Clash Display',sans-serif", fontWeight: 700, fontSize: "1.6rem", color: T.text, marginBottom: "3px", letterSpacing: "-0.02em" }}>
            Welcome back,{" "}
            {/* FIX 2: flat accent colour — no gradient, keeps it clean */}
            <span style={{ color: T.accent }}>{firstName}</span>{" "}👋
          </h1>
          <p style={{ fontSize: "0.8rem", color: T.textMuted, fontFamily: "'Satoshi',sans-serif" }}>
            Here is what is happening in your creative world today
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.1 }}
          style={{
            border: `1px solid ${T.border}`,
            borderRadius: "16px",
            backgroundColor: T.cardBg,
            padding: "1rem",
            marginBottom: "1rem",
          }}
        >
          <div className="dash-momentum-grid" style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "0.75rem" }}>
            <div>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.35rem",
                  borderRadius: "999px",
                  border: `1px solid ${T.accent}44`,
                  backgroundColor: T.accentSoft,
                  color: T.accent,
                  padding: "0.22rem 0.56rem",
                  fontSize: "0.67rem",
                  fontFamily: "'Cabinet Grotesk',sans-serif",
                  fontWeight: 700,
                }}
              >
                <Flame style={{ width: "11px", height: "11px" }} />
                Creator Momentum
              </div>
              <div style={{ marginTop: "0.5rem", display: "flex", alignItems: "baseline", gap: "0.45rem", flexWrap: "wrap" }}>
                <span style={{ fontFamily: "'Clash Display',sans-serif", fontSize: "1.85rem", color: T.accent, lineHeight: 1 }}>
                  {momentum.totalXp.toLocaleString()}
                </span>
                <span style={{ fontSize: "0.72rem", color: T.textMuted, fontFamily: "'Satoshi',sans-serif", letterSpacing: "0.04em" }}>
                  TOTAL XP
                </span>
              </div>
              <p style={{ marginTop: "0.2rem", fontSize: "0.76rem", color: T.textMuted, fontFamily: "'Satoshi',sans-serif" }}>
                Level {displayLevel} - {levelName}
              </p>
              <div style={{ marginTop: "0.56rem", height: "6px", backgroundColor: T.border, borderRadius: "999px", overflow: "hidden" }}>
                <div
                  style={{
                    width: `${levelProgressPct}%`,
                    height: "100%",
                    borderRadius: "999px",
                    background: `linear-gradient(90deg, ${T.accent}, ${theme === "dark" ? "#FFB347" : "#FF9F2A"})`,
                  }}
                />
              </div>
              <p style={{ marginTop: "0.33rem", fontSize: "0.68rem", color: T.textDim, fontFamily: "'Satoshi',sans-serif" }}>
                {xpToNextLevel} XP to next level - {questCompletionPct}% of daily quests done
              </p>
            </div>

            <div style={{ border: `1px solid ${T.border}`, borderRadius: "12px", backgroundColor: T.surface, padding: "0.68rem 0.72rem" }}>
              <p style={{ fontSize: "0.74rem", color: T.text, fontWeight: 700, fontFamily: "'Cabinet Grotesk',sans-serif", marginBottom: "0.35rem" }}>
                Today&apos;s Reminders
              </p>
              {dailyQuestPreview.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.38rem" }}>
                  {dailyQuestPreview.map((quest) => (
                    <Link
                      key={quest.id}
                      href={quest.href}
                      onClick={() => {
                        if (quest.action === "course_session") {
                          recordAction("course_session");
                        }
                      }}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: "0.4rem",
                        textDecoration: "none",
                        borderRadius: "8px",
                        border: `1px solid ${T.border}`,
                        backgroundColor: T.cardBg,
                        padding: "0.36rem 0.45rem",
                        color: T.text,
                        fontSize: "0.72rem",
                        fontFamily: "'Satoshi',sans-serif",
                      }}
                    >
                      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{quest.title}</span>
                      <span style={{ color: T.accent, fontFamily: "'Cabinet Grotesk',sans-serif", fontWeight: 700 }}>
                        {quest.remaining}
                      </span>
                    </Link>
                  ))}
                </div>
              ) : (
                <p style={{ fontSize: "0.72rem", color: T.textMuted, fontFamily: "'Satoshi',sans-serif", lineHeight: 1.45 }}>
                  All tasks completed for today. Keep creating to stack extra XP.
                </p>
              )}
            </div>
          </div>
          <p style={{ marginTop: "0.5rem", fontSize: "0.72rem", color: T.textDim, fontFamily: "'Satoshi',sans-serif" }}>
            Next up: {nextReminder}
          </p>
        </motion.div>

        {/* Filter tabs */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.25rem", flexWrap: "wrap" }}>
          {FILTER_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: "0.4rem 1.25rem", borderRadius: "8px",
                border: `1px solid ${activeTab === tab ? T.accent : T.border}`,
                cursor: "pointer",
                fontFamily: "'Satoshi',sans-serif", fontWeight: 600, fontSize: "0.825rem",
                transition: "all 0.18s",
                backgroundColor: activeTab === tab ? T.accent : T.cardBg,
                color: activeTab === tab ? T.accentText : T.textMuted,
              }}
            >
              {tab}
            </button>
          ))}
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "5px", color: T.textDim, fontSize: "0.75rem", fontFamily: "'Satoshi',sans-serif", cursor: "pointer" }}>
            <Filter style={{ width: "13px", height: "13px" }} /> Filter
          </div>
        </div>

        {/* Hero banner */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="dash-hero"
          style={{ width: "100%", height: "230px", borderRadius: "20px", backgroundColor: T.imgBg, border: `2px dashed ${T.border}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", marginBottom: "1.25rem", position: "relative", overflow: "hidden", cursor: "pointer" }}
        >
          {/* Corner markers */}
          {([[true,true],[true,false],[false,true],[false,false]] as [boolean,boolean][]).map(([top,left],i) => (
            <div key={i} style={{ position: "absolute", top: top ? "12px" : "auto", bottom: top ? "auto" : "12px", left: left ? "12px" : "auto", right: left ? "auto" : "12px", width: "18px", height: "18px", borderTop: top ? `2px solid ${T.accent}` : "none", borderBottom: top ? "none" : `2px solid ${T.accent}`, borderLeft: left ? `2px solid ${T.accent}` : "none", borderRight: left ? "none" : `2px solid ${T.accent}` }} />
          ))}

          <div style={{ width: "52px", height: "52px", borderRadius: "14px", backgroundColor: T.accentSoft, border: `1px solid ${T.accent}33`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "0.75rem" }}>
            <Camera style={{ width: "22px", height: "22px", color: T.accent }} />
          </div>
          <p style={{ fontFamily: "'Cabinet Grotesk',sans-serif", fontWeight: 700, fontSize: "0.95rem", color: T.text, marginBottom: "3px" }}>Featured Banner</p>
          <p style={{ fontSize: "0.72rem", color: T.textDim, fontFamily: "'Satoshi',sans-serif" }}>Recommended: 1200 × 400px</p>

          {/* Play button */}
          <div style={{ position: "absolute", right: "1.25rem", bottom: "1.25rem", width: "40px", height: "40px", borderRadius: "50%", backgroundColor: T.accent, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 12px rgba(0,0,0,0.2)" }}>
            <Play style={{ width: "16px", height: "16px", color: T.accentText, marginLeft: "2px" }} />
          </div>

          {/* Date range */}
          <div style={{ position: "absolute", left: "1.25rem", bottom: "1.25rem", display: "flex", alignItems: "center", gap: "6px" }}>
            {["25 July 2025", "29 July 2025"].map((d, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "4px", padding: "5px 10px", borderRadius: "7px", backgroundColor: T.dateBg, border: `1px solid ${T.border}`, fontSize: "0.68rem", color: T.textMuted, fontFamily: "'Satoshi',sans-serif" }}>
                <Calendar style={{ width: "10px", height: "10px" }} />{d}
              </div>
            ))}
          </div>

          {/* Pagination dots */}
          <div style={{ position: "absolute", right: "1.25rem", top: "1.25rem", display: "flex", gap: "4px" }}>
            {[1,2,3].map((n) => (
              <div key={n} style={{ width: n===2 ? "18px" : "7px", height: "7px", borderRadius: "999px", backgroundColor: n===2 ? T.accent : T.border, transition: "all 0.3s" }} />
            ))}
          </div>
        </motion.div>

        {/* Card grid */}
        <div className="dash-grid-4" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "1rem" }}>
          {filteredShowcaseCards.length === 0 && (
            <div
              style={{
                gridColumn: "1 / -1",
                borderRadius: "14px",
                border: `1px dashed ${T.border}`,
                backgroundColor: T.cardBg,
                padding: "1.1rem",
              }}
            >
              <p style={{ margin: 0, color: T.text, fontWeight: 700, fontFamily: "'Cabinet Grotesk',sans-serif" }}>
                Nothing new in {activeTab} yet
              </p>
              <p style={{ margin: "0.35rem 0 0", color: T.textMuted, fontSize: "0.74rem", fontFamily: "'Satoshi',sans-serif" }}>
                Try another filter while we load more recommendations.
              </p>
            </div>
          )}
          {filteredShowcaseCards.map((card, i) => {
            const ts = tagColor(card.tag);
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.07 }}
                whileHover={{ y: -5 }}
                style={{ backgroundColor: T.cardBg, border: `1px solid ${T.border}`, borderRadius: "16px", overflow: "hidden", cursor: "pointer", transition: "all 0.2s" }}
              >
                {/* Image placeholder */}
                <div style={{ width: "100%", height: "145px", backgroundColor: T.imgBg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", position: "relative" }}>
                  <Camera style={{ width: "22px", height: "22px", color: T.textDim, opacity: 0.5, marginBottom: "5px" }} />
                  <span style={{ fontSize: "0.6rem", color: T.textDim, fontFamily: "'Satoshi',sans-serif" }}>400 × 290px</span>
                  {/* FIX 1: tag uses tokenised colours */}
                  <div style={{ position: "absolute", top: "8px", left: "8px", padding: "2px 8px", borderRadius: "6px", fontSize: "0.6rem", fontFamily: "'Satoshi',sans-serif", fontWeight: 700, backgroundColor: ts.bg, color: ts.color }}>
                    {card.tag}
                  </div>
                </div>

                {/* Card info */}
                <div style={{ padding: "0.75rem" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
                    <span style={{ fontFamily: "'Satoshi',sans-serif", fontWeight: 700, fontSize: "0.8rem", color: T.text }}>{card.title}</span>
                    <Star style={{ width: "13px", height: "13px", color: T.accent, flexShrink: 0 }} />
                  </div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: "0.68rem", color: T.textDim, fontFamily: "'Satoshi',sans-serif" }}>{card.category}</span>
                    <span style={{ fontFamily: "'Clash Display',sans-serif", fontWeight: 700, fontSize: "0.85rem", color: T.accent }}>${card.price}</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom row */}
        <div className="dash-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginTop: "1.1rem" }}>

          {/* Creator Momentum */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.35 }}
            style={{ backgroundColor: T.cardBg, border: `1px solid ${T.border}`, borderRadius: "16px", padding: "1.1rem" }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.875rem" }}>
              <h3 style={{ fontFamily: "'Cabinet Grotesk',sans-serif", fontWeight: 700, fontSize: "0.875rem", color: T.text }}>
                Momentum Control
              </h3>
              <Link
                href="/courses"
                onClick={() => recordAction("course_session")}
                style={{ display: "flex", alignItems: "center", gap: "3px", fontSize: "0.7rem", color: T.accent, textDecoration: "none", fontFamily: "'Satoshi',sans-serif", fontWeight: 600 }}
              >
                Start session <ChevronRight style={{ width: "11px", height: "11px" }} />
              </Link>
            </div>
            <div style={{ width: "100%", borderRadius: "12px", backgroundColor: T.imgBg, border: `1px solid ${T.border}`, padding: "0.75rem", marginBottom: "0.75rem" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "0.5rem" }}>
                <div>
                  <p style={{ fontSize: "0.62rem", color: T.textDim, fontFamily: "'Satoshi',sans-serif", marginBottom: "0.12rem" }}>XP</p>
                  <p style={{ fontFamily: "'Cabinet Grotesk',sans-serif", color: T.text, fontWeight: 700, fontSize: "1rem" }}>
                    {momentum.totalXp.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p style={{ fontSize: "0.62rem", color: T.textDim, fontFamily: "'Satoshi',sans-serif", marginBottom: "0.12rem" }}>Level</p>
                  <p style={{ fontFamily: "'Cabinet Grotesk',sans-serif", color: T.text, fontWeight: 700, fontSize: "1rem" }}>L{displayLevel}</p>
                </div>
                <div>
                  <p style={{ fontSize: "0.62rem", color: T.textDim, fontFamily: "'Satoshi',sans-serif", marginBottom: "0.12rem" }}>Streak</p>
                  <p style={{ fontFamily: "'Cabinet Grotesk',sans-serif", color: T.text, fontWeight: 700, fontSize: "1rem" }}>
                    {momentum.streak}
                  </p>
                </div>
              </div>
            </div>
            <p style={{ fontFamily: "'Cabinet Grotesk',sans-serif", fontWeight: 700, fontSize: "0.8rem", color: T.text, marginBottom: "4px" }}>
              {pendingQuests.length > 0 ? pendingQuests[0].title : "You are fully caught up today"}
            </p>
            <div style={{ height: "4px", borderRadius: "999px", backgroundColor: T.border, marginBottom: "4px" }}>
              <div
                style={{
                  width: `${questCompletionPct}%`,
                  height: "100%",
                  borderRadius: "999px",
                  backgroundColor: T.accent,
                }}
              />
            </div>
            <p style={{ fontSize: "0.63rem", color: T.textDim, fontFamily: "'Satoshi',sans-serif" }}>
              {questsCompletedToday} of {questsTotalToday} quests completed
            </p>
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.45 }}
            style={{ backgroundColor: T.cardBg, border: `1px solid ${T.border}`, borderRadius: "16px", padding: "1.1rem" }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.875rem" }}>
              <h3 style={{ fontFamily: "'Cabinet Grotesk',sans-serif", fontWeight: 700, fontSize: "0.875rem", color: T.text }}>Recent Activity</h3>
              <TrendingUp style={{ width: "15px", height: "15px", color: T.accent }} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem" }}>
              {[
                { text: "New challenge: Character of the Month", time: "2h ago", icon: Trophy },
                { text: "New lesson by Kwame Mensah",           time: "5h ago", icon: Play   },
                { text: "Your post got 3 replies",              time: "1d ago", icon: Users  },
                { text: "Weekly streak milestone reached!",     time: "2d ago", icon: Flame  },
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "0.65rem" }}>
                  <div style={{ width: "26px", height: "26px", borderRadius: "8px", backgroundColor: T.accentSoft, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <item.icon style={{ width: "11px", height: "11px", color: T.accent }} />
                  </div>
                  <div>
                    <p style={{ fontSize: "0.72rem", color: T.text, fontFamily: "'Satoshi',sans-serif", lineHeight: 1.4 }}>{item.text}</p>
                    <p style={{ fontSize: "0.62rem", color: T.textDim, fontFamily: "'Satoshi',sans-serif", marginTop: "1px" }}>{item.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Stats row */}
        <div className="dash-grid-stats" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "1rem", marginTop: "1.1rem" }}>
          {/*
            FIX 3: removed #C1440E and #D4A853 hardcodes.
            All stat icons now use T.accent (orange only — 4-colour rule).
          */}
          {[
            { label: "Total XP",      value: momentum.totalXp.toLocaleString(),             icon: Trophy },
            { label: "Creator Level", value: `L${displayLevel}`,                            icon: Star   },
            { label: "Day Streak",    value: `${momentum.streak}`,                          icon: Flame  },
            { label: "Daily Quests",  value: `${questsCompletedToday}/${questsTotalToday}`, icon: Clock  },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.55 + i * 0.05 }}
              style={{ backgroundColor: T.cardBg, border: `1px solid ${T.border}`, borderRadius: "14px", padding: "1rem", display: "flex", alignItems: "center", gap: "0.75rem" }}
            >
              <div style={{ width: "36px", height: "36px", borderRadius: "10px", backgroundColor: T.accentSoft, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <stat.icon style={{ width: "16px", height: "16px", color: T.accent }} />
              </div>
              <div>
                <div style={{ fontFamily: "'Clash Display',sans-serif", fontWeight: 700, fontSize: "1.2rem", color: T.text }}>{stat.value}</div>
                <div style={{ fontSize: "0.65rem", color: T.textMuted, fontFamily: "'Satoshi',sans-serif" }}>{stat.label}</div>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </div>
  );
}



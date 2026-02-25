"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home, BookOpen, Calendar, Image, Users, Tag,
  User, Settings, LogOut, Sun, Moon,
  ChevronRight, Menu, X, Sparkles
} from "lucide-react";
import { supabase } from "@/lib/supabase";

const NAV_LINKS = [
  { label: "Home",      href: "/dashboard",  icon: Home },
  { label: "Courses",   href: "/courses",    icon: BookOpen },
  { label: "Events",    href: "/events",     icon: Calendar },
  { label: "Portfolio", href: "/portfolio",  icon: Image },
  { label: "Community", href: "/community",  icon: Users },
  { label: "Promo",     href: "/promo",      icon: Tag },
  { label: "Profile",   href: "/profile",    icon: User },
];

const BOTTOM_NAV = [
  { label: "Home",      href: "/dashboard",  icon: Home },
  { label: "Courses",   href: "/courses",    icon: BookOpen },
  { label: "Community", href: "/community",  icon: Users },
  { label: "Portfolio", href: "/portfolio",  icon: Image },
  { label: "Profile",   href: "/profile",    icon: User },
];

const DARK = {
  sidebarBg:    "#161412",
  sidebarBorder:"#242018",
  mainBg:       "#0F0D0B",
  topbarBg:     "rgba(15,13,11,0.94)",
  text:         "#FAF8F0",
  textMuted:    "#B0ACA4",
  textDim:      "#5E5A56",
  border:       "#242018",
  accent:       "#FF8C00",
  accentText:   "#FFFFFF",
  accentSoft:   "rgba(255,140,0,0.08)",
  accentGlow:   "rgba(255,140,0,0.22)",
  activeNavBg:  "rgba(255,140,0,0.09)",
  activeBorder: "rgba(255,140,0,0.18)",
  overlayBg:    "rgba(0,0,0,0.72)",
  bottomNavBg:  "rgba(22,20,18,0.98)",
  navHoverBg:   "rgba(255,255,255,0.03)",
  cardBg:       "#1C1916",
  avatarRing:   "rgba(255,140,0,0.28)",
  toggleBg:     "#0A0806",
  surface:      "#1E1B16",
};

const LIGHT = {
  sidebarBg:    "#EEE6D2",
  sidebarBorder:"#DDD0B8",
  mainBg:       "#FAF8F0",
  topbarBg:     "rgba(250,248,240,0.94)",
  text:         "#1C1C1C",
  textMuted:    "#4A4744",
  textDim:      "#9A9590",
  border:       "#DDD0B8",
  accent:       "#FF8C00",
  accentText:   "#FFFFFF",
  accentSoft:   "rgba(255,140,0,0.09)",
  accentGlow:   "rgba(255,140,0,0.18)",
  activeNavBg:  "rgba(255,140,0,0.10)",
  activeBorder: "rgba(255,140,0,0.22)",
  overlayBg:    "rgba(0,0,0,0.32)",
  bottomNavBg:  "rgba(238,230,210,0.98)",
  navHoverBg:   "rgba(0,0,0,0.03)",
  cardBg:       "#FFFFFF",
  avatarRing:   "rgba(255,140,0,0.22)",
  toggleBg:     "#E0D8C4",
  surface:      "#E8E0CC",
};

const SIDEBAR_EXPANDED  = 224;
const SIDEBAR_COLLAPSED = 64;

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [theme, setTheme]           = useState<"dark"|"light">("dark");
  const [expanded, setExpanded]     = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile]     = useState(false);
  const [isTablet, setIsTablet]     = useState(false);
  const [hovered, setHovered]       = useState<string|null>(null);
  const [user, setUser]             = useState<{ email?: string; user_metadata?: { full_name?: string } } | null>(null);
  const overlayRef                  = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem("africafx-theme") as "dark"|"light";
    if (saved) { setTheme(saved); document.documentElement.setAttribute("data-theme", saved); }
    const obs = new MutationObserver(() => {
      const t = document.documentElement.getAttribute("data-theme") as "dark"|"light";
      if (t) setTheme(t);
    });
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    const checkSize = () => {
      setIsMobile(window.innerWidth < 768);
      setIsTablet(window.innerWidth >= 768 && window.innerWidth < 1024);
    };
    checkSize();
    window.addEventListener("resize", checkSize);
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
    return () => { obs.disconnect(); window.removeEventListener("resize", checkSize); };
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

  const T          = theme === "dark" ? DARK : LIGHT;
  const firstName  = user?.user_metadata?.full_name?.split(" ")[0] || user?.email?.split("@")[0] || "Creative";
  const initial    = firstName.charAt(0).toUpperCase();
  const showSidebar       = !isMobile && !isTablet;
  const showMobileSidebar = (isMobile || isTablet) && mobileOpen;
  const sidebarWidth      = expanded ? SIDEBAR_EXPANDED : SIDEBAR_COLLAPSED;

  /* ─── THEME TOGGLE
     Segmented pill — no blinking, no layout glitch
     Two simple buttons side by side, active one gets orange bg
  ─── */
  const ThemeToggle = ({ compact = false }: { compact?: boolean }) => {
    if (compact) {
      return (
        <button
          onClick={toggleTheme}
          style={{
            width: "36px", height: "36px", borderRadius: "10px",
            backgroundColor: theme === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
            border: `1px solid ${T.border}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", flexShrink: 0,
          }}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={theme}
              initial={{ opacity: 0, rotate: -15, scale: 0.8 }}
              animate={{ opacity: 1, rotate: 0,   scale: 1   }}
              exit={{    opacity: 0, rotate:  15, scale: 0.8 }}
              transition={{ duration: 0.18 }}
            >
              {theme === "dark"
                ? <Sun  style={{ width: "15px", height: "15px", color: T.accent }} />
                : <Moon style={{ width: "15px", height: "15px", color: T.textMuted }} />}
            </motion.div>
          </AnimatePresence>
        </button>
      );
    }

    /* Segmented pill — Raycast style */
    return (
      <div style={{
        display: "inline-flex",
        backgroundColor: T.toggleBg,
        borderRadius: "9px", padding: "3px",
        border: `1px solid ${T.border}`,
        gap: "2px",
      }}>
        {(["dark","light"] as const).map((mode) => {
          const active = theme === mode;
          return (
            <button
              key={mode}
              onClick={() => {
                setTheme(mode);
                localStorage.setItem("africafx-theme", mode);
                document.documentElement.setAttribute("data-theme", mode);
              }}
              style={{
                width: "32px", height: "26px", borderRadius: "6px",
                border: "none", cursor: "pointer",
                backgroundColor: active ? T.accent : "transparent",
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "background-color 0.22s ease",
                boxShadow: active ? `0 1px 6px ${T.accentGlow}` : "none",
              }}
            >
              {mode === "dark"
                ? <Moon style={{ width: "12px", height: "12px", color: active ? "#FFFFFF" : T.textDim, transition: "color 0.18s" }} />
                : <Sun  style={{ width: "12px", height: "12px", color: active ? "#FFFFFF" : T.textDim, transition: "color 0.18s" }} />}
            </button>
          );
        })}
      </div>
    );
  };

  /* ─── SIDEBAR ─── */
  const SidebarContent = ({ isOverlay = false }: { isOverlay?: boolean }) => {
    const wide = expanded || isOverlay;
    return (
      <div style={{
        width: isOverlay ? `${SIDEBAR_EXPANDED}px` : `${sidebarWidth}px`,
        backgroundColor: T.sidebarBg,
        borderRight: `1px solid ${T.sidebarBorder}`,
        display: "flex", flexDirection: "column",
        height: "100%", overflow: "hidden",
        transition: "width 0.26s cubic-bezier(0.4,0,0.2,1)",
        backfaceVisibility: "hidden" as const,
        WebkitBackfaceVisibility: "hidden" as const,
      }}>

        {/* Kente stripe — subtle, tasteful */}
        <div style={{
          height: "2.5px", flexShrink: 0,
          background: "repeating-linear-gradient(90deg,#FF8C00 0,#FF8C00 14px,#1C1C1C 14px,#1C1C1C 28px,#EDE5CC 28px,#EDE5CC 42px,#FF8C00 42px,#FF8C00 56px)",
          opacity: 0.85,
        }} />

        {/* Logo */}
        <div style={{
          padding: wide ? "1.25rem 1.25rem 1rem" : "1.125rem 0 1rem",
          display: "flex", alignItems: "center",
          justifyContent: wide ? "flex-start" : "center",
          gap: "10px",
          borderBottom: `1px solid ${T.sidebarBorder}`,
        }}>
          <div style={{
            width: "36px", height: "36px", minWidth: "36px",
            borderRadius: "11px",
            background: `linear-gradient(135deg, ${T.accent}1A, ${T.accent}33)`,
            border: `1.5px solid ${T.accent}44`,
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
            boxShadow: `0 0 14px ${T.accentGlow}`,
          }}>
            <span style={{ fontFamily: "'Clash Display',sans-serif", fontWeight: 700, fontSize: "0.65rem", color: T.accent, letterSpacing: "0.04em" }}>AFX</span>
          </div>
          <AnimatePresence initial={false}>
            {wide && (
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{    opacity: 0, x: -8 }}
                transition={{ duration: 0.16 }}
              >
                <div style={{ fontFamily: "'Clash Display',sans-serif", fontWeight: 700, fontSize: "0.88rem", color: T.text, letterSpacing: "-0.015em", lineHeight: 1 }}>Africa Fx</div>
                <div style={{ fontSize: "0.56rem", color: T.textDim, fontFamily: "'General Sans',sans-serif", marginTop: "3px", letterSpacing: "0.02em" }}>Your art. Our identity.</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* User pill */}
        <div style={{
          padding: wide ? "0.875rem 1.25rem" : "0.875rem 0",
          borderBottom: `1px solid ${T.sidebarBorder}`,
          display: "flex", alignItems: "center",
          justifyContent: wide ? "flex-start" : "center",
          gap: "10px",
        }}>
          <div style={{ position: "relative", flexShrink: 0 }}>
            <div style={{
              width: "32px", height: "32px", borderRadius: "50%",
              background: `linear-gradient(135deg, #FF8C00, #E06400)`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: "'Clash Display',sans-serif", fontWeight: 700,
              fontSize: "0.82rem", color: "#FFFFFF",
              boxShadow: `0 0 0 2px ${T.sidebarBg}, 0 0 0 3.5px ${T.avatarRing}`,
            }}>
              {initial}
            </div>
            <div style={{ position: "absolute", bottom: "1px", right: "1px", width: "7px", height: "7px", borderRadius: "50%", backgroundColor: "#4CAF50", border: `1.5px solid ${T.sidebarBg}` }} />
          </div>
          <AnimatePresence initial={false}>
            {wide && (
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{    opacity: 0, x: -8 }}
                transition={{ duration: 0.16, delay: 0.04 }}
                style={{ overflow: "hidden", flex: 1 }}
              >
                <div style={{ fontFamily: "'General Sans',sans-serif", fontWeight: 600, fontSize: "0.8rem", color: T.text, whiteSpace: "nowrap" }}>{firstName}</div>
                <div style={{ fontSize: "0.58rem", color: T.textDim, display: "flex", alignItems: "center", gap: "3px" }}>
                  <Sparkles style={{ width: "8px", height: "8px", color: T.accent }} />
                  Animator
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Nav links
            ── NO layoutId here — that was causing the blink ──
            Active state is purely CSS background + border-left.
            Simple, stable, no animation conflicts.
        */}
        <nav style={{ flex: 1, padding: "0.5rem 0", overflowY: "auto", overflowX: "hidden" }}>
          {wide && (
            <div style={{ padding: "0.5rem 1.25rem 0.375rem", fontSize: "0.58rem", fontFamily: "'General Sans',sans-serif", fontWeight: 700, color: T.textDim, letterSpacing: "0.08em", textTransform: "uppercase" }}>
              Menu
            </div>
          )}
          {NAV_LINKS.map((link) => {
            const isActive  = pathname === link.href;
            const isHovered = hovered === link.label;
            return (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                title={!wide ? link.label : undefined}
                onMouseEnter={() => setHovered(link.label)}
                onMouseLeave={() => setHovered(null)}
                style={{
                  display: "flex", alignItems: "center",
                  gap: wide ? "0.75rem" : 0,
                  justifyContent: wide ? "flex-start" : "center",
                  padding: wide ? "0.55rem 1rem" : "0.7rem 0",
                  margin: wide ? "1px 0.625rem" : "1px 0.5rem",
                  borderRadius: "9px",
                  textDecoration: "none",
                  /* ── Stable colour, no animation ── */
                  color: isActive ? T.accent : isHovered ? T.text : T.textMuted,
                  backgroundColor: isActive
                    ? T.activeNavBg
                    : isHovered ? T.navHoverBg : "transparent",
                  border: isActive
                    ? `1px solid ${T.activeBorder}`
                    : "1px solid transparent",
                  /* No transition on border to avoid flash */
                  transition: "color 0.14s, background-color 0.14s",
                  fontSize: "0.82rem",
                  fontFamily: "'General Sans',sans-serif",
                  fontWeight: isActive ? 600 : 400,
                  whiteSpace: "nowrap",
                  position: "relative",
                }}
              >
                {/* Collapsed active indicator — left bar */}
                {isActive && !wide && (
                  <div style={{
                    position: "absolute", left: "-1px",
                    top: "22%", bottom: "22%",
                    width: "3px", borderRadius: "0 3px 3px 0",
                    backgroundColor: T.accent,
                  }} />
                )}

                <link.icon style={{ width: "16px", height: "16px", flexShrink: 0 }} />
                <AnimatePresence initial={false}>
                  {wide && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{    opacity: 0 }}
                      transition={{ duration: 0.12 }}
                      style={{ flex: 1 }}
                    >
                      {link.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        <div style={{
          borderTop: `1px solid ${T.sidebarBorder}`,
          padding: wide ? "0.875rem 1.25rem" : "0.75rem 0",
          display: "flex", flexDirection: "column",
          gap: "0.125rem",
          alignItems: wide ? "stretch" : "center",
        }}>
          {wide ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.25rem 0", marginBottom: "0.375rem" }}>
              <span style={{ fontSize: "0.68rem", color: T.textDim, fontFamily: "'General Sans',sans-serif", letterSpacing: "0.01em" }}>Appearance</span>
              <ThemeToggle compact={false} />
            </div>
          ) : (
            <div style={{ display: "flex", justifyContent: "center", padding: "0.125rem 0", marginBottom: "0.25rem" }}>
              <ThemeToggle compact={true} />
            </div>
          )}

          <Link href="/settings" onClick={() => setMobileOpen(false)}
            style={{ display: "flex", alignItems: "center", justifyContent: wide ? "flex-start" : "center", gap: wide ? "0.625rem" : 0, padding: wide ? "0.45rem 0.25rem" : "0.55rem 0", borderRadius: "8px", textDecoration: "none", color: T.textDim, fontSize: "0.78rem", fontFamily: "'General Sans',sans-serif", transition: "color 0.15s" }}>
            <Settings style={{ width: "14px", height: "14px", flexShrink: 0 }} />
            {wide && "Settings"}
          </Link>

          <button onClick={handleLogout}
            style={{ display: "flex", alignItems: "center", justifyContent: wide ? "flex-start" : "center", gap: wide ? "0.625rem" : 0, padding: wide ? "0.45rem 0.25rem" : "0.55rem 0", width: "100%", background: "none", border: "none", cursor: "pointer", color: T.textDim, fontSize: "0.78rem", fontFamily: "'General Sans',sans-serif", borderRadius: "8px", transition: "color 0.15s" }}>
            <LogOut style={{ width: "14px", height: "14px", flexShrink: 0 }} />
            {wide && "Log Out"}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: T.mainBg, color: T.text, fontFamily: "'Satoshi',sans-serif", transition: "background-color 0.3s, color 0.3s" }}>

      {/* Desktop sidebar */}
      {showSidebar && (
        <div
          style={{
            position: "fixed", top: 0, left: 0, bottom: 0, zIndex: 20, overflow: "visible",
            width: sidebarWidth,
            transition: "width 0.26s cubic-bezier(0.4,0,0.2,1)",
            willChange: "width",
            backfaceVisibility: "hidden",
          }}
        >
          <SidebarContent />
          <motion.button
            onClick={() => setExpanded(!expanded)}
            whileHover={{ scale: 1.10, boxShadow: `0 4px 18px ${T.accentGlow}` }}
            whileTap={{ scale: 0.90 }}
            title={expanded ? "Collapse" : "Expand"}
            style={{ position: "absolute", top: "50%", right: "-13px", transform: "translateY(-50%)", width: "26px", height: "26px", borderRadius: "50%", backgroundColor: T.accent, border: `2.5px solid ${T.mainBg}`, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 2px 10px ${T.accentGlow}`, zIndex: 22 }}
          >
            <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.22, ease: "easeInOut" }}>
              <ChevronRight style={{ width: "12px", height: "12px", color: "#FFFFFF" }} />
            </motion.div>
          </motion.button>
        </div>
      )}

      {/* Mobile overlay */}
      <AnimatePresence>
        {showMobileSidebar && (
          <>
            <motion.div key="bd" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
              onClick={() => setMobileOpen(false)}
              style={{ position: "fixed", inset: 0, backgroundColor: T.overlayBg, zIndex: 30, backdropFilter: "blur(4px)" }}
            />
            <motion.div key="drawer"
              initial={{ x: -(SIDEBAR_EXPANDED + 20) }}
              animate={{ x: 0 }}
              exit={{    x: -(SIDEBAR_EXPANDED + 20) }}
              transition={{ type: "spring", stiffness: 360, damping: 32 }}
              style={{ position: "fixed", top: 0, left: 0, bottom: 0, zIndex: 31 }}
            >
              <SidebarContent isOverlay />
              <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => setMobileOpen(false)}
                style={{ position: "absolute", top: "14px", right: "-44px", width: "34px", height: "34px", borderRadius: "50%", backgroundColor: T.accent, border: `2px solid ${T.mainBg}`, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 4px 14px ${T.accentGlow}` }}>
                <X style={{ width: "14px", height: "14px", color: "#FFFFFF" }} />
              </motion.button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div
        style={{
          flex: 1, display: "flex", flexDirection: "column", minWidth: 0,
          paddingBottom: isMobile || isTablet ? "72px" : 0,
          marginLeft: showSidebar ? sidebarWidth : 0,
          transition: "margin-left 0.26s cubic-bezier(0.4,0,0.2,1)",
        }}
      >
        {/* Mobile topbar */}
        {(isMobile || isTablet) && (
          <div style={{ position: "sticky", top: 0, zIndex: 19, backgroundColor: T.topbarBg, backdropFilter: "blur(18px)", WebkitBackdropFilter: "blur(18px)", borderBottom: `1px solid ${T.border}`, padding: "0.75rem 1.25rem", display: "flex", alignItems: "center", gap: "0.875rem" }}>
            <button onClick={() => setMobileOpen(true)} style={{ width: "38px", height: "38px", borderRadius: "11px", backgroundColor: theme === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)", border: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
              <Menu style={{ width: "17px", height: "17px", color: T.textMuted }} />
            </button>
            <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{ width: "26px", height: "26px", borderRadius: "8px", background: `linear-gradient(135deg, ${T.accent}1A, ${T.accent}33)`, border: `1px solid ${T.accent}44`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontFamily: "'Clash Display',sans-serif", fontWeight: 700, fontSize: "0.56rem", color: T.accent }}>AFX</span>
              </div>
              <span style={{ fontFamily: "'Clash Display',sans-serif", fontWeight: 700, fontSize: "0.95rem", color: T.text }}>Africa Fx</span>
            </div>
            <ThemeToggle compact={true} />
          </div>
        )}

        <main style={{ flex: 1, overflowX: "hidden" }}>{children}</main>
      </div>

      {/* Mobile bottom nav */}
      {(isMobile || isTablet) && (
        <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 20, backgroundColor: T.bottomNavBg, borderTop: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "space-around", padding: "0.5rem 0 calc(0.625rem + env(safe-area-inset-bottom))", backdropFilter: "blur(18px)", WebkitBackdropFilter: "blur(18px)" }}>
          {BOTTOM_NAV.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link key={link.label} href={link.href}
                style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "3px", textDecoration: "none", padding: "0.3rem 0.875rem", borderRadius: "12px", color: isActive ? T.accent : T.textDim, position: "relative", minWidth: "52px", transition: "color 0.16s" }}
              >
                {isActive && (
                  <div style={{ position: "absolute", top: "2px", left: "50%", transform: "translateX(-50%)", width: "18px", height: "2.5px", borderRadius: "999px", backgroundColor: T.accent }} />
                )}
                <link.icon style={{ width: "20px", height: "20px" }} />
                <span style={{ fontSize: "0.57rem", fontFamily: "'General Sans',sans-serif", fontWeight: isActive ? 600 : 400 }}>{link.label}</span>
              </Link>
            );
          })}
        </div>
      )}

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500;600&display=swap');
        @media (max-width: 767px) {
          .dash-grid-4    { grid-template-columns: 1fr 1fr !important; }
          .dash-grid-2    { grid-template-columns: 1fr !important; }
          .dash-grid-stats{ grid-template-columns: 1fr 1fr !important; }
          .dash-hero      { height: 180px !important; }
          .dash-padding   { padding: 1rem !important; }
          .hide-mobile    { display: none !important; }
        }
        @media (min-width: 768px) and (max-width: 1023px) {
          .dash-grid-4  { grid-template-columns: 1fr 1fr !important; }
          .dash-padding { padding: 1.25rem !important; }
        }
        @media (min-width: 1024px) {
          .dash-grid-4    { grid-template-columns: repeat(4,1fr); }
          .dash-grid-2    { grid-template-columns: 1fr 1fr; }
          .dash-grid-stats{ grid-template-columns: repeat(4,1fr); }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        nav a:focus-visible { outline: 2px solid rgba(255,140,0,0.55); outline-offset: 2px; border-radius: 9px; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,140,0,0.18); border-radius: 999px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(255,140,0,0.40); }
        nav::-webkit-scrollbar { width: 0; }
      `}</style>
    </div>
  );
}
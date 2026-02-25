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
  sidebarBorder:"#272320",
  mainBg:       "#0F0D0B",
  topbarBg:     "rgba(15,13,11,0.92)",
  text:         "#FAF8F0",
  textMuted:    "#B8B4AC",
  textDim:      "#6A6660",
  border:       "#272320",
  accent:       "#FF8C00",
  accentText:   "#FFFFFF",
  accentSoft:   "rgba(255,140,0,0.08)",
  accentGlow:   "rgba(255,140,0,0.20)",
  activeNavBg:  "rgba(255,140,0,0.08)",
  overlayBg:    "rgba(0,0,0,0.70)",
  bottomNavBg:  "rgba(22,20,18,0.98)",
  navHoverBg:   "rgba(255,255,255,0.03)",
  cardBg:       "#1C1916",
  avatarRing:   "rgba(255,140,0,0.30)",
};

const LIGHT = {
  sidebarBg:    "#F0E8D4",
  sidebarBorder:"#DDD0B8",
  mainBg:       "#FAF8F0",
  topbarBg:     "rgba(250,248,240,0.92)",
  text:         "#1C1C1C",
  textMuted:    "#5A5550",
  textDim:      "#9A9590",
  border:       "#DDD0B8",
  accent:       "#FF8C00",
  accentText:   "#FFFFFF",
  accentSoft:   "rgba(255,140,0,0.08)",
  accentGlow:   "rgba(255,140,0,0.15)",
  activeNavBg:  "rgba(255,140,0,0.10)",
  overlayBg:    "rgba(0,0,0,0.30)",
  bottomNavBg:  "rgba(240,232,212,0.98)",
  navHoverBg:   "rgba(0,0,0,0.03)",
  cardBg:       "#FFFFFF",
  avatarRing:   "rgba(255,140,0,0.25)",
};

const SIDEBAR_EXPANDED  = 224;
const SIDEBAR_COLLAPSED = 64;

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname  = usePathname();
  const [theme, setTheme]           = useState<"dark"|"light">("dark");
  const [expanded, setExpanded]     = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile]     = useState(false);
  const [isTablet, setIsTablet]     = useState(false);
  const [hovered, setHovered]       = useState<string|null>(null);
  const [user, setUser]             = useState<{ email?: string; user_metadata?: { full_name?: string } } | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

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

  const ThemeToggle = ({ size = "full" }: { size?: "full"|"icon" }) => {
    if (size === "icon") {
      return (
        <motion.button
          onClick={toggleTheme}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          style={{
            width: "34px", height: "34px",
            borderRadius: "10px",
            border: `1px solid ${T.border}`,
            backgroundColor: T.cardBg,
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", flexShrink: 0,
            position: "relative", overflow: "hidden",
          }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={theme}
              initial={{ y: 10, opacity: 0, rotate: -20 }}
              animate={{ y: 0,  opacity: 1, rotate: 0   }}
              exit={{    y: -10, opacity: 0, rotate: 20  }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              {theme === "dark"
                ? <Sun  style={{ width: "15px", height: "15px", color: T.accent }} />
                : <Moon style={{ width: "15px", height: "15px", color: T.textMuted }} />}
            </motion.div>
          </AnimatePresence>
        </motion.button>
      );
    }

    return (
      <div style={{
        display: "flex", alignItems: "center",
        backgroundColor: theme === "dark" ? "#0F0D0B" : "#E4DBC8",
        borderRadius: "10px",
        padding: "3px",
        border: `1px solid ${T.border}`,
        gap: "2px",
        position: "relative",
      }}>
        {(["dark","light"] as const).map((mode) => {
          const isActive = theme === mode;
          return (
            <motion.button
              key={mode}
              onClick={() => {
                setTheme(mode);
                localStorage.setItem("africafx-theme", mode);
                document.documentElement.setAttribute("data-theme", mode);
              }}
              whileTap={{ scale: 0.94 }}
              style={{
                width: "30px", height: "24px",
                borderRadius: "7px",
                border: "none",
                cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                position: "relative",
                backgroundColor: isActive ? T.accent : "transparent",
                transition: "background-color 0.2s",
                zIndex: 1,
              }}
            >
              {isActive && (
                <motion.div
                  layoutId="togglePill"
                  style={{
                    position: "absolute", inset: 0,
                    borderRadius: "7px",
                    backgroundColor: T.accent,
                    boxShadow: `0 1px 8px ${T.accentGlow}`,
                  }}
                  transition={{ type: "spring", stiffness: 500, damping: 35 }}
                />
              )}
              <div style={{ position: "relative", zIndex: 2 }}>
                {mode === "dark"
                  ? <Moon style={{ width: "12px", height: "12px", color: isActive ? "#FFFFFF" : T.textDim }} />
                  : <Sun  style={{ width: "12px", height: "12px", color: isActive ? "#FFFFFF" : T.textDim }} />}
              </div>
            </motion.button>
          );
        })}
      </div>
    );
  };

  /* ── SIDEBAR INNER ── */
  const SidebarContent = ({ isOverlay = false }: { isOverlay?: boolean }) => {
    const wide = expanded || isOverlay;
    return (
      <div style={{
        width: "100%",
        backgroundColor: T.sidebarBg,
        borderRight: `1px solid ${T.sidebarBorder}`,
        display: "flex", flexDirection: "column",
        height: "100%",
        overflow: "hidden",
      }}>

        <div style={{
          height: "2px", flexShrink: 0,
          background: `linear-gradient(90deg, ${T.accent} 0%, ${T.accent}88 40%, ${T.sidebarBorder} 60%, ${T.accent}44 80%, ${T.accent} 100%)`,
        }} />

        <div style={{
          padding: wide ? "1.25rem 1.25rem 1rem" : "1.25rem 0 1rem",
          display: "flex", alignItems: "center",
          justifyContent: wide ? "flex-start" : "center",
          gap: "10px",
          borderBottom: `1px solid ${T.sidebarBorder}`,
        }}>
          <div style={{
            width: "36px", height: "36px", minWidth: "36px",
            borderRadius: "11px",
            background: `linear-gradient(135deg, ${T.accent}22, ${T.accent}44)`,
            border: `1.5px solid ${T.accent}55`,
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: `0 0 12px ${T.accentGlow}`,
            flexShrink: 0,
          }}>
            <span style={{ fontFamily: "'Clash Display',sans-serif", fontWeight: 700, fontSize: "0.68rem", color: T.accent, letterSpacing: "0.04em" }}>AFX</span>
          </div>

          <AnimatePresence>
            {wide && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{    opacity: 0, x: -10 }}
                transition={{ duration: 0.18 }}
              >
                <div style={{ fontFamily: "'Clash Display',sans-serif", fontWeight: 700, fontSize: "0.9rem", color: T.text, letterSpacing: "-0.015em", lineHeight: 1 }}>Africa Fx</div>
                <div style={{ fontSize: "0.56rem", color: T.textDim, fontFamily: "'General Sans',sans-serif", marginTop: "3px", letterSpacing: "0.02em" }}>Your art. Our identity.</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div style={{
          padding: wide ? "0.875rem 1.25rem" : "0.875rem 0",
          borderBottom: `1px solid ${T.sidebarBorder}`,
          display: "flex", alignItems: "center",
          justifyContent: wide ? "flex-start" : "center",
          gap: "10px",
          cursor: "pointer",
        }}>
          <div style={{ position: "relative", flexShrink: 0 }}>
            <div style={{
              width: "32px", height: "32px",
              borderRadius: "50%",
              background: `linear-gradient(135deg, ${T.accent}, #E06400)`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: "'Clash Display',sans-serif", fontWeight: 700,
              fontSize: "0.82rem", color: "#FFFFFF",
              boxShadow: `0 0 0 2px ${T.sidebarBg}, 0 0 0 3.5px ${T.avatarRing}`,
            }}>
              {initial}
            </div>
            <div style={{ position: "absolute", bottom: "1px", right: "1px", width: "7px", height: "7px", borderRadius: "50%", backgroundColor: "#4CAF50", border: `1.5px solid ${T.sidebarBg}` }} />
          </div>

          <AnimatePresence>
            {wide && (
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{    opacity: 0, x: -8 }}
                transition={{ duration: 0.16 }}
                style={{ overflow: "hidden", flex: 1 }}
              >
                <div style={{ fontFamily: "'General Sans',sans-serif", fontWeight: 600, fontSize: "0.8rem", color: T.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{firstName}</div>
                <div style={{ fontSize: "0.58rem", color: T.textDim, fontFamily: "'General Sans',sans-serif", display: "flex", alignItems: "center", gap: "3px" }}>
                  <Sparkles style={{ width: "8px", height: "8px", color: T.accent }} />
                  Animator
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <nav style={{ flex: 1, padding: "0.5rem 0", overflowY: "auto", overflowX: "hidden" }}>
          {wide && (
            <div style={{ padding: "0.25rem 1.25rem 0.375rem", fontSize: "0.58rem", fontFamily: "'General Sans',sans-serif", fontWeight: 700, color: T.textDim, letterSpacing: "0.08em", textTransform: "uppercase" }}>
              Menu
            </div>
          )}
          {NAV_LINKS.map((link, idx) => {
            const isActive  = pathname === link.href;
            const isHovered = hovered === link.label;
            return (
              <motion.div
                key={link.label}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.22, delay: idx * 0.03 }}
              >
                <Link
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  title={!wide ? link.label : undefined}
                  onMouseEnter={() => setHovered(link.label)}
                  onMouseLeave={() => setHovered(null)}
                  style={{
                    display: "flex", alignItems: "center",
                    gap: wide ? "0.75rem" : 0,
                    justifyContent: wide ? "flex-start" : "center",
                    padding: wide ? "0.525rem 1rem" : "0.7rem 0",
                    margin: wide ? "1px 0.625rem" : "1px 0.5rem",
                    borderRadius: "9px",
                    textDecoration: "none",
                    color: isActive ? T.accent : isHovered ? T.text : T.textMuted,
                    backgroundColor: isActive ? T.activeNavBg : isHovered ? T.navHoverBg : "transparent",
                    transition: "color 0.15s, background-color 0.15s",
                    fontSize: "0.82rem",
                    fontFamily: "'General Sans',sans-serif",
                    fontWeight: isActive ? 600 : 400,
                    whiteSpace: "nowrap",
                    position: "relative",
                  }}
                >
                  {isActive && (
                    <motion.div
                      layoutId="navActivePill"
                      style={{
                        position: "absolute", inset: 0,
                        borderRadius: "9px",
                        backgroundColor: T.activeNavBg,
                        border: `1px solid ${T.accent}22`,
                      }}
                      transition={{ type: "spring", stiffness: 400, damping: 32 }}
                    />
                  )}
                  {isActive && !wide && (
                    <motion.div
                      layoutId="collapsedDot"
                      style={{ position: "absolute", left: "-1px", top: "50%", transform: "translateY(-50%)", width: "3px", height: "60%", borderRadius: "0 3px 3px 0", backgroundColor: T.accent }}
                    />
                  )}
                  <div style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", gap: wide ? "0.75rem" : 0, justifyContent: wide ? "flex-start" : "center", width: "100%" }}>
                    <link.icon style={{ width: "16px", height: "16px", flexShrink: 0 }} />
                    <AnimatePresence>
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
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </nav>

        <div style={{
          borderTop: `1px solid ${T.sidebarBorder}`,
          padding: wide ? "0.875rem 1.25rem" : "0.75rem 0",
          display: "flex", flexDirection: "column",
          gap: wide ? "0.125rem" : "0.25rem",
          alignItems: wide ? "stretch" : "center",
        }}>
          {wide ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.375rem 0", marginBottom: "0.25rem" }}>
              <span style={{ fontSize: "0.7rem", color: T.textDim, fontFamily: "'General Sans',sans-serif" }}>Appearance</span>
              <ThemeToggle size="full" />
            </div>
          ) : (
            <div style={{ display: "flex", justifyContent: "center", padding: "0.25rem 0", marginBottom: "0.125rem" }}>
              <ThemeToggle size="icon" />
            </div>
          )}
          <Link
            href="/settings"
            onClick={() => setMobileOpen(false)}
            style={{ display: "flex", alignItems: "center", justifyContent: wide ? "flex-start" : "center", gap: wide ? "0.625rem" : 0, padding: wide ? "0.45rem 0.375rem" : "0.55rem 0", borderRadius: "8px", textDecoration: "none", color: T.textDim, fontSize: "0.78rem", fontFamily: "'General Sans',sans-serif", transition: "color 0.15s" }}
          >
            <Settings style={{ width: "14px", height: "14px", flexShrink: 0 }} />
            {wide && "Settings"}
          </Link>
          <button
            onClick={handleLogout}
            style={{ display: "flex", alignItems: "center", justifyContent: wide ? "flex-start" : "center", gap: wide ? "0.625rem" : 0, padding: wide ? "0.45rem 0.375rem" : "0.55rem 0", width: "100%", background: "none", border: "none", cursor: "pointer", color: T.textDim, fontSize: "0.78rem", fontFamily: "'General Sans',sans-serif", borderRadius: "8px", transition: "color 0.15s" }}
          >
            <LogOut style={{ width: "14px", height: "14px", flexShrink: 0 }} />
            {wide && "Log Out"}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: T.mainBg, color: T.text, fontFamily: "'Satoshi',sans-serif", transition: "background-color 0.35s, color 0.35s" }}>

      {/* ── Desktop sidebar — plain div + CSS transition, no Framer Motion ── */}
      {showSidebar && (
        <div
          style={{
            position: "fixed", top: 0, left: 0, bottom: 0, zIndex: 20, overflow: "visible",
            width: `${sidebarWidth}px`,
            transition: "width 0.28s cubic-bezier(0.4,0,0.2,1)",
          }}
        >
          <SidebarContent />
          <button
            onClick={() => setExpanded(!expanded)}
            title={expanded ? "Collapse" : "Expand"}
            style={{
              position: "absolute", top: "50%", right: "-13px",
              transform: "translateY(-50%)",
              width: "26px", height: "26px", borderRadius: "50%",
              backgroundColor: T.accent,
              border: `2px solid ${T.mainBg}`,
              cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: `0 2px 10px ${T.accentGlow}`,
              zIndex: 22,
              transition: "box-shadow 0.2s",
            }}
            onMouseEnter={e => (e.currentTarget.style.boxShadow = `0 4px 16px ${T.accentGlow}`)}
            onMouseLeave={e => (e.currentTarget.style.boxShadow = `0 2px 10px ${T.accentGlow}`)}
          >
            <ChevronRight style={{
              width: "13px", height: "13px", color: "#FFFFFF",
              transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.28s cubic-bezier(0.4,0,0.2,1)",
            }} />
          </button>
        </div>
      )}

      {/* ── Mobile overlay sidebar ── */}
      <AnimatePresence>
        {showMobileSidebar && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{    opacity: 0 }}
              transition={{ duration: 0.22 }}
              onClick={() => setMobileOpen(false)}
              style={{ position: "fixed", inset: 0, backgroundColor: T.overlayBg, zIndex: 30, backdropFilter: "blur(4px)" }}
            />
            <motion.div
              key="drawer"
              initial={{ x: -SIDEBAR_EXPANDED - 20 }}
              animate={{ x: 0 }}
              exit={{    x: -SIDEBAR_EXPANDED - 20 }}
              transition={{ type: "spring", stiffness: 380, damping: 34 }}
              style={{ position: "fixed", top: 0, left: 0, bottom: 0, zIndex: 31 }}
            >
              <SidebarContent isOverlay />
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setMobileOpen(false)}
                style={{ position: "absolute", top: "14px", right: "-44px", width: "34px", height: "34px", borderRadius: "50%", backgroundColor: T.accent, border: `2px solid ${T.mainBg}`, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 4px 16px ${T.accentGlow}` }}
              >
                <X style={{ width: "14px", height: "14px", color: "#FFFFFF" }} />
              </motion.button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Main content — plain div + CSS transition, no Framer Motion ── */}
      <div
        style={{
          flex: 1, display: "flex", flexDirection: "column", minWidth: 0,
          paddingBottom: isMobile || isTablet ? "72px" : 0,
          marginLeft: showSidebar ? `${sidebarWidth}px` : 0,
          transition: "margin-left 0.28s cubic-bezier(0.4,0,0.2,1)",
        }}
      >
        {/* Mobile topbar */}
        {(isMobile || isTablet) && (
          <div style={{ position: "sticky", top: 0, zIndex: 19, backgroundColor: T.topbarBg, backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", borderBottom: `1px solid ${T.border}`, padding: "0.75rem 1.25rem", display: "flex", alignItems: "center", gap: "0.875rem" }}>
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={() => setMobileOpen(true)}
              style={{ width: "38px", height: "38px", borderRadius: "11px", backgroundColor: theme === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)", border: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}
            >
              <Menu style={{ width: "17px", height: "17px", color: T.textMuted }} />
            </motion.button>
            <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{ width: "26px", height: "26px", borderRadius: "8px", background: `linear-gradient(135deg, ${T.accent}22, ${T.accent}44)`, border: `1px solid ${T.accent}44`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontFamily: "'Clash Display',sans-serif", fontWeight: 700, fontSize: "0.56rem", color: T.accent }}>AFX</span>
              </div>
              <span style={{ fontFamily: "'Clash Display',sans-serif", fontWeight: 700, fontSize: "0.95rem", color: T.text }}>Africa Fx</span>
            </div>
            <ThemeToggle size="icon" />
          </div>
        )}

        <main style={{ flex: 1, overflowX: "hidden" }}>
          {children}
        </main>
      </div>

      {/* ── Mobile bottom nav ── */}
      {(isMobile || isTablet) && (
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 28, delay: 0.2 }}
          style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 20, backgroundColor: T.bottomNavBg, borderTop: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "space-around", padding: "0.5rem 0 calc(0.625rem + env(safe-area-inset-bottom))", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" }}
        >
          {BOTTOM_NAV.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.label}
                href={link.href}
                style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "3px", textDecoration: "none", padding: "0.3rem 0.875rem", borderRadius: "12px", color: isActive ? T.accent : T.textDim, position: "relative", minWidth: "52px", transition: "color 0.18s" }}
              >
                {isActive && (
                  <motion.div
                    layoutId="bottomDot"
                    style={{ position: "absolute", top: "2px", left: "50%", transform: "translateX(-50%)", width: "18px", height: "2.5px", borderRadius: "999px", backgroundColor: T.accent }}
                    transition={{ type: "spring", stiffness: 450, damping: 32 }}
                  />
                )}
                <link.icon style={{ width: "20px", height: "20px" }} />
                <span style={{ fontSize: "0.57rem", fontFamily: "'General Sans',sans-serif", fontWeight: isActive ? 600 : 400 }}>{link.label}</span>
              </Link>
            );
          })}
        </motion.div>
      )}

      <style jsx global>{`
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
        nav::-webkit-scrollbar { width: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,140,0,0.20); border-radius: 999px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(255,140,0,0.45); }
        *:focus-visible { outline: 2px solid rgba(255,140,0,0.60); outline-offset: 2px; border-radius: 6px; }
        nav a { transition: color 0.15s, background-color 0.15s, transform 0.15s; }
      `}</style>
    </div>
  );
}
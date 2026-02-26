"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  Home, BookOpen, Calendar, Image, Users, Tag,
  User, Settings, LogOut, Sun, Moon,
  ChevronRight, Menu, X, Sparkles
} from "lucide-react";
import { supabase } from "@/lib/supabase";

// ─── Nav links ───────────────────────────────────────────
const NAV_LINKS = [
  { label: "Home",      href: "/dashboard",  icon: Home      },
  { label: "Courses",   href: "/courses",    icon: BookOpen  },
  { label: "Events",    href: "/events",     icon: Calendar  },
  { label: "Portfolio", href: "/portfolio",  icon: Image     },
  { label: "Community", href: "/community",  icon: Users     },
  { label: "Promo",     href: "/promo",      icon: Tag       },
  { label: "Profile",   href: "/profile",    icon: User      },
];

const BOTTOM_NAV = [
  { label: "Home",      href: "/dashboard",  icon: Home      },
  { label: "Courses",   href: "/courses",    icon: BookOpen  },
  { label: "Community", href: "/community",  icon: Users     },
  { label: "Portfolio", href: "/portfolio",  icon: Image     },
  { label: "Profile",   href: "/profile",    icon: User      },
];

// ─── Colour tokens ───────────────────────────────────────
const DARK = {
  sidebarBg:    "#161412",
  sidebarBorder:"#272320",
  mainBg:       "#0F0D0B",
  topbarBg:     "rgba(15,13,11,0.95)",
  text:         "#FAF8F0",
  textMuted:    "#B8B4AC",
  textDim:      "#6A6660",
  border:       "#272320",
  accent:       "#FF8C00",
  accentSoft:   "rgba(255,140,0,0.09)",
  accentGlow:   "rgba(255,140,0,0.22)",
  activeNavBg:  "rgba(255,140,0,0.09)",
  overlayBg:    "rgba(0,0,0,0.72)",
  bottomNavBg:  "rgba(22,20,18,0.98)",
  navHoverBg:   "rgba(255,255,255,0.04)",
  cardBg:       "#1C1916",
  avatarRing:   "rgba(255,140,0,0.30)",
  toggleBg:     "#0A0806",
};

const LIGHT = {
  sidebarBg:    "#F0E8D4",
  sidebarBorder:"#DDD0B8",
  mainBg:       "#FAF8F0",
  topbarBg:     "rgba(250,248,240,0.95)",
  text:         "#1C1C1C",
  textMuted:    "#5A5550",
  textDim:      "#9A9590",
  border:       "#DDD0B8",
  accent:       "#FF8C00",
  accentSoft:   "rgba(255,140,0,0.09)",
  accentGlow:   "rgba(255,140,0,0.18)",
  activeNavBg:  "rgba(255,140,0,0.10)",
  overlayBg:    "rgba(0,0,0,0.32)",
  bottomNavBg:  "rgba(240,232,212,0.98)",
  navHoverBg:   "rgba(0,0,0,0.04)",
  cardBg:       "#FFFFFF",
  avatarRing:   "rgba(255,140,0,0.25)",
  toggleBg:     "#E4DBC8",
};

const W_EXPANDED  = 224;
const W_COLLAPSED = 64;

// ─── Main Component ──────────────────────────────────────
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const [theme,      setTheme     ] = useState<"dark"|"light">("dark");
  const [expanded,   setExpanded  ] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile,   setIsMobile  ] = useState(false);
  const [isTablet,   setIsTablet  ] = useState(false);
  const [hovered,    setHovered   ] = useState<string|null>(null);
  const [user,       setUser      ] = useState<{ email?: string; user_metadata?: { full_name?: string } } | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("africafx-theme") as "dark"|"light" | null;
    if (saved) {
      setTheme(saved);
      document.documentElement.setAttribute("data-theme", saved);
    }
    const obs = new MutationObserver(() => {
      const t = document.documentElement.getAttribute("data-theme") as "dark"|"light";
      if (t) setTheme(t);
    });
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    const onResize = () => {
      setIsMobile(window.innerWidth < 768);
      setIsTablet(window.innerWidth >= 768 && window.innerWidth < 1024);
    };
    onResize();
    window.addEventListener("resize", onResize);
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    return () => { obs.disconnect(); window.removeEventListener("resize", onResize); };
  }, []);

  const T         = theme === "dark" ? DARK : LIGHT;
  const isDesktop = !isMobile && !isTablet;
  const sidebarW  = expanded ? W_EXPANDED : W_COLLAPSED;
  const firstName = user?.user_metadata?.full_name?.split(" ")[0] ?? user?.email?.split("@")[0] ?? "Creative";
  const initial   = firstName.charAt(0).toUpperCase();

  const switchTheme = (mode: "dark"|"light") => {
    setTheme(mode);
    localStorage.setItem("africafx-theme", mode);
    document.documentElement.setAttribute("data-theme", mode);
  };

  // ── Theme Toggle ─────────────────────────────────────
  const ThemeToggle = ({ compact = false }: { compact?: boolean }) => {
    if (compact) {
      return (
        <button
          onClick={() => switchTheme(theme === "dark" ? "light" : "dark")}
          style={{ width: 34, height: 34, borderRadius: 10, border: `1px solid ${T.border}`, backgroundColor: T.cardBg, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}
        >
          {theme === "dark"
            ? <Sun  style={{ width: 15, height: 15, color: T.accent }} />
            : <Moon style={{ width: 15, height: 15, color: T.textMuted }} />}
        </button>
      );
    }
    return (
      <div style={{ display: "flex", backgroundColor: T.toggleBg, borderRadius: 9, padding: 3, border: `1px solid ${T.border}`, gap: 2 }}>
        {(["dark","light"] as const).map(mode => (
          <button key={mode} onClick={() => switchTheme(mode)}
            style={{ width: 30, height: 24, borderRadius: 6, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: theme === mode ? T.accent : "transparent", transition: "background-color 0.2s" }}
          >
            {mode === "dark"
              ? <Moon style={{ width: 11, height: 11, color: theme === mode ? "#fff" : T.textDim }} />
              : <Sun  style={{ width: 11, height: 11, color: theme === mode ? "#fff" : T.textDim }} />}
          </button>
        ))}
      </div>
    );
  };

  // ── Sidebar Inner ─────────────────────────────────────
  // This fills 100% of its parent — parent owns the width
  const SidebarInner = ({ wide = false }: { wide?: boolean }) => (
    <div style={{ width: "100%", height: "100%", backgroundColor: T.sidebarBg, borderRight: `1px solid ${T.sidebarBorder}`, display: "flex", flexDirection: "column", overflow: "hidden" }}>

      {/* Kente stripe */}
      <div style={{ height: 2, flexShrink: 0, background: `linear-gradient(90deg, ${T.accent} 0%, ${T.accent}99 35%, ${T.sidebarBorder} 55%, ${T.accent}55 75%, ${T.accent} 100%)` }} />

      {/* Logo */}
      <div style={{ padding: wide ? "1.25rem 1.25rem 1rem" : "1.25rem 0 1rem", display: "flex", alignItems: "center", justifyContent: wide ? "flex-start" : "center", gap: 10, borderBottom: `1px solid ${T.sidebarBorder}` }}>
        <div style={{ width: 36, height: 36, minWidth: 36, borderRadius: 11, background: `linear-gradient(135deg, ${T.accent}22, ${T.accent}44)`, border: `1.5px solid ${T.accent}55`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 0 12px ${T.accentGlow}`, flexShrink: 0 }}>
          <span style={{ fontFamily: "'Clash Display',sans-serif", fontWeight: 700, fontSize: "0.65rem", color: T.accent, letterSpacing: "0.04em" }}>AFX</span>
        </div>
        {wide && (
          <div>
            <div style={{ fontFamily: "'Clash Display',sans-serif", fontWeight: 700, fontSize: "0.9rem", color: T.text, letterSpacing: "-0.015em", lineHeight: 1 }}>Africa Fx</div>
            <div style={{ fontSize: "0.55rem", color: T.textDim, fontFamily: "'General Sans',sans-serif", marginTop: 3 }}>Your art. Our identity.</div>
          </div>
        )}
      </div>

      {/* User pill */}
      <div style={{ padding: wide ? "0.875rem 1.25rem" : "0.875rem 0", borderBottom: `1px solid ${T.sidebarBorder}`, display: "flex", alignItems: "center", justifyContent: wide ? "flex-start" : "center", gap: 10 }}>
        <div style={{ position: "relative", flexShrink: 0 }}>
          <div style={{ width: 32, height: 32, borderRadius: "50%", background: `linear-gradient(135deg, ${T.accent}, #E06400)`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Clash Display',sans-serif", fontWeight: 700, fontSize: "0.82rem", color: "#fff", boxShadow: `0 0 0 2px ${T.sidebarBg}, 0 0 0 3.5px ${T.avatarRing}` }}>
            {initial}
          </div>
          <div style={{ position: "absolute", bottom: 1, right: 1, width: 7, height: 7, borderRadius: "50%", backgroundColor: "#4CAF50", border: `1.5px solid ${T.sidebarBg}` }} />
        </div>
        {wide && (
          <div style={{ overflow: "hidden", flex: 1 }}>
            <div style={{ fontFamily: "'General Sans',sans-serif", fontWeight: 600, fontSize: "0.8rem", color: T.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{firstName}</div>
            <div style={{ fontSize: "0.58rem", color: T.textDim, display: "flex", alignItems: "center", gap: 3 }}>
              <Sparkles style={{ width: 8, height: 8, color: T.accent }} />
              Animator
            </div>
          </div>
        )}
      </div>

      {/* Nav links */}
      <nav style={{ flex: 1, padding: "0.5rem 0", overflowY: "auto", overflowX: "hidden" }}>
        {wide && (
          <div style={{ padding: "0.25rem 1.25rem 0.375rem", fontSize: "0.58rem", fontFamily: "'General Sans',sans-serif", fontWeight: 700, color: T.textDim, letterSpacing: "0.08em", textTransform: "uppercase" }}>
            Menu
          </div>
        )}
        {NAV_LINKS.map(link => {
          const active = pathname === link.href;
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
                padding: wide ? "0.525rem 1rem" : "0.7rem 0",
                margin: wide ? "1px 0.625rem" : "1px 0.5rem",
                borderRadius: 9,
                textDecoration: "none",
                color: active ? T.accent : hovered === link.label ? T.text : T.textMuted,
                backgroundColor: active ? T.activeNavBg : hovered === link.label ? T.navHoverBg : "transparent",
                border: `1px solid ${active ? T.accent + "22" : "transparent"}`,
                transition: "color 0.15s, background-color 0.15s",
                fontSize: "0.82rem",
                fontFamily: "'General Sans',sans-serif",
                fontWeight: active ? 600 : 400,
                whiteSpace: "nowrap",
                position: "relative",
              }}
            >
              {active && !wide && (
                <div style={{ position: "absolute", left: -1, top: "20%", bottom: "20%", width: 3, borderRadius: "0 3px 3px 0", backgroundColor: T.accent }} />
              )}
              <link.icon style={{ width: 16, height: 16, flexShrink: 0 }} />
              {wide && <span style={{ flex: 1 }}>{link.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Bottom actions */}
      <div style={{ borderTop: `1px solid ${T.sidebarBorder}`, padding: wide ? "0.875rem 1.25rem" : "0.75rem 0", display: "flex", flexDirection: "column", gap: wide ? 2 : 4, alignItems: wide ? "stretch" : "center" }}>
        {wide ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.375rem 0", marginBottom: 4 }}>
            <span style={{ fontSize: "0.7rem", color: T.textDim, fontFamily: "'General Sans',sans-serif" }}>Appearance</span>
            <ThemeToggle compact={false} />
          </div>
        ) : (
          <div style={{ marginBottom: 4 }}><ThemeToggle compact /></div>
        )}
        <Link href="/settings" onClick={() => setMobileOpen(false)}
          style={{ display: "flex", alignItems: "center", justifyContent: wide ? "flex-start" : "center", gap: wide ? "0.625rem" : 0, padding: wide ? "0.45rem 0.375rem" : "0.55rem 0", borderRadius: 8, textDecoration: "none", color: T.textDim, fontSize: "0.78rem", fontFamily: "'General Sans',sans-serif" }}>
          <Settings style={{ width: 14, height: 14, flexShrink: 0 }} />
          {wide && "Settings"}
        </Link>
        <button onClick={async () => { await supabase.auth.signOut(); window.location.href = "/login"; }}
          style={{ display: "flex", alignItems: "center", justifyContent: wide ? "flex-start" : "center", gap: wide ? "0.625rem" : 0, padding: wide ? "0.45rem 0.375rem" : "0.55rem 0", width: "100%", background: "none", border: "none", cursor: "pointer", color: T.textDim, fontSize: "0.78rem", fontFamily: "'General Sans',sans-serif", borderRadius: 8 }}>
          <LogOut style={{ width: 14, height: 14, flexShrink: 0 }} />
          {wide && "Log Out"}
        </button>
      </div>
    </div>
  );

  // ── RENDER ───────────────────────────────────────────
  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "transparent", color: T.text, fontFamily: "'Satoshi',sans-serif", transition: "color 0.3s" }}>

      {/* DESKTOP SIDEBAR
          - Only this div controls the width
          - CSS transition only (no Framer Motion) = zero scroll flicker
          - SidebarInner fills width: 100% of this container */}
      {isDesktop && (
        <div style={{
          position: "fixed", top: 0, left: 0, bottom: 0, zIndex: 20, overflow: "visible",
          width: sidebarW,
          transition: "width 0.28s cubic-bezier(0.4,0,0.2,1)",
        }}>
          <SidebarInner wide={expanded} />
          <button
            onClick={() => setExpanded(v => !v)}
            title={expanded ? "Collapse" : "Expand"}
            style={{ position: "absolute", top: "50%", right: -13, transform: "translateY(-50%)", width: 26, height: 26, borderRadius: "50%", backgroundColor: T.accent, border: `2px solid ${T.mainBg}`, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 2px 10px ${T.accentGlow}`, zIndex: 22, padding: 0 }}
          >
            <ChevronRight style={{ width: 13, height: 13, color: "#fff", transition: "transform 0.28s cubic-bezier(0.4,0,0.2,1)", transform: expanded ? "rotate(180deg)" : "rotate(0deg)" }} />
          </button>
        </div>
      )}

      {/* MOBILE DRAWER */}
      <AnimatePresence>
        {(isMobile || isTablet) && mobileOpen && (
          <>
            <motion.div key="backdrop"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
              onClick={() => setMobileOpen(false)}
              style={{ position: "fixed", inset: 0, backgroundColor: T.overlayBg, zIndex: 30, backdropFilter: "blur(4px)" }}
            />
            <motion.div key="drawer"
              initial={{ x: -(W_EXPANDED + 20) }} animate={{ x: 0 }} exit={{ x: -(W_EXPANDED + 20) }}
              transition={{ type: "spring", stiffness: 380, damping: 34 }}
              style={{ position: "fixed", top: 0, left: 0, bottom: 0, zIndex: 31, width: W_EXPANDED }}
            >
              <SidebarInner wide />
              <button onClick={() => setMobileOpen(false)}
                style={{ position: "absolute", top: 14, right: -44, width: 34, height: 34, borderRadius: "50%", backgroundColor: T.accent, border: `2px solid ${T.mainBg}`, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 4px 16px ${T.accentGlow}` }}>
                <X style={{ width: 14, height: 14, color: "#fff" }} />
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* MAIN CONTENT
          - marginLeft matches sidebar width via CSS transition
          - No Framer Motion = no scroll flicker */}
      <div style={{
        flex: 1, display: "flex", flexDirection: "column", minWidth: 0,
        marginLeft: isDesktop ? sidebarW : 0,
        paddingBottom: (isMobile || isTablet) ? 72 : 0,
        transition: "margin-left 0.28s cubic-bezier(0.4,0,0.2,1)",
        backgroundColor: "transparent",
      }}>
        {/* Mobile topbar */}
        {(isMobile || isTablet) && (
          <div style={{ position: "sticky", top: 0, zIndex: 19, backgroundColor: T.topbarBg, backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", borderBottom: `1px solid ${T.border}`, padding: "0.75rem 1.25rem", display: "flex", alignItems: "center", gap: "0.875rem" }}>
            <button onClick={() => setMobileOpen(true)}
              style={{ width: 38, height: 38, borderRadius: 11, backgroundColor: theme === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)", border: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
              <Menu style={{ width: 17, height: 17, color: T.textMuted }} />
            </button>
            <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 26, height: 26, borderRadius: 8, background: `linear-gradient(135deg, ${T.accent}22, ${T.accent}44)`, border: `1px solid ${T.accent}44`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontFamily: "'Clash Display',sans-serif", fontWeight: 700, fontSize: "0.56rem", color: T.accent }}>AFX</span>
              </div>
              <span style={{ fontFamily: "'Clash Display',sans-serif", fontWeight: 700, fontSize: "0.95rem", color: T.text }}>Africa Fx</span>
            </div>
            <ThemeToggle compact />
          </div>
        )}
        <main style={{ flex: 1, overflowX: "hidden" }}>{children}</main>
      </div>

      {/* MOBILE BOTTOM NAV */}
      {(isMobile || isTablet) && (
        <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 20, backgroundColor: T.bottomNavBg, borderTop: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "space-around", padding: "0.5rem 0 calc(0.625rem + env(safe-area-inset-bottom))", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" }}>
          {BOTTOM_NAV.map(link => {
            const active = pathname === link.href;
            return (
              <Link key={link.label} href={link.href}
                style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, textDecoration: "none", padding: "0.3rem 0.875rem", borderRadius: 12, color: active ? T.accent : T.textDim, position: "relative", minWidth: 52, transition: "color 0.18s" }}>
                {active && <div style={{ position: "absolute", top: 2, left: "50%", transform: "translateX(-50%)", width: 18, height: 2.5, borderRadius: 999, backgroundColor: T.accent }} />}
                <link.icon style={{ width: 20, height: 20 }} />
                <span style={{ fontSize: "0.57rem", fontFamily: "'General Sans',sans-serif", fontWeight: active ? 600 : 400 }}>{link.label}</span>
              </Link>
            );
          })}
        </div>
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
        *:focus-visible { outline: 2px solid rgba(255,140,0,0.55); outline-offset: 2px; border-radius: 6px; }
      `}</style>
    </div>
  );
}
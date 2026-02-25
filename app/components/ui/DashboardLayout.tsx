"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home, BookOpen, Calendar, Image, Users, Tag,
  User, Settings, LogOut, Sun, Moon,
  ChevronRight, ChevronLeft, Menu, X
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

/* Bottom nav on mobile — 5 most important */
const BOTTOM_NAV = [
  { label: "Home",      href: "/dashboard",  icon: Home },
  { label: "Courses",   href: "/courses",    icon: BookOpen },
  { label: "Community", href: "/community",  icon: Users },
  { label: "Portfolio", href: "/portfolio",  icon: Image },
  { label: "Profile",   href: "/profile",    icon: User },
];

/* ══════════════════════════════════════════════
   COLOUR TOKENS — 4-colour palette update
   ──────────────────────────────────────────────
   OLD dark bg:    #0D0905  → NEW: #1C1C1C
   OLD dark text:  #F5ECD7  → NEW: #FAF8F0
   OLD gold:       #E8A020  → NEW: #FF8C00  (orange)
   OLD terracotta: #C1440E  → NEW: #FF8C00  (same orange, simplified)
   OLD light bg:   #FDF6EC  → NEW: #FAF8F0
   OLD light side: #F5E6C8  → NEW: #EDE5CC

   READABILITY — never broken:
   • light text (#FAF8F0) on dark surfaces ✓
   • dark text  (#1C1C1C) on light surfaces ✓
   • orange (#FF8C00) only for active/accent ✓
══════════════════════════════════════════════ */
const DARK = {
  sidebarBg:     "#252320",                  /* was #110A06  */
  sidebarBorder: "#3A3530",                  /* was #3D2E10  */
  mainBg:        "#1C1C1C",                  /* was #0D0905  */
  topbarBg:      "rgba(28,28,28,0.95)",      /* was rgba(13,9,5,0.95) */
  text:          "#FAF8F0",                  /* was #F5ECD7  */
  textMuted:     "#C8C4BC",                  /* was #A89070  */
  textDim:       "#8A8680",                  /* was #6B5A40  */
  border:        "#3A3530",                  /* was #3D2E10  */
  activeNavBg:   "rgba(255,140,0,0.10)",     /* was rgba(232,160,32,0.10) */
  overlayBg:     "rgba(0,0,0,0.60)",         /* unchanged    */
  bottomNavBg:   "#1C1C1C",                  /* was #110A06  */
  /* new tokens needed for inline hardcodes below */
  accent:        "#FF8C00",                  /* was #E8A020  */
  accentText:    "#1C1C1C",                  /* dark on orange ✓ */
  accentSoft:    "rgba(255,140,0,0.10)",
  hamburgerBg:   "rgba(37,35,32,0.85)",      /* was rgba(34,24,8,0.80) */
  toggleTrack:   "#3A3530",                  /* was #3D2E10  */
};

const LIGHT = {
  sidebarBg:     "#EDE5CC",                  /* was #F5E6C8  */
  sidebarBorder: "#E0D8C3",                  /* was #E2C99A  */
  mainBg:        "#FAF8F0",                  /* was #FDF6EC  */
  topbarBg:      "rgba(250,248,240,0.95)",   /* was rgba(253,246,236,0.95) */
  text:          "#1C1C1C",                  /* was #1A0F00  */
  textMuted:     "#4A4744",                  /* was #6B4F2A  */
  textDim:       "#7A7570",                  /* was #A0845C  */
  border:        "#E0D8C3",                  /* was #E2C99A  */
  activeNavBg:   "rgba(255,140,0,0.12)",     /* was rgba(232,160,32,0.15) */
  overlayBg:     "rgba(0,0,0,0.40)",         /* unchanged    */
  bottomNavBg:   "#FAF8F0",                  /* was #FFF8F0  */
  /* new tokens */
  accent:        "#FF8C00",                  /* was #E8A020  */
  accentText:    "#FFFFFF",                  /* white on orange ✓ */
  accentSoft:    "rgba(255,140,0,0.12)",
  hamburgerBg:   "rgba(255,255,255,0.85)",   /* was rgba(255,255,255,0.80) */
  toggleTrack:   "#E0D8C3",                  /* was #E8D5B0  */
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [theme, setTheme]           = useState<"dark"|"light">("dark");
  const [expanded, setExpanded]     = useState(false);   // sidebar expanded on laptop
  const [mobileOpen, setMobileOpen] = useState(false);   // sidebar open on mobile
  const [isMobile, setIsMobile]     = useState(false);
  const [isTablet, setIsTablet]     = useState(false);
  const [user, setUser]             = useState<{ email?: string; user_metadata?: { full_name?: string } } | null>(null);
  const overlayRef                  = useRef<HTMLDivElement>(null);

  useEffect(() => {
    /* Sync theme */
    const saved = localStorage.getItem("africafx-theme") as "dark"|"light";
    if (saved) {
      setTheme(saved);
      document.documentElement.setAttribute("data-theme", saved);
    }
    const obs = new MutationObserver(() => {
      const t = document.documentElement.getAttribute("data-theme") as "dark"|"light";
      if (t) setTheme(t);
    });
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

    /* Responsive breakpoints */
    const checkSize = () => {
      setIsMobile(window.innerWidth < 768);
      setIsTablet(window.innerWidth >= 768 && window.innerWidth < 1024);
    };
    checkSize();
    window.addEventListener("resize", checkSize);

    /* Load user */
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));

    return () => {
      obs.disconnect();
      window.removeEventListener("resize", checkSize);
    };
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

  /* Sidebar width logic — identical to original */
  const SIDEBAR_EXPANDED  = 200;
  const SIDEBAR_COLLAPSED = 60;
  const sidebarWidth = isMobile
    ? 0
    : isTablet
      ? 0
      : expanded ? SIDEBAR_EXPANDED : SIDEBAR_COLLAPSED;

  const showSidebar       = !isMobile && !isTablet;
  const showMobileSidebar = (isMobile || isTablet) && mobileOpen;

  /* ─── Sidebar inner component — identical structure to original ─── */
  const SidebarContent = ({ isOverlay = false }: { isOverlay?: boolean }) => (
    <div style={{
      width: isOverlay ? "220px" : expanded ? `${SIDEBAR_EXPANDED}px` : `${SIDEBAR_COLLAPSED}px`,
      backgroundColor: T.sidebarBg,
      borderRight: `1px solid ${T.sidebarBorder}`,
      display: "flex", flexDirection: "column",
      height: "100%",
      transition: "width 0.3s ease",
      overflow: "hidden",
    }}>

      {/* Kente stripe — updated to 4-colour palette */}
      <div style={{ height: "4px", flexShrink: 0, background: "repeating-linear-gradient(90deg,#FF8C00 0,#FF8C00 20px,#1C1C1C 20px,#1C1C1C 40px,#EDE5CC 40px,#EDE5CC 60px,#FF8C00 60px,#FF8C00 80px)" }} />

      {/* Logo + user */}
      <div style={{ padding: expanded || isOverlay ? "1.25rem 1rem" : "1.25rem 0", display: "flex", flexDirection: "column", alignItems: expanded || isOverlay ? "flex-start" : "center", borderBottom: `1px solid ${T.sidebarBorder}`, transition: "padding 0.3s" }}>

        {/* AFX mark */}
        <div style={{ display: "flex", alignItems: "center", gap: expanded || isOverlay ? "8px" : 0, marginBottom: expanded || isOverlay ? "1.25rem" : "1rem", width: "100%", justifyContent: expanded || isOverlay ? "flex-start" : "center" }}>
          <div style={{ width: "34px", height: "28px", minWidth: "34px", backgroundColor: T.mainBg, border: `1px solid ${T.sidebarBorder}`, borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {/* Single AFX in orange — cleaner than 3 separate colours */}
            <span style={{ fontFamily: "'Clash Display',sans-serif", fontWeight: 700, fontSize: "0.68rem", color: T.accent }}>AFX</span>
          </div>
          {(expanded || isOverlay) && (
            <div style={{ overflow: "hidden" }}>
              <div style={{ fontFamily: "'Clash Display',sans-serif", fontWeight: 700, fontSize: "0.78rem", color: T.text, whiteSpace: "nowrap" }}>Africa Fx</div>
              <div style={{ fontSize: "0.58rem", color: T.textDim, fontFamily: "'General Sans',sans-serif", whiteSpace: "nowrap" }}>Your art. Our identity.</div>
            </div>
          )}
        </div>

        {/* User avatar */}
        <div style={{ display: "flex", alignItems: "center", gap: expanded || isOverlay ? "8px" : 0, width: "100%", justifyContent: expanded || isOverlay ? "flex-start" : "center" }}>
          <div style={{ width: "32px", height: "32px", minWidth: "32px", borderRadius: "50%", backgroundColor: T.accent, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Clash Display',sans-serif", fontWeight: 700, fontSize: "0.8rem", color: T.accentText }}>
            {firstName.charAt(0).toUpperCase()}
          </div>
          {(expanded || isOverlay) && (
            <div style={{ overflow: "hidden" }}>
              <div style={{ fontFamily: "'General Sans',sans-serif", fontWeight: 600, fontSize: "0.75rem", color: T.text, whiteSpace: "nowrap" }}>{firstName}</div>
              <div style={{ fontSize: "0.58rem", color: T.textDim, whiteSpace: "nowrap" }}>Animator</div>
            </div>
          )}
        </div>
      </div>

      {/* Nav links — identical logic to original */}
      <nav style={{ flex: 1, padding: "0.75rem 0", overflowY: "auto", overflowX: "hidden" }}>
        {NAV_LINKS.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link key={link.label} href={link.href}
              onClick={() => setMobileOpen(false)}
              title={!expanded && !isOverlay ? link.label : undefined}
              style={{
                display: "flex", alignItems: "center",
                gap: expanded || isOverlay ? "0.65rem" : 0,
                justifyContent: expanded || isOverlay ? "flex-start" : "center",
                padding: expanded || isOverlay ? "0.65rem 1rem" : "0.75rem 0",
                textDecoration: "none",
                color: isActive ? T.accent : T.textMuted,           /* was #E8A020 hardcoded */
                backgroundColor: isActive ? T.activeNavBg : "transparent",
                borderLeft: expanded || isOverlay
                  ? isActive ? `3px solid ${T.accent}` : "3px solid transparent"  /* was #E8A020 hardcoded */
                  : "none",
                transition: "all 0.2s",
                fontSize: "0.825rem",
                fontFamily: "'General Sans',sans-serif",
                fontWeight: isActive ? 600 : 400,
                whiteSpace: "nowrap",
              }}
            >
              <link.icon style={{ width: "17px", height: "17px", flexShrink: 0 }} />
              {(expanded || isOverlay) && link.label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom — theme toggle + settings + logout */}
      <div style={{ borderTop: `1px solid ${T.sidebarBorder}`, padding: "0.75rem 0" }}>

        {/* Theme toggle */}
        {(expanded || isOverlay) ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.4rem 1rem 0.75rem" }}>
            <span style={{ fontSize: "0.7rem", color: T.textDim, fontFamily: "'General Sans',sans-serif" }}>
              {theme === "dark" ? "Dark" : "Light"}
            </span>
            <button onClick={toggleTheme} style={{ width: "46px", height: "24px", borderRadius: "999px", border: "none", cursor: "pointer", position: "relative", backgroundColor: T.toggleTrack, transition: "background-color 0.3s", flexShrink: 0 }}>
              <div style={{ position: "absolute", top: "2px", left: theme === "dark" ? "2px" : "22px", width: "20px", height: "20px", borderRadius: "50%", backgroundColor: T.accent, transition: "left 0.3s ease", display: "flex", alignItems: "center", justifyContent: "center" }}>  {/* was gradient */}
                {theme === "dark" ? <Moon style={{ width: "9px", height: "9px", color: T.accentText }} /> : <Sun style={{ width: "9px", height: "9px", color: T.accentText }} />}
              </div>
            </button>
          </div>
        ) : (
          <button onClick={toggleTheme} title="Toggle theme" style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%", padding: "0.75rem 0", background: "none", border: "none", cursor: "pointer", color: T.textDim }}>
            {theme === "dark" ? <Sun style={{ width: "16px", height: "16px" }} /> : <Moon style={{ width: "16px", height: "16px" }} />}
          </button>
        )}

        {/* Settings */}
        <Link href="/settings" onClick={() => setMobileOpen(false)} style={{ display: "flex", alignItems: "center", justifyContent: expanded || isOverlay ? "flex-start" : "center", gap: expanded || isOverlay ? "0.65rem" : 0, padding: expanded || isOverlay ? "0.65rem 1rem" : "0.75rem 0", textDecoration: "none", color: T.textDim, fontSize: "0.825rem", fontFamily: "'General Sans',sans-serif" }}>
          <Settings style={{ width: "15px", height: "15px", flexShrink: 0 }} />
          {(expanded || isOverlay) && "Settings"}
        </Link>

        {/* Logout */}
        <button onClick={handleLogout} style={{ display: "flex", alignItems: "center", justifyContent: expanded || isOverlay ? "flex-start" : "center", gap: expanded || isOverlay ? "0.65rem" : 0, padding: expanded || isOverlay ? "0.65rem 1rem" : "0.75rem 0", width: "100%", background: "none", border: "none", cursor: "pointer", color: T.textDim, fontSize: "0.825rem", fontFamily: "'General Sans',sans-serif" }}>
          <LogOut style={{ width: "15px", height: "15px", flexShrink: 0 }} />
          {(expanded || isOverlay) && "Log Out"}
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: T.mainBg, color: T.text, fontFamily: "'Satoshi',sans-serif", transition: "background-color 0.3s,color 0.3s" }}>

      {/* ── Desktop fixed sidebar ── */}
      {showSidebar && (
        <div style={{ position: "fixed", top: 0, left: 0, bottom: 0, zIndex: 20, transition: "width 0.3s ease" }}>
          <SidebarContent />

          {/* Toggle arrow */}
          <button
            onClick={() => setExpanded(!expanded)}
            title={expanded ? "Collapse sidebar" : "Expand sidebar"}
            style={{
              position: "absolute", top: "50%", right: "-12px",
              transform: "translateY(-50%)",
              width: "24px", height: "24px", borderRadius: "50%",
              backgroundColor: T.accent,                             /* was gradient */
              border: "none", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
              zIndex: 21,
            }}
          >
            {expanded
              ? <ChevronLeft  style={{ width: "12px", height: "12px", color: T.accentText }} />   /* was #0D0905 */
              : <ChevronRight style={{ width: "12px", height: "12px", color: T.accentText }} />}  /* was #0D0905 */
          </button>
        </div>
      )}

      {/* ── Mobile/Tablet overlay sidebar ── */}
      {showMobileSidebar && (
        <>
          {/* Dark backdrop */}
          <div
            ref={overlayRef}
            onClick={() => setMobileOpen(false)}
            style={{ position: "fixed", inset: 0, backgroundColor: T.overlayBg, zIndex: 30, backdropFilter: "blur(2px)" }}
          />
          {/* Slide-in sidebar */}
          <div style={{ position: "fixed", top: 0, left: 0, bottom: 0, zIndex: 31 }}>
            <SidebarContent isOverlay />
            {/* Close button */}
            <button onClick={() => setMobileOpen(false)} style={{ position: "absolute", top: "12px", right: "-40px", width: "32px", height: "32px", borderRadius: "50%", backgroundColor: T.accent, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>  {/* was gradient */}
              <X style={{ width: "14px", height: "14px", color: T.accentText }} />              {/* was #0D0905 */}
            </button>
          </div>
        </>
      )}

      {/* ── Main content area ── */}
      <div style={{
        marginLeft: showSidebar ? `${sidebarWidth}px` : 0,
        flex: 1, display: "flex", flexDirection: "column",
        minWidth: 0,
        paddingBottom: isMobile || isTablet ? "70px" : 0,
        transition: "margin-left 0.3s ease",
      }}>

        {/* Top bar (mobile/tablet only) */}
        {(isMobile || isTablet) && (
          <div style={{ position: "sticky", top: 0, zIndex: 19, backgroundColor: T.topbarBg, backdropFilter: "blur(12px)", borderBottom: `1px solid ${T.border}`, padding: "0.75rem 1rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
            {/* Hamburger */}
            <button onClick={() => setMobileOpen(true)} style={{ width: "36px", height: "36px", borderRadius: "10px", backgroundColor: T.hamburgerBg, border: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>   {/* was hardcoded per theme */}
              <Menu style={{ width: "18px", height: "18px", color: T.textMuted }} />
            </button>

            {/* AFX brand */}
            <div style={{ flex: 1 }}>
              <span style={{ fontFamily: "'Clash Display',sans-serif", fontWeight: 700, fontSize: "0.95rem", color: T.accent }}>Africa</span>  {/* was #E8A020 hardcoded */}
              <span style={{ fontFamily: "'Clash Display',sans-serif", fontWeight: 700, fontSize: "0.95rem", color: T.text, marginLeft: "4px" }}>Fx</span>
            </div>

            {/* Theme toggle mobile */}
            <button onClick={toggleTheme} style={{ width: "36px", height: "36px", borderRadius: "10px", backgroundColor: T.hamburgerBg, border: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
              {theme === "dark"
                ? <Sun  style={{ width: "16px", height: "16px", color: T.accent }} />     /* was #E8A020 hardcoded */
                : <Moon style={{ width: "16px", height: "16px", color: T.textMuted }} />} {/* was #C47D0E hardcoded — now uses token */}
            </button>
          </div>
        )}

        {/* Page content */}
        <main style={{ flex: 1, overflowX: "hidden" }}>
          {children}
        </main>
      </div>

      {/* ── Mobile bottom navigation ── */}
      {(isMobile || isTablet) && (
        <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 20, backgroundColor: T.bottomNavBg, borderTop: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "space-around", padding: "0.5rem 0 calc(0.5rem + env(safe-area-inset-bottom))", backdropFilter: "blur(12px)" }}>
          {BOTTOM_NAV.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link key={link.label} href={link.href} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "3px", textDecoration: "none", padding: "0.25rem 0.75rem", borderRadius: "12px", color: isActive ? T.accent : T.textDim, backgroundColor: isActive ? T.accentSoft : "transparent", transition: "all 0.2s", minWidth: "50px" }}>  {/* was #E8A020 + rgba hardcoded */}
                <link.icon style={{ width: "20px", height: "20px" }} />
                <span style={{ fontSize: "0.58rem", fontFamily: "'General Sans',sans-serif", fontWeight: isActive ? 600 : 400 }}>{link.label}</span>
              </Link>
            );
          })}
        </div>
      )}

      {/* Global responsive styles — identical to original */}
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
      `}</style>
    </div>
  );
}
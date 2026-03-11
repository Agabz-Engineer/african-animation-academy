"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  Home, BookOpen, Calendar, Image as ImageIcon, Users, DollarSign,
  User, Settings, LogOut, Sun, Moon,
  ChevronRight, Menu, X, Sparkles, Mail, Instagram, Linkedin, Youtube
} from "lucide-react";
import { supabase } from "@/lib/supabase";

// ─── Nav links ───────────────────────────────────────────
const NAV_LINKS = [
  { label: "Home",      href: "/dashboard",  icon: Home      },
  { label: "Courses",   href: "/courses",    icon: BookOpen  },
  { label: "Events",    href: "/events",     icon: Calendar  },
  { label: "Portfolio", href: "/portfolio",  icon: ImageIcon },
  { label: "Community", href: "/community",  icon: Users     },
  { label: "Pricing",   href: "/pricing",    icon: DollarSign},
  { label: "Profile",   href: "/profile",    icon: User      },
];

const BOTTOM_NAV = [
  { label: "Home",      href: "/dashboard",  icon: Home      },
  { label: "Courses",   href: "/courses",    icon: BookOpen  },
  { label: "Community", href: "/community",  icon: Users     },
  { label: "Portfolio", href: "/portfolio",  icon: ImageIcon },
  { label: "Profile",   href: "/profile",    icon: User      },
];

// ─── Colour tokens ───────────────────────────────────────
const DARK = {
  sidebarBg:    "#2C2C2C",
  sidebarBorder:"#444444",
  mainBg:       "#222222",
  topbarBg:     "rgba(34,34,34,0.95)",
  text:         "#FAF3E1",
  textMuted:    "#D2C9B8",
  textDim:      "#9E9688",
  border:       "#444444",
  accent:       "#FF6D1F",
  accentSoft:   "rgba(255,109,31,0.09)",
  accentGlow:   "rgba(255,109,31,0.22)",
  activeNavBg:  "rgba(255,109,31,0.09)",
  overlayBg:    "rgba(0,0,0,0.72)",
  bottomNavBg:  "rgba(44,44,44,0.98)",
  navHoverBg:   "rgba(255,255,255,0.04)",
  cardBg:       "#2C2C2C",
  avatarRing:   "rgba(255,109,31,0.30)",
  toggleBg:     "#333333",
};

const LIGHT = {
  sidebarBg:    "#F5E7C6",
  sidebarBorder:"#E7DBBD",
  mainBg:       "#FAF3E1",
  topbarBg:     "rgba(250,243,225,0.95)",
  text:         "#222222",
  textMuted:    "#555555",
  textDim:      "#9E9688",
  border:       "#E7DBBD",
  accent:       "#FF6D1F",
  accentSoft:   "rgba(255,109,31,0.09)",
  accentGlow:   "rgba(255,109,31,0.18)",
  activeNavBg:  "rgba(255,109,31,0.10)",
  overlayBg:    "rgba(0,0,0,0.32)",
  bottomNavBg:  "rgba(245,231,198,0.98)",
  navHoverBg:   "rgba(0,0,0,0.04)",
  cardBg:       "#FFFFFF",
  avatarRing:   "rgba(255,140,0,0.25)",
  toggleBg:     "#E7DBBD",
};

const W_EXPANDED  = 224;
const W_COLLAPSED = 64;
const FOOTER_GROUPS = [
  {
    title: "Explore",
    links: [
      { label: "About Us", href: "/about" },
      { label: "Dashboard", href: "/dashboard" },
      { label: "Courses", href: "/courses" },
      { label: "Community", href: "/community" },
      { label: "Events", href: "/events" },
      { label: "Pricing", href: "/pricing" },
    ],
  },
  {
    title: "Account",
    links: [
      { label: "Settings", href: "/settings" },
      { label: "Home", href: "/" },
      { label: "Login", href: "/login" },
      { label: "Sign up", href: "/signup" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Email support", href: "mailto:info@africafx.com" },
      { label: "Report issue", href: "mailto:info@africafx.com?subject=Platform%20Issue" },
      { label: "Creator feed", href: "/community" },
    ],
  },
];

const FOOTER_SOCIALS = [
  { label: "Instagram", href: "https://instagram.com", icon: Instagram },
  { label: "YouTube", href: "https://youtube.com", icon: Youtube },
  { label: "LinkedIn", href: "https://linkedin.com", icon: Linkedin },
];

const getInitialTheme = (): "dark" | "light" => {
  if (typeof window === "undefined") return "dark";
  const saved = localStorage.getItem("africafx-theme");
  if (saved === "dark" || saved === "light") return saved;
  const attr = document.documentElement.getAttribute("data-theme");
  return attr === "light" ? "light" : "dark";
};

const addCacheBuster = (url: string) =>
  `${url}${url.includes("?") ? "&" : "?"}v=${Date.now()}`;

const resolveAvatarDisplayUrl = async (
  avatarPath: string | null,
  avatarPublicUrl: string | null
) => {
  if (avatarPath && supabase) {
    const { data: signedData, error: signedError } = await supabase.storage
      .from("avatars")
      .createSignedUrl(avatarPath, 60 * 60);

    if (!signedError && signedData?.signedUrl) {
      return addCacheBuster(signedData.signedUrl);
    }

    const { data: publicData } = supabase.storage
      .from("avatars")
      .getPublicUrl(avatarPath);
    if (publicData?.publicUrl) return addCacheBuster(publicData.publicUrl);
  }

  return avatarPublicUrl ? addCacheBuster(avatarPublicUrl) : null;
};

const getViewportFlags = () => {
  if (typeof window === "undefined") return { isMobile: false, isTablet: false };
  const width = window.innerWidth;
  return { isMobile: width < 768, isTablet: width >= 768 && width < 1024 };
};

type AuthStatus = "loading" | "authenticated" | "unauthenticated" | "error";

const ACTIVE_ROUTE_ALIASES: Record<string, string[]> = {};

const isRouteActive = (pathname: string, href: string) => {
  const candidates = [href, ...(ACTIVE_ROUTE_ALIASES[href] || [])];
  return candidates.some((candidate) =>
    pathname === candidate || pathname.startsWith(`${candidate}/`)
  );
};

// ─── Main Component ──────────────────────────────────────
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const [theme, setTheme] = useState<"dark" | "light">(getInitialTheme);
  const [expanded, setExpanded] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(() => getViewportFlags().isMobile);
  const [isTablet, setIsTablet] = useState(() => getViewportFlags().isTablet);
  const [authStatus, setAuthStatus] = useState<AuthStatus>("loading");
  const [authError, setAuthError] = useState<string | null>(null);
  const [user, setUser] = useState<{
    id: string;
    email?: string;
    user_metadata?: { full_name?: string; avatar_path?: string; avatar_url?: string };
  } | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarLoadError, setAvatarLoadError] = useState(false);

  const hydrateUser = useCallback(async (silent = false) => {
    if (!silent) {
      setAuthStatus((previous) =>
        previous === "authenticated" ? previous : "loading"
      );
    }
    setAuthError(null);

    try {
      if (!supabase) {
        setAuthStatus("unauthenticated");
        return;
      }
      const { data, error } = await supabase.auth.getUser();
      
      if (error) {
        if (error.message.includes("Auth session missing")) {
          setAvatarUrl(null);
          setAvatarLoadError(false);
          setAuthStatus("unauthenticated");
          return;
        }
        throw error;
      }

      const authUser = data.user;
      setUser(authUser);

      if (!authUser) {
        setAvatarUrl(null);
        setAvatarLoadError(false);
        setAuthStatus("unauthenticated");
        return;
      }

      const metadata = authUser.user_metadata || {};
      const avatarPath =
        typeof metadata.avatar_path === "string" ? metadata.avatar_path : null;
      const avatarPublicUrl =
        typeof metadata.avatar_url === "string" ? metadata.avatar_url : null;
      const resolvedAvatarUrl = await resolveAvatarDisplayUrl(
        avatarPath,
        avatarPublicUrl
      );
      setAvatarUrl(resolvedAvatarUrl);
      setAvatarLoadError(false);
      setAuthStatus("authenticated");
    } catch (error) {
      console.error("Failed to load authenticated user", error);
      setAuthStatus("error");
      setAuthError(
        error instanceof Error ? error.message : "Unable to verify your session."
      );
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

    const onResize = () => {
      const next = getViewportFlags();
      setIsMobile(next.isMobile);
      setIsTablet(next.isTablet);
    };

    const onEscapeClose = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileOpen(false);
    };

    window.addEventListener("resize", onResize);
    window.addEventListener("keydown", onEscapeClose);

    return () => {
      obs.disconnect();
      window.removeEventListener("resize", onResize);
      window.removeEventListener("keydown", onEscapeClose);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const runHydration = async () => {
      await hydrateUser();
      if (cancelled) return;
    };

    void runHydration();
    const authSub = supabase?.auth.onAuthStateChange(() => {
      void hydrateUser(true);
    });

    return () => {
      cancelled = true;
      if (authSub?.data?.subscription) {
        authSub.data.subscription.unsubscribe();
      }
    };
  }, [hydrateUser]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (isMobile || isTablet) return;
    setMobileOpen(false);
  }, [isMobile, isTablet]);

  useEffect(() => {
    if (!(isMobile || isTablet) || !mobileOpen) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isMobile, isTablet, mobileOpen]);

  useEffect(() => {
    if (authStatus !== "unauthenticated") return;
    const nextPath = encodeURIComponent(pathname || "/dashboard");
    router.replace(`/login?next=${nextPath}`);
  }, [authStatus, pathname, router]);

  const T = theme === "dark" ? DARK : LIGHT;
  const isDesktop = !isMobile && !isTablet;
  const sidebarW = expanded ? W_EXPANDED : W_COLLAPSED;
  const firstName = user?.user_metadata?.full_name?.split(" ")[0] ?? user?.email?.split("@")[0] ?? "Creative";
  const initial = firstName.charAt(0).toUpperCase();
  const hasProfileDetails =
    Boolean(user?.user_metadata?.full_name) ||
    Boolean(user?.user_metadata?.avatar_path) ||
    Boolean(user?.user_metadata?.avatar_url);
  const year = new Date().getFullYear();

  const switchTheme = useCallback((mode: "dark" | "light") => {
    setTheme(mode);
    localStorage.setItem("africafx-theme", mode);
    document.documentElement.setAttribute("data-theme", mode);
  }, []);

  const handleSignOut = useCallback(async () => {
    if (supabase) await supabase.auth.signOut();
    router.replace("/login");
  }, [router]);

  const handleCloseMobileMenu = useCallback(() => {
    setMobileOpen(false);
  }, []);

  const handleOpenMobileMenu = useCallback(() => {
    setMobileOpen(true);
  }, []);

  const retryAuthLoad = useCallback(() => {
    void hydrateUser();
  }, [hydrateUser]);

  // ── Theme Toggle ─────────────────────────────────────
  const renderThemeToggle = (compact = false) => {
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
  const renderSidebarInner = (wide = false) => (
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
          {avatarUrl && !avatarLoadError ? (
            <Image
              src={avatarUrl}
              alt="Profile"
              width={32}
              height={32}
              unoptimized
              onError={() => setAvatarLoadError(true)}
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                objectFit: "cover",
                boxShadow: `0 0 0 2px ${T.sidebarBg}, 0 0 0 3.5px ${T.avatarRing}`,
              }}
            />
          ) : (
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: `linear-gradient(135deg, ${T.accent}, #E04D00)`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Clash Display',sans-serif", fontWeight: 700, fontSize: "0.82rem", color: "#fff", boxShadow: `0 0 0 2px ${T.sidebarBg}, 0 0 0 3.5px ${T.avatarRing}` }}>
              {initial}
            </div>
          )}
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
          const active = isRouteActive(pathname, link.href);
          return (
            <Link
              key={link.label}
              href={link.href}
              onClick={handleCloseMobileMenu}
              title={!wide ? link.label : undefined}
              className={active ? "dash-nav-link is-active" : "dash-nav-link"}
              style={{
                display: "flex", alignItems: "center",
                gap: wide ? "0.75rem" : 0,
                justifyContent: wide ? "flex-start" : "center",
                padding: wide ? "0.525rem 1rem" : "0.7rem 0",
                margin: wide ? "1px 0.625rem" : "1px 0.5rem",
                borderRadius: 9,
                textDecoration: "none",
                color: active ? T.accent : T.textMuted,
                backgroundColor: active ? T.activeNavBg : "transparent",
                border: `1px solid ${active ? T.accent + "22" : "transparent"}`,
                transition: "color 0.15s, background-color 0.15s",
                fontSize: "0.82rem",
                fontFamily: "'General Sans',sans-serif",
                fontWeight: active ? 600 : 400,
                whiteSpace: "nowrap",
                position: "relative",
                ["--dash-nav-hover-bg" as string]: T.navHoverBg,
                ["--dash-nav-hover-color" as string]: T.text,
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
            {renderThemeToggle(false)}
          </div>
        ) : (
          <div style={{ marginBottom: 4 }}>{renderThemeToggle(true)}</div>
        )}
        <Link href="/settings" onClick={handleCloseMobileMenu}
          style={{ display: "flex", alignItems: "center", justifyContent: wide ? "flex-start" : "center", gap: wide ? "0.625rem" : 0, padding: wide ? "0.45rem 0.375rem" : "0.55rem 0", borderRadius: 8, textDecoration: "none", color: T.textDim, fontSize: "0.78rem", fontFamily: "'General Sans',sans-serif" }}>
          <Settings style={{ width: 14, height: 14, flexShrink: 0 }} />
          {wide && "Settings"}
        </Link>
        <button onClick={handleSignOut}
          style={{ display: "flex", alignItems: "center", justifyContent: wide ? "flex-start" : "center", gap: wide ? "0.625rem" : 0, padding: wide ? "0.45rem 0.375rem" : "0.55rem 0", width: "100%", background: "none", border: "none", cursor: "pointer", color: T.textDim, fontSize: "0.78rem", fontFamily: "'General Sans',sans-serif", borderRadius: 8 }}>
          <LogOut style={{ width: 14, height: 14, flexShrink: 0 }} />
          {wide && "Log Out"}
        </button>
      </div>
    </div>
  );

  // ── RENDER ───────────────────────────────────────────
  if (authStatus === "loading") {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          backgroundColor: T.mainBg,
          color: T.text,
          fontFamily: "'General Sans',sans-serif",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.7rem" }}>
          <motion.div
            aria-hidden
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, ease: "linear", duration: 1 }}
            style={{
              width: 34,
              height: 34,
              borderRadius: "50%",
              border: `2px solid ${T.border}`,
              borderTopColor: T.accent,
            }}
          />
          <p style={{ margin: 0, fontSize: "0.9rem", color: T.textMuted }}>
            Loading your dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (authStatus === "error") {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          backgroundColor: T.mainBg,
          color: T.text,
          padding: "1rem",
          fontFamily: "'General Sans',sans-serif",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 420,
            borderRadius: 14,
            border: `1px solid ${T.border}`,
            backgroundColor: T.cardBg,
            padding: "1rem",
          }}
        >
          <p style={{ margin: 0, fontWeight: 700, fontSize: "1rem" }}>
            We could not verify your session.
          </p>
          <p style={{ margin: "0.45rem 0 0", color: T.textMuted, fontSize: "0.84rem", lineHeight: 1.5 }}>
            {authError || "Please retry. If this keeps happening, sign in again."}
          </p>
          <div style={{ display: "flex", gap: "0.55rem", marginTop: "0.9rem" }}>
            <button
              type="button"
              onClick={retryAuthLoad}
              style={{
                border: `1px solid ${T.accent}`,
                backgroundColor: T.accentSoft,
                color: T.accent,
                borderRadius: 9,
                fontSize: "0.8rem",
                fontWeight: 600,
                padding: "0.45rem 0.72rem",
                cursor: "pointer",
              }}
            >
              Retry
            </button>
            <button
              type="button"
              onClick={handleSignOut}
              style={{
                border: `1px solid ${T.border}`,
                backgroundColor: "transparent",
                color: T.textMuted,
                borderRadius: 9,
                fontSize: "0.8rem",
                fontWeight: 600,
                padding: "0.45rem 0.72rem",
                cursor: "pointer",
              }}
            >
              Go to login
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (authStatus === "unauthenticated") {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          backgroundColor: T.mainBg,
          color: T.textMuted,
          fontSize: "0.9rem",
          fontFamily: "'General Sans',sans-serif",
        }}
      >
        Redirecting to login...
      </div>
    );
  }

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
          {renderSidebarInner(expanded)}
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
              onClick={handleCloseMobileMenu}
              style={{ position: "fixed", inset: 0, backgroundColor: T.overlayBg, zIndex: 30, backdropFilter: "blur(4px)" }}
            />
            <motion.div key="drawer"
              initial={{ x: -(W_EXPANDED + 20) }} animate={{ x: 0 }} exit={{ x: -(W_EXPANDED + 20) }}
              transition={{ type: "spring", stiffness: 380, damping: 34 }}
              style={{ position: "fixed", top: 0, left: 0, bottom: 0, zIndex: 31, width: W_EXPANDED }}
            >
              {renderSidebarInner(true)}
              <button onClick={handleCloseMobileMenu}
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
            <button onClick={handleOpenMobileMenu}
              style={{ width: 38, height: 38, borderRadius: 11, backgroundColor: theme === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)", border: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
              <Menu style={{ width: 17, height: 17, color: T.textMuted }} />
            </button>
            <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 26, height: 26, borderRadius: 8, background: `linear-gradient(135deg, ${T.accent}22, ${T.accent}44)`, border: `1px solid ${T.accent}44`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontFamily: "'Clash Display',sans-serif", fontWeight: 700, fontSize: "0.56rem", color: T.accent }}>AFX</span>
              </div>
              <span style={{ fontFamily: "'Clash Display',sans-serif", fontWeight: 700, fontSize: "0.95rem", color: T.text }}>Africa Fx</span>
            </div>
            {renderThemeToggle(true)}
          </div>
        )}
        <main style={{ flex: 1, overflowX: "hidden" }}>
          {!hasProfileDetails && (
            <div
              style={{
                margin: "0.9rem 1.1rem 0",
                borderRadius: 10,
                border: `1px solid ${T.border}`,
                backgroundColor: T.cardBg,
                padding: "0.65rem 0.75rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "0.75rem",
                flexWrap: "wrap",
              }}
            >
              <p style={{ margin: 0, fontSize: "0.76rem", color: T.textMuted, fontFamily: "'General Sans',sans-serif" }}>
                Your profile is still empty. Add your display name and avatar to personalize the dashboard.
              </p>
              <Link
                href="/settings"
                style={{
                  textDecoration: "none",
                  borderRadius: 8,
                  border: `1px solid ${T.accent}`,
                  backgroundColor: T.accentSoft,
                  color: T.accent,
                  padding: "0.35rem 0.58rem",
                  fontSize: "0.72rem",
                  fontFamily: "'General Sans',sans-serif",
                  fontWeight: 600,
                }}
              >
                Complete profile
              </Link>
            </div>
          )}
          {children}
        </main>
        <footer
          style={{
            marginTop: "1.1rem",
            borderTop: `1px solid ${T.border}`,
            background: theme === "dark"
              ? "linear-gradient(180deg, rgba(20,18,16,0.96) 0%, rgba(20,18,16,0.9) 100%)"
              : "linear-gradient(180deg, rgba(245,237,220,0.92) 0%, rgba(245,237,220,0.88) 100%)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            padding: "1.45rem 1.25rem calc(1.15rem + env(safe-area-inset-bottom))",
            backgroundColor: theme === "dark" ? "#222222" : "#FAF3E1",
          }}
        >
          <div className="app-footer-shell">
            <div className="app-footer-brand">
              <p className="app-footer-title" style={{ color: T.text }}>Africa Fx</p>
              <p
                style={{
                  margin: "0.3rem 0 0",
                  color: T.textMuted,
                  lineHeight: 1.65,
                  fontSize: "0.82rem",
                  fontFamily: "'General Sans',sans-serif",
                  maxWidth: "320px",
                }}
              >
                A creative platform for African animators to learn faster, share work, and grow with community feedback.
              </p>
              <a
                href="mailto:info@africafx.com"
                className="app-footer-email"
                style={{ color: T.accent }}
              >
                <Mail style={{ width: "13px", height: "13px" }} />
                info@africafx.com
              </a>

              <div className="app-footer-socials">
                {FOOTER_SOCIALS.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="app-footer-social"
                    style={{
                      border: `1px solid ${T.border}`,
                      color: T.textMuted,
                      backgroundColor: theme === "dark" ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.7)",
                    }}
                  >
                    <social.icon style={{ width: "14px", height: "14px" }} />
                  </a>
                ))}
              </div>
            </div>

            <div className="app-footer-columns">
              {FOOTER_GROUPS.map((group) => (
                <div key={group.title}>
                  <p className="app-footer-heading" style={{ color: T.text }}>{group.title}</p>
                  <div className="app-footer-list">
                    {group.links.map((item) =>
                      item.href.startsWith("mailto:") ? (
                        <a
                          key={item.label}
                          href={item.href}
                          className="app-footer-link"
                          style={{ color: T.textMuted }}
                        >
                          {item.label}
                        </a>
                      ) : (
                        <Link
                          key={item.label}
                          href={item.href}
                          className="app-footer-link"
                          style={{ color: T.textMuted }}
                        >
                          {item.label}
                        </Link>
                      )
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="app-footer-bottom" style={{ borderTop: `1px solid ${T.border}` }}>
            <p style={{ margin: 0, color: T.textDim, fontSize: "0.73rem", fontFamily: "'General Sans',sans-serif" }}>
              (c) {year} Africa Fx. All rights reserved.
            </p>
            <p style={{ margin: 0, color: T.textDim, fontSize: "0.73rem", fontFamily: "'General Sans',sans-serif" }}>
              Proudly African. Globally Creative.
            </p>
          </div>
        </footer>
      </div>

      {/* MOBILE BOTTOM NAV */}
      {(isMobile || isTablet) && (
        <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 20, backgroundColor: T.bottomNavBg, borderTop: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "space-around", padding: "0.5rem 0 calc(0.625rem + env(safe-area-inset-bottom))", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" }}>
          {BOTTOM_NAV.map(link => {
            const active = isRouteActive(pathname, link.href);
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
          .dash-momentum-grid { grid-template-columns: 1fr !important; }
          .dash-hero      { height: 180px !important; }
          .dash-padding   { padding: 1rem !important; }
          .hide-mobile    { display: none !important; }
          .app-footer-shell { grid-template-columns: minmax(0, 1fr); gap: 1rem; }
          .app-footer-columns { grid-template-columns: minmax(0, 1fr); gap: 0.85rem; }
          .app-footer-bottom { flex-direction: column; align-items: flex-start; gap: 0.32rem; }
        }
        @media (min-width: 768px) and (max-width: 1023px) {
          .dash-grid-4  { grid-template-columns: 1fr 1fr !important; }
          .dash-momentum-grid { grid-template-columns: 1fr !important; }
          .dash-padding { padding: 1.25rem !important; }
        }
        @media (min-width: 1024px) {
          .dash-grid-4    { grid-template-columns: repeat(4,1fr); }
          .dash-grid-2    { grid-template-columns: 1fr 1fr; }
          .dash-grid-stats{ grid-template-columns: repeat(4,1fr); }
        }
        .dash-nav-link:hover:not(.is-active) {
          background-color: var(--dash-nav-hover-bg) !important;
          color: var(--dash-nav-hover-color) !important;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .app-footer-shell {
          display: grid;
          grid-template-columns: minmax(250px, 1.2fr) minmax(0, 2fr);
          gap: 1.2rem;
          align-items: start;
        }
        .app-footer-title {
          margin: 0;
          font-family: "Clash Display", sans-serif;
          font-size: clamp(1.4rem, 3vw, 1.95rem);
          letter-spacing: -0.03em;
          line-height: 1.1;
        }
        .app-footer-email {
          display: inline-flex;
          align-items: center;
          gap: 0.38rem;
          flex-wrap: wrap;
          margin-top: 0.55rem;
          font-size: 0.8rem;
          font-family: "General Sans", sans-serif;
          text-decoration: none;
        }
        .app-footer-columns {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 0.9rem;
        }
        .app-footer-heading {
          margin: 0;
          font-family: "Clash Display", sans-serif;
          font-size: 0.95rem;
          letter-spacing: -0.015em;
          font-weight: 600;
        }
        .app-footer-list {
          margin-top: 0.42rem;
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }
        .app-footer-link {
          color: inherit;
          text-decoration: none;
          font-size: 0.8rem;
          font-family: "General Sans", sans-serif;
          transition: color 0.2s ease, opacity 0.2s ease;
          opacity: 0.93;
        }
        .app-footer-link:hover {
          color: ${T.accent};
          opacity: 1;
        }
        .app-footer-socials {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 0.45rem;
          margin-top: 0.65rem;
        }
        .app-footer-social {
          width: 31px;
          height: 31px;
          border-radius: 10px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          text-decoration: none;
          transition: color 0.2s ease, border-color 0.2s ease, transform 0.2s ease;
        }
        .app-footer-social:hover {
          color: ${T.accent} !important;
          border-color: ${T.accent} !important;
          transform: translateY(-1px);
        }
        .app-footer-bottom {
          margin-top: 0.95rem;
          padding-top: 0.75rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.5rem;
          flex-wrap: wrap;
        }
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

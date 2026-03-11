"use client";

import Link from "next/link";
import { useThemeMode } from "@/lib/useThemeMode";

const DARK_UI = {
  navBg: "rgba(34,34,34,0.58)",
  navBorder: "rgba(68,68,68,0.70)",
  brandText: "#FAF3E1",
};

const LIGHT_UI = {
  navBg: "rgba(250,243,225,0.84)",
  navBorder: "rgba(231,219,189,0.58)",
  brandText: "#222222",
};

export default function Navbar() {
  const theme = useThemeMode();
  const C = theme === "dark" ? DARK_UI : LIGHT_UI;

  return (
    <nav
      className="glass"
      style={{
        padding: "1rem",
        backgroundColor: C.navBg,
        border: `1px solid ${C.navBorder}`,
        transition: "background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease",
      }}
    >
      <div
        className="container-custom"
        style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}
      >

        <Link href="/" className="group flex items-center gap-3">
          <div
            className="w-12 h-10 rounded-xl flex items-center justify-center overflow-hidden relative transition-all duration-300 group-hover:shadow-[0_0_20px_rgba(255,109,31,0.5)]"
            style={{
              background: "linear-gradient(135deg, #222222, #333333)",
              border: "1px solid rgba(255, 109, 31, 0.4)",
            }}
          >
            <div
              className="absolute inset-0"
              style={{ background: "linear-gradient(135deg, rgba(255,109,31,0.08) 0%, transparent 60%)" }}
            />
            <div className="relative z-10 flex items-center tracking-tighter" style={{ letterSpacing: "-0.5px" }}>
              <span className="font-black text-base tracking-tight" style={{ color: "#FF6D1F", fontFamily: "Space Grotesk, sans-serif" }}>A</span>
              <span className="font-black text-base tracking-tight" style={{ color: "#FAF3E1", fontFamily: "Space Grotesk, sans-serif" }}>F</span>
              <span className="font-black text-base tracking-tight" style={{ color: "#E04D00", fontFamily: "Space Grotesk, sans-serif" }}>X</span>
            </div>
          </div>
          <div className="flex flex-col leading-tight">
            <span className="font-bold text-sm" style={{ color: C.brandText, fontFamily: "Space Grotesk, sans-serif" }}>
              African Animation
            </span>
            <span
              className="font-bold text-sm bg-clip-text text-transparent"
              style={{
                fontFamily: "Space Grotesk, sans-serif",
                backgroundImage: "linear-gradient(90deg, #FF6D1F, #E04D00)",
              }}
            >
              Academy
            </span>
          </div>
        </Link>

        <div style={{ display: "flex", gap: "0.5rem" }}>
          <Link href="/login" className="btn-ghost">Log in</Link>
          <Link href="/signup" className="btn-primary">Sign up</Link>
        </div>
      </div>
    </nav>
  );
}


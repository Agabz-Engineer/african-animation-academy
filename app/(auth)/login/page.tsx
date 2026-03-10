"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, ArrowRight } from "lucide-react";
import { REMEMBER_ME_KEY, setRememberSessionPreference, supabase } from "@/lib/supabase";
import { useThemeMode } from "@/lib/useThemeMode";

const DARK_UI = {
  surface: "#221808",
  border: "#3D2E10",
  text: "#F5ECD7",
  muted: "#A89070",
  dim: "#6B5A40",
  divider: "rgba(61,46,16,0.4)",
};

const LIGHT_UI = {
  surface: "rgba(255,255,255,0.86)",
  border: "#DCCFB7",
  text: "#1C1C1C",
  muted: "#5A5550",
  dim: "#7A746A",
  divider: "rgba(183,164,132,0.55)",
};

export default function LoginPage() {
  const theme = useThemeMode();
  const C = theme === "dark" ? DARK_UI : LIGHT_UI;

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(() => {
    if (typeof window === "undefined") return true;
    return window.localStorage.getItem(REMEMBER_ME_KEY) !== "false";
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        window.location.href = "/dashboard";
      }
    });
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setRememberSessionPreference(rememberMe);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      window.location.href = "/dashboard";
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", position: "relative", overflow: "hidden", transition: "color 0.3s ease" }}>

      {/* ── Left Panel ── */}
      <div
        style={{ position: "relative", zIndex: 1 }}
        className="hidden lg:flex lg:w-1/2 items-center justify-center px-12"
      >
        <div style={{
          position: "absolute", top: "25%", left: "25%",
          width: "320px", height: "320px",
          background: "rgba(232,160,32,0.08)",
          borderRadius: "50%", filter: "blur(80px)", pointerEvents: "none"
        }} />
        <div style={{
          position: "absolute", bottom: "25%", right: "20%",
          width: "200px", height: "200px",
          background: "rgba(193,68,14,0.07)",
          borderRadius: "50%", filter: "blur(60px)", pointerEvents: "none"
        }} />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          style={{ textAlign: "center", position: "relative", zIndex: 1 }}
        >
          {/* AFX Logo */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", marginBottom: "3rem" }}>
            <div style={{
              width: "48px", height: "40px",
              backgroundColor: C.surface,
              border: `1px solid ${C.border}`,
              borderRadius: "12px",
              display: "flex", alignItems: "center", justifyContent: "center"
            }}>
              <span style={{ fontFamily: "'General Sans', sans-serif", fontWeight: 700, fontSize: "1rem", color: "#E8A020" }}>A</span>
              <span style={{ fontFamily: "'General Sans', sans-serif", fontWeight: 700, fontSize: "1.15rem", color: "#C1440E" }}>F</span>
              <span style={{ fontFamily: "'General Sans', sans-serif", fontWeight: 700, fontSize: "1rem", color: "#D4A853" }}>X</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.2 }}>
              <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: "0.875rem", color: C.text }}>
                African Animation
              </span>
              <span style={{
                fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: "0.875rem",
                background: "linear-gradient(135deg, #E8A020, #C1440E)",
                WebkitBackgroundClip: "text", backgroundClip: "text",
                WebkitTextFillColor: "transparent"
              }}>
                Academy
              </span>
            </div>
          </div>

          <h2 style={{
            fontFamily: "'General Sans', sans-serif", fontWeight: 700,
            fontSize: "2.5rem", lineHeight: 1.15, color: C.text, marginBottom: "1.25rem"
          }}>
            Bring African<br />
            <span style={{
              background: "linear-gradient(135deg, #E8A020, #C1440E)",
              WebkitBackgroundClip: "text", backgroundClip: "text",
              WebkitTextFillColor: "transparent"
            }}>
              Stories to Life
            </span>
          </h2>

          <p style={{ color: C.muted, fontSize: "1rem", lineHeight: 1.7, maxWidth: "300px", margin: "0 auto 2.5rem" }}>
            Join African creatives learning animation, building portfolios and connecting with a global community.
          </p>

          <p style={{ fontFamily: "'General Sans', sans-serif", fontStyle: "italic", color: "#D4A853", fontSize: "0.8rem" }}>
            Proudly African. Globally Creative.
          </p>
        </motion.div>
      </div>

      {/* Vertical divider */}
      <div className="hidden lg:block" style={{
        position: "relative", zIndex: 1,
        width: "1px", backgroundColor: C.divider,
        alignSelf: "stretch"
      }} />

      {/* ── Right Panel — Form ── */}
      <div
        style={{ position: "relative", zIndex: 1 }}
        className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12"
      >
        <motion.div
          style={{ width: "100%", maxWidth: "440px" }}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-10 lg:hidden">
            <div style={{
              width: "40px", height: "34px", backgroundColor: C.surface,
              border: `1px solid ${C.border}`, borderRadius: "10px",
              display: "flex", alignItems: "center", justifyContent: "center"
            }}>
              <span style={{ fontFamily: "'General Sans',sans-serif", fontWeight: 700, color: "#E8A020", fontSize: "0.85rem" }}>A</span>
              <span style={{ fontFamily: "'General Sans',sans-serif", fontWeight: 700, color: "#C1440E", fontSize: "0.95rem" }}>F</span>
              <span style={{ fontFamily: "'General Sans',sans-serif", fontWeight: 700, color: "#D4A853", fontSize: "0.85rem" }}>X</span>
            </div>
            <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, color: C.text, fontSize: "1rem" }}>
              Africa Fx
            </span>
          </div>

          <h1 style={{ fontFamily: "'General Sans', sans-serif", fontWeight: 700, fontSize: "2rem", color: C.text, marginBottom: "0.5rem" }}>
            Welcome back
          </h1>
          <p style={{ color: C.muted, marginBottom: "2rem", fontFamily: "'General Sans', sans-serif" }}>
            Sign in to continue your animation journey
          </p>

          {error && (
            <div style={{
              background: "rgba(255,87,34,0.10)", border: "1px solid rgba(255,87,34,0.30)",
              color: "#FF5722", borderRadius: "12px", padding: "0.75rem 1rem",
              marginBottom: "1.5rem", fontSize: "0.875rem"
            }}>
              {error}
            </div>
          )}
          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

            {/* Email */}
            <div>
              <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, color: C.muted, marginBottom: "0.5rem", fontFamily: "'General Sans', sans-serif" }}>
                Email address
              </label>
              <div style={{ position: "relative" }}>
                <Mail style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", width: "16px", height: "16px", color: C.dim }} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="input-field"
                  style={{ paddingLeft: "2.75rem" }}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                <label style={{ fontSize: "0.875rem", fontWeight: 500, color: C.muted, fontFamily: "'General Sans', sans-serif" }}>
                  Password
                </label>
                <Link href="/forgot-password" style={{ fontSize: "0.8rem", color: "#E8A020", textDecoration: "none" }}>
                  Forgot password?
                </Link>
              </div>
              <div style={{ position: "relative" }}>
                <Lock style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", width: "16px", height: "16px", color: C.dim }} />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="input-field"
                  style={{ paddingLeft: "2.75rem", paddingRight: "2.75rem" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: "absolute", right: "1rem", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: C.dim }}
                >
                  {showPassword
                    ? <EyeOff style={{ width: "16px", height: "16px" }} />
                    : <Eye style={{ width: "16px", height: "16px" }} />}
                </button>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "0.55rem", marginTop: "-0.25rem" }}>
              <input
                id="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{
                  width: "15px",
                  height: "15px",
                  accentColor: "#E8A020",
                  cursor: "pointer",
                }}
              />
              <label
                htmlFor="remember-me"
                style={{
                  color: C.muted,
                  fontSize: "0.82rem",
                  fontFamily: "'General Sans', sans-serif",
                  cursor: "pointer",
                }}
              >
                Keep me signed in
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ width: "100%", padding: "1rem", fontSize: "1rem", gap: "0.5rem" }}
            >
              {loading
                ? <div style={{ width: "20px", height: "20px", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "white", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                : <> Sign in <ArrowRight style={{ width: "16px", height: "16px" }} /></>
              }
            </button>
          </form>

          <p style={{ textAlign: "center", color: C.dim, fontSize: "0.75rem", marginTop: "0.5rem", fontFamily: "'General Sans', sans-serif" }}>
            Use your email and password to sign in.
          </p>

          <p style={{ textAlign: "center", color: C.muted, fontSize: "0.875rem", marginTop: "2rem", fontFamily: "'General Sans', sans-serif" }}>
            Don&apos;t have an account?{" "}
            <Link href="/signup" style={{ color: "#E8A020", fontWeight: 600, textDecoration: "none" }}>
              Create one free
            </Link>
          </p>

          <p style={{ textAlign: "center", color: C.dim, fontSize: "0.75rem", marginTop: "1rem", fontFamily: "'General Sans', sans-serif" }}>
            Want to learn more about us?{" "}
            <Link href="/home" style={{ color: "#E8A020", fontWeight: 600, textDecoration: "none" }}>
              View our story
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}

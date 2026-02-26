"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, ArrowRight } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [googleMsg, setGoogleMsg] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      window.location.href = "/dashboard";
    }
  };

  const handleGoogle = () => {
    setGoogleMsg(true);
    setTimeout(() => setGoogleMsg(false), 3000);
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", position: "relative", overflow: "hidden" }}>

      {/* ── Brown veil over background image ── */}
      <div style={{
        position: "absolute",
        inset: 0,
        backgroundColor: "rgba(20, 9, 2, 0.84)",
        backdropFilter: "blur(2px)",
        WebkitBackdropFilter: "blur(2px)",
        zIndex: 0,
        pointerEvents: "none"
      }} />

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
              backgroundColor: "#221808",
              border: "1px solid #3D2E10",
              borderRadius: "12px",
              display: "flex", alignItems: "center", justifyContent: "center"
            }}>
              <span style={{ fontFamily: "'Clash Display', sans-serif", fontWeight: 700, fontSize: "1rem", color: "#E8A020" }}>A</span>
              <span style={{ fontFamily: "'Clash Display', sans-serif", fontWeight: 700, fontSize: "1.15rem", color: "#C1440E" }}>F</span>
              <span style={{ fontFamily: "'Clash Display', sans-serif", fontWeight: 700, fontSize: "1rem", color: "#D4A853" }}>X</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.2 }}>
              <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: "0.875rem", color: "#F5ECD7" }}>
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
            fontFamily: "'Clash Display', sans-serif", fontWeight: 700,
            fontSize: "2.5rem", lineHeight: 1.15, color: "#F5ECD7", marginBottom: "1.25rem"
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

          <p style={{ color: "#A89070", fontSize: "1rem", lineHeight: 1.7, maxWidth: "300px", margin: "0 auto 2.5rem" }}>
            Join African creatives learning animation, building portfolios and connecting with a global community.
          </p>

          <p style={{ fontFamily: "'Satoshi', sans-serif", fontStyle: "italic", color: "#D4A853", fontSize: "0.8rem" }}>
            Proudly African. Globally Creative.
          </p>
        </motion.div>
      </div>

      {/* Vertical divider */}
      <div className="hidden lg:block" style={{
        position: "relative", zIndex: 1,
        width: "1px", backgroundColor: "rgba(61,46,16,0.4)",
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
              width: "40px", height: "34px", backgroundColor: "#221808",
              border: "1px solid #3D2E10", borderRadius: "10px",
              display: "flex", alignItems: "center", justifyContent: "center"
            }}>
              <span style={{ fontFamily: "'Clash Display',sans-serif", fontWeight: 700, color: "#E8A020", fontSize: "0.85rem" }}>A</span>
              <span style={{ fontFamily: "'Clash Display',sans-serif", fontWeight: 700, color: "#C1440E", fontSize: "0.95rem" }}>F</span>
              <span style={{ fontFamily: "'Clash Display',sans-serif", fontWeight: 700, color: "#D4A853", fontSize: "0.85rem" }}>X</span>
            </div>
            <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, color: "#F5ECD7", fontSize: "1rem" }}>
              Africa Fx
            </span>
          </div>

          <h1 style={{ fontFamily: "'Clash Display', sans-serif", fontWeight: 700, fontSize: "2rem", color: "#F5ECD7", marginBottom: "0.5rem" }}>
            Welcome back
          </h1>
          <p style={{ color: "#A89070", marginBottom: "2rem", fontFamily: "'Satoshi', sans-serif" }}>
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
              <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, color: "#A89070", marginBottom: "0.5rem", fontFamily: "'General Sans', sans-serif" }}>
                Email address
              </label>
              <div style={{ position: "relative" }}>
                <Mail style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", width: "16px", height: "16px", color: "#6B5A40" }} />
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
                <label style={{ fontSize: "0.875rem", fontWeight: 500, color: "#A89070", fontFamily: "'General Sans', sans-serif" }}>
                  Password
                </label>
                <Link href="/forgot-password" style={{ fontSize: "0.8rem", color: "#E8A020", textDecoration: "none" }}>
                  Forgot password?
                </Link>
              </div>
              <div style={{ position: "relative" }}>
                <Lock style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", width: "16px", height: "16px", color: "#6B5A40" }} />
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
                  style={{ position: "absolute", right: "1rem", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#6B5A40" }}
                >
                  {showPassword
                    ? <EyeOff style={{ width: "16px", height: "16px" }} />
                    : <Eye style={{ width: "16px", height: "16px" }} />}
                </button>
              </div>
            </div>

            {/* Remember me */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <input type="checkbox" id="remember" style={{ width: "16px", height: "16px", accentColor: "#E8A020", cursor: "pointer" }} />
              <label htmlFor="remember" style={{ fontSize: "0.875rem", color: "#A89070", cursor: "pointer", fontFamily: "'General Sans', sans-serif" }}>
                Remember me for 30 days
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

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", margin: "1.5rem 0" }}>
            <div style={{ flex: 1, height: "1px", backgroundColor: "#3D2E10" }} />
            <span style={{ color: "#6B5A40", fontSize: "0.8rem", fontFamily: "'General Sans', sans-serif" }}>or</span>
            <div style={{ flex: 1, height: "1px", backgroundColor: "#3D2E10" }} />
          </div>

          {/* Google button */}
          <button
            onClick={handleGoogle}
            className="btn-ghost"
            style={{ width: "100%", padding: "0.75rem", fontSize: "0.875rem", gap: "0.5rem" }}
          >
            <svg style={{ width: "16px", height: "16px" }} viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          {googleMsg && (
            <div style={{
              background: "rgba(232,160,32,0.10)", border: "1px solid rgba(232,160,32,0.30)",
              color: "#E8A020", borderRadius: "10px", padding: "0.6rem 1rem",
              marginTop: "0.75rem", fontSize: "0.8rem", textAlign: "center",
              fontFamily: "'General Sans', sans-serif"
            }}>
              Google login coming soon. Please sign in with email for now.
            </div>
          )}

          <p style={{ textAlign: "center", color: "#6B5A40", fontSize: "0.75rem", marginTop: "0.5rem", fontFamily: "'General Sans', sans-serif" }}>
            Full social login coming soon
          </p>

          <p style={{ textAlign: "center", color: "#A89070", fontSize: "0.875rem", marginTop: "2rem", fontFamily: "'Satoshi', sans-serif" }}>
            Don&apos;t have an account?{" "}
            <Link href="/signup" style={{ color: "#E8A020", fontWeight: 600, textDecoration: "none" }}>
              Create one free
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}

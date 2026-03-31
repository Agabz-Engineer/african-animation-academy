"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Mail, ArrowRight, ArrowLeft } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { getPasswordRecoveryRedirectUrl, normalizeEmailAddress } from "@/lib/authValidation";
import { useThemeMode } from "@/lib/useThemeMode";

const DARK_UI = {
  surface: "#0F0F0F",
  border: "#2A2A2A",
  text: "#FFFFFF",
  muted: "#A0A0A0",
  dim: "#666666",
  divider: "rgba(255,109,31,0.2)",
  accent: "#FF6D1F",
  accentHover: "#E04D00",
};

const LIGHT_UI = {
  surface: "#FFFFFF",
  border: "#E5E7EB",
  text: "#1F2937",
  muted: "#6B7280",
  dim: "#9CA3AF",
  divider: "rgba(255,109,31,0.1)",
  accent: "#FF6D1F",
  accentHover: "#E04D00",
};

export default function ForgotPasswordPage() {
  const theme = useThemeMode();
  const C = theme === "dark" ? DARK_UI : LIGHT_UI;

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const normalizedEmail = normalizeEmailAddress(email);

    if (!supabase) {
      setError("Authentication service not available");
      setLoading(false);
      return;
    }

    // Always use the production URL so Supabase whitelist matches correctly.
    // Fall back to current origin for local dev if NEXT_PUBLIC_SITE_URL is not set.
    const currentOrigin = typeof window !== "undefined" ? window.location.origin : "";
    const redirectTo = getPasswordRecoveryRedirectUrl(currentOrigin) ?? undefined;

    const { error } = await supabase.auth.resetPasswordForEmail(
      normalizedEmail,
      redirectTo ? { redirectTo } : undefined
    );

    if (error) {
      // Provide a clear message for the common Supabase rate-limit error
      const msg = error.message.toLowerCase();
      if (msg.includes("rate limit") || msg.includes("too many") || msg.includes("over the limit")) {
        setError(
          "Too many reset requests. Supabase allows a limited number of emails per hour. Please wait a few minutes and try again."
        );
      } else if (msg.includes("not found") || msg.includes("user not found")) {
        // Security best practice: don't reveal if the email exists
        setSuccess(true);
      } else if (msg.includes("redirect") || msg.includes("url") || msg.includes("allowed")) {
        const hintSite = currentOrigin || process.env.NEXT_PUBLIC_SITE_URL || "your site URL";
        setError(
          `Reset link failed because the redirect URL isn't allowed. In Supabase Auth settings, add: ${hintSite}/auth/callback and ${hintSite}/update-password`
        );
      } else {
        setError(error.message);
      }
    } else {
      setSuccess(true);
    }

    setLoading(false);
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
          background: "rgba(255,109,31,0.08)",
          borderRadius: "50%", filter: "blur(80px)", pointerEvents: "none"
        }} />
        <div style={{
          position: "absolute", bottom: "25%", right: "20%",
          width: "200px", height: "200px",
          background: "rgba(224,77,0,0.07)",
          borderRadius: "50%", filter: "blur(60px)", pointerEvents: "none"
        }} />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
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
              <span style={{ fontFamily: "'General Sans', sans-serif", fontWeight: 700, fontSize: "1rem", color: "#FF6D1F" }}>A</span>
              <span style={{ fontFamily: "'General Sans', sans-serif", fontWeight: 700, fontSize: "1.15rem", color: "#E04D00" }}>F</span>
              <span style={{ fontFamily: "'General Sans', sans-serif", fontWeight: 700, fontSize: "1rem", color: "#F5E7C6" }}>X</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.2 }}>
              <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: "0.875rem", color: C.text }}>
                African Animation
              </span>
              <span style={{
                fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: "0.875rem",
                background: "linear-gradient(135deg, #FF6D1F, #E04D00)",
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
            Regain access to your<br />
            <span style={{
              background: "linear-gradient(135deg, #E8A020, #C1440E)",
              WebkitBackgroundClip: "text", backgroundClip: "text",
              WebkitTextFillColor: "transparent"
            }}>
              creative space
            </span>
          </h2>

          <p style={{ color: C.muted, fontSize: "1rem", lineHeight: 1.7, maxWidth: "300px", margin: "0 auto 2.5rem" }}>
            Don&apos;t worry, it happens to the best of us! Enter your email and we&apos;ll send you a password reset link.
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
          transition={{ duration: 0.5, ease: "easeInOut" }}
        >
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-10 lg:hidden">
            <div style={{
              width: "40px", height: "34px", backgroundColor: C.surface,
              border: `1px solid ${C.border}`, borderRadius: "10px",
              display: "flex", alignItems: "center", justifyContent: "center"
            }}>
              <span style={{ fontFamily: "'General Sans',sans-serif", fontWeight: 700, color: "#FF6D1F", fontSize: "0.85rem" }}>A</span>
              <span style={{ fontFamily: "'General Sans',sans-serif", fontWeight: 700, color: "#E04D00", fontSize: "0.95rem" }}>F</span>
              <span style={{ fontFamily: "'General Sans',sans-serif", fontWeight: 700, color: "#F5E7C6", fontSize: "0.85rem" }}>X</span>
            </div>
            <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, color: C.text, fontSize: "1rem" }}>
              Africa Fx
            </span>
          </div>

          <h1 style={{ fontFamily: "'General Sans', sans-serif", fontWeight: 700, fontSize: "2rem", color: C.text, marginBottom: "0.5rem" }}>
            Reset Password
          </h1>
          <p style={{ color: C.muted, marginBottom: "2rem", fontFamily: "'General Sans', sans-serif" }}>
            We&apos;ll send you an email with instructions to reset your password.
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

          {success ? (
            <div style={{
              background: "rgba(34,197,94,0.10)", border: "1px solid rgba(34,197,94,0.30)",
              color: "#22C55E", borderRadius: "12px", padding: "1.5rem",
              marginBottom: "1.5rem", textAlign: "center"
            }}>
              <div style={{ width: "48px", height: "48px", backgroundColor: "rgba(34,197,94,0.2)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1rem" }}>
                <Mail style={{ color: "#22C55E" }} />
              </div>
              <h3 style={{ fontFamily: "'General Sans', sans-serif", fontWeight: 600, fontSize: "1.1rem", marginBottom: "0.5rem", color: C.text }}>Check your email</h3>
              <p style={{ fontSize: "0.875rem", marginBottom: "1.5rem" }}>
                If an account exists for <strong>{normalizeEmailAddress(email)}</strong>, a password reset link is on its way.
              </p>
              <p style={{ fontSize: "0.8rem", color: C.muted, marginBottom: "1.25rem" }}>
                Use the exact email you signed up with, and check spam or promotions if it does not appear soon.
              </p>
              <Link
                href="/login"
                className="btn-primary"
                style={{ width: "100%", padding: "0.75rem", fontSize: "0.875rem", display: "flex", justifyContent: "center" }}
              >
                Back to login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleReset} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
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
                <p style={{ color: C.dim, fontSize: "0.8rem", marginTop: "0.65rem", fontFamily: "'General Sans', sans-serif" }}>
                  Enter the exact email used during signup.
                </p>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading || !email}
                className="btn-primary"
                style={{ width: "100%", padding: "1rem", fontSize: "1rem", gap: "0.5rem", marginTop: "0.5rem" }}
              >
                {loading
                  ? <div style={{ width: "20px", height: "20px", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "white", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                  : <> Send reset link <ArrowRight style={{ width: "16px", height: "16px" }} /></>
                }
              </button>
            </form>
          )}

          {!success && (
            <p style={{ textAlign: "center", color: C.muted, fontSize: "0.875rem", marginTop: "2rem", fontFamily: "'General Sans', sans-serif" }}>
              Remembered your password?{" "}
              <Link href="/login" style={{ color: "#FF6D1F", fontWeight: 600, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                <ArrowLeft style={{ width: "14px", height: "14px" }} /> Back to login
              </Link>
            </p>
          )}
        </motion.div>
      </div>
    </div>
  );
}

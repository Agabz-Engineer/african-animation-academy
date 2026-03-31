"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { EmailOtpType } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { useThemeMode } from "@/lib/useThemeMode";
import { getAccountHomePath } from "@/lib/accountRouting";

const DARK_UI = {
  bg: "#222222",
  text: "#FAF3E1",
  muted: "#D2C9B8",
};

const LIGHT_UI = {
  bg: "rgba(250,243,225,0.86)",
  text: "#222222",
  muted: "#555555",
};

export default function AuthCallbackPage() {
  const router = useRouter();
  const theme = useThemeMode();
  const C = theme === "dark" ? DARK_UI : LIGHT_UI;
  const hasRun = useRef(false);
  const [error, setError] = useState("");
  const [isRecoveryFlow, setIsRecoveryFlow] = useState(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const finishAuth = async () => {
      const validOtpTypes: EmailOtpType[] = [
        "signup",
        "invite",
        "magiclink",
        "recovery",
        "email_change",
        "email",
      ];
      const params = new URLSearchParams(window.location.search);
      const nextPath = params.get("next");
      const type = params.get("type");
      const recoveryFlow = type === "recovery" || nextPath === "/update-password";
      setIsRecoveryFlow(recoveryFlow);

      const providerError =
        params.get("error_description") || params.get("error");
      if (providerError) {
        setError(providerError);
        return;
      }

      const tokenHash = params.get("token_hash");
      if (tokenHash && type && validOtpTypes.includes(type as EmailOtpType)) {
        if (!supabase) return;
        const { error } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: type as EmailOtpType,
        });
        if (error) {
          setError(error.message);
          return;
        }
      }

      const code = params.get("code");
      if (code) {
        if (!supabase) return;
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          const lowerMessage = error.message.toLowerCase();
          if (lowerMessage.includes("code verifier")) {
            setError(
              recoveryFlow
                ? "This password reset link is invalid or expired. Request a new reset email and open the newest link."
                : "This sign-in link is invalid or expired. Request a new magic link and open the newest email link."
            );
          } else {
            setError(error.message);
          }
          return;
        }
      }

      const waitForSession = async () => {
        const timeoutMs = 5000;
        const intervalMs = 150;
        const start = Date.now();

        while (Date.now() - start < timeoutMs) {
          if (!supabase) return;
          const {
            data: { session },
            error: sessionError,
          } = await supabase.auth.getSession();

          if (sessionError) {
            setError(sessionError.message);
            return null;
          }

          if (session) return session;
          await new Promise((resolve) => setTimeout(resolve, intervalMs));
        }

        return null;
      };

      const session = await waitForSession();
      if (!session) {
        setError(
          recoveryFlow
            ? "Could not verify your password reset session. Please request a new reset email and try again."
            : "Could not create a session. Please request a new login link and try again."
        );
        return;
      }

      const accountType = session.user.user_metadata?.account_type as "animator" | "studio" | undefined;
      router.replace(nextPath && nextPath.startsWith("/") ? nextPath : getAccountHomePath(accountType));
    };

    finishAuth();
  }, [router]);

  if (error) {
    return (
      <main
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          padding: "1.5rem",
          background: C.bg,
          color: C.text,
          transition: "background-color 0.3s ease, color 0.3s ease",
        }}
      >
        <div style={{ maxWidth: "480px", width: "100%", textAlign: "center" }}>
          <h1
            style={{
              fontFamily: "'Clash Display', sans-serif",
              fontSize: "1.75rem",
              marginBottom: "0.75rem",
            }}
          >
            {isRecoveryFlow ? "Password reset failed" : "Sign-in failed"}
          </h1>
          <p style={{ color: theme === "dark" ? "#FF6D1F" : "#E04D00", marginBottom: "1.5rem" }}>{error}</p>
          <Link
            href={isRecoveryFlow ? "/forgot-password" : "/login"}
            style={{
              display: "inline-block",
              textDecoration: "none",
               background: "#FF6D1F",
               color: "#222222",
              padding: "0.7rem 1.1rem",
              borderRadius: "10px",
              fontWeight: 600,
            }}
          >
            {isRecoveryFlow ? "Request another reset link" : "Back to login"}
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: "1.5rem",
        background: C.bg,
        color: C.text,
        textAlign: "center",
        transition: "background-color 0.3s ease, color 0.3s ease",
      }}
    >
      <div>
        <h1
          style={{
            fontFamily: "'Clash Display', sans-serif",
            fontSize: "1.75rem",
            marginBottom: "0.75rem",
          }}
        >
          {isRecoveryFlow ? "Opening password reset" : "Finishing sign-in"}
        </h1>
        <p style={{ color: C.muted }}>
          {isRecoveryFlow ? "Please wait while we verify your reset link..." : "Please wait..."}
        </p>
      </div>
    </main>
  );
}

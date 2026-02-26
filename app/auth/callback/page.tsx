"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { EmailOtpType } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

export default function AuthCallbackPage() {
  const router = useRouter();
  const hasRun = useRef(false);
  const [error, setError] = useState("");

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

      const providerError =
        params.get("error_description") || params.get("error");
      if (providerError) {
        setError(providerError);
        return;
      }

      const tokenHash = params.get("token_hash");
      const type = params.get("type");
      if (tokenHash && type && validOtpTypes.includes(type as EmailOtpType)) {
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
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          const lowerMessage = error.message.toLowerCase();
          if (lowerMessage.includes("code verifier")) {
            setError(
              "This sign-in link is invalid or expired. Request a new magic link and open the newest email link."
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
          "Could not create a session. Please request a new login link and try again."
        );
        return;
      }

      const nextPath = params.get("next");
      router.replace(nextPath && nextPath.startsWith("/") ? nextPath : "/dashboard");
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
          background: "#140902",
          color: "#F5ECD7",
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
            Sign-in failed
          </h1>
          <p style={{ color: "#FFB4A1", marginBottom: "1.5rem" }}>{error}</p>
          <Link
            href="/login"
            style={{
              display: "inline-block",
              textDecoration: "none",
              background: "#E8A020",
              color: "#140902",
              padding: "0.7rem 1.1rem",
              borderRadius: "10px",
              fontWeight: 600,
            }}
          >
            Back to login
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
        background: "#140902",
        color: "#F5ECD7",
        textAlign: "center",
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
          Finishing sign-in
        </h1>
        <p style={{ color: "#A89070" }}>Please wait...</p>
      </div>
    </main>
  );
}

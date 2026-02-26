"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const hasRun = useRef(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const finishOAuth = async () => {
      const providerError =
        searchParams.get("error_description") || searchParams.get("error");
      if (providerError) {
        setError(providerError);
        return;
      }

      const code = searchParams.get("code");
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          setError(error.message);
          return;
        }
      }

      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        setError(sessionError.message);
        return;
      }

      if (!session) {
        setError("Could not create a session. Please try signing in again.");
        return;
      }

      router.replace("/dashboard");
    };

    finishOAuth();
  }, [router, searchParams]);

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
            Google sign-in failed
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
          Finishing your sign-in
        </h1>
        <p style={{ color: "#A89070" }}>Please wait...</p>
      </div>
    </main>
  );
}

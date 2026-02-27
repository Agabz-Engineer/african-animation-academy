"use client";

import { useEffect } from "react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    document.body.classList.add("auth-page");
    return () => document.body.classList.remove("auth-page");
  }, []);

  return children;
}

"use client";

import { useEffect, useState } from "react";

export type ThemeMode = "dark" | "light";

export const getInitialThemeMode = (): ThemeMode => {
  if (typeof window === "undefined") return "dark";
  const saved = localStorage.getItem("africafx-theme");
  if (saved === "dark" || saved === "light") return saved;
  const attr = document.documentElement.getAttribute("data-theme");
  return attr === "light" ? "light" : "dark";
};

export const useThemeMode = (): ThemeMode => {
  const [theme, setTheme] = useState<ThemeMode>(getInitialThemeMode);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      const attr = document.documentElement.getAttribute("data-theme");
      if (attr === "dark" || attr === "light") setTheme(attr);
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    return () => observer.disconnect();
  }, []);

  return theme;
};

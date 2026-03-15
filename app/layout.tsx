import type { Metadata } from "next";
import localFont from "next/font/local";
import { getAdminSettings } from "@/lib/adminSettings";
import "./globals.css";

const clashDisplay = localFont({
  src: [
    { path: "../public/fonts/clash-display-500.woff2", weight: "500", style: "normal" },
    { path: "../public/fonts/clash-display-600.woff2", weight: "600", style: "normal" },
    { path: "../public/fonts/clash-display-700.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-clash-display",
  display: "swap",
});

const cabinetGrotesk = localFont({
  src: [
    { path: "../public/fonts/cabinet-grotesk-400.woff2", weight: "400", style: "normal" },
    { path: "../public/fonts/cabinet-grotesk-500.woff2", weight: "500", style: "normal" },
    { path: "../public/fonts/cabinet-grotesk-700.woff2", weight: "700", style: "normal" },
    { path: "../public/fonts/cabinet-grotesk-800.woff2", weight: "800", style: "normal" },
  ],
  variable: "--font-cabinet-grotesk",
  display: "swap",
});

const satoshi = localFont({
  src: [
    { path: "../public/fonts/satoshi-400.woff2", weight: "400", style: "normal" },
    { path: "../public/fonts/satoshi-500.woff2", weight: "500", style: "normal" },
    { path: "../public/fonts/satoshi-700.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-satoshi",
  display: "swap",
});

const generalSans = localFont({
  src: [
    { path: "../public/fonts/general-sans-400.woff2", weight: "400", style: "normal" },
    { path: "../public/fonts/general-sans-500.woff2", weight: "500", style: "normal" },
    { path: "../public/fonts/general-sans-600.woff2", weight: "600", style: "normal" },
  ],
  variable: "--font-general-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Africa Fx",
  description:
    "Africa Fx - Africa's premier animation and creative arts learning platform. Learn, create and connect with African creatives worldwide.",
  keywords: ["animation", "learn animation", "African animation", "online courses", "motion graphics"],
};

const themeBootScript = `
  (function () {
    var root = document.documentElement;
    root.classList.add("theme-init");
    try {
      var stored = localStorage.getItem("africafx-theme");
      var mode = stored === "light" || stored === "dark"
        ? stored
        : (window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark");
      root.setAttribute("data-theme", mode);
    } catch (e) {
      root.setAttribute("data-theme", "dark");
    }
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        root.classList.remove("theme-init");
      });
    });
  })();
`;

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const adminSettings = await getAdminSettings();

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
      </head>
      <body
        className={`${clashDisplay.variable} ${cabinetGrotesk.variable} ${satoshi.variable} ${generalSans.variable}`}
        suppressHydrationWarning
      >
        {adminSettings.maintenance_mode && (
          <div
            style={{
              position: "sticky",
              top: 0,
              zIndex: 9999,
              background: "#FF6D1F",
              color: "#FFFFFF",
              padding: "0.7rem 1rem",
              textAlign: "center",
              fontFamily: "var(--font-general-sans), sans-serif",
              fontSize: "0.9rem",
              fontWeight: 700,
            }}
          >
            Maintenance mode is active. Some actions may be temporarily restricted while updates are in progress.
          </div>
        )}
        {children}
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import localFont from "next/font/local";
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
  description: "Africa Fx — Africa's premier animation and creative arts learning platform. Learn, create and connect with African creatives worldwide.",
  keywords: ["animation", "learn animation", "African animation", "online courses", "motion graphics"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${clashDisplay.variable} ${cabinetGrotesk.variable} ${satoshi.variable} ${generalSans.variable}`}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}


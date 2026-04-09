"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { ArrowRight, ChevronLeft, Sparkles, Target, Users, Zap } from "lucide-react";
import { useThemeMode } from "@/lib/useThemeMode";

const DARK_UI = {
  text: "#FAF3E1",
  muted: "#CFC3B3",
  line: "rgba(255, 255, 255, 0.14)",
  navBg: "rgba(18, 18, 18, 0.74)",
  heroBg: "linear-gradient(135deg, rgba(23, 23, 23, 0.96) 0%, rgba(30, 25, 22, 0.98) 100%)",
  heroOverlay:
    "radial-gradient(circle at 82% 18%, rgba(255, 109, 31, 0.18), transparent 34%), radial-gradient(circle at 12% 22%, rgba(255, 255, 255, 0.06), transparent 26%)",
  heroBorder: "rgba(255, 255, 255, 0.12)",
  heroShadow: "0 28px 90px rgba(0, 0, 0, 0.36)",
  figureShell: "linear-gradient(180deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.02))",
  figureBorder: "rgba(255, 255, 255, 0.09)",
  heroGlow: "rgba(255, 132, 35, 0.34)",
  cutOverlay: "rgba(18, 18, 18, 0.96)",
  panelBg: "rgba(40, 40, 40, 0.62)",
  panelBorder: "rgba(255, 255, 255, 0.09)",
  panelShadow: "0 18px 50px rgba(0, 0, 0, 0.2)",
  statBg: "rgba(255, 255, 255, 0.04)",
  accentBg: "rgba(255, 109, 31, 0.12)",
};

const LIGHT_UI = {
  text: "#222222",
  muted: "#5B5348",
  line: "rgba(136, 120, 98, 0.24)",
  navBg: "rgba(255, 249, 239, 0.8)",
  heroBg: "linear-gradient(135deg, rgba(255, 251, 245, 0.98) 0%, rgba(250, 240, 224, 0.96) 100%)",
  heroOverlay:
    "radial-gradient(circle at 82% 18%, rgba(255, 109, 31, 0.14), transparent 32%), radial-gradient(circle at 12% 22%, rgba(255, 255, 255, 0.7), transparent 24%)",
  heroBorder: "rgba(208, 188, 157, 0.42)",
  heroShadow: "0 28px 90px rgba(189, 156, 118, 0.18)",
  figureShell: "linear-gradient(180deg, rgba(255, 255, 255, 0.88), rgba(252, 244, 231, 0.78))",
  figureBorder: "rgba(208, 188, 157, 0.38)",
  heroGlow: "rgba(255, 149, 74, 0.28)",
  cutOverlay: "rgba(255, 249, 239, 0.98)",
  panelBg: "rgba(255, 255, 255, 0.72)",
  panelBorder: "rgba(208, 188, 157, 0.34)",
  panelShadow: "0 18px 50px rgba(189, 156, 118, 0.14)",
  statBg: "rgba(255, 255, 255, 0.7)",
  accentBg: "rgba(255, 109, 31, 0.1)",
};

const containerMotion = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.08,
    },
  },
} as const;

const itemMotion = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.75,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  },
} as const;

const imageMotion = {
  hidden: { opacity: 0, y: 28, scale: 0.96 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.9,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  },
} as const;

const teamMembers = [
  {
    name: "Stella Nyamekye Anyebayaaka Appiok",
    role: "CEO",
    bio: "Sets the vision, strategy, and partnerships for AfricaFX.",
    focus: "Leadership and partnerships",
  },
  {
    name: "Anais Theresa Bengala Nyangono",
    role: "CTO",
    bio: "Leads the platform architecture and product engineering.",
    focus: "Technology and product systems",
  },
  {
    name: "Agaba Great John",
    role: "Engineering Lead",
    bio: "Builds the learning experience and performance of the product.",
    focus: "Experience and performance",
  },
  {
    name: "Kofi Baffour Ossei-Quaidoo",
    role: "CFO",
    bio: "Oversees finance, planning, and sustainable growth.",
    focus: "Finance and long-term growth",
  },
  {
    name: "Erica Maame Akua Boakye",
    role: "CMO",
    bio: "Drives brand strategy and creator growth campaigns.",
    focus: "Brand and creator growth",
  },
  {
    name: "Joan Naa Momo Affotey",
    role: "CSO",
    bio: "Leads strategy, operations, and execution.",
    focus: "Strategy and execution",
  },
  {
    name: "Graziella Xoese Abla Amenuvor",
    role: "Operations & People",
    bio: "Strengthens team culture and day-to-day operations.",
    focus: "Operations and people",
  },
];

const storyPillars = [
  {
    label: "Built for creatives",
    copy: "Industry-ready learning designed for African animation talent.",
  },
  {
    label: "Rooted in community",
    copy: "A platform that connects artists, mentors, and studios.",
  },
  {
    label: "Focused on outcomes",
    copy: "Training, visibility, and real opportunities in one place.",
  },
];

const problemLines = [
  "Animators often struggle to find quality training and structured growth pathways.",
  "Studios still lose time trying to discover talent that is truly production-ready.",
];

const solutionLines = [
  "AfricaFX brings learning, talent development, and discovery into one calm, modern platform.",
  "We help creatives grow with confidence and help studios hire with greater clarity.",
];

export default function AboutPage() {
  const theme = useThemeMode();
  const C = theme === "dark" ? DARK_UI : LIGHT_UI;

  const aboutRef = useRef<HTMLElement | null>(null);
  const aboutInView = useInView(aboutRef, { once: true, amount: 0.12 });

  return (
    <div style={{ minHeight: "100vh", transition: "color 0.3s ease, background-color 0.3s ease" }}>
      <div
        style={{
          padding: "1rem 2rem",
          borderBottom: `1px solid ${C.line}`,
          backgroundColor: C.navBg,
          backdropFilter: "blur(12px)",
        }}
      >
        <Link
          href="/login"
          style={{
            color: C.text,
            textDecoration: "none",
            fontFamily: "General Sans, sans-serif",
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            width: "fit-content",
          }}
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Login
        </Link>
      </div>

      <motion.section
        id="about"
        ref={aboutRef}
        className="px-4 md:px-8 py-10 md:py-14"
        initial="hidden"
        animate={aboutInView ? "show" : "hidden"}
        variants={containerMotion}
      >
        <div className="max-w-7xl mx-auto space-y-16 md:space-y-24">
          <motion.div
            variants={itemMotion}
            className="relative overflow-hidden rounded-[2rem] md:rounded-[3rem] border"
            style={{
              background: C.heroBg,
              border: `1px solid ${C.heroBorder}`,
              boxShadow: C.heroShadow,
            }}
          >
            <div className="absolute inset-0" style={{ background: C.heroOverlay }} />
            <div
              className="absolute -left-16 top-14 h-44 w-44 rounded-full blur-3xl"
              style={{ background: C.heroGlow, opacity: theme === "dark" ? 0.32 : 0.45 }}
            />
            <div
              className="absolute -right-10 top-12 h-52 w-52 rounded-full blur-3xl"
              style={{ background: C.heroGlow, opacity: theme === "dark" ? 0.28 : 0.34 }}
            />

            <div className="relative z-10 grid items-center gap-10 px-6 pb-24 pt-8 md:px-10 md:pb-32 md:pt-12 lg:grid-cols-[minmax(0,1fr)_460px] lg:gap-4 lg:px-14 lg:pt-16">
              <motion.div variants={containerMotion} className="max-w-2xl">
                <motion.div variants={itemMotion} className="mb-6">
                  <div
                    className="inline-flex items-center gap-2 rounded-full border px-4 py-2"
                    style={{
                      background: C.statBg,
                      borderColor: C.panelBorder,
                      backdropFilter: "blur(8px)",
                    }}
                  >
                    <Sparkles className="h-4 w-4" style={{ color: "#FF6D1F" }} />
                    <span
                      className="text-xs font-semibold uppercase tracking-[0.28em]"
                      style={{ color: "#FF6D1F", fontFamily: "General Sans, sans-serif" }}
                    >
                      Our Story
                    </span>
                  </div>
                </motion.div>

                <motion.h1
                  variants={itemMotion}
                  className="text-4xl font-bold leading-tight sm:text-5xl md:text-6xl lg:text-7xl"
                  style={{
                    color: C.text,
                    fontFamily: "Clash Display, sans-serif",
                    letterSpacing: "-0.03em",
                  }}
                >
                  A calmer way to grow
                  <br />
                  Africa&apos;s animation future.
                </motion.h1>

                <motion.p
                  variants={itemMotion}
                  className="mt-6 max-w-xl text-lg leading-relaxed md:text-xl"
                  style={{ color: C.muted, fontFamily: "Satoshi, sans-serif" }}
                >
                  AfricaFX exists to help African animators learn with structure, build with confidence, and
                  connect with real opportunities without losing the warmth of community.
                </motion.p>

                <motion.div variants={itemMotion} className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
                  <Link
                    href="/signup"
                    className="inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-transform duration-300 hover:-translate-y-0.5"
                    style={{
                      background: "linear-gradient(135deg, #FF6D1F, #E04D00)",
                      color: "#FAF3E1",
                      fontFamily: "General Sans, sans-serif",
                    }}
                  >
                    Start your journey
                    <ArrowRight className="h-4 w-4" />
                  </Link>

                  <div
                    className="inline-flex items-center rounded-full border px-4 py-3 text-sm"
                    style={{
                      borderColor: C.panelBorder,
                      background: C.statBg,
                      color: C.muted,
                      fontFamily: "Satoshi, sans-serif",
                    }}
                  >
                    Learning, community, and studio visibility in one place.
                  </div>
                </motion.div>

                <motion.div variants={itemMotion} className="mt-10 grid gap-3 sm:grid-cols-3">
                  {storyPillars.map((pillar) => (
                    <div
                      key={pillar.label}
                      className="rounded-[1.5rem] border p-4"
                      style={{
                        background: C.statBg,
                        borderColor: C.panelBorder,
                      }}
                    >
                      <p
                        className="text-[0.68rem] font-semibold uppercase tracking-[0.24em]"
                        style={{ color: "#FF6D1F", fontFamily: "General Sans, sans-serif" }}
                      >
                        {pillar.label}
                      </p>
                      <p className="mt-2 text-sm leading-6" style={{ color: C.muted, fontFamily: "Satoshi, sans-serif" }}>
                        {pillar.copy}
                      </p>
                    </div>
                  ))}
                </motion.div>
              </motion.div>

              <motion.div
                variants={imageMotion}
                className="relative flex min-h-[320px] items-end justify-center lg:min-h-[500px] lg:justify-end"
              >
                <div
                  className="absolute inset-x-4 bottom-6 top-6 rounded-[2rem] md:inset-x-10"
                  style={{
                    background: C.figureShell,
                    border: `1px solid ${C.figureBorder}`,
                  }}
                />
                <div
                  className="absolute inset-x-12 bottom-10 top-14 rounded-full blur-3xl md:inset-x-24"
                  style={{ background: C.heroGlow, opacity: theme === "dark" ? 0.4 : 0.32 }}
                />
                <div className="relative z-10 aspect-[1/1.02] w-full max-w-[530px]">
                  <Image
                    src="/images/about-hero-character.png"
                    alt="Illustrated African animation heroine in motion"
                    fill
                    priority
                    sizes="(min-width: 1024px) 460px, (min-width: 768px) 55vw, 88vw"
                    className="pointer-events-none select-none object-contain object-center"
                  />
                </div>
              </motion.div>
            </div>

            <div
              className="absolute inset-x-0 bottom-0 h-20 md:h-28"
              style={{
                background: C.cutOverlay,
                clipPath: "polygon(0 34%, 50% 0, 100% 34%, 100% 100%, 0 100%)",
              }}
            />
          </motion.div>

          <motion.div variants={itemMotion} className="grid gap-6 lg:grid-cols-2">
            <div
              className="rounded-[1.75rem] border p-6 md:p-8"
              style={{
                background: C.panelBg,
                border: `1px solid ${C.panelBorder}`,
                boxShadow: C.panelShadow,
              }}
            >
              <div
                className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl"
                style={{ background: C.accentBg }}
              >
                <Target className="h-6 w-6" style={{ color: "#FF6D1F" }} />
              </div>
              <p
                className="text-xs font-semibold uppercase tracking-[0.28em]"
                style={{ color: "#FF6D1F", fontFamily: "General Sans, sans-serif" }}
              >
                The challenge
              </p>
              <div className="mt-4 space-y-4">
                {problemLines.map((line) => (
                  <p key={line} className="text-base leading-7 md:text-lg" style={{ color: C.text, fontFamily: "Satoshi, sans-serif" }}>
                    {line}
                  </p>
                ))}
              </div>
            </div>

            <div
              className="rounded-[1.75rem] border p-6 md:p-8"
              style={{
                background: C.panelBg,
                border: `1px solid ${C.panelBorder}`,
                boxShadow: C.panelShadow,
              }}
            >
              <div
                className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl"
                style={{ background: C.accentBg }}
              >
                <Zap className="h-6 w-6" style={{ color: "#FF6D1F" }} />
              </div>
              <p
                className="text-xs font-semibold uppercase tracking-[0.28em]"
                style={{ color: "#FF6D1F", fontFamily: "General Sans, sans-serif" }}
              >
                Our solution
              </p>
              <div className="mt-4 space-y-4">
                {solutionLines.map((line) => (
                  <p key={line} className="text-base leading-7 md:text-lg" style={{ color: C.text, fontFamily: "Satoshi, sans-serif" }}>
                    {line}
                  </p>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div variants={itemMotion} className="grid gap-10 lg:grid-cols-[0.78fr_1.22fr] lg:gap-14">
            <div className="lg:sticky lg:top-10 lg:self-start">
              <div className="inline-flex items-center gap-3">
                <div className="h-px w-10" style={{ backgroundColor: C.line }} />
                <Users className="h-5 w-5" style={{ color: "#FF6D1F" }} />
                <div className="h-px w-10" style={{ backgroundColor: C.line }} />
              </div>

              <h2
                className="mt-6 text-4xl font-bold md:text-5xl"
                style={{ color: C.text, fontFamily: "Clash Display, sans-serif", letterSpacing: "-0.03em" }}
              >
                Meet the team
                <br />
                behind AfricaFX.
              </h2>

              <p className="mt-5 max-w-md text-lg leading-8" style={{ color: C.muted, fontFamily: "Satoshi, sans-serif" }}>
                We kept this section minimal on purpose. No photo placeholders, no visual clutter, just the people
                shaping the platform and the role each person plays.
              </p>

              <Link
                href="/signup"
                className="mt-8 inline-flex items-center gap-2 text-sm font-semibold"
                style={{ color: "#FF6D1F", fontFamily: "General Sans, sans-serif", textDecoration: "none" }}
              >
                Explore AfricaFX
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {teamMembers.map((member, index) => (
                <motion.article
                  key={member.name}
                  variants={itemMotion}
                  transition={{ delay: index * 0.04 }}
                  className="rounded-[1.75rem] border p-6 md:p-7"
                  style={{
                    background: C.panelBg,
                    border: `1px solid ${C.panelBorder}`,
                    boxShadow: C.panelShadow,
                  }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <p
                      className="text-[0.68rem] font-semibold uppercase tracking-[0.28em]"
                      style={{ color: "#FF6D1F", fontFamily: "General Sans, sans-serif" }}
                    >
                      {member.role}
                    </p>
                    <span className="text-sm" style={{ color: C.muted, fontFamily: "General Sans, sans-serif" }}>
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </div>

                  <h3
                    className="mt-6 text-xl font-semibold leading-snug md:text-2xl"
                    style={{ color: C.text, fontFamily: "Clash Display, sans-serif" }}
                  >
                    {member.name}
                  </h3>

                  <p className="mt-4 text-sm leading-7 md:text-base" style={{ color: C.muted, fontFamily: "Satoshi, sans-serif" }}>
                    {member.bio}
                  </p>

                  <div className="mt-6 border-t pt-5" style={{ borderColor: C.line }}>
                    <p
                      className="text-[0.68rem] font-semibold uppercase tracking-[0.24em]"
                      style={{ color: C.muted, fontFamily: "General Sans, sans-serif" }}
                    >
                      Focus
                    </p>
                    <p className="mt-2 text-sm leading-6" style={{ color: C.text, fontFamily: "Satoshi, sans-serif" }}>
                      {member.focus}
                    </p>
                  </div>
                </motion.article>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.section>
    </div>
  );
}

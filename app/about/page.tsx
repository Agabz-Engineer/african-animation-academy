"use client";

import { useRef, type CSSProperties } from "react";
import { motion, useInView } from "framer-motion";
import {
  ChevronLeft,
} from "lucide-react";
import Link from "next/link";
import { useThemeMode } from "@/lib/useThemeMode";

const DARK_UI = {
  text: "#F5ECD7",
  muted: "#A89070",
  line: "#3D2E10",
  softPanelBg: "rgba(34, 24, 8, 0.75)",
  softPanelBorder: "rgba(61,46,16,0.6)",
  ghostBg: "rgba(26, 18, 8, 0.45)",
  ghostBorder: "rgba(61,46,16,0.8)",
  cardBg: "rgba(13, 9, 5, 0.60)",
  cardBorder: "rgba(61, 46, 16, 0.40)",
  navBg: "rgba(34,24,8,0.55)",
};

const LIGHT_UI = {
  text: "#1C1C1C",
  muted: "#544F49",
  line: "#D7C7A7",
  softPanelBg: "rgba(255, 255, 255, 0.78)",
  softPanelBorder: "rgba(188, 165, 125, 0.48)",
  ghostBg: "rgba(255, 255, 255, 0.72)",
  ghostBorder: "rgba(188, 165, 125, 0.58)",
  cardBg: "rgba(255, 255, 255, 0.80)",
  cardBorder: "rgba(188, 165, 125, 0.42)",
  navBg: "rgba(255, 255, 255, 0.78)",
};

const rollContainer = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.12,
    },
  },
};

const rollEase: [number, number, number, number] = [0.22, 1, 0.36, 1];

const rollItem = {
  hidden: { y: "120%", rotateX: 80, opacity: 0 },
  show: {
    y: "0%",
    rotateX: 0,
    opacity: 1,
    transition: { duration: 0.85, ease: rollEase },
  },
};

type RollLineProps = {
  text: string;
  className?: string;
  style?: CSSProperties;
};

const RollLine = ({ text, className, style }: RollLineProps) => (
  <span className="block overflow-hidden">
    <motion.span className={className} style={{ display: "block", ...style }} variants={rollItem}>
      {text}
    </motion.span>
  </span>
);

export default function AboutPage() {
  const theme = useThemeMode();
  const C = theme === "dark" ? DARK_UI : LIGHT_UI;

  const aboutRef = useRef<HTMLElement | null>(null);
  const aboutInView = useInView(aboutRef, { once: true, amount: 0.1 });

  const sectionTransition = { duration: 0.7, ease: "easeOut" as const };

  const teamMembers = [
    {
      name: "Stella Nyamekye Anyebayaaka Appiok",
      role: "CEO",
      bio: "Sets the vision, strategy, and partnerships for AfricaFX.",
      focus: "Leadership",
      initials: "SA",
    },
    {
      name: "Anais Theresa Bengala Nyangono",
      role: "CTO",
      bio: "Leads the platform architecture and product engineering.",
      focus: "Technology",
      initials: "AT",
    },
    {
      name: "Agaba Great John",
      role: "Engineering Lead",
      bio: "Builds the learning experience and performance of the product.",
      focus: "Product Engineering",
      initials: "AG",
    },
    {
      name: "Kofi Baffour Ossei-Quaidoo",
      role: "CFO",
      bio: "Oversees finance, planning, and sustainable growth.",
      focus: "Finance",
      initials: "KO",
    },
    {
      name: "Erica Maame Akua Boakye",
      role: "CMO",
      bio: "Drives brand strategy and creator growth campaigns.",
      focus: "Marketing",
      initials: "EB",
    },
    {
      name: "Joan Naa Momo Affotey",
      role: "CSO",
      bio: "Leads strategy, operations, and execution.",
      focus: "Strategy",
      initials: "JA",
    },
    {
      name: "Graziella Xoese Abla Amenuvor",
      role: "Operations & People",
      bio: "Strengthens team culture and day-to-day operations.",
      focus: "Operations",
      initials: "GA",
    },
  ];

  const problemLines = [
    "Today, animators struggle to access quality training resources,",
    "costing them money, time, and real employment opportunities.",
    "Animation studios also struggle to find skilled talent",
    "that meets industry standards, costing them clients and revenue.",
  ];

  const solutionLines = [
    "AfricaFX is fixing outdated training, animator unemployment,",
    "and recruitment challenges for animation studios in Africa.",
  ];

  return (
    <div style={{ minHeight: "100vh", transition: "color 0.3s ease, background-color 0.3s ease" }}>
      {/* Navigation */}
      <div style={{ 
        padding: "1rem 2rem", 
        borderBottom: `1px solid ${C.line}`,
        backgroundColor: theme === "dark" ? "rgba(13, 9, 5, 0.8)" : "rgba(255, 255, 255, 0.8)",
        backdropFilter: "blur(8px)"
      }}>
        <Link 
          href="/login" 
          style={{ 
            color: C.text, 
            textDecoration: "none",
            fontFamily: "General Sans, sans-serif",
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: "0.5rem"
          }}
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Login
        </Link>
      </div>

      <motion.section
        id="about"
        ref={aboutRef}
        initial={{ opacity: 0, y: 30 }}
        animate={aboutInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
        transition={sectionTransition}
        className="py-24 px-4 md:px-8"
        style={{ background: "transparent" }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 items-stretch">
            <div
              className="rounded-3xl p-8 border relative overflow-hidden"
              style={{ background: C.cardBg, border: `1px solid ${C.cardBorder}` }}
            >
              <div
                className="absolute inset-0 opacity-10 pointer-events-none"
                style={{ background: "linear-gradient(135deg, rgba(232,160,32,0.12) 0%, transparent 60%)" }}
              />
              <motion.div
                variants={rollContainer}
                initial="hidden"
                animate={aboutInView ? "show" : "hidden"}
              >
                <RollLine
                  text="PROBLEM"
                  className="text-5xl md:text-7xl font-bold"
                  style={{ color: "#E8A020", fontFamily: "Clash Display, sans-serif", letterSpacing: "-0.02em" }}
                />
                <div className="mt-6 space-y-3">
                  {problemLines.map((line) => (
                    <RollLine
                      key={line}
                      text={line}
                      className="text-lg md:text-2xl font-semibold"
                      style={{ color: C.text, fontFamily: "Satoshi, sans-serif" }}
                    />
                  ))}
                </div>
              </motion.div>
            </div>

            <div
              className="rounded-3xl p-8 border relative overflow-hidden"
              style={{ background: C.ghostBg, border: `1px solid ${C.ghostBorder}`, backdropFilter: "blur(8px)" }}
            >
              <div className="absolute left-6 top-4 text-5xl md:text-6xl" style={{ color: "#E8A020", opacity: 0.35, fontFamily: "Clash Display, sans-serif" }}>
                &ldquo;
              </div>
              <div className="absolute right-6 bottom-2 text-5xl md:text-6xl" style={{ color: "#E8A020", opacity: 0.35, fontFamily: "Clash Display, sans-serif" }}>
                &rdquo;
              </div>
              <motion.div
                variants={rollContainer}
                initial="hidden"
                animate={aboutInView ? "show" : "hidden"}
                className="relative z-10"
              >
                <RollLine
                  text="Our Solution"
                  className="text-xs font-semibold tracking-widest uppercase"
                  style={{ color: "#E8A020", fontFamily: "General Sans, sans-serif", marginBottom: "0.75rem" }}
                />
                {solutionLines.map((line) => (
                  <RollLine
                    key={line}
                    text={line}
                    className="text-2xl md:text-4xl font-bold"
                    style={{ color: C.text, fontFamily: "Clash Display, sans-serif", letterSpacing: "-0.02em" }}
                  />
                ))}
              </motion.div>
            </div>
          </div>

          <div className="mt-16">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-px" style={{ backgroundColor: C.line }} />
              <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: "#E8A020", fontFamily: "General Sans, sans-serif" }}>
                About Us
              </span>
              <div className="w-10 h-px" style={{ backgroundColor: C.line }} />
            </div>

            <h2 className="text-4xl md:text-5xl font-bold mb-10" style={{ fontFamily: "Clash Display, sans-serif" }}>
              <span style={{ color: C.text }}>Meet the Team </span>
              <span
                style={{
                  background: "linear-gradient(135deg, #E8A020, #C1440E)",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  color: "transparent",
                }}
              >
                Behind Africa Fx
              </span>
            </h2>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {teamMembers.map((member) => (
                <div
                  key={member.name}
                  className="rounded-2xl p-6 border transition-all duration-300 hover:-translate-y-1"
                  style={{
                    background: C.cardBg,
                    border: `1px solid ${C.cardBorder}`,
                    backdropFilter: "blur(4px)",
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center"
                      style={{ background: "linear-gradient(135deg, #E8A020, #C1440E)" }}
                    >
                      <span className="text-sm font-bold" style={{ color: "#0D0905", fontFamily: "General Sans, sans-serif" }}>
                        {member.initials}
                      </span>
                    </div>
                    <div>
                      <div className="text-sm font-semibold" style={{ color: C.text, fontFamily: "General Sans, sans-serif" }}>
                        {member.name}
                      </div>
                      <div className="text-xs mt-1" style={{ color: C.muted, fontFamily: "Satoshi, sans-serif" }}>
                        {member.role}
                      </div>
                    </div>
                  </div>

                  <p className="text-sm mt-4 leading-relaxed" style={{ color: C.muted, fontFamily: "Satoshi, sans-serif" }}>
                    {member.bio}
                  </p>

                  <div
                    className="mt-4 text-xs font-semibold inline-flex items-center gap-2 px-3 py-1 rounded-full"
                    style={{ backgroundColor: "rgba(232,160,32,0.1)", color: "#E8A020", fontFamily: "General Sans, sans-serif" }}
                  >
                    Focus: {member.focus}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.section>
    </div>
  );
}

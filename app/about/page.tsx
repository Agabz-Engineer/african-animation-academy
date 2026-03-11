"use client";

import { useRef, type CSSProperties } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  Users,
  Target,
  Sparkles,
  ArrowRight,
  Star,
  Award,
  Heart,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useThemeMode } from "@/lib/useThemeMode";

const DARK_UI = {
  text: "#FAF3E1",
  muted: "#D2C9B8",
  line: "#444444",
  softPanelBg: "rgba(44, 44, 44, 0.75)",
  softPanelBorder: "rgba(68, 68, 68, 0.6)",
  ghostBg: "rgba(34, 34, 34, 0.45)",
  ghostBorder: "rgba(68, 68, 68, 0.8)",
  cardBg: "rgba(51, 51, 51, 0.60)",
  cardBorder: "rgba(68, 68, 68, 0.40)",
  navBg: "rgba(44, 44, 44, 0.55)",
};

const LIGHT_UI = {
  text: "#222222",
  muted: "#555555",
  line: "#E7DBBD",
  softPanelBg: "rgba(255, 255, 255, 0.78)",
  softPanelBorder: "rgba(231, 219, 189, 0.48)",
  ghostBg: "rgba(255, 255, 255, 0.72)",
  ghostBorder: "rgba(231, 219, 189, 0.58)",
  cardBg: "rgba(255, 255, 255, 0.80)",
  cardBorder: "rgba(231, 219, 189, 0.42)",
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
    y: 0,
    rotateX: 0,
    opacity: 1,
    transition: {
      type: "spring" as const,
      damping: 30,
      stiffness: 400,
      ease: rollEase,
    },
  },
} as const;

// Premium animation variants
const premiumContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

const premiumCard = {
  hidden: { 
    opacity: 0, 
    y: 40,
    scale: 0.95,
    rotateY: 15
  },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    rotateY: 0,
    transition: {
      type: "spring" as const,
      damping: 20,
      stiffness: 300,
      duration: 0.8,
    },
  },
} as const;

const premiumImage = {
  hidden: { 
    opacity: 0,
    scale: 0.8,
    filter: "blur(10px)"
  },
  show: {
    opacity: 1,
    scale: 1,
    filter: "blur(0px)",
    transition: {
      duration: 1.2,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  },
} as const;

const premiumText = {
  hidden: { 
    opacity: 0,
    y: 20,
    filter: "blur(4px)"
  },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.8,
      delay: 0.3,
    },
  },
} as const;

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
        backgroundColor: theme === "dark" ? "rgba(34, 34, 34, 0.8)" : "rgba(250, 243, 225, 0.8)",
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
        <div className="max-w-7xl mx-auto">
          {/* Premium Hero Section */}
          <motion.div 
            className="text-center mb-20"
            variants={premiumContainer}
            initial="hidden"
            animate={aboutInView ? "show" : "hidden"}
          >
            <motion.div variants={premiumText} className="mb-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border" 
                style={{ 
                  background: C.ghostBg, 
                  borderColor: C.cardBorder,
                  backdropFilter: "blur(8px)"
                }}>
                <Sparkles className="w-4 h-4" style={{ color: "#FF6D1F" }} />
                <span className="text-xs font-semibold tracking-widest uppercase" 
                  style={{ color: "#FF6D1F", fontFamily: "General Sans, sans-serif" }}>
                  Our Story
                </span>
              </div>
            </motion.div>
            
            <motion.h1 
              variants={premiumText}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 px-4"
              style={{ 
                fontFamily: "Clash Display, sans-serif", 
                letterSpacing: "-0.02em",
                background: "linear-gradient(135deg, #FF6D1F, #E04D00)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent"
              }}
            >
              Empowering African
              <br />
              Animation Excellence
            </motion.h1>
            
            <motion.p 
              variants={premiumText}
              className="text-lg sm:text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed px-4"
              style={{ color: C.muted, fontFamily: "Satoshi, sans-serif" }}
            >
              We&apos;re revolutionizing animation education across Africa by bridging the gap between 
              talented creators and world-class opportunities.
            </motion.p>
          </motion.div>

          {/* Premium Problem & Solution Cards */}
          <motion.div 
            className="grid md:grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 mb-16 md:mb-24"
            variants={premiumContainer}
            initial="hidden"
            animate={aboutInView ? "show" : "hidden"}
          >
            {/* Problem Card */}
            <motion.div 
              variants={premiumCard}
              className="group relative rounded-2xl md:rounded-3xl p-6 md:p-10 border overflow-hidden hover:shadow-2xl transition-all duration-500"
              style={{ 
                background: C.cardBg, 
                border: `1px solid ${C.cardBorder}`,
                backdropFilter: "blur(12px)"
              }}
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ 
                  background: "linear-gradient(135deg, rgba(255,109,31,0.08) 0%, transparent 60%)",
                  pointerEvents: "none"
                }}
              />
              
              <div className="relative z-10">
                <motion.div variants={premiumImage} className="mb-8">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                    style={{ background: "linear-gradient(135deg, rgba(255,109,31,0.2), rgba(224,77,0,0.2))" }}>
                    <Target className="w-8 h-8" style={{ color: "#FF6D1F" }} />
                  </div>
                </motion.div>
                
                <motion.h2 variants={premiumText} 
                  className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6"
                  style={{ 
                    color: "#FF6D1F", 
                    fontFamily: "Clash Display, sans-serif", 
                    letterSpacing: "-0.02em" 
                  }}
                >
                  The Challenge
                </motion.h2>
                
                <motion.div variants={premiumText} className="space-y-4">
                  {problemLines.map((line, index) => (
                    <p key={index} className="text-base md:text-lg lg:text-xl leading-relaxed"
                      style={{ color: C.text, fontFamily: "Satoshi, sans-serif" }}>
                      {line}
                    </p>
                  ))}
                </motion.div>
              </div>
            </motion.div>

            {/* Solution Card */}
            <motion.div 
              variants={premiumCard}
              className="group relative rounded-3xl p-10 border overflow-hidden hover:shadow-2xl transition-all duration-500"
              style={{ 
                background: C.ghostBg, 
                border: `1px solid ${C.ghostBorder}`,
                backdropFilter: "blur(12px)"
              }}
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ 
                  background: "linear-gradient(135deg, rgba(255,109,31,0.08) 0%, transparent 60%)",
                  pointerEvents: "none"
                }}
              />
              
              <div className="relative z-10">
                <motion.div variants={premiumImage} className="mb-8">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                    style={{ background: "linear-gradient(135deg, rgba(255,109,31,0.2), rgba(224,77,0,0.2))" }}>
                    <Zap className="w-8 h-8" style={{ color: "#FF6D1F" }} />
                  </div>
                </motion.div>
                
                <motion.h2 variants={premiumText}
                  className="text-4xl md:text-5xl font-bold mb-6"
                  style={{ 
                    color: "#FF6D1F", 
                    fontFamily: "Clash Display, sans-serif", 
                    letterSpacing: "-0.02em" 
                  }}
                >
                  Our Solution
                </motion.h2>
                
                <motion.div variants={premiumText} className="space-y-4">
                  {solutionLines.map((line, index) => (
                    <p key={index} className="text-lg md:text-xl leading-relaxed"
                      style={{ color: C.text, fontFamily: "Satoshi, sans-serif" }}>
                      {line}
                    </p>
                  ))}
                </motion.div>
              </div>
            </motion.div>
          </motion.div>

          {/* Premium Team Section */}
          <motion.div
            variants={premiumContainer}
            initial="hidden"
            animate={aboutInView ? "show" : "hidden"}
            className="mt-24"
          >
            {/* Team Header */}
            <motion.div variants={premiumText} className="text-center mb-16">
              <div className="inline-flex items-center gap-3 mb-6">
                <div className="w-12 h-px" style={{ backgroundColor: C.line }} />
                <Users className="w-5 h-5" style={{ color: "#FF6D1F" }} />
                <div className="w-12 h-px" style={{ backgroundColor: C.line }} />
              </div>
              
              <h2 className="text-4xl md:text-6xl font-bold mb-6" style={{ fontFamily: "Clash Display, sans-serif" }}>
                <span style={{ color: C.text }}>Meet the </span>
                <span
                  style={{
                    background: "linear-gradient(135deg, #FF6D1F, #E04D00)",
                    WebkitBackgroundClip: "text",
                    backgroundClip: "text",
                    color: "transparent",
                  }}
                >
                  Visionaries
                </span>
              </h2>
              
              <p className="text-xl max-w-2xl mx-auto" style={{ color: C.muted, fontFamily: "Satoshi, sans-serif" }}>
                The passionate team building Africa&apos;s animation future
              </p>
            </motion.div>

            {/* Premium Team Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
              {teamMembers.map((member, index) => (
                <motion.div
                  key={member.name}
                  variants={premiumCard}
                  className="group relative"
                  transition={{ delay: index * 0.1 }}
                >
                  <div 
                    className="rounded-2xl md:rounded-3xl p-6 md:p-8 border transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 overflow-hidden"
                    style={{
                      background: C.cardBg,
                      border: `1px solid ${C.cardBorder}`,
                      backdropFilter: "blur(12px)",
                    }}
                  >
                    {/* Hover Effect Background */}
                    <div 
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      style={{ 
                        background: "linear-gradient(135deg, rgba(255,109,31,0.05) 0%, transparent 60%)",
                        pointerEvents: "none"
                      }}
                    />

                    <div className="relative z-10">
                      {/* Photo Space */}
                      <motion.div variants={premiumImage} className="mb-4 md:mb-6">
                        <div className="relative w-20 h-20 sm:w-24 sm:h-24 mx-auto">
                          {/* Placeholder for team photo */}
                          <div 
                            className="w-full h-full rounded-2xl flex items-center justify-center relative overflow-hidden"
                            style={{ 
                              background: "linear-gradient(135deg, rgba(255,109,31,0.15), rgba(224,77,0,0.15))",
                              border: `2px solid ${C.cardBorder}`
                            }}
                          >
                            {/* Initials as fallback */}
                            <span className="text-xl sm:text-2xl font-bold" style={{ 
                              color: "#FF6D1F", 
                              fontFamily: "Clash Display, sans-serif" 
                            }}>
                              {member.initials}
                            </span>
                            
                            {/* Photo upload indicator */}
                            <div className="absolute bottom-1 right-1 w-6 h-6 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
                              <Award className="w-3 h-3 text-white" />
                            </div>
                          </div>
                        </div>
                      </motion.div>

                      {/* Team Info */}
                      <motion.div variants={premiumText}>
                        <h3 className="text-lg sm:text-xl font-bold mb-2 text-center" 
                          style={{ 
                            color: C.text, 
                            fontFamily: "Clash Display, sans-serif" 
                          }}>
                          {member.name}
                        </h3>
                        
                        <div className="flex items-center justify-center gap-2 mb-4">
                          <Star className="w-4 h-4" style={{ color: "#FF6D1F" }} />
                          <p className="text-sm font-semibold text-center" 
                            style={{ 
                              color: "#FF6D1F", 
                              fontFamily: "General Sans, sans-serif" 
                            }}>
                            {member.role}
                          </p>
                          <Star className="w-4 h-4" style={{ color: "#FF6D1F" }} />
                        </div>
                        
                        <p className="text-xs sm:text-sm leading-relaxed mb-3 md:mb-4 text-center" 
                          style={{ 
                            color: C.muted, 
                            fontFamily: "Satoshi, sans-serif" 
                          }}>
                          {member.bio}
                        </p>
                        
                        <div className="flex items-center justify-center">
                          <div
                            className="inline-flex items-center gap-1 sm:gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full border"
                            style={{ 
                              background: "rgba(255,109,31,0.08)", 
                              borderColor: "rgba(255,109,31,0.2)",
                              color: "#FF6D1F", 
                              fontFamily: "General Sans, sans-serif",
                              fontSize: "0.625rem sm:text-xs",
                              fontWeight: 600
                            }}
                          >
                            <Heart className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                            <span className="truncate">{member.focus}</span>
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Call to Action */}
            <motion.div 
              variants={premiumText}
              className="text-center mt-16 md:mt-20 px-4"
            >
              <div className="inline-flex flex-col sm:flex-row items-center gap-3 sm:gap-4 px-6 py-3 sm:px-8 sm:py-4 rounded-xl sm:rounded-2xl border max-w-md mx-auto"
                style={{
                  background: C.ghostBg,
                  borderColor: C.cardBorder,
                  backdropFilter: "blur(12px)"
                }}
              >
                <span className="text-base sm:text-lg font-semibold text-center" style={{ color: C.text, fontFamily: "General Sans, sans-serif" }}>
                  Join our mission to transform African animation
                </span>
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" style={{ color: "#FF6D1F" }} />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>
    </div>
  );
}

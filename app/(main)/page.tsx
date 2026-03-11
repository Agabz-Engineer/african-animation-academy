"use client";

import Link from "next/link";
import { useRef, useState, type CSSProperties } from "react";
import { motion, useInView } from "framer-motion";
import {
  Play,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ChevronRight as ChevronRightSmall,
  Star,
  Users,
  Zap,
  Globe,
  Palette,
  Film,
  Layers,
} from "lucide-react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useThemeMode } from "@/lib/useThemeMode";

const DARK_UI = {
  text: "#FAF3E1",
  muted: "#D2C9B8",
  line: "#444444",
  softPanelBg: "rgba(34, 34, 34, 0.75)",
  softPanelBorder: "rgba(68, 68, 68, 0.6)",
  ghostBg: "rgba(40, 40, 40, 0.45)",
  ghostBorder: "rgba(68, 68, 68, 0.8)",
  cardBg: "rgba(34, 34, 34, 0.60)",
  cardBorder: "rgba(68, 68, 68, 0.40)",
  navBg: "rgba(34, 34, 34, 0.55)",
};

const LIGHT_UI = {
  text: "#222222",
  muted: "#555555",
  line: "#E7DBBD",
  softPanelBg: "rgba(250, 243, 225, 0.78)",
  softPanelBorder: "rgba(231, 219, 189, 0.48)",
  ghostBg: "rgba(250, 243, 225, 0.72)",
  ghostBorder: "rgba(231, 219, 189, 0.58)",
  cardBg: "rgba(250, 243, 225, 0.80)",
  cardBorder: "rgba(231, 219, 189, 0.42)",
  navBg: "rgba(250, 243, 225, 0.78)",
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

export default function LandingPage() {
  const router = useRouter();
  const theme = useThemeMode();

  useEffect(() => {
    router.push("/login");
  }, [router]);
  const C = theme === "dark" ? DARK_UI : LIGHT_UI;

  const [openDiscover, setOpenDiscover] = useState<number | null>(null);
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  const heroRef = useRef<HTMLElement | null>(null);
  const discoverRef = useRef<HTMLElement | null>(null);
  const offeringsRef = useRef<HTMLElement | null>(null);
  const testimonialsRef = useRef<HTMLElement | null>(null);
  const aboutRef = useRef<HTMLElement | null>(null);
  const ctaRef = useRef<HTMLElement | null>(null);

  const heroInView = useInView(heroRef, { once: true, amount: 0.1 });
  const discoverInView = useInView(discoverRef, { once: true, amount: 0.1 });
  const offeringsInView = useInView(offeringsRef, { once: true, amount: 0.1 });
  const testimonialsInView = useInView(testimonialsRef, { once: true, amount: 0.1 });
  const aboutInView = useInView(aboutRef, { once: true, amount: 0.1 });
  const ctaInView = useInView(ctaRef, { once: true, amount: 0.1 });

  const sectionTransition = { duration: 0.7, ease: "easeOut" as const };

  const discoverItems = [
    {
      icon: Film,
      title: "What is Animation",
      teaser: "Turn still ideas into visual motion.",
      body: "Animation is the art of bringing still images to life through movement and storytelling. From traditional hand-drawn to cutting-edge 3D and motion graphics.",
    },
    {
      icon: Zap,
      title: "Why Learn Animation",
      teaser: "Future-ready creative skill with global demand.",
      body: "Animation is one of the fastest growing creative industries worldwide. The demand for skilled African animators telling authentic stories has never been higher.",
    },
    {
      icon: Globe,
      title: "African Animation Rising",
      teaser: "Local stories, global impact, growing industry.",
      body: "From Lagos to Nairobi, Accra to Cairo - African animators are creating content that resonates globally. Be part of this creative revolution.",
    },
  ];

  const testimonials = [
    {
      quote:
        "Africa Fx completely changed how I see animation. The instructors understand African storytelling and that makes all the difference in the world.",
      name: "Amara Diallo",
      role: "Motion Designer, Dakar",
      initials: "AD",
    },
    {
      quote:
        "I went from complete beginner to landing my first freelance client in 6 months. The community here pushes you to be better every day.",
      name: "Kwame Asante",
      role: "Freelance Animator, Accra",
      initials: "KA",
    },
    {
      quote:
        "The advanced course gave me the exact skills I needed to join a studio. Best investment I have made in my creative career so far.",
      name: "Fatima Al-Hassan",
      role: "3D Artist, Lagos",
      initials: "FA",
    },
  ];

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

  const prevTestimonial = () => {
    setActiveTestimonial((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
  };

  const nextTestimonial = () => {
    setActiveTestimonial((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));
  };

  return (
    <div style={{ transition: "color 0.3s ease, background-color 0.3s ease" }}>
      <motion.section
        ref={heroRef}
        initial={{ opacity: 0, y: 30 }}
        animate={heroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
        transition={sectionTransition}
        className="min-h-screen flex flex-col items-center justify-center text-center relative overflow-hidden px-4"
        style={{ background: "transparent" }}
      >
        <div
          className="absolute top-16 left-8 w-96 h-96 rounded-full blur-3xl"
          style={{ backgroundColor: "#FF6D1F", opacity: 0.06 }}
        />
        <div
          className="absolute bottom-20 right-8 w-64 h-64 rounded-full blur-3xl"
          style={{ backgroundColor: "#E04D00", opacity: 0.05 }}
        />

        <div
          className="rounded-full px-4 py-1.5 inline-flex items-center gap-2 mb-8 relative z-10"
          style={{ backgroundColor: C.softPanelBg, border: `1px solid ${C.softPanelBorder}`, backdropFilter: "blur(8px)" }}
        >
          <Star className="w-3 h-3" style={{ color: "#FF6D1F" }} />
          <span className="text-xs font-medium" style={{ color: "#FF6D1F", fontFamily: "General Sans, sans-serif" }}>
            Proudly African. Globally Creative.
          </span>
        </div>

        <h1 className="relative z-10 max-w-4xl mx-auto" style={{ letterSpacing: "-0.03em" }}>
          <span className="block text-5xl md:text-7xl font-bold" style={{ color: C.text, fontFamily: "Clash Display, sans-serif" }}>
            Bring African
          </span>
          <span
            className="block text-5xl md:text-7xl font-bold mt-4"
            style={{
              fontFamily: "Clash Display, sans-serif",
              background: "linear-gradient(135deg, #FF6D1F, #E04D00)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            Stories to Life
          </span>
        </h1>

        <p className="text-lg max-w-3xl mx-auto mt-6 leading-relaxed relative z-10" style={{ color: C.muted, fontFamily: "Satoshi, sans-serif" }}>
          Master animation from Africa&apos;s best instructors and build career-ready creative skills.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 mt-10 relative z-10">
          <Link
            href="/signup"
            className="font-bold px-8 py-4 rounded-full text-base flex items-center gap-2 transition-all duration-200 hover:shadow-[0_0_24px_rgba(232,160,32,0.5)]"
            style={{
              background: "linear-gradient(135deg, #FF6D1F, #E04D00)",
              color: "#0D0905",
              fontFamily: "General Sans, sans-serif",
            }}
          >
            Start Learning Free
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/courses"
            className="font-semibold px-8 py-4 rounded-full text-base flex items-center gap-2 transition-all duration-200 border hover:border-[#FF6D1F] hover:text-[#FF6D1F]"
            style={{
              backgroundColor: C.ghostBg,
              borderColor: C.softPanelBorder,
              color: C.text,
              fontFamily: "General Sans, sans-serif",
              backdropFilter: "blur(8px)",
            }}
          >
            <Play className="w-4 h-4" style={{ color: "#FF6D1F" }} />
            Watch Showreel
          </Link>
        </div>
      </motion.section>

      <motion.section
        ref={discoverRef}
        initial={{ opacity: 0, y: 30 }}
        animate={discoverInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
        transition={sectionTransition}
        className="py-24 px-4 md:px-8 relative"
        style={{ background: "transparent" }}
      >
        <div
          className="absolute right-10 top-8 w-24 h-24 rounded-full"
          style={{ border: "1px dashed rgba(255,109,31,0.25)", opacity: 0.6 }}
        />
        <div className="max-w-6xl mx-auto relative">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-10 h-px" style={{ backgroundColor: C.line }} />
            <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: "#FF6D1F", fontFamily: "General Sans, sans-serif" }}>
              What We Offer
            </span>
            <div className="w-10 h-px" style={{ backgroundColor: C.line }} />
          </div>

          <h2 className="text-center text-4xl md:text-5xl font-bold mt-4 max-w-2xl mx-auto" style={{ fontFamily: "Clash Display, sans-serif" }}>
            <span style={{ color: C.text }}>Discover the Art of </span>
            <span
              style={{
                background: "linear-gradient(135deg, #FF6D1F, #E04D00)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              Animation
            </span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
            {discoverItems.map((item, idx) => {
              const isOpen = openDiscover === idx;
              return (
                <div
                  key={item.title}
                  className="rounded-2xl p-8 transition-all duration-300 hover:-translate-y-1"
                  style={{
                    background: C.cardBg,
                    border: `1px solid ${C.cardBorder}`,
                    backdropFilter: "blur(4px)",
                  }}
                >
                  <div className="rounded-xl p-3 w-fit" style={{ backgroundColor: "rgba(255,109,31,0.1)" }}>
                    <item.icon className="w-7 h-7" style={{ color: "#FF6D1F" }} />
                  </div>
                  <h3 className="mt-6 text-xl font-bold" style={{ color: C.text, fontFamily: "Cabinet Grotesk, sans-serif" }}>{item.title}</h3>
                  <p className="text-sm mt-3" style={{ color: C.muted, fontFamily: "Satoshi, sans-serif" }}>{item.teaser}</p>

                  <button
                    type="button"
                    onClick={() => setOpenDiscover(isOpen ? null : idx)}
                    className="mt-6 text-sm font-medium inline-flex items-center gap-1 hover:gap-2 transition-all"
                    style={{ color: "#FF6D1F", fontFamily: "General Sans, sans-serif" }}
                  >
                    {isOpen ? "Show Less" : "Learn More"}
                    <ChevronRightSmall className="w-3 h-3" />
                  </button>

                  {isOpen && (
                    <p className="text-sm mt-4 leading-relaxed" style={{ color: C.muted, fontFamily: "Satoshi, sans-serif" }}>
                      {item.body}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </motion.section>

      <motion.section
        ref={offeringsRef}
        initial={{ opacity: 0, y: 30 }}
        animate={offeringsInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
        transition={sectionTransition}
        className="py-24 px-4 md:px-8"
        style={{ background: "transparent" }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-10 h-px" style={{ backgroundColor: C.line }} />
            <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: "#FF6D1F", fontFamily: "General Sans, sans-serif" }}>
              What You Will Learn
            </span>
            <div className="w-10 h-px" style={{ backgroundColor: C.line }} />
          </div>

          <h2 className="text-center text-4xl font-bold" style={{ fontFamily: "Clash Display, sans-serif" }}>
            <span style={{ color: C.text }}>Our Course </span>
            <span
              style={{
                background: "linear-gradient(135deg, #FF6D1F, #E04D00)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              Offerings
            </span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
            {[
              {
                title: "Foundation",
                body: "Learn animation fundamentals and essential tools.",
                badge: "Beginner",
                accent: "#FF6D1F",
                badgeBg: "rgba(255,109,31,0.1)",
                href: "/courses/beginner",
                icon: Layers,
              },
              {
                title: "Development",
                body: "Advance into character, rigging, and storytelling.",
                badge: "Intermediate",
                accent: "#E04D00",
                badgeBg: "rgba(224,77,0,0.1)",
                href: "/courses/intermediate",
                icon: Palette,
              },
              {
                title: "Mastery",
                body: "Master studio workflows, 3D, VFX, and showreels.",
                badge: "Advanced",
                accent: "#F5E7C6",
                badgeBg: "rgba(245,231,198,0.1)",
                href: "/courses/advanced",
                icon: Film,
              },
              {
                title: "Workshops",
                body: "Live sessions with direct feedback from pros.",
                badge: "Live",
                accent: "#FF6D1F",
                badgeBg: "linear-gradient(135deg, #FF6D1F, #E04D00)",
                href: "/workshops",
                icon: Users,
              },
            ].map((card) => (
              <div
                key={card.title}
                className="rounded-2xl p-6 border transition-all duration-300 hover:-translate-y-1"
                style={{
                  background: C.cardBg,
                  border: `1px solid ${C.cardBorder}`,
                  backdropFilter: "blur(4px)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "rgba(255,109,31,0.4)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = C.softPanelBorder;
                }}
              >
                <div
                  className="h-0.5 w-full rounded-full mb-6"
                  style={
                    card.title === "Workshops"
                      ? { background: "linear-gradient(90deg, #FF6D1F, #E04D00)" }
                      : { backgroundColor: card.accent }
                  }
                />
                <card.icon className="w-6 h-6" style={{ color: card.title === "Workshops" ? "#FF6D1F" : card.accent }} />

                <div
                  className="text-xs px-3 py-1 rounded-full w-fit mt-4"
                  style={
                    card.title === "Workshops"
                      ? {
                          background: "linear-gradient(135deg, #FF6D1F, #E04D00)",
                          color: "#0D0905",
                          fontFamily: "General Sans, sans-serif",
                          fontWeight: 600,
                        }
                      : {
                          background: card.badgeBg,
                          color: card.accent,
                          fontFamily: "General Sans, sans-serif",
                          fontWeight: 600,
                        }
                  }
                >
                  {card.badge}
                </div>

                <h3 className="text-lg font-bold mt-3" style={{ color: C.text, fontFamily: "Cabinet Grotesk, sans-serif" }}>{card.title}</h3>
                <p className="text-sm mt-2 leading-relaxed" style={{ color: C.muted, fontFamily: "Satoshi, sans-serif" }}>{card.body}</p>

                <Link
                  href={card.href}
                  className="text-sm font-medium mt-6 inline-flex items-center gap-1 hover:gap-2 transition-all"
                  style={{ color: "#E8A020", fontFamily: "General Sans, sans-serif" }}
                >
                  Explore
                  <ChevronRightSmall className="w-3 h-3" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      <motion.section
        ref={testimonialsRef}
        initial={{ opacity: 0, y: 30 }}
        animate={testimonialsInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
        transition={sectionTransition}
        className="py-24 px-4 md:px-8"
        style={{ background: "transparent" }}
      >
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-10 h-px" style={{ backgroundColor: C.line }} />
            <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: "#FF6D1F", fontFamily: "General Sans, sans-serif" }}>
              Student Stories
            </span>
            <div className="w-10 h-px" style={{ backgroundColor: C.line }} />
          </div>

          <h2 className="text-center text-4xl font-bold" style={{ fontFamily: "Clash Display, sans-serif" }}>
            <span style={{ color: C.text }}>Hear From Our </span>
            <span
              style={{
                background: "linear-gradient(135deg, #FF6D1F, #E04D00)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              Community
            </span>
          </h2>

          <div className="mt-14 flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={prevTestimonial}
              className="w-10 h-10 rounded-full border flex items-center justify-center transition-all duration-200 hover:border-[#FF6D1F]"
              style={{ borderColor: C.line, color: C.muted, backgroundColor: C.navBg }}
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div
              className="rounded-2xl p-8 border transition-all duration-300 max-w-2xl w-full"
              style={{
                background: C.cardBg,
                border: `1px solid ${C.cardBorder}`,
                backdropFilter: "blur(4px)",
              }}
            >
              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, idx) => (
                  <Star key={`${testimonials[activeTestimonial].name}-${idx}`} className="w-3 h-3" style={{ color: "#FF6D1F", fill: "#FF6D1F" }} />
                ))}
              </div>

              <p
                className="text-sm leading-relaxed mt-4 pl-4"
                style={{ color: C.text, borderLeft: "2px solid #FF6D1F", fontFamily: "Satoshi, sans-serif" }}
              >
                {testimonials[activeTestimonial].quote}
              </p>

              <div className="flex items-center gap-3 mt-8">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg, #FF6D1F, #E04D00)" }}
                >
                  <span className="text-sm font-bold" style={{ color: "#222222", fontFamily: "General Sans, sans-serif" }}>
                    {testimonials[activeTestimonial].initials}
                  </span>
                </div>
                <div>
                  <div className="text-sm font-semibold" style={{ color: C.text, fontFamily: "General Sans, sans-serif" }}>
                    {testimonials[activeTestimonial].name}
                  </div>
                  <div className="text-xs mt-0.5" style={{ color: C.muted, fontFamily: "Satoshi, sans-serif" }}>
                    {testimonials[activeTestimonial].role}
                  </div>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={nextTestimonial}
              className="w-10 h-10 rounded-full border flex items-center justify-center transition-all duration-200 hover:border-[#FF6D1F]"
              style={{ borderColor: C.line, color: C.muted, backgroundColor: C.navBg }}
              aria-label="Next testimonial"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center justify-center gap-2 mt-6">
            {testimonials.map((item, idx) => (
              <button
                key={item.name}
                onClick={() => setActiveTestimonial(idx)}
                className="transition-all duration-200"
                style={
                  idx === activeTestimonial
                    ? { width: "24px", height: "6px", borderRadius: "999px", backgroundColor: "#FF6D1F" }
                    : { width: "6px", height: "6px", borderRadius: "999px", backgroundColor: C.line }
                }
                aria-label={`Go to testimonial ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </motion.section>

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
                style={{ background: "linear-gradient(135deg, rgba(255,109,31,0.12) 0%, transparent 60%)" }}
              />
              <motion.div
                variants={rollContainer}
                initial="hidden"
                animate={aboutInView ? "show" : "hidden"}
              >
                <RollLine
                  text="PROBLEM"
                  className="text-5xl md:text-7xl font-bold"
                  style={{ color: "#FF6D1F", fontFamily: "Clash Display, sans-serif", letterSpacing: "-0.02em" }}
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
              <div className="absolute left-6 top-4 text-5xl md:text-6xl" style={{ color: "#FF6D1F", opacity: 0.35, fontFamily: "Clash Display, sans-serif" }}>
                “
              </div>
              <div className="absolute right-6 bottom-2 text-5xl md:text-6xl" style={{ color: "#FF6D1F", opacity: 0.35, fontFamily: "Clash Display, sans-serif" }}>
                ”
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
                  style={{ color: "#FF6D1F", fontFamily: "General Sans, sans-serif", marginBottom: "0.75rem" }}
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
              <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: "#FF6D1F", fontFamily: "General Sans, sans-serif" }}>
                About Us
              </span>
              <div className="w-10 h-px" style={{ backgroundColor: C.line }} />
            </div>

            <h2 className="text-4xl md:text-5xl font-bold mb-10" style={{ fontFamily: "Clash Display, sans-serif" }}>
              <span style={{ color: C.text }}>Meet the Team </span>
              <span
                style={{
                  background: "linear-gradient(135deg, #FF6D1F, #E04D00)",
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
                      style={{ background: "linear-gradient(135deg, #FF6D1F, #E04D00)" }}
                    >
                      <span className="text-sm font-bold" style={{ color: "#222222", fontFamily: "General Sans, sans-serif" }}>
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
                    style={{ backgroundColor: "rgba(255,109,31,0.1)", color: "#FF6D1F", fontFamily: "General Sans, sans-serif" }}
                  >
                    Focus: {member.focus}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.section>

      <motion.section
        ref={ctaRef}
        initial={{ opacity: 0, y: 30 }}
        animate={ctaInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
        transition={sectionTransition}
        className="py-24 px-4 md:px-8"
        style={{ background: "transparent" }}
      >
        <div className="max-w-3xl mx-auto text-center relative">
          <div
            className="absolute -top-8 left-1/2 -translate-x-1/2 w-20 h-20 rounded-full"
            style={{ border: "1px dashed rgba(245,231,198,0.24)" }}
          />
          <div
            className="h-1 w-24 mx-auto mb-16 rounded-full"
            style={{ background: "repeating-linear-gradient(90deg, #FF6D1F 0 33%, #E04D00 33% 66%, #F5E7C6 66% 100%)" }}
          />

          <h2 className="text-4xl md:text-5xl font-bold" style={{ fontFamily: "Clash Display, sans-serif" }}>
            <span style={{ color: C.text }}>Ready to Tell Your </span>
            <span
              style={{
                background: "linear-gradient(135deg, #FF6D1F, #E04D00)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              African Story?
            </span>
          </h2>

          <p className="text-lg mt-6 leading-relaxed" style={{ color: C.muted, fontFamily: "Satoshi, sans-serif" }}>
            Join thousands of African creatives learning animation, building portfolios and connecting with a global community
            that celebrates authentic African storytelling.
          </p>

          <div className="flex flex-wrap gap-4 justify-center mt-10">
            <Link
              href="/signup"
              className="font-bold px-10 py-4 rounded-full text-base transition-all duration-200"
              style={{
                background: "linear-gradient(135deg, #FF6D1F, #E04D00)",
                color: "#0D0905",
                fontFamily: "General Sans, sans-serif",
              }}
            >
              Get Started Free
            </Link>
            <Link
              href="/courses"
              className="px-10 py-4 rounded-full text-base border transition-all duration-200 hover:border-[#FF6D1F] hover:text-[#FF6D1F]"
              style={{
                borderColor: C.ghostBorder,
                color: C.text,
                fontFamily: "General Sans, sans-serif",
                backgroundColor: C.ghostBg,
                backdropFilter: "blur(8px)",
              }}
            >
              Browse Courses
            </Link>
          </div>
        </div>
      </motion.section>
    </div>
  );
}

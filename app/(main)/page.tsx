"use client";

import Link from "next/link";
import { useRef, useState } from "react";
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

export default function Home() {
  const theme = useThemeMode();
  const C = theme === "dark" ? DARK_UI : LIGHT_UI;

  const [openDiscover, setOpenDiscover] = useState<number | null>(null);
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  const heroRef = useRef<HTMLElement | null>(null);
  const discoverRef = useRef<HTMLElement | null>(null);
  const offeringsRef = useRef<HTMLElement | null>(null);
  const testimonialsRef = useRef<HTMLElement | null>(null);
  const ctaRef = useRef<HTMLElement | null>(null);

  const heroInView = useInView(heroRef, { once: true, amount: 0.1 });
  const discoverInView = useInView(discoverRef, { once: true, amount: 0.1 });
  const offeringsInView = useInView(offeringsRef, { once: true, amount: 0.1 });
  const testimonialsInView = useInView(testimonialsRef, { once: true, amount: 0.1 });
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
          style={{ backgroundColor: "#E8A020", opacity: 0.06 }}
        />
        <div
          className="absolute bottom-20 right-8 w-64 h-64 rounded-full blur-3xl"
          style={{ backgroundColor: "#C1440E", opacity: 0.05 }}
        />

        <div
          className="rounded-full px-4 py-1.5 inline-flex items-center gap-2 mb-8 relative z-10"
          style={{ backgroundColor: C.softPanelBg, border: `1px solid ${C.softPanelBorder}`, backdropFilter: "blur(8px)" }}
        >
          <Star className="w-3 h-3" style={{ color: "#D4A853" }} />
          <span className="text-xs font-medium" style={{ color: "#D4A853", fontFamily: "General Sans, sans-serif" }}>
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
              background: "linear-gradient(135deg, #E8A020, #C1440E)",
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
              background: "linear-gradient(135deg, #E8A020, #C1440E)",
              color: "#0D0905",
              fontFamily: "General Sans, sans-serif",
            }}
          >
            Start Learning Free
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/courses"
            className="font-semibold px-8 py-4 rounded-full text-base flex items-center gap-2 transition-all duration-200 border hover:border-[#E8A020] hover:text-[#E8A020]"
            style={{
              backgroundColor: C.ghostBg,
              borderColor: C.softPanelBorder,
              color: C.text,
              fontFamily: "General Sans, sans-serif",
              backdropFilter: "blur(8px)",
            }}
          >
            <Play className="w-4 h-4" style={{ color: "#E8A020" }} />
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
          style={{ border: "1px dashed rgba(232,160,32,0.25)", opacity: 0.6 }}
        />
        <div className="max-w-6xl mx-auto relative">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-10 h-px" style={{ backgroundColor: C.line }} />
            <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: "#E8A020", fontFamily: "General Sans, sans-serif" }}>
              What We Offer
            </span>
            <div className="w-10 h-px" style={{ backgroundColor: C.line }} />
          </div>

          <h2 className="text-center text-4xl md:text-5xl font-bold mt-4 max-w-2xl mx-auto" style={{ fontFamily: "Clash Display, sans-serif" }}>
            <span style={{ color: C.text }}>Discover the Art of </span>
            <span
              style={{
                background: "linear-gradient(135deg, #E8A020, #C1440E)",
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
                  <div className="rounded-xl p-3 w-fit" style={{ backgroundColor: "rgba(232,160,32,0.1)" }}>
                    <item.icon className="w-7 h-7" style={{ color: "#E8A020" }} />
                  </div>
                  <h3 className="mt-6 text-xl font-bold" style={{ color: C.text, fontFamily: "Cabinet Grotesk, sans-serif" }}>{item.title}</h3>
                  <p className="text-sm mt-3" style={{ color: C.muted, fontFamily: "Satoshi, sans-serif" }}>{item.teaser}</p>

                  <button
                    type="button"
                    onClick={() => setOpenDiscover(isOpen ? null : idx)}
                    className="mt-6 text-sm font-medium inline-flex items-center gap-1 hover:gap-2 transition-all"
                    style={{ color: "#E8A020", fontFamily: "General Sans, sans-serif" }}
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
            <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: "#E8A020", fontFamily: "General Sans, sans-serif" }}>
              What You Will Learn
            </span>
            <div className="w-10 h-px" style={{ backgroundColor: C.line }} />
          </div>

          <h2 className="text-center text-4xl font-bold" style={{ fontFamily: "Clash Display, sans-serif" }}>
            <span style={{ color: C.text }}>Our Course </span>
            <span
              style={{
                background: "linear-gradient(135deg, #E8A020, #C1440E)",
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
                accent: "#E8A020",
                badgeBg: "rgba(232,160,32,0.1)",
                href: "/courses/beginner",
                icon: Layers,
              },
              {
                title: "Development",
                body: "Advance into character, rigging, and storytelling.",
                badge: "Intermediate",
                accent: "#C1440E",
                badgeBg: "rgba(193,68,14,0.1)",
                href: "/courses/intermediate",
                icon: Palette,
              },
              {
                title: "Mastery",
                body: "Master studio workflows, 3D, VFX, and showreels.",
                badge: "Advanced",
                accent: "#D4A853",
                badgeBg: "rgba(212,168,83,0.1)",
                href: "/courses/advanced",
                icon: Film,
              },
              {
                title: "Workshops",
                body: "Live sessions with direct feedback from pros.",
                badge: "Live",
                accent: "#E8A020",
                badgeBg: "linear-gradient(135deg, #E8A020, #C1440E)",
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
                  e.currentTarget.style.borderColor = "rgba(232,160,32,0.4)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = C.softPanelBorder;
                }}
              >
                <div
                  className="h-0.5 w-full rounded-full mb-6"
                  style={
                    card.title === "Workshops"
                      ? { background: "linear-gradient(90deg, #E8A020, #C1440E)" }
                      : { backgroundColor: card.accent }
                  }
                />
                <card.icon className="w-6 h-6" style={{ color: card.title === "Workshops" ? "#E8A020" : card.accent }} />

                <div
                  className="text-xs px-3 py-1 rounded-full w-fit mt-4"
                  style={
                    card.title === "Workshops"
                      ? {
                          background: "linear-gradient(135deg, #E8A020, #C1440E)",
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
            <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: "#E8A020", fontFamily: "General Sans, sans-serif" }}>
              Student Stories
            </span>
            <div className="w-10 h-px" style={{ backgroundColor: C.line }} />
          </div>

          <h2 className="text-center text-4xl font-bold" style={{ fontFamily: "Clash Display, sans-serif" }}>
            <span style={{ color: C.text }}>Hear From Our </span>
            <span
              style={{
                background: "linear-gradient(135deg, #E8A020, #C1440E)",
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
              className="w-10 h-10 rounded-full border flex items-center justify-center transition-all duration-200 hover:border-[#E8A020]"
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
                  <Star key={`${testimonials[activeTestimonial].name}-${idx}`} className="w-3 h-3" style={{ color: "#E8A020", fill: "#E8A020" }} />
                ))}
              </div>

              <p
                className="text-sm leading-relaxed mt-4 pl-4"
                style={{ color: C.text, borderLeft: "2px solid #E8A020", fontFamily: "Satoshi, sans-serif" }}
              >
                {testimonials[activeTestimonial].quote}
              </p>

              <div className="flex items-center gap-3 mt-8">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg, #E8A020, #C1440E)" }}
                >
                  <span className="text-sm font-bold" style={{ color: "#0D0905", fontFamily: "General Sans, sans-serif" }}>
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
              className="w-10 h-10 rounded-full border flex items-center justify-center transition-all duration-200 hover:border-[#E8A020]"
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
                    ? { width: "24px", height: "6px", borderRadius: "999px", backgroundColor: "#E8A020" }
                    : { width: "6px", height: "6px", borderRadius: "999px", backgroundColor: C.line }
                }
                aria-label={`Go to testimonial ${idx + 1}`}
              />
            ))}
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
            style={{ border: "1px dashed rgba(212,168,83,0.24)" }}
          />
          <div
            className="h-1 w-24 mx-auto mb-16 rounded-full"
            style={{ background: "repeating-linear-gradient(90deg, #E8A020 0 33%, #C1440E 33% 66%, #D4A853 66% 100%)" }}
          />

          <h2 className="text-4xl md:text-5xl font-bold" style={{ fontFamily: "Clash Display, sans-serif" }}>
            <span style={{ color: C.text }}>Ready to Tell Your </span>
            <span
              style={{
                background: "linear-gradient(135deg, #E8A020, #C1440E)",
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
                background: "linear-gradient(135deg, #E8A020, #C1440E)",
                color: "#0D0905",
                fontFamily: "General Sans, sans-serif",
              }}
            >
              Get Started Free
            </Link>
            <Link
              href="/courses"
              className="px-10 py-4 rounded-full text-base border transition-all duration-200 hover:border-[#E8A020] hover:text-[#E8A020]"
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

"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  Instagram,
  Twitter,
  Youtube,
  Facebook,
  ArrowRight,
  Mail,
  CheckCircle,
  Heart,
} from "lucide-react";

const footerLinks = [
  {
    title: "Learn",
    links: [
      { label: "All Courses", href: "/courses" },
      { label: "Beginner", href: "/courses/beginner" },
      { label: "Intermediate", href: "/courses/intermediate" },
      { label: "Advanced", href: "/courses/advanced" },
      { label: "Learning Path", href: "/courses/learning-path" },
      { label: "Workshops", href: "/workshops" },
    ],
  },
  {
    title: "Community",
    links: [
      { label: "About Us", href: "/#about" },
      { label: "Challenges", href: "/community/challenges" },
      { label: "Leaderboard", href: "/community/leaderboard" },
      { label: "Forum", href: "/community/forum" },
      { label: "Student Spotlights", href: "/community/spotlights" },
      { label: "Gallery", href: "/resources/gallery" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Blog", href: "/resources/blog" },
      { label: "Tutorials", href: "/resources/tutorials" },
      { label: "Industry News", href: "/resources/news" },
      { label: "Events", href: "/events" },
      { label: "About Us", href: "/about" },
      { label: "Pricing", href: "/pricing" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "FAQs", href: "/support/faqs" },
      { label: "Contact Us", href: "/support/contact" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
    ],
  },
];

const socialLinks = [
  { icon: Instagram, href: "https://instagram.com", label: "Instagram" },
  { icon: Twitter, href: "https://twitter.com", label: "Twitter" },
  { icon: Youtube, href: "https://youtube.com", label: "YouTube" },
  { icon: Facebook, href: "https://facebook.com", label: "Facebook" },
];

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const year = new Date().getFullYear();

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail("");
    }
  };

  return (
    <footer style={{ backgroundColor: "#0D0905" }} className="relative mt-20">
      {/* Kente stripe at top of footer */}
      <div className="kente-stripe" />

      {/* Adinkra pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `repeating-linear-gradient(
            45deg,
            #E8A020 0px,
            #E8A020 1px,
            transparent 1px,
            transparent 20px
          ), repeating-linear-gradient(
            -45deg,
            #E8A020 0px,
            #E8A020 1px,
            transparent 1px,
            transparent 20px
          )`,
        }}
      />

      <div className="relative z-10 container-custom px-4 md:px-8 pt-16 pb-8">
        {/* Top Section */}
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-12 mb-16">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            {/* AFX Logo */}
            <Link href="/" className="group flex items-center gap-3 mb-6 w-fit">
              <div
                className="w-12 h-10 rounded-xl flex items-center justify-center overflow-hidden relative transition-all duration-300 group-hover:shadow-[0_0_20px_rgba(232,160,32,0.5)]"
                style={{
                  background: "linear-gradient(135deg, #221808, #2D1F0A)",
                  border: "1px solid rgba(232, 160, 32, 0.4)",
                }}
              >
                <div
                  className="absolute inset-0"
                  style={{ background: "linear-gradient(135deg, rgba(232,160,32,0.08) 0%, transparent 60%)" }}
                />
                <div className="relative z-10 flex items-center tracking-tighter" style={{ letterSpacing: "-0.5px" }}>
                  <span className="font-black text-base tracking-tight" style={{ color: "#E8A020", fontFamily: "Space Grotesk, sans-serif" }}>A</span>
                  <span className="font-black text-base tracking-tight" style={{ color: "#F5ECD7", fontFamily: "Space Grotesk, sans-serif" }}>F</span>
                  <span className="font-black text-base tracking-tight" style={{ color: "#C1440E", fontFamily: "Space Grotesk, sans-serif" }}>X</span>
                </div>
              </div>
              <div className="flex items-center">
                <span className="font-bold text-sm" style={{ color: "#F5ECD7", fontFamily: "Space Grotesk, sans-serif" }}>Africa</span>
                <span
                  className="font-bold text-sm bg-clip-text text-transparent"
                  style={{
                    fontFamily: "Space Grotesk, sans-serif",
                    backgroundImage: "linear-gradient(90deg, #E8A020, #C1440E)",
                  }}
                >
                  {" "}Fx
                </span>
              </div>
            </Link>

            {/* Tagline */}
            <p style={{ color: "#A89070", fontSize: "0.875rem", lineHeight: "1.6", marginBottom: "1.5rem", maxWidth: "280px" }}>
              Africa&apos;s premier animation learning platform. Learn, create, and connect with animators across the continent and beyond.
            </p>

            {/* Proudly African tagline */}
            <p className="italic mb-6" style={{ color: "#D4A853", fontSize: "0.8rem" }}>
              Proudly African. Globally Creative.
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-110"
                  style={{
                    backgroundColor: "#221808",
                    border: "1px solid #3D2E10",
                    color: "#A89070",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = "#E8A020";
                    (e.currentTarget as HTMLElement).style.color = "#E8A020";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = "#3D2E10";
                    (e.currentTarget as HTMLElement).style.color = "#A89070";
                  }}
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Links Columns */}
          <div className="lg:col-span-2 grid grid-cols-2 gap-8">
            {footerLinks.slice(0, 2).map((group) => (
              <div key={group.title}>
                <h4 className="font-bold mb-4 text-sm" style={{ fontFamily: "'Space Grotesk', sans-serif", color: "#E8A020" }}>
                  {group.title}
                </h4>
                <ul className="space-y-2.5">
                  {group.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-sm transition-colors duration-150 hover:text-[#E8A020]"
                        style={{ color: "#A89070" }}
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="lg:col-span-2 grid grid-cols-2 gap-8">
            {footerLinks.slice(2).map((group) => (
              <div key={group.title}>
                <h4 className="font-bold mb-4 text-sm" style={{ fontFamily: "'Space Grotesk', sans-serif", color: "#E8A020" }}>
                  {group.title}
                </h4>
                <ul className="space-y-2.5">
                  {group.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-sm transition-colors duration-150 hover:text-[#E8A020]"
                        style={{ color: "#A89070" }}
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Newsletter Section */}
        <div
          className="rounded-2xl p-8 mb-12"
          style={{
            backgroundColor: "#1A1208",
            border: "1px solid #3D2E10",
          }}
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Mail className="w-5 h-5" style={{ color: "#E8A020" }} />
                <h4 className="font-bold text-lg" style={{ fontFamily: "'Space Grotesk', sans-serif", color: "#F5ECD7" }}>
                  Stay in the loop
                </h4>
              </div>
              <p className="text-sm" style={{ color: "#A89070" }}>
                Get the latest courses, challenges and African animation news delivered to your inbox.
              </p>
            </div>

            {subscribed ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-2 px-6 py-3 rounded-full"
                style={{ backgroundColor: "#221808", border: "1px solid #E8A020" }}
              >
                <CheckCircle className="w-4 h-4" style={{ color: "#E8A020" }} />
                <span style={{ color: "#E8A020", fontSize: "0.875rem", fontWeight: 600 }}>
                  Successfully subscribed
                </span>
              </motion.div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex items-center gap-2 w-full md:w-auto">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email address"
                  required
                  className="input-field md:w-64"
                />
                <button type="submit" className="btn-primary px-4 py-3 flex-shrink-0">
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8" style={{ borderTop: "1px solid #3D2E10" }}>
          <p className="text-xs text-center md:text-left" style={{ color: "#6B5A40" }}>
            Copyright {year} Africa Fx. All rights reserved.
          </p>

          <div className="flex items-center gap-2">
            {/* Mini kente accent */}
            <div
              className="hidden md:block h-3 w-24 rounded-full overflow-hidden"
              style={{
                background: "repeating-linear-gradient(90deg, #E8A020 0px, #E8A020 8px, #C1440E 8px, #C1440E 16px, #D4A853 16px, #D4A853 24px, #8B2E08 24px, #8B2E08 32px)",
              }}
            />
            <p className="text-xs italic" style={{ color: "#6B5A40" }}>
              <span className="inline-flex items-center gap-1">
                Made with <Heart className="w-3 h-3" style={{ color: "#C1440E" }} /> in Africa
              </span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}



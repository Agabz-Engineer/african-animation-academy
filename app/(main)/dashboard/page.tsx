"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  BookOpen, Trophy, Flame, Clock, ChevronRight,
  Users, Star, Play, BarChart2, Bell, Settings,
  LogOut, CheckCircle
} from "lucide-react";
import { supabase } from "@/lib/supabase";

const quickLinks = [
  { label: "Browse Courses", href: "/courses", icon: BookOpen, color: "#E8A020" },
  { label: "Community", href: "/community", icon: Users, color: "#C1440E" },
  { label: "Challenges", href: "/community/challenges", icon: Trophy, color: "#D4A853" },
  { label: "My Progress", href: "/dashboard/progress", icon: BarChart2, color: "#E8A020" },
];

const recommendedCourses = [
  {
    title: "Fundamentals of Animation",
    instructor: "Kwame Mensah",
    level: "Beginner",
    duration: "4h 30m",
    lessons: 12,
    color: "#E8A020",
  },
  {
    title: "Character Design for Animation",
    instructor: "Amara Diallo",
    level: "Intermediate",
    duration: "6h 15m",
    lessons: 18,
    color: "#C1440E",
  },
  {
    title: "African Storytelling Techniques",
    instructor: "Fatima Al-Hassan",
    level: "Beginner",
    duration: "3h 45m",
    lessons: 10,
    color: "#D4A853",
  },
];

const recentActivity = [
  { text: "New challenge posted: Character of the Month", time: "2 hours ago", icon: Trophy },
  { text: "Kwame Mensah uploaded a new lesson", time: "5 hours ago", icon: Play },
  { text: "Your forum post received 3 replies", time: "1 day ago", icon: Users },
  { text: "Weekly streak milestone reached", time: "2 days ago", icon: Flame },
];

export default function DashboardPage() {
  const [user, setUser] = useState<{ email?: string; user_metadata?: { full_name?: string } } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };
    getUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  const firstName = user?.user_metadata?.full_name?.split(" ")[0] || user?.email?.split("@")[0] || "Creative";

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{
            width: "48px", height: "40px", backgroundColor: "#221808",
            border: "1px solid #3D2E10", borderRadius: "12px",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 1rem"
          }}>
            <span style={{ fontFamily: "'Clash Display',sans-serif", fontWeight: 700, fontSize: "1rem", color: "#E8A020" }}>A</span>
            <span style={{ fontFamily: "'Clash Display',sans-serif", fontWeight: 700, fontSize: "1.15rem", color: "#C1440E" }}>F</span>
            <span style={{ fontFamily: "'Clash Display',sans-serif", fontWeight: 700, fontSize: "1rem", color: "#D4A853" }}>X</span>
          </div>
          <div style={{ width: "32px", height: "32px", border: "2px solid #3D2E10", borderTopColor: "#E8A020", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto" }} />
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", position: "relative", zIndex: 1 }}>

      {/* Brown veil */}
      <div style={{
        position: "fixed", inset: 0,
        backgroundColor: "rgba(13, 9, 5, 0.88)",
        zIndex: 0, pointerEvents: "none"
      }} />

      <div style={{ position: "relative", zIndex: 1, maxWidth: "1280px", margin: "0 auto", padding: "2rem 1.5rem" }}>

        {/* ── Top Bar ── */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2.5rem" }}>
          <div>
            <p style={{ color: "#A89070", fontSize: "0.875rem", fontFamily: "'General Sans',sans-serif", marginBottom: "4px" }}>
              {greeting()},
            </p>
            <h1 style={{ fontFamily: "'Clash Display',sans-serif", fontWeight: 700, fontSize: "1.75rem", color: "#F5ECD7" }}>
              {firstName} <span style={{ background: "linear-gradient(135deg,#E8A020,#C1440E)", WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent" }}>✦</span>
            </h1>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            {/* Notification bell */}
            <button style={{
              width: "40px", height: "40px", borderRadius: "10px",
              backgroundColor: "rgba(34,24,8,0.80)", border: "1px solid #3D2E10",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", color: "#A89070", position: "relative"
            }}>
              <Bell style={{ width: "16px", height: "16px" }} />
              <div style={{
                position: "absolute", top: "8px", right: "8px",
                width: "8px", height: "8px", borderRadius: "50%",
                background: "linear-gradient(135deg,#E8A020,#C1440E)"
              }} />
            </button>

            {/* Settings */}
            <Link href="/dashboard/settings" style={{
              width: "40px", height: "40px", borderRadius: "10px",
              backgroundColor: "rgba(34,24,8,0.80)", border: "1px solid #3D2E10",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#A89070", textDecoration: "none"
            }}>
              <Settings style={{ width: "16px", height: "16px" }} />
            </Link>

            {/* Logout */}
            <button onClick={handleLogout} style={{
              display: "flex", alignItems: "center", gap: "6px",
              padding: "0.5rem 1rem", borderRadius: "10px",
              backgroundColor: "rgba(34,24,8,0.80)", border: "1px solid #3D2E10",
              cursor: "pointer", color: "#A89070", fontSize: "0.8rem",
              fontFamily: "'General Sans',sans-serif"
            }}>
              <LogOut style={{ width: "14px", height: "14px" }} />
              Sign out
            </button>
          </div>
        </div>

        {/* ── Stats Row ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
          {[
            { label: "Courses Enrolled", value: "0", icon: BookOpen, color: "#E8A020" },
            { label: "Lessons Completed", value: "0", icon: CheckCircle, color: "#C1440E" },
            { label: "Day Streak", value: "1", icon: Flame, color: "#D4A853" },
            { label: "Hours Learned", value: "0", icon: Clock, color: "#E8A020" },
          ].map((stat) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              style={{
                backgroundColor: "rgba(34,24,8,0.75)",
                border: "1px solid #3D2E10",
                borderRadius: "16px",
                padding: "1.5rem",
                backdropFilter: "blur(8px)",
                display: "flex", alignItems: "center", gap: "1rem"
              }}
            >
              <div style={{
                width: "44px", height: "44px", borderRadius: "12px",
                background: `rgba(${stat.color === "#E8A020" ? "232,160,32" : stat.color === "#C1440E" ? "193,68,14" : "212,168,83"},0.12)`,
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
              }}>
                <stat.icon style={{ width: "20px", height: "20px", color: stat.color }} />
              </div>
              <div>
                <div style={{ fontFamily: "'Clash Display',sans-serif", fontWeight: 700, fontSize: "1.5rem", color: "#F5ECD7" }}>
                  {stat.value}
                </div>
                <div style={{ color: "#A89070", fontSize: "0.8rem", fontFamily: "'General Sans',sans-serif", marginTop: "2px" }}>
                  {stat.label}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* ── Main Grid ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "1.5rem" }} className="dashboard-grid">

          {/* ── Left Column ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

            {/* Continue Learning */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              style={{
                backgroundColor: "rgba(34,24,8,0.75)",
                border: "1px solid #3D2E10",
                borderRadius: "16px",
                padding: "1.5rem",
                backdropFilter: "blur(8px)"
              }}
            >
              <h2 style={{ fontFamily: "'Cabinet Grotesk',sans-serif", fontWeight: 700, fontSize: "1.1rem", color: "#F5ECD7", marginBottom: "1rem" }}>
                Continue Learning
              </h2>

              <div style={{
                background: "linear-gradient(135deg, rgba(232,160,32,0.08), rgba(193,68,14,0.08))",
                border: "1px solid rgba(232,160,32,0.20)",
                borderRadius: "12px", padding: "1.25rem",
                display: "flex", alignItems: "center", gap: "1rem"
              }}>
                <div style={{
                  width: "56px", height: "56px", borderRadius: "12px",
                  background: "linear-gradient(135deg,#E8A020,#C1440E)",
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
                }}>
                  <Play style={{ width: "24px", height: "24px", color: "#0D0905" }} />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ color: "#A89070", fontSize: "0.75rem", fontFamily: "'General Sans',sans-serif", marginBottom: "4px" }}>
                    Your next lesson
                  </p>
                  <p style={{ fontFamily: "'Cabinet Grotesk',sans-serif", fontWeight: 700, color: "#F5ECD7", fontSize: "1rem" }}>
                    Enrol in a course to get started
                  </p>
                  <div style={{ marginTop: "0.75rem", height: "4px", borderRadius: "999px", backgroundColor: "#3D2E10" }}>
                    <div style={{ width: "0%", height: "100%", borderRadius: "999px", background: "linear-gradient(90deg,#E8A020,#C1440E)" }} />
                  </div>
                  <p style={{ color: "#6B5A40", fontSize: "0.75rem", marginTop: "4px", fontFamily: "'General Sans',sans-serif" }}>
                    0% complete
                  </p>
                </div>
                <Link href="/courses" style={{
                  display: "flex", alignItems: "center", justifyContent: "center",
                  width: "36px", height: "36px", borderRadius: "10px",
                  background: "linear-gradient(135deg,#E8A020,#C1440E)",
                  flexShrink: 0, textDecoration: "none"
                }}>
                  <ChevronRight style={{ width: "16px", height: "16px", color: "#0D0905" }} />
                </Link>
              </div>
            </motion.div>

            {/* Recommended Courses */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              style={{
                backgroundColor: "rgba(34,24,8,0.75)",
                border: "1px solid #3D2E10",
                borderRadius: "16px",
                padding: "1.5rem",
                backdropFilter: "blur(8px)"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
                <h2 style={{ fontFamily: "'Cabinet Grotesk',sans-serif", fontWeight: 700, fontSize: "1.1rem", color: "#F5ECD7" }}>
                  Recommended For You
                </h2>
                <Link href="/courses" style={{ color: "#E8A020", fontSize: "0.8rem", textDecoration: "none", fontFamily: "'General Sans',sans-serif", display: "flex", alignItems: "center", gap: "4px" }}>
                  View all <ChevronRight style={{ width: "14px", height: "14px" }} />
                </Link>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {recommendedCourses.map((course, i) => (
                  <div key={i} style={{
                    display: "flex", alignItems: "center", gap: "1rem",
                    padding: "1rem", borderRadius: "12px",
                    backgroundColor: "rgba(13,9,5,0.50)",
                    border: "1px solid rgba(61,46,16,0.50)",
                    cursor: "pointer", transition: "all 0.2s ease"
                  }}>
                    <div style={{
                      width: "44px", height: "44px", borderRadius: "10px", flexShrink: 0,
                      background: `linear-gradient(135deg, ${course.color}, rgba(13,9,5,0.5))`,
                      display: "flex", alignItems: "center", justifyContent: "center"
                    }}>
                      <BookOpen style={{ width: "20px", height: "20px", color: "#F5ECD7" }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontFamily: "'General Sans',sans-serif", fontWeight: 600, color: "#F5ECD7", fontSize: "0.9rem" }}>
                        {course.title}
                      </p>
                      <p style={{ color: "#A89070", fontSize: "0.75rem", marginTop: "2px" }}>
                        {course.instructor} · {course.lessons} lessons · {course.duration}
                      </p>
                    </div>
                    <div style={{
                      padding: "3px 10px", borderRadius: "999px", fontSize: "0.7rem",
                      fontFamily: "'General Sans',sans-serif", fontWeight: 600,
                      backgroundColor: `rgba(${course.color === "#E8A020" ? "232,160,32" : course.color === "#C1440E" ? "193,68,14" : "212,168,83"},0.12)`,
                      color: course.color, flexShrink: 0
                    }}>
                      {course.level}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* ── Right Column ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

            {/* Quick Links */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              style={{
                backgroundColor: "rgba(34,24,8,0.75)",
                border: "1px solid #3D2E10",
                borderRadius: "16px",
                padding: "1.5rem",
                backdropFilter: "blur(8px)"
              }}
            >
              <h2 style={{ fontFamily: "'Cabinet Grotesk',sans-serif", fontWeight: 700, fontSize: "1.1rem", color: "#F5ECD7", marginBottom: "1rem" }}>
                Quick Links
              </h2>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                {quickLinks.map((link) => (
                  <Link key={link.label} href={link.href} style={{
                    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                    gap: "0.5rem", padding: "1rem", borderRadius: "12px",
                    backgroundColor: "rgba(13,9,5,0.50)", border: "1px solid rgba(61,46,16,0.50)",
                    textDecoration: "none", transition: "all 0.2s ease"
                  }}>
                    <div style={{
                      width: "36px", height: "36px", borderRadius: "10px",
                      background: `rgba(${link.color === "#E8A020" ? "232,160,32" : link.color === "#C1440E" ? "193,68,14" : "212,168,83"},0.12)`,
                      display: "flex", alignItems: "center", justifyContent: "center"
                    }}>
                      <link.icon style={{ width: "18px", height: "18px", color: link.color }} />
                    </div>
                    <span style={{ fontFamily: "'General Sans',sans-serif", fontSize: "0.75rem", fontWeight: 500, color: "#A89070", textAlign: "center" }}>
                      {link.label}
                    </span>
                  </Link>
                ))}
              </div>
            </motion.div>

            {/* Recent Activity */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }}
              style={{
                backgroundColor: "rgba(34,24,8,0.75)",
                border: "1px solid #3D2E10",
                borderRadius: "16px",
                padding: "1.5rem",
                backdropFilter: "blur(8px)"
              }}
            >
              <h2 style={{ fontFamily: "'Cabinet Grotesk',sans-serif", fontWeight: 700, fontSize: "1.1rem", color: "#F5ECD7", marginBottom: "1rem" }}>
                Recent Activity
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {recentActivity.map((item, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
                    <div style={{
                      width: "32px", height: "32px", borderRadius: "8px", flexShrink: 0,
                      backgroundColor: "rgba(232,160,32,0.08)",
                      display: "flex", alignItems: "center", justifyContent: "center", marginTop: "2px"
                    }}>
                      <item.icon style={{ width: "14px", height: "14px", color: "#E8A020" }} />
                    </div>
                    <div>
                      <p style={{ fontFamily: "'Satoshi',sans-serif", fontSize: "0.8rem", color: "#F5ECD7", lineHeight: 1.5 }}>
                        {item.text}
                      </p>
                      <p style={{ color: "#6B5A40", fontSize: "0.7rem", marginTop: "2px", fontFamily: "'General Sans',sans-serif" }}>
                        {item.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Tagline */}
            <div style={{ textAlign: "center", padding: "1rem" }}>
              <p style={{ fontFamily: "'Satoshi',sans-serif", fontStyle: "italic", color: "#6B5A40", fontSize: "0.8rem" }}>
                Proudly African. Globally Creative.
              </p>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @media (max-width: 768px) {
          .dashboard-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
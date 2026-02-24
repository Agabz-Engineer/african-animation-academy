"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Home, BookOpen, Calendar, Image, Users, Tag,
  User, Settings, LogOut, Search, Bell, Trophy,
  Flame, Clock, ChevronRight, Camera, Play,
  TrendingUp, Star, Filter
} from "lucide-react";
import { supabase } from "@/lib/supabase";

const NAV_LINKS = [
  { label: "Home", href: "/dashboard", icon: Home },
  { label: "Courses", href: "/courses", icon: BookOpen },
  { label: "Events", href: "/events", icon: Calendar },
  { label: "Portfolio", href: "/portfolio", icon: Image },
  { label: "Community", href: "/community", icon: Users },
  { label: "Promo", href: "/promo", icon: Tag },
  { label: "Profile", href: "/profile", icon: User },
];

const FILTER_TABS = ["Hot", "New", "Event"];

const SHOWCASE_CARDS = [
  { title: "Character Design", category: "Colorimetry", price: "99", tag: "Hot" },
  { title: "Background Art", category: "Background", price: "199", tag: "New" },
  { title: "Texture: Afro", category: "Texturing", price: "249", tag: "Hot" },
  { title: "Clothing Design", category: "Clothing", price: "149", tag: "Event" },
];

export default function AnimatorDashboard() {
  const [user, setUser] = useState<{ email?: string; user_metadata?: { full_name?: string } } | null>(null);
  const [activeTab, setActiveTab] = useState("Hot");
  const [activeNav, setActiveNav] = useState("Home");

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  const firstName = user?.user_metadata?.full_name?.split(" ")[0] || user?.email?.split("@")[0] || "Creative";

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#0D0905", color: "#F5ECD7", fontFamily: "'Satoshi', sans-serif", position: "relative", zIndex: 1 }}>

      {/* ════════════════════════════
          SIDEBAR
      ════════════════════════════ */}
      <div style={{
        width: "220px", flexShrink: 0,
        backgroundColor: "#110A06",
        borderRight: "1px solid #3D2E10",
        display: "flex", flexDirection: "column",
        position: "fixed", top: 0, left: 0, bottom: 0,
        zIndex: 10
      }}>
        {/* Kente stripe */}
        <div style={{ height: "4px", width: "100%", background: "repeating-linear-gradient(90deg,#E8A020 0px,#E8A020 20px,#C1440E 20px,#C1440E 40px,#D4A853 40px,#D4A853 60px,#8B2E08 60px,#8B2E08 80px)" }} />

        {/* Logo + user */}
        <div style={{ padding: "1.5rem 1.25rem", borderBottom: "1px solid #3D2E10" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "1.25rem" }}>
            <div style={{ width: "36px", height: "30px", backgroundColor: "#221808", border: "1px solid #3D2E10", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <span style={{ fontFamily: "'Clash Display',sans-serif", fontWeight: 700, fontSize: "0.75rem", color: "#E8A020" }}>A</span>
              <span style={{ fontFamily: "'Clash Display',sans-serif", fontWeight: 700, fontSize: "0.85rem", color: "#C1440E" }}>F</span>
              <span style={{ fontFamily: "'Clash Display',sans-serif", fontWeight: 700, fontSize: "0.75rem", color: "#D4A853" }}>X</span>
            </div>
            <div>
              <div style={{ fontFamily: "'Clash Display',sans-serif", fontWeight: 700, fontSize: "0.8rem", color: "#F5ECD7" }}>Africa Fx</div>
              <div style={{ fontSize: "0.65rem", color: "#6B5A40", fontFamily: "'General Sans',sans-serif" }}>Your art. Our identity.</div>
            </div>
          </div>

          {/* Avatar */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "linear-gradient(135deg,#E8A020,#C1440E)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Clash Display',sans-serif", fontWeight: 700, fontSize: "0.875rem", color: "#0D0905", flexShrink: 0 }}>
              {firstName.charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={{ fontFamily: "'General Sans',sans-serif", fontWeight: 600, fontSize: "0.8rem", color: "#F5ECD7" }}>{firstName}</div>
              <div style={{ fontSize: "0.65rem", color: "#6B5A40" }}>Animator</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "1rem 0", overflowY: "auto" }}>
          {NAV_LINKS.map((link) => (
            <Link key={link.label} href={link.href} onClick={() => setActiveNav(link.label)} style={{
              display: "flex", alignItems: "center", gap: "0.75rem",
              padding: "0.75rem 1.25rem", textDecoration: "none",
              color: activeNav === link.label ? "#E8A020" : "#A89070",
              backgroundColor: activeNav === link.label ? "rgba(232,160,32,0.08)" : "transparent",
              borderLeft: activeNav === link.label ? "3px solid #E8A020" : "3px solid transparent",
              transition: "all 0.2s ease", fontSize: "0.875rem",
              fontFamily: "'General Sans',sans-serif", fontWeight: activeNav === link.label ? 600 : 400
            }}>
              <link.icon style={{ width: "18px", height: "18px", flexShrink: 0 }} />
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Bottom */}
        <div style={{ borderTop: "1px solid #3D2E10", padding: "1rem 0" }}>
          <Link href="/settings" style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.75rem 1.25rem", textDecoration: "none", color: "#6B5A40", fontSize: "0.875rem", fontFamily: "'General Sans',sans-serif" }}>
            <Settings style={{ width: "16px", height: "16px" }} /> Settings
          </Link>
          <button onClick={handleLogout} style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.75rem 1.25rem", width: "100%", background: "none", border: "none", cursor: "pointer", color: "#6B5A40", fontSize: "0.875rem", fontFamily: "'General Sans',sans-serif" }}>
            <LogOut style={{ width: "16px", height: "16px" }} /> Log Out
          </button>
        </div>
      </div>

      {/* ════════════════════════════
          MAIN CONTENT
      ════════════════════════════ */}
      <div style={{ marginLeft: "220px", flex: 1, display: "flex", flexDirection: "column" }}>

        {/* Top Bar */}
        <div style={{ position: "sticky", top: 0, zIndex: 9, backgroundColor: "rgba(13,9,5,0.95)", backdropFilter: "blur(12px)", borderBottom: "1px solid #3D2E10", padding: "1rem 2rem", display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{ marginRight: "auto" }}>
            <span style={{ fontFamily: "'Clash Display',sans-serif", fontWeight: 700, fontSize: "1.1rem", color: "#E8A020" }}>Animated</span>
            <span style={{ fontFamily: "'Clash Display',sans-serif", fontWeight: 700, fontSize: "1.1rem", color: "#F5ECD7", marginLeft: "6px" }}>Collective</span>
            <div style={{ fontSize: "0.7rem", color: "#6B5A40", fontFamily: "'General Sans',sans-serif" }}>Your art out identity</div>
          </div>

          <div style={{ position: "relative", flex: 1, maxWidth: "400px" }}>
            <Search style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", width: "16px", height: "16px", color: "#6B5A40" }} />
            <input type="text" placeholder="Search courses, events, artists..." style={{ width: "100%", backgroundColor: "rgba(34,24,8,0.80)", border: "1px solid #3D2E10", borderRadius: "999px", padding: "0.6rem 1rem 0.6rem 2.75rem", color: "#F5ECD7", fontSize: "0.875rem", outline: "none", fontFamily: "'General Sans',sans-serif" }} />
          </div>

          <button style={{ width: "36px", height: "36px", borderRadius: "10px", backgroundColor: "rgba(34,24,8,0.80)", border: "1px solid #3D2E10", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", position: "relative" }}>
            <Bell style={{ width: "16px", height: "16px", color: "#A89070" }} />
            <div style={{ position: "absolute", top: "7px", right: "7px", width: "7px", height: "7px", borderRadius: "50%", background: "linear-gradient(135deg,#E8A020,#C1440E)" }} />
          </button>

          <div style={{ display: "flex", gap: "0.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "4px", padding: "4px 10px", borderRadius: "999px", backgroundColor: "rgba(232,160,32,0.10)", border: "1px solid rgba(232,160,32,0.20)" }}>
              <Flame style={{ width: "12px", height: "12px", color: "#E8A020" }} />
              <span style={{ fontSize: "0.75rem", color: "#E8A020", fontFamily: "'General Sans',sans-serif", fontWeight: 600 }}>3 day streak</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "4px", padding: "4px 10px", borderRadius: "999px", backgroundColor: "rgba(193,68,14,0.10)", border: "1px solid rgba(193,68,14,0.20)" }}>
              <Trophy style={{ width: "12px", height: "12px", color: "#C1440E" }} />
              <span style={{ fontSize: "0.75rem", color: "#C1440E", fontFamily: "'General Sans',sans-serif", fontWeight: 600 }}>Rank #42</span>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div style={{ padding: "2rem", flex: 1 }}>

          {/* Filter Tabs */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.5rem" }}>
            {FILTER_TABS.map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)} style={{ padding: "0.4rem 1.25rem", borderRadius: "999px", border: "none", cursor: "pointer", fontFamily: "'General Sans',sans-serif", fontWeight: 600, fontSize: "0.875rem", transition: "all 0.2s ease", backgroundColor: activeTab === tab ? "#E8A020" : "rgba(34,24,8,0.80)", color: activeTab === tab ? "#0D0905" : "#A89070" }}>
                {tab}
              </button>
            ))}
            <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "6px", color: "#6B5A40", fontSize: "0.8rem", fontFamily: "'General Sans',sans-serif", cursor: "pointer" }}>
              <Filter style={{ width: "14px", height: "14px" }} /> Filter
            </div>
          </div>

          {/* Hero Banner Image Space */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{ width: "100%", height: "260px", borderRadius: "20px", backgroundColor: "rgba(34,24,8,0.60)", border: "2px dashed rgba(232,160,32,0.25)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", marginBottom: "1.5rem", position: "relative", overflow: "hidden", cursor: "pointer" }}
          >
            {/* Corner decorators */}
            {[["top","left"],["top","right"],["bottom","left"],["bottom","right"]].map(([v,h], i) => (
              <div key={i} style={{ position: "absolute", [v]: "12px", [h]: "12px", width: "20px", height: "20px", borderTop: v === "top" ? "2px solid #E8A020" : "none", borderBottom: v === "bottom" ? "2px solid #E8A020" : "none", borderLeft: h === "left" ? "2px solid #E8A020" : "none", borderRight: h === "right" ? "2px solid #E8A020" : "none", borderRadius: "2px" }} />
            ))}

            <div style={{ width: "56px", height: "56px", borderRadius: "16px", backgroundColor: "rgba(232,160,32,0.10)", border: "1px solid rgba(232,160,32,0.20)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1rem" }}>
              <Camera style={{ width: "24px", height: "24px", color: "#E8A020" }} />
            </div>
            <p style={{ fontFamily: "'Cabinet Grotesk',sans-serif", fontWeight: 700, fontSize: "1rem", color: "#F5ECD7", marginBottom: "4px" }}>Featured Banner</p>
            <p style={{ fontSize: "0.8rem", color: "#6B5A40", fontFamily: "'General Sans',sans-serif" }}>Recommended size: 1200 × 400px</p>

            <div style={{ position: "absolute", right: "1.5rem", bottom: "1.5rem", width: "44px", height: "44px", borderRadius: "50%", background: "linear-gradient(135deg,#E8A020,#C1440E)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Play style={{ width: "18px", height: "18px", color: "#0D0905", marginLeft: "2px" }} />
            </div>

            <div style={{ position: "absolute", left: "1.5rem", bottom: "1.5rem", display: "flex", alignItems: "center", gap: "8px" }}>
              {["25 July 2025", "29 July 2025"].map((date, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "6px 12px", borderRadius: "8px", backgroundColor: "rgba(13,9,5,0.70)", border: "1px solid #3D2E10", fontSize: "0.75rem", color: "#A89070", fontFamily: "'General Sans',sans-serif" }}>
                  <Calendar style={{ width: "12px", height: "12px" }} /> {date}
                </div>
              ))}
            </div>

            <div style={{ position: "absolute", right: "1.5rem", top: "1.5rem", display: "flex", gap: "4px" }}>
              {[1,2,3].map((i) => (
                <div key={i} style={{ width: i === 2 ? "20px" : "8px", height: "8px", borderRadius: "999px", backgroundColor: i === 2 ? "#E8A020" : "#3D2E10" }} />
              ))}
            </div>
          </motion.div>

          {/* Card Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem" }}>
            {SHOWCASE_CARDS.map((card, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: i * 0.08 }} whileHover={{ y: -4 }}
                style={{ backgroundColor: "rgba(34,24,8,0.75)", border: "1px solid #3D2E10", borderRadius: "16px", overflow: "hidden", cursor: "pointer", transition: "border-color 0.2s ease" }}
              >
                {/* Image placeholder */}
                <div style={{ width: "100%", height: "160px", backgroundColor: "rgba(13,9,5,0.60)", border: "2px dashed rgba(232,160,32,0.15)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", position: "relative" }}>
                  <Camera style={{ width: "24px", height: "24px", color: "rgba(232,160,32,0.30)", marginBottom: "6px" }} />
                  <span style={{ fontSize: "0.65rem", color: "#3D2E10", fontFamily: "'General Sans',sans-serif" }}>400 × 320px</span>
                  <div style={{ position: "absolute", top: "8px", left: "8px", padding: "2px 8px", borderRadius: "999px", fontSize: "0.65rem", fontFamily: "'General Sans',sans-serif", fontWeight: 600, backgroundColor: card.tag === "Hot" ? "rgba(232,160,32,0.20)" : card.tag === "New" ? "rgba(76,175,80,0.20)" : "rgba(193,68,14,0.20)", color: card.tag === "Hot" ? "#E8A020" : card.tag === "New" ? "#4CAF50" : "#C1440E" }}>
                    {card.tag}
                  </div>
                </div>
                <div style={{ padding: "0.875rem" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
                    <span style={{ fontFamily: "'General Sans',sans-serif", fontWeight: 600, fontSize: "0.85rem", color: "#F5ECD7" }}>{card.title}</span>
                    <Star style={{ width: "14px", height: "14px", color: "#E8A020" }} />
                  </div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: "0.75rem", color: "#6B5A40", fontFamily: "'General Sans',sans-serif" }}>{card.category}</span>
                    <span style={{ fontFamily: "'Clash Display',sans-serif", fontWeight: 700, fontSize: "0.875rem", color: "#E8A020" }}>${card.price}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Bottom Row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginTop: "1.5rem" }}>

            {/* Continue Learning */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }}
              style={{ backgroundColor: "rgba(34,24,8,0.75)", border: "1px solid #3D2E10", borderRadius: "16px", padding: "1.25rem" }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
                <h3 style={{ fontFamily: "'Cabinet Grotesk',sans-serif", fontWeight: 700, fontSize: "0.95rem", color: "#F5ECD7" }}>Continue Learning</h3>
                <Link href="/courses" style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "0.75rem", color: "#E8A020", textDecoration: "none", fontFamily: "'General Sans',sans-serif" }}>
                  View all <ChevronRight style={{ width: "12px", height: "12px" }} />
                </Link>
              </div>
              <div style={{ width: "100%", height: "100px", borderRadius: "12px", backgroundColor: "rgba(13,9,5,0.60)", border: "2px dashed rgba(232,160,32,0.15)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "0.875rem" }}>
                <Camera style={{ width: "20px", height: "20px", color: "rgba(232,160,32,0.25)" }} />
              </div>
              <p style={{ fontFamily: "'General Sans',sans-serif", fontWeight: 600, fontSize: "0.85rem", color: "#F5ECD7", marginBottom: "4px" }}>Enrol in a course to get started</p>
              <div style={{ height: "4px", borderRadius: "999px", backgroundColor: "#3D2E10", marginBottom: "4px" }}>
                <div style={{ width: "0%", height: "100%", borderRadius: "999px", background: "linear-gradient(90deg,#E8A020,#C1440E)" }} />
              </div>
              <p style={{ fontSize: "0.7rem", color: "#6B5A40", fontFamily: "'General Sans',sans-serif" }}>0% complete</p>
            </motion.div>

            {/* Recent Activity */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.5 }}
              style={{ backgroundColor: "rgba(34,24,8,0.75)", border: "1px solid #3D2E10", borderRadius: "16px", padding: "1.25rem" }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
                <h3 style={{ fontFamily: "'Cabinet Grotesk',sans-serif", fontWeight: 700, fontSize: "0.95rem", color: "#F5ECD7" }}>Recent Activity</h3>
                <TrendingUp style={{ width: "16px", height: "16px", color: "#E8A020" }} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {[
                  { text: "New challenge: Character of the Month", time: "2h ago", icon: Trophy },
                  { text: "New lesson by Kwame Mensah", time: "5h ago", icon: Play },
                  { text: "Your post got 3 replies", time: "1d ago", icon: Users },
                  { text: "Weekly streak milestone reached!", time: "2d ago", icon: Flame },
                ].map((item, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
                    <div style={{ width: "28px", height: "28px", borderRadius: "8px", backgroundColor: "rgba(232,160,32,0.08)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <item.icon style={{ width: "12px", height: "12px", color: "#E8A020" }} />
                    </div>
                    <div>
                      <p style={{ fontSize: "0.78rem", color: "#F5ECD7", fontFamily: "'Satoshi',sans-serif", lineHeight: 1.4 }}>{item.text}</p>
                      <p style={{ fontSize: "0.68rem", color: "#6B5A40", fontFamily: "'General Sans',sans-serif", marginTop: "2px" }}>{item.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Stats Row */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem", marginTop: "1.5rem" }}>
            {[
              { label: "Courses Enrolled", value: "0", icon: BookOpen, color: "#E8A020" },
              { label: "Lessons Done", value: "0", icon: Clock, color: "#C1440E" },
              { label: "Day Streak", value: "3", icon: Flame, color: "#D4A853" },
              { label: "Community Rank", value: "#42", icon: Trophy, color: "#E8A020" },
            ].map((stat, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.6 + i * 0.05 }}
                style={{ backgroundColor: "rgba(34,24,8,0.75)", border: "1px solid #3D2E10", borderRadius: "14px", padding: "1rem", display: "flex", alignItems: "center", gap: "0.75rem" }}
              >
                <div style={{ width: "36px", height: "36px", borderRadius: "10px", backgroundColor: `rgba(${stat.color === "#E8A020" ? "232,160,32" : stat.color === "#C1440E" ? "193,68,14" : "212,168,83"},0.12)`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <stat.icon style={{ width: "16px", height: "16px", color: stat.color }} />
                </div>
                <div>
                  <div style={{ fontFamily: "'Clash Display',sans-serif", fontWeight: 700, fontSize: "1.25rem", color: "#F5ECD7" }}>{stat.value}</div>
                  <div style={{ fontSize: "0.7rem", color: "#A89070", fontFamily: "'General Sans',sans-serif" }}>{stat.label}</div>
                </div>
              </motion.div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}
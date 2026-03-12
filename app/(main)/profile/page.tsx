"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  IdCard, 
  Briefcase, 
  Plus,
  MoreHorizontal,
  CreditCard,
  Clock
} from "lucide-react";
import DashboardLayout from "@/app/components/ui/DashboardLayout";
import { useThemeMode } from "@/lib/useThemeMode";

const TABS = ["Overview", "Compensation", "Emergency", "Time Off", "Performance", "Files", "Onboarding"];

const PROFILE_DATA = {
  name: "Nicholas Swatz",
  id: "#ERD246534",
  about: {
    phone: "(629) 555-0123",
    email: "nicholasswatz@gmail.com"
  },
  address: {
    line: "390 Market Street, Suite 200",
    cityState: "San Francisco CA",
    postcode: "94102"
  },
  details: {
    dob: "Sep 26, 1988",
    nationalId: "GER10654",
    title: "Project Manager",
    hireDate: "Jan 05, 2023"
  }
};

const JOB_INFO = [
  { dept: "Creative Associate", division: "Project Management", manager: "Alex Foster", date: "May 13, 2024", location: "Metro DC" },
  { dept: "Marketing Team", division: "Leadership", manager: "Jack Danniel", date: "Sep 05, 2024", location: "Bergen, NJ" },
  { dept: "Team Lead", division: "Creator", manager: "Alina Skazka", date: "Jun 08, 2023", location: "Miami, FL" },
  { dept: "Finance & Accounting", division: "Senior Consultant", manager: "John Miller", date: "Sep 13, 2022", location: "Chicago, IL" },
  { dept: "Team Lead", division: "Creator", manager: "Mark Baldwin", date: "Jul 07, 2023", location: "Miami, FL" },
];

const ACTIVITIES = [
  { name: "John Miller", action: "last login on", date: "Jul 13, 2024", time: "05:36 PM" },
  { name: "Merva Sahin", action: "date created on", date: "Sep 08, 2024", time: "03:12 PM" },
  { name: "Tammy Collier", action: "updated on", date: "Aug 15, 2023", time: "05:36 PM" },
];

const COMPENSATION = [
  { amount: "862.00 USD", period: "per month", effective: "May 10, 2015" },
  { amount: "1560.00 USD", period: "per quater", effective: "Jun 08, 2022" },
  { amount: "378.00 USD", period: "per week", effective: "Jun 08, 2022" },
];

export default function ProfilePage() {
  const theme = useThemeMode();
  const [activeTab, setActiveTab] = useState("Overview");

  // Palette: Cream #FAF3E1, Sand #F5E7C6, Orange #FF6D1F, Dark #222222
  const isDark = theme === "dark";
  const C = {
    bg: isDark ? "#222222" : "#FAF3E1",
    cardBg: isDark ? "#2C2C2C" : "#FFFFFF",
    border: isDark ? "#444444" : "#E7DBBD",
    text: isDark ? "#FAF3E1" : "#222222",
    muted: isDark ? "#D2C9B8" : "#555555",
    accent: "#FF6D1F",
    accentSoft: "rgba(255, 109, 31, 0.1)",
  };

  return (
    <DashboardLayout>
      <div style={{ padding: "1.5rem", color: C.text, fontFamily: "'General Sans', sans-serif" }}>
        
        {/* Header Section */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 700, fontFamily: "'Clash Display', sans-serif" }}>Profile</h1>
          <button style={{ 
            background: isDark ? C.text : C.accent, 
            color: isDark ? C.bg : "#fff",
            border: "none",
            padding: "0.6rem 1.2rem",
            borderRadius: "8px",
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            cursor: "pointer"
          }}>
            <Plus size={18} />
            Add employee
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: "2rem", borderBottom: `1px solid ${C.border}`, marginBottom: "2rem", overflowX: "auto", whiteSpace: "nowrap", paddingBottom: "2px" }}>
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                background: "none",
                border: "none",
                padding: "0.75rem 0",
                color: activeTab === tab ? C.text : C.muted,
                fontWeight: activeTab === tab ? 600 : 500,
                fontSize: "0.9rem",
                cursor: "pointer",
                position: "relative",
                transition: "color 0.2s"
              }}
            >
              {tab}
              {activeTab === tab && (
                <motion.div 
                  layoutId="activeTab"
                  style={{ position: "absolute", bottom: -1, left: 0, right: 0, height: "2px", background: C.accent }} 
                />
              )}
            </button>
          ))}
        </div>

        {/* Main Content Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: "2rem" }} className="profile-grid">
          
          {/* Left Column: Personal Info */}
          <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ 
                background: C.cardBg, 
                borderRadius: "16px", 
                padding: "2rem",
                border: `1px solid ${C.border}`,
                boxShadow: "0 4px 20px rgba(0,0,0,0.05)"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem" }}>
                <div style={{ width: "80px", height: "80px", borderRadius: "20px", background: "linear-gradient(135deg, #FF6D1F, #E04D00)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                  <User size={40} color="#fff" />
                </div>
                <button style={{ background: "none", border: "none", color: C.muted, cursor: "pointer" }}><MoreHorizontal /></button>
              </div>
              <h2 style={{ fontSize: "1.4rem", fontWeight: 700, marginBottom: "0.25rem" }}>{PROFILE_DATA.name}</h2>
              <div style={{ fontSize: "0.85rem", color: C.muted, marginBottom: "1.5rem" }}>{PROFILE_DATA.id}</div>

              <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                <section>
                  <h3 style={{ fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.05em", color: C.muted, marginBottom: "0.75rem", fontWeight: 700 }}>About</h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", fontSize: "0.9rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}><Phone size={14} color={C.muted} /> {PROFILE_DATA.about.phone}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}><Mail size={14} color={C.muted} /> {PROFILE_DATA.about.email}</div>
                  </div>
                </section>

                <section>
                  <h3 style={{ fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.05em", color: C.muted, marginBottom: "0.75rem", fontWeight: 700 }}>Address</h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", fontSize: "0.9rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}><MapPin size={14} color={C.muted} /> {PROFILE_DATA.address.line}</div>
                    <div style={{ paddingLeft: "1.6rem" }}>{PROFILE_DATA.address.cityState}</div>
                    <div style={{ paddingLeft: "1.6rem" }}>Postcode: {PROFILE_DATA.address.postcode}</div>
                  </div>
                </section>

                <section>
                  <h3 style={{ fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.05em", color: C.muted, marginBottom: "0.75rem", fontWeight: 700 }}>Employee details</h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", fontSize: "0.9rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}><Calendar size={14} color={C.muted} /> Date of birth: {PROFILE_DATA.details.dob}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}><IdCard size={14} color={C.muted} /> National ID: {PROFILE_DATA.details.nationalId}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}><Briefcase size={14} color={C.muted} /> Title: {PROFILE_DATA.details.title}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}><Calendar size={14} color={C.muted} /> Hire date: {PROFILE_DATA.details.hireDate}</div>
                  </div>
                </section>
              </div>
            </motion.div>
          </div>

          {/* Right Column: Dynamic Stats & Activity */}
          <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
            
            {/* Job Information Table */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              style={{ 
                background: C.cardBg, 
                borderRadius: "16px", 
                padding: "1.5rem",
                border: `1px solid ${C.border}`
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                <h3 style={{ fontWeight: 700, fontSize: "1.1rem" }}>Job information</h3>
                <button style={{ color: C.accent, background: "none", border: "none", fontWeight: 600, fontSize: "0.85rem", cursor: "pointer" }}>+ Add Info</button>
              </div>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
                  <thead>
                    <tr style={{ color: C.muted, textAlign: "left", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      <th style={{ padding: "0.75rem 0", fontWeight: 700 }}>Department</th>
                      <th style={{ padding: "0.75rem 0", fontWeight: 700 }}>Division</th>
                      <th style={{ padding: "0.75rem 0", fontWeight: 700 }}>Manager</th>
                      <th style={{ padding: "0.75rem 0", fontWeight: 700 }}>Hire Date</th>
                      <th style={{ padding: "0.75rem 0", fontWeight: 700 }}>Location</th>
                      <th style={{ width: "30px" }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {JOB_INFO.map((job, idx) => (
                      <tr key={idx} style={{ borderTop: `1px solid ${isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.02)"}` }}>
                        <td style={{ padding: "1rem 0", fontWeight: 600 }}>{job.dept}</td>
                        <td style={{ padding: "1rem 0", color: C.muted }}>{job.division}</td>
                        <td style={{ padding: "1rem 0" }}>{job.manager}</td>
                        <td style={{ padding: "1rem 0" }}>{job.date}</td>
                        <td style={{ padding: "1rem 0" }}>{job.location}</td>
                        <td style={{ textAlign: "right" }}><MoreHorizontal size={14} color={C.muted} cursor="pointer" /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }} className="stats-grid">
              
              {/* Activity Section */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                style={{ background: C.cardBg, borderRadius: "16px", padding: "1.5rem", border: `1px solid ${C.border}` }}
              >
                <h3 style={{ fontWeight: 700, fontSize: "1.1rem", marginBottom: "1.5rem" }}>Activity</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                  {ACTIVITIES.map((act, idx) => (
                    <div key={idx} style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                      <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: C.accentSoft, color: C.accent, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Clock size={16} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: "0.85rem" }}>
                          <span style={{ fontWeight: 600 }}>{act.name}</span> <span style={{ color: C.muted }}>{act.action}</span> <span style={{ fontWeight: 600 }}>{act.date}</span>
                        </div>
                        <div style={{ fontSize: "0.7rem", color: C.muted, marginTop: "2px" }}>{act.time}</div>
                      </div>
                    </div>
                  ))}
                  <button style={{ color: C.accent, background: "none", border: "none", alignSelf: "flex-start", fontSize: "0.85rem", fontWeight: 600, marginTop: "0.5rem", cursor: "pointer" }}>View all</button>
                </div>
              </motion.div>

              {/* Compensation Section */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                style={{ background: C.cardBg, borderRadius: "16px", padding: "1.5rem", border: `1px solid ${C.border}` }}
              >
                <h3 style={{ fontWeight: 700, fontSize: "1.1rem", marginBottom: "1.5rem" }}>Compensation</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                  {COMPENSATION.map((comp, idx) => (
                    <div key={idx} style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                      <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: C.accentSoft, color: C.accent, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <CreditCard size={16} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: "0.85rem", fontWeight: 600 }}>{comp.amount} <span style={{ color: C.muted, fontWeight: 500 }}>{comp.period}</span></div>
                        <div style={{ fontSize: "0.7rem", color: C.muted, marginTop: "2px" }}>Effective date on {comp.effective}</div>
                      </div>
                    </div>
                  ))}
                  <button style={{ color: C.accent, background: "none", border: "none", alignSelf: "flex-start", fontSize: "0.85rem", fontWeight: 600, marginTop: "0.5rem", cursor: "pointer" }}>View all</button>
                </div>
              </motion.div>

            </div>
          </div>

        </div>

        <style jsx>{`
          .profile-grid { grid-template-columns: 320px 1fr; }
          @media (max-width: 1024px) {
            .profile-grid { grid-template-columns: 1fr; }
            .stats-grid { grid-template-columns: 1fr; }
          }
        `}</style>
      </div>
    </DashboardLayout>
  );
}

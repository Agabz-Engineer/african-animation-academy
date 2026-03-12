"use client";

import { useState, useEffect } from "react";
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  MessageSquare, 
  Settings, 
  BarChart3,
  LogOut,
  Menu,
  X,
  Shield,
  Mail,
  FileText,
  CreditCard,
  Bell,
  Search
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { usePathname } from "next/navigation";

const DARK_UI = {
  bg: "#0F0F0F",
  sidebar: "#1A1A1A",
  card: "#1E1E1E",
  border: "#2A2A2A",
  text: "#FFFFFF",
  textMuted: "#A0A0A0",
  accent: "#FF8C00",
  accentHover: "#FFA500",
  success: "#10B981",
  warning: "#F59E0B",
  danger: "#EF4444",
};

const LIGHT_UI = {
  bg: "#F8F9FA",
  sidebar: "#FFFFFF",
  card: "#FFFFFF",
  border: "#E5E7EB",
  text: "#1F2937",
  textMuted: "#6B7280",
  accent: "#FF8C00",
  accentHover: "#FFA500",
  success: "#10B981",
  warning: "#F59E0B",
  danger: "#EF4444",
};

const adminNavItems = [
  { href: "/admin", icon: LayoutDashboard, label: "Dashboard", color: "#FF8C00" },
  { href: "/admin/users", icon: Users, label: "Users", color: "#3B82F6" },
  { href: "/admin/courses", icon: BookOpen, label: "Courses", color: "#10B981" },
  { href: "/admin/community", icon: MessageSquare, label: "Community", color: "#8B5CF6" },
  { href: "/admin/analytics", icon: BarChart3, label: "Analytics", color: "#F59E0B" },
  { href: "/admin/settings", icon: Settings, label: "Settings", color: "#6B7280" },
  { href: "/admin/emails", icon: Mail, label: "Emails", color: "#EC4899" },
  { href: "/admin/payments", icon: CreditCard, label: "Payments", color: "#14B8A6" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();

  const UI = theme === "dark" ? DARK_UI : LIGHT_UI;

  useEffect(() => {
    // Check authentication and admin role
    const checkAuth = async () => {
      try {
        if (!supabase) throw new Error('Supabase not initialized');
        
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          window.location.href = "/login";
          return;
        }

        // Check if user has admin role
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        // Debug logging
        console.log('Admin check - User ID:', user.id);
        console.log('Admin check - Profile:', profile);
        console.log('Admin check - Profile error:', profileError);

        if (profileError || !profile) {
          console.log('Profile not found, creating one...');
          // Create profile if it doesn't exist
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: user.id,
              email: user.email,
              full_name: user.user_metadata?.full_name || user.email?.split('@')[0],
              role: 'admin' // Set as admin for first setup
            });
          
          if (insertError) {
            console.error('Error creating profile:', insertError);
            window.location.href = "/dashboard";
            return;
          }
        } else if (profile.role !== 'admin') {
          console.log('User is not admin, redirecting...');
          window.location.href = "/dashboard";
          return;
        }

        setUser(user);
      } catch (error) {
        console.error('Auth error:', error);
        window.location.href = "/login";
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handleLogout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    window.location.href = "/login";
  };

  if (loading) {
    return (
      <div style={{ 
        backgroundColor: UI.bg, 
        minHeight: "100vh", 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center" 
      }}>
        <div style={{ 
          width: "40px", 
          height: "40px", 
          border: `3px solid ${UI.border}`, 
          borderTopColor: UI.accent, 
          borderRadius: "50%", 
          animation: "spin 1s linear infinite" 
        }} />
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: UI.bg, minHeight: "100vh", display: "flex" }}>
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            zIndex: 40,
          }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside style={{
        width: sidebarOpen ? "100%" : "280px",
        backgroundColor: UI.sidebar,
        borderRight: sidebarOpen ? "none" : `1px solid ${UI.border}`,
        position: sidebarOpen ? "fixed" : "relative",
        top: 0,
        bottom: 0,
        left: 0,
        zIndex: 50,
        transform: sidebarOpen ? "translateX(0)" : "translateX(0)",
        transition: "transform 0.3s ease",
        display: "flex",
        flexDirection: "column",
      }}>
        {/* Sidebar Header */}
        <div style={{
          padding: "1.5rem",
          borderBottom: `1px solid ${UI.border}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div style={{
              width: "40px",
              height: "40px",
              borderRadius: "12px",
              background: `linear-gradient(135deg, ${UI.accent}, ${UI.accentHover})`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}>
              <Shield style={{ width: "24px", height: "24px", color: "#FFFFFF" }} />
            </div>
            <div>
              <h1 style={{ 
                color: UI.text, 
                fontSize: "1.25rem", 
                fontWeight: 700, 
                margin: 0,
                fontFamily: "Inter, sans-serif"
              }}>
                AfricaFX Admin
              </h1>
              <p style={{ 
                color: UI.textMuted, 
                fontSize: "0.875rem", 
                margin: 0,
                fontFamily: "Inter, sans-serif"
              }}>
                Management Dashboard
              </p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            style={{
              display: sidebarOpen ? "block" : "none",
              background: "none",
              border: "none",
              color: UI.textMuted,
              cursor: "pointer",
              padding: "0.5rem",
            }}
          >
            <X style={{ width: "20px", height: "20px" }} />
          </button>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: "1rem", overflowY: "auto" }}>
          <div style={{ marginBottom: "1.5rem" }}>
            <h3 style={{ 
              color: UI.textMuted, 
              fontSize: "0.75rem", 
              fontWeight: 600, 
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              marginBottom: "0.75rem",
              fontFamily: "Inter, sans-serif"
            }}>
              Main Menu
            </h3>
            {adminNavItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
              return (
                <Link key={item.href} href={item.href} style={{ textDecoration: "none" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.75rem",
                      padding: "0.75rem 1rem",
                      borderRadius: "8px",
                      backgroundColor: isActive ? `${item.color}20` : "transparent",
                      color: isActive ? item.color : UI.textMuted,
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      marginBottom: "0.25rem",
                      fontFamily: "Inter, sans-serif",
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = `${UI.border}40`;
                        e.currentTarget.style.color = UI.text;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = "transparent";
                        e.currentTarget.style.color = UI.textMuted;
                      }
                    }}
                  >
                    <item.icon style={{ width: "20px", height: "20px" }} />
                    <span style={{ fontSize: "0.875rem", fontWeight: 500 }}>
                      {item.label}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* User Section */}
        <div style={{
          padding: "1rem",
          borderTop: `1px solid ${UI.border}`,
        }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            marginBottom: "1rem",
          }}>
            <div style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              backgroundColor: UI.accent,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#FFFFFF",
              fontWeight: 600,
              fontSize: "1rem",
            }}>
              {user?.email?.charAt(0).toUpperCase()}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ 
                color: UI.text, 
                fontSize: "0.875rem", 
                fontWeight: 600, 
                margin: 0,
                fontFamily: "Inter, sans-serif"
              }}>
                {user?.email}
              </p>
              <p style={{ 
                color: UI.textMuted, 
                fontSize: "0.75rem", 
                margin: 0,
                fontFamily: "Inter, sans-serif"
              }}>
                Administrator
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              width: "100%",
              padding: "0.75rem",
              borderRadius: "8px",
              backgroundColor: "transparent",
              border: `1px solid ${UI.border}`,
              color: UI.danger,
              cursor: "pointer",
              transition: "all 0.2s ease",
              fontFamily: "Inter, sans-serif",
              fontSize: "0.875rem",
              fontWeight: 500,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = `${UI.danger}20`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            <LogOut style={{ width: "16px", height: "16px" }} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Top Header */}
        <header style={{
          backgroundColor: UI.card,
          borderBottom: `1px solid ${UI.border}`,
          padding: sidebarOpen ? "1rem" : "1rem 2rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <button
              onClick={() => setSidebarOpen(true)}
              style={{
                display: sidebarOpen ? "none" : "block",
                background: "none",
                border: "none",
                color: UI.text,
                cursor: "pointer",
                padding: "0.5rem",
              }}
            >
              <Menu style={{ width: "20px", height: "20px" }} />
            </button>
            <div style={{
              display: sidebarOpen ? "none" : "flex",
              alignItems: "center",
              gap: "0.5rem",
              backgroundColor: UI.bg,
              padding: "0.5rem 1rem",
              borderRadius: "8px",
              border: `1px solid ${UI.border}`,
              minWidth: "200px",
              maxWidth: "300px",
              flex: 1,
            }}>
              <Search style={{ width: "16px", height: "16px", color: UI.textMuted }} />
              <input
                type="text"
                placeholder="Search admin panel..."
                style={{
                  backgroundColor: "transparent",
                  border: "none",
                  outline: "none",
                  color: UI.text,
                  fontSize: "0.875rem",
                  flex: 1,
                  fontFamily: "Inter, sans-serif",
                }}
              />
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <button style={{
              position: "relative",
              background: "none",
              border: "none",
              color: UI.textMuted,
              cursor: "pointer",
              padding: "0.5rem",
            }}>
              <Bell style={{ width: "20px", height: "20px" }} />
              <span style={{
                position: "absolute",
                top: "0.25rem",
                right: "0.25rem",
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                backgroundColor: UI.danger,
              }} />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <div style={{ 
          flex: 1, 
          padding: sidebarOpen ? "1rem" : "2rem", 
          overflowY: "auto" 
        }}>
          {children}
        </div>
      </main>

      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        @media (max-width: 768px) {
          aside {
            position: fixed;
            transform: translateX(-100%);
          }
          
          aside[data-open="true"] {
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
}

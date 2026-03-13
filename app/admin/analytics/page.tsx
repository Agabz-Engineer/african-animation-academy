"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  TrendingUp,
  Users,
  DollarSign,
  Activity,
  MessageSquare,
  RefreshCw,
  Calendar,
} from "lucide-react";
import { getAdminDashboardData } from "@/app/admin/actions";

const DARK_UI = {
  bg: "#0F0F0F",
  card: "#1E1E1E",
  border: "#2A2A2A",
  text: "#FFFFFF",
  textMuted: "#A0A0A0",
  accent: "#FF8C00",
  success: "#10B981",
  warning: "#F59E0B",
  danger: "#EF4444",
  info: "#3B82F6",
};

const LIGHT_UI = {
  bg: "#F8F9FA",
  card: "#FFFFFF",
  border: "#E5E7EB",
  text: "#1F2937",
  textMuted: "#6B7280",
  accent: "#FF8C00",
  success: "#10B981",
  warning: "#F59E0B",
  danger: "#EF4444",
  info: "#3B82F6",
};

interface DashboardStats {
  totalUsers: number;
  totalCourses: number;
  totalPosts: number;
  totalRevenue: number;
  newUsersToday: number;
  activeUsers: number;
  pendingPosts: number;
  monthlyRevenue: number;
}

interface RecentActivity {
  id: string;
  type: "user" | "course" | "post" | "payment";
  title: string;
  description: string;
  timestamp: string;
  status: "success" | "warning" | "danger" | "info";
}

export default function AnalyticsPage() {
  const [theme] = useState<"dark" | "light">("dark");
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalCourses: 0,
    totalPosts: 0,
    totalRevenue: 0,
    newUsersToday: 0,
    activeUsers: 0,
    pendingPosts: 0,
    monthlyRevenue: 0,
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  const UI = theme === "dark" ? DARK_UI : LIGHT_UI;

  const fetchAnalytics = async () => {
    try {
      const data = await getAdminDashboardData();
      setStats(data.stats);
      setRecentActivity(data.recentActivity || []);
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const activeRate = stats.totalUsers > 0
    ? Math.round((stats.activeUsers / stats.totalUsers) * 100)
    : 0;

  const pendingRate = stats.totalPosts > 0
    ? Math.round((stats.pendingPosts / stats.totalPosts) * 100)
    : 0;

  const revenuePerUser = stats.totalUsers > 0
    ? stats.totalRevenue / stats.totalUsers
    : 0;

  const weeklyActivity = useMemo(() => [12, 18, 9, 22, 17, 25, 19], []);
  const maxWeekly = Math.max(...weeklyActivity, 1);

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "300px" }}>
        <div
          style={{
            width: "40px",
            height: "40px",
            border: `3px solid ${UI.border}`,
            borderTopColor: UI.accent,
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
          }}
        />
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "Inter, sans-serif" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
        <div>
          <h1 style={{ color: UI.text, fontSize: "2rem", fontWeight: 700, margin: "0 0 0.35rem 0" }}>Analytics</h1>
          <p style={{ color: UI.textMuted, fontSize: "0.95rem", margin: 0 }}>
            Performance signals across users, content, and revenue.
          </p>
        </div>
        <button
          onClick={fetchAnalytics}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            backgroundColor: UI.card,
            border: `1px solid ${UI.border}`,
            color: UI.text,
            padding: "0.5rem 0.85rem",
            borderRadius: "8px",
            cursor: "pointer",
            fontFamily: "Inter, sans-serif",
            fontSize: "0.85rem",
          }}
        >
          <RefreshCw style={{ width: "16px", height: "16px" }} />
          Refresh
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
        {[
          { label: "Active Users", value: `${activeRate}%`, icon: Users, color: UI.success, detail: `${stats.activeUsers} active` },
          { label: "Monthly Revenue", value: `USD ${stats.monthlyRevenue.toFixed(2)}`, icon: DollarSign, color: UI.accent, detail: "Current month" },
          { label: "Pending Posts", value: `${pendingRate}%`, icon: MessageSquare, color: UI.warning, detail: `${stats.pendingPosts} pending` },
          { label: "Revenue per User", value: `USD ${revenuePerUser.toFixed(2)}`, icon: TrendingUp, color: UI.info, detail: "All-time avg" },
        ].map((card, index) => (
          <div
            key={index}
            style={{
              backgroundColor: UI.card,
              border: `1px solid ${UI.border}`,
              borderRadius: "12px",
              padding: "1rem",
              display: "flex",
              gap: "0.8rem",
              alignItems: "center",
            }}
          >
            <div
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "10px",
                backgroundColor: `${card.color}20`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <card.icon style={{ width: "20px", height: "20px", color: card.color }} />
            </div>
            <div>
              <p style={{ color: UI.textMuted, fontSize: "0.78rem", margin: 0 }}>{card.label}</p>
              <p style={{ color: UI.text, fontSize: "1.1rem", fontWeight: 700, margin: "0.2rem 0 0 0" }}>{card.value}</p>
              <p style={{ color: UI.textMuted, fontSize: "0.72rem", margin: "0.2rem 0 0 0" }}>{card.detail}</p>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
        <div style={{ backgroundColor: UI.card, border: `1px solid ${UI.border}`, borderRadius: "12px", padding: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <BarChart3 style={{ width: "18px", height: "18px", color: UI.accent }} />
              <h3 style={{ margin: 0, color: UI.text, fontSize: "1rem", fontWeight: 600 }}>Weekly Activity</h3>
            </div>
            <span style={{ color: UI.textMuted, fontSize: "0.75rem" }}>Last 7 days</span>
          </div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: "0.4rem", height: "120px" }}>
            {weeklyActivity.map((value, index) => (
              <div
                key={index}
                style={{
                  flex: 1,
                  height: `${Math.round((value / maxWeekly) * 100)}%`,
                  borderRadius: "6px",
                  background: `linear-gradient(180deg, ${UI.accent}, ${UI.accent}40)`,
                }}
                title={`${value} actions`}
              />
            ))}
          </div>
        </div>

        <div style={{ backgroundColor: UI.card, border: `1px solid ${UI.border}`, borderRadius: "12px", padding: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
            <Activity style={{ width: "18px", height: "18px", color: UI.info }} />
            <h3 style={{ margin: 0, color: UI.text, fontSize: "1rem", fontWeight: 600 }}>Platform Signals</h3>
          </div>
          <div style={{ display: "grid", gap: "0.7rem" }}>
            {[
              { label: "Total Users", value: stats.totalUsers.toLocaleString(), icon: Users },
              { label: "Total Courses", value: stats.totalCourses.toLocaleString(), icon: Calendar },
              { label: "Community Posts", value: stats.totalPosts.toLocaleString(), icon: MessageSquare },
            ].map((item, index) => (
              <div key={index} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <item.icon style={{ width: "16px", height: "16px", color: UI.textMuted }} />
                  <span style={{ color: UI.textMuted, fontSize: "0.85rem" }}>{item.label}</span>
                </div>
                <span style={{ color: UI.text, fontWeight: 600 }}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ backgroundColor: UI.card, border: `1px solid ${UI.border}`, borderRadius: "12px", padding: "1rem" }}>
        <h3 style={{ margin: "0 0 1rem 0", color: UI.text, fontSize: "1rem", fontWeight: 600 }}>Recent Activity</h3>
        {recentActivity.length === 0 ? (
          <p style={{ color: UI.textMuted, margin: 0 }}>No recent activity yet.</p>
        ) : (
          <div style={{ display: "grid", gap: "0.7rem" }}>
            {recentActivity.map((activity) => (
              <div
                key={activity.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "0.75rem",
                  borderRadius: "10px",
                  border: `1px solid ${UI.border}`,
                  backgroundColor: UI.bg,
                  gap: "1rem",
                  flexWrap: "wrap",
                }}
              >
                <div>
                  <p style={{ margin: 0, color: UI.text, fontWeight: 600 }}>{activity.title}</p>
                  <p style={{ margin: 0, color: UI.textMuted, fontSize: "0.78rem" }}>{activity.description}</p>
                </div>
                <span style={{ color: UI.textMuted, fontSize: "0.78rem" }}>
                  {new Date(activity.timestamp).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

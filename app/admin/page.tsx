"use client";

import { useState, useEffect } from "react";
import { 
  Users, 
  BookOpen, 
  MessageSquare, 
  CreditCard, 
  TrendingUp,
  UserPlus,
  DollarSign,
  Activity,
  Eye,
  Clock,
  Star,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  PieChart,
  Calendar
} from "lucide-react";
import { supabase } from "@/lib/supabase";

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
  type: 'user' | 'course' | 'post' | 'payment';
  title: string;
  description: string;
  timestamp: string;
  status: 'success' | 'warning' | 'danger' | 'info';
}

export default function AdminDashboard() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
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

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      if (!supabase) throw new Error('Supabase not initialized');
      
      // Fetch users count
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Fetch new users today
      const today = new Date().toISOString().split('T')[0];
      const { count: newUsersToday } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', today);

      // Fetch courses count
      const { count: totalCourses } = await supabase
        .from('courses')
        .select('*', { count: 'exact', head: true });

      // Fetch posts count
      const { count: totalPosts } = await supabase
        .from('community_posts')
        .select('*', { count: 'exact', head: true });

      // Fetch pending posts
      const { count: pendingPosts } = await supabase
        .from('community_posts')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      // Mock revenue data (replace with actual payment data)
      const totalRevenue = 45600; // GH₵45,600
      const monthlyRevenue = 12800; // GH₵12,800

      setStats({
        totalUsers: totalUsers || 0,
        totalCourses: totalCourses || 0,
        totalPosts: totalPosts || 0,
        totalRevenue,
        newUsersToday: newUsersToday || 0,
        activeUsers: Math.floor((totalUsers || 0) * 0.7), // 70% active
        pendingPosts: pendingPosts || 0,
        monthlyRevenue,
      });

      // Mock recent activity
      setRecentActivity([
        {
          id: '1',
          type: 'user',
          title: 'New User Registration',
          description: 'John Doe joined the platform',
          timestamp: '2 hours ago',
          status: 'success'
        },
        {
          id: '2',
          type: 'course',
          title: 'Course Enrollment',
          description: 'Sarah enrolled in 3D Animation Fundamentals',
          timestamp: '3 hours ago',
          status: 'info'
        },
        {
          id: '3',
          type: 'post',
          title: 'New Community Post',
          description: 'Mike shared animation progress',
          timestamp: '5 hours ago',
          status: 'warning'
        },
        {
          id: '4',
          type: 'payment',
          title: 'Payment Received',
          description: 'GH₵300 from Pro subscription',
          timestamp: '6 hours ago',
          status: 'success'
        },
      ]);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: "Total Users",
      value: stats.totalUsers.toLocaleString(),
      change: `+${stats.newUsersToday} today`,
      icon: Users,
      color: UI.info,
      bgColor: `${UI.info}20`,
    },
    {
      title: "Total Courses",
      value: stats.totalCourses.toString(),
      change: "Active courses",
      icon: BookOpen,
      color: UI.success,
      bgColor: `${UI.success}20`,
    },
    {
      title: "Community Posts",
      value: stats.totalPosts.toLocaleString(),
      change: `${stats.pendingPosts} pending`,
      icon: MessageSquare,
      color: UI.warning,
      bgColor: `${UI.warning}20`,
    },
    {
      title: "Total Revenue",
      value: `GH₵${stats.totalRevenue.toLocaleString()}`,
      change: `GH₵${stats.monthlyRevenue.toLocaleString()} this month`,
      icon: CreditCard,
      color: UI.accent,
      bgColor: `${UI.accent}20`,
    },
  ];

  const quickActions = [
    {
      title: "Add New Course",
      description: "Create a new animation course",
      icon: BookOpen,
      href: "/admin/courses?action=new",
      color: UI.success,
    },
    {
      title: "Manage Users",
      description: "View and edit user accounts",
      icon: Users,
      href: "/admin/users",
      color: UI.info,
    },
    {
      title: "Review Posts",
      description: "Moderate community content",
      icon: MessageSquare,
      href: "/admin/community",
      color: UI.warning,
    },
    {
      title: "View Analytics",
      description: "Detailed platform insights",
      icon: BarChart3,
      href: "/admin/analytics",
      color: UI.accent,
    },
  ];

  if (loading) {
    return (
      <div style={{ 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center", 
        minHeight: "400px" 
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
    <div style={{ fontFamily: "Inter, sans-serif" }}>
      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ 
          color: UI.text, 
          fontSize: "2rem", 
          fontWeight: 700, 
          margin: "0 0 0.5rem 0" 
        }}>
          Admin Dashboard
        </h1>
        <p style={{ 
          color: UI.textMuted, 
          fontSize: "1rem", 
          margin: 0 
        }}>
          Welcome back! Here's what's happening on AfricaFX today.
        </p>
      </div>

      {/* Stats Grid */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", 
        gap: "1rem", 
        marginBottom: "2rem" 
      }}>
        {statCards.map((stat, index) => (
          <div
            key={index}
            style={{
              backgroundColor: UI.card,
              border: `1px solid ${UI.border}`,
              borderRadius: "12px",
              padding: "1rem",
              transition: "all 0.2s ease",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
              <div style={{
                width: "48px",
                height: "48px",
                borderRadius: "12px",
                backgroundColor: stat.bgColor,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}>
                <stat.icon style={{ width: "24px", height: "24px", color: stat.color }} />
              </div>
              <TrendingUp style={{ width: "16px", height: "16px", color: UI.success }} />
            </div>
            <div>
              <h3 style={{ 
                color: UI.text, 
                fontSize: "2rem", 
                fontWeight: 700, 
                margin: "0 0 0.25rem 0" 
              }}>
                {stat.value}
              </h3>
              <p style={{ 
                color: UI.textMuted, 
                fontSize: "0.875rem", 
                margin: 0 
              }}>
                {stat.title}
              </p>
              <p style={{ 
                color: stat.color, 
                fontSize: "0.75rem", 
                margin: "0.25rem 0 0 0",
                fontWeight: 500
              }}>
                {stat.change}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions & Recent Activity */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "1fr", 
        gap: "1.5rem",
        marginBottom: "2rem"
      }}>
        {/* Quick Actions */}
        <div style={{
          backgroundColor: UI.card,
          border: `1px solid ${UI.border}`,
          borderRadius: "12px",
          padding: "1rem",
        }}>
          <h2 style={{ 
            color: UI.text, 
            fontSize: "1.25rem", 
            fontWeight: 600, 
            margin: "0 0 1.5rem 0" 
          }}>
            Quick Actions
          </h2>
          <div style={{ display: "grid", gap: "1rem" }}>
            {quickActions.map((action, index) => (
              <a
                key={index}
                href={action.href}
                style={{
                  textDecoration: "none",
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem",
                  padding: "1rem",
                  borderRadius: "8px",
                  border: `1px solid ${UI.border}`,
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = `${action.color}20`;
                  e.currentTarget.style.borderColor = action.color;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.borderColor = UI.border;
                }}
              >
                <div style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "8px",
                  backgroundColor: `${action.color}20`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}>
                  <action.icon style={{ width: "20px", height: "20px", color: action.color }} />
                </div>
                <div>
                  <h3 style={{ 
                    color: UI.text, 
                    fontSize: "0.875rem", 
                    fontWeight: 600, 
                    margin: "0 0 0.25rem 0" 
                  }}>
                    {action.title}
                  </h3>
                  <p style={{ 
                    color: UI.textMuted, 
                    fontSize: "0.75rem", 
                    margin: 0 
                  }}>
                    {action.description}
                  </p>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div style={{
          backgroundColor: UI.card,
          border: `1px solid ${UI.border}`,
          borderRadius: "12px",
          padding: "1rem",
        }}>
          <h2 style={{ 
            color: UI.text, 
            fontSize: "1.25rem", 
            fontWeight: 600, 
            margin: "0 0 1.5rem 0" 
          }}>
            Recent Activity
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {recentActivity.map((activity) => (
              <div
                key={activity.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem",
                  padding: "0.75rem",
                  borderRadius: "8px",
                  border: `1px solid ${UI.border}`,
                }}
              >
                <div style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  backgroundColor: activity.status === 'success' ? `${UI.success}20` :
                                   activity.status === 'warning' ? `${UI.warning}20` :
                                   activity.status === 'danger' ? `${UI.danger}20` : `${UI.info}20`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}>
                  {activity.type === 'user' && <UserPlus style={{ width: "16px", height: "16px", color: UI.success }} />}
                  {activity.type === 'course' && <BookOpen style={{ width: "16px", height: "16px", color: UI.info }} />}
                  {activity.type === 'post' && <MessageSquare style={{ width: "16px", height: "16px", color: UI.warning }} />}
                  {activity.type === 'payment' && <CreditCard style={{ width: "16px", height: "16px", color: UI.success }} />}
                </div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ 
                    color: UI.text, 
                    fontSize: "0.875rem", 
                    fontWeight: 600, 
                    margin: "0 0 0.25rem 0" 
                  }}>
                    {activity.title}
                  </h4>
                  <p style={{ 
                    color: UI.textMuted, 
                    fontSize: "0.75rem", 
                    margin: "0 0 0.25rem 0" 
                  }}>
                    {activity.description}
                  </p>
                  <p style={{ 
                    color: UI.textMuted, 
                    fontSize: "0.75rem", 
                    margin: 0,
                    display: "flex",
                    alignItems: "center",
                    gap: "0.25rem"
                  }}>
                    <Clock style={{ width: "12px", height: "12px" }} />
                    {activity.timestamp}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div style={{
        backgroundColor: UI.card,
        border: `1px solid ${UI.border}`,
        borderRadius: "12px",
        padding: "1rem",
      }}>
        <h2 style={{ 
          color: UI.text, 
          fontSize: "1.25rem", 
          fontWeight: 600, 
          margin: "0 0 1.5rem 0" 
        }}>
          Platform Overview
        </h2>
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", 
          gap: "1.5rem",
          textAlign: "center"
        }}>
          <div>
            <div style={{
              width: "100px",
              height: "100px",
              margin: "0 auto 1rem",
              borderRadius: "50%",
              background: `conic-gradient(${UI.accent} 0% ${stats.activeUsers / stats.totalUsers * 100}%, ${UI.border} ${stats.activeUsers / stats.totalUsers * 100}% 100%)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
            }}>
              <div style={{
                width: "60px",
                height: "60px",
                borderRadius: "50%",
                backgroundColor: UI.card,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}>
                <span style={{ color: UI.text, fontSize: "1.25rem", fontWeight: 700 }}>
                  {Math.round(stats.activeUsers / stats.totalUsers * 100)}%
                </span>
              </div>
            </div>
            <h3 style={{ color: UI.text, fontSize: "1rem", fontWeight: 600, margin: "0 0 0.5rem 0" }}>
              Active Users
            </h3>
            <p style={{ color: UI.textMuted, fontSize: "0.875rem", margin: 0 }}>
              {stats.activeUsers} of {stats.totalUsers} users
            </p>
          </div>
          <div>
            <div style={{
              fontSize: "3rem",
              fontWeight: 700,
              color: UI.success,
              marginBottom: "0.5rem",
            }}>
              GH₵{stats.monthlyRevenue.toLocaleString()}
            </div>
            <h3 style={{ color: UI.text, fontSize: "1rem", fontWeight: 600, margin: "0 0 0.5rem 0" }}>
              Monthly Revenue
            </h3>
            <p style={{ color: UI.textMuted, fontSize: "0.875rem", margin: 0 }}>
              +12% from last month
            </p>
          </div>
          <div>
            <div style={{
              fontSize: "3rem",
              fontWeight: 700,
              color: UI.warning,
              marginBottom: "0.5rem",
            }}>
              {stats.pendingPosts}
            </div>
            <h3 style={{ color: UI.text, fontSize: "1rem", fontWeight: 600, margin: "0 0 0.5rem 0" }}>
              Pending Posts
            </h3>
            <p style={{ color: UI.textMuted, fontSize: "0.875rem", margin: 0 }}>
              Need moderation
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        @media (max-width: 1024px) {
          div[style*="grid-template-columns: 1fr 1fr"] {
            grid-template-columns: 1fr;
          }
        }
        
        @media (max-width: 768px) {
          div[style*="grid-template-columns: repeat(auto-fit, minmax(250px, 1fr))"] {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}

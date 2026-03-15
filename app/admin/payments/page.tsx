"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CreditCard,
  Search,
  Filter,
  RefreshCw,
  DollarSign,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  User,
} from "lucide-react";
import { getAdminPayments, grantUserProAccess } from "@/app/admin/actions";

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

interface Payment {
  id: string;
  user_id: string;
  amount: string | number;
  currency: string;
  status: "pending" | "completed" | "failed" | "refunded";
  payment_method: string | null;
  created_at: string;
  completed_at: string | null;
  user_email?: string;
  user_name?: string | null;
  user_subscription_tier?: string | null;
  user_role?: string;
}

export default function PaymentsPage() {
  const [theme] = useState<"dark" | "light">("dark");
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [actionLoadingFor, setActionLoadingFor] = useState<string | null>(null);

  const UI = theme === "dark" ? DARK_UI : LIGHT_UI;

  const fetchPayments = async () => {
    try {
      const data = await getAdminPayments();
      setPayments(data || []);
    } catch (error) {
      console.error("Error fetching payments:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const filteredPayments = useMemo(() => {
    const q = searchTerm.toLowerCase();
    return payments.filter((payment) => {
      const matchesStatus = statusFilter === "all" || payment.status === statusFilter;
      const matchesSearch =
        !q ||
        payment.user_email?.toLowerCase().includes(q) ||
        payment.user_name?.toLowerCase().includes(q) ||
        payment.id.toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [payments, searchTerm, statusFilter]);

  const totals = useMemo(() => {
    const completed = payments.filter((p) => p.status === "completed");
    const pending = payments.filter((p) => p.status === "pending");
    const failed = payments.filter((p) => p.status === "failed");
    const refunded = payments.filter((p) => p.status === "refunded");

    const totalRevenue = completed.reduce((sum, p) => {
      const value = Number(p.amount || 0);
      return sum + (Number.isFinite(value) ? value : 0);
    }, 0);

    return {
      totalRevenue,
      completed: completed.length,
      pending: pending.length,
      failed: failed.length + refunded.length,
      totalCount: payments.length,
    };
  }, [payments]);

  const formatAmount = (payment: Payment) => {
    const value = Number(payment.amount || 0);
    const safeValue = Number.isFinite(value) ? value : 0;
    const currency = payment.currency || "USD";
    return `${currency} ${safeValue.toFixed(2)}`;
  };

  const statusChip = (status: Payment["status"]) => {
    const map = {
      completed: { color: UI.success, bg: `${UI.success}20`, label: "Completed", icon: CheckCircle },
      pending: { color: UI.warning, bg: `${UI.warning}20`, label: "Pending", icon: Clock },
      failed: { color: UI.danger, bg: `${UI.danger}20`, label: "Failed", icon: XCircle },
      refunded: { color: UI.info, bg: `${UI.info}20`, label: "Refunded", icon: AlertTriangle },
    } as const;
    const info = map[status];
    const Icon = info.icon;
    return (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.35rem",
          padding: "0.2rem 0.6rem",
          borderRadius: "999px",
          backgroundColor: info.bg,
          color: info.color,
          fontSize: "0.72rem",
          fontWeight: 600,
        }}
      >
        <Icon style={{ width: "12px", height: "12px" }} />
        {info.label}
      </span>
    );
  };

  const handleGrantPro = async (payment: Payment) => {
    setActionLoadingFor(payment.id);
    try {
      await grantUserProAccess({ userId: payment.user_id, paymentId: payment.id });
      await fetchPayments();
    } catch (error) {
      console.error("Error granting pro access:", error);
      alert(error instanceof Error ? error.message : "Failed to grant pro access.");
    } finally {
      setActionLoadingFor(null);
    }
  };

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
          <h1 style={{ color: UI.text, fontSize: "2rem", fontWeight: 700, margin: "0 0 0.35rem 0" }}>Payments</h1>
          <p style={{ color: UI.textMuted, fontSize: "0.95rem", margin: 0 }}>
            Track revenue, payment status, and billing activity.
          </p>
        </div>
        <button
          onClick={fetchPayments}
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

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "1rem",
          marginBottom: "1.5rem",
        }}
      >
        {[
          { label: "Total Revenue", value: `USD ${totals.totalRevenue.toFixed(2)}`, icon: DollarSign, color: UI.success },
          { label: "Completed", value: totals.completed.toString(), icon: CheckCircle, color: UI.success },
          { label: "Pending", value: totals.pending.toString(), icon: Clock, color: UI.warning },
          { label: "Failed/Refunded", value: totals.failed.toString(), icon: XCircle, color: UI.danger },
        ].map((item, index) => (
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
                backgroundColor: `${item.color}20`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <item.icon style={{ width: "20px", height: "20px", color: item.color }} />
            </div>
            <div>
              <p style={{ color: UI.textMuted, fontSize: "0.78rem", margin: 0 }}>{item.label}</p>
              <p style={{ color: UI.text, fontSize: "1.1rem", fontWeight: 700, margin: "0.2rem 0 0 0" }}>{item.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          backgroundColor: UI.card,
          border: `1px solid ${UI.border}`,
          borderRadius: "12px",
          padding: "1rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem", flexWrap: "wrap" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              backgroundColor: UI.bg,
              border: `1px solid ${UI.border}`,
              borderRadius: "8px",
              padding: "0.45rem 0.75rem",
              flex: 1,
              minWidth: "220px",
            }}
          >
            <Search style={{ width: "16px", height: "16px", color: UI.textMuted }} />
            <input
              type="text"
              placeholder="Search by user or payment id..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              style={{
                backgroundColor: "transparent",
                border: "none",
                outline: "none",
                color: UI.text,
                fontSize: "0.85rem",
                flex: 1,
                fontFamily: "Inter, sans-serif",
              }}
            />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Filter style={{ width: "16px", height: "16px", color: UI.textMuted }} />
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              style={{
                backgroundColor: UI.bg,
                border: `1px solid ${UI.border}`,
                borderRadius: "8px",
                padding: "0.45rem 0.75rem",
                color: UI.text,
                fontSize: "0.85rem",
                fontFamily: "Inter, sans-serif",
                outline: "none",
              }}
            >
              <option value="all">All Statuses</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>
        </div>

        {filteredPayments.length === 0 ? (
          <div style={{ textAlign: "center", color: UI.textMuted, padding: "2rem 0" }}>
            <CreditCard style={{ width: "32px", height: "32px", marginBottom: "0.75rem" }} />
            <p style={{ margin: 0 }}>No payments found yet.</p>
          </div>
        ) : (
          <div style={{ display: "grid", gap: "0.75rem" }}>
            {filteredPayments.map((payment) => (
              <div
                key={payment.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "1rem",
                  padding: "0.85rem",
                  borderRadius: "10px",
                  border: `1px solid ${UI.border}`,
                  backgroundColor: UI.bg,
                  flexWrap: "wrap",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", minWidth: "220px" }}>
                  <div
                    style={{
                      width: "38px",
                      height: "38px",
                      borderRadius: "10px",
                      backgroundColor: `${UI.accent}20`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <User style={{ width: "18px", height: "18px", color: UI.accent }} />
                  </div>
                  <div>
                    <p style={{ margin: 0, color: UI.text, fontSize: "0.9rem", fontWeight: 600 }}>
                      {payment.user_name || payment.user_email || "Unknown user"}
                    </p>
                    <p style={{ margin: 0, color: UI.textMuted, fontSize: "0.75rem" }}>{payment.user_email || "unknown"}</p>
                  </div>
                </div>

                <div style={{ minWidth: "140px" }}>
                  <p style={{ margin: 0, color: UI.text, fontWeight: 600 }}>{formatAmount(payment)}</p>
                  <p style={{ margin: 0, color: UI.textMuted, fontSize: "0.75rem" }}>
                    {payment.payment_method || "Card"}
                  </p>
                </div>

                <div style={{ minWidth: "160px" }}>
                  <p style={{ margin: 0, color: UI.text, fontSize: "0.8rem" }}>
                    {new Date(payment.created_at).toLocaleString()}
                  </p>
                  <p style={{ margin: 0, color: UI.textMuted, fontSize: "0.7rem" }}>
                    {payment.completed_at ? `Completed ${new Date(payment.completed_at).toLocaleDateString()}` : "Not completed"}
                  </p>
                </div>

                <div>{statusChip(payment.status)}</div>
                <button
                  onClick={() => void handleGrantPro(payment)}
                  disabled={payment.status !== "completed" || actionLoadingFor === payment.id}
                  style={{
                    padding: "0.5rem 0.8rem",
                    borderRadius: "8px",
                    border: "none",
                    backgroundColor:
                      payment.status === "completed" && actionLoadingFor !== payment.id ? UI.accent : UI.border,
                    color:
                      payment.status === "completed" && actionLoadingFor !== payment.id ? "#FFFFFF" : UI.textMuted,
                    cursor:
                      payment.status === "completed" && actionLoadingFor !== payment.id ? "pointer" : "not-allowed",
                    fontSize: "0.8rem",
                    fontWeight: 600,
                  }}
                >
                  {actionLoadingFor === payment.id
                    ? "Granting..."
                    : payment.user_subscription_tier === "pro"
                      ? "Refresh Pro"
                      : "Grant Pro"}
                </button>
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

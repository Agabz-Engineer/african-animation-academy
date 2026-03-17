"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Mail,
  Plus,
  Search,
  Send,
  Users,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import { getAdminEmailCampaigns, sendAdminTestEmail } from "@/app/admin/actions";
import { getAdminActionAccessToken } from "@/lib/adminClientAuth";

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

type CampaignStatus = "draft" | "scheduled" | "sent" | "paused";

interface Campaign {
  id: string;
  title: string;
  audience: string;
  status: CampaignStatus;
  sendDate: string;
  openRate: number;
  clickRate: number;
  subject: string;
  message: string;
  sentTo: string[];
}

export default function EmailsPage() {
  const [theme] = useState<"dark" | "light">("dark");
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showComposer, setShowComposer] = useState(false);
  const [title, setTitle] = useState("");
  const [audience, setAudience] = useState("Admin test audience");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const UI = theme === "dark" ? DARK_UI : LIGHT_UI;

  const loadCampaigns = async () => {
    try {
      setLoading(true);
      const accessToken = await getAdminActionAccessToken();
      if (!accessToken) throw new Error("Admin access required.");
      const data = await getAdminEmailCampaigns(accessToken);
      setCampaigns(data || []);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load email campaigns.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadCampaigns();
  }, []);

  const filteredCampaigns = useMemo(() => {
    const q = searchTerm.toLowerCase();
    return campaigns.filter((campaign) => {
      const matchesStatus = statusFilter === "all" || campaign.status === statusFilter;
      const matchesSearch =
        !q ||
        campaign.title.toLowerCase().includes(q) ||
        campaign.audience.toLowerCase().includes(q) ||
        campaign.subject.toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [campaigns, searchTerm, statusFilter]);

  const statusChip = (status: CampaignStatus) => {
    const map = {
      sent: { color: UI.success, bg: `${UI.success}20`, label: "Sent", icon: CheckCircle },
      scheduled: { color: UI.warning, bg: `${UI.warning}20`, label: "Scheduled", icon: Clock },
      draft: { color: UI.info, bg: `${UI.info}20`, label: "Draft", icon: AlertTriangle },
      paused: { color: UI.danger, bg: `${UI.danger}20`, label: "Paused", icon: XCircle },
    } as const;
    const chipInfo = map[status];
    const Icon = chipInfo.icon;
    return (
      <span style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", padding: "0.2rem 0.6rem", borderRadius: "999px", backgroundColor: chipInfo.bg, color: chipInfo.color, fontSize: "0.72rem", fontWeight: 600 }}>
        <Icon style={{ width: "12px", height: "12px" }} />
        {chipInfo.label}
      </span>
    );
  };

  const handleSendTest = async () => {
    if (!subject.trim() || !message.trim()) {
      setError("Add a subject and message to send a test email.");
      return;
    }

    setSending(true);
    setError("");
    setInfo("");

    try {
      const accessToken = await getAdminActionAccessToken();
      if (!accessToken) throw new Error("Admin access required.");
      const result = await sendAdminTestEmail(accessToken, {
        title: title.trim() || subject.trim(),
        audience,
        subject,
        message,
      });
      setInfo(`Test email sent to ${result.sentTo} admin recipient(s).`);
      setTitle("");
      setSubject("");
      setMessage("");
      setAudience("Admin test audience");
      await loadCampaigns();
    } catch (sendError) {
      setError(sendError instanceof Error ? sendError.message : "Failed to send test email.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={{ fontFamily: "Inter, sans-serif" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
        <div>
          <h1 style={{ color: UI.text, fontSize: "2rem", fontWeight: 700, margin: "0 0 0.35rem 0" }}>Emails</h1>
          <p style={{ color: UI.textMuted, fontSize: "0.95rem", margin: 0 }}>
            Send admin test campaigns and review live campaign history.
          </p>
        </div>
        <button
          onClick={() => setShowComposer((prev) => !prev)}
          style={{ display: "flex", alignItems: "center", gap: "0.5rem", backgroundColor: UI.accent, border: "none", color: "#FFFFFF", padding: "0.55rem 0.95rem", borderRadius: "8px", cursor: "pointer", fontFamily: "Inter, sans-serif", fontSize: "0.85rem", fontWeight: 600 }}
        >
          <Plus style={{ width: "16px", height: "16px" }} />
          New Campaign
        </button>
      </div>

      {(error || info) && (
        <div style={{ marginBottom: "1rem", padding: "0.8rem 1rem", borderRadius: "10px", border: `1px solid ${(error ? UI.danger : UI.success)}55`, color: error ? UI.danger : UI.success, backgroundColor: error ? `${UI.danger}12` : `${UI.success}12` }}>
          {error || info}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
        <div style={{ backgroundColor: UI.card, border: `1px solid ${UI.border}`, borderRadius: "12px", padding: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
            <Mail style={{ width: "18px", height: "18px", color: UI.accent }} />
            <h3 style={{ margin: 0, color: UI.text, fontSize: "1rem", fontWeight: 600 }}>Live Campaign History</h3>
          </div>
          <p style={{ color: UI.textMuted, fontSize: "0.85rem", margin: 0 }}>
            Every test email sent from this page is stored in Supabase so the admin team can review activity.
          </p>
        </div>

        <div style={{ backgroundColor: UI.card, border: `1px solid ${UI.border}`, borderRadius: "12px", padding: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
            <Users style={{ width: "18px", height: "18px", color: UI.info }} />
            <h3 style={{ margin: 0, color: UI.text, fontSize: "1rem", fontWeight: 600 }}>Audience</h3>
          </div>
          <div style={{ display: "grid", gap: "0.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ color: UI.textMuted, fontSize: "0.85rem" }}>Admin notify emails</span>
              <span style={{ color: UI.text, fontWeight: 600 }}>Live</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ color: UI.textMuted, fontSize: "0.85rem" }}>SMTP delivery</span>
              <span style={{ color: UI.text, fontWeight: 600 }}>Configured</span>
            </div>
          </div>
        </div>
      </div>

      {showComposer && (
        <div style={{ backgroundColor: UI.card, border: `1px solid ${UI.border}`, borderRadius: "12px", padding: "1rem", marginBottom: "1.5rem" }}>
          <h3 style={{ margin: "0 0 0.75rem 0", color: UI.text, fontSize: "1rem", fontWeight: 600 }}>Quick Composer</h3>
          <div style={{ display: "grid", gap: "0.75rem" }}>
            <input type="text" placeholder="Campaign title" value={title} onChange={(event) => setTitle(event.target.value)} style={{ backgroundColor: UI.bg, border: `1px solid ${UI.border}`, borderRadius: "8px", padding: "0.55rem 0.75rem", color: UI.text, fontFamily: "Inter, sans-serif" }} />
            <input type="text" placeholder="Audience label" value={audience} onChange={(event) => setAudience(event.target.value)} style={{ backgroundColor: UI.bg, border: `1px solid ${UI.border}`, borderRadius: "8px", padding: "0.55rem 0.75rem", color: UI.text, fontFamily: "Inter, sans-serif" }} />
            <input type="text" placeholder="Subject line" value={subject} onChange={(event) => setSubject(event.target.value)} style={{ backgroundColor: UI.bg, border: `1px solid ${UI.border}`, borderRadius: "8px", padding: "0.55rem 0.75rem", color: UI.text, fontFamily: "Inter, sans-serif" }} />
            <textarea placeholder="Write a short update for your audience..." value={message} onChange={(event) => setMessage(event.target.value)} rows={4} style={{ backgroundColor: UI.bg, border: `1px solid ${UI.border}`, borderRadius: "8px", padding: "0.65rem 0.75rem", color: UI.text, fontFamily: "Inter, sans-serif", resize: "vertical" }} />
            <button onClick={handleSendTest} disabled={sending} style={{ display: "flex", alignItems: "center", gap: "0.5rem", alignSelf: "flex-start", backgroundColor: UI.accent, border: "none", color: "#FFFFFF", padding: "0.55rem 0.95rem", borderRadius: "8px", cursor: sending ? "wait" : "pointer", fontFamily: "Inter, sans-serif", fontSize: "0.85rem", fontWeight: 600, opacity: sending ? 0.7 : 1 }}>
              <Send style={{ width: "16px", height: "16px" }} />
              {sending ? "Sending..." : "Send Test"}
            </button>
          </div>
        </div>
      )}

      <div style={{ backgroundColor: UI.card, border: `1px solid ${UI.border}`, borderRadius: "12px", padding: "1rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem", flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", backgroundColor: UI.bg, border: `1px solid ${UI.border}`, borderRadius: "8px", padding: "0.45rem 0.75rem", flex: 1, minWidth: "220px" }}>
            <Search style={{ width: "16px", height: "16px", color: UI.textMuted }} />
            <input type="text" placeholder="Search campaigns..." value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} style={{ backgroundColor: "transparent", border: "none", outline: "none", color: UI.text, fontSize: "0.85rem", flex: 1, fontFamily: "Inter, sans-serif" }} />
          </div>
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} style={{ backgroundColor: UI.bg, border: `1px solid ${UI.border}`, borderRadius: "8px", padding: "0.45rem 0.75rem", color: UI.text, fontSize: "0.85rem", fontFamily: "Inter, sans-serif", outline: "none" }}>
            <option value="all">All Statuses</option>
            <option value="sent">Sent</option>
            <option value="scheduled">Scheduled</option>
            <option value="draft">Draft</option>
            <option value="paused">Paused</option>
          </select>
        </div>

        {loading ? (
          <p style={{ color: UI.textMuted, margin: 0 }}>Loading campaigns...</p>
        ) : filteredCampaigns.length === 0 ? (
          <p style={{ color: UI.textMuted, margin: 0 }}>No live campaigns found yet.</p>
        ) : (
          <div style={{ display: "grid", gap: "0.75rem" }}>
            {filteredCampaigns.map((campaign) => (
              <div key={campaign.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", padding: "0.85rem", borderRadius: "10px", border: `1px solid ${UI.border}`, backgroundColor: UI.bg, flexWrap: "wrap" }}>
                <div>
                  <p style={{ margin: 0, color: UI.text, fontWeight: 600 }}>{campaign.title}</p>
                  <p style={{ margin: 0, color: UI.textMuted, fontSize: "0.78rem" }}>{campaign.audience}</p>
                </div>

                <div style={{ minWidth: "160px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                    <Calendar style={{ width: "14px", height: "14px", color: UI.textMuted }} />
                    <span style={{ color: UI.textMuted, fontSize: "0.78rem" }}>{campaign.sendDate}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                    <Clock style={{ width: "14px", height: "14px", color: UI.textMuted }} />
                    <span style={{ color: UI.textMuted, fontSize: "0.78rem" }}>
                      Open {campaign.openRate}% | Click {campaign.clickRate}%
                    </span>
                  </div>
                </div>

                <div>{statusChip(campaign.status)}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

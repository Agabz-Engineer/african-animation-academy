"use client";

import { useEffect, useMemo, useState } from "react";
import { Clock3, FileText, Loader2, Search, Users2 } from "lucide-react";
import {
  getAdminStudioRequests,
  updateStudioRequestStatus,
} from "@/app/admin/actions";

type StudioRequestStatus =
  | "new"
  | "reviewing"
  | "shortlisting"
  | "matched"
  | "closed";

type StudioRequest = {
  id: string;
  studio_name: string;
  contact_name: string;
  contact_email: string;
  role_needed: string;
  animation_type: string;
  required_tools: string[] | null;
  experience_level: string;
  contract_type: string;
  timeline: string;
  budget_range: string;
  artists_needed: number;
  project_brief: string;
  status: StudioRequestStatus;
  admin_notes: string | null;
  created_at: string;
};

const UI = {
  bg: "#0F0F0F",
  card: "#1E1E1E",
  border: "#2A2A2A",
  text: "#FFFFFF",
  textMuted: "#A0A0A0",
  accent: "#FF8C00",
  success: "#10B981",
  warning: "#F59E0B",
  info: "#3B82F6",
};

const STATUS_OPTIONS: StudioRequestStatus[] = [
  "new",
  "reviewing",
  "shortlisting",
  "matched",
  "closed",
];

const STATUS_STYLES: Record<StudioRequestStatus, { color: string; bg: string }> = {
  new: { color: "#F59E0B", bg: "rgba(245,158,11,0.18)" },
  reviewing: { color: "#3B82F6", bg: "rgba(59,130,246,0.18)" },
  shortlisting: { color: "#8B5CF6", bg: "rgba(139,92,246,0.18)" },
  matched: { color: "#10B981", bg: "rgba(16,185,129,0.18)" },
  closed: { color: "#6B7280", bg: "rgba(107,114,128,0.18)" },
};

export default function AdminStudiosPage() {
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StudioRequestStatus | "all">("all");
  const [requests, setRequests] = useState<StudioRequest[]>([]);
  const [draftStatuses, setDraftStatuses] = useState<Record<string, StudioRequestStatus>>({});
  const [draftNotes, setDraftNotes] = useState<Record<string, string>>({});

  const fetchRequests = async () => {
    try {
      const data = (await getAdminStudioRequests()) as StudioRequest[];
      setRequests(data);
      setDraftStatuses(Object.fromEntries(data.map((item) => [item.id, item.status])));
      setDraftNotes(Object.fromEntries(data.map((item) => [item.id, item.admin_notes || ""])));
    } catch (error) {
      console.error("Error fetching studio requests:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchRequests();
  }, []);

  const filteredRequests = useMemo(() => {
    return requests.filter((request) => {
      const haystack = [
        request.studio_name,
        request.contact_name,
        request.contact_email,
        request.role_needed,
        request.animation_type,
        request.project_brief,
      ]
        .join(" ")
        .toLowerCase();

      return (
        haystack.includes(searchTerm.toLowerCase()) &&
        (statusFilter === "all" || request.status === statusFilter)
      );
    });
  }, [requests, searchTerm, statusFilter]);

  const stats = [
    {
      label: "Total briefs",
      value: requests.length,
      icon: FileText,
      color: UI.accent,
      bg: `${UI.accent}18`,
    },
    {
      label: "Open requests",
      value: requests.filter((request) => request.status !== "closed").length,
      icon: Clock3,
      color: UI.info,
      bg: `${UI.info}18`,
    },
    {
      label: "Matched",
      value: requests.filter((request) => request.status === "matched").length,
      icon: Users2,
      color: UI.success,
      bg: `${UI.success}18`,
    },
  ];

  const handleSave = async (requestId: string) => {
    try {
      setSavingId(requestId);
      await updateStudioRequestStatus(
        requestId,
        draftStatuses[requestId],
        draftNotes[requestId] || ""
      );
      await fetchRequests();
    } catch (error) {
      console.error("Failed to update studio request:", error);
      alert("Could not update this studio request right now.");
    } finally {
      setSavingId(null);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: "400px", display: "grid", placeItems: "center" }}>
        <Loader2 style={{ width: 32, height: 32, color: UI.accent, animation: "spin 1s linear infinite" }} />
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "Inter, sans-serif" }}>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ color: UI.text, fontSize: "2rem", fontWeight: 700, margin: "0 0 0.5rem 0" }}>
          Studio Requests
        </h1>
        <p style={{ color: UI.textMuted, fontSize: "1rem", margin: 0, maxWidth: 680 }}>
          Review the briefs studio accounts submit, move them through matching stages, and leave notes that flow back into their studio workspace.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
        {stats.map((card) => (
          <div key={card.label} style={{ backgroundColor: UI.card, border: `1px solid ${UI.border}`, borderRadius: "14px", padding: "1rem" }}>
            <div style={{ width: 46, height: 46, borderRadius: 12, backgroundColor: card.bg, color: card.color, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "0.85rem" }}>
              <card.icon style={{ width: 20, height: 20 }} />
            </div>
            <p style={{ margin: 0, color: UI.textMuted, fontSize: "0.85rem" }}>{card.label}</p>
            <p style={{ margin: "0.35rem 0 0", color: UI.text, fontSize: "1.8rem", fontWeight: 700 }}>{card.value}</p>
          </div>
        ))}
      </div>

      <div className="studio-admin-filter-grid" style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(210px, 220px)", gap: "0.85rem", marginBottom: "1.25rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", borderRadius: "14px", border: `1px solid ${UI.border}`, backgroundColor: UI.card, padding: "0.85rem 1rem" }}>
          <Search style={{ width: 18, height: 18, color: UI.textMuted }} />
          <input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search by studio, role, email, or brief..."
            style={{ width: "100%", border: "none", outline: "none", background: "transparent", color: UI.text, fontSize: "0.92rem" }}
          />
        </div>

        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value as StudioRequestStatus | "all")}
          style={selectStyle()}
        >
          <option value="all">All statuses</option>
          {STATUS_OPTIONS.map((status) => (
            <option key={status} value={status}>
              {capitalize(status)}
            </option>
          ))}
        </select>
      </div>

      <div style={{ display: "grid", gap: "1rem" }}>
        {filteredRequests.length === 0 ? (
          <div style={{ backgroundColor: UI.card, border: `1px solid ${UI.border}`, borderRadius: "16px", padding: "1.2rem", color: UI.textMuted }}>
            No studio requests match this filter yet.
          </div>
        ) : (
          filteredRequests.map((request) => {
            const badge = STATUS_STYLES[request.status];
            return (
              <div key={request.id} style={{ backgroundColor: UI.card, border: `1px solid ${UI.border}`, borderRadius: "18px", padding: "1.15rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem", flexWrap: "wrap" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", flexWrap: "wrap" }}>
                      <h2 style={{ margin: 0, color: UI.text, fontSize: "1.15rem", fontWeight: 700 }}>
                        {request.role_needed}
                      </h2>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", padding: "0.3rem 0.7rem", borderRadius: "999px", backgroundColor: badge.bg, color: badge.color, fontSize: "0.76rem", fontWeight: 700 }}>
                        <Clock3 style={{ width: 12, height: 12 }} />
                        {capitalize(request.status)}
                      </span>
                    </div>
                    <p style={{ margin: "0.45rem 0 0", color: UI.textMuted, fontSize: "0.9rem" }}>
                      {request.studio_name} • {request.contact_name} • {request.contact_email}
                    </p>
                  </div>

                  <div style={{ borderRadius: "14px", border: `1px solid ${UI.border}`, backgroundColor: `${UI.border}40`, padding: "0.75rem 0.9rem", minWidth: "180px" }}>
                    <p style={{ margin: 0, color: UI.textMuted, fontSize: "0.76rem" }}>Submitted</p>
                    <p style={{ margin: "0.32rem 0 0", color: UI.text, fontSize: "0.92rem", fontWeight: 600 }}>
                      {formatDate(request.created_at)}
                    </p>
                  </div>
                </div>

                <div style={{ marginTop: "1rem", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "0.75rem" }}>
                  <InfoTile label="Animation type" value={request.animation_type} />
                  <InfoTile label="Experience" value={request.experience_level} />
                  <InfoTile label="Contract" value={request.contract_type} />
                  <InfoTile label="Artists needed" value={String(request.artists_needed)} />
                  <InfoTile label="Timeline" value={request.timeline} />
                  <InfoTile label="Budget" value={request.budget_range} />
                </div>

                <div style={{ marginTop: "1rem", borderRadius: "16px", border: `1px solid ${UI.border}`, backgroundColor: `${UI.border}30`, padding: "0.95rem" }}>
                  <p style={{ margin: 0, color: UI.textMuted, fontSize: "0.76rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                    Project brief
                  </p>
                  <p style={{ margin: "0.55rem 0 0", color: UI.text, lineHeight: 1.65, fontSize: "0.92rem" }}>
                    {request.project_brief}
                  </p>
                </div>

                {(request.required_tools || []).length > 0 ? (
                  <div style={{ marginTop: "0.85rem", display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                    {(request.required_tools || []).map((tool) => (
                      <span key={tool} style={{ padding: "0.32rem 0.65rem", borderRadius: "999px", border: `1px solid ${UI.border}`, color: UI.textMuted, fontSize: "0.76rem" }}>
                        {tool}
                      </span>
                    ))}
                  </div>
                ) : null}

                <div className="studio-admin-editor-grid" style={{ marginTop: "1rem", display: "grid", gridTemplateColumns: "minmax(180px, 220px) minmax(0, 1fr) auto", gap: "0.85rem", alignItems: "start" }}>
                  <div>
                    <label style={labelStyle()}>Status</label>
                    <select
                      value={draftStatuses[request.id] || request.status}
                      onChange={(event) =>
                        setDraftStatuses((current) => ({
                          ...current,
                          [request.id]: event.target.value as StudioRequestStatus,
                        }))
                      }
                      style={selectStyle()}
                    >
                      {STATUS_OPTIONS.map((status) => (
                        <option key={status} value={status}>
                          {capitalize(status)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={labelStyle()}>Admin notes</label>
                    <textarea
                      rows={4}
                      value={draftNotes[request.id] || ""}
                      onChange={(event) =>
                        setDraftNotes((current) => ({
                          ...current,
                          [request.id]: event.target.value,
                        }))
                      }
                      placeholder="Leave context for the studio team here..."
                      style={textareaStyle()}
                    />
                  </div>

                  <button
                    type="button"
                    disabled={savingId === request.id}
                    onClick={() => void handleSave(request.id)}
                    style={{ border: "none", cursor: savingId === request.id ? "wait" : "pointer", borderRadius: "12px", backgroundColor: UI.accent, color: "#fff", padding: "0.88rem 1rem", fontWeight: 700, marginTop: "1.55rem", minWidth: "110px" }}
                  >
                    {savingId === request.id ? "Saving..." : "Save"}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      <style jsx global>{`
        @media (max-width: 860px) {
          .studio-admin-filter-grid,
          .studio-admin-editor-grid {
            grid-template-columns: minmax(0, 1fr) !important;
          }
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ borderRadius: "14px", border: `1px solid ${UI.border}`, backgroundColor: `${UI.border}30`, padding: "0.8rem 0.85rem" }}>
      <p style={{ margin: 0, color: UI.textMuted, fontSize: "0.74rem" }}>{label}</p>
      <p style={{ margin: "0.35rem 0 0", color: UI.text, fontSize: "0.9rem", fontWeight: 600 }}>{value}</p>
    </div>
  );
}

function labelStyle() {
  return { display: "block", marginBottom: "0.45rem", color: UI.textMuted, fontSize: "0.8rem" };
}

function selectStyle() {
  return {
    width: "100%",
    borderRadius: "12px",
    border: `1px solid ${UI.border}`,
    backgroundColor: UI.card,
    color: UI.text,
    padding: "0.78rem 0.9rem",
    outline: "none",
  };
}

function textareaStyle() {
  return {
    width: "100%",
    borderRadius: "12px",
    border: `1px solid ${UI.border}`,
    backgroundColor: UI.card,
    color: UI.text,
    padding: "0.78rem 0.9rem",
    outline: "none",
    resize: "vertical" as const,
    minHeight: "110px",
    fontFamily: "Inter, sans-serif",
  };
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== new Date().getFullYear() ? "numeric" : undefined,
  });
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

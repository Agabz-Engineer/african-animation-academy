"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Briefcase,
  CheckCircle2,
  Clock3,
  Layers3,
  Loader2,
  Search,
  Sparkles,
  Trophy,
  Users2,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useThemeMode } from "@/lib/useThemeMode";
import { isStudioAccount } from "@/lib/accountRouting";

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

type FormState = {
  studioName: string;
  contactName: string;
  contactEmail: string;
  roleNeeded: string;
  animationType: string;
  requiredTools: string;
  experienceLevel: string;
  contractType: string;
  timeline: string;
  budgetRange: string;
  artistsNeeded: string;
  projectBrief: string;
};

const DARK = {
  bg: "#171411",
  card: "#221d19",
  cardSoft: "#2a231f",
  border: "rgba(255,255,255,0.08)",
  text: "#faf3e1",
  muted: "#d2c9b8",
  dim: "#9e9688",
  accent: "#ff6d1f",
  accentSoft: "rgba(255,109,31,0.12)",
  accentGlow: "rgba(255,109,31,0.22)",
  success: "#6cc08a",
};

const LIGHT = {
  bg: "#f8f1df",
  card: "#fffaf2",
  cardSoft: "#f2e6cf",
  border: "rgba(34,34,34,0.08)",
  text: "#222222",
  muted: "#5d5649",
  dim: "#8e8474",
  accent: "#ff6d1f",
  accentSoft: "rgba(255,109,31,0.11)",
  accentGlow: "rgba(255,109,31,0.18)",
  success: "#20744f",
};

const STEPS = [
  { title: "Share the brief", body: "Tell us the role, timeline, and style you need.", icon: Briefcase },
  { title: "We shortlist talent", body: "We filter promising animators on the platform for fit and readiness.", icon: Search },
  { title: "Meet the right people", body: "You review curated talent instead of sorting through everyone yourself.", icon: Users2 },
];

const TALENT_LANES = [
  "2D character animation",
  "3D animation",
  "Storyboarding",
  "Character design",
  "Background art",
  "Rigging",
  "Motion design",
  "Compositing and editing",
];

const STATUS_META: Record<StudioRequestStatus, { label: string; color: string; bg: string }> = {
  new: { label: "New", color: "#F59E0B", bg: "rgba(245,158,11,0.15)" },
  reviewing: { label: "Reviewing", color: "#3B82F6", bg: "rgba(59,130,246,0.15)" },
  shortlisting: { label: "Shortlisting", color: "#8B5CF6", bg: "rgba(139,92,246,0.16)" },
  matched: { label: "Matched", color: "#10B981", bg: "rgba(16,185,129,0.16)" },
  closed: { label: "Closed", color: "#6B7280", bg: "rgba(107,114,128,0.16)" },
};

const INITIAL_FORM: FormState = {
  studioName: "",
  contactName: "",
  contactEmail: "",
  roleNeeded: "",
  animationType: "2D character animation",
  requiredTools: "",
  experienceLevel: "Junior to mid-level",
  contractType: "Project-based",
  timeline: "",
  budgetRange: "",
  artistsNeeded: "1",
  projectBrief: "",
};

export default function StudioPage() {
  const router = useRouter();
  const theme = useThemeMode();
  const T = theme === "dark" ? DARK : LIGHT;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [requests, setRequests] = useState<StudioRequest[]>([]);

  const activeRequests = useMemo(
    () => requests.filter((request) => request.status !== "closed").length,
    [requests]
  );

  const fetchRequests = useCallback(async (userId: string) => {
    if (!supabase) return;
    const { data, error: requestError } = await supabase
      .from("studio_requests")
      .select("*")
      .eq("studio_id", userId)
      .order("created_at", { ascending: false });

    if (requestError) throw requestError;
    setRequests((data || []) as StudioRequest[]);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        if (!supabase) throw new Error("Supabase is not configured.");

        const { data, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;
        const user = data.user;

        if (!user) {
          router.replace("/login?next=%2Fstudio");
          return;
        }

        const accountType = user.user_metadata?.account_type as "animator" | "studio" | undefined;
        if (!isStudioAccount(accountType)) {
          router.replace("/dashboard");
          return;
        }

        const name =
          typeof user.user_metadata?.full_name === "string"
            ? user.user_metadata.full_name
            : "";

        if (!cancelled) {
          setForm((current) => ({
            ...current,
            studioName: current.studioName || name,
            contactName: current.contactName || name,
            contactEmail: current.contactEmail || user.email || "",
          }));
        }

        await fetchRequests(user.id);
      } catch (loadError) {
        console.error("Failed to load studio workspace", loadError);
        if (!cancelled) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Unable to load the studio workspace."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [fetchRequests, router]);

  const updateField = (field: keyof FormState, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      if (!supabase) throw new Error("Supabase is not configured.");
      const { data, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!data.user) throw new Error("Please sign in again to continue.");

      const tools = form.requiredTools
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

      const { error: insertError } = await supabase.from("studio_requests").insert({
        studio_id: data.user.id,
        studio_name: form.studioName.trim(),
        contact_name: form.contactName.trim(),
        contact_email: form.contactEmail.trim(),
        role_needed: form.roleNeeded.trim(),
        animation_type: form.animationType,
        required_tools: tools,
        experience_level: form.experienceLevel,
        contract_type: form.contractType,
        timeline: form.timeline.trim(),
        budget_range: form.budgetRange.trim(),
        artists_needed: Math.max(1, Number(form.artistsNeeded || 1)),
        project_brief: form.projectBrief.trim(),
      });

      if (insertError) throw insertError;

      await fetchRequests(data.user.id);
      setSuccess("Studio brief sent. It is now available in admin for review.");
      setForm((current) => ({
        ...INITIAL_FORM,
        studioName: current.studioName,
        contactName: current.contactName,
        contactEmail: current.contactEmail,
      }));
    } catch (submitError) {
      console.error("Failed to submit studio request", submitError);
      setError(
        submitError instanceof Error
          ? submitError.message
          : "We could not submit your studio brief."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", color: T.text }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem" }}>
          <Loader2 style={{ width: 30, height: 30, color: T.accent, animation: "spin 1s linear infinite" }} />
          <p style={{ margin: 0, color: T.muted, fontFamily: "'General Sans', sans-serif" }}>
            Loading your studio workspace...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "1rem 1rem 2rem",
        background:
          theme === "dark"
            ? "radial-gradient(circle at top right, rgba(255,109,31,0.14), transparent 28%), #171411"
            : "radial-gradient(circle at top right, rgba(255,109,31,0.11), transparent 28%), #f8f1df",
        color: T.text,
      }}
    >
      <div className="studio-shell" style={{ width: "100%", maxWidth: 1180, margin: "0 auto", display: "grid", gap: "1rem" }}>
        <section style={card(T, theme, true)}>
          <div className="studio-hero-grid">
            <div>
              <div style={pill(T)}>
                <Sparkles style={{ width: 14, height: 14 }} />
                Studio desk
              </div>
              <h1 style={{ margin: "0.95rem 0 0.75rem", fontFamily: "'Clash Display', sans-serif", fontSize: "clamp(2rem, 5vw, 3.4rem)", lineHeight: 1.02, letterSpacing: "-0.04em" }}>
                Find the right African animation talent through us.
              </h1>
              <p style={{ margin: 0, maxWidth: 620, color: T.muted, lineHeight: 1.7, fontSize: "0.98rem", fontFamily: "'General Sans', sans-serif" }}>
                This workspace is built for studio briefs, not random browsing. Share the kind of animator you need and we will review, shortlist, and connect you to strong upcoming talent from the platform.
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", marginTop: "1.25rem" }}>
                <a href="#studio-request-form" style={{ ...cta(T), textDecoration: "none" }}>
                  Submit talent request
                  <ArrowRight style={{ width: 15, height: 15 }} />
                </a>
                <Link
                  href="/community/leaderboard"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.55rem",
                    borderRadius: 14,
                    border: `1px solid ${T.border}`,
                    backgroundColor: T.cardSoft,
                    color: T.text,
                    padding: "0.82rem 1rem",
                    fontSize: "0.9rem",
                    fontFamily: "'General Sans', sans-serif",
                    textDecoration: "none",
                    fontWeight: 600,
                  }}
                >
                  <Trophy style={{ width: 15, height: 15, color: T.accent }} />
                  Open talent board
                </Link>
                <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", borderRadius: 14, border: `1px solid ${T.border}`, backgroundColor: T.cardSoft, color: T.muted, padding: "0.82rem 1rem", fontSize: "0.9rem", fontFamily: "'General Sans', sans-serif" }}>
                  <Clock3 style={{ width: 15, height: 15, color: T.accent }} />
                  {activeRequests} active request{activeRequests === 1 ? "" : "s"}
                </div>
              </div>
            </div>

            <div style={{ borderRadius: 24, border: `1px solid ${T.border}`, background: theme === "dark" ? "linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,109,31,0.08))" : "linear-gradient(180deg, rgba(255,255,255,0.65), rgba(255,109,31,0.08))", padding: "1rem", display: "grid", gap: "0.75rem" }}>
              {[
                { label: "Requests sent", value: String(requests.length) },
                { label: "Talent lanes", value: "8" },
                { label: "Matching style", value: "Curated" },
              ].map((item) => (
                <div key={item.label} style={{ borderRadius: 18, padding: "0.9rem 1rem", backgroundColor: theme === "dark" ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.7)", border: `1px solid ${T.border}` }}>
                  <p style={{ margin: 0, fontSize: "0.76rem", letterSpacing: "0.06em", textTransform: "uppercase", color: T.dim, fontFamily: "'General Sans', sans-serif" }}>{item.label}</p>
                  <p style={{ margin: "0.42rem 0 0", fontSize: "1.35rem", fontWeight: 700, fontFamily: "'Clash Display', sans-serif" }}>{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="studio-two-col">
          <div style={card(T, theme)}>
            <p style={eyebrow(T)}>How it works</p>
            <div style={{ marginTop: "0.9rem", display: "grid", gap: "0.8rem" }}>
              {STEPS.map((step, index) => (
                <div key={step.title} style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "0.9rem", alignItems: "start", padding: "0.9rem", borderRadius: 18, backgroundColor: T.cardSoft, border: `1px solid ${T.border}` }}>
                  <div style={{ width: 42, height: 42, borderRadius: 14, display: "grid", placeItems: "center", backgroundColor: T.accentSoft, color: T.accent }}>
                    <step.icon style={{ width: 18, height: 18 }} />
                  </div>
                  <div>
                    <p style={{ margin: 0, fontFamily: "'Clash Display', sans-serif", fontSize: "1rem" }}>{index + 1}. {step.title}</p>
                    <p style={{ margin: "0.38rem 0 0", color: T.muted, fontSize: "0.9rem", lineHeight: 1.6, fontFamily: "'General Sans', sans-serif" }}>{step.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

	          <div style={card(T, theme)}>
	            <p style={eyebrow(T)}>Talent lanes</p>
	            <div className="studio-lanes-grid" style={{ marginTop: "0.9rem" }}>
	              {TALENT_LANES.map((lane) => (
	                <div key={lane} style={{ borderRadius: 18, border: `1px solid ${T.border}`, backgroundColor: T.cardSoft, padding: "0.9rem" }}>
                  <Layers3 style={{ width: 18, height: 18, color: T.accent }} />
                  <p style={{ margin: "0.6rem 0 0", fontSize: "0.92rem", lineHeight: 1.4, fontFamily: "'General Sans', sans-serif" }}>{lane}</p>
	                </div>
	              ))}
	            </div>
              <Link
                href="/community/leaderboard"
                style={{
                  marginTop: "1rem",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.55rem",
                  textDecoration: "none",
                  color: T.accent,
                  fontSize: "0.9rem",
                  fontWeight: 700,
                  fontFamily: "'General Sans', sans-serif",
                }}
              >
                <Trophy style={{ width: 15, height: 15 }} />
	                Review this week&apos;s standout creators
              </Link>
	          </div>
	        </section>

        <section className="studio-two-col" style={{ alignItems: "start" }}>
          <form id="studio-request-form" onSubmit={handleSubmit} style={{ ...card(T, theme), display: "grid", gap: "0.9rem" }}>
            <div>
              <p style={eyebrow(T)}>Submit request</p>
              <h2 style={{ margin: "0.5rem 0 0", fontFamily: "'Clash Display', sans-serif", fontSize: "1.45rem", lineHeight: 1.05 }}>
                Tell us who you need.
              </h2>
            </div>

            {error ? <MessageBox kind="error" text={error} T={T} /> : null}
            {success ? <MessageBox kind="success" text={success} T={T} /> : null}

            <div className="studio-form-grid">
              <Field label="Studio name" value={form.studioName} onChange={(value) => updateField("studioName", value)} placeholder="Your studio or team name" T={T} />
              <Field label="Contact name" value={form.contactName} onChange={(value) => updateField("contactName", value)} placeholder="Who should we contact?" T={T} />
              <Field label="Contact email" type="email" value={form.contactEmail} onChange={(value) => updateField("contactEmail", value)} placeholder="team@studio.com" T={T} />
              <Field label="Role needed" value={form.roleNeeded} onChange={(value) => updateField("roleNeeded", value)} placeholder="Example: 2D Character Animator" T={T} />
              <SelectField label="Animation type" value={form.animationType} onChange={(value) => updateField("animationType", value)} options={TALENT_LANES} T={T} />
              <SelectField label="Experience level" value={form.experienceLevel} onChange={(value) => updateField("experienceLevel", value)} options={["Junior to mid-level", "Mid-level", "Senior", "Mixed team"]} T={T} />
              <SelectField label="Contract type" value={form.contractType} onChange={(value) => updateField("contractType", value)} options={["Project-based", "Freelance retainer", "Short-term contract", "Full-time hire"]} T={T} />
              <Field label="Artists needed" type="number" min="1" value={form.artistsNeeded} onChange={(value) => updateField("artistsNeeded", value)} placeholder="1" T={T} />
              <Field label="Timeline" value={form.timeline} onChange={(value) => updateField("timeline", value)} placeholder="Example: 6 weeks" T={T} />
              <Field label="Budget range" value={form.budgetRange} onChange={(value) => updateField("budgetRange", value)} placeholder="Example: GH₵ 6,000 - GH₵ 12,000" T={T} />
            </div>

            <Field label="Preferred tools" value={form.requiredTools} onChange={(value) => updateField("requiredTools", value)} placeholder="Toon Boom, Blender, Moho, After Effects" helper="Separate tools with commas." T={T} />

            <div>
              <label style={labelStyle(T)}>Project brief</label>
              <textarea value={form.projectBrief} onChange={(event) => updateField("projectBrief", event.target.value)} placeholder="Tell us the production style, expected deliverables, and the creative fit you need." required rows={6} style={inputStyle(T, true)} />
            </div>

            <button type="submit" disabled={saving} style={{ ...cta(T), justifySelf: "start", border: "none", opacity: saving ? 0.8 : 1, cursor: saving ? "wait" : "pointer" }}>
              {saving ? <Loader2 style={{ width: 16, height: 16, animation: "spin 1s linear infinite" }} /> : <CheckCircle2 style={{ width: 16, height: 16 }} />}
              {saving ? "Sending request..." : "Send studio brief"}
            </button>
          </form>

          <div style={card(T, theme)}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.75rem", flexWrap: "wrap" }}>
              <div>
                <p style={eyebrow(T)}>Request status</p>
                <h2 style={{ margin: "0.5rem 0 0", fontFamily: "'Clash Display', sans-serif", fontSize: "1.45rem", lineHeight: 1.05 }}>
                  Your active briefs.
                </h2>
              </div>
              <div style={{ borderRadius: 14, border: `1px solid ${T.border}`, backgroundColor: T.cardSoft, padding: "0.75rem 0.9rem", minWidth: 120 }}>
                <p style={{ margin: 0, color: T.dim, fontSize: "0.74rem", fontFamily: "'General Sans', sans-serif" }}>Total requests</p>
                <p style={{ margin: "0.28rem 0 0", fontSize: "1.4rem", fontWeight: 700 }}>{requests.length}</p>
              </div>
            </div>

            <div style={{ marginTop: "1rem", display: "grid", gap: "0.75rem" }}>
              {requests.length === 0 ? (
                <div style={{ borderRadius: 18, border: `1px dashed ${T.border}`, padding: "1rem", color: T.muted, fontFamily: "'General Sans', sans-serif", lineHeight: 1.7 }}>
                  Your studio requests will appear here once you submit a brief. This is where you will see whether it is new, under review, shortlisting, or matched.
                </div>
              ) : (
                requests.map((request) => {
                  const statusMeta = STATUS_META[request.status];
                  return (
                    <div key={request.id} style={{ borderRadius: 18, border: `1px solid ${T.border}`, backgroundColor: T.cardSoft, padding: "1rem" }}>
                      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "0.75rem", flexWrap: "wrap" }}>
                        <div>
                          <p style={{ margin: 0, fontFamily: "'Clash Display', sans-serif", fontSize: "1rem" }}>{request.role_needed}</p>
                          <p style={{ margin: "0.32rem 0 0", color: T.muted, fontSize: "0.85rem", fontFamily: "'General Sans', sans-serif" }}>
                            {request.animation_type} • {request.artists_needed} artist{request.artists_needed === 1 ? "" : "s"} • {request.timeline}
                          </p>
                        </div>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", padding: "0.42rem 0.72rem", borderRadius: 999, backgroundColor: statusMeta.bg, color: statusMeta.color, fontSize: "0.78rem", fontWeight: 700, fontFamily: "'General Sans', sans-serif" }}>
                          <Clock3 style={{ width: 13, height: 13 }} />
                          {statusMeta.label}
                        </span>
                      </div>

                      <p style={{ margin: "0.8rem 0 0", color: T.muted, fontSize: "0.9rem", lineHeight: 1.65, fontFamily: "'General Sans', sans-serif" }}>
                        {request.project_brief}
                      </p>

                      <div style={{ marginTop: "0.85rem", display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                        {(request.required_tools || []).map((tool) => (
                          <span key={tool} style={{ borderRadius: 999, border: `1px solid ${T.border}`, backgroundColor: theme === "dark" ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.7)", padding: "0.32rem 0.62rem", fontSize: "0.76rem", color: T.dim, fontFamily: "'General Sans', sans-serif" }}>
                            {tool}
                          </span>
                        ))}
                      </div>

                      {request.admin_notes ? (
                        <div style={{ marginTop: "0.9rem", borderRadius: 14, border: `1px solid ${T.border}`, backgroundColor: theme === "dark" ? "rgba(255,255,255,0.025)" : "rgba(255,255,255,0.72)", padding: "0.85rem 0.9rem" }}>
                          <p style={{ margin: 0, color: T.dim, fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "'General Sans', sans-serif" }}>Admin note</p>
                          <p style={{ margin: "0.4rem 0 0", color: T.muted, fontSize: "0.86rem", lineHeight: 1.6, fontFamily: "'General Sans', sans-serif" }}>{request.admin_notes}</p>
                        </div>
                      ) : null}

                      <p style={{ margin: "0.85rem 0 0", color: T.dim, fontSize: "0.76rem", fontFamily: "'General Sans', sans-serif" }}>
                        Submitted {formatDate(request.created_at)}
                      </p>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </section>
      </div>

      <style jsx global>{`
        .studio-hero-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.45fr) minmax(280px, 0.8fr);
          gap: 1rem;
        }
        .studio-two-col {
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(320px, 0.92fr);
          gap: 1rem;
        }
        .studio-form-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 0.9rem;
        }
        .studio-lanes-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 0.8rem;
        }
        @media (max-width: 1023px) {
          .studio-hero-grid,
          .studio-two-col,
          .studio-form-grid,
          .studio-lanes-grid {
            grid-template-columns: minmax(0, 1fr);
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

function card(T: typeof DARK, theme: "dark" | "light", glow = false) {
  return {
    border: `1px solid ${T.border}`,
    backgroundColor: T.card,
    borderRadius: 24,
    padding: "1.1rem",
    boxShadow: glow ? `0 24px 60px ${T.accentGlow}` : "none",
  };
}

function pill(T: typeof DARK) {
  return {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.45rem",
    padding: "0.42rem 0.78rem",
    borderRadius: 999,
    backgroundColor: T.accentSoft,
    color: T.accent,
    fontSize: "0.78rem",
    fontWeight: 600,
    fontFamily: "'General Sans', sans-serif",
  };
}

function cta(T: typeof DARK) {
  return {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.55rem",
    borderRadius: 14,
    backgroundColor: T.accent,
    color: "#fff",
    padding: "0.88rem 1.05rem",
    fontSize: "0.92rem",
    fontWeight: 700,
    fontFamily: "'General Sans', sans-serif",
  };
}

function eyebrow(T: typeof DARK) {
  return {
    margin: 0,
    color: T.dim,
    fontSize: "0.78rem",
    textTransform: "uppercase" as const,
    letterSpacing: "0.08em",
    fontFamily: "'General Sans', sans-serif",
  };
}

function labelStyle(T: typeof DARK) {
  return {
    display: "block",
    marginBottom: "0.45rem",
    color: T.muted,
    fontSize: "0.84rem",
    fontWeight: 600,
    fontFamily: "'General Sans', sans-serif",
  };
}

function inputStyle(T: typeof DARK, multiline = false) {
  return {
    width: "100%",
    borderRadius: 16,
    border: `1px solid ${T.border}`,
    backgroundColor: T.cardSoft,
    color: T.text,
    padding: multiline ? "0.95rem 1rem" : "0.82rem 1rem",
    fontSize: "0.92rem",
    lineHeight: 1.5,
    resize: multiline ? ("vertical" as const) : ("none" as const),
    outline: "none",
    fontFamily: "'General Sans', sans-serif",
  };
}

function MessageBox({ kind, text, T }: { kind: "error" | "success"; text: string; T: typeof DARK }) {
  const border = kind === "error" ? "rgba(239,68,68,0.25)" : `${T.success}33`;
  const bg = kind === "error" ? "rgba(239,68,68,0.1)" : `${T.success}16`;
  const color = kind === "error" ? "#ef4444" : T.success;

  return (
    <div style={{ borderRadius: 16, border: `1px solid ${border}`, backgroundColor: bg, color, padding: "0.9rem 1rem", fontSize: "0.9rem", fontFamily: "'General Sans', sans-serif" }}>
      {text}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  T,
  type = "text",
  min,
  helper,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  T: typeof DARK;
  type?: string;
  min?: string;
  helper?: string;
}) {
  return (
    <div>
      <label style={labelStyle(T)}>{label}</label>
      <input type={type} min={min} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} required style={inputStyle(T)} />
      {helper ? <p style={{ margin: "0.4rem 0 0", color: T.dim, fontSize: "0.75rem", fontFamily: "'General Sans', sans-serif" }}>{helper}</p> : null}
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
  T,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  T: typeof DARK;
}) {
  return (
    <div>
      <label style={labelStyle(T)}>{label}</label>
      <select value={value} onChange={(event) => onChange(event.target.value)} style={inputStyle(T)}>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "recently";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== new Date().getFullYear() ? "numeric" : undefined,
  });
}

"use client";

import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  Flame,
  Heart,
  MessageCircle,
  Sparkles,
  Trophy,
  Users,
} from "lucide-react";
import { useThemeMode } from "@/lib/useThemeMode";
import type { LeaderboardEntry } from "./page";

type LeaderboardScreenProps = {
  entries: LeaderboardEntry[];
  periodLabel: string;
  state: "live" | "empty" | "unavailable";
  note?: string;
};

const DARK = {
  pageBg: "#222222",
  pageGlowA: "rgba(255,109,31,0.18)",
  pageGlowB: "rgba(255,109,31,0.10)",
  panel: "rgba(44, 44, 44, 0.92)",
  panelSoft: "rgba(44, 44, 44, 0.76)",
  border: "rgba(255,255,255,0.10)",
  text: "#FAF3E1",
  muted: "#D2C9B8",
  dim: "#9E9688",
  accent: "#FF6D1F",
  accentSoft: "rgba(255,109,31,0.15)",
  chip: "rgba(255,255,255,0.06)",
};

const LIGHT = {
  pageBg: "#FAF3E1",
  pageGlowA: "rgba(255,109,31,0.12)",
  pageGlowB: "rgba(255,109,31,0.16)",
  panel: "rgba(255,255,255,0.90)",
  panelSoft: "rgba(255,255,255,0.78)",
  border: "rgba(34,34,34,0.10)",
  text: "#222222",
  muted: "#555555",
  dim: "#9E9688",
  accent: "#FF6D1F",
  accentSoft: "rgba(255,109,31,0.10)",
  chip: "rgba(0,0,0,0.045)",
};

const RANK_ACCENTS = ["#F59E0B", "#C0C4CC", "#C97A43"] as const;

function Metric({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div
      style={{
        borderRadius: "12px",
        border: `1px solid ${color}33`,
        backgroundColor: `${color}14`,
        padding: "0.72rem 0.78rem",
        display: "flex",
        alignItems: "center",
        gap: "0.65rem",
      }}
    >
      <div
        style={{
          width: "34px",
          height: "34px",
          borderRadius: "10px",
          display: "grid",
          placeItems: "center",
          backgroundColor: `${color}1f`,
          color,
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <div>
        <p
          style={{
            margin: 0,
            fontSize: "0.72rem",
            color: "inherit",
            opacity: 0.82,
            fontFamily: "'Satoshi', sans-serif",
          }}
        >
          {label}
        </p>
        <p
          style={{
            margin: "0.08rem 0 0",
            fontSize: "0.96rem",
            fontWeight: 700,
            fontFamily: "'Cabinet Grotesk', sans-serif",
          }}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

export default function LeaderboardScreen({
  entries,
  periodLabel,
  state,
  note,
}: LeaderboardScreenProps) {
  const themeMode = useThemeMode();
  const T = themeMode === "dark" ? DARK : LIGHT;

  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: T.pageBg,
        color: T.text,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          background: `
            radial-gradient(circle at 12% 18%, ${T.pageGlowA}, transparent 28%),
            radial-gradient(circle at 84% 10%, ${T.pageGlowB}, transparent 26%)
          `,
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          width: "100%",
          maxWidth: "1120px",
          margin: "0 auto",
          padding: "2rem 1.1rem 3rem",
          position: "relative",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap", marginBottom: "1.4rem" }}>
          <Link
            href="/community"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              textDecoration: "none",
              color: T.text,
              border: `1px solid ${T.border}`,
              backgroundColor: T.panelSoft,
              borderRadius: "999px",
              padding: "0.72rem 0.95rem",
              fontFamily: "'Satoshi', sans-serif",
              fontSize: "0.84rem",
            }}
          >
            <ArrowLeft style={{ width: "14px", height: "14px" }} />
            Back to community
          </Link>

          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              borderRadius: "999px",
              padding: "0.72rem 0.95rem",
              border: `1px solid ${T.border}`,
              backgroundColor: T.panelSoft,
              color: T.muted,
              fontSize: "0.84rem",
              fontFamily: "'Satoshi', sans-serif",
            }}
          >
            <CalendarDays style={{ width: "14px", height: "14px", color: T.accent }} />
            {periodLabel}
          </div>
        </div>

        <section
          style={{
            border: `1px solid ${T.border}`,
            borderRadius: "28px",
            background: T.panel,
            padding: "1.3rem",
            boxShadow: "0 18px 40px rgba(0,0,0,0.14)",
            marginBottom: "1.2rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.7rem", marginBottom: "0.9rem" }}>
            <div
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "14px",
                display: "grid",
                placeItems: "center",
                backgroundColor: T.accentSoft,
                color: T.accent,
                flexShrink: 0,
              }}
            >
              <Trophy style={{ width: "20px", height: "20px" }} />
            </div>
            <div>
              <p
                style={{
                  margin: 0,
                  color: T.accent,
                  fontSize: "0.76rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  fontWeight: 700,
                  fontFamily: "'Satoshi', sans-serif",
                }}
              >
                Weekly Standout Creators
              </p>
              <h1
                style={{
                  margin: "0.15rem 0 0.25rem",
                  fontFamily: "'Clash Display', sans-serif",
                  fontSize: "clamp(2rem, 5vw, 3.4rem)",
                  lineHeight: 0.96,
                }}
              >
                Top 3 most engaging animators this week
              </h1>
              <p
                style={{
                  margin: 0,
                  maxWidth: "720px",
                  color: T.muted,
                  fontSize: "1rem",
                  lineHeight: 1.6,
                  fontFamily: "'Satoshi', sans-serif",
                }}
              >
                This board is calculated from approved community activity over the last 7 days.
                Score is based on post volume, likes received, and comment engagement.
              </p>
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
              gap: "0.75rem",
              color: T.text,
            }}
          >
            <Metric icon={<Sparkles style={{ width: "16px", height: "16px" }} />} label="Board size" value={`${entries.length}/3 creators`} color={T.accent} />
            <Metric icon={<Flame style={{ width: "16px", height: "16px" }} />} label="Ranking window" value="Last 7 days" color="#F59E0B" />
            <Metric icon={<Heart style={{ width: "16px", height: "16px" }} />} label="Signals counted" value="Posts, likes, comments" color="#E86B7C" />
            <Metric icon={<Users style={{ width: "16px", height: "16px" }} />} label="Eligible accounts" value="Animators only" color="#22C55E" />
          </div>
        </section>

        {entries.length > 0 ? (
          <section
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "1rem",
            }}
          >
            {entries.map((entry, index) => {
              const accent = RANK_ACCENTS[index] || T.accent;
              const initial = entry.name.trim().charAt(0).toUpperCase() || "A";
              const highlightRank = index === 0;

              return (
                <article
                  key={entry.userId}
                  style={{
                    borderRadius: "24px",
                    border: `1px solid ${T.border}`,
                    background: highlightRank
                      ? `linear-gradient(180deg, ${accent}18, ${T.panel})`
                      : T.panel,
                    padding: "1.1rem",
                    boxShadow: highlightRank
                      ? "0 18px 40px rgba(0,0,0,0.18)"
                      : "0 12px 26px rgba(0,0,0,0.12)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.95rem",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.9rem" }}>
                    <div
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.45rem",
                        padding: "0.38rem 0.65rem",
                        borderRadius: "999px",
                        backgroundColor: `${accent}16`,
                        color: accent,
                        fontSize: "0.77rem",
                        fontWeight: 700,
                        fontFamily: "'Cabinet Grotesk', sans-serif",
                      }}
                    >
                      <Trophy style={{ width: "13px", height: "13px" }} />
                      #{entry.rank}
                    </div>
                    <div
                      style={{
                        textAlign: "right",
                        color: accent,
                      }}
                    >
                      <p style={{ margin: 0, fontSize: "0.74rem", fontFamily: "'Satoshi', sans-serif", opacity: 0.82 }}>
                        Engagement score
                      </p>
                      <p style={{ margin: "0.08rem 0 0", fontSize: "1.65rem", fontFamily: "'Clash Display', sans-serif", lineHeight: 1 }}>
                        {entry.score}
                      </p>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
                    <div
                      style={{
                        width: "64px",
                        height: "64px",
                        borderRadius: "20px",
                        backgroundColor: `${accent}22`,
                        border: `1px solid ${accent}38`,
                        backgroundImage: entry.avatarUrl ? `url(${entry.avatarUrl})` : "none",
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        display: "grid",
                        placeItems: "center",
                        color: accent,
                        fontWeight: 800,
                        fontSize: "1.3rem",
                        fontFamily: "'Clash Display', sans-serif",
                        flexShrink: 0,
                      }}
                    >
                      {!entry.avatarUrl ? initial : null}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <h2
                        style={{
                          margin: 0,
                          fontSize: "1.18rem",
                          fontWeight: 700,
                          fontFamily: "'Cabinet Grotesk', sans-serif",
                          color: T.text,
                        }}
                      >
                        {entry.name}
                      </h2>
                      <p
                        style={{
                          margin: "0.16rem 0 0",
                          color: T.dim,
                          fontSize: "0.82rem",
                          fontFamily: "'Satoshi', sans-serif",
                        }}
                      >
                        @{entry.handle}
                      </p>
                    </div>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                      gap: "0.55rem",
                    }}
                  >
                    <div style={statCard(T)}>
                      <span style={statLabel(T)}>Posts</span>
                      <strong style={statValue(T)}>{entry.posts}</strong>
                    </div>
                    <div style={statCard(T)}>
                      <span style={statLabel(T)}>Likes</span>
                      <strong style={statValue(T)}>{entry.likes}</strong>
                    </div>
                    <div style={statCard(T)}>
                      <span style={statLabel(T)}>Comments</span>
                      <strong style={statValue(T)}>{entry.comments}</strong>
                    </div>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      gap: "0.6rem",
                      flexWrap: "wrap",
                    }}
                  >
                    <span style={chip(T)}>
                      <Users style={{ width: "13px", height: "13px" }} />
                      {entry.followers} followers
                    </span>
                    <span style={chip(T)}>
                      <Heart style={{ width: "13px", height: "13px" }} />
                      {entry.platformLikes} platform likes
                    </span>
                  </div>
                </article>
              );
            })}
          </section>
        ) : (
          <section
            style={{
              borderRadius: "24px",
              border: `1px solid ${T.border}`,
              background: T.panel,
              padding: "1.4rem",
              boxShadow: "0 12px 28px rgba(0,0,0,0.12)",
            }}
          >
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "16px",
                display: "grid",
                placeItems: "center",
                backgroundColor: T.accentSoft,
                color: T.accent,
                marginBottom: "0.95rem",
              }}
            >
              <MessageCircle style={{ width: "22px", height: "22px" }} />
            </div>
            <h2
              style={{
                margin: "0 0 0.35rem",
                fontFamily: "'Cabinet Grotesk', sans-serif",
                fontSize: "1.2rem",
              }}
            >
              {state === "unavailable" ? "Leaderboard unavailable right now" : "No creators ranked yet"}
            </h2>
            <p
              style={{
                margin: 0,
                color: T.muted,
                fontSize: "0.94rem",
                lineHeight: 1.6,
                fontFamily: "'Satoshi', sans-serif",
                maxWidth: "620px",
              }}
            >
              {note ||
                "Once approved community posts start landing this week, the top creators board will fill automatically."}
            </p>
          </section>
        )}

        {note && entries.length > 0 ? (
          <p
            style={{
              margin: "1rem 0 0",
              color: T.dim,
              fontSize: "0.78rem",
              lineHeight: 1.6,
              fontFamily: "'Satoshi', sans-serif",
            }}
          >
            {note}
          </p>
        ) : null}
      </div>
    </main>
  );
}

const statCard = (T: typeof DARK) => ({
  borderRadius: "14px",
  border: `1px solid ${T.border}`,
  backgroundColor: T.chip,
  padding: "0.72rem 0.75rem",
  display: "flex",
  flexDirection: "column" as const,
  gap: "0.16rem",
});

const statLabel = (T: typeof DARK) => ({
  fontSize: "0.72rem",
  color: T.dim,
  fontFamily: "'Satoshi', sans-serif",
});

const statValue = (T: typeof DARK) => ({
  fontSize: "1.1rem",
  color: T.text,
  fontFamily: "'Cabinet Grotesk', sans-serif",
});

const chip = (T: typeof DARK) => ({
  display: "inline-flex",
  alignItems: "center",
  gap: "0.45rem",
  borderRadius: "999px",
  border: `1px solid ${T.border}`,
  backgroundColor: T.chip,
  color: T.muted,
  padding: "0.46rem 0.7rem",
  fontSize: "0.76rem",
  fontFamily: "'Satoshi', sans-serif",
});

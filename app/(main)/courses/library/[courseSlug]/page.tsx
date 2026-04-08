"use client";

import Link from "next/link";
import { useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Clock3,
  Crown,
  Layers3,
  Lock,
  Play,
  Users2,
} from "lucide-react";
import CourseArtwork from "@/app/components/courses/CourseArtwork";
import {
  findCourseBySlug,
  getCourseCreditLabel,
  getCourseInstructorLabel,
  hasLiveEnrollmentCount,
  type CourseRecord,
} from "@/lib/courseCatalog";
import { useCourseLibrary } from "@/lib/useCourseLibrary";
import { supabase } from "@/lib/supabase";
import { useThemeMode } from "@/lib/useThemeMode";

const DARK = {
  pageBg: "#161211",
  panel: "rgba(30, 26, 23, 0.92)",
  panelBorder: "rgba(255,255,255,0.08)",
  secondaryPanel: "rgba(38, 33, 30, 0.92)",
  text: "#FAF3E1",
  textMuted: "#D4CABB",
  textDim: "#9F968B",
  accent: "#FF6D1F",
  accentSoft: "rgba(255,109,31,0.12)",
  chip: "rgba(255,255,255,0.05)",
};

const LIGHT = {
  pageBg: "#F5EAD9",
  panel: "rgba(255, 250, 242, 0.92)",
  panelBorder: "rgba(34,34,34,0.08)",
  secondaryPanel: "rgba(255,255,255,0.92)",
  text: "#222222",
  textMuted: "#5E564F",
  textDim: "#8B8177",
  accent: "#FF6D1F",
  accentSoft: "rgba(255,109,31,0.12)",
  chip: "rgba(34,34,34,0.04)",
};

const levelColors: Record<string, string> = {
  Beginner: "#63D29D",
  Intermediate: "#F4B860",
  Advanced: "#B28CFF",
};

const getLockNotes = (
  course: CourseRecord,
  skillLevel: string,
  hasProAccess: boolean,
  accessibleLevels: string[]
) => {
  const notes: string[] = [];
  if (course.access === "pro" && !hasProAccess) notes.push("Upgrade to Pro");
  if (!accessibleLevels.includes(course.level)) notes.push(`Complete ${skillLevel} first`);
  return notes;
};

const formatAudienceCount = (count: number) =>
  `${count.toLocaleString()} learner${count === 1 ? "" : "s"}`;

export default function CourseLibraryDetailPage() {
  const theme = useThemeMode();
  const T = theme === "dark" ? DARK : LIGHT;
  const params = useParams<{ courseSlug: string }>();
  const courseSlug = params?.courseSlug || "";
  const [launching, setLaunching] = useState(false);
  const [launchError, setLaunchError] = useState("");
  const {
    loading,
    courses,
    skillLevel,
    accessibleLevels,
    hasProAccess,
    subscriptionEndsAt,
  } = useCourseLibrary();

  const course = findCourseBySlug(courses, courseSlug);

  const isLocked = (target: CourseRecord) =>
    !accessibleLevels.includes(target.level) || (target.access === "pro" && !hasProAccess);

  const expiryLabel =
    subscriptionEndsAt && !Number.isNaN(new Date(subscriptionEndsAt).getTime())
      ? new Date(subscriptionEndsAt).toLocaleDateString()
      : null;

  const launchCourse = async (target: CourseRecord) => {
    setLaunchError("");

    if (isLocked(target)) {
      if (target.access === "pro" && !hasProAccess) {
        window.location.href = "/pricing";
      }
      return;
    }

    if (!target.id) {
      const fallbackUrl = target.enrollUrl || target.videoUrl;
      if (fallbackUrl) {
        window.open(fallbackUrl, "_blank", "noopener,noreferrer");
        return;
      }
      setLaunchError("This course is not available to open right now.");
      return;
    }

    if (!supabase) {
      setLaunchError("Course launching is unavailable right now.");
      return;
    }

    setLaunching(true);

    try {
      const { data } = await supabase.auth.getSession();
      const accessToken = data.session?.access_token;

      if (!accessToken) {
        setLaunchError("Sign in again to open this course.");
        return;
      }

      const response = await fetch(`/api/courses/${target.id}/launch`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const payload = (await response.json()) as { url?: string; error?: string };

      if (!response.ok || !payload.url) {
        setLaunchError(payload.error || "Unable to open this course right now.");
        return;
      }

      window.open(payload.url, "_blank", "noopener,noreferrer");
    } catch {
      setLaunchError("Unable to open this course right now.");
    } finally {
      setLaunching(false);
    }
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          backgroundColor: T.pageBg,
        }}
      >
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: "999px",
            border: `2px solid ${T.panelBorder}`,
            borderTopColor: T.accent,
            animation: "spin 0.8s linear infinite",
          }}
        />
      </div>
    );
  }

  if (!course) {
    return (
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: T.pageBg,
          color: T.text,
          display: "grid",
          placeItems: "center",
          padding: "1rem",
        }}
      >
        <div
          style={{
            width: "min(34rem, 100%)",
            borderRadius: "30px",
            border: `1px solid ${T.panelBorder}`,
            background: T.panel,
            padding: "2rem",
            textAlign: "center",
          }}
        >
          <p
            style={{
              margin: 0,
              fontFamily: "'Clash Display', sans-serif",
              fontSize: "1.8rem",
              letterSpacing: "-0.04em",
            }}
          >
            This course page is not ready yet
          </p>
          <p
            style={{
              margin: "0.7rem 0 0",
              color: T.textMuted,
              lineHeight: 1.7,
              fontFamily: "'General Sans', sans-serif",
            }}
          >
            The route exists now, but this specific course was not found in the current catalog.
          </p>
          <Link
            href="/courses"
            style={{
              marginTop: "1.1rem",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.45rem",
              textDecoration: "none",
              color: T.accent,
              fontWeight: 700,
            }}
          >
            <ArrowLeft size={16} />
            Back to courses
          </Link>
        </div>
      </div>
    );
  }

  const locked = isLocked(course);
  const lockNotes = getLockNotes(course, skillLevel, hasProAccess, accessibleLevels);
  const liveAudienceCount =
    hasLiveEnrollmentCount(course) && course.enrolledCount !== null
      ? formatAudienceCount(course.enrolledCount)
      : null;
  const hasLaunchTarget = Boolean(course.id || course.enrollUrl || course.videoUrl);

  const detailKpis = [
    {
      icon: Clock3,
      label: course.durationLabel,
    },
    {
      icon: Layers3,
      label: `${course.lessons} lesson${course.lessons === 1 ? "" : "s"}`,
    },
    ...(liveAudienceCount
      ? [
          {
            icon: Users2,
            label: liveAudienceCount,
          },
        ]
      : []),
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: T.pageBg,
        color: T.text,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: "-8rem auto auto -10%",
          width: "34rem",
          height: "34rem",
          borderRadius: "999px",
          background:
            theme === "dark"
              ? "radial-gradient(circle, rgba(255,109,31,0.16) 0%, rgba(255,109,31,0.02) 62%, transparent 74%)"
              : "radial-gradient(circle, rgba(255,109,31,0.15) 0%, rgba(255,109,31,0.03) 62%, transparent 74%)",
        }}
      />

      <div className="course-detail-shell">
        <div className="course-detail-grid">
          <motion.aside
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.42 }}
            className="course-detail-sidebar"
            style={{
              borderRadius: "32px",
              border: `1px solid ${T.panelBorder}`,
              background: T.panel,
              padding: "1rem",
              backdropFilter: "blur(24px)",
              boxShadow:
                theme === "dark"
                  ? "0 24px 80px rgba(0,0,0,0.24)"
                  : "0 18px 54px rgba(121, 84, 38, 0.12)",
            }}
          >
            <Link
              href="/courses"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.45rem",
                textDecoration: "none",
                color: T.textMuted,
                fontSize: "0.82rem",
                fontWeight: 700,
                padding: "0.55rem 0.8rem",
                borderRadius: "999px",
                border: `1px solid ${T.panelBorder}`,
                background: T.secondaryPanel,
              }}
            >
              <ArrowLeft size={15} />
              Back to library
            </Link>

            <div className="course-hero-art">
              <CourseArtwork course={course} locked={locked} priority variant="hero" />
            </div>

            <div style={{ display: "grid", gap: "0.85rem" }}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                <span
                  style={{
                    padding: "0.42rem 0.78rem",
                    borderRadius: "999px",
                    background: `${levelColors[course.level] || T.accent}18`,
                    color: levelColors[course.level] || T.accent,
                    fontSize: "0.72rem",
                    fontWeight: 700,
                  }}
                >
                  {course.level}
                </span>
                <span
                  style={{
                    padding: "0.42rem 0.78rem",
                    borderRadius: "999px",
                    background: course.access === "pro" ? T.accentSoft : T.chip,
                    color: course.access === "pro" ? T.accent : T.textMuted,
                    border: `1px solid ${course.access === "pro" ? T.accent : T.panelBorder}`,
                    fontSize: "0.72rem",
                    fontWeight: 700,
                  }}
                >
                  {course.access === "pro" ? "Pro access" : "Open access"}
                </span>
              </div>

              <div>
                <h1
                  style={{
                    margin: 0,
                    fontFamily: "'Clash Display', sans-serif",
                    fontSize: "clamp(2rem, 4vw, 3.15rem)",
                    lineHeight: 0.97,
                    letterSpacing: "-0.05em",
                  }}
                >
                  {course.title}
                </h1>
                <p style={{ margin: "0.55rem 0 0", color: T.textMuted, fontSize: "0.92rem" }}>
                  {getCourseInstructorLabel(course.instructor)}
                </p>
                <p
                  style={{
                    margin: "0.38rem 0 0",
                    color: T.accent,
                    fontSize: "0.74rem",
                    fontWeight: 700,
                  }}
                >
                  {getCourseCreditLabel(course.instructor)}
                </p>
              </div>

              <p
                style={{
                  margin: 0,
                  color: T.textMuted,
                  fontSize: "0.92rem",
                  lineHeight: 1.75,
                  fontFamily: "'General Sans', sans-serif",
                }}
              >
                {course.desc}
              </p>

              <div className="course-kpi-row">
                {detailKpis.map((item) => (
                  <div key={item.label} className="course-kpi-card">
                    <item.icon size={15} color={T.accent} />
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>

              <div
                style={{
                  borderRadius: "24px",
                  border: `1px solid ${T.panelBorder}`,
                  background:
                    theme === "dark"
                      ? "linear-gradient(180deg, rgba(42, 36, 32, 0.96) 0%, rgba(28, 24, 21, 0.92) 100%)"
                      : "linear-gradient(180deg, rgba(255,255,255,0.96) 0%, rgba(250,244,236,0.94) 100%)",
                  padding: "1rem",
                  display: "grid",
                  gap: "0.75rem",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", gap: "0.85rem", flexWrap: "wrap" }}>
                  <div>
                    <p style={{ margin: 0, fontSize: "0.74rem", color: T.textDim, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                      Your access
                    </p>
                    <p style={{ margin: "0.3rem 0 0", fontWeight: 700 }}>
                      {locked ? "Preview available" : "Ready to start"}
                    </p>
                  </div>
                  {locked && course.access === "pro" && !hasProAccess && (
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.4rem",
                        padding: "0.4rem 0.65rem",
                        borderRadius: "999px",
                        background: T.accentSoft,
                        color: T.accent,
                        fontSize: "0.7rem",
                        fontWeight: 700,
                      }}
                    >
                      <Crown size={14} />
                      {expiryLabel ? `Expired on ${expiryLabel}` : "Pro required"}
                    </span>
                  )}
                </div>

                {lockNotes.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                    {lockNotes.map((note) => (
                      <span
                        key={note}
                        style={{
                          padding: "0.4rem 0.62rem",
                          borderRadius: "999px",
                          background: T.chip,
                          border: `1px solid ${T.panelBorder}`,
                          color: T.textDim,
                          fontSize: "0.72rem",
                        }}
                      >
                        {note}
                      </span>
                    ))}
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => void launchCourse(course)}
                  style={{
                    borderRadius: "18px",
                    border: `1px solid ${locked ? T.panelBorder : T.accent}`,
                    background: locked ? "transparent" : T.accentSoft,
                    color: locked ? T.textDim : T.accent,
                    padding: "0.92rem 1rem",
                    fontSize: "0.92rem",
                    fontWeight: 700,
                    cursor: locked && !(course.access === "pro" && !hasProAccess) ? "not-allowed" : "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.55rem",
                  }}
                >
                  {locked ? <Lock size={17} /> : <Play size={17} />}
                  {locked
                    ? course.access === "pro" && !hasProAccess
                      ? "Upgrade to unlock"
                      : "Complete the previous level first"
                    : launching
                      ? "Opening course..."
                      : "Start learning"}
                </button>
              </div>
            </div>
          </motion.aside>

          <motion.section
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.42, delay: 0.05 }}
            className="course-detail-main"
            style={{
              borderRadius: "32px",
              border: `1px solid ${T.panelBorder}`,
              background: T.panel,
              padding: "1.1rem",
              backdropFilter: "blur(22px)",
              display: "grid",
              gap: "1rem",
              alignContent: "start",
              boxShadow:
                theme === "dark"
                  ? "0 24px 80px rgba(0,0,0,0.2)"
                  : "0 18px 54px rgba(121, 84, 38, 0.1)",
            }}
          >
            <div
              className="course-detail-note"
              style={{
                borderRadius: "20px",
                border: `1px solid ${T.panelBorder}`,
                background:
                  theme === "dark"
                    ? "rgba(36, 31, 28, 0.96)"
                    : "rgba(255,255,255,0.95)",
                padding: "0.95rem 1rem",
              }}
            >
              <p
                style={{
                  margin: 0,
                  color: T.textMuted,
                  fontSize: "0.84rem",
                  lineHeight: 1.7,
                  fontFamily: "'General Sans', sans-serif",
                }}
              >
                Review the course, check your access, and start learning from here when you are ready.
              </p>
            </div>

            <div
              style={{
                borderRadius: "28px",
                border: `1px solid ${T.panelBorder}`,
                background:
                  theme === "dark"
                    ? "linear-gradient(180deg, rgba(33, 28, 25, 0.98) 0%, rgba(24, 21, 18, 0.96) 100%)"
                    : "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(250,244,236,0.96) 100%)",
                padding: "1.2rem",
                display: "grid",
                gap: "1rem",
              }}
            >
              <div style={{ display: "grid", gap: "0.45rem" }}>
                <p
                  style={{
                    margin: 0,
                    color: T.textDim,
                    fontSize: "0.72rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                  }}
                >
                  Course overview
                </p>
                <h2
                  style={{
                    margin: 0,
                    fontFamily: "'Clash Display', sans-serif",
                    fontSize: "clamp(1.9rem, 3.5vw, 2.8rem)",
                    letterSpacing: "-0.04em",
                    lineHeight: 0.98,
                    maxWidth: "12ch",
                  }}
                >
                  {locked ? "See what this course covers before you unlock it." : "Everything you need to start is here."}
                </h2>
                <p
                  style={{
                    margin: 0,
                    color: T.textMuted,
                    fontSize: "0.9rem",
                    lineHeight: 1.75,
                    fontFamily: "'General Sans', sans-serif",
                    maxWidth: "42rem",
                  }}
                >
                  Read the course overview, check the key details, and start the main session when you are ready.
                </p>
              </div>

              <div className="course-access-card">
                <div style={{ minWidth: 0 }}>
                  <p
                    style={{
                      margin: 0,
                      color: T.textDim,
                      fontSize: "0.72rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                    }}
                  >
                    Start this course
                  </p>
                  <p
                    style={{
                      margin: "0.28rem 0 0",
                      fontFamily: "'Clash Display', sans-serif",
                      fontSize: "1.5rem",
                      letterSpacing: "-0.03em",
                      lineHeight: 1.02,
                    }}
                  >
                    {course.title}
                  </p>
                  <p
                    style={{
                      margin: "0.42rem 0 0",
                      color: T.textMuted,
                      fontSize: "0.86rem",
                      lineHeight: 1.7,
                      fontFamily: "'General Sans', sans-serif",
                      maxWidth: "34rem",
                    }}
                  >
                    {hasLaunchTarget
                      ? locked
                        ? "You can review the course now and unlock access when your level or plan allows it."
                        : "Use the button to open the course and begin learning."
                      : "This course is being prepared. The start link will be added soon."}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => void launchCourse(course)}
                  disabled={!hasLaunchTarget && !locked}
                  style={{
                    borderRadius: "18px",
                    border: `1px solid ${locked || !hasLaunchTarget ? T.panelBorder : T.accent}`,
                    background: locked || !hasLaunchTarget ? "transparent" : T.accentSoft,
                    color: locked || !hasLaunchTarget ? T.textDim : T.accent,
                    padding: "0.95rem 1.08rem",
                    fontSize: "0.9rem",
                    fontWeight: 700,
                    cursor:
                      locked && !(course.access === "pro" && !hasProAccess)
                        ? "not-allowed"
                        : !hasLaunchTarget && !locked
                          ? "not-allowed"
                          : "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.55rem",
                    whiteSpace: "nowrap",
                    minWidth: "12rem",
                  }}
                >
                  {locked ? <Lock size={17} /> : <Play size={17} />}
                  {locked
                    ? course.access === "pro" && !hasProAccess
                      ? "Upgrade to unlock"
                      : "Complete the previous level first"
                    : launching
                      ? "Opening course..."
                      : hasLaunchTarget
                        ? "Start learning"
                        : "Coming soon"}
                </button>
              </div>

              {lockNotes.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.55rem" }}>
                  {lockNotes.map((note) => (
                    <span
                      key={note}
                      style={{
                        padding: "0.45rem 0.68rem",
                        borderRadius: "999px",
                        background: T.chip,
                        border: `1px solid ${T.panelBorder}`,
                        color: T.textDim,
                        fontSize: "0.74rem",
                      }}
                    >
                      {note}
                    </span>
                  ))}
                </div>
              )}

            </div>

            {launchError && (
              <div
                style={{
                  borderRadius: "18px",
                  border: "1px solid rgba(228, 100, 100, 0.28)",
                  background: "rgba(228, 100, 100, 0.08)",
                  padding: "0.9rem 1rem",
                  color: "#D96A6A",
                  fontSize: "0.84rem",
                }}
              >
                {launchError}
              </div>
            )}
          </motion.section>
        </div>
      </div>

      <style jsx>{`
        .course-detail-shell {
          position: relative;
          z-index: 1;
          width: min(1360px, calc(100% - 1.6rem));
          margin: 0 auto;
          padding: 1rem 0 2.2rem;
        }

        .course-detail-grid {
          display: grid;
          grid-template-columns: minmax(310px, 0.82fr) minmax(0, 1.42fr);
          gap: 1.15rem;
          align-items: start;
        }

        .course-detail-sidebar {
          position: sticky;
          top: 1rem;
          display: grid;
          gap: 1rem;
        }

        .course-detail-main {
          min-height: calc(100vh - 2rem);
        }

        .course-hero-art {
          height: 430px;
        }

        .course-kpi-row {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 0.65rem;
        }

        .course-kpi-card {
          border-radius: 18px;
          border: 1px solid ${T.panelBorder};
          background: ${T.secondaryPanel};
          padding: 0.82rem 0.88rem;
          display: inline-flex;
          align-items: center;
          gap: 0.55rem;
          font-size: 0.78rem;
          color: ${T.textMuted};
        }

        .course-detail-note {
          max-width: 100%;
        }

        .course-access-card {
          border-radius: 24px;
          border: 1px solid ${T.panelBorder};
          background: ${T.secondaryPanel};
          padding: 1rem;
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto;
          gap: 1rem;
          align-items: center;
        }

        @media (max-width: 1023px) {
          .course-detail-shell {
            width: min(100%, calc(100% - 1rem));
          }

          .course-detail-grid {
            grid-template-columns: 1fr;
          }

          .course-detail-sidebar {
            position: static;
          }

          .course-detail-main {
            min-height: auto;
          }

          .course-access-card {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 767px) {
          .course-detail-shell {
            width: min(100%, calc(100% - 1rem));
            padding-bottom: 1rem;
          }

          .course-hero-art {
            height: 310px;
          }

          .course-kpi-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}

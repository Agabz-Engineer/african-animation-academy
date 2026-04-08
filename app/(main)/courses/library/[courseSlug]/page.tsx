"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  BookOpen,
  CirclePlay,
  Clock3,
  Crown,
  ExternalLink,
  Layers3,
  Lock,
  Play,
  Sparkles,
  Users2,
} from "lucide-react";
import CourseArtwork from "@/app/components/courses/CourseArtwork";
import {
  buildCoursePlaylist,
  findCourseBySlug,
  getCourseCreditLabel,
  getCourseInstructorLabel,
  hasLiveEnrollmentCount,
  type CoursePlaylistItem,
  type CourseRecord,
} from "@/lib/courseCatalog";
import { useCourseLibrary } from "@/lib/useCourseLibrary";
import { supabase } from "@/lib/supabase";
import { useThemeMode } from "@/lib/useThemeMode";

type PlaylistTab = "all" | "lesson" | "lab" | "resource";

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
  const [tab, setTab] = useState<PlaylistTab>("all");
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
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
  const playlist = course ? buildCoursePlaylist(course) : [];
  const firstLessonId = playlist[0]?.id ?? null;

  useEffect(() => {
    setSelectedLessonId(firstLessonId);
  }, [courseSlug, firstLessonId]);

  const isLocked = (target: CourseRecord) =>
    !accessibleLevels.includes(target.level) || (target.access === "pro" && !hasProAccess);

  const selectedLesson =
    playlist.find((item) => item.id === selectedLessonId) || playlist[0] || null;

  const visiblePlaylist =
    tab === "all" ? playlist : playlist.filter((item) => item.kind === tab);

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

  const renderLessonAction = (target: CoursePlaylistItem, currentCourse: CourseRecord) => {
    const locked = isLocked(currentCourse);

    if (locked) {
      return (
        <button
          type="button"
          onClick={() => {
            if (currentCourse.access === "pro" && !hasProAccess) {
              window.location.href = "/pricing";
            }
          }}
          style={{
            borderRadius: "999px",
            border: `1px solid ${T.panelBorder}`,
            background: "transparent",
            color: T.textDim,
            padding: "0.62rem 0.9rem",
            fontSize: "0.74rem",
            fontWeight: 700,
            cursor: currentCourse.access === "pro" && !hasProAccess ? "pointer" : "not-allowed",
          }}
        >
          {currentCourse.access === "pro" && !hasProAccess ? "Upgrade" : "Locked"}
        </button>
      );
    }

    return (
      <button
        type="button"
        onClick={() => void launchCourse(currentCourse)}
        style={{
          borderRadius: "999px",
          border: `1px solid ${T.accent}`,
          background: T.accentSoft,
          color: T.accent,
          padding: "0.62rem 0.9rem",
          fontSize: "0.74rem",
          fontWeight: 700,
          cursor: "pointer",
        }}
      >
        {target.isLaunchLesson ? "Play session" : "Open course"}
      </button>
    );
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
              backdropFilter: "blur(20px)",
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
                  background: T.secondaryPanel,
                  padding: "1rem",
                  display: "grid",
                  gap: "0.75rem",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", gap: "0.85rem", flexWrap: "wrap" }}>
                  <div>
                    <p style={{ margin: 0, fontSize: "0.74rem", color: T.textDim, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                      Launch access
                    </p>
                    <p style={{ margin: "0.3rem 0 0", fontWeight: 700 }}>
                      {locked ? "Preview mode" : "Full course launch ready"}
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
                      : "Locked for your current level"
                    : launching
                      ? "Opening course..."
                      : "Start course"}
                </button>
              </div>
            </div>
          </motion.aside>

          <motion.section
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.42, delay: 0.05 }}
            style={{
              borderRadius: "32px",
              border: `1px solid ${T.panelBorder}`,
              background: T.panel,
              padding: "1rem",
              backdropFilter: "blur(20px)",
              display: "grid",
              gap: "1rem",
              alignContent: "start",
            }}
          >
            <div
              style={{
                borderRadius: "24px",
                border: `1px solid ${T.panelBorder}`,
                background: T.secondaryPanel,
                padding: "1rem",
                display: "flex",
                justifyContent: "space-between",
                gap: "1rem",
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              <div>
                <p style={{ margin: 0, color: T.textDim, fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  Playlist mode
                </p>
                <p style={{ margin: "0.25rem 0 0", fontFamily: "'Clash Display', sans-serif", fontSize: "1.35rem", letterSpacing: "-0.03em" }}>
                  Internal course page now active
                </p>
                <p
                  style={{
                    margin: "0.35rem 0 0",
                    color: T.textMuted,
                    fontSize: "0.84rem",
                    lineHeight: 1.65,
                    fontFamily: "'General Sans', sans-serif",
                    maxWidth: "38rem",
                  }}
                >
                  This new view gives each course a premium destination. As lesson-level uploads are expanded later, they will slot directly into this playlist layout.
                </p>
              </div>

              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.45rem",
                  padding: "0.7rem 0.9rem",
                  borderRadius: "999px",
                  border: `1px solid ${T.panelBorder}`,
                  background: T.panel,
                  color: T.accent,
                  fontWeight: 700,
                  fontSize: "0.82rem",
                }}
              >
                <Sparkles size={15} />
                Premium course preview
              </div>
            </div>

            <div className="playlist-tab-row">
              {[
                { key: "all" as PlaylistTab, label: "All" },
                { key: "lesson" as PlaylistTab, label: "Lessons" },
                { key: "lab" as PlaylistTab, label: "Labs" },
                { key: "resource" as PlaylistTab, label: "Resources" },
              ].map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setTab(item.key)}
                  style={{
                    borderRadius: "999px",
                    border: `1px solid ${tab === item.key ? T.accent : T.panelBorder}`,
                    background: tab === item.key ? T.accentSoft : T.secondaryPanel,
                    color: tab === item.key ? T.accent : T.textMuted,
                    padding: "0.72rem 0.95rem",
                    fontSize: "0.8rem",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {selectedLesson && (
              <div
                style={{
                  borderRadius: "26px",
                  border: `1px solid ${T.panelBorder}`,
                  background: T.secondaryPanel,
                  padding: "1rem",
                  display: "grid",
                  gap: "0.7rem",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", alignItems: "flex-start", flexWrap: "wrap" }}>
                  <div>
                    <p style={{ margin: 0, color: T.textDim, fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                      Selected module
                    </p>
                    <p style={{ margin: "0.28rem 0 0", fontFamily: "'Clash Display', sans-serif", fontSize: "1.45rem", letterSpacing: "-0.03em" }}>
                      {selectedLesson.title}
                    </p>
                  </div>
                  <span
                    style={{
                      padding: "0.45rem 0.72rem",
                      borderRadius: "999px",
                      background: T.chip,
                      border: `1px solid ${T.panelBorder}`,
                      color: T.textMuted,
                      fontSize: "0.76rem",
                    }}
                  >
                    {selectedLesson.durationLabel}
                  </span>
                </div>

                <p
                  style={{
                    margin: 0,
                    color: T.textMuted,
                    fontSize: "0.86rem",
                    lineHeight: 1.7,
                    fontFamily: "'General Sans', sans-serif",
                  }}
                >
                  {selectedLesson.synopsis}
                </p>

                <div style={{ display: "flex", alignItems: "center", gap: "0.7rem", flexWrap: "wrap" }}>
                  {renderLessonAction(selectedLesson, course)}
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.45rem",
                      color: T.textDim,
                      fontSize: "0.76rem",
                    }}
                  >
                    <ExternalLink size={14} />
                    Launches the course player in a new tab
                  </span>
                </div>
              </div>
            )}

            <div className="playlist-list">
              {visiblePlaylist.map((item) => {
                const active = item.id === selectedLessonId;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedLessonId(item.id)}
                    style={{
                      width: "100%",
                      textAlign: "left",
                      borderRadius: "24px",
                      border: `1px solid ${active ? T.accent : T.panelBorder}`,
                      background: active ? T.accentSoft : T.secondaryPanel,
                      padding: "1rem",
                      display: "grid",
                      gridTemplateColumns: "auto minmax(0, 1fr) auto",
                      gap: "0.9rem",
                      alignItems: "center",
                      cursor: "pointer",
                    }}
                  >
                    <div
                      style={{
                        width: "2.5rem",
                        height: "2.5rem",
                        borderRadius: "16px",
                        background: active ? "rgba(255,255,255,0.18)" : T.chip,
                        border: `1px solid ${active ? "rgba(255,255,255,0.18)" : T.panelBorder}`,
                        display: "grid",
                        placeItems: "center",
                        fontWeight: 700,
                        color: active ? T.accent : T.textMuted,
                        flexShrink: 0,
                      }}
                    >
                      {item.order}
                    </div>

                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" }}>
                        <p style={{ margin: 0, fontWeight: 700, fontSize: "0.95rem", color: T.text }}>
                          {item.title}
                        </p>
                        <span
                          style={{
                            padding: "0.28rem 0.55rem",
                            borderRadius: "999px",
                            background: T.chip,
                            color: T.textDim,
                            fontSize: "0.68rem",
                            textTransform: "capitalize",
                          }}
                        >
                          {item.kind}
                        </span>
                      </div>
                      <p
                        style={{
                          margin: "0.35rem 0 0",
                          color: T.textMuted,
                          fontSize: "0.8rem",
                          lineHeight: 1.65,
                          fontFamily: "'General Sans', sans-serif",
                        }}
                      >
                        {item.synopsis}
                      </p>
                    </div>

                    <div
                      style={{
                        display: "grid",
                        justifyItems: "end",
                        gap: "0.35rem",
                        color: T.textDim,
                        fontSize: "0.74rem",
                        flexShrink: 0,
                      }}
                    >
                      <span>{item.durationLabel}</span>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "0.35rem",
                          color: item.isLaunchLesson ? T.accent : T.textDim,
                          fontWeight: item.isLaunchLesson ? 700 : 500,
                        }}
                      >
                        {item.isLaunchLesson ? <CirclePlay size={14} /> : <BookOpen size={14} />}
                        {item.isLaunchLesson ? "Launches course" : "Playlist view"}
                      </span>
                    </div>
                  </button>
                );
              })}
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
          width: min(1240px, calc(100% - 2rem));
          margin: 0 auto;
          padding: 1.2rem 0 2.6rem;
        }

        .course-detail-grid {
          display: grid;
          grid-template-columns: minmax(320px, 0.95fr) minmax(0, 1.25fr);
          gap: 1rem;
          align-items: start;
        }

        .course-detail-sidebar {
          position: sticky;
          top: 1rem;
          display: grid;
          gap: 1rem;
        }

        .course-hero-art {
          height: 390px;
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

        .playlist-tab-row {
          display: flex;
          gap: 0.7rem;
          flex-wrap: wrap;
        }

        .playlist-list {
          display: grid;
          gap: 0.85rem;
        }

        @media (max-width: 1023px) {
          .course-detail-shell {
            width: min(100%, calc(100% - 1.4rem));
          }

          .course-detail-grid {
            grid-template-columns: 1fr;
          }

          .course-detail-sidebar {
            position: static;
          }
        }

        @media (max-width: 767px) {
          .course-detail-shell {
            width: min(100%, calc(100% - 1rem));
            padding-bottom: 1.6rem;
          }

          .course-hero-art {
            height: 290px;
          }

          .course-kpi-row {
            grid-template-columns: 1fr;
          }

          .playlist-list :global(button) {
            grid-template-columns: auto minmax(0, 1fr);
          }

          .playlist-list :global(button) > :last-child {
            grid-column: 2;
            justify-items: start !important;
          }
        }
      `}</style>
    </div>
  );
}

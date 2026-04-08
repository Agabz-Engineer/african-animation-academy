"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Clock3, Crown, Layers3, Lock, Search, Sparkles, X } from "lucide-react";
import CourseArtwork from "@/app/components/courses/CourseArtwork";
import {
  getCourseInstructorLabel,
  getCourseSlug,
  hasLiveEnrollmentCount,
  type CourseRecord,
} from "@/lib/courseCatalog";
import { useCourseLibrary } from "@/lib/useCourseLibrary";
import { useThemeMode } from "@/lib/useThemeMode";

type FilterKey = "all" | "available" | "locked" | "Beginner" | "Intermediate" | "Advanced";

const DARK = {
  pageBg: "#171311",
  shell: "rgba(33, 28, 24, 0.9)",
  shellBorder: "rgba(255, 255, 255, 0.08)",
  cardBg: "rgba(35, 31, 28, 0.94)",
  cardBorder: "rgba(255, 255, 255, 0.08)",
  text: "#FAF3E1",
  textMuted: "#D4CABB",
  textDim: "#9F968B",
  accent: "#FF6D1F",
  accentSoft: "rgba(255, 109, 31, 0.12)",
  highlight: "#F4B860",
  inputBg: "rgba(21, 19, 18, 0.94)",
};

const LIGHT = {
  pageBg: "#F6ECDC",
  shell: "rgba(255, 250, 242, 0.88)",
  shellBorder: "rgba(34, 34, 34, 0.08)",
  cardBg: "rgba(255, 255, 255, 0.92)",
  cardBorder: "rgba(34, 34, 34, 0.08)",
  text: "#222222",
  textMuted: "#5E564F",
  textDim: "#8B8177",
  accent: "#FF6D1F",
  accentSoft: "rgba(255, 109, 31, 0.12)",
  highlight: "#A65A18",
  inputBg: "rgba(255, 255, 255, 0.94)",
};

const levelColors: Record<string, string> = {
  Beginner: "#63D29D",
  Intermediate: "#F4B860",
  Advanced: "#B28CFF",
};

const filterOptions: Array<{ key: FilterKey; label: string }> = [
  { key: "all", label: "All" },
  { key: "available", label: "Available" },
  { key: "locked", label: "Locked" },
  { key: "Beginner", label: "Beginner" },
  { key: "Intermediate", label: "Intermediate" },
  { key: "Advanced", label: "Advanced" },
];

const getLockNotes = (
  course: CourseRecord,
  skillLevel: string,
  hasProAccess: boolean,
  accessibleLevels: string[]
) => {
  const notes: string[] = [];
  if (course.access === "pro" && !hasProAccess) notes.push("Pro members only");
  if (!accessibleLevels.includes(course.level)) notes.push(`Complete ${skillLevel} first`);
  return notes;
};

const formatAudienceCount = (count: number) =>
  `${count.toLocaleString()} learner${count === 1 ? "" : "s"}`;

export default function CoursesPage() {
  const theme = useThemeMode();
  const T = theme === "dark" ? DARK : LIGHT;
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterKey>("all");
  const {
    loading,
    courses,
    skillLevel,
    accessibleLevels,
    hasProAccess,
    subscriptionEndsAt,
    subscriptionExpired,
  } = useCourseLibrary();

  const normalizedSkill = skillLevel.charAt(0).toUpperCase() + skillLevel.slice(1);
  const expiryLabel =
    subscriptionEndsAt && !Number.isNaN(new Date(subscriptionEndsAt).getTime())
      ? new Date(subscriptionEndsAt).toLocaleDateString()
      : null;

  const isLocked = (course: CourseRecord) =>
    !accessibleLevels.includes(course.level) || (course.access === "pro" && !hasProAccess);

  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(search.toLowerCase()) ||
      course.instructor.toLowerCase().includes(search.toLowerCase()) ||
      course.desc.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;
    if (filter === "all") return true;
    if (filter === "available") return !isLocked(course);
    if (filter === "locked") return isLocked(course);
    return course.level === filter;
  });

  const availableCount = courses.filter((course) => !isLocked(course)).length;
  const lockedCount = courses.filter((course) => isLocked(course)).length;
  const premiumCount = courses.filter((course) => course.access === "pro").length;

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
            border: `2px solid ${T.cardBorder}`,
            borderTopColor: T.accent,
            animation: "spin 0.8s linear infinite",
          }}
        />
      </div>
    );
  }

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
          inset: "0 auto auto -12%",
          width: "38rem",
          height: "38rem",
          borderRadius: "999px",
          background:
            theme === "dark"
              ? "radial-gradient(circle, rgba(255,109,31,0.18) 0%, rgba(255,109,31,0.02) 60%, transparent 72%)"
              : "radial-gradient(circle, rgba(255,109,31,0.16) 0%, rgba(255,109,31,0.03) 58%, transparent 72%)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: "12rem -10% auto auto",
          width: "30rem",
          height: "30rem",
          borderRadius: "999px",
          background:
            theme === "dark"
              ? "radial-gradient(circle, rgba(244,184,96,0.12) 0%, rgba(244,184,96,0.02) 58%, transparent 70%)"
              : "radial-gradient(circle, rgba(166,90,24,0.1) 0%, rgba(166,90,24,0.02) 58%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <div className="courses-shell">
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="courses-hero-panel"
          style={{
            borderRadius: "32px",
            border: `1px solid ${T.shellBorder}`,
            background: T.shell,
            backdropFilter: "blur(20px)",
            padding: "1.3rem",
            boxShadow:
              theme === "dark"
                ? "0 30px 80px rgba(0, 0, 0, 0.22)"
                : "0 24px 60px rgba(69, 39, 10, 0.08)",
          }}
        >
          <div className="courses-hero-portrait" aria-hidden="true">
            <div className="courses-hero-portrait-core" />
            <div className="courses-hero-portrait-glow" />
          </div>
          <div className="courses-hero-texture" aria-hidden="true" />

          <div className="courses-hero-grid">
            <div>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.55rem",
                  padding: "0.5rem 0.85rem",
                  borderRadius: "999px",
                  border: `1px solid ${T.cardBorder}`,
                  background: T.cardBg,
                  color: T.highlight,
                  fontSize: "0.74rem",
                  fontWeight: 700,
                  fontFamily: "'General Sans', sans-serif",
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                }}
              >
                <Sparkles size={14} />
                Premium learning library
              </div>

              <h1
                style={{
                  margin: "1rem 0 0",
                  fontFamily: "'Clash Display', sans-serif",
                  fontSize: "clamp(2.2rem, 6vw, 4.5rem)",
                  lineHeight: 0.96,
                  letterSpacing: "-0.05em",
                  maxWidth: "10ch",
                }}
              >
                Learn through bold, cover-first course worlds.
              </h1>

              <p
                style={{
                  margin: "1rem 0 0",
                  maxWidth: "38rem",
                  color: T.textMuted,
                  fontSize: "0.98rem",
                  lineHeight: 1.75,
                  fontFamily: "'General Sans', sans-serif",
                }}
              >
                A quieter, more visual library. Open a cover, review the lesson flow, then launch the course from
                inside its dedicated page.
              </p>

              <div className="courses-toolbar">
                <div className="courses-search">
                  <Search size={16} style={{ color: T.textDim }} />
                  <input
                    type="text"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search by course, instructor, or topic"
                    style={{
                      width: "100%",
                      border: "none",
                      outline: "none",
                      background: "transparent",
                      color: T.text,
                      fontSize: "0.92rem",
                      fontFamily: "'General Sans', sans-serif",
                    }}
                  />
                  {search && (
                    <button
                      type="button"
                      onClick={() => setSearch("")}
                      style={{
                        border: "none",
                        background: "transparent",
                        color: T.textDim,
                        cursor: "pointer",
                        display: "grid",
                        placeItems: "center",
                      }}
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.55rem",
                    borderRadius: "999px",
                    border: `1px solid ${T.cardBorder}`,
                    background: T.cardBg,
                    padding: "0.78rem 1rem",
                    color: T.textMuted,
                    fontSize: "0.84rem",
                    fontFamily: "'General Sans', sans-serif",
                  }}
                >
                  <span
                    style={{
                      width: "0.6rem",
                      height: "0.6rem",
                      borderRadius: "999px",
                      backgroundColor: levelColors[normalizedSkill] || T.accent,
                      boxShadow: `0 0 12px ${T.accentSoft}`,
                    }}
                  />
                  {normalizedSkill} path active
                </div>
              </div>
            </div>

            <div className="courses-stat-grid">
              {[
                {
                  label: "Ready now",
                  value: String(availableCount).padStart(2, "0"),
                  icon: Layers3,
                  note: "You can enter these today",
                },
                {
                  label: "Premium vault",
                  value: String(premiumCount).padStart(2, "0"),
                  icon: Crown,
                  note: "Pro-only deep dives",
                },
                {
                  label: "Locked next",
                  value: String(lockedCount).padStart(2, "0"),
                  icon: Lock,
                  note: "Unlock as you progress",
                },
              ].map((stat) => (
                <div
                  key={stat.label}
                  style={{
                    borderRadius: "24px",
                    border: `1px solid ${T.cardBorder}`,
                    background: T.cardBg,
                    padding: "1.1rem",
                    minHeight: "8.3rem",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}
                >
                  <div
                    style={{
                      width: "2.5rem",
                      height: "2.5rem",
                      borderRadius: "16px",
                      background: T.accentSoft,
                      display: "grid",
                      placeItems: "center",
                      color: T.accent,
                    }}
                  >
                    <stat.icon size={18} />
                  </div>
                  <div>
                    <p
                      style={{
                        margin: "0 0 0.25rem",
                        fontFamily: "'Clash Display', sans-serif",
                        fontSize: "2rem",
                        letterSpacing: "-0.06em",
                      }}
                    >
                      {stat.value}
                    </p>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: "0.86rem" }}>{stat.label}</p>
                    <p
                      style={{
                        margin: "0.25rem 0 0",
                        color: T.textDim,
                        fontSize: "0.76rem",
                        lineHeight: 1.55,
                        fontFamily: "'General Sans', sans-serif",
                      }}
                    >
                      {stat.note}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {subscriptionExpired && (
            <div
              style={{
                marginTop: "1rem",
                borderRadius: "20px",
                border: `1px solid ${T.cardBorder}`,
                background: T.cardBg,
                padding: "0.95rem 1rem",
                display: "flex",
                alignItems: "center",
                gap: "0.85rem",
                flexWrap: "wrap",
              }}
            >
              <div
                style={{
                  width: "2.4rem",
                  height: "2.4rem",
                  borderRadius: "16px",
                  background: T.accentSoft,
                  color: T.accent,
                  display: "grid",
                  placeItems: "center",
                }}
              >
                <Crown size={17} />
              </div>
              <div style={{ flex: 1, minWidth: "16rem" }}>
                <p style={{ margin: 0, fontWeight: 700, fontSize: "0.9rem" }}>Your Pro access needs renewal</p>
                <p
                  style={{
                    margin: "0.18rem 0 0",
                    color: T.textMuted,
                    fontSize: "0.8rem",
                    fontFamily: "'General Sans', sans-serif",
                  }}
                >
                  Your previous Pro access expired{expiryLabel ? ` on ${expiryLabel}` : ""}. Renew to reopen premium lessons.
                </p>
              </div>
              <Link
                href="/pricing"
                style={{
                  textDecoration: "none",
                  borderRadius: "999px",
                  padding: "0.75rem 1rem",
                  border: `1px solid ${T.accent}`,
                  background: T.accentSoft,
                  color: T.accent,
                  fontWeight: 700,
                  fontSize: "0.82rem",
                  whiteSpace: "nowrap",
                }}
              >
                Renew Pro
              </Link>
            </div>
          )}
        </motion.section>

        <div className="courses-filter-row">
          {filterOptions.map((option) => (
            <button
              key={option.key}
              type="button"
              onClick={() => setFilter(option.key)}
              style={{
                borderRadius: "999px",
                border: `1px solid ${filter === option.key ? T.accent : T.cardBorder}`,
                background: filter === option.key ? T.accentSoft : T.cardBg,
                color: filter === option.key ? T.accent : T.textMuted,
                padding: "0.72rem 1rem",
                fontSize: "0.82rem",
                fontWeight: 700,
                fontFamily: "'General Sans', sans-serif",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
            >
              {option.label}
            </button>
          ))}
        </div>

        <section className="courses-gallery-grid">
          {filteredCourses.map((course, index) => {
            const locked = isLocked(course);
            const lockNotes = getLockNotes(course, skillLevel, hasProAccess, accessibleLevels);
            const liveAudience = hasLiveEnrollmentCount(course) && course.enrolledCount !== null
              ? formatAudienceCount(course.enrolledCount)
              : null;
            const primaryNote =
              lockNotes[0] || (locked ? "Preview the syllabus before you unlock it" : "Open the internal course page");

            return (
              <Link
                key={getCourseSlug(course)}
                href={`/courses/library/${getCourseSlug(course)}`}
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <motion.article
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.38, delay: index * 0.05 }}
                  whileHover={{ y: -6 }}
                  className="course-card"
                  style={{
                    borderRadius: "26px",
                    border: `1px solid ${T.cardBorder}`,
                    background: T.cardBg,
                    overflow: "hidden",
                    boxShadow:
                      theme === "dark"
                        ? "0 18px 46px rgba(0,0,0,0.16)"
                        : "0 16px 38px rgba(110, 70, 24, 0.08)",
                  }}
                >
                  <div className="course-card-art">
                    <CourseArtwork
                      course={course}
                      locked={locked}
                      priority={index < 2}
                      variant="card"
                      showOverlayDetails={false}
                    />
                  </div>

                  <div className="course-card-copy">
                    <div
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        justifyContent: "space-between",
                        gap: "0.85rem",
                        flexWrap: "wrap",
                      }}
                    >
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.45rem" }}>
                        <span
                          style={{
                            padding: "0.35rem 0.7rem",
                            borderRadius: "999px",
                            background: `${levelColors[course.level] || T.accent}18`,
                            color: levelColors[course.level] || T.accent,
                            fontSize: "0.68rem",
                            fontWeight: 700,
                            fontFamily: "'General Sans', sans-serif",
                          }}
                        >
                          {course.level}
                        </span>
                        <span
                          style={{
                            padding: "0.35rem 0.7rem",
                            borderRadius: "999px",
                            background: course.access === "pro" ? T.accentSoft : "transparent",
                            border: `1px solid ${course.access === "pro" ? T.accent : T.cardBorder}`,
                            color: course.access === "pro" ? T.accent : T.textMuted,
                            fontSize: "0.68rem",
                            fontWeight: 700,
                            fontFamily: "'General Sans', sans-serif",
                          }}
                        >
                          {course.access === "pro" ? "Pro" : "Open"}
                        </span>
                      </div>
                      {liveAudience && (
                        <span
                          style={{
                            color: T.textDim,
                            fontSize: "0.74rem",
                            whiteSpace: "nowrap",
                            fontFamily: "'General Sans', sans-serif",
                          }}
                        >
                          {liveAudience}
                        </span>
                      )}
                    </div>

                    <div style={{ marginTop: "0.9rem" }}>
                      <h3
                        style={{
                          margin: 0,
                          fontFamily: "'Clash Display', sans-serif",
                          fontSize: "1.42rem",
                          lineHeight: 1.02,
                          letterSpacing: "-0.04em",
                        }}
                      >
                        {course.title}
                      </h3>
                      <p
                        style={{
                          margin: "0.48rem 0 0",
                          color: T.textMuted,
                          fontSize: "0.84rem",
                          fontFamily: "'General Sans', sans-serif",
                        }}
                      >
                        {getCourseInstructorLabel(course.instructor)}
                      </p>
                    </div>

                    <div
                      style={{
                        marginTop: "1rem",
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "0.6rem",
                      }}
                    >
                      <span className="course-chip">
                        <Clock3 size={14} />
                        {course.durationLabel}
                      </span>
                      <span className="course-chip">
                        <Layers3 size={14} />
                        {course.lessons} lesson{course.lessons === 1 ? "" : "s"}
                      </span>
                    </div>

                    <div
                      style={{
                        marginTop: "1rem",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "0.85rem",
                      }}
                    >
                      <div>
                        <p
                          style={{
                            margin: 0,
                            color: T.textDim,
                            fontSize: "0.72rem",
                            fontFamily: "'General Sans', sans-serif",
                            textTransform: "uppercase",
                            letterSpacing: "0.08em",
                          }}
                        >
                          {locked ? "Preview course" : "Open course page"}
                        </p>
                        <p
                          style={{
                            margin: "0.24rem 0 0",
                            color: T.textMuted,
                            fontSize: "0.82rem",
                            fontFamily: "'General Sans', sans-serif",
                            maxWidth: "18rem",
                          }}
                        >
                          {primaryNote}
                        </p>
                      </div>

                      <div
                        style={{
                          width: "2.75rem",
                          height: "2.75rem",
                          borderRadius: "999px",
                          background: T.accentSoft,
                          color: T.accent,
                          display: "grid",
                          placeItems: "center",
                          flexShrink: 0,
                        }}
                      >
                        <ArrowRight size={18} />
                      </div>
                    </div>
                  </div>
                </motion.article>
              </Link>
            );
          })}
        </section>

        {filteredCourses.length === 0 && (
          <div
            style={{
              borderRadius: "26px",
              border: `1px solid ${T.cardBorder}`,
              background: T.cardBg,
              padding: "2rem",
              textAlign: "center",
            }}
          >
            <p
              style={{
                margin: 0,
                fontFamily: "'Clash Display', sans-serif",
                fontSize: "1.4rem",
                letterSpacing: "-0.03em",
              }}
            >
              No courses match that search yet
            </p>
            <p
              style={{
                margin: "0.55rem auto 0",
                maxWidth: "34rem",
                color: T.textMuted,
                fontSize: "0.88rem",
                lineHeight: 1.7,
                fontFamily: "'General Sans', sans-serif",
              }}
            >
              Try a broader keyword or switch filters. The gallery keeps your locked and unlocked paths visible so you can plan your next move.
            </p>
          </div>
        )}
      </div>

      <style jsx>{`
        .courses-shell {
          position: relative;
          z-index: 1;
          width: min(1200px, calc(100% - 2rem));
          margin: 0 auto;
          padding: 1.2rem 0 3rem;
          display: grid;
          gap: 1.2rem;
        }

        .courses-hero-panel {
          position: relative;
          overflow: hidden;
          isolation: isolate;
        }

        .courses-hero-panel > :not(.courses-hero-portrait):not(.courses-hero-texture) {
          position: relative;
          z-index: 1;
        }

        .courses-hero-portrait {
          position: absolute;
          inset: 0 0 0 auto;
          width: min(30rem, 40%);
          pointer-events: none;
          opacity: ${theme === "dark" ? 0.96 : 0.34};
          z-index: 0;
        }

        .courses-hero-portrait-core {
          position: absolute;
          inset: 1.1rem 1rem 1.1rem auto;
          width: min(22rem, 100%);
          border-radius: 28px;
          background:
            linear-gradient(270deg, rgba(0, 0, 0, 0.92) 4%, rgba(0, 0, 0, 0.48) 42%, transparent 100%),
            radial-gradient(circle at 58% 34%, rgba(255, 255, 255, 0.38) 0%, rgba(255, 255, 255, 0.08) 8%, transparent 13%),
            radial-gradient(circle at 48% 46%, rgba(255, 255, 255, 0.24) 0%, rgba(255, 255, 255, 0.06) 14%, transparent 26%),
            radial-gradient(circle at 46% 56%, rgba(255, 255, 255, 0.16) 0%, transparent 22%),
            linear-gradient(180deg, rgba(250, 250, 250, 0.18) 0%, rgba(12, 12, 12, 0.92) 26%, rgba(0, 0, 0, 0.98) 100%);
          filter: grayscale(1) contrast(1.18);
          box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.05);
        }

        .courses-hero-portrait-glow {
          position: absolute;
          inset: 12% 15% auto auto;
          width: 12rem;
          height: 12rem;
          border-radius: 999px;
          background: radial-gradient(circle, rgba(255, 255, 255, 0.16) 0%, transparent 72%);
          filter: blur(16px);
        }

        .courses-hero-texture {
          position: absolute;
          inset: 0;
          background:
            linear-gradient(90deg, ${theme === "dark" ? "rgba(23, 19, 17, 0.96)" : "rgba(255, 250, 242, 0.9)"} 0%, ${theme === "dark" ? "rgba(23, 19, 17, 0.88)" : "rgba(255, 250, 242, 0.82)"} 50%, rgba(0, 0, 0, 0) 78%),
            radial-gradient(circle at 18% 18%, rgba(255, 255, 255, 0.06) 0%, transparent 22%);
          z-index: 0;
          pointer-events: none;
        }

        .courses-hero-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.3fr) minmax(280px, 0.85fr);
          gap: 1rem;
          align-items: stretch;
        }

        .courses-stat-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 0.8rem;
        }

        .courses-toolbar {
          margin-top: 1.2rem;
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto;
          gap: 0.75rem;
          align-items: center;
        }

        .courses-search {
          display: grid;
          grid-template-columns: auto minmax(0, 1fr) auto;
          gap: 0.65rem;
          align-items: center;
          border-radius: 999px;
          border: 1px solid ${T.cardBorder};
          background: ${T.inputBg};
          padding: 0.92rem 1rem;
        }

        .courses-filter-row {
          display: flex;
          gap: 0.7rem;
          flex-wrap: wrap;
        }

        .courses-gallery-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 1rem;
        }

        .course-card {
          height: 100%;
          display: grid;
          grid-template-rows: 290px minmax(0, 1fr);
        }

        .course-card-art {
          padding: 0.85rem 0.85rem 0;
        }

        .course-card-copy {
          padding: 0.95rem 1rem 1rem;
          display: flex;
          flex-direction: column;
        }

        .course-chip {
          display: inline-flex;
          align-items: center;
          gap: 0.42rem;
          border-radius: 999px;
          border: 1px solid ${T.cardBorder};
          background: ${T.shell};
          color: ${T.textMuted};
          padding: 0.46rem 0.68rem;
          font-size: 0.72rem;
          font-family: "General Sans", sans-serif;
        }

        @media (max-width: 1023px) {
          .courses-shell {
            width: min(100%, calc(100% - 1.4rem));
            padding-top: 0.9rem;
          }

          .courses-hero-portrait {
            width: min(24rem, 42%);
          }

          .courses-hero-grid {
            grid-template-columns: 1fr;
          }

          .courses-stat-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }

          .courses-gallery-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 767px) {
          .courses-shell {
            width: min(100%, calc(100% - 1rem));
            padding-bottom: 1.6rem;
          }

          .courses-hero-panel {
            padding-bottom: 0.1rem;
          }

          .courses-hero-portrait {
            inset: auto 0 0 0;
            width: 100%;
            height: 16rem;
            opacity: ${theme === "dark" ? 0.52 : 0.2};
          }

          .courses-hero-portrait-core {
            inset: auto 0 0 auto;
            width: 72%;
            height: 100%;
          }

          .courses-hero-texture {
            background:
              linear-gradient(180deg, ${theme === "dark" ? "rgba(23, 19, 17, 0.96)" : "rgba(255, 250, 242, 0.94)"} 0%, ${theme === "dark" ? "rgba(23, 19, 17, 0.9)" : "rgba(255, 250, 242, 0.86)"} 64%, ${theme === "dark" ? "rgba(23, 19, 17, 0.98)" : "rgba(255, 250, 242, 0.92)"} 100%);
          }

          .courses-stat-grid {
            grid-template-columns: 1fr;
          }

          .courses-toolbar {
            grid-template-columns: 1fr;
          }

          .courses-gallery-grid {
            grid-template-columns: 1fr;
          }

          .course-card {
            grid-template-rows: 240px minmax(0, 1fr);
          }
        }
      `}</style>
    </div>
  );
}

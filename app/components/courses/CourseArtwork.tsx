import type { CSSProperties } from "react";
import Image from "next/image";
import { Clapperboard, Layers3, Lock, Orbit, Sparkles, Wand2, Zap } from "lucide-react";
import type { CourseRecord, CourseVisualTone } from "@/lib/courseCatalog";

type CourseArtworkProps = {
  course: CourseRecord;
  locked?: boolean;
  priority?: boolean;
  variant?: "card" | "hero" | "compact";
  showOverlayDetails?: boolean;
  style?: CSSProperties;
};

type ToneStyle = {
  accent: string;
  glow: string;
  gradient: string;
  panel: string;
  ring: string;
  icon: typeof Sparkles;
};

const TONES: Record<CourseVisualTone, ToneStyle> = {
  ember: {
    accent: "#FF7A1A",
    glow: "rgba(255, 122, 26, 0.45)",
    gradient: "linear-gradient(135deg, #21120A 0%, #5D2A12 45%, #FF7A1A 100%)",
    panel: "rgba(255, 122, 26, 0.16)",
    ring: "rgba(255, 218, 182, 0.24)",
    icon: Sparkles,
  },
  gold: {
    accent: "#F4B860",
    glow: "rgba(244, 184, 96, 0.42)",
    gradient: "linear-gradient(135deg, #1D160A 0%, #6B5320 44%, #F4B860 100%)",
    panel: "rgba(244, 184, 96, 0.16)",
    ring: "rgba(255, 239, 209, 0.22)",
    icon: Layers3,
  },
  lagoon: {
    accent: "#5ED7D1",
    glow: "rgba(94, 215, 209, 0.38)",
    gradient: "linear-gradient(135deg, #071A1D 0%, #0C4F57 42%, #5ED7D1 100%)",
    panel: "rgba(94, 215, 209, 0.14)",
    ring: "rgba(205, 255, 252, 0.22)",
    icon: Orbit,
  },
  violet: {
    accent: "#B28CFF",
    glow: "rgba(178, 140, 255, 0.4)",
    gradient: "linear-gradient(135deg, #140A21 0%, #4A2874 46%, #B28CFF 100%)",
    panel: "rgba(178, 140, 255, 0.15)",
    ring: "rgba(235, 224, 255, 0.2)",
    icon: Wand2,
  },
  jade: {
    accent: "#63D29D",
    glow: "rgba(99, 210, 157, 0.38)",
    gradient: "linear-gradient(135deg, #081A12 0%, #185A3B 44%, #63D29D 100%)",
    panel: "rgba(99, 210, 157, 0.14)",
    ring: "rgba(220, 255, 238, 0.22)",
    icon: Zap,
  },
  sunset: {
    accent: "#FF8E6A",
    glow: "rgba(255, 142, 106, 0.4)",
    gradient: "linear-gradient(135deg, #25120F 0%, #6B3026 44%, #FF8E6A 100%)",
    panel: "rgba(255, 142, 106, 0.16)",
    ring: "rgba(255, 222, 214, 0.24)",
    icon: Clapperboard,
  },
};

const VARIANTS = {
  compact: {
    padding: "0.85rem",
    badgeSize: "0.64rem",
    titleSize: "0.9rem",
    iconSize: 18,
    orbSize: 92,
  },
  card: {
    padding: "1rem",
    badgeSize: "0.68rem",
    titleSize: "1rem",
    iconSize: 22,
    orbSize: 118,
  },
  hero: {
    padding: "1.25rem",
    badgeSize: "0.72rem",
    titleSize: "1.25rem",
    iconSize: 28,
    orbSize: 154,
  },
} as const;

export default function CourseArtwork({
  course,
  locked = false,
  priority = false,
  variant = "card",
  showOverlayDetails = true,
  style,
}: CourseArtworkProps) {
  const tone = TONES[course.visualTone];
  const Icon = tone.icon;
  const sizes = VARIANTS[variant];
  const showPhotoPlaceholder = !course.thumbnailUrl && variant === "card";
  const showFloatingIcon = !showPhotoPlaceholder;

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        borderRadius: variant === "hero" ? "28px" : "22px",
        background: tone.gradient,
        color: "#FFF9F0",
        ...style,
      }}
    >
      {course.thumbnailUrl ? (
        <>
          <Image
            src={course.thumbnailUrl}
            alt={course.title}
            fill
            priority={priority}
            quality={82}
            sizes={
              variant === "hero"
                ? "(max-width: 1024px) 100vw, 42vw"
                : "(max-width: 767px) calc(100vw - 2rem), (max-width: 1023px) calc(50vw - 1.5rem), 360px"
            }
            style={{
              objectFit: "cover",
              objectPosition:
                variant === "card"
                  ? "center center"
                  : course.title.toLowerCase().includes("toon boom")
                    ? "center 36%"
                    : "center center",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                variant === "card"
                  ? "linear-gradient(180deg, rgba(12, 10, 8, 0.02) 0%, rgba(12, 10, 8, 0.1) 42%, rgba(12, 10, 8, 0.54) 100%)"
                  : "linear-gradient(180deg, rgba(12, 10, 8, 0.08) 0%, rgba(12, 10, 8, 0.22) 46%, rgba(12, 10, 8, 0.74) 100%)",
            }}
          />
        </>
      ) : (
        <>
          {showPhotoPlaceholder ? (
            <>
              <div
                style={{
                  position: "absolute",
                  inset: "0",
                  background:
                    "linear-gradient(180deg, rgba(12, 10, 8, 0.1) 0%, rgba(12, 10, 8, 0.2) 44%, rgba(12, 10, 8, 0.8) 100%)",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  inset: "1rem",
                  borderRadius: "18px",
                  border: "1px solid rgba(255,255,255,0.1)",
                  background:
                    "linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%)",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  inset: "1.5rem",
                  borderRadius: "16px",
                  border: "1px dashed rgba(255,255,255,0.16)",
                  display: "grid",
                  placeItems: "center",
                  color: "rgba(255, 247, 235, 0.62)",
                  fontSize: "0.72rem",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  fontFamily: "'General Sans', sans-serif",
                }}
              >
                Cover photo space
              </div>
            </>
          ) : (
            <>
              <div
                style={{
                  position: "absolute",
                  top: "-8%",
                  right: "-12%",
                  width: sizes.orbSize,
                  height: sizes.orbSize,
                  borderRadius: "999px",
                  background: tone.glow,
                  filter: "blur(12px)",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  bottom: "-10%",
                  left: "-6%",
                  width: sizes.orbSize * 0.82,
                  height: sizes.orbSize * 0.82,
                  borderRadius: "999px",
                  background: "rgba(255, 255, 255, 0.1)",
                  filter: "blur(18px)",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  inset: "10% 8% auto auto",
                  width: variant === "hero" ? "32%" : "38%",
                  aspectRatio: "1 / 1",
                  borderRadius: "22px",
                  border: `1px solid ${tone.ring}`,
                  background: tone.panel,
                  backdropFilter: "blur(10px)",
                  transform: "rotate(9deg)",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  inset: "auto auto 14% 8%",
                  width: variant === "hero" ? "40%" : "48%",
                  aspectRatio: "1 / 1",
                  borderRadius: "26px",
                  border: `1px solid ${tone.ring}`,
                  background:
                    "linear-gradient(180deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.04) 100%)",
                  backdropFilter: "blur(12px)",
                  transform: "rotate(-8deg)",
                }}
              />
            </>
          )}
        </>
      )}

      <div
        style={{
          position: "absolute",
          inset: sizes.padding,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.75rem" }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
              borderRadius: "999px",
              background: "rgba(12, 10, 8, 0.34)",
              border: "1px solid rgba(255,255,255,0.16)",
              padding: "0.38rem 0.7rem",
              fontSize: sizes.badgeSize,
              fontWeight: 700,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              fontFamily: "'General Sans', sans-serif",
            }}
          >
            <span
              style={{
                width: "0.45rem",
                height: "0.45rem",
                borderRadius: "999px",
                backgroundColor: tone.accent,
                boxShadow: `0 0 12px ${tone.glow}`,
              }}
            />
            {course.level}
          </span>

          {showFloatingIcon && (
            <div
              style={{
                width: variant === "hero" ? "3.25rem" : "2.65rem",
                height: variant === "hero" ? "3.25rem" : "2.65rem",
                borderRadius: variant === "hero" ? "18px" : "16px",
                background: "rgba(8, 8, 8, 0.24)",
                border: "1px solid rgba(255,255,255,0.18)",
                display: "grid",
                placeItems: "center",
                backdropFilter: "blur(12px)",
              }}
            >
              <Icon size={sizes.iconSize} style={{ color: "#FFF7EB" }} />
            </div>
          )}
        </div>

        {showOverlayDetails && (
          <div style={{ display: "grid", gap: "0.5rem" }}>
            {variant !== "card" && (
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.45rem",
                  width: "fit-content",
                  borderRadius: "999px",
                  padding: "0.35rem 0.68rem",
                  background: "rgba(8,8,8,0.28)",
                  border: "1px solid rgba(255,255,255,0.14)",
                  fontSize: "0.68rem",
                  fontFamily: "'General Sans', sans-serif",
                  color: "rgba(255, 247, 235, 0.84)",
                }}
              >
                <span>{course.lessons} lesson{course.lessons === 1 ? "" : "s"}</span>
                <span style={{ opacity: 0.55 }}>.</span>
                <span>{course.durationLabel}</span>
              </div>
            )}

            <div>
              <p
                style={{
                  margin: 0,
                  fontSize: variant === "card" ? "1.55rem" : sizes.titleSize,
                  lineHeight: 1.08,
                  letterSpacing: "-0.04em",
                  fontWeight: 700,
                  fontFamily: "'Clash Display', sans-serif",
                  maxWidth: variant === "hero" ? "70%" : "82%",
                  textShadow: "0 10px 30px rgba(0, 0, 0, 0.22)",
                }}
              >
                {course.title}
              </p>
              {variant === "card" && (
                <p
                  style={{
                    margin: "0.3rem 0 0",
                    fontSize: "0.74rem",
                    color: "rgba(255, 247, 235, 0.82)",
                    fontFamily: "'General Sans', sans-serif",
                  }}
                >
                  {course.instructor}
                </p>
              )}
              {variant !== "card" && (
                <p
                  style={{
                    margin: "0.35rem 0 0",
                    fontSize: variant === "hero" ? "0.82rem" : "0.72rem",
                    color: "rgba(255, 247, 235, 0.76)",
                    fontFamily: "'General Sans', sans-serif",
                  }}
                >
                  With {course.instructor}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {locked && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(8, 8, 8, 0.42)",
            backdropFilter: "blur(4px)",
            display: "grid",
            placeItems: "center",
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.55rem 0.85rem",
              borderRadius: "999px",
              background: "rgba(10, 10, 10, 0.58)",
              border: "1px solid rgba(255,255,255,0.14)",
              fontSize: "0.72rem",
              fontWeight: 700,
              fontFamily: "'General Sans', sans-serif",
              color: "#FFF7EB",
            }}
          >
            <Lock size={15} />
            Locked preview
          </div>
        </div>
      )}
    </div>
  );
}

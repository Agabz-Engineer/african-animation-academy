"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import {
  ArrowRight,
  CalendarDays,
  CalendarPlus,
  Clock3,
  Download,
  Sparkles,
  Users,
  Video,
} from "lucide-react";

const FILTERS = [
  "All",
  "Upcoming",
  "Past",
  "Workshops",
  "Challenges",
  "Live Critiques",
  "Mentorship",
] as const;

type Filter = (typeof FILTERS)[number];
type EventType = "Workshops" | "Challenges" | "Live Critiques" | "Mentorship";
type EventStatus = "Upcoming" | "Past";

type ShowcaseEvent = {
  id: string;
  type: EventType;
  status: EventStatus;
  title: string;
  host: string;
  date: string;
  time: string;
  attendees: number;
  description: string;
};

const FEATURED_EVENT = {
  title: "Live Character Blocking Clinic",
  date: "March 10, 2026",
  time: "7:00 PM GMT",
  host: "Nana A. Owusu",
};

const SHOWCASE_EVENTS: ShowcaseEvent[] = [
  {
    id: "evt-1",
    type: "Workshops",
    status: "Upcoming",
    title: "Cinematic Lighting for Stylized Animation",
    host: "Ama Serwaa",
    date: "Mar 12",
    time: "6:30 PM GMT",
    attendees: 182,
    description:
      "A high-focus workshop on color temperature, shot rhythm, and mood transitions for premium animated scenes.",
  },
  {
    id: "evt-2",
    type: "Challenges",
    status: "Upcoming",
    title: "48-Hour Motion Challenge: Kente in Motion",
    host: "Kofi Mensah",
    date: "Mar 16",
    time: "All day",
    attendees: 264,
    description:
      "Build a 20-second sequence using one pattern system and one camera move. Best entries get live feedback on stream.",
  },
  {
    id: "evt-3",
    type: "Live Critiques",
    status: "Upcoming",
    title: "Portfolio Teardown: Story Beats and Clarity",
    host: "Adjoa Biney",
    date: "Mar 20",
    time: "5:00 PM GMT",
    attendees: 143,
    description:
      "Submit one project and get practical notes on pacing, readability, and art-direction consistency from a studio lens.",
  },
  {
    id: "evt-4",
    type: "Mentorship",
    status: "Past",
    title: "Mentor Office Hours: Career Map for Juniors",
    host: "Kojo Akwasi",
    date: "Feb 04",
    time: "8:00 PM GMT",
    attendees: 98,
    description:
      "Past session on positioning, outreach scripts, and long-term growth plans for artists entering studio pipelines.",
  },
];

const TIMELINE_EVENTS = [
  {
    day: "10",
    month: "MAR",
    title: "Live Character Blocking Clinic",
    detail: "Realtime pose-to-pose workflows with timing notes and Q&A.",
    time: "7:00 PM GMT",
  },
  {
    day: "12",
    month: "MAR",
    title: "Cinematic Lighting Workshop",
    detail: "Premium color scripting and contrast ladders for storytelling.",
    time: "6:30 PM GMT",
  },
  {
    day: "16",
    month: "MAR",
    title: "Kente in Motion Challenge Kickoff",
    detail: "Brief launch, rules, scoring matrix, and reference pack.",
    time: "1:00 PM GMT",
  },
  {
    day: "20",
    month: "MAR",
    title: "Live Portfolio Critiques",
    detail: "Focused reviews with clear upgrade recommendations.",
    time: "5:00 PM GMT",
  },
];

const TIMELINE_SWATCHES_DARK: Array<[string, string]> = [
  ["rgba(173,68,49,0.94)", "rgba(255,132,52,0.92)"],
  ["rgba(43,126,177,0.92)", "rgba(24,162,202,0.9)"],
  ["rgba(211,141,36,0.92)", "rgba(255,185,67,0.9)"],
  ["rgba(73,173,94,0.92)", "rgba(126,203,99,0.9)"],
];

const TIMELINE_SWATCHES_LIGHT: Array<[string, string]> = [
  ["rgba(255,160,133,0.94)", "rgba(255,190,127,0.92)"],
  ["rgba(129,197,228,0.92)", "rgba(113,220,245,0.9)"],
  ["rgba(252,208,120,0.92)", "rgba(255,228,152,0.9)"],
  ["rgba(149,218,162,0.92)", "rgba(176,230,153,0.9)"],
];

const PAST_EVENTS = [
  {
    id: "past-1",
    title: "Afro-Futurist Environments Masterclass",
    replay: "58 min replay",
    resources: ["Slides", "Color LUT Pack", "Scene Files"],
  },
  {
    id: "past-2",
    title: "Animating Cloth and Cultural Fabrics",
    replay: "42 min replay",
    resources: ["Demo File", "Brush Pack", "Checklist"],
  },
  {
    id: "past-3",
    title: "Pitching Animated Shorts to Studios",
    replay: "1h 11m replay",
    resources: ["Pitch Deck", "Template", "Contracts Notes"],
  },
];

const DARK = {
  panel: "rgba(20,17,14,0.92)",
  card: "rgba(28,24,20,0.9)",
  border: "#383029",
  text: "#FAF8F0",
  muted: "#C8C0B2",
  dim: "#968C7C",
  accent: "#FF8C00",
  accentSoft: "rgba(255,140,0,0.14)",
  coolA: "rgba(38,88,156,0.34)",
  coolB: "rgba(20,48,98,0.56)",
  slot: "linear-gradient(135deg, rgba(23,57,106,0.48), rgba(17,18,24,0.68))",
  slotStroke: "rgba(173,205,255,0.35)",
  overlay: "rgba(12,11,9,0.82)",
};

const LIGHT = {
  panel: "rgba(255,250,241,0.92)",
  card: "rgba(255,255,255,0.92)",
  border: "#E2D5C2",
  text: "#1C1C1C",
  muted: "#5A534A",
  dim: "#8A8175",
  accent: "#FF8C00",
  accentSoft: "rgba(255,140,0,0.12)",
  coolA: "rgba(116,162,232,0.25)",
  coolB: "rgba(156,193,245,0.36)",
  slot: "linear-gradient(135deg, rgba(208,229,255,0.78), rgba(236,243,255,0.96))",
  slotStroke: "rgba(41,86,145,0.26)",
  overlay: "rgba(18,18,18,0.74)",
};

const getInitialTheme = (): "dark" | "light" => {
  if (typeof window === "undefined") return "dark";
  const saved = localStorage.getItem("africafx-theme");
  if (saved === "dark" || saved === "light") return saved;
  const attr = document.documentElement.getAttribute("data-theme");
  return attr === "light" ? "light" : "dark";
};

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export default function EventsPage() {
  const [theme, setTheme] = useState<"dark" | "light">(getInitialTheme);
  const [activeFilter, setActiveFilter] = useState<Filter>("All");
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  useEffect(() => {
    const obs = new MutationObserver(() => {
      const t = document.documentElement.getAttribute("data-theme") as
        | "dark"
        | "light";
      if (t) setTheme(t);
    });
    obs.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    return () => obs.disconnect();
  }, []);

  const T = theme === "dark" ? DARK : LIGHT;

  const events = useMemo(() => {
    if (activeFilter === "All") return SHOWCASE_EVENTS;
    if (activeFilter === "Upcoming" || activeFilter === "Past") {
      return SHOWCASE_EVENTS.filter((event) => event.status === activeFilter);
    }
    return SHOWCASE_EVENTS.filter((event) => event.type === activeFilter);
  }, [activeFilter]);

  const heroRef = useRef<HTMLElement | null>(null);
  const heroIn = useInView(heroRef, { once: true, amount: 0.2 });

  const filtersRef = useRef<HTMLElement | null>(null);
  const filtersIn = useInView(filtersRef, { once: true, amount: 0.3 });

  const showcaseRef = useRef<HTMLElement | null>(null);
  const showcaseIn = useInView(showcaseRef, { once: true, amount: 0.15 });

  const timelineRef = useRef<HTMLElement | null>(null);
  const timelineIn = useInView(timelineRef, { once: true, amount: 0.2 });

  const pastRef = useRef<HTMLElement | null>(null);
  const pastIn = useInView(pastRef, { once: true, amount: 0.2 });

  const reveal = (inView: boolean) => (inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 60 });

  const timelineArrowStyle = (index: number) => {
    const swatches = theme === "dark" ? TIMELINE_SWATCHES_DARK : TIMELINE_SWATCHES_LIGHT;
    const [from, to] = swatches[index % swatches.length];
    const veil = theme === "dark" ? "rgba(15,13,11,0.20)" : "rgba(255,255,255,0.28)";
    return {
      backgroundImage: `linear-gradient(135deg, ${from}, ${to}), linear-gradient(0deg, ${veil}, ${veil}), url('/images/bg-desktop.jpg')`,
      backgroundSize: "cover, cover, cover",
      backgroundPosition: "center, center, center",
      color: theme === "dark" ? "#FAF8F0" : "#1C1C1C",
    };
  };

  return (
    <div className="events" style={{ color: T.text }}>
      <div className="glow glowA" style={{ background: T.coolA }} />
      <div className="glow glowB" style={{ background: T.coolB }} />

      <motion.section
        ref={heroRef}
        className="section"
        initial={{ opacity: 0, y: 60 }}
        animate={reveal(heroIn)}
        transition={{ duration: 0.7, ease: EASE }}
      >
        <div className="hero" style={{ background: T.panel, borderColor: T.border }}>
          <div className="heroBlob" style={{ background: T.coolA }} />
          <div className="heroLeft">
            {[
              <div key="k" className="kicker" style={{ color: T.muted, borderColor: T.border }}>
                <Sparkles style={{ width: "13px", height: "13px", color: T.accent }} /> Featured Event
              </div>,
              <h1 key="t" className="title">{FEATURED_EVENT.title}</h1>,
              <div key="m" className="heroMeta" style={{ color: T.muted }}>
                <span><CalendarDays style={{ width: "14px", height: "14px" }} /> {FEATURED_EVENT.date}</span>
                <span><Clock3 style={{ width: "14px", height: "14px" }} /> {FEATURED_EVENT.time}</span>
                <span><Users style={{ width: "14px", height: "14px" }} /> Host: {FEATURED_EVENT.host}</span>
              </div>,
              <button
                key="c"
                className="primaryBtn"
                style={{ background: T.accent, color: theme === "dark" ? "#1C1C1C" : "#FFFFFF" }}
              >
                Join Live Session <ArrowRight style={{ width: "15px", height: "15px" }} />
              </button>,
            ].map((node, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 60 }}
                animate={reveal(heroIn)}
                transition={{ duration: 0.62, delay: index * 0.1, ease: EASE }}
              >
                {node}
              </motion.div>
            ))}
          </div>

          <div className="heroRight">
            <motion.div
              initial={{ opacity: 0, y: 60 }}
              animate={reveal(heroIn)}
              transition={{ duration: 0.62, delay: 0.3, ease: EASE }}
              className="live"
              style={{ background: T.accentSoft, borderColor: `${T.accent}66`, color: T.accent }}
            >
              <span className="pulse" /> LIVE NOW
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 60 }}
              animate={reveal(heroIn)}
              transition={{ duration: 0.62, delay: 0.4, ease: EASE }}
              className="hexSlot"
              style={{ background: T.slot, borderColor: T.slotStroke }}
            >
              <span className="slotText">IMAGE SLOT</span>
            </motion.div>
          </div>
        </div>
      </motion.section>

      <motion.section
        ref={filtersRef}
        className="section tight"
        initial={{ opacity: 0, y: 60 }}
        animate={reveal(filtersIn)}
        transition={{ duration: 0.7, ease: EASE }}
      >
        <div className="filters">
          {FILTERS.map((filter, index) => {
            const active = activeFilter === filter;
            return (
              <motion.button
                key={filter}
                initial={{ opacity: 0, y: 60 }}
                animate={reveal(filtersIn)}
                transition={{ duration: 0.58, delay: index * 0.1, ease: EASE }}
                onClick={() => setActiveFilter(filter)}
                className="pill"
                style={{
                  borderColor: active ? T.accent : T.border,
                  background: active ? T.accent : T.card,
                  color: active ? (theme === "dark" ? "#1C1C1C" : "#FFFFFF") : T.muted,
                }}
              >
                {active && <motion.span layoutId="filterPill" className="pillActive" />}
                <span className="pillTxt">{filter}</span>
              </motion.button>
            );
          })}
        </div>
      </motion.section>

      <motion.section
        ref={showcaseRef}
        className="section"
        initial={{ opacity: 0, y: 60 }}
        animate={reveal(showcaseIn)}
        transition={{ duration: 0.7, ease: EASE }}
      >
        <motion.h2
          initial={{ opacity: 0, y: 60 }}
          animate={reveal(showcaseIn)}
          transition={{ duration: 0.62, delay: 0, ease: EASE }}
          className="sectionTitle"
        >
          Events Showcase
        </motion.h2>

        <div className="stack">
          {events.map((event, index) => {
            const left = index % 2 === 0;
            const hovered = hoveredCard === event.id;
            return (
              <motion.article
                key={event.id}
                initial={{ opacity: 0, y: 60 }}
                animate={reveal(showcaseIn)}
                transition={{ duration: 0.62, delay: index * 0.1, ease: EASE }}
                className="card"
                style={{ borderColor: T.border, background: T.card }}
                onHoverStart={() => setHoveredCard(event.id)}
                onHoverEnd={() => setHoveredCard(null)}
              >
                <div className={`cardInner ${left ? "" : "rev"}`}>
                  <motion.div
                    className={`media ${left ? "cutL" : "cutR"}`}
                    style={{ background: T.slot, borderColor: T.slotStroke }}
                    animate={{ scale: hovered ? 1.05 : 1 }}
                    transition={{ duration: 0.35, ease: EASE }}
                  >
                    <span className="slotText">IMAGE SLOT</span>
                    <motion.div
                      className="overlay"
                      style={{ background: T.overlay }}
                      initial={false}
                      animate={{ y: hovered ? 0 : "100%", opacity: hovered ? 1 : 0 }}
                      transition={{ duration: 0.25, ease: EASE }}
                    >
                      <p>{event.description}</p>
                      <div className="overlayActions">
                        <button style={{ background: T.accent, color: theme === "dark" ? "#1C1C1C" : "#FFFFFF" }}>
                          Reserve Seat
                        </button>
                        <button style={{ borderColor: `${T.accent}77`, color: T.text }}>Details</button>
                      </div>
                    </motion.div>
                  </motion.div>

                  <div className="copy">
                    <span className="type" style={{ background: T.accentSoft, color: T.accent }}>{event.type}</span>
                    <h3>{event.title}</h3>
                    <div className="meta" style={{ color: T.muted }}>
                      <span><CalendarDays style={{ width: "13px", height: "13px" }} /> {event.date}</span>
                      <span><Clock3 style={{ width: "13px", height: "13px" }} /> {event.time}</span>
                      <span><Users style={{ width: "13px", height: "13px" }} /> {event.attendees} attending</span>
                    </div>
                  </div>
                </div>

                <div className={`host ${left ? "right" : "left"}`} style={{ background: T.slot, borderColor: T.slotStroke, color: T.muted }}>
                  <span>HOST SLOT</span>
                  <strong>{event.host}</strong>
                </div>
              </motion.article>
            );
          })}

          {events.length === 0 && (
            <div className="empty" style={{ borderColor: T.border, background: T.card, color: T.muted }}>
              No events match this filter yet.
            </div>
          )}
        </div>
      </motion.section>

      <motion.section
        ref={timelineRef}
        className="section"
        initial={{ opacity: 0, y: 60 }}
        animate={reveal(timelineIn)}
        transition={{ duration: 0.7, ease: EASE }}
      >
        <motion.h2
          initial={{ opacity: 0, y: 60 }}
          animate={reveal(timelineIn)}
          transition={{ duration: 0.62, delay: 0, ease: EASE }}
          className="sectionTitle"
        >
          Upcoming Timeline
        </motion.h2>

        <div className="timelineBoard" style={{ borderColor: T.border, background: T.card }}>
          <div className="timelineStrip">
            {TIMELINE_EVENTS.map((item, index) => {
              const top = index % 2 === 0;
              return (
                <motion.div
                  key={`${item.day}-${item.title}`}
                  className="timelineStage"
                  initial={{ opacity: 0, y: 60 }}
                  animate={reveal(timelineIn)}
                  transition={{ duration: 0.62, delay: index * 0.1, ease: EASE }}
                >
                  <div
                    className={`timelineCallout ${top ? "top" : "bottom"}`}
                    style={{
                      borderColor: T.border,
                      background:
                        theme === "dark" ? "rgba(12,11,9,0.84)" : "rgba(255,255,255,0.92)",
                    }}
                  >
                    <h3>{item.title}</h3>
                    <p style={{ color: T.muted }}>{item.detail}</p>
                    <div className="timelineMeta" style={{ color: T.dim }}>
                      <span><Clock3 style={{ width: "12px", height: "12px" }} /> {item.time}</span>
                      <span><CalendarPlus style={{ width: "12px", height: "12px" }} /> Add to calendar</span>
                    </div>
                  </div>

                  <div
                    className={`timelineConnector ${top ? "top" : "bottom"}`}
                    style={{ borderColor: `${T.dim}88` }}
                  >
                    <span
                      className="timelineConnectorDot"
                      style={{
                        background: T.accent,
                        boxShadow: `0 0 0 4px ${T.accent}26`,
                      }}
                    />
                  </div>

                  <div
                    className={`timelineArrow ${index === 0 ? "first" : ""} ${index === TIMELINE_EVENTS.length - 1 ? "last" : ""}`}
                    style={timelineArrowStyle(index)}
                  >
                    <span className="arrowDay">{item.day}</span>
                    <span className="arrowMonth">{item.month}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.section>

      <motion.section
        ref={pastRef}
        className="section"
        initial={{ opacity: 0, y: 60 }}
        animate={reveal(pastIn)}
        transition={{ duration: 0.7, ease: EASE }}
      >
        <motion.h2
          initial={{ opacity: 0, y: 60 }}
          animate={reveal(pastIn)}
          transition={{ duration: 0.62, delay: 0, ease: EASE }}
          className="sectionTitle"
        >
          Past Events
        </motion.h2>

        <div className="pastRow">
          {PAST_EVENTS.map((event, index) => (
            <motion.article
              key={event.id}
              className="pastCard"
              initial={{ opacity: 0, y: 60 }}
              animate={reveal(pastIn)}
              transition={{ duration: 0.62, delay: index * 0.1, ease: EASE }}
              style={{ borderColor: T.border, background: T.card, color: T.text }}
            >
              <div className="pastMedia" style={{ background: T.slot, borderColor: T.slotStroke }}>
                <span className="slotText">IMAGE SLOT</span>
              </div>
              <h3>{event.title}</h3>
              <p style={{ color: T.dim }}>{event.replay}</p>
              <button className="replay" style={{ background: T.accent, color: theme === "dark" ? "#1C1C1C" : "#FFFFFF" }}>
                <Video style={{ width: "14px", height: "14px" }} /> Watch Replay
              </button>
              <div className="chips">
                {event.resources.map((resource) => (
                  <span key={resource} className="chip" style={{ borderColor: T.border, color: T.muted }}>
                    <Download style={{ width: "11px", height: "11px" }} /> {resource}
                  </span>
                ))}
              </div>
            </motion.article>
          ))}
        </div>
      </motion.section>

      <style jsx>{`
        .events { position: relative; padding: 1.75rem 2rem 4rem; overflow: hidden; }
        .glow { position: absolute; width: 34rem; height: 34rem; border-radius: 999px; filter: blur(120px); pointer-events: none; z-index: 0; }
        .glowA { top: -10rem; right: -10rem; }
        .glowB { left: -12rem; bottom: 18rem; }

        .section { position: relative; z-index: 1; margin-bottom: 1.2rem; }
        .tight { margin-top: 1.2rem; margin-bottom: 2rem; }
        .sectionTitle { font-family: "Clash Display", sans-serif; font-size: clamp(1.35rem, 3vw, 1.9rem); letter-spacing: -0.02em; margin-bottom: 1rem; }

        .hero { border: 1px solid; border-radius: 30px; min-height: 23rem; overflow: hidden; display: grid; grid-template-columns: 1.3fr 1fr; position: relative; }
        .heroBlob { position: absolute; right: 27%; top: -40%; width: 22rem; height: 24rem; border-radius: 40% 56% 62% 38%; z-index: 0; }
        .heroLeft, .heroRight { padding: 2rem; position: relative; z-index: 1; }
        .heroLeft { display: flex; flex-direction: column; justify-content: center; gap: 0.9rem; }
        .kicker { border: 1px solid; border-radius: 999px; width: fit-content; padding: 0.42rem 0.85rem; display: inline-flex; gap: 0.42rem; align-items: center; font: 600 0.74rem "General Sans", sans-serif; letter-spacing: 0.05em; text-transform: uppercase; }
        .title { font-family: "Clash Display", sans-serif; font-weight: 700; font-size: clamp(2rem, 5.4vw, 3.6rem); letter-spacing: -0.03em; line-height: 0.95; max-width: 13ch; }
        .heroMeta { display: flex; flex-wrap: wrap; gap: 0.9rem; font: 500 0.84rem "General Sans", sans-serif; }
        .heroMeta span { display: inline-flex; gap: 0.35rem; align-items: center; }
        .primaryBtn { border: none; border-radius: 12px; width: fit-content; padding: 0.72rem 1rem; display: inline-flex; gap: 0.42rem; align-items: center; font: 700 0.83rem "General Sans", sans-serif; cursor: pointer; box-shadow: 0 10px 26px rgba(255, 140, 0, 0.24); }
        .heroRight { display: flex; align-items: center; justify-content: center; }
        .live { position: absolute; top: 1.2rem; right: 1.2rem; border: 1px solid; border-radius: 999px; padding: 0.4rem 0.72rem; display: inline-flex; gap: 0.35rem; align-items: center; font: 700 0.72rem "General Sans", sans-serif; }
        .pulse { width: 0.52rem; height: 0.52rem; clip-path: polygon(15% 0, 85% 0, 100% 50%, 85% 100%, 15% 100%, 0 50%); background: currentColor; animation: pulseLive 1.2s infinite; }
        .hexSlot { width: min(22rem, 88%); aspect-ratio: 1 / 1; clip-path: polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%); border: 1.4px dashed; display: flex; align-items: center; justify-content: center; }
        .slotText { font: 700 0.75rem "General Sans", sans-serif; letter-spacing: 0.16em; text-transform: uppercase; opacity: 0.66; }

        .filters { display: flex; gap: 0.52rem; overflow-x: auto; padding-bottom: 0.4rem; scrollbar-width: none; }
        .filters::-webkit-scrollbar { width: 0; height: 0; }
        .pill { position: relative; border: 1px solid; border-radius: 999px; padding: 0.48rem 0.92rem; white-space: nowrap; cursor: pointer; font: 600 0.8rem "General Sans", sans-serif; overflow: hidden; }
        .pillActive { position: absolute; inset: 0; border-radius: inherit; background: currentColor; opacity: 0.08; }
        .pillTxt { position: relative; z-index: 1; }

        .stack { display: flex; flex-direction: column; padding-top: 0.4rem; }
        .card { position: relative; border: 1px solid; border-radius: 22px; overflow: visible; }
        .card + .card { margin-top: -1.45rem; }
        .cardInner { display: grid; grid-template-columns: 1fr 1fr; min-height: 20rem; }
        .cardInner.rev { direction: rtl; }
        .cardInner.rev > * { direction: ltr; }
        .media { position: relative; margin: 1rem; border: 1.4px dashed; min-height: 17rem; display: flex; align-items: center; justify-content: center; overflow: hidden; }
        .cutL { clip-path: polygon(0 0, 100% 0, 95% 100%, 0% 100%); }
        .cutR { clip-path: polygon(5% 0, 100% 0, 100% 100%, 0% 100%); }
        .overlay { position: absolute; left: 0; right: 0; bottom: 0; padding: 1rem; display: flex; flex-direction: column; gap: 0.7rem; }
        .overlay p { color: #f8f6ef; font: 500 0.79rem "General Sans", sans-serif; line-height: 1.45; }
        .overlayActions { display: flex; gap: 0.5rem; }
        .overlayActions button { border: 1px solid transparent; border-radius: 10px; padding: 0.5rem 0.75rem; background: transparent; cursor: pointer; font: 700 0.72rem "General Sans", sans-serif; }
        .copy { padding: 1.4rem 1.4rem 1.4rem 1rem; display: flex; flex-direction: column; justify-content: center; gap: 0.78rem; }
        .type { width: fit-content; border-radius: 999px; padding: 0.28rem 0.66rem; font: 700 0.72rem "General Sans", sans-serif; letter-spacing: 0.05em; text-transform: uppercase; }
        .copy h3 { font-family: "Clash Display", sans-serif; font-size: clamp(1.18rem, 2.4vw, 1.8rem); line-height: 1.02; letter-spacing: -0.02em; max-width: 18ch; }
        .meta { display: grid; gap: 0.45rem; font: 500 0.8rem "General Sans", sans-serif; }
        .meta span { display: inline-flex; align-items: center; gap: 0.35rem; }
        .host { position: absolute; top: -1rem; width: 7.6rem; min-height: 6.5rem; border: 1.4px solid; clip-path: polygon(8% 0, 100% 0, 92% 100%, 0% 100%); padding: 0.45rem 0.55rem; display: flex; flex-direction: column; justify-content: flex-end; gap: 0.14rem; }
        .host.left { left: 1.2rem; }
        .host.right { right: 1.2rem; }
        .host span { font: 700 0.62rem "General Sans", sans-serif; opacity: 0.82; text-transform: uppercase; letter-spacing: 0.08em; }
        .host strong { font: 700 0.78rem "General Sans", sans-serif; line-height: 1.2; }
        .empty { border: 1px solid; border-radius: 16px; padding: 1rem; font: 600 0.9rem "General Sans", sans-serif; }

        .timelineBoard { border: 1px solid; border-radius: 22px; padding: 1.05rem; overflow-x: auto; overflow-y: hidden; }
        .timelineStrip { min-width: 860px; display: grid; grid-template-columns: repeat(4, minmax(180px, 1fr)); align-items: center; }
        .timelineStage { position: relative; height: 17.5rem; display: flex; align-items: center; justify-content: center; }
        .timelineCallout {
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
          width: calc(100% - 0.95rem);
          border: 1px solid;
          border-radius: 12px;
          padding: 0.55rem 0.65rem;
          backdrop-filter: blur(9px);
        }
        .timelineCallout.top { top: 0.4rem; }
        .timelineCallout.bottom { bottom: 0.4rem; }
        .timelineCallout h3 { font: 700 0.79rem "General Sans", sans-serif; margin-bottom: 0.22rem; line-height: 1.28; }
        .timelineCallout p { font: 500 0.69rem "General Sans", sans-serif; line-height: 1.32; margin-bottom: 0.35rem; }
        .timelineMeta { display: flex; flex-wrap: wrap; gap: 0.48rem; font: 600 0.62rem "General Sans", sans-serif; }
        .timelineMeta span { display: inline-flex; gap: 0.2rem; align-items: center; }
        .timelineConnector {
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
          width: 0;
          height: 3.7rem;
          border-left: 2px dashed;
          pointer-events: none;
        }
        .timelineConnector.top { top: 4.68rem; }
        .timelineConnector.bottom { bottom: 4.68rem; }
        .timelineConnectorDot {
          width: 8px;
          height: 8px;
          border-radius: 999px;
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
        }
        .timelineConnector.top .timelineConnectorDot { bottom: -4px; }
        .timelineConnector.bottom .timelineConnectorDot { top: -4px; }
        .timelineArrow {
          position: relative;
          width: calc(100% + 6px);
          height: 3.05rem;
          margin-right: -6px;
          clip-path: polygon(0 0, 88% 0, 100% 50%, 88% 100%, 0 100%, 8% 50%);
          border: 1px solid rgba(255,255,255,0.26);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.42rem;
          text-shadow: 0 1px 2px rgba(0,0,0,0.35);
          box-shadow: inset 0 0 0 1px rgba(255,255,255,0.06), 0 8px 18px rgba(0,0,0,0.2);
          isolation: isolate;
        }
        .timelineArrow::after {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(255,255,255,0.16), rgba(255,255,255,0));
          mix-blend-mode: soft-light;
          pointer-events: none;
        }
        .timelineArrow.first {
          clip-path: polygon(0 0, 88% 0, 100% 50%, 88% 100%, 0 100%);
        }
        .timelineArrow.last {
          margin-right: 0;
          width: 100%;
          clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%, 8% 50%);
        }
        .arrowDay {
          font-family: "Clash Display", sans-serif;
          font-size: 1.43rem;
          font-weight: 700;
          letter-spacing: -0.01em;
          line-height: 1;
        }
        .arrowMonth {
          font: 700 0.68rem "General Sans", sans-serif;
          letter-spacing: 0.08em;
          opacity: 0.96;
        }

        .pastRow { display: grid; grid-auto-flow: column; grid-auto-columns: minmax(17.8rem, 20rem); gap: 0.9rem; overflow-x: auto; padding-bottom: 0.4rem; }
        .pastCard { border: 1px solid; border-radius: 18px; padding: 1rem; overflow: hidden; position: relative; filter: saturate(0.72); }
        .pastMedia { width: 100%; height: 9.6rem; border: 1.2px dashed; border-radius: 14px; margin-bottom: 0.75rem; display: flex; align-items: center; justify-content: center; }
        .pastCard h3 { font-family: "Clash Display", sans-serif; font-size: 1.06rem; margin-bottom: 0.35rem; }
        .pastCard p { font: 500 0.75rem "General Sans", sans-serif; margin-bottom: 0.72rem; }
        .replay { border: none; border-radius: 11px; padding: 0.56rem 0.76rem; margin-bottom: 0.74rem; display: inline-flex; gap: 0.32rem; align-items: center; cursor: pointer; font: 700 0.75rem "General Sans", sans-serif; }
        .chips { display: flex; flex-wrap: wrap; gap: 0.42rem; }
        .chip { border: 1px solid; border-radius: 999px; padding: 0.25rem 0.5rem; display: inline-flex; gap: 0.3rem; align-items: center; font: 600 0.68rem "General Sans", sans-serif; }

        @keyframes pulseLive { 0% { transform: scale(0.9); opacity: 1; } 70% { transform: scale(1.2); opacity: 0.35; } 100% { transform: scale(0.9); opacity: 1; } }

        @media (max-width: 1023px) { .card + .card { margin-top: -0.8rem; } }
        @media (max-width: 767px) {
          .events { padding: 1rem 1rem 2.8rem; }
          .hero { grid-template-columns: 1fr; min-height: auto; }
          .heroBlob { right: -25%; top: 40%; width: 18rem; height: 16rem; }
          .heroLeft, .heroRight { padding: 1.25rem; }
          .heroRight { padding-top: 0.25rem; padding-bottom: 1.4rem; }
          .title { max-width: 12ch; }
          .live { top: 0.6rem; right: 0.7rem; }
          .hexSlot { width: min(18rem, 94%); margin-top: 0.6rem; }
          .card + .card { margin-top: 0.65rem; }
          .cardInner, .cardInner.rev { display: flex; flex-direction: column; }
          .media { min-height: 12rem; margin: 0.8rem 0.8rem 0; }
          .copy { padding: 1rem 0.9rem 1.2rem; }
          .host { top: 0.45rem; width: 6.4rem; min-height: 5rem; }
          .host.left { left: auto; right: 0.9rem; }
          .timelineBoard { padding: 0.75rem; }
          .timelineStrip { min-width: 780px; grid-template-columns: repeat(4, minmax(170px, 1fr)); }
          .timelineStage { height: 16.6rem; }
          .timelineCallout { width: calc(100% - 0.62rem); padding: 0.48rem 0.54rem; }
          .timelineCallout h3 { font-size: 0.72rem; }
          .timelineCallout p { font-size: 0.64rem; }
          .timelineMeta { font-size: 0.58rem; gap: 0.36rem; }
          .timelineConnector { height: 3.32rem; }
          .timelineConnector.top { top: 4.45rem; }
          .timelineConnector.bottom { bottom: 4.45rem; }
          .timelineArrow { height: 2.75rem; gap: 0.35rem; }
          .arrowDay { font-size: 1.24rem; }
          .arrowMonth { font-size: 0.62rem; }
        }
      `}</style>
    </div>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";

export type GamificationAction =
  | "daily_login"
  | "post"
  | "comment"
  | "like"
  | "course_session";

type QuestDefinition = {
  id: string;
  title: string;
  hint: string;
  action: GamificationAction;
  target: number;
  rewardXp: number;
  href: string;
};

type GamificationStats = {
  likesGiven: number;
  commentsGiven: number;
  postsPublished: number;
  courseSessions: number;
  questCompletions: number;
};

type GamificationState = {
  version: number;
  totalXp: number;
  level: number;
  streak: number;
  lastActiveDate: string | null;
  questDay: string;
  questProgress: Record<string, number>;
  completedQuestIds: string[];
  stats: GamificationStats;
};

export type QuestWithProgress = QuestDefinition & {
  progress: number;
  completed: boolean;
  remaining: number;
};

const STORAGE_VERSION = 1;
const STORAGE_PREFIX = "africafx-gamify-v1";
const SYNC_EVENT = "africafx-gamify-sync";

const LEVEL_THRESHOLDS = [0, 300, 900, 1800, 3200, 5200, 7800, 11000, 15000];
const LEVEL_NAMES = [
  "Apprentice Animator",
  "Keyframe Artist",
  "Motion Sculptor",
  "Rig Architect",
  "Fluid Maestro",
  "Scene Director",
  "Studio Veteran",
  "Master Animator",
  "Legend of the Frame",
];

const ACTION_BASE_XP: Record<GamificationAction, number> = {
  daily_login: 0,
  post: 12,
  comment: 8,
  like: 5,
  course_session: 10,
};

const QUESTS: QuestDefinition[] = [
  {
    id: "q_daily_login",
    title: "Check in today",
    hint: "Keep your daily streak alive.",
    action: "daily_login",
    target: 1,
    rewardXp: 10,
    href: "/dashboard",
  },
  {
    id: "q_post_wip",
    title: "Share one WIP post",
    hint: "Post progress so others can support you.",
    action: "post",
    target: 1,
    rewardXp: 30,
    href: "/community",
  },
  {
    id: "q_feedback",
    title: "Give two feedback comments",
    hint: "Helpful critique grows the whole community.",
    action: "comment",
    target: 2,
    rewardXp: 40,
    href: "/community",
  },
  {
    id: "q_support",
    title: "Like three creator posts",
    hint: "Support peers and discover fresh work.",
    action: "like",
    target: 3,
    rewardXp: 25,
    href: "/community",
  },
  {
    id: "q_learn",
    title: "Start one course session",
    hint: "Spend a focused block improving your craft.",
    action: "course_session",
    target: 1,
    rewardXp: 20,
    href: "/courses",
  },
];

const getStorageKey = (userId: string | null | undefined) =>
  `${STORAGE_PREFIX}:${userId || "guest"}`;

const toDayKey = (date = new Date()) => {
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, "0");
  const d = `${date.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const isYesterday = (previousDay: string, today: string) => {
  const [y, m, d] = today.split("-").map(Number);
  if (!y || !m || !d) return false;
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() - 1);
  return previousDay === toDayKey(date);
};

const getLevelForXp = (xp: number) => {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i -= 1) {
    if (xp >= LEVEL_THRESHOLDS[i]) return i;
  }
  return 0;
};

const getDefaultState = (day: string): GamificationState => ({
  version: STORAGE_VERSION,
  totalXp: 0,
  level: 0,
  streak: 0,
  lastActiveDate: null,
  questDay: day,
  questProgress: {},
  completedQuestIds: [],
  stats: {
    likesGiven: 0,
    commentsGiven: 0,
    postsPublished: 0,
    courseSessions: 0,
    questCompletions: 0,
  },
});

const sanitizeState = (raw: unknown, today: string): GamificationState => {
  const base = getDefaultState(today);
  if (!raw || typeof raw !== "object") return base;

  const state = raw as Partial<GamificationState>;
  if (state.version !== STORAGE_VERSION) return base;

  const merged: GamificationState = {
    ...base,
    ...state,
    questProgress: { ...base.questProgress, ...(state.questProgress || {}) },
    completedQuestIds: Array.isArray(state.completedQuestIds)
      ? state.completedQuestIds.filter((id): id is string => typeof id === "string")
      : [],
    stats: {
      ...base.stats,
      ...(state.stats || {}),
    },
  };

  merged.level = getLevelForXp(Math.max(0, merged.totalXp));
  return merged;
};

const markQuestCompleted = (state: GamificationState, quest: QuestDefinition) => {
  if (state.completedQuestIds.includes(quest.id)) return;
  state.completedQuestIds = [...state.completedQuestIds, quest.id];
  state.stats.questCompletions += 1;
  state.totalXp += quest.rewardXp;
};

const normalizeState = (input: GamificationState, today: string) => {
  const next: GamificationState = {
    ...input,
    questProgress: { ...input.questProgress },
    completedQuestIds: [...input.completedQuestIds],
    stats: { ...input.stats },
  };

  if (next.lastActiveDate !== today) {
    next.streak =
      next.lastActiveDate && isYesterday(next.lastActiveDate, today)
        ? next.streak + 1
        : 1;
    next.lastActiveDate = today;
  }

  if (next.questDay !== today) {
    next.questDay = today;
    next.questProgress = {};
    next.completedQuestIds = [];
  }

  const loginQuest = QUESTS.find((quest) => quest.action === "daily_login");
  if (loginQuest && !next.completedQuestIds.includes(loginQuest.id)) {
    next.questProgress[loginQuest.id] = loginQuest.target;
    markQuestCompleted(next, loginQuest);
  }

  next.level = getLevelForXp(Math.max(0, next.totalXp));
  return next;
};

const applyAction = (
  input: GamificationState,
  action: GamificationAction,
  amount = 1
) => {
  const next: GamificationState = {
    ...input,
    questProgress: { ...input.questProgress },
    completedQuestIds: [...input.completedQuestIds],
    stats: { ...input.stats },
  };

  const safeAmount = Math.max(1, Math.floor(amount));
  next.totalXp += ACTION_BASE_XP[action] * safeAmount;

  if (action === "post") next.stats.postsPublished += safeAmount;
  if (action === "comment") next.stats.commentsGiven += safeAmount;
  if (action === "like") next.stats.likesGiven += safeAmount;
  if (action === "course_session") next.stats.courseSessions += safeAmount;

  QUESTS.filter((quest) => quest.action === action).forEach((quest) => {
    if (next.completedQuestIds.includes(quest.id)) return;
    const current = next.questProgress[quest.id] || 0;
    const progressed = Math.min(quest.target, current + safeAmount);
    next.questProgress[quest.id] = progressed;
    if (progressed >= quest.target) {
      markQuestCompleted(next, quest);
    }
  });

  next.level = getLevelForXp(Math.max(0, next.totalXp));
  return next;
};

const loadState = (storageKey: string) => {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

const saveState = (storageKey: string, state: GamificationState) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(storageKey, JSON.stringify(state));
  window.dispatchEvent(
    new CustomEvent(SYNC_EVENT, { detail: { key: storageKey } })
  );
};

export const useGamification = (userId?: string | null) => {
  const storageKey = useMemo(() => getStorageKey(userId), [userId]);

  const [state, setState] = useState<GamificationState>(() =>
    getDefaultState(toDayKey())
  );

  useEffect(() => {
    const today = toDayKey();
    const loaded = sanitizeState(loadState(storageKey), today);
    const normalized = normalizeState(loaded, today);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate per-user state when storage key changes
    setState(normalized);
    saveState(storageKey, normalized);
  }, [storageKey]);

  useEffect(() => {
    const onSync = (event: Event) => {
      const custom = event as CustomEvent<{ key?: string }>;
      if (custom.detail?.key !== storageKey) return;
      const today = toDayKey();
      const loaded = sanitizeState(loadState(storageKey), today);
      const normalized = normalizeState(loaded, today);
      setState(normalized);
    };

    window.addEventListener(SYNC_EVENT, onSync);
    return () => window.removeEventListener(SYNC_EVENT, onSync);
  }, [storageKey]);

  const recordAction = (action: GamificationAction, amount = 1) => {
    setState((previous) => {
      const today = toDayKey();
      const normalized = normalizeState(previous, today);
      const next = applyAction(normalized, action, amount);
      saveState(storageKey, next);
      return next;
    });
  };

  const quests = useMemo<QuestWithProgress[]>(
    () =>
      QUESTS.map((quest) => {
        const progress = state.questProgress[quest.id] || 0;
        const completed = state.completedQuestIds.includes(quest.id);
        return {
          ...quest,
          progress,
          completed,
          remaining: Math.max(0, quest.target - progress),
        };
      }),
    [state.completedQuestIds, state.questProgress]
  );

  const nextLevel = Math.min(state.level + 1, LEVEL_THRESHOLDS.length - 1);
  const currentLevelFloor = LEVEL_THRESHOLDS[state.level] || 0;
  const nextLevelCeil = LEVEL_THRESHOLDS[nextLevel] || currentLevelFloor;
  const xpInLevel = Math.max(0, state.totalXp - currentLevelFloor);
  const xpSpan = Math.max(1, nextLevelCeil - currentLevelFloor);
  const levelProgressPct = Math.min(100, Math.round((xpInLevel / xpSpan) * 100));
  const xpToNextLevel = Math.max(0, nextLevelCeil - state.totalXp);

  return {
    state,
    quests,
    levelName: LEVEL_NAMES[Math.min(state.level, LEVEL_NAMES.length - 1)],
    levelProgressPct,
    xpToNextLevel,
    questsCompletedToday: state.completedQuestIds.length,
    questsTotalToday: QUESTS.length,
    recordAction,
  };
};

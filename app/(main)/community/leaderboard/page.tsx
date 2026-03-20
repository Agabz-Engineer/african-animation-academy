import { normalizeAccountType } from "@/lib/accountRouting";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import LeaderboardScreen from "./LeaderboardScreen";

export type LeaderboardEntry = {
  rank: number;
  userId: string;
  name: string;
  handle: string;
  avatarUrl: string | null;
  score: number;
  posts: number;
  likes: number;
  comments: number;
  followers: number;
  platformLikes: number;
};

type LeaderboardScreenState = "live" | "empty" | "unavailable";

type ProfileSnapshot =
  | {
      avatar_url: string | null;
      followers_count: number | null;
      total_platform_likes: number | null;
      status: string | null;
      role: string | null;
    }
  | {
      avatar_url: string | null;
      followers_count: number | null;
      total_platform_likes: number | null;
      status: string | null;
      role: string | null;
    }[]
  | null
  | undefined;

type CommunityLeaderboardRow = {
  user_id: string | null;
  user_name: string | null;
  user_handle: string | null;
  likes_count: number | null;
  comments_count: number | null;
  created_at: string;
  profiles?: ProfileSnapshot;
};

type LeaderboardPayload = {
  entries: LeaderboardEntry[];
  periodLabel: string;
  state: LeaderboardScreenState;
  note?: string;
};

const LOOKBACK_DAYS = 7;
const MAX_CANDIDATES_TO_CHECK = 12;

const PERIOD_FORMATTER = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
});

const resolveProfile = (
  profile: ProfileSnapshot
):
  | {
      avatar_url: string | null;
      followers_count: number | null;
      total_platform_likes: number | null;
      status: string | null;
      role: string | null;
    }
  | null => {
  if (Array.isArray(profile)) return profile[0] ?? null;
  return profile ?? null;
};

const formatPeriodLabel = () => {
  const end = new Date();
  const start = new Date(end);
  start.setDate(start.getDate() - LOOKBACK_DAYS);
  return `${PERIOD_FORMATTER.format(start)} - ${PERIOD_FORMATTER.format(end)}`;
};

async function getWeeklyLeaderboard(): Promise<LeaderboardPayload> {
  const periodLabel = formatPeriodLabel();

  if (!supabaseAdmin) {
    return {
      entries: [],
      periodLabel,
      state: "unavailable",
      note: "Supabase admin access is not configured, so the weekly board cannot be calculated yet.",
    };
  }

  const periodStart = new Date();
  periodStart.setDate(periodStart.getDate() - LOOKBACK_DAYS);

  const { data, error } = await supabaseAdmin
    .from("community_posts")
    .select(
      "user_id, user_name, user_handle, likes_count, comments_count, created_at, profiles!community_posts_user_id_fkey(avatar_url, followers_count, total_platform_likes, status, role)"
    )
    .eq("status", "approved")
    .gte("created_at", periodStart.toISOString())
    .order("created_at", { ascending: false })
    .limit(250);

  if (error) {
    console.error("Failed to load weekly leaderboard", error);
    return {
      entries: [],
      periodLabel,
      state: "unavailable",
      note: "The leaderboard could not be loaded from live community data right now.",
    };
  }

  const aggregates = new Map<
    string,
    Omit<LeaderboardEntry, "rank"> & { latestPostAt: string }
  >();

  for (const row of (data || []) as CommunityLeaderboardRow[]) {
    if (!row.user_id) continue;

    const profile = resolveProfile(row.profiles);
    if (profile?.status === "banned" || profile?.status === "inactive") continue;
    if (profile?.role === "admin") continue;

    const current = aggregates.get(row.user_id);
    const likes = Math.max(0, row.likes_count || 0);
    const comments = Math.max(0, row.comments_count || 0);
    const scoreIncrease = likes + comments * 2 + 3;

    if (current) {
      current.posts += 1;
      current.likes += likes;
      current.comments += comments;
      current.score += scoreIncrease;
      if (+new Date(row.created_at) > +new Date(current.latestPostAt)) {
        current.latestPostAt = row.created_at;
      }
      continue;
    }

    aggregates.set(row.user_id, {
      userId: row.user_id,
      name: row.user_name || "Animator",
      handle: row.user_handle || "animator",
      avatarUrl: profile?.avatar_url ?? null,
      score: scoreIncrease,
      posts: 1,
      likes,
      comments,
      followers: Math.max(0, profile?.followers_count || 0),
      platformLikes: Math.max(0, profile?.total_platform_likes || 0),
      latestPostAt: row.created_at,
    });
  }

  const sortedCandidates = [...aggregates.values()].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (b.comments !== a.comments) return b.comments - a.comments;
    if (b.likes !== a.likes) return b.likes - a.likes;
    return +new Date(b.latestPostAt) - +new Date(a.latestPostAt);
  });

  if (sortedCandidates.length === 0) {
    return {
      entries: [],
      periodLabel,
      state: "empty",
      note: "No approved creator activity was found for the current weekly window yet.",
    };
  }

  const animatorEntries: LeaderboardEntry[] = [];

  for (const candidate of sortedCandidates.slice(0, MAX_CANDIDATES_TO_CHECK)) {
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(
      candidate.userId
    );

    if (userError) {
      console.warn("Unable to verify account type for leaderboard candidate", candidate.userId, userError);
      animatorEntries.push({ ...candidate, rank: animatorEntries.length + 1 });
      if (animatorEntries.length === 3) break;
      continue;
    }

    const accountType = normalizeAccountType(userData.user?.user_metadata?.account_type);
    if (accountType === "studio") continue;

    animatorEntries.push({ ...candidate, rank: animatorEntries.length + 1 });
    if (animatorEntries.length === 3) break;
  }

  if (animatorEntries.length === 0) {
    return {
      entries: [],
      periodLabel,
      state: "empty",
      note: "Creator activity exists, but no animator accounts qualified for the weekly board yet.",
    };
  }

  return {
    entries: animatorEntries,
    periodLabel,
    state: "live",
  };
}

export default async function CommunityLeaderboardPage() {
  const payload = await getWeeklyLeaderboard();

  return (
    <LeaderboardScreen
      entries={payload.entries}
      periodLabel={payload.periodLabel}
      state={payload.state}
      note={payload.note}
    />
  );
}

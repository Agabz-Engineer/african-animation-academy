import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const getUserMock = vi.fn();
const unsubscribeMock = vi.fn();
const onAuthStateChangeMock = vi.fn(() => ({
  data: { subscription: { unsubscribe: unsubscribeMock } },
}));

vi.mock("@/lib/supabase", () => ({
  supabase: {
    auth: {
      getUser: (...args: unknown[]) => getUserMock(...args),
      onAuthStateChange: (...args: unknown[]) => onAuthStateChangeMock(...args),
    },
  },
}));

vi.mock("@/lib/useGamification", () => ({
  useGamification: () => ({
    state: { totalXp: 1450, level: 2, streak: 6 },
    quests: [
      {
        id: "q_daily_login",
        title: "Check in today",
        hint: "Keep your streak alive.",
        action: "daily_login",
        target: 1,
        rewardXp: 10,
        href: "/dashboard",
        progress: 1,
        completed: true,
        remaining: 0,
      },
      {
        id: "q_learn",
        title: "Start one course session",
        hint: "Open one session today.",
        action: "course_session",
        target: 1,
        rewardXp: 20,
        href: "/courses",
        progress: 0,
        completed: false,
        remaining: 1,
      },
    ],
    levelName: "Motion Sculptor",
    levelProgressPct: 48,
    xpToNextLevel: 350,
    questsCompletedToday: 1,
    questsTotalToday: 2,
    recordAction: vi.fn(),
  }),
}));

import DashboardPage from "./page";

describe("DashboardPage", () => {
  beforeEach(() => {
    getUserMock.mockResolvedValue({
      data: {
        user: {
          id: "user-1",
          email: "amina@example.com",
          user_metadata: { full_name: "Amina Doe" },
        },
      },
      error: null,
    });
  });

  it("renders dashboard content after auth hydration", async () => {
    render(<DashboardPage />);

    expect(screen.getByText("Loading dashboard...")).toBeInTheDocument();
    expect(await screen.findByText(/Welcome back,/i)).toBeInTheDocument();
    expect(screen.getByText(/Amina/i)).toBeInTheDocument();
  });
});

/* eslint-disable @next/next/no-img-element */
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const replaceMock = vi.fn();
const getUserMock = vi.fn();
const onAuthStateChangeMock = vi.fn();
const signOutMock = vi.fn();
const unsubscribeMock = vi.fn();

type MotionDivProps = React.HTMLAttributes<HTMLDivElement> & {
  children?: React.ReactNode;
  animate?: unknown;
  transition?: unknown;
  initial?: unknown;
  exit?: unknown;
};

vi.mock("next/navigation", () => ({
  usePathname: () => "/dashboard",
  useRouter: () => ({ replace: replaceMock }),
}));

vi.mock("next/image", () => ({
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => <img {...props} alt={props.alt || ""} />,
}));

vi.mock("framer-motion", () => ({
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  motion: {
    div: ({ children, ...rest }: MotionDivProps) => (
      <div {...(rest as React.HTMLAttributes<HTMLDivElement>)}>{children}</div>
    ),
  },
}));

vi.mock("@/lib/supabase", () => ({
  supabase: {
    auth: {
      getUser: (...args: unknown[]) => getUserMock(...args),
      onAuthStateChange: (...args: unknown[]) => onAuthStateChangeMock(...args),
      signOut: (...args: unknown[]) => signOutMock(...args),
    },
    storage: {
      from: () => ({
        createSignedUrl: vi.fn(),
        getPublicUrl: vi.fn(),
      }),
    },
  },
}));

import DashboardLayout from "./DashboardLayout";

describe("DashboardLayout auth guard", () => {
  beforeEach(() => {
    replaceMock.mockReset();
    getUserMock.mockResolvedValue({ data: { user: null }, error: null });
    onAuthStateChangeMock.mockReturnValue({
      data: { subscription: { unsubscribe: unsubscribeMock } },
    });
    signOutMock.mockResolvedValue({ error: null });
  });

  it("redirects unauthenticated users to login with next path", async () => {
    render(
      <DashboardLayout>
        <div>Protected Dashboard</div>
      </DashboardLayout>
    );

    expect(screen.getByText("Loading your dashboard...")).toBeInTheDocument();
    expect(await screen.findByText("Redirecting to login...")).toBeInTheDocument();

    await waitFor(() => {
      expect(replaceMock).toHaveBeenCalledWith("/login?next=%2Fdashboard");
    });
  });
});

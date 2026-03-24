import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  signUpMock,
  createClientMock,
  getAdminSettingsMock,
  normalizeAccountTypeMock,
} = vi.hoisted(() => {
  const signUp = vi.fn();
  return {
    signUpMock: signUp,
    createClientMock: vi.fn(() => ({
      auth: {
        signUp,
      },
    })),
    getAdminSettingsMock: vi.fn(),
    normalizeAccountTypeMock: vi.fn((value: unknown) =>
      value === "studio" ? "studio" : "animator"
    ),
  };
});

vi.mock("@supabase/supabase-js", () => ({
  createClient: createClientMock,
}));

vi.mock("@/lib/adminSettings", () => ({
  getAdminSettings: getAdminSettingsMock,
}));

vi.mock("@/lib/accountRouting", () => ({
  normalizeAccountType: normalizeAccountTypeMock,
}));

import { POST } from "@/app/api/auth/signup/route";

describe("POST /api/auth/signup", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://project.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon-key";
    process.env.NEXT_PUBLIC_SITE_URL = "https://app.example.com";
    getAdminSettingsMock.mockResolvedValue({ allow_signups: true });
    signUpMock.mockResolvedValue({
      data: { user: { id: "user-123" } },
      error: null,
    });
  });

  it("rejects invalid email input before calling Supabase", async () => {
    const response = await POST(
      new Request("https://app.example.com/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "not-an-email",
          password: "password123",
        }),
      })
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "Enter a valid email address.",
    });
    expect(signUpMock).not.toHaveBeenCalled();
  });

  it("uses the verification signup flow with a callback redirect", async () => {
    const response = await POST(
      new Request("https://preview.example.com/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "  NewUser@Example.com ",
          password: "password123",
          data: {
            full_name: "New User",
            account_type: "studio",
            goal: "freelance",
          },
        }),
      })
    );

    expect(createClientMock).toHaveBeenCalledWith(
      "https://project.supabase.co",
      "anon-key",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );
    expect(signUpMock).toHaveBeenCalledWith({
      email: "newuser@example.com",
      password: "password123",
      options: {
        data: {
          full_name: "New User",
          account_type: "studio",
          goal: "freelance",
        },
        emailRedirectTo: "https://app.example.com/auth/callback",
      },
    });
    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toEqual({
      userId: "user-123",
      email: "newuser@example.com",
      requiresEmailConfirmation: true,
    });
  });

  it("blocks public signup when admin settings disable it", async () => {
    getAdminSettingsMock.mockResolvedValue({ allow_signups: false });

    const response = await POST(
      new Request("https://app.example.com/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "person@example.com",
          password: "password123",
        }),
      })
    );

    expect(response.status).toBe(403);
    expect(signUpMock).not.toHaveBeenCalled();
  });
});

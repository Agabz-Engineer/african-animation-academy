import {
  getEmailValidationError,
  getSignupEmailRedirectUrl,
  normalizeEmailAddress,
} from "@/lib/authValidation";

describe("authValidation", () => {
  it("normalizes email addresses", () => {
    expect(normalizeEmailAddress("  USER@Example.COM  ")).toBe("user@example.com");
  });

  it("accepts standard-looking email addresses", () => {
    expect(getEmailValidationError("creator@example.com")).toBeNull();
    expect(getEmailValidationError("oi@io.ccc")).toBeNull();
  });

  it("rejects malformed email addresses", () => {
    expect(getEmailValidationError("invalid")).toBe("Enter a valid email address.");
    expect(getEmailValidationError("name@domain")).toBe("Enter a valid email address.");
    expect(getEmailValidationError("name@-domain.com")).toBe("Enter a valid email address.");
    expect(getEmailValidationError("name..dots@example.com")).toBe(
      "Enter a valid email address."
    );
  });

  it("builds the auth callback redirect from the configured site url", () => {
    const originalSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;
    process.env.NEXT_PUBLIC_SITE_URL = "https://app.example.com/";

    expect(
      getSignupEmailRedirectUrl(new Request("https://ignored.example.com/api/auth/signup"))
    ).toBe("https://app.example.com/auth/callback");

    process.env.NEXT_PUBLIC_SITE_URL = originalSiteUrl;
  });

  it("falls back to the request origin when no site url is configured", () => {
    const originalSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;
    delete process.env.NEXT_PUBLIC_SITE_URL;

    expect(
      getSignupEmailRedirectUrl(new Request("https://preview.example.com/api/auth/signup"))
    ).toBe("https://preview.example.com/auth/callback");

    process.env.NEXT_PUBLIC_SITE_URL = originalSiteUrl;
  });
});

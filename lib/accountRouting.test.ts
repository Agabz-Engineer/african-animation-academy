import { describe, expect, it } from "vitest";
import { getAccountHomePath, isStudioAccount, normalizeAccountType } from "@/lib/accountRouting";

describe("account routing", () => {
  it("defaults unknown account types to animator", () => {
    expect(normalizeAccountType(undefined)).toBe("animator");
    expect(normalizeAccountType(null)).toBe("animator");
    expect(normalizeAccountType("anything-else")).toBe("animator");
  });

  it("routes studio users to the studio workspace", () => {
    expect(normalizeAccountType("studio")).toBe("studio");
    expect(getAccountHomePath("studio")).toBe("/studio");
    expect(isStudioAccount("studio")).toBe(true);
  });

  it("routes animator users to the dashboard", () => {
    expect(getAccountHomePath("animator")).toBe("/dashboard");
    expect(getAccountHomePath(undefined)).toBe("/dashboard");
    expect(isStudioAccount("animator")).toBe(false);
  });
});

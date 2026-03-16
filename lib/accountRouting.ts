export type AccountType = "animator" | "studio" | null | undefined;

export const normalizeAccountType = (accountType: unknown): "animator" | "studio" =>
  accountType === "studio" ? "studio" : "animator";

export const getAccountHomePath = (accountType: AccountType) =>
  normalizeAccountType(accountType) === "studio" ? "/studio" : "/dashboard";

export const isStudioAccount = (accountType: AccountType) =>
  normalizeAccountType(accountType) === "studio";

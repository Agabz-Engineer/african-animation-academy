export type AccountType = "animator" | "studio" | null | undefined;

export const getAccountHomePath = (accountType: AccountType) =>
  accountType === "studio" ? "/studio" : "/dashboard";

export const isStudioAccount = (accountType: AccountType) =>
  accountType === "studio";

export type BillingCycle = "monthly" | "annual";

export const PRICING = {
  currency: "GHS",
  proMonthly: 100,
  annualDiscount: 20,
};

export const getAnnualPrice = (monthly: number) =>
  Math.round(monthly * 12 * (1 - PRICING.annualDiscount / 100));

export const getProAmount = (cycle: BillingCycle) => {
  if (cycle === "annual") {
    return getAnnualPrice(PRICING.proMonthly);
  }
  return PRICING.proMonthly;
};

export const toMinorUnits = (amount: number) =>
  Math.round(amount * 100);

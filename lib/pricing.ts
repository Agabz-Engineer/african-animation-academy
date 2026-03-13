export const TERM_MONTHS = [1, 3, 4, 9] as const;
export type BillingTermMonths = typeof TERM_MONTHS[number];

export const PRICING: {
  currency: string;
  proMonthly: number;
  termDiscounts: Record<BillingTermMonths, number>;
} = {
  currency: "GHS",
  proMonthly: 100,
  termDiscounts: {
    1: 0,
    3: 2,
    4: 3,
    9: 5,
  },
};

const roundCurrency = (amount: number) => Math.round(amount * 100) / 100;

export const getTermDiscount = (termMonths: BillingTermMonths) =>
  PRICING.termDiscounts[termMonths] ?? 0;

export const getProMonthlyRate = (termMonths: BillingTermMonths) => {
  const discount = getTermDiscount(termMonths);
  return roundCurrency(PRICING.proMonthly * (1 - discount / 100));
};

export const getProTermTotal = (termMonths: BillingTermMonths) =>
  roundCurrency(getProMonthlyRate(termMonths) * termMonths);

export const getProTermSavings = (termMonths: BillingTermMonths) =>
  roundCurrency(PRICING.proMonthly * termMonths - getProTermTotal(termMonths));

export const toMinorUnits = (amount: number) => Math.round(amount * 100);

"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  BadgeCheck,
  Check,
  CreditCard,
  Lock,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";
import { useThemeMode } from "@/lib/useThemeMode";

type BillingCycle = "monthly" | "annual";
type PlanId = "free" | "pro" | "team";
type CellValue = boolean | string;

type Plan = {
  id: PlanId;
  name: string;
  subtitle: string;
  monthlyPrice: number;
  recommended?: boolean;
  ctaLabel: string;
  href: string;
  features: string[];
};

type ComparisonRow = {
  feature: string;
  free: CellValue;
  pro: CellValue;
  team: CellValue;
};

const ANNUAL_DISCOUNT = 20;

const PLANS: Plan[] = [
  {
    id: "free",
    name: "Free",
    subtitle: "For curious beginners exploring animation.",
    monthlyPrice: 0,
    ctaLabel: "Start free",
    href: "/signup",
    features: [
      "Access to all Beginner course previews",
      "Limited gallery submissions (3/month)",
      "Community forum read-only access",
      "Challenge participation (no prize eligibility)",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    subtitle: "For committed creators building serious momentum.",
    monthlyPrice: 24,
    recommended: true,
    ctaLabel: "Go Pro",
    href: "/signup",
    features: [
      "Full access to Beginner, Intermediate, and Advanced courses",
      "Unlimited gallery submissions",
      "Full forum participation and thread creation",
      "Challenge prize eligibility + leaderboard ranking",
      "Downloadable course resources and project files",
      "Course completion certificates",
      "Priority support",
    ],
  },
  {
    id: "team",
    name: "Team / Studio",
    subtitle: "For studios training teams and scaling production quality.",
    monthlyPrice: 89,
    ctaLabel: "Contact sales",
    href: "mailto:info@africafx.com?subject=Team%20or%20Studio%20Plan",
    features: [
      "Everything in Pro for every team member",
      "10 creator seats included (expandable)",
      "Shared studio workspace",
      "Team analytics and progress dashboards",
      "Centralized billing and invoice downloads",
      "Dedicated onboarding + account manager",
    ],
  },
];

const COMPARISON_ROWS: ComparisonRow[] = [
  { feature: "Course access", free: "Previews only", pro: "All levels", team: "All levels" },
  { feature: "Gallery submissions", free: "3 / month", pro: "Unlimited", team: "Unlimited" },
  { feature: "Forum participation", free: "Read-only", pro: "Post + threads", team: "Team channels" },
  { feature: "Challenge rewards", free: "No prizes", pro: "Prize + leaderboard", team: "Team leaderboard" },
  { feature: "Resources + certificates", free: false, pro: true, team: true },
  { feature: "Support level", free: "Standard", pro: "Priority", team: "Priority + manager" },
  { feature: "Seats included", free: "1", pro: "1", team: "10+" },
];

const FAQS = [
  {
    q: "Can I cancel anytime?",
    a: "Yes. You can cancel your plan from account settings at any time. Your paid access stays active until the end of your current billing period.",
  },
  {
    q: "How does annual billing work?",
    a: "Annual plans are billed once per year at a discounted rate. You save 20% compared with paying month-to-month.",
  },
  {
    q: "Do you offer refunds?",
    a: "Yes. Paid plans are covered by a 14-day money-back guarantee from the date of first purchase.",
  },
  {
    q: "Can I upgrade from Free to Pro or Team later?",
    a: "Absolutely. Upgrades are instant and your progress remains intact. Team plans can also be expanded with more seats.",
  },
  {
    q: "Are payments secure?",
    a: "Yes. Checkout uses SSL encryption and secure payment providers. We do not expose card data in the app.",
  },
];

const DARK = {
  text: "#FAF8F0",
  muted: "#C8C0B2",
  dim: "#968C7C",
  border: "#383029",
  panel: "rgba(20,17,14,0.9)",
  card: "rgba(28,24,20,0.92)",
  chip: "rgba(255,255,255,0.04)",
  accent: "#FF8C00",
  accentSoft: "rgba(255,140,0,0.15)",
  success: "#6AD07D",
};

const LIGHT = {
  text: "#1C1C1C",
  muted: "#5A534A",
  dim: "#8A8175",
  border: "#E2D5C2",
  panel: "rgba(255,250,241,0.92)",
  card: "rgba(255,255,255,0.95)",
  chip: "rgba(0,0,0,0.04)",
  accent: "#FF8C00",
  accentSoft: "rgba(255,140,0,0.13)",
  success: "#2F9D47",
};

const getAnnualPrice = (monthly: number) =>
  Math.round(monthly * 12 * (1 - ANNUAL_DISCOUNT / 100));

const renderCell = (
  value: CellValue,
  colors: { text: string; dim: string; accent: string }
) => {
  if (typeof value === "boolean") {
    return value ? (
      <Check style={{ width: "15px", height: "15px", color: colors.accent }} />
    ) : (
      <X style={{ width: "15px", height: "15px", color: colors.dim }} />
    );
  }
  return <span style={{ color: colors.text }}>{value}</span>;
};

const toCellLabel = (value: CellValue) =>
  typeof value === "boolean" ? (value ? "Included" : "Not included") : value;

export default function PricingPage() {
  const theme = useThemeMode();
  const T = theme === "dark" ? DARK : LIGHT;

  const [billing, setBilling] = useState<BillingCycle>("monthly");

  const planPricing = useMemo(() => {
    return PLANS.map((plan) => {
      if (plan.monthlyPrice === 0) {
        return {
          ...plan,
          amount: 0,
          periodLabel: "forever",
          saveAmount: 0,
          monthlyEquivalent: 0,
        };
      }

      const annual = getAnnualPrice(plan.monthlyPrice);
      const monthlyEquivalent = Math.round((annual / 12) * 100) / 100;
      return {
        ...plan,
        amount: billing === "monthly" ? plan.monthlyPrice : annual,
        periodLabel: billing === "monthly" ? "month" : "year",
        saveAmount: plan.monthlyPrice * 12 - annual,
        monthlyEquivalent,
      };
    });
  }, [billing]);

  return (
    <div className="pricing-wrap">
      <section
        className="hero"
        style={{ border: `1px solid ${T.border}`, background: T.panel }}
      >
        <div className="kicker" style={{ border: `1px solid ${T.border}`, background: T.chip, color: T.muted }}>
          <Sparkles style={{ width: "13px", height: "13px", color: T.accent }} />
          Flexible plans for every stage
        </div>

        <h1 style={{ color: T.text }}>
          Pricing
          <span style={{ color: T.accent }}> that scales with your creative growth</span>
        </h1>

        <p style={{ color: T.muted }}>
          Choose monthly or annual billing, unlock the tools you need, and move from learning
          to industry-ready output.
        </p>

        <div className="billing-row">
          <div
            className="billing-toggle"
            style={{ border: `1px solid ${T.border}`, background: T.chip }}
            role="tablist"
            aria-label="Billing cycle"
          >
            <button
              type="button"
              onClick={() => setBilling("monthly")}
              className={billing === "monthly" ? "active" : ""}
              style={{
                background: billing === "monthly" ? T.accent : "transparent",
                color: billing === "monthly" ? (theme === "dark" ? "#1C1C1C" : "#FFFFFF") : T.muted,
              }}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setBilling("annual")}
              className={billing === "annual" ? "active" : ""}
              style={{
                background: billing === "annual" ? T.accent : "transparent",
                color: billing === "annual" ? (theme === "dark" ? "#1C1C1C" : "#FFFFFF") : T.muted,
              }}
            >
              Annual
            </button>
          </div>

          <span
            className="save-chip"
            style={{ border: `1px solid ${T.accent}66`, background: T.accentSoft, color: T.accent }}
          >
            Save {ANNUAL_DISCOUNT}% on annual
          </span>
        </div>

        <div className="trust-row">
          <div className="trust-pill" style={{ border: `1px solid ${T.border}`, background: T.chip, color: T.muted }}>
            <BadgeCheck style={{ width: "14px", height: "14px", color: T.accent }} />
            14-day money-back guarantee
          </div>
          <div className="trust-pill" style={{ border: `1px solid ${T.border}`, background: T.chip, color: T.muted }}>
            <Lock style={{ width: "14px", height: "14px", color: T.accent }} />
            SSL secured checkout
          </div>
          <div className="trust-pill" style={{ border: `1px solid ${T.border}`, background: T.chip, color: T.muted }}>
            <CreditCard style={{ width: "14px", height: "14px", color: T.accent }} />
            Secure card payments
          </div>
        </div>
      </section>

      <section className="plan-grid">
        {planPricing.map((plan) => {
          const isPaid = plan.monthlyPrice > 0;
          const cardBorder = plan.recommended ? `${T.accent}88` : T.border;
          const cardBg = plan.recommended
            ? `linear-gradient(180deg, ${T.accentSoft} 0%, ${T.card} 35%)`
            : T.card;
          const ctaBg = plan.recommended ? T.accent : "transparent";
          const ctaText = plan.recommended ? (theme === "dark" ? "#1C1C1C" : "#FFFFFF") : T.text;

          return (
            <article
              key={plan.id}
              className="plan-card"
              style={{ border: `1px solid ${cardBorder}`, background: cardBg }}
            >
              {plan.recommended && (
                <span
                  className="recommended"
                  style={{ background: T.accent, color: theme === "dark" ? "#1C1C1C" : "#FFFFFF" }}
                >
                  Recommended
                </span>
              )}

              <h2 style={{ color: T.text }}>{plan.name}</h2>
              <p style={{ color: T.muted }}>{plan.subtitle}</p>

              <div className="price-row">
                {plan.amount === 0 ? (
                  <>
                    <span className="amount" style={{ color: T.text }}>Free</span>
                    <span className="period" style={{ color: T.dim }}>/ {plan.periodLabel}</span>
                  </>
                ) : (
                  <>
                    <span className="currency" style={{ color: T.text }}>$</span>
                    <span className="amount" style={{ color: T.text }}>{plan.amount}</span>
                    <span className="period" style={{ color: T.dim }}>/ {plan.periodLabel}</span>
                  </>
                )}
              </div>

              {isPaid && billing === "annual" && (
                <p className="annual-note" style={{ color: T.success }}>
                  ${plan.monthlyEquivalent}/mo billed yearly · save ${plan.saveAmount}
                </p>
              )}

              {plan.href.startsWith("mailto:") ? (
                <a
                  href={plan.href}
                  className="cta"
                  style={{ border: `1px solid ${plan.recommended ? T.accent : T.border}`, background: ctaBg, color: ctaText }}
                >
                  {plan.ctaLabel}
                </a>
              ) : (
                <Link
                  href={plan.href}
                  className="cta"
                  style={{ border: `1px solid ${plan.recommended ? T.accent : T.border}`, background: ctaBg, color: ctaText }}
                >
                  {plan.ctaLabel}
                </Link>
              )}

              <ul>
                {plan.features.map((feature) => (
                  <li key={`${plan.id}-${feature}`} style={{ color: T.muted }}>
                    <Check style={{ width: "14px", height: "14px", color: T.accent, flexShrink: 0 }} />
                    {feature}
                  </li>
                ))}
              </ul>
            </article>
          );
        })}
      </section>

      <section className="comparison" style={{ border: `1px solid ${T.border}`, background: T.panel }}>
        <h3 style={{ color: T.text }}>Core Feature Comparison</h3>
        <p style={{ color: T.muted }}>
          The essentials only, so it is easier to compare plans at a glance.
        </p>

        <div className="table-wrap comparison-desktop">
          <table>
            <thead>
              <tr style={{ borderBottom: `1px solid ${T.border}` }}>
                <th style={{ color: T.dim, textAlign: "left" }}>Feature</th>
                <th style={{ color: T.dim }}>Free</th>
                <th style={{ color: T.dim }}>Pro</th>
                <th style={{ color: T.dim }}>Team / Studio</th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON_ROWS.map((row) => (
                <tr key={row.feature} style={{ borderBottom: `1px solid ${T.border}` }}>
                  <td style={{ color: T.text, textAlign: "left" }}>{row.feature}</td>
                  <td>{renderCell(row.free, { text: T.text, dim: T.dim, accent: T.accent })}</td>
                  <td>{renderCell(row.pro, { text: T.text, dim: T.dim, accent: T.accent })}</td>
                  <td>{renderCell(row.team, { text: T.text, dim: T.dim, accent: T.accent })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="comparison-mobile">
          {planPricing.map((plan) => (
            <article
              key={`mobile-compare-${plan.id}`}
              className="comparison-mobile-card"
              style={{ border: `1px solid ${T.border}`, background: T.card }}
            >
              <div className="comparison-mobile-head" style={{ borderBottom: `1px solid ${T.border}` }}>
                <h4 style={{ color: T.text }}>{plan.name}</h4>
                <span style={{ color: T.accent }}>
                  {plan.amount === 0 ? "Free" : `$${plan.amount}/${plan.periodLabel}`}
                </span>
              </div>

              <ul className="comparison-mobile-list">
                {COMPARISON_ROWS.map((row) => (
                  <li key={`${plan.id}-${row.feature}`} style={{ borderBottom: `1px solid ${T.border}` }}>
                    <span style={{ color: T.muted }}>{row.feature}</span>
                    <strong style={{ color: T.text }}>
                      {toCellLabel(row[plan.id])}
                    </strong>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="faq" style={{ border: `1px solid ${T.border}`, background: T.panel }}>
        <div className="faq-head">
          <h3 style={{ color: T.text }}>Billing FAQ</h3>
          <span style={{ color: T.dim }}>Answers before you checkout</span>
        </div>

        <div className="faq-list">
          {FAQS.map((item) => (
            <details
              key={item.q}
              style={{ border: `1px solid ${T.border}`, background: T.card }}
            >
              <summary style={{ color: T.text }}>
                <ShieldCheck style={{ width: "15px", height: "15px", color: T.accent, flexShrink: 0 }} />
                {item.q}
              </summary>
              <p style={{ color: T.muted }}>{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      <style jsx>{`
        .pricing-wrap {
          padding: 1.4rem 1.6rem 3.2rem;
          max-width: 1180px;
          margin: 0 auto;
        }
        .hero {
          border-radius: 24px;
          padding: 1.15rem 1.2rem;
          margin-bottom: 0.95rem;
          box-shadow: 0 16px 34px rgba(0, 0, 0, 0.08);
        }
        .kicker {
          display: inline-flex;
          align-items: center;
          gap: 0.38rem;
          border-radius: 999px;
          padding: 0.3rem 0.65rem;
          font: 700 0.72rem "General Sans", sans-serif;
          margin-bottom: 0.75rem;
        }
        h1 {
          font-family: "Clash Display", sans-serif;
          font-size: clamp(1.65rem, 4.6vw, 2.8rem);
          line-height: 1.04;
          letter-spacing: -0.03em;
          margin: 0;
          max-width: 18ch;
        }
        .hero p {
          margin-top: 0.6rem;
          font: 500 0.86rem "General Sans", sans-serif;
          line-height: 1.58;
          max-width: 66ch;
        }
        .billing-row {
          margin-top: 0.85rem;
          display: flex;
          align-items: center;
          gap: 0.65rem;
          flex-wrap: wrap;
        }
        .billing-toggle {
          display: inline-flex;
          border-radius: 999px;
          padding: 0.2rem;
          gap: 0.22rem;
        }
        .billing-toggle button {
          border: none;
          border-radius: 999px;
          padding: 0.36rem 0.9rem;
          cursor: pointer;
          font: 700 0.76rem "General Sans", sans-serif;
          transition: background 0.2s ease, color 0.2s ease;
        }
        .save-chip {
          border-radius: 999px;
          padding: 0.32rem 0.72rem;
          font: 700 0.75rem "General Sans", sans-serif;
        }
        .trust-row {
          margin-top: 0.8rem;
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 0.5rem;
        }
        .trust-pill {
          border-radius: 11px;
          padding: 0.52rem 0.6rem;
          display: inline-flex;
          align-items: center;
          gap: 0.38rem;
          font: 600 0.74rem "General Sans", sans-serif;
        }
        .plan-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 0.65rem;
          margin-bottom: 0.9rem;
        }
        .plan-card {
          border-radius: 18px;
          padding: 0.95rem 0.9rem;
          position: relative;
          box-shadow: 0 10px 24px rgba(0, 0, 0, 0.08);
        }
        .recommended {
          position: absolute;
          right: 0.8rem;
          top: -0.5rem;
          border-radius: 999px;
          padding: 0.26rem 0.6rem;
          font: 700 0.66rem "General Sans", sans-serif;
        }
        .plan-card h2 {
          margin: 0;
          font: 700 1.2rem "Clash Display", sans-serif;
          letter-spacing: -0.01em;
        }
        .plan-card p {
          margin: 0.3rem 0 0;
          font: 500 0.76rem "General Sans", sans-serif;
          line-height: 1.45;
          min-height: 2.25rem;
        }
        .price-row {
          margin-top: 0.65rem;
          display: flex;
          align-items: baseline;
          gap: 0.18rem;
        }
        .currency {
          font: 700 1.05rem "General Sans", sans-serif;
        }
        .amount {
          font: 700 2rem "Clash Display", sans-serif;
          letter-spacing: -0.02em;
          line-height: 1;
        }
        .period {
          font: 600 0.78rem "General Sans", sans-serif;
        }
        .annual-note {
          margin-top: 0.3rem;
          font: 700 0.73rem "General Sans", sans-serif;
        }
        .cta {
          margin-top: 0.65rem;
          border-radius: 10px;
          padding: 0.55rem 0.8rem;
          font: 700 0.8rem "General Sans", sans-serif;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          text-decoration: none;
          transition: transform 0.18s ease, opacity 0.18s ease;
          width: 100%;
        }
        .cta:hover {
          transform: translateY(-1px);
          opacity: 0.96;
        }
        ul {
          margin: 0.68rem 0 0;
          padding: 0;
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 0.46rem;
        }
        li {
          display: flex;
          gap: 0.42rem;
          align-items: flex-start;
          font: 500 0.75rem "General Sans", sans-serif;
          line-height: 1.4;
        }
        .comparison {
          border-radius: 18px;
          padding: 0.95rem;
          margin-bottom: 0.9rem;
          box-shadow: 0 10px 24px rgba(0, 0, 0, 0.06);
        }
        .comparison h3,
        .faq h3 {
          margin: 0;
          font: 700 1.25rem "Clash Display", sans-serif;
          letter-spacing: -0.01em;
        }
        .comparison > p {
          margin: 0.35rem 0 0.72rem;
          font: 500 0.8rem "General Sans", sans-serif;
        }
        .table-wrap {
          overflow-x: auto;
          border-radius: 12px;
        }
        .comparison-mobile {
          display: none;
        }
        table {
          width: 100%;
          min-width: 660px;
          border-collapse: collapse;
        }
        th,
        td {
          padding: 0.52rem 0.44rem;
          font: 600 0.73rem "General Sans", sans-serif;
          text-align: center;
        }
        th {
          text-transform: uppercase;
          letter-spacing: 0.05em;
          font-size: 0.64rem;
          font-weight: 700;
        }
        .comparison-mobile-card {
          border-radius: 12px;
          overflow: hidden;
        }
        .comparison-mobile-head {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          gap: 0.5rem;
          padding: 0.58rem 0.62rem;
        }
        .comparison-mobile-head h4 {
          margin: 0;
          font: 700 0.94rem "Clash Display", sans-serif;
          letter-spacing: -0.01em;
        }
        .comparison-mobile-head span {
          font: 700 0.72rem "General Sans", sans-serif;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          white-space: nowrap;
        }
        .comparison-mobile-list {
          margin: 0;
          padding: 0;
          list-style: none;
        }
        .comparison-mobile-list li {
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto;
          gap: 0.42rem;
          align-items: center;
          padding: 0.45rem 0.62rem;
        }
        .comparison-mobile-list li:last-child {
          border-bottom: none !important;
        }
        .comparison-mobile-list span {
          font: 600 0.72rem "General Sans", sans-serif;
          line-height: 1.35;
        }
        .comparison-mobile-list strong {
          font: 700 0.72rem "General Sans", sans-serif;
          line-height: 1.25;
          text-align: right;
          max-width: 46vw;
        }
        .faq {
          border-radius: 18px;
          padding: 0.95rem;
          box-shadow: 0 10px 24px rgba(0, 0, 0, 0.06);
        }
        .faq-head {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          gap: 0.5rem;
          margin-bottom: 0.68rem;
        }
        .faq-head span {
          font: 600 0.72rem "General Sans", sans-serif;
        }
        .faq-list {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 0.5rem;
        }
        details {
          border-radius: 12px;
          padding: 0.55rem 0.62rem;
        }
        summary {
          cursor: pointer;
          list-style: none;
          display: flex;
          align-items: flex-start;
          gap: 0.42rem;
          font: 700 0.77rem "General Sans", sans-serif;
          line-height: 1.35;
        }
        summary::-webkit-details-marker {
          display: none;
        }
        details p {
          margin: 0.4rem 0 0;
          font: 500 0.75rem "General Sans", sans-serif;
          line-height: 1.5;
          padding-left: 1.55rem;
        }
        @media (max-width: 1100px) {
          .plan-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
          .faq-list {
            grid-template-columns: 1fr;
          }
        }
        @media (max-width: 767px) {
          .pricing-wrap {
            padding: 1rem 1rem 5.2rem;
          }
          .hero {
            padding: 0.95rem;
          }
          .trust-row {
            grid-template-columns: 1fr;
          }
          .plan-grid {
            grid-template-columns: 1fr;
          }
          .comparison,
          .faq {
            padding: 0.75rem;
          }
          .comparison-desktop {
            display: none;
          }
          .comparison-mobile {
            display: grid;
            gap: 0.52rem;
          }
          th,
          td {
            padding: 0.48rem 0.4rem;
          }
        }
      `}</style>
    </div>
  );
}

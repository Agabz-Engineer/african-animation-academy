"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
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
import { supabase } from "@/lib/supabase";
import {
  PRICING,
  getProMonthlyRate,
  type BillingTermMonths,
} from "@/lib/pricing";

type PlanId = "free" | "pro";
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
};

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
    monthlyPrice: PRICING.proMonthly,
    recommended: true,
    ctaLabel: "Go Pro",
    href: "/pricing",
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
];

const COMPARISON_ROWS: ComparisonRow[] = [
  { feature: "Course access", free: "Previews only", pro: "All levels" },
  { feature: "Gallery submissions", free: "3 / month", pro: "Unlimited" },
  { feature: "Forum participation", free: "Read-only", pro: "Post + threads" },
  { feature: "Challenge rewards", free: "No prizes", pro: "Prize + leaderboard" },
  { feature: "Resources + certificates", free: false, pro: true },
  { feature: "Support level", free: "Standard", pro: "Priority" },
];

const FAQS = [
  {
    q: "Can I cancel anytime?",
    a: "Yes. You can cancel your plan from account settings at any time. Your paid access stays active until the end of your current billing period.",
  },
  {
    q: "Do you offer refunds?",
    a: "Yes. Paid plans are covered by a 14-day money-back guarantee from the date of first purchase.",
  },
  {
    q: "Can I upgrade from Free to Pro later?",
    a: "Absolutely. Upgrades are instant and your progress remains intact.",
  },
  {
    q: "Are payments secure?",
    a: "Yes. Checkout uses SSL encryption and secure payment providers. We do not expose card data in the app.",
  },
  {
    q: "Can I use Mobile Money or bank transfer?",
    a: "Yes. Pay with card, Mobile Money, or bank transfer and renew monthly.",
  },
];

const DARK = {
  text: "#FAF3E1",
  muted: "#D2C9B8",
  dim: "#9E9688",
  border: "#444444",
  panel: "rgba(44,44,44,0.9)",
  card: "rgba(51,51,51,0.92)",
  chip: "rgba(255,255,255,0.04)",
  accent: "#FF6D1F",
  accentSoft: "rgba(255,109,31,0.15)",
  success: "#6AD07D",
};

const LIGHT = {
  text: "#222222",
  muted: "#555555",
  dim: "#9E9688",
  border: "#E7DBBD",
  panel: "rgba(255,255,255,0.92)",
  card: "rgba(255,255,255,0.95)",
  chip: "rgba(0,0,0,0.04)",
  accent: "#FF6D1F",
  accentSoft: "rgba(255,109,31,0.13)",
  success: "#2F9D47",
};

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

  const termMonths: BillingTermMonths = 1;
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");
  const [paymentSandbox, setPaymentSandbox] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  useEffect(() => {
    let active = true;

    const loadSettings = async () => {
      try {
        const response = await fetch("/api/public/settings");
        if (!response.ok) return;
        const data = (await response.json()) as {
          paymentSandbox?: boolean;
          maintenanceMode?: boolean;
        };
        if (!active) return;
        setPaymentSandbox(Boolean(data.paymentSandbox));
        setMaintenanceMode(Boolean(data.maintenanceMode));
      } catch (error) {
        console.warn("Failed to load public settings for pricing:", error);
      }
    };

    void loadSettings();

    return () => {
      active = false;
    };
  }, []);

  const planPricing = PLANS.map((plan) => {
    if (plan.monthlyPrice === 0) {
      return {
        ...plan,
        amount: 0,
        periodLabel: "forever",
      };
    }

    return {
      ...plan,
      amount: getProMonthlyRate(termMonths),
      periodLabel: "month",
    };
  });

  const handleCheckout = async () => {
    if (!supabase) {
      setCheckoutError("Payments are not configured yet.");
      return;
    }

    setCheckoutError("");
    setCheckoutLoading(true);

    if (maintenanceMode) {
      setCheckoutError("Payments are temporarily paused during maintenance.");
      setCheckoutLoading(false);
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.id || !user?.email) {
        window.location.href = "/login?next=%2Fpricing";
        return;
      }

      const response = await fetch("/api/paystack/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: "pro",
          termMonths,
          userId: user.id,
          email: user.email,
        }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error || "Unable to start checkout.");
      }

      if (payload?.authorization_url) {
        window.location.href = payload.authorization_url;
        return;
      }

      throw new Error("Checkout link missing.");
    } catch (error) {
      setCheckoutError(error instanceof Error ? error.message : "Checkout failed.");
    } finally {
      setCheckoutLoading(false);
    }
  };

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
          Go Pro monthly, unlock the tools you need, and move from learning to industry-ready
          output.
        </p>

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
            Secure card, MoMo, bank payments
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
          const ctaText = plan.recommended ? (theme === "dark" ? "#222222" : "#FFFFFF") : T.text;

          return (
            <article
              key={plan.id}
              className="plan-card"
              style={{ border: `1px solid ${cardBorder}`, background: cardBg }}
            >
              {plan.recommended && (
                <span
                  className="recommended"
                  style={{ background: T.accent, color: theme === "dark" ? "#222222" : "#FFFFFF" }}
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
                    <span className="currency" style={{ color: T.text }}>GH?</span>
                    <span className="amount" style={{ color: T.text }}>{plan.amount}</span>
                    <span className="period" style={{ color: T.dim }}>/ {plan.periodLabel}</span>
                  </>
                )}
              </div>
              {isPaid && (
                <p className="payment-note" style={{ color: T.muted }}>
                  MoMo + bank top-up. Renew monthly.
                </p>
              )}

              {plan.id === "pro" ? (
                <button
                  type="button"
                  onClick={handleCheckout}
                  disabled={checkoutLoading}
                  className="cta"
                  style={{ border: `1px solid ${plan.recommended ? T.accent : T.border}`, background: ctaBg, color: ctaText, opacity: checkoutLoading ? 0.7 : 1 }}
                >
                  {checkoutLoading ? "Starting checkout..." : plan.ctaLabel}
                </button>
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

      {checkoutError && (
        <div
          style={{
            marginBottom: "1rem",
            borderRadius: "12px",
            border: `1px solid ${T.accent}55`,
            background: T.accentSoft,
            padding: "0.75rem 0.9rem",
            color: T.text,
            fontFamily: "General Sans, sans-serif",
            fontSize: "0.85rem",
          }}
        >
          {checkoutError}
        </div>
      )}

      {paymentSandbox && (
        <div
          style={{
            marginBottom: "1rem",
            borderRadius: "12px",
            border: `1px solid ${T.border}`,
            background: T.panel,
            padding: "0.75rem 0.9rem",
            color: T.muted,
            fontFamily: "General Sans, sans-serif",
            fontSize: "0.85rem",
          }}
        >
          Admin payment sandbox is enabled. Checkout currently runs in test mode.
        </div>
      )}

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
              </tr>
            </thead>
            <tbody>
              {COMPARISON_ROWS.map((row) => (
                <tr key={row.feature} style={{ borderBottom: `1px solid ${T.border}` }}>
                  <td style={{ color: T.text, textAlign: "left" }}>{row.feature}</td>
                  <td>{renderCell(row.free, { text: T.text, dim: T.dim, accent: T.accent })}</td>
                  <td>{renderCell(row.pro, { text: T.text, dim: T.dim, accent: T.accent })}</td>
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
                  {plan.amount === 0 ? "Free" : `GH?${plan.amount}/${plan.periodLabel}`}
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
          grid-template-columns: repeat(2, minmax(0, 1fr));
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
        .payment-note {
          margin-top: 0.35rem;
          font: 600 0.72rem "General Sans", sans-serif;
          line-height: 1.4;
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

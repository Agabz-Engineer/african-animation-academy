"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, ArrowLeft, Check, Briefcase, DollarSign, Palette, Building2, Sprout, Rocket, Zap, Film, Clapperboard } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useThemeMode } from "@/lib/useThemeMode";

type SkillLevel = "beginner" | "intermediate" | "advanced" | null;
type AccountType = "animator" | "studio" | null;

const ACCOUNT_TYPES = [
  {
    id: "animator",
    label: "I am an Animator",
    desc: "I want to learn, grow my skills and build my portfolio",
    Icon: Film,
  },
  {
    id: "studio",
    label: "I am an Animation Studio",
    desc: "I want to find talent, post projects and grow my team",
    Icon: Clapperboard,
  },
];

const SKILL_LEVELS = [
  { id: "beginner", label: "Beginner", desc: "I am new to animation", Icon: Sprout },
  { id: "intermediate", label: "Intermediate", desc: "I know the basics", Icon: Rocket },
  { id: "advanced", label: "Advanced", desc: "I have real experience", Icon: Zap },
];

const GOALS = [
  { id: "career", label: "Switch to a career in animation", Icon: Briefcase },
  { id: "freelance", label: "Freelance and earn money", Icon: DollarSign },
  { id: "hobby", label: "Learn as a creative hobby", Icon: Palette },
  { id: "studio", label: "Build my own studio", Icon: Building2 },
];

const stepVariants = {
  enter: { opacity: 0, x: 40 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -40 },
};

const TOTAL_STEPS = 4;

const DARK_UI = {
  surface: "#221808",
  border: "#3D2E10",
  text: "#F5ECD7",
  muted: "#A89070",
  dim: "#6B5A40",
  divider: "rgba(61,46,16,0.4)",
  cardBg: "rgba(34,24,8,0.70)",
};

const LIGHT_UI = {
  surface: "rgba(255,255,255,0.86)",
  border: "#DCCFB7",
  text: "#1C1C1C",
  muted: "#5A5550",
  dim: "#7A746A",
  divider: "rgba(183,164,132,0.55)",
  cardBg: "rgba(255,255,255,0.80)",
};

export default function SignupPage() {
  const theme = useThemeMode();
  const C = theme === "dark" ? DARK_UI : LIGHT_UI;

  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [accountType, setAccountType] = useState<AccountType>(null);
  const [skillLevel, setSkillLevel] = useState<SkillLevel>(null);
  const [goal, setGoal] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleStepOne = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    setError("");
    setStep(2);
  };

  const handleFinish = async () => {
    if (!goal) return;
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
          account_type: accountType,
          skill_level: skillLevel,
          goal: goal,
        },
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      window.location.href = "/dashboard";
    }
  };

  const strengthColor = password.length === 0 ? C.border : password.length < 8 ? "#FF5722" : password.length < 12 ? "#FF9800" : "#4CAF50";
  const strengthLabel = password.length === 0 ? "Enter a password" : password.length < 8 ? "Too short" : password.length < 12 ? "Fair" : password.length < 16 ? "Good" : "Strong";

  return (
    <div style={{ minHeight: "100vh", display: "flex", position: "relative", overflow: "hidden", transition: "color 0.3s ease" }}>

      {/* Left Panel */}
      <div style={{ position: "relative", zIndex: 1 }}
        className="hidden lg:flex lg:w-1/2 items-center justify-center px-12"
      >
        <div style={{ position: "absolute", top: "20%", left: "20%", width: "300px", height: "300px", background: "rgba(232,160,32,0.08)", borderRadius: "50%", filter: "blur(80px)", pointerEvents: "none" }} />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          style={{ textAlign: "center", position: "relative", zIndex: 1 }}
        >
          {/* AFX Logo */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", marginBottom: "3rem" }}>
            <div style={{ width: "48px", height: "40px", backgroundColor: C.surface, border: `1px solid ${C.border}`, borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontFamily: "'General Sans',sans-serif", fontWeight: 700, fontSize: "1rem", color: "#E8A020" }}>A</span>
              <span style={{ fontFamily: "'General Sans',sans-serif", fontWeight: 700, fontSize: "1.15rem", color: "#C1440E" }}>F</span>
              <span style={{ fontFamily: "'General Sans',sans-serif", fontWeight: 700, fontSize: "1rem", color: "#D4A853" }}>X</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.2 }}>
              <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: "0.875rem", color: C.text }}>African Animation</span>
              <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: "0.875rem", background: "linear-gradient(135deg,#E8A020,#C1440E)", WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent" }}>Academy</span>
            </div>
          </div>

          <h2 style={{ fontFamily: "'General Sans',sans-serif", fontWeight: 700, fontSize: "2.5rem", lineHeight: 1.15, color: C.text, marginBottom: "1.25rem" }}>
            Your animation<br />
            <span style={{ background: "linear-gradient(135deg,#E8A020,#C1440E)", WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              journey starts here
            </span>
          </h2>

          <p style={{ color: C.muted, fontSize: "1rem", lineHeight: 1.7, maxWidth: "300px", margin: "0 auto 2.5rem" }}>
            Create your free account and get access to courses, the community, and monthly challenges.
          </p>

          {/* Step indicator */}
          <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginBottom: "0.75rem" }}>
            {[1, 2, 3, 4].map((s) => (
              <div key={s} style={{
                height: "6px", borderRadius: "999px",
                width: step >= s ? "32px" : "8px",
                background: step >= s ? "linear-gradient(90deg,#E8A020,#C1440E)" : C.border,
                transition: "all 0.3s ease"
              }} />
            ))}
          </div>
          <p style={{ color: C.dim, fontSize: "0.8rem", fontFamily: "'General Sans',sans-serif" }}>Step {step} of {TOTAL_STEPS}</p>

          <p style={{ fontFamily: "'General Sans',sans-serif", fontStyle: "italic", color: "#D4A853", fontSize: "0.8rem", marginTop: "2rem" }}>
            Proudly African. Globally Creative.
          </p>
        </motion.div>
      </div>

      {/* Vertical divider */}
      <div className="hidden lg:block" style={{ position: "relative", zIndex: 1, width: "1px", backgroundColor: C.divider, alignSelf: "stretch" }} />

      {/* Right Panel */}
      <div style={{ position: "relative", zIndex: 1 }}
        className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12"
      >
        <div style={{ width: "100%", maxWidth: "440px" }}>

          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-6 lg:hidden">
            <div style={{ width: "40px", height: "34px", backgroundColor: C.surface, border: `1px solid ${C.border}`, borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontFamily: "'General Sans',sans-serif", fontWeight: 700, color: "#E8A020", fontSize: "0.85rem" }}>A</span>
              <span style={{ fontFamily: "'General Sans',sans-serif", fontWeight: 700, color: "#C1440E", fontSize: "0.95rem" }}>F</span>
              <span style={{ fontFamily: "'General Sans',sans-serif", fontWeight: 700, color: "#D4A853", fontSize: "0.85rem" }}>X</span>
            </div>
            <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, color: C.text, fontSize: "1rem" }}>Africa Fx</span>
          </div>

          {/* Mobile step bar */}
          <div className="flex gap-2 mb-8 lg:hidden">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} style={{ flex: 1, height: "4px", borderRadius: "999px", background: step >= s ? "linear-gradient(90deg,#E8A020,#C1440E)" : C.border, transition: "all 0.3s ease" }} />
            ))}
          </div>

          {error && (
            <div style={{ background: "rgba(255,87,34,0.10)", border: "1px solid rgba(255,87,34,0.30)", color: "#FF5722", borderRadius: "12px", padding: "0.75rem 1rem", marginBottom: "1rem", fontSize: "0.875rem" }}>
              {error}
            </div>
          )}

          <AnimatePresence mode="wait">

            {/* Step 1: Account Details */}
            {step === 1 && (
              <motion.div key="step1" variants={stepVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }}>
                <h1 style={{ fontFamily: "'General Sans',sans-serif", fontWeight: 700, fontSize: "2rem", color: C.text, marginBottom: "0.5rem" }}>
                  Create your account
                </h1>
                <p style={{ color: C.muted, marginBottom: "2rem", fontFamily: "'General Sans',sans-serif" }}>
                  Free forever - no credit card needed
                </p>

                <form onSubmit={handleStepOne} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, color: C.muted, marginBottom: "0.5rem", fontFamily: "'General Sans',sans-serif" }}>Full name</label>
                    <div style={{ position: "relative" }}>
                      <User style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", width: "16px", height: "16px", color: C.dim }} />
                      <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name" required className="input-field" style={{ paddingLeft: "2.75rem" }} />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, color: C.muted, marginBottom: "0.5rem", fontFamily: "'General Sans',sans-serif" }}>Email address</label>
                    <div style={{ position: "relative" }}>
                      <Mail style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", width: "16px", height: "16px", color: C.dim }} />
                      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required className="input-field" style={{ paddingLeft: "2.75rem" }} />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, color: C.muted, marginBottom: "0.5rem", fontFamily: "'General Sans',sans-serif" }}>Password</label>
                    <div style={{ position: "relative" }}>
                      <Lock style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", width: "16px", height: "16px", color: C.dim }} />
                      <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min. 8 characters" required className="input-field" style={{ paddingLeft: "2.75rem", paddingRight: "2.75rem" }} />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: "absolute", right: "1rem", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: C.dim }}>
                        {showPassword ? <EyeOff style={{ width: "16px", height: "16px" }} /> : <Eye style={{ width: "16px", height: "16px" }} />}
                      </button>
                    </div>
                    <div style={{ display: "flex", gap: "4px", marginTop: "8px" }}>
                      {[8, 12, 16].map((len, i) => (
                        <div key={i} style={{ flex: 1, height: "3px", borderRadius: "999px", backgroundColor: password.length >= len ? strengthColor : C.border, transition: "background-color 0.3s" }} />
                      ))}
                    </div>
                    <p style={{ color: C.dim, fontSize: "0.75rem", marginTop: "4px", fontFamily: "'General Sans',sans-serif" }}>{strengthLabel}</p>
                  </div>

                  <button type="submit" className="btn-primary" style={{ width: "100%", padding: "1rem", fontSize: "1rem", gap: "0.5rem" }}>
                    Continue <ArrowRight style={{ width: "16px", height: "16px" }} />
                  </button>
                </form>

                <p style={{ textAlign: "center", color: C.dim, fontSize: "0.75rem", marginTop: "0.5rem", fontFamily: "'General Sans',sans-serif" }}>
                  Your account will be ready immediately after signup.
                </p>

                <p style={{ textAlign: "center", color: C.muted, fontSize: "0.875rem", marginTop: "2rem", fontFamily: "'General Sans',sans-serif" }}>
                  Already have an account?{" "}
                  <Link href="/login" style={{ color: "#E8A020", fontWeight: 600, textDecoration: "none" }}>Sign in</Link>
                </p>
              </motion.div>
            )}

            {/* Step 2: Account Type */}
            {step === 2 && (
              <motion.div key="step2" variants={stepVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }}>
                <button onClick={() => setStep(1)} style={{ display: "flex", alignItems: "center", gap: "8px", color: C.muted, background: "none", border: "none", cursor: "pointer", marginBottom: "2rem", fontFamily: "'General Sans',sans-serif", fontSize: "0.875rem" }}>
                  <ArrowLeft style={{ width: "16px", height: "16px" }} /> Back
                </button>

                <h1 style={{ fontFamily: "'General Sans',sans-serif", fontWeight: 700, fontSize: "2rem", color: C.text, marginBottom: "0.5rem" }}>
                  Who are you?
                </h1>
                <p style={{ color: C.muted, marginBottom: "2rem", fontFamily: "'General Sans',sans-serif" }}>
                  This helps us tailor your experience on Africa Fx
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {ACCOUNT_TYPES.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => setAccountType(type.id as AccountType)}
                      style={{
                        display: "flex", alignItems: "center", gap: "1.25rem",
                        padding: "1.5rem", borderRadius: "16px", textAlign: "left",
                        cursor: "pointer", transition: "all 0.2s ease",
                        background: accountType === type.id ? "rgba(232,160,32,0.10)" : C.cardBg,
                        border: accountType === type.id ? "1px solid rgba(232,160,32,0.50)" : `1px solid ${C.border}`,
                        backdropFilter: "blur(8px)"
                      }}
                    >
                      <div style={{
                        width: "52px", height: "52px", borderRadius: "14px", flexShrink: 0,
                        background: accountType === type.id ? "linear-gradient(135deg,#E8A020,#C1440E)" : "rgba(232,160,32,0.10)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        transition: "all 0.2s ease"
                      }}>
                        <type.Icon style={{ width: "24px", height: "24px", color: accountType === type.id ? "#0D0905" : "#E8A020" }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontFamily: "'General Sans',sans-serif", fontWeight: 700, color: C.text, fontSize: "1.1rem", marginBottom: "4px" }}>{type.label}</div>
                        <div style={{ color: C.muted, fontSize: "0.8rem", lineHeight: 1.5 }}>{type.desc}</div>
                      </div>
                      {accountType === type.id && (
                        <div style={{ width: "24px", height: "24px", borderRadius: "50%", background: "linear-gradient(135deg,#E8A020,#C1440E)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <Check style={{ width: "12px", height: "12px", color: "#0D0905" }} />
                        </div>
                      )}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => accountType && setStep(3)}
                  disabled={!accountType}
                  className="btn-primary"
                  style={{ width: "100%", padding: "1rem", fontSize: "1rem", gap: "0.5rem", marginTop: "1.5rem", opacity: accountType ? 1 : 0.4 }}
                >
                  Continue <ArrowRight style={{ width: "16px", height: "16px" }} />
                </button>
              </motion.div>
            )}

            {/* Step 3: Skill Level */}
            {step === 3 && (
              <motion.div key="step3" variants={stepVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }}>
                <button onClick={() => setStep(2)} style={{ display: "flex", alignItems: "center", gap: "8px", color: C.muted, background: "none", border: "none", cursor: "pointer", marginBottom: "2rem", fontFamily: "'General Sans',sans-serif", fontSize: "0.875rem" }}>
                  <ArrowLeft style={{ width: "16px", height: "16px" }} /> Back
                </button>

                <h1 style={{ fontFamily: "'General Sans',sans-serif", fontWeight: 700, fontSize: "2rem", color: C.text, marginBottom: "0.5rem" }}>
                  {accountType === "studio" ? "Studio size?" : "What's your skill level?"}
                </h1>
                <p style={{ color: C.muted, marginBottom: "2rem", fontFamily: "'General Sans',sans-serif" }}>
                  {accountType === "studio" ? "Help us understand your studio better" : "We'll personalise your learning path based on this"}
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {SKILL_LEVELS.map((level) => (
                    <button
                      key={level.id}
                      onClick={() => setSkillLevel(level.id as SkillLevel)}
                      style={{
                        display: "flex", alignItems: "center", gap: "1rem",
                        padding: "1.25rem", borderRadius: "12px", textAlign: "left",
                        cursor: "pointer", transition: "all 0.2s ease",
                        background: skillLevel === level.id ? "rgba(232,160,32,0.10)" : C.cardBg,
                        border: skillLevel === level.id ? "1px solid rgba(232,160,32,0.50)" : `1px solid ${C.border}`,
                        backdropFilter: "blur(8px)"
                      }}
                    >
                      <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "rgba(232,160,32,0.10)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <level.Icon style={{ width: "20px", height: "20px", color: "#E8A020" }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontFamily: "'General Sans',sans-serif", fontWeight: 600, color: C.text, fontSize: "0.9rem" }}>{level.label}</div>
                        <div style={{ color: C.muted, fontSize: "0.8rem", marginTop: "2px" }}>{level.desc}</div>
                      </div>
                      {skillLevel === level.id && (
                        <div style={{ width: "22px", height: "22px", borderRadius: "50%", background: "linear-gradient(135deg,#E8A020,#C1440E)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <Check style={{ width: "12px", height: "12px", color: "#0D0905" }} />
                        </div>
                      )}
                    </button>
                  ))}
                </div>

                <button onClick={() => skillLevel && setStep(4)} disabled={!skillLevel} className="btn-primary" style={{ width: "100%", padding: "1rem", fontSize: "1rem", gap: "0.5rem", marginTop: "1.5rem", opacity: skillLevel ? 1 : 0.4 }}>
                  Continue <ArrowRight style={{ width: "16px", height: "16px" }} />
                </button>
              </motion.div>
            )}

            {/* Step 4: Goal */}
            {step === 4 && (
              <motion.div key="step4" variants={stepVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }}>
                <button onClick={() => setStep(3)} style={{ display: "flex", alignItems: "center", gap: "8px", color: C.muted, background: "none", border: "none", cursor: "pointer", marginBottom: "2rem", fontFamily: "'General Sans',sans-serif", fontSize: "0.875rem" }}>
                  <ArrowLeft style={{ width: "16px", height: "16px" }} /> Back
                </button>

                <h1 style={{ fontFamily: "'General Sans',sans-serif", fontWeight: 700, fontSize: "2rem", color: C.text, marginBottom: "0.5rem" }}>
                  What&apos;s your goal?
                </h1>
                <p style={{ color: C.muted, marginBottom: "2rem", fontFamily: "'General Sans',sans-serif" }}>
                  This helps us recommend the right courses for you
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {GOALS.map((g) => (
                    <button
                      key={g.id}
                      onClick={() => setGoal(g.id)}
                      style={{
                        display: "flex", alignItems: "center", gap: "1rem",
                        padding: "1.25rem", borderRadius: "12px", textAlign: "left",
                        cursor: "pointer", transition: "all 0.2s ease",
                        background: goal === g.id ? "rgba(232,160,32,0.10)" : C.cardBg,
                        border: goal === g.id ? "1px solid rgba(232,160,32,0.50)" : `1px solid ${C.border}`,
                        backdropFilter: "blur(8px)"
                      }}
                    >
                      <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "rgba(232,160,32,0.10)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <g.Icon style={{ width: "20px", height: "20px", color: "#E8A020" }} />
                      </div>
                      <div style={{ flex: 1, fontFamily: "'General Sans',sans-serif", fontWeight: 500, color: C.text, fontSize: "0.9rem" }}>{g.label}</div>
                      {goal === g.id && (
                        <div style={{ width: "22px", height: "22px", borderRadius: "50%", background: "linear-gradient(135deg,#E8A020,#C1440E)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <Check style={{ width: "12px", height: "12px", color: "#0D0905" }} />
                        </div>
                      )}
                    </button>
                  ))}
                </div>

                <button onClick={() => goal && handleFinish()} disabled={!goal || loading} className="btn-primary" style={{ width: "100%", padding: "1rem", fontSize: "1rem", gap: "0.5rem", marginTop: "1.5rem", opacity: goal && !loading ? 1 : 0.4 }}>
                  {loading
                    ? <div style={{ width: "20px", height: "20px", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "white", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                    : <>Create my account <ArrowRight style={{ width: "16px", height: "16px" }} /></>
                  }
                </button>

                <p style={{ textAlign: "center", color: C.dim, fontSize: "0.75rem", marginTop: "1.5rem", fontFamily: "'General Sans',sans-serif" }}>
                  By signing up you agree to our{" "}
                  <Link href="/terms" style={{ color: "#E8A020", textDecoration: "none" }}>Terms</Link>
                  {" "}and{" "}
                  <Link href="/privacy" style={{ color: "#E8A020", textDecoration: "none" }}>Privacy Policy</Link>
                </p>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>

      <style jsx global>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, ArrowLeft, Check } from "lucide-react";

type SkillLevel = "beginner" | "intermediate" | "advanced" | null;
type Goal = string;

const SKILL_LEVELS = [
  {
    id: "beginner",
    label: "Beginner",
    desc: "I'm new to animation",
    emoji: "🌱",
  },
  {
    id: "intermediate",
    label: "Intermediate",
    desc: "I know the basics",
    emoji: "🚀",
  },
  {
    id: "advanced",
    label: "Advanced",
    desc: "I have real experience",
    emoji: "⚡",
  },
];

const GOALS = [
  { id: "career", label: "Switch to a career in animation", emoji: "💼" },
  { id: "freelance", label: "Freelance and earn money", emoji: "💰" },
  { id: "hobby", label: "Learn as a creative hobby", emoji: "🎨" },
  { id: "studio", label: "Build my own studio", emoji: "🏢" },
];

export default function SignupPage() {
  const [step, setStep] = useState(1); // 1 = form, 2 = skill, 3 = goal
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [skillLevel, setSkillLevel] = useState<SkillLevel>(null);
  const [goal, setGoal] = useState<Goal>("");
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
    setLoading(true);
    // TODO: wire up Supabase signup
    // const { error } = await supabase.auth.signUp({ email, password, options: { data: { name, skillLevel, goal } } });
    setTimeout(() => setLoading(false), 1500); // placeholder
  };

  const stepVariants = {
    enter: { opacity: 0, x: 40 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -40 },
  };

  return (
    <div className="min-h-screen bg-bg flex">

      {/* ── Left Panel — Visual ── */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center">
        <div className="absolute inset-0 bg-gradient-dark" />
        <div className="absolute top-1/3 left-1/4 w-80 h-80 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-64 h-64 bg-accent/15 rounded-full blur-3xl" />

        <div className="relative z-10 text-center px-12">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <div className="flex items-center justify-center gap-3 mb-12">
              <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center">
                <span className="text-white font-display font-bold text-lg">A</span>
              </div>
              <span className="font-display font-bold text-2xl text-text">
                African Animation Academy 
              </span>
            </div>

            <h2 className="font-display text-4xl font-bold text-text mb-6 leading-tight">
              Your animation
              <br />
              <span className="gradient-text">journey starts here</span>
            </h2>
            <p className="text-text-muted text-lg leading-relaxed max-w-sm mx-auto">
              Create your free account and get instant access to beginner courses, the community, and monthly challenges.
            </p>

            {/* Step indicator on left panel */}
            <div className="flex justify-center gap-3 mt-12">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={`h-2 rounded-pill transition-all duration-300 ${
                    step >= s ? "bg-gradient-primary w-8" : "bg-border w-2"
                  }`}
                />
              ))}
            </div>
            <p className="text-text-muted text-sm mt-3">Step {step} of 3</p>
          </motion.div>
        </div>
      </div>

      {/* ── Right Panel — Steps ── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-9 h-9 bg-gradient-primary rounded-xl flex items-center justify-center">
              <span className="text-white font-display font-bold">A</span>
            </div>
            <span className="font-display font-bold text-xl text-text">
              African Animation Academy
            </span>
          </div>

          {/* Mobile step bar */}
          <div className="flex gap-2 mb-8 lg:hidden">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-1.5 flex-1 rounded-pill transition-all duration-300 ${
                  step >= s ? "bg-gradient-primary" : "bg-border"
                }`}
              />
            ))}
          </div>

          <AnimatePresence mode="wait">

            {/* ── STEP 1: Account Details ── */}
            {step === 1 && (
              <motion.div
                key="step1"
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3 }}
              >
                <h1 className="font-display text-3xl font-bold text-text mb-2">Create your account</h1>
                <p className="text-text-muted mb-8">Free forever — no credit card needed</p>

                {error && (
                  <div className="bg-alert/10 border border-alert/30 text-alert rounded-xl px-4 py-3 mb-6 text-sm">
                    {error}
                  </div>
                )}

                <form onSubmit={handleStepOne} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-text-muted mb-2">Full name</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your full name"
                        required
                        className="input-field pl-11"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-muted mb-2">Email address</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        required
                        className="input-field pl-11"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-muted mb-2">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Min. 8 characters"
                        required
                        className="input-field pl-11 pr-11"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-text transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {/* Password strength indicator */}
                    <div className="flex gap-1 mt-2">
                      {[8, 12, 16].map((len, i) => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded-pill transition-all duration-300 ${
                            password.length >= len
                              ? i === 0 ? "bg-alert" : i === 1 ? "bg-warning" : "bg-success"
                              : "bg-border"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-text-dim text-xs mt-1">
                      {password.length === 0 ? "Enter a password" : password.length < 8 ? "Too short" : password.length < 12 ? "Fair" : password.length < 16 ? "Good" : "Strong"}
                    </p>
                  </div>

                  <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2 py-4 text-base">
                    Continue
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>

                {/* Divider */}
                <div className="flex items-center gap-4 my-6">
                  <div className="flex-1 h-px bg-border" />
                  <span className="text-text-muted text-sm">or</span>
                  <div className="flex-1 h-px bg-border" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button className="btn-ghost flex items-center justify-center gap-2 py-3 text-sm">
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Google
                  </button>
                  <button className="btn-ghost flex items-center justify-center gap-2 py-3 text-sm">
                    <svg className="w-4 h-4" fill="#1877F2" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    Facebook
                  </button>
                </div>

                <p className="text-center text-text-muted text-sm mt-8">
                  Already have an account?{" "}
                  <Link href="/login" className="text-primary hover:text-primary-light font-medium transition-colors">
                    Sign in
                  </Link>
                </p>
              </motion.div>
            )}

            {/* ── STEP 2: Skill Level ── */}
            {step === 2 && (
              <motion.div
                key="step2"
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3 }}
              >
                <button onClick={() => setStep(1)} className="flex items-center gap-2 text-text-muted hover:text-text transition-colors mb-8 text-sm">
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>

                <h1 className="font-display text-3xl font-bold text-text mb-2">What&apos;s your skill level?</h1>
                <p className="text-text-muted mb-8">We&apos;ll personalise your learning path based on this</p>

                <div className="space-y-3">
                  {SKILL_LEVELS.map((level) => (
                    <button
                      key={level.id}
                      onClick={() => setSkillLevel(level.id as SkillLevel)}
                      className={`w-full glass p-5 flex items-center gap-4 text-left transition-all duration-200 hover:border-primary/50 ${
                        skillLevel === level.id
                          ? "border-primary shadow-glow-sm bg-primary/10"
                          : "border-border/50"
                      }`}
                    >
                      <span className="text-3xl">{level.emoji}</span>
                      <div className="flex-1">
                        <div className="font-display font-semibold text-text">{level.label}</div>
                        <div className="text-text-muted text-sm mt-0.5">{level.desc}</div>
                      </div>
                      {skillLevel === level.id && (
                        <div className="w-6 h-6 bg-gradient-primary rounded-full flex items-center justify-center flex-shrink-0">
                          <Check className="w-3.5 h-3.5 text-white" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => skillLevel && setStep(3)}
                  disabled={!skillLevel}
                  className="btn-primary w-full flex items-center justify-center gap-2 py-4 text-base mt-8 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  Continue
                  <ArrowRight className="w-4 h-4" />
                </button>
              </motion.div>
            )}

            {/* ── STEP 3: Goal ── */}
            {step === 3 && (
              <motion.div
                key="step3"
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3 }}
              >
                <button onClick={() => setStep(2)} className="flex items-center gap-2 text-text-muted hover:text-text transition-colors mb-8 text-sm">
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>

                <h1 className="font-display text-3xl font-bold text-text mb-2">What&apos;s your goal?</h1>
                <p className="text-text-muted mb-8">This helps us recommend the right courses for you</p>

                <div className="space-y-3">
                  {GOALS.map((g) => (
                    <button
                      key={g.id}
                      onClick={() => setGoal(g.id)}
                      className={`w-full glass p-5 flex items-center gap-4 text-left transition-all duration-200 hover:border-primary/50 ${
                        goal === g.id
                          ? "border-primary shadow-glow-sm bg-primary/10"
                          : "border-border/50"
                      }`}
                    >
                      <span className="text-3xl">{g.emoji}</span>
                      <div className="flex-1 font-display font-medium text-text">{g.label}</div>
                      {goal === g.id && (
                        <div className="w-6 h-6 bg-gradient-primary rounded-full flex items-center justify-center flex-shrink-0">
                          <Check className="w-3.5 h-3.5 text-white" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => goal && handleFinish()}
                  disabled={!goal || loading}
                  className="btn-primary w-full flex items-center justify-center gap-2 py-4 text-base mt-8 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      Create my account
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <p className="text-center text-text-muted text-xs mt-6">
                  By signing up you agree to our{" "}
                  <Link href="/terms" className="text-primary hover:underline">Terms of Service</Link>
                  {" "}and{" "}
                  <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
                </p>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
"use client";

import { motion } from "framer-motion";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0D0905] flex items-center justify-center flex-col relative overflow-hidden font-sans">
      <div className="kente-stripe fixed top-0 left-0 w-full h-2 z-20" />

      <div
        className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl z-0"
        style={{ background: "#E8A020", opacity: 0.05 }}
      />
      <div
        className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full blur-3xl z-0"
        style={{ background: "#C1440E", opacity: 0.05 }}
      />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="z-10 flex flex-col items-center w-full px-4"
      >
        <div className="flex flex-row items-end bg-[#221808] border border-[#3D2E10] rounded-xl px-4 py-2 mb-6">
          <span className="text-2xl font-bold" style={{ color: "#E8A020", fontFamily: "Space Grotesk, sans-serif" }}>
            A
          </span>
          <span className="text-3xl font-bold mx-1" style={{ color: "#C1440E", fontFamily: "Space Grotesk, sans-serif" }}>
            A
          </span>
          <span className="text-2xl font-bold" style={{ color: "#D4A853", fontFamily: "Space Grotesk, sans-serif" }}>
            A
          </span>
        </div>

        <div className="mb-2">
          <span className="font-bold text-3xl text-center" style={{ color: "#F5ECD7", fontFamily: "Space Grotesk, sans-serif" }}>
            African Animation Academy
          </span>
        </div>

        <div className="mb-4">
          <span
            className="font-bold text-5xl text-center bg-gradient-to-r from-[#E8A020] to-[#C1440E] text-transparent bg-clip-text"
            style={{ fontFamily: "Space Grotesk, sans-serif" }}
          >
            Coming Soon
          </span>
        </div>

        <div className="w-[60px] h-[2px] mx-auto mb-6" style={{ background: "linear-gradient(90deg, #E8A020, #C1440E)" }} />

        <p className="text-base text-center max-w-sm mb-8" style={{ color: "#A89070" }}>
          We are building something amazing for African animators worldwide.
        </p>

        <div className="flex flex-row gap-4 mb-2">
          <button
            className="font-bold px-6 py-3 rounded-full"
            style={{ background: "linear-gradient(90deg, #E8A020, #C1440E)", color: "#0D0905" }}
          >
            Get Notified
          </button>
          <button className="px-6 py-3 rounded-full border" style={{ borderColor: "#3D2E10", color: "#A89070" }}>
            Learn More
          </button>
        </div>
      </motion.div>

      <div className="fixed bottom-0 left-0 w-full flex justify-center z-20 pb-4">
        <span className="italic text-sm text-center" style={{ color: "#D4A853" }}>
          Proudly African. Globally Creative.
        </span>
      </div>
    </div>
  );
}
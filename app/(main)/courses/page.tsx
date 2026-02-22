import React from "react";

export default function ComingSoon() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0D0905] relative">
      {/* Kente stripe at top */}
      <div className="absolute top-0 left-0 w-full h-2 flex z-10">
        <div className="flex w-full h-full">
          <div className="h-full w-1/12 bg-[#E8A020]" />
          <div className="h-full w-1/12 bg-[#C1440E]" />
          <div className="h-full w-1/12 bg-[#D4A853]" />
          <div className="h-full w-1/12 bg-[#E8A020]" />
          <div className="h-full w-1/12 bg-[#C1440E]" />
          <div className="h-full w-1/12 bg-[#D4A853]" />
          <div className="h-full w-1/12 bg-[#E8A020]" />
          <div className="h-full w-1/12 bg-[#C1440E]" />
          <div className="h-full w-1/12 bg-[#D4A853]" />
          <div className="h-full w-1/12 bg-[#E8A020]" />
          <div className="h-full w-1/12 bg-[#C1440E]" />
          <div className="h-full w-1/12 bg-[#D4A853]" />
        </div>
      </div>

      {/* Centered content */}
      <div className="flex flex-col items-center justify-center mt-16">
        {/* AFX Logo Mark */}
        <div className="flex flex-row items-end mb-6">
          <span className="font-bold text-5xl" style={{ color: '#E8A020', fontFamily: 'Space Grotesk, sans-serif' }}>A</span>
          <span className="font-bold text-6xl mx-1" style={{ color: '#C1440E', fontFamily: 'Space Grotesk, sans-serif' }}>F</span>
          <span className="font-bold text-5xl" style={{ color: '#D4A853', fontFamily: 'Space Grotesk, sans-serif' }}>X</span>
        </div>
        {/* Academy Name */}
        <div className="mb-4">
          <span className="font-bold text-2xl" style={{ color: '#F5ECD7', fontFamily: 'Space Grotesk, sans-serif' }}>
            Africa Fx
          </span>
        </div>
        {/* Coming Soon Gradient Text */}
        <div className="mb-8">
          <span className="font-bold text-4xl bg-gradient-to-r from-[#E8A020] to-[#C1440E] text-transparent bg-clip-text" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Coming Soon
          </span>
        </div>
      </div>

      {/* Bottom text */}
      <div className="absolute bottom-4 w-full flex justify-center">
        <span className="italic text-sm" style={{ color: '#D4A853', fontFamily: 'Space Grotesk, sans-serif' }}>
          Proudly African. Globally Creative.
        </span>
      </div>
    </div>
  );
}



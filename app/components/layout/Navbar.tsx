import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="glass" style={{ padding: "1rem" }}>
      <div
        className="container-custom"
        style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}
      >

        <Link href="/" className="group flex items-center gap-3">
          <div
            className="w-12 h-10 rounded-xl flex items-center justify-center overflow-hidden relative transition-all duration-300 group-hover:shadow-[0_0_20px_rgba(232,160,32,0.5)]"
            style={{
              background: "linear-gradient(135deg, #221808, #2D1F0A)",
              border: "1px solid rgba(232, 160, 32, 0.4)",
            }}
          >
            <div
              className="absolute inset-0"
              style={{ background: "linear-gradient(135deg, rgba(232,160,32,0.08) 0%, transparent 60%)" }}
            />
            <div className="relative z-10 flex items-center tracking-tighter" style={{ letterSpacing: "-0.5px" }}>
              <span className="font-black text-base tracking-tight" style={{ color: "#E8A020", fontFamily: "Space Grotesk, sans-serif" }}>A</span>
              <span className="font-black text-base tracking-tight" style={{ color: "#F5ECD7", fontFamily: "Space Grotesk, sans-serif" }}>F</span>
              <span className="font-black text-base tracking-tight" style={{ color: "#C1440E", fontFamily: "Space Grotesk, sans-serif" }}>X</span>
            </div>
          </div>
          <div className="flex flex-col leading-tight">
            <span className="font-bold text-sm" style={{ color: "#F5ECD7", fontFamily: "Space Grotesk, sans-serif" }}>
              African Animation
            </span>
            <span
              className="font-bold text-sm bg-clip-text text-transparent"
              style={{
                fontFamily: "Space Grotesk, sans-serif",
                backgroundImage: "linear-gradient(90deg, #E8A020, #C1440E)",
              }}
            >
              Academy
            </span>
          </div>
        </Link>

        <div style={{ display: "flex", gap: "0.5rem" }}>
          <Link href="/(auth)/login" className="btn-ghost">Log in</Link>
          <Link href="/(auth)/signup" className="btn-primary">Sign up</Link>
        </div>
      </div>
    </nav>
  );
}


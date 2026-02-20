import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="glass" style={{ padding: "1rem" }}>
      <div
        className="container-custom"
        style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}
      >

        <Link href="/">
          <div
            className="w-14 h-10 rounded-xl border border-[#3D2E10] flex items-center justify-center gap-0 tracking-tight transition-all duration-200"
            style={{ background: "#221808" }}
          >
            <span
              className="text-lg font-bold"
              style={{ color: "#E8A020", fontFamily: 'Space Grotesk, sans-serif' }}
            >
              A
            </span>
            <span
              className="text-xl font-bold"
              style={{ color: "#C1440E", fontFamily: 'Space Grotesk, sans-serif' }}
            >
              A
            </span>
            <span
              className="text-lg font-bold"
              style={{ color: "#D4A853", fontFamily: 'Space Grotesk, sans-serif' }}
            >
              A
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

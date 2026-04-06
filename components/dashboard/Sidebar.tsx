"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

// Inline SVG icon components — Phosphor-style, consistent 18px stroke weight
function IconDashboard({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  );
}

function IconBook({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
    </svg>
  );
}

function IconCalendar({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2.5" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  );
}

function IconChat({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
    </svg>
  );
}

function IconChart({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 20V10M12 20V4M6 20v-6" />
    </svg>
  );
}

function IconSparkle({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6L12 2z" />
    </svg>
  );
}

const navItems = [
  { href: "/dashboard",   Icon: IconDashboard, label: "Dashboard"    },
  { href: "/assignments", Icon: IconBook,       label: "Assignments"  },
  { href: "/calendar",    Icon: IconCalendar,   label: "Calendar"     },
  { href: "/chat",        Icon: IconChat,       label: "AI Assistant" },
  { href: "/progress",    Icon: IconChart,      label: "Progress"     },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      style={{
        width: "216px",
        minHeight: "100vh",
        background: "rgba(5, 6, 15, 0.96)",
        borderRight: "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        padding: "20px 14px",
        flexShrink: 0,
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        position: "sticky",
        top: 0,
        height: "100vh",
      }}
    >
      {/* Logo */}
      <Link
        href="/"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          padding: "10px 10px",
          marginBottom: "28px",
          borderRadius: "14px",
          textDecoration: "none",
          transition: "background var(--transition)",
        }}
        onMouseOver={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
        onMouseOut={(e)  => { e.currentTarget.style.background = "transparent"; }}
      >
        <div
          style={{
            width: "32px",
            height: "32px",
            borderRadius: "10px",
            background: "linear-gradient(135deg, var(--primary), #5b45e0)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "13px",
            fontWeight: 800,
            color: "white",
            fontFamily: "var(--font-sora, 'Sora'), sans-serif",
            boxShadow: "0 4px 12px rgba(124,92,255,0.4)",
            flexShrink: 0,
          }}
        >
          S
        </div>
        <span
          style={{
            fontWeight: 700,
            color: "var(--text)",
            fontSize: "14.5px",
            fontFamily: "var(--font-sora, 'Sora'), sans-serif",
            letterSpacing: "-0.02em",
          }}
        >
          StudyAI
        </span>
      </Link>

      {/* Section label */}
      <p
        style={{
          fontSize: "10px",
          fontWeight: 700,
          color: "var(--text-faint)",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          padding: "0 10px",
          marginBottom: "8px",
          fontFamily: "var(--font-sora, 'Sora'), sans-serif",
        }}
      >
        Navigation
      </p>

      {/* Nav */}
      <nav style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
        {navItems.map(({ href, Icon, label }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`sidebar-link${active ? " active" : ""}`}
            >
              <Icon size={17} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom hint */}
      <div style={{ marginTop: "auto" }}>
        <div
          style={{
            background: "rgba(124,92,255,0.07)",
            border: "1px solid rgba(124,92,255,0.15)",
            borderRadius: "14px",
            padding: "14px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
            <IconSparkle size={14} />
            <p style={{ fontSize: "11px", color: "var(--primary-text)", fontWeight: 600, margin: 0 }}>
              AI Assistant
            </p>
          </div>
          <p style={{ fontSize: "11.5px", color: "var(--text-muted)", marginBottom: "10px", margin: "0 0 10px" }}>
            Ask questions, get study help instantly.
          </p>
          <Link
            href="/chat"
            style={{
              fontSize: "12px",
              fontWeight: 600,
              color: "var(--primary-text)",
              textDecoration: "none",
              display: "block",
              fontFamily: "var(--font-sora, 'Sora'), sans-serif",
            }}
          >
            Open Chat →
          </Link>
        </div>
      </div>
    </aside>
  );
}
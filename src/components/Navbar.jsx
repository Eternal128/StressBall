export default function Navbar({ dark, toggleDark }) {
  return (
    <header
      style={{
        position: "fixed",
        top: 0,
        width: "100%",
        zIndex: 100,
        display: "flex",
        justifyContent: "center",
        padding: "20px 0",
        pointerEvents: "none",
      }}
    >
      <nav
        style={{
          pointerEvents: "auto",
          display: "inline-flex",
          alignItems: "center",
          gap: 20,
          background: dark ? "rgba(18,16,14,0.85)" : "rgba(250,248,244,0.85)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          border: `1px solid ${
            dark ? "rgba(255,255,255,0.1)" : "rgba(26,22,18,0.14)"
          }`,
          borderRadius: 999,
          padding: "12px 28px",
          boxShadow: "0 2px 24px rgba(0,0,0,0.08)",
          transition: "all 0.4s ease",
        }}
      >
        <span
          style={{
            fontFamily: "'Jost', sans-serif",
            fontWeight: 400,
            fontSize: "0.95rem",
            letterSpacing: "0.08em",
            color: dark ? "#f5f0e8" : "#1a1612",
            transition: "color 0.4s",
          }}
        >
          StressBall
        </span>

        <div
          style={{
            width: 1,
            height: 14,
            background: dark ? "rgba(255,255,255,0.15)" : "rgba(26,22,18,0.15)",
          }}
        />

        <button
          onClick={toggleDark}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            fontFamily: "'Jost', sans-serif",
            fontSize: "0.62rem",
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: dark ? "rgba(245,240,232,0.5)" : "rgba(26,22,18,0.4)",
            padding: 0,
            transition: "color 0.2s",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.color = dark ? "#f5f0e8" : "#1a1612")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.color = dark
              ? "rgba(245,240,232,0.5)"
              : "rgba(26,22,18,0.4)")
          }
        >
          {dark ? "☀ Light" : "☽ Dark"}
        </button>
      </nav>
    </header>
  );
}

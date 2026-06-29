const nav = [
  { id: "dashboard", icon: "⊞", label: "Dashboard" },
  { id: "backlog",   icon: "☰", label: "Backlog" },
  { id: "sprint",    icon: "⚡", label: "Sprint Board" },
  { id: "roadmap",   icon: "🗺", label: "Roadmap" },
  { id: "okrs",      icon: "🎯", label: "OKRs" },
  { id: "metrics",   icon: "📊", label: "Metrics" },
  { id: "team",      icon: "👥", label: "Team" },
];

export default function Sidebar({ page, setPage }) {
  return (
    <aside style={{
      width: 220, background: "var(--bg2)", borderRight: "1px solid var(--border)",
      display: "flex", flexDirection: "column", height: "100vh",
      position: "fixed", top: 0, left: 0, zIndex: 100,
    }}>
      {/* Logo */}
      <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: "linear-gradient(135deg,#388bfd,#8957e5)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 16, fontWeight: 700, color: "#fff",
          }}>P</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15 }}>ProTrack</div>
            <div style={{ fontSize: 11, color: "var(--muted)" }}>PM Dashboard</div>
          </div>
        </div>
      </div>

      {/* Project label */}
      <div style={{ padding: "12px 20px 4px", fontSize: 11, color: "var(--faint)", fontWeight: 600, letterSpacing: 1, textTransform: "uppercase" }}>
        Project
      </div>
      <div style={{ padding: "4px 12px 12px" }}>
        <div style={{ padding: "6px 8px", borderRadius: 6, background: "var(--surface)", fontSize: 13, color: "var(--text)" }}>
          🚀 ProTrack v1.0
        </div>
      </div>

      <div style={{ fontSize: 11, color: "var(--faint)", fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", padding: "4px 20px 4px" }}>
        Navigation
      </div>

      {/* Nav items */}
      <nav style={{ flex: 1, padding: "4px 8px", overflowY: "auto" }}>
        {nav.map(({ id, icon, label }) => (
          <button key={id} onClick={() => setPage(id)} style={{
            display: "flex", alignItems: "center", gap: 10,
            width: "100%", padding: "8px 12px", borderRadius: 6,
            background: page === id ? "var(--surface)" : "transparent",
            color: page === id ? "var(--text)" : "var(--muted)",
            border: "none", cursor: "pointer", fontSize: 13, fontWeight: page === id ? 600 : 400,
            marginBottom: 2, transition: "all 0.15s", textAlign: "left",
            borderLeft: page === id ? "2px solid var(--blue)" : "2px solid transparent",
          }}
          onMouseEnter={e => { if(page!==id) { e.currentTarget.style.background="var(--surface)"; e.currentTarget.style.color="var(--text)"; }}}
          onMouseLeave={e => { if(page!==id) { e.currentTarget.style.background="transparent"; e.currentTarget.style.color="var(--muted)"; }}}
          >
            <span style={{ fontSize: 16 }}>{icon}</span>
            {label}
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div style={{ padding: "12px 20px", borderTop: "1px solid var(--border)", fontSize: 12, color: "var(--muted)" }}>
        <div style={{ fontWeight: 600, color: "var(--text)" }}>Akhil Baiju</div>
        <div>Product Manager</div>
      </div>
    </aside>
  );
}

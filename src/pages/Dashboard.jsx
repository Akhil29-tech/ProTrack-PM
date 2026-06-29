import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const velocityData = [
  { sprint: "S1", points: 24 }, { sprint: "S2", points: 31 },
  { sprint: "S3", points: 28 }, { sprint: "S4", points: 38 },
  { sprint: "S5", points: 35 }, { sprint: "S6", points: 42 },
];

export default function Dashboard({ setPage }) {
  const [counts, setCounts] = useState({ backlog: 0, inProgress: 0, done: 0, okrs: 0 });

  useEffect(() => {
    const unsub1 = onSnapshot(collection(db, "stories"), snap => {
      const stories = snap.docs.map(d => d.data());
      setCounts(c => ({
        ...c,
        backlog: stories.filter(s => s.status === "backlog").length,
        inProgress: stories.filter(s => s.status === "inprogress").length,
        done: stories.filter(s => s.status === "done").length,
      }));
    });
    const unsub2 = onSnapshot(collection(db, "okrs"), snap => {
      setCounts(c => ({ ...c, okrs: snap.docs.length }));
    });
    return () => { unsub1(); unsub2(); };
  }, []);

  const kpis = [
    { label: "Backlog Items", value: counts.backlog, icon: "☰", color: "var(--blue)", page: "backlog" },
    { label: "In Progress", value: counts.inProgress, icon: "⚡", color: "var(--yellow)", page: "sprint" },
    { label: "Completed", value: counts.done, icon: "✅", color: "var(--green)", page: "sprint" },
    { label: "Active OKRs", value: counts.okrs, icon: "🎯", color: "var(--purple)", page: "okrs" },
  ];

  const quickActions = [
    { label: "Add Story", icon: "＋", page: "backlog", color: "var(--blue)" },
    { label: "Sprint Board", icon: "⚡", page: "sprint", color: "var(--yellow)" },
    { label: "View Roadmap", icon: "🗺", page: "roadmap", color: "var(--green)" },
    { label: "Team OKRs", icon: "🎯", page: "okrs", color: "var(--purple)" },
  ];

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <div className="page-title">Dashboard</div>
          <div className="page-subtitle">Welcome back, Akhil · ProTrack v1.0</div>
        </div>
        <button className="btn btn-primary" onClick={() => setPage("backlog")}>＋ New Story</button>
      </div>

      {/* KPI cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 24 }}>
        {kpis.map(({ label, value, icon, color, page }) => (
          <div key={label} className="card" style={{ cursor: "pointer", borderTop: `3px solid ${color}` }}
            onClick={() => setPage(page)}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ fontSize: 28, fontWeight: 700, color }}>{value}</div>
                <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 4 }}>{label}</div>
              </div>
              <span style={{ fontSize: 24 }}>{icon}</span>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 16, marginBottom: 24 }}>
        {/* Velocity chart */}
        <div className="card">
          <div style={{ fontWeight: 600, marginBottom: 16, display: "flex", justifyContent: "space-between" }}>
            Sprint Velocity
            <span className="badge badge-blue">Last 6 sprints</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={velocityData}>
              <defs>
                <linearGradient id="vel" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#388bfd" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#388bfd" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="sprint" tick={{ fill: "#8b949e", fontSize: 12 }} axisLine={false} tickLine={false}/>
              <YAxis tick={{ fill: "#8b949e", fontSize: 12 }} axisLine={false} tickLine={false}/>
              <Tooltip contentStyle={{ background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: 6, color: "var(--text)" }}/>
              <Area type="monotone" dataKey="points" stroke="#388bfd" fill="url(#vel)" strokeWidth={2}/>
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Quick actions */}
        <div className="card">
          <div style={{ fontWeight: 600, marginBottom: 16 }}>Quick Actions</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {quickActions.map(({ label, icon, page, color }) => (
              <button key={label} onClick={() => setPage(page)} style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "10px 14px", borderRadius: 6,
                background: "var(--surface)", border: "1px solid var(--border)",
                color: "var(--text)", cursor: "pointer", fontSize: 14, fontWeight: 500,
                transition: "all 0.15s", textAlign: "left",
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = color}
              onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border)"}
              >
                <span style={{ fontSize: 18 }}>{icon}</span>
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Status summary */}
      <div className="card">
        <div style={{ fontWeight: 600, marginBottom: 16 }}>Current Sprint Progress</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
          {[
            { label: "To Do", count: counts.backlog, color: "var(--muted)" },
            { label: "In Progress", count: counts.inProgress, color: "var(--yellow)" },
            { label: "Done", count: counts.done, color: "var(--green)" },
          ].map(({ label, count, color }) => {
            const total = counts.backlog + counts.inProgress + counts.done || 1;
            const pct = Math.round(count / total * 100);
            return (
              <div key={label}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontSize: 13, color: "var(--muted)" }}>{label}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color }}>{count} ({pct}%)</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${pct}%`, background: color }}/>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

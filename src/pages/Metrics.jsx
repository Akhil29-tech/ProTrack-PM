import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Legend
} from "recharts";

const velocityData = [
  { sprint:"S1", planned:30, completed:24 },
  { sprint:"S2", planned:35, completed:31 },
  { sprint:"S3", planned:30, completed:28 },
  { sprint:"S4", planned:40, completed:38 },
  { sprint:"S5", planned:38, completed:35 },
  { sprint:"S6", planned:45, completed:42 },
];

const burndownData = [
  { day:"Day 1", remaining:80 }, { day:"Day 2", remaining:72 },
  { day:"Day 3", remaining:65 }, { day:"Day 4", remaining:58 },
  { day:"Day 5", remaining:50 }, { day:"Day 6", remaining:41 },
  { day:"Day 7", remaining:35 }, { day:"Day 8", remaining:28 },
  { day:"Day 9", remaining:18 }, { day:"Day 10", remaining:8 },
];

const tooltipStyle = { contentStyle:{ background:"var(--bg3)", border:"1px solid var(--border)", borderRadius:6, color:"var(--text)" } };

export default function Metrics() {
  const [stories, setStories] = useState([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db,"stories"), snap => {
      setStories(snap.docs.map(d=>({id:d.id,...d.data()})));
    });
    return unsub;
  }, []);

  const done = stories.filter(s=>s.status==="done");
  const inProgress = stories.filter(s=>s.status==="inprogress");
  const totalPts = stories.reduce((a,s)=>a+(s.points||0),0);
  const donePts = done.reduce((a,s)=>a+(s.points||0),0);
  const avgCycle = "3.2 days";

  // Per-assignee stats
  const assigneeMap = {};
  stories.forEach(s => {
    if(!s.assignee) return;
    if(!assigneeMap[s.assignee]) assigneeMap[s.assignee] = { name:s.assignee, done:0, inProgress:0, total:0 };
    assigneeMap[s.assignee].total++;
    if(s.status==="done") assigneeMap[s.assignee].done++;
    if(s.status==="inprogress") assigneeMap[s.assignee].inProgress++;
  });
  const assigneeData = Object.values(assigneeMap);

  const kpis = [
    { label:"Stories Completed", value:done.length, color:"var(--green)", icon:"✅" },
    { label:"In Progress", value:inProgress.length, color:"var(--yellow)", icon:"⚡" },
    { label:"Story Points Done", value:`${donePts}/${totalPts}`, color:"var(--blue)", icon:"📊" },
    { label:"Avg Cycle Time", value:avgCycle, color:"var(--purple)", icon:"⏱" },
  ];

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <div className="page-title">Metrics</div>
          <div className="page-subtitle">Sprint velocity, burndown & team performance</div>
        </div>
        <span className="badge badge-blue">Sprint 6 · Active</span>
      </div>

      {/* KPIs */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:24 }}>
        {kpis.map(({ label, value, color, icon }) => (
          <div key={label} className="card" style={{ borderTop:`3px solid ${color}` }}>
            <div style={{ display:"flex", justifyContent:"space-between" }}>
              <div>
                <div style={{ fontSize:26, fontWeight:700, color }}>{value}</div>
                <div style={{ fontSize:12, color:"var(--muted)", marginTop:4 }}>{label}</div>
              </div>
              <span style={{ fontSize:22 }}>{icon}</span>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:16 }}>
        {/* Velocity */}
        <div className="card">
          <div style={{ fontWeight:600, marginBottom:16, display:"flex", justifyContent:"space-between" }}>
            Sprint Velocity
            <span className="badge badge-blue">Planned vs Completed</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={velocityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)"/>
              <XAxis dataKey="sprint" tick={{ fill:"#8b949e", fontSize:12 }} axisLine={false} tickLine={false}/>
              <YAxis tick={{ fill:"#8b949e", fontSize:12 }} axisLine={false} tickLine={false}/>
              <Tooltip {...tooltipStyle}/>
              <Legend wrapperStyle={{ fontSize:12, color:"var(--muted)" }}/>
              <Bar dataKey="planned" fill="rgba(56,139,253,0.3)" radius={[4,4,0,0]} name="Planned"/>
              <Bar dataKey="completed" fill="#388bfd" radius={[4,4,0,0]} name="Completed"/>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Burndown */}
        <div className="card">
          <div style={{ fontWeight:600, marginBottom:16, display:"flex", justifyContent:"space-between" }}>
            Burndown Chart
            <span className="badge badge-purple">Sprint 6</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={burndownData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)"/>
              <XAxis dataKey="day" tick={{ fill:"#8b949e", fontSize:11 }} axisLine={false} tickLine={false}/>
              <YAxis tick={{ fill:"#8b949e", fontSize:12 }} axisLine={false} tickLine={false}/>
              <Tooltip {...tooltipStyle}/>
              <Line type="monotone" dataKey="remaining" stroke="#8957e5" strokeWidth={2} dot={{ fill:"#8957e5", r:3 }} name="Remaining Points"/>
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Team performance */}
      <div className="card">
        <div style={{ fontWeight:600, marginBottom:16 }}>Team Performance</div>
        {assigneeData.length === 0 ? (
          <div style={{ color:"var(--muted)", fontSize:13, textAlign:"center", padding:"20px 0" }}>
            Assign stories to team members in the Backlog to see performance stats
          </div>
        ) : (
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            {assigneeData.map(a => (
              <div key={a.name} style={{ display:"flex", alignItems:"center", gap:16 }}>
                <div style={{ width:32, height:32, borderRadius:"50%", background:"var(--blue2)", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, color:"#fff", flexShrink:0 }}>
                  {a.name[0]?.toUpperCase()}
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                    <span style={{ fontWeight:500 }}>{a.name}</span>
                    <span style={{ fontSize:12, color:"var(--muted)" }}>{a.done}/{a.total} done</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width:`${a.total ? Math.round(a.done/a.total*100) : 0}%` }}/>
                  </div>
                </div>
                <div style={{ display:"flex", gap:8 }}>
                  <span className="badge badge-blue">{a.inProgress} active</span>
                  <span className="badge" style={{ background:"rgba(63,185,80,0.15)", color:"var(--green)", border:"1px solid rgba(63,185,80,0.3)" }}>{a.done} done</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import { collection, addDoc, onSnapshot, deleteDoc, doc } from "firebase/firestore";
import { db } from "../firebase";

const ROLES = ["Product Manager","Frontend Dev","Backend Dev","Full Stack Dev","Designer","QA Engineer","Data Analyst","DevOps"];
const ROLE_COLORS = {
  "Product Manager":"var(--purple)", "Frontend Dev":"var(--blue)",
  "Backend Dev":"var(--green)", "Full Stack Dev":"var(--cyan)",
  "Designer":"var(--yellow)", "QA Engineer":"var(--red)",
  "Data Analyst":"var(--blue)", "DevOps":"var(--muted)",
};

function TeamModal({ onClose, onSave }) {
  const [form, setForm] = useState({ name:"", role:"Frontend Dev", email:"", timezone:"IST (UTC+5:30)" });
  const set = (k,v) => setForm(f=>({...f,[k]:v}));
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e=>e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">Add Team Member</div>
          <button onClick={onClose} style={{ background:"none",border:"none",color:"var(--muted)",cursor:"pointer",fontSize:20 }}>×</button>
        </div>
        <div className="form-group"><label>Full Name *</label><input value={form.name} onChange={e=>set("name",e.target.value)} placeholder="e.g. Rahul Sharma"/></div>
        <div className="form-group"><label>Email</label><input value={form.email} onChange={e=>set("email",e.target.value)} placeholder="rahul@company.com"/></div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
          <div className="form-group"><label>Role</label><select value={form.role} onChange={e=>set("role",e.target.value)}>{ROLES.map(r=><option key={r}>{r}</option>)}</select></div>
          <div className="form-group"><label>Timezone</label>
            <select value={form.timezone} onChange={e=>set("timezone",e.target.value)}>
              {["IST (UTC+5:30)","UTC","PST (UTC-8)","EST (UTC-5)","CET (UTC+1)","SGT (UTC+8)"].map(t=><option key={t}>{t}</option>)}
            </select>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={()=>{ if(form.name) onSave({...form, joinedAt:Date.now()}); }}>Add Member</button>
        </div>
      </div>
    </div>
  );
}

export default function Team() {
  const [members, setMembers] = useState([]);
  const [modal, setModal] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(collection(db,"team"), snap => {
      setMembers(snap.docs.map(d=>({id:d.id,...d.data()})));
    });
    return unsub;
  }, []);

  const save = async (form) => {
    await addDoc(collection(db,"team"), form);
    setModal(false);
  };

  const del = async (id) => {
    if(window.confirm("Remove this team member?")) await deleteDoc(doc(db,"team",id));
  };

  const roleGroups = ROLES.reduce((acc, role) => {
    const count = members.filter(m=>m.role===role).length;
    if(count > 0) acc[role] = count;
    return acc;
  }, {});

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <div className="page-title">Team</div>
          <div className="page-subtitle">{members.length} members · {Object.keys(roleGroups).length} roles</div>
        </div>
        <button className="btn btn-primary" onClick={()=>setModal(true)}>＋ Add Member</button>
      </div>

      {/* Role summary */}
      {members.length > 0 && (
        <div style={{ display:"flex", gap:10, flexWrap:"wrap", marginBottom:24 }}>
          {Object.entries(roleGroups).map(([role, count]) => (
            <span key={role} style={{ padding:"4px 12px", borderRadius:20, fontSize:12, background:"var(--surface)", border:"1px solid var(--border)", color:ROLE_COLORS[role]||"var(--muted)" }}>
              {role} ({count})
            </span>
          ))}
        </div>
      )}

      {members.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">👥</div>
          <div className="empty-state-title">No team members yet</div>
          <p>Add your team to assign stories and track performance</p>
          <button className="btn btn-primary" style={{ marginTop:16 }} onClick={()=>setModal(true)}>＋ Add Member</button>
        </div>
      ) : (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(280px,1fr))", gap:16 }}>
          {members.map(m => (
            <div key={m.id} className="card" style={{ display:"flex", flexDirection:"column", gap:12 }}>
              <div style={{ display:"flex", alignItems:"center", gap:14 }}>
                <div style={{ width:44, height:44, borderRadius:"50%", background:`linear-gradient(135deg, ${ROLE_COLORS[m.role]||"var(--blue)"}88, ${ROLE_COLORS[m.role]||"var(--blue)"})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, fontWeight:700, color:"#fff", flexShrink:0 }}>
                  {m.name[0]?.toUpperCase()}
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:700, fontSize:15 }}>{m.name}</div>
                  <span style={{ fontSize:11, padding:"2px 8px", borderRadius:20, background:`${ROLE_COLORS[m.role]||"var(--blue)"}22`, color:ROLE_COLORS[m.role]||"var(--blue)", border:`1px solid ${ROLE_COLORS[m.role]||"var(--blue)"}44` }}>{m.role}</span>
                </div>
              </div>
              {m.email && (
                <div style={{ fontSize:12, color:"var(--muted)", display:"flex", alignItems:"center", gap:6 }}>
                  <span>📧</span> {m.email}
                </div>
              )}
              <div style={{ fontSize:12, color:"var(--muted)", display:"flex", alignItems:"center", gap:6 }}>
                <span>🌍</span> {m.timezone}
              </div>
              <button onClick={()=>del(m.id)} className="btn btn-sm btn-danger" style={{ alignSelf:"flex-start", marginTop:4 }}>Remove</button>
            </div>
          ))}
        </div>
      )}

      {modal && <TeamModal onClose={()=>setModal(false)} onSave={save}/>}
    </div>
  );
}

import { useState, useEffect } from "react";
import { collection, addDoc, onSnapshot, deleteDoc, doc } from "firebase/firestore";
import { db } from "../firebase";

const QUARTERS = ["Q1 2025","Q2 2025","Q3 2025","Q4 2025"];
const STATUS_COLORS = { Planned:"var(--muted)", "In Progress":"var(--yellow)", Done:"var(--green)", Cancelled:"var(--red)" };
const THEMES = ["Core Features","Growth","Infrastructure","UX","Analytics","Integrations"];

function RoadmapModal({ onClose, onSave }) {
  const [form, setForm] = useState({ title:"", theme:"Core Features", quarter:"Q2 2025", status:"Planned", owner:"", description:"" });
  const set = (k,v) => setForm(f=>({...f,[k]:v}));
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e=>e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">Add Roadmap Item</div>
          <button onClick={onClose} style={{ background:"none",border:"none",color:"var(--muted)",cursor:"pointer",fontSize:20 }}>×</button>
        </div>
        <div className="form-group"><label>Feature Title *</label><input value={form.title} onChange={e=>set("title",e.target.value)} placeholder="e.g. Dark Mode"/></div>
        <div className="form-group"><label>Description</label><textarea value={form.description} onChange={e=>set("description",e.target.value)} placeholder="What does this feature do?"/></div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
          <div className="form-group"><label>Theme</label><select value={form.theme} onChange={e=>set("theme",e.target.value)}>{THEMES.map(t=><option key={t}>{t}</option>)}</select></div>
          <div className="form-group"><label>Quarter</label><select value={form.quarter} onChange={e=>set("quarter",e.target.value)}>{QUARTERS.map(q=><option key={q}>{q}</option>)}</select></div>
          <div className="form-group"><label>Status</label><select value={form.status} onChange={e=>set("status",e.target.value)}>{Object.keys(STATUS_COLORS).map(s=><option key={s}>{s}</option>)}</select></div>
          <div className="form-group"><label>Owner</label><input value={form.owner} onChange={e=>set("owner",e.target.value)} placeholder="Team member"/></div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={()=>{ if(form.title) { onSave(form); }}}>Add to Roadmap</button>
        </div>
      </div>
    </div>
  );
}

export default function Roadmap() {
  const [items, setItems] = useState([]);
  const [modal, setModal] = useState(false);
  const [filterTheme, setFilterTheme] = useState("all");

  useEffect(() => {
    const unsub = onSnapshot(collection(db,"roadmap"), snap => {
      setItems(snap.docs.map(d=>({id:d.id,...d.data()})));
    });
    return unsub;
  }, []);

  const save = async (form) => {
    await addDoc(collection(db,"roadmap"), { ...form, createdAt: Date.now() });
    setModal(false);
  };

  const del = async (id) => {
    if(window.confirm("Remove this item?")) await deleteDoc(doc(db,"roadmap",id));
  };

  const filtered = filterTheme === "all" ? items : items.filter(i=>i.theme===filterTheme);

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <div className="page-title">Product Roadmap</div>
          <div className="page-subtitle">Quarterly feature planning · {items.length} items</div>
        </div>
        <button className="btn btn-primary" onClick={()=>setModal(true)}>＋ Add Item</button>
      </div>

      {/* Theme filter */}
      <div style={{ display:"flex", gap:8, marginBottom:24, flexWrap:"wrap" }}>
        {["all",...THEMES].map(t=>(
          <button key={t} onClick={()=>setFilterTheme(t)} className="btn btn-sm" style={{
            background: filterTheme===t ? "var(--blue2)" : "var(--surface)",
            color: filterTheme===t ? "#fff" : "var(--muted)",
            border: "1px solid var(--border)",
          }}>{t==="all"?"All Themes":t}</button>
        ))}
      </div>

      {/* Quarter columns */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16 }}>
        {QUARTERS.map(q => {
          const qItems = filtered.filter(i=>i.quarter===q);
          return (
            <div key={q}>
              <div style={{ padding:"8px 12px", background:"var(--bg3)", borderRadius:"6px 6px 0 0", borderBottom:"2px solid var(--blue)", marginBottom:0 }}>
                <div style={{ fontWeight:700, fontSize:13 }}>{q}</div>
                <div style={{ fontSize:11, color:"var(--muted)" }}>{qItems.length} items</div>
              </div>
              <div style={{ background:"var(--bg2)", border:"1px solid var(--border)", borderTop:"none", borderRadius:"0 0 8px 8px", minHeight:200, padding:10, display:"flex", flexDirection:"column", gap:8 }}>
                {qItems.length === 0 && (
                  <div style={{ textAlign:"center", padding:"30px 10px", color:"var(--faint)", fontSize:12 }}>No items planned</div>
                )}
                {qItems.map(item => (
                  <div key={item.id} style={{ background:"var(--surface)", border:"1px solid var(--border)", borderLeft:`3px solid ${STATUS_COLORS[item.status]}`, borderRadius:6, padding:12 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:6 }}>
                      <div style={{ fontWeight:600, fontSize:13, lineHeight:1.3 }}>{item.title}</div>
                      <button onClick={()=>del(item.id)} style={{ background:"none",border:"none",color:"var(--faint)",cursor:"pointer",fontSize:14,padding:"0 0 0 6px" }}>×</button>
                    </div>
                    {item.description && <div style={{ fontSize:11, color:"var(--muted)", marginBottom:8, lineHeight:1.5 }}>{item.description}</div>}
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                      <span style={{ fontSize:11, padding:"2px 7px", borderRadius:20, background:`${STATUS_COLORS[item.status]}22`, color:STATUS_COLORS[item.status], border:`1px solid ${STATUS_COLORS[item.status]}44` }}>{item.status}</span>
                      <span className="tag" style={{ fontSize:10 }}>{item.theme}</span>
                    </div>
                    {item.owner && <div style={{ fontSize:11, color:"var(--faint)", marginTop:6 }}>👤 {item.owner}</div>}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {modal && <RoadmapModal onClose={()=>setModal(false)} onSave={save}/>}
    </div>
  );
}
